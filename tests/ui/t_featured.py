# Iteration 28: admin multi "À la une" toggle via Home poster star
import asyncio
from pw_common import *
FEAT0 = "b60c3eb7-2b18-4141-8cc3-b178e1a9a1f9"
async def settings(page): return await (await page.request.get(B + "/api/settings")).json()
async def toasts(page): return await page.evaluate("()=>[...document.querySelectorAll('[data-sonner-toast]')].map(t=>t.textContent)")
async def main():
    async with async_playwright() as pw:
        import requests
        tok = requests.post(B + "/api/auth/login", json={"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"}).json()["token"]
        br, page = await new_page(pw, token=tok)
        await page.route("**/api/chat/unread*", lambda r: r.abort())
        await page.goto(B + "/", wait_until="domcontentloaded"); await page.wait_for_timeout(5000); await dismiss(page)
        try:
          if False:
            await page.get_by_role("button", name="Profil").first.click(); await page.wait_for_timeout(800)
            ca = page.locator('[data-testid="profile-create-account"]')
            if await ca.count(): await ca.click(); await page.wait_for_timeout(600)
            sw = page.locator('[data-testid="auth-switch-login"]')
            if await sw.count() and await sw.is_visible(): await sw.click(); await page.wait_for_timeout(300)
            await page.fill('[data-testid="auth-email"]', "louzalabrichel@gmail.com")
            await page.fill('[data-testid="auth-password"]', "Nexus-434b58")
            await page.click('[data-testid="auth-submit"]'); await page.wait_for_timeout(3000)
            print("token stored:", bool(await page.evaluate("localStorage.getItem('sx_token')")))
        except Exception as e:
            print("DIALOG LOGIN FAIL", e)
        for sel in ['[data-testid="profile-close"]', '[data-testid="auth-close"]']:
            l = page.locator(sel)
            if await l.count() and await l.first.is_visible(): await l.first.click(force=True)
        await page.wait_for_timeout(1500); await dismiss(page)
        posters = page.locator('.sx-exp .poster')
        n = await posters.count(); print("posters", n, "star btns", await page.locator('.poster button[title="Mettre à la une"]').count())
        p0 = posters.nth(0); await p0.scroll_into_view_if_needed(); await p0.hover(); await page.wait_for_timeout(500)
        print("padm visible on hover:", await p0.locator('.padm').is_visible(), "opacity:", await p0.locator('.padm').evaluate("e=>getComputedStyle(e).opacity"))
        info = await page.evaluate("()=>[...document.querySelectorAll('.sx-exp .poster')].map(p=>[p.querySelector('.ptt')?.textContent,!!p.querySelector('.padm button.on')])")
        print("filled before:", [t for t, o in info if o])
        idx = [i for i, (t, o) in enumerate(info) if not o and t not in ("Blue Flower",)][:2]
        names = [info[i][0] for i in idx]; print("picking", names)
        for i in idx:
            p = posters.nth(i); await p.scroll_into_view_if_needed(); await p.hover(); await page.wait_for_timeout(300)
            await p.locator('button[title="Mettre à la une"]').click(); await page.wait_for_timeout(2500)
            print("toast:", await toasts(page))
        s = await settings(page); print("featured_ids after 2 adds:", s["featured_ids"])
        info = await page.evaluate("()=>[...document.querySelectorAll('.sx-exp .poster')].map(p=>[p.querySelector('.ptt')?.textContent,!!p.querySelector('.padm button.on')])")
        print("filled now:", sorted(set(t for t, o in info if o)))
        await page.evaluate("window.scrollTo(0,0)"); await page.wait_for_timeout(600)
        hero = await page.evaluate("()=>{const t=document.body.innerText;const i=t.indexOf('/ 0');return t.slice(Math.max(0,i-10),i+300)}")
        print("hero region:", hero.replace("\n", " | ")[:300])
        await page.screenshot(path="/app/tests/ui/feat3.jpg", quality=40, type="jpeg")
        # remove second one
        p = posters.nth(idx[1]); await p.scroll_into_view_if_needed(); await p.hover(); await page.wait_for_timeout(300)
        await p.locator('button[title="Mettre à la une"]').click(); await page.wait_for_timeout(2500)
        print("toast after remove:", await toasts(page))
        s = await settings(page); print("after remove:", s["featured_ids"])
        p = posters.nth(idx[0]); await p.scroll_into_view_if_needed(); await p.hover(); await page.wait_for_timeout(300)
        await p.locator('button[title="Mettre à la une"]').click(); await page.wait_for_timeout(2500)
        s = await settings(page); print("restored:", s["featured_ids"], s["featured_creation_id"])
        print("filled final:", await page.locator('.sx-exp .poster .padm button.on').count())
        print(page._errs[:10]); await br.close()
asyncio.run(main())
