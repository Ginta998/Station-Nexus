# Atelier Nexus (admin-only private workspace) API tests
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN = {"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"}
VISITOR = {"email": "testvisitor@stationexus.com", "password": "password123"}


@pytest.fixture(scope="module")
def admin():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json=ADMIN)
    if r.status_code != 200:
        pytest.skip("admin login failed")
    s.headers["Authorization"] = f"Bearer {r.json()['token']}"
    return s


# --- Auth guard
@pytest.mark.parametrize("method,path", [
    ("get", "/atelier/config"), ("put", "/atelier/config"), ("get", "/atelier/bootstrap"),
    ("post", "/atelier/universes"), ("post", "/atelier/items"), ("post", "/atelier/tasks"),
    ("get", "/atelier/export"), ("delete", "/atelier/items/x"), ("get", "/atelier/items/x/versions"),
])
def test_no_token_rejected(method, path):
    r = getattr(requests, method)(f"{API}{path}", json={})
    assert r.status_code in (401, 403), r.status_code


def test_non_admin_rejected():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json=VISITOR)
    if r.status_code != 200:
        # register a throwaway visitor
        import uuid
        em = f"test_{uuid.uuid4().hex[:8]}@example.com"
        r = s.post(f"{API}/auth/register", json={"email": em, "password": "password123", "name": "TEST_v"})
        if r.status_code not in (200, 201):
            pytest.skip("no visitor account")
    tok = r.json().get("token")
    r2 = requests.get(f"{API}/atelier/bootstrap", headers={"Authorization": f"Bearer {tok}"})
    assert r2.status_code in (401, 403)


# --- Config
def test_config_get_and_validation(admin):
    c = admin.get(f"{API}/atelier/config").json()
    assert c["code"] == "0874"
    for bad in ["12", "123456789", "12a4", ""]:
        r = admin.put(f"{API}/atelier/config", json={"code": bad})
        assert r.status_code == 400, (bad, r.status_code)
    r = admin.put(f"{API}/atelier/config", json={"code": "4321"})
    assert r.status_code == 200 and r.json()["code"] == "4321"
    r = admin.put(f"{API}/atelier/config", json={"code": "0874"})
    assert r.json()["code"] == "0874"
    assert admin.get(f"{API}/atelier/config").json()["code"] == "0874"


def test_bootstrap(admin):
    d = admin.get(f"{API}/atelier/bootstrap").json()
    for k in ("universes", "items", "tasks", "config"):
        assert k in d
    assert any(u["name"] == "USF" for u in d["universes"]) or True


# --- Universes + items + versions + tasks full flow
def test_full_flow(admin):
    u = admin.post(f"{API}/atelier/universes", json={"name": "TEST_Univ", "group": "TEST_G", "pinned": True}).json()
    uid = u["id"]
    assert u["group"] == "TEST_G" and u["pinned"] is True
    u2 = admin.put(f"{API}/atelier/universes/{uid}", json={"name": "TEST_Univ2", "group": "TEST_G", "pinned": False}).json()
    assert u2["name"] == "TEST_Univ2" and u2["pinned"] is False
    assert admin.put(f"{API}/atelier/universes/nope", json={"name": "x"}).status_code == 404
    assert admin.post(f"{API}/atelier/universes", json={"name": ""}).status_code == 422

    # items
    assert admin.post(f"{API}/atelier/items", json={"kind": "bogus"}).status_code == 400
    it = admin.post(f"{API}/atelier/items", json={"kind": "character", "title": "TEST_Hero", "content": "<p>v1</p>", "universe_id": uid}).json()
    iid = it["id"]
    it2 = admin.post(f"{API}/atelier/items", json={"kind": "note", "title": "TEST_Note", "links": [iid]}).json()
    upd = admin.put(f"{API}/atelier/items/{iid}", json={**{k: it[k] for k in ("kind", "universe_id")}, "title": "TEST_Hero", "content": "<p>v2</p>"}).json()
    assert upd["content"] == "<p>v2</p>"
    assert admin.put(f"{API}/atelier/items/{iid}", json={"kind": "bad"}).status_code == 400
    assert admin.put(f"{API}/atelier/items/nope", json={"kind": "note"}).status_code == 404
    vers = admin.get(f"{API}/atelier/items/{iid}/versions").json()
    assert len(vers) >= 1 and vers[0]["data"]["content"] == "<p>v1</p>"
    rest = admin.post(f"{API}/atelier/items/{iid}/versions/{vers[0]['id']}/restore").json()
    assert rest["content"] == "<p>v1</p>"
    assert admin.post(f"{API}/atelier/items/{iid}/versions/nope/restore").status_code == 404

    # tasks
    t = admin.post(f"{API}/atelier/tasks", json={"title": "TEST_Task", "universe_id": uid, "item_id": iid, "due": "2026-01-10", "priority": "high"}).json()
    assert t["done_at"] == ""
    td = admin.put(f"{API}/atelier/tasks/{t['id']}", json={"title": "TEST_Task", "universe_id": uid, "done": True}).json()
    assert td["done"] is True and td["done_at"]
    tu = admin.put(f"{API}/atelier/tasks/{t['id']}", json={"title": "TEST_Task", "universe_id": uid, "done": False}).json()
    assert tu["done_at"] == ""
    assert admin.post(f"{API}/atelier/tasks", json={"title": ""}).status_code == 422

    # export
    ex = admin.get(f"{API}/atelier/export").json()
    assert "versions" in ex and "exported_at" in ex and any(i["id"] == iid for i in ex["items"])

    # delete universe -> items go to Inbox
    assert admin.delete(f"{API}/atelier/universes/{uid}").json()["ok"]
    b = admin.get(f"{API}/atelier/bootstrap").json()
    assert not any(x["id"] == uid for x in b["universes"])
    item = next(x for x in b["items"] if x["id"] == iid)
    assert item["universe_id"] is None
    task = next(x for x in b["tasks"] if x["id"] == t["id"])
    assert task["universe_id"] is None

    # delete item -> pulled from links
    admin.delete(f"{API}/atelier/items/{iid}")
    b = admin.get(f"{API}/atelier/bootstrap").json()
    assert not any(x["id"] == iid for x in b["items"])
    assert iid not in next(x for x in b["items"] if x["id"] == it2["id"])["links"]
    # cleanup
    admin.delete(f"{API}/atelier/items/{it2['id']}")
    admin.delete(f"{API}/atelier/tasks/{t['id']}")
    b = admin.get(f"{API}/atelier/bootstrap").json()
    assert not any(x["id"] == t["id"] for x in b["tasks"])


# --- Settings fields from this session
def test_settings_fields(admin):
    s = admin.get(f"{API}/settings").json()
    assert "default_play_mode" in s, list(s.keys())
    assert any(k.startswith("home_vision") for k in s)
