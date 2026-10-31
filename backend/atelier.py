"""Atelier Nexus — espace de création privé (admin uniquement)."""
import io
import re
import uuid
import statistics
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import Response
from pydantic import BaseModel, Field

KINDS = {"note", "scene", "character", "place", "lore", "event", "document", "inspiration", "file"}
MAX_FILE = 250 * 1024 * 1024


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class UniverseIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    kanji: str = ""
    color: str = ""
    cover: str = ""
    description: str = ""
    creation_ids: List[str] = []
    order: int = 0
    group: str = ""
    pinned: bool = False


class ItemIn(BaseModel):
    kind: str = "note"
    title: str = ""
    content: str = ""
    universe_id: Optional[str] = None
    fields: Dict[str, Any] = {}
    tags: List[str] = []
    links: List[str] = []
    image: str = ""
    date: str = ""
    pinned: bool = False
    media: List[Dict[str, Any]] = []


class TaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    universe_id: Optional[str] = None
    item_id: Optional[str] = None
    due: str = ""
    priority: str = "normal"
    done: bool = False
    notes: str = ""


class LinkIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    url: str = Field(min_length=1, max_length=2000)
    kind: str = "watch"   # watch | listen | app | video
    color: str = ""
    cover: str = ""
    universe_id: Optional[str] = None
    order: int = 0


class ConfigIn(BaseModel):
    code: Optional[str] = None
    music_url: Optional[str] = None
    music_title: Optional[str] = None
    hidden_apps: Optional[List[str]] = None
    shortcuts: Optional[List[Dict[str, Any]]] = None
    focus_vids: Optional[List[Dict[str, Any]]] = None
    playlists: Optional[List[dict]] = None
    cover_ratio: Optional[str] = None
    radio: Optional[List[Dict[str, Any]]] = None


def _esc(t: str) -> str:
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def pdf_to_html(data: bytes) -> str:
    """PDF -> HTML : titres détectés par la taille de police, gras/italique conservés."""
    import pymupdf
    doc = pymupdf.open(stream=data, filetype="pdf")
    blocks, sizes = [], []
    for page in doc:
        for b in page.get_text("dict")["blocks"]:
            if b.get("type") != 0:
                continue
            spans = [sp for ln in b["lines"] for sp in ln["spans"] if sp["text"].strip()]
            if not spans:
                continue
            sizes += [round(sp["size"], 1) for sp in spans]
            blocks.append(b)
    if not blocks:
        return ""
    body = statistics.median(sizes)
    out = []
    for b in blocks:
        lines, top = [], 0
        for ln in b["lines"]:
            parts = []
            for sp in ln["spans"]:
                t = _esc(sp["text"])
                if not t.strip():
                    parts.append(t)
                    continue
                top = max(top, sp["size"])
                if sp["flags"] & 16:
                    t = f"<b>{t}</b>"
                if sp["flags"] & 2:
                    t = f"<i>{t}</i>"
                parts.append(t)
            lines.append("".join(parts).strip())
        text = " ".join(x for x in lines if x)
        text = re.sub(r"</b>\s*<b>", " ", text)
        if not text:
            continue
        plain = re.sub(r"<[^>]+>", "", text)
        if top >= body * 1.45 and len(plain) < 140:
            out.append(f"<h2>{plain}</h2>")
        elif top >= body * 1.18 and len(plain) < 140:
            out.append(f"<h3>{plain}</h3>")
        else:
            out.append(f"<p>{text}</p>")
    return "".join(out)


def split_by_headings(html: str, fallback_title: str):
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")
    nodes = list(soup.children)
    level = next((lv for lv in ("h1", "h2", "h3") if soup.find(lv)), None)
    if not level:
        return [(fallback_title, html)]
    sections, title, buf = [], None, []
    for n in nodes:
        if getattr(n, "name", None) == level:
            if buf and "".join(map(str, buf)).strip():
                sections.append((title or fallback_title, "".join(map(str, buf))))
            title, buf = n.get_text(" ", strip=True)[:200] or fallback_title, []
        else:
            buf.append(n)
    if buf or title:
        sections.append((title or fallback_title, "".join(map(str, buf))))
    return sections


def build_public_files_router(db, storage_get) -> APIRouter:
    r = APIRouter(prefix="/atelier-files")

    @r.get("/{fid}")
    async def get_file(fid: str):
        f = await db.atelier_files.find_one({"id": fid}, {"_id": 0})
        if not f:
            raise HTTPException(404, "Fichier introuvable")
        data, ct = await storage_get(f["path"])
        disp = "inline" if (f.get("content_type") or "").split("/")[0] in ("image", "audio", "video") or f.get("content_type") == "application/pdf" else "attachment"
        name = re.sub(r'[^\w.\- ]', "_", f.get("name") or "fichier")
        return Response(content=data, media_type=f.get("content_type") or ct, headers={"Cache-Control": "private, max-age=31536000, immutable", "Content-Disposition": f'{disp}; filename="{name}"'})

    return r


def build_atelier_router(db, require_admin, storage_put, app_name) -> APIRouter:
    r = APIRouter(prefix="/atelier", dependencies=[Depends(require_admin)])

    async def store(data: bytes, ct: str, name: str) -> dict:
        fid = str(uuid.uuid4())
        ext = (name.rsplit(".", 1)[-1].lower()[:6] if "." in name else "bin")
        path = f"{app_name}/atelier/{fid}.{ext}"
        await storage_put(path, data, ct)
        await db.atelier_files.insert_one({"id": fid, "path": path, "content_type": ct, "size": len(data), "name": name, "created_at": now_iso()})
        return {"id": fid, "url": f"/api/atelier-files/{fid}", "name": name, "mime": ct, "size": len(data)}

    @r.post("/files")
    async def upload_file(file: UploadFile = File(...)):
        data = await file.read()
        if len(data) > MAX_FILE:
            raise HTTPException(413, "Fichier trop lourd (max 250 Mo)")
        return await store(data, file.content_type or "application/octet-stream", file.filename or "fichier")

    @r.post("/import")
    async def import_doc(file: UploadFile = File(...), universe_id: str = Form(""), kind: str = Form("document"), split: str = Form("1")):
        if kind not in KINDS:
            raise HTTPException(400, "Type d'élément inconnu")
        data = await file.read()
        if len(data) > MAX_FILE:
            raise HTTPException(413, "Fichier trop lourd (max 250 Mo)")
        name = file.filename or "document"
        base = name.rsplit(".", 1)[0]
        low = name.lower()
        try:
            if low.endswith(".docx"):
                import mammoth
                imgs = []

                def grab(image):
                    with image.open() as f:
                        imgs.append((f.read(), image.content_type or "image/png"))
                    return {"src": f"atimg:{len(imgs) - 1}"}
                html = mammoth.convert_to_html(io.BytesIO(data), convert_image=mammoth.images.img_element(grab)).value
                for i, (b, ct) in enumerate(imgs):
                    up = await store(b, ct, f"{base}-image-{i + 1}.{ct.split('/')[-1]}")
                    html = html.replace(f'src="atimg:{i}"', f'src="{up["url"]}" class="sx-rich-img"')
            elif low.endswith(".pdf"):
                html = pdf_to_html(data)
            elif low.endswith((".txt", ".md")):
                txt = data.decode("utf-8", errors="replace")
                html = "".join(f"<h2>{_esc(p.lstrip('# ').strip())}</h2>" if p.startswith("#") else f"<p>{_esc(p).replace(chr(10), '<br/>')}</p>" for p in re.split(r"\n{2,}", txt) if p.strip())
            else:
                raise HTTPException(400, "Formats acceptés : PDF, Word (.docx), texte")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(422, "Impossible de lire ce document")
        if not html.strip():
            raise HTTPException(422, "Aucun texte trouvé (PDF scanné en image ?)")
        source = await store(data, file.content_type or "application/octet-stream", name)
        sections = split_by_headings(html, base) if split == "1" else [(base, html)]
        created = []
        for title, content in sections:
            doc = {"id": str(uuid.uuid4()), **ItemIn(kind=kind, title=title, content=content, universe_id=universe_id or None,
                   tags=["import"], media=[{"id": source["id"], "type": "file", "url": source["url"], "name": name, "mime": source["mime"]}]).model_dump(),
                   "created_at": now_iso(), "updated_at": now_iso()}
            await db.atelier_items.insert_one(dict(doc))
            created.append(doc)
        return {"items": created}

    @r.get("/items/{iid}/docx")
    async def export_docx(iid: str):
        it = await db.atelier_items.find_one({"id": iid}, {"_id": 0})
        if not it:
            raise HTTPException(404, "Élément introuvable")
        from docx import Document
        from htmldocx import HtmlToDocx
        d = Document()
        d.add_heading(it.get("title") or "Sans titre", 0)
        html = re.sub(r"<img[^>]*>", "", it.get("content") or "")
        html = re.sub(r'<span class="sx-music-cue"[^>]*>.*?</span>', "", html)
        try:
            HtmlToDocx().add_html_to_document(html or "<p></p>", d)
        except Exception:
            d.add_paragraph(re.sub(r"<[^>]+>", " ", html))
        buf = io.BytesIO()
        d.save(buf)
        fname = re.sub(r"[^\w\- ]", "_", it.get("title") or "document")[:80]
        return Response(content=buf.getvalue(), media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        headers={"Content-Disposition": f'attachment; filename="{fname}.docx"'})

    async def get_config():
        c = await db.atelier_config.find_one({"_id": "main"}, {"_id": 0})
        return c or {"code": "0874", "music_url": "", "music_title": ""}

    @r.get("/config")
    async def config():
        return await get_config()

    @r.get("/yt-titles")
    async def yt_titles(ids: str):
        import asyncio
        import httpx
        vids = [v for v in ids.split(",") if re.fullmatch(r"[\w-]{11}", v)][:60]
        async with httpx.AsyncClient(timeout=8) as c:
            async def one(v):
                try:
                    j = (await c.get("https://www.youtube.com/oembed", params={"url": f"https://www.youtube.com/watch?v={v}", "format": "json"})).json()
                    return v, {"title": j.get("title", ""), "author": j.get("author_name", "")}
                except Exception:
                    return v, {"title": "", "author": ""}
            return dict(await asyncio.gather(*[one(v) for v in vids]))

    @r.put("/config")
    async def set_config(body: ConfigIn):
        patch = {k: v for k, v in body.model_dump().items() if v is not None}
        if "code" in patch and not (patch["code"].isdigit() and 3 <= len(patch["code"]) <= 8):
            raise HTTPException(400, "Le code doit contenir 3 à 8 chiffres")
        await db.atelier_config.update_one({"_id": "main"}, {"$set": {**(await get_config()), **patch}}, upsert=True)
        return await get_config()

    @r.get("/bootstrap")
    async def bootstrap():
        universes = await db.atelier_universes.find({}, {"_id": 0}).sort("order", 1).to_list(500)
        items = await db.atelier_items.find({}, {"_id": 0}).sort("updated_at", -1).to_list(5000)
        tasks = await db.atelier_tasks.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)
        links = await db.atelier_links.find({}, {"_id": 0}).sort("order", 1).to_list(2000)
        records = await db.atelier_records.find({}, {"_id": 0}).to_list(10000)
        return {"universes": universes, "items": items, "tasks": tasks, "links": links, "records": records, "config": await get_config()}

    # ---- cockpit carrière : objectifs, agenda, budget, collaborations
    REC_KINDS = {"goals", "events", "budget", "contacts"}

    @r.post("/records/{rk}")
    async def create_record(rk: str, body: Dict[str, Any]):
        if rk not in REC_KINDS:
            raise HTTPException(400, "Type inconnu")
        doc = {**{k: v for k, v in body.items() if k not in ("id", "_id", "rk")}, "id": str(uuid.uuid4()), "rk": rk, "created_at": now_iso()}
        await db.atelier_records.insert_one(dict(doc))
        doc.pop("_id", None)
        return doc

    @r.put("/records/{rk}/{rid}")
    async def update_record(rk: str, rid: str, body: Dict[str, Any]):
        patch = {k: v for k, v in body.items() if k not in ("id", "_id", "rk", "created_at")}
        res = await db.atelier_records.update_one({"id": rid, "rk": rk}, {"$set": patch})
        if not res.matched_count:
            raise HTTPException(404, "Introuvable")
        return await db.atelier_records.find_one({"id": rid}, {"_id": 0})

    @r.delete("/records/{rk}/{rid}")
    async def delete_record(rk: str, rid: str):
        await db.atelier_records.delete_one({"id": rid, "rk": rk})
        return {"ok": True}

    # ---- bureau & salon : apps, vidéos, musiques, liens
    @r.post("/links")
    async def create_link(body: LinkIn):
        doc = {"id": str(uuid.uuid4()), **body.model_dump(), "created_at": now_iso()}
        await db.atelier_links.insert_one(dict(doc))
        return doc

    @r.put("/links/{lid}")
    async def update_link(lid: str, body: LinkIn):
        res = await db.atelier_links.update_one({"id": lid}, {"$set": body.model_dump()})
        if not res.matched_count:
            raise HTTPException(404, "Lien introuvable")
        return await db.atelier_links.find_one({"id": lid}, {"_id": 0})

    @r.delete("/links/{lid}")
    async def delete_link(lid: str):
        await db.atelier_links.delete_one({"id": lid})
        return {"ok": True}

    # ---- univers
    @r.post("/universes")
    async def create_universe(body: UniverseIn):
        doc = {"id": str(uuid.uuid4()), **body.model_dump(), "created_at": now_iso(), "updated_at": now_iso()}
        await db.atelier_universes.insert_one(dict(doc))
        return doc

    @r.put("/universes/{uid}")
    async def update_universe(uid: str, body: UniverseIn):
        res = await db.atelier_universes.update_one({"id": uid}, {"$set": {**body.model_dump(), "updated_at": now_iso()}})
        if not res.matched_count:
            raise HTTPException(404, "Univers introuvable")
        return await db.atelier_universes.find_one({"id": uid}, {"_id": 0})

    @r.delete("/universes/{uid}")
    async def delete_universe(uid: str):
        # les éléments ne sont jamais supprimés en cascade : ils retournent dans l'Inbox
        await db.atelier_items.update_many({"universe_id": uid}, {"$set": {"universe_id": None}})
        await db.atelier_tasks.update_many({"universe_id": uid}, {"$set": {"universe_id": None}})
        await db.atelier_universes.delete_one({"id": uid})
        return {"ok": True}

    # ---- éléments (notes, scènes, fiches…) avec historique de versions
    def check_kind(k):
        if k not in KINDS:
            raise HTTPException(400, "Type d'élément inconnu")

    @r.post("/items")
    async def create_item(body: ItemIn):
        check_kind(body.kind)
        doc = {"id": str(uuid.uuid4()), **body.model_dump(), "created_at": now_iso(), "updated_at": now_iso()}
        await db.atelier_items.insert_one(dict(doc))
        return doc

    @r.put("/items/{iid}")
    async def update_item(iid: str, body: ItemIn):
        check_kind(body.kind)
        old = await db.atelier_items.find_one({"id": iid}, {"_id": 0})
        if not old:
            raise HTTPException(404, "Élément introuvable")
        if (old.get("content") or "") != body.content or (old.get("title") or "") != body.title:
            last = await db.atelier_versions.find_one({"item_id": iid}, {"_id": 0, "at": 1}, sort=[("at", -1)])
            # une sauvegarde de version au plus toutes les 5 minutes
            if not last or (datetime.now(timezone.utc) - datetime.fromisoformat(last["at"])).total_seconds() > 300:
                await db.atelier_versions.insert_one({"id": str(uuid.uuid4()), "item_id": iid, "at": now_iso(), "data": old})
                ids = [v["id"] async for v in db.atelier_versions.find({"item_id": iid}, {"id": 1}).sort("at", -1).skip(40)]
                if ids:
                    await db.atelier_versions.delete_many({"id": {"$in": ids}})
        await db.atelier_items.update_one({"id": iid}, {"$set": {**body.model_dump(), "updated_at": now_iso()}})
        return await db.atelier_items.find_one({"id": iid}, {"_id": 0})

    @r.delete("/items/{iid}")
    async def delete_item(iid: str):
        old = await db.atelier_items.find_one({"id": iid}, {"_id": 0})
        if old:
            await db.atelier_trash.insert_one({"id": iid, "at": now_iso(), "data": old})
        await db.atelier_items.delete_one({"id": iid})
        await db.atelier_items.update_many({"links": iid}, {"$pull": {"links": iid}})
        return {"ok": True}

    @r.get("/items/{iid}/versions")
    async def item_versions(iid: str):
        return await db.atelier_versions.find({"item_id": iid}, {"_id": 0}).sort("at", -1).to_list(40)

    @r.post("/items/{iid}/versions/{vid}/restore")
    async def restore_version(iid: str, vid: str):
        v = await db.atelier_versions.find_one({"id": vid, "item_id": iid}, {"_id": 0})
        if not v:
            raise HTTPException(404, "Version introuvable")
        cur = await db.atelier_items.find_one({"id": iid}, {"_id": 0})
        if cur:
            await db.atelier_versions.insert_one({"id": str(uuid.uuid4()), "item_id": iid, "at": now_iso(), "data": cur})
        data = {k: v["data"].get(k) for k in ItemIn.model_fields if k in v["data"]}
        await db.atelier_items.update_one({"id": iid}, {"$set": {**data, "updated_at": now_iso()}}, upsert=True)
        return await db.atelier_items.find_one({"id": iid}, {"_id": 0})

    # ---- tâches
    @r.post("/tasks")
    async def create_task(body: TaskIn):
        doc = {"id": str(uuid.uuid4()), **body.model_dump(), "created_at": now_iso(), "done_at": ""}
        await db.atelier_tasks.insert_one(dict(doc))
        return doc

    @r.put("/tasks/{tid}")
    async def update_task(tid: str, body: TaskIn):
        old = await db.atelier_tasks.find_one({"id": tid}, {"_id": 0})
        if not old:
            raise HTTPException(404, "Tâche introuvable")
        done_at = old.get("done_at") or ""
        if body.done and not old.get("done"):
            done_at = now_iso()
        if not body.done:
            done_at = ""
        await db.atelier_tasks.update_one({"id": tid}, {"$set": {**body.model_dump(), "done_at": done_at}})
        return await db.atelier_tasks.find_one({"id": tid}, {"_id": 0})

    @r.delete("/tasks/{tid}")
    async def delete_task(tid: str):
        await db.atelier_tasks.delete_one({"id": tid})
        return {"ok": True}

    # ---- sauvegarde complète
    @r.get("/export")
    async def export_all():
        data = await bootstrap()
        data["versions"] = await db.atelier_versions.find({}, {"_id": 0}).to_list(20000)
        data["exported_at"] = now_iso()
        return data

    return r
