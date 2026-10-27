# UI test: visitor (public URL) cannot reach /atelier, code 0874 ignored
import asyncio
from playwright.async_api import async_playwright
EXE = "/pw-browsers/chromium_headless_shell-1208/chrome-linux/headless_shell"
U = "https://tengoku-launcher.preview.emergentagent.com"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE, args=["--mute-audio", "--single-process"])
        ctx = await b.new_context(viewport={"width": 1920, "height": 1080})
        await ctx.add_init_script("localStorage.setItem('sx_tour_done','1');localStorage.setItem('sx_intro_off','1');sessionStorage.setItem('sx_entered','1');sessionStorage.setItem('sx_intro_shown','1');")
        pg = await ctx.new_page()
        await pg.goto(U + "/", wait_until="domcontentloaded")
        await pg.wait_for_selector('[data-testid="home-vision"]', timeout=20000)
        await pg.mouse.click(5, 500)
        for k in "0874":
            await pg.keyboard.press(k)
        await pg.wait_for_timeout(1500)
        print("code_ignored_for_visitor", "/atelier" not in pg.url, pg.url)
        await pg.goto(U + "/atelier", wait_until="domcontentloaded")
        await pg.wait_for_timeout(5000)
        print("atelier_redirect_visitor", pg.url)
        await b.close()
asyncio.run(main())
