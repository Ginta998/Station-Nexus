# Iteration 29: admin security (JWT is_admin, PIN removed) + Journal de bord API
import os
import uuid
import base64
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"
ADMIN = {"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"}
PNG = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")


@pytest.fixture(scope="module")
def admin_h():
    r = requests.post(f"{API}/auth/login", json=ADMIN)
    if r.status_code != 200:
        pytest.skip("admin login failed")
    assert r.json()["user"]["is_admin"] is True
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture(scope="module")
def user_h():
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": "password123", "name": "TEST_user"})
    assert r.status_code in (200, 201), r.text
    assert not r.json()["user"].get("is_admin")
    return {"Authorization": f"Bearer {r.json()['token']}"}


def _protected_calls():
    return [
        ("put", "/settings", {"json": {}}),
        ("post", "/ambiences", {"json": {"name": "TEST_amb"}}),
        ("put", "/site/icon", {"json": {"icon": ""}}),
        ("post", "/creations", {"json": {"title": "TEST_c", "category": "livres"}}),
        ("post", "/categories", {"json": {"name": "TEST_cat", "slug": "test-cat"}}),
        ("post", "/journal", {"json": {"title": "TEST_j"}}),
        ("post", "/journal-files", {"files": {"file": ("a.png", PNG, "image/png")}}),
        ("get", "/subscribers", {}),
    ]


# --- Security: 401 without token
@pytest.mark.parametrize("method,path,kw", _protected_calls())
def test_no_token_401(method, path, kw):
    r = getattr(requests, method)(f"{API}{path}", **kw)
    assert r.status_code == 401, f"{method} {path} -> {r.status_code} {r.text[:200]}"


# --- Security: 403 with non-admin
@pytest.mark.parametrize("method,path,kw", _protected_calls())
def test_non_admin_403(user_h, method, path, kw):
    r = getattr(requests, method)(f"{API}{path}", headers=user_h, **kw)
    assert r.status_code == 403, f"{method} {path} -> {r.status_code} {r.text[:200]}"


# --- Security: File(...)-based upload endpoints must also be protected
@pytest.mark.parametrize("path", [
    "/creations/nonexistent-xyz/audio",
    "/creations/nonexistent-xyz/reading-audio",
    "/creations/nonexistent-xyz/chapters/x/audio",
    "/creations/nonexistent-xyz/video",
    "/ambiences/nonexistent-xyz/audio",
])
def test_upload_endpoints_require_auth(path):
    r = requests.post(f"{API}{path}", files={"file": ("a.txt", b"x", "text/plain")})
    assert r.status_code == 401, f"{path} -> {r.status_code} {r.text[:200]} (auth bypass)"


def test_claim_admin_removed():
    r = requests.post(f"{API}/auth/claim-admin", json={"pin": "1234"})
    assert r.status_code in (404, 405)


@pytest.mark.parametrize("path", ["/settings", "/creations", "/journal", "/journal/categories", "/ambiences"])
def test_public_gets(path):
    assert requests.get(f"{API}{path}").status_code == 200


def test_settings_no_pin_field():
    assert "pin" not in requests.get(f"{API}/settings").json()


# --- Admin success paths (harmless)
def test_admin_settings_put_roundtrip(admin_h):
    s = requests.get(f"{API}/settings").json()
    r = requests.put(f"{API}/settings", json=s, headers=admin_h)
    assert r.status_code == 200, r.text


def test_admin_subscribers_list(admin_h):
    r = requests.get(f"{API}/subscribers", headers=admin_h)
    assert r.status_code == 200 and isinstance(r.json(), list)


def test_admin_ambience_create_delete(admin_h):
    r = requests.post(f"{API}/ambiences", json={"title": "TEST_amb"}, headers=admin_h)
    assert r.status_code == 201, r.text
    d = requests.delete(f"{API}/ambiences/{r.json()['id']}", headers=admin_h)
    assert d.status_code == 200


# --- Journal full flow
def test_journal_full_flow(admin_h):
    creations = requests.get(f"{API}/creations").json()
    assert creations
    cid = creations[0]["id"]
    # category create
    cat = requests.post(f"{API}/journal/categories", json={"name": "TEST_cat", "color": "#123456"}, headers=admin_h)
    assert cat.status_code == 201
    cat_id = cat.json()["id"]
    up = requests.put(f"{API}/journal/categories/{cat_id}", json={"name": "TEST_cat2", "color": "#654321"}, headers=admin_h)
    assert up.status_code == 200 and up.json()["name"] == "TEST_cat2"
    # file upload
    f = requests.post(f"{API}/journal-files", files={"file": ("a.png", PNG, "image/png")}, headers=admin_h)
    assert f.status_code == 200, f.text
    url = f.json()["url"]
    g = requests.get(f"{BASE_URL}{url}")
    assert g.status_code == 200 and g.content == PNG
    # entry
    payload = {"title": "TEST_entry", "subtitle": "sub", "category_id": cat_id, "creation_id": cid, "date": "2099-05-10",
               "cover": url, "show_home": True, "published": True,
               "blocks": [{"type": "text", "text": "Bonjour le journal"}, {"type": "heading", "text": "H"},
                          {"type": "quote", "text": "Q", "author": "A"},
                          {"type": "youtube", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
                          {"type": "image", "url": url, "wide": True}, {"type": "evil", "text": "x"}]}
    e = requests.post(f"{API}/journal", json=payload, headers=admin_h)
    assert e.status_code == 201, e.text
    eid = e.json()["id"]
    assert len(e.json()["blocks"]) == 5 and all(b["type"] != "evil" for b in e.json()["blocks"])
    # draft
    dr = requests.post(f"{API}/journal", json={"title": "TEST_draft", "published": False, "date": "2099-05-11"}, headers=admin_h)
    did = dr.json()["id"]
    try:
        lst = requests.get(f"{API}/journal").json()
        item = next(x for x in lst if x["id"] == eid)
        assert item["excerpt"].startswith("Bonjour") and "blocks" not in item
        assert all(x["id"] != did for x in lst)
        assert requests.get(f"{API}/journal/{did}").status_code == 404
        assert requests.get(f"{API}/journal/{did}", headers=admin_h).status_code == 200
        assert any(x["id"] == did for x in requests.get(f"{API}/journal", headers=admin_h).json())
        # filters
        assert [x["id"] for x in requests.get(f"{API}/journal", params={"category": cat_id}).json()] == [eid]
        assert eid in [x["id"] for x in requests.get(f"{API}/journal", params={"creation_id": cid}).json()]
        assert [x["id"] for x in requests.get(f"{API}/journal", params={"month": "2099-05"}).json()] == [eid]
        assert eid in [x["id"] for x in requests.get(f"{API}/journal", params={"home": 1}).json()]
        assert requests.get(f"{API}/journal", params={"month": "2099-04"}).json() == []
        # update
        p2 = {**payload, "title": "TEST_entry_upd"}
        u = requests.put(f"{API}/journal/{eid}", json=p2, headers=admin_h)
        assert u.status_code == 200
        assert requests.get(f"{API}/journal/{eid}").json()["title"] == "TEST_entry_upd"
        # non-admin cannot update/delete
        assert requests.put(f"{API}/journal/{eid}", json=p2).status_code == 401
        assert requests.delete(f"{API}/journal/{eid}").status_code == 401
        # category delete clears category_id
        assert requests.delete(f"{API}/journal/categories/{cat_id}", headers=admin_h).status_code == 200
        assert requests.get(f"{API}/journal/{eid}").json()["category_id"] == ""
    finally:
        requests.delete(f"{API}/journal/categories/{cat_id}", headers=admin_h)
        assert requests.delete(f"{API}/journal/{eid}", headers=admin_h).status_code == 200
        requests.delete(f"{API}/journal/{did}", headers=admin_h)
    assert requests.get(f"{API}/journal/{eid}").status_code == 404


def test_journal_default_categories():
    names = [c["name"] for c in requests.get(f"{API}/journal/categories").json()]
    for n in ["Nouveautés", "Coulisses", "Making-of", "Croquis", "Annonces"]:
        assert n in names
