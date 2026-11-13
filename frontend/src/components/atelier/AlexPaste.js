import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose, IoPlay, IoCopyOutline, IoFolderOpenOutline } from "react-icons/io5";
import { toast } from "sonner";
import { labConfirm } from "@/components/atelier/LabDialog";
import { ROOMS, TYPES } from "@/data/alexandrie";
import { SEP, parsePaste, pasteToBook, TEMPLATES } from "@/data/alexandrie/paste";
import { THEMES, THEME_INFO, lookFrom } from "@/data/alexandrie/looks";

// Coller un livre : un bloc de texte (ou plusieurs, séparés par =====) devient un volume.
// À droite, ce qui sera créé : couverture, salle, chapitres, et le thème qu'on peut changer en direct.
export default function AlexPaste({ initial = "", editing, onSave, onPreview, onClose, renderCover }) {
  const [text, setText] = useState(initial);
  const [busy, setBusy] = useState(false);
  const blocks = useMemo(() => text.split(SEP).map((t) => t.trim()).filter(Boolean), [text]);
  const parsed = useMemo(() => blocks.map((t, i) => { const p = parsePaste(t); return { t, p, book: pasteToBook(t, { id: `preview:${i}`, preview: true }) }; }), [blocks]);
  const errors = parsed.reduce((n, x) => n + x.p.errors.length, 0);
  // Changer le thème depuis l'aperçu réécrit la ligne THÈME du bloc
  const setTheme = (i, v) => {
    const re = /^[ \t]*TH[EÈeè]ME[ \t]*:.*$/im; const t = blocks[i];
    const n = re.test(t) ? (v ? t.replace(re, `THÈME : ${v}`) : t.replace(re, "").replace(/\n{3,}/g, "\n\n")) : v ? t.replace(/^([ \t]*TITRE[ \t]*:.*)$/im, `$1\nTHÈME : ${v}`) : t;
    setText(blocks.map((x, j) => (j === i ? n : x)).join("\n\n=====\n\n"));
  };
  const pickTemplate = async (k) => {
    if (text.trim() && !(await labConfirm("Remplacer le texte actuel par le modèle ?"))) return;
    setText(TEMPLATES[k].text);
  };
  // Un fichier texte (un export, un lot préparé) se charge dans la fenêtre
  const openFile = (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; f.text().then((t) => setText((x) => (x.trim() ? `${x.trim()}\n\n=====\n\n${t}` : t)), () => toast.error("Le fichier n'a pas pu être lu")); };
  const copyTpl = async (k) => { try { await navigator.clipboard.writeText(TEMPLATES[k].text); toast.success(`Modèle ${TEMPLATES[k].label} copié`); } catch (_) { toast.error("La copie n'a pas marché"); } };
  const save = async () => {
    if (!blocks.length || errors) return;
    setBusy(true);
    try { await onSave(blocks); } finally { setBusy(false); }
  };
  return createPortal(
    <div className="ax-pd-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} data-testid="alex-paste">
      <div className="ax-pd" role="dialog" aria-modal="true" aria-label="Coller un livre" onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } }}>
        <header className="ax-pd-head">
          <div><p className="mono">// COLLER UN LIVRE</p><h3>{editing ? `Modifier « ${editing} »` : "Ajouter des livres"}</h3></div>
          <div className="ax-pd-tpl"><span className="mono">MODÈLES</span>{Object.entries(TEMPLATES).map(([k, v]) => (
            <span key={k} className="ax-pd-tb"><button onClick={() => pickTemplate(k)} data-testid={`alex-tpl-${k}`}>{v.label}</button><button onClick={() => copyTpl(k)} title={`Copier le modèle ${v.label}`} aria-label={`Copier le modèle ${v.label}`}><IoCopyOutline size={12} /></button></span>))}</div>
          <label className="ax-pd-file" title="Ouvrir un fichier texte (export, lot de livres)"><IoFolderOpenOutline size={15} /><span>Fichier</span><input type="file" accept=".txt,.md,text/plain" onChange={openFile} data-testid="alex-paste-file" /></label>
          <button className="ax-pd-x" onClick={onClose} aria-label="Fermer"><IoClose size={20} /></button>
        </header>
        <div className="ax-pd-body">
          <textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} autoFocus={!initial}
            placeholder={"Colle ici le bloc d'un livre.\n\nPlusieurs livres d'un coup : sépare-les par une ligne =====\n\nPas de bloc sous la main ? Choisis un modèle en haut."} data-testid="alex-paste-text" />
          <aside className="ax-pd-prev" aria-live="polite">
            {!parsed.length && <p className="ax-pd-empty">L'aperçu apparaît ici dès que tu colles un livre.</p>}
            {parsed.map(({ p, book }, i) => {
              const R = ROOMS.find((r) => r.key === p.meta.room); const look = lookFrom(p.meta.look); const val = p.meta.look?.like ? `comme ${p.meta.look.like}` : p.meta.look?.theme || "";
              return (
                <div className="ax-pd-card" key={i} data-testid="alex-paste-card">
                  <span className="ax-pd-cv">{renderCover(book)}</span>
                  <div className="ax-pd-info">
                    <b>{p.meta.title || "Sans titre"}</b>
                    <small className="mono">{(R?.label || "Mes livres").toUpperCase()} · {(TYPES[p.meta.type]?.label || "").toUpperCase()} · {book.chapters.filter((c) => c.title).length} CHAPITRE{book.chapters.filter((c) => c.title).length > 1 ? "S" : ""} · {book.words} MOTS</small>
                    {p.errors.map((er) => <span className="ax-pd-err" key={er}>{er}</span>)}
                    <label className="ax-pd-th"><span className="mono">THÈME</span>
                      <select value={val} onChange={(e) => setTheme(i, e.target.value)} data-testid="alex-paste-theme">
                        <option value="">Celui de la salle</option>
                        {val.startsWith("comme ") && <option value={val}>{val}</option>}
                        {Object.keys(THEMES).map((k) => <option key={k} value={k}>{k} · {THEME_INFO[k]}</option>)}
                      </select>
                    </label>
                    {look && <span className="ax-pd-sw" style={{ background: look.p, color: look.ink, borderColor: look.acc }}><b style={{ fontFamily: `"${look.d}"` }}>{p.meta.title || "Aa"}</b><i style={{ color: look.acc }}>{look.orn}</i><span style={{ fontFamily: `"${look.r}"`, color: look.ink2 }}>Le texte du livre, dans sa police de lecture.</span></span>}
                    <button className="ax-ghost" onClick={() => onPreview(book)} data-testid="alex-paste-preview"><IoPlay size={13} /> Lire l'aperçu</button>
                  </div>
                </div>
              );
            })}
          </aside>
        </div>
        <footer className="ax-pd-foot">
          <small className="mono">{blocks.length} LIVRE{blocks.length > 1 ? "S" : ""} DÉTECTÉ{blocks.length > 1 ? "S" : ""}{errors ? ` · ${errors} À CORRIGER` : ""}</small>
          <button className="at-btn" onClick={save} disabled={!blocks.length || !!errors || busy} data-testid="alex-paste-save">{busy ? "Enregistrement…" : editing ? "Enregistrer" : blocks.length > 1 ? `Ajouter les ${blocks.length} livres` : "Ajouter à la bibliothèque"}</button>
        </footer>
      </div>
    </div>,
    document.querySelector(".at-root") || document.body
  );
}
