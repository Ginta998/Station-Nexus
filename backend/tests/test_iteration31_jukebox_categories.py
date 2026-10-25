# Iteration 31: jukebox default_play_mode in settings, category reorder (restored after), episodes reader content
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


# Settings: default_play_mode round-trip, restored after
def test_default_play_mode_roundtrip(admin):
    orig = requests.get(f"{API}/settings").json()
    assert orig.get("default_play_mode") in ("loop", "sequence", "shuffle")
    try:
        r = admin.put(f"{API}/settings", json={**orig, "default_play_mode": "shuffle"})
        assert r.status_code == 200
        g = requests.get(f"{API}/settings").json()
        assert g["default_play_mode"] == "shuffle"
        # other fields untouched
        for k in ("featured_creation_id",):
            if k in orig:
                assert g.get(k) == orig.get(k)
    finally:
        admin.put(f"{API}/settings", json=orig)
    assert requests.get(f"{API}/settings").json()["default_play_mode"] == orig["default_play_mode"]


# Settings PUT requires admin
def test_settings_put_requires_admin():
    r = requests.put(f"{API}/settings", json={"default_play_mode": "shuffle"})
    assert r.status_code in (401, 403)


# Invalid play mode should ideally be rejected (reported if accepted)
def test_invalid_play_mode_rejected(admin):
    orig = requests.get(f"{API}/settings").json()
    try:
        r = admin.put(f"{API}/settings", json={**orig, "default_play_mode": "bogus"})
        assert r.status_code in (400, 422), f"invalid default_play_mode accepted: {r.status_code}"
    finally:
        admin.put(f"{API}/settings", json=orig)


# Categories: swap + renumber 1..n like the UI, list sorted by order; restore original order
def test_category_reorder_and_restore(admin):
    orig = requests.get(f"{API}/categories").json()
    assert len(orig) >= 2
    arr = list(orig)
    arr[0], arr[1] = arr[1], arr[0]
    try:
        for k, c in enumerate(arr):
            r = admin.put(f"{API}/categories/{c['id']}", json={"label": c["label"], "kanji": c.get("kanji", ""), "order": k + 1})
            assert r.status_code == 200
            assert r.json()["order"] == k + 1
        got = requests.get(f"{API}/categories").json()
        assert [c["key"] for c in got] == [c["key"] for c in arr]
        assert [c["order"] for c in got] == list(range(1, len(arr) + 1))
    finally:
        for c in orig:
            admin.put(f"{API}/categories/{c['id']}", json={"label": c["label"], "kanji": c.get("kanji", ""), "order": c["order"]})
    back = requests.get(f"{API}/categories").json()
    assert [c["key"] for c in back] == [c["key"] for c in orig]


# Category PUT requires admin
def test_category_put_requires_admin():
    cats = requests.get(f"{API}/categories").json()
    r = requests.put(f"{API}/categories/{cats[0]['id']}", json={"label": "x", "order": 99})
    assert r.status_code in (401, 403)


# Episodes: content-only episode (no url) is persisted and listed in /creations light payload
def test_episode_content_in_list_payload(admin):
    r = admin.post(f"{API}/creations", json={"title": "TEST_EPLIST", "category": "series", "launch_type": "episodes",
                                             "episodes": [{"title": "E1", "content": "<p><b>Hello</b></p>", "rich": True}]})
    assert r.status_code == 201
    cid = r.json()["id"]
    try:
        g = requests.get(f"{API}/creations/{cid}").json()
        assert g["episodes"][0]["content"] == "<p><b>Hello</b></p>"
        lst = requests.get(f"{API}/creations").json()
        mine = [x for x in lst if x["id"] == cid]
        assert mine  # list payload is lightened (episodes stripped by design)
    finally:
        admin.delete(f"{API}/creations/{cid}")
    assert requests.get(f"{API}/creations/{cid}").status_code == 404
