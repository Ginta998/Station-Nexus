# Shared helpers for local Playwright runs (iteration 28)
import asyncio, json
from playwright.async_api import async_playwright
B = "https://tengoku-launcher.preview.emergentagent.com"
EXE = "/pw-browsers/chromium_headless_shell-1208/chrome-linux/headless_shell"
ARGS = ["--disable-dev-shm-usage", "--disable-gpu", "--no-sandbox"]

async def new_page(pw, w=1920, h=1080, token=None, theme="abysse", extra_ls=None, mobile=False):
    br = await pw.chromium.launch(args=ARGS, executable_path=EXE)
    ctx = await br.new_context(viewport={"width": w, "height": h}, is_mobile=mobile, has_touch=mobile)
    ls = {"sx_intro_off": "1", "sx_tour_done": "1", "sx_theme": theme}
    if token: ls["sx_token"] = token
    if extra_ls: ls.update(extra_ls)
    js = "if(!sessionStorage.getItem('__init')){sessionStorage.setItem('__init','1');sessionStorage.setItem('sx_entered','1');" + "".join(
        f"localStorage.setItem({json.dumps(k)},{json.dumps(v)});" for k, v in ls.items()) + "}"
    await ctx.add_init_script(js)
    page = await ctx.new_page()
    page._errs = []
    page.on("pageerror", lambda e: page._errs.append("PAGEERR:" + str(e)))
    page.on("console", lambda m: page._errs.append("CONSOLE:" + m.text[:200]) if m.type == "error" else None)
    page.on("crash", lambda: page._errs.append("CRASH"))
    return br, page

async def dismiss(page):
    for sel in ['text=Passer la visite', '[data-testid="cb-close"]', 'button:has-text("Passer")', 'button:has-text("Entrer")']:
        try:
            l = page.locator(sel).first
            if await l.is_visible(timeout=500): await l.click(force=True); await page.wait_for_timeout(400)
        except Exception: pass

async def login_token(page):
    r = await page.request.post(B + "/api/auth/login", data={"email": "louzalabrichel@gmail.com", "password": "Nexus-434b58"})
    return (await r.json())["token"]
