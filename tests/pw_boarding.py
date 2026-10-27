# UI test: boarding pass logged out opens register dialog; vision edit hidden for visitor
import asyncio
from playwright.async_api import async_playwright
EXE = "/pw-browsers/chromium_headless_shell-1208/chrome-linux/headless_shell"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE, args=["--mute-audio", "--single-process"])
        ctx = await b.new_context(viewport={"width": 1920, "height": 1080})
        await ctx.add_init_script("localStorage.setItem('sx_tour_done','1');localStorage.setItem('sx_intro_off','1');sessionStorage.setItem('sx_entered','1');sessionStorage.setItem('sx_intro_shown','1');")
        pg = await ctx.new_page()
        await pg.goto("https://tengoku-launcher.preview.emergentagent.com/", wait_until="domcontentloaded")
        await pg.wait_for_selector('[data-testid="home-boarding-pass"]', timeout=20000)
        print("vision_edit_hidden", await pg.locator('[data-testid="home-vision-edit"]').count() == 0)
        print("vision_present", await pg.locator('[data-testid="home-vision"]').count())
        await pg.locator('[data-testid="home-boarding-pass"]').scroll_into_view_if_needed()
        await pg.click('[data-testid="home-boarding-pass"]')
        await pg.wait_for_timeout(1500)
        print("url", pg.url)
        ids = await pg.evaluate("() => [...document.querySelectorAll('[data-testid^=\"auth\"]')].map(e => e.dataset.testid).slice(0,15)")
        print("auth testids", ids)
        txt = await pg.evaluate("() => { const d = document.querySelector('[data-testid=\"auth-dialog\"], [role=\"dialog\"]'); return d ? d.innerText.slice(0,300) : 'NO DIALOG'; }")
        print("dialog:", repr(txt))
        await pg.screenshot(path="/app/.screenshots/boarding_register.jpg", quality=40)
        await b.close()
asyncio.run(main())
