"""Iteration 11: per-chapter music, rich chapters round-trip, image preservation regression, list payload lightness."""
import os
import io
import json
import struct
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
API = f"{BASE_URL}/api"


def _mp3_bytes(size=2048):
    # minimal fake mp3 header + padding
    return b"ID3\x03\x00\x00\x00\x00\x00\x00" + b"\x00" * (size - 10)


def _png_data_uri():
    # 1x1 red png
    import base64
    png = bytes.fromhex(
        "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4"
        "890000000D49444154789C6360F80F0400010101007A17E4B70000000049454E44AE426082"
    )
    return "data:image/png;base64," + base64.b64encode(png).decode()


@pytest.fixture(scope="module")
def creation_with_chapters():
    payload = {
        "title": "TEST_iter11_book",
        "category": "livres",
        "launch_type": "chapters",
        "poster": _png_data_uri(),
        "bg_image": _png_data_uri(),
        "chapters": [
            {"title": "TEST_ch1", "content": "Chapter 1 body", "image": ""},
            {"title": "TEST_ch2", "content": "Chapter 2 body", "image": ""},
        ],
    }
    r = requests.post(f"{API}/creations", json=payload)
    assert r.status_code == 201, r.text
    cr = r.json()
    yield cr
    requests.delete(f"{API}/creations/{cr['id']}")


def test_list_light_payload(creation_with_chapters):
    r = requests.get(f"{API}/creations")
    assert r.status_code == 200
    body = r.text
    # payload should be light (no huge base64) — well under 200KB
    assert len(body) < 200_000, f"list payload too heavy: {len(body)}"
    data = r.json()
    found = [c for c in data if c["id"] == creation_with_chapters["id"]]
    assert found and found[0]["has_poster"] is True and found[0]["has_bg"] is True
    assert found[0]["poster"] == "" and found[0]["bg_image"] == ""


def test_poster_bg_endpoints(creation_with_chapters):
    cid = creation_with_chapters["id"]
    r = requests.get(f"{API}/creations/{cid}/poster")
    assert r.status_code == 200 and r.headers["content-type"].startswith("image/")
    r = requests.get(f"{API}/creations/{cid}/bg")
    assert r.status_code == 200 and r.headers["content-type"].startswith("image/")


def test_chapter_audio_full_cycle(creation_with_chapters):
    cid = creation_with_chapters["id"]
    detail = requests.get(f"{API}/creations/{cid}").json()
    ch1_id = detail["chapters"][0]["id"]
    ch2_id = detail["chapters"][1]["id"]

    # upload to ch1
    files = {"file": ("t.mp3", _mp3_bytes(), "audio/mpeg")}
    r = requests.post(f"{API}/creations/{cid}/chapters/{ch1_id}/audio", files=files)
    assert r.status_code == 200, r.text

    # verify flags
    detail = requests.get(f"{API}/creations/{cid}").json()
    ch_map = {c["id"]: c for c in detail["chapters"]}
    assert ch_map[ch1_id]["has_music"] is True
    assert ch_map[ch2_id]["has_music"] is False

    # stream
    r = requests.get(f"{API}/creations/{cid}/chapters/{ch1_id}/audio")
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("audio/")
    assert len(r.content) > 100

    # delete
    r = requests.delete(f"{API}/creations/{cid}/chapters/{ch1_id}/audio")
    assert r.status_code == 200
    detail = requests.get(f"{API}/creations/{cid}").json()
    ch_map = {c["id"]: c for c in detail["chapters"]}
    assert ch_map[ch1_id]["has_music"] is False


def test_chapter_audio_404_bad_chapter(creation_with_chapters):
    cid = creation_with_chapters["id"]
    files = {"file": ("t.mp3", _mp3_bytes(), "audio/mpeg")}
    r = requests.post(f"{API}/creations/{cid}/chapters/nonexistent-id/audio", files=files)
    assert r.status_code == 404


def test_chapter_audio_413_too_big(creation_with_chapters):
    cid = creation_with_chapters["id"]
    detail = requests.get(f"{API}/creations/{cid}").json()
    ch_id = detail["chapters"][0]["id"]
    big = b"\x00" * (12 * 1024 * 1024 + 100)
    files = {"file": ("big.mp3", big, "audio/mpeg")}
    r = requests.post(f"{API}/creations/{cid}/chapters/{ch_id}/audio", files=files)
    assert r.status_code == 413


def test_rich_chapter_roundtrip_and_image_preservation(creation_with_chapters):
    cid = creation_with_chapters["id"]
    # Simulate frontend edit flow: fetch with media=1, modify chapters (rich=true), PUT back
    full = requests.get(f"{API}/creations/{cid}", params={"media": 1}).json()
    assert full["poster"].startswith("data:image/")
    assert full["bg_image"].startswith("data:image/")

    full["chapters"][0]["content"] = "<h2>Title</h2><p><strong>bold</strong> <em>ital</em></p>"
    full["chapters"][0]["rich"] = True

    # Strip fields not in CreationInput
    payload = {k: full[k] for k in [
        "title", "kanji", "category", "tagline", "synopsis", "poster", "accent",
        "bg_image", "bg_blur", "bg_dim", "gallery", "embeds", "launch_type",
        "launch_label", "launch_content", "launch_url", "buy_url", "episodes",
        "chapters", "coming_soon", "order"
    ] if k in full}
    r = requests.put(f"{API}/creations/{cid}", json=payload)
    assert r.status_code == 200, r.text

    # Re-fetch full and confirm chapter is rich=true and images preserved
    full2 = requests.get(f"{API}/creations/{cid}", params={"media": 1}).json()
    assert full2["chapters"][0]["rich"] is True
    assert "<strong>" in full2["chapters"][0]["content"]
    assert full2["poster"].startswith("data:image/"), "poster wiped on save!"
    assert full2["bg_image"].startswith("data:image/"), "bg wiped on save!"


def test_chapter_audio_survives_creation_delete():
    # Create a temp creation with a chapter, upload audio, then delete creation → chapter_media cleaned
    payload = {
        "title": "TEST_iter11_cleanup",
        "category": "livres",
        "launch_type": "chapters",
        "chapters": [{"title": "c", "content": "x"}],
    }
    r = requests.post(f"{API}/creations", json=payload)
    assert r.status_code == 201
    cr = r.json()
    cid = cr["id"]
    chid = cr["chapters"][0]["id"]
    files = {"file": ("t.mp3", _mp3_bytes(), "audio/mpeg")}
    assert requests.post(f"{API}/creations/{cid}/chapters/{chid}/audio", files=files).status_code == 200
    assert requests.delete(f"{API}/creations/{cid}").status_code == 200
    # streaming now should 404
    r = requests.get(f"{API}/creations/{cid}/chapters/{chid}/audio")
    assert r.status_code == 404
