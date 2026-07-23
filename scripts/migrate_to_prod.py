import os, sys, base64, time, json
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

PROD_DOMAIN = "https://tengoku-launcher.emergent.host"
PREVIEW_DOMAIN = "https://tengoku-launcher.preview.emergentagent.com"
PROD = PROD_DOMAIN + "/api"

S = requests.Session()
S.headers.update({"Accept": "application/json"})
TIMEOUT = 120

db = MongoClient(MONGO_URL)[DB_NAME]

CREATION_FIELDS = ["title","kanji","category","tagline","synopsis","poster","accent",
    "bg_image","bg_blur","bg_dim","gallery","embeds","launch_type","launch_label",
    "launch_content","launch_url","buy_url","chapter_display","chapter_size","button_size",
    "episodes","chapters","coming_soon","release_month","release_year","order"]

def log(*a):
    print(*a, flush=True)

def creation_payload(doc):
    p = {}
    for k in CREATION_FIELDS:
        if k in doc and doc[k] is not None:
            p[k] = doc[k]
    return p

def rewrite_html(html, aid_map):
    if not html:
        return html
    html = html.replace(PREVIEW_DOMAIN, PROD_DOMAIN)
    for old, new in aid_map.items():
        html = html.replace(old, new)
    return html

def wipe_prod():
    for coll, path in [("categories","categories"),("creations","creations"),("ambiences","ambiences")]:
        try:
            items = S.get(f"{PROD}/{path}", timeout=TIMEOUT).json()
        except Exception as e:
            log("  ! fetch", path, e); items = []
        for it in items:
            try:
                S.delete(f"{PROD}/{path}/{it['id']}", timeout=TIMEOUT)
            except Exception as e:
                log("  ! del", path, it.get('id'), e)
        log(f"  wiped {len(items)} {coll}")

def migrate_categories():
    for c in db.categories.find({}, {"_id":0}).sort("order",1):
        payload = {"label": c.get("label",""), "kanji": c.get("kanji",""),
                   "order": c.get("order",0), "key": c.get("key")}
        r = S.post(f"{PROD}/categories", json=payload, timeout=TIMEOUT)
        log("  cat", c.get("label"), r.status_code)

def migrate_ambiences():
    amb_map = {}
    for a in db.ambiences.find({}).sort("order",1):
        payload = {"title": a.get("title",""), "emoji": a.get("emoji","🎵"), "order": a.get("order",0)}
        r = S.post(f"{PROD}/ambiences", json=payload, timeout=TIMEOUT)
        if r.status_code not in (200,201):
            log("  ! amb", a.get("title"), r.status_code, r.text[:120]); continue
        new_id = r.json()["id"]
        amb_map[a["id"]] = new_id
        media = db.ambience_media.find_one({"ambience_id": a["id"]})
        if media:
            raw = base64.b64decode(media["data"])
            ct = media.get("content_type","audio/mpeg")
            files = {"file": (a.get("title","amb")+".mp3", raw, ct)}
            ur = S.post(f"{PROD}/ambiences/{new_id}/audio", files=files, timeout=TIMEOUT)
            log("  amb", a.get("title"), "audio", ur.status_code, f"{len(raw)/1024:.0f}KB")
        else:
            log("  amb", a.get("title"), "(no audio)")
    return amb_map

def upload_assets(new_cid, old_cid):
    aid_map = {}
    for asset in db.media_assets.find({"creation_id": old_cid}):
        raw = base64.b64decode(asset["data"])
        ct = asset.get("content_type","application/octet-stream")
        kind = asset.get("kind","image")
        name = asset.get("name","media")
        files = {"file": (name, raw, ct)}
        data = {"kind": kind, "name": name}
        r = S.post(f"{PROD}/creations/{new_cid}/assets", files=files, data=data, timeout=TIMEOUT)
        if r.status_code == 200:
            aid_map[asset["id"]] = r.json()["id"]
        else:
            log("    ! asset", name, r.status_code, r.text[:120])
    return aid_map

def upload_creation_audio(new_cid, old_cid, chapters):
    m = db.media.find_one({"creation_id": old_cid})
    if m:
        raw = base64.b64decode(m["data"])
        files = {"file": ("ambient.mp3", raw, m.get("content_type","audio/mpeg"))}
        r = S.post(f"{PROD}/creations/{new_cid}/audio", files=files, timeout=TIMEOUT)
        log("    ambient", r.status_code, f"{len(raw)/1024:.0f}KB")
    rm = db.reading_media.find_one({"creation_id": old_cid})
    if rm:
        raw = base64.b64decode(rm["data"])
        files = {"file": ("reading.mp3", raw, rm.get("content_type","audio/mpeg"))}
        r = S.post(f"{PROD}/creations/{new_cid}/reading-audio", files=files, timeout=TIMEOUT)
        log("    reading", r.status_code)
    for ch in (chapters or []):
        cm = db.chapter_media.find_one({"creation_id": old_cid, "chapter_id": ch.get("id")})
        if cm:
            raw = base64.b64decode(cm["data"])
            files = {"file": ("chapter.mp3", raw, cm.get("content_type","audio/mpeg"))}
            r = S.post(f"{PROD}/creations/{new_cid}/chapters/{ch['id']}/audio", files=files, timeout=TIMEOUT)
            log("    ch-audio", ch.get("title","")[:20], r.status_code)

def migrate_creations():
    for doc in db.creations.find({}).sort([("category",1),("order",1)]):
        title = doc.get("title","?")
        payload = creation_payload(doc)
        r = S.post(f"{PROD}/creations", json=payload, timeout=TIMEOUT)
        if r.status_code not in (200,201):
            log("! CREATE", title, r.status_code, r.text[:200]); continue
        new_cid = r.json()["id"]
        old_cid = doc["id"]
        log(f"+ {title} -> {new_cid}")
        aid_map = upload_assets(new_cid, old_cid)
        if aid_map:
            chapters = payload.get("chapters") or []
            for ch in chapters:
                ch["content"] = rewrite_html(ch.get("content",""), aid_map)
            payload["chapters"] = chapters
            pr = S.put(f"{PROD}/creations/{new_cid}", json=payload, timeout=TIMEOUT)
            log(f"    rewrote {len(aid_map)} assets, PUT {pr.status_code}")
        upload_creation_audio(new_cid, old_cid, payload.get("chapters"))

def migrate_settings(amb_map):
    s = db.settings.find_one({"key":"site"}, {"_id":0,"key":0})
    if not s:
        log("  no settings"); return
    if s.get("default_ambience_id") in amb_map:
        s["default_ambience_id"] = amb_map[s["default_ambience_id"]]
    r = S.put(f"{PROD}/settings", json=s, timeout=TIMEOUT)
    log("  settings", r.status_code)

def verify():
    cats = S.get(f"{PROD}/categories", timeout=TIMEOUT).json()
    crs = S.get(f"{PROD}/creations", timeout=TIMEOUT).json()
    ambs = S.get(f"{PROD}/ambiences", timeout=TIMEOUT).json()
    log(f"VERIFY prod -> categories={len(cats)} creations={len(crs)} ambiences={len(ambs)}")
    log("  titles:", [c['title'] for c in crs])

if __name__ == "__main__":
    log("=== WIPE PROD ===");   wipe_prod()
    log("=== CATEGORIES ==="); migrate_categories()
    log("=== AMBIENCES ===");  amb_map = migrate_ambiences()
    log("=== CREATIONS ===");  migrate_creations()
    log("=== SETTINGS ===");   migrate_settings(amb_map)
    log("=== VERIFY ===");     verify()
    log("=== DONE ===")
