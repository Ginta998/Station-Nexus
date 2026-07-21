"""Iteration 13 — Inline media assets endpoints (image + audio) for chapters."""
import os
import io
import struct
import zlib
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or "https://tengoku-launcher.preview.emergentagent.com"
CID = "ce854e11-5c46-47eb-be22-5bae3279c721"  # Born X Burn


def _tiny_png() -> bytes:
    # 1x1 transparent PNG
    sig = b"\x89PNG\r\n\x1a\n"
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 6, 0, 0, 0))
    idat = chunk(b"IDAT", zlib.compress(b"\x00\x00\x00\x00\x00"))
    iend = chunk(b"IEND", b"")
    return sig + ihdr + idat + iend


def _tiny_mp3() -> bytes:
    # minimal fake mp3 bytes with mp3 header pattern
    return b"\xff\xfb\x90\x00" + b"\x00" * 256


@pytest.fixture(scope="module")
def s():
    return requests.Session()


class TestAssetsRoundtrip:
    def test_image_upload_list_get_delete(self, s):
        # UPLOAD image
        files = {"file": ("test.png", _tiny_png(), "image/png")}
        data = {"kind": "image", "name": "TEST_it13_image"}
        r = s.post(f"{BASE_URL}/api/creations/{CID}/assets", files=files, data=data)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["kind"] == "image"
        assert body["name"] == "TEST_it13_image"
        assert body["content_type"].startswith("image/")
        assert "id" in body
        aid = body["id"]

        # LIST
        r = s.get(f"{BASE_URL}/api/creations/{CID}/assets")
        assert r.status_code == 200
        lst = r.json()
        assert any(a["id"] == aid for a in lst)
        # data field must not be exposed
        for a in lst:
            assert "data" not in a

        # GET bytes
        r = s.get(f"{BASE_URL}/api/assets/{aid}")
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("image/")
        assert r.content[:8] == b"\x89PNG\r\n\x1a\n"

        # DELETE
        r = s.delete(f"{BASE_URL}/api/assets/{aid}")
        assert r.status_code == 200

        # GET after delete -> 404
        r = s.get(f"{BASE_URL}/api/assets/{aid}")
        assert r.status_code == 404

    def test_audio_upload_get_delete(self, s):
        files = {"file": ("track.mp3", _tiny_mp3(), "audio/mpeg")}
        data = {"kind": "audio", "name": "TEST_it13_audio"}
        r = s.post(f"{BASE_URL}/api/creations/{CID}/assets", files=files, data=data)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["kind"] == "audio"
        assert body["content_type"].startswith("audio/")
        aid = body["id"]

        # GET
        r = s.get(f"{BASE_URL}/api/assets/{aid}")
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("audio/")
        assert len(r.content) > 100

        # DELETE
        r = s.delete(f"{BASE_URL}/api/assets/{aid}")
        assert r.status_code == 200

    def test_get_missing_asset_404(self, s):
        r = s.get(f"{BASE_URL}/api/assets/does-not-exist-xyz")
        assert r.status_code == 404
