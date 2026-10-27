# UI test: Home Vision (view/edit/about), global sound on /a-propos, page writer, boarding pass logged out
import asyncio, json, os, requests
from playwright.async_api import async_playwright

FE = "http://localhost:3000"
API = "https://tengoku-launcher.preview.emergentagent.com/api"
EXE = "/pw-browsers/chromium_headless_shell-1208/chrome-linux/headless_shell"
SS = "/app/.screenshots"
tok = requests.post(f"{API}/auth/login", json={"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"}).json()["token"]
H = {"Authorization": f"Bearer {tok}"}
orig = requests.get(f"{API}/settings").json()
VK = ["home_vision_title", "home_vision_text", "home_vision_image"]
snap = {k: orig.get(k) for k in VK}
res = {}


def ok(n, c, x=""):
    res[n] = bool(c)
    print(("PASS " if c else "FAIL ") + n, x)


async def ctx_for(b, logged):
    ctx = await b.new_context(viewport={"width": 1920, "height": 1080})
    s = f"localStorage.setItem('sx_token','{tok}');" if logged else "localStorage.removeItem('sx_token');"
    await ctx.add_init_script(s + "localStorage.setItem('sx_tour_done','1');localStorage.setItem('sx_intro_off','1');sessionStorage.setItem('sx_entered','1');sessionStorage.setItem('sx_intro_shown','1');")
    await ctx.route("**/poster*", lambda r: r.abort())
    return ctx


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE, args=["--mute-audio", "--single-process"])
        ctx = await ctx_for(b, True)
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        try:
            await page.goto(FE + "/", wait_until="domcontentloaded")
            await page.wait_for_selector('[data-testid="home-vision"]', timeout=15000)
            ok("vision_visible", True)
            await page.locator('[data-testid="home-vision"]').scroll_into_view_if_needed()
            await page.wait_for_timeout(800)
            # order check: vision after journal
            order = await page.evaluate("""() => { const v = document.querySelector('[data-testid="home-vision"]');
                const j = document.querySelector('[data-testid*="journal"]'); if (!j) return 'nojournal';
                return (j.compareDocumentPosition(v) & Node.DOCUMENT_POSITION_FOLLOWING) ? 'after' : 'before'; }""")
            print("vision vs journal:", order)
            await page.screenshot(path=f"{SS}/home_vision.jpg", quality=40)
            # edit
            await page.click('[data-testid="home-vision-edit"]')
            await page.fill('[data-testid="home-vision-title-input"]', "TEST_Vision titre")
            await page.fill('[data-testid="home-vision-text-input"]', "TEST para 1\n\nTEST para 2")
            await page.click('[data-testid="home-vision-save"]')
            await page.wait_for_timeout(1500)
            t = await page.locator('[data-testid="home-vision-title"]').text_content()
            ps = await page.locator('[data-testid="home-vision-text"] p').count()
            ok("vision_edit_saved_ui", t == "TEST_Vision titre" and ps == 2, f"{t} {ps}")
            s = requests.get(f"{API}/settings").json()
            ok("vision_edit_persisted", s["home_vision_title"] == "TEST_Vision titre")
            # about
            await page.click('[data-testid="home-vision-about"]')
            await page.wait_for_timeout(2000)
            ok("vision_about_nav", page.url.endswith("/a-propos"), page.url)
            # global sound on about
            gs = page.locator('[data-testid="global-sound"]')
            ok("global_sound_on_about", await gs.count() > 0)
            await gs.locator('[data-testid="sound-btn"]').click()
            await page.wait_for_timeout(500)
            ok("sound_menu_open", await page.locator('[data-testid="sound-menu"]').count() > 0)
            modes = {m: await page.locator(f'[data-testid="sound-mode-{m}"]').count() for m in ("loop", "sequence", "shuffle")}
            ok("sound_modes_present", all(modes.values()), str(modes))
            await page.click('[data-testid="sound-mode-shuffle"]')
            await page.wait_for_timeout(300)
            cls = await page.locator('[data-testid="sound-mode-shuffle"]').get_attribute("class")
            ok("sound_mode_select", "on" in (cls or ""), cls)
            ok("sound_next_in_jukebox", await page.locator('[data-testid="sound-next"]').count() > 0)
            await page.screenshot(path=f"{SS}/about_sound.jpg", quality=40)
            await page.click('[data-testid="sound-mode-loop"]')

            # page writer via create dialog
            await page.goto(FE + "/", wait_until="domcontentloaded")
            await page.wait_for_timeout(3000)
            await page.click('[data-testid="mobile-menu-btn"]')
            await page.wait_for_timeout(600)
            await page.get_by_text("Créer une création").click()
            await page.wait_for_selector('[data-testid="editor-dialog"]', timeout=6000)
            if await page.locator('input[type="password"], [data-testid*="pin"]').count():
                print("PIN prompt present")
            await page.select_option('[data-testid="editor-launch-type"]', "chapters")
            await page.wait_for_timeout(300)
            if await page.locator('[data-testid="editor-chapter-write-0"]').count() == 0:
                await page.click('[data-testid="editor-add-chapter"]')
            await page.click('[data-testid="editor-chapter-write-0"]')
            await page.wait_for_selector('[data-testid="page-writer"]', timeout=5000)
            ok("page_writer_open", True)
            tb = {k: await page.locator(f'[data-testid="{k}"]').count() for k in ("rte-toolbar", "rte-bold", "rte-justify", "rte-ul", "rte-hr")}
            ok("rte_toolbar_buttons", all(tb.values()), str(tb))
            area = page.locator('[data-testid="page-writer"] [data-testid="rte-area"]')
            await area.click()
            await page.keyboard.type("Bonjour monde")
            await page.keyboard.press("Control+a")
            await page.click('[data-testid="rte-bold"]')
            await page.keyboard.press("End")
            await page.click('[data-testid="rte-hr"]')
            html = await area.inner_html()
            ok("rte_bold_hr", ("<b>" in html or "<strong>" in html or "font-weight" in html) and "<hr" in html, html[:200])
            # paste google-docs-like html
            await area.click()
            await page.evaluate("""() => { const a = document.querySelector('[data-testid="page-writer"] [data-testid="rte-area"]'); a.focus();
                const dt = new DataTransfer(); dt.setData('text/html', '<meta charset="utf-8"><b style="font-weight:normal" id="docs-internal-guid-x"><p dir="ltr"><span style="font-weight:700">GrasDoc</span> <span style="font-style:italic">ItalDoc</span></p></b>');
                dt.setData('text/plain','GrasDoc ItalDoc'); a.dispatchEvent(new ClipboardEvent('paste', {clipboardData: dt, bubbles: true, cancelable: true})); }""")
            await page.wait_for_timeout(400)
            html2 = await area.inner_html()
            ok("paste_gdocs_keeps_format", "GrasDoc" in html2 and ("700" in html2 or "<b>GrasDoc" in html2 or "<strong>GrasDoc" in html2) and ("italic" in html2 or "<i>ItalDoc" in html2 or "<em>ItalDoc" in html2), html2[-400:])
            await page.screenshot(path=f"{SS}/page_writer.jpg", quality=40)
            await page.click('[data-testid="page-writer-mode-preview"]')
            await page.wait_for_timeout(400)
            ok("preview_toggle", await page.locator('[data-testid="page-writer-preview"]').count() > 0 and "Bonjour" in (await page.locator('[data-testid="page-writer-preview"]').inner_text()))
            await page.click('[data-testid="page-writer-mode-write"]')
            await page.click('[data-testid="page-writer-back"]')
            await page.wait_for_timeout(500)
            ok("writer_back_to_dialog", await page.locator('[data-testid="page-writer"]').count() == 0 and await page.locator('[data-testid="editor-dialog"]').count() > 0)
            await page.click('[data-testid="editor-close"]')
            await page.wait_for_timeout(500)
        except Exception as e:
            print("EXC", str(e)[:400])
            await page.screenshot(path=f"{SS}/home_exc.jpg", quality=40)
        finally:
            cur = requests.get(f"{API}/settings").json()
            requests.put(f"{API}/settings", json={**cur, **snap}, headers=H)
            after = requests.get(f"{API}/settings").json()
            print("settings restored:", {k: after.get(k) for k in VK} == snap)
            await ctx.close()

        # logged out boarding pass
        ctx2 = await ctx_for(b, False)
        pg = await ctx2.new_page()
        try:
            await pg.goto(FE + "/", wait_until="domcontentloaded")
            await pg.wait_for_selector('[data-testid="home-boarding-pass"]', timeout=15000)
            ok("logged_out_vision_no_edit", await pg.locator('[data-testid="home-vision-edit"]').count() == 0)
            await pg.locator('[data-testid="home-boarding-pass"]').scroll_into_view_if_needed()
            await pg.click('[data-testid="home-boarding-pass"]')
            await pg.wait_for_timeout(1200)
            url = pg.url
            dlg = await pg.evaluate("""() => { const d = document.querySelector('[role="dialog"], [data-testid*="auth"]'); return d ? d.innerText.slice(0,300) : ''; }""")
            ok("boarding_opens_register", "/soutien" not in url and dlg and ("inscri" in dlg.lower() or "créer" in dlg.lower() or "compte" in dlg.lower()), f"{url} | {dlg[:200]!r}")
            await pg.screenshot(path=f"{SS}/boarding_register.jpg", quality=40)
        except Exception as e:
            print("EXC2", str(e)[:300])
        print("page errors:", errs[:5])
        print("RESULT", json.dumps(res))
        await b.close()

asyncio.run(main())
