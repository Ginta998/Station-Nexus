"""Cosmic Bunny — assistante IA de l'Atelier, sur des IA gratuites (LLM7 en priorité, puis secours)."""
import os
import re
import json
import uuid
import logging
import time
from datetime import datetime, timezone
from typing import Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

log = logging.getLogger("bunny")
CTX_BUDGET = 18000
COOLDOWN = 600
_resting = {}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def providers():
    llm7 = os.environ.get("LLM7_API_KEY", "")
    out = [
        ("LLM7 · GPT-OSS 20B", "https://api.llm7.io/v1", "gpt-oss:20b", llm7),
        ("LLM7 · Mistral Nemo", "https://api.llm7.io/v1", "mistral-Nemo-Instruct-2407", llm7),
    ]
    if os.environ.get("GEMINI_API_KEY"):
        out.append(("Gemini 2.5 Flash", "https://generativelanguage.googleapis.com/v1beta/openai", "gemini-2.5-flash", os.environ["GEMINI_API_KEY"]))
    out += [
        ("OVHcloud · GPT-OSS 120B", "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1", "gpt-oss-120b", ""),
        ("Kilo · auto gratuit", "https://api.kilo.ai/api/gateway", "kilo-auto/free", ""),
    ]
    return out


PERSONA = """Tu es Cosmic Bunny (兎), l'assistante de création de l'Atelier Nexus, le vaisseau-atelier privé d'une autrice/créatrice.
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


async def ask_llm(messages):
    errors = []
    async with httpx.AsyncClient(timeout=httpx.Timeout(28, connect=6)) as c:
        for name, base, model, key in providers():
            if _resting.get(base, 0) > time.time():
                continue
            try:
                h = {"Content-Type": "application/json", **({"Authorization": f"Bearer {key}"} if key else {})}
                r = await c.post(f"{base}/chat/completions", headers=h, json={"model": model, "messages": messages, "max_tokens": 3500, "temperature": 0.8})
                if r.status_code == 429:
                    _resting[base] = time.time() + COOLDOWN
                if r.status_code != 200:
                    errors.append(f"{name}: HTTP {r.status_code}")
                    continue
                text = (r.json()["choices"][0]["message"].get("content") or "").strip()
                text = re.sub(r"<think>.*?</think>", "", text, flags=re.S).strip()
                if text:
                    return text, name
                errors.append(f"{name}: réponse vide")
            except Exception as e:  # passe au service suivant
                errors.append(f"{name}: {type(e).__name__}")
    log.warning("Bunny: tous les services ont échoué %s", errors)
    raise HTTPException(503, "Bunny a trébuché sur une comète : aucun service IA gratuit n'a répondu. Réessaie dans un instant !")


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
        raw, via = await ask_llm(msgs)
        text, changed, deleted = await apply_actions(db, raw, body.universe_id)
        reply = {"role": "assistant", "content": text or "C'est fait !", "at": now_iso(), "via": via,
                 "tasks": [{"title": t["title"], "done": t["done"]} for t in changed], "deleted": len(deleted)}
        s["messages"] += [{"role": "user", "content": body.message, "at": now_iso(), "focus_item_id": body.focus_item_id}, reply]
        s["updated_at"] = now_iso()
        await db.atelier_bunny.update_one({"id": s["id"]}, {"$set": s}, upsert=True)
        return {"session_id": s["id"], "title": s["title"], "reply": reply, "tasks_changed": changed, "tasks_deleted": deleted}

    return r
