import { useMemo, useState } from "react";
import { IoAdd, IoSearch, IoStar, IoStarOutline, IoListOutline, IoGridOutline } from "react-icons/io5";
import { imgSrc } from "@/lib/atelier";

const SORTS = [["recent", "Récents"], ["az", "A → Z"], ["size", "Les plus riches"]];

// Archives : tous les univers, recherche instantanée, constellations (groupes), épinglage, vue grille ou liste
export default function UniversesHub({ at, go, editUniverse }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recent");
  const [group, setGroup] = useState("");
  const [list, setList] = useState(() => localStorage.getItem("at_hub_list") === "1");
  const counts = useMemo(() => Object.fromEntries(at.universes.map((u) => [u.id, at.items.filter((i) => i.universe_id === u.id).length])), [at.universes, at.items]);
  const lastTouch = useMemo(() => {
    const m = {}; at.items.forEach((i) => { if (i.universe_id && (!m[i.universe_id] || i.updated_at > m[i.universe_id])) m[i.universe_id] = i.updated_at; }); return m;
  }, [at.items]);
  const groups = [...new Set(at.universes.map((u) => u.group).filter(Boolean))].sort();
  const needle = q.trim().toLowerCase();
  const shown = at.universes
    .filter((u) => (!group || u.group === group) && (!needle || `${u.name} ${u.description} ${u.group}`.toLowerCase().includes(needle)))
    .sort((a, b) => sort === "az" ? a.name.localeCompare(b.name, "fr") : sort === "size" ? counts[b.id] - counts[a.id] : (lastTouch[b.id] || b.updated_at).localeCompare(lastTouch[a.id] || a.updated_at));
  const sections = needle || group || !groups.length ? [["", shown]] : [...groups.map((g) => [g, shown.filter((u) => u.group === g)]), ["Sans constellation", shown.filter((u) => !u.group)]].filter(([, l]) => l.length);
  const pin = (e, u) => { e.stopPropagation(); at.saveUniverse({ ...u, pinned: !u.pinned }); };
  const toggleList = () => { setList((l) => { localStorage.setItem("at_hub_list", l ? "0" : "1"); return !l; }); };

  return (
    <section className="at-view" data-testid="atelier-universes">
      <header className="at-hero">
        <div><p className="at-eyebrow mono">// ARCHIVES · {at.universes.length} UNIVERS</p><h1>Tes univers</h1></div>
        <button className="at-btn" onClick={() => editUniverse({})} data-testid="atelier-new-universe"><IoAdd size={16} /> Nouvel univers</button>
      </header>
      <div className="at-hub-bar">
        <label className="at-hub-q"><IoSearch size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer les univers…" data-testid="atelier-hub-search" /></label>
        <div className="at-seg">{SORTS.map(([k, l]) => <button key={k} className={sort === k ? "on" : ""} onClick={() => setSort(k)} data-testid={`atelier-hub-sort-${k}`}>{l}</button>)}</div>
        <button className="at-icon" onClick={toggleList} title={list ? "Vue grille" : "Vue liste"} data-testid="atelier-hub-view">{list ? <IoGridOutline size={16} /> : <IoListOutline size={16} />}</button>
      </div>
      {groups.length > 0 && (
        <div className="at-chips">
          <button className={!group ? "on" : ""} onClick={() => setGroup("")}>Toutes les constellations</button>
          {groups.map((g) => <button key={g} className={group === g ? "on" : ""} onClick={() => setGroup(g)}>{g}</button>)}
        </div>
      )}
      {shown.length === 0 && <p className="at-empty big">{at.universes.length ? "Aucun univers ne correspond." : "Ton premier univers t'attend. Donne-lui un nom, une couleur, un kanji."}</p>}
      {sections.map(([g, l]) => (
        <div key={g || "all"} className="at-hub-sec">
          {g && <p className="at-hub-g mono">✦ {g.toUpperCase()} <small>{l.length}</small></p>}
          <div className={list ? "at-ulist" : "at-ugrid"}>
            {l.map((u) => (
              <div key={u.id} role="button" tabIndex={0} className="at-ucard" style={{ "--u": u.color || "var(--brand)" }} onClick={() => go({ name: "universe", id: u.id })} onKeyDown={(e) => e.key === "Enter" && go({ name: "universe", id: u.id })} data-testid={`atelier-hub-universe-${u.id}`}>
                <div className="vis">{u.cover ? <img src={imgSrc(u.cover)} alt="" loading="lazy" /> : <span className="k">{u.kanji || u.name[0]}</span>}</div>
                <div className="tx"><b>{u.name}</b><small className="mono">{counts[u.id]} ÉLÉMENT{counts[u.id] > 1 ? "S" : ""}{u.group ? ` · ${u.group.toUpperCase()}` : ""}</small>{!list && u.description && <p>{u.description}</p>}</div>
                <button className={"pin" + (u.pinned ? " on" : "")} onClick={(e) => pin(e, u)} title={u.pinned ? "Retirer des épinglés" : "Épingler dans la barre"} data-testid={`atelier-hub-pin-${u.id}`}>{u.pinned ? <IoStar size={15} /> : <IoStarOutline size={15} />}</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
