import { useEffect, useMemo, useState } from "react";
import { IoClose, IoPrintOutline, IoPlay, IoChevronBack, IoChevronForward, IoDownloadOutline, IoLinkOutline } from "react-icons/io5";
import { toast } from "sonner";
import { imgSrc, atelierApi } from "@/lib/atelier";
import { styleOf, styleVars, varsCss, sections, DOC_CSS, DOC_FORMATS, docFonts } from "@/lib/docStyles";

const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Rendu HTML d'un document selon son format (partagé entre l'aperçu et le PDF)
export function renderDoc(it, eyebrow, format) {
  const img = it.image ? imgSrc(it.image) : "";
  const cover = (cls = "dz-cover") => `<header class="${cls}${img ? " img" : ""}" style="${img ? `background-image:url('${esc(img)}')` : ""}"><div class="dz-eye">${esc(eyebrow)}</div><h1 class="dz-title">${esc(it.title || "Sans titre")}</h1></header>`;
  const secs = sections(it.content || "");
  if (format === "slides") return `<div class="dz-slides">${cover("dz-slide cover dz-cover")}${secs.map((s, i) => `<section class="dz-slide">${s.title ? `<h2>${esc(s.title)}</h2>` : ""}<div class="dz-sb">${s.html}</div><span class="dz-num">${String(i + 2).padStart(2, "0")}</span></section>`).join("")}</div>`;
  if (format === "mood") {
    const tiles = secs.flatMap((s) => {
      const d = new DOMParser().parseFromString(s.html, "text/html");
      const pics = [...d.images].map((im) => `<div class="dz-tile pic"><img src="${esc(im.getAttribute("src"))}"/></div>`);
      d.querySelectorAll("img").forEach((x) => x.remove());
      const txt = d.body.innerHTML.replace(/<p>\s*<\/p>/g, "").trim();
      return [s.title && `<div class="dz-tile ttl"><h2>${esc(s.title)}</h2></div>`, ...pics, txt && `<div class="dz-tile">${txt}</div>`].filter(Boolean);
    });
    return `<div class="dz-mood"><div class="dz-tile ttl"><div class="dz-eye">${esc(eyebrow)}</div><h1 class="dz-title">${esc(it.title || "Sans titre")}</h1></div>${img ? `<div class="dz-tile pic"><img src="${esc(img)}"/></div>` : ""}${tiles.join("")}</div>`;
  }
  return `${cover()}<div class="dz-body">${it.content || ""}</div>`;
}

const PRINT = { a4: "@page{size:A4;margin:0}", web: "@page{size:A4;margin:0}", slides: "@page{size:297mm 167mm;margin:0}.dz-slides{gap:0}.dz-slide{width:297mm;height:167mm;aspect-ratio:auto;border-radius:0;box-shadow:none;page-break-after:always}", mood: "@page{size:A4 landscape;margin:8mm}" };

export function printStyled(it, eyebrow, styleKey, format) {
  const s = styleOf(styleKey);
  const vars = s.bg ? varsCss(s) : ["--bg-secondary", "--text-primary", "--brand", "--brand-2", "--text-secondary", "--font-display", "--font-body"].map((k, i) => `${["--dz-bg", "--dz-ink", "--dz-ac", "--dz-ac2", "--dz-mu", "--dz-ft", "--dz-fb"][i]}:${getComputedStyle(document.documentElement).getPropertyValue(k)}`).join(";");
  const w = window.open("", "_blank");
  if (!w) return toast.error("Autorise les fenêtres pour exporter en PDF");
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(it.title)}</title><link rel="stylesheet" href="${docFonts()}"><style>${DOC_CSS}${PRINT[format] || ""}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;background:var(--dz-bg)}.f-a4{box-shadow:none;max-width:none}.sx-music-cue{display:none}</style></head><body><div class="dz f-${format}" data-deco="${s.deco || ""}" style="${vars}">${renderDoc(it, eyebrow, format)}</div></body></html>`);
  w.document.close(); setTimeout(() => w.print(), 1200);
}

export default function DocView({ it, eyebrow, onClose, shared }) {
  const doc = it.fields?.doc || {};
  const [link, setLink] = useState(it.share_token || "");
  const url = link && `${window.location.origin}/d/${link}`;
  const share = async () => { try { const { token } = await atelierApi.share(it.id); setLink(token); await navigator.clipboard?.writeText(`${window.location.origin}/d/${token}`).catch(() => {}); toast.success("Lien copié : toute personne qui l'a peut lire ce document"); } catch (_) { toast.error("Partage impossible"); } };
  const unshare = async () => { await atelierApi.unshare(it.id).catch(() => {}); setLink(""); toast("Lien coupé"); };
  const [format, setFormat] = useState(doc.format || "a4");
  const [show, setShow] = useState(-1);
  const s = styleOf(doc.style);
  const html = useMemo(() => renderDoc(it, eyebrow, format), [it, eyebrow, format]);
  const slides = useMemo(() => (format === "slides" ? html.match(/<(header|section) class="dz-slide[\s\S]*?<\/(header|section)>/g) || [] : []), [html, format]);
  useEffect(() => {
    if (show < 0) return;
    const on = (e) => { if (e.key === "ArrowRight" || e.key === " ") setShow((i) => Math.min(slides.length - 1, i + 1)); if (e.key === "ArrowLeft") setShow((i) => Math.max(0, i - 1)); if (e.key === "Escape") setShow(-1); };
    window.addEventListener("keydown", on); return () => window.removeEventListener("keydown", on);
  }, [show, slides.length]);
  const pptx = async () => { try { await atelierApi.downloadPptx(it.id, it.title, s); } catch (_) { toast.error("Export PowerPoint impossible"); } };
  return (
    <div className="dv-root" data-testid="doc-view">
      <link rel="stylesheet" href={docFonts()} /><style>{DOC_CSS}</style>
      <div className="dv-bar">
        <div className="dv-seg">{DOC_FORMATS.map(([k, l]) => <button key={k} className={format === k ? "on" : ""} onClick={() => setFormat(k)} data-testid={`doc-view-format-${k}`}>{l}</button>)}</div>
        <span className="grow" />
        {format === "slides" && <button className="at-btn" onClick={() => { setShow(0); document.documentElement.requestFullscreen?.().catch(() => {}); }} data-testid="doc-view-present"><IoPlay size={15} /> Présenter</button>}
        <button className="at-btn ghost" onClick={() => printStyled(it, eyebrow, doc.style, format)} data-testid="doc-view-pdf"><IoPrintOutline size={15} /> PDF</button>
        {!shared && <>
          <button className="at-btn ghost" onClick={pptx} data-testid="doc-view-pptx"><IoDownloadOutline size={15} /> PPTX</button>
          <button className="at-btn ghost" onClick={() => atelierApi.downloadDocx(it.id, it.title).catch(() => toast.error("Export Word impossible"))} data-testid="doc-view-docx">W</button>
          {link ? <>
            <button className="at-btn" onClick={() => { navigator.clipboard?.writeText(url); toast.success("Lien copié"); }} title={url} data-testid="doc-view-copy-link"><IoLinkOutline size={15} /> Copier le lien</button>
            <button className="at-btn ghost" onClick={unshare} data-testid="doc-view-unshare">Couper le lien</button>
          </> : <button className="at-btn ghost" onClick={share} data-testid="doc-view-share"><IoLinkOutline size={15} /> Partager</button>}
        </>}
        {onClose && <button className="at-icon" onClick={onClose} data-testid="doc-view-close"><IoClose size={20} /></button>}
      </div>
      <div className="dv-scroll"><div className={"dz f-" + format} data-deco={s.deco || ""} style={styleVars(s)} dangerouslySetInnerHTML={{ __html: html }} /></div>
      {show >= 0 && slides[show] && (
        <div className="dv-present" onClick={() => setShow((i) => Math.min(slides.length - 1, i + 1))}>
          <div className={"dz f-slides"} data-deco={s.deco || ""} style={styleVars(s)} dangerouslySetInnerHTML={{ __html: slides[show] }} />
          <div className="dv-pnav" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShow(Math.max(0, show - 1))}><IoChevronBack /></button><span>{show + 1} / {slides.length}</span><button onClick={() => setShow(Math.min(slides.length - 1, show + 1))}><IoChevronForward /></button><button onClick={() => { setShow(-1); document.exitFullscreen?.().catch(() => {}); }}><IoClose /></button>
          </div>
        </div>
      )}
    </div>
  );
}
