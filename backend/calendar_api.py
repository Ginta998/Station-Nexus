import os
import secrets
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse

AUTH = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN = "https://oauth2.googleapis.com/token"
API = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
SCOPE = "https://www.googleapis.com/auth/calendar"


def _origin(req: Request) -> str:
    host = req.headers.get("x-forwarded-host") or req.headers.get("host")
    return f"https://{host}"


def build_calendar_router(db, require_admin) -> APIRouter:
    r = APIRouter()
    col = db.gcal

    async def token() -> str:
        doc = await col.find_one({"_id": "owner"})
        if not doc:
            raise HTTPException(409, "Google Agenda non connecté")
        if doc.get("expires_at", "") > (datetime.now(timezone.utc) + timedelta(seconds=60)).isoformat():
            return doc["access_token"]
        async with httpx.AsyncClient(timeout=15) as c:
            t = (await c.post(TOKEN, data={"client_id": os.environ["GOOGLE_CLIENT_ID"], "client_secret": os.environ["GOOGLE_CLIENT_SECRET"],
                                            "refresh_token": doc.get("refresh_token", ""), "grant_type": "refresh_token"})).json()
        if "access_token" not in t:
            await col.delete_one({"_id": "owner"})
            raise HTTPException(409, "Connexion Google expirée, reconnecte ton agenda")
        await col.update_one({"_id": "owner"}, {"$set": {"access_token": t["access_token"], "expires_at": (datetime.now(timezone.utc) + timedelta(seconds=t.get("expires_in", 3600))).isoformat()}})
        return t["access_token"]

    async def call(method: str, url: str, **kw):
        h = {"Authorization": f"Bearer {await token()}"}
        async with httpx.AsyncClient(timeout=20) as c:
            res = await c.request(method, url, headers=h, **kw)
        if res.status_code >= 400:
            raise HTTPException(res.status_code if res.status_code < 500 else 502, res.json().get("error", {}).get("message", "Erreur Google Agenda") if res.content else "Erreur Google Agenda")
        return res.json() if res.content else {"ok": True}

    @r.get("/atelier/calendar/status", dependencies=[Depends(require_admin)])
    async def status():
        doc = await col.find_one({"_id": "owner"}, {"email": 1})
        return {"connected": bool(doc), "email": (doc or {}).get("email", "")}

    @r.get("/atelier/calendar/connect", dependencies=[Depends(require_admin)])
    async def connect(req: Request):
        state = secrets.token_urlsafe(24)
        await db.gcal_state.insert_one({"state": state, "at": datetime.now(timezone.utc).isoformat()})
        q = httpx.QueryParams({"client_id": os.environ["GOOGLE_CLIENT_ID"], "redirect_uri": _origin(req) + "/api/calendar/callback", "response_type": "code",
                               "scope": SCOPE + " email", "access_type": "offline", "prompt": "consent", "state": state})
        return {"url": f"{AUTH}?{q}"}

    @r.get("/calendar/callback")
    async def callback(req: Request, code: str = "", state: str = "", error: str = ""):
        back = _origin(req) + "/atelier"
        if error or not code or not await db.gcal_state.find_one_and_delete({"state": state}):
            return RedirectResponse(back + "?gcal=error")
        async with httpx.AsyncClient(timeout=15) as c:
            t = (await c.post(TOKEN, data={"code": code, "client_id": os.environ["GOOGLE_CLIENT_ID"], "client_secret": os.environ["GOOGLE_CLIENT_SECRET"],
                                            "redirect_uri": _origin(req) + "/api/calendar/callback", "grant_type": "authorization_code"})).json()
            if "access_token" not in t:
                return RedirectResponse(back + "?gcal=error")
            me = (await c.get("https://www.googleapis.com/oauth2/v2/userinfo", headers={"Authorization": f"Bearer {t['access_token']}"})).json()
        await col.update_one({"_id": "owner"}, {"$set": {"access_token": t["access_token"], "refresh_token": t.get("refresh_token", ""), "email": me.get("email", ""),
                                                          "expires_at": (datetime.now(timezone.utc) + timedelta(seconds=t.get("expires_in", 3600))).isoformat()}}, upsert=True)
        return RedirectResponse(back + "?gcal=ok")

    @r.delete("/atelier/calendar", dependencies=[Depends(require_admin)])
    async def disconnect():
        await col.delete_one({"_id": "owner"})
        return {"ok": True}

    @r.get("/atelier/calendar/events", dependencies=[Depends(require_admin)])
    async def events(start: str, end: str):
        d = await call("GET", API, params={"timeMin": start, "timeMax": end, "singleEvents": "true", "orderBy": "startTime", "maxResults": 250})
        return [{"id": e["id"], "title": e.get("summary", "(Sans titre)"), "start": e["start"].get("dateTime") or e["start"].get("date"),
                 "end": e["end"].get("dateTime") or e["end"].get("date"), "allDay": "date" in e["start"], "location": e.get("location", ""),
                 "description": e.get("description", ""), "link": e.get("htmlLink", "")} for e in d.get("items", []) if e.get("status") != "cancelled"]

    def body(b: Dict[str, Any]) -> Dict[str, Any]:
        tz = b.get("tz") or "Europe/Paris"
        k = "date" if b.get("allDay") else "dateTime"
        out = {"summary": b.get("title", ""), "description": b.get("description", ""), "location": b.get("location", ""),
               "start": {k: b["start"]}, "end": {k: b["end"]}}
        if k == "dateTime":
            out["start"]["timeZone"] = out["end"]["timeZone"] = tz
        return out

    @r.post("/atelier/calendar/events", dependencies=[Depends(require_admin)])
    async def create(b: Dict[str, Any]):
        return await call("POST", API, json=body(b))

    @r.patch("/atelier/calendar/events/{eid}", dependencies=[Depends(require_admin)])
    async def update(eid: str, b: Dict[str, Any]):
        return await call("PATCH", f"{API}/{eid}", json=body(b))

    @r.delete("/atelier/calendar/events/{eid}", dependencies=[Depends(require_admin)])
    async def remove(eid: str):
        return await call("DELETE", f"{API}/{eid}")

    return r
