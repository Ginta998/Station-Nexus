import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoCreateOutline } from "react-icons/io5";
import { KINDS, imgSrc } from "@/lib/atelier";
import { listCreations, posterUrl } from "@/lib/api";
import ItemsGrid from "@/components/atelier/ItemsGrid";
import ItemCard from "@/components/atelier/ItemCard";

const TABS = [["all", "Tout"], ["character", "Personnages"], ["place", "Lieux"], ["scene", "Scènes"], ["note", "Notes"], ["lore", "Lore"], ["document", "Documents"], ["inspiration", "Inspirations"], ["file", "Fichiers"], ["timeline", "Chronologie"]];

function Timeline({ items, at, open }) {
  const dated = items.filter((i) => i.date).sort((a, b) => a.date.localeCompare(b.date, "fr", { numeric: true }));
  if (!dated.length) return <p className="at-empty big">Donne une date (même « An 312 » ou « Chapitre 4 ») à tes événements, scènes ou lore pour construire la chronologie.</p>;
  return (
    <ol className="at-timeline" data-testid="atelier-timeline">
      {dated.map((i) => <li key={i.id}><span className="d mono">{i.date}</span><ItemCard it={i} at={at} open={open} /></li>)}
    </ol>
  );
}

export default function UniverseView({ at, open, universe: u, editUniverse, importDocs }) {
  const nav = useNavigate();
  const [tab, setTab] = useState("all");
  const { data: creations = [] } = useQuery({ queryKey: ["creations", "all"], queryFn: () => listCreations() });
  if (!u) return null;
  const items = at.items.filter((i) => i.universe_id === u.id);
  const linked = creations.filter((c) => (u.creation_ids || []).includes(c.id));
  const shown = tab === "all" ? items : items.filter((i) => i.kind === tab);
  const count = (k) => (k === "all" ? items.length : k === "timeline" ? items.filter((i) => i.date).length : items.filter((i) => i.kind === k).length);

  return (
    <section className="at-view" data-testid="atelier-universe" style={{ "--u": u.color || "var(--brand)" }}>
      <header className={"at-uhero" + (u.cover ? " has" : "")}>
        {u.cover && <img src={imgSrc(u.cover)} alt="" className="bg" />}
        <div className="in">
          <span className="k">{u.kanji || u.name[0]}</span>
          <div>
            <p className="at-eyebrow mono">// UNIVERS</p>
            <h1 data-testid="atelier-universe-name">{u.name}</h1>
            {u.description && <p className="at-sub">{u.description}</p>}
          </div>
          <button className="at-btn ghost" onClick={() => editUniverse(u)} data-testid="atelier-universe-edit"><IoCreateOutline size={15} /> Modifier</button>
        </div>
        {linked.length > 0 && (
          <div className="at-works">
            {linked.map((c) => <button key={c.id} onClick={() => nav(`/oeuvre/${c.id}`)} title={c.title}><img src={posterUrl(c.id, c.updated_at, 200)} alt={c.title} /></button>)}
          </div>
        )}
      </header>
      <nav className="at-tabs" data-testid="atelier-universe-tabs">
        {TABS.map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)} data-testid={`atelier-tab-${k}`}>{l}<small>{count(k)}</small></button>)}
      </nav>
      {tab === "timeline" ? <Timeline items={items} at={at} open={open} /> : (
        <ItemsGrid at={at} open={open} importDocs={importDocs} items={shown} newDefaults={{ universe_id: u.id }} kinds={tab === "all" ? Object.keys(KINDS) : [tab]}
          empty={tab === "all" ? "Cet univers attend sa première trace. Une fiche, une scène, une note…" : `Aucun élément « ${KINDS[tab]?.plural || ""} » pour l'instant.`} />
      )}
    </section>
  );
}
