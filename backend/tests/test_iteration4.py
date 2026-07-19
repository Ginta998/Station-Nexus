"""Iteration 4 backend tests: SiteSettings.default_ambience_id persistence."""
import os
import pytest
import requests

BASE_URL = None
try:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break
except Exception:
    pass
BASE_URL = (BASE_URL or os.environ.get("REACT_APP_BACKEND_URL", "")).rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def amb(s):
    r = s.post(f"{API}/ambiences", json={"title": "TEST_I4_Amb", "emoji": "🌙", "order": 88})
    assert r.status_code == 201, r.text
    aid = r.json()["id"]
    yield aid
    s.delete(f"{API}/ambiences/{aid}")


class TestSettingsDefaultAmbience:
    def test_get_settings_returns_default(self, s):
        r = s.get(f"{API}/settings")
        assert r.status_code == 200
        d = r.json()
        assert "default_ambience_id" in d

    def test_set_default_ambience(self, s, amb):
        # Get current settings so we don't blow away other fields
        cur = s.get(f"{API}/settings").json()
        payload = {**cur, "default_ambience_id": amb}
        r = s.put(f"{API}/settings", json=payload)
        assert r.status_code == 200, r.text
        assert r.json()["default_ambience_id"] == amb

    def test_settings_persisted(self, s, amb):
        r = s.get(f"{API}/settings")
        assert r.json()["default_ambience_id"] == amb

    def test_clear_default(self, s):
        cur = s.get(f"{API}/settings").json()
        payload = {**cur, "default_ambience_id": ""}
        r = s.put(f"{API}/settings", json=payload)
        assert r.status_code == 200
        assert r.json()["default_ambience_id"] == ""
