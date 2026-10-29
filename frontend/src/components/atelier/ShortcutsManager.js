import { useState } from "react";
import { IoArrowUp, IoArrowDown, IoTrashOutline, IoAdd } from "react-icons/io5";
import { isOeuvre, KINDS } from "@/lib/atelier";
import { SECTIONS, scInfo, scKey, addShortcut, appShortcut, allApps } from "@/components/atelier/Shortcuts";

// Gestion des raccourcis du téléphone : ajouter, réordonner, retirer
export default function ShortcutsManager({ at }) {
  const list = at.config.shortcuts || [];
  const [pick, setPick] = useState("");
  const save = (l) => at.saveConfig({ shortcuts: l });
  const move = (i, d) => { const l = [...list]; [l[i], l[i + d]] = [l[i + d], l[i]]; save(l); };
  const options = [
    ["Sections", SECTIONS.map(([k, l]) => [JSON.stringify({ t: "view", v: k }), l])],
    ["Univers", at.universes.map((u) => [JSON.stringify({ t: "universe", id: u.id }), u.name])],
    ["Œuvres", at.items.filter(isOeuvre).map((o) => [JSON.stringify({ t: "item", id: o.id }), o.title || "Sans titre"])],
    ["Fiches & fichiers", at.items.filter((i) => !isOeuvre(i)).slice(0, 300).map((i) => [JSON.stringify({ t: "item", id: i.id }), `${KINDS[i.kind]?.kanji || ""} ${i.title || "Sans titre"}`])],
    ["Apps du Bureau", allApps(at).map((a) => [JSON.stringify(appShortcut(a)), a.title])],
  ];
  const add = async () => { if (!pick) return; await addShortcut(at, JSON.parse(pick)); setPick(""); };
  return (
    <div data-testid="shortcuts-manager">
      {!list.length && <p className="at-sub">Aucun raccourci : la barre du bas reste vide sur téléphone. Ajoute-en ici, ou par clic droit / appui long sur un univers, une fiche ou une app.</p>}
      <div className="sc-mg-list">
        {list.map((s, i) => {
          const inf = scInfo(s, at);
          return (
            <div key={scKey(s)} className="sc-mg-row" data-testid={`shortcut-row-${i}`}>
              <span className="kj">{inf?.kanji || "?"}</span><b>{inf?.label || "Élément supprimé"}</b>
              <button className="at-icon" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Monter"><IoArrowUp size={14} /></button>
              <button className="at-icon" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Descendre"><IoArrowDown size={14} /></button>
              <button className="at-icon danger" onClick={() => save(list.filter((_, j) => j !== i))} aria-label="Retirer" data-testid={`shortcut-remove-${i}`}><IoTrashOutline size={14} /></button>
            </div>
          );
        })}
      </div>
      <div className="at-inline sc-mg-add">
        <select value={pick} onChange={(e) => setPick(e.target.value)} data-testid="shortcut-pick">
          <option value="">Choisir un endroit de l'Atelier…</option>
          {options.filter(([, o]) => o.length).map(([g, o]) => <optgroup key={g} label={g}>{o.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</optgroup>)}
        </select>
        <button className="at-btn" onClick={add} disabled={!pick} data-testid="shortcut-add"><IoAdd size={14} />Ajouter</button>
      </div>
    </div>
  );
}
