"""
Iteration 15 - Social feature backend tests
Tests: /api/profiles, /api/announcements, /api/settings.welcome_messages, subscribers auto-add
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback: read from frontend .env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def sess():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------------- Profiles ----------------
class TestProfiles:
    def test_upsert_create_then_update(self, sess):
        pid = f"TEST_{uuid.uuid4().hex[:10]}"
        # Create
        r = sess.post(f"{API}/profiles", json={"id": pid, "name": "TEST_Alice", "avatar": "", "email": ""})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["id"] == pid
        assert d["name"] == "TEST_Alice"
        assert "created_at" in d and "updated_at" in d

        # GET by id
        g = sess.get(f"{API}/profiles/{pid}")
        assert g.status_code == 200
        assert g.json()["name"] == "TEST_Alice"

        # Update (same id)
        r2 = sess.post(f"{API}/profiles", json={"id": pid, "name": "TEST_Alice_Updated", "avatar": "", "email": ""})
        assert r2.status_code == 200
        assert r2.json()["name"] == "TEST_Alice_Updated"

        # GET again to verify persisted
        g2 = sess.get(f"{API}/profiles/{pid}")
        assert g2.status_code == 200
        assert g2.json()["name"] == "TEST_Alice_Updated"

        # List includes it
        lst = sess.get(f"{API}/profiles").json()
        ids = [p["id"] for p in lst]
        assert pid in ids

        # Cleanup: no DELETE endpoint for profiles; use mongo? We'll leave TEST_ profile.
        pytest.profile_id_to_cleanup = pid

    def test_get_missing_profile_returns_404(self, sess):
        r = sess.get(f"{API}/profiles/does-not-exist-{uuid.uuid4().hex[:6]}")
        assert r.status_code == 404

    def test_email_creates_subscriber_no_duplicate(self, sess):
        pid = f"TEST_{uuid.uuid4().hex[:10]}"
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"

        r = sess.post(f"{API}/profiles", json={"id": pid, "name": "TEST_Bob", "email": email})
        assert r.status_code == 200

        subs = sess.get(f"{API}/subscribers").json()
        emails = [s["email"] for s in subs]
        assert email in emails
        first_count = emails.count(email)
        assert first_count == 1

        # Repeat: should not duplicate
        r2 = sess.post(f"{API}/profiles", json={"id": pid, "name": "TEST_Bob2", "email": email})
        assert r2.status_code == 200
        subs2 = sess.get(f"{API}/subscribers").json()
        emails2 = [s["email"] for s in subs2]
        assert emails2.count(email) == 1

        # Cleanup subscriber
        sub_id = next(s["id"] for s in subs2 if s["email"] == email)
        sess.delete(f"{API}/subscribers/{sub_id}")


# ---------------- Announcements ----------------
class TestAnnouncements:
    created_ids = []

    def test_create_valid(self, sess):
        r = sess.post(f"{API}/announcements", json={"title": "TEST_Ann", "text": "Hello visitors", "creation_id": ""})
        assert r.status_code == 201, r.text
        d = r.json()
        assert d["title"] == "TEST_Ann"
        assert d["text"] == "Hello visitors"
        assert d["active"] is True
        assert "id" in d
        TestAnnouncements.created_ids.append(d["id"])

    def test_missing_title_returns_400(self, sess):
        r = sess.post(f"{API}/announcements", json={"title": "", "text": "body"})
        assert r.status_code == 400

    def test_missing_text_returns_400(self, sess):
        r = sess.post(f"{API}/announcements", json={"title": "hi", "text": "   "})
        assert r.status_code == 400

    def test_list_newest_first(self, sess):
        # create a 2nd
        r = sess.post(f"{API}/announcements", json={"title": "TEST_Ann2", "text": "Second"})
        assert r.status_code == 201
        second_id = r.json()["id"]
        TestAnnouncements.created_ids.append(second_id)

        lst = sess.get(f"{API}/announcements").json()
        assert isinstance(lst, list)
        # newest first: second_id should come before first
        ids = [a["id"] for a in lst]
        assert second_id in ids
        # If both present, second comes first
        first_id = TestAnnouncements.created_ids[0]
        if first_id in ids:
            assert ids.index(second_id) < ids.index(first_id)

    def test_delete_removes(self, sess):
        # Delete all created test announcements
        for aid in TestAnnouncements.created_ids:
            r = sess.delete(f"{API}/announcements/{aid}")
            assert r.status_code == 200
        # confirm gone
        lst = sess.get(f"{API}/announcements").json()
        remaining = [a["id"] for a in lst]
        for aid in TestAnnouncements.created_ids:
            assert aid not in remaining

    def test_delete_missing_returns_404(self, sess):
        r = sess.delete(f"{API}/announcements/nope-{uuid.uuid4().hex[:6]}")
        assert r.status_code == 404


# ---------------- Settings.welcome_messages ----------------
class TestWelcomeMessages:
    def test_settings_has_welcome_messages_defaults(self, sess):
        r = sess.get(f"{API}/settings")
        assert r.status_code == 200
        d = r.json()
        assert "welcome_messages" in d
        msgs = d["welcome_messages"]
        assert isinstance(msgs, list)
        assert len(msgs) >= 5
        assert any("{name}" in m for m in msgs)

    def test_put_settings_persists_welcome_messages(self, sess):
        # Get current
        cur = sess.get(f"{API}/settings").json()
        original = cur.get("welcome_messages", [])

        new_msgs = [
            "TEST hey {name}",
            "TEST bonjour {name}",
            "TEST hola {name}",
            "TEST ciao {name}",
            "TEST salut {name}",
        ]
        payload = dict(cur)
        payload["welcome_messages"] = new_msgs
        r = sess.put(f"{API}/settings", json=payload)
        assert r.status_code == 200, r.text

        # GET verifies persistence
        after = sess.get(f"{API}/settings").json()
        assert after["welcome_messages"] == new_msgs

        # Restore original
        payload2 = dict(after)
        payload2["welcome_messages"] = original
        r2 = sess.put(f"{API}/settings", json=payload2)
        assert r2.status_code == 200
        restored = sess.get(f"{API}/settings").json()
        assert restored["welcome_messages"] == original
