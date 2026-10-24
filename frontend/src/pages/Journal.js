import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack, IoAdd } from "react-icons/io5";
import { listJournal, listJournalCategories, listCreations } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import MobileMenu from "@/components/MobileMenu";
import { JournalCard, monthLabel } from "@/components/journal/JournalParts";

export default function Journal() {
  const nav = useNavigate();
  const { sfx, isAdmin, markAnnouncementsSeen } = useApp();
  const [sp, setSp] = useSearchParams();
  const cat = sp.get("categorie") || "", crea = sp.get("creation") || "", month = sp.get("mois") || "";
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n, { replace: true }); sfx("nav"); };

  const { data: all = [], isLoading } = useQuery({ queryKey: ["journal", isAdmin], queryFn: () => listJournal() });
  const { data: cats = [] } = useQuery({ queryKey: ["journal-cats"], queryFn: listJournalCategories });
  const { data: creations = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const catById = useMemo(() => Object.fromEntries(cats.map((c) => [c.id, c])), [cats]);
  const creaById = useMemo(() => Object.fromEntries(creations.map((c) => [c.id, c])), [creations]);
  useEffect(() => { if (all.length) markAnnouncementsSeen(all.map((e) => e.id)); }, [all, markAnnouncementsSeen]);

  const months = useMemo(() => [...new Set(all.map((e) => (e.date || "").slice(0, 7)).filter(Boolean))].sort().reverse(), [all]);
  const linkedCreas = useMemo(() => [...new Set(all.map((e) => e.creation_id).filter(Boolean))].map((id) => creaById[id]).filter(Boolean), [all, creaById]);
  const list = all.filter((e) => (!cat || e.category_id === cat) && (!crea || e.creation_id === crea) && (!month || (e.date || "").startsWith(month)));
  const [lead, ...rest] = list;

  return (
    <div className="relative min-h-screen w-full jr-page" data-testid="journal-page">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8">
        <div className="flex items-center justify-between gap-2 mb-10">
          <button data-testid="journal-back" onClick={() => { sfx("back"); nav("/"); }} className="jr-btn" aria-label="Retour"><IoArrowBack /></button>
          <div className="flex items-center gap-2">
            {isAdmin && <button data-testid="journal-new" onClick={() => { sfx("select"); nav("/journal/nouveau"); }} className="jr-btn jr-btn-brand"><IoAdd /> Nouvelle entrée</button>}
            <MobileMenu />
          </div>
        </div>

        <header className="jr-head">
          <span className="mono jr-k">STATION NEXUS · CARNET DE BORD</span>
          <h1 className="font-display">Journal de bord <span className="kj">録</span></h1>
          <p>Nouveautés, coulisses, making-of et croquis — tout ce qui se passe à bord.</p>
        </header>

        <div className="jr-filters" data-testid="journal-filters">
          <div className="jr-chips">
            <button className={!cat ? "on" : ""} onClick={() => set("categorie", "")} data-testid="journal-cat-all">Tout</button>
            {cats.map((c) => <button key={c.id} className={cat === c.id ? "on" : ""} style={{ "--jc": c.color }} onClick={() => set("categorie", c.id)} data-testid={`journal-cat-${c.id}`}>{c.name}</button>)}
          </div>
          <div className="jr-selects">
            <select value={month} onChange={(e) => set("mois", e.target.value)} data-testid="journal-filter-month">
              <option value="">Toutes les dates</option>
              {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
            <select value={crea} onChange={(e) => set("creation", e.target.value)} data-testid="journal-filter-creation">
              <option value="">Toutes les créations</option>
              {linkedCreas.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
        </div>

        {!isLoading && !list.length && <p className="jr-empty" data-testid="journal-empty">Aucune entrée pour ces filtres… le carnet attend sa prochaine page.</p>}
        {lead && (
          <div className="jr-lead">
            <JournalCard e={lead} cat={catById[lead.category_id]} creation={creaById[lead.creation_id]} onOpen={() => { sfx("select"); nav(`/journal/${lead.id}`); }} />
          </div>
        )}
        <div className="jr-grid" data-testid="journal-list">
          {rest.map((e, i) => <JournalCard key={e.id} idx={i} e={e} cat={catById[e.category_id]} creation={creaById[e.creation_id]} onOpen={() => { sfx("select"); nav(`/journal/${e.id}`); }} />)}
        </div>
      </div>
    </div>
  );
}
