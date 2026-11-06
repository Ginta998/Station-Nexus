import { useState } from "react";
import { IoCheckboxOutline, IoClose } from "react-icons/io5";
import "@/components/atelier/bulk.css";

// Sélection multiple partagée (Drive, Radio, Salon)
export function useSel() {
  const [ids, setIds] = useState([]);
  const [on, setOn] = useState(false);
  return {
    ids, on,
    has: (id) => ids.includes(id),
    toggle: (id) => { setOn(true); setIds((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id])); },
    setAll: (all) => setIds(all),
    start: () => setOn(true),
    clear: () => { setIds([]); setOn(false); },
  };
}

export const SelBtn = ({ sel, className = "at-btn ghost" }) => (
  <button className={className + (sel.on ? " on" : "")} onClick={() => (sel.on ? sel.clear() : sel.start())} data-testid="bulk-toggle">
    <IoCheckboxOutline size={15} /> {sel.on ? "Terminer" : "Sélectionner"}
  </button>
);

export function BulkBar({ sel, all, children }) {
  if (!sel.on) return null;
  const n = sel.ids.length;
  return (
    <div className="at-bulk" data-testid="bulk-bar">
      <b data-testid="bulk-count">{n} sélectionné{n > 1 ? "s" : ""}</b>
      {all && <button onClick={() => sel.setAll(n === all.length ? [] : all)} data-testid="bulk-all">{n === all.length ? "Aucun" : "Tout"}</button>}
      {n > 0 && children}
      <button className="x" onClick={sel.clear} aria-label="Annuler" data-testid="bulk-cancel"><IoClose size={16} /></button>
    </div>
  );
}
