"""Backend tests for reading-audio endpoints (iteration 8)."""
import os
import io
import struct
import pytest
import requests

def _load_backend_url():
    url = os.environ.get("REACT_APP_BACKEND_URL")
    if not url:
        try:
            with open("/app/frontend/.env") as f:
                for line in f:
                    if line.startswith("REACT_APP_BACKEND_URL"):
                        url = line.split("=", 1)[1].strip()
                        break
        except Exception:
            pass
    assert url, "REACT_APP_BACKEND_URL not set"
    return url.rstrip("/")

BASE_URL = _load_backend_url()
API = f"{BASE_URL}/api"


def _wav_bytes(freq=440, seconds=1, sample_rate=8000):
    """Tiny WAV: valid RIFF header + silent PCM data of `seconds`."""
    n = int(sample_rate * seconds)
    pcm = b"\x00\x00" * n
    header = b"RIFF" + struct.pack("<I", 36 + len(pcm)) + b"WAVE"
    header += b"fmt " + struct.pack("<IHHIIHH", 16, 1, 1, sample_rate, sample_rate * 2, 2, 16)
    header += b"data" + struct.pack("<I", len(pcm))
    return header + pcm


@pytest.fixture
def creation_id():
    r = requests.post(f"{API}/creations", json={
        "title": "TEST_reading_audio",
        "type": "livre",
        "category": "livres",
        "launch_type": "chapters",
    })
    assert r.status_code in (200, 201), r.text
    cid = r.json()["id"]
    yield cid
    requests.delete(f"{API}/creations/{cid}")


def test_upload_get_delete_reading_audio(creation_id):
    cid = creation_id
    # initially no reading audio
    g0 = requests.get(f"{API}/creations/{cid}")
    assert g0.status_code == 200
    assert g0.json().get("has_reading_audio") is False

    # upload
    wav = _wav_bytes()
    up = requests.post(f"{API}/creations/{cid}/reading-audio",
                       files={"file": ("r.wav", wav, "audio/wav")})
    assert up.status_code == 200, up.text

    # has_reading_audio flipped
    g1 = requests.get(f"{API}/creations/{cid}")
    assert g1.json()["has_reading_audio"] is True

    # stream
    st = requests.get(f"{API}/creations/{cid}/reading-audio")
    assert st.status_code == 200
    assert "audio" in st.headers.get("content-type", "")
    assert st.content[:4] == b"RIFF"

    # delete
    d = requests.delete(f"{API}/creations/{cid}/reading-audio")
    assert d.status_code == 200

    g2 = requests.get(f"{API}/creations/{cid}")
    assert g2.json()["has_reading_audio"] is False

    st2 = requests.get(f"{API}/creations/{cid}/reading-audio")
    assert st2.status_code == 404


def test_reading_audio_size_limit(creation_id):
    big = b"\x00" * (12 * 1024 * 1024 + 100)
    r = requests.post(f"{API}/creations/{creation_id}/reading-audio",
                     files={"file": ("big.wav", big, "audio/wav")})
    assert r.status_code == 413


def test_reading_audio_not_found():
    r = requests.get(f"{API}/creations/nonexistent-id/reading-audio")
    assert r.status_code == 404


def test_delete_creation_cascades_reading_media():
    r = requests.post(f"{API}/creations", json={
        "title": "TEST_cascade_reading",
        "type": "livre",
        "category": "livres",
        "launch_type": "chapters",
    })
    cid = r.json()["id"]
    up = requests.post(f"{API}/creations/{cid}/reading-audio",
                     files={"file": ("r.wav", _wav_bytes(), "audio/wav")})
    assert up.status_code == 200

    # delete creation
    d = requests.delete(f"{API}/creations/{cid}")
    assert d.status_code in (200, 204)

    # reading audio must be gone
    st = requests.get(f"{API}/creations/{cid}/reading-audio")
    assert st.status_code == 404
