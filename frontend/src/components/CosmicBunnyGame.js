import { useEffect, useRef, useState, useCallback } from "react";
import { IoClose, IoPlay, IoRefresh } from "react-icons/io5";
import { useApp } from "@/context/AppContext";

const HI_KEY = "sx_game_cosmic_bunny_hi";
const GRAVITY = 2600;
const JUMP_V = -960;

export default function CosmicBunnyGame({ item, onClose }) {
  const { sfx } = useApp();
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const stateRef = useRef(null);
  const phaseRef = useRef("start");

  const [phase, setPhase] = useState("start"); // start | playing | over
  const [score, setScore] = useState(0);
  const [delivered, setDelivered] = useState(0);
  const [lives, setLives] = useState(3);
  const [hiscore, setHiscore] = useState(() => { const v = parseInt(localStorage.getItem(HI_KEY)); return Number.isFinite(v) ? v : 0; });

  phaseRef.current = phase;

  const makeSkyline = (W) => {
    const arr = [];
    let x = 0;
    while (x < W + 220) {
      const w = 24 + Math.random() * 46;
      const h = 40 + Math.random() * 150;
      arr.push({ x, w, h });
      x += w + 6 + Math.random() * 18;
    }
    return arr;
  };

  const resetGame = useCallback(() => {
    const cv = canvasRef.current;
    const W = cv ? cv.clientWidth : 400;
    stateRef.current = {
      W, speed: 320, dist: 0, score: 0, delivered: 0, lives: 3, inv: 0,
      player: { x: 78, jy: 0, vy: 0, grounded: true, tilt: 0 },
      obstacles: [], packages: [],
      obT: 0, obEvery: 1.25, pkT: 0, pkEvery: 2.0,
      dust: Array.from({ length: 30 }, () => ({ x: Math.random(), y: Math.random(), s: 0.4 + Math.random() })),
      skyOff: 0, skyline: makeSkyline(W), skW: 0, groundOff: 0, flash: 0, lightning: 0,
      last: performance.now(),
    };
    stateRef.current.skW = stateRef.current.skyline.reduce((a, b) => Math.max(a, b.x + b.w), 0) + 20;
    setScore(0); setDelivered(0); setLives(3);
  }, []);

  const start = () => { sfx("select"); resetGame(); setPhase("playing"); };

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (phaseRef.current !== "playing" || !s) return;
    if (s.player.grounded) { s.player.vy = JUMP_V; s.player.grounded = false; try { sfx("nav"); } catch (_) {} }
  }, [sfx]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        if (phaseRef.current === "playing") jump(); else start();
      } else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line
  }, [jump]);

  useEffect(() => {
    const cv = canvasRef.current;
    const resize = () => {
      if (!cv) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth, h = cv.clientHeight;
      cv.width = Math.floor(w * dpr); cv.height = Math.floor(h * dpr);
      cv.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
      if (stateRef.current) stateRef.current.W = w;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");

    const drawBiker = (px, groundY, jy, tilt, blink) => {
      ctx.save();
      ctx.translate(px, groundY + jy);
      ctx.rotate(tilt);
      if (blink) ctx.globalAlpha = 0.35;
      ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.font = "20px serif"; ctx.fillText("📦", -22, -22);
      ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 16;
      ctx.font = "46px serif"; ctx.fillText("🏍️", 2, 2);
      ctx.shadowBlur = 0;
      ctx.font = "26px serif"; ctx.fillText("🐰", 4, -26);
      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop);
      const W = cv.clientWidth, H = cv.clientHeight;
      const s = stateRef.current;
      const playing = phaseRef.current === "playing" && s;
      let dt = 0;
      if (s) { dt = Math.min(0.045, (now - s.last) / 1000); s.last = now; }
      const groundY = H - 78;

      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#2a0806"); sky.addColorStop(0.45, "#5c130c");
      sky.addColorStop(0.75, "#8a2417"); sky.addColorStop(1, "#1a0603");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

      if (s) {
        if (playing && Math.random() < 0.004) s.lightning = 0.18;
        if (s.lightning > 0) { ctx.fillStyle = `rgba(255,180,120,${s.lightning})`; ctx.fillRect(0, 0, W, H); s.lightning -= dt; }

        if (playing) s.skyOff -= s.speed * 0.12 * dt;
        ctx.fillStyle = "rgba(10,4,10,0.78)";
        const base = ((s.skyOff % s.skW) + s.skW) % s.skW;
        for (let rep = -1; rep < 2; rep++) {
          const ox = -base + rep * s.skW;
          for (const b of s.skyline) ctx.fillRect(ox + b.x, groundY - b.h, b.w, b.h);
        }

        for (const d of s.dust) {
          if (playing) { d.x -= (s.speed * 0.0009) * d.s; if (d.x < 0) { d.x = 1; d.y = Math.random(); } }
          ctx.globalAlpha = 0.16 * d.s; ctx.fillStyle = "#ffb27a";
          ctx.fillRect(d.x * W, d.y * (groundY - 20), 2 + d.s, 2 + d.s);
        }
        ctx.globalAlpha = 1;

        ctx.fillStyle = "#160804"; ctx.fillRect(0, groundY, W, H - groundY);
        ctx.strokeStyle = "rgba(255,120,60,0.55)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();
        if (playing) s.groundOff = (s.groundOff - s.speed * dt) % 46;
        ctx.strokeStyle = "rgba(255,90,50,0.25)";
        for (let x = s.groundOff; x < W; x += 46) { ctx.beginPath(); ctx.moveTo(x, groundY + 10); ctx.lineTo(x + 14, H); ctx.stroke(); }

        if (playing) {
          s.dist += s.speed * dt;
          s.speed = Math.min(660, 320 + s.dist * 0.03);
          s.obEvery = Math.max(0.62, 1.25 - s.dist * 0.00006);

          const p = s.player;
          p.vy += GRAVITY * dt; p.jy += p.vy * dt;
          if (p.jy >= 0) { p.jy = 0; p.vy = 0; p.grounded = true; }
          p.tilt = p.grounded ? p.tilt * 0.8 : Math.max(-0.35, p.vy / 3200);
          if (s.inv > 0) s.inv -= dt;

          s.obT += dt;
          if (s.obT >= s.obEvery) {
            s.obT = 0;
            const kinds = ["🪨", "🚧", "🛢️", "⚙️"];
            s.obstacles.push({ x: W + 40, w: 30, h: 30 + Math.random() * 22, emoji: kinds[Math.floor(Math.random() * kinds.length)] });
          }
          s.pkT += dt;
          if (s.pkT >= s.pkEvery) {
            s.pkT = 0; s.pkEvery = 1.6 + Math.random() * 1.4;
            s.packages.push({ x: W + 40, y: groundY - (70 + Math.random() * 70) });
          }

          const p_bottom = groundY + p.jy, p_top = p_bottom - 40, p_l = p.x - 24, p_r = p.x + 26;

          for (let i = s.obstacles.length - 1; i >= 0; i--) {
            const o = s.obstacles[i]; o.x -= s.speed * dt;
            const o_l = o.x - o.w / 2, o_r = o.x + o.w / 2, o_top = groundY - o.h;
            if (p_r > o_l && p_l < o_r && p_bottom > o_top && p_top < groundY && s.inv <= 0) {
              s.lives -= 1; s.inv = 1.2; s.flash = 0.5;
              try { sfx("back"); } catch (_) {}
              setLives(s.lives);
              if (s.lives <= 0) {
                const fin = Math.floor(s.dist / 10) + s.delivered * 15;
                setScore(fin);
                if (fin > (parseInt(localStorage.getItem(HI_KEY)) || 0)) { localStorage.setItem(HI_KEY, String(fin)); setHiscore(fin); }
                setPhase("over");
              }
            }
            if (o.x < -60) s.obstacles.splice(i, 1);
          }

          for (let i = s.packages.length - 1; i >= 0; i--) {
            const pk = s.packages[i]; pk.x -= s.speed * dt;
            if (Math.hypot(pk.x - p.x, pk.y - (p_bottom - 20)) < 34) {
              s.delivered += 1; s.score += 15; setDelivered(s.delivered);
              try { sfx("select"); } catch (_) {}
              s.packages.splice(i, 1); continue;
            }
            if (pk.x < -40) s.packages.splice(i, 1);
          }

          setScore(Math.floor(s.dist / 10) + s.delivered * 15);
          if (s.flash > 0) s.flash = Math.max(0, s.flash - dt);
        }

        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        for (const pk of s.packages) {
          ctx.save(); ctx.translate(pk.x, pk.y + Math.sin(now / 250 + pk.x) * 4);
          ctx.shadowColor = "#ffd24d"; ctx.shadowBlur = 14; ctx.font = "26px serif";
          ctx.fillText("📦", 0, 0); ctx.restore();
        }
        ctx.shadowBlur = 0;

        for (const o of s.obstacles) {
          ctx.save(); ctx.translate(o.x, groundY);
          ctx.shadowColor = "#ff4020"; ctx.shadowBlur = 10;
          ctx.font = `${Math.round(o.h + 6)}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
          ctx.fillText(o.emoji, 0, 2); ctx.restore();
        }
        ctx.shadowBlur = 0;

        const blink = s.inv > 0 && Math.floor(now / 90) % 2 === 0;
        drawBiker(s.player.x, groundY, s.player.jy, s.player.tilt, blink);

        if (s.flash > 0) { ctx.fillStyle = `rgba(255,50,30,${s.flash * 0.5})`; ctx.fillRect(0, 0, W, H); }
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line
  }, [sfx]);

  const onTap = () => { if (phaseRef.current === "playing") jump(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6" style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(6px)" }} data-testid="cosmic-bunny-game">
      <div className="relative w-full max-w-md h-[80vh] max-h-[760px] border overflow-hidden" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", boxShadow: "0 0 60px rgba(255,80,40,0.3)" }}>
        <canvas ref={canvasRef} data-testid="game-canvas" className="absolute inset-0 w-full h-full touch-none select-none"
          onMouseDown={onTap} onTouchStart={(e) => { e.preventDefault(); onTap(); }} />

        <div className="absolute top-0 inset-x-0 flex items-center justify-between p-3 pointer-events-none">
          <div className="flex flex-col leading-none gap-1">
            <span className="font-display text-xl" style={{ color: "#fff", textShadow: "0 2px 10px #000" }} data-testid="game-score">{score}</span>
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "#ffd24d", textShadow: "0 2px 8px #000" }} data-testid="game-delivered">📦 {delivered} livrés</span>
          </div>
          <div className="text-lg pr-10" data-testid="game-lives" style={{ textShadow: "0 2px 10px #000" }}>{"❤️".repeat(Math.max(0, lives))}</div>
        </div>

        <button data-testid="game-close" onClick={onClose} className="absolute top-3 right-3 z-10 p-2 border" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)", background: "rgba(0,0,0,0.4)", borderRadius: "var(--radius-base)" }}>
          <IoClose size={20} />
        </button>

        {phase === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 gap-4" style={{ background: "rgba(20,4,3,0.55)" }} data-testid="game-start">
            <div className="text-5xl">🐰🏍️📦</div>
            <h2 className="font-display text-3xl md:text-4xl leading-tight" style={{ color: "#fff" }}>LIVRAISON<br /><span style={{ color: "var(--brand)" }}>TERRE V2</span></h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.78)" }}>
              Livre un maximum de 📦 à travers une planète hostile.<br />
              Saute par-dessus les obstacles 🪨🚧🛢️.<br />
              <span className="text-xs opacity-80">Espace / ↑ / tape l'écran pour sauter</span>
            </p>
            {hiscore > 0 && <p className="text-xs" style={{ color: "var(--brand)" }}>Record : {hiscore}</p>}
            <button data-testid="game-start-btn" onClick={start} className="flex items-center gap-2 px-8 py-3 font-display text-xl tracking-widest uppercase transition-transform hover:scale-105"
              style={{ background: "var(--brand)", color: "#160804", borderRadius: "var(--radius-base)", boxShadow: "0 0 30px var(--brand)" }}>
              <IoPlay /> Démarrer la tournée
            </button>
          </div>
        )}

        {phase === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 gap-3" style={{ background: "rgba(20,4,3,0.72)" }} data-testid="game-over">
            <div className="text-4xl">💥</div>
            <h2 className="font-display text-3xl" style={{ color: "#fff" }}>Moto détruite</h2>
            <p className="font-display text-5xl" style={{ color: "var(--brand)" }} data-testid="game-final-score">{score}</p>
            <p className="text-sm" style={{ color: "#ffd24d" }} data-testid="game-delivered-final">📦 {delivered} colis livrés</p>
            <p className="text-sm" style={{ color: hiscore <= score ? "#ffd24d" : "rgba(255,255,255,0.7)" }}>
              {hiscore <= score ? "🏆 Nouveau record !" : `Record : ${hiscore}`}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button data-testid="game-retry-btn" onClick={start} className="flex items-center gap-2 px-6 py-3 font-display text-lg tracking-wide uppercase transition-transform hover:scale-105"
                style={{ background: "var(--brand)", color: "#160804", borderRadius: "var(--radius-base)", boxShadow: "0 0 26px var(--brand)" }}>
                <IoRefresh /> Rejouer
              </button>
              <button data-testid="game-quit-btn" onClick={onClose} className="px-6 py-3 border font-medium" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)", borderRadius: "var(--radius-base)" }}>
                Quitter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
