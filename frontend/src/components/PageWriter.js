import { useEffect, useState } from "react";
import "@/components/pagewriter.css";
import { createPortal } from "react-dom";
import { IoArrowBack, IoSaveOutline, IoEyeOutline, IoCreateOutline, IoBookOutline } from "react-icons/io5";
import { useApp } from "@/context/AppContext";
import RichTextEditor from "@/components/RichTextEditor";

export const FONTS = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: "var(--font-body)",
  display: "var(--font-display)",
  mono: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
};
export const WIDTHS = { narrow: "max-w-xl", normal: "max-w-2xl", wide: "max-w-4xl" };


// Page d'écriture plein écran : on rédige directement dans la mise en page du lecteur
export default function PageWriter({ kicker, title, onTitle, html, onHtml, image, creationId, onClose, onSave, saving, saveLabel = "Enregistrer", note, onReader }) {
  const { readerFont, readerWidth, sfx } = useApp();
  const [preview, setPreview] = useState(false);
  const words = String(html || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const W = { narrow: 640, normal: 760, wide: 980 }[readerWidth] || 760;
  useEffect(() => { const k = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); if (!saving) onSave?.(); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [saving, onSave]);

  // Écrire un chapitre, en Rhine Lab : une barre d'atelier, et une vraie feuille de papier où l'on écrit.
  return createPortal(
    <div className="pw" data-testid="page-writer">
      <header className="pw-bar">
        <button className="pw-b" data-testid="page-writer-back" onClick={() => { sfx?.("nav"); onClose(); }} disabled={saving}><IoArrowBack size={15} /> <span>Retour</span></button>
        <p className="pw-path"><span>ATELIER</span><i>/</i><b>{String(kicker || "").toUpperCase()}</b></p>
        <span className="pw-grow" />
        <div className="pw-seg" role="radiogroup" aria-label="Mode">
          <button role="radio" aria-checked={!preview} className={!preview ? "on" : ""} data-testid="page-writer-mode-write" onClick={() => setPreview(false)}><IoCreateOutline size={14} /> <span>Écrire</span></button>
          <button role="radio" aria-checked={preview} className={preview ? "on" : ""} data-testid="page-writer-mode-preview" onClick={() => setPreview(true)}><IoEyeOutline size={14} /> <span>Aperçu</span></button>
        </div>
        {/* Aperçu fidèle : le vrai lecteur, au format que verra le public (livre qui tourne ses pages, VHS, vinyle) */}
        {onReader && <button className="pw-b" data-testid="page-writer-reader" onClick={() => { sfx?.("select"); onReader(); }}><IoBookOutline size={15} /> <span>Comme le lecteur</span></button>}
        <button className="pw-b go" data-testid="page-writer-save" onClick={onSave} disabled={saving}><IoSaveOutline size={15} /> <span>{saving ? "Enregistrement…" : saveLabel}</span></button>
      </header>

      <div className="pw-desk" data-testid="page-writer-pane">
        <article className="pw-sheet" style={{ maxWidth: W, fontFamily: FONTS[readerFont] || FONTS.serif }}>
          <p className="pw-k">{kicker}</p>
          {preview ? <h1 className="pw-title">{title || "Sans titre"}</h1>
            : <input data-testid="page-writer-title" value={title || ""} onChange={(e) => onTitle(e.target.value)} placeholder="Titre du chapitre…" className="pw-title pw-title-in" />}
          <span className="pw-rule" aria-hidden="true" />
          {image ? <img src={image} alt="" className="pw-img" /> : null}
          {preview
            ? (html ? <div className="reader-rich pw-prev" data-testid="page-writer-preview" dangerouslySetInnerHTML={{ __html: html }} /> : <p className="pw-empty">Rien d'écrit pour l'instant.</p>)
            : <RichTextEditor value={html} onChange={onHtml} creationId={creationId} page placeholder="Écris ou colle ton texte ici (la mise en forme de Google Docs / Word est conservée)…" />}
          {note && <p className="pw-note">{note}</p>}
        </article>
      </div>
      <footer className="pw-foot"><span>{words} MOT{words > 1 ? "S" : ""}</span><span>~{Math.max(1, Math.round(words / 230))} MIN DE LECTURE</span><span className="pw-grow" /><span>CTRL + S ENREGISTRE</span></footer>
    </div>,
    document.body
  );
}
