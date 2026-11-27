import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoCheckmarkCircle, IoTrashOutline } from "react-icons/io5";
import { listCreations, listCategories, posterUrl } from "@/lib/api";
import { shelfState, unmarkDone, markDone } from "@/lib/shelf";
import { Face } from "@/components/atelier/AlexCore";
import { fmtOfCreation } from "@/components/nexus/NexusHome";
import { useApp } from "@/context/AppContext";
import "@/components/atelier/alexandrie.css";
import "@/pages/shelf.css";

/*
  Mon étagère : ce que le visiteur a terminé (livres, cassettes, vinyles rangés comme une collection), ce qu'il a commencé, les films lancés.
  Rien à remplir : la station range toute seule, au fil des lectures.
*/
const when = (t) => (t ? new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "");

export default function Shelf() {
  const nav = useNavigate(); const { sfx } = useApp() || {};
  const { data: all = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const [tick, setTick] = useState(0);
  const rows = useMemo(() => all.map((c) => ({ c, s: shelfState(c), cat: cats.find((k) => k.key === c.category) })).filter((x) => x.s), [all, cats, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const by = (st) => rows.filter((x) => x.s.st === st).sort((a, b) => b.s.at - a.s.at);
  const done = by("done"), reading = by("reading"), seen = by("seen");
  const book = (c, cat) => ({ id: c.id, title: c.title, sub: c.tagline || "", format: fmtOfCreation(c, cat?.label), emblem: c.kanji || cat?.kanji || "核", cote: "SN", roomLabel: cat?.label || "Station", house: "STATION NEXUS" });
  const open = (c) => { window.dispatchEvent(new CustomEvent("nx-start", { detail: { id: c.id } })); };
  const Obj = ({ x, children }) => (
    <div className="sh-obj">
      <button className="sh-face" onClick={() => open(x.c)} title={`Ouvrir ${x.c.title}`}><Face b={book(x.c, x.cat)} cover={x.c.has_poster ? posterUrl(x.c.id, x.c.updated_at, 480) : null} /></button>
      <b>{x.c.title}</b>{children}
    </div>
  );
  return (
    <main className="sh" data-testid="shelf-page">
      <header className="sh-h">
        <button className="sh-back" onClick={() => nav(-1)} aria-label="Retour"><IoArrowBack size={18} /></button>
        <div><p className="sh-k">TA COLLECTION</p><h1>Mon étagère</h1><p className="sh-sub">Ce que tu as terminé, ce que tu as commencé. La station range toute seule, au fil de tes lectures, dans ce navigateur.</p></div>
      </header>
      {rows.length === 0 && <p className="sh-empty">Ton étagère est vide pour l'instant. Ouvre une œuvre et lis-la : elle viendra se ranger ici.</p>}
      {reading.length > 0 && <section><h2>En cours <small>{reading.length}</small></h2><div className="sh-row">{reading.map((x) => (
        <Obj key={x.c.id} x={x}><small>{x.s.total ? `${x.s.unit} / ${x.s.total}` : "Commencé"}</small><span className="sh-bar"><i style={{ width: `${Math.round((x.s.ratio || 0) * 100)}%` }} /></span>
          <button className="sh-mini" onClick={() => { markDone(x.c.id); setTick((t) => t + 1); }}><IoCheckmarkCircle size={13} /> Je l'ai fini</button></Obj>))}</div><span className="sh-plank" /></section>}
      {done.length > 0 && <section><h2>Terminées <small>{done.length}</small></h2><div className="sh-row">{done.map((x) => (
        <Obj key={x.c.id} x={x}><small>Fini le {when(x.s.at)}</small><button className="sh-mini" onClick={() => { unmarkDone(x.c.id); setTick((t) => t + 1); }}><IoTrashOutline size={12} /> Retirer</button></Obj>))}</div><span className="sh-plank" /></section>}
      {seen.length > 0 && <section><h2>Vus <small>{seen.length}</small></h2><div className="sh-row">{seen.map((x) => <Obj key={x.c.id} x={x}><small>Lancé le {when(x.s.at)}</small></Obj>)}</div><span className="sh-plank" /></section>}
    </main>
  );
}
