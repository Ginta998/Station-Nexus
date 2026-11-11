import { useEffect, useState } from "react";
import { IoClose, IoDownloadOutline, IoOpenOutline, IoCreateOutline, IoTrashOutline, IoSaveOutline } from "react-icons/io5";
import { toast } from "sonner";
import { KINDS, fileType, imgSrc } from "@/lib/atelier";
import { EmbedFrame } from "@/components/atelier/AppScreens";
import { popOut } from "@/lib/embed";
import { labConfirm, labPrompt } from "@/components/atelier/LabDialog";

const abs = (u) => (u?.startsWith("http") ? u : window.location.origin + imgSrc(u));

function TextPreview({ url }) {
  const [t, setT] = useState("Chargement…");
  useEffect(() => { fetch(abs(url)).then((r) => r.text()).then((x) => setT(x.slice(0, 400000))).catch(() => setT("Aperçu impossible.")); }, [url]);
  return <pre className="fv-text" data-testid="file-viewer-text">{t}</pre>;
}

// Aperçu direct d'un fichier, d'un lien ou d'un fichier Drive
export function FilePreview({ m }) {
  const kind = fileType(m);
  if (kind === "image") return <img className="fv-img" src={imgSrc(m.url)} alt={m.name} data-testid="file-viewer-image" />;
  if (kind === "pdf") return <iframe className="fv-frame" title={m.name} src={imgSrc(m.url)} data-testid="file-viewer-pdf" />;
  if (kind === "video") return <video className="fv-media" src={imgSrc(m.url)} controls autoPlay playsInline />;
  if (kind === "audio") return <audio src={imgSrc(m.url)} controls autoPlay />;
  if (kind === "office") return <iframe className="fv-frame" title={m.name} src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(abs(m.url))}`} data-testid="file-viewer-office" />;
  if (kind === "text") return <TextPreview url={m.url} />;
  if (kind === "link") return <EmbedFrame url={m.url} />;
  return <div className="at-embed-msg"><p>Pas d'aperçu pour ce fichier — tu peux le télécharger.</p></div>;
}

// Visionneuse plein écran d'un élément « Fichier » : accès direct, notes facultatives
export default function FileViewer({ at, id, onClose, edit }) {
  const it = at.items.find((x) => x.id === id);
  const [notes, setNotes] = useState(null);
  if (!it) return null;
  const m = (it.media || [])[0];
  const u = at.universes.find((x) => x.id === it.universe_id);
  const plain = (it.content || "").replace(/<br\s*\/?>/g, "\n").replace(/<\/p>\s*<p>/g, "\n\n").replace(/<[^>]+>/g, "");
  const saveNotes = async () => {
    await at.saveItem({ ...it, content: notes.split(/\n{2,}/).map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br/>")}</p>`).join("") });
    toast.success("Notes enregistrées"); setNotes(null);
  };
  const del = async () => { if ((await labConfirm(`Supprimer « ${it.title || "ce fichier"} » de l'Atelier ?`))) { await at.removeItem(it.id); onClose(); } };
  const ext = m?.type === "link" || m?.type === "youtube" ? m.url : null;
  return (
    <div className="fv-wrap" data-testid="file-viewer">
      <div className="fv-bar">
        <span className="kj">{KINDS.file.kanji}</span>
        <div className="grow"><b data-testid="file-viewer-title">{it.title || m?.name || "Fichier"}</b><small className="mono">{u ? u.name.toUpperCase() : "INBOX"} · {(m?.name || "").toUpperCase()}</small></div>
        <button className="at-icon" onClick={() => setNotes(notes === null ? plain : null)} title="Notes" data-testid="file-viewer-notes-btn"><IoCreateOutline size={17} /></button>
        {m && !ext && <a className="at-icon" href={imgSrc(m.url)} download={m.name} title="Télécharger" data-testid="file-viewer-download"><IoDownloadOutline size={17} /></a>}
        {m && <button className="at-icon" onClick={() => popOut(ext || abs(m.url))} title="Ouvrir à côté" data-testid="file-viewer-popout"><IoOpenOutline size={17} /></button>}
        <button className="at-icon" onClick={() => edit(it.id)} title="Renommer / ranger" data-testid="file-viewer-edit">⋯</button>
        <button className="at-icon danger" onClick={del} title="Supprimer" data-testid="file-viewer-delete"><IoTrashOutline size={16} /></button>
        <button className="at-icon" onClick={onClose} title="Fermer" data-testid="file-viewer-close"><IoClose size={19} /></button>
      </div>
      <div className="fv-body">
        <div className="fv-main">{m ? <FilePreview m={m} /> : <div className="at-embed-msg"><p>Aucun fichier joint.</p></div>}</div>
        {(notes !== null || plain.trim()) && (
          <aside className="fv-notes" data-testid="file-viewer-notes">
            <small className="mono">// TES NOTES</small>
            {notes === null ? <p onClick={() => setNotes(plain)}>{plain}</p> : (
              <><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ajoute tes notes sur ce fichier…" autoFocus data-testid="file-viewer-notes-input" />
                <button className="at-btn" onClick={saveNotes} data-testid="file-viewer-notes-save"><IoSaveOutline size={14} />Enregistrer</button></>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
