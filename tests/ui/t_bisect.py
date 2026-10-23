import asyncio, sys, requests
from pw_common import *
css = sys.argv[1]
async def main():
    async with async_playwright() as pw:
        tok = requests.post(B + "/api/auth/login", json={"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"}).json()["token"]
        br, page = await new_page(pw, token=tok)
        await page.context.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=%r;document.head.appendChild(s)})" % css)
        try:
            await page.goto(B + "/", wait_until="domcontentloaded"); await page.wait_for_timeout(7000)
            print("OK", css[:60], await page.locator('.poster').count())
        except Exception as e: print("CRASH", css[:60])
        await br.close()
asyncio.run(main())
