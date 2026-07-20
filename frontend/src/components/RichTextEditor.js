import { useEffect, useRef, useState } from "react";
import {
  IoText, IoRemoveOutline, IoColorPaletteOutline,
} from "react-icons/io5";

const COLORS = ["#ffffff", "var(--brand)", "#e60012", "#ff7a00", "#ffd400", "#00e5a0", "#4d8dff", "#c4b5fd", "#ff4dcb", "#9aa0a6"];

// very light sanitize: drop script/style tags and inline event handlers
function sanitize(html) {
  if (!html) return "";
  return html
    .replace(/<\/?(script|style)[^>]*>/gi, "")
    .replace(/ on\w+="[^"]*"/gi, "")
    .replace(/ on\w+='[^']*'/gi, "");
}

const btnCls = "px-2.5 py-1.5 text-sm border transition-colors";

export default function RichTextEditor({ value, onChange, placeholder = "Écris ton chapitre…" }) {
  const ref = useRef(null);
  const [colorOpen, setColorOpen] = useState(false);

  // set initial content once
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line
  }, []);

  const emit = () => { if (ref.current) onChange(sanitize(ref.current.innerHTML)); };

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
      </div>
      <div
        ref={ref}
        data-testid="rte-area"
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder={placeholder}
        className="rte-area px-3 py-3 outline-none text-sm min-h-[140px] max-h-[340px] overflow-y-auto"
        style={{ color: "var(--text-primary)" }}
      />
    </div>
  );
}
