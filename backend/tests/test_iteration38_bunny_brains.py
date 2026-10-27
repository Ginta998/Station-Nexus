# Bunny brains (CRUD/order/test), composition, morning briefing, chat-via-single-brain
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api/atelier/bunny"
T = 150
ORIG = ["llm7-gptoss", "llm7-nemo", "ovh-gptoss", "kilo-auto"]
STATE = {"custom": [], "sids": []}


@pytest.fixture(scope="module")
def s():
    ss = requests.Session()
    r = ss.post(f"{BASE_URL}/api/auth/login", json={"email": "paytest@stationexus.com", "password": "password123"})
    if r.status_code != 200:
        pytest.skip("admin login failed")
    ss.headers["Authorization"] = f"Bearer {r.json()['token']}"
    yield ss
    for bid in STATE["custom"]:
        ss.delete(f"{API}/brains/{bid}")
    for bid in ORIG:
        ss.put(f"{API}/brains/{bid}", json={"enabled": True})
    ss.put(f"{API}/brains/order", json=ORIG)
    for sid in STATE["sids"]:
        ss.delete(f"{API}/sessions/{sid}")


# Brains listing + composition
class TestBrainsList:
    def test_auth_guard(self):
        assert requests.get(f"{API}/brains").status_code in (401, 403)
        assert requests.post(f"{API}/briefing").status_code in (401, 403)

    def test_list(self, s):
        r = s.get(f"{API}/brains")
        assert r.status_code == 200
        d = r.json()
        ids = [b["id"] for b in d["brains"]]
        for b in ORIG:
            assert b in ids
        print("order:", ids)
        for b in d["brains"]:
            assert "key" not in b and "has_key" in b and "key_hint" in b and "_id" not in b
        assert {p["key"] for p in d["presets"]} >= {"gemini", "mistral", "groq", "openrouter", "nvidia", "custom"}
        c = d["composition"]
        for k in ("persona", "skills", "context_chars", "context_budget", "universes", "items", "items_read", "tasks", "sessions"):
            assert k in c
        assert c["context_budget"] == 18000 and isinstance(c["skills"], list)
        print("composition:", {k: v for k, v in c.items() if k != "persona"})


# Brains CRUD
class TestBrainsCRUD:
    def test_add_http_rejected(self, s):
        r = s.post(f"{API}/brains", json={"name": "TEST_bad", "base": "http://example.com/v1", "model": "x"})
        assert r.status_code == 400

    def test_add_validation(self, s):
        assert s.post(f"{API}/brains", json={"name": "", "base": "https://example.com/v1", "model": "x"}).status_code == 422

    def test_add_custom(self, s):
        r = s.post(f"{API}/brains", json={"name": "TEST_brain", "base": "https://example.invalid/v1", "model": "m1", "key": "sk-secret-ABCD1234"})
        assert r.status_code == 200
        b = r.json()
        STATE["custom"].append(b["id"])
        assert b["builtin"] is False and b["enabled"] is True and b["has_key"] is True
        assert b["key_hint"] == "••••1234" and "key" not in b
        ids = [x["id"] for x in s.get(f"{API}/brains").json()["brains"]]
        assert ids[-1] == b["id"]

    def test_patch_custom(self, s):
        bid = STATE["custom"][0]
        r = s.put(f"{API}/brains/{bid}", json={"name": "TEST_brain2", "model": "m2", "key": "", "enabled": False})
        assert r.status_code == 200
        b = r.json()
        assert b["name"] == "TEST_brain2" and b["model"] == "m2" and b["has_key"] is False and b["enabled"] is False
        g = next(x for x in s.get(f"{API}/brains").json()["brains"] if x["id"] == bid)
        assert g["name"] == "TEST_brain2" and g["enabled"] is False

    def test_patch_empty_and_missing(self, s):
        assert s.put(f"{API}/brains/{STATE['custom'][0]}", json={}).status_code == 400
        assert s.put(f"{API}/brains/nope-xyz", json={"enabled": True}).status_code == 404

    def test_test_custom_fails_gracefully(self, s):
        r = s.post(f"{API}/brains/{STATE['custom'][0]}/test", timeout=T)
        assert r.status_code == 200
        d = r.json()
        print("test custom:", d)
        assert d["ok"] is False and "detail" in d
        assert s.post(f"{API}/brains/nope-xyz/test").status_code == 404

    def test_reorder(self, s):
        new = ["kilo-auto", "ovh-gptoss", "llm7-nemo", "llm7-gptoss"]
        r = s.put(f"{API}/brains/order", json=new + STATE["custom"])
        assert r.status_code == 200
        assert [b["id"] for b in r.json()][:4] == new
        r = s.put(f"{API}/brains/order", json=ORIG + STATE["custom"])
        assert [b["id"] for b in r.json()][:4] == ORIG

    def test_delete_builtin_rejected(self, s):
        assert s.delete(f"{API}/brains/llm7-gptoss").status_code == 400
        assert s.delete(f"{API}/brains/nope-xyz").status_code == 404

    def test_delete_custom(self, s):
        bid = STATE["custom"][0]
        assert s.delete(f"{API}/brains/{bid}").status_code == 200
        assert bid not in [x["id"] for x in s.get(f"{API}/brains").json()["brains"]]
        STATE["custom"].remove(bid)


# Briefing
class TestBriefing:
    def test_get(self, s):
        r = s.get(f"{API}/briefing")
        assert r.status_code == 200 and isinstance(r.json(), dict)

    def test_generate(self, s):
        t0 = time.time()
        r = s.post(f"{API}/briefing", timeout=T)
        print(f"briefing {time.time()-t0:.1f}s {r.status_code} {r.text[:900]}")
        assert r.status_code == 200
        d = r.json()
        assert d["id"] and d["at"] and d["via"]
        for k in ("salut", "avance", "bloque", "echeance", "idee", "conseil", "mot"):
            assert k in d["sections"]
        filled = [k for k, v in d["sections"].items() if v]
        print("filled:", filled)
        assert len(filled) >= 5, "JSON parse fell back"
        for k in ("overdue", "today", "open", "next"):
            assert k in d["meta"]
        last = s.get(f"{API}/briefing").json()
        assert last["id"] == d["id"] and "_id" not in last


# Single brain routing
class TestSingleBrain:
    def test_chat_via_ovh_only(self, s):
        for bid in ("llm7-gptoss", "llm7-nemo", "kilo-auto"):
            assert s.put(f"{API}/brains/{bid}", json={"enabled": False}).json()["enabled"] is False
        try:
            time.sleep(2)
            r = s.post(f"{API}/chat", json={"message": "TEST_ Dis juste bonjour en trois mots."}, timeout=T)
            print("chat:", r.status_code, r.text[:400])
            if r.status_code == 200:
                STATE["sids"].append(r.json()["session_id"])
            assert r.status_code == 200
            assert "OVH" in r.json()["reply"]["via"]
        finally:
            for bid in ORIG:
                s.put(f"{API}/brains/{bid}", json={"enabled": True})
        assert all(b["enabled"] for b in s.get(f"{API}/brains").json()["brains"] if b["id"] in ORIG)
