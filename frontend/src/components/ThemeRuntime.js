import { useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useThemeState, themeDef, cssVars, fontHref, keySound } from "@/lib/themeStore";
import { imgSrc } from "@/lib/atelier";
import { setAmbientLayers } from "@/lib/ambient";
import "@/components/themeRuntime.css";

const ytId = (u) => (u.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/) || [])[1];

// Construit la valeur CSS d'un curseur de thème (les formes custom prennent la couleur d'accent).
const cursorCss = (id, color) => {
  if (!id || id === "default") return "";
  if (id === "crosshair") return "crosshair";
  const c = encodeURIComponent(color || "#ffffff");
  const svg = {
    glow: `%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='14' cy='14' r='4' fill='${c}'/%3E%3Ccircle cx='14' cy='14' r='10' fill='none' stroke='${c}' stroke-opacity='.45'/%3E%3C/svg%3E`,
    ring: `%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26'%3E%3Ccircle cx='13' cy='13' r='9' fill='none' stroke='${c}' stroke-width='2'/%3E%3C/svg%3E`,
    dot: `%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Ccircle cx='6' cy='6' r='3' fill='${c}'/%3E%3C/svg%3E`,
  }[id];
  if (!svg) return "";
  const hot = { glow: "14 14", ring: "13 13", dot: "6 6" }[id];
  return `url("data:image/svg+xml,${svg}") ${hot}, auto`;
};

// Applique le thème personnalisé (ou la retouche d'un thème d'origine) à toute l'app
export default function ThemeRuntime() {
  const { theme, selectAmbience, muted, uiVolume } = useApp();
  const s = useThemeState();
  const d = themeDef(theme, s);
  const applied = useRef([]);

  useEffect(() => {
    const el = document.documentElement;
    applied.current.forEach((k) => el.style.removeProperty(k));
    const v = d ? cssVars(d) : {};
    Object.entries(v).forEach(([k, val]) => el.style.setProperty(k, val));
    applied.current = Object.keys(v);
    if (d?.blur != null) el.setAttribute("data-tblur", ""); else el.removeAttribute("data-tblur");
    el.style.cursor = cursorCss(d?.cursor, d?.colors?.brand);
    let link = document.getElementById("nx-fonts");
    if (d && (d.font_display || d.font_body)) {
      if (!link) { link = document.createElement("link"); link.id = "nx-fonts"; link.rel = "stylesheet"; document.head.appendChild(link); }
      const href = fontHref([d.font_display, d.font_body]); if (link.href !== href) link.href = href;
    }
  }, [d]);

  useEffect(() => { setAmbientLayers(d?.ambient || []); }, [JSON.stringify(d?.ambient || [])]); // eslint-disable-line
  useEffect(() => { if (d?.ambience_id) selectAmbience(d.ambience_id); }, [theme, d?.ambience_id]); // eslint-disable-line

  useEffect(() => {
    if (!d || muted || (!d.key_sound || d.key_sound === "none") && !d.click_url) return;
    const vol = uiVolume ?? 0.5;
    const file = (u) => { try { const a = new Audio(imgSrc(u)); a.volume = vol; a.play().catch(() => {}); } catch (_) {} };
    const onKey = (e) => { if (e.repeat || e.metaKey || e.ctrlKey) return; if (d.key_sound === "file" && d.key_url) file(d.key_url); else keySound(d.key_sound, vol, e.key === "Enter"); };
    const onClick = (e) => { if (d.click_url && e.target.closest?.("button,a,[role=button]")) file(d.click_url); };
    window.addEventListener("keydown", onKey); window.addEventListener("pointerdown", onClick);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("pointerdown", onClick); };
  }, [d, muted, uiVolume]);

  if (!d) return null;
  const b = d.bg || {};
  if (!b.type && !d.fx) return null;
  const yt = b.type === "video" && ytId(b.url || "");
  return (
    <div className="nx-tlayer" aria-hidden="true" data-testid="theme-runtime-layer">
      {b.type === "gradient" && <div className="nx-tbg" style={{ background: `linear-gradient(${b.angle ?? 160}deg,${(b.g || []).join(",")})` }} />}
      {b.type === "image" && b.url && <div className="nx-tbg" style={{ backgroundImage: `url(${imgSrc(b.url)})`, filter: b.blur ? `blur(${b.blur}px)` : undefined }} />}
      {b.type === "video" && b.url && (yt
        ? <iframe className="nx-tbg nx-tyt" src={`https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&controls=0&loop=1&playlist=${yt}&playsinline=1&rel=0`} title="fond" allow="autoplay" referrerPolicy="strict-origin-when-cross-origin" />
        : <video className="nx-tbg" src={imgSrc(b.url)} autoPlay muted loop playsInline />)}
      {b.type && b.type !== "scene" && <div className="nx-tdim" style={{ opacity: (b.dim ?? 30) / 100 }} />}
      {d.fx?.fog > 0 && <div className="nx-fog" style={{ opacity: d.fx.fog / 100, "--fc": d.fx_color || "#fff" }}><i /><i /></div>}
      <ThemeFx fx={d.fx || {}} color={d.fx_color || "#ffffff"} />
    </div>
  );
}

function ThemeFx({ fx, color }) {
  const cv = useRef(null);
  const { reduceMotion } = useApp();
  const sig = JSON.stringify(fx) + color + reduceMotion;
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const g = c.getContext("2d"); let W, H, raf;
    const size = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    size(); window.addEventListener("resize", size);
    const R = Math.random; const P = [];
    const add = (type, n) => { for (let i = 0; i < n; i++) P.push({ type, x: R() * W, y: R() * H, r: R(), v: R(), p: R() * 6.28 }); };
    Object.entries(fx).forEach(([k, v]) => { if (k !== "fog" && v > 0) add(k, Math.round(v * ({ stars: 2, rain: 2.4, snow: 1.4, particles: 0.8, petals: 0.5, embers: 0.8, fireflies: 0.5 }[k] || 1))); });
    if (!P.length) return () => window.removeEventListener("resize", size);
    const draw = (t) => {
      g.clearRect(0, 0, W, H);
      for (const q of P) {
        const k = q.type;
        if (k === "stars") { g.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t / 1400 + q.p)); g.fillStyle = color; g.fillRect(q.x, q.y, 1 + q.r * 1.6, 1 + q.r * 1.6); continue; }
        if (k === "rain") { q.y += 9 + q.v * 9; q.x -= 1.5; if (q.y > H) { q.y = -20; q.x = R() * W * 1.1; } g.globalAlpha = 0.25 + q.r * 0.35; g.strokeStyle = color; g.lineWidth = 1; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x - 2, q.y + 12 + q.r * 10); g.stroke(); continue; }
        if (k === "snow") { q.y += 0.4 + q.v * 1.2; q.x += Math.sin(t / 1500 + q.p) * 0.4; if (q.y > H) { q.y = -5; q.x = R() * W; } g.globalAlpha = 0.5 + q.r * 0.5; g.fillStyle = color; g.beginPath(); g.arc(q.x, q.y, 1 + q.r * 2.4, 0, 6.28); g.fill(); continue; }
        if (k === "petals") { q.y += 0.6 + q.v; q.x += Math.sin(t / 1200 + q.p) * 1.1 + 0.3; if (q.y > H) { q.y = -10; q.x = R() * W; } g.save(); g.translate(q.x, q.y); g.rotate(t / 900 + q.p); g.globalAlpha = 0.75; g.fillStyle = color; g.beginPath(); g.ellipse(0, 0, 5 + q.r * 4, 2.5 + q.r * 2, 0, 0, 6.28); g.fill(); g.restore(); continue; }
        const up = k === "embers" || k === "particles";
        if (up) { q.y -= 0.3 + q.v * (k === "embers" ? 1.4 : 0.6); q.x += Math.sin(t / 1300 + q.p) * 0.5; if (q.y < -10) { q.y = H + 10; q.x = R() * W; } }
        else { q.x += Math.sin(t / 2000 + q.p) * 0.6; q.y += Math.cos(t / 2400 + q.p) * 0.5; }
        const a = k === "fireflies" ? Math.max(0, Math.sin(t / 900 + q.p)) : 0.4 + q.r * 0.6;
        const rad = (k === "embers" ? 1.5 : 2) + q.r * 2.5;
        g.globalAlpha = a; const gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, rad * 3); gr.addColorStop(0, color); gr.addColorStop(1, "transparent"); g.fillStyle = gr; g.beginPath(); g.arc(q.x, q.y, rad * 3, 0, 6.28); g.fill();
      }
      g.globalAlpha = 1;
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", size); };
  }, [sig]); // eslint-disable-line
  return <canvas ref={cv} className="nx-tfx" />;
}
