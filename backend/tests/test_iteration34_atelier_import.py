# Atelier Nexus: import (docx/pdf split), docx export, files, media persistence, settings fields
import io
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN = {"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"}
KINDS = ["note", "scene", "character", "place", "lore", "event", "document", "inspiration"]


@pytest.fixture(scope="module")
def admin():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json=ADMIN)
    if r.status_code != 200:
        pytest.skip("admin login failed")
    s.headers["Authorization"] = f"Bearer {r.json()['token']}"
    return s


@pytest.fixture(scope="module")
def created(admin):
    bag = {"items": [], "universes": [], "tasks": []}
    yield bag
    for i in bag["items"]:
        admin.delete(f"{API}/atelier/items/{i}")
    for t in bag["tasks"]:
        admin.delete(f"{API}/atelier/tasks/{t}")
    for u in bag["universes"]:
        admin.delete(f"{API}/atelier/universes/{u}")


@pytest.fixture(scope="module")
def universe(admin, created):
    u = admin.post(f"{API}/atelier/universes", json={"name": "TEST_ImportU", "group": "TEST_grp"}).json()
    created["universes"].append(u["id"])
    return u


def make_docx():
    from docx import Document
    d = Document()
    d.add_heading("TEST Chapitre Un", level=1)
    p = d.add_paragraph()
    p.add_run("Texte en gras").bold = True
    p.add_run(" et ")
    p.add_run("italique").italic = True
    d.add_heading("TEST Chapitre Deux", level=1)
    d.add_paragraph("Deuxieme section contenu.")
    buf = io.BytesIO()
    d.save(buf)
    return buf.getvalue()


def make_pdf():
    import pymupdf
    doc = pymupdf.open()
    page = doc.new_page()
    y = 72
    for title, body in [("Grand Titre A", "Corps du texte numero un assez long pour etre normal."),
                        ("Grand Titre B", "Corps du texte numero deux assez long pour etre normal.")]:
        page.insert_text((72, y), title, fontsize=24)
        y += 40
        for _ in range(3):
            page.insert_text((72, y), body, fontsize=11)
            y += 30
        y += 20
    return doc.tobytes()


def test_all_kinds_and_media(admin, created):
    for k in KINDS:
        r = admin.post(f"{API}/atelier/items", json={"kind": k, "title": f"TEST_{k}"})
        assert r.status_code == 200, (k, r.text)
        created["items"].append(r.json()["id"])
    media = [{"id": "m1", "type": "link", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "name": "yt"}]
    it = admin.post(f"{API}/atelier/items", json={"kind": "note", "title": "TEST_media", "media": media}).json()
    created["items"].append(it["id"])
    b = admin.get(f"{API}/atelier/bootstrap").json()
    got = next(x for x in b["items"] if x["id"] == it["id"])
    assert got["media"] == media
    # update media
    media2 = media + [{"id": "m2", "type": "link", "url": "https://example.com", "name": "ex"}]
    up = admin.put(f"{API}/atelier/items/{it['id']}", json={"kind": "note", "title": "TEST_media", "media": media2}).json()
    assert len(up["media"]) == 2


def test_import_docx_split(admin, created, universe):
    files = {"file": ("TEST_doc.docx", make_docx(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    r = admin.post(f"{API}/atelier/import", files=files, data={"universe_id": universe["id"], "kind": "scene", "split": "1"})
    assert r.status_code == 200, r.text
    items = r.json()["items"]
    for i in items:
        created["items"].append(i["id"])
    assert len(items) == 2, [i["title"] for i in items]
    assert items[0]["title"] == "TEST Chapitre Un"
    assert items[1]["title"] == "TEST Chapitre Deux"
    assert "<strong>Texte en gras</strong>" in items[0]["content"] or "<b>" in items[0]["content"]
    assert "<em>italique</em>" in items[0]["content"] or "<i>" in items[0]["content"]
    assert all(i["kind"] == "scene" and i["universe_id"] == universe["id"] for i in items)
    assert items[0]["media"][0]["type"] == "file"
    # source file is retrievable publicly
    src = requests.get(f"{BASE_URL}{items[0]['media'][0]['url']}")
    assert src.status_code == 200 and src.content[:2] == b"PK"


def test_import_docx_nosplit(admin, created):
    files = {"file": ("TEST_doc2.docx", make_docx(), "application/octet-stream")}
    r = admin.post(f"{API}/atelier/import", files=files, data={"kind": "document", "split": "0"})
    assert r.status_code == 200, r.text
    items = r.json()["items"]
    for i in items:
        created["items"].append(i["id"])
    assert len(items) == 1 and items[0]["universe_id"] is None


def test_import_pdf_split(admin, created):
    files = {"file": ("TEST_pdf.pdf", make_pdf(), "application/pdf")}
    r = admin.post(f"{API}/atelier/import", files=files, data={"kind": "document", "split": "1"})
    assert r.status_code == 200, r.text
    items = r.json()["items"]
    for i in items:
        created["items"].append(i["id"])
    titles = [i["title"] for i in items]
    assert "Grand Titre A" in titles and "Grand Titre B" in titles, titles


def test_import_bad(admin):
    r = admin.post(f"{API}/atelier/import", files={"file": ("x.exe", b"abc", "application/octet-stream")}, data={"kind": "document"})
    assert r.status_code == 400
    r = admin.post(f"{API}/atelier/import", files={"file": ("x.txt", b"abc", "text/plain")}, data={"kind": "bogus"})
    assert r.status_code == 400
    r = requests.post(f"{API}/atelier/import", files={"file": ("x.txt", b"abc", "text/plain")})
    assert r.status_code in (401, 403)


def test_import_txt(admin, created):
    r = admin.post(f"{API}/atelier/import", files={"file": ("TEST_t.txt", "# Titre X\n\nPara 1\n\n# Titre Y\n\nPara 2".encode(), "text/plain")}, data={"kind": "note"})
    assert r.status_code == 200, r.text
    items = r.json()["items"]
    for i in items:
        created["items"].append(i["id"])
    assert [i["title"] for i in items] == ["Titre X", "Titre Y"]


def test_export_docx(admin, created):
    it = admin.post(f"{API}/atelier/items", json={"kind": "scene", "title": "TEST_Export", "content": "<p><b>Gras</b> <i>it</i></p><ul><li>a</li></ul>"}).json()
    created["items"].append(it["id"])
    r = admin.get(f"{API}/atelier/items/{it['id']}/docx")
    assert r.status_code == 200
    assert "wordprocessingml" in r.headers["content-type"]
    from docx import Document
    d = Document(io.BytesIO(r.content))
    txt = "\n".join(p.text for p in d.paragraphs)
    assert "TEST_Export" in txt and "Gras" in txt
    assert admin.get(f"{API}/atelier/items/nope/docx").status_code == 404


def test_files_upload_public_get(admin):
    data = b"\x89PNG\r\n\x1a\n" + uuid.uuid4().bytes
    r = admin.post(f"{API}/atelier/files", files={"file": ("TEST_img.png", data, "image/png")})
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["url"] == f"/api/atelier-files/{j['id']}" and j["size"] == len(data)
    g = requests.get(f"{BASE_URL}{j['url']}")
    assert g.status_code == 200 and g.content == data
    assert g.headers["content-type"].startswith("image/png")
    assert requests.get(f"{API}/atelier-files/nope").status_code == 404
    assert requests.post(f"{API}/atelier/files", files={"file": ("a.png", data, "image/png")}).status_code in (401, 403)


def test_settings_vision_playmode_roundtrip(admin):
    orig = admin.get(f"{API}/settings").json()
    keys = ["default_play_mode", "home_vision_title", "home_vision_text", "home_vision_image"]
    snapshot = {k: orig.get(k) for k in keys}
    try:
        payload = {**orig, "default_play_mode": "shuffle", "home_vision_title": "TEST_title",
                   "home_vision_text": "TEST_text", "home_vision_image": "TEST_img"}
        r = admin.put(f"{API}/settings", json=payload)
        assert r.status_code == 200, r.text
        s = requests.get(f"{API}/settings").json()
        assert s["default_play_mode"] == "shuffle" and s["home_vision_title"] == "TEST_title"
        assert s["home_vision_text"] == "TEST_text" and s["home_vision_image"] == "TEST_img"
        assert requests.put(f"{API}/settings", json=payload).status_code in (401, 403)
    finally:
        cur = admin.get(f"{API}/settings").json()
        admin.put(f"{API}/settings", json={**cur, **snapshot})
        after = admin.get(f"{API}/settings").json()
        assert {k: after.get(k) for k in keys} == snapshot
