import { useEffect, useRef } from "react";
import "@/components/mouseFx.css";
import { toCss } from "@/lib/uiScale";

// Nexus OS : la scène réagit à la souris (ou au doigt). Derrière le contenu, au-dessus du décor.
//   labo : le quadrillage du Laboratoire s'allume autour du pointeur (ou du doigt), comme dans la scène et au chargement de l'Atelier
//   lampe : tout est dans la pénombre, une lumière suit le pointeur
//   lucioles : de petites lumières qui s'écartent du pointeur
//   ondes : un cercle part de chaque clic
// ("profondeur" est géré par le décor lui-même : ses calques suivent la souris.)
export const SOURIS = [["", "Rien"], ["labo", "Laboratoire"], ["lampe", "Lampe"], ["profondeur", "Profondeur"], ["lucioles", "Lucioles"], ["ondes", "Ondes au clic"]];

function useXY(ref, on = true) {
  useEffect(() => {
    const n = ref.current; if (!n || !on) return undefined;
    let raf = 0, x = window.innerWidth / 2, y = window.innerHeight / 2;
    const paint = () => { raf = 0; n.style.setProperty("--mx", toCss(x) + "px"); n.style.setProperty("--my", toCss(y) + "px"); n.style.setProperty("--px", (x / window.innerWidth - 0.5).toFixed(3)); n.style.setProperty("--py2", (y / window.innerHeight - 0.5).toFixed(3)); };
    const mv = (e) => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(paint); };
    paint(); window.addEventListener("pointermove", mv, { passive: true });
    return () => { window.removeEventListener("pointermove", mv); if (raf) cancelAnimationFrame(raf); };
  }, [ref, on]);
}

function Labo() {
  const r = useRef(null); useXY(r);
  return (
    <div className="mfx mfx-labo" ref={r}>
      <div className="spot" /><div className="glow" />
    </div>
  );
}
function Lampe() {
  const r = useRef(null); useXY(r);
  return <div className="mfx mfx-lampe" ref={r} />;
}
function Ondes() {
  const r = useRef(null);
  useEffect(() => {
    const host = r.current; if (!host) return undefined;
    const down = (e) => {
      if (e.target.closest?.("input,textarea,select,[contenteditable=true]")) return;
      const s = document.createElement("i"); s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px"; host.appendChild(s); setTimeout(() => s.remove(), 1300);
    };
    window.addEventListener("pointerdown", down, { passive: true }); return () => window.removeEventListener("pointerdown", down);
  }, []);
  return <div className="mfx mfx-ondes" ref={r} />;
}
function Lucioles({ color }) {
  const c = useRef(null);
  useEffect(() => {
    const cv = c.current; if (!cv) return undefined;
    const ctx = cv.getContext("2d"); let w = 0, h = 0, raf = 0, px = -999, py = -999, alive = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const fit = () => { w = window.innerWidth; h = window.innerHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    fit();
    const coarse = window.matchMedia("(pointer:coarse)").matches; const N = coarse ? 18 : 40;
    const spr = document.createElement("canvas"); spr.width = spr.height = 32; { const x = spr.getContext("2d"); const gr = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, color); gr.addColorStop(0.35, color); gr.addColorStop(1, "transparent"); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); }
    let last = 0;
    const P = Array.from({ length: N }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, t: Math.random() * 6.28, s: 1 + Math.random() * 2 }));
    const mv = (e) => { px = e.clientX; py = e.clientY; };
    const tick = (t) => {
      if (!alive) return;
      if (coarse && t - last < 30) { raf = requestAnimationFrame(tick); return; } last = t;
      ctx.clearRect(0, 0, w, h);
      for (const p of P) {
        p.t += 0.02; p.vx += Math.cos(p.t) * 0.02; p.vy += Math.sin(p.t * 0.8) * 0.02;
        const dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy;
        if (d2 < 22000) { const f = (22000 - d2) / 22000 * 0.9; const d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx *= 0.94; p.vy *= 0.94; p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10; if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
        const a = 0.45 + Math.sin(p.t * 2) * 0.35;
        ctx.globalAlpha = Math.max(0.05, a); const z = p.s * 6; ctx.drawImage(spr, p.x - z / 2, p.y - z / 2, z, z);
      }
      raf = requestAnimationFrame(tick);
    };
    const vis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", mv, { passive: true }); window.addEventListener("resize", fit); document.addEventListener("visibilitychange", vis);
    return () => { alive = false; cancelAnimationFrame(raf); window.removeEventListener("pointermove", mv); window.removeEventListener("resize", fit); document.removeEventListener("visibilitychange", vis); };
  }, [color]);
  return <canvas className="mfx mfx-lucioles" ref={c} />;
}

export default function MouseFx({ type, color = "#ffd98a" }) {
  if (!type || type === "profondeur") return null;
  if (window.matchMedia?.("(prefers-reduced-motion:reduce)").matches && type !== "labo") return null;
  // au doigt, pas de pointeur qui survole : le halo et la lampe n'ont pas de sens (et coûtent pour rien)
  const coarse = window.matchMedia?.("(pointer:coarse)").matches;
  if (type === "labo") return <Labo />;
  if (type === "lampe") return coarse ? null : <Lampe />;
  if (type === "ondes") return <Ondes />;
  if (type === "lucioles") return <Lucioles color={color} />;
  return null;
}
