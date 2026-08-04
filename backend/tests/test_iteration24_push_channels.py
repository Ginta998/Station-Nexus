"""Iteration 24 — Web Push (Niveau 2) + Multi-channels + chat regression."""
import os
import uuid
import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")).rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "paytest@stationexus.com"
ADMIN_PASSWORD = "password123"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def admin_id():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200
    return r.json()["user"]["id"]


# ---------- Push endpoints ----------
class TestPush:
    def test_public_key_no_auth(self):
        r = requests.get(f"{API}/push/public-key", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert "key" in d and "enabled" in d
        assert d["enabled"] is True
        assert isinstance(d["key"], str) and len(d["key"]) > 20

    def test_subscribe_pref_test_unsubscribe(self, admin_headers):
        # Clean any previous
        requests.post(f"{API}/push/unsubscribe", headers=admin_headers, json={}, timeout=10)

        # Fake subscription
        fake_endpoint = f"https://fcm.googleapis.com/fcm/send/FAKE-{uuid.uuid4()}"
        payload = {
            "subscription": {
                "endpoint": fake_endpoint,
                "keys": {
                    "p256dh": "BFakePublicKeyForTesting_" + "A" * 60,
                    "auth": "FakeAuthSecret1234"
                }
            },
            "pref": "all"
        }
        r = requests.post(f"{API}/push/subscribe", headers=admin_headers, json=payload, timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["ok"] is True
        assert d["pref"] == "all"
        assert isinstance(d["id"], str) and len(d["id"]) > 0

        # Idempotent update via same endpoint
        r2 = requests.post(f"{API}/push/subscribe", headers=admin_headers, json=payload, timeout=10)
        assert r2.status_code == 200
        assert r2.json()["id"] == d["id"]

        # Change pref
        r = requests.post(f"{API}/push/pref", headers=admin_headers, json={"pref": "dm"}, timeout=10)
        assert r.status_code == 200
        assert r.json() == {"ok": True, "pref": "dm"}

        # push/test — must not crash on invalid endpoint
        r = requests.post(f"{API}/push/test", headers=admin_headers, json={}, timeout=20)
        assert r.status_code == 200, r.text
        b = r.json()
        assert b["ok"] is True
        assert b["sent"] >= 1

        # Unsubscribe by endpoint
        r = requests.post(f"{API}/push/unsubscribe", headers=admin_headers,
                          json={"endpoint": fake_endpoint}, timeout=10)
        assert r.status_code == 200
        assert r.json() == {"ok": True}

        # push/test now returns 400 (no subs)
        r = requests.post(f"{API}/push/test", headers=admin_headers, json={}, timeout=10)
        assert r.status_code == 400

    def test_subscribe_requires_auth(self):
        r = requests.post(f"{API}/push/subscribe", json={"subscription": {"endpoint": "x"}}, timeout=10)
        assert r.status_code in (401, 403)

    def test_subscribe_invalid_payload(self, admin_headers):
        r = requests.post(f"{API}/push/subscribe", headers=admin_headers,
                          json={"subscription": {}}, timeout=10)
        assert r.status_code == 400


# ---------- Channels + chat regression ----------
class TestChannelsAndChatRegression:
    created_channel_id = None
    created_msg_ids = []

    def test_list_channels_has_general(self, admin_headers):
        r = requests.get(f"{API}/chat/channels", headers=admin_headers, timeout=10)
        assert r.status_code == 200
        chans = r.json()
        assert any(c["id"] == "general" for c in chans)

    def test_create_channel_admin(self, admin_headers):
        name = f"TEST_chan_{uuid.uuid4().hex[:6]}"
        r = requests.post(f"{API}/chat/channels", headers=admin_headers, json={"name": name}, timeout=10)
        assert r.status_code == 200, r.text
        ch = r.json()
        assert ch["name"] == name
        assert "id" in ch
        TestChannelsAndChatRegression.created_channel_id = ch["id"]

        # Verify visible
        r = requests.get(f"{API}/chat/channels", headers=admin_headers, timeout=10)
        assert any(c["id"] == ch["id"] for c in r.json())

    def test_post_message_to_custom_channel(self, admin_headers):
        cid = TestChannelsAndChatRegression.created_channel_id
        assert cid
        r = requests.post(f"{API}/chat/messages", headers=admin_headers,
                          json={"text": "TEST_hello channel", "channel_id": cid}, timeout=15)
        assert r.status_code == 200, r.text
        msg = r.json()
        assert msg["channel_id"] == cid
        assert msg["text"] == "TEST_hello channel"
        TestChannelsAndChatRegression.created_msg_ids.append(msg["id"])

        # Filter by channel
        r = requests.get(f"{API}/chat/messages", headers=admin_headers, params={"channel": cid}, timeout=10)
        assert r.status_code == 200
        msgs = r.json()
        assert any(m["id"] == msg["id"] for m in msgs)
        # General should not contain this msg
        r = requests.get(f"{API}/chat/messages", headers=admin_headers, params={"channel": "general"}, timeout=10)
        assert all(m["id"] != msg["id"] for m in r.json())

    def test_post_message_general_regression(self, admin_headers):
        r = requests.post(f"{API}/chat/messages", headers=admin_headers,
                          json={"text": "TEST_regression general"}, timeout=15)
        assert r.status_code == 200, r.text
        msg = r.json()
        assert msg["channel_id"] == "general"
        TestChannelsAndChatRegression.created_msg_ids.append(msg["id"])

    def test_dm_send_regression(self, admin_headers, admin_id):
        # Create a temp user then DM them
        temp_email = f"TEST_dm_{uuid.uuid4().hex[:8]}@example.com"
        r = requests.post(f"{API}/auth/register",
                          json={"email": temp_email, "password": "password123", "name": "DM Target"}, timeout=15)
        if r.status_code != 200:
            pytest.skip(f"register failed {r.status_code}")
        partner = r.json()["user"]["id"]
        r = requests.post(f"{API}/chat/dm/{partner}", headers=admin_headers,
                          json={"text": "TEST_dm_regression"}, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["text"] == "TEST_dm_regression"

    def test_delete_channel_admin(self, admin_headers):
        cid = TestChannelsAndChatRegression.created_channel_id
        assert cid
        r = requests.delete(f"{API}/chat/channels/{cid}", headers=admin_headers, timeout=10)
        assert r.status_code == 200
        assert r.json() == {"ok": True}
        # Verify gone
        r = requests.get(f"{API}/chat/channels", headers=admin_headers, timeout=10)
        assert all(c["id"] != cid for c in r.json())
        # Messages of that channel deleted
        r = requests.get(f"{API}/chat/messages", headers=admin_headers, params={"channel": cid}, timeout=10)
        assert r.status_code == 200
        assert r.json() == []

    def test_cannot_delete_general(self, admin_headers):
        r = requests.delete(f"{API}/chat/channels/general", headers=admin_headers, timeout=10)
        assert r.status_code == 400

    @classmethod
    def teardown_class(cls):
        # cleanup remaining test messages
        try:
            r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10)
            tok = r.json().get("token")
            if tok:
                h = {"Authorization": f"Bearer {tok}"}
                for mid in cls.created_msg_ids:
                    requests.delete(f"{API}/chat/messages/{mid}", headers=h, timeout=5)
        except Exception:
            pass
