# Iteration 40: Atelier config shortcuts + hidden_apps persistence (PUT config -> GET bootstrap)
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api/atelier"


@pytest.fixture(scope="module")
def s():
    ss = requests.Session()
    r = ss.post(f"{BASE_URL}/api/auth/login", json={"email": "paytest@stationexus.com", "password": "password123"})
    if r.status_code != 200:
        pytest.skip("admin login failed")
    ss.headers["Authorization"] = f"Bearer {r.json()['token']}"
    orig = ss.get(f"{API}/config").json()
    yield ss
    ss.put(f"{API}/config", json={"shortcuts": [], "hidden_apps": []})
    assert orig is not None


def test_requires_auth():
    r = requests.get(f"{API}/config")
    assert r.status_code in (401, 403)


def test_put_shortcuts_and_hidden_apps(s):
    sc = [{"t": "view", "v": "tasks"}, {"t": "app", "key": "yt", "title": "YouTube", "url": "https://youtube.com"}]
    r = s.put(f"{API}/config", json={"shortcuts": sc, "hidden_apps": ["yt", "x"]})
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["shortcuts"] == sc
    assert d["hidden_apps"] == ["yt", "x"]
    assert "_id" not in d


def test_bootstrap_returns_config(s):
    b = s.get(f"{API}/bootstrap")
    assert b.status_code == 200
    c = b.json()["config"]
    assert c["shortcuts"][0] == {"t": "view", "v": "tasks"}
    assert c["hidden_apps"] == ["yt", "x"]
    assert "code" in c


def test_partial_put_keeps_other_fields(s):
    r = s.put(f"{API}/config", json={"hidden_apps": []})
    assert r.status_code == 200
    d = r.json()
    assert d["hidden_apps"] == []
    assert len(d["shortcuts"]) == 2


def test_clear_shortcuts(s):
    r = s.put(f"{API}/config", json={"shortcuts": []})
    assert r.status_code == 200
    assert r.json()["shortcuts"] == []
    assert s.get(f"{API}/bootstrap").json()["config"]["shortcuts"] == []


def test_invalid_types(s):
    r = s.put(f"{API}/config", json={"shortcuts": "notalist"})
    assert r.status_code == 422
    r = s.put(f"{API}/config", json={"code": "ab"})
    assert r.status_code == 400
