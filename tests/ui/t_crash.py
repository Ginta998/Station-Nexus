import asyncio, sys, requests
from pw_common import *
mode = sys.argv[1]
async def main():
    async with async_playwright() as pw:
        tok = requests.post(B + "/api/auth/login", json={"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"}).json()["token"] if "admin" in mode else None
        br, page = await new_page(pw, token=tok, theme=sys.argv[2] if len(sys.argv)>2 else "abysse")
        if "noimg" in mode:
            await page.route(lambda u: any(k in u for k in ("/poster", "/bg", "/avatar", "/image")), lambda r: r.abort())
        reqs=[]
        page.on("request", lambda r: reqs.append(r.url) if r.resource_type in ("image","media") else None)
        try:
            await page.goto(B + "/", wait_until="domcontentloaded"); await page.wait_for_timeout(8000)
            print(mode, "OK posters", await page.locator('.poster').count())
        except Exception as e: print(mode, "CRASH", str(e)[:80])
        print("media reqs:", len(reqs), [u[-70:] for u in reqs][:12]); print(page._errs[:5]); await br.close()
asyncio.run(main())
