"""Backend tests for boot intro feature: settings intro_type/intro_has_video + /api/intro/video."""
import os
import io
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://tengoku-launcher.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    yield s
    # cleanup: reset intro_type to tengoku + delete any uploaded video
    try:
        cur = s.get(f"{API}/settings", timeout=15).json()
        cur["intro_type"] = "tengoku"
        s.put(f"{API}/settings", json=cur, timeout=15)
        s.delete(f"{API}/intro/video", timeout=15)
    except Exception:
        pass


def test_get_settings_defaults(client):
    r = client.get(f"{API}/settings", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert "intro_type" in data
    assert "intro_has_video" in data
    assert isinstance(data["intro_has_video"], bool)


def test_put_settings_persists_intro_type(client):
    cur = client.get(f"{API}/settings", timeout=15).json()
    cur["intro_type"] = "neon"
    r = client.put(f"{API}/settings", json=cur, timeout=15)
    assert r.status_code == 200
    assert r.json()["intro_type"] == "neon"

    # verify persistence via GET
    got = client.get(f"{API}/settings", timeout=15).json()
    assert got["intro_type"] == "neon"


def test_upload_intro_video_small(client):
    # Small dummy mp4 (bytes only; content-type set)
    payload = b"\x00\x00\x00\x20ftypmp42" + b"0" * 1024  # ~1KB
    files = {"file": ("intro.mp4", io.BytesIO(payload), "video/mp4")}
    r = client.post(f"{API}/intro/video", files=files, timeout=30)
    assert r.status_code == 200, r.text

    s = client.get(f"{API}/settings", timeout=15).json()
    assert s["intro_has_video"] is True


def test_stream_intro_video(client):
    r = client.get(f"{API}/intro/video", timeout=30)
    assert r.status_code == 200
    ct = r.headers.get("content-type", "")
    assert "video" in ct.lower()
    assert len(r.content) > 0


def test_upload_intro_video_exceeds_limit(client):
    # >10MB
    big = b"\x00" * (10 * 1024 * 1024 + 1024)
    files = {"file": ("big.mp4", io.BytesIO(big), "video/mp4")}
    r = client.post(f"{API}/intro/video", files=files, timeout=60)
    assert r.status_code == 413


def test_delete_intro_video(client):
    r = client.delete(f"{API}/intro/video", timeout=15)
    assert r.status_code == 200
    s = client.get(f"{API}/settings", timeout=15).json()
    assert s["intro_has_video"] is False
    # subsequent GET should 404
    r2 = client.get(f"{API}/intro/video", timeout=15)
    assert r2.status_code == 404
