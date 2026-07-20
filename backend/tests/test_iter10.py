"""Iteration 10 backend regression: lightened list, media endpoints, editor preserves images."""
import os, base64, io, requests, pytest

BASE = os.environ['REACT_APP_BACKEND_URL'].rstrip('/') + '/api'
# Note: backend URL from frontend/.env (not injected). Fallback to file.
if 'REACT_APP_BACKEND_URL' not in os.environ:
    with open('/app/frontend/.env') as f:
        for l in f:
            if l.startswith('REACT_APP_BACKEND_URL='):
                BASE = l.split('=',1)[1].strip().rstrip('/') + '/api'

# Tiny 1x1 PNG
PNG_B64 = ("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgAAIAAAUAAeI"
           "mHnAAAAAASUVORK5CYII=")
PNG_DATA_URI = f"data:image/png;base64,{PNG_B64}"


def test_list_light_and_has_flags():
    r = requests.get(f"{BASE}/creations", timeout=15)
    assert r.status_code == 200
    body = r.content
    assert len(body) < 100_000, f"list too big: {len(body)} bytes"
    data = r.json()
    assert len(data) >= 13
    for item in data:
        assert 'has_poster' in item and 'has_bg' in item
        assert item['poster'] == '' and item['bg_image'] == ''


def test_get_full_via_media_flag():
    lst = requests.get(f"{BASE}/creations").json()
    # Create one w/ poster so we can test
    payload = {"title": "TEST_iter10_media", "category": "livres",
               "poster": PNG_DATA_URI, "bg_image": PNG_DATA_URI}
    c = requests.post(f"{BASE}/creations", json=payload)
    assert c.status_code == 201
    cid = c.json()['id']
    try:
        # light
        r = requests.get(f"{BASE}/creations/{cid}")
        assert r.status_code == 200
        j = r.json()
        assert j['has_poster'] is True and j['has_bg'] is True
        assert j['poster'] == '' and j['bg_image'] == ''
        # full
        r = requests.get(f"{BASE}/creations/{cid}?media=1")
        j = r.json()
        assert j['poster'].startswith('data:image/')
        assert j['bg_image'].startswith('data:image/')
        # poster endpoint
        rp = requests.get(f"{BASE}/creations/{cid}/poster")
        assert rp.status_code == 200
        assert rp.headers['content-type'].startswith('image/')
        assert len(rp.content) > 0
        # bg endpoint
        rb = requests.get(f"{BASE}/creations/{cid}/bg")
        assert rb.status_code == 200
        assert rb.headers['content-type'].startswith('image/')
    finally:
        requests.delete(f"{BASE}/creations/{cid}")


def test_missing_image_404():
    payload = {"title": "TEST_iter10_noimg", "category": "livres"}
    c = requests.post(f"{BASE}/creations", json=payload)
    cid = c.json()['id']
    try:
        assert requests.get(f"{BASE}/creations/{cid}/poster").status_code == 404
        assert requests.get(f"{BASE}/creations/{cid}/bg").status_code == 404
    finally:
        requests.delete(f"{BASE}/creations/{cid}")


def test_update_preserves_images_when_sent():
    """Editor now fetches full item then PUTs it back — poster should survive."""
    payload = {"title": "TEST_iter10_preserve", "category": "livres",
               "poster": PNG_DATA_URI, "bg_image": PNG_DATA_URI, "tagline": "old"}
    c = requests.post(f"{BASE}/creations", json=payload)
    cid = c.json()['id']
    try:
        # Simulate editor: GET full, change tagline, PUT back
        full = requests.get(f"{BASE}/creations/{cid}?media=1").json()
        full['tagline'] = 'new tagline'
        # PUT requires CreationInput fields
        put_body = {k: full[k] for k in ['title','kanji','category','tagline','synopsis','poster','accent','bg_image','bg_blur','bg_dim','gallery','embeds','launch_type','launch_label','launch_content','launch_url','buy_url','episodes','chapters','coming_soon','order']}
        u = requests.put(f"{BASE}/creations/{cid}", json=put_body)
        assert u.status_code == 200
        # Verify: has_poster still true, /poster still works
        light = requests.get(f"{BASE}/creations/{cid}").json()
        assert light['has_poster'] is True
        assert light['tagline'] == 'new tagline'
        assert requests.get(f"{BASE}/creations/{cid}/poster").status_code == 200
    finally:
        requests.delete(f"{BASE}/creations/{cid}")


def test_other_endpoints_200():
    for path in ['/categories','/ambiences','/subscribers','/settings']:
        r = requests.get(f"{BASE}{path}")
        assert r.status_code == 200, f"{path} -> {r.status_code}"


def test_comment_crud():
    lst = requests.get(f"{BASE}/creations").json()
    cid = lst[0]['id']
    r = requests.get(f"{BASE}/creations/{cid}/comments")
    assert r.status_code == 200
    cm = requests.post(f"{BASE}/comments", json={"creation_id": cid, "name": "TEST_u", "text": "hello"})
    assert cm.status_code == 201
    coid = cm.json()['id']
    requests.delete(f"{BASE}/comments/{coid}")
