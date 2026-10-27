"""Atelier Nexus — espace de création privé (admin uniquement)."""
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

KINDS = {"note", "scene", "character", "place", "lore", "event", "document"}


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


class TaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    universe_id: Optional[str] = None
    item_id: Optional[str] = None
    due: str = ""
    priority: str = "normal"
    done: bool = False
    notes: str = ""


class ConfigIn(BaseModel):
    code: Optional[str] = None
    music_url: Optional[str] = None
    music_title: Optional[str] = None


def build_atelier_router(db, require_admin) -> APIRouter:
    r = APIRouter(prefix="/atelier", dependencies=[Depends(require_admin)])

    async def get_config():
        c = await db.atelier_config.find_one({"_id": "main"}, {"_id": 0})
        return c or {"code": "0874", "music_url": "", "music_title": ""}

    @r.get("/config")
    async def config():
        return await get_config()

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
        return {"universes": universes, "items": items, "tasks": tasks, "config": await get_config()}

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
