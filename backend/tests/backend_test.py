"""Backend tests for Stationexus API."""
import os
import io
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Try to read from frontend/.env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip()
                    break
    except Exception:
        pass
BASE_URL = (BASE_URL or "").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


# ---------- Creations listing / seeding ----------
class TestCreations:
    def test_list_all(self, s):
        r = s.get(f"{API}/creations", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 13, f"Expected >=13 seeded creations, got {len(data)}"
        cats = {d["category"] for d in data}
        assert {"livres", "films", "dojo", "avenir"}.issubset(cats)

    def test_filter_livres(self, s):
        r = s.get(f"{API}/creations", params={"category": "livres"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 5
        assert all(d["category"] == "livres" for d in data)

    def test_get_by_id(self, s):
        all_c = s.get(f"{API}/creations").json()
        cid = all_c[0]["id"]
        r = s.get(f"{API}/creations/{cid}")
        assert r.status_code == 200
        assert r.json()["id"] == cid

    def test_get_404(self, s):
        r = s.get(f"{API}/creations/does-not-exist-xxx")
        assert r.status_code == 404


# ---------- CRUD ----------
class TestCrud:
    created_id = None

    def test_create(self, s):
        payload = {"title": "TEST_Item", "category": "livres", "tagline": "t", "synopsis": "syn",
                   "launch_type": "info", "launch_label": "Go"}
        r = s.post(f"{API}/creations", json=payload)
        assert r.status_code in (200, 201)
        data = r.json()
        assert data["title"] == "TEST_Item"
        assert data["category"] == "livres"
        assert "id" in data and data["id"]
        TestCrud.created_id = data["id"]
        # verify persistence
        g = s.get(f"{API}/creations/{data['id']}")
        assert g.status_code == 200
        assert g.json()["title"] == "TEST_Item"

    def test_update(self, s):
        cid = TestCrud.created_id
        assert cid
        payload = {"title": "TEST_Item_Updated", "category": "films", "launch_type": "info"}
        r = s.put(f"{API}/creations/{cid}", json=payload)
        assert r.status_code == 200
        assert r.json()["title"] == "TEST_Item_Updated"
        assert r.json()["category"] == "films"
        g = s.get(f"{API}/creations/{cid}").json()
        assert g["title"] == "TEST_Item_Updated"

    def test_delete(self, s):
        cid = TestCrud.created_id
        r = s.delete(f"{API}/creations/{cid}")
        assert r.status_code == 200
        g = s.get(f"{API}/creations/{cid}")
        assert g.status_code == 404


# ---------- Audio ----------
class TestAudio:
    cid = None

    def setup_method(self):
        # create a fresh creation
        s = requests.Session()
        payload = {"title": "TEST_Audio", "category": "livres", "launch_type": "info"}
        r = s.post(f"{API}/creations", json=payload)
        TestAudio.cid = r.json()["id"]

    def teardown_method(self):
        if TestAudio.cid:
            requests.delete(f"{API}/creations/{TestAudio.cid}")

    def test_upload_stream_delete(self, s):
        cid = TestAudio.cid
        content = b"ID3" + b"\x00" * 1024  # tiny fake mp3
        files = {"file": ("test.mp3", io.BytesIO(content), "audio/mpeg")}
        r = s.post(f"{API}/creations/{cid}/audio", files=files)
        assert r.status_code == 200
        # has_audio flag
        g = s.get(f"{API}/creations/{cid}").json()
        assert g["has_audio"] is True
        # stream
        r2 = s.get(f"{API}/creations/{cid}/audio")
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("audio/")
        assert r2.content == content
        # delete audio
        r3 = s.delete(f"{API}/creations/{cid}/audio")
        assert r3.status_code == 200
        r4 = s.get(f"{API}/creations/{cid}/audio")
        assert r4.status_code == 404

    def test_audio_too_big(self, s):
        cid = TestAudio.cid
        big = b"\x00" * (12 * 1024 * 1024 + 100)
        files = {"file": ("big.mp3", io.BytesIO(big), "audio/mpeg")}
        r = s.post(f"{API}/creations/{cid}/audio", files=files)
        assert r.status_code == 413
