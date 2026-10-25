# Iteration 30: Page writer (chapters + episodes content), reader-edit save flow, paid gating safety
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def admin():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": "paytest@stationexus.com", "password": "password123"})
    if r.status_code != 200:
        pytest.skip("admin login failed")
    s.headers.update({"Authorization": f"Bearer {r.json()['token']}"})
    return s


@pytest.fixture(scope="module")
def created(admin):
    ids = []
    yield ids
    for cid in ids:
        admin.delete(f"{API}/creations/{cid}")


def _mk(admin, created, **kw):
    p = {"title": "TEST_PW " + kw.pop("suffix", ""), "category": "livres"}
    p.update(kw)
    r = admin.post(f"{API}/creations", json=p)
    assert r.status_code == 201, r.text
    created.append(r.json()["id"])
    return r.json()


# Episode model accepts content + rich and persists
def test_episode_content_persist(admin, created):
    c = _mk(admin, created, suffix="EP", launch_type="episodes", episodes=[
        {"title": "E1", "content": "<p>Texte ép 1</p>", "rich": True},
        {"title": "E2", "url": "https://example.com"}])
    g = admin.get(f"{API}/creations/{c['id']}").json()
    assert g["episodes"][0]["content"] == "<p>Texte ép 1</p>"
    assert g["episodes"][0]["rich"] is True
    assert g["episodes"][1]["url"] == "https://example.com"
    assert g["episodes"][1]["content"] == ""


# Reader-edit flow: full GET -> patch one chapter -> PUT keeps other chapters & episodes
def test_reader_edit_flow_keeps_other_chapters(admin, created):
    c = _mk(admin, created, suffix="CH", launch_type="chapters", chapters=[
        {"title": "C1", "content": "un", "rich": False},
        {"title": "C2", "content": "<p>deux</p>", "rich": True},
        {"title": "C3", "content": "<p>trois</p>", "rich": True}])
    full = admin.get(f"{API}/creations/{c['id']}", params={"media": 1}).json()
    ch2 = full["chapters"][1]["id"]
    full["chapters"] = [dict(x, content="<p>DEUX modifié</p>", rich=True, title="C2b") if x["id"] == ch2 else x for x in full["chapters"]]
    r = admin.put(f"{API}/creations/{c['id']}", json=full)
    assert r.status_code == 200
    g = admin.get(f"{API}/creations/{c['id']}").json()
    assert [x["title"] for x in g["chapters"]] == ["C1", "C2b", "C3"]
    assert g["chapters"][1]["content"] == "<p>DEUX modifié</p>"
    assert g["chapters"][0]["content"] == "un"
    assert g["chapters"][2]["content"] == "<p>trois</p>"
    assert g["chapters"][1]["id"] == ch2


# Paid creation: admin w/o purchase reads stripped locked chapters; saving that back must NOT wipe them
def test_paid_admin_edit_does_not_wipe_locked(admin, created):
    c = _mk(admin, created, suffix="PAID", launch_type="chapters", is_paid=True, price_eur=2, free_chapters=1, chapters=[
        {"title": "C1", "content": "<p>free</p>", "rich": True},
        {"title": "C2", "content": "<p>SECRET payant</p>", "rich": True}])
    full = admin.get(f"{API}/creations/{c['id']}", params={"media": 1}).json()
    print("admin sees locked chapter content:", repr(full["chapters"][1]["content"]), "locked:", full["chapters"][1].get("locked"))
    full["chapters"][0]["content"] = "<p>free edited</p>"
    admin.put(f"{API}/creations/{c['id']}", json=full)
    # flip to free to read actual stored content
    full2 = admin.get(f"{API}/creations/{c['id']}", params={"media": 1}).json()
    full2["is_paid"] = False
    admin.put(f"{API}/creations/{c['id']}", json=full2)
    g = admin.get(f"{API}/creations/{c['id']}").json()
    assert g["chapters"][1]["content"] == "<p>SECRET payant</p>", f"DATA LOSS: locked chapter content now {g['chapters'][1]['content']!r}"


# Paid episodes creation: episode content should be gated for anonymous users
def test_paid_episode_content_gated_anonymous(admin, created):
    c = _mk(admin, created, suffix="PAIDEP", launch_type="episodes", is_paid=True, price_eur=2, episodes=[
        {"title": "E1", "content": "<p>SECRET ep</p>", "rich": True}])
    g = requests.get(f"{API}/creations/{c['id']}").json()
    assert g["episodes"][0].get("content", "") == "", "paid episode content leaked to anonymous users"


# Non-admin cannot PUT
def test_put_requires_admin(admin, created):
    c = _mk(admin, created, suffix="AUTH", launch_type="chapters", chapters=[{"title": "C1", "content": "x"}])
    r = requests.put(f"{API}/creations/{c['id']}", json={"title": "hack"})
    assert r.status_code in (401, 403)
