from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks, Header, Depends, Request
from fastapi.responses import Response, RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import base64
import logging
import re
import asyncio
import resend
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import httpx
import stripe
from pwdlib import PasswordHash


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Stationexus API")
api_router = APIRouter(prefix="/api")

MAX_AUDIO_BYTES = 12 * 1024 * 1024
MAX_VIDEO_BYTES = 200 * 1024 * 1024

# ---------------- Emergent Object Storage (video uploads) ----------------
OBJ_STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
OBJ_APP_NAME = "stationexus"
_storage_key = None


async def _storage_init(force=False):
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    async with httpx.AsyncClient(timeout=30) as hc:
        r = await hc.post(f"{OBJ_STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY})
        r.raise_for_status()
        _storage_key = r.json()["storage_key"]
    return _storage_key


async def _storage_put(path, data, content_type):
    key = await _storage_init()
    async with httpx.AsyncClient(timeout=600) as hc:
        r = await hc.put(f"{OBJ_STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type}, content=data)
        if r.status_code == 403:
            key = await _storage_init(force=True)
            r = await hc.put(f"{OBJ_STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type}, content=data)
        r.raise_for_status()
        return r.json()


async def _storage_get(path):
    key = await _storage_init()
    async with httpx.AsyncClient(timeout=120) as hc:
        r = await hc.get(f"{OBJ_STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key})
        if r.status_code == 403:
            key = await _storage_init(force=True)
            r = await hc.get(f"{OBJ_STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key})
        r.raise_for_status()
        return r.content, r.headers.get("Content-Type", "application/octet-stream")


RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
REPLY_TO_EMAIL = os.environ.get('REPLY_TO_EMAIL')
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


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
    locked: bool = False        # computed: chapter requires purchase/subscription (content stripped)


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
    launch_type: str = "info"  # reader | link | film | episodes | chapters | info
    launch_label: Optional[str] = "Lancer"
    launch_content: Optional[str] = ""
    launch_url: Optional[str] = ""
    film_url: Optional[str] = ""          # main film link (YouTube/Vimeo/Dailymotion/embed/direct .mp4)
    trailer_url: Optional[str] = ""       # trailer link
    has_film: bool = False                # an uploaded main film exists in object storage
    has_trailer: bool = False             # an uploaded trailer exists in object storage
    buy_url: Optional[str] = ""
    chapter_display: str = "button"  # button | image — how chapters show on the detail page
    chapter_size: str = "md"         # sm | md | lg | xl — size of chapter/episode cards on the fiche
    button_size: str = "md"          # md | lg — size of the main action buttons
    episodes: List[Episode] = Field(default_factory=list)
    chapters: List[Chapter] = Field(default_factory=list)
    chapters_count: int = 0
    has_audio: bool = False
    has_reading_audio: bool = False
    has_poster: bool = False
    has_bg: bool = False
    coming_soon: bool = False
    release_month: Optional[str] = ""   # French month name or ""
    release_year: Optional[str] = ""    # e.g. "2026" or ""
    order: int = 0
    is_paid: bool = False               # monetization: requires purchase or membership
    price_eur: float = 0.0              # unit price in euros
    free_chapters: int = 0              # number of first chapters readable for free (chapters launch_type)
    status: str = ""                    # "en_cours" | "a_venir" | "termine" | ""
    intention_enabled: bool = False
    intention_title: str = "Intentions de l'auteur"
    intention_text: str = ""
    intention_images: List[str] = Field(default_factory=list)  # base64 making-of images
    intention_file_id: str = ""          # media_assets id of a downloadable dossier
    intention_file_name: str = ""
    has_intention: bool = False          # computed for list responses
    locked: bool = False                # computed for the requesting user: no access to paid content
    owned: bool = False                 # computed: current user owns this creation (unit purchase)
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
    film_url: Optional[str] = ""
    trailer_url: Optional[str] = ""
    buy_url: Optional[str] = ""
    chapter_display: str = "button"
    chapter_size: str = "md"
    button_size: str = "md"
    episodes: List[Episode] = Field(default_factory=list)
    chapters: List[Chapter] = Field(default_factory=list)
    coming_soon: bool = False
    release_month: Optional[str] = ""
    release_year: Optional[str] = ""
    order: int = 0
    is_paid: bool = False
    price_eur: float = 0.0
    free_chapters: int = 0
    status: str = ""
    intention_enabled: bool = False
    intention_title: str = "Intentions de l'auteur"
    intention_text: str = ""
    intention_images: List[str] = Field(default_factory=list)
    intention_file_id: str = ""
    intention_file_name: str = ""


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


class Profile(BaseModel):
    id: str
    name: str
    avatar: Optional[str] = ""   # preset avatar url or base64 data uri
    email: Optional[str] = ""
    instagram: Optional[str] = ""
    account_id: Optional[str] = ""   # linked user account (for subscription tier display)
    hide_tier: bool = False          # hide subscription tier on public profile
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)
    tier_id: Optional[str] = ""      # computed: active membership tier
    tier_name: Optional[str] = ""    # computed


class ProfileInput(BaseModel):
    id: str
    name: str
    avatar: Optional[str] = ""
    email: Optional[str] = ""
    instagram: Optional[str] = ""
    account_id: Optional[str] = ""
    hide_tier: Optional[bool] = None


class Announcement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    text: str
    creation_id: Optional[str] = ""
    active: bool = True
    created_at: str = Field(default_factory=now_iso)


class AnnouncementInput(BaseModel):
    title: str
    text: str
    creation_id: Optional[str] = ""
    notify_email: bool = False


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
    welcome_messages: List[str] = Field(default_factory=lambda: [
        "Bon retour, {name} !",
        "Content de te revoir, {name}",
        "Amuse-toi bien, {name} !",
        "Ravi de te retrouver, {name}",
        "Prêt·e pour une nouvelle aventure, {name} ?",
    ])
    cosmic_bunny_enabled: bool = True
    cosmic_bunny_image: Optional[str] = ""
    membership_enabled: bool = False
    membership_price_eur: float = 5.0
    membership_title: str = "Soutien Nexus"
    membership_perks: List[str] = Field(default_factory=lambda: [
        "Accès à tout le catalogue payant",
        "Nouveaux chapitres en avant-première",
        "Soutiens directement le créateur",
    ])
    membership_tiers: List[dict] = Field(default_factory=lambda: [
        {"id": "soutien", "name": "Soutien", "price_eur": 5.0, "perks": ["Accès à tout le catalogue payant", "Tu soutiens la station 🚀"]},
        {"id": "mecene", "name": "Mécène", "price_eur": 10.0, "perks": ["Tous les avantages Soutien", "Avantages exclusifs (à venir)"]},
        {"id": "legende", "name": "Légende", "price_eur": 15.0, "perks": ["Tous les avantages Mécène", "Ton nom au générique (à venir)"]},
    ])
    membership_page_title: str = "L'abonnement Nexus — soutiens la station"
    membership_page_body: str = (
        "Station Nexus, c'est mon univers de créations — livres, films et séries — que je façonne avec passion.\n\n"
        "En t'abonnant, tu débloques l'accès à tout le catalogue payant ET tu soutiens directement le créateur : "
        "chaque abonnement finance les prochaines œuvres, les nouveaux chapitres et l'amélioration de la station.\n\n"
        "Choisis le palier qui te ressemble. Tu peux résilier à tout moment."
    )
    about_title: str = "À propos de Station Nexus"
    about_body: str = (
        "Station Nexus est né d'une envie simple : réunir tout mon univers créatif — livres, films et séries — dans un seul endroit vivant, à mon image.\n\n"
        "Ma vision : offrir une expérience immersive, cinématographique et personnelle, où chaque création a sa place et où les lecteurs deviennent des voyageurs.\n\n"
        "L'objectif : construire, œuvre après œuvre, un véritable univers connecté — et le faire grandir grâce au soutien de la communauté."
    )
    about_hero_image: str = "https://images.unsplash.com/photo-1677926405168-fa86268b7295?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600"
    creator_title: str = "Le créateur"
    creator_name: str = "Le créateur de Station Nexus"
    creator_body: str = (
        "Derrière Station Nexus, il y a une personne passionnée par les histoires et les mondes imaginaires.\n\n"
        "Je crée des livres, des films et des séries pour partager cet univers avec toi. Chaque œuvre est une pièce d'un puzzle plus grand.\n\n"
        "Ton soutien me permet de continuer à créer, librement et sans compromis. Merci d'être là. 🚀"
    )
    creator_image: str = "https://images.unsplash.com/photo-1584462746497-276f4aeb9fca?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    about_pillars: List[Dict[str, str]] = Field(default_factory=lambda: [
        {"title": "Des univers écrits", "text": "Livres et séries qui t'embarquent chapitre après chapitre."},
        {"title": "Une âme cinématique", "text": "Films, bandes-annonces et une ambiance immersive partout."},
        {"title": "Porté par la communauté", "text": "Chaque soutien fait grandir la station, œuvre après œuvre."},
    ])
    cosmic_bunny_tips: Dict[str, List[Dict[str, str]]] = Field(default_factory=lambda: {
        "home": [
            {"text": "Coucou toi ! Moi c'est Cosmic Bunny 🐰, ta copilote de l'espace. Je te fais le tour du vaisseau ?", "button_label": "Personnaliser la station ⚙️", "button_target": "/parametres"},
            {"text": "Le bouton Aa en haut agrandit le texte. Fini de loucher comme un ninja myope !"},
            {"text": "L'icône son 🔊 coupe ou remet la musique. Pratique quand mamie t'appelle. 😅"},
            {"text": "Clique sur une affiche pour ouvrir une création. Promis, ça mord pas (moi non plus)."},
        ],
        "detail": [
            {"text": "Le gros bouton LANCER démarre l'aventure. Accroche ta ceinture ! 🚀"},
            {"text": "Le petit cœur ❤️ ajoute la fiche à tes Favoris. Collectionne-les comme des cartes rares."},
            {"text": "Tu peux Partager la fiche à tes potes. Un peu de pub pour moi, hein ? 😏"},
        ],
        "reader": [
            {"text": "Mode lecture activé ! Le bouton Aa règle la taille et le confort du texte. 👓"},
            {"text": "L'icône musique lance une ambiance. Immersion garantie, mouchoirs non fournis. 🥲"},
            {"text": "Ta progression se sauvegarde toute seule. Reviens quand tu veux, je garde ta page au chaud !"},
        ],
        "settings": [
            {"text": "Ici tu personnalises TOUT : thèmes, couleurs, sons… Éclate-toi ! 🎨"},
            {"text": "Plus de 13 thèmes t'attendent. Trouve celui qui te ressemble (le rose te va à ravir)."},
            {"text": "Tu me trouves bavarde ? Tu peux régler mes conseils ou m'éteindre juste ici. Sans rancune ! 🙈"},
        ],
        "members": [{"text": "Voici la communauté ! Crée ton profil pour rejoindre la bande. 🎉", "button_label": "Voir les membres 👥", "button_target": "/membres"}],
        "novelties": [{"text": "Toutes les dernières sorties sont ici. Fraîches du jour ! 🍡"}],
        "contact": [{"text": "Envie de papoter avec le créateur ? C'est par ici. Sois adorable. 😇"}],
        "tutorial": [{"text": "Le grand guide complet est là si tu veux tout savoir. Moi je résume, lui il raconte sa vie !"}],
        "bunny_story": [
            {"text": "Héhé, ça c'est MON histoire à moi ! *vrooom* je débarque en moto 🏍️"},
            {"text": "Bienvenue dans mon aventure à travers les mondes hostiles. Accroche-toi, ça secoue !"},
            {"text": "Lance la fiche pour me suivre. Et si tu vois des ennuis… c'est normal, moi je prends la fuite ! 😅"},
        ],
    })


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
    doc["chapters_count"] = len(doc.get("chapters") or [])
    doc["has_intention"] = bool(doc.get("intention_enabled") and (doc.get("intention_text") or doc.get("intention_images") or doc.get("intention_file_id")))
    doc["poster"] = ""
    doc["bg_image"] = ""
    if not keep_gallery_chapters:
        doc["gallery"] = []
        doc["chapters"] = []
        doc["intention_images"] = []
        doc["intention_text"] = ""
    return doc


# ---------------- Monetization helpers ----------------
async def _optional_uid(authorization: Optional[str]):
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    try:
        payload = jwt.decode(authorization.split(" ", 1)[1], os.environ['JWT_SECRET'], algorithms=["HS256"])
        return payload.get("sub")
    except Exception:
        return None


async def _membership_active(uid: Optional[str]) -> bool:
    if not uid:
        return False
    m = await db.memberships.find_one({"user_id": uid, "status": "active"}, {"_id": 0})
    if not m:
        return False
    cpe = m.get("current_period_end")
    if cpe:
        try:
            if datetime.fromisoformat(cpe) < datetime.now(timezone.utc):
                return False
        except Exception:
            pass
    return True


async def _user_owns(uid: Optional[str], cid: str) -> bool:
    if not uid:
        return False
    return bool(await db.purchases.find_one({"user_id": uid, "creation_id": cid}))


async def _user_has_access(uid: Optional[str], doc: dict) -> bool:
    """Full access to a creation's paid content."""
    if not doc.get("is_paid"):
        return True
    if not uid:
        return False
    if await _user_owns(uid, doc["id"]):
        return True
    return await _membership_active(uid)


def _gate_creation(doc: dict, has_access: bool, owned: bool) -> dict:
    """Strip locked chapter content and flag the creation for the frontend paywall."""
    doc["owned"] = owned
    is_paid = bool(doc.get("is_paid"))
    if not is_paid or has_access:
        doc["locked"] = False
        for ch in (doc.get("chapters") or []):
            ch["locked"] = False
        return doc
    free_n = int(doc.get("free_chapters") or 0)
    chapters = doc.get("chapters") or []
    for i, ch in enumerate(chapters):
        if i < free_n:
            ch["locked"] = False
        else:
            ch["locked"] = True
            ch["content"] = ""
            ch["image"] = ""
    # Film/reader creations without free chapters are fully locked
    doc["locked"] = True
    if doc.get("launch_type") == "chapters" and free_n > 0:
        doc["locked"] = False  # some chapters are readable; per-chapter lock applies
    return doc


# ---------------- Creations ----------------
@api_router.get("/creations", response_model=List[Creation])
async def list_creations(category: Optional[str] = None):
    q = {"category": category} if category else {}
    docs = await db.creations.find(q, {"_id": 0}).sort("order", 1).to_list(1000)
    return [Creation(**_lighten(d)) for d in docs]


@api_router.get("/creations/{cid}", response_model=Creation)
async def get_creation(cid: str, media: bool = False, authorization: Optional[str] = Header(None)):
    doc = await db.creations.find_one({"id": cid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Création introuvable")
    # Resolve viewer entitlement (optional auth) for paywall gating
    uid = await _optional_uid(authorization)
    has_access = await _user_has_access(uid, doc)
    owned = await _user_owns(uid, cid)
    if media:
        doc["has_poster"] = bool(doc.get("poster"))
        doc["has_bg"] = bool(doc.get("bg_image"))
        doc["chapters_count"] = len(doc.get("chapters") or [])
        doc = _gate_creation(doc, has_access, owned)
        return Creation(**doc)
    doc = _gate_creation(_lighten(doc, keep_gallery_chapters=True), has_access, owned)
    return Creation(**doc)


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
    await db.media_assets.delete_many({"creation_id": cid})
    await db.film_media.delete_many({"creation_id": cid})
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


@api_router.post("/creations/{cid}/video")
async def upload_video(cid: str, kind: str = Form("film"), file: UploadFile = File(...)):
    if kind not in ("film", "trailer"):
        raise HTTPException(400, "Type de vidéo invalide")
    if not await db.creations.find_one({"id": cid}):
        raise HTTPException(404, "Création introuvable")
    data = await file.read()
    if len(data) > MAX_VIDEO_BYTES:
        raise HTTPException(413, "Vidéo trop volumineuse (max 200 Mo). Utilise plutôt un lien.")
    ext = (file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "mp4").lower()
    path = f"{OBJ_APP_NAME}/videos/{cid}/{kind}-{uuid.uuid4()}.{ext}"
    ct = file.content_type or "video/mp4"
    result = await _storage_put(path, data, ct)
    await db.film_media.update_one({"creation_id": cid, "kind": kind},
        {"$set": {"creation_id": cid, "kind": kind, "storage_path": result["path"], "content_type": ct}}, upsert=True)
    field = "has_film" if kind == "film" else "has_trailer"
    await db.creations.update_one({"id": cid}, {"$set": {field: True, "updated_at": now_iso()}})
    return {"ok": True}


@api_router.get("/creations/{cid}/video")
async def stream_video(cid: str, request: Request, kind: str = "film"):
    rec = await db.film_media.find_one({"creation_id": cid, "kind": kind}, {"_id": 0})
    if not rec:
        raise HTTPException(404, "Aucune vidéo")
    content, ct = await _storage_get(rec["storage_path"])
    ct = rec.get("content_type", ct)
    total = len(content)
    range_header = request.headers.get("range")
    if range_header:
        m = re.match(r"bytes=(\d+)-(\d*)", range_header)
        if m:
            start = int(m.group(1))
            end = int(m.group(2)) if m.group(2) else total - 1
            end = min(end, total - 1)
            chunk = content[start:end + 1]
            headers = {"Content-Range": f"bytes {start}-{end}/{total}", "Accept-Ranges": "bytes", "Content-Length": str(len(chunk))}
            return Response(content=chunk, status_code=206, media_type=ct, headers=headers)
    return Response(content=content, media_type=ct, headers={"Accept-Ranges": "bytes"})


@api_router.delete("/creations/{cid}/video")
async def delete_video(cid: str, kind: str = "film"):
    await db.film_media.delete_many({"creation_id": cid, "kind": kind})
    field = "has_film" if kind == "film" else "has_trailer"
    await db.creations.update_one({"id": cid}, {"$set": {field: False}})
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


# ---------------- Inline media assets (images + music cues placed in chapters) ----------------
@api_router.post("/creations/{cid}/assets")
async def upload_asset(cid: str, file: UploadFile = File(...), kind: str = Form("image"), name: str = Form("")):
    data = await file.read()
    if len(data) > MAX_AUDIO_BYTES:
        raise HTTPException(413, "Fichier trop volumineux (max 12 Mo)")
    aid = str(uuid.uuid4())
    b64 = base64.b64encode(data).decode("utf-8")
    default_ct = "image/jpeg" if kind == "image" else "audio/mpeg"
    doc = {"id": aid, "creation_id": cid, "kind": kind, "name": name or file.filename or "media",
           "content_type": file.content_type or default_ct, "data": b64, "created_at": now_iso()}
    await db.media_assets.insert_one(doc)
    return {"id": aid, "kind": kind, "name": doc["name"], "content_type": doc["content_type"]}


@api_router.get("/creations/{cid}/assets")
async def list_assets(cid: str):
    cur = db.media_assets.find({"creation_id": cid}, {"_id": 0, "data": 0}).sort("created_at", 1)
    return [a async for a in cur]


@api_router.get("/assets/{aid}")
async def get_asset(aid: str, dl: int = 0):
    a = await db.media_assets.find_one({"id": aid}, {"_id": 0})
    if not a:
        raise HTTPException(404, "Média introuvable")
    headers = {"Cache-Control": "public, max-age=31536000, immutable"}
    if dl:
        safe = (a.get("name") or "dossier").replace('"', "")
        headers["Content-Disposition"] = f'attachment; filename="{safe}"'
    return Response(content=base64.b64decode(a["data"]), media_type=a.get("content_type", "application/octet-stream"),
                    headers=headers)


@api_router.delete("/assets/{aid}")
async def delete_asset(aid: str):
    await db.media_assets.delete_one({"id": aid})
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


# ---------------- Email (Resend) ----------------
def _announcement_email_html(title: str, text: str, link: Optional[str]) -> str:
    btn = ""
    if link:
        btn = (f'<tr><td style="padding-top:20px"><a href="{link}" '
               'style="background:#e60012;color:#fff;text-decoration:none;padding:12px 24px;'
               'border-radius:6px;font-weight:bold;display:inline-block">Découvrir</a></td></tr>')
    return (
        '<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 0">'
        '<tr><td align="center">'
        '<table width="480" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:10px;padding:32px;font-family:Arial,Helvetica,sans-serif">'
        '<tr><td style="color:#e60012;font-size:22px;font-weight:bold;letter-spacing:2px">STATIONEXUS 天</td></tr>'
        f'<tr><td style="color:#ffffff;font-size:20px;font-weight:bold;padding-top:18px">{title}</td></tr>'
        f'<tr><td style="color:#c8c8c8;font-size:15px;line-height:1.6;padding-top:10px">{text}</td></tr>'
        f'{btn}'
        '<tr><td style="color:#666;font-size:12px;padding-top:28px;border-top:1px solid #2a2a2a;margin-top:20px">'
        'Tu reçois cet email car tu es abonné·e à Stationexus.</td></tr>'
        '</table></td></tr></table>'
    )


async def _broadcast_email(subject: str, html: str):
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY manquant — email non envoyé")
        return
    subs = await db.subscribers.find({}, {"_id": 0, "email": 1}).to_list(10000)
    sent = 0
    for s in subs:
        params = {"from": SENDER_EMAIL, "to": [s["email"]], "subject": subject, "html": html}
        if REPLY_TO_EMAIL:
            params["reply_to"] = REPLY_TO_EMAIL
        try:
            await asyncio.to_thread(resend.Emails.send, params)
            sent += 1
        except Exception as e:
            logger.error("Echec envoi email à %s: %s", s.get("email"), e)
    logger.info("Broadcast email '%s' envoyé à %d/%d abonnés", subject, sent, len(subs))


@api_router.get("/email/status")
async def email_status():
    return {"configured": bool(RESEND_API_KEY), "sender": SENDER_EMAIL if RESEND_API_KEY else ""}


# ---------------- Profiles (visitor social profiles) ----------------
@api_router.post("/profiles", response_model=Profile)
async def upsert_profile(payload: ProfileInput):
    existing = await db.profiles.find_one({"id": payload.id}, {"_id": 0})
    data = payload.model_dump()
    data["updated_at"] = now_iso()
    # don't overwrite an existing account link with an empty value (logged-out save)
    if not data.get("account_id"):
        data.pop("account_id", None)
    # only patch hide_tier when explicitly provided
    if data.get("hide_tier") is None:
        data.pop("hide_tier", None)
    if existing:
        await db.profiles.update_one({"id": payload.id}, {"$set": data})
    else:
        data["created_at"] = now_iso()
        await db.profiles.insert_one(dict(data))
    if payload.email:
        email = payload.email.strip().lower()
        if re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
            if not await db.subscribers.find_one({"email": email}):
                await db.subscribers.insert_one(Subscriber(email=email).model_dump())
    doc = await db.profiles.find_one({"id": payload.id}, {"_id": 0})
    return Profile(**doc)


@api_router.get("/profiles", response_model=List[Profile])
async def list_profiles():
    docs = await db.profiles.find({}, {"_id": 0}).sort("updated_at", -1).to_list(5000)
    s = await db.settings.find_one({"key": "site"}, {"_id": 0}) or {}
    tier_names = {t.get("id"): t.get("name") for t in (s.get("membership_tiers") or [])}
    now = datetime.now(timezone.utc)
    mems = {}
    async for m in db.memberships.find({"status": "active"}, {"_id": 0, "user_id": 1, "tier_id": 1, "current_period_end": 1}):
        cpe = m.get("current_period_end")
        if cpe:
            try:
                if datetime.fromisoformat(cpe) < now:
                    continue
            except Exception:
                pass
        mems[m.get("user_id")] = m.get("tier_id")
    out = []
    for d in docs:
        p = Profile(**d)
        aid = d.get("account_id")
        if aid and not d.get("hide_tier") and aid in mems:
            p.tier_id = mems[aid] or ""
            p.tier_name = tier_names.get(p.tier_id, "") or ""
        out.append(p)
    return out


@api_router.get("/profiles/{pid}", response_model=Profile)
async def get_profile(pid: str):
    doc = await db.profiles.find_one({"id": pid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Profil introuvable")
    return Profile(**doc)


@api_router.delete("/profiles/{pid}")
async def delete_profile(pid: str):
    res = await db.profiles.delete_one({"id": pid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Profil introuvable")
    return {"ok": True}


# ---------------- Announcements (creator → visitors) ----------------
@api_router.get("/announcements", response_model=List[Announcement])
async def list_announcements():
    docs = await db.announcements.find({"active": True}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [Announcement(**d) for d in docs]


@api_router.post("/announcements", response_model=Announcement, status_code=201)
async def create_announcement(payload: AnnouncementInput, background_tasks: BackgroundTasks):
    if not payload.title.strip() or not payload.text.strip():
        raise HTTPException(400, "Titre et message requis")
    obj = Announcement(**payload.model_dump(exclude={"notify_email"}))
    await db.announcements.insert_one(obj.model_dump())
    if payload.notify_email:
        link = ""
        if obj.creation_id:
            base = os.environ.get('PUBLIC_APP_URL', '').rstrip('/')
            if base:
                link = f"{base}/oeuvre/{obj.creation_id}"
        html = _announcement_email_html(obj.title, obj.text, link or None)
        background_tasks.add_task(_broadcast_email, f"Stationexus — {obj.title}", html)
    return obj


@api_router.delete("/announcements/{aid}")
async def delete_announcement(aid: str):
    res = await db.announcements.delete_one({"id": aid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Annonce introuvable")
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


# ==================== AUTH (comptes visiteurs) ====================
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = "HS256"
TOKEN_DAYS = 60
EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
pwd = PasswordHash.recommended()


class RegisterInput(BaseModel):
    email: str
    password: str
    name: Optional[str] = None


class LoginInput(BaseModel):
    email: str
    password: str


class GoogleSessionInput(BaseModel):
    session_id: str


class SyncInput(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    favorites: Optional[List[str]] = None
    preferences: Optional[Dict] = None


class ClaimAdminInput(BaseModel):
    pin: str


def _mint_token(uid: str, email: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": uid, "email": email, "iat": int(now.timestamp()),
               "exp": int((now + timedelta(days=TOKEN_DAYS)).timestamp())}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def _public_user(u: dict) -> dict:
    return {"id": u.get("id"), "email": u.get("email"), "name": u.get("name"),
            "avatar": u.get("avatar"), "favorites": u.get("favorites", []),
            "preferences": u.get("preferences", {}), "is_admin": bool(u.get("is_admin", False))}


async def _subscribe_email(email: str):
    if email and not await db.subscribers.find_one({"email": email}):
        await db.subscribers.insert_one(Subscriber(email=email).model_dump())


async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Non authentifié")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        raise HTTPException(401, "Session invalide")
    u = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not u:
        raise HTTPException(401, "Utilisateur introuvable")
    return u


@api_router.post("/auth/register")
async def auth_register(data: RegisterInput):
    email = data.email.strip().lower()
    if not email or not data.password:
        raise HTTPException(400, "Email et mot de passe requis")
    existing = await db.users.find_one({"email": email})
    if existing and existing.get("password_hash"):
        raise HTTPException(409, "Cet email a déjà un compte")
    now = datetime.now(timezone.utc).isoformat()
    if existing:
        await db.users.update_one({"email": email}, {"$set": {
            "name": data.name or existing.get("name"), "password_hash": pwd.hash(data.password), "updated_at": now}})
        user = await db.users.find_one({"email": email}, {"_id": 0})
    else:
        user = {"id": str(uuid.uuid4()), "email": email, "name": data.name or email.split("@")[0],
                "avatar": None, "password_hash": pwd.hash(data.password), "favorites": [],
                "preferences": {}, "is_admin": False, "created_at": now, "updated_at": now}
        await db.users.insert_one(user)
        user = await db.users.find_one({"email": email}, {"_id": 0})
    await _subscribe_email(email)
    return {"token": _mint_token(user["id"], email), "user": _public_user(user)}


@api_router.post("/auth/login")
async def auth_login(data: LoginInput):
    email = data.email.strip().lower()
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not pwd.verify(data.password, user["password_hash"]):
        raise HTTPException(401, "Email ou mot de passe incorrect")
    return {"token": _mint_token(user["id"], email), "user": _public_user(user)}


@api_router.post("/auth/google/session")
async def auth_google_session(data: GoogleSessionInput):
    async with httpx.AsyncClient(timeout=15) as hc:
        r = await hc.get(EMERGENT_SESSION_URL, headers={"X-Session-ID": data.session_id})
    if r.status_code != 200:
        raise HTTPException(401, "Connexion Google échouée")
    p = r.json()
    email = (p.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(401, "Email Google indisponible")
    now = datetime.now(timezone.utc).isoformat()
    user = await db.users.find_one({"email": email})
    if user:
        await db.users.update_one({"email": email}, {"$set": {
            "name": user.get("name") or p.get("name"),
            "avatar": user.get("avatar") or p.get("picture"),
            "google_sub": p.get("id"), "updated_at": now}})
    else:
        user = {"id": str(uuid.uuid4()), "email": email, "name": p.get("name") or email.split("@")[0],
                "avatar": p.get("picture"), "google_sub": p.get("id"), "favorites": [],
                "preferences": {}, "is_admin": False, "created_at": now, "updated_at": now}
        await db.users.insert_one(user)
    user = await db.users.find_one({"email": email}, {"_id": 0})
    await _subscribe_email(email)
    return {"token": _mint_token(user["id"], email), "user": _public_user(user)}


@api_router.get("/auth/me")
async def auth_me(user=Depends(get_current_user)):
    return {"user": _public_user(user)}


@api_router.put("/auth/sync")
async def auth_sync(data: SyncInput, user=Depends(get_current_user)):
    patch = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if data.name is not None:
        patch["name"] = data.name
    if data.avatar is not None:
        patch["avatar"] = data.avatar
    if data.favorites is not None:
        patch["favorites"] = data.favorites
    if data.preferences is not None:
        patch["preferences"] = data.preferences
    await db.users.update_one({"id": user["id"]}, {"$set": patch})
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return {"user": _public_user(u)}


@api_router.post("/auth/claim-admin")
async def auth_claim_admin(data: ClaimAdminInput, user=Depends(get_current_user)):
    s = await db.settings.find_one({"key": "site"}, {"_id": 0})
    admin_pin = (s or {}).get("admin_pin") or "1234"
    if data.pin != admin_pin:
        raise HTTPException(403, "Code PIN incorrect")
    await db.users.update_one({"id": user["id"]}, {"$set": {"is_admin": True}})
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return {"user": _public_user(u)}


async def get_admin_user(user=Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(403, "Réservé à l'administrateur")
    return user


@api_router.get("/admin/revenue")
async def admin_revenue(user=Depends(get_admin_user)):
    """Revenue dashboard computed purely from the DB: members, their subscriptions and purchases. No Stripe calls."""
    s = await db.settings.find_one({"key": "site"}, {"_id": 0}) or {}
    tiers = s.get("membership_tiers") or SiteSettings().membership_tiers
    tier_map = {t.get("id"): t for t in tiers}

    # member name resolver (profile name > account name > email prefix)
    users = {u["id"]: u for u in await db.users.find({}, {"_id": 0, "id": 1, "name": 1, "email": 1}).to_list(100000)}
    profiles_by_acc = {}
    async for p in db.profiles.find({"account_id": {"$nin": [None, ""]}}, {"_id": 0, "account_id": 1, "name": 1}):
        profiles_by_acc[p.get("account_id")] = p.get("name")
    def member_name(uid):
        if profiles_by_acc.get(uid):
            return profiles_by_acc[uid]
        u = users.get(uid, {})
        return u.get("name") or (u.get("email") or "").split("@")[0] or "Membre"

    # ---- unit purchases ----
    creations = {c["id"]: c for c in await db.creations.find({}, {"_id": 0, "id": 1, "title": 1, "price_eur": 1}).to_list(10000)}
    purchases = await db.purchases.find({}, {"_id": 0, "creation_id": 1, "user_id": 1, "created_at": 1}).to_list(100000)
    unit_count = len(purchases)
    unit_revenue = 0.0
    per_creation = {}
    recent = []
    for p in purchases:
        cr = creations.get(p.get("creation_id"), {})
        price = float(cr.get("price_eur") or 0)
        unit_revenue += price
        key = p.get("creation_id")
        agg = per_creation.setdefault(key, {"title": cr.get("title") or "Création supprimée", "count": 0, "revenue": 0.0})
        agg["count"] += 1
        agg["revenue"] += price
        recent.append({"kind": "Achat", "label": cr.get("title") or "Création supprimée",
                       "member": member_name(p.get("user_id")), "amount": round(price, 2), "date": p.get("created_at")})
    top_creations = sorted(per_creation.values(), key=lambda x: x["revenue"], reverse=True)[:8]

    # ---- active subscriptions ----
    now = datetime.now(timezone.utc)
    active_mems = []
    async for m in db.memberships.find({"status": "active"}, {"_id": 0, "user_id": 1, "tier_id": 1, "current_period_end": 1, "updated_at": 1}):
        cpe = m.get("current_period_end")
        if cpe:
            try:
                if datetime.fromisoformat(cpe) < now:
                    continue
            except Exception:
                pass
        active_mems.append(m)
    by_tier_count = {}
    mrr = 0.0
    for m in active_mems:
        tid = m.get("tier_id") or "soutien"
        by_tier_count[tid] = by_tier_count.get(tid, 0) + 1
        t = tier_map.get(tid, {})
        price = float(t.get("price_eur") or 0)
        recent.append({"kind": "Abonnement", "label": t.get("name") or tid.title(),
                       "member": member_name(m.get("user_id")), "amount": round(price, 2), "date": m.get("updated_at")})
    by_tier = []
    for tid, cnt in by_tier_count.items():
        t = tier_map.get(tid, {})
        price = float(t.get("price_eur") or 0)
        monthly = price * cnt
        mrr += monthly
        by_tier.append({"id": tid, "name": t.get("name") or tid.title(), "price": price, "count": cnt, "monthly": round(monthly, 2)})
    by_tier.sort(key=lambda x: x["price"], reverse=True)
    active_count = len(active_mems)

    recent.sort(key=lambda x: x.get("date") or "", reverse=True)
    recent = recent[:15]

    return {
        "currency": "eur",
        "unit": {"count": unit_count, "revenue": round(unit_revenue, 2)},
        "subscriptions": {"active_count": active_count, "mrr": round(mrr, 2), "by_tier": by_tier},
        "total_estimated": round(unit_revenue + mrr, 2),
        "top_creations": [{"title": c["title"], "count": c["count"], "revenue": round(c["revenue"], 2)} for c in top_creations],
        "recent": recent,
    }


# ---------------- Stripe monetization ----------------
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or os.environ.get("STRIPE_API_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
_tax_ready = False


def _ensure_tax():
    global _tax_ready
    if _tax_ready:
        return
    try:
        s = stripe.tax.Settings.retrieve()
        if not (s.get("head_office") and s["head_office"].get("address")):
            stripe.tax.Settings.modify(
                head_office={"address": {"country": "FR", "line1": "1 Rue de la Station", "city": "Paris", "postal_code": "75001"}},
                defaults={"tax_behavior": "exclusive"},
            )
    except Exception as e:
        logging.getLogger(__name__).warning("tax settings: %s", e)
    _tax_ready = True


def _ensure_price(lookup_key: str, name: str, amount_cents: int, interval: Optional[str] = None):
    """Idempotent Stripe Product+Price by lookup_key. Recreates price if amount changed."""
    existing = stripe.Price.list(lookup_keys=[lookup_key], active=True, limit=1, expand=["data.product"]).data
    if existing:
        p = existing[0]
        if p.unit_amount == amount_cents and p.currency == "eur":
            return p.id
        stripe.Price.modify(p.id, active=False)
    # find/create product
    product = None
    for pr in stripe.Product.list(active=True, limit=100).auto_paging_iter():
        if pr.get("metadata", {}).get("sx_lookup") == lookup_key:
            product = pr
            break
    if product is None:
        product = stripe.Product.create(name=name, tax_code="txcd_10302000",
                                        metadata={"managed_by": "stationexus", "sx_lookup": lookup_key})
    kwargs = dict(product=product.id, unit_amount=amount_cents, currency="eur",
                  lookup_key=lookup_key, transfer_lookup_key=True)
    if interval:
        kwargs["recurring"] = {"interval": interval}
    return stripe.Price.create(**kwargs).id


def _create_session(price_id: str, mode: str, origin: str, metadata: dict):
    kwargs = dict(
        line_items=[{"price": price_id, "quantity": 1}],
        mode=mode,
        success_url=f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{origin}/payment/cancel",
        metadata=metadata,
    )
    if mode == "subscription":
        kwargs["subscription_data"] = {"metadata": metadata}
    try:
        _ensure_tax()
        return stripe.checkout.Session.create(**kwargs, managed_payments={"enabled": True})
    except Exception:
        try:
            return stripe.checkout.Session.create(**kwargs)  # plain fallback (no tax help)
        except stripe.error.StripeError as e:
            raise HTTPException(500, f"Stripe: {getattr(e, 'user_message', None) or str(e)}")


class CheckoutInput(BaseModel):
    kind: str  # "creation" | "membership"
    creation_id: Optional[str] = None
    tier_id: Optional[str] = None
    origin_url: str


async def _grant(session_id: str):
    """Idempotently grant entitlement for a paid session."""
    rec = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not rec or rec.get("granted"):
        return
    uid = rec.get("user_id")
    now = datetime.now(timezone.utc).isoformat()
    if rec.get("kind") == "creation" and rec.get("creation_id") and uid:
        await db.purchases.update_one(
            {"user_id": uid, "creation_id": rec["creation_id"]},
            {"$set": {"user_id": uid, "creation_id": rec["creation_id"], "session_id": session_id, "created_at": now}},
            upsert=True,
        )
    elif rec.get("kind") == "membership" and uid:
        sub_id, cpe = rec.get("stripe_subscription_id"), None
        if sub_id:
            try:
                sub = stripe.Subscription.retrieve(sub_id)
                cpe = datetime.fromtimestamp(sub["current_period_end"], tz=timezone.utc).isoformat()
            except Exception:
                pass
        # Un seul abonnement actif par compte : on résilie l'ancien si le palier change
        existing = await db.memberships.find_one({"user_id": uid}, {"_id": 0})
        old_sub = (existing or {}).get("stripe_subscription_id")
        if old_sub and old_sub != sub_id:
            try:
                stripe.Subscription.delete(old_sub)
            except Exception as e:
                logging.getLogger(__name__).warning("cancel old sub: %s", e)
        await db.memberships.update_one(
            {"user_id": uid},
            {"$set": {"user_id": uid, "status": "active", "tier_id": rec.get("tier_id"), "stripe_subscription_id": sub_id,
                      "current_period_end": cpe, "updated_at": now}},
            upsert=True,
        )
    await db.payment_transactions.update_one({"session_id": session_id}, {"$set": {"granted": True}})


@api_router.post("/payments/checkout")
async def create_checkout(data: CheckoutInput, user=Depends(get_current_user)):
    origin = data.origin_url.rstrip("/")
    if data.kind == "creation":
        cr = await db.creations.find_one({"id": data.creation_id}, {"_id": 0})
        if not cr:
            raise HTTPException(404, "Création introuvable")
        if not cr.get("is_paid") or (cr.get("price_eur") or 0) <= 0:
            raise HTTPException(400, "Cette création n'est pas payante")
        amount = round(float(cr["price_eur"]) * 100)
        price_id = _ensure_price(f"sx_creation_{cr['id']}", cr["title"][:60], amount)
        meta = {"user_id": user["id"], "kind": "creation", "creation_id": cr["id"]}
        session = _create_session(price_id, "payment", origin, meta)
    elif data.kind == "membership":
        s = await db.settings.find_one({"key": "site"}, {"_id": 0}) or {}
        if not s.get("membership_enabled"):
            raise HTTPException(400, "L'abonnement n'est pas activé")
        tiers = s.get("membership_tiers") or []
        tier = next((t for t in tiers if t.get("id") == data.tier_id), None) or (tiers[0] if tiers else None)
        if tier:
            amount = round(float(tier.get("price_eur") or 5.0) * 100)
            tier_id = tier.get("id") or "soutien"
            tname = tier.get("name") or "Soutien"
        else:
            amount = round(float(s.get("membership_price_eur") or 5.0) * 100)
            tier_id = "soutien"
            tname = s.get("membership_title") or "Soutien Nexus"
        price_id = _ensure_price(f"sx_membership_{tier_id}", f"Abonnement Nexus · {tname}", amount, interval="month")
        meta = {"user_id": user["id"], "kind": "membership", "tier_id": tier_id}
        session = _create_session(price_id, "subscription", origin, meta)
    else:
        raise HTTPException(400, "Type d'achat inconnu")
    await db.payment_transactions.insert_one({
        "session_id": session.id, "user_id": user["id"], "kind": data.kind,
        "creation_id": data.creation_id if data.kind == "creation" else None,
        "tier_id": data.tier_id if data.kind == "membership" else None,
        "amount": amount, "currency": "eur", "status": "initiated", "payment_status": "pending",
        "granted": False, "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"checkout_url": session.url, "session_id": session.id}


@api_router.get("/payments/status/{session_id}")
async def payment_status(session_id: str):
    rec = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not rec:
        raise HTTPException(404, "Transaction introuvable")
    if rec.get("payment_status") != "paid":
        try:
            s = stripe.checkout.Session.retrieve(session_id)
            if s.payment_status == "paid" or s.status == "complete":
                await db.payment_transactions.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {"status": "completed", "payment_status": "paid",
                              "stripe_subscription_id": s.get("subscription"),
                              "stripe_payment_intent_id": s.get("payment_intent"),
                              "updated_at": datetime.now(timezone.utc).isoformat()}},
                )
                await _grant(session_id)
                rec = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        except stripe.error.StripeError:
            pass
    return {"session_id": rec["session_id"], "status": rec["status"], "payment_status": rec["payment_status"], "kind": rec.get("kind")}


@api_router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(400, "Signature invalide")
    obj, t = event["data"]["object"], event["type"]
    if t == "checkout.session.completed":
        await db.payment_transactions.update_one(
            {"session_id": obj["id"], "payment_status": {"$ne": "paid"}},
            {"$set": {"status": "completed", "payment_status": obj.get("payment_status", "paid"),
                      "stripe_subscription_id": obj.get("subscription"),
                      "stripe_payment_intent_id": obj.get("payment_intent"),
                      "updated_at": datetime.now(timezone.utc).isoformat()}},
        )
        await _grant(obj["id"])
    elif t in ("customer.subscription.deleted",):
        await db.memberships.update_one({"stripe_subscription_id": obj.get("id")},
                                        {"$set": {"status": "canceled", "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"status": "ok"}


@api_router.get("/about")
async def about_page():
    s = await db.settings.find_one({"key": "site"}, {"_id": 0}) or {}
    d = SiteSettings()
    return {"title": s.get("about_title") or d.about_title,
            "body": s.get("about_body") if s.get("about_body") is not None else d.about_body,
            "hero_image": s.get("about_hero_image") or d.about_hero_image,
            "creator_title": s.get("creator_title") or d.creator_title,
            "creator_name": s.get("creator_name") or d.creator_name,
            "creator_body": s.get("creator_body") if s.get("creator_body") is not None else d.creator_body,
            "creator_image": s.get("creator_image") or d.creator_image,
            "pillars": s.get("about_pillars") if s.get("about_pillars") else d.about_pillars}


@api_router.get("/membership/plan")
async def membership_plan():
    s = await db.settings.find_one({"key": "site"}, {"_id": 0}) or {}
    tiers = s.get("membership_tiers")
    if not tiers:
        tiers = SiteSettings().membership_tiers
    body = s.get("membership_page_body")
    if body is None:
        body = SiteSettings().membership_page_body
    return {"enabled": bool(s.get("membership_enabled")), "tiers": tiers,
            "page_title": s.get("membership_page_title") or "L'abonnement Nexus",
            "page_body": body or "",
            # backward compat
            "price_eur": s.get("membership_price_eur") or (tiers[0]["price_eur"] if tiers else 5.0),
            "title": s.get("membership_title") or "Soutien Nexus",
            "perks": s.get("membership_perks") or []}


@api_router.get("/me/entitlements")
async def my_entitlements(user=Depends(get_current_user)):
    owned = await db.purchases.find({"user_id": user["id"]}, {"_id": 0, "creation_id": 1}).to_list(1000)
    return {"owned": [p["creation_id"] for p in owned], "membership_active": await _membership_active(user["id"])}


@api_router.get("/me/library")
async def my_library(user=Depends(get_current_user)):
    owned = await db.purchases.find({"user_id": user["id"]}, {"_id": 0}).to_list(1000)
    ids = [p["creation_id"] for p in owned]
    items = []
    if ids:
        docs = await db.creations.find({"id": {"$in": ids}}, {"_id": 0}).to_list(1000)
        items = [Creation(**_lighten(d)) for d in docs]
    m = await db.memberships.find_one({"user_id": user["id"]}, {"_id": 0})
    active = await _membership_active(user["id"])
    return {"creations": items, "membership": {"active": active, "tier_id": (m or {}).get("tier_id"), "current_period_end": (m or {}).get("current_period_end")}}


@api_router.post("/membership/cancel")
async def membership_cancel(user=Depends(get_current_user)):
    m = await db.memberships.find_one({"user_id": user["id"]}, {"_id": 0})
    if not m or not m.get("stripe_subscription_id"):
        raise HTTPException(404, "Aucun abonnement actif")
    try:
        stripe.Subscription.modify(m["stripe_subscription_id"], cancel_at_period_end=True)
    except Exception as e:
        raise HTTPException(500, f"Stripe: {e}")
    return {"status": "cancel_scheduled", "current_period_end": m.get("current_period_end")}


# ==================== Community Chat (public salon — abonnés) ====================
CHAT_ONLINE_WINDOW = 90  # seconds a user is considered "online" after last ping


class ChatMessageInput(BaseModel):
    text: str = ""
    image_id: str = ""
    reply_to: Optional[str] = None
    poll: Optional[Dict[str, Any]] = None  # {"question": str, "options": [str], "multi": bool}


class ChatModerateInput(BaseModel):
    user_id: str
    action: str  # ban | unban | mute | unmute


async def _author_info(user: dict) -> dict:
    p = await db.profiles.find_one({"account_id": user["id"]}, {"_id": 0, "name": 1, "avatar": 1})
    name = (p or {}).get("name") or user.get("name") or (user.get("email") or "").split("@")[0] or "Membre"
    avatar = (p or {}).get("avatar") or user.get("avatar") or ""
    return {"name": name, "avatar": avatar}


async def _chat_can_read(user: dict) -> bool:
    if user.get("is_admin"):
        return True
    if user.get("chat_banned"):
        return False
    return await _membership_active(user["id"])


async def require_chat_reader(user=Depends(get_current_user)):
    if not await _chat_can_read(user):
        raise HTTPException(403, "Le salon est réservé aux abonnés de la station")
    return user


@api_router.get("/chat/status")
async def chat_status(user=Depends(get_current_user)):
    can = await _chat_can_read(user)
    return {"can_read": can, "muted": bool(user.get("chat_muted")), "banned": bool(user.get("chat_banned")),
            "is_admin": bool(user.get("is_admin"))}


@api_router.post("/chat/upload")
async def chat_upload(file: UploadFile = File(...), user=Depends(require_chat_reader)):
    data = await file.read()
    if len(data) > MAX_AUDIO_BYTES:
        raise HTTPException(413, "Image trop lourde (max 12 Mo)")
    aid = str(uuid.uuid4())
    b64 = base64.b64encode(data).decode("utf-8")
    doc = {"id": aid, "creation_id": "chat", "kind": "chat", "name": file.filename or "image",
           "content_type": file.content_type or "image/jpeg", "data": b64, "created_at": now_iso()}
    await db.media_assets.insert_one(doc)
    return {"id": aid, "url": f"/api/assets/{aid}"}


@api_router.get("/chat/messages")
async def chat_messages(since: Optional[str] = None, limit: int = 80, user=Depends(require_chat_reader)):
    q = {}
    if since:
        q["created_at"] = {"$gt": since}
    cur = db.chat_messages.find(q, {"_id": 0}).sort("created_at", 1)
    msgs = await cur.to_list(500)
    if not since and len(msgs) > limit:
        msgs = msgs[-limit:]
    return msgs


@api_router.post("/chat/messages")
async def chat_post(payload: ChatMessageInput, user=Depends(require_chat_reader)):
    if user.get("chat_muted"):
        raise HTTPException(403, "Tu es en sourdine — tu ne peux pas écrire pour le moment")
    text = (payload.text or "").strip()[:2000]
    poll = None
    if payload.poll and (payload.poll.get("question") or "").strip():
        opts = [o for o in (payload.poll.get("options") or []) if str(o).strip()][:8]
        if len(opts) >= 2:
            poll = {"question": str(payload.poll["question"]).strip()[:200],
                    "options": [{"text": str(o).strip()[:120], "votes": []} for o in opts],
                    "multi": bool(payload.poll.get("multi"))}
    if not text and not payload.image_id and not poll:
        raise HTTPException(400, "Message vide")
    info = await _author_info(user)
    msg = {"id": str(uuid.uuid4()), "author_id": user["id"], "author_name": info["name"],
           "author_avatar": info["avatar"], "text": text, "image_id": payload.image_id or "",
           "reply_to": payload.reply_to or None, "poll": poll, "reactions": {},
           "created_at": now_iso()}
    await db.chat_messages.insert_one(msg)
    msg.pop("_id", None)
    return msg


@api_router.delete("/chat/messages/{mid}")
async def chat_delete(mid: str, user=Depends(get_admin_user)):
    await db.chat_messages.delete_one({"id": mid})
    return {"ok": True}


@api_router.post("/chat/messages/{mid}/react")
async def chat_react(mid: str, body: Dict[str, str], user=Depends(require_chat_reader)):
    emoji = (body.get("emoji") or "").strip()[:8]
    if not emoji:
        raise HTTPException(400, "Emoji requis")
    m = await db.chat_messages.find_one({"id": mid}, {"_id": 0})
    if not m:
        raise HTTPException(404, "Message introuvable")
    reactions = m.get("reactions") or {}
    users = set(reactions.get(emoji, []))
    if user["id"] in users:
        users.discard(user["id"])
    else:
        users.add(user["id"])
    if users:
        reactions[emoji] = list(users)
    else:
        reactions.pop(emoji, None)
    await db.chat_messages.update_one({"id": mid}, {"$set": {"reactions": reactions}})
    return {"reactions": reactions}


@api_router.post("/chat/messages/{mid}/vote")
async def chat_vote(mid: str, body: Dict[str, int], user=Depends(require_chat_reader)):
    idx = int(body.get("option", -1))
    m = await db.chat_messages.find_one({"id": mid}, {"_id": 0})
    if not m or not m.get("poll"):
        raise HTTPException(404, "Sondage introuvable")
    poll = m["poll"]
    opts = poll.get("options") or []
    if idx < 0 or idx >= len(opts):
        raise HTTPException(400, "Option invalide")
    uid = user["id"]
    if not poll.get("multi"):
        for o in opts:
            o["votes"] = [v for v in (o.get("votes") or []) if v != uid]
    votes = set(opts[idx].get("votes") or [])
    if uid in votes:
        votes.discard(uid)
    else:
        votes.add(uid)
    opts[idx]["votes"] = list(votes)
    await db.chat_messages.update_one({"id": mid}, {"$set": {"poll": poll}})
    return {"poll": poll}


@api_router.post("/chat/ping")
async def chat_ping(user=Depends(require_chat_reader)):
    info = await _author_info(user)
    await db.chat_presence.update_one({"user_id": user["id"]},
        {"$set": {"user_id": user["id"], "name": info["name"], "avatar": info["avatar"], "last_seen": now_iso()}},
        upsert=True)
    cutoff = (datetime.now(timezone.utc) - timedelta(seconds=CHAT_ONLINE_WINDOW)).isoformat()
    online = await db.chat_presence.find({"last_seen": {"$gt": cutoff}}, {"_id": 0}).to_list(500)
    return {"online": online, "count": len(online)}


@api_router.post("/chat/moderate")
async def chat_moderate(payload: ChatModerateInput, user=Depends(get_admin_user)):
    field = {"ban": "chat_banned", "unban": "chat_banned", "mute": "chat_muted", "unmute": "chat_muted"}.get(payload.action)
    if not field:
        raise HTTPException(400, "Action invalide")
    val = payload.action in ("ban", "mute")
    await db.users.update_one({"id": payload.user_id}, {"$set": {field: val}})
    if payload.action == "ban":
        await db.chat_presence.delete_one({"user_id": payload.user_id})
    return {"ok": True, "user_id": payload.user_id, "action": payload.action}


app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True,
                   allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
                   allow_methods=["*"], allow_headers=["*"])
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    await ensure_seed()
    try:
        await _storage_init()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error("Object storage init failed: %s", e)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
