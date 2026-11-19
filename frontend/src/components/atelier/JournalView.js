import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IoAdd, IoCreateOutline, IoEyeOutline, IoTrashOutline, IoPlay, IoHomeOutline, IoCloudUploadOutline, IoCloudOfflineOutline } from "react-icons/io5";
import { listJournal, getJournalEntry, updateJournalEntry, deleteJournalEntry, listJournalCategories, mediaUrl } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { pressMenu, showMenu } from "@/components/atelier/ContextMenu";
import { Face } from "@/components/atelier/AlexCore";
import { Cassette } from "@/components/journal/TapeObject";
import JournalEditor from "@/pages/JournalEditor";
import JournalOverlay from "@/components/journal/JournalOverlay";
import "@/components/atelier/journal.css";

/*
  Le journal de bord, depuis l'atelier : toutes les entrées (brouillons compris) rangées comme leurs objets,
  on écrit et on modifie sans quitter l'atelier, et un clic droit donne tout le reste (publier, accueil, voir sur la station…).
*/
const FMT = { livre: "LIVRE", vhs: "VHS", vinyle: "VINYLE", cassette: "CASSETTE" };
const dateFr = (d) => { try { return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }); } catch { return d; } };

export default function JournalView({ initialEdit = null }) {
  const { sfx } = useApp();
  const nav = useNavigate(); const qc = useQueryClient();
  const [edit, setEdit] = useState(initialEdit); // null = liste ; "" = nouvelle entrée ; id = modification
  const [filter, setFilter] = useState("all");
  const [reading, setReading] = useState("");
  const [confirmDel, setConfirmDel] = useState("");
  const { data: list = [], isLoading } = useQuery({ queryKey: ["journal", "atelier"], queryFn: () => listJournal({ limit: 500 }) });
  const { data: cats = [] } = useQuery({ queryKey: ["journal-cats"], queryFn: listJournalCategories });
  const catOf = (id) => cats.find((c) => c.id === id);
  const shown = useMemo(() => list.filter((e) => filter === "all" || (filter === "pub" ? e.published : !e.published)), [list, filter]);
  const counts = { all: list.length, pub: list.filter((e) => e.published).length, draft: list.filter((e) => !e.published).length };

  const patch = async (e, p, msg) => {
    try {
      const full = await getJournalEntry(e.id); const payload = { ...full, ...p }; ["id", "created_at", "updated_at"].forEach((k) => delete payload[k]);
      await updateJournalEntry(e.id, payload); qc.invalidateQueries({ queryKey: ["journal"] }); qc.invalidateQueries({ queryKey: ["journal-entry", e.id] });
      sfx("select"); toast.success(msg);
    } catch (err) { toast.error(err?.response?.data?.detail || "Modification impossible"); }
  };
  const remove = async (e) => {
    if (confirmDel !== e.id) { setConfirmDel(e.id); toast("Clique encore sur « Supprimer » pour confirmer", { duration: 2500 }); setTimeout(() => setConfirmDel((c) => (c === e.id ? "" : c)), 3000); return; }
    try { await deleteJournalEntry(e.id); qc.invalidateQueries({ queryKey: ["journal"] }); toast.success("Entrée supprimée"); } catch { toast.error("Suppression impossible"); }
    setConfirmDel("");
  };
  const menu = (e) => ({
    title: e.title,
    entries: [
      { label: "Modifier", icon: <IoCreateOutline />, onClick: () => { sfx("select"); setEdit(e.id); } },
      { label: e.format === "cassette" ? "Écouter" : "Lire", icon: <IoPlay />, onClick: () => { sfx("select"); setReading(e.id); } },
      { label: "Voir sur la station", icon: <IoEyeOutline />, onClick: () => nav(`/journal/${e.id}`) },
      e.published ? { label: "Repasser en brouillon", icon: <IoCloudOfflineOutline />, onClick: () => patch(e, { published: false }, "Entrée repassée en brouillon") }
        : { label: "Publier", icon: <IoCloudUploadOutline />, onClick: () => patch(e, { published: true }, "Entrée publiée") },
      { label: e.show_home ? "Retirer de l'accueil" : "Afficher sur l'accueil", icon: <IoHomeOutline />, onClick: () => patch(e, { show_home: !e.show_home }, e.show_home ? "Retirée de l'accueil" : "Affichée sur l'accueil") },
      { label: confirmDel === e.id ? "Confirmer la suppression" : "Supprimer", icon: <IoTrashOutline />, danger: true, onClick: () => remove(e) },
    ],
  });

  if (edit !== null) return (
    <section className="at-view at-jr-ed" data-testid="atelier-journal-editor">
      <JournalEditor id={edit} onDone={() => { setEdit(null); qc.invalidateQueries({ queryKey: ["journal"] }); }} />
    </section>
  );

  return (
    <section className="at-view at-jr" data-testid="atelier-journal">
      <header className="at-head">
        <p className="at-eyebrow mono">// MES COULISSES PUBLIQUES</p>
        <h1>Journal de bord</h1>
        <p className="at-sub">Ce que tu racontes aux visiteurs de ta station : avancées, making-of, enregistrements. Une entrée s'ouvre comme le public la voit, avec « Modifier » pour l'éditer. Clic droit (appui long sur téléphone) pour la publier, la mettre à l'accueil ou la voir sur la station.</p>
      </header>
      <div className="at-jr-bar">
        <div className="at-jr-tabs" role="tablist">
          {[["all", "Tout"], ["pub", "Publiées"], ["draft", "Brouillons"]].map(([k, t]) => (
            <button key={k} role="tab" aria-selected={filter === k} className={filter === k ? "on" : ""} onClick={() => { sfx("nav"); setFilter(k); }} data-testid={`atelier-journal-filter-${k}`}>{t} <small className="mono">{counts[k]}</small></button>
          ))}
        </div>
        <button className="at-btn" onClick={() => { sfx("select"); setEdit(""); }} data-testid="atelier-journal-new"><IoAdd /> Nouvelle entrée</button>
      </div>
      {isLoading ? <p className="at-jr-empty mono">CHARGEMENT…</p> : shown.length === 0 ? (
        <div className="at-jr-empty"><p>{filter === "draft" ? "Aucun brouillon." : "Ton journal est encore vide."}</p><button className="at-btn" onClick={() => setEdit("")}><IoAdd /> Écrire la première entrée</button></div>
      ) : (
        <div className="at-jr-grid">
          {shown.map((e) => {
            const fmt = e.format || "livre"; const cat = catOf(e.category_id);
            return (
              <article key={e.id} className={"at-jr-card" + (e.published ? "" : " draft")} role="button" tabIndex={0} onClick={() => { sfx("select"); setReading(e.id); }} onKeyDown={(ev) => ev.key === "Enter" && setReading(e.id)} data-testid={`atelier-journal-${e.id}`} {...pressMenu(() => menu(e))}>
                <span className="at-jr-obj">{fmt === "cassette" ? <Cassette title={e.tape_label || e.title} small img={e.cover} wear={e.tape_wear} /> : <Face b={{ id: e.id, title: e.title, format: fmt, room: "lore" }} cover={e.cover ? mediaUrl(e.cover) : ""} />}</span>
                <span className="at-jr-meta mono"><b>{FMT[fmt]}</b>{cat && <i>{cat.name}</i>}<span>{dateFr(e.date)}</span></span>
                <h3>{e.title}</h3>
                {e.subtitle && <p className="at-jr-sub">{e.subtitle}</p>}
                <span className="at-jr-state mono">
                  <em className={e.published ? "pub" : "draft"}>{e.published ? "PUBLIÉE" : "BROUILLON"}</em>
                  {e.show_home && <em className="home">ACCUEIL</em>}
                </span>
                <button className="at-jr-more" aria-label="Plus d'actions" onClick={(ev) => { ev.stopPropagation(); const r = ev.currentTarget.getBoundingClientRect(); const m = menu(e); showMenu(r.left, r.bottom + 4, m.entries, m.title); }} data-testid={`atelier-journal-more-${e.id}`}>⋯</button>
              </article>
            );
          })}
        </div>
      )}
      {reading && <JournalOverlay id={reading} onClose={() => setReading("")} onEdit={() => { const id = reading; setReading(""); setEdit(id); }} />}
    </section>
  );
}
