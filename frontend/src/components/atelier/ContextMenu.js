import { useEffect, useRef, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { toCss } from "@/lib/uiScale";

// Menu contextuel de l'Atelier : clic droit sur ordinateur, appui long sur téléphone
export const showMenu = (x, y, entries, title = "") => window.dispatchEvent(new CustomEvent("at-menu", { detail: { x, y, entries, title } }));

export function pressMenu(build) {
  let t = null; let sx = 0; let sy = 0;
  const clear = () => { clearTimeout(t); t = null; };
  return {
    onContextMenu: (e) => { e.preventDefault(); e.stopPropagation(); const b = build(); showMenu(e.clientX, e.clientY, b.entries, b.title); },
    onTouchStart: (e) => {
      const p = e.touches[0]; sx = p.clientX; sy = p.clientY;
      t = setTimeout(() => { t = "done"; navigator.vibrate?.(12); const b = build(); showMenu(sx, sy, b.entries, b.title); }, 520);
    },
    onTouchMove: (e) => { const p = e.touches[0]; if (t && t !== "done" && Math.hypot(p.clientX - sx, p.clientY - sy) > 10) clear(); },
    onTouchEnd: (e) => { if (t === "done") e.preventDefault(); clear(); },
  };
}

// Cible de dépôt pour un élément de l'Atelier attrapé (glisser-déposer)
export const ITEM_MIME = "application/x-atelier-item";
export function itemDrop(onItem) {
  const ok = (e) => [...(e.dataTransfer?.types || [])].includes(ITEM_MIME);
  return {
    onDragOver: (e) => { if (ok(e)) { e.preventDefault(); e.currentTarget.classList.add("at-drop-on"); } },
    onDragLeave: (e) => e.currentTarget.classList.remove("at-drop-on"),
    onDrop: (e) => { if (!ok(e)) return; e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove("at-drop-on"); e.dataTransfer.getData(ITEM_MIME).split(",").filter(Boolean).forEach(onItem); },
  };
}

export function ContextMenuHost() {
  const [m, setM] = useState(null);
  const [stack, setStack] = useState([]);
  const box = useRef(null);
  useEffect(() => {
    const on = (e) => { setM(e.detail); setStack([]); };
    const off = () => setM(null);
    window.addEventListener("at-menu", on); window.addEventListener("resize", off);
    return () => { window.removeEventListener("at-menu", on); window.removeEventListener("resize", off); };
  }, []);
  useEffect(() => {
    if (!m || !box.current) return;
    const r = box.current.getBoundingClientRect(); const el = box.current;
    el.style.left = `${toCss(Math.max(8, Math.min(m.x, window.innerWidth - r.width - 8)))}px`;
    el.style.top = `${toCss(Math.max(8, Math.min(m.y, window.innerHeight - r.height - 8)))}px`;
  }, [m, stack]);
  if (!m) return null;
  const cur = stack.length ? stack[stack.length - 1] : { entries: m.entries, title: m.title };
  const pick = (en) => { if (en.sub) setStack([...stack, { entries: en.sub, title: en.label }]); else { setM(null); en.onClick?.(); } };
  return (
    <div className="at-ctx-wrap" onClick={() => setM(null)} onContextMenu={(e) => { e.preventDefault(); setM(null); }} data-testid="context-menu-overlay">
      <div className="at-ctx" ref={box} onClick={(e) => e.stopPropagation()} data-testid="context-menu">
        {cur.title && <div className="at-ctx-t mono">{stack.length > 0 && <button onClick={() => setStack(stack.slice(0, -1))} data-testid="context-menu-back"><IoChevronBack size={12} /></button>}{cur.title.toUpperCase()}</div>}
        {cur.entries.filter(Boolean).map((en, i) => en === "-" ? <hr key={i} /> : (
          <button key={i} className={(en.danger ? "danger " : "") + (en.on ? "on" : "")} onClick={() => pick(en)} disabled={en.disabled} data-testid={`context-menu-${en.id || i}`}>
            {en.icon && <span className="ic">{en.icon}</span>}<span className="lb">{en.label}</span>{en.sub && <IoChevronForward size={12} />}
          </button>
        ))}
      </div>
    </div>
  );
}
