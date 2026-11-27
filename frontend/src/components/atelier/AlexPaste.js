import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose, IoPlay, IoCopyOutline, IoFolderOpenOutline, IoClipboardOutline } from "react-icons/io5";
import { fileToText } from "@/lib/docxText";
import { toast } from "sonner";
import { labConfirm } from "@/components/atelier/LabDialog";
import { ROOMS, TYPES } from "@/data/alexandrie/meta";
import { SEP, parsePaste, pasteToBook, TEMPLATES, artDupes } from "@/data/alexandrie/paste";
import { THEMES, THEME_INFO, lookFrom } from "@/data/alexandrie/looks";
import { hasLots, LOT_TEMPLATE } from "@/data/alexandrie/lots";

// Coller un livre : un bloc de texte (ou plusieurs, séparés par =====) devient un volume.
// À droite, ce qui sera créé : couverture, salle, chapitres, et le thème qu'on peut changer en direct.
export default function AlexPaste({ initial = "", editing, onSave, onPreview, onClose, renderCover, planLots, onSaveLots }) {
  // Brouillon gardé dans le navigateur : on peut coller un long livre en plusieurs fois, fermer, revenir.
  const DRAFT = "alex-paste-draft";
  const [text, setText] = useState(() => { if (initial || editing) return initial; try { return localStorage.getItem(DRAFT) || ""; } catch (_) { return ""; } });
  const [restored] = useState(() => !initial && !editing && !!text);
  useEffect(() => { if (initial || editing) return; try { if (text.trim()) localStorage.setItem(DRAFT, text); else localStorage.removeItem(DRAFT); } catch (_) { /* rien */ } }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  const alive = useRef(true); useEffect(() => () => { alive.current = false; }, []);
  // enregistré : le brouillon s'efface ; en cas d'échec (fenêtre toujours ouverte) il est remis
  const dropDraft = (t) => { try { localStorage.removeItem(DRAFT); } catch (_) { /* rien */ } return () => { if (alive.current && !initial && !editing) { try { localStorage.setItem(DRAFT, t); } catch (_) { /* rien */ } } }; };
  const append = (t) => setText((x) => (x.trim() ? `${x.replace(/\s+$/, "")}\n\n${t}` : t));
  const [busy, setBusy] = useState(false);
  const blocks = useMemo(() => text.split(SEP).map((t) => t.trim()).filter(Boolean), [text]);
  const parsed = useMemo(() => blocks.map((t, i) => { const p = parsePaste(t); return { t, p, book: pasteToBook(t, { id: `preview:${i}`, preview: true }) }; }), [blocks]);
  // Des lots (lignes « LOT : ») : chacun met à jour un livre existant, ou en crée un
  const lotMode = !!planLots && hasLots(text);
  const plans = useMemo(() => (lotMode ? planLots(text) : []), [lotMode, text]); // eslint-disable-line react-hooks/exhaustive-deps
  const lotErrors = plans.reduce((n, x) => n + x.errors.length, 0);
  const errors = lotMode ? lotErrors : parsed.reduce((n, x) => n + x.p.errors.length, 0);
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
  // Des fichiers (.txt, .md, .docx) : chacun devient un livre (séparé par =====), dans l'ordre choisi
  const openFile = async (e) => {
    const fs = [...(e.target.files || [])]; e.target.value = ""; if (!fs.length) return;
    let ok = 0;
    for (const f of fs) {
      try { const t = (await fileToText(f)).trim(); if (!t) continue;
        const withTitle = /^\s*titre\s*:/im.test(t) || hasLots(t) ? t : `TITRE : ${f.name.replace(/\.[^.]+$/, "")}\n---\n\n${t}`;
        setText((x) => (x.trim() ? `${x.trim()}\n\n=====\n\n${withTitle}` : withTitle)); ok++; }
      catch (er) { toast.error(`« ${f.name} » : ${er?.message || "lecture impossible"}`); }
    }
    if (ok) toast.success(ok > 1 ? `${ok} fichiers chargés` : "Fichier chargé");
  };
  // Coller à la suite : le presse-papiers s'ajoute à la fin, sans écraser (pratique sur téléphone, morceau par morceau)
  const pasteMore = async () => {
    try { const t = await navigator.clipboard.readText(); if (!t.trim()) { toast("Le presse-papiers est vide"); return; } append(t.trim()); toast.success(`${t.trim().split(/\s+/).length} mots ajoutés à la suite`); }
    catch (_) { toast("Ton navigateur ne laisse pas lire le presse-papiers : appuie longuement à la fin du texte, puis Coller."); }
  };
  const clearDraft = async () => { if (!(await labConfirm("Vider la fenêtre ? Le brouillon sera effacé."))) return; setText(""); };
  const copyTpl = async (k) => { try { await navigator.clipboard.writeText(TEMPLATES[k].text); toast.success(`Modèle ${TEMPLATES[k].label} copié`); } catch (_) { toast.error("La copie n'a pas marché"); } };
  const save = async () => {
    if (lotMode) { if (!plans.length || errors) return; const back = dropDraft(text); setBusy(true); try { await onSaveLots(plans); } finally { setBusy(false); back(); } return; }
    if (!blocks.length || errors) return;
    const back = dropDraft(text); setBusy(true);
    try { await onSave(blocks); } finally { setBusy(false); back(); }
  };
  const copyLotTpl = async () => { try { await navigator.clipboard.writeText(LOT_TEMPLATE); toast.success("Modèle de lot copié"); } catch (_) { toast.error("La copie n'a pas marché"); } };
  return createPortal(
    <div className="ax-pd-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} data-testid="alex-paste">
      <div className="ax-pd" role="dialog" aria-modal="true" aria-label="Coller un livre" onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } }}>
        <header className="ax-pd-head">
          <div><p className="mono">// COLLER UN LIVRE OU DES LOTS</p><h3>{editing ? `Modifier « ${editing} »` : lotMode ? "Mettre des livres à jour" : "Ajouter des livres"}</h3></div>
          <div className="ax-pd-tpl"><span className="mono">MODÈLES</span>{Object.entries(TEMPLATES).map(([k, v]) => (
            <span key={k} className="ax-pd-tb"><button onClick={() => pickTemplate(k)} data-testid={`alex-tpl-${k}`}>{v.label}</button><button onClick={() => copyTpl(k)} title={`Copier le modèle ${v.label}`} aria-label={`Copier le modèle ${v.label}`}><IoCopyOutline size={12} /></button></span>))}
            {planLots && <span className="ax-pd-tb"><button onClick={() => (text.trim() ? copyLotTpl() : setText(LOT_TEMPLATE))} title="Un lot met à jour un livre existant" data-testid="alex-tpl-lot">Lot</button><button onClick={copyLotTpl} title="Copier le modèle de lot" aria-label="Copier le modèle de lot"><IoCopyOutline size={12} /></button></span>}</div>
          <button className="ax-pd-file" onClick={pasteMore} title="Ajouter le presse-papiers à la fin du texte" data-testid="alex-paste-more"><IoClipboardOutline size={15} /><span>Coller à la suite</span></button>
          <label className="ax-pd-file" title="Importer des fichiers : .txt, .md ou Word (.docx), plusieurs à la fois"><IoFolderOpenOutline size={15} /><span>Importer</span><input type="file" multiple accept=".txt,.md,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={openFile} data-testid="alex-paste-file" /></label>
          <button className="ax-pd-x" onClick={onClose} aria-label="Fermer"><IoClose size={20} /></button>
        </header>
        {restored && <p className="ax-pd-draft mono" data-testid="alex-paste-draft">BROUILLON REPRIS · {text.trim().split(/\s+/).length} MOTS <button onClick={clearDraft}>Vider</button></p>}
        <div className="ax-pd-body">
          <textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} autoFocus={!initial}
            placeholder={"Colle ici le bloc d'un livre.\n\nPlusieurs livres d'un coup : sépare-les par une ligne =====\n\nDes lots (mises à jour de livres existants) : chaque lot commence par une ligne LOT : titre ou identifiant du livre.\n\nPas de bloc sous la main ? Choisis un modèle en haut."} data-testid="alex-paste-text" />
          <aside className="ax-pd-prev" aria-live="polite">
            {lotMode && plans.map((pl) => (
              <div className={"ax-pd-card lot" + (pl.errors.length ? " bad" : "")} key={pl.i} data-testid="alex-lot-card">
                <div className="ax-pd-info">
                  <small className="mono">LOT {pl.i + 1} · {pl.kind === "create" ? "NOUVEAU LIVRE" : pl.kind === "update" ? "MISE À JOUR" : "INTROUVABLE"}</small>
                  <b>{pl.title}</b>
                  {pl.kind !== "error" && <small className="mono">{pl.before ? `${pl.before} → ` : ""}{pl.after} MOTS{pl.before ? ` (${pl.after - pl.before >= 0 ? "+" : ""}${pl.after - pl.before})` : ""}{pl.after > 2000 && pl.before <= 2000 && pl.before > 0 ? " · COMPLET" : ""}</small>}
                  {pl.ops.length > 0 && <ul className="ax-pd-ops">{pl.ops.map((o, j) => <li key={j}>{o}</li>)}</ul>}
                  {pl.errors.map((er) => <span className="ax-pd-err" key={er}>{er}</span>)}
                </div>
              </div>
            ))}
            {!lotMode && !parsed.length && <p className="ax-pd-empty">L'aperçu apparaît ici dès que tu colles un livre, ou des lots.</p>}
            {!lotMode && parsed.map(({ p, book }, i) => {
              const R = ROOMS.find((r) => r.key === p.meta.room); const look = lookFrom(p.meta.look); const val = p.meta.look?.like ? `comme ${p.meta.look.like}` : p.meta.look?.theme || "";
              return (
                <div className="ax-pd-card" key={i} data-testid="alex-paste-card">
                  <span className="ax-pd-cv">{renderCover(book)}</span>
                  <div className="ax-pd-info">
                    <b>{p.meta.title || "Sans titre"}</b>
                    <small className="mono">{(R?.label || "Mes livres").toUpperCase()} · {(TYPES[p.meta.type]?.label || "").toUpperCase()} · {book.chapters.filter((c) => c.title).length} CHAPITRE{book.chapters.filter((c) => c.title).length > 1 ? "S" : ""} · {book.words} MOTS</small>
                    {p.errors.map((er) => <span className="ax-pd-err" key={er}>{er}</span>)}
                    {artDupes(p.body).length > 0 && <span className="ax-pd-note" data-testid="alex-paste-dupes">Image demandée deux fois : {artDupes(p.body).join(", ")}. À la lecture, la deuxième prendra une autre image libre ; change son numéro pour choisir laquelle.</span>}
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
          {lotMode
            ? <small className="mono">{plans.length} LOT{plans.length > 1 ? "S" : ""} · {new Set(plans.filter((p) => p.book).map((p) => p.book.id)).size + plans.filter((p) => p.kind === "create").length} LIVRE(S){errors ? ` · ${errors} À CORRIGER` : ""}</small>
            : <small className="mono">{blocks.length} LIVRE{blocks.length > 1 ? "S" : ""} DÉTECTÉ{blocks.length > 1 ? "S" : ""}{errors ? ` · ${errors} À CORRIGER` : ""}</small>}
          {lotMode
            ? <button className="at-btn" onClick={save} disabled={!plans.length || !!errors || busy} data-testid="alex-lots-save">{busy ? "Application…" : `Appliquer ${plans.length > 1 ? `les ${plans.length} lots` : "le lot"}`}</button>
            : <button className="at-btn" onClick={save} disabled={!blocks.length || !!errors || busy} data-testid="alex-paste-save">{busy ? "Enregistrement…" : editing ? "Enregistrer" : blocks.length > 1 ? `Ajouter les ${blocks.length} livres` : "Ajouter à la bibliothèque"}</button>}
        </footer>
      </div>
    </div>,
    document.querySelector(".at-root") || document.body
  );
}
