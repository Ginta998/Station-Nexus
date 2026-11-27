import { useEffect, useRef } from "react";
import { decorOf } from "@/lib/decors";
import "@/components/sceneCompose.css";

// Nexus OS : la scène de fond. Un décor à calques (peint à la main, qui bouge en profondeur) ou un ciel en dégradé,
// puis par-dessus : un astre, des nuages, de la brume, des rayons, du grain, une vignette.
// Les particules (neige, pétales, braises, lucioles…) viennent de l'onglet Effets du thème.
export const ASTRES = [["", "Aucun"], ["soleil", "Soleil"], ["lune", "Lune"], ["planete", "Planète"]];
export const DEFAULT_LAYERS = { decor: "ete-pic", ciel: ["#0b1530", "#3b4a7a", "#e9a37a"], astre: { f: "", c: "#ffd9a0", x: 62, y: 30, t: 120, h: 60 }, nuages: 0, brume: 0, rayons: 0, grain: 8, vignette: 20, teinte: 0, lum: 100, sat: 100 };

// Le décor. Par défaut, une seule image (tous les calques aplatis) : c'est le plus fluide, surtout au téléphone.
// Avec « Profondeur » à la souris, sur ordinateur, les calques sont séparés et suivent la souris selon leur distance.
const FINE = typeof window !== "undefined" && window.matchMedia?.("(pointer:fine)").matches;
// Le réglage lumière/saturation va sur chaque image, pas sur le conteneur : sinon tout le décor est recalculé
// à chaque image dès qu'un calque bouge (souris, dérive), ce qui alourdit le défilement.
function Decor({ d, mouse, f }) {
  const el = useRef(null);
  const layered = mouse && FINE && !window.matchMedia?.("(prefers-reduced-motion:reduce)").matches;
  useEffect(() => {
    const n = el.current; if (!n || !layered) return undefined;
    let raf = 0, mx = 0, my = 0;
    const paint = () => { raf = 0; n.style.setProperty("--dx", mx.toFixed(3)); n.style.setProperty("--dy", my.toFixed(3)); };
    const onP = (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; if (!raf) raf = requestAnimationFrame(paint); };
    window.addEventListener("pointermove", onP, { passive: true });
    return () => { window.removeEventListener("pointermove", onP); if (raf) cancelAnimationFrame(raf); };
  }, [layered]);
  const cls = "scx-decor" + (d.pixel ? " px" : "");
  if (!layered) return <div className={cls} style={{ "--ar": d.w / d.h, "--top": d.top || "#000", filter: f || undefined }}><div className="scx-flat" style={{ backgroundImage: `url("${d.full}")` }} /></div>;
  const n = d.layers.length;
  return (
    <div className={cls + " deep"} ref={el} style={{ "--ar": d.w / d.h }}>
      {d.layers.map((l, i) => (
        <div key={i} className={"scx-dl" + (l.drift ? " drift" : "")} style={{ "--k": (n > 1 ? i / (n - 1) : 0).toFixed(3), "--i": i }}>
          <i style={{ backgroundImage: `url("${l.src}")`, filter: f || undefined }} />
        </div>
      ))}
    </div>
  );
}

export default function SceneCompose({ layers, mouse = false }) {
  const L = { ...DEFAULT_LAYERS, ...(layers || {}) };
  const a = { ...DEFAULT_LAYERS.astre, ...(L.astre || {}) };
  const sky = (L.ciel || DEFAULT_LAYERS.ciel).filter(Boolean);
  const d = L.decor ? decorOf(L.decor) : null;
  const f = [L.teinte ? `hue-rotate(${L.teinte}deg)` : "", L.sat != null && L.sat !== 100 ? `saturate(${L.sat}%)` : "", L.lum != null && L.lum !== 100 ? `brightness(${L.lum}%)` : ""].filter(Boolean).join(" ");
  return (
    <div className="scx" aria-hidden="true" data-testid="scene-compose" style={{ "--sky": `linear-gradient(180deg,${sky.join(",")})`, "--hz": sky[sky.length - 1] }}>
      {d ? <Decor key={d.id} d={d} mouse={mouse} f={f} /> : <div className="scx-sky" />}
      {a.f && (
        <div className={"scx-astre a-" + a.f} style={{ left: `${a.x}%`, top: `${a.y}%`, width: a.t, height: a.t, "--ac": a.c, "--ah": (a.h ?? 60) / 100 }}>
          <i />
        </div>
      )}
      {L.rayons > 0 && <div className="scx-rays" style={{ "--ra": L.rayons / 100, left: `${a.x}%`, top: `${a.y}%`, "--ac": a.c }} />}
      {L.nuages > 0 && <div className="scx-clouds" style={{ opacity: L.nuages / 100 }}>{[0, 1, 2, 3, 4].map((i) => <span key={i} className={"c" + i} />)}</div>}
      {L.brume > 0 && <div className="scx-mist" style={{ opacity: L.brume / 100 }}><i /><i /></div>}
      {L.vignette > 0 && <div className="scx-vig" style={{ opacity: L.vignette / 100 }} />}
      {L.grain > 0 && <div className="scx-grain" style={{ opacity: L.grain / 100 }} />}
    </div>
  );
}
