import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useThemeState, themeDef, cssVars, fontHref, keySound } from "@/lib/themeStore";
import { imgSrc } from "@/lib/atelier";
import { LOCAL_FONTS } from "@/lib/localFonts";
import { setAmbientLayers } from "@/lib/ambient";
import "@/components/themeRuntime.css";
import CursorFx from "@/components/CursorFx";
import SceneCompose from "@/components/SceneCompose";
import MouseFx from "@/components/MouseFx";
import "@/components/nexus/menu.css";
import { useLumiere, useDecorCourant } from "@/lib/lumiere";
import "@/components/nexus/perf.css";
import "@/components/nexus/pages.css";

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
  const { theme, selectAmbience, muted, uiVolume, isAdmin } = useApp();
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
      // Public : uniquement les polices hébergées par la Station. Admin : Google pour les polices non hébergées (aperçu des thèmes).
      const remote = [d.font_display, d.font_body].filter((f) => f && !LOCAL_FONTS.has(f));
      const href = isAdmin && remote.length ? fontHref(remote) : "";
      if (href) { if (link.href !== href) link.href = href; } else link.removeAttribute("href");
    }
  }, [d, isAdmin]);

  // Lumière du décor : fixée par le thème
  const lum = useLumiere(theme, d?.lumiere || "");
  const decorNow = useDecorCourant(theme, d?.bg?.type === "compose" ? d?.bg?.layers : null);
  useEffect(() => { const el = document.documentElement; if (d?.bg?.type === "compose" && lum !== "jour") el.setAttribute("data-lumiere", lum); else el.removeAttribute("data-lumiere"); }, [lum, d?.bg?.type]);

  // Nexus OS : le cadre (menu) et le mouvement de la page, posés en attributs sur <html> pour toute l'app
  const loc = useLocation();
  const pages = d?.pages || {};
  const menu = d?.menu || {}; const fen = d?.fenetres || {}; const anim = d?.anim || {}; const tune = d?.bg?.type === "scene" ? d?.bg?.tune || {} : {};
  useEffect(() => {
    const el = document.documentElement;
    const attrs = { "data-pg-panneaux": pages.panneaux, "data-pg-titres": pages.titres, "data-pg-transition": pages.transition, "data-menu-pos": menu.pos, "data-menu-mat": menu.mat, "data-icones": menu.icones, "data-cadre": menu.cadre, "data-tiroir": menu.tiroir, "data-tiroir-pos": menu.tiroir_pos, "data-voile": menu.voile, "data-ov-mat": fen.mat, "data-ov-voile": fen.voile, "data-ov-anim": fen.anim, "data-defile": anim.defile === "sections" ? "sections" : "", "data-parallaxe": anim.parallaxe, "data-lancement": anim.lancement };
    Object.entries(attrs).forEach(([k, v]) => (v ? el.setAttribute(k, v) : el.removeAttribute(k)));
    // Réglage de la scène d'origine : teinte, saturation, lumière, intensité
    const f = [tune.teinte ? `hue-rotate(${tune.teinte}deg)` : "", tune.sat != null && tune.sat !== 100 ? `saturate(${tune.sat}%)` : "", tune.lum != null && tune.lum !== 100 ? `brightness(${tune.lum}%)` : ""].filter(Boolean).join(" ");
    if (f) el.style.setProperty("--scene-f", f); else el.style.removeProperty("--scene-f");
    if (tune.op != null && tune.op !== 100) el.style.setProperty("--scene-o", tune.op / 100); else el.style.removeProperty("--scene-o");
  }, [pages.panneaux, pages.titres, pages.transition, menu.pos, menu.mat, menu.icones, menu.cadre, menu.tiroir, menu.tiroir_pos, menu.voile, fen.mat, fen.voile, fen.anim, anim.defile, anim.parallaxe, anim.lancement, tune.teinte, tune.sat, tune.lum, tune.op]);
  // Taille du titre du thème en haut de l'accueil (bloc En-tête), en % : réglable dans Nexus OS › Blocs
  const tt = d?.titre_taille;
  useEffect(() => { const el = document.documentElement; if (tt && tt !== 100) el.style.setProperty("--nx-titre", tt / 100); else el.style.removeProperty("--nx-titre"); }, [tt]);
  // La page affichée (accueil, journal, oeuvre…) : les réglages « Pages » ne touchent ni l'accueil, ni l'Atelier, ni les mondes des œuvres
  const first = useRef(true);
  useEffect(() => {
    const el = document.documentElement; const seg = loc.pathname.split("/")[1] || "accueil";
    el.setAttribute("data-route", seg);
    // Filet de sécurité : hors d'une œuvre, aucun voile de lancement ni passage de page ne doit rester posé sur l'écran
    const safe = setTimeout(() => { if (seg !== "oeuvre") document.getElementById("nx-veil")?.remove(); el.removeAttribute("data-pt-run"); if (!document.querySelector(".uvw-win,[role=dialog],.nx-launchfx")) document.body.style.overflow = ""; }, 1400);
    if (first.current) { first.current = false; return () => clearTimeout(safe); }
    if (!pages.transition) return () => clearTimeout(safe);
    el.setAttribute("data-pt-run", ""); const t = setTimeout(() => el.removeAttribute("data-pt-run"), 760);
    return () => { clearTimeout(t); clearTimeout(safe); el.removeAttribute("data-pt-run"); };
  }, [loc.pathname]); // eslint-disable-line
  // Vitesse de la scène d'origine : on règle la cadence de ses animations
  useEffect(() => {
    const r = (tune.vit ?? 100) / 100; if (r === 1) return undefined;
    const apply = () => document.querySelectorAll(".cosmic-bg").forEach((n) => n.getAnimations?.({ subtree: true }).forEach((a) => { a.playbackRate = r; }));
    apply(); const t = setInterval(apply, 2500);
    return () => { clearInterval(t); document.querySelectorAll(".cosmic-bg").forEach((n) => n.getAnimations?.({ subtree: true }).forEach((a) => { a.playbackRate = 1; })); };
  }, [tune.vit]);
  // Fluidité du défilement : pendant qu'on fait défiler, les animations en boucle du décor se mettent en pause
  // (c'est elles qui coûtent le plus, surtout au téléphone) et reprennent 0,2 s après l'arrêt.
  // Les animations d'apparition (qui ne tournent qu'une fois) continuent : rien ne reste invisible.
  useEffect(() => {
    let t = 0; let held = null;
    const stop = () => { (held || []).forEach((a) => { try { a.play(); } catch (_) { /* déjà retirée */ } }); held = null; };
    const onScroll = () => {
      if (!held) { try { held = document.getAnimations().filter((a) => a.playState === "running" && a.effect?.getTiming?.().iterations === Infinity); held.forEach((a) => a.pause()); } catch (_) { held = []; } }
      clearTimeout(t); t = setTimeout(stop, 200);
    };
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => { window.removeEventListener("scroll", onScroll, { capture: true }); clearTimeout(t); stop(); };
  }, []);
  // Parallaxe : quelques éléments seulement bougent (on ne touche pas aux variables de toute la page, trop coûteux)
  useEffect(() => {
    if (!anim.parallaxe) return undefined;
    const pf = anim.parallaxe === "forte" ? 0.4 : 0.18;
    const T = [[".sx-exp .hb-cinema .cn-media", 1], [".sx-exp .hb-affiche .af-kj", -1], [".sx-exp .vp-img", 0.6], [".sx-exp .cinehead .ct-title", 0.5], [".sx-exp .sx-soutien .sk", -0.15], [".nx-univ-page .uv-bg", 0.5]];
    let raf = 0;
    const paint = () => { raf = 0; const y = Math.min(window.scrollY, 2400); T.forEach(([q, k]) => document.querySelectorAll(q).forEach((n) => { n.style.translate = `0 ${(y * pf * k).toFixed(1)}px`; })); };
    const on = () => { if (!raf) raf = requestAnimationFrame(paint); };
    paint(); window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); if (raf) cancelAnimationFrame(raf); T.forEach(([q]) => document.querySelectorAll(q).forEach((n) => { n.style.translate = ""; })); };
  }, [anim.parallaxe]);
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
  const pt = pages.transition && pages.transition !== "fondu" ? <div className={"nx-pt-ov pt-" + pages.transition} aria-hidden="true" /> : null;
  const b = d.bg || {};
  const cfx = d.cursor_fx && d.cursor_fx !== "none" ? <CursorFx type={d.cursor_fx} color={d.colors?.brand} layer="station" /> : null;
  if (!b.type && !d.fx && !d.souris) return <>{cfx}{pt}</>;
  const yt = b.type === "video" && ytId(b.url || "");
  return (<>
    <div className="nx-tlayer" aria-hidden="true" data-testid="theme-runtime-layer">
      {cfx}
      {b.type === "compose" && <SceneCompose layers={decorNow ? { ...b.layers, decor: decorNow } : b.layers} mouse={d.souris === "profondeur"} />}
      {b.type === "gradient" && <div className="nx-tbg" style={{ background: `linear-gradient(${b.angle ?? 160}deg,${(b.g || []).join(",")})` }} />}
      {b.type === "image" && b.url && <div className="nx-tbg" style={{ backgroundImage: `url(${imgSrc(b.url)})`, filter: b.blur ? `blur(${b.blur}px)` : undefined }} />}
      {b.type === "video" && b.url && (yt
        ? <iframe className="nx-tbg nx-tyt" src={`https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&controls=0&loop=1&playlist=${yt}&playsinline=1&rel=0`} title="fond" allow="autoplay" referrerPolicy="strict-origin-when-cross-origin" />
        : <video className="nx-tbg" src={imgSrc(b.url)} autoPlay muted loop playsInline />)}
      {b.type && b.type !== "scene" && b.type !== "compose" && <div className="nx-tdim" style={{ opacity: (b.dim ?? 30) / 100 }} />}
      {d.fx?.fog > 0 && <div className="nx-fog" style={{ opacity: d.fx.fog / 100, "--fc": d.fx_color || "#fff" }}><i /><i /></div>}
      <ThemeFx fx={d.fx || {}} color={d.fx_color || "#ffffff"} />
      {d.souris && <MouseFx type={d.souris} color={d.fx_color || d.colors?.brand} />}
    </div>
    {pt}
  </>);
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
    const coarse = window.matchMedia("(pointer:coarse)").matches; const dens = coarse ? 0.5 : 1;
    // une lueur dessinée une fois, réutilisée pour chaque particule (bien plus léger qu'un dégradé par particule)
    const spr = document.createElement("canvas"); spr.width = spr.height = 64; { const x = spr.getContext("2d"); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, color); gr.addColorStop(1, "transparent"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); }
    const add = (type, n) => { for (let i = 0; i < n; i++) P.push({ type, x: R() * W, y: R() * H, r: R(), v: R(), p: R() * 6.28 }); };
    Object.entries(fx).forEach(([k, v]) => { if (k !== "fog" && v > 0) add(k, Math.round(dens * v * ({ stars: 2, rain: 2.4, snow: 1.4, particles: 0.8, petals: 0.5, embers: 0.8, fireflies: 0.5 }[k] || 1))); });
    if (!P.length) return () => window.removeEventListener("resize", size);
    let last = 0;
    const draw = (t) => {
      if (coarse && t - last < 30) { raf = requestAnimationFrame(draw); return; } last = t;
      if (document.hidden) { raf = requestAnimationFrame(draw); return; }
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
        g.globalAlpha = a; g.drawImage(spr, q.x - rad * 3, q.y - rad * 3, rad * 6, rad * 6);
      }
      g.globalAlpha = 1;
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", size); };
  }, [sig]); // eslint-disable-line
  return <canvas ref={cv} className="nx-tfx" />;
}
