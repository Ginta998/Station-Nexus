# Atelier Nexus: cockpit records CRUD (goals/events/budget/contacts), auth guard, docx import split + export
import io
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN = {"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"}


@pytest.fixture(scope="module")
def admin():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json=ADMIN)
    if r.status_code != 200:
        pytest.skip("admin login failed")
    s.headers["Authorization"] = f"Bearer {r.json()['token']}"
    return s


@pytest.mark.parametrize("rk,body", [
    ("goals", {"title": "TEST_goal", "progress": 40, "status": "active"}),
    ("events", {"title": "TEST_event", "date": "2030-01-01", "time": "10:00"}),
    ("budget", {"label": "TEST_budget", "amount": 12.5, "type": "income", "date": "2030-01-01"}),
    ("contacts", {"name": "TEST_contact", "role": "illustratrice", "email": "a@b.c"}),
])
def test_records_crud(admin, rk, body):
    assert requests.post(f"{API}/atelier/records/{rk}", json=body).status_code in (401, 403)
    r = admin.post(f"{API}/atelier/records/{rk}", json={**body, "_id": "x", "rk": "hack"})
    assert r.status_code == 200
    doc = r.json()
    assert doc["rk"] == rk and "_id" not in doc and isinstance(doc["id"], str)
    rid = doc["id"]
    try:
        b = admin.get(f"{API}/atelier/bootstrap").json()
        assert any(x["id"] == rid and x["rk"] == rk for x in b["records"])
        u = admin.put(f"{API}/atelier/records/{rk}/{rid}", json={"notes": "TEST_upd", "rk": "zzz"})
        assert u.status_code == 200 and u.json()["notes"] == "TEST_upd" and u.json()["rk"] == rk
        assert admin.put(f"{API}/atelier/records/{rk}/nope", json={"notes": "x"}).status_code == 404
    finally:
        assert admin.delete(f"{API}/atelier/records/{rk}/{rid}").status_code == 200
    b = admin.get(f"{API}/atelier/bootstrap").json()
    assert not any(x["id"] == rid for x in b["records"])


def test_records_bad_kind(admin):
    assert admin.post(f"{API}/atelier/records/foo", json={"title": "x"}).status_code == 400


def test_import_docx_two_h1_then_export(admin):
    from docx import Document
    d = Document()
    d.add_heading("TEST_Chap A", 1); d.add_paragraph("Texte A")
    d.add_heading("TEST_Chap B", 1); d.add_paragraph("Texte B")
    buf = io.BytesIO(); d.save(buf)
    r = admin.post(f"{API}/atelier/import", files={"file": ("TEST_doc.docx", buf.getvalue(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
                   data={"universe_id": "", "kind": "document", "split": "1"})
    assert r.status_code == 200, r.text
    items = r.json()["items"]
    try:
        assert [i["title"] for i in items] == ["TEST_Chap A", "TEST_Chap B"]
        assert "Texte A" in items[0]["content"] and "Texte B" in items[1]["content"]
        e = admin.get(f"{API}/atelier/items/{items[0]['id']}/docx")
        assert e.status_code == 200 and e.content[:2] == b"PK"
        assert "wordprocessingml" in e.headers["content-type"]
    finally:
        for i in items:
            admin.delete(f"{API}/atelier/items/{i['id']}")
