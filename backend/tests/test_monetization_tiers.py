"""Iteration-17 tests: 3 subscription tiers, /membership/plan tiers+page, creation.status persist, paid keeps chapters."""
import os
import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")).rstrip("/")
API = f"{BASE_URL}/api"

TEST_EMAIL = "paytest@stationexus.com"
TEST_PASSWORD = "password123"
PAID_CREATION_ID = "876fcaf5-6858-4202-a56a-4a2c428eb3a8"

DEFAULT_TIERS = [
    {"id": "soutien", "name": "Soutien", "price_eur": 5.0,
     "perks": ["Accès à tout le catalogue payant", "Tu soutiens la station 🚀"]},
    {"id": "mecene", "name": "Mécène", "price_eur": 10.0,
     "perks": ["Tous les avantages Soutien", "Avantages exclusifs (à venir)"]},
    {"id": "legende", "name": "Légende", "price_eur": 15.0,
     "perks": ["Tous les avantages Mécène", "Ton nom au générique (à venir)"]},
]
DEFAULT_TITLE = "L'abonnement Nexus — soutiens la station"
DEFAULT_BODY = (
    "Station Nexus, c'est mon univers de créations — livres, films et séries — que je façonne avec passion.\n\n"
    "En t'abonnant, tu débloques l'accès à tout le catalogue payant ET tu soutiens directement le créateur : "
    "chaque abonnement finance les prochaines œuvres, les nouveaux chapitres et l'amélioration de la station.\n\n"
    "Choisis le palier qui te ressemble. Tu peux résilier à tout moment."
)


@pytest.fixture(scope="module")
def session():
    return requests.Session()


@pytest.fixture(scope="module")
def auth_headers(session):
    r = session.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD}, timeout=15)
    if r.status_code != 200:
        r = session.post(f"{API}/auth/register",
                         json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "display_name": "PayTest"},
                         timeout=15)
        assert r.status_code in (200, 201), r.text
        r = session.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    token = r.json().get("token") or r.json().get("access_token")
    assert token
    return {"Authorization": f"Bearer {token}"}


# ---------- Membership plan: tiers + page ----------
def test_membership_plan_returns_three_tiers_and_page(session):
    # Ensure enabled=True first (settings PUT requires full body)
    cur = session.get(f"{API}/settings", timeout=15).json()
    cur["membership_enabled"] = True
    up = session.put(f"{API}/settings", json=cur, timeout=15)
    assert up.status_code == 200, up.text

    r = session.get(f"{API}/membership/plan", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["enabled"] is True
    assert isinstance(d.get("tiers"), list) and len(d["tiers"]) == 3
    ids = [t["id"] for t in d["tiers"]]
    assert ids == ["soutien", "mecene", "legende"], ids
    prices = {t["id"]: float(t["price_eur"]) for t in d["tiers"]}
    assert prices == {"soutien": 5.0, "mecene": 10.0, "legende": 15.0}, prices
    assert isinstance(d.get("page_title"), str) and d["page_title"]
    assert isinstance(d.get("page_body"), str) and d["page_body"]


# ---------- Checkout for each tier ----------
@pytest.mark.parametrize("tier_id", ["soutien", "mecene", "legende"])
def test_checkout_membership_per_tier(session, auth_headers, tier_id):
    payload = {"kind": "membership", "tier_id": tier_id, "origin_url": BASE_URL}
    r = session.post(f"{API}/payments/checkout", json=payload, headers=auth_headers, timeout=30)
    assert r.status_code == 200, f"{tier_id} -> {r.status_code} {r.text[:400]}"
    d = r.json()
    assert d.get("session_id"), d
    url = d.get("checkout_url") or ""
    assert url.startswith("https://"), url
    assert "stripe.com" in url or "checkout.stripe" in url, url


# ---------- Admin edit persistence (settings) then restore ----------
def test_settings_membership_edit_persists_and_restore(session):
    cur = session.get(f"{API}/settings", timeout=15).json()
    edited = dict(cur)
    edited["membership_enabled"] = True
    edited["membership_page_title"] = "TEST TITRE"
    edited["membership_page_body"] = "para1\n\npara2"
    edited["membership_tiers"] = [
        {"id": "soutien", "name": "Soutien", "price_eur": 6, "perks": ["a"]},
        {"id": "mecene", "name": "Mécène", "price_eur": 11, "perks": ["b"]},
    ]
    r = session.put(f"{API}/settings", json=edited, timeout=15)
    assert r.status_code == 200, r.text

    plan = session.get(f"{API}/membership/plan", timeout=15).json()
    assert plan["page_title"] == "TEST TITRE"
    assert plan["page_body"] == "para1\n\npara2"
    tiers = plan["tiers"]
    assert len(tiers) == 2
    tmap = {t["id"]: float(t["price_eur"]) for t in tiers}
    assert tmap == {"soutien": 6.0, "mecene": 11.0}, tmap

    # RESTORE defaults
    restore = dict(cur)
    restore["membership_enabled"] = True
    restore["membership_page_title"] = DEFAULT_TITLE
    restore["membership_page_body"] = DEFAULT_BODY
    restore["membership_tiers"] = DEFAULT_TIERS
    r2 = session.put(f"{API}/settings", json=restore, timeout=15)
    assert r2.status_code == 200, r2.text

    plan2 = session.get(f"{API}/membership/plan", timeout=15).json()
    assert plan2["page_title"] == DEFAULT_TITLE
    assert len(plan2["tiers"]) == 3
    tmap2 = {t["id"]: float(t["price_eur"]) for t in plan2["tiers"]}
    assert tmap2 == {"soutien": 5.0, "mecene": 10.0, "legende": 15.0}


# ---------- Creation status persist ----------
def test_creation_status_persist_en_cours(session):
    r = session.get(f"{API}/creations/{PAID_CREATION_ID}", timeout=15)
    assert r.status_code == 200
    body = r.json()
    orig_status = body.get("status", "")

    # Sanitize body for PUT (CreationInput): strip computed fields
    for k in ("id", "created_at", "updated_at", "locked", "owned", "chapters_count",
              "has_audio", "has_reading_audio", "has_poster", "has_bg", "has_film", "has_trailer"):
        body.pop(k, None)
    body["status"] = "en_cours"

    up = session.put(f"{API}/creations/{PAID_CREATION_ID}", json=body, timeout=20)
    assert up.status_code in (200, 204), up.text

    got = session.get(f"{API}/creations/{PAID_CREATION_ID}", timeout=15).json()
    assert got.get("status") == "en_cours", got.get("status")

    # (Do NOT restore — the request explicitly wants status='en_cours' for the frontend test on this creation.)
    # But note original was: orig_status
    print(f"[info] Original status was: {orig_status!r}; now set to 'en_cours' per request.")


# ---------- Paid creation keeps full chapter list ----------
def test_paid_creation_chapters_preserved_when_locked(session):
    # Fetch full doc (auth so we get everything), then temporarily add chapters
    cur = session.get(f"{API}/creations/{PAID_CREATION_ID}", timeout=15).json()
    original_chapters = list(cur.get("chapters") or [])
    orig_free = int(cur.get("free_chapters") or 0)

    for k in ("id", "created_at", "updated_at", "locked", "owned", "chapters_count",
              "has_audio", "has_reading_audio", "has_poster", "has_bg", "has_film", "has_trailer"):
        cur.pop(k, None)

    # Seed 3 chapters
    seeded = [
        {"title": "TEST Chapter 1", "content": "Free content preview", "image": "", "audio_url": ""},
        {"title": "TEST Chapter 2", "content": "Locked content 2", "image": "", "audio_url": ""},
        {"title": "TEST Chapter 3", "content": "Locked content 3", "image": "", "audio_url": ""},
    ]
    cur["chapters"] = seeded
    cur["free_chapters"] = 1
    cur["is_paid"] = True
    up = session.put(f"{API}/creations/{PAID_CREATION_ID}", json=cur, timeout=20)
    assert up.status_code in (200, 204), up.text

    try:
        # Unauthenticated request — chapters must still be in the array
        r = session.get(f"{API}/creations/{PAID_CREATION_ID}", timeout=15)
        d = r.json()
        assert d.get("is_paid") is True
        chs = d.get("chapters") or []
        assert len(chs) == 3, f"expected 3 chapters preserved, got {len(chs)}"
        # First is free (unlocked, keeps content)
        assert chs[0].get("locked") is False
        assert chs[0].get("content"), "free chapter content should be readable"
        # Others locked with empty content
        for i in (1, 2):
            assert chs[i].get("locked") is True
            assert not chs[i].get("content")
        # chapters_count reflects true count
        assert int(d.get("chapters_count") or 0) == 3
    finally:
        # Restore original chapters
        cur["chapters"] = original_chapters
        cur["free_chapters"] = orig_free
        session.put(f"{API}/creations/{PAID_CREATION_ID}", json=cur, timeout=20)
