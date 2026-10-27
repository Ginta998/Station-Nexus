# Cosmic Bunny (Atelier AI assistant) — auth, chat multi-turn, sessions CRUD, task actions
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
T = 120
STATE = {}


@pytest.fixture(scope="module")
def s():
    ss = requests.Session()
    r = ss.post(f"{API}/auth/login", json={"email": "paytest@stationexus.com", "password": "password123"})
    if r.status_code != 200:
        pytest.skip("admin login failed")
    ss.headers["Authorization"] = f"Bearer {r.json()['token']}"
    yield ss
    # cleanup
    for sid in STATE.get("sids", []):
        ss.delete(f"{API}/atelier/bunny/sessions/{sid}")
    for tid in STATE.get("task_ids", []):
        ss.delete(f"{API}/atelier/tasks/{tid}")


def chat(s, **body):
    t0 = time.time()
    r = s.post(f"{API}/atelier/bunny/chat", json=body, timeout=T)
    print(f"chat {time.time()-t0:.1f}s status={r.status_code} body={r.text[:600]}")
    return r


# Auth guard
class TestAuth:
    def test_no_token(self):
        assert requests.get(f"{API}/atelier/bunny/sessions").status_code in (401, 403)
        assert requests.post(f"{API}/atelier/bunny/chat", json={"message": "x"}).status_code in (401, 403)

    def test_non_admin(self):
        r = requests.post(f"{API}/auth/login", json={"email": "testvisitor@stationexus.com", "password": "password123"})
        if r.status_code != 200:
            pytest.skip("visitor missing")
        h = {"Authorization": f"Bearer {r.json()['token']}"}
        assert requests.get(f"{API}/atelier/bunny/sessions", headers=h).status_code in (401, 403)

    def test_validation_empty(self, s):
        assert s.post(f"{API}/atelier/bunny/chat", json={"message": ""}).status_code == 422


# Chat + multi-turn memory + sessions
class TestChat:
    def test_first_message(self, s):
        r = chat(s, message="TEST_ Retiens ce mot secret : PAMPLEMOUSSE-42. Réponds juste en une phrase courte.")
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d["session_id"], str)
        assert d["reply"]["role"] == "assistant" and d["reply"]["content"]
        assert d["reply"]["via"]
        assert d["title"].startswith("TEST_")
        STATE["sid"] = d["session_id"]
        STATE.setdefault("sids", []).append(d["session_id"])

    def test_recall(self, s):
        if "sid" not in STATE:
            pytest.skip("no session")
        time.sleep(3)
        r = chat(s, message="Quel était le mot secret que je t'ai donné ? Réponds juste le mot.", session_id=STATE["sid"])
        assert r.status_code == 200
        d = r.json()
        assert d["session_id"] == STATE["sid"]
        assert "PAMPLEMOUSSE" in d["reply"]["content"].upper()

    def test_sessions_list_and_get(self, s):
        if "sid" not in STATE:
            pytest.skip("no session")
        lst = s.get(f"{API}/atelier/bunny/sessions").json()
        assert any(x["id"] == STATE["sid"] for x in lst)
        g = s.get(f"{API}/atelier/bunny/sessions/{STATE['sid']}")
        assert g.status_code == 200
        msgs = g.json()["messages"]
        assert len(msgs) == 4 and msgs[0]["role"] == "user" and msgs[1]["role"] == "assistant"
        assert "_id" not in g.json()

    def test_get_missing(self, s):
        assert s.get(f"{API}/atelier/bunny/sessions/nope-xyz").status_code == 404


# Task actions via LLM
class TestTasks:
    def test_create_task(self, s):
        time.sleep(3)
        r = chat(s, message="Crée une tâche dans le Cockpit : TEST_Bunny relire chapitre 7")
        assert r.status_code == 200
        d = r.json()
        STATE.setdefault("sids", []).append(d["session_id"])
        STATE["tsid"] = d["session_id"]
        assert "<actions>" not in d["reply"]["content"]
        assert d["tasks_changed"], "LLM did not emit <actions> block (flaky?)"
        t = d["tasks_changed"][0]
        assert "TEST_Bunny" in t["title"] or "chapitre 7" in t["title"].lower()
        STATE["task_id"] = t["id"]
        STATE.setdefault("task_ids", []).append(t["id"])
        boot = s.get(f"{API}/atelier/bootstrap").json()
        assert any(x["id"] == t["id"] for x in boot["tasks"])

    def test_mark_done(self, s):
        if "task_id" not in STATE:
            pytest.skip("no task")
        time.sleep(3)
        r = chat(s, message="Coche la tâche « TEST_Bunny relire chapitre 7 », elle est faite.", session_id=STATE["tsid"])
        assert r.status_code == 200
        d = r.json()
        boot = s.get(f"{API}/atelier/bootstrap").json()
        t = next(x for x in boot["tasks"] if x["id"] == STATE["task_id"])
        assert t["done"] is True, f"tasks_changed={d['tasks_changed']}"


# Delete session
class TestDelete:
    def test_delete(self, s):
        if "sid" not in STATE:
            pytest.skip("no session")
        assert s.delete(f"{API}/atelier/bunny/sessions/{STATE['sid']}").status_code == 200
        assert s.get(f"{API}/atelier/bunny/sessions/{STATE['sid']}").status_code == 404
