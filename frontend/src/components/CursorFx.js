import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "@/components/cursorFx.css";

/*
  Effets de souris (ordinateur uniquement, jamais au toucher) :
  lab (viseur fin + coordonnées, comme l'atelier), spot (lampe), ring (anneau en retard), trail (traînée),
  glow (halo), dot (point), cross (réticule). Tout passe par transform, une seule boucle d'animation.
*/
export default function CursorFx({ type, color, layer = "world" }) {
  const root = useRef(null); const a = useRef(null); const b = useRef(null); const txt = useRef(null); const trail = useRef([]);
  const on = type && type !== "none";
  useEffect(() => {
    if (!on) return undefined;
    if (window.matchMedia?.("(hover: none)").matches) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0, seen = false;
    const pts = Array.from({ length: 14 }, () => ({ x, y }));
    const mv = (e) => { x = e.clientX; y = e.clientY; if (!seen) { seen = true; rx = x; ry = y; root.current?.classList.add("in"); } };
    const out = () => { seen = false; root.current?.classList.remove("in"); };
    const tick = () => {
      const k = reduce ? 1 : 0.18; rx += (x - rx) * k; ry += (y - ry) * k;
      const el = root.current;
      if (el) {
        if (type === "lab") {
          if (a.current) a.current.style.transform = `translateY(${y}px)`;
          if (b.current) b.current.style.transform = `translateX(${x}px)`;
          if (txt.current) { txt.current.style.transform = `translate(${x + 14}px,${y + 12}px)`; txt.current.textContent = `X ${String(Math.round(x)).padStart(4, "0")} · Y ${String(Math.round(y)).padStart(4, "0")}`; }
        } else if (type === "spot") el.style.setProperty("--cx", `${x}px`), el.style.setProperty("--cy", `${y}px`);
        else if (type === "trail") {
          pts.unshift({ x, y }); pts.length = 14;
          trail.current.forEach((d, i) => { if (d) d.style.transform = `translate(${pts[i].x}px,${pts[i].y}px) scale(${1 - i / 15})`; });
        } else {
          if (a.current) a.current.style.transform = `translate(${x}px,${y}px)`;
          if (b.current) b.current.style.transform = `translate(${rx}px,${ry}px)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", mv, { passive: true }); document.addEventListener("pointerleave", out);
    raf = requestAnimationFrame(tick);
    document.documentElement.classList.add("cfx-on", "cfx-" + type);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", mv); document.removeEventListener("pointerleave", out); document.documentElement.classList.remove("cfx-on", "cfx-" + type); };
  }, [type, on]);
  if (!on) return null;
  return createPortal(
    <div ref={root} className={"cfx cfx-" + layer + " cfx-t-" + type} style={color ? { "--cfx": color } : undefined} aria-hidden="true">
      {type === "lab" && <><i ref={a} className="cfx-h" /><i ref={b} className="cfx-v" /><span ref={txt} className="cfx-txt" /></>}
      {type === "trail" && Array.from({ length: 14 }, (_, i) => <i key={i} ref={(el) => { trail.current[i] = el; }} className="cfx-tr" style={{ opacity: 1 - i / 14 }} />)}
      {["ring", "glow", "dot", "cross"].includes(type) && <><i ref={a} className="cfx-a" /><i ref={b} className="cfx-b" /></>}
    </div>,
    document.body
  );
}
