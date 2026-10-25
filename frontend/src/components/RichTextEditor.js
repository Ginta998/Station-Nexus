import { useEffect, useRef, useState } from "react";
import {
  IoText, IoRemoveOutline, IoColorPaletteOutline, IoImageOutline, IoMusicalNotes, IoCloudUploadOutline,
  IoArrowUndo, IoArrowRedo, IoListOutline, IoLinkOutline, IoBrushOutline,
} from "react-icons/io5";
import { MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight, MdFormatAlignJustify, MdFormatListNumbered, MdFormatIndentIncrease, MdFormatIndentDecrease, MdFormatClear, MdStrikethroughS } from "react-icons/md";
import { uploadAsset, listAssets, assetUrl, listAmbiences, ambienceUrl } from "@/lib/api";

const COLORS = ["#ffffff", "var(--brand)", "#e60012", "#ff7a00", "#ffd400", "#00e5a0", "#4d8dff", "#c4b5fd", "#ff4dcb", "#9aa0a6"];
const HILITES = ["transparent", "rgba(255,212,0,0.35)", "rgba(0,229,160,0.3)", "rgba(77,141,255,0.35)", "rgba(255,77,203,0.3)", "rgba(230,0,18,0.35)"];
const SIZES = [["2", "Petit"], ["3", "Normal"], ["5", "Grand"], ["6", "Très grand"]];

function sanitize(html) {
  if (!html) return "";
  return html.replace(/<\/?(script|style|iframe|object)[^>]*>/gi, "").replace(/ on\w+="[^"]*"/gi, "").replace(/ on\w+='[^']*'/gi, "");
}
const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Collage (Google Docs, Word, web…) : on garde gras, italique, souligné, barré, alignement, titres,
// listes, citations, liens, séparateurs et couleurs — on retire polices, tailles et classes parasites.
const PASTE_TAGS = new Set(["B", "STRONG", "I", "EM", "U", "S", "STRIKE", "DEL", "P", "BR", "HR", "DIV", "H2", "H3", "BLOCKQUOTE", "UL", "OL", "LI", "SPAN", "A", "SUB", "SUP"]);
const TAG_MAP = { FONT: "SPAN", H1: "H2", H4: "H3", H5: "H3", H6: "H3", STRIKE: "S", DEL: "S" };
const DARK = /^(#000(000)?|rgb\(0,\s*0,\s*0\)|black|windowtext)$/i;
const LIGHTBG = /^(transparent|#fff(fff)?|white|rgb\(255,\s*255,\s*255\)|rgba\(0,\s*0,\s*0,\s*0\))$/i;

function keptStyle(el) {
  const st = el.style; let out = "";
  const align = st.textAlign; if (/^(center|right|justify)$/.test(align)) out += `text-align:${align};`;
  const fw = st.fontWeight; if (fw === "bold" || Number(fw) >= 600) out += "font-weight:700;";
  if (st.fontStyle === "italic") out += "font-style:italic;";
  const td = `${st.textDecoration || ""} ${st.textDecorationLine || ""}`;
  if (/underline/.test(td)) out += "text-decoration:underline;"; else if (/line-through/.test(td)) out += "text-decoration:line-through;";
  if (st.color && !DARK.test(st.color.trim())) out += `color:${st.color};`;
  const bg = st.backgroundColor; if (bg && !LIGHTBG.test(bg.trim())) out += `background-color:${bg};`;
  const ml = parseFloat(st.marginLeft); if (ml >= 24 && /^(P|DIV|H2|H3)$/.test(el.tagName)) out += `margin-left:${Math.min(ml, 160)}px;`;
  return out;
}
function cleanPasted(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const walk = (node) => {
    let out = "";
    node.childNodes.forEach((ch) => {
      if (ch.nodeType === 3) { out += escapeHtml(ch.nodeValue); return; }
      if (ch.nodeType !== 1) return;
      let tag = ch.tagName.toUpperCase(); tag = TAG_MAP[tag] || tag;
      if (tag === "BR") { out += "<br/>"; return; }
      if (tag === "HR") { out += "<hr/>"; return; }
      // Google Docs enveloppe tout dans <b style="font-weight:normal"> : on le déballe
      if ((tag === "B" || tag === "STRONG") && /normal|^[1-5]00$/.test(ch.style.fontWeight || "")) { out += walk(ch); return; }
      if (!PASTE_TAGS.has(tag)) { out += walk(ch); return; }
      const t = tag.toLowerCase(); const style = keptStyle(ch);
      const inner = walk(ch);
      if (!inner) return;
      if (t === "span" && !style) { out += inner; return; }
      const href = t === "a" ? ` href="${(ch.getAttribute("href") || "").replace(/["<>]/g, "")}" target="_blank" rel="noopener"` : "";
      out += `<${t}${href}${style ? ` style="${style}"` : ""}>${inner}</${t}>`;
    });
    return out;
  };
  return sanitize(walk(doc.body));
}

const fs = { background: "var(--bg-primary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" };
const Sep = () => <span className="w-px h-6 mx-0.5" style={{ background: "var(--border-c)" }} />;
const Btn = ({ onClick, title, children, testid }) => (
  <button type="button" data-testid={testid} title={title} onClick={onClick} onMouseDown={(e) => e.preventDefault()}
    className="rte-btn min-w-[34px] h-[34px] px-2 text-sm border flex items-center justify-center" style={fs}>{children}</button>
);
function Swatches({ list, onPick, testid }) {
  return (
    <div className="absolute z-30 mt-1 p-2 border flex flex-wrap gap-1.5 w-44" style={{ ...fs, background: "var(--bg-secondary)" }} data-testid={testid}>
      {list.map((c) => (
        <button key={c} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(c)} title={c === "transparent" ? "Aucun" : c}
          className="w-6 h-6 border" style={{ background: c === "transparent" ? "repeating-linear-gradient(45deg,#555 0 3px,transparent 3px 6px)" : c, borderColor: "rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)" }} />
      ))}
    </div>
  );
}

function MusicMenu({ creationId, onInsert }) {
  const [assets, setAssets] = useState([]);
  const [amb, setAmb] = useState([]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef(null);
  useEffect(() => {
    if (creationId) listAssets(creationId).then((l) => setAssets(l.filter((x) => x.kind === "audio"))).catch(() => {});
    listAmbiences().then(setAmb).catch(() => {});
  }, [creationId]);
  const upload = async (file) => {
    if (!file || !creationId) return;
    setBusy(true);
    try { const name = title.trim() || file.name.replace(/\.[^.]+$/, ""); const a = await uploadAsset(creationId, file, "audio", name); onInsert(assetUrl(a.id), name); }
    finally { setBusy(false); }
  };
  const item = (key, label, fn, testid) => <button key={key} type="button" data-testid={testid} onClick={fn} className="text-left text-xs px-2 py-1.5 border truncate" style={fs}>♪ {label}</button>;
  return (
    <div className="absolute z-30 mt-1 right-0 p-3 border w-72" style={{ ...fs, background: "var(--bg-secondary)" }} data-testid="rte-music-menu" onMouseDown={(e) => e.target.tagName !== "INPUT" && e.preventDefault()}>
      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>Repère musique (le lecteur le lance d'un toucher)</p>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre affiché (ex : Thème de bataille)" className="w-full px-2 py-1.5 border outline-none text-sm mb-2" style={fs} data-testid="rte-cue-title" />
      <div className="mb-2 max-h-40 overflow-y-auto flex flex-col gap-1">
        {assets.length > 0 && <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Pistes de cette création :</p>}
        {assets.map((a) => item(a.id, a.name, () => onInsert(assetUrl(a.id), title || a.name), `rte-cue-existing-${a.id}`))}
        {amb.length > 0 && <p className="text-[10px] mt-1" style={{ color: "var(--text-secondary)" }}>Musiques de la station :</p>}
        {amb.map((a) => item(a.id, a.title, () => onInsert(ambienceUrl(a.id), title || a.title), `rte-cue-ambience-${a.id}`))}
      </div>
      {creationId ? (
        <button type="button" data-testid="rte-cue-upload" disabled={busy} onClick={() => input.current?.click()} className="w-full flex items-center justify-center gap-2 px-2 py-2 border text-xs" style={{ ...fs, opacity: busy ? 0.6 : 1 }}>
          <IoCloudUploadOutline /> {busy ? "Envoi…" : "Importer une piste (max 12 Mo)"}
        </button>
      ) : <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Enregistre d'abord la création pour importer tes propres pistes.</p>}
      <input ref={input} type="file" accept="audio/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; upload(f); }} />
    </div>
  );
}

// Éditeur complet façon traitement de texte. `page` : écriture directement dans la mise en page du lecteur.
export default function RichTextEditor({ value, onChange, placeholder = "Écris ton chapitre…", creationId, page = false }) {
  const ref = useRef(null);
  const [menu, setMenu] = useState(null); // color | hilite | music
  const [busy, setBusy] = useState(false);
  const savedRange = useRef(null);
  const imgInput = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || "")) ref.current.innerHTML = value || "";
    // eslint-disable-next-line
  }, []);

  const emit = () => { if (ref.current) onChange(sanitize(ref.current.innerHTML)); };
  const saveSel = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && ref.current && ref.current.contains(sel.anchorNode)) savedRange.current = sel.getRangeAt(0).cloneRange();
  };
  const restore = () => {
    ref.current?.focus();
    if (savedRange.current) { const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(savedRange.current); }
  };
  const exec = (cmd, arg) => {
    restore();
    try { document.execCommand("styleWithCSS", false, cmd !== "fontSize"); } catch (_) {}
    document.execCommand(cmd, false, arg);
    saveSel(); emit();
  };
  const insertHTML = (html) => { restore(); document.execCommand("insertHTML", false, html); savedRange.current = null; emit(); };
  const toggle = (m) => { saveSel(); setMenu((v) => (v === m ? null : m)); };

  const onPickImage = async (file) => {
    if (!file || !creationId) return;
    setBusy(true);
    try { const a = await uploadAsset(creationId, file, "image"); insertHTML(`<img src="${assetUrl(a.id)}" class="sx-rich-img" alt=""/><p><br/></p>`); }
    finally { setBusy(false); }
  };
  const insertCue = (url, title) => {
    const t = (title || "Musique").trim().replace(/[<>&"]/g, "");
    insertHTML(`<span class="sx-music-cue" contenteditable="false" data-track="${url}" data-title="${t}">${t}</span>&nbsp;`);
    setMenu(null);
  };
  const addLink = () => {
    saveSel();
    const url = window.prompt("Adresse du lien (https://…)");
    if (url && /^https?:\/\//i.test(url.trim())) exec("createLink", url.trim());
  };
  const onPaste = (e) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    const toInsert = html && html.trim() ? cleanPasted(html)
      : (text || "").split(/\n{2,}/).filter(Boolean).map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`).join("");
    ref.current?.focus();
    document.execCommand("insertHTML", false, toInsert || escapeHtml(text || ""));
    emit();
  };

  const toolbar = (
    <div className={`rte-toolbar flex flex-wrap items-center gap-1 p-2 border-b ${page ? "rte-toolbar--page" : ""}`} data-testid="rte-toolbar" style={{ borderColor: "var(--border-c)", fontFamily: "var(--font-body)" }}>
      <Btn testid="rte-undo" title="Annuler (Ctrl+Z)" onClick={() => exec("undo")}><IoArrowUndo size={15} /></Btn>
      <Btn testid="rte-redo" title="Rétablir (Ctrl+Y)" onClick={() => exec("redo")}><IoArrowRedo size={15} /></Btn>
      <Sep />
      <select data-testid="rte-block" title="Style de paragraphe" defaultValue="" onMouseDown={saveSel}
        onChange={(e) => { const v = e.target.value; e.target.value = ""; if (v) exec("formatBlock", v); }} className="h-[34px] px-2 text-sm border outline-none" style={fs}>
        <option value="" disabled>Style</option><option value="P">Texte normal</option><option value="H2">Titre</option><option value="H3">Sous-titre</option><option value="BLOCKQUOTE">Citation</option>
      </select>
      <select data-testid="rte-size" title="Taille du texte" defaultValue="" onMouseDown={saveSel}
        onChange={(e) => { const v = e.target.value; e.target.value = ""; if (v) exec("fontSize", v); }} className="h-[34px] px-2 text-sm border outline-none" style={fs}>
        <option value="" disabled>Taille</option>{SIZES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <Sep />
      <Btn testid="rte-bold" title="Gras (Ctrl+B)" onClick={() => exec("bold")}><b>G</b></Btn>
      <Btn testid="rte-italic" title="Italique (Ctrl+I)" onClick={() => exec("italic")}><i>I</i></Btn>
      <Btn testid="rte-underline" title="Souligné (Ctrl+U)" onClick={() => exec("underline")}><u>S</u></Btn>
      <Btn testid="rte-strike" title="Barré" onClick={() => exec("strikeThrough")}><MdStrikethroughS size={17} /></Btn>
      <div className="relative">
        <Btn testid="rte-color" title="Couleur du texte" onClick={() => toggle("color")}><IoColorPaletteOutline size={16} /></Btn>
        {menu === "color" && <Swatches testid="rte-color-menu" list={COLORS} onPick={(c) => { exec("foreColor", c); setMenu(null); }} />}
      </div>
      <div className="relative">
        <Btn testid="rte-hilite" title="Surligner" onClick={() => toggle("hilite")}><IoBrushOutline size={16} /></Btn>
        {menu === "hilite" && <Swatches testid="rte-hilite-menu" list={HILITES} onPick={(c) => { exec("hiliteColor", c); setMenu(null); }} />}
      </div>
      <Sep />
      <Btn testid="rte-left" title="Aligner à gauche" onClick={() => exec("justifyLeft")}><MdFormatAlignLeft size={17} /></Btn>
      <Btn testid="rte-center" title="Centrer" onClick={() => exec("justifyCenter")}><MdFormatAlignCenter size={17} /></Btn>
      <Btn testid="rte-right" title="Aligner à droite" onClick={() => exec("justifyRight")}><MdFormatAlignRight size={17} /></Btn>
      <Btn testid="rte-justify" title="Justifier" onClick={() => exec("justifyFull")}><MdFormatAlignJustify size={17} /></Btn>
      <Sep />
      <Btn testid="rte-ul" title="Liste à puces" onClick={() => exec("insertUnorderedList")}><IoListOutline size={17} /></Btn>
      <Btn testid="rte-ol" title="Liste numérotée" onClick={() => exec("insertOrderedList")}><MdFormatListNumbered size={17} /></Btn>
      <Btn testid="rte-outdent" title="Diminuer le retrait" onClick={() => exec("outdent")}><MdFormatIndentDecrease size={17} /></Btn>
      <Btn testid="rte-indent" title="Augmenter le retrait" onClick={() => exec("indent")}><MdFormatIndentIncrease size={17} /></Btn>
      <Sep />
      <Btn testid="rte-hr" title="Ligne de séparation" onClick={() => exec("insertHorizontalRule")}><IoRemoveOutline size={17} /></Btn>
      <Btn testid="rte-link" title="Insérer un lien" onClick={addLink}><IoLinkOutline size={16} /></Btn>
      <Btn testid="rte-p" title="Paragraphe normal" onClick={() => exec("formatBlock", "P")}><IoText size={15} /></Btn>
      <Btn testid="rte-clear" title="Effacer la mise en forme" onClick={() => exec("removeFormat")}><MdFormatClear size={17} /></Btn>
      <Sep />
      <Btn testid="rte-image" title={creationId ? "Insérer une image ici" : "Enregistre d'abord la création"} onClick={() => { if (!creationId) return; saveSel(); imgInput.current?.click(); }}>
        {busy ? "…" : <IoImageOutline size={16} />}
      </Btn>
      <input ref={imgInput} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; onPickImage(f); }} />
      <div className="relative">
        <Btn testid="rte-music" title="Insérer une musique ici" onClick={() => toggle("music")}><IoMusicalNotes size={16} /></Btn>
        {menu === "music" && <MusicMenu creationId={creationId} onInsert={insertCue} />}
      </div>
    </div>
  );

  const area = (
    <div ref={ref} data-testid="rte-area" contentEditable suppressContentEditableWarning
      onInput={emit} onBlur={emit} onKeyUp={saveSel} onMouseUp={saveSel} onPaste={onPaste} onFocus={() => setMenu(null)}
      data-placeholder={placeholder}
      className={page ? "rte-area reader-rich rte-area--page outline-none" : "rte-area px-3 py-3 outline-none text-sm min-h-[140px] max-h-[340px] overflow-y-auto"}
      style={{ color: "var(--text-primary)" }} />
  );

  if (page) return <div data-testid="rte">{toolbar}{area}</div>;
  return (
    <div className="border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }} data-testid="rte">
      <div style={{ background: "var(--bg-secondary)" }}>{toolbar}</div>{area}
    </div>
  );
}
