# Atelier Nexus: links CRUD (bureau/salon) + version throttle (max 1 per 5 min)
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN = {"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"}


@pytest.fixture(scope="module")
def admin():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json=ADMIN)
    if r.status_code != 200:
        pytest.skip("admin login failed")
    s.headers["Authorization"] = f"Bearer {r.json()['token']}"
    return s


def test_links_crud(admin):
    assert requests.post(f"{API}/atelier/links", json={"title": "x", "url": "y"}).status_code in (401, 403)
    assert admin.post(f"{API}/atelier/links", json={"title": "", "url": "y"}).status_code == 422
    l = admin.post(f"{API}/atelier/links", json={"title": "TEST_link", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "kind": "watch"}).json()
    lid = l["id"]
    try:
        b = admin.get(f"{API}/atelier/bootstrap").json()
        assert "links" in b and any(x["id"] == lid for x in b["links"])
        u = admin.put(f"{API}/atelier/links/{lid}", json={"title": "TEST_link2", "url": "https://example.com", "kind": "listen"}).json()
        assert u["title"] == "TEST_link2" and u["kind"] == "listen" and "_id" not in u
        assert admin.put(f"{API}/atelier/links/nope", json={"title": "a", "url": "b"}).status_code == 404
    finally:
        assert admin.delete(f"{API}/atelier/links/{lid}").json()["ok"]
    b = admin.get(f"{API}/atelier/bootstrap").json()
    assert not any(x["id"] == lid for x in b["links"])


def test_version_throttle(admin):
    it = admin.post(f"{API}/atelier/items", json={"kind": "note", "title": "TEST_v", "content": "<p>1</p>"}).json()
    try:
        for c in ("<p>2</p>", "<p>3</p>", "<p>4</p>"):
            admin.put(f"{API}/atelier/items/{it['id']}", json={"kind": "note", "title": "TEST_v", "content": c})
        vers = admin.get(f"{API}/atelier/items/{it['id']}/versions").json()
        assert len(vers) == 1, len(vers)
        assert vers[0]["data"]["content"] == "<p>1</p>"
    finally:
        admin.delete(f"{API}/atelier/items/{it['id']}")
