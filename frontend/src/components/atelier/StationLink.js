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
import { publishBatch, publishChapter, publishJournal, publishedOf, publishedLabel, stationUrl, fetchRemote, syncState, pullRemote, SYNC_LABEL, videoOf, nextSunday, localToIso, relLabel, isScheduled } from "@/lib/publish";
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
  // une création en épisodes montre ses épisodes, sinon ses chapitres
  const uk = c && (c.launch_type === "episodes" || (!(c.chapters || []).length && (c.episodes || []).length)) ? "episodes" : "chapters";
  const uw = uk === "episodes" ? "épisode" : "chapitre"; const UW = uk === "episodes" ? "Épisode" : "Chapitre";
  const chapters = c?.[uk] || [];
  const reload = () => { refetch(); qc.invalidateQueries({ queryKey: ["creations"] }); };

  const chMenu = (ch, i) => ({
    title: ch.title || `${UW} ${i + 1}`,
    entries: [
      { id: "edit", label: `Modifier l'${uw === "épisode" ? "épisode" : "chapitre"}`, icon: <IoCreateOutline size={14} />, onClick: () => setEdit({ index: i }) },
      { id: "rename", label: "Renommer", icon: <IoCreateOutline size={14} />, onClick: async () => {
        const t = await labPrompt(`Titre de l'${uw}`, ch.title || ""); if (t === null || !t.trim()) return;
        try { const full = await getCreationFull(cid); const units = [...(full[uk] || [])]; units[i] = { ...units[i], title: t.trim() }; await updateCreation(cid, { ...full, [uk]: units }, true); reload(); toast.success("Chapitre renommé"); } catch { toast.error("Renommage impossible"); }
      } },
      { id: "see", label: "Voir sur la station", icon: <IoEyeOutline size={14} />, onClick: () => nav(`/oeuvre/${cid}`) },
      "-",
      { id: "del", label: `Supprimer l'${uw}`, danger: true, icon: <IoTrashOutline size={14} />, onClick: async () => {
        if (!(await labConfirm(`Supprimer « ${ch.title || `${UW} ${i + 1}`} » de la station ? Le public ne le verra plus.`))) return;
        try { await deleteUnit(cid, uk, i); reload(); toast.success("Chapitre supprimé"); } catch { toast.error("Suppression impossible"); }
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
      <p className="ar-sec mono"><b>02</b> SUR LA STATION <i>· {chapters.length} {uw}{chapters.length > 1 ? "s" : ""} en ligne</i></p>
      <div className="st-head">
        <img src={posterUrl(cid, c?.updated_at, 200)} alt="" />
        <div className="st-head-b">
          <p className="mono st-k">CRÉATION PUBLIQUE</p>
          <h3>{c?.title || (isLoading ? "Chargement…" : "Création introuvable")}</h3>
          {c?.tagline && <p className="st-tag">{c.tagline}</p>}
          <div className="st-acts">
            <button className="at-btn" onClick={() => setEdit({ index: null })} disabled={!c} data-testid="oeuvre-station-new"><IoAdd size={15} /> {uk === "episodes" ? "Nouvel épisode" : "Nouveau chapitre"}</button>
            <button className="at-btn ghost" onClick={() => nav(`/oeuvre/${cid}`)} data-testid="oeuvre-station-see"><IoEyeOutline size={15} /> Voir sur la station</button>
            <button className="at-btn ghost" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); showMenu(r.left, r.bottom + 4, [
              ...creations.filter((x) => x.id !== cid && !taken(x.id)).map((x) => ({ id: `c-${x.id}`, label: x.title, onClick: () => link(x.id) })),
              "-", { id: "unlink", label: "Retirer le lien", danger: true, onClick: () => link("") },
            ], "Relier à une autre création"); }} data-testid="oeuvre-station-change"><IoSwapHorizontal size={15} /> Changer</button>
          </div>
        </div>
      </div>
      {c && c.launch_type === "film" && <p className="st-note">Cette création est un film : son lien se règle dans l'éditeur de la station. Les chapitres ci-dessous restent modifiables ici.</p>}
      {chapters.length > 0 ? (
        <ol className="st-chs" data-testid="oeuvre-station-chapters">
          {chapters.map((ch, i) => (
            <li key={ch.id || i}>
              <button onClick={() => setEdit({ index: i })} {...pressMenu(() => chMenu(ch, i))} data-testid={`oeuvre-station-ch-${i}`}>
                <span className="mono n">{String(i + 1).padStart(2, "0")}</span>
                <b>{ch.title || `${UW} ${i + 1}`}</b>
                {isScheduled(ch) && <small className="mono st-sched">SORTIE {relLabel(ch.release_at).toUpperCase()}</small>}
                <small className="mono">{uk === "episodes" ? (ch.url ? "VIDÉO" : ch.content ? "TEXTE" : "—") : `${ch.rich ? words(ch.content).toLocaleString("fr-FR") : String(ch.content || "").split(/\s+/).filter(Boolean).length.toLocaleString("fr-FR")} mots`}</small>
                <span className="st-ed" aria-hidden="true"><IoCreateOutline size={14} /></span>
              </button>
              <button className="st-more" aria-label="Plus d'actions" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); const m = chMenu(ch, i); showMenu(r.left, r.bottom + 4, m.entries, m.title); }}>⋯</button>
            </li>
          ))}
        </ol>
      ) : c && <p className="st-note">Rien en ligne pour l'instant. « {uk === "episodes" ? "Nouvel épisode" : "Nouveau chapitre"} », ou publie un document de cette œuvre (clic droit → Publier sur la station).</p>}
      {edit && <ChapterQuickEdit creationId={cid} unitKey={uk} index={edit.index} onClose={() => setEdit(null)} onSaved={reload} />}
    </section>
  );
}

// ---------------------------------------------------------------- Publier un élément (fenêtre)
export const askPublish = (id, dest) => window.dispatchEvent(new CustomEvent("at-publish", { detail: { id, dest } }));
export const askBatch = (ids) => window.dispatchEvent(new CustomEvent("at-publish-batch", { detail: { ids } }));
export const goStation = (url) => window.dispatchEvent(new CustomEvent("at-station-go", { detail: { url } }));
export function PublishHost({ at }) {
  const [req, setReq] = useState(null); const [batch, setBatch] = useState(null); const nav = useNavigate();
  useEffect(() => {
    const ob = (e) => setBatch(e.detail?.ids?.length ? e.detail.ids : null); window.addEventListener("at-publish-batch", ob);
    const on = (e) => setReq(e.detail?.id ? e.detail : null); const go = (e) => e.detail?.url && nav(e.detail.url);
    window.addEventListener("at-publish", on); window.addEventListener("at-station-go", go);
    return () => { window.removeEventListener("at-publish-batch", ob); window.removeEventListener("at-publish", on); window.removeEventListener("at-station-go", go); };
  }, [nav]);
  if (batch) return <BatchDialog at={at} ids={batch} onClose={() => setBatch(null)} />;
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
  const vid = videoOf(it);
  const [dest, setDest] = useState(initialDest || (prevC ? (prevC.unit === "episodes" ? "episode" : "chapter") : linkedCid ? (vid && !stripHtml(it.content || "").replace(/https?:\/\/\S+/g, "").trim() ? "episode" : "chapter") : "journal"));
  const unit = dest === "episode" ? "episodes" : "chapters"; const word = dest === "episode" ? "épisode" : "chapitre";
  const isUnit = dest !== "journal";
  const prev = isUnit ? (prevC && (prevC.unit || "chapters") === unit ? prevC : null) : prevJ;
  // sortie : maintenant, ou programmée (le chapitre part tout de suite mais reste caché au public jusqu'à l'heure dite)
  const [when, setWhen] = useState(prevC?.release_at && new Date(prevC.release_at) > new Date() ? "later" : "now");
  const [relAt, setRelAt] = useState(() => { if (prevC?.release_at && new Date(prevC.release_at) > new Date()) { const d = new Date(prevC.release_at); const q = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${q(d.getMonth() + 1)}-${q(d.getDate())}T${q(d.getHours())}:${q(d.getMinutes())}`; } return nextSunday(); });
  // ce qui a bougé depuis la dernière publication (dans l'atelier, en ligne, ou les deux)
  const { data: remote, isFetching: rLoading } = useQuery({ queryKey: ["pub-remote", prev?.target, prev?.chapter_id || prev?.entry_id], queryFn: () => fetchRemote(prev), enabled: !!prev, staleTime: 0 });
  const st = prev ? (rLoading ? "?" : syncState(it, prev, remote)) : "none";
  useEffect(() => { if (st === "gone" && isUnit) setMode("new"); }, [st, dest]); // eslint-disable-line react-hooks/exhaustive-deps
  const pull = async () => { setBusy(true); try { await pullRemote(at, it, prev); toast.success("Version en ligne récupérée dans le brouillon"); onClose(); } catch { toast.error("Récupération impossible"); setBusy(false); } };
  const [cid, setCid] = useState(prevC?.creation_id || linkedCid || "");
  const [mode, setMode] = useState(prevC?.chapter_id && (prevC.unit || "chapters") === unit ? "replace" : "new");
  const [chId, setChId] = useState(prevC?.chapter_id || "");
  const [title, setTitle] = useState(it.title || "");
  const [jc, setJc] = useState(linkedCid || "");
  const [cat, setCat] = useState("");
  const [fmt, setFmt] = useState("livre");
  const [pub, setPub] = useState(prevJ ? prevJ.published !== false : true);
  const [home, setHome] = useState(false);
  const [after, setAfter] = useState("keep");
  const [busy, setBusy] = useState(false);
  const { data: c } = useQuery({ queryKey: ["creation-atelier", cid], queryFn: () => getCreation(cid), enabled: isUnit && !!cid });
  const chapters = c?.[unit] || [];
  const repl = chapters.find((x) => x.id === chId);
  const empty = dest === "episode" ? !vid : !stripHtml(it.content || "").trim();
  useEffect(() => { const k = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);

  const go = async () => {
    if (isUnit && !cid) return toast.error("Choisis la création");
    if (isUnit && mode === "replace" && !repl) return toast.error(`Choisis le ${word} à remplacer`);
    if (isUnit && when === "later" && !relAt) return toast.error("Choisis la date de sortie");
    setBusy(true);
    try {
      const p = isUnit
        ? await publishChapter(it, { creation_id: cid, mode, chapter_id: chId, title: title.trim(), unit, release_at: when === "later" ? localToIso(relAt) : "" })
        : await publishJournal(it, { entry_id: prevJ?.entry_id || "", title: title.trim(), creation_id: jc, category_id: cat, format: fmt, published: pub, show_home: home });
      let fields = { ...(it.fields || {}), [isUnit ? "published" : "published_j"]: p };
      if (after === "folder") fields = { ...fields, folder_id: (await publishedFolder(at, it)).id };
      await at.saveItem({ ...it, fields });
      qc.invalidateQueries({ queryKey: ["creation-atelier"] }); qc.invalidateQueries({ queryKey: ["creations"] }); qc.invalidateQueries({ queryKey: ["journal"] });
      toast.success(isUnit ? (when === "later" ? `${word[0].toUpperCase() + word.slice(1)} ${p.index + 1} programmé · ${relLabel(p.release_at)}` : `${mode === "replace" ? `${word[0].toUpperCase() + word.slice(1)} remplacé` : `Nouvel ${word === "épisode" ? "épisode" : "chapitre"} en ligne`} · ${word} ${p.index + 1}`) : pub ? "Entrée du journal publiée" : "Brouillon du journal enregistré", { action: { label: "Voir", onClick: () => nav(stationUrl(p)) } });
      onClose();
    } catch (e) { toast.error(e?.response?.data?.detail || "Publication impossible"); setBusy(false); }
  };

  return createPortal(
    <div className="st-dlg-wrap" onClick={onClose} data-testid="publish-dialog">
      <div className="st-dlg" role="dialog" aria-label="Publier sur la station" onClick={(e) => e.stopPropagation()}>
        <header><p className="mono st-k">PUBLIER SUR LA STATION</p><h2>{it.title || "Sans titre"}</h2><button className="at-icon" onClick={onClose} aria-label="Fermer"><IoClose size={17} /></button></header>
        {prev && <p className={"st-prev mono s-" + st} data-testid="publish-state">{publishedLabel(prev, creations)} · le {new Date(prev.date).toLocaleDateString("fr-FR")}{st !== "?" && st !== "none" ? ` · ${SYNC_LABEL[st].toUpperCase()}` : ""}</p>}
        {(st === "remote" || st === "both") && <div className="st-warn st-conflict" data-testid="publish-conflict">
          <p>{prev.target === "journal" ? "L'entrée du journal" : `Ce ${word}`} a été modifié{prev.target === "journal" ? "e" : ""} sur la station depuis ta dernière publication{st === "both" ? ", et le brouillon aussi" : ""}. Publier maintenant écraserait la version en ligne.</p>
          {prev.unit !== "episodes" && <div><button className="at-btn ghost" onClick={pull} disabled={busy} data-testid="publish-pull">Récupérer la version en ligne dans le brouillon</button></div>}
        </div>}
        {st === "gone" && <p className="st-warn">{prev.target === "journal" ? "L'entrée du journal n'existe plus" : `Ce ${word} n'existe plus`} en ligne : publier en recrée {prev.target === "journal" ? "une" : "un"}.</p>}
        {st === "ok" && <p className="st-note">Rien n'a changé depuis la dernière publication.</p>}
        {empty && <p className="st-warn">{dest === "episode" ? "Pas de vidéo dans cet élément : colle un lien YouTube dans le texte, ou publie un lien vidéo du Drive." : "Cet élément est vide : il n'y a rien à publier pour l'instant."}</p>}
        <div className="st-seg" role="radiogroup">
          <button role="radio" aria-checked={dest === "chapter"} className={dest === "chapter" ? "on" : ""} onClick={() => setDest("chapter")} data-testid="publish-dest-chapter">Chapitre</button>
          <button role="radio" aria-checked={dest === "episode"} className={dest === "episode" ? "on" : ""} onClick={() => setDest("episode")} disabled={!vid} title={vid ? "La vidéo de cet élément devient un épisode" : "Pas de vidéo dans cet élément"} data-testid="publish-dest-episode">Épisode</button>
          <button role="radio" aria-checked={dest === "journal"} className={dest === "journal" ? "on" : ""} onClick={() => setDest("journal")} data-testid="publish-dest-journal">Journal de bord</button>
        </div>
        <label>Titre<input value={title} onChange={(e) => setTitle(e.target.value)} data-testid="publish-title" /></label>
        {isUnit ? <>
          <label>Création<select value={cid} onChange={(e) => { setCid(e.target.value); setChId(""); }} data-testid="publish-creation">
            <option value="">Choisir…</option>
            {creations.map((x) => <option key={x.id} value={x.id}>{x.title}{x.id === linkedCid ? " (reliée à l'œuvre)" : ""}</option>)}
          </select></label>
          <div className="st-seg sm">
            <button className={mode === "new" ? "on" : ""} onClick={() => setMode("new")} data-testid="publish-mode-new">Nouvel {word === "épisode" ? "épisode" : "chapitre"}{cid ? ` (n° ${chapters.length + 1})` : ""}</button>
            <button className={mode === "replace" ? "on" : ""} onClick={() => setMode("replace")} disabled={!chapters.length} data-testid="publish-mode-replace">Remplacer un {word}</button>
          </div>
          {mode === "replace" && <label>{word === "épisode" ? "Épisode" : "Chapitre"} remplacé<select value={chId} onChange={(e) => setChId(e.target.value)} data-testid="publish-chapter">
            <option value="">Choisir…</option>
            {chapters.map((x, i) => <option key={x.id} value={x.id}>{i + 1}. {x.title || "Sans titre"}</option>)}
          </select></label>}
          {mode === "replace" && repl && <p className="st-warn">{word === "épisode" ? "La vidéo et le résumé" : "Le texte"} en ligne de « {repl.title} » {word === "épisode" ? "seront remplacés" : "sera remplacé"} par ceux de ce document.</p>}
          {dest === "episode" && vid && <p className="st-note">Vidéo : {vid.replace(/^https?:\/\/(www\.)?/, "")}. Le texte de l'élément sert de résumé.</p>}
          <Release when={when} setWhen={setWhen} relAt={relAt} setRelAt={setRelAt} />
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
          <button className="at-btn" onClick={go} disabled={busy || empty} data-testid="publish-go"><IoCloudUploadOutline size={15} /> {busy ? "Publication…" : isUnit && when === "later" ? "Programmer" : st === "remote" || st === "both" ? "Écraser la version en ligne" : prev && st !== "gone" ? "Mettre à jour en ligne" : "Publier"}</button>
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

// ---------------------------------------------------------------- Sortir un lot : plusieurs documents → chapitres, dans l'ordre
function BatchDialog({ at, ids, onClose }) {
  const nav = useNavigate(); const qc = useQueryClient();
  const [order, setOrder] = useState(() => ids.map((id) => at.items.find((x) => x.id === id)).filter((it) => it && !isOeuvre(it) && !isFolder(it) && (it.kind !== "file" || videoOf(it))).map((it) => it.id));
  const items = order.map((id) => at.items.find((x) => x.id === id)).filter(Boolean);
  const { data: creations = [] } = useQuery({ queryKey: ["creations", "all"], queryFn: () => listCreations() });
  const [cid, setCid] = useState(() => (items.map((it) => creationOfItem(at, it)).find(Boolean)) || "");
  const { data: c } = useQuery({ queryKey: ["creation-atelier", cid], queryFn: () => getCreation(cid), enabled: !!cid });
  const [step, setStep] = useState(-1);
  const allVid = items.length > 0 && items.every((it) => videoOf(it));
  const [unit, setUnit] = useState(() => (allVid && items.every((it) => !stripHtml(it.content || "").replace(/https?:\/\/\S+/g, "").trim()) ? "episodes" : "chapters"));
  const [when, setWhen] = useState("now"); const [relAt, setRelAt] = useState(nextSunday());
  const n0 = (c?.[unit] || []).length; const abbr = unit === "episodes" ? "ÉP." : "CH.";
  let k = 0; const plan = items.map((it) => { const p = it.fields?.published; if (p && p.creation_id === cid && (p.unit || "chapters") === unit) return { it, upd: true, n: (p.index ?? 0) + 1 }; k += 1; return { it, upd: false, n: n0 + k }; });
  const move = (i, d) => setOrder((o) => { const a = [...o]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });
  const empty = items.filter((it) => !stripHtml(it.content || "").trim());
  const go = async () => {
    if (!cid) return toast.error("Choisis la création"); setStep(0);
    try { await publishBatch(at, items, cid, setStep, { unit, release_at: when === "later" ? localToIso(relAt) : "" }); qc.invalidateQueries({ queryKey: ["creation-atelier"] }); qc.invalidateQueries({ queryKey: ["creations"] }); qc.invalidateQueries({ queryKey: ["pub-panel"] });
      toast.success(when === "later" ? `${items.length} ${unit === "episodes" ? "épisode" : "chapitre"}${items.length > 1 ? "s" : ""} programmé${items.length > 1 ? "s" : ""} · ${relLabel(localToIso(relAt))}` : `${items.length} ${unit === "episodes" ? "épisode" : "chapitre"}${items.length > 1 ? "s" : ""} en ligne`, { action: { label: "Voir", onClick: () => nav(`/oeuvre/${cid}`) } }); onClose(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Le lot s'est arrêté en route : ce qui est parti reste en ligne"); setStep(-1); }
  };
  return createPortal(
    <div className="st-dlg-wrap" onClick={step < 0 ? onClose : undefined} data-testid="batch-dialog">
      <div className="st-dlg" role="dialog" aria-label="Sortir un lot" onClick={(e) => e.stopPropagation()}>
        <header><p className="mono st-k">SORTIR UN LOT</p><h2>{items.length} document{items.length > 1 ? "s" : ""} → {unit === "episodes" ? "épisodes" : "chapitres"}</h2><button className="at-icon" onClick={onClose} aria-label="Fermer" disabled={step >= 0}><IoClose size={17} /></button></header>
        <label>Création<select value={cid} onChange={(e) => setCid(e.target.value)} disabled={step >= 0} data-testid="batch-creation">
          <option value="">Choisir…</option>
          {creations.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
        </select></label>
        <div className="st-seg sm">
          <button className={unit === "chapters" ? "on" : ""} onClick={() => setUnit("chapters")} disabled={step >= 0}>Chapitres (le texte)</button>
          <button className={unit === "episodes" ? "on" : ""} onClick={() => setUnit("episodes")} disabled={step >= 0 || !allVid} title={allVid ? "" : "Chaque document doit contenir une vidéo"} data-testid="batch-unit-episodes">Épisodes (la vidéo)</button>
        </div>
        {cid && <p className="st-note">{n0} {unit === "episodes" ? "épisode" : "chapitre"}{n0 > 1 ? "s" : ""} déjà en ligne. Les nouveaux s'ajoutent à la suite, dans l'ordre ci-dessous (↑↓ pour le changer). Ceux déjà publiés dans cette création sont mis à jour sur place.</p>}
        <ol className="st-batch">
          {plan.map(({ it, upd, n }, i) => (
            <li key={it.id} className={step > i ? "done" : step === i ? "cur" : ""}>
              <span className="mono n">{cid ? `${abbr} ${n}` : "—"}</span>
              <b>{it.title || "Sans titre"}</b>
              {upd && <small className="mono">MISE À JOUR</small>}
              {unit === "chapters" && !stripHtml(it.content || "").trim() && <small className="mono warn">VIDE</small>}
              <span className="st-ord"><button onClick={() => move(i, -1)} disabled={i === 0 || step >= 0} aria-label="Monter">↑</button><button onClick={() => move(i, 1)} disabled={i === plan.length - 1 || step >= 0} aria-label="Descendre">↓</button></span>
            </li>
          ))}
        </ol>
        <Release when={when} setWhen={setWhen} relAt={relAt} setRelAt={setRelAt} />
        {empty.length > 0 && unit === "chapters" && <p className="st-warn">{empty.length} document{empty.length > 1 ? "s sont vides" : " est vide"} : {empty.length > 1 ? "ils partiront" : "il partira"} comme chapitre{empty.length > 1 ? "s" : ""} vide{empty.length > 1 ? "s" : ""}.</p>}
        <footer>
          <button className="at-btn ghost" onClick={onClose} disabled={step >= 0}>Annuler</button>
          <button className="at-btn" onClick={go} disabled={step >= 0 || !cid || !items.length} data-testid="batch-go"><IoCloudUploadOutline size={15} /> {step >= 0 ? `Publication… ${step}/${items.length}` : when === "later" ? `Programmer ${items.length} ${unit === "episodes" ? "épisode" : "chapitre"}${items.length > 1 ? "s" : ""}` : `Publier ${items.length} ${unit === "episodes" ? "épisode" : "chapitre"}${items.length > 1 ? "s" : ""}`}</button>
        </footer>
      </div>
    </div>,
    document.querySelector(".at-root") || document.body
  );
}

// Quand le chapitre ou l'épisode sort : maintenant, ou à une date (le prochain dimanche 18 h par défaut)
function Release({ when, setWhen, relAt, setRelAt }) {
  return (
    <div className="st-rel" data-testid="publish-release">
      <div className="st-seg sm">
        <button className={when === "now" ? "on" : ""} onClick={() => setWhen("now")} data-testid="publish-when-now">Sortie maintenant</button>
        <button className={when === "later" ? "on" : ""} onClick={() => setWhen("later")} data-testid="publish-when-later">Programmer</button>
      </div>
      {when === "later" && <>
        <input type="datetime-local" value={relAt} onChange={(e) => setRelAt(e.target.value)} data-testid="publish-release-at" />
        <p className="st-note">Il part tout de suite mais reste caché au public jusqu'au {relLabel(localToIso(relAt))}. Toi, tu le vois déjà, marqué « programmé ».</p>
      </>}
    </div>
  );
}
