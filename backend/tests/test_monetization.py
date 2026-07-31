"""Tests for Station Nexus monetization system (Stripe payments, membership, library, paywall)."""
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


@pytest.fixture(scope="module")
def session():
    return requests.Session()


@pytest.fixture(scope="module")
def auth_token(session):
    # Try login first
    r = session.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD}, timeout=15)
    if r.status_code != 200:
        # Register
        r = session.post(f"{API}/auth/register",
                         json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "display_name": "PayTest"},
                         timeout=15)
        assert r.status_code in (200, 201), f"Register failed: {r.status_code} {r.text[:300]}"
        # Retry login
        r = session.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD}, timeout=15)
        assert r.status_code == 200, f"Login after register failed: {r.status_code} {r.text[:300]}"
    data = r.json()
    token = data.get("token") or data.get("access_token")
    assert token, f"No token in login response: {data}"
    return token


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


# ---------- Membership plan (public) ----------
def test_membership_plan_public(session):
    r = session.get(f"{API}/membership/plan", timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    for k in ("enabled", "price_eur", "title", "perks"):
        assert k in d, f"missing key {k} in {d}"
    assert isinstance(d["perks"], list)


# ---------- Enable membership via settings ----------
def test_enable_membership_settings(session):
    r = session.put(f"{API}/settings", json={"membership_enabled": True, "membership_price_eur": 5}, timeout=15)
    assert r.status_code in (200, 204), r.text
    r2 = session.get(f"{API}/membership/plan", timeout=15)
    d = r2.json()
    assert d["enabled"] is True
    assert float(d["price_eur"]) == 5.0


# ---------- Entitlements ----------
def test_entitlements_authed(session, auth_headers):
    r = session.get(f"{API}/me/entitlements", headers=auth_headers, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "owned" in d and "membership_active" in d
    assert isinstance(d["owned"], list)
    assert PAID_CREATION_ID in d["owned"], f"paytest should own {PAID_CREATION_ID}; owned={d['owned']}"


def test_entitlements_requires_auth(session):
    r = session.get(f"{API}/me/entitlements", timeout=15)
    assert r.status_code in (401, 403)


# ---------- Library ----------
def test_library_authed(session, auth_headers):
    r = session.get(f"{API}/me/library", headers=auth_headers, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert "creations" in d and "membership" in d
    assert isinstance(d["creations"], list)
    assert len(d["creations"]) >= 1, "paytest should have at least 1 owned creation"
    ids = [c.get("id") for c in d["creations"]]
    assert PAID_CREATION_ID in ids


# ---------- Paywall gating ----------
def test_creation_gated_no_auth(session):
    r = session.get(f"{API}/creations/{PAID_CREATION_ID}", timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d.get("is_paid") is True
    # Check chapters gating
    chapters = d.get("chapters") or []
    free_n = int(d.get("free_chapters") or 0)
    locked_beyond_free = [c for i, c in enumerate(chapters) if i >= free_n]
    if locked_beyond_free:
        # At least one should be locked with empty content
        any_locked = any(c.get("locked") is True for c in locked_beyond_free)
        assert any_locked, "expected chapters beyond free_chapters to be locked"
        for c in locked_beyond_free:
            if c.get("locked"):
                # content should be empty
                assert not c.get("content"), "locked chapter should have empty content"


def test_creation_owner_full_access(session, auth_headers):
    r = session.get(f"{API}/creations/{PAID_CREATION_ID}", headers=auth_headers, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d.get("owned") is True or d.get("locked") is False
    chapters = d.get("chapters") or []
    if chapters:
        # No locked chapters for owner
        assert not any(c.get("locked") for c in chapters), "owner should see no locked chapters"


# ---------- Stripe checkout ----------
def test_checkout_creation(session, auth_headers):
    payload = {"kind": "creation", "creation_id": PAID_CREATION_ID, "origin_url": BASE_URL}
    r = session.post(f"{API}/payments/checkout", json=payload, headers=auth_headers, timeout=30)
    assert r.status_code == 200, f"{r.status_code} {r.text[:500]}"
    d = r.json()
    assert "checkout_url" in d and "session_id" in d
    assert d["checkout_url"].startswith("https://"), d["checkout_url"]
    assert "stripe.com" in d["checkout_url"] or "checkout.stripe" in d["checkout_url"], d["checkout_url"]
    # Verify record persisted
    global _created_session_id
    _created_session_id = d["session_id"]


def test_checkout_membership(session, auth_headers):
    payload = {"kind": "membership", "origin_url": BASE_URL}
    r = session.post(f"{API}/payments/checkout", json=payload, headers=auth_headers, timeout=30)
    assert r.status_code == 200, f"{r.status_code} {r.text[:500]}"
    d = r.json()
    assert d.get("checkout_url", "").startswith("https://")
    assert "session_id" in d


def test_payment_status_pending(session, auth_headers):
    # Use freshly created session id
    sid = globals().get("_created_session_id")
    assert sid, "No session id from previous test"
    r = session.get(f"{API}/payments/status/{sid}", headers=auth_headers, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    ps = d.get("payment_status") or d.get("status")
    assert ps in ("pending", "unpaid", "open"), f"expected pending-ish, got {ps} ({d})"


def test_checkout_requires_auth(session):
    r = session.post(f"{API}/payments/checkout",
                     json={"kind": "creation", "creation_id": PAID_CREATION_ID, "origin_url": BASE_URL},
                     timeout=15)
    assert r.status_code in (401, 403)


# ---------- Admin update creation ----------
def test_admin_update_creation_paid_fields(session):
    # GET current
    r = session.get(f"{API}/creations/{PAID_CREATION_ID}", timeout=15)
    assert r.status_code == 200
    cur = r.json()
    orig_price = cur.get("price_eur")
    orig_free = cur.get("free_chapters")
    # Update
    new_price = 4.25
    new_free = (int(orig_free or 0) or 0) + 1
    upd = session.put(f"{API}/creations/{PAID_CREATION_ID}",
                      json={"is_paid": True, "price_eur": new_price, "free_chapters": new_free},
                      timeout=15)
    assert upd.status_code in (200, 204), upd.text
    # Verify persistence
    r2 = session.get(f"{API}/creations/{PAID_CREATION_ID}", timeout=15)
    d2 = r2.json()
    assert d2.get("is_paid") is True
    assert float(d2.get("price_eur")) == new_price
    assert int(d2.get("free_chapters")) == new_free
    # Restore
    session.put(f"{API}/creations/{PAID_CREATION_ID}",
                json={"is_paid": True, "price_eur": orig_price or 3.5, "free_chapters": orig_free or 1},
                timeout=15)
