# Iteration 39: Bunny async jobs, brains CRUD/composition, mind (profile/memories/proposals), interview, briefing
import os
import re
import time

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api/atelier/bunny"
ORIG = ["llm7-gptoss", "llm7-nemo", "ovh-gptoss", "kilo-auto"]
DEFAULT_PROFILE = {"appel": "Capitaine", "identite": "Brichel, créateur de Station Nexus", "genre": "Homme — toujours au masculin (créateur, capitaine, auteur)"}
STATE = {"custom": [], "sids": [], "mems": [], "orig_mind": None}
FEM = re.compile(r"\bcréatrice\b|\bchère\b|\bprête\b|\bauteure\b|\bautrice\b", re.IGNORECASE)


def poll(s, jid, limit=200):
    t0 = time.time()
    while time.time() - t0 < limit:
        r = s.get(f"{API}/jobs/{jid}", timeout=20)
        assert r.status_code == 200, r.text
        j = r.json()
        if j["status"] != "pending":
            print(f"job {jid} -> {j['status']} after {time.time()-t0:.0f}s")
            return j
        time.sleep(4)
    pytest.fail("job timed out")


@pytest.fixture(scope="module")
def s():
    ss = requests.Session()
    r = ss.post(f"{BASE_URL}/api/auth/login", json={"email": "paytest@stationexus.com", "password": "password123"})
    if r.status_code != 200:
        pytest.skip("admin login failed")
    ss.headers["Authorization"] = f"Bearer {r.json()['token']}"
    STATE["orig_mind"] = ss.get(f"{API}/mind").json()
    yield ss
    for bid in STATE["custom"]:
        ss.delete(f"{API}/brains/{bid}")
    ss.put(f"{API}/brains/order", json=ORIG)
    for sid in STATE["sids"]:
        ss.delete(f"{API}/sessions/{sid}")
    m = ss.get(f"{API}/mind").json()
    orig_ids = {x["id"] for x in STATE["orig_mind"].get("memories", [])}
    for x in m.get("memories", []):
        if x["id"] not in orig_ids:
            ss.delete(f"{API}/mind/memories/{x['id']}")
    ss.put(f"{API}/mind/profile", json={"profile": DEFAULT_PROFILE})


# Brains + composition
class TestBrains:
    def test_guard(self):
        assert requests.get(f"{API}/mind").status_code in (401, 403)
        assert requests.post(f"{API}/chat", json={"message": "x"}).status_code in (401, 403)

    def test_list_composition(self, s):
        d = s.get(f"{API}/brains").json()
        ids = [b["id"] for b in d["brains"]]
        assert all(b in ids for b in ORIG)
        assert all("key" not in b for b in d["brains"])
        assert {p["key"] for p in d["presets"]} >= {"gemini", "mistral", "groq", "openrouter", "nvidia", "custom"}
        c = d["composition"]
        for k in ("universes", "items", "items_read", "tasks", "creations", "profile_filled", "profile_total", "memories", "sessions", "context_chars", "interview_done", "persona", "skills"):
            assert k in c, k
        assert c["profile_total"] == 12
        print({k: v for k, v in c.items() if k != "persona"})

    def test_crud_flow(self, s):
        assert s.post(f"{API}/brains", json={"name": "TEST_x", "base": "http://a.com/v1", "model": "m"}).status_code == 400
        r = s.post(f"{API}/brains", json={"name": "TEST_b", "base": "https://example.invalid/v1", "model": "m1", "key": "sk-secret-WXYZ9876"})
        assert r.status_code == 200
        b = r.json()
        STATE["custom"].append(b["id"])
        assert b["key_hint"] == "••••9876" and "key" not in b and "secret" not in r.text
        p = s.put(f"{API}/brains/{b['id']}", json={"enabled": False, "key": "newkey-1111"}).json()
        assert p["enabled"] is False and p["key_hint"] == "••••1111" and "newkey" not in str(p)
        order = [b["id"]] + ORIG
        r = s.put(f"{API}/brains/order", json=order)
        assert [x["id"] for x in r.json()][:5] == order
        r = s.put(f"{API}/brains/order", json=ORIG + [b["id"]])
        assert [x["id"] for x in r.json()][:4] == ORIG
        t = s.post(f"{API}/brains/{b['id']}/test", timeout=60).json()
        assert t["ok"] is False
        assert s.delete(f"{API}/brains/llm7-gptoss").status_code == 400
        assert s.delete(f"{API}/brains/{b['id']}").status_code == 200
        STATE["custom"].remove(b["id"])
        assert b["id"] not in [x["id"] for x in s.get(f"{API}/brains").json()["brains"]]

    def test_job_404(self, s):
        assert s.get(f"{API}/jobs/nope-xyz").status_code == 404


# Mind: profile + memories + proposal endpoint
class TestMind:
    def test_get_mind(self, s):
        m = s.get(f"{API}/mind").json()
        assert len(m["fields"]) == 12 and "_id" not in m
        assert m["profile"].get("appel") and "Homme" in m["profile"].get("genre", "")
        print("mind:", m["profile"], len(m["memories"]), m.get("interview_done"))

    def test_profile_update(self, s):
        prof = {**DEFAULT_PROFILE, "vision": "TEST_vision", "bogus": "ignored"}
        m = s.put(f"{API}/mind/profile", json={"profile": prof}).json()
        assert m["profile"]["vision"] == "TEST_vision" and "bogus" not in m["profile"]
        assert s.get(f"{API}/mind").json()["profile"]["vision"] == "TEST_vision"

    def test_memory_add_delete(self, s):
        assert s.post(f"{API}/mind/memories", json={"text": "x"}).status_code == 422
        d = s.post(f"{API}/mind/memories", json={"text": "TEST_ Il aime le thé"}).json()
        assert d["id"] and d["source"] == "manuel"
        assert any(x["id"] == d["id"] for x in s.get(f"{API}/mind").json()["memories"])
        assert s.delete(f"{API}/mind/memories/{d['id']}").status_code == 200
        assert not any(x["id"] == d["id"] for x in s.get(f"{API}/mind").json()["memories"])

    def test_proposal_404(self, s):
        r = s.post(f"{API}/mind/proposal", json={"session_id": "nope", "index": 0, "text": "a", "accept": True})
        assert r.status_code == 404


# LLM: chat with memory proposal (flaky)
class TestChatProposal:
    def test_proposal(self, s):
        r = s.post(f"{API}/chat", json={"message": "TEST_ Je préfère les dialogues courts et j'écris toujours la nuit."}, timeout=30)
        assert r.status_code == 200 and "job_id" in r.json()
        j = poll(s, r.json()["job_id"])
        assert j["status"] == "done", j
        res = j["result"]
        STATE["sids"].append(res["session_id"])
        for k in ("session_id", "title", "reply", "reply_index", "mode", "tasks_changed", "tasks_deleted"):
            assert k in res
        rep = res["reply"]
        print("via:", rep["via"], "proposals:", rep["proposals"], "\n", rep["content"][:500])
        assert "<souvenir>" not in rep["content"]
        if not FEM.search(rep["content"]) is None:
            print("WARN feminine words:", FEM.findall(rep["content"]))
        if rep["proposals"]:
            text = rep["proposals"][0]
            r = s.post(f"{API}/mind/proposal", json={"session_id": res["session_id"], "index": res["reply_index"], "text": text, "accept": True}).json()
            assert text not in r["proposals"]
            sess = s.get(f"{API}/sessions/{res['session_id']}").json()
            assert text not in sess["messages"][res["reply_index"]]["proposals"]
            assert any(x["text"] == text and x["source"] == "conversation" for x in s.get(f"{API}/mind").json()["memories"])
        else:
            pytest.xfail("LLM returned no proposals (flaky)")


# LLM: interview flow
class TestInterview:
    def test_interview(self, s):
        sid = "TEST_interview_" + str(int(time.time()))
        STATE["sids"].append(sid)
        r = s.post(f"{API}/chat", json={"message": "Faisons connaissance !", "session_id": sid, "mode": "interview"}, timeout=30)
        j = poll(s, r.json()["job_id"])
        assert j["status"] == "done", j
        res = j["result"]
        assert res["mode"] == "interview" and res["title"] == "Faisons connaissance"
        print("Q1:", res["reply"]["content"][:400])
        sess = s.get(f"{API}/sessions/{sid}").json()
        print("asked:", sess.get("asked"))
        first = sess["asked"][-1]
        time.sleep(15)
        r = s.post(f"{API}/chat", json={"message": "TEST_ Je veux créer des sagas cosmiques qui mêlent mythes japonais et science-fiction.", "session_id": sid}, timeout=30)
        j = poll(s, r.json()["job_id"])
        assert j["status"] == "done", j
        rep = j["result"]["reply"]
        print("learned:", rep["learned"], "Q2:", rep["content"][:300])
        assert rep["learned"] and "<profil>" not in rep["content"]
        prof = s.get(f"{API}/mind").json()["profile"]
        assert prof.get(first), f"profile.{first} not saved"
        print(f"profile.{first} =", prof[first][:200])
        time.sleep(15)
        second = s.get(f"{API}/sessions/{sid}").json()["asked"][-1]
        r = s.post(f"{API}/chat", json={"message": "stop", "session_id": sid}, timeout=30)
        j = poll(s, r.json()["job_id"])
        assert j["status"] == "done", j
        res = j["result"]
        print("stop reply:", res["reply"]["content"][:300], res["reply"]["learned"])
        assert res["mode"] == "chat" and res["reply"]["profile_saved"] is True
        m = s.get(f"{API}/mind").json()
        assert m["interview_done"] is True
        print(f"after stop profile.{second} =", m["profile"].get(second))
        assert m["profile"].get(second) != "stop", f"BUG: 'stop' saved as answer to {second}"


# LLM: briefing job
class TestBriefing:
    def test_briefing(self, s):
        time.sleep(10)
        r = s.post(f"{API}/briefing", timeout=30)
        assert r.status_code == 200 and "job_id" in r.json()
        j = poll(s, r.json()["job_id"])
        assert j["status"] == "done", j
        d = j["result"]
        print("via:", d["via"], d["sections"])
        assert set(d["sections"]) == {"salut", "avance", "bloque", "echeance", "idee", "conseil", "mot"}
        assert len([v for v in d["sections"].values() if v]) >= 5
        assert set(d["meta"]) >= {"overdue", "today", "open", "next"}
        assert s.get(f"{API}/briefing").json()["id"] == d["id"]
        allt = " ".join(d["sections"].values())
        assert not FEM.search(allt), f"feminine forms: {FEM.findall(allt)}"
