# Iteration 28: SiteSettings featured_ids persistence (multi "À la une")
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")


@pytest.fixture(scope="module")
def original():
    r = requests.get(f"{BASE_URL}/api/settings", timeout=20)
    assert r.status_code == 200
    orig = r.json()
    yield orig
    rr = requests.put(f"{BASE_URL}/api/settings", json=orig, timeout=20)
    assert rr.status_code == 200
    assert rr.json().get("featured_ids") == orig.get("featured_ids")


def test_get_has_featured_ids(original):
    assert "featured_ids" in original
    assert isinstance(original["featured_ids"], list)


def test_put_featured_ids_persists(original):
    ids = ["TEST_a", "TEST_b", "TEST_c"]
    payload = {**original, "featured_ids": ids, "featured_creation_id": "TEST_a"}
    r = requests.put(f"{BASE_URL}/api/settings", json=payload, timeout=20)
    assert r.status_code == 200
    assert r.json()["featured_ids"] == ids
    g = requests.get(f"{BASE_URL}/api/settings", timeout=20).json()
    assert g["featured_ids"] == ids
    assert g["featured_creation_id"] == "TEST_a"
    # other fields untouched
    assert g["name"] == original["name"]
    assert g.get("default_theme") == original.get("default_theme")


def test_put_empty_featured_ids(original):
    payload = {**original, "featured_ids": []}
    r = requests.put(f"{BASE_URL}/api/settings", json=payload, timeout=20)
    assert r.status_code == 200
    assert requests.get(f"{BASE_URL}/api/settings", timeout=20).json()["featured_ids"] == []


# Poster thumbnail (?w=360) vs original
def _first_creation_with_poster():
    cs = requests.get(f"{BASE_URL}/api/creations", timeout=30).json()
    for c in cs:
        r = requests.get(f"{BASE_URL}/api/creations/{c['id']}/poster", timeout=30)
        if r.status_code == 200 and len(r.content) > 50000:
            return c["id"], r
    pytest.skip("no creation with big poster")


def test_poster_thumb_smaller():
    cid, full = _first_creation_with_poster()
    t = requests.get(f"{BASE_URL}/api/creations/{cid}/poster?w=360", timeout=30)
    assert t.status_code == 200
    assert t.headers["content-type"].startswith("image/jpeg")
    assert len(t.content) < len(full.content) / 2, (len(t.content), len(full.content))
    from PIL import Image
    import io
    assert Image.open(io.BytesIO(t.content)).size[0] <= 360


def test_poster_404():
    r = requests.get(f"{BASE_URL}/api/creations/TEST_nope/poster?w=360", timeout=20)
    assert r.status_code == 404
