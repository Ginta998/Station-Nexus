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
