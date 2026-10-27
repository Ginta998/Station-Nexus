# Local Playwright UI test for Cosmic Bunny panel in /atelier (the browser tool's renderer crashes on /atelier)
import asyncio, os, sys, requests
from playwright.async_api import async_playwright

BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = BASE + "/api"
STAGE = sys.argv[1] if len(sys.argv) > 1 else "load"
SHOT = "/app/test_reports/pytest/bunny_"


def P(*a):
    print(*a, flush=True)


async def main():
    tok = requests.post(f"{API}/auth/login", json={"email": "paytest@stationexus.com", "password": "password123"}).json()["token"]
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get("PWX", "/usr/local/bin/browser-use-chromium"), args=["--enable-logging=stderr", "--v=0", "--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"])
        ctx = await b.new_context(viewport={"width": 1280, "height": 800}, reduced_motion="reduce", service_workers="block")
        # headless Chromium has no BadgeService binder -> renderer killed on navigator.setAppBadge (push.js); stub it
        await ctx.add_init_script("try{delete Navigator.prototype.setAppBadge;delete Navigator.prototype.clearAppBadge;}catch(e){}")
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)[:200]))
        page.on("crash", lambda _: P("CRASHED"))
        await page.route("**/*", lambda r: r.abort() if r.request.resource_type == "media" else r.continue_())
        await page.goto(API + "/atelier/bunny/sessions")
        await page.evaluate("""(t)=>{localStorage.setItem('sx_token',t);localStorage.setItem('sx_intro_off','1');localStorage.setItem('sx_tour_done','1');sessionStorage.setItem('sx_entered','1');}""", tok)
        await page.goto(BASE + "/atelier", wait_until="commit")
        try:
            await page.wait_for_selector('[data-testid="bunny-open"]', timeout=60000)
            P("PASS fab visible")
            await page.wait_for_timeout(2000)
            await page.screenshot(path=SHOT + "app.jpg", quality=40, type="jpeg")
            await page.click('[data-testid="bunny-open"]')
            await page.wait_for_selector('[data-testid="bunny-panel"]', timeout=5000)
            P("PASS panel opens; hello:", await page.is_visible('[data-testid="bunny-hello"]'),
              "quick:", await page.locator('[data-testid^="bunny-quick-"]').count(),
              "send disabled empty:", await page.is_disabled('[data-testid="bunny-send"]'))
            await page.screenshot(path=SHOT + "panel.jpg", quality=40, type="jpeg")
            await page.click('[data-testid="bunny-close"]')
            await page.wait_for_timeout(400)
            P("PASS close:", await page.locator('[data-testid="bunny-panel"]').count() == 0, "fab back:", await page.is_visible('[data-testid="bunny-open"]'))
            await page.click('[data-testid="atelier-nav-bunny"]')
            await page.wait_for_selector('[data-testid="bunny-panel"]', timeout=5000)
            P("PASS dock opens panel")
            if STAGE == "load":
                return
            # scene request via Enter
            await page.fill('[data-testid="bunny-input"]', 'TEST_ Écris une scène courte (80 mots max) où Soulfreed joue de sa guitare Yuba face à un vampire. Mets-la entre les balises <scene titre=\"TEST_Yuba\">...</scene>.')
            await page.press('[data-testid="bunny-input"]', "Enter")
            await page.wait_for_selector('[data-testid="bunny-msg-0"]', timeout=5000)
            P("user msg shown; typing:", await page.is_visible('[data-testid="bunny-typing"]'), "input cleared:", await page.input_value('[data-testid="bunny-input"]') == "")
            await page.wait_for_selector('[data-testid="bunny-msg-1"], [data-testid="bunny-error"]', timeout=120000)
            if await page.locator('[data-testid="bunny-error"]').count():
                P("FAIL error:", await page.inner_text('[data-testid="bunny-error"]'))
            else:
                P("PASS AI reply:", (await page.inner_text('[data-testid="bunny-msg-1"]'))[:400].replace("\n", " "))
            n = await page.locator('[data-testid^="bunny-scene-insert-"]').count()
            P("scene cards:", n)
            await page.screenshot(path=SHOT + "scene.jpg", quality=40, type="jpeg")
            if n:
                await page.locator('[data-testid^="bunny-scene-insert-"]').first.click()
                await page.wait_for_timeout(3000)
                P("insert btn after:", await page.locator('[data-testid^="bunny-scene-insert-"]').first.inner_text())
                await page.screenshot(path=SHOT + "scene2.jpg", quality=40, type="jpeg")
            if STAGE == "scene":
                return
            opts = await page.locator('[data-testid="bunny-session-select"] option').all_inner_texts()
            P("session options:", opts[:4], "delete visible:", await page.is_visible('[data-testid="bunny-delete"]'))
            # new conversation resets
            await page.click('[data-testid="bunny-new"]')
            await page.wait_for_timeout(500)
            P("PASS new resets:", await page.is_visible('[data-testid="bunny-hello"]'))
            # reload previous via select
            sel = page.locator('[data-testid="bunny-session-select"]')
            vals = await sel.locator("option").evaluate_all("o=>o.map(x=>x.value)")
            await sel.select_option(vals[1])
            await page.wait_for_selector('[data-testid="bunny-msg-1"]', timeout=8000)
            P("PASS reloaded session msgs:", await page.locator('[data-testid^="bunny-msg-"]').count())
            # task creation via quick panel
            await page.click('[data-testid="bunny-new"]')
            await page.fill('[data-testid="bunny-input"]', "Crée une tâche dans le Cockpit : TEST_UI_Bunny peaufiner le prologue")
            await page.click('[data-testid="bunny-send"]')
            await page.wait_for_selector('[data-testid="bunny-msg-1"], [data-testid="bunny-error"]', timeout=120000)
            P("task reply:", (await page.inner_text('[data-testid="bunny-messages"]'))[-300:].replace("\n", " "))
            P("task chip:", await page.locator('[data-testid="bunny-tasks-1"]').count())
            await page.click('[data-testid="bunny-close"]')
            await page.click('[data-testid="atelier-nav-tasks"]')
            await page.wait_for_timeout(1500)
            P("cockpit badge:", await page.inner_text('[data-testid="atelier-nav-tasks"]'))
            await page.get_by_role("button", name="Tâches", exact=True).first.click()
            await page.wait_for_timeout(1000)
            body = await page.inner_text("body")
            P("cockpit has task:", "peaufiner le prologue" in body.lower())
            await page.screenshot(path=SHOT + "cockpit.jpg", quality=40, type="jpeg")
            # focus + summarize
            await page.click('[data-testid="atelier-nav-bunny"]')
            await page.wait_for_selector('[data-testid="bunny-panel"]')
            fs = page.locator('[data-testid="bunny-focus-select"]')
            fvals = await fs.locator("option").evaluate_all("o=>o.map(x=>x.value)")
            P("focus docs:", len(fvals) - 1)
            if len(fvals) > 1:
                await fs.select_option(fvals[1])
                await page.wait_for_selector('[data-testid="bunny-summarize"]', timeout=3000)
                await page.click('[data-testid="bunny-new"]')
                await page.click('[data-testid="bunny-summarize"]')
                await page.wait_for_selector('[data-testid="bunny-msg-1"], [data-testid="bunny-error"]', timeout=120000)
                P("summary:", (await page.inner_text('[data-testid="bunny-messages"]'))[:400].replace("\n", " "))
                await page.screenshot(path=SHOT + "summary.jpg", quality=40, type="jpeg")
                # delete this session
                before = await page.locator('[data-testid="bunny-session-select"] option').count()
                await page.click('[data-testid="bunny-delete"]')
                await page.wait_for_timeout(1000)
                after = await page.locator('[data-testid="bunny-session-select"] option').count()
                P("PASS delete:", before, "->", after, "hello:", await page.is_visible('[data-testid="bunny-hello"]'))
        except Exception as e:
            P("ERROR", str(e)[:300])
            try:
                await page.screenshot(path=SHOT + "err.jpg", quality=40, type="jpeg")
            except Exception:
                pass
        finally:
            P("pageerrors:", errs[:5])
            await b.close()

asyncio.run(main())
