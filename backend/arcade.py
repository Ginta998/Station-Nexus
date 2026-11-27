"""Nexus Arcade côté serveur : les jeux et les sauvegardes de l'administrateur.

- Réservé au compte admin : rien n'est jamais servi au public.
- Les jeux sont rangés en morceaux de 8 Mo dans le stockage de fichiers : le serveur (512 Mo de mémoire
  sur Emergent) ne tient jamais un gros jeu entier en mémoire.
- Les sauvegardes (en jeu et instantanées) gardent la console, le moteur et sa version, et la version
  précédente en secours. Deux appareils qui écrivent la même sauvegarde : le second reçoit un conflit.
"""
import re
import uuid
import asyncio
import ipaddress
import socket
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.responses import Response
from pydantic import BaseModel, Field

CHUNK = 8 * 1024 * 1024
MAX_GAME = 4 * 1024 * 1024 * 1024
MAX_SAVE = 64 * 1024 * 1024
SLOT_RE = re.compile(r"^[a-z0-9_-]{1,24}$")
KINDS = {"sram", "state"}


def now_iso():
    return datetime.now(timezone.utc).isoformat()


class GameIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    platform: str = Field(min_length=1, max_length=24)
    kind: str = "game"                 # game | bios
    file_name: str = ""
    file_format: str = ""
    file_size: int = 0
    sha1: str = ""
    cover: str = ""
    description: str = ""
    year: str = ""
    publisher: str = ""


class GamePatch(BaseModel):
    title: Optional[str] = None
    platform: Optional[str] = None
    cover: Optional[str] = None
    description: Optional[str] = None
    year: Optional[str] = None
    publisher: Optional[str] = None
    favorite: Optional[bool] = None
    prefs: Optional[Dict[str, Any]] = None
    kind: Optional[str] = None          # game | wish (fiche sans fichier, pour une ludothèque complète)
    file_name: Optional[str] = None
    file_format: Optional[str] = None


class CompleteIn(BaseModel):
    chunks: int
    size: int
    sha1: str = ""


class SessionIn(BaseModel):
    started_at: str = ""
    duration: int = 0                  # secondes


class ImportUrlIn(BaseModel):
    url: str
    title: str = ""
    platform: str = ""
    file_name: str = ""
    game_id: str = ""                  # ajouter le fichier à une fiche existante (jeu ajouté sans fichier)


def _public_url(url: str) -> bool:
    try:
        u = urlparse(url)
        if u.scheme not in ("http", "https") or not u.hostname:
            return False
        for info in socket.getaddrinfo(u.hostname, None):
            ip = ipaddress.ip_address(info[4][0])
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
                return False
        return True
    except Exception:
        return False


def _drive_direct(url: str) -> str:
    """Un lien de partage Google Drive devient un lien de téléchargement."""
    m = re.search(r"drive\.google\.com/(?:file/d/|open\?id=|uc\?id=)([\w-]{10,})", url)
    if m:
        return f"https://drive.usercontent.google.com/download?id={m.group(1)}&export=download&confirm=t"
    # Dropbox : le lien de partage (?dl=0) devient un téléchargement direct
    if re.search(r"(^|\.)dropbox\.com/", url):
        return re.sub(r"([?&])dl=0", r"\1dl=1", url) if "dl=0" in url else url + ("&" if "?" in url else "?") + "dl=1"
    return url


def build_arcade_router(db, require_admin, storage_put, storage_get, app_name: str) -> APIRouter:
    r = APIRouter(prefix="/arcade")
    games, saves, jobs = db.arcade_games, db.arcade_saves, db.arcade_jobs

    async def game_or_404(gid):
        g = await games.find_one({"id": gid}, {"_id": 0})
        if not g:
            raise HTTPException(404, "Jeu introuvable")
        return g

    # ---------- bibliothèque
    @r.get("/games")
    async def list_games(_a=Depends(require_admin)):
        return await games.find({"deleted": {"$ne": True}}, {"_id": 0, "chunk_paths": 0}).sort("title", 1).to_list(5000)

    @r.post("/games")
    async def create_game(body: GameIn, _a=Depends(require_admin)):
        if body.file_size > MAX_GAME:
            raise HTTPException(413, "Fichier trop gros (4 Go au maximum)")
        g = {**body.model_dump(), "id": str(uuid.uuid4()), "favorite": False, "ready": False, "chunks": 0,
             "chunk_paths": [], "added_at": now_iso(), "last_played_at": "", "play_count": 0, "play_seconds": 0, "prefs": {}}
        await games.insert_one(dict(g))
        g.pop("chunk_paths", None)
        return g

    @r.put("/games/{gid}")
    async def patch_game(gid: str, body: GamePatch, _a=Depends(require_admin)):
        await game_or_404(gid)
        upd = {k: v for k, v in body.model_dump().items() if v is not None}
        if upd:
            await games.update_one({"id": gid}, {"$set": upd})
        return await games.find_one({"id": gid}, {"_id": 0, "chunk_paths": 0})

    @r.delete("/games/{gid}")
    async def delete_game(gid: str, _a=Depends(require_admin)):
        # On retire le jeu de la bibliothèque ; ses sauvegardes restent, au cas où tu le réinstalles.
        await games.update_one({"id": gid}, {"$set": {"deleted": True, "deleted_at": now_iso()}})
        return {"ok": True}

    # ---------- fichier du jeu, en morceaux
    @r.put("/games/{gid}/chunks/{n}")
    async def put_chunk(gid: str, n: int, request: Request, _a=Depends(require_admin)):
        g = await game_or_404(gid)
        if n < 0 or n > MAX_GAME // CHUNK:
            raise HTTPException(400, "Morceau invalide")
        data = await request.body()
        if not data or len(data) > CHUNK:
            raise HTTPException(413, "Morceau trop gros (8 Mo au maximum)")
        path = f"{app_name}/arcade/{gid}/{n:05d}.bin"
        res = await storage_put(path, data, "application/octet-stream")
        paths = list(g.get("chunk_paths") or [])
        while len(paths) <= n:
            paths.append("")
        paths[n] = res.get("path", path)
        await games.update_one({"id": gid}, {"$set": {"chunk_paths": paths}})
        return {"ok": True, "n": n}

    @r.post("/games/{gid}/complete")
    async def complete(gid: str, body: CompleteIn, _a=Depends(require_admin)):
        g = await games.find_one({"id": gid}, {"_id": 0})
        if not g:
            raise HTTPException(404, "Jeu introuvable")
        paths = g.get("chunk_paths") or []
        if len(paths) < body.chunks or any(not p for p in paths[:body.chunks]):
            raise HTTPException(409, "Il manque des morceaux : relance l'envoi")
        await games.update_one({"id": gid}, {"$set": {"ready": True, "chunks": body.chunks, "file_size": body.size,
                                                      "sha1": body.sha1 or g.get("sha1", ""), "chunk_paths": paths[:body.chunks]}})
        return {"ok": True}

    @r.get("/games/{gid}/chunks/{n}")
    async def get_chunk(gid: str, n: int, _a=Depends(require_admin)):
        g = await games.find_one({"id": gid}, {"_id": 0, "chunk_paths": 1})
        paths = (g or {}).get("chunk_paths") or []
        if n < 0 or n >= len(paths) or not paths[n]:
            raise HTTPException(404, "Morceau introuvable")
        data, _ = await storage_get(paths[n])
        return Response(content=data, media_type="application/octet-stream", headers={"Cache-Control": "private, max-age=31536000, immutable"})

    # ---------- installer depuis un lien (ton stockage, Google Drive…)
    async def run_import(job_id: str, gid: str, url: str, keep: bool = False):
        n = 0
        size = 0
        buf = bytearray()
        paths: List[str] = []
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(60, read=120), follow_redirects=True) as c:
                async with c.stream("GET", url) as res:
                    if res.status_code != 200:
                        raise RuntimeError(f"le lien répond {res.status_code}")
                    if "text/html" in res.headers.get("content-type", ""):
                        raise RuntimeError("le lien mène à une page web, pas à un fichier")
                    total = int(res.headers.get("content-length") or 0)
                    async for part in res.aiter_bytes(1024 * 256):
                        buf.extend(part)
                        size += len(part)
                        if size > MAX_GAME:
                            raise RuntimeError("fichier trop gros (4 Go au maximum)")
                        while len(buf) >= CHUNK:
                            piece = bytes(buf[:CHUNK]); del buf[:CHUNK]
                            res_p = await storage_put(f"{app_name}/arcade/{gid}/{n:05d}.bin", piece, "application/octet-stream")
                            paths.append(res_p.get("path", "")); n += 1
                            await jobs.update_one({"id": job_id}, {"$set": {"done": size, "total": total}})
            if buf:
                res_p = await storage_put(f"{app_name}/arcade/{gid}/{n:05d}.bin", bytes(buf), "application/octet-stream")
                paths.append(res_p.get("path", "")); n += 1
            await games.update_one({"id": gid}, {"$set": {"chunk_paths": paths, "chunks": n, "file_size": size, "ready": True}})
            await jobs.update_one({"id": job_id}, {"$set": {"status": "done", "done": size}})
        except Exception as e:
            # Une fiche existante (jeu ajouté sans fichier) reste en place ; un nouveau jeu raté disparaît
            await games.update_one({"id": gid}, {"$set": {"ready": False} if keep else {"deleted": True}})
            await jobs.update_one({"id": job_id}, {"$set": {"status": "error", "error": str(e)[:300]}})

    @r.post("/import-url")
    async def import_url(body: ImportUrlIn, _a=Depends(require_admin)):
        url = _drive_direct(body.url.strip())
        if not _public_url(url):
            raise HTTPException(400, "Lien invalide")
        name = body.file_name or urlparse(body.url).path.rsplit("/", 1)[-1] or "jeu"
        if body.game_id:
            g0 = await game_or_404(body.game_id)
            await games.update_one({"id": g0["id"]}, {"$set": {"file_name": name, "file_format": name.rsplit(".", 1)[-1].lower() if "." in name else "", "ready": False}})
            job = {"id": str(uuid.uuid4()), "game_id": g0["id"], "status": "running", "done": 0, "total": 0, "error": "", "created_at": now_iso()}
            await jobs.insert_one(dict(job))
            asyncio.create_task(run_import(job["id"], g0["id"], url, keep=True))
            return {"job_id": job["id"], "game_id": g0["id"]}
        g = {"id": str(uuid.uuid4()), "title": body.title or name.rsplit(".", 1)[0], "platform": body.platform or "", "kind": "game",
             "file_name": name, "file_format": name.rsplit(".", 1)[-1].lower() if "." in name else "", "file_size": 0, "sha1": "",
             "cover": "", "description": "", "year": "", "publisher": "", "favorite": False, "ready": False, "chunks": 0,
             "chunk_paths": [], "added_at": now_iso(), "last_played_at": "", "play_count": 0, "play_seconds": 0, "prefs": {}}
        await games.insert_one(dict(g))
        job = {"id": str(uuid.uuid4()), "game_id": g["id"], "status": "running", "done": 0, "total": 0, "error": "", "created_at": now_iso()}
        await jobs.insert_one(dict(job))
        asyncio.create_task(run_import(job["id"], g["id"], url))
        return {"job_id": job["id"], "game_id": g["id"]}

    @r.get("/jobs/{jid}")
    async def job(jid: str, _a=Depends(require_admin)):
        j = await jobs.find_one({"id": jid}, {"_id": 0})
        if not j:
            raise HTTPException(404, "Envoi introuvable")
        return j

    # ---------- catalogue libre : Homebrew Hub (homebrews GB, GBC, GBA, NES sous licence libre)
    @r.get("/catalog")
    async def catalog(title: str = "", platform: str = "", page: int = 1, _a=Depends(require_admin)):
        params = {"page": max(1, page), "page_elements": 24}
        if title.strip():
            params["title"] = title.strip()[:80]
        if platform.upper() in ("GB", "GBC", "GBA", "NES"):
            params["platform"] = platform.upper()
        try:
            async with httpx.AsyncClient(timeout=15, follow_redirects=True) as c:
                res = await c.get("https://hh3.gbdev.io/api/search", params=params)
            if res.status_code != 200:
                raise HTTPException(502, f"Homebrew Hub répond {res.status_code}")
            return res.json()
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(502, "Homebrew Hub ne répond pas")

    # ---------- temps de jeu
    @r.post("/games/{gid}/session")
    async def session(gid: str, body: SessionIn, _a=Depends(require_admin)):
        await game_or_404(gid)
        d = max(0, min(int(body.duration), 24 * 3600))
        await games.update_one({"id": gid}, {"$set": {"last_played_at": now_iso()}, "$inc": {"play_count": 1 if d < 5 else 0, "play_seconds": d}})
        return {"ok": True}

    @r.post("/games/{gid}/launch")
    async def launch(gid: str, _a=Depends(require_admin)):
        await game_or_404(gid)
        await games.update_one({"id": gid}, {"$set": {"last_played_at": now_iso()}, "$inc": {"play_count": 1}})
        return {"ok": True}

    # ---------- sauvegardes
    @r.get("/saves")
    async def list_saves(game_id: str = "", _a=Depends(require_admin)):
        q = {"game_id": game_id} if game_id else {}
        return await saves.find(q, {"_id": 0, "path": 0, "prev_path": 0}).sort("updated_at", -1).to_list(2000)

    @r.put("/saves/{gid}/{kind}/{slot}")
    async def put_save(gid: str, kind: str, slot: str, request: Request, _a=Depends(require_admin),
                       x_core: str = Header(""), x_core_version: str = Header(""), x_engine: str = Header("emulatorjs"),
                       x_device: str = Header(""), x_base_rev: Optional[int] = Header(None), x_force: str = Header("")):
        if kind not in KINDS or not SLOT_RE.match(slot):
            raise HTTPException(400, "Sauvegarde invalide")
        await game_or_404(gid)
        data = await request.body()
        if not data or len(data) > MAX_SAVE:
            raise HTTPException(413, "Sauvegarde vide ou trop grosse")
        cur = await saves.find_one({"game_id": gid, "kind": kind, "slot": slot}, {"_id": 0})
        # Conflit : un autre appareil a sauvegardé depuis que celui-ci a chargé la partie
        if cur and x_base_rev is not None and int(x_base_rev) != int(cur.get("rev", 0)) and x_force != "1":
            meta = {k: v for k, v in cur.items() if k not in ("path", "prev_path")}
            raise HTTPException(409, detail={"message": "Une sauvegarde plus récente existe sur un autre appareil", "server": meta})
        rev = int((cur or {}).get("rev", 0)) + 1
        res = await storage_put(f"{app_name}/arcade-saves/{gid}/{kind}-{slot}-{rev}.bin", data, "application/octet-stream")
        doc = {"game_id": gid, "kind": kind, "slot": slot, "rev": rev, "size": len(data), "path": res.get("path", ""),
               "prev_path": (cur or {}).get("path", ""), "engine": x_engine[:40], "core": x_core[:40],
               "core_version": x_core_version[:40], "device": x_device[:60], "updated_at": now_iso(),
               "created_at": (cur or {}).get("created_at", now_iso())}
        await saves.update_one({"game_id": gid, "kind": kind, "slot": slot}, {"$set": doc}, upsert=True)
        return {k: v for k, v in doc.items() if k not in ("path", "prev_path")}

    @r.get("/saves/{gid}/{kind}/{slot}")
    async def get_save(gid: str, kind: str, slot: str, previous: int = 0, _a=Depends(require_admin)):
        cur = await saves.find_one({"game_id": gid, "kind": kind, "slot": slot}, {"_id": 0})
        p = (cur or {}).get("prev_path" if previous else "path")
        if not p:
            raise HTTPException(404, "Aucune sauvegarde")
        data, _ = await storage_get(p)
        return Response(content=data, media_type="application/octet-stream",
                        headers={"X-Rev": str(cur.get("rev", 0)), "X-Core": cur.get("core", ""), "X-Core-Version": cur.get("core_version", ""),
                                 "Access-Control-Expose-Headers": "X-Rev, X-Core, X-Core-Version", "Cache-Control": "no-store"})

    @r.delete("/saves/{gid}/{kind}/{slot}")
    async def del_save(gid: str, kind: str, slot: str, _a=Depends(require_admin)):
        await saves.delete_one({"game_id": gid, "kind": kind, "slot": slot})
        return {"ok": True}

    return r
