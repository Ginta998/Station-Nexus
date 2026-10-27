# UI test: Atelier Nexus portal, loader, dock nav, universes, items, tasks, themes, leave
import asyncio, json, sys, requests, os
from playwright.async_api import async_playwright

FE = "http://localhost:3000"
API = "https://tengoku-launcher.preview.emergentagent.com/api"
EXE = "/pw-browsers/chromium_headless_shell-1208/chrome-linux/headless_shell"
SS = "/app/.screenshots"
os.makedirs(SS, exist_ok=True)
tok = requests.post(f"{API}/auth/login", json={"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"}).json()["token"]
H = {"Authorization": f"Bearer {tok}"}
res = {}


def ok(name, cond, extra=""):
    res[name] = bool(cond)
    print(("PASS " if cond else "FAIL ") + name, extra)


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE, args=["--mute-audio", "--single-process"])
        ctx = await b.new_context(viewport={"width": 1920, "height": 1080})
        await ctx.add_init_script(f"""localStorage.setItem('sx_token', '{tok}'); localStorage.setItem('sx_tour_done','1');
            sessionStorage.setItem('sx_entered','1'); sessionStorage.setItem('sx_intro_shown','1');""")
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        page.on("console", lambda m: m.type == "error" and errs.append(m.text))
        try:
            await page.goto(FE + "/", wait_until="domcontentloaded")
            await page.wait_for_timeout(5000)
            # station menu item
            try:
                await page.click('[data-testid="mobile-menu-btn"]', timeout=4000)
                await page.wait_for_timeout(800)
                ok("menu_portail_item", await page.get_by_text("Portail · Atelier").count() > 0)
                await page.keyboard.press("Escape")
                await page.wait_for_timeout(500)
            except Exception as e:
                ok("menu_portail_item", False, str(e)[:150])
            # global sound not on home
            ok("global_sound_absent_home", await page.locator('[data-testid="global-sound"]').count() == 0)
            # type code
            await page.mouse.click(5, 500)
            await page.locator("body").focus() if False else None
            await page.evaluate("document.activeElement && document.activeElement.blur && document.activeElement.blur()")
            for k in "0874":
                await page.keyboard.press(k)
                await page.wait_for_timeout(120)
            await page.wait_for_timeout(1500)
            ok("code_navigates_atelier", "/atelier" in page.url, page.url)
            if "/atelier" not in page.url:
                await page.goto(FE + "/atelier")
            loader = await page.locator('[data-testid="atelier-loader"]').count()
            pct = await page.locator('[data-testid="atelier-load-pct"]').text_content() if loader else None
            ok("loader_visible", loader > 0, f"pct={pct}")
            await page.screenshot(path=f"{SS}/at_loader.jpg", quality=40)
            await page.wait_for_selector('[data-testid="atelier-app"]', timeout=20000)
            ok("atelier_app_visible", True)
            ok("global_sound_absent_atelier", await page.locator('[data-testid="global-sound"]').count() == 0)
            await page.screenshot(path=f"{SS}/at_home.jpg", quality=40)

            # dock nav
            for n, tid in [("universes", "atelier-universes"), ("inbox", None), ("tasks", "atelier-tasks"), ("settings", "atelier-settings"), ("home", "atelier-home")]:
                await page.click(f'[data-testid="atelier-nav-{n}"]')
                await page.wait_for_timeout(500)
                if tid:
                    ok(f"nav_{n}", await page.locator(f'[data-testid="{tid}"]').count() > 0)
                else:
                    ok(f"nav_{n}", await page.get_by_role("heading", name="Inbox").count() > 0)

            # create universe
            await page.click('[data-testid="atelier-nav-universes"]')
            await page.click('[data-testid="atelier-new-universe"]')
            await page.fill('[data-testid="atelier-uf-name"]', "TEST_UI_Univers")
            await page.fill('[data-testid="atelier-uf-group"]', "TEST_Constel")
            await page.click('[data-testid="atelier-uf-save"]')
            await page.wait_for_timeout(1500)
            nm = await page.locator('[data-testid="atelier-universe-name"]').text_content() if await page.locator('[data-testid="atelier-universe-name"]').count() else None
            ok("universe_created_view", nm == "TEST_UI_Univers", str(nm))
            boot = requests.get(f"{API}/atelier/bootstrap", headers=H).json()
            u = next((x for x in boot["universes"] if x["name"] == "TEST_UI_Univers"), None)
            uid = u["id"] if u else None
            ok("universe_persisted_with_group", u and u["group"] == "TEST_Constel")

            # pin from hub
            await page.click('[data-testid="atelier-nav-universes"]')
            await page.wait_for_timeout(600)
            await page.click(f'[data-testid="atelier-hub-pin-{uid}"]')
            await page.wait_for_timeout(1200)
            ok("pin_shows_in_dock", await page.locator(f'[data-testid="atelier-nav-universe-{uid}"]').count() > 0)
            # search filter
            await page.fill('[data-testid="atelier-hub-search"]', "TEST_UI")
            await page.wait_for_timeout(500)
            ok("hub_search_filter", await page.locator(f'[data-testid="atelier-hub-universe-{uid}"]').count() > 0 and await page.locator('[data-testid^="atelier-hub-universe-"]').count() == 1)
            await page.fill('[data-testid="atelier-hub-search"]', "zzzznomatch")
            await page.wait_for_timeout(400)
            ok("hub_search_nomatch", await page.locator('[data-testid^="atelier-hub-universe-"]').count() == 0)
            await page.fill('[data-testid="atelier-hub-search"]', "")
            # open universe, new item
            await page.click(f'[data-testid="atelier-hub-universe-{uid}"]')
            await page.wait_for_timeout(800)
            ok("universe_tabs", await page.locator('[data-testid="atelier-universe-tabs"]').count() > 0)
            await page.click('[data-testid="atelier-new-item"]')
            await page.wait_for_timeout(400)
            if await page.locator('[data-testid="atelier-new-item-menu"]').count():
                await page.click('[data-testid="atelier-new-scene"]')
            await page.wait_for_selector('[data-testid="atelier-editor"]', timeout=6000)
            ok("editor_opened", True)
            await page.fill('[data-testid="atelier-editor-title"]', "TEST_UI_Scene Alpha")
            st = ""
            for _ in range(12):
                await page.wait_for_timeout(500)
                st = await page.locator('[data-testid="atelier-editor-status"]').text_content()
                if "Enregistr" in st:
                    break
            ok("editor_autosave", "Enregistr" in st, st)
            # media link
            try:
                await page.fill('[data-testid="atelier-media-link"]', "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                await page.click('[data-testid="atelier-media-link-add"]')
                await page.wait_for_timeout(2500)
                ok("media_youtube_iframe", await page.locator('[data-testid="atelier-media-gallery"] iframe').count() > 0)
            except Exception as e:
                ok("media_youtube_iframe", False, str(e)[:150])
            await page.screenshot(path=f"{SS}/at_editor.jpg", quality=40)
            await page.wait_for_timeout(2000)
            boot = requests.get(f"{API}/atelier/bootstrap", headers=H).json()
            it = next((x for x in boot["items"] if x["title"] == "TEST_UI_Scene Alpha"), None)
            ok("item_persisted", it and it["universe_id"] == uid and it["kind"] == "scene", str(it and it.get("media")))
            ok("media_persisted", it and any("youtube" in (m.get("url") or "") for m in it.get("media", [])))
            await page.click('[data-testid="atelier-editor-close"]')
            await page.wait_for_timeout(800)

            # palette
            await page.keyboard.press("Control+k")
            await page.wait_for_timeout(500)
            ok("palette_open", await page.locator('[data-testid="atelier-palette-input"]').count() > 0)
            await page.fill('[data-testid="atelier-palette-input"]', "Scene Alpha")
            await page.wait_for_timeout(600)
            txt = await page.locator('[data-testid="atelier-palette"]').inner_text()
            ok("palette_finds_item", "TEST_UI_Scene Alpha" in txt)
            await page.keyboard.press("Escape")
            await page.wait_for_timeout(400)
            if await page.locator('[data-testid="atelier-palette"]').count():
                await page.keyboard.press("Control+k")
                await page.wait_for_timeout(300)

            # quick capture
            await page.click('[data-testid="atelier-nav-home"]')
            await page.wait_for_timeout(600)
            await page.fill('[data-testid="atelier-capture-input"]', "TEST_UI_Capture idée")
            await page.click('[data-testid="atelier-capture-btn"]')
            await page.wait_for_timeout(1500)
            boot = requests.get(f"{API}/atelier/bootstrap", headers=H).json()
            cap = next((x for x in boot["items"] if "TEST_UI_Capture" in (x["title"] + x["content"])), None)
            ok("capture_inbox_note", cap and cap["universe_id"] is None and cap["kind"] == "note", str(cap and cap["title"]))
            await page.click('[data-testid="atelier-nav-inbox"]')
            await page.wait_for_timeout(600)
            ok("capture_in_inbox_ui", cap and await page.locator(f'[data-testid="atelier-item-{cap["id"]}"]').count() > 0)

            # tasks
            await page.click('[data-testid="atelier-nav-tasks"]')
            await page.wait_for_timeout(600)
            if await page.locator('[data-testid="atelier-task-title"]').count() == 0 and await page.locator('[data-testid="atelier-task-add"]').count():
                await page.click('[data-testid="atelier-task-add"]')
            await page.fill('[data-testid="atelier-task-title"]', "TEST_UI_Task")
            await page.click('[data-testid="atelier-task-submit"]')
            await page.wait_for_timeout(1200)
            boot = requests.get(f"{API}/atelier/bootstrap", headers=H).json()
            t = next((x for x in boot["tasks"] if x["title"] == "TEST_UI_Task"), None)
            ok("task_created", t is not None)
            if t:
                await page.click(f'[data-testid="atelier-task-toggle-{t["id"]}"]')
                await page.wait_for_timeout(1200)
                t2 = next((x for x in requests.get(f"{API}/atelier/bootstrap", headers=H).json()["tasks"] if x["id"] == t["id"]), {})
                ok("task_toggle_done", t2.get("done") is True and bool(t2.get("done_at")))

            # themes
            await page.click('[data-testid="atelier-nav-settings"]')
            await page.wait_for_timeout(600)
            themes = await page.locator('[data-testid^="atelier-theme-"]').evaluate_all("els => els.map(e => e.dataset.testid)")
            print("themes:", themes)
            before = await page.evaluate("() => document.querySelector('.at-app').className + '|' + (document.querySelector('.at-app').getAttribute('data-theme')||'') + '|' + getComputedStyle(document.querySelector('.at-app')).getPropertyValue('--brand')")
            if len(themes) > 1:
                await page.click(f'[data-testid="{themes[1]}"]')
                await page.wait_for_timeout(600)
                after = await page.evaluate("() => document.querySelector('.at-app').className + '|' + (document.querySelector('.at-app').getAttribute('data-theme')||'') + '|' + getComputedStyle(document.querySelector('.at-app')).getPropertyValue('--brand')")
                ok("theme_changes", before != after, f"{before} -> {after}")
                await page.screenshot(path=f"{SS}/at_theme.jpg", quality=40)
                await page.click(f'[data-testid="{themes[0]}"]')
                await page.wait_for_timeout(400)
            code_val = await page.locator('[data-testid="atelier-code-input"]').input_value() if await page.locator('[data-testid="atelier-code-input"]').count() else None
            ok("settings_code_shown", code_val == "0874", str(code_val))

            # leave
            await page.click('[data-testid="atelier-leave"]')
            await page.wait_for_timeout(1500)
            ok("leave_returns_home", page.url.rstrip("/") == FE, page.url)
        except Exception as e:
            print("EXC", str(e)[:400])
            await page.screenshot(path=f"{SS}/at_exc.jpg", quality=40)
        finally:
            # cleanup
            boot = requests.get(f"{API}/atelier/bootstrap", headers=H).json()
            for x in boot["items"]:
                if "TEST_UI" in (x.get("title", "") + x.get("content", "")):
                    requests.delete(f"{API}/atelier/items/{x['id']}", headers=H)
            for x in boot["tasks"]:
                if x["title"].startswith("TEST_UI"):
                    requests.delete(f"{API}/atelier/tasks/{x['id']}", headers=H)
            for x in boot["universes"]:
                if x["name"].startswith("TEST_UI"):
                    requests.delete(f"{API}/atelier/universes/{x['id']}", headers=H)
            print("console errors:", [e[:200] for e in errs][:10])
            print("RESULT", json.dumps(res))
            await b.close()

asyncio.run(main())
