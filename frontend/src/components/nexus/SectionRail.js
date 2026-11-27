import { useEffect, useState } from "react";
import { blocOf } from "@/lib/blocs";

// Menu sur le côté (Nexus OS) : l'index des sections de l'accueil et la progression de la lecture, comme un programme de séance.
export default function SectionRail({ blocs = [], root }) {
  const [pos, setPos] = useState(() => document.documentElement.dataset.menuPos || "");
  const [cur, setCur] = useState(blocs[0]);
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const mo = new MutationObserver(() => setPos(document.documentElement.dataset.menuPos || ""));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-menu-pos"] });
    return () => mo.disconnect();
  }, []);
  useEffect(() => {
    if (pos !== "cote") return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProg(h > 0 ? Math.min(1, window.scrollY / h) : 0);
      const els = [...(root.current?.querySelectorAll(".nb") || [])];
      const mid = window.innerHeight * 0.4;
      let c = els[0]; els.forEach((e) => { if (e.getBoundingClientRect().top < mid) c = e; });
      if (c) setCur(c.dataset.bloc);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick(); window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, [pos, blocs, root]);
  if (pos !== "cote") return null;
  const go = (k) => root.current?.querySelector(`.nb[data-bloc="${k}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const list = blocs;
  return (
    <nav className="nx-rail" aria-label="Sections de l'accueil" data-testid="section-rail">
      <span className="nx-rail-h">Programme</span>
      {list.map((k, i) => (
        <button key={k} type="button" className={k === cur ? "on" : ""} onClick={() => go(k)} title={blocOf(k)?.label}>
          <b>{String(i + 1).padStart(2, "0")}</b><span>{blocOf(k)?.label}</span>
        </button>
      ))}
      <span className="nx-rail-p" aria-hidden="true"><i style={{ transform: `scaleY(${prog})` }} /></span>
    </nav>
  );
}
