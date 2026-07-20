from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import Response, RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import base64
import logging
import re
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Stationexus API")
api_router = APIRouter(prefix="/api")

MAX_AUDIO_BYTES = 12 * 1024 * 1024


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------------- Models ----------------
class Episode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = ""
    url: Optional[str] = ""


class Chapter(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: Optional[str] = ""
    image: Optional[str] = ""  # data uri / url
    rich: bool = False          # content is sanitized HTML (WYSIWYG) vs plain text
    has_music: bool = False     # dedicated per-chapter reading music


class Embed(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    platform: str = "youtube"  # youtube | wattpad | other
    url: str = ""
    label: Optional[str] = ""


class Creation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    kanji: Optional[str] = ""
    category: str
    tagline: Optional[str] = ""
    synopsis: Optional[str] = ""
    poster: Optional[str] = ""
    accent: Optional[str] = ""
    bg_image: Optional[str] = ""
    bg_blur: int = 32
    bg_dim: float = 0.55
    gallery: List[str] = Field(default_factory=list)
    embeds: List[Embed] = Field(default_factory=list)
    launch_type: str = "info"  # reader | link | episodes | chapters | info
    launch_label: Optional[str] = "Lancer"
    launch_content: Optional[str] = ""
    launch_url: Optional[str] = ""
    buy_url: Optional[str] = ""
    chapter_display: str = "button"  # button | image — how chapters show on the detail page
    chapter_size: str = "md"         # sm | md | lg | xl — size of chapter/episode cards on the fiche
    button_size: str = "md"          # md | lg — size of the main action buttons
    episodes: List[Episode] = Field(default_factory=list)
    chapters: List[Chapter] = Field(default_factory=list)
    has_audio: bool = False
    has_reading_audio: bool = False
    has_poster: bool = False
    has_bg: bool = False
    coming_soon: bool = False
    order: int = 0
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class CreationInput(BaseModel):
    title: str
    kanji: Optional[str] = ""
    category: str
    tagline: Optional[str] = ""
    synopsis: Optional[str] = ""
    poster: Optional[str] = ""
    accent: Optional[str] = ""
    bg_image: Optional[str] = ""
    bg_blur: int = 32
    bg_dim: float = 0.55
    gallery: List[str] = Field(default_factory=list)
    embeds: List[Embed] = Field(default_factory=list)
    launch_type: str = "info"
    launch_label: Optional[str] = "Lancer"
    launch_content: Optional[str] = ""
    launch_url: Optional[str] = ""
    buy_url: Optional[str] = ""
    chapter_display: str = "button"
    chapter_size: str = "md"
    button_size: str = "md"
    episodes: List[Episode] = Field(default_factory=list)
    chapters: List[Chapter] = Field(default_factory=list)
    coming_soon: bool = False
    order: int = 0


class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    key: str
    label: str
    kanji: Optional[str] = ""
    order: int = 0


class CategoryInput(BaseModel):
    label: str
    kanji: Optional[str] = ""
    order: int = 0
    key: Optional[str] = None


class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    creation_id: str
    name: str
    text: str
    created_at: str = Field(default_factory=now_iso)


class CommentInput(BaseModel):
    creation_id: str
    name: str
    text: str


class Ambience(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    emoji: Optional[str] = "🎵"
    order: int = 0
    created_at: str = Field(default_factory=now_iso)


class AmbienceInput(BaseModel):
    title: str
    emoji: Optional[str] = "🎵"
    order: int = 0


class Subscriber(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    created_at: str = Field(default_factory=now_iso)


class SubscriberInput(BaseModel):
    email: str


class SiteSettings(BaseModel):
    name: str = "Brichel Louzala"
    bio: str = "Créateur d'histoires, d'univers et d'émotions. Bienvenue dans ma station."
    avatar: Optional[str] = ""
    mail: str = "Louzalabrichel@gmail.com"
    instagram: str = "Brichel_louzala"
    youtube: str = "Brichel Louzala"
    default_ambience_id: Optional[str] = ""
    default_theme: str = "tengoku"
    intro_type: str = "tengoku"   # animation key or "video"
    intro_has_video: bool = False
    intro_hidden: List[str] = Field(default_factory=list)


def slugify(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s or str(uuid.uuid4())[:8]


def _serve_image(data: Optional[str]):
    """Serve a stored image (data URI or plain URL) as raw bytes / redirect."""
    if not data:
        raise HTTPException(404, "Image introuvable")
    if data.startswith("data:"):
        try:
            header, b64 = data.split(",", 1)
            ct = header[5:].split(";")[0] or "image/png"
            return Response(content=base64.b64decode(b64), media_type=ct,
                            headers={"Cache-Control": "public, max-age=86400"})
        except Exception:
            raise HTTPException(404, "Image invalide")
    if data.startswith("http"):
        return RedirectResponse(data)
    raise HTTPException(404, "Image introuvable")


def _lighten(doc: dict, keep_gallery_chapters: bool = False) -> dict:
    """Strip heavy base64 fields, expose has_* flags. Used for list/detail responses."""
    doc["has_poster"] = bool(doc.get("poster"))
    doc["has_bg"] = bool(doc.get("bg_image"))
    doc["poster"] = ""
    doc["bg_image"] = ""
    if not keep_gallery_chapters:
        doc["gallery"] = []
        doc["chapters"] = []
    return doc


# ---------------- Creations ----------------
@api_router.get("/creations", response_model=List[Creation])
async def list_creations(category: Optional[str] = None):
    q = {"category": category} if category else {}
    docs = await db.creations.find(q, {"_id": 0}).sort("order", 1).to_list(1000)
    return [Creation(**_lighten(d)) for d in docs]


@api_router.get("/creations/{cid}", response_model=Creation)
async def get_creation(cid: str, media: bool = False):
    doc = await db.creations.find_one({"id": cid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Création introuvable")
    if media:
        doc["has_poster"] = bool(doc.get("poster"))
        doc["has_bg"] = bool(doc.get("bg_image"))
        return Creation(**doc)
    return Creation(**_lighten(doc, keep_gallery_chapters=True))


@api_router.get("/creations/{cid}/poster")
async def get_creation_poster(cid: str):
    doc = await db.creations.find_one({"id": cid}, {"_id": 0, "poster": 1})
    if not doc:
        raise HTTPException(404, "Création introuvable")
    return _serve_image(doc.get("poster"))


@api_router.get("/creations/{cid}/bg")
async def get_creation_bg(cid: str):
    doc = await db.creations.find_one({"id": cid}, {"_id": 0, "bg_image": 1})
    if not doc:
        raise HTTPException(404, "Création introuvable")
    return _serve_image(doc.get("bg_image"))


@api_router.post("/creations", response_model=Creation, status_code=201)
async def create_creation(payload: CreationInput):
    obj = Creation(**payload.model_dump())
    await db.creations.insert_one(obj.model_dump())
    return obj


@api_router.put("/creations/{cid}", response_model=Creation)
async def update_creation(cid: str, payload: CreationInput):
    if not await db.creations.find_one({"id": cid}):
        raise HTTPException(404, "Création introuvable")
    data = payload.model_dump()
    data["updated_at"] = now_iso()
    await db.creations.update_one({"id": cid}, {"$set": data})
    doc = await db.creations.find_one({"id": cid}, {"_id": 0})
    return Creation(**doc)


@api_router.delete("/creations/{cid}")
async def delete_creation(cid: str):
    res = await db.creations.delete_one({"id": cid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Création introuvable")
    await db.media.delete_many({"creation_id": cid})
    await db.reading_media.delete_many({"creation_id": cid})
    await db.chapter_media.delete_many({"creation_id": cid})
    await db.comments.delete_many({"creation_id": cid})
    return {"ok": True}


@api_router.post("/creations/{cid}/audio")
async def upload_audio(cid: str, file: UploadFile = File(...)):
    if not await db.creations.find_one({"id": cid}):
        raise HTTPException(404, "Création introuvable")
    data = await file.read()
    if len(data) > MAX_AUDIO_BYTES:
        raise HTTPException(413, "Fichier audio trop volumineux (max 12 Mo)")
    b64 = base64.b64encode(data).decode("utf-8")
    await db.media.update_one({"creation_id": cid},
        {"$set": {"creation_id": cid, "data": b64, "content_type": file.content_type or "audio/mpeg"}}, upsert=True)
    await db.creations.update_one({"id": cid}, {"$set": {"has_audio": True}})
    return {"ok": True}


@api_router.get("/creations/{cid}/audio")
async def stream_audio(cid: str):
    media = await db.media.find_one({"creation_id": cid}, {"_id": 0})
    if not media:
        raise HTTPException(404, "Aucune ambiance")
    return Response(content=base64.b64decode(media["data"]), media_type=media.get("content_type", "audio/mpeg"))


@api_router.delete("/creations/{cid}/audio")
async def delete_audio(cid: str):
    await db.media.delete_many({"creation_id": cid})
    await db.creations.update_one({"id": cid}, {"$set": {"has_audio": False}})
    return {"ok": True}


@api_router.post("/creations/{cid}/reading-audio")
async def upload_reading_audio(cid: str, file: UploadFile = File(...)):
    if not await db.creations.find_one({"id": cid}):
        raise HTTPException(404, "Création introuvable")
    data = await file.read()
    if len(data) > MAX_AUDIO_BYTES:
        raise HTTPException(413, "Fichier audio trop volumineux (max 12 Mo)")
    b64 = base64.b64encode(data).decode("utf-8")
    await db.reading_media.update_one({"creation_id": cid},
        {"$set": {"creation_id": cid, "data": b64, "content_type": file.content_type or "audio/mpeg"}}, upsert=True)
    await db.creations.update_one({"id": cid}, {"$set": {"has_reading_audio": True}})
    return {"ok": True}


@api_router.get("/creations/{cid}/reading-audio")
async def stream_reading_audio(cid: str):
    media = await db.reading_media.find_one({"creation_id": cid}, {"_id": 0})
    if not media:
        raise HTTPException(404, "Aucune musique de lecture")
    return Response(content=base64.b64decode(media["data"]), media_type=media.get("content_type", "audio/mpeg"))


@api_router.delete("/creations/{cid}/reading-audio")
async def delete_reading_audio(cid: str):
    await db.reading_media.delete_many({"creation_id": cid})
    await db.creations.update_one({"id": cid}, {"$set": {"has_reading_audio": False}})
    return {"ok": True}


# ---------------- Per-chapter reading music ----------------
async def _set_chapter_music(cid: str, chid: str, value: bool):
    cr = await db.creations.find_one({"id": cid})
    if not cr:
        raise HTTPException(404, "Création introuvable")
    chapters = cr.get("chapters", [])
    if not any((c.get("id") == chid) for c in chapters):
        raise HTTPException(404, "Chapitre introuvable")
    for c in chapters:
        if c.get("id") == chid:
            c["has_music"] = value
    await db.creations.update_one({"id": cid}, {"$set": {"chapters": chapters}})


@api_router.post("/creations/{cid}/chapters/{chid}/audio")
async def upload_chapter_audio(cid: str, chid: str, file: UploadFile = File(...)):
    data = await file.read()
    if len(data) > MAX_AUDIO_BYTES:
        raise HTTPException(413, "Fichier audio trop volumineux (max 12 Mo)")
    await _set_chapter_music(cid, chid, True)
    b64 = base64.b64encode(data).decode("utf-8")
    await db.chapter_media.update_one({"creation_id": cid, "chapter_id": chid},
        {"$set": {"creation_id": cid, "chapter_id": chid, "data": b64, "content_type": file.content_type or "audio/mpeg"}}, upsert=True)
    return {"ok": True}


@api_router.get("/creations/{cid}/chapters/{chid}/audio")
async def stream_chapter_audio(cid: str, chid: str):
    media = await db.chapter_media.find_one({"creation_id": cid, "chapter_id": chid}, {"_id": 0})
    if not media:
        raise HTTPException(404, "Aucune musique de chapitre")
    return Response(content=base64.b64decode(media["data"]), media_type=media.get("content_type", "audio/mpeg"))


@api_router.delete("/creations/{cid}/chapters/{chid}/audio")
async def delete_chapter_audio(cid: str, chid: str):
    await db.chapter_media.delete_many({"creation_id": cid, "chapter_id": chid})
    await _set_chapter_music(cid, chid, False)
    return {"ok": True}


# ---------------- Categories ----------------
@api_router.get("/categories", response_model=List[Category])
async def list_categories():
    docs = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(200)
    return [Category(**d) for d in docs]


@api_router.post("/categories", response_model=Category, status_code=201)
async def create_category(payload: CategoryInput):
    key = payload.key or slugify(payload.label)
    if await db.categories.find_one({"key": key}):
        key = f"{key}-{str(uuid.uuid4())[:4]}"
    obj = Category(key=key, label=payload.label, kanji=payload.kanji or "", order=payload.order)
    await db.categories.insert_one(obj.model_dump())
    return obj


@api_router.put("/categories/{cid}", response_model=Category)
async def update_category(cid: str, payload: CategoryInput):
    existing = await db.categories.find_one({"id": cid}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Catégorie introuvable")
    data = {"label": payload.label, "kanji": payload.kanji or "", "order": payload.order}
    await db.categories.update_one({"id": cid}, {"$set": data})
    doc = await db.categories.find_one({"id": cid}, {"_id": 0})
    return Category(**doc)


@api_router.delete("/categories/{cid}")
async def delete_category(cid: str):
    res = await db.categories.delete_one({"id": cid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Catégorie introuvable")
    return {"ok": True}


# ---------------- Comments ----------------
@api_router.get("/creations/{cid}/comments", response_model=List[Comment])
async def list_comments(cid: str):
    docs = await db.comments.find({"creation_id": cid}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Comment(**d) for d in docs]


@api_router.post("/comments", response_model=Comment, status_code=201)
async def create_comment(payload: CommentInput):
    if not payload.name.strip() or not payload.text.strip():
        raise HTTPException(400, "Nom et commentaire requis")
    obj = Comment(**payload.model_dump())
    await db.comments.insert_one(obj.model_dump())
    return obj


@api_router.delete("/comments/{cid}")
async def delete_comment(cid: str):
    res = await db.comments.delete_one({"id": cid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Commentaire introuvable")
    return {"ok": True}


# ---------------- Ambiences (app music) ----------------
@api_router.get("/ambiences", response_model=List[Ambience])
async def list_ambiences():
    docs = await db.ambiences.find({}, {"_id": 0}).sort("order", 1).to_list(200)
    return [Ambience(**d) for d in docs]


@api_router.post("/ambiences", response_model=Ambience, status_code=201)
async def create_ambience(payload: AmbienceInput):
    obj = Ambience(**payload.model_dump())
    await db.ambiences.insert_one(obj.model_dump())
    return obj


@api_router.put("/ambiences/{aid}", response_model=Ambience)
async def update_ambience(aid: str, payload: AmbienceInput):
    if not await db.ambiences.find_one({"id": aid}):
        raise HTTPException(404, "Ambiance introuvable")
    await db.ambiences.update_one({"id": aid}, {"$set": payload.model_dump()})
    doc = await db.ambiences.find_one({"id": aid}, {"_id": 0})
    return Ambience(**doc)


@api_router.post("/ambiences/{aid}/audio")
async def upload_ambience_audio(aid: str, file: UploadFile = File(...)):
    if not await db.ambiences.find_one({"id": aid}):
        raise HTTPException(404, "Ambiance introuvable")
    data = await file.read()
    if len(data) > MAX_AUDIO_BYTES:
        raise HTTPException(413, "Fichier audio trop volumineux (max 12 Mo)")
    b64 = base64.b64encode(data).decode("utf-8")
    await db.ambience_media.update_one({"ambience_id": aid},
        {"$set": {"ambience_id": aid, "data": b64, "content_type": file.content_type or "audio/mpeg"}}, upsert=True)
    return {"ok": True}


@api_router.get("/ambiences/{aid}/audio")
async def stream_ambience_audio(aid: str):
    media = await db.ambience_media.find_one({"ambience_id": aid}, {"_id": 0})
    if not media:
        raise HTTPException(404, "Aucun audio")
    return Response(content=base64.b64decode(media["data"]), media_type=media.get("content_type", "audio/mpeg"))


@api_router.delete("/ambiences/{aid}")
async def delete_ambience(aid: str):
    res = await db.ambiences.delete_one({"id": aid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Ambiance introuvable")
    await db.ambience_media.delete_many({"ambience_id": aid})
    return {"ok": True}


# ---------------- Subscribers ----------------
@api_router.get("/subscribers", response_model=List[Subscriber])
async def list_subscribers():
    docs = await db.subscribers.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)
    return [Subscriber(**d) for d in docs]


@api_router.post("/subscribers", response_model=Subscriber, status_code=201)
async def add_subscriber(payload: SubscriberInput):
    email = payload.email.strip().lower()
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise HTTPException(400, "Adresse email invalide")
    existing = await db.subscribers.find_one({"email": email}, {"_id": 0})
    if existing:
        return Subscriber(**existing)
    obj = Subscriber(email=email)
    await db.subscribers.insert_one(obj.model_dump())
    return obj


@api_router.delete("/subscribers/{sid}")
async def delete_subscriber(sid: str):
    await db.subscribers.delete_one({"id": sid})
    return {"ok": True}


# ---------------- Site settings ----------------
@api_router.get("/settings", response_model=SiteSettings)
async def get_settings():
    doc = await db.settings.find_one({"key": "site"}, {"_id": 0, "key": 0})
    if not doc:
        return SiteSettings()
    return SiteSettings(**doc)


@api_router.put("/settings", response_model=SiteSettings)
async def update_settings(payload: SiteSettings):
    data = payload.model_dump()
    data["key"] = "site"
    await db.settings.update_one({"key": "site"}, {"$set": data}, upsert=True)
    return payload


MAX_INTRO_BYTES = 10 * 1024 * 1024


@api_router.post("/intro/video")
async def upload_intro_video(file: UploadFile = File(...)):
    data = await file.read()
    if len(data) > MAX_INTRO_BYTES:
        raise HTTPException(413, "Vidéo trop volumineuse (max 10 Mo)")
    b64 = base64.b64encode(data).decode("utf-8")
    await db.intro_media.update_one({"key": "intro"},
        {"$set": {"key": "intro", "data": b64, "content_type": file.content_type or "video/mp4"}}, upsert=True)
    await db.settings.update_one({"key": "site"}, {"$set": {"intro_has_video": True}}, upsert=True)
    return {"ok": True}


@api_router.get("/intro/video")
async def stream_intro_video():
    media = await db.intro_media.find_one({"key": "intro"}, {"_id": 0})
    if not media:
        raise HTTPException(404, "Aucune vidéo d'intro")
    return Response(content=base64.b64decode(media["data"]), media_type=media.get("content_type", "video/mp4"))


@api_router.delete("/intro/video")
async def delete_intro_video():
    await db.intro_media.delete_many({"key": "intro"})
    await db.settings.update_one({"key": "site"}, {"$set": {"intro_has_video": False}}, upsert=True)
    return {"ok": True}


# ---------------- Seed ----------------
DEFAULT_CATEGORIES = [
    {"key": "livres", "label": "Livres", "kanji": "本", "order": 1},
    {"key": "films", "label": "Films", "kanji": "映", "order": 2},
    {"key": "series", "label": "Séries", "kanji": "劇", "order": 3},
    {"key": "dojo", "label": "Tengoku Dojo", "kanji": "道場", "order": 4},
    {"key": "avenir", "label": "À venir", "kanji": "来", "order": 5},
]

DEFAULT_CREATIONS = [
    {"title": "Born X Burn", "kanji": "焔", "category": "livres", "tagline": "Naître dans les flammes",
     "synopsis": "Un roman initiatique où la renaissance passe par le feu. Lisez les premiers chapitres gratuitement ou procurez-vous l'ouvrage complet.",
     "launch_type": "chapters", "launch_label": "Lire le chapitre 1", "buy_url": "https://example.com/born-x-burn", "order": 1,
     "chapters": [{"id": str(uuid.uuid4()), "title": "Chapitre 1 — Braise", "content": "La cendre retombait doucement sur la ville endormie. Kai ouvrit les yeux.\n\nLes flammes n'avaient rien laissé, sinon lui.", "image": ""}]},
    {"title": "Cosmic Bunny", "kanji": "宇", "category": "livres", "tagline": "Le lapin des étoiles",
     "synopsis": "Une saga en plusieurs épisodes suivant un lapin cosmique à travers les galaxies.",
     "launch_type": "episodes", "launch_label": "Voir les épisodes", "order": 2,
     "episodes": [{"id": str(uuid.uuid4()), "title": "Épisode 1 — Le Terrier", "description": "Le départ.", "url": ""},
                  {"id": str(uuid.uuid4()), "title": "Épisode 2 — La Comète", "description": "La rencontre.", "url": ""}]},
    {"title": "La Cité des Cieux", "kanji": "天", "category": "livres", "tagline": "Là où le ciel touche la terre",
     "synopsis": "Épopée feuilletonnée d'une cité suspendue entre les nuages.",
     "launch_type": "episodes", "launch_label": "Voir les épisodes", "order": 3,
     "episodes": [{"id": str(uuid.uuid4()), "title": "Épisode 1 — L'Ascension", "description": "", "url": ""},
                  {"id": str(uuid.uuid4()), "title": "Épisode 2 — Les Gardiens", "description": "", "url": ""}]},
    {"title": "Requiem District", "kanji": "鎮", "category": "livres", "tagline": "Le quartier des âmes",
     "synopsis": "Un thriller sombre au cœur d'un district oublié.",
     "launch_type": "reader", "launch_label": "Lire un extrait", "launch_content": "Extrait\n\nLes néons grésillaient au-dessus des flaques.", "order": 4},
    {"title": "Soulfreed", "kanji": "魂", "category": "livres", "tagline": "L'âme libérée",
     "synopsis": "Une quête de liberté intérieure.",
     "launch_type": "reader", "launch_label": "Lire un extrait", "launch_content": "Extrait\n\nElle respira pour la première fois.", "order": 5},
    {"title": "Blue Flower", "kanji": "蒼", "category": "films", "tagline": "La fleur bleue",
     "synopsis": "Un film poétique sur l'amour et la mémoire.", "launch_type": "link", "launch_label": "Lancer le film", "launch_url": "", "order": 1},
    {"title": "Liberty's Chroma : Zaina", "kanji": "彩", "category": "films", "tagline": "Les couleurs de la liberté",
     "synopsis": "Le premier volet d'une fresque visuelle éclatante.", "launch_type": "link", "launch_label": "Lancer le film", "launch_url": "", "order": 2},
    {"title": "Cher Père", "kanji": "父", "category": "films", "tagline": "Une lettre au silence",
     "synopsis": "Un drame intime sur la filiation.", "launch_type": "link", "launch_label": "Lancer le film", "launch_url": "", "order": 3},
    {"title": "Tengoku Dojo", "kanji": "道場", "category": "dojo", "tagline": "L'art de créer des histoires",
     "synopsis": "Un écosystème dédié à accompagner celles et ceux qui veulent créer des histoires. Ateliers, méthodes et inspiration.",
     "launch_type": "info", "launch_label": "Entrer dans le dojo", "order": 1},
    {"title": "Born X Burn II", "kanji": "焔", "category": "avenir", "tagline": "Le retour des flammes",
     "synopsis": "La suite tant attendue.", "launch_type": "info", "launch_label": "Bientôt", "coming_soon": True, "order": 1},
    {"title": "Liberty's Chroma II", "kanji": "彩", "category": "avenir", "tagline": "Nouvelles couleurs",
     "synopsis": "Le second chapitre de la fresque.", "launch_type": "info", "launch_label": "Bientôt", "coming_soon": True, "order": 2},
    {"title": "Katana Kid", "kanji": "刀", "category": "avenir", "tagline": "La lame du jeune héros",
     "synopsis": "Une nouvelle aventure.", "launch_type": "info", "launch_label": "Bientôt", "coming_soon": True, "order": 3},
    {"title": "S.A.M : Service Après Mort", "kanji": "死", "category": "avenir", "tagline": "Série",
     "synopsis": "Une série sur l'au-delà administratif.", "launch_type": "info", "launch_label": "Bientôt", "coming_soon": True, "order": 4},
]


async def ensure_seed():
    if await db.categories.count_documents({}) == 0:
        await db.categories.insert_many([Category(**c).model_dump() for c in DEFAULT_CATEGORIES])
        logger.info("Seeded categories")
    if await db.creations.count_documents({}) == 0:
        await db.creations.insert_many([Creation(**c).model_dump() for c in DEFAULT_CREATIONS])
        logger.info("Seeded creations")
    # idempotent migration: upgrade seeded books that gained chapters
    for c in DEFAULT_CREATIONS:
        if c.get("chapters"):
            existing = await db.creations.find_one({"title": c["title"]}, {"_id": 0})
            if existing and not existing.get("chapters"):
                await db.creations.update_one({"title": c["title"]}, {"$set": {
                    "chapters": c["chapters"], "launch_type": "chapters",
                    "launch_label": c.get("launch_label", "Lire"), "updated_at": now_iso()}})
                logger.info("Migrated %s to chapters", c["title"])


@api_router.post("/seed")
async def seed(force: bool = False):
    if force:
        await db.creations.delete_many({})
        await db.categories.delete_many({})
        await db.media.delete_many({})
    await ensure_seed()
    return {"ok": True}


app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True,
                   allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
                   allow_methods=["*"], allow_headers=["*"])
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    await ensure_seed()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
