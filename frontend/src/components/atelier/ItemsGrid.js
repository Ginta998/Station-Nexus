import { useState } from "react";
import { IoAdd } from "react-icons/io5";
import { KINDS } from "@/lib/atelier";
import ItemCard from "@/components/atelier/ItemCard";

// Grille d'éléments + création rapide d'un élément du type choisi
export default function ItemsGrid({ at, open, items, newDefaults, kinds = Object.keys(KINDS), empty }) {
  const [menu, setMenu] = useState(false);
  const create = async (kind) => { setMenu(false); const it = await at.createItem({ ...newDefaults, kind }); open(it.id); };
  const sorted = [...items].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  return (
    <div>
      <div className="at-newbar">
        <div className="relative">
          <button className="at-btn" onClick={() => (kinds.length === 1 ? create(kinds[0]) : setMenu((m) => !m))} data-testid="atelier-new-item"><IoAdd size={16} /> Nouveau{kinds.length === 1 ? ` · ${KINDS[kinds[0]].label}` : ""}</button>
          {menu && (
            <div className="at-menu" data-testid="atelier-new-item-menu">
              {kinds.map((k) => <button key={k} onClick={() => create(k)} data-testid={`atelier-new-${k}`}><span className="kj">{KINDS[k].kanji}</span> {KINDS[k].label}</button>)}
            </div>
          )}
        </div>
      </div>
      {sorted.length === 0 ? <p className="at-empty big">{empty}</p> : <div className="at-grid">{sorted.map((i) => <ItemCard key={i.id} it={i} at={at} open={open} />)}</div>}
    </div>
  );
}
