import asyncio, sys, requests
from pw_common import *
async def main():
    async with async_playwright() as pw:
        tok = requests.post(B + "/api/auth/login", json={"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"}).json()["token"]
        br, page = await new_page(pw, token=tok)
        mode=sys.argv[1]
        if mode=="fulfill": await page.route("**/api/chat/unread*", lambda r: r.fulfill(status=200, content_type="application/json", body='{"public":0,"dm":0,"total":0}'))
        if mode=="stubbadge": await page.context.add_init_script("delete Navigator.prototype.setAppBadge; delete Navigator.prototype.clearAppBadge;")
        try:
            await page.goto(B + "/", wait_until="domcontentloaded"); await page.wait_for_timeout(7000)
            print(mode,"OK", await page.locator('.poster').count(), await page.evaluate("'setAppBadge' in navigator"))
        except Exception as e: print(mode,"CRASH")
        await br.close()
asyncio.run(main())
