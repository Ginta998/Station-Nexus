import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IoArrowBack, IoCreateOutline, IoTrashOutline, IoClose } from "react-icons/io5";
import { toast } from "sonner";
import { getJournalEntry, listJournal, listJournalCategories, listCreations, deleteJournalEntry, mediaUrl, posterUrl } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import MobileMenu from "@/components/MobileMenu";
import { JournalBlocks, CategoryTag, fmtDate } from "@/components/journal/JournalParts";

export default function JournalEntry() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { sfx, isAdmin } = useApp();
  const [lightbox, setLightbox] = useState("");
  const { data: e, isError } = useQuery({ queryKey: ["journal-entry", id], queryFn: () => getJournalEntry(id) });
  const { data: all = [] } = useQuery({ queryKey: ["journal", isAdmin], queryFn: () => listJournal() });
  const { data: cats = [] } = useQuery({ queryKey: ["journal-cats"], queryFn: listJournalCategories });
  const { data: creations = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const cat = cats.find((c) => c.id === e?.category_id);
  const crea = creations.find((c) => c.id === e?.creation_id);
  const { prev, next } = useMemo(() => { const i = all.findIndex((x) => x.id === id); return { prev: all[i + 1], next: i > 0 ? all[i - 1] : null }; }, [all, id]);

  const del = async () => {
    if (!window.confirm("Supprimer cette entrée du journal ?")) return;
    await deleteJournalEntry(id); qc.invalidateQueries({ queryKey: ["journal"] }); toast.success("Entrée supprimée"); nav("/journal");
  };

  if (isError) return <div className="min-h-screen grid place-items-center jr-page"><p className="jr-empty">Cette page du journal est introuvable.</p></div>;
  if (!e) return <div className="min-h-screen jr-page" />;

  return (
    <div className="relative min-h-screen w-full jr-page" data-testid="journal-entry-page">
      <div className={"jr-hero" + (e.cover ? "" : " nocover")} style={e.cover ? { backgroundImage: `url(${mediaUrl(e.cover)})` } : { "--jc": cat?.color || "var(--brand)" }}>
        <div className="jr-hero-top max-w-6xl mx-auto px-5 md:px-10">
          <button data-testid="journal-entry-back" onClick={() => { sfx("back"); nav("/journal"); }} className="jr-btn" aria-label="Retour au journal"><IoArrowBack /></button>
          <div className="flex items-center gap-2">
            {isAdmin && <button data-testid="journal-entry-edit" onClick={() => nav(`/journal/${id}/modifier`)} className="jr-btn"><IoCreateOutline /> Modifier</button>}
            {isAdmin && <button data-testid="journal-entry-delete" onClick={del} className="jr-btn" aria-label="Supprimer"><IoTrashOutline /></button>}
            <MobileMenu />
          </div>
        </div>
      </div>

      <article className="jr-article">
        <div className="jr-meta"><CategoryTag cat={cat} /><span className="mono" data-testid="journal-entry-date">{fmtDate(e.date)}</span>{!e.published && <span className="jr-draft static">Brouillon</span>}</div>
        <h1 className="jr-title font-display" data-testid="journal-entry-title">{e.title}</h1>
        {e.subtitle && <p className="jr-sub">{e.subtitle}</p>}
        {crea && (
          <button className="jr-crea" onClick={() => { sfx("select"); nav(`/oeuvre/${crea.id}`); }} data-testid="journal-entry-creation">
            {crea.has_poster && <img src={posterUrl(crea.id, crea.updated_at, 160)} alt="" />}
            <span><small className="mono">CRÉATION LIÉE</small>{crea.title}</span>
          </button>
        )}
        <div className="jr-rule" />
        <div className="jr-body"><JournalBlocks blocks={e.blocks} onImage={setLightbox} /></div>

        <nav className="jr-pn">
          {prev ? <button onClick={() => nav(`/journal/${prev.id}`)} data-testid="journal-prev"><small className="mono">← ENTRÉE PRÉCÉDENTE</small>{prev.title}</button> : <span />}
          {next ? <button className="r" onClick={() => nav(`/journal/${next.id}`)} data-testid="journal-next"><small className="mono">ENTRÉE SUIVANTE →</small>{next.title}</button> : <span />}
        </nav>
      </article>

      {lightbox && (
        <div className="jr-lightbox" onClick={() => setLightbox("")} data-testid="journal-lightbox">
          <button aria-label="Fermer"><IoClose size={22} /></button>
          <img src={lightbox} alt="" />
        </div>
      )}
    </div>
  );
}
