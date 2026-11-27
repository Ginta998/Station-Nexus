import { useEffect, useRef } from "react";
import Box3D from "@/components/nexus/Box3D";
import "@/components/nexus/launch.css";
import { Etui, RELIURES, useFoil, edOf } from "@/components/atelier/AlexEdition";

// La vitrine de l'édition collector d'une œuvre : le livre relié tourne lentement dans le vide, son étui debout à côté.
// On le fait tourner au doigt ou à la souris ; il reprend sa rotation tout seul.
export default function CollectorVitrine({ b, cover, onSupport }) {
  useFoil();
  // la rotation passe par des variables CSS (pas de nouveau rendu à chaque image)
  const obj = useRef(null); const r = useRef({ x: -6, y: -24 });
  const drag = useRef(null); const idle = useRef(0);
  const put = () => { const el = obj.current; if (el) { el.style.setProperty("--rx", r.current.x + "deg"); el.style.setProperty("--ry", r.current.y + "deg"); } };
  useEffect(() => {
    put(); let raf = 0; let last = performance.now();
    const tick = (t) => { const dt = Math.min(64, t - last); last = t; if (!drag.current && t - idle.current > 1500) { r.current.y += dt * 0.018; put(); } raf = requestAnimationFrame(tick); };
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const down = (e) => { drag.current = { x: e.clientX, y: e.clientY, r: { ...r.current } }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const move = (e) => { const d = drag.current; if (!d) return; r.current = { y: d.r.y + (e.clientX - d.x) * 0.6, x: Math.max(-40, Math.min(40, d.r.x - (e.clientY - d.y) * 0.3)) }; put(); };
  const up = () => { drag.current = null; idle.current = performance.now(); };
  const ed = edOf(b); const st = RELIURES.find((s) => s.k === ed?.style);
  return (
    <div className="cv-wrap" data-testid="nw-collector">
      <div className="cv-stage" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {ed?.etui && <div className="cv-etui"><Etui b={b} em={b.emblem} /></div>}
        <div className="cv-obj nx-ov-obj" ref={obj}><Box3D b={b} cover={cover} full /></div>
        <i className="cv-floor" aria-hidden="true" />
      </div>
      <div className="cv-txt">
        <p className="mono cv-k">ÉDITION COLLECTOR · 装丁</p>
        <h2>{b.title}</h2>
        {b.sub && <p className="cv-sub">{b.sub}</p>}
        <ul className="cv-specs">
          <li><b>Couverture</b><span>{st?.label || "Reliée"} · {st?.hint || ""}</span></li>
          <li><b>Tranche</b><span>À médaillons dorés</span></li>
          {ed?.etui && <li><b>Étui</b><span>Dorures au trait, le livre en sort à l'ouverture</span></li>}
        </ul>
        <small className="mono cv-hint">FAIS-LE TOURNER DU DOIGT OU À LA SOURIS</small>
        {onSupport && <button className="nw-act" onClick={onSupport} data-testid="nw-collector-support">Soutenir la station</button>}
      </div>
    </div>
  );
}
