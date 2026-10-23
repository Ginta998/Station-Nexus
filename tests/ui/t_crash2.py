import asyncio, sys, requests, time
from pw_common import *
async def main():
    async with async_playwright() as pw:
        tok = requests.post(B + "/api/auth/login", json={"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"}).json()["token"]
        br, page = await new_page(pw, token=tok)
        xhr=[]
        async def onresp(r):
            if r.request.resource_type in ("xhr","fetch"):
                try: b = await r.body(); xhr.append((r.url[-60:], r.status, len(b)))
                except Exception: xhr.append((r.url[-60:], r.status, -1))
        page.on("response", lambda r: asyncio.ensure_future(onresp(r)))
        cdp = await page.context.new_cdp_session(page)
        await cdp.send("Performance.enable")
        await page.goto(B + "/", wait_until="domcontentloaded")
        for i in range(16):
            try:
                m = await cdp.send("Performance.getMetrics")
                d = {x["name"]: x["value"] for x in m["metrics"]}
                print(f"{i*0.5:.1f}s heap={d.get('JSHeapUsedSize',0)/1e6:.0f}MB nodes={d.get('Nodes')} layouts={d.get('LayoutCount')} recalc={d.get('RecalcStyleCount')}")
                await page.wait_for_timeout(500)
            except Exception as e: print("crash at", i*0.5, str(e)[:60]); break
        print(sorted(xhr, key=lambda x:-x[2])[:12]); print(page._errs[:5]); await br.close()
asyncio.run(main())
