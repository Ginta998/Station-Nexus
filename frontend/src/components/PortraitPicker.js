import { useState } from "react";
import { PORTRAIT_FAMILLES, portraitsOf, portraitFam } from "@/lib/portraits";

// Choisir son portrait : une famille par onglet, tous les portraits d'un coup (pas de « voir plus » qu'on rate).
// Un appui le choisit ; il remplace la photo.
export default function PortraitPicker({ value, onPick }) {
  const [fam, setFam] = useState(() => portraitFam(value) || PORTRAIT_FAMILLES[0].key);
  const list = portraitsOf(fam);
  const cur = PORTRAIT_FAMILLES.find((f) => f.key === fam);
  return (
    <div className="pp" data-testid="portrait-picker">
      <p className="pp-l">OU CHOISIS UN PORTRAIT</p>
      <div className="pp-tabs" role="tablist">{PORTRAIT_FAMILLES.map((f) => <button key={f.key} type="button" role="tab" aria-selected={fam === f.key} className={fam === f.key ? "on" : ""} onClick={() => setFam(f.key)} data-testid={`portrait-fam-${f.key}`}>{f.label}<i>{portraitsOf(f.key).length}</i></button>)}</div>
      <p className="pp-hint">{cur?.hint}</p>
      <div className={"pp-grid f-" + fam} role="tabpanel">
        {list.map((p) => <button key={p.id} type="button" className={value === p.url ? "on" : ""} onClick={() => onPick(p.url)} aria-label={`Portrait ${p.id}`} data-testid={`portrait-${fam}-${p.id}`}><img src={p.url} alt="" loading="lazy" /></button>)}
      </div>
    </div>
  );
}
