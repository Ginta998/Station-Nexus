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
        it = await db.atelier_items.find_one({"share_token": token}, {"_id": 0, "title": 1, "content": 1, "image": 1, "kind": 1, "fields": 1})
        if not it:
            raise HTTPException(404, "Ce lien n'est plus actif")
        return it

    return r
