"""Cerveaux de Bunny : services IA (gratuits ou avec clé) rangés par priorité, avec relais automatique."""
import re
import time
import uuid
from datetime import datetime, timezone
import httpx
from fastapi import HTTPException

COOLDOWN = 600
_resting = {}   # base_url -> pause jusqu'à (après un 429)
_stats = {}     # brain id -> {ok, fail, last_ok, last_error, latency_ms}

BUILTINS = [
    {"id": "llm7-gptoss", "name": "LLM7 · GPT-OSS 20B", "base": "https://api.llm7.io/v1", "model": "gpt-oss:20b", "note": "Sans clé. Un jeton gratuit (token.llm7.io) donne plus de quota."},
    {"id": "llm7-nemo", "name": "LLM7 · Mistral Nemo", "base": "https://api.llm7.io/v1", "model": "mistral-Nemo-Instruct-2407", "note": "Sans clé. Partage le quota de LLM7."},
    {"id": "ovh-gptoss", "name": "OVHcloud · GPT-OSS 120B", "base": "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1", "model": "gpt-oss-120b", "note": "Sans clé, serveurs en Europe, 2 messages/min."},
    {"id": "kilo-auto", "name": "Kilo · auto gratuit", "base": "https://api.kilo.ai/api/gateway", "model": "kilo-auto/free", "note": "Sans clé, 200 messages/heure, modèle choisi automatiquement."},
]

PRESETS = [
    {"key": "gemini", "name": "Google Gemini 2.5 Flash", "base": "https://generativelanguage.googleapis.com/v1beta/openai", "model": "gemini-2.5-flash", "url": "https://aistudio.google.com/app/apikey", "note": "Gratuit, lit de très longs textes."},
    {"key": "mistral", "name": "Mistral Small", "base": "https://api.mistral.ai/v1", "model": "mistral-small-latest", "url": "https://console.mistral.ai/api-keys", "note": "Gratuit, excellent en français."},
    {"key": "groq", "name": "Groq · GPT-OSS 120B", "base": "https://api.groq.com/openai/v1", "model": "openai/gpt-oss-120b", "url": "https://console.groq.com/keys", "note": "Gratuit, ultra rapide, 1 000 messages/jour."},
    {"key": "openrouter", "name": "OpenRouter · gratuit", "base": "https://openrouter.ai/api/v1", "model": "openrouter/free", "url": "https://openrouter.ai/keys", "note": "Gratuit, 50 messages/jour."},
    {"key": "nvidia", "name": "NVIDIA NIM · Gemma 4 31B", "base": "https://integrate.api.nvidia.com/v1", "model": "google/gemma-4-31b-it", "url": "https://build.nvidia.com/explore/discover", "note": "Gratuit avec compte développeur."},
    {"key": "custom", "name": "Autre service compatible", "base": "", "model": "", "url": "", "note": "Toute API compatible OpenAI (adresse + modèle + clé)."},
]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def list_brains(db):
    if not await db.atelier_brains.count_documents({}):
        for i, b in enumerate(BUILTINS):
            await db.atelier_brains.insert_one({**b, "key": "", "enabled": True, "order": i, "builtin": True, "created_at": now_iso()})
    return await db.atelier_brains.find({}, {"_id": 0}).sort("order", 1).to_list(100)


def public(b):
    k = b.get("key") or ""
    st = _stats.get(b["id"], {})
    rest = _resting.get(b["base"], 0)
    return {**{x: b.get(x) for x in ("id", "name", "base", "model", "enabled", "order", "builtin", "note")},
            "has_key": bool(k), "key_hint": f"••••{k[-4:]}" if len(k) >= 8 else ("••••" if k else ""),
            "stats": {**st, "resting_until": datetime.fromtimestamp(rest, timezone.utc).isoformat() if rest > time.time() else ""}}


async def call_brain(c, b, messages, max_tokens=3500):
    h = {"Content-Type": "application/json", **({"Authorization": f"Bearer {b['key']}"} if b.get("key") else {})}
    t0 = time.time()
    r = await c.post(f"{b['base'].rstrip('/')}/chat/completions", headers=h, json={"model": b["model"], "messages": messages, "max_tokens": max_tokens, "temperature": 0.8})
    st = _stats.setdefault(b["id"], {"ok": 0, "fail": 0})
    if r.status_code == 429:
        _resting[b["base"]] = time.time() + COOLDOWN
    if r.status_code != 200:
        st["fail"] += 1
        st["last_error"] = f"HTTP {r.status_code} · {now_iso()[11:16]}"
        return None
    text = (r.json()["choices"][0]["message"].get("content") or "").strip()
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.S).strip()
    if not text:
        st["fail"] += 1
        st["last_error"] = f"Réponse vide · {now_iso()[11:16]}"
        return None
    st["ok"] += 1
    st["last_ok"] = now_iso()
    st["latency_ms"] = int((time.time() - t0) * 1000)
    return text


async def ask_llm(db, messages, max_tokens=3000):
    async with httpx.AsyncClient(timeout=httpx.Timeout(55, connect=6)) as c:
        for b in await list_brains(db):
            if not b.get("enabled") or _resting.get(b["base"], 0) > time.time():
                continue
            try:
                text = await call_brain(c, b, messages, max_tokens)
            except Exception as e:  # passe au cerveau suivant
                st = _stats.setdefault(b["id"], {"ok": 0, "fail": 0})
                st["fail"] += 1
                st["last_error"] = f"{type(e).__name__} · {now_iso()[11:16]}"
                continue
            if text:
                return text, b["name"]
    raise HTTPException(503, "Bunny a trébuché sur une comète : aucun cerveau n'a répondu. Réessaie dans un instant, ou ajoute un cerveau !")


async def test_brain(db, bid):
    b = await db.atelier_brains.find_one({"id": bid}, {"_id": 0})
    if not b:
        raise HTTPException(404, "Cerveau introuvable")
    _resting.pop(b["base"], None)
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(28, connect=6)) as c:
            text = await call_brain(c, b, [{"role": "user", "content": "Réponds juste : « Bunny est en ligne ! »"}], 300)
    except Exception as e:
        return {"ok": False, "detail": type(e).__name__, "brain": public(b)}
    return {"ok": bool(text), "detail": text or _stats.get(bid, {}).get("last_error", ""), "brain": public(b)}


def new_brain(body: dict, order: int):
    return {"id": str(uuid.uuid4()), "name": body["name"].strip()[:80], "base": body["base"].strip(), "model": body["model"].strip(),
            "key": (body.get("key") or "").strip(), "enabled": True, "order": order, "builtin": False, "note": body.get("note", "")[:200], "created_at": now_iso()}
