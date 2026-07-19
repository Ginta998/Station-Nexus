from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import base64
import logging
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


class Episode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = ""
    url: Optional[str] = ""


class Creation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    kanji: Optional[str] = ""
    category: str  # livres | films | series | dojo | avenir
    tagline: Optional[str] = ""
    synopsis: Optional[str] = ""
    poster: Optional[str] = ""          # url or data-uri
    accent: Optional[str] = ""          # optional hex tint
    launch_type: str = "info"           # reader | link | episodes | info
    launch_label: Optional[str] = "Lancer"
    launch_content: Optional[str] = ""  # text for reader
    launch_url: Optional[str] = ""      # for link
    buy_url: Optional[str] = ""
    episodes: List[Episode] = Field(default_factory=list)
    has_audio: bool = False
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
    launch_type: str = "info"
    launch_label: Optional[str] = "Lancer"
    launch_content: Optional[str] = ""
    launch_url: Optional[str] = ""
    buy_url: Optional[str] = ""
    episodes: List[Episode] = Field(default_factory=list)
    coming_soon: bool = False
    order: int = 0


def clean(doc):
    doc.pop("_id", None)
    return doc


@api_router.get("/")
async def root():
    return {"message": "Stationexus API"}


@api_router.get("/creations", response_model=List[Creation])
async def list_creations(category: Optional[str] = None):
    q = {}
    if category:
        q["category"] = category
    docs = await db.creations.find(q, {"_id": 0}).sort("order", 1).to_list(1000)
    return [Creation(**d) for d in docs]


@api_router.get("/creations/{cid}", response_model=Creation)
async def get_creation(cid: str):
    doc = await db.creations.find_one({"id": cid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Création introuvable")
    return Creation(**doc)


@api_router.post("/creations", response_model=Creation)
async def create_creation(payload: CreationInput):
    obj = Creation(**payload.model_dump())
    await db.creations.insert_one(obj.model_dump())
    return obj


@api_router.put("/creations/{cid}", response_model=Creation)
async def update_creation(cid: str, payload: CreationInput):
    existing = await db.creations.find_one({"id": cid}, {"_id": 0})
    if not existing:
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
    return {"ok": True}


@api_router.post("/creations/{cid}/audio")
async def upload_audio(cid: str, file: UploadFile = File(...)):
    existing = await db.creations.find_one({"id": cid}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Création introuvable")
    data = await file.read()
    if len(data) > MAX_AUDIO_BYTES:
        raise HTTPException(413, "Fichier audio trop volumineux (max 12 Mo)")
    b64 = base64.b64encode(data).decode("utf-8")
    await db.media.update_one(
        {"creation_id": cid},
        {"$set": {
            "creation_id": cid,
            "data": b64,
            "content_type": file.content_type or "audio/mpeg",
            "updated_at": now_iso(),
        }},
        upsert=True,
    )
    await db.creations.update_one({"id": cid}, {"$set": {"has_audio": True}})
    return {"ok": True}


@api_router.get("/creations/{cid}/audio")
async def stream_audio(cid: str):
    media = await db.media.find_one({"creation_id": cid}, {"_id": 0})
    if not media:
        raise HTTPException(404, "Aucune ambiance")
    raw = base64.b64decode(media["data"])
    return Response(content=raw, media_type=media.get("content_type", "audio/mpeg"))


@api_router.delete("/creations/{cid}/audio")
async def delete_audio(cid: str):
    await db.media.delete_many({"creation_id": cid})
    await db.creations.update_one({"id": cid}, {"$set": {"has_audio": False}})
    return {"ok": True}


DEFAULT_CREATIONS = [
    {"title": "Born X Burn", "kanji": "焔", "category": "livres", "tagline": "Naître dans les flammes",
     "synopsis": "Un roman initiatique où la renaissance passe par le feu. Lisez le premier chapitre gratuitement ou procurez-vous l'ouvrage complet.",
     "launch_type": "reader", "launch_label": "Lire le chapitre 1", "buy_url": "https://example.com/born-x-burn",
     "launch_content": "Chapitre 1\n\nLa cendre retombait doucement sur la ville endormie...", "order": 1},
    {"title": "Cosmic Bunny", "kanji": "宇", "category": "livres", "tagline": "Le lapin des étoiles",
     "synopsis": "Une saga en plusieurs épisodes suivant un lapin cosmique à travers les galaxies.",
     "launch_type": "episodes", "launch_label": "Voir les épisodes", "order": 2,
     "episodes": [{"title": "Épisode 1 — Le Terrier", "description": "Le départ."},
                  {"title": "Épisode 2 — La Comète", "description": "La rencontre."}]},
    {"title": "La Cité des Cieux", "kanji": "天", "category": "livres", "tagline": "Là où le ciel touche la terre",
     "synopsis": "Épopée feuilletonnée d'une cité suspendue entre les nuages.",
     "launch_type": "episodes", "launch_label": "Voir les épisodes", "order": 3,
     "episodes": [{"title": "Épisode 1 — L'Ascension", "description": ""},
                  {"title": "Épisode 2 — Les Gardiens", "description": ""}]},
    {"title": "Requiem District", "kanji": "鎮", "category": "livres", "tagline": "Le quartier des âmes",
     "synopsis": "Un thriller sombre au cœur d'un district oublié.",
     "launch_type": "reader", "launch_label": "Lire un extrait", "launch_content": "Extrait\n\nLes néons grésillaient...", "order": 4},
    {"title": "Soulfreed", "kanji": "魂", "category": "livres", "tagline": "L'âme libérée",
     "synopsis": "Une quête de liberté intérieure.",
     "launch_type": "reader", "launch_label": "Lire un extrait", "launch_content": "Extrait\n\nElle respira pour la première fois...", "order": 5},

    {"title": "Blue Flower", "kanji": "蒼", "category": "films", "tagline": "La fleur bleue",
     "synopsis": "Un film poétique sur l'amour et la mémoire.",
     "launch_type": "link", "launch_label": "Lancer le film", "launch_url": "", "order": 1},
    {"title": "Liberty's Chroma : Zaina", "kanji": "彩", "category": "films", "tagline": "Les couleurs de la liberté",
     "synopsis": "Le premier volet d'une fresque visuelle éclatante.",
     "launch_type": "link", "launch_label": "Lancer le film", "launch_url": "", "order": 2},
    {"title": "Cher Père", "kanji": "父", "category": "films", "tagline": "Une lettre au silence",
     "synopsis": "Un drame intime sur la filiation.",
     "launch_type": "link", "launch_label": "Lancer le film", "launch_url": "", "order": 3},

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


@api_router.post("/seed")
async def seed(force: bool = False):
    count = await db.creations.count_documents({})
    if count > 0 and not force:
        return {"seeded": False, "count": count}
    if force:
        await db.creations.delete_many({})
        await db.media.delete_many({})
    objs = [Creation(**c) for c in DEFAULT_CREATIONS]
    await db.creations.insert_many([o.model_dump() for o in objs])
    return {"seeded": True, "count": len(objs)}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    count = await db.creations.count_documents({})
    if count == 0:
        objs = [Creation(**c) for c in DEFAULT_CREATIONS]
        await db.creations.insert_many([o.model_dump() for o in objs])
        logger.info("Seeded %d default creations", len(objs))


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
