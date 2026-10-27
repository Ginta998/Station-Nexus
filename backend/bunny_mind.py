"""Mémoire de Bunny : profil du capitaine, souvenirs validés, et ce qu'il a publié sur la Station."""
import re
import json
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException
from pydantic import BaseModel, Field

PROFILE_FIELDS = [
    ("appel", "Comment Bunny t'appelle"), ("identite", "Qui tu es"), ("genre", "Ton genre (comment te genrer)"),
    ("vision", "Ta vision créative"), ("univers", "Tes univers et projets phares"), ("influences", "Tes influences"),
    ("objectifs", "Tes objectifs"), ("style_ton", "Ton d'écriture préféré"), ("style_longueur", "Longueur des réponses"),
    ("aime", "Ce que tu aimes dans un texte"), ("evite", "Ce que tu détestes / à éviter"), ("mots_interdits", "Mots ou tournures interdits"),
]
DEFAULT_PROFILE = {"appel": "Capitaine", "identite": "Brichel, créateur de Station Nexus", "genre": "Homme — toujours au masculin (créateur, capitaine, auteur)"}

MEMORY_RULE = """Mémoire : si, dans son message, il révèle une information DURABLE sur lui (goûts, style, projets, vie créative, préférences de travail) qui n'est pas déjà dans son profil ou ses souvenirs, ajoute à la toute fin, au maximum deux fois : <souvenir>phrase courte à la 3e personne</souvenir>. Sinon n'en mets pas."""

INTERVIEW = """MODE INTERVIEW « Faisons connaissance » : tu veux vraiment le connaître pour ne plus jamais être générique.
1) Si son dernier message répond à ta question précédente, note ce que tu as appris en ajoutant ce bloc (JSON valide, seulement les clés concernées, avec ses mots à lui, détaillés) : <profil>{{"cle":"valeur"}}</profil>
Clés possibles : {keys}.
2) Réagis en une phrase chaleureuse et précise à sa réponse (montre que tu as compris).
3) {next}"""


def interview_step(asked: list, profile: dict, stop: bool = False):
    skip = {"appel", "genre"} if profile.get("appel") and profile.get("genre") else set()
    todo = [] if stop else [(k, label) for k, label in PROFILE_FIELDS if k not in asked and k not in skip]
    keys = ", ".join(f"{k} ({label})" for k, label in PROFILE_FIELDS)
    if not todo:
        return INTERVIEW.format(keys=keys, next="L'interview est terminée : fais un court résumé chaleureux de qui il est et de ce que tu retiens, et dis-lui qu'il peut tout corriger dans « Cerveaux de Bunny ». Ne pose plus de question."), None
    k, label = todo[0]
    return INTERVIEW.format(keys=keys, next=f"Pose UNE seule question, courte et vivante, sur ce thème : « {label} » (clé {k}). Une seule question, rien d'autre après."), k


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def get_mind(db):
    m = await db.atelier_bunny_mind.find_one({"id": "mind"}, {"_id": 0})
    if not m:
        m = {"id": "mind", "profile": dict(DEFAULT_PROFILE), "memories": [], "interview_done": False, "updated_at": now_iso()}
        await db.atelier_bunny_mind.insert_one(dict(m))
    return m


async def mind_context(db) -> str:
    m = await get_mind(db)
    p = m.get("profile") or {}
    prof = "\n".join(f"- {label} : {p[k]}" for k, label in PROFILE_FIELDS if p.get(k))
    mem = "\n".join(f"- {x['text']}" for x in m.get("memories", [])[-60:])
    s = await db.settings.find_one({"key": "site"}, {"_id": 0, "home_vision_title": 1, "home_vision_text": 1}) or {}
    cr = await db.creations.find({}, {"_id": 0, "title": 1, "category": 1, "tagline": 1, "synopsis": 1}).sort("order", 1).to_list(40)
    works = "\n".join(f"- {c.get('title')} ({c.get('category')}){' — ' + c['tagline'] if c.get('tagline') else ''} : {re.sub(r'<[^>]+>', ' ', c.get('synopsis') or '')[:260]}" for c in cr)
    return (f"=== QUI EST LE CAPITAINE (à respecter absolument) ===\n{prof or '(profil encore vide)'}\n\n"
            f"=== CE QUE TU AS RETENU DE LUI ===\n{mem or '(aucun souvenir pour l’instant)'}\n\n"
            f"=== CE QU'IL A PUBLIÉ SUR LA STATION ===\nVision « {s.get('home_vision_title', '')} » : {(s.get('home_vision_text') or '')[:1500]}\nŒuvres :\n{works or '(aucune)'}\n\n{MEMORY_RULE}")


def extract_memories(text: str):
    props = [re.sub(r"\s+", " ", x).strip()[:300] for x in re.findall(r"<souvenir>(.*?)</souvenir>", text, flags=re.S)]
    return re.sub(r"<souvenir>.*?</souvenir>", "", text, flags=re.S).strip(), [p for p in props if p][:2]


async def extract_profile(db, text: str):
    m = re.search(r"<profil>(.*?)</profil>", text, flags=re.S)
    if not m:
        return text, []
    clean = (text[:m.start()] + text[m.end():]).strip()
    try:
        data = json.loads(re.search(r"\{.*\}", m.group(1), flags=re.S).group(0))
    except Exception:
        return clean, []
    mind = await get_mind(db)
    keys = {k for k, _ in PROFILE_FIELDS}
    new = {k: str(v).strip()[:1500] for k, v in data.items() if k in keys and str(v).strip() and "…" != str(v).strip()}
    if new:
        await db.atelier_bunny_mind.update_one({"id": "mind"}, {"$set": {"profile": {**mind["profile"], **new}, "updated_at": now_iso()}})
    return clean, list(new)


class ProfileIn(BaseModel):
    profile: dict


class MemoryIn(BaseModel):
    text: str = Field(min_length=2, max_length=300)


class ProposalIn(BaseModel):
    session_id: str
    index: int
    text: str = Field(min_length=1, max_length=300)
    accept: bool


def add_mind_routes(r, db):
    def memory(text, source):
        return {"id": str(uuid.uuid4()), "text": text.strip(), "at": now_iso(), "source": source}

    @r.get("/mind")
    async def mind():
        return {**await get_mind(db), "fields": [{"key": k, "label": label} for k, label in PROFILE_FIELDS]}

    @r.put("/mind/profile")
    async def save_profile(body: ProfileIn):
        keys = {k for k, _ in PROFILE_FIELDS}
        prof = {k: str(v).strip()[:1500] for k, v in body.profile.items() if k in keys}
        await get_mind(db)
        await db.atelier_bunny_mind.update_one({"id": "mind"}, {"$set": {"profile": prof, "updated_at": now_iso()}})
        return await mind()

    @r.post("/mind/memories")
    async def add_memory(body: MemoryIn):
        await get_mind(db)
        doc = memory(body.text, "manuel")
        await db.atelier_bunny_mind.update_one({"id": "mind"}, {"$push": {"memories": doc}})
        return doc

    @r.delete("/mind/memories/{mid}")
    async def delete_memory(mid: str):
        await db.atelier_bunny_mind.update_one({"id": "mind"}, {"$pull": {"memories": {"id": mid}}})
        return {"ok": True}

    @r.post("/mind/proposal")
    async def resolve_proposal(body: ProposalIn):
        s = await db.atelier_bunny.find_one({"id": body.session_id}, {"_id": 0, "messages": 1})
        if not s or not (0 <= body.index < len(s["messages"])):
            raise HTTPException(404, "Message introuvable")
        props = [p for p in s["messages"][body.index].get("proposals", []) if p != body.text]
        await db.atelier_bunny.update_one({"id": body.session_id}, {"$set": {f"messages.{body.index}.proposals": props}})
        if body.accept:
            await get_mind(db)
            await db.atelier_bunny_mind.update_one({"id": "mind"}, {"$push": {"memories": memory(body.text, "conversation")}})
        return {"ok": True, "proposals": props}
