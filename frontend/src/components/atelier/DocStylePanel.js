import { IoClose, IoEyeOutline } from "react-icons/io5";
import { DOC_STYLES, DOC_FORMATS, styleVars, docFonts, DOC_CSS } from "@/lib/docStyles";

// Choix du format et du style du document, avec miniatures
export default function DocStylePanel({ doc, onChange, onView, onClose }) {
  const cur = doc.style || "actuel"; const fmt = doc.format || "a4";
  return (
    <div className="dsp" data-testid="doc-style-panel">
      <link rel="stylesheet" href={docFonts()} /><style>{DOC_CSS}</style>
      <div className="dsp-h"><h3>Mise en forme</h3><button onClick={onClose} aria-label="Fermer"><IoClose size={18} /></button></div>
      <p className="dsp-l mono">FORMAT</p>
      <div className="dsp-fmt">{DOC_FORMATS.map(([k, l]) => <button key={k} className={fmt === k ? "on" : ""} onClick={() => onChange({ format: k })} data-testid={`doc-format-${k}`}><i className={"ic-" + k} />{l}</button>)}</div>
      <p className="dsp-l mono">STYLE</p>
      <div className="dsp-grid">
        {DOC_STYLES.map((s) => (
          <button key={s.key} className={"dsp-card" + (cur === s.key ? " on" : "")} onClick={() => onChange({ style: s.key })} data-testid={`doc-style-${s.key}`}>
            <span className="dz dsp-mini" data-deco={s.deco || ""} style={styleVars(s)}>
              <span className="dz-eye">CHAPITRE I</span><b className="dz-title">Aa</b><i /><i /><i className="s" />
            </span>
            <span className="dsp-n">{s.name}</span>
          </button>
        ))}
      </div>
      <button className="at-btn dsp-view" onClick={onView} data-testid="doc-style-view"><IoEyeOutline size={16} /> Visualiser et exporter</button>
    </div>
  );
}
