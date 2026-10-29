import { useEffect, useMemo, useState } from "react";
import { pressMenu, itemDrop } from "@/components/atelier/ContextMenu";
import { dropToUniverse } from "@/components/atelier/itemActions";
import { addShortcut } from "@/components/atelier/Shortcuts";
import { IoAdd, IoSearch, IoStar, IoStarOutline, IoListOutline, IoGridOutline, IoEnterOutline, IoSparklesOutline } from "react-icons/io5";
import { imgSrc } from "@/lib/atelier";
import ImportBase from "@/components/atelier/ImportBase";

const SORTS = [["recent", "Récents"], ["az", "A → Z"], ["size", "Les plus riches"]];

// Hero cinématique rotatif — même langage que le carrousel du Pont (ne laisse plus une grande image vide)
function HubHero({ universes, count, go, onNew, onImport }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (universes.length < 2) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % universes.length), 7000);
    return () => clearInterval(t);
  }, [universes.length]);
  const feat = universes[i] || null;
  return (
    <header className="at-hero" style={{ "--u": feat?.color || "var(--brand)" }} data-testid="atelier-universes-hero">
      <div className="at-hero-bg" key={feat?.id || "none"}>
        {feat?.cover ? <img src={imgSrc(feat.cover)} alt="" /> : <span className="at-hero-glow"><b>{feat?.kanji || "天"}</b></span>}
      </div>
      <span className="at-hero-grain" aria-hidden="true" />
      <div className="at-hero-content">
        <div className="at-hero-top"><p className="at-eyebrow mono">// ARCHIVES · {count} UNIVERS</p></div>
        <div className="at-hero-mid">
          <h1>{feat ? feat.name : "Tes univers"}</h1>
          <p className="at-sub">{feat?.description || "Chaque monde que tu construis vit ici. Entre, développe, relie."}</p>
          <div className="at-hero-cta">
            {feat && <button className="at-btn big" onClick={() => go({ name: "universe", id: feat.id })} data-testid="atelier-universes-hero-enter"><IoEnterOutline size={16} /> Entrer dans {feat.name}</button>}
            <button className="at-btn ghost" onClick={onNew} data-testid="atelier-new-universe"><IoAdd size={16} /> Nouvel univers</button>
            <button className="at-btn ghost" onClick={onImport} data-testid="atelier-import-open"><IoSparklesOutline size={16} /> Importer ma base</button>
          </div>
        </div>
        <div className="at-hero-foot">
          <span />
          {universes.length > 1 && (
            <div className="at-hero-dots">
              {universes.map((u, j) => <button key={u.id} className={j === i ? "on" : ""} style={{ "--u": u.color || "var(--brand)" }} onClick={() => setI(j)} aria-label={u.name} />)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Archives : tous les univers, recherche instantanée, constellations (groupes), épinglage, vue grille ou liste
export default function UniversesHub({ at, go, editUniverse }) {
  const uMenu = (u) => ({ title: u.name, entries: [
    { id: "open", label: "Ouvrir", onClick: () => go({ name: "universe", id: u.id }) },
    { id: "pin", label: u.pinned ? "Retirer des épinglés" : "Épingler dans la barre", onClick: () => at.saveUniverse({ ...u, pinned: !u.pinned }) },
    { id: "edit", label: "Modifier", onClick: () => editUniverse(u) },
    { id: "shortcut", label: "Ajouter aux raccourcis", onClick: () => addShortcut(at, { t: "universe", id: u.id }) },
    "-",
    { id: "delete", label: "Supprimer l'univers", danger: true, onClick: () => window.confirm(`Supprimer « ${u.name} » ? Ses éléments iront dans l'Inbox.`) && at.removeUniverse(u.id) },
  ] });
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recent");
  const [group, setGroup] = useState("");
  const [list, setList] = useState(() => localStorage.getItem("at_hub_list") === "1");
  const [imp, setImp] = useState(false);
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
      <HubHero universes={at.universes} count={at.universes.length} go={go} onNew={() => editUniverse({})} onImport={() => setImp(true)} />
      {imp && <ImportBase at={at} go={go} onClose={() => setImp(false)} />}
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
              <div key={u.id} role="button" tabIndex={0} className="at-ucard" style={{ "--u": u.color || "var(--brand)" }} onClick={() => go({ name: "universe", id: u.id })} onKeyDown={(e) => e.key === "Enter" && go({ name: "universe", id: u.id })} data-testid={`atelier-hub-universe-${u.id}`} {...pressMenu(() => uMenu(u))} {...itemDrop(dropToUniverse(at, u.id))}>
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
