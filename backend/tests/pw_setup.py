# Helper: create/delete TEST_ creations for page-writer UI testing
import os, sys, json, requests
API = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") + "/api"
s = requests.Session()
tok = s.post(f"{API}/auth/login", json={"email": "paytest@stationexus.com", "password": "password123"}).json()["token"]
s.headers["Authorization"] = f"Bearer {tok}"
if sys.argv[1] == "create":
    a = s.post(f"{API}/creations", json={"title": "TEST_PW Chapitres", "category": "livres", "launch_type": "chapters",
        "chapters": [{"title": "Ch Un", "content": "<p>Texte initial un</p>", "rich": True}, {"title": "Ch Deux", "content": "", "rich": False}]}).json()
    b = s.post(f"{API}/creations", json={"title": "TEST_PW Episodes", "category": "livres", "launch_type": "episodes",
        "episodes": [{"title": "Ep Un", "description": "d"}, {"title": "Ep Deux", "url": "https://example.com"}]}).json()
    print(json.dumps({"tok": tok, "ch": a["id"], "ep": b["id"]}))
elif sys.argv[1] == "get":
    print(json.dumps(s.get(f"{API}/creations/{sys.argv[2]}", params={"media": 1}).json().get(sys.argv[3]), ensure_ascii=False, indent=1)[:3000])
elif sys.argv[1] == "delete":
    for cid in sys.argv[2:]:
        print(cid, s.delete(f"{API}/creations/{cid}").status_code)
