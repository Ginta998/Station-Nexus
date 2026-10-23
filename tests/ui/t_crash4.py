import asyncio, sys, requests, time
from pw_common import *
async def main():
    async with async_playwright() as pw:
        tok = requests.post(B + "/api/auth/login", json={"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"}).json()["token"]
        br, page = await new_page(pw, token=tok)
        t0=time.time()
        page.on("request", lambda r: print(f"{time.time()-t0:.2f} REQ {r.resource_type} {r.url[-80:]}"))
        page.on("websocket", lambda w: print(f"{time.time()-t0:.2f} WS {w.url}"))
        page.on("console", lambda m: print(f"{time.time()-t0:.2f} CON {m.type} {m.text[:150]}"))
        try:
            await page.goto(B + "/", wait_until="domcontentloaded"); await page.wait_for_timeout(5000)
        except Exception as e: print("CRASH", time.time()-t0)
        await br.close()
asyncio.run(main())
