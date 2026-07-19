"""Iteration 3 backend tests: creation bg_image/blur/dim/gallery/embeds + ambience audio autoplay source."""
import io
import os
import struct
import wave
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip()
                    break
    except Exception:
        pass
BASE_URL = (BASE_URL or "").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


def _tiny_wav_bytes():
    """Generate a valid 0.1s mono 8kHz silent WAV in-memory."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(8000)
        w.writeframes(b"\x00\x00" * 800)
    return buf.getvalue()


# ---------- Creation with new iteration-3 fields ----------
class TestCreationBgAndMedia:
    cid = None

    def test_create_with_defaults(self, s):
        # Do NOT send bg_blur / bg_dim, expect defaults
        payload = {"title": "TEST_I3_Defaults", "category": "livres", "launch_type": "info"}
        r = s.post(f"{API}/creations", json=payload)
        assert r.status_code == 201, r.text
        d = r.json()
        assert d["bg_blur"] == 32
        assert d["bg_dim"] == 0.55
        assert d["bg_image"] == ""
        assert d["gallery"] == []
        assert d["embeds"] == []
        s.delete(f"{API}/creations/{d['id']}")

    def test_create_with_all_fields(self, s):
        payload = {
            "title": "TEST_I3_Full", "category": "films", "launch_type": "info",
            "bg_image": "data:image/png;base64,AAAA",
            "bg_blur": 12, "bg_dim": 0.3,
            "gallery": ["data:image/png;base64,BBBB", "data:image/png;base64,CCCC"],
            "embeds": [
                {"platform": "youtube", "url": "https://youtu.be/dQw4w9WgXcQ", "label": "Clip"},
                {"platform": "wattpad", "url": "https://www.wattpad.com/story/12345", "label": "Chap"},
            ],
        }
        r = s.post(f"{API}/creations", json=payload)
        assert r.status_code == 201, r.text
        d = r.json()
        TestCreationBgAndMedia.cid = d["id"]
        assert d["bg_image"].startswith("data:image/png")
        assert d["bg_blur"] == 12
        assert d["bg_dim"] == 0.3
        assert len(d["gallery"]) == 2
        assert len(d["embeds"]) == 2
        assert d["embeds"][0]["platform"] == "youtube"
        # Every embed has an auto-generated id
        assert all(e.get("id") for e in d["embeds"])

    def test_get_returns_fields_intact(self, s):
        cid = TestCreationBgAndMedia.cid
        r = s.get(f"{API}/creations/{cid}")
        assert r.status_code == 200
        d = r.json()
        assert d["bg_blur"] == 12
        assert d["bg_dim"] == 0.3
        assert len(d["gallery"]) == 2
        assert d["embeds"][1]["platform"] == "wattpad"
        assert d["embeds"][1]["url"].startswith("https://www.wattpad.com")

    def test_put_updates_bg_and_media(self, s):
        cid = TestCreationBgAndMedia.cid
        payload = {
            "title": "TEST_I3_Full", "category": "films", "launch_type": "info",
            "bg_image": "data:image/png;base64,ZZZZ",
            "bg_blur": 50, "bg_dim": 0.8,
            "gallery": ["data:image/png;base64,DDDD"],
            "embeds": [{"platform": "other", "url": "https://example.com/x", "label": "site"}],
        }
        r = s.put(f"{API}/creations/{cid}", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["bg_blur"] == 50
        assert d["bg_dim"] == 0.8
        assert len(d["gallery"]) == 1
        assert d["embeds"][0]["platform"] == "other"
        # persistence
        g = s.get(f"{API}/creations/{cid}").json()
        assert g["bg_image"].endswith("ZZZZ")
        assert g["bg_blur"] == 50

    def test_cleanup(self, s):
        cid = TestCreationBgAndMedia.cid
        r = s.delete(f"{API}/creations/{cid}")
        assert r.status_code == 200


# ---------- Ambience audio pipeline (autoplay source) ----------
class TestAmbienceAudioForAutoplay:
    aid = None

    def test_setup_ambience(self, s):
        r = s.post(f"{API}/ambiences", json={"title": "TEST_I3_Amb", "emoji": "🌊", "order": 99})
        assert r.status_code == 201
        TestAmbienceAudioForAutoplay.aid = r.json()["id"]

    def test_upload_tiny_wav(self, s):
        aid = TestAmbienceAudioForAutoplay.aid
        wav = _tiny_wav_bytes()
        assert wav[:4] == b"RIFF"
        files = {"file": ("t.wav", io.BytesIO(wav), "audio/wav")}
        r = s.post(f"{API}/ambiences/{aid}/audio", files=files)
        assert r.status_code == 200, r.text

    def test_stream_returns_audio_bytes(self, s):
        aid = TestAmbienceAudioForAutoplay.aid
        r = s.get(f"{API}/ambiences/{aid}/audio")
        assert r.status_code == 200
        ct = r.headers.get("content-type", "")
        assert ct.startswith("audio/"), f"Expected audio/*, got {ct}"
        assert len(r.content) > 100
        assert r.content[:4] == b"RIFF"

    def test_cleanup(self, s):
        aid = TestAmbienceAudioForAutoplay.aid
        r = s.delete(f"{API}/ambiences/{aid}")
        assert r.status_code == 200
        # audio gone
        r2 = s.get(f"{API}/ambiences/{aid}/audio")
        assert r2.status_code == 404
