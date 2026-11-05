import { useEffect, useMemo, useRef, useState } from "react";
import {
  IoText, IoRemoveOutline, IoColorPaletteOutline, IoImageOutline, IoMusicalNotes,
  IoArrowUndo, IoArrowRedo, IoListOutline, IoLinkOutline, IoBrushOutline, IoChevronDown, IoMenuOutline, IoClose,
} from "react-icons/io5";
import { MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight, MdFormatAlignJustify, MdFormatListNumbered, MdFormatIndentIncrease, MdFormatIndentDecrease, MdFormatClear, MdStrikethroughS } from "react-icons/md";
import { styleOf, styleVars, DOC_CSS, docFonts } from "@/lib/docStyles";
import { imgSrc } from "@/lib/atelier";

// Éditeur de document « vivant » : même rendu que la visualisation (DOC_CSS) + la MÊME barre d'outils
// complète que l'éditeur Flux, placée au-dessus du titre, avec Sommaire, sur un seul document reconstruit.
const COLORS = ["#ffffff", "var(--brand)", "#e60012", "#ff7a00", "#ffd400", "#00e5a0", "#4d8dff", "#c4b5fd", "#ff4dcb", "#9aa0a6"];
const HILITES = ["transparent", "rgba(255,212,0,0.35)", "rgba(0,229,160,0.3)", "rgba(77,141,255,0.35)", "rgba(255,77,203,0.3)", "rgba(230,0,18,0.35)"];
const SIZES = [["2", "Petit"], ["3", "Normal"], ["5", "Grand"], ["6", "Très grand"]];
const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const sanitize = (h) => (h || "").replace(/<\/?(script|style|iframe|object)[^>]*>/gi, "").replace(/ on\w+="[^"]*"/gi, "");
const fs = { background: "var(--bg-primary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" };
const Sep = () => <span className="w-px h-6 mx-0.5" style={{ background: "var(--border-c)" }} />;
const Btn = ({ onClick, title, children, disabled }) => (
  <button type="button" title={title} disabled={disabled} onClick={onClick} onMouseDown={(e) => e.preventDefault()}
    className="rte-btn min-w-[34px] h-[34px] px-2 text-sm border flex items-center justify-center" style={{ ...fs, opacity: disabled ? 0.4 : 1 }}>{children}</button>
);
const Swatches = ({ list, onPick }) => (
  <div className="absolute z-30 mt-1 p-2 border flex flex-wrap gap-1.5 w-44" style={{ ...fs, background: "var(--bg-secondary)" }}>
    {list.map((c) => <button key={c} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(c)} title={c === "transparent" ? "Aucun" : c}
      className="w-6 h-6 border" style={{ background: c === "transparent" ? "repeating-linear-gradient(45deg,#555 0 3px,transparent 3px 6px)" : c, borderColor: "rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)" }} />)}
  </div>
);

function parseSecs(html) {
  const root = new DOMParser().parseFromString(`<div>${html || ""}</div>`, "text/html").body.firstChild;
  const out = []; let cur = null;
  for (const n of [...root.childNodes]) {
    const tag = n.nodeName;
    if (tag === "H1" || tag === "H2" || tag === "HR") { cur = { tag, title: tag === "HR" ? "" : (n.innerHTML || ""), body: "" }; out.push(cur); continue; }
    if (!cur) { cur = { tag: "", title: "", body: "" }; out.push(cur); }
    cur.body += n.nodeType === 1 ? n.outerHTML : (n.textContent.trim() ? `<p>${esc(n.textContent)}</p>` : "");
  }
  if (!out.length) out.push({ tag: "", title: "", body: "<p><br></p>" });
  return out;
}
function reconstruct(root) {
  let out = "";
  root.querySelectorAll(".de-h,.de-hr,.de-b").forEach((el) => {
    if (el.classList.contains("de-hr")) out += "<hr>";
    else if (el.classList.contains("de-h")) { const tag = (el.dataset.tag || "h2").toLowerCase(); out += `<${tag}>${el.innerHTML}</${tag}>`; }
    else out += el.innerHTML;
  });
  return sanitize(out);
}
const titleEl = (s, i) => {
  if (s.tag === "HR") return `<hr class="de-hr" data-se="${i}">`;
  if (!s.tag) return "";
  const tag = s.tag.toLowerCase();
  return `<${tag} class="de-h" data-tag="${s.tag}" data-se="${i}" contenteditable="true" data-ph="Titre de section…">${s.title}</${tag}>`;
};
const bodyEl = (s, i) => `<div class="de-b" data-se="${i}" contenteditable="true" data-ph="Écris ici…">${s.body || "<p><br></p>"}</div>`;
const titleText = (s, n) => (s.tag && s.tag !== "HR" ? (s.title.replace(/<[^>]+>/g, "").trim() || "Section " + n) : "Section " + n);

function renderDocEdit(format, secs, cover) {
  const blocks = secs.map((s, i) => titleEl(s, i) + bodyEl(s, i)).join("");
  if (format === "drawers") {
    return `${cover}<div class="dz-body dz-draws">${secs.map((s, i) => s.tag && s.tag !== "HR"
      ? `<div class="dz-draw open"><div class="dz-draw-h"><button class="dz-fold" type="button" aria-label="Replier">▾</button>${titleEl(s, i)}</div>${bodyEl(s, i)}</div>`
      : `<div class="de-loose">${titleEl(s, i)}${bodyEl(s, i)}</div>`).join("")}</div>`;
  }
  if (format === "tabs") {
    return `${cover}<div class="dz-body"><div class="de-tabs"><div class="de-tablist">${secs.map((s, i) => `<button class="de-tab${i === 0 ? " active" : ""}" type="button" data-se="${i}">${esc(titleText(s, i + 1))}</button>`).join("")}</div>${secs.map((s, i) => `<div class="de-panel${i === 0 ? " active" : ""}" data-se="${i}">${titleEl(s, i)}${bodyEl(s, i)}</div>`).join("")}</div></div>`;
  }
  if (format === "slides") {
    return `<div class="dz-slides">${cover.replace("dz-cover", "dz-slide cover dz-cover")}${secs.map((s, i) => `<section class="dz-slide">${titleEl(s, i)}<div class="dz-sb">${bodyEl(s, i)}</div></section>`).join("")}</div>`;
  }
  if (format === "mood") {
    return `<div class="dz-mood"><div class="dz-tile ttl">${cover.replace(/<header[^>]*>|<\/header>/g, "")}</div>${secs.map((s, i) => `<div class="dz-tile">${titleEl(s, i)}${bodyEl(s, i)}</div>`).join("")}</div>`;
  }
  return `${cover}<div class="dz-body">${blocks}</div>`; // a4 / web
}

export default function DocEdit({ value, onChange, format = "a4", styleKey, eyebrow, title, onTitle, image }) {
  const s = styleOf(styleKey);
  const rootRef = useRef(null);
  const content = useRef(value);
  const title0 = useRef(title);
  const timer = useRef(null);
  const activeRef = useRef(null);
  const savedRange = useRef(null);
  const [menu, setMenu] = useState(null);
  const [tools, setTools] = useState(() => { try { const v = localStorage.getItem("nx-rte-tools"); if (v !== null) return v === "1"; return window.innerWidth >= 768; } catch (_) { return true; } });
  const toggleTools = () => setTools((t) => { const nv = !t; try { localStorage.setItem("nx-rte-tools", nv ? "1" : "0"); } catch (_) {} return nv; });
  const [outline, setOutline] = useState(false);
  const [heads, setHeads] = useState([]);

  const cover = useMemo(() => {
    const img = image ? imgSrc(image) : "";
    return `<header class="dz-cover${img ? " img" : ""}" style="${img ? `background-image:url('${esc(img)}')` : ""}"><div class="dz-eye">${esc(eyebrow)}</div><h1 class="dz-title de-title" contenteditable="true" data-ph="Titre…">${esc(title0.current || "")}</h1></header>`;
  }, [image, eyebrow]);
  const html = useMemo(() => renderDocEdit(format, parseSecs(content.current), cover), [format, cover]);

  const push = () => { clearTimeout(timer.current); timer.current = setTimeout(() => { if (rootRef.current) { content.current = reconstruct(rootRef.current); onChange(content.current); } }, 300); };

  const saveSel = () => { const sel = window.getSelection(); if (sel && sel.rangeCount && rootRef.current && rootRef.current.contains(sel.anchorNode)) savedRange.current = sel.getRangeAt(0).cloneRange(); };
  const restore = () => { const el = activeRef.current || rootRef.current?.querySelector(".de-b,.de-h,.de-title"); el?.focus(); if (savedRange.current) { try { const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(savedRange.current); } catch (_) {} } };
  const exec = (cmd, arg) => { restore(); try { document.execCommand("styleWithCSS", false, cmd !== "fontSize"); } catch (_) {} document.execCommand(cmd, false, arg); saveSel(); push(); };
  const toggle = (m) => { saveSel(); setMenu((v) => (v === m ? null : m)); };
  const addLink = () => { saveSel(); const u = window.prompt("Adresse du lien (https://…)"); if (u && /^https?:\/\//i.test(u.trim())) exec("createLink", u.trim()); };

  const onInput = (e) => {
    const h = e.target.closest?.(".de-title"); if (h) { onTitle?.(h.textContent); return; }
    const t = e.target.closest?.(".de-h"); if (t) { const i = t.dataset.se; rootRef.current.querySelectorAll(`.de-tab[data-se="${i}"]`).forEach((b) => { b.textContent = t.textContent.trim() || ("Section " + (+i + 1)); }); }
    push();
  };
  const onClickRoot = (e) => {
    const fold = e.target.closest?.(".dz-fold"); if (fold) { fold.closest(".dz-draw")?.classList.toggle("open"); return; }
    const tab = e.target.closest?.(".de-tab"); if (tab) { const root = tab.closest(".de-tabs"); const i = tab.dataset.se; root.querySelectorAll(".de-tab").forEach((b) => b.classList.toggle("active", b === tab)); root.querySelectorAll(".de-panel").forEach((p) => p.classList.toggle("active", p.dataset.se === i)); }
  };
  const onFocusRoot = (e) => { const z = e.target.closest?.(".de-b,.de-h,.de-title"); if (z) activeRef.current = z; setMenu(null); };

  const refreshHeads = () => {
    const root = rootRef.current; if (!root) return setHeads([]);
    const hs = [...root.querySelectorAll(".de-h,.de-b h1,.de-b h2,.de-b h3")].filter((h) => /^H[1-3]$/.test(h.tagName) && (h.textContent || "").trim());
    hs.forEach((h, i) => { h.dataset.oi = i; });
    setHeads(hs.map((h) => ({ i: String(h.dataset.oi), text: h.textContent.trim(), lvl: +h.tagName[1] })));
  };
  useEffect(() => { if (outline) refreshHeads(); /* eslint-disable-next-line */ }, [outline, format]);
  const jumpTo = (i) => {
    const el = rootRef.current?.querySelector(`[data-oi="${i}"]`); if (!el) return;
    const sec = el.dataset.se != null ? el.dataset.se : null;
    if (format === "tabs" && sec != null) { const root = el.closest(".de-tabs"); root?.querySelectorAll(".de-tab").forEach((b) => b.classList.toggle("active", b.dataset.se === sec)); root?.querySelectorAll(".de-panel").forEach((p) => p.classList.toggle("active", p.dataset.se === sec)); }
    el.closest(".dz-draw")?.classList.add("open");
    setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 40);
    if (window.innerWidth < 760) setOutline(false);
  };

  const toolbar = (
    <div className={`rte-toolbar de-toolbar flex flex-wrap items-center gap-1 p-2 ${tools ? "" : "rte-toolbar--collapsed"}`} data-testid="doc-edit-toolbar" style={{ borderColor: "var(--border-c)", fontFamily: "var(--font-body)" }}>
      <button type="button" className="rte-tool-toggle rte-btn h-[34px] px-2 text-sm border flex items-center justify-center gap-1" style={fs} onMouseDown={(e) => e.preventDefault()} onClick={toggleTools} title={tools ? "Réduire les outils" : "Afficher les outils"}><b style={{ fontSize: 13 }}>Aa</b><IoChevronDown size={13} style={{ transform: tools ? "none" : "rotate(-90deg)", transition: "transform .2s" }} /></button>
      <button type="button" className={"rte-tool-keep rte-btn h-[34px] px-2 text-sm border flex items-center gap-1" + (outline ? " on" : "")} style={fs} onMouseDown={(e) => e.preventDefault()} onClick={() => setOutline((o) => !o)} title="Sommaire (chapitres)" data-testid="doc-edit-outline"><IoMenuOutline size={15} /><span className="hide-sm" style={{ fontSize: 12 }}>Sommaire</span></button>
      {!tools && <span className="rte-tool-hint">Mise en forme</span>}
      <Btn title="Annuler" onClick={() => exec("undo")}><IoArrowUndo size={15} /></Btn>
      <Btn title="Rétablir" onClick={() => exec("redo")}><IoArrowRedo size={15} /></Btn>
      <Sep />
      <select title="Style de paragraphe" defaultValue="" onMouseDown={saveSel} onChange={(e) => { const v = e.target.value; e.target.value = ""; if (v) exec("formatBlock", v); }} className="h-[34px] px-2 text-sm border outline-none" style={fs}>
        <option value="" disabled>Style</option><option value="P">Texte normal</option><option value="H2">Titre</option><option value="H3">Sous-titre</option><option value="BLOCKQUOTE">Citation</option>
      </select>
      <select title="Taille du texte" defaultValue="" onMouseDown={saveSel} onChange={(e) => { const v = e.target.value; e.target.value = ""; if (v) exec("fontSize", v); }} className="h-[34px] px-2 text-sm border outline-none" style={fs}>
        <option value="" disabled>Taille</option>{SIZES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <Sep />
      <Btn title="Gras" onClick={() => exec("bold")}><b>G</b></Btn>
      <Btn title="Italique" onClick={() => exec("italic")}><i>I</i></Btn>
      <Btn title="Souligné" onClick={() => exec("underline")}><u>S</u></Btn>
      <Btn title="Barré" onClick={() => exec("strikeThrough")}><MdStrikethroughS size={17} /></Btn>
      <div className="relative">
        <Btn title="Couleur du texte" onClick={() => toggle("color")}><IoColorPaletteOutline size={16} /></Btn>
        {menu === "color" && <Swatches list={COLORS} onPick={(c) => { exec("foreColor", c); setMenu(null); }} />}
      </div>
      <div className="relative">
        <Btn title="Surligner" onClick={() => toggle("hilite")}><IoBrushOutline size={16} /></Btn>
        {menu === "hilite" && <Swatches list={HILITES} onPick={(c) => { exec("hiliteColor", c); setMenu(null); }} />}
      </div>
      <Sep />
      <Btn title="Aligner à gauche" onClick={() => exec("justifyLeft")}><MdFormatAlignLeft size={17} /></Btn>
      <Btn title="Centrer" onClick={() => exec("justifyCenter")}><MdFormatAlignCenter size={17} /></Btn>
      <Btn title="Aligner à droite" onClick={() => exec("justifyRight")}><MdFormatAlignRight size={17} /></Btn>
      <Btn title="Justifier" onClick={() => exec("justifyFull")}><MdFormatAlignJustify size={17} /></Btn>
      <Sep />
      <Btn title="Liste à puces" onClick={() => exec("insertUnorderedList")}><IoListOutline size={17} /></Btn>
      <Btn title="Liste numérotée" onClick={() => exec("insertOrderedList")}><MdFormatListNumbered size={17} /></Btn>
      <Btn title="Diminuer le retrait" onClick={() => exec("outdent")}><MdFormatIndentDecrease size={17} /></Btn>
      <Btn title="Augmenter le retrait" onClick={() => exec("indent")}><MdFormatIndentIncrease size={17} /></Btn>
      <Sep />
      <Btn title="Ligne de séparation" onClick={() => exec("insertHorizontalRule")}><IoRemoveOutline size={17} /></Btn>
      <Btn title="Insérer un lien" onClick={addLink}><IoLinkOutline size={16} /></Btn>
      <Btn title="Paragraphe normal" onClick={() => exec("formatBlock", "P")}><IoText size={15} /></Btn>
      <Btn title="Effacer la mise en forme" onClick={() => exec("removeFormat")}><MdFormatClear size={17} /></Btn>
      <Sep />
      <Btn title="Image — enregistre d'abord la création" disabled onClick={() => {}}><IoImageOutline size={16} /></Btn>
      <Btn title="Musique — enregistre d'abord la création" disabled onClick={() => {}}><IoMusicalNotes size={16} /></Btn>
    </div>
  );

  return (
    <div className="de-wrap" data-testid="doc-edit">
      <link rel="stylesheet" href={docFonts()} /><style>{DOC_CSS}</style>
      {toolbar}
      <div className="de-scroll">
        <div ref={rootRef} className={"dz de-doc f-" + format} data-deco={s.deco || undefined} style={styleVars(s)}
          onInput={onInput} onClick={onClickRoot} onFocus={onFocusRoot} onKeyUp={saveSel} onMouseUp={saveSel} onBlur={push}
          dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      {outline && (
        <nav className="rte-outline" data-testid="doc-edit-outline-panel">
          <div className="rte-ol-h"><span>Sommaire</span><button onMouseDown={(e) => e.preventDefault()} onClick={() => setOutline(false)} aria-label="Fermer"><IoClose size={16} /></button></div>
          <div className="rte-ol-list">
            {heads.length ? heads.map((h) => <button key={h.i} className={"rte-ol-item l" + h.lvl} onMouseDown={(e) => e.preventDefault()} onClick={() => jumpTo(h.i)}>{h.text}</button>)
              : <p className="rte-ol-empty">Ajoute des titres (Style → Titre) pour voir les chapitres ici.</p>}
          </div>
        </nav>
      )}
    </div>
  );
}
