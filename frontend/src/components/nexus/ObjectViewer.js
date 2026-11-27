import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose, IoRefresh } from "react-icons/io5";
import Box3D from "@/components/nexus/Box3D";

// Voir un objet sous toutes ses faces : on le fait tourner au doigt ou à la souris (couverture, tranche, dos).
// Il s'ouvre aussi par l'événement nx-objet { b, cover }.
export default function ObjectViewer() {
  const [o, setO] = useState(null);
  const [rot, setRot] = useState({ x: -6, y: 28 });
  const drag = useRef(null);
  useEffect(() => { const h = (e) => { setRot({ x: -6, y: 28 }); setO(e.detail); }; window.addEventListener("nx-objet", h); return () => window.removeEventListener("nx-objet", h); }, []);
  useEffect(() => { if (!o) return undefined; const k = (e) => { if (e.key === "Escape") setO(null); if (e.key === "ArrowLeft") setRot((r) => ({ ...r, y: r.y - 20 })); if (e.key === "ArrowRight") setRot((r) => ({ ...r, y: r.y + 20 })); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [o]);
  if (!o) return null;
  const down = (e) => { drag.current = { x: e.clientX, y: e.clientY, r: rot }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const move = (e) => { const d = drag.current; if (!d) return; setRot({ y: d.r.y + (e.clientX - d.x) * 0.6, x: Math.max(-60, Math.min(60, d.r.x - (e.clientY - d.y) * 0.4)) }); };
  const up = () => { drag.current = null; };
  return createPortal(
    <div className="nx-ov" role="dialog" aria-label={`L'objet de ${o.b.title}`} data-testid="object-viewer" onClick={() => setO(null)}>
      <div className="nx-ov-stage" onClick={(e) => e.stopPropagation()} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div className="nx-ov-obj" style={{ "--rx": rot.x + "deg", "--ry": rot.y + "deg" }}><Box3D b={o.b} cover={o.cover} full /></div>
      </div>
      <p className="nx-ov-t" onClick={(e) => e.stopPropagation()}><b>{o.b.title}</b><small className="mono">FAIS-LE TOURNER DU DOIGT OU À LA SOURIS</small></p>
      <div className="nx-ov-acts" onClick={(e) => e.stopPropagation()}>
        {[["Face", 0], ["Tranche", 90], ["Dos", 180]].map(([l, y]) => <button key={l} type="button" onClick={() => setRot({ x: 0, y })}>{l}</button>)}
        <button type="button" onClick={() => setRot({ x: -6, y: 28 })} aria-label="Remettre"><IoRefresh size={15} /></button>
        <button type="button" onClick={() => setO(null)} aria-label="Fermer" data-testid="object-viewer-close"><IoClose size={16} /></button>
      </div>
    </div>, document.body);
}
