"""Conformité légale : âge, rétractation, données personnelles (export / suppression),
signalements (DSA art. 16-17) et désinscription de la newsletter.

Monté par server.py via build_legal_router(...) — les dépendances (utilisateur courant,
envoi d'email, etc.) sont injectées pour éviter tout import circulaire.
"""
import html as _html
import re
import uuid
from datetime import date, datetime, timezone
from typing import Any, Awaitable, Callable, Dict, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel

AGE_MIN = 15
REPORT_REASONS = {
    "harcelement": "Harcèlement ou insultes",
    "haine": "Haine, discrimination ou menaces",
    "sexuel": "Contenu sexuel",
    "mineur": "Danger pour un mineur",
    "violence": "Violence ou contenu choquant",
    "spam": "Spam, arnaque ou lien douteux",
    "droits": "Atteinte aux droits d'auteur",
    "illegal": "Autre contenu illégal",
    "autre": "Autre",
}
REPORT_STATUSES = {"ouvert", "en_cours", "retire", "rejete"}


# ---------------- Âge ----------------
def parse_birthdate(v: Optional[str]) -> Optional[date]:
    if not v:
        return None
    try:
        d = date.fromisoformat(str(v)[:10])
    except ValueError:
        return None
    today = date.today()
    if d > today or d.year < 1900:
        return None
    return d


def age_of(v: Optional[str]) -> Optional[int]:
    d = parse_birthdate(v)
    if not d:
        return None
    t = date.today()
    return t.year - d.year - ((t.month, t.day) < (d.month, d.day))


def is_minor(v: Optional[str]) -> bool:
    a = age_of(v)
    return a is not None and a < 18


def check_birthdate(v: Optional[str]) -> str:
    """Valide une date de naissance (AAAA-MM-JJ) et l'âge minimum. Renvoie la date normalisée."""
    d = parse_birthdate(v)
    if not d:
        raise HTTPException(400, "Date de naissance invalide")
    if age_of(d.isoformat()) < AGE_MIN:
        raise HTTPException(403, f"Station Nexus est réservée aux personnes de {AGE_MIN} ans et plus.")
    return d.isoformat()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _esc(s: Any) -> str:
    return _html.escape(str(s or ""))


def _ref(prefix: str) -> str:
    return f"{prefix}-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"


# ---------------- Modèles ----------------
class AgeInput(BaseModel):
    birthdate: str
    newsletter: bool = False


class RetractationInput(BaseModel):
    name: str
    email: str
    contract: str = "abonnement"  # "abonnement" | "creation"
    detail: str = ""
    order_date: str = ""


class DeleteAccountInput(BaseModel):
    confirm: str


class ReportInput(BaseModel):
    target_type: str            # "chat" | "dm" | "comment" | "profile" | "autre"
    target_id: str = ""
    reason: str
    details: str = ""
    url: str = ""
    email: str = ""             # signalement sans compte
    good_faith: bool = False


class ReportDecision(BaseModel):
    status: str                 # en_cours | retire | rejete
    decision: str = ""          # motifs expliqués au signalant (et à l'auteur si retrait)


def build_legal_router(
    db,
    get_current_user: Callable[..., Awaitable[dict]],
    require_admin: Callable[..., Awaitable[dict]],
    send_email: Callable[..., Awaitable[bool]],
    mail_html: Callable[[str, str], str],
    public_user: Callable[[dict], dict],
    subscribe_email: Callable[[str], Awaitable[None]],
    cancel_subscription_now: Callable[[str], Awaitable[None]],
    rate_limit: Callable[..., None],
    site_url: Callable[[], str],
) -> APIRouter:
    r = APIRouter()

    async def optional_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
        if not authorization:
            return None
        try:
            return await get_current_user(authorization)
        except HTTPException:
            return None

    async def admin_emails() -> list:
        docs = await db.users.find({"is_admin": True}, {"_id": 0, "email": 1}).to_list(20)
        return [d["email"] for d in docs if d.get("email")]

    async def notify_admins(subject: str, body: str):
        for e in await admin_emails():
            await send_email(e, subject, mail_html(subject, body))

    # ---------- Âge (et newsletter avec consentement) ----------
    @r.put("/auth/age")
    async def set_age(data: AgeInput, user=Depends(get_current_user)):
        bd = check_birthdate(data.birthdate)
        await db.users.update_one({"id": user["id"]}, {"$set": {"birthdate": bd, "updated_at": _now()}})
        if is_minor(bd):  # profil d'un mineur : palier masqué par défaut
            await db.profiles.update_many({"account_id": user["id"]}, {"$set": {"hide_tier": True}})
        if data.newsletter and user.get("email"):
            await subscribe_email(user["email"])
        u = await db.users.find_one({"id": user["id"]}, {"_id": 0})
        return {"user": public_user(u)}

    # ---------- Rétractation (art. L221-21 C. conso) ----------
    @r.post("/legal/retractation")
    async def retractation(data: RetractationInput, request: Request, user=Depends(optional_user)):
        rate_limit(request, "retractation", 5, 3600)
        email = (data.email or "").strip().lower()
        if not data.name.strip() or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
            raise HTTPException(400, "Nom et email valides requis")
        contract = "creation" if data.contract == "creation" else "abonnement"
        ref, at = _ref("RET"), _now()
        doc = {"id": str(uuid.uuid4()), "ref": ref, "created_at": at, "status": "recue",
               "user_id": (user or {}).get("id"), "name": data.name.strip()[:120], "email": email,
               "contract": contract, "detail": data.detail.strip()[:300], "order_date": data.order_date[:20]}
        await db.withdrawals.insert_one(dict(doc))
        objet = "l'abonnement Station Nexus" if contract == "abonnement" else f"l'achat de la création « {_esc(doc['detail']) or '—'} »"
        body = (f"<p>Nous avons bien reçu ta déclaration de rétractation portant sur {objet}.</p>"
                f"<p><b>Référence :</b> {ref}<br><b>Reçue le :</b> {datetime.fromisoformat(at).strftime('%d/%m/%Y à %H:%M')} (UTC)"
                f"<br><b>Nom :</b> {_esc(doc['name'])}<br><b>Date de la commande :</b> {_esc(doc['order_date']) or '—'}</p>"
                "<p>Pour un abonnement souscrit depuis moins de 14 jours, tu seras intégralement remboursé "
                "par le même moyen de paiement, au plus tard 14 jours après cette déclaration.</p>"
                "<p>Conserve cet email : il vaut accusé de réception.</p>")
        await send_email(email, f"Accusé de réception de ta rétractation — {ref}", mail_html("Rétractation reçue", body))
        await notify_admins(f"Rétractation reçue — {ref}",
                            f"<p>{_esc(doc['name'])} ({_esc(email)}) se rétracte de {objet}.</p>"
                            f"<p>Commande du : {_esc(doc['order_date']) or '—'} · compte : {_esc(doc['user_id']) or 'non connecté'}</p>"
                            "<p>À traiter : remboursement sous 14 jours (tableau de bord Stripe) et fin de l'accès.</p>")
        return {"ref": ref, "at": at}

    # ---------- Données personnelles : export (art. 15 et 20 RGPD) ----------
    @r.get("/me/export")
    async def export_me(user=Depends(get_current_user)):
        uid, email = user["id"], user.get("email") or ""
        clean = {k: v for k, v in user.items() if k not in ("_id", "password_hash")}

        async def many(col, q, limit=10000):
            return await db[col].find(q, {"_id": 0}).to_list(limit)

        push = await many("push_subscriptions", {"user_id": uid})
        data = {
            "export_genere_le": _now(),
            "compte": clean,
            "profil_public": await many("profiles", {"account_id": uid}),
            "achats": await many("purchases", {"user_id": uid}),
            "abonnement": await many("memberships", {"user_id": uid}),
            "paiements": await many("payment_transactions", {"user_id": uid}),
            "resiliations": await many("cancellations", {"user_id": uid}),
            "retractations": await many("withdrawals", {"$or": [{"user_id": uid}, {"email": email}]}),
            "signalements_envoyes": await many("reports", {"reporter_id": uid}),
            "messages_salon": await many("chat_messages", {"author_id": uid}),
            "messages_prives": await many("chat_dms", {"$or": [{"from_id": uid}, {"to_id": uid}]}),
            "newsletter": bool(email and await db.subscribers.find_one({"email": email})),
            "notifications": [{"appareil": p.get("endpoint", "")[:60] + "…", "preference": p.get("pref")} for p in push],
            "note": "Les commentaires publiés sous les œuvres ne sont pas rattachés à un compte : "
                    "pour les retrouver ou les supprimer, écris-nous en indiquant le nom utilisé.",
        }
        return JSONResponse(data, headers={"Content-Disposition": 'attachment; filename="station-nexus-mes-donnees.json"'})

    # ---------- Données personnelles : suppression du compte (art. 17 RGPD) ----------
    @r.delete("/me")
    async def delete_me(data: DeleteAccountInput, user=Depends(get_current_user)):
        if (data.confirm or "").strip().upper() != "SUPPRIMER":
            raise HTTPException(400, "Tape SUPPRIMER pour confirmer")
        if user.get("is_admin"):
            raise HTTPException(400, "Le compte administrateur ne peut pas être supprimé d'ici")
        uid, email = user["id"], user.get("email") or ""
        m = await db.memberships.find_one({"user_id": uid}, {"_id": 0})
        if m and m.get("stripe_subscription_id") and m.get("status") == "active":
            await cancel_subscription_now(m["stripe_subscription_id"])
            await db.memberships.update_one({"user_id": uid}, {"$set": {"status": "canceled", "updated_at": _now()}})
        await db.chat_messages.delete_many({"author_id": uid})
        await db.chat_dms.delete_many({"from_id": uid})
        await db.chat_presence.delete_many({"user_id": uid})
        await db.push_subscriptions.delete_many({"user_id": uid})
        await db.profiles.delete_many({"account_id": uid})
        if email:
            await db.subscribers.delete_many({"email": email})
        # Conservés pour obligations légales (comptabilité, preuves) : achats, abonnements, paiements,
        # résiliations, rétractations — rattachés à un identifiant devenu anonyme.
        await db.users.delete_one({"id": uid})
        await db.deleted_accounts.insert_one({"user_id": uid, "deleted_at": _now()})
        if email:
            await send_email(email, "Ton compte Station Nexus a été supprimé",
                             mail_html("Compte supprimé", "<p>Ton compte et tes données ont été supprimés, à l'exception de ce que la loi "
                                       "nous oblige à conserver (factures et preuves d'achat).</p><p>À bientôt peut-être !</p>"))
        return {"ok": True}

    # ---------- Signalements (DSA art. 16) ----------
    @r.post("/reports")
    async def create_report(data: ReportInput, request: Request, user=Depends(optional_user)):
        rate_limit(request, "report", 20, 3600)
        if data.reason not in REPORT_REASONS:
            raise HTTPException(400, "Motif de signalement inconnu")
        if data.target_type not in {"chat", "dm", "comment", "profile", "autre"}:
            raise HTTPException(400, "Type de contenu inconnu")
        email = ((user or {}).get("email") or data.email or "").strip().lower()
        # Identité obligatoire sauf pour les contenus mettant en danger un mineur (art. 16 § 2 c DSA)
        if not email and data.reason != "mineur":
            raise HTTPException(400, "Indique ton email pour que l'on puisse te répondre")
        if not data.good_faith:
            raise HTTPException(400, "Confirme que ton signalement est fait de bonne foi")
        snapshot = None
        if data.target_type == "chat" and data.target_id:
            snapshot = await db.chat_messages.find_one({"id": data.target_id}, {"_id": 0, "id": 1, "author_id": 1, "author_name": 1, "text": 1, "created_at": 1})
        elif data.target_type == "dm" and data.target_id:
            snapshot = await db.chat_dms.find_one({"id": data.target_id}, {"_id": 0, "id": 1, "from_id": 1, "from_name": 1, "text": 1, "created_at": 1})
        elif data.target_type == "comment" and data.target_id:
            snapshot = await db.comments.find_one({"id": data.target_id}, {"_id": 0})
        ref = _ref("SIG")
        doc = {"id": str(uuid.uuid4()), "ref": ref, "created_at": _now(), "status": "ouvert",
               "target_type": data.target_type, "target_id": data.target_id[:80], "reason": data.reason,
               "details": data.details.strip()[:2000], "url": data.url[:300],
               "reporter_id": (user or {}).get("id"), "reporter_email": email, "snapshot": snapshot}
        await db.reports.insert_one(dict(doc))
        if email:
            await send_email(email, f"Signalement reçu — {ref}", mail_html("Signalement reçu",
                f"<p>Merci, nous avons bien reçu ton signalement (<b>{ref}</b>) pour le motif « {REPORT_REASONS[data.reason]} ».</p>"
                "<p>Nous l'examinons rapidement et te tiendrons informé de notre décision.</p>"))
        await notify_admins(f"Nouveau signalement — {REPORT_REASONS[data.reason]}",
                            f"<p>Réf. {ref} · type : {_esc(data.target_type)}</p>"
                            f"<p>Contenu : {_esc((snapshot or {}).get('text') or data.url or data.target_id)}</p>"
                            f"<p>Précisions : {_esc(data.details) or '—'}</p><p>À traiter dans Paramètres → Admin → Signalements.</p>")
        return {"ref": ref}

    @r.get("/reports")
    async def list_reports(_admin=Depends(require_admin)):
        return await db.reports.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

    @r.put("/reports/{rid}")
    async def decide_report(rid: str, data: ReportDecision, _admin=Depends(require_admin)):
        if data.status not in REPORT_STATUSES:
            raise HTTPException(400, "Statut inconnu")
        rep = await db.reports.find_one({"id": rid}, {"_id": 0})
        if not rep:
            raise HTTPException(404, "Signalement introuvable")
        await db.reports.update_one({"id": rid}, {"$set": {"status": data.status, "decision": data.decision.strip()[:2000], "decided_at": _now()}})
        if data.status == "retire":
            if rep["target_type"] == "chat" and rep.get("target_id"):
                await db.chat_messages.delete_one({"id": rep["target_id"]})
            elif rep["target_type"] == "comment" and rep.get("target_id"):
                await db.comments.delete_one({"id": rep["target_id"]})
            elif rep["target_type"] == "dm" and rep.get("target_id"):
                await db.chat_dms.delete_one({"id": rep["target_id"]})
            # Exposé des motifs à l'auteur (DSA art. 17)
            author_id = (rep.get("snapshot") or {}).get("author_id") or (rep.get("snapshot") or {}).get("from_id")
            if author_id:
                au = await db.users.find_one({"id": author_id}, {"_id": 0, "email": 1})
                if au and au.get("email"):
                    await send_email(au["email"], "Un de tes messages a été retiré", mail_html("Message retiré",
                        f"<p>Un de tes messages a été retiré pour le motif : <b>{REPORT_REASONS.get(rep['reason'], rep['reason'])}</b>.</p>"
                        f"<p>{_esc(data.decision)}</p><p>Décision prise par un humain, sans système automatisé. "
                        "Tu peux la contester en répondant à cet email.</p>"))
        if data.status in ("retire", "rejete") and rep.get("reporter_email"):
            verdict = "Le contenu a été retiré." if data.status == "retire" else "Après examen, le contenu n'a pas été retiré."
            await send_email(rep["reporter_email"], f"Suite de ton signalement — {rep['ref']}", mail_html("Décision sur ton signalement",
                f"<p>{verdict}</p><p>{_esc(data.decision)}</p><p>Tu peux contester cette décision en répondant à cet email.</p>"))
        return await db.reports.find_one({"id": rid}, {"_id": 0})

    # ---------- Newsletter : désinscription en un clic ----------
    async def _unsubscribe(t: str) -> bool:
        if not t:
            return False
        res = await db.subscribers.delete_one({"token": t})
        return res.deleted_count > 0

    @r.get("/newsletter/unsubscribe", response_class=HTMLResponse)
    async def unsubscribe_page(t: str = ""):
        ok = await _unsubscribe(t)
        msg = "Tu es désinscrit·e de la newsletter Station Nexus." if ok else "Ce lien n'est plus valide (tu es peut-être déjà désinscrit·e)."
        return HTMLResponse(
            '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            '<title>Newsletter — Station Nexus</title>'
            '<body style="background:#0a0a0a;color:#eee;font-family:Arial,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0">'
            f'<div style="max-width:420px;padding:24px;text-align:center"><h1 style="font-size:20px">{msg}</h1>'
            f'<p><a href="{_esc(site_url())}" style="color:#9ecbff">Retour à la Station</a></p></div></body>')

    @r.post("/newsletter/unsubscribe")
    async def unsubscribe_one_click(t: str = ""):
        await _unsubscribe(t)
        return {"ok": True}

    return r
