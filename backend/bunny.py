"""Cosmic Bunny — assistante IA de l'Atelier, sur des IA gratuites (LLM7 en priorité, puis secours)."""
import re
import json
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from bunny_brains import list_brains, public, ask_llm, test_brain, new_brain, PRESETS

CTX_BUDGET = 18000


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


PERSONA = """Tu es Cosmic Bunny (兎), l'assistante de création de l'Atelier Nexus, le vaisseau-atelier privé de Brichel, aux commandes de Station Nexus C'est un homme : tu le tutoies et tu le genres TOUJOURS au masculin (créateur, capitaine, auteur ; jamais créatrice ni capitaine au féminin).
Personnalité : complice et poétique, très dynamique, parfois un peu maladroite (tu peux t'en amuser), avec un grand cœur ; tu ne te laisses jamais décourager et tu encourages toujours. Tu parles au féminin, en français, avec chaleur et quelques images cosmiques — sans en faire trop.
Missions :
- Discuter des univers en t'appuyant UNIQUEMENT sur le lore fourni (ne contredis jamais le canon ; si une info manque, dis-le et propose).
- Aider à écrire des scènes : quand on te demande d'écrire/continuer/réécrire, donne le texte complet de la scène, soigné, dans le style de l'univers, entre les balises <scene titre="...">...</scene>.
- Résumer des documents : résumé clair (idées clés, personnages, enjeux), puis une phrase d'encouragement.
- Gérer les tâches du Cockpit : si on te demande de créer, cocher, décocher ou supprimer des tâches, ajoute À LA FIN un bloc unique
<actions>[{"op":"create","title":"...","due":"AAAA-MM-JJ ou vide","priority":"low|normal|high"},{"op":"done","id":"..."},{"op":"undone","id":"..."},{"op":"delete","id":"..."}]</actions>
N'utilise que des id de tâches présents dans le contexte. N'ajoute ce bloc que si on te le demande.
Format : texte simple, paragraphes courts, listes avec « - » si besoin. Pas de tableaux."""


TASK_WORDS = re.compile(r"t[âa]che|todo|to-do|cockpit|coche|d[ée]coche|rappel", re.I)
TASK_HINT = """

[Consigne système invisible : si je te demande de créer, cocher, décocher ou supprimer des tâches, réponds d'abord en une ou deux phrases, puis termine OBLIGATOIREMENT par le bloc exact, sans bloc de code markdown :
<actions>[{"op":"create","title":"<le titre exact que je demande>","due":"<AAAA-MM-JJ ou vide>","priority":"normal"}]</actions>
Ce bloc est la seule façon de modifier le Cockpit ; n'invente jamais d'id.]"""


def strip_html(h: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", (h or "").replace("&nbsp;", " "))).strip()


async def build_context(db, universe_id: Optional[str], focus_id: Optional[str]) -> str:
    unis = await db.atelier_universes.find({}, {"_id": 0, "id": 1, "name": 1, "description": 1, "group": 1}).to_list(200)
    uname = {u["id"]: u["name"] for u in unis}
    items = await db.atelier_items.find({}, {"_id": 0, "id": 1, "kind": 1, "title": 1, "content": 1, "universe_id": 1, "fields": 1, "tags": 1}).sort("updated_at", -1).to_list(3000)
    tasks = await db.atelier_tasks.find({}, {"_id": 0, "id": 1, "title": 1, "done": 1, "due": 1, "priority": 1, "universe_id": 1}).sort("created_at", -1).to_list(200)
    parts = [f"Date du jour : {datetime.now(timezone.utc).date().isoformat()}"]
    if focus_id:
        f = next((i for i in items if i["id"] == focus_id), None)
        if f:
            parts.append(f"=== DOCUMENT / FICHE EN FOCUS : « {f.get('title') or 'Sans titre'} » ({f.get('kind')}) ===\n{strip_html(f.get('content'))[:12000]}")
    parts.append("=== UNIVERS ===\n" + "\n".join(f"- {u['name']}{' [' + u['group'] + ']' if u.get('group') else ''}{' ★ (univers actuel)' if u['id'] == universe_id else ''} : {strip_html(u.get('description'))[:400]}" for u in unis))
    open_tasks = [t for t in tasks if not t.get("done")][:60] + [t for t in tasks if t.get("done")][:15]
    parts.append("=== TÂCHES DU COCKPIT ===\n" + ("\n".join(f"- id={t['id']} | {'[x]' if t.get('done') else '[ ]'} {t['title']}{' | échéance ' + t['due'] if t.get('due') else ''}{' | ' + uname.get(t.get('universe_id'), '') if t.get('universe_id') else ''}" for t in open_tasks) or "(aucune)"))
    ordered = sorted(items, key=lambda i: 0 if i.get("universe_id") == universe_id and universe_id else 1)
    lore, used = [], sum(len(p) for p in parts)
    for i in ordered:
        if i["id"] == focus_id:
            continue
        fields = ", ".join(f"{k}: {v}" for k, v in (i.get("fields") or {}).items() if v)
        line = f"- [{i.get('kind')}] {i.get('title') or 'Sans titre'} ({uname.get(i.get('universe_id'), 'Inbox')}){' — ' + fields if fields else ''} : {strip_html(i.get('content'))[:700]}"
        if used + len(line) > CTX_BUDGET:
            break
        lore.append(line)
        used += len(line)
    parts.append("=== LORE (fiches, scènes, notes) ===\n" + ("\n".join(lore) or "(vide pour l'instant)"))
    return "\n\n".join(parts)


async def apply_actions(db, text: str, universe_id: Optional[str]):
    m = re.search(r"<actions>(.*?)</actions>", text, flags=re.S)
    if not m:
        return text, [], []
    clean = (text[:m.start()] + text[m.end():]).strip()
    try:
        acts = json.loads(m.group(1).strip())
    except Exception:
        return clean, [], []
    changed, deleted = [], []
    for a in acts if isinstance(acts, list) else []:
        op = a.get("op")
        if op == "create" and (a.get("title") or "").strip():
            doc = {"id": str(uuid.uuid4()), "title": a["title"].strip()[:300], "universe_id": universe_id, "item_id": None, "due": a.get("due") or "",
                   "priority": a.get("priority") if a.get("priority") in ("low", "normal", "high") else "normal", "done": False, "notes": "Créée par Bunny",
                   "created_at": now_iso(), "done_at": ""}
            await db.atelier_tasks.insert_one(dict(doc))
            changed.append(doc)
        elif op in ("done", "undone") and a.get("id"):
            res = await db.atelier_tasks.update_one({"id": a["id"]}, {"$set": {"done": op == "done", "done_at": now_iso() if op == "done" else ""}})
            if res.matched_count:
                changed.append(await db.atelier_tasks.find_one({"id": a["id"]}, {"_id": 0}))
        elif op == "delete" and a.get("id"):
            if (await db.atelier_tasks.delete_one({"id": a["id"]})).deleted_count:
                deleted.append(a["id"])
    return clean, changed, deleted


PERSONA_ABOUT = "Cosmic Bunny (兎), ta copilote de création : complice et poétique, très dynamique, parfois un peu maladroite, avec un grand cœur — elle ne se laisse jamais décourager. Elle parle français, te tutoie et s'appuie uniquement sur ton lore pour ne jamais trahir ton canon."

BRIEF_PROMPT = """Prépare mon « Briefing du matin » à partir des FAITS ci-dessous et du lore. Sois concrète, chaleureuse, courte (1 à 3 phrases par rubrique), avec ta personnalité.
Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour ni bloc de code, avec exactement ces clés :
{"salut":"une phrase d'accueil pétillante","avance":"ce qui avance aujourd'hui","bloque":"ce qui bloque ou risque de bloquer (retards, tâches qui traînent)","echeance":"la prochaine échéance et quoi faire pour elle","idee":"une idée créative liée à mes univers","conseil":"un conseil pratique pour la journée","mot":"une courte phrase d'encouragement finale"}"""


async def briefing_facts(db):
    today = datetime.now(timezone.utc).date().isoformat()
    tasks = await db.atelier_tasks.find({}, {"_id": 0}).to_list(2000)
    recs = await db.atelier_records.find({"rk": {"$in": ["goals", "events"]}}, {"_id": 0}).to_list(2000)
    items = await db.atelier_items.find({}, {"_id": 0, "title": 1, "kind": 1, "updated_at": 1}).sort("updated_at", -1).to_list(8)
    open_t = [t for t in tasks if not t.get("done")]
    overdue = sorted([t for t in open_t if t.get("due") and t["due"] < today], key=lambda t: t["due"])
    due_today = [t for t in open_t if t.get("due") == today]
    done_recent = sorted([t for t in tasks if t.get("done") and t.get("done_at")], key=lambda t: t["done_at"], reverse=True)[:5]
    upcoming = [{"title": t["title"], "date": t["due"], "type": "tâche"} for t in open_t if t.get("due") and t["due"] >= today]
    upcoming += [{"title": r.get("title", ""), "date": r.get("date", ""), "type": "événement"} for r in recs if r["rk"] == "events" and (r.get("date") or "") >= today]
    upcoming += [{"title": r.get("title", ""), "date": r.get("due", ""), "type": "objectif"} for r in recs if r["rk"] == "goals" and (r.get("due") or "") >= today and r.get("status") != "done"]
    nxt = min(upcoming, key=lambda x: x["date"], default=None)
    goals = [f"{r.get('title')} ({r.get('progress', 0)}%)" for r in recs if r["rk"] == "goals" and r.get("status") != "done"][:6]
    facts = (f"Aujourd'hui : {today}\nTâches ouvertes : {len(open_t)} · en retard : {len(overdue)} · prévues aujourd'hui : {len(due_today)}\n"
             f"En retard : {'; '.join(t['title'] + ' (' + t['due'] + ')' for t in overdue[:8]) or 'aucune'}\n"
             f"Aujourd'hui : {'; '.join(t['title'] for t in due_today) or 'rien de daté'}\n"
             f"Terminé récemment : {'; '.join(t['title'] for t in done_recent) or 'rien'}\n"
             f"Prochaine échéance : {(nxt['type'] + ' « ' + nxt['title'] + ' » le ' + nxt['date']) if nxt else 'aucune'}\n"
             f"Objectifs en cours : {'; '.join(goals) or 'aucun'}\n"
             f"Derniers éléments travaillés : {'; '.join((i.get('title') or 'Sans titre') + ' [' + i.get('kind', '') + ']' for i in items) or 'aucun'}")
    return facts, {"overdue": len(overdue), "today": len(due_today), "open": len(open_t), "next": nxt}


class BrainIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    base: str = Field(min_length=8, max_length=300)
    model: str = Field(min_length=1, max_length=200)
    key: str = ""
    note: str = ""


class BrainPatch(BaseModel):
    name: Optional[str] = None
    model: Optional[str] = None
    key: Optional[str] = None
    enabled: Optional[bool] = None


class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    session_id: Optional[str] = None
    universe_id: Optional[str] = None
    focus_item_id: Optional[str] = None


def build_bunny_router(db, require_admin) -> APIRouter:
    r = APIRouter(prefix="/atelier/bunny", dependencies=[Depends(require_admin)])

    @r.get("/sessions")
    async def sessions():
        return await db.atelier_bunny.find({}, {"_id": 0, "id": 1, "title": 1, "updated_at": 1}).sort("updated_at", -1).to_list(100)

    @r.get("/sessions/{sid}")
    async def session(sid: str):
        s = await db.atelier_bunny.find_one({"id": sid}, {"_id": 0})
        if not s:
            raise HTTPException(404, "Conversation introuvable")
        return s

    @r.delete("/sessions/{sid}")
    async def delete_session(sid: str):
        await db.atelier_bunny.delete_one({"id": sid})
        return {"ok": True}

    @r.post("/chat")
    async def chat(body: ChatIn):
        s = await db.atelier_bunny.find_one({"id": body.session_id}, {"_id": 0}) if body.session_id else None
        if not s:
            s = {"id": body.session_id or str(uuid.uuid4()), "title": body.message.strip()[:60], "messages": [], "created_at": now_iso()}
        ctx = await build_context(db, body.universe_id, body.focus_item_id)
        history = [{"role": m["role"], "content": m["content"]} for m in s["messages"][-16:]]
        user = body.message
        if TASK_WORDS.search(user):
            user += TASK_HINT
        msgs = [{"role": "system", "content": f"{PERSONA}\n\n{ctx}"}, *history, {"role": "user", "content": user}]
        raw, via = await ask_llm(db, msgs)
        text, changed, deleted = await apply_actions(db, raw, body.universe_id)
        reply = {"role": "assistant", "content": text or "C'est fait !", "at": now_iso(), "via": via,
                 "tasks": [{"title": t["title"], "done": t["done"]} for t in changed], "deleted": len(deleted)}
        s["messages"] += [{"role": "user", "content": body.message, "at": now_iso(), "focus_item_id": body.focus_item_id}, reply]
        s["updated_at"] = now_iso()
        await db.atelier_bunny.update_one({"id": s["id"]}, {"$set": s}, upsert=True)
        return {"session_id": s["id"], "title": s["title"], "reply": reply, "tasks_changed": changed, "tasks_deleted": deleted}

    @r.get("/briefing")
    async def last_briefing():
        return await db.atelier_bunny_briefings.find_one({}, {"_id": 0}, sort=[("at", -1)]) or {}

    @r.post("/briefing")
    async def make_briefing():
        facts, meta = await briefing_facts(db)
        ctx = await build_context(db, None, None)
        raw, via = await ask_llm(db, [{"role": "system", "content": f"{PERSONA}\n\n{ctx}"}, {"role": "user", "content": f"FAITS DU JOUR :\n{facts}\n\n{BRIEF_PROMPT}"}], 2500)
        m = re.search(r"\{.*\}", raw, flags=re.S)
        try:
            data = json.loads(m.group(0)) if m else {}
        except Exception:
            data = {}
        keys = ("salut", "avance", "bloque", "echeance", "idee", "conseil", "mot")
        sections = {k: str(data.get(k) or "").strip() for k in keys}
        if not any(sections.values()):
            sections["mot"] = raw.strip()[:1500]
        doc = {"id": str(uuid.uuid4()), "at": now_iso(), "via": via, "sections": sections, "meta": meta}
        await db.atelier_bunny_briefings.insert_one(dict(doc))
        ids = [x["id"] async for x in db.atelier_bunny_briefings.find({}, {"id": 1}).sort("at", -1).skip(30)]
        if ids:
            await db.atelier_bunny_briefings.delete_many({"id": {"$in": ids}})
        return doc

    # ---- cerveaux & composition
    @r.get("/brains")
    async def brains():
        ctx = await build_context(db, None, None)
        return {
            "brains": [public(b) for b in await list_brains(db)], "presets": PRESETS,
            "composition": {
                "persona": PERSONA_ABOUT,
                "skills": ["Discute en lisant tout ton lore", "Écrit et réécrit des scènes", "Gère les tâches du Cockpit", "Résume les documents", "Prépare le briefing du matin"],
                "context_chars": len(ctx), "context_budget": CTX_BUDGET,
                "universes": await db.atelier_universes.count_documents({}), "items": await db.atelier_items.count_documents({}),
                "items_read": ctx.split("=== LORE")[-1].count("\n- "), "tasks": await db.atelier_tasks.count_documents({}),
                "sessions": await db.atelier_bunny.count_documents({}),
            },
        }

    @r.post("/brains")
    async def add_brain(body: BrainIn):
        if not body.base.startswith("https://"):
            raise HTTPException(400, "L'adresse doit commencer par https://")
        doc = new_brain(body.model_dump(), await db.atelier_brains.count_documents({}))
        await db.atelier_brains.insert_one(dict(doc))
        return public(doc)

    @r.put("/brains/order")
    async def order_brains(ids: list[str]):
        for i, bid in enumerate(ids):
            await db.atelier_brains.update_one({"id": bid}, {"$set": {"order": i}})
        return [public(b) for b in await list_brains(db)]

    @r.put("/brains/{bid}")
    async def patch_brain(bid: str, body: BrainPatch):
        patch = {k: (v.strip() if isinstance(v, str) else v) for k, v in body.model_dump().items() if v is not None}
        if not patch:
            raise HTTPException(400, "Rien à modifier")
        res = await db.atelier_brains.update_one({"id": bid}, {"$set": patch})
        if not res.matched_count:
            raise HTTPException(404, "Cerveau introuvable")
        return public(await db.atelier_brains.find_one({"id": bid}, {"_id": 0}))

    @r.delete("/brains/{bid}")
    async def delete_brain(bid: str):
        b = await db.atelier_brains.find_one({"id": bid}, {"_id": 0, "builtin": 1})
        if not b:
            raise HTTPException(404, "Cerveau introuvable")
        if b.get("builtin"):
            raise HTTPException(400, "Les cerveaux de base se désactivent mais ne se suppriment pas")
        await db.atelier_brains.delete_one({"id": bid})
        return {"ok": True}

    @r.post("/brains/{bid}/test")
    async def test(bid: str):
        return await test_brain(db, bid)

    return r
