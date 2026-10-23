import asyncio
from pw_common import *
async def main():
    async with async_playwright() as pw:
        br, page = await new_page(pw)
        await page.goto(B + "/", wait_until="domcontentloaded"); await page.wait_for_timeout(6000)
        await dismiss(page)
        print("posters", await page.locator('.poster').count(), "cosmic", await page.locator('.cosmic-bg').count())
        await page.screenshot(path="/app/tests/ui/smoke.jpg", quality=40, type="jpeg")
        print(page._errs[:10]); await br.close()
asyncio.run(main())
