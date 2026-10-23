import asyncio, sys, requests
from pw_common import *
async def main():
    async with async_playwright() as pw:
        mode=sys.argv[1]
        tok = requests.post(B + "/api/auth/login", json={"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"}).json()["token"] if mode.startswith("tok") else None
        br, page = await new_page(pw, token=tok, extra_ls={"sx_admin":"1"} if mode=="lsadmin" else None)
        if mode=="tok-swblock": await page.route("**/service-worker.js", lambda r: r.abort())
        if mode=="tok-nobadge": await page.context.add_init_script("try{Object.defineProperty(Navigator.prototype,'setAppBadge',{value:()=>Promise.resolve(),configurable:true});Object.defineProperty(Navigator.prototype,'clearAppBadge',{value:()=>Promise.resolve(),configurable:true})}catch(e){}")
        if mode=="tok-nosw":
            await page.context.add_init_script("try{Object.defineProperty(navigator,'serviceWorker',{get:()=>undefined})}catch(e){}")
        try:
            await page.goto(B + "/", wait_until="domcontentloaded"); await page.wait_for_timeout(7000)
            print(mode,"OK", await page.locator('.poster').count(), await page.locator('.padm').count())
        except Exception as e: print(mode,"CRASH")
        await br.close()
asyncio.run(main())
