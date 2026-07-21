import { useEffect, useRef, useState } from "react";
import {
  IoText, IoRemoveOutline, IoColorPaletteOutline,
  IoImageOutline, IoMusicalNotes, IoCloudUploadOutline,
} from "react-icons/io5";
import { uploadAsset, listAssets, assetUrl } from "@/lib/api";

const COLORS = ["#ffffff", "var(--brand)", "#e60012", "#ff7a00", "#ffd400", "#00e5a0", "#4d8dff", "#c4b5fd", "#ff4dcb", "#9aa0a6"];

// very light sanitize: drop script/style tags and inline event handlers
function sanitize(html) {
  if (!html) return "";
  return html
    .replace(/<\/?(script|style)[^>]*>/gi, "")
    .replace(/ on\w+="[^"]*"/gi, "")
    .replace(/ on\w+='[^']*'/gi, "");
}

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Keep meaningful formatting on paste (bold, italic, underline, alignment, headings,
// lists, quotes, links, colors) while stripping Word/Docs junk (fonts, sizes, classes…).
const PASTE_TAGS = new Set(["B", "STRONG", "I", "EM", "U", "P", "BR", "DIV", "H1", "H2", "H3", "H4", "BLOCKQUOTE", "UL", "OL", "LI", "SPAN", "A"]);
const STYLE_KEEP = ["text-align", "font-weight", "font-style", "text-decoration", "color"];
const TAG_MAP = { FONT: "span", H1: "h2", H4: "h3" };

function cleanPasted(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const walk = (node) => {
    let out = "";
    node.childNodes.forEach((ch) => {
      if (ch.nodeType === 3) { out += escapeHtml(ch.nodeValue); return; }
      if (ch.nodeType !== 1) return;
      let tag = ch.tagName.toUpperCase();
      tag = TAG_MAP[tag] ? TAG_MAP[tag].toUpperCase() : tag;
      if (tag === "BR") { out += "<br/>"; return; }
      if (!PASTE_TAGS.has(tag)) { out += walk(ch); return; } // unwrap unknown tags, keep text
      let style = "";
      try {
        STYLE_KEEP.forEach((k) => { const v = ch.style.getPropertyValue(k); if (v && !/inherit|initial|normal|400|none/.test(v)) style += `${k}:${v};`; });
      } catch (_) {}
      const t = tag.toLowerCase();
      const href = t === "a" ? ` href="${(ch.getAttribute("href") || "").replace(/["<>]/g, "")}"` : "";
      const inner = walk(ch);
      if (!inner && t !== "br") { out += ""; return; }
      out += `<${t}${href}${style ? ` style="${style}"` : ""}>${inner}</${t}>`;
    });
    return out;
  };
  return sanitize(walk(doc.body));
}

const btnCls = "px-2.5 py-1.5 text-sm border transition-colors";

export default function RichTextEditor({ value, onChange, placeholder = "Écris ton chapitre…", creationId }) {
  const ref = useRef(null);
  const [colorOpen, setColorOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const [audioAssets, setAudioAssets] = useState([]);
  const [cueTitle, setCueTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const savedRange = useRef(null);
  const imgInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // set initial content once
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line
  }, []);

  const emit = () => { if (ref.current) onChange(sanitize(ref.current.innerHTML)); };

  const saveSel = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && ref.current && ref.current.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const insertHTML = (html) => {
    const el = ref.current; if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (savedRange.current) { sel.removeAllRanges(); sel.addRange(savedRange.current); }
    document.execCommand("insertHTML", false, html);
    savedRange.current = null;
    emit();
  };

  const onPickImage = async (file) => {
    if (!file || !creationId) return;
    setBusy(true);
    try {
      const a = await uploadAsset(creationId, file, "image");
      insertHTML(`<img src="${assetUrl(a.id)}" class="sx-rich-img" alt=""/><p><br/></p>`);
    } finally { setBusy(false); }
  };

  const openMusic = async () => {
    saveSel();
    setMusicOpen((v) => !v);
    if (creationId) {
      try { const list = await listAssets(creationId); setAudioAssets(list.filter((x) => x.kind === "audio")); } catch (_) {}
    }
  };

  const insertCue = (url, title) => {
    const t = (title || "Musique").trim().replace(/[<>&"]/g, "");
    insertHTML(`<span class="sx-music-cue" contenteditable="false" data-track="${url}" data-title="${t}">${t}</span>&nbsp;`);
    setMusicOpen(false); setCueTitle("");
  };

  const onUploadCue = async (file) => {
    if (!file || !creationId) return;
    setBusy(true);
    try {
      const name = cueTitle.trim() || file.name.replace(/\.[^.]+$/, "");
      const a = await uploadAsset(creationId, file, "audio", name);
      insertCue(assetUrl(a.id), name);
    } finally { setBusy(false); }
  };

  const onPaste = (e) => {
    e.preventDefault();
    const cb = e.clipboardData;
    const html = cb.getData("text/html");
    const text = cb.getData("text/plain");
    let toInsert;
    if (html && html.trim()) {
      toInsert = cleanPasted(html);
    } else {
      toInsert = (text || "").split(/\n{2,}/).filter(Boolean).map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`).join("");
    }
    ref.current?.focus();
    document.execCommand("insertHTML", false, toInsert || escapeHtml(text || ""));
    emit();
  };

  const exec = (cmd, arg) => {
    ref.current?.focus();
    try { document.execCommand("styleWithCSS", false, true); } catch (_) {}
    document.execCommand(cmd, false, arg);
    emit();
  };
  const block = (tag) => exec("formatBlock", tag);

  const fs = { background: "var(--bg-primary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" };

  const Btn = ({ onClick, title, children, testid }) => (
    <button type="button" data-testid={testid} title={title} onClick={onClick} className={btnCls} style={fs}
      onMouseDown={(e) => e.preventDefault()}>
      {children}
    </button>
  );

  return (
    <div className="border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }} data-testid="rte">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b" style={{ borderColor: "var(--border-c)", background: "var(--bg-secondary)" }}>
        <Btn testid="rte-bold" title="Gras" onClick={() => exec("bold")}><b>G</b></Btn>
        <Btn testid="rte-italic" title="Italique" onClick={() => exec("italic")}><i>I</i></Btn>
        <Btn testid="rte-underline" title="Souligné" onClick={() => exec("underline")}><u>S</u></Btn>
        <span className="w-px h-6 mx-1" style={{ background: "var(--border-c)" }} />
        <Btn testid="rte-h2" title="Titre" onClick={() => block("H2")}>T</Btn>
        <Btn testid="rte-h3" title="Sous-titre" onClick={() => block("H3")}>t</Btn>
        <Btn testid="rte-quote" title="Citation" onClick={() => block("BLOCKQUOTE")}>❝</Btn>
        <Btn testid="rte-p" title="Paragraphe normal" onClick={() => block("P")}><IoText size={16} /></Btn>
        <span className="w-px h-6 mx-1" style={{ background: "var(--border-c)" }} />
        <Btn testid="rte-left" title="Aligner à gauche" onClick={() => exec("justifyLeft")}>⇤</Btn>
        <Btn testid="rte-center" title="Centrer" onClick={() => exec("justifyCenter")}>≡</Btn>
        <Btn testid="rte-hr" title="Séparateur" onClick={() => exec("insertHorizontalRule")}><IoRemoveOutline size={16} /></Btn>
        <span className="w-px h-6 mx-1" style={{ background: "var(--border-c)" }} />
        <div className="relative">
          <Btn testid="rte-color" title="Couleur du texte" onClick={() => setColorOpen((v) => !v)}><IoColorPaletteOutline size={16} /></Btn>
          {colorOpen && (
            <div className="absolute z-10 mt-1 p-2 border flex flex-wrap gap-1.5 w-40" style={{ ...fs, background: "var(--bg-secondary)" }} data-testid="rte-color-menu">
              {COLORS.map((c) => (
                <button key={c} type="button" data-testid={`rte-color-${c}`} onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { exec("foreColor", c); setColorOpen(false); }}
                  className="w-6 h-6 border" style={{ background: c, borderColor: "rgba(255,255,255,0.2)", borderRadius: "var(--radius-base)" }} />
              ))}
            </div>
          )}
        </div>
        <Btn testid="rte-clear" title="Effacer le format" onClick={() => exec("removeFormat")}>⌫</Btn>

        {creationId && (
          <>
            <span className="w-px h-6 mx-1" style={{ background: "var(--border-c)" }} />
            <Btn testid="rte-image" title="Insérer une image ici" onClick={() => { saveSel(); imgInputRef.current?.click(); }}>
              <IoImageOutline size={16} />
            </Btn>
            <input ref={imgInputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; onPickImage(f); }} />
            <div className="relative">
              <Btn testid="rte-music" title="Insérer un repère musique ici" onClick={openMusic}>
                <IoMusicalNotes size={16} />
              </Btn>
              {musicOpen && (
                <div className="absolute z-20 mt-1 right-0 p-3 border w-64" style={{ ...fs, background: "var(--bg-secondary)" }} data-testid="rte-music-menu" onMouseDown={(e) => e.preventDefault()}>
                  <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>Repère musique (le lecteur le lance à la main)</p>
                  <input value={cueTitle} onChange={(e) => setCueTitle(e.target.value)} placeholder="Titre affiché (ex : Thème de bataille)"
                    className="w-full px-2 py-1.5 border outline-none text-sm mb-2" style={fs} data-testid="rte-cue-title" />
                  {audioAssets.length > 0 && (
                    <div className="mb-2 max-h-28 overflow-y-auto flex flex-col gap-1">
                      <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Réutiliser une piste :</p>
                      {audioAssets.map((a) => (
                        <button key={a.id} type="button" data-testid={`rte-cue-existing-${a.id}`} onClick={() => insertCue(assetUrl(a.id), cueTitle || a.name)}
                          className="text-left text-xs px-2 py-1.5 border truncate" style={fs}>♪ {a.name}</button>
                      ))}
                    </div>
                  )}
                  <button type="button" data-testid="rte-cue-upload" disabled={busy} onClick={() => audioInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-2 py-2 border text-xs" style={{ ...fs, opacity: busy ? 0.6 : 1 }}>
                    <IoCloudUploadOutline /> {busy ? "Envoi…" : "Uploader une piste (max 12 Mo)"}
                  </button>
                  <input ref={audioInputRef} type="file" accept="audio/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; onUploadCue(f); }} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div
        ref={ref}
        data-testid="rte-area"
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onKeyUp={saveSel}
        onMouseUp={saveSel}
        onPaste={onPaste}
        data-placeholder={placeholder}
        className="rte-area px-3 py-3 outline-none text-sm min-h-[140px] max-h-[340px] overflow-y-auto"
        style={{ color: "var(--text-primary)" }}
      />
    </div>
  );
}
