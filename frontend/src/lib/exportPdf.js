// Export PDF — impression stylée, sans dépendance (le navigateur fait « Enregistrer en PDF »).
// Rend un document propre (manuscrit) dans une iframe cachée et lance l'impression.
import { KINDS, KIND_FIELDS, imgSrc, oeuvreFmt } from "@/lib/atelier";

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const CSS = `
@page{margin:2.2cm}
*{box-sizing:border-box}
body{font-family:Georgia,'Times New Roman',serif;color:#141414;line-height:1.62;font-size:12pt;margin:0}
.eyebrow{font-family:Arial,Helvetica,sans-serif;font-size:8.5pt;letter-spacing:.18em;text-transform:uppercase;color:#8a8a8a;margin-bottom:.2em}
h1{font-size:28pt;margin:.05em 0 .15em;line-height:1.08}
h2{font-size:15pt;margin:1.5em 0 .5em;border-bottom:1px solid #ddd;padding-bottom:.25em;font-variant:small-caps;letter-spacing:.02em}
h3{font-size:13pt;margin:1.1em 0 .25em}
.meta{font-family:Arial,sans-serif;font-size:9pt;color:#999;margin-bottom:1.4em}
.synopsis{font-size:12.5pt;color:#333}
.item{page-break-inside:avoid;margin:0 0 1.5em;padding-bottom:.4em}
.fields{margin:.3em 0}
.fields dt{font-family:Arial,sans-serif;font-size:8pt;letter-spacing:.12em;text-transform:uppercase;color:#aaa;margin-top:.5em}
.fields dd{margin:0}
img{max-width:100%;border-radius:4px;margin:.5em 0}
.cover{width:100%;max-height:8.5cm;object-fit:cover;border-radius:6px;margin:.3em 0 1em}
blockquote{border-left:3px solid #ddd;margin:.6em 0;padding-left:1em;color:#444;font-style:italic}
a{color:#141414}
section.grp{page-break-before:always}
footer{margin-top:2.4em;padding-top:1em;border-top:1px solid #eee;font-family:Arial,sans-serif;font-size:8pt;color:#b3b3b3;text-align:center}
`;

function printDoc(title, body) {
  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0", opacity: "0" });
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}</style></head><body>${body}</body></html>`);
  doc.close();
  const done = () => { try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch (_) {} setTimeout(() => iframe.remove(), 1500); };
  const imgs = doc.images || [];
  if (!imgs.length) { setTimeout(done, 250); return; }
  let pending = imgs.length, fired = false;
  const go = () => { if (--pending <= 0 && !fired) { fired = true; done(); } };
  for (const im of imgs) { if (im.complete) go(); else { im.onload = go; im.onerror = go; } }
  setTimeout(() => { if (!fired) { fired = true; done(); } }, 2600);
}

function renderItem(it, universes, top) {
  const u = universes.find((x) => x.id === it.universe_id);
  const k = KINDS[it.kind];
  const bits = [k?.label, u?.name, it.date].filter(Boolean).map(esc).join(" · ");
  let h = `<div class="item">`;
  if (bits) h += `<div class="eyebrow">${bits}</div>`;
  h += top ? `<h1>${esc(it.title || "Sans titre")}</h1>` : `<h3>${esc(it.title || "Sans titre")}</h3>`;
  if (it.image) h += `<img class="cover" src="${esc(imgSrc(it.image))}" alt="">`;
  const kf = KIND_FIELDS[it.kind];
  if (kf && it.fields) {
    const rows = kf.filter(([key]) => it.fields[key]);
    if (rows.length) h += `<dl class="fields">${rows.map(([key, label]) => `<dt>${esc(label)}</dt><dd>${esc(it.fields[key])}</dd>`).join("")}</dl>`;
  }
  if (it.content) h += `<div class="body">${it.content}</div>`;
  h += `</div>`;
  return h;
}

const footer = () => `<footer>STATION NEXUS · Atelier · exporté le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</footer>`;

// Un seul élément
export function exportItem(it, universes = []) {
  printDoc(it.title || "Élément", `<article>${renderItem(it, universes, true)}</article>${footer()}`);
}

// Une œuvre entière : synopsis + éléments groupés par type
const GROUP_ORDER = ["document", "scene", "character", "place", "lore", "event", "note", "inspiration", "file"];
export function exportOeuvre(o, elements = [], universe) {
  const fmt = oeuvreFmt(o);
  const universes = universe ? [universe] : [];
  let h = `<header><div class="eyebrow">Œuvre · ${esc(fmt.label)}${universe ? " · " + esc(universe.name) : ""}</div>`;
  h += `<h1>${esc(o.title || "Œuvre sans titre")}</h1>`;
  h += `<div class="meta">${elements.length} élément${elements.length > 1 ? "s" : ""} · ${esc(o.fields?.status || "en cours")}</div>`;
  if (o.content) h += `<div class="synopsis">${o.content}</div>`;
  h += `</header>`;
  for (const g of GROUP_ORDER) {
    const list = elements.filter((e) => e.kind === g);
    if (!list.length) continue;
    h += `<section class="grp"><h2>${esc(KINDS[g]?.plural || g)}</h2>${list.map((e) => renderItem(e, universes, false)).join("")}</section>`;
  }
  printDoc(o.title || "Œuvre", h + footer());
}

// La « bible » d'un univers : tous les éléments de l'univers, groupés
export function exportUniverseBible(u, elements = []) {
  let h = `<header><div class="eyebrow">Bible d'univers</div><h1>${esc(u.name)}</h1>`;
  if (u.description) h += `<div class="synopsis">${esc(u.description)}</div>`;
  h += `</header>`;
  for (const g of GROUP_ORDER) {
    const list = elements.filter((e) => e.kind === g);
    if (!list.length) continue;
    h += `<section class="grp"><h2>${esc(KINDS[g]?.plural || g)}</h2>${list.map((e) => renderItem(e, [u], false)).join("")}</section>`;
  }
  printDoc("Bible · " + (u.name || "Univers"), h + footer());
}
