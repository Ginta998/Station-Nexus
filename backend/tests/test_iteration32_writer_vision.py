# Iteration 32: episode content/rich, chapter save via PUT keeps other units, settings home_vision + play mode + intro types
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def admin():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"})
    if r.status_code != 200:
        pytest.skip("admin login failed")
    s.headers.update({"Authorization": f"Bearer {r.json()['token']}"})
    return s


@pytest.fixture(scope="module")
def test_creation(admin):
    r = admin.post(f"{API}/creations", json={
        "title": "TEST_IT32 Writer", "category": "livres", "launch_type": "chapters",
        "chapters": [{"title": "Ch A", "content": "<p>A</p>", "rich": True}, {"title": "Ch B", "content": "<p>B</p>", "rich": True}],
        "episodes": [{"title": "Ep A", "content": "<p><b>Ep</b> texte</p>", "rich": True}],
    })
    assert r.status_code == 201, r.text
    c = r.json()
    yield c
    admin.delete(f"{API}/creations/{c['id']}")
    assert requests.get(f"{API}/creations/{c['id']}").status_code == 404


# Episode model persists content + rich
def test_episode_content_persisted(admin, test_creation):
    g = admin.get(f"{API}/creations/{test_creation['id']}", params={"media": 1}).json()
    ep = g["episodes"][0]
    assert ep["content"] == "<p><b>Ep</b> texte</p>"
    assert ep["rich"] is True


# Chapter save (like ChapterReader.saveEdit) keeps other chapters/episodes
def test_chapter_save_keeps_others(admin, test_creation):
    cid = test_creation["id"]
    full = admin.get(f"{API}/creations/{cid}", params={"media": 1}).json()
    chs = full["chapters"]
    chs[1] = {**chs[1], "title": "Ch B modifié", "content": "<p style=\"text-align:center\"><b>Nouveau</b></p>", "rich": True}
    r = admin.put(f"{API}/creations/{cid}", json={**full, "chapters": chs})
    assert r.status_code == 200, r.text
    g = admin.get(f"{API}/creations/{cid}", params={"media": 1}).json()
    assert len(g["chapters"]) == 2 and len(g["episodes"]) == 1
    assert g["chapters"][1]["title"] == "Ch B modifié"
    assert "text-align:center" in g["chapters"][1]["content"]
    assert g["chapters"][0]["content"] == "<p>A</p>"
    assert g["episodes"][0]["content"] == "<p><b>Ep</b> texte</p>"


# Empty chapters list in PUT must not wipe (guard)
def test_put_empty_lists_does_not_wipe(admin, test_creation):
    cid = test_creation["id"]
    full = admin.get(f"{API}/creations/{cid}", params={"media": 1}).json()
    r = admin.put(f"{API}/creations/{cid}", json={**full, "chapters": [], "episodes": []})
    assert r.status_code == 200
    g = admin.get(f"{API}/creations/{cid}", params={"media": 1}).json()
    assert len(g["chapters"]) == 2 and len(g["episodes"]) == 1


# Settings defaults include new fields
def test_settings_new_fields():
    s = requests.get(f"{API}/settings").json()
    assert s["default_play_mode"] in ("loop", "sequence", "shuffle")
    for k in ("home_vision_title", "home_vision_text", "home_vision_image", "intro_type"):
        assert k in s
    assert isinstance(s["home_vision_title"], str)


# home_vision + intro_type round-trip, restored
def test_home_vision_and_intro_roundtrip(admin):
    orig = requests.get(f"{API}/settings").json()
    try:
        r = admin.put(f"{API}/settings", json={**orig, "home_vision_title": "TEST_Vision", "home_vision_text": "TEST texte", "intro_type": "warp", "default_play_mode": "sequence"})
        assert r.status_code == 200
        g = requests.get(f"{API}/settings").json()
        assert g["home_vision_title"] == "TEST_Vision"
        assert g["home_vision_text"] == "TEST texte"
        assert g["intro_type"] == "warp"
        assert g["default_play_mode"] == "sequence"
    finally:
        admin.put(f"{API}/settings", json=orig)
    g = requests.get(f"{API}/settings").json()
    assert g["home_vision_title"] == orig["home_vision_title"] and g["intro_type"] == orig["intro_type"]


# Non-admin cannot change settings
def test_settings_put_unauth():
    assert requests.put(f"{API}/settings", json={"home_vision_title": "x"}).status_code in (401, 403)


# Ambiences list available for music menu / jukebox
def test_ambiences_list():
    r = requests.get(f"{API}/ambiences")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
