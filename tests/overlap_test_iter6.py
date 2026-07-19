"""Iteration 6 audio no-overlap verification for Stationexus PWA.

Reuses iteration-5 instrumentation strategy exactly:
 - single page.goto('/') so add_init_script's __samples survives
 - hook HTMLMediaElement.play + window.Audio BEFORE nav
 - SPA-navigate via history.pushState + PopStateEvent to /oeuvre/<cre>
 - Toggle creation music via [data-testid="detail-ambient"], nav back via [data-testid="detail-back"]
 - Seed a temp ambience + temp creation with real (tiny) WAVs, select ambience, clean up after.
"""
import asyncio
import json
import os
import struct
import math
import wave
import io
import time
import requests
from playwright.async_api import async_playwright

BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = BASE + "/api"


def make_wav(freq=440.0, seconds=1.0, sr=8000):
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        frames = bytearray()
        for i in range(int(sr * seconds)):
            v = int(0.2 * 32767 * math.sin(2 * math.pi * freq * i / sr))
            frames += struct.pack("<h", v)
        w.writeframes(bytes(frames))
    return buf.getvalue()


def seed():
    amb = requests.post(f"{API}/ambiences", json={"title": "TEST_I6_Amb", "order": 999}).json()
    aid = amb["id"]
    requests.post(f"{API}/ambiences/{aid}/audio", files={"file": ("a.wav", make_wav(440), "audio/wav")})

    cre = requests.post(f"{API}/creations", json={"title": "TEST_I6_Cre", "category": "manga", "order": 999, "launch_type": "info"}).json()
    cid = cre["id"]
    requests.post(f"{API}/creations/{cid}/audio", files={"file": ("c.wav", make_wav(660), "audio/wav")})
    return aid, cid


def cleanup(aid, cid):
    try: requests.delete(f"{API}/creations/{cid}")
    except: pass
    try: requests.delete(f"{API}/ambiences/{aid}")
    except: pass


INIT_JS = r"""
(() => {
  if (window.__samplesInstalled) return;
  window.__samplesInstalled = true;
  window.__samples = [];
  window.__phase = 'BOOT';
  window.__audios = new Set();
  const origPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function() { window.__audios.add(this); return origPlay.apply(this, arguments); };
  const OrigAudio = window.Audio;
  window.Audio = function(...args) { const a = new OrigAudio(...args); window.__audios.add(a); return a; };
  window.Audio.prototype = OrigAudio.prototype;
  setInterval(() => {
    let n = 0;
    for (const a of window.__audios) if (a && a.paused === false) n++;
    window.__samples.push({ t: Date.now(), phase: window.__phase, n });
  }, 20);
})();
"""


async def run():
    aid, cid = seed()
    print(f"seeded amb={aid} cre={cid}")

    phase_log = []
    result = {"amb": aid, "cre": cid, "phase_log": phase_log, "results": {}, "fails": []}

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True, args=["--autoplay-policy=no-user-gesture-required"])
        ctx = await browser.new_context()
        await ctx.add_init_script(INIT_JS)
        page = await ctx.new_page()
        page.on("console", lambda m: print("CONSOLE:", m.text) if m.type == "error" else None)

        async def set_phase(name):
            phase_log.append({"t": int(time.time() * 1000), "phase": name, "url": page.url})
            await page.evaluate(f"window.__phase = {name!r}")
            print(f"PHASE -> {name}")

        # Prime localStorage before load so ambience is selected and admin unlocked
        await page.goto(BASE + "/", wait_until="domcontentloaded")
        await page.evaluate(f"""() => {{
          localStorage.setItem('sx_ambience', {aid!r});
          localStorage.setItem('sx_mute', '0');
          localStorage.setItem('sx_musicvolume', '0.6');
          localStorage.setItem('sx_admin', '1');
          localStorage.setItem('sx_pin', '1234');
        }}""")
        await page.reload(wait_until="domcontentloaded")
        await page.wait_for_timeout(500)

        await set_phase("BOOT")
        await page.wait_for_timeout(600)

        # User gesture: click somewhere to satisfy autoplay policy
        await set_phase("GESTURE")
        await page.mouse.click(50, 50)
        await page.wait_for_timeout(2500)

        await set_phase("E_IDLE")
        await page.wait_for_timeout(3000)

        # SPA-navigate to detail (do NOT page.goto — that wipes __samples)
        await set_phase("SETUP_STOP")
        await page.evaluate(f"""() => {{
          history.pushState({{}}, '', '/oeuvre/{cid}');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}""")
        # Wait for detail-ambient button to appear
        await page.wait_for_selector('[data-testid="detail-ambient"]', timeout=5000)
        # Detail mount auto-plays the creation ambient (see Detail.js line 27). The initial user click that toggles it OFF is what we test.
        await page.wait_for_timeout(400)  # let auto-play settle
        # Click to toggle off (this is the "SETUP_STOP" - the previously-broken 240ms path)
        await page.click('[data-testid="detail-ambient"]')
        await page.wait_for_timeout(1500)

        await set_phase("E_IDLE_DETAIL")
        await page.wait_for_timeout(1500)

        # A_LAUNCH: click to start creation music again
        await set_phase("A_LAUNCH")
        await page.click('[data-testid="detail-ambient"]')
        await page.wait_for_timeout(1200)

        await set_phase("A_STEADY")
        await page.wait_for_timeout(1000)

        # B_STOP: toggle-off - THE PREVIOUSLY BROKEN 240ms PATH
        await set_phase("B_STOP")
        await page.click('[data-testid="detail-ambient"]')
        await page.wait_for_timeout(1200)

        await set_phase("B_STEADY")
        await page.wait_for_timeout(1000)

        # C_RELAUNCH
        await set_phase("C_RELAUNCH")
        await page.click('[data-testid="detail-ambient"]')
        await page.wait_for_timeout(1200)

        await set_phase("C_STEADY")
        await page.wait_for_timeout(800)

        # D_UNMOUNT: nav back (stopAmbient in cleanup)
        await set_phase("D_UNMOUNT")
        await page.click('[data-testid="detail-back"]')
        await page.wait_for_timeout(1500)

        await set_phase("D_STEADY")
        await page.wait_for_timeout(1000)

        samples = await page.evaluate("window.__samples")
        await browser.close()

    # Analyze
    per_phase = {}
    for s in samples:
        p = s["phase"]
        d = per_phase.setdefault(p, {"ticks": 0, "overlap": 0, "playing": 0, "max_concurrent": 0})
        d["ticks"] += 1
        n = s["n"]
        if n >= 2: d["overlap"] += 1
        if n >= 1: d["playing"] += 1
        if n > d["max_concurrent"]: d["max_concurrent"] = n
    for p, d in per_phase.items():
        d["overlap_ms"] = d["overlap"] * 20

    result["results"] = per_phase

    strict_phases = ["A_LAUNCH", "A_STEADY", "B_STOP", "B_STEADY", "C_RELAUNCH", "C_STEADY", "D_UNMOUNT", "E_IDLE", "SETUP_STOP"]
    fails = []
    for p in strict_phases:
        d = per_phase.get(p, {})
        if d.get("overlap", 0) > 0:
            fails.append(f"{p}:overlap={d['overlap_ms']}ms")
    # Steady phases: exactly 1 playing tick most of the time
    for p in ["A_STEADY", "B_STEADY", "C_STEADY", "D_STEADY", "E_IDLE"]:
        d = per_phase.get(p, {})
        if d.get("max_concurrent", 0) != 1:
            fails.append(f"{p}:max_concurrent={d.get('max_concurrent')}")

    result["fails"] = fails

    out = "/app/test_reports/iteration_6_overlap.json"
    with open(out, "w") as f:
        json.dump(result, f, indent=2)
    print("=== results ===")
    print(json.dumps(per_phase, indent=2))
    print("fails:", fails)

    cleanup(aid, cid)
    return result


if __name__ == "__main__":
    asyncio.run(run())
