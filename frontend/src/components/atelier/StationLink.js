import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IoAdd, IoCreateOutline, IoEyeOutline, IoTrashOutline, IoLinkOutline, IoCloudUploadOutline, IoClose, IoSwapHorizontal } from "react-icons/io5";
import { listCreations, getCreation, getCreationFull, updateCreation, listJournalCategories, posterUrl } from "@/lib/api";
import { isOeuvre, isFolder, stripHtml } from "@/lib/atelier";
import { pressMenu, showMenu } from "@/components/atelier/ContextMenu";
import { labConfirm, labPrompt } from "@/components/atelier/LabDialog";
import ChapterQuickEdit, { deleteUnit } from "@/components/nexus/ChapterQuickEdit";
import { publishChapter, publishJournal, publishedOf, publishedLabel, stationUrl, fetchRemote, syncState, pullRemote, SYNC_LABEL } from "@/lib/publish";
import "@/components/atelier/station.css";

/*
  Le lien entre l'atelier et la station.
  - Une œuvre de l'atelier est reliée à une création publique (fields.creation_id) : une seule, dans les deux sens.
  - Les chapitres en ligne ne sont pas copiés : l'atelier les lit sur la station et les modifie directement.
  - Un document de l'atelier peut partir sur la station (chapitre ou journal) ; ce qu'il est devenu reste noté dessus.
*/
const words = (html) => stripHtml(html || "").split(/\s+/).filter(Boolean).length;
export const oeuvreOfCreation = (at, cid) => at.items.find((i) => isOeuvre(i) && i.fields?.creation_id === cid);
export const creationOfItem = (at, it) => {
  if (!it) return "";
  if (isOeuvre(it)) return it.fields?.creation_id || "";
  const o = at.items.find((x) => x.id === it.fields?.oeuvre_id);
  return o?.fields?.creation_id || "";
};

// Créer l'œuvre de l'atelier à partir d'une création déjà en ligne (titre, affiche, pitch repris, déjà reliée)
export async function oeuvreFromCreation(at, c, universe_id) {
  const doc = await at.createItem({
    kind: "document", title: c.title, universe_id: universe_id || null, image: posterUrl(c.id, c.updated_at),
    fields: { oeuvre: true, format: c.launch_type === "episodes" || c.launch_type === "film" ? "serie" : "livre", status: "en cours", color: c.accent || "#ffb340", kanji: c.kanji || "", desc: c.tagline || stripHtml(c.synopsis || "").slice(0, 400), playlist: "", creation_id: c.id },
  });
  toast.success(`Œuvre « ${c.title} » créée et reliée`);
  return doc;
}

// ---------------------------------------------------------------- Sur la station (fiche d'une œuvre)
export function OeuvreStation({ at, o }) {
  const nav = useNavigate(); const qc = useQueryClient();
  const cid = o.fields?.creation_id || "";
  const { data: creations = [] } = useQuery({ queryKey: ["creations", "all"], queryFn: () => listCreations() });
  const { data: c, isLoading, refetch } = useQuery({ queryKey: ["creation-atelier", cid], queryFn: () => getCreation(cid), enabled: !!cid });
  const [pick, setPick] = useState("");
  const [edit, setEdit] = useState(null); // { index } ; index null = nouveau chapitre
  const taken = (id) => at.items.some((i) => isOeuvre(i) && i.id !== o.id && i.fields?.creation_id === id);
  const link = async (id) => { await at.saveItem({ ...o, fields: { ...o.fields, creation_id: id || "" } }); toast.success(id ? "Œuvre reliée à sa page publique" : "Lien retiré (rien n'a changé sur la station)"); };
  const chapters = c?.chapters || [];
  const reload = () => { refetch(); qc.invalidateQueries({ queryKey: ["creations"] }); };

  const chMenu = (ch, i) => ({
    title: ch.title || `Chapitre ${i + 1}`,
    entries: [
      { id: "edit", label: "Modifier le chapitre", icon: <IoCreateOutline size={14} />, onClick: () => setEdit({ index: i }) },
      { id: "rename", label: "Renommer", icon: <IoCreateOutline size={14} />, onClick: async () => {
        const t = await labPrompt("Titre du chapitre", ch.title || ""); if (t === null || !t.trim()) return;
        try { const full = await getCreationFull(cid); const units = [...(full.chapters || [])]; units[i] = { ...units[i], title: t.trim() }; await updateCreation(cid, { ...full, chapters: units }, true); reload(); toast.success("Chapitre renommé"); } catch { toast.error("Renommage impossible"); }
      } },
      { id: "see", label: "Voir sur la station", icon: <IoEyeOutline size={14} />, onClick: () => nav(`/oeuvre/${cid}`) },
      "-",
      { id: "del", label: "Supprimer le chapitre", danger: true, icon: <IoTrashOutline size={14} />, onClick: async () => {
        if (!(await labConfirm(`Supprimer « ${ch.title || `Chapitre ${i + 1}`} » de la station ? Les lecteurs ne le verront plus.`))) return;
        try { await deleteUnit(cid, "chapters", i); reload(); toast.success("Chapitre supprimé"); } catch { toast.error("Suppression impossible"); }
      } },
    ],
  });

  if (!cid) return (
    <section className="st-link" data-testid="oeuvre-station">
      <p className="ar-sec mono"><b>02</b> SUR LA STATION <i>· pas encore reliée</i></p>
      <div className="st-unlinked">
        <p>Relie cette œuvre à sa page publique : ses chapitres en ligne apparaîtront ici et tu pourras les modifier sans quitter l'atelier. Rien n'est copié, rien ne change sur la station.</p>
        <div className="st-pick">
          <select value={pick} onChange={(e) => setPick(e.target.value)} data-testid="oeuvre-station-pick">
            <option value="">Choisir une création…</option>
            {creations.map((x) => <option key={x.id} value={x.id} disabled={taken(x.id)}>{x.title}{taken(x.id) ? " (déjà reliée)" : ""}</option>)}
          </select>
          <button className="at-btn" disabled={!pick} onClick={() => link(pick)} data-testid="oeuvre-station-link"><IoLinkOutline size={15} /> Relier</button>
        </div>
      </div>
    </section>
  );

  return (
    <section className="st-link" data-testid="oeuvre-station">
      <p className="ar-sec mono"><b>02</b> SUR LA STATION <i>· {chapters.length} chapitre{chapters.length > 1 ? "s" : ""} en ligne</i></p>
      <div className="st-head">
        <img src={posterUrl(cid, c?.updated_at, 200)} alt="" />
        <div className="st-head-b">
          <p className="mono st-k">CRÉATION PUBLIQUE</p>
          <h3>{c?.title || (isLoading ? "Chargement…" : "Création introuvable")}</h3>
          {c?.tagline && <p className="st-tag">{c.tagline}</p>}
          <div className="st-acts">
            <button className="at-btn" onClick={() => setEdit({ index: null })} disabled={!c} data-testid="oeuvre-station-new"><IoAdd size={15} /> Nouveau chapitre</button>
            <button className="at-btn ghost" onClick={() => nav(`/oeuvre/${cid}`)} data-testid="oeuvre-station-see"><IoEyeOutline size={15} /> Voir sur la station</button>
            <button className="at-btn ghost" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); showMenu(r.left, r.bottom + 4, [
              ...creations.filter((x) => x.id !== cid && !taken(x.id)).map((x) => ({ id: `c-${x.id}`, label: x.title, onClick: () => link(x.id) })),
              "-", { id: "unlink", label: "Retirer le lien", danger: true, onClick: () => link("") },
            ], "Relier à une autre création"); }} data-testid="oeuvre-station-change"><IoSwapHorizontal size={15} /> Changer</button>
          </div>
        </div>
      </div>
      {c && (c.launch_type === "episodes" || c.launch_type === "film") && <p className="st-note">Cette création est en épisodes ou en film : les vidéos se gèrent sur la station. Les chapitres ci-dessous restent modifiables ici.</p>}
      {chapters.length > 0 ? (
        <ol className="st-chs" data-testid="oeuvre-station-chapters">
          {chapters.map((ch, i) => (
            <li key={ch.id || i}>
              <button onClick={() => setEdit({ index: i })} {...pressMenu(() => chMenu(ch, i))} data-testid={`oeuvre-station-ch-${i}`}>
                <span className="mono n">{String(i + 1).padStart(2, "0")}</span>
                <b>{ch.title || `Chapitre ${i + 1}`}</b>
                <small className="mono">{ch.rich ? words(ch.content).toLocaleString("fr-FR") : String(ch.content || "").split(/\s+/).filter(Boolean).length.toLocaleString("fr-FR")} mots</small>
                <span className="st-ed" aria-hidden="true"><IoCreateOutline size={14} /></span>
              </button>
              <button className="st-more" aria-label="Plus d'actions" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); const m = chMenu(ch, i); showMenu(r.left, r.bottom + 4, m.entries, m.title); }}>⋯</button>
            </li>
          ))}
        </ol>
      ) : c && <p className="st-note">Aucun chapitre en ligne pour l'instant. « Nouveau chapitre », ou publie un document de cette œuvre (clic droit → Publier sur la station).</p>}
      {edit && <ChapterQuickEdit creationId={cid} unitKey="chapters" index={edit.index} onClose={() => setEdit(null)} onSaved={reload} />}
    </section>
  );
}

// ---------------------------------------------------------------- Publier un élément (fenêtre)
export const askPublish = (id, dest) => window.dispatchEvent(new CustomEvent("at-publish", { detail: { id, dest } }));
export const goStation = (url) => window.dispatchEvent(new CustomEvent("at-station-go", { detail: { url } }));
export function PublishHost({ at }) {
  const [req, setReq] = useState(null); const nav = useNavigate();
  useEffect(() => {
    const on = (e) => setReq(e.detail?.id ? e.detail : null); const go = (e) => e.detail?.url && nav(e.detail.url);
    window.addEventListener("at-publish", on); window.addEventListener("at-station-go", go);
    return () => { window.removeEventListener("at-publish", on); window.removeEventListener("at-station-go", go); };
  }, [nav]);
  const it = req && at.items.find((x) => x.id === req.id);
  if (!it) return null;
  return <PublishDialog key={req.id + (req.dest || "")} at={at} it={it} initialDest={req.dest} onClose={() => setReq(null)} />;
}

function PublishDialog({ at, it, onClose, initialDest }) {
  const nav = useNavigate(); const qc = useQueryClient();
  const prevC = publishedOf(it, "chapter"); const prevJ = publishedOf(it, "journal");
  const linkedCid = creationOfItem(at, it);
  const { data: creations = [] } = useQuery({ queryKey: ["creations", "all"], queryFn: () => listCreations() });
  const { data: cats = [] } = useQuery({ queryKey: ["journal-cats"], queryFn: listJournalCategories });
  const [dest, setDest] = useState(initialDest || (prevC || linkedCid ? "chapter" : "journal"));
  const prev = dest === "chapter" ? prevC : prevJ;
  // ce qui a bougé depuis la dernière publication (dans l'atelier, en ligne, ou les deux)
  const { data: remote, isFetching: rLoading } = useQuery({ queryKey: ["pub-remote", prev?.target, prev?.chapter_id || prev?.entry_id], queryFn: () => fetchRemote(prev), enabled: !!prev, staleTime: 0 });
  const st = prev ? (rLoading ? "?" : syncState(it, prev, remote)) : "none";
  useEffect(() => { if (st === "gone" && dest === "chapter") setMode("new"); }, [st, dest]);
  const pull = async () => { setBusy(true); try { await pullRemote(at, it, prev); toast.success("Version en ligne récupérée dans le brouillon"); onClose(); } catch { toast.error("Récupération impossible"); setBusy(false); } };
  const [cid, setCid] = useState(prevC?.creation_id || linkedCid || "");
  const [mode, setMode] = useState(prevC?.chapter_id ? "replace" : "new");
  const [chId, setChId] = useState(prevC?.chapter_id || "");
  const [title, setTitle] = useState(it.title || "");
  const [jc, setJc] = useState(linkedCid || "");
  const [cat, setCat] = useState("");
  const [fmt, setFmt] = useState("livre");
  const [pub, setPub] = useState(prevJ ? prevJ.published !== false : true);
  const [home, setHome] = useState(false);
  const [after, setAfter] = useState("keep");
  const [busy, setBusy] = useState(false);
  const { data: c } = useQuery({ queryKey: ["creation-atelier", cid], queryFn: () => getCreation(cid), enabled: dest === "chapter" && !!cid });
  const chapters = c?.chapters || [];
  const repl = chapters.find((x) => x.id === chId);
  const empty = !stripHtml(it.content || "").trim();
  useEffect(() => { const k = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);

  const go = async () => {
    if (dest === "chapter" && !cid) return toast.error("Choisis la création");
    if (dest === "chapter" && mode === "replace" && !repl) return toast.error("Choisis le chapitre à remplacer");
    setBusy(true);
    try {
      const p = dest === "chapter"
        ? await publishChapter(it, { creation_id: cid, mode, chapter_id: chId, title: title.trim() })
        : await publishJournal(it, { entry_id: prevJ?.entry_id || "", title: title.trim(), creation_id: jc, category_id: cat, format: fmt, published: pub, show_home: home });
      let fields = { ...(it.fields || {}), [dest === "chapter" ? "published" : "published_j"]: p };
      if (after === "folder") fields = { ...fields, folder_id: (await publishedFolder(at, it)).id };
      await at.saveItem({ ...it, fields });
      qc.invalidateQueries({ queryKey: ["creation-atelier"] }); qc.invalidateQueries({ queryKey: ["creations"] }); qc.invalidateQueries({ queryKey: ["journal"] });
      toast.success(dest === "chapter" ? `${mode === "replace" ? "Chapitre remplacé" : "Nouveau chapitre en ligne"} · chapitre ${p.index + 1}` : pub ? "Entrée du journal publiée" : "Brouillon du journal enregistré", { action: { label: "Voir", onClick: () => nav(stationUrl(p)) } });
      onClose();
    } catch (e) { toast.error(e?.response?.data?.detail || "Publication impossible"); setBusy(false); }
  };

  return createPortal(
    <div className="st-dlg-wrap" onClick={onClose} data-testid="publish-dialog">
      <div className="st-dlg" role="dialog" aria-label="Publier sur la station" onClick={(e) => e.stopPropagation()}>
        <header><p className="mono st-k">PUBLIER SUR LA STATION</p><h2>{it.title || "Sans titre"}</h2><button className="at-icon" onClick={onClose} aria-label="Fermer"><IoClose size={17} /></button></header>
        {prev && <p className={"st-prev mono s-" + st} data-testid="publish-state">{publishedLabel(prev, creations)} · le {new Date(prev.date).toLocaleDateString("fr-FR")}{st !== "?" && st !== "none" ? ` · ${SYNC_LABEL[st].toUpperCase()}` : ""}</p>}
        {(st === "remote" || st === "both") && <div className="st-warn st-conflict" data-testid="publish-conflict">
          <p>{prev.target === "journal" ? "L'entrée du journal" : "Ce chapitre"} a été modifié{prev.target === "journal" ? "e" : ""} sur la station depuis ta dernière publication{st === "both" ? ", et le brouillon aussi" : ""}. Publier maintenant écraserait la version en ligne.</p>
          <div><button className="at-btn ghost" onClick={pull} disabled={busy} data-testid="publish-pull">Récupérer la version en ligne dans le brouillon</button></div>
        </div>}
        {st === "gone" && <p className="st-warn">{prev.target === "journal" ? "L'entrée du journal n'existe plus" : "Ce chapitre n'existe plus"} en ligne : publier en recrée {prev.target === "journal" ? "une" : "un"}.</p>}
        {st === "ok" && <p className="st-note">Rien n'a changé depuis la dernière publication.</p>}
        {empty && <p className="st-warn">Cet élément est vide : il n'y a rien à publier pour l'instant.</p>}
        <div className="st-seg" role="radiogroup">
          <button role="radio" aria-checked={dest === "chapter"} className={dest === "chapter" ? "on" : ""} onClick={() => setDest("chapter")} data-testid="publish-dest-chapter">Chapitre d'une création</button>
          <button role="radio" aria-checked={dest === "journal"} className={dest === "journal" ? "on" : ""} onClick={() => setDest("journal")} data-testid="publish-dest-journal">Journal de bord</button>
        </div>
        <label>Titre<input value={title} onChange={(e) => setTitle(e.target.value)} data-testid="publish-title" /></label>
        {dest === "chapter" ? <>
          <label>Création<select value={cid} onChange={(e) => { setCid(e.target.value); setChId(""); }} data-testid="publish-creation">
            <option value="">Choisir…</option>
            {creations.map((x) => <option key={x.id} value={x.id}>{x.title}{x.id === linkedCid ? " (reliée à l'œuvre)" : ""}</option>)}
          </select></label>
          <div className="st-seg sm">
            <button className={mode === "new" ? "on" : ""} onClick={() => setMode("new")} data-testid="publish-mode-new">Nouveau chapitre{cid ? ` (n° ${chapters.length + 1})` : ""}</button>
            <button className={mode === "replace" ? "on" : ""} onClick={() => setMode("replace")} disabled={!chapters.length} data-testid="publish-mode-replace">Remplacer un chapitre</button>
          </div>
          {mode === "replace" && <label>Chapitre remplacé<select value={chId} onChange={(e) => setChId(e.target.value)} data-testid="publish-chapter">
            <option value="">Choisir…</option>
            {chapters.map((x, i) => <option key={x.id} value={x.id}>{i + 1}. {x.title || "Sans titre"}</option>)}
          </select></label>}
          {mode === "replace" && repl && <p className="st-warn">Le texte en ligne de « {repl.title} » sera remplacé par celui de ce document.</p>}
        </> : <>
          <div className="st-row">
            <label>Rattachée à<select value={jc} onChange={(e) => setJc(e.target.value)} data-testid="publish-j-creation"><option value="">Aucune (nouveauté)</option>{creations.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
            <label>Catégorie<select value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Sans catégorie</option>{cats.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
            <label>Format<select value={fmt} onChange={(e) => setFmt(e.target.value)}><option value="livre">Livre</option><option value="vhs">VHS</option><option value="vinyle">Vinyle</option></select></label>
          </div>
          <div className="st-checks">
            <label className="st-ck"><input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} data-testid="publish-j-published" /> Publiée (sinon brouillon)</label>
            <label className="st-ck"><input type="checkbox" checked={home} onChange={(e) => setHome(e.target.checked)} /> Afficher sur l'accueil</label>
          </div>
          <p className="st-note">Le texte est découpé en blocs du journal : titres, paragraphes, images, citations, vidéos YouTube et musiques.</p>
        </>}
        <div className="st-seg sm st-after">
          <span className="mono">ENSUITE, LE BROUILLON :</span>
          <button className={after === "keep" ? "on" : ""} onClick={() => setAfter("keep")}>Le garder ici</button>
          <button className={after === "folder" ? "on" : ""} onClick={() => setAfter("folder")} data-testid="publish-after-folder">Le ranger dans « Publiés »</button>
        </div>
        <footer>
          <button className="at-btn ghost" onClick={onClose}>Annuler</button>
          <button className="at-btn" onClick={go} disabled={busy || empty} data-testid="publish-go"><IoCloudUploadOutline size={15} /> {busy ? "Publication…" : st === "remote" || st === "both" ? "Écraser la version en ligne" : prev && st !== "gone" ? "Mettre à jour en ligne" : "Publier"}</button>
        </footer>
      </div>
    </div>,
    document.querySelector(".at-root") || document.body
  );
}

// le dossier « Publiés » du même endroit (œuvre ou univers), créé au besoin
async function publishedFolder(at, it) {
  const scope = (x) => (x.universe_id || null) === (it.universe_id || null) && (x.fields?.oeuvre_id || null) === (it.fields?.oeuvre_id || null);
  const f = at.items.find((x) => isFolder(x) && scope(x) && (x.title || "").toLowerCase() === "publiés");
  if (f) return f;
  return at.createItem({ kind: "note", title: "Publiés", universe_id: it.universe_id || null, fields: { ...(it.fields?.oeuvre_id ? { oeuvre_id: it.fields.oeuvre_id } : {}), folder: true, parent: null } });
}

// ---------------------------------------------------------------- Univers : créer une œuvre depuis la station
export function useCreationsWithoutOeuvre(at) {
  const { data: creations = [] } = useQuery({ queryKey: ["creations", "all"], queryFn: () => listCreations() });
  return useMemo(() => creations.filter((c) => !oeuvreOfCreation(at, c.id)), [creations, at.items]); // eslint-disable-line react-hooks/exhaustive-deps
}
