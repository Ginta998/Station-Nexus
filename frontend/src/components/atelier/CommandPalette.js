import { useEffect, useMemo, useRef, useState } from "react";
import { IoSearch, IoAdd, IoClose } from "react-icons/io5";
import { KINDS, stripHtml, isOeuvre } from "@/lib/atelier";
import { useApp } from "@/context/AppContext";
import { archiveCodes, pad } from "@/lib/archive";
import "@/components/atelier/labo.css";

// Index des archives (Ctrl K) — recherche de tout l'Atelier, façon répertoire de laboratoire, au clavier
const TABS = [["all", "TOUT"], ["u", "UNIVERS"], ["o", "ŒUVRES"], ["e", "ÉLÉMENTS"]];
const day = (d) => { if (!d) return "—"; const x = new Date(d); return isNaN(x) ? "—" : x.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" }); };

export default function CommandPalette({ at, go, open, onClose, newUniverse }) {
  const { sfx } = useApp();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [sel, setSel] = useState(0);
  const input = useRef(null);
  const list = useRef(null);
  useEffect(() => { input.current?.focus(); sfx?.("open"); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const close = () => { sfx?.("close"); onClose(); };

  const texts = useMemo(() => Object.fromEntries(at.items.map((i) => [i.id, `${i.title} ${(i.tags || []).join(" ")} ${stripHtml(i.content)}`.toLowerCase()])), [at.items]);
  // Codes d'archive stables : ordre de création
  const codes = useMemo(() => archiveCodes(at.items), [at.items]);
  const needle = q.trim().toLowerCase();

  const results = useMemo(() => {
    const uname = (id) => at.universes.find((u) => u.id === id)?.name;
    const unis = at.universes.map((u, i) => ({ u, i })).filter(({ u }) => !needle || `${u.name} ${u.group || ""}`.toLowerCase().includes(needle)).slice(0, needle ? 10 : 6)
      .map(({ u, i }) => ({ key: "u" + u.id, cat: "u", code: `U-${pad(i + 1, 2)}`, kj: u.kanji || u.name[0], color: u.color, title: u.name, sub: u.group ? u.group.toUpperCase() : "UNIVERS", type: "Univers", where: "—", date: day(u.updated_at), run: () => go({ name: "universe", id: u.id }) }));
    const items = (needle ? at.items.filter((i) => texts[i.id].includes(needle)) : at.items.slice(0, 12)).slice(0, 40).map((i) => {
      const t = texts[i.id]; const p = needle ? t.indexOf(needle) : -1;
      const snip = p > (i.title || "").length ? "…" + t.slice(Math.max(0, p - 30), p + 60) + "…" : "";
      const oe = isOeuvre(i);
      return { key: "i" + i.id, cat: oe ? "o" : "e", code: codes[i.id], kj: KINDS[i.kind]?.kanji, title: i.title || "Sans titre", sub: oe ? "ŒUVRE" : (KINDS[i.kind]?.label || "").toUpperCase(), snip, type: oe ? "Œuvre" : KINDS[i.kind]?.label, where: uname(i.universe_id) || "Inbox", date: day(i.updated_at), run: () => open(i.id) };
    });
    return [...unis, ...items].filter((r) => tab === "all" || r.cat === tab);
  }, [needle, at, texts, codes, go, open, tab]);

  const actions = useMemo(() => [
    { key: "a-note", title: needle ? `Créer la note « ${q.trim()} »` : "Nouvelle note dans l'Inbox", run: async () => { const it = await at.createItem({ kind: "note", title: q.trim() }); open(it.id); } },
    { key: "a-uni", title: "Nouvel univers", run: newUniverse },
  ], [needle, q, at, open, newUniverse]);
  const all = [...results, ...actions];

  useEffect(() => setSel(0), [needle, tab]);
  useEffect(() => { list.current?.querySelector(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" }); }, [sel]);
  const onKey = (e) => {
    if (e.key === "Escape") close();
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(all.length - 1, s + 1)); sfx?.("hover"); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); sfx?.("hover"); }
    if (e.key === "Tab") { e.preventDefault(); const i = TABS.findIndex(([k]) => k === tab); setTab(TABS[(i + (e.shiftKey ? TABS.length - 1 : 1)) % TABS.length][0]); sfx?.("nav"); }
    if (e.key === "Enter") all[sel]?.run();
  };

  return (
    <div className="ai-wrap" onClick={close} data-testid="atelier-palette">
      <div className="ai" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="ai-t">
        <div className="ai-top"><span>ATELIER / RÉPERTOIRE DES ARCHIVES</span><button onClick={close} aria-label="Fermer">FERMER <IoClose size={13} /></button></div>
        <h2 id="ai-t" className="ai-title">INDEX DES ARCHIVES <small>記録検索</small></h2>
        <label className="ai-in">
          <IoSearch size={17} aria-hidden="true" />
          <input ref={input} value={q} onChange={(e) => { setQ(e.target.value); }} onKeyDown={onKey} placeholder="Code, titre, mot dans un texte, univers…" aria-label="Rechercher dans les archives" data-testid="atelier-palette-input" />
          <kbd>ÉCHAP</kbd>
        </label>
        <div className="ai-tabs" role="tablist" aria-label="Filtrer">
          {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); sfx?.("nav"); input.current?.focus(); }}>{l}</button>)}
        </div>
        <div className="ai-head" aria-hidden="true"><span>FICHIER</span><span>TITRE / 題名</span><span>TYPE</span><span>UNIVERS</span><span>MODIFIÉ</span></div>
        <div className="ai-list" ref={list}>
          {results.length === 0 && <p className="ai-empty">Aucune archive ne correspond{needle ? ` à « ${q.trim()} »` : ""}.</p>}
          {results.map((r, i) => (
            <button key={r.key} data-i={i} className={"ai-row" + (i === sel ? " on" : "")} style={{ animationDelay: `${Math.min(i, 12) * 22}ms` }} onMouseEnter={() => setSel(i)} onClick={r.run} data-testid={`atelier-palette-result-${i}`}>
              <span className="code">{r.code}</span>
              <span className="tx"><b><i style={r.color ? { color: r.color } : undefined}>{r.kj}</i>{r.title}</b><small>{r.sub}</small>{r.snip && <em>{r.snip}</em>}</span>
              <span className="ty">{r.type}</span>
              <span className="wh">{r.where}</span>
              <span className="dt">{r.date}</span>
            </button>
          ))}
          <div className="ai-acts">
            {actions.map((a, j) => { const i = results.length + j; return (
              <button key={a.key} data-i={i} className={"ai-act" + (i === sel ? " on" : "")} onMouseEnter={() => setSel(i)} onClick={a.run} data-testid={`atelier-palette-result-${i}`}><IoAdd size={14} aria-hidden="true" />{a.title}</button>
            ); })}
          </div>
        </div>
        <div className="ai-foot"><span>{results.length} RÉSULTAT{results.length > 1 ? "S" : ""}</span><span className="keys">↑↓ NAVIGUER · TAB FILTRER · ENTRÉE OUVRIR</span><span className="db">BASE INTERNE <i /> CONNECTÉE</span></div>
      </div>
    </div>
  );
}
