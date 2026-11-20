import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoSearch, IoClose } from "react-icons/io5";
import { listCreations, listCategories, listJournal } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import "@/components/atelier/labo.css";

// La recherche de la station, comme l'index des archives de l'Atelier (esprit Rhine Lab) : on tape, on filtre, on ouvre au clavier.
const TABS = [["all", "TOUT"], ["o", "ŒUVRES"], ["c", "CHAPITRES"], ["j", "JOURNAL"], ["p", "PAGES"]];
const PAGES = [
  ["Journal de bord", "/journal", "Coulisses et nouveautés"], ["Planning de sortie", "/planning", "Les prochaines sorties"], ["Salon", "/salon", "Discuter en direct"],
  ["Membres", "/membres", "La communauté"], ["Soutien", "/soutien", "Faire grandir la station"], ["À propos", "/a-propos", "La station"], ["Paramètres", "/parametres", "Apparence, son, compte"],
];
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const day = (d) => { if (!d) return "—"; const x = new Date(d); return isNaN(x) ? "—" : x.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" }); };

export default function StationSearch({ onClose }) {
  const { sfx } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState(""); const [tab, setTab] = useState("all"); const [sel, setSel] = useState(0);
  const input = useRef(null); const list = useRef(null);
  const { data: creations = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const { data: journal = [] } = useQuery({ queryKey: ["journal-search"], queryFn: () => listJournal() });
  useEffect(() => { input.current?.focus(); sfx?.("open"); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const close = () => { sfx?.("close"); onClose(); };
  const go = (path) => { sfx?.("select"); onClose(); nav(path); };
  const needle = norm(q.trim());
  const catOf = (k) => cats.find((c) => c.key === k)?.label || k || "—";

  const results = useMemo(() => {
    const has = (...xs) => !needle || xs.some((x) => norm(x).includes(needle));
    const order = [...creations].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const oeuvres = order.filter((c) => has(c.title, c.tagline, c.synopsis, catOf(c.category))).slice(0, needle ? 30 : 8)
      .map((c, i) => ({ key: "o" + c.id, cat: "o", code: `SN-${String((c.order ?? i) + 1).padStart(3, "0")}`, kj: c.kanji || "核", title: c.title, sub: c.tagline || "", type: "Œuvre", where: catOf(c.category), date: day(c.updated_at), run: () => go(`/oeuvre/${c.id}`) }));
    const chaps = needle ? order.flatMap((c) => [...(c.chapters || []).map((u, i) => ({ c, u, i, w: "Chapitre" })), ...(c.episodes || []).map((u, i) => ({ c, u, i, w: "Épisode" }))])
      .filter(({ u }) => has(u.title, u.description)).slice(0, 30)
      .map(({ c, u, i, w }) => ({ key: `c${c.id}-${w}-${i}`, cat: "c", code: `${w === "Chapitre" ? "CH" : "EP"}-${String(i + 1).padStart(2, "0")}`, kj: c.kanji || "章", title: u.title || `${w} ${i + 1}`, sub: c.title.toUpperCase(), type: w, where: catOf(c.category), date: "—", run: () => go(`/oeuvre/${c.id}`) })) : [];
    const entries = journal.filter((e) => has(e.title, e.subtitle, e.excerpt)).slice(0, needle ? 30 : 6)
      .map((e) => ({ key: "j" + e.id, cat: "j", code: `JB-${String(e.date || "").slice(2, 10).replace(/-/g, "")}`, kj: "記", title: e.title, sub: e.subtitle || "", type: "Journal", where: creations.find((c) => c.id === e.creation_id)?.title || "—", date: day(e.date), run: () => go(`/journal/${e.id}`) }));
    const pages = PAGES.filter(([t, , d]) => has(t, d)).map(([t, p, d]) => ({ key: "p" + p, cat: "p", code: "PAGE", kj: "頁", title: t, sub: d.toUpperCase(), type: "Page", where: "Station", date: "—", run: () => go(p) }));
    return [...oeuvres, ...chaps, ...entries, ...pages].filter((r) => tab === "all" || r.cat === tab);
  }, [needle, creations, journal, cats, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setSel(0), [needle, tab]);
  useEffect(() => { list.current?.querySelector(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" }); }, [sel]);
  const onKey = (e) => {
    if (e.key === "Escape") close();
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); sfx?.("hover"); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); sfx?.("hover"); }
    if (e.key === "Tab") { e.preventDefault(); const i = TABS.findIndex(([k]) => k === tab); setTab(TABS[(i + (e.shiftKey ? TABS.length - 1 : 1)) % TABS.length][0]); sfx?.("nav"); }
    if (e.key === "Enter") results[sel]?.run();
  };

  return createPortal(
    <div className="ai-wrap sx-pal" onClick={close} data-testid="station-search">
      <div className="ai" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="sx-pal-t">
        <div className="ai-top"><span>STATION / INDEX</span><button onClick={close} aria-label="Fermer">FERMER <IoClose size={13} /></button></div>
        <h2 id="sx-pal-t" className="ai-title">RECHERCHE <small>検索</small></h2>
        <label className="ai-in">
          <IoSearch size={17} aria-hidden="true" />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Une œuvre, un chapitre, une entrée du journal, une page…" aria-label="Rechercher dans la station" data-testid="station-search-input" />
          <kbd>ÉCHAP</kbd>
        </label>
        <div className="ai-tabs" role="tablist" aria-label="Filtrer">
          {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); sfx?.("nav"); input.current?.focus(); }}>{l}</button>)}
        </div>
        <div className="ai-head" aria-hidden="true"><span>COTE</span><span>TITRE</span><span>TYPE</span><span>OÙ</span><span>DATE</span></div>
        <div className="ai-list" ref={list}>
          {results.length === 0 && <p className="ai-empty">Rien ne correspond{needle ? ` à « ${q.trim()} »` : ""}.</p>}
          {results.map((r, i) => (
            <button key={r.key} data-i={i} className={"ai-row" + (i === sel ? " on" : "")} style={{ animationDelay: `${Math.min(i, 12) * 22}ms` }} onMouseEnter={() => setSel(i)} onClick={r.run} data-testid={`station-search-result-${i}`}>
              <span className="code">{r.code}</span>
              <span className="tx"><b><i>{r.kj}</i>{r.title}</b>{r.sub && <small>{r.sub}</small>}</span>
              <span className="ty">{r.type}</span>
              <span className="wh">{r.where}</span>
              <span className="dt">{r.date}</span>
            </button>
          ))}
        </div>
        <div className="ai-foot"><span>{results.length} RÉSULTAT{results.length > 1 ? "S" : ""}</span><span className="keys">↑↓ NAVIGUER · TAB FILTRER · ENTRÉE OUVRIR</span><span className="db">STATION <i /> EN LIGNE</span></div>
      </div>
    </div>,
    document.body
  );
}
