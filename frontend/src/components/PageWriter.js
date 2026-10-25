import { useState } from "react";
import { createPortal } from "react-dom";
import { IoArrowBack, IoSaveOutline, IoEyeOutline, IoCreateOutline } from "react-icons/io5";
import { useApp } from "@/context/AppContext";
import BlockRichEditor from "@/components/BlockRichEditor";

export const FONTS = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: "var(--font-body)",
  display: "var(--font-display)",
  mono: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
};
export const WIDTHS = { narrow: "max-w-xl", normal: "max-w-2xl", wide: "max-w-4xl" };

const ghost = { color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", background: "rgba(255,255,255,0.06)" };

// Page d'écriture plein écran : on rédige directement dans la mise en page du lecteur
export default function PageWriter({ kicker, title, onTitle, html, onHtml, image, creationId, onClose, onSave, saving, saveLabel = "Enregistrer", note }) {
  const { readerFont, readerSize, readerLine, readerWidth, sfx } = useApp();
  const [preview, setPreview] = useState(false);
  const article = { fontFamily: FONTS[readerFont] || FONTS.serif, fontSize: `${readerSize}px`, lineHeight: readerLine, color: "var(--text-primary)" };
  const tab = (on) => ({ ...ghost, color: on ? "var(--bg-primary)" : "var(--text-primary)", background: on ? "var(--brand)" : "transparent", borderColor: on ? "var(--brand)" : "var(--border-c)" });

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col reader-root" style={{ background: "var(--bg-primary)" }} data-testid="page-writer">
      <div className="reader-aurora" aria-hidden="true" />
      <div className="sx-reader-header relative z-20 flex items-center justify-between gap-2 px-3 md:px-8 py-3 border-b"
        style={{ borderColor: "var(--border-c)", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)" }}>
        <button data-testid="page-writer-back" onClick={() => { sfx?.("nav"); onClose(); }} disabled={saving} className="flex items-center gap-2 px-3 py-2 border text-sm" style={ghost}>
          <IoArrowBack size={18} /> <span className="hidden sm:inline">Retour</span>
        </button>
        <div className="flex items-center p-0.5 border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
          <button data-testid="page-writer-mode-write" onClick={() => setPreview(false)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm" style={tab(!preview)}><IoCreateOutline size={15} /> Écrire</button>
          <button data-testid="page-writer-mode-preview" onClick={() => setPreview(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm" style={tab(preview)}><IoEyeOutline size={15} /> Aperçu</button>
        </div>
        <button data-testid="page-writer-save" onClick={onSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 font-semibold text-sm disabled:opacity-50" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
          <IoSaveOutline size={16} /> <span className="hidden sm:inline">{saving ? "Enregistrement…" : saveLabel}</span>
        </button>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto" data-testid="page-writer-pane">
        <article className={`${WIDTHS[readerWidth] || WIDTHS.normal} mx-auto px-5 md:px-8 pt-8 pb-24`} style={article}>
          <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "var(--brand)", fontFamily: "var(--font-body)" }}>{kicker}</p>
          {preview ? (
            <h1 className="font-display leading-tight mb-8" style={{ fontSize: "1.9em" }}>{title || "Sans titre"}</h1>
          ) : (
            <input data-testid="page-writer-title" value={title || ""} onChange={(e) => onTitle(e.target.value)} placeholder="Titre…"
              className="pw-title font-display leading-tight mb-6 w-full" style={{ fontSize: "1.9em" }} />
          )}
          {image ? <img src={image} alt="" className="w-full mb-10 border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }} /> : null}
          {preview ? (
            html ? <div className="reader-rich" data-testid="page-writer-preview" dangerouslySetInnerHTML={{ __html: html }} />
              : <p style={{ color: "var(--text-secondary)" }}>Rien d'écrit pour l'instant.</p>
          ) : (
            <BlockRichEditor value={html} onChange={onHtml} creationId={creationId} page />
          )}
          {note && <p className="text-xs mt-10" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>{note}</p>}
        </article>
      </div>
    </div>,
    document.body
  );
}
