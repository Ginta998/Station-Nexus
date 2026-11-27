"""Mises à jour de l'interface depuis GitHub, sans republier sur Emergent.

La branche `site` du dépôt contient les dernières versions construites de l'interface :
  manifest.json                      la liste des versions (la plus récente en premier)
  v/<version>/static/js/main.x.js    les fichiers de chaque version

Le serveur lit cette branche (dépôt public, ou privé avec GITHUB_TOKEN en lecture seule) et sert
les fichiers à la station. C'est l'administrateur qui choisit, dans les Réglages, la version en ligne.
Si rien n'est publié, ou si une version demande un serveur plus récent, la station garde la version
Emergent (le « socle »).
"""
import os
import re
import time
import mimetypes
from pathlib import Path
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

# Niveau du serveur : à augmenter quand le serveur gagne une fonction dont l'interface a besoin.
# Une version de l'interface qui demande un niveau plus élevé ne se lance pas (elle attend la mise à jour Emergent).
API_LEVEL = 2

REPO = os.environ.get("SITE_REPO", "Ginta998/Station-Nexus").strip()
BRANCH = os.environ.get("SITE_BRANCH", "site").strip()
CACHE_DIR = Path(os.environ.get("SITE_CACHE_DIR", "/tmp/nx-site"))
VERSION_RE = re.compile(r"^[A-Za-z0-9._-]{1,80}$")
PATH_RE = re.compile(r"^[A-Za-z0-9._/-]{1,200}$")
MANIFEST_TTL = 60
EXTRA_TYPES = {".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".otf": "font/otf",
               ".js": "application/javascript", ".css": "text/css", ".json": "application/json",
               ".svg": "image/svg+xml", ".webp": "image/webp", ".mp3": "audio/mpeg", ".wasm": "application/wasm"}

_manifest = {"at": 0.0, "data": None, "error": ""}


def _headers():
    tok = os.environ.get("GITHUB_TOKEN", "").strip()
    h = {"User-Agent": "station-nexus"}
    if tok:
        h["Authorization"] = f"token {tok}"
    return h


async def _raw(ref: str, path: str, timeout: float = 20) -> Optional[bytes]:
    url = f"https://raw.githubusercontent.com/{REPO}/{ref}/{path}"
    async with httpx.AsyncClient(timeout=timeout, headers=_headers(), follow_redirects=True) as c:
        r = await c.get(url)
    if r.status_code == 404:
        return None
    r.raise_for_status()
    return r.content


async def _head_sha() -> Optional[str]:
    """Le commit le plus récent de la branche : évite d'attendre le cache de GitHub (~5 min)."""
    try:
        async with httpx.AsyncClient(timeout=6, headers={**_headers(), "Accept": "application/vnd.github.sha"}) as c:
            r = await c.get(f"https://api.github.com/repos/{REPO}/commits/{BRANCH}")
        if r.status_code == 200 and re.fullmatch(r"[0-9a-f]{40}", r.text.strip()):
            return r.text.strip()
    except Exception:
        pass
    return None


async def load_manifest(force: bool = False):
    now = time.time()
    if not force and _manifest["data"] is not None and now - _manifest["at"] < MANIFEST_TTL:
        return _manifest["data"]
    try:
        import json
        sha = await _head_sha()
        raw = await _raw(sha or BRANCH, "manifest.json", timeout=8)
        data = json.loads(raw) if raw else {"versions": []}
        vs = [v for v in data.get("versions", []) if isinstance(v, dict) and VERSION_RE.match(str(v.get("version", "")))]
        _manifest.update(at=now, data={"versions": vs, "sha": sha or ""}, error="")
    except Exception as e:  # GitHub injoignable : on garde la dernière liste connue
        _manifest.update(at=now, error=str(e)[:200])
        if _manifest["data"] is None:
            _manifest["data"] = {"versions": [], "sha": ""}
    return _manifest["data"]


def _entry(v: dict, base: str):
    return {"version": v["version"], "built_at": v.get("built_at", ""), "base": base,
            "js": [p for p in v.get("js", []) if PATH_RE.match(p)], "css": [p for p in v.get("css", []) if PATH_RE.match(p)]}


class LiveSettingsIn(BaseModel):
    published: Optional[str] = None   # "" = revenir à la version Emergent
    auto: Optional[bool] = None


def build_live_router(db, require_admin, get_current_user) -> APIRouter:
    r = APIRouter()
    col = db.site_live

    async def settings():
        s = await col.find_one({"_id": "main"}, {"_id": 0}) or {}
        return {"published": s.get("published", ""), "auto": bool(s.get("auto", False)),
                "published_at": s.get("published_at", ""), "previous": s.get("previous", "")}

    def compatible(v):
        try:
            return int(v.get("requires_api", 1)) <= API_LEVEL
        except Exception:
            return False

    async def is_admin(authorization):
        if not authorization:
            return False
        try:
            u = await get_current_user(authorization)
            return bool(u.get("is_admin"))
        except Exception:
            return False

    @r.get("/site/live")
    async def live(test: str = "", authorization: Optional[str] = Header(None)):
        """Ce que le lanceur doit charger. Rien (null) = la version Emergent."""
        m = await load_manifest()
        vs = {v["version"]: v for v in m["versions"]}
        base = "/api/site/live-files/"
        out = {"api_level": API_LEVEL, "live": None, "test": None}
        if test and VERSION_RE.match(test) and await is_admin(authorization):
            v = vs.get(test)
            if v and compatible(v):
                out["test"] = _entry(v, f"{base}{v['version']}/")
        s = await settings()
        pick = None
        if s["auto"]:
            pick = next((v for v in m["versions"] if compatible(v)), None)
        elif s["published"]:
            pick = vs.get(s["published"])
            if pick and not compatible(pick):
                pick = None
        if pick:
            out["live"] = _entry(pick, f"{base}{pick['version']}/")
        return out

    @r.get("/site/live-files/{version}/{path:path}")
    async def live_file(version: str, path: str):
        if not VERSION_RE.match(version) or not PATH_RE.match(path) or ".." in path:
            raise HTTPException(400, "Chemin invalide")
        dest = CACHE_DIR / version / path
        if not dest.is_file():
            m = await load_manifest()
            if version not in {v["version"] for v in m["versions"]}:
                m = await load_manifest(force=True)
            ref = m.get("sha") or BRANCH
            data = await _raw(ref, f"v/{version}/{path}")
            if data is None and ref != BRANCH:
                data = await _raw(BRANCH, f"v/{version}/{path}")
            if data is None:
                raise HTTPException(404, "Fichier introuvable")
            dest.parent.mkdir(parents=True, exist_ok=True)
            tmp = dest.with_suffix(dest.suffix + ".part")
            tmp.write_bytes(data)
            tmp.replace(dest)
        ext = dest.suffix.lower()
        ct = EXTRA_TYPES.get(ext) or mimetypes.guess_type(str(dest))[0] or "application/octet-stream"
        return FileResponse(dest, media_type=ct, headers={"Cache-Control": "public, max-age=31536000, immutable"})

    @r.get("/site/live-admin")
    async def live_admin(_a=Depends(require_admin)):
        m = await load_manifest(force=True)
        return {"api_level": API_LEVEL, "repo": REPO, "branch": BRANCH, "error": _manifest["error"],
                "private": bool(os.environ.get("GITHUB_TOKEN", "").strip()),
                "settings": await settings(),
                "versions": [{"version": v["version"], "built_at": v.get("built_at", ""), "notes": v.get("notes", [])[:30],
                              "base_commit": v.get("base_commit", ""), "requires_api": v.get("requires_api", 1),
                              "compatible": compatible(v)} for v in m["versions"]]}

    @r.put("/site/live-admin")
    async def live_admin_set(body: LiveSettingsIn, _a=Depends(require_admin)):
        s = await settings()
        upd = {}
        if body.published is not None:
            if body.published:
                m = await load_manifest(force=True)
                v = next((x for x in m["versions"] if x["version"] == body.published), None)
                if not v:
                    raise HTTPException(404, "Version introuvable sur GitHub")
                if not compatible(v):
                    raise HTTPException(409, "Cette version demande une mise à jour du serveur sur Emergent")
            from datetime import datetime, timezone
            upd.update(published=body.published, previous=s["published"], published_at=datetime.now(timezone.utc).isoformat())
        if body.auto is not None:
            upd["auto"] = body.auto
        if upd:
            await col.update_one({"_id": "main"}, {"$set": upd}, upsert=True)
        return await settings()

    return r
