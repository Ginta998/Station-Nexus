"""Backend tests for the new visitor auth (JWT) endpoints."""
import os
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL is missing")
BASE_URL = base_url.rstrip("/")
API = f"{BASE_URL}/api"


TEST_EMAIL = "testvisitor@stationexus.com"
TEST_PASSWORD = "Test1234"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def existing_login(session):
    r = session.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    if r.status_code == 401:
        # create the account if missing
        rr = session.post(f"{API}/auth/register", json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": "Test Visitor"})
        assert rr.status_code == 200, rr.text
        return rr.json()
    assert r.status_code == 200, r.text
    return r.json()


class TestAuthCore:
    def test_me_requires_auth(self, session):
        r = session.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_login_existing(self, existing_login):
        assert "token" in existing_login
        assert existing_login["user"]["email"] == TEST_EMAIL
        assert isinstance(existing_login["token"], str)

    def test_login_wrong_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": "wrongpw"})
        assert r.status_code == 401

    def test_me_with_token(self, session, existing_login):
        r = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {existing_login['token']}"})
        assert r.status_code == 200
        assert r.json()["user"]["email"] == TEST_EMAIL

    def test_register_duplicate_conflict(self, session):
        r = session.post(f"{API}/auth/register", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
        assert r.status_code == 409

    def test_register_missing_fields(self, session):
        r = session.post(f"{API}/auth/register", json={"email": "", "password": ""})
        assert r.status_code == 400


class TestAuthNewUserFlow:
    """Register a fresh user, sync data, claim-admin, verify."""

    @pytest.fixture(scope="class")
    def fresh_user(self):
        email = f"TEST_qa_{uuid.uuid4().hex[:10]}@stationexus.test"
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        r = s.post(f"{API}/auth/register", json={"email": email, "password": "Passw0rd!", "name": "QA Bot"})
        assert r.status_code == 200, r.text
        data = r.json()
        return {"session": s, "email": email, "token": data["token"], "user": data["user"]}

    def test_new_user_defaults(self, fresh_user):
        u = fresh_user["user"]
        assert u["favorites"] == []
        assert u["preferences"] == {}
        assert u["is_admin"] is False
        assert u["name"] == "QA Bot"

    def test_sync_persists_and_get_verifies(self, fresh_user):
        s = fresh_user["session"]
        headers = {"Authorization": f"Bearer {fresh_user['token']}"}
        favs = ["item-1", "item-2", "item-3"]
        prefs = {"sx_theme": "tengoku", "sx_sound_on": "1"}
        r = s.put(f"{API}/auth/sync", json={"favorites": favs, "preferences": prefs, "name": "QA Bot 2"}, headers=headers)
        assert r.status_code == 200
        assert r.json()["user"]["favorites"] == favs

        # GET to verify persistence
        r2 = s.get(f"{API}/auth/me", headers=headers)
        assert r2.status_code == 200
        u = r2.json()["user"]
        assert u["favorites"] == favs
        assert u["preferences"] == prefs
        assert u["name"] == "QA Bot 2"

    def test_claim_admin_wrong_pin(self, fresh_user):
        s = fresh_user["session"]
        headers = {"Authorization": f"Bearer {fresh_user['token']}"}
        r = s.post(f"{API}/auth/claim-admin", json={"pin": "0000"}, headers=headers)
        assert r.status_code == 403

    def test_claim_admin_correct_pin(self, fresh_user):
        s = fresh_user["session"]
        headers = {"Authorization": f"Bearer {fresh_user['token']}"}
        r = s.post(f"{API}/auth/claim-admin", json={"pin": "1234"}, headers=headers)
        assert r.status_code == 200
        assert r.json()["user"]["is_admin"] is True
        # verify via /me
        r2 = s.get(f"{API}/auth/me", headers=headers)
        assert r2.json()["user"]["is_admin"] is True

    def test_bad_token_rejected(self, session):
        r = session.get(f"{API}/auth/me", headers={"Authorization": "Bearer not.a.jwt"})
        assert r.status_code == 401

    def test_login_new_user(self, fresh_user):
        s = fresh_user["session"]
        r = s.post(f"{API}/auth/login", json={"email": fresh_user["email"], "password": "Passw0rd!"})
        assert r.status_code == 200
        assert r.json()["user"]["email"] == fresh_user["email"].lower()
