import { useEffect, useRef } from "react";

// Splash public « Genèse » : une galaxie naît d'un point de lumière, tourne, puis ses étoiles
// viennent dessiner le 天 et l'anneau du favicon. Onde de choc, puis le nom de la Station.
// Toutes les couleurs viennent du thème actif (--brand, --brand-2).

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const out = (x) => 1 - Math.pow(1 - x, 3);
const clamp = (x) => Math.max(0, Math.min(1, x));

// Lit une couleur CSS (hex, rgb, nom) et la rend visible sur fond sombre.
function readColor(name, fallback) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  const c = document.createElement("canvas").getContext("2d");
  c.fillStyle = fallback; c.fillStyle = raw;
  const s = c.fillStyle;
  let rgb = s.startsWith("#") ? [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)) : (s.match(/\d+/g) || [255, 255, 255]).slice(0, 3).map(Number);
  const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  if (lum < 0.35) { const k = (0.35 - lum) / 0.35 * 0.75 + 0.25; rgb = rgb.map((v) => Math.round(v + (255 - v) * k)); }
  return rgb;
}

// Petite tache lumineuse prérendue (bien plus rapide qu'un dégradé par particule).
function sprite([r, g, b]) {
  const c = document.createElement("canvas"); c.width = c.height = 32;
  const x = c.getContext("2d"); const gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, `rgba(255,255,255,1)`); gr.addColorStop(0.22, `rgba(${r},${g},${b},.95)`); gr.addColorStop(0.55, `rgba(${r},${g},${b},.22)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 32, 32); return c;
}

// Le 天 est tracé en trait fin (Noto Sans JP Thin, chargé pour ce seul caractère).
const KFONT = (px) => `100 ${px}px "Noto Sans JP","Hiragino Sans","Yu Gothic","Microsoft YaHei",sans-serif`;
const KHREF = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100&text=%E5%A4%A9&display=block";
let fontReady = null;
function kanjiFont() {
  // la feuille de style doit être chargée avant de demander la police, sinon le navigateur répond tout de suite avec la police de secours
  fontReady = fontReady || new Promise((res) => {
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = KHREF;
    l.onload = () => (document.fonts ? document.fonts.load(KFONT(64), "天") : Promise.resolve()).then(res, res);
    l.onerror = res; document.head.appendChild(l);
  });
  return Promise.race([fontReady, new Promise((r) => setTimeout(r, 1300))]);
}

// Points du 天 (sur le trait fin) et de l'anneau, à l'échelle de l'écran.
function targets(cx, cy, R, fs) {
  const pts = [];
  const S = Math.round(fs * 1.3); const off = document.createElement("canvas"); off.width = off.height = S;
  const o = off.getContext("2d"); o.fillStyle = "#fff"; o.textAlign = "center"; o.textBaseline = "middle";
  o.font = KFONT(fs); o.fillText("天", S / 2, S / 2);
  const d = o.getImageData(0, 0, S, S).data; const step = Math.max(2, Math.round(fs / 110));
  for (let y = 0; y < S; y += step) for (let x = 0; x < S; x += step) if (d[(y * S + x) * 4 + 3] > 90) pts.push([cx - S / 2 + x, cy - S / 2 + y, 0]);
  const ring = Math.round(R * 0.9);
  for (let i = 0; i < ring; i++) { const a = (i / ring) * Math.PI * 2; pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R, 1]); }
  return pts;
}

export function GenesisAnim({ children }) {
  const cv = useRef(null); const root = useRef(null);
  useEffect(() => {
    const el = cv.current; if (!el) return undefined;
    const g = el.getContext("2d");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0;
    const fit = () => { W = el.clientWidth; H = el.clientHeight; el.width = W * dpr; el.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    fit();
    const A = readColor("--brand", "#3f86ff"), B = readColor("--brand-2", "#4fd6ff");
    root.current?.style.setProperty("--gx-a", `rgb(${A})`); root.current?.style.setProperty("--gx-b", `rgb(${B})`);
    const spr = [sprite(A), sprite(B), sprite([255, 255, 255])];
    const deep = A.map((v) => Math.round(2 + v * 0.03)).join(",");
    const m = Math.min(W, H * 0.9); const cx = W / 2, cy = H * 0.35; const R = m * 0.21;
    const fs = R * 1.02;
    const N = W < 700 ? 1500 : 2300;
    const P = Array.from({ length: N }, (_, i) => {
      const arm = i % 3; const r = Math.pow(Math.random(), 0.55) * m * 0.5;
      return {
        r, a: (arm / 3) * Math.PI * 2 + r / (m * 0.11) + (Math.random() - 0.5) * 0.55,
        w: 0.55 + 1.6 * (1 - r / (m * 0.5)), t: null, d: Math.random() * 0.35,
        s: 0.6 + Math.random() * 1.5, c: i % 7 === 0 ? 2 : i % 2, ph: Math.random() * 6.28,
        vx: 0, vy: 0,
      };
    });
    const stars = Array.from({ length: 260 }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() }));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now(); let raf = 0; let placed = false;
    // Les cibles du 天 sont posées dès que la police fine est là (au plus tard avant la convergence)
    const place = () => { if (placed) return; placed = true; const goal = targets(cx, cy, R, fs).sort(() => Math.random() - 0.5); goal.slice(0, Math.min(goal.length, N - 300)).forEach((q, i) => { P[i].t = q; }); };
    kanjiFont().then(place);

    // Le trait net : 天 fin, anneau d'un pixel, graduations qui tournent lentement, trois crochets en contre-sens
    const drawCrisp = (t, k) => {
      g.globalCompositeOperation = "lighter"; g.lineCap = "round";
      g.strokeStyle = `rgba(${A},${0.95 * k})`; g.lineWidth = 1.1; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = `rgba(255,255,255,${0.35 * k})`; g.lineWidth = 0.6; g.beginPath(); g.arc(cx, cy, R * 1.075, 0, Math.PI * 2); g.stroke();
      const rot = t * 0.06; g.strokeStyle = `rgba(${B},${0.75 * k})`;
      for (let i = 0; i < 120; i++) {
        const a = (i / 120) * Math.PI * 2 + rot; const big = i % 10 === 0; const r0 = R * 1.075, r1 = r0 + R * (big ? 0.07 : 0.028);
        g.lineWidth = big ? 1 : 0.6; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke();
      }
      g.strokeStyle = `rgba(${A},${0.8 * k})`; g.lineWidth = 1.4;
      for (let j = 0; j < 3; j++) { const a = -t * 0.12 + (j * Math.PI * 2) / 3; g.beginPath(); g.arc(cx, cy, R * 1.24, a, a + 0.55 * k); g.stroke(); }
      g.globalCompositeOperation = "source-over";
      g.save(); g.globalAlpha = k; g.font = KFONT(fs); g.textAlign = "center"; g.textBaseline = "middle";
      g.shadowColor = `rgb(${A})`; g.shadowBlur = 22; g.fillStyle = "#fff"; g.fillText("天", cx, cy);
      g.shadowBlur = 6; g.fillText("天", cx, cy); g.restore();
    };

    const frame = (now) => {
      const t = reduce ? 4 : (now - t0) / 1000;
      if (t > 1.35) place();
      g.globalCompositeOperation = "source-over";
      g.fillStyle = `rgba(${deep},.34)`; g.fillRect(0, 0, W, H); // traînées
      // Étoiles qui viennent vers nous, de plus en plus vite pendant la naissance de la galaxie
      const sp = 0.05 + 0.5 * Math.exp(-Math.pow((t - 1.6) / 0.6, 2));
      g.fillStyle = "#fff";
      for (const s of stars) {
        s.z -= sp * 0.016; if (s.z <= 0.02) { s.z = 1; s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; }
        const k = 0.5 / s.z; const x = W / 2 + s.x * W * k * 0.5, y = H / 2 + s.y * H * k * 0.5;
        g.globalAlpha = Math.min(0.85, (1 - s.z) * 1.1); g.fillRect(x, y, 1.2 + (1 - s.z) * 1.2, 1.2 + (1 - s.z) * 1.2);
      }
      g.globalAlpha = 1;
      // Lueur centrale
      const glow = clamp(t / 0.5) * (t < 2.55 ? 1 : 1.2 - 0.35 * clamp((t - 2.55) / 1));
      const gr = g.createRadialGradient(cx, cy, 0, cx, cy, m * 0.55);
      gr.addColorStop(0, `rgba(${A},${0.28 * glow})`); gr.addColorStop(0.5, `rgba(${B},${0.08 * glow})`); gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr; g.fillRect(0, 0, W, H);

      g.globalCompositeOperation = "lighter";
      const birth = out(clamp((t - 0.25) / 1.15));
      const spin = t * 0.9;
      const crisp = out(clamp((t - 2.5) / 0.9));
      for (const p of P) {
        const a = p.a + spin * p.w; const rr = p.r * birth;
        let x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.92;
        let alpha = clamp((t - 0.2 - p.d * 0.6) / 0.4);
        const e = ease(clamp((t - 1.45 - p.d) / 1.05));
        if (p.t) {
          // Vers le 天 : trajectoire courbe (on garde l'élan de la rotation)
          const bx = p.t[0], by = p.t[1];
          const sw = Math.sin(e * Math.PI) * (rr * 0.35 + 30);
          const nx = -(by - y), ny = bx - x; const nl = Math.hypot(nx, ny) || 1;
          x = x + (bx - x) * e + (nx / nl) * sw; y = y + (by - y) * e + (ny / nl) * sw;
          if (e >= 1) { x += Math.sin(t * 3 + p.ph) * 0.4; y += Math.cos(t * 2.6 + p.ph) * 0.4; }
          // une fois le trait net apparu, les particules s'effacent en poussière qui scintille
          alpha *= e >= 1 ? (1 - 0.82 * crisp) * (0.7 + 0.3 * Math.sin(t * 4 + p.ph)) : 1;
        } else if (t > 2.55) {
          // Étincelles soufflées par l'onde de choc
          if (!p.vx) { const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1; const f = 6 + Math.random() * 10; p.vx = (dx / l) * f; p.vy = (dy / l) * f; p.x = x; p.y = y; }
          p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy *= 0.97; x = p.x; y = p.y; alpha *= 1 - clamp((t - 2.55) / 1.2);
        }
        if (alpha <= 0.01) continue;
        const z = p.s * (p.t ? 0.5 + 0.5 * (1 - e) : 1) * (W < 700 ? 0.6 : 1) * 5.2;
        g.globalAlpha = alpha; g.drawImage(spr[p.c], x - z / 2, y - z / 2, z, z);
      }
      g.globalAlpha = 1;
      if (crisp > 0) drawCrisp(t, crisp);
      raf = requestAnimationFrame(frame);
    };
    g.fillStyle = `rgb(${deep})`; g.fillRect(0, 0, W, H);
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const letters = "STATION NEXUS".split("");
  return (
    <div className="gx-root" ref={root}>
      <canvas ref={cv} className="gx-cv" aria-hidden="true" />
      <div className="gx-rays" />
      <div className="gx-shock" /><div className="gx-shock b" />
      <div className="gx-flash" />
      <div className="gx-title">
        <div className="gx-word">{letters.map((c, i) => <span key={i} style={{ animationDelay: `${2.75 + i * 0.045}s` }}>{c === " " ? " " : c}</span>)}</div>
        <div className="gx-sub">Entre dans la Station</div>
      </div>
      {children}
    </div>
  );
}
