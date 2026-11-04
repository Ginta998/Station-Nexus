import uuid
from datetime import datetime, timezone
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException


def build_themes_router(db, require_admin) -> APIRouter:
    r = APIRouter()
    col = db.themes

    @r.get("/themes")
    async def public_themes():
        docs = await col.find({}, {"_id": 0}).to_list(500)
        shown = [d for d in docs if d.get("enabled", True) and d.get("public", True)]
        hidden = [d["key"] for d in docs if not (d.get("enabled", True) and d.get("public", True))]
        return {"themes": shown, "hidden": hidden}

    @r.get("/admin/themes", dependencies=[Depends(require_admin)])
    async def all_themes():
        return await col.find({}, {"_id": 0}).to_list(500)

    @r.put("/admin/themes/{key}", dependencies=[Depends(require_admin)])
    async def save_theme(key: str, body: Dict[str, Any]):
        if not key or len(key) > 60:
            raise HTTPException(400, "Clé invalide")
        body.pop("_id", None)
        body["key"] = key
        body["updated_at"] = datetime.now(timezone.utc).isoformat()
        await col.update_one({"key": key}, {"$set": body}, upsert=True)
        return await col.find_one({"key": key}, {"_id": 0})

    @r.delete("/admin/themes/{key}", dependencies=[Depends(require_admin)])
    async def delete_theme(key: str):
        await col.delete_one({"key": key})
        return {"ok": True}

    @r.get("/share/{token}")
    async def shared_doc(token: str):
        it = await db.atelier_items.find_one({"share_token": token}, {"_id": 0, "title": 1, "content": 1, "image": 1, "kind": 1, "fields": 1, "share_mode": 1, "share_comments": 1})
        if not it:
            raise HTTPException(404, "Ce lien n'est plus actif")
        return it

    @r.post("/share/{token}/comments")
    async def shared_comment(token: str, body: Dict[str, Any]):
        it = await db.atelier_items.find_one({"share_token": token}, {"_id": 0, "share_mode": 1})
        if not it or it.get("share_mode") not in ("comment", "edit"):
            raise HTTPException(403, "Commentaires désactivés")
        text = str(body.get("text", "")).strip()[:2000]
        if not text:
            raise HTTPException(400, "Commentaire vide")
        c = {"id": uuid.uuid4().hex[:10], "name": str(body.get("name", "Invité")).strip()[:40] or "Invité", "text": text, "at": datetime.now(timezone.utc).isoformat()}
        await db.atelier_items.update_one({"share_token": token}, {"$push": {"share_comments": c}})
        return c

    @r.put("/share/{token}")
    async def shared_edit(token: str, body: Dict[str, Any]):
        it = await db.atelier_items.find_one({"share_token": token}, {"_id": 0})
        if not it or it.get("share_mode") != "edit":
            raise HTTPException(403, "Modification non autorisée")
        old = {k: it.get(k) for k in ("title", "content", "fields", "image")}
        await db.atelier_versions.insert_one({"id": str(uuid.uuid4()), "item_id": it["id"], "at": datetime.now(timezone.utc).isoformat(), "data": old})
        patch = {"content": str(body.get("content", it.get("content") or "")), "updated_at": datetime.now(timezone.utc).isoformat()}
        if body.get("title"):
            patch["title"] = str(body["title"])[:200]
        await db.atelier_items.update_one({"share_token": token}, {"$set": patch})
        return {"ok": True}

    return r
