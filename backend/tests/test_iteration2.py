"""Iteration 2 backend tests: categories, comments, ambiences, subscribers, settings, chapters."""
import os
import io
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
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


# ---------- Categories ----------
class TestCategories:
    created_id = None

    def test_list_seed(self, s):
        r = s.get(f"{API}/categories")
        assert r.status_code == 200
        data = r.json()
        keys = {d["key"] for d in data}
        assert {"livres", "films", "series", "dojo", "avenir"}.issubset(keys), f"missing seeded keys, got {keys}"

    def test_create(self, s):
        payload = {"label": "TEST_Cat", "kanji": "試", "order": 99}
        r = s.post(f"{API}/categories", json=payload)
        assert r.status_code == 201
        d = r.json()
        assert d["label"] == "TEST_Cat"
        assert d["key"] == "test-cat" or d["key"].startswith("test-cat")
        TestCategories.created_id = d["id"]

    def test_update(self, s):
        cid = TestCategories.created_id
        r = s.put(f"{API}/categories/{cid}", json={"label": "TEST_Cat2", "kanji": "験", "order": 88})
        assert r.status_code == 200
        assert r.json()["label"] == "TEST_Cat2"

    def test_delete(self, s):
        cid = TestCategories.created_id
        r = s.delete(f"{API}/categories/{cid}")
        assert r.status_code == 200

    def test_update_404(self, s):
        r = s.put(f"{API}/categories/does-not-exist", json={"label": "x"})
        assert r.status_code == 404

    def test_delete_404(self, s):
        r = s.delete(f"{API}/categories/does-not-exist")
        assert r.status_code == 404


# ---------- Comments ----------
class TestComments:
    creation_id = None
    comment_id = None

    def test_setup_creation(self, s):
        r = s.post(f"{API}/creations", json={"title": "TEST_Comm", "category": "livres", "launch_type": "info"})
        assert r.status_code in (200, 201)
        TestComments.creation_id = r.json()["id"]

    def test_empty_list(self, s):
        r = s.get(f"{API}/creations/{TestComments.creation_id}/comments")
        assert r.status_code == 200
        assert r.json() == []

    def test_create(self, s):
        r = s.post(f"{API}/comments", json={"creation_id": TestComments.creation_id, "name": "Alice", "text": "Génial!"})
        assert r.status_code == 201
        d = r.json()
        assert d["name"] == "Alice"
        TestComments.comment_id = d["id"]
        # verify it appears in list
        lst = s.get(f"{API}/creations/{TestComments.creation_id}/comments").json()
        assert any(c["id"] == d["id"] for c in lst)

    def test_missing_fields(self, s):
        r = s.post(f"{API}/comments", json={"creation_id": TestComments.creation_id, "name": "", "text": "x"})
        assert r.status_code == 400
        r2 = s.post(f"{API}/comments", json={"creation_id": TestComments.creation_id, "name": "x", "text": " "})
        assert r2.status_code == 400

    def test_delete(self, s):
        r = s.delete(f"{API}/comments/{TestComments.comment_id}")
        assert r.status_code == 200

    def test_cascade_on_creation_delete(self, s):
        # create another comment then delete creation → comment gone
        c = s.post(f"{API}/comments", json={"creation_id": TestComments.creation_id, "name": "Bob", "text": "hi"}).json()
        s.delete(f"{API}/creations/{TestComments.creation_id}")
        lst = s.get(f"{API}/creations/{TestComments.creation_id}/comments").json()
        assert lst == []


# ---------- Ambiences ----------
class TestAmbiences:
    aid = None

    def test_create(self, s):
        r = s.post(f"{API}/ambiences", json={"title": "TEST_Amb", "emoji": "🌊", "order": 5})
        assert r.status_code == 201
        d = r.json()
        assert d["title"] == "TEST_Amb"
        TestAmbiences.aid = d["id"]

    def test_list(self, s):
        r = s.get(f"{API}/ambiences")
        assert r.status_code == 200
        assert any(a["id"] == TestAmbiences.aid for a in r.json())

    def test_update(self, s):
        r = s.put(f"{API}/ambiences/{TestAmbiences.aid}", json={"title": "TEST_Amb2", "emoji": "🔥", "order": 6})
        assert r.status_code == 200
        assert r.json()["title"] == "TEST_Amb2"

    def test_audio_upload_stream(self, s):
        content = b"ID3" + b"\x00" * 2048
        files = {"file": ("amb.mp3", io.BytesIO(content), "audio/mpeg")}
        r = s.post(f"{API}/ambiences/{TestAmbiences.aid}/audio", files=files)
        assert r.status_code == 200
        r2 = s.get(f"{API}/ambiences/{TestAmbiences.aid}/audio")
        assert r2.status_code == 200
        assert r2.content == content

    def test_audio_too_big(self, s):
        big = b"\x00" * (12 * 1024 * 1024 + 10)
        files = {"file": ("big.mp3", io.BytesIO(big), "audio/mpeg")}
        r = s.post(f"{API}/ambiences/{TestAmbiences.aid}/audio", files=files)
        assert r.status_code == 413

    def test_delete(self, s):
        r = s.delete(f"{API}/ambiences/{TestAmbiences.aid}")
        assert r.status_code == 200
        # audio should also be gone
        r2 = s.get(f"{API}/ambiences/{TestAmbiences.aid}/audio")
        assert r2.status_code == 404


# ---------- Subscribers ----------
class TestSubscribers:
    sid = None
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"

    def test_invalid(self, s):
        r = s.post(f"{API}/subscribers", json={"email": "notanemail"})
        assert r.status_code == 400

    def test_create(self, s):
        r = s.post(f"{API}/subscribers", json={"email": TestSubscribers.email})
        assert r.status_code == 201
        TestSubscribers.sid = r.json()["id"]

    def test_duplicate_returns_existing(self, s):
        r = s.post(f"{API}/subscribers", json={"email": TestSubscribers.email})
        assert r.status_code in (200, 201)
        assert r.json()["id"] == TestSubscribers.sid
        # ensure no dup
        lst = s.get(f"{API}/subscribers").json()
        count = sum(1 for x in lst if x["email"] == TestSubscribers.email)
        assert count == 1

    def test_list(self, s):
        r = s.get(f"{API}/subscribers")
        assert r.status_code == 200
        assert any(x["id"] == TestSubscribers.sid for x in r.json())

    def test_delete(self, s):
        r = s.delete(f"{API}/subscribers/{TestSubscribers.sid}")
        assert r.status_code == 200


# ---------- Settings ----------
class TestSettings:
    def test_get_defaults(self, s):
        r = s.get(f"{API}/settings")
        assert r.status_code == 200
        d = r.json()
        # Either default or persisted; name/mail keys present
        assert "name" in d and "mail" in d

    def test_put_and_persist(self, s):
        # snapshot
        orig = s.get(f"{API}/settings").json()
        new = {**orig, "bio": "TEST_BIO_XYZ"}
        r = s.put(f"{API}/settings", json=new)
        assert r.status_code == 200
        assert r.json()["bio"] == "TEST_BIO_XYZ"
        g = s.get(f"{API}/settings").json()
        assert g["bio"] == "TEST_BIO_XYZ"
        # restore
        s.put(f"{API}/settings", json=orig)


# ---------- Chapters persistence ----------
class TestChapters:
    def test_chapters_persist(self, s):
        payload = {
            "title": "TEST_Chap",
            "category": "livres",
            "launch_type": "chapters",
            "chapters": [
                {"id": "c1", "title": "Ch1", "content": "Hello", "image": ""},
                {"id": "c2", "title": "Ch2", "content": "World", "image": ""},
            ],
        }
        r = s.post(f"{API}/creations", json=payload)
        assert r.status_code in (200, 201)
        cid = r.json()["id"]
        g = s.get(f"{API}/creations/{cid}").json()
        assert len(g["chapters"]) == 2
        assert g["chapters"][0]["title"] == "Ch1"
        assert g["chapters"][1]["content"] == "World"
        s.delete(f"{API}/creations/{cid}")
