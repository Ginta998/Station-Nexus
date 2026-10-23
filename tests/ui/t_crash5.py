import asyncio, sys, requests
from pw_common import *
async def main():
    async with async_playwright() as pw:
        pat=sys.argv[1]
        tok = requests.post(B + "/api/auth/login", json={"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"}).json()["token"]
        br, page = await new_page(pw, token=tok)
        for p in pat.split(","):
            await page.route(lambda u, p=p: p in u, lambda r: r.abort())
        if "ws" in pat: await page.route_web_socket("**/ws", lambda ws: None)
        try:
            await page.goto(B + "/", wait_until="domcontentloaded"); await page.wait_for_timeout(7000)
            print(pat,"OK", await page.locator('.poster').count(), await page.locator('.padm').count())
        except Exception as e: print(pat,"CRASH")
        await br.close()
asyncio.run(main())
