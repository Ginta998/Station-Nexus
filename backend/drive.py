"""Google Drive connecté à l'Atelier : connexion OAuth, navigation, aperçu des fichiers (lecture seule)."""
import os
import hmac
import time
import uuid
import hashlib
from datetime import datetime, timezone, timedelta
from urllib.parse import urlencode, urlparse
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse, Response

SCOPE = "https://www.googleapis.com/auth/drive.readonly"
API = "https://www.googleapis.com/drive/v3"
FIELDS = "nextPageToken,files(id,name,mimeType,iconLink,thumbnailLink,webViewLink,modifiedTime,size,parents)"
GOOGLE_EXPORT = {
    "application/vnd.google-apps.document": "application/pdf",
    "application/vnd.google-apps.spreadsheet": "application/pdf",
    "application/vnd.google-apps.presentation": "application/pdf",
    "application/vnd.google-apps.drawing": "image/png",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _cid():
    return os.environ["GOOGLE_CLIENT_ID"]


def _secret():
    return os.environ["GOOGLE_CLIENT_SECRET"]


def sign(fid: str, exp: int) -> str:
    return hmac.new(_secret().encode(), f"{fid}.{exp}".encode(), hashlib.sha256).hexdigest()[:32]


async def access_token(db) -> str:
    c = await db.atelier_drive.find_one({"id": "drive"}, {"_id": 0})
    if not c:
        raise HTTPException(400, "Google Drive n'est pas connecté")
    if c.get("expires_at", "") > (datetime.now(timezone.utc) + timedelta(seconds=60)).isoformat():
        return c["access_token"]
    async with httpx.AsyncClient(timeout=20) as h:
        r = await h.post("https://oauth2.googleapis.com/token", data={"client_id": _cid(), "client_secret": _secret(), "refresh_token": c["refresh_token"], "grant_type": "refresh_token"})
    if r.status_code != 200:
        raise HTTPException(401, "La connexion Google a expiré : reconnecte ton Drive")
    t = r.json()
    exp = (datetime.now(timezone.utc) + timedelta(seconds=t.get("expires_in", 3600))).isoformat()
    await db.atelier_drive.update_one({"id": "drive"}, {"$set": {"access_token": t["access_token"], "expires_at": exp}})
    return t["access_token"]


async def drive_get(db, path: str, params=None, raw=False):
    tok = await access_token(db)
    async with httpx.AsyncClient(timeout=60, follow_redirects=True) as h:
        r = await h.get(f"{API}{path}", params=params, headers={"Authorization": f"Bearer {tok}"})
    if r.status_code != 200:
        raise HTTPException(r.status_code if r.status_code in (403, 404) else 502, "Google Drive refuse l'accès à ce fichier")
    return r if raw else r.json()


def build_drive_routers(db, require_admin):
    admin = APIRouter(prefix="/atelier/drive", dependencies=[Depends(require_admin)])
    public = APIRouter(prefix="/atelier/drive")

    @admin.get("/status")
    async def status():
        c = await db.atelier_drive.find_one({"id": "drive"}, {"_id": 0, "email": 1, "connected_at": 1})
        return {"configured": bool(os.environ.get("GOOGLE_CLIENT_ID")), "connected": bool(c), **(c or {})}

    @admin.get("/connect")
    async def connect(origin: str):
        u = urlparse(origin)
        if u.scheme != "https" or not u.netloc:
            raise HTTPException(400, "Origine invalide")
        state = str(uuid.uuid4())
        redirect = f"https://{u.netloc}/api/atelier/drive/callback"
        await db.atelier_drive_states.insert_one({"state": state, "redirect": redirect, "origin": f"https://{u.netloc}", "at": time.time()})
        q = {"client_id": _cid(), "redirect_uri": redirect, "response_type": "code", "scope": f"{SCOPE} openid email",
             "access_type": "offline", "prompt": "consent", "include_granted_scopes": "true", "state": state}
        return {"url": "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(q), "redirect_uri": redirect}

    @public.get("/callback")
    async def callback(state: str = "", code: str = "", error: str = ""):
        st = await db.atelier_drive_states.find_one_and_delete({"state": state})
        if not st or time.time() - st["at"] > 900:
            raise HTTPException(400, "Lien de connexion expiré, recommence depuis l'Atelier")
        back = f"{st['origin']}/atelier?drive="
        if error or not code:
            return RedirectResponse(back + "refus")
        async with httpx.AsyncClient(timeout=20) as h:
            r = await h.post("https://oauth2.googleapis.com/token", data={"client_id": _cid(), "client_secret": _secret(), "code": code, "grant_type": "authorization_code", "redirect_uri": st["redirect"]})
        if r.status_code != 200:
            return RedirectResponse(back + "erreur")
        t = r.json()
        if SCOPE not in (t.get("scope") or "").split():
            return RedirectResponse(back + "scope")
        email = ""
        async with httpx.AsyncClient(timeout=20) as h:
            me = await h.get("https://openidconnect.googleapis.com/v1/userinfo", headers={"Authorization": f"Bearer {t['access_token']}"})
            if me.status_code == 200:
                email = me.json().get("email", "")
        old = await db.atelier_drive.find_one({"id": "drive"}, {"_id": 0, "refresh_token": 1}) or {}
        await db.atelier_drive.update_one({"id": "drive"}, {"$set": {
            "id": "drive", "access_token": t["access_token"], "refresh_token": t.get("refresh_token") or old.get("refresh_token", ""),
            "expires_at": (datetime.now(timezone.utc) + timedelta(seconds=t.get("expires_in", 3600))).isoformat(), "email": email, "connected_at": now_iso()}}, upsert=True)
        return RedirectResponse(back + "ok")

    @admin.delete("/connect")
    async def disconnect():
        c = await db.atelier_drive.find_one_and_delete({"id": "drive"})
        if c and c.get("refresh_token"):
            async with httpx.AsyncClient(timeout=10) as h:
                await h.post("https://oauth2.googleapis.com/revoke", data={"token": c["refresh_token"]})
        return {"ok": True}

    @admin.get("/files")
    async def files(folder: str = "", q: str = "", page: str = "", view: str = "mine"):
        safe = q.replace("\\", "").replace("'", "\\'")
        if safe:
            query = f"name contains '{safe}' and trashed=false"
        elif view == "shared":
            query = "sharedWithMe and trashed=false"
        elif view == "recent":
            query = "trashed=false and mimeType != 'application/vnd.google-apps.folder'"
        else:
            query = f"'{(folder or 'root').replace(chr(39), '')}' in parents and trashed=false"
        params = {"q": query, "fields": FIELDS, "pageSize": 60, "supportsAllDrives": "true", "includeItemsFromAllDrives": "true",
                  "orderBy": "modifiedTime desc" if view == "recent" or safe else "folder,name"}
        if page:
            params["pageToken"] = page
        d = await drive_get(db, "/files", params)
        return {"files": d.get("files", []), "next": d.get("nextPageToken", "")}

    @admin.get("/files/{fid}")
    async def file_info(fid: str):
        f = await drive_get(db, f"/files/{fid}", {"fields": "id,name,mimeType,webViewLink,size,modifiedTime,thumbnailLink", "supportsAllDrives": "true"})
        exp = int(time.time()) + 3600 * 6
        return {**f, "raw": f"/api/atelier/drive/raw/{fid}?e={exp}&s={sign(fid, exp)}", "exported": f["mimeType"] in GOOGLE_EXPORT}

    @public.get("/raw/{fid}")
    async def raw(fid: str, e: int = Query(...), s: str = Query(...)):
        if e < time.time() or not hmac.compare_digest(s, sign(fid, e)):
            raise HTTPException(403, "Lien expiré")
        f = await drive_get(db, f"/files/{fid}", {"fields": "name,mimeType", "supportsAllDrives": "true"})
        mt = f["mimeType"]
        if mt in GOOGLE_EXPORT:
            r = await drive_get(db, f"/files/{fid}/export", {"mimeType": GOOGLE_EXPORT[mt]}, raw=True)
            ct = GOOGLE_EXPORT[mt]
        else:
            r = await drive_get(db, f"/files/{fid}", {"alt": "media", "supportsAllDrives": "true"}, raw=True)
            ct = mt
        return Response(content=r.content, media_type=ct, headers={"Cache-Control": "private, max-age=3600", "Content-Disposition": "inline"})

    return admin, public
