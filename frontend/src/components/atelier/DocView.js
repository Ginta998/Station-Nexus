import { useEffect, useMemo, useRef, useState } from "react";
import { IoClose, IoPrintOutline, IoPlay, IoChevronBack, IoChevronForward, IoDownloadOutline, IoLinkOutline, IoChatbubbleOutline, IoListOutline } from "react-icons/io5";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { imgSrc, atelierApi } from "@/lib/atelier";
import { styleOf, styleVars, varsCss, sections, DOC_CSS, DOC_FORMATS, docFonts } from "@/lib/docStyles";

const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const hashId = (s) => { let h = 0; const t = String(s || "d"); for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return "dzt" + Math.abs(h).toString(36); };

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
  if (format === "drawers") {
    return `${cover()}<div class="dz-body dz-draws">${secs.map((sec, i) => sec.title
      ? `<details class="dz-draw"${i === 0 ? " open" : ""}><summary>${esc(sec.title)}</summary><div class="dz-dc">${sec.html}</div></details>`
      : `<div class="dz-dc loose">${sec.html}</div>`).join("")}</div>`;
  }
  if (format === "tabs") {
    const titled = secs.filter((sec) => sec.title);
    if (titled.length) {
      const intro = secs.filter((sec) => !sec.title).map((sec) => sec.html).join("");
      const nm = hashId(it.id || it.title);
      const ins = titled.map((sec, i) => `<input type="radio" class="dz-tabin" name="${nm}" id="${nm}${i}"${i === 0 ? " checked" : ""}>`).join("");
      const labs = titled.map((sec, i) => `<label class="dz-tablab" for="${nm}${i}">${esc(sec.title)}</label>`).join("");
      const pans = titled.map((sec) => `<section class="dz-tabpanel">${sec.html}</section>`).join("");
      return `${cover()}<div class="dz-body">${intro ? `<div class="dz-intro">${intro}</div>` : ""}<div class="dz-tabs">${ins}<div class="dz-tablist">${labs}</div><div class="dz-tabpanels">${pans}</div></div></div>`;
    }
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

const MODES = { read: "Lecture seule", comment: "Commentaires", edit: "Modification" };

function Comments({ it, shared, token }) {
  const [list, setList] = useState(it.share_comments || []);
  const [name, setName] = useState(() => localStorage.getItem("nx-guest") || "");
  const [text, setText] = useState("");
  const send = async (e) => {
    e.preventDefault(); if (!text.trim()) return;
    try { localStorage.setItem("nx-guest", name); const c = (await api.post(`/share/${token}/comments`, { name, text })).data; setList((l) => [...l, c]); setText(""); } catch (_) { toast.error("Envoi impossible"); }
  };
  const del = async (c) => { await atelierApi.delComment(it.id, c.id).catch(() => {}); setList((l) => l.filter((x) => x.id !== c.id)); };
  return (
    <aside className="dv-talk" data-testid="doc-comments">
      <h4>Commentaires</h4>
      <ol>{list.map((c) => <li key={c.id}><b>{c.name}</b><small>{new Date(c.at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</small><p>{c.text}</p>{!shared && <button onClick={() => del(c)}>Supprimer</button>}</li>)}</ol>
      {!list.length && <p className="dv-empty">Aucun commentaire.</p>}
      {shared && <form onSubmit={send}><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton prénom" data-testid="doc-comment-name" /><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Ton commentaire…" data-testid="doc-comment-text" /><button className="at-btn" type="submit" data-testid="doc-comment-send">Envoyer</button></form>}
    </aside>
  );
}

export default function DocView({ it, eyebrow, onClose, shared, token, onEdit }) {
  const doc = it.fields?.doc || {};
  const [link, setLink] = useState(it.share_token || "");
  const [mode, setMode] = useState(it.share_mode || "read");
  const [talk, setTalk] = useState(false);
  const url = link && `${window.location.origin}/d/${link}`;
  const share = async (m = mode) => { try { const { token: t } = await atelierApi.share(it.id, m); setLink(t); setMode(m); await navigator.clipboard?.writeText(`${window.location.origin}/d/${t}`).catch(() => {}); toast.success(`Lien copié · ${MODES[m]}`); } catch (_) { toast.error("Partage impossible"); } };
  const unshare = async () => { await atelierApi.unshare(it.id).catch(() => {}); setLink(""); toast("Lien coupé"); };
  const [format, setFormat] = useState(doc.format || "a4");
  const [show, setShow] = useState(-1);
  const bodyRef = useRef(null);
  const [toc, setToc] = useState([]);
  const [nav, setNav] = useState(false);
  const s = styleOf(doc.style);
  const html = useMemo(() => renderDoc(it, eyebrow, format), [it, eyebrow, format]);
  // Sommaire : on relève les chapitres (titres) pour une navigation rapide façon Google Docs.
  useEffect(() => {
    const root = bodyRef.current; if (!root) { setToc([]); return; }
    const id = setTimeout(() => {
      const heads = [...root.querySelectorAll(".dz-body h1, .dz-body h2, .dz-body h3, .dz-draw>summary, .dz-tabpanel h3")].filter((h) => (h.textContent || "").trim());
      heads.forEach((h, i) => { if (!h.id) h.id = "dzh-" + i; });
      setToc(heads.map((h) => ({ id: h.id, text: h.textContent.trim(), lvl: h.tagName === "SUMMARY" ? 2 : +h.tagName[1] })));
    }, 40);
    return () => clearTimeout(id);
  }, [html, format]);
  const jump = (hid) => { const el = bodyRef.current?.querySelector("#" + (window.CSS?.escape ? CSS.escape(hid) : hid)); if (el) { el.closest("details:not([open])")?.setAttribute("open", ""); el.scrollIntoView({ behavior: "smooth", block: "start" }); } if (window.innerWidth < 760) setNav(false); };
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
        {toc.length > 1 && <button className={"at-btn ghost" + (nav ? " on" : "")} onClick={() => setNav((v) => !v)} data-testid="doc-view-outline"><IoListOutline size={15} /> Sommaire</button>}
        <span className="grow" />
        {format === "slides" && <button className="at-btn" onClick={() => { setShow(0); document.documentElement.requestFullscreen?.().catch(() => {}); }} data-testid="doc-view-present"><IoPlay size={15} /> Présenter</button>}
        <button className="at-btn ghost" onClick={() => printStyled(it, eyebrow, doc.style, format)} data-testid="doc-view-pdf"><IoPrintOutline size={15} /> PDF</button>
        {!shared && <>
          <button className="at-btn ghost" onClick={pptx} data-testid="doc-view-pptx"><IoDownloadOutline size={15} /> PPTX</button>
          <button className="at-btn ghost" onClick={() => atelierApi.downloadDocx(it.id, it.title).catch(() => toast.error("Export Word impossible"))} data-testid="doc-view-docx">W</button>
          {link ? <>
            <select className="dv-mode" value={mode} onChange={(e) => share(e.target.value)} data-testid="doc-view-share-mode">{Object.entries(MODES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <button className="at-btn" onClick={() => { navigator.clipboard?.writeText(url); toast.success("Lien copié"); }} title={url} data-testid="doc-view-copy-link"><IoLinkOutline size={15} /> Copier le lien</button>
            <button className="at-btn ghost" onClick={unshare} data-testid="doc-view-unshare">Couper le lien</button>
          </> : <button className="at-btn ghost" onClick={() => share()} data-testid="doc-view-share"><IoLinkOutline size={15} /> Partager</button>}
        </>}
        {shared && mode === "edit" && onEdit && <button className="at-btn" onClick={onEdit} data-testid="shared-doc-edit">Modifier</button>}
        {(shared ? mode !== "read" : (it.share_comments || []).length > 0) && <button className={"at-btn ghost" + (talk ? " on" : "")} onClick={() => setTalk(!talk)} data-testid="doc-view-comments"><IoChatbubbleOutline size={15} /> {(it.share_comments || []).length || ""}</button>}
        {onClose && <button className="at-icon" onClick={onClose} data-testid="doc-view-close"><IoClose size={20} /></button>}
      </div>
      <div className="dv-scroll"><div ref={bodyRef} className={"dz f-" + format} data-deco={s.deco || ""} style={styleVars(s)} dangerouslySetInnerHTML={{ __html: html }} /></div>
      {nav && toc.length > 0 && (
        <nav className="dv-outline" data-testid="doc-outline">
          <div className="dv-ol-h"><span>Sommaire</span><button onClick={() => setNav(false)} aria-label="Fermer"><IoClose size={18} /></button></div>
          <div className="dv-ol-list">{toc.map((t, i) => <button key={t.id + i} className={"dv-ol-item l" + t.lvl} onClick={() => jump(t.id)}>{t.text}</button>)}</div>
        </nav>
      )}
      {talk && <Comments it={it} shared={shared} token={token} />}
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
