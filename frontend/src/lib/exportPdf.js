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

// Livre d'Alexandrie : page de titre, sommaire, chapitres, citations, encadrés, illustrations, liens.
const BOOK_CSS = `
.bk-title{page-break-after:always;text-align:center;padding-top:2.2cm}
.bk-title img{max-height:11cm;max-width:8cm;box-shadow:0 6px 18px rgba(0,0,0,.25);border-radius:2px}
.bk-title h1{font-size:34pt;margin:.6em 0 .1em}
.bk-sub{font-style:italic;font-size:15pt;color:#555;margin:0 0 1.2em}
.bk-about{max-width:13cm;margin:1.2em auto;color:#333}
.bk-toc{page-break-after:always}
.bk-toc ol{padding-left:1.2em}.bk-toc li{margin:.25em 0}
.bk-ch{page-break-before:always}
.bk-ch h2{font-size:20pt;border:0;font-variant:normal;margin-top:0}
.bk-ch .num{font-family:Arial,sans-serif;font-size:8pt;letter-spacing:.2em;color:#999}
.bk-ch p{margin:0;text-indent:1.4em;text-align:justify}
.bk-ch p.first{text-indent:0}
.bk-ch h3{margin:1.2em 0 .4em}
blockquote p{text-indent:0!important}
blockquote cite{display:block;font-style:normal;font-family:Arial,sans-serif;font-size:7.5pt;letter-spacing:.12em;text-transform:uppercase;color:#999;margin-top:.3em}
.bk-box{border:1px solid #ddd;background:#f7f4ee;padding:.7em 1em;margin:1em 0;page-break-inside:avoid}
.bk-box b{display:block;font-family:Arial,sans-serif;font-size:7.5pt;letter-spacing:.16em;color:#8a6d3b;margin-bottom:.3em}
.bk-box p{text-indent:0}
figure{margin:1.2em 0;text-align:center;page-break-inside:avoid}
figure img{max-height:12cm;max-width:100%}
figcaption{font-style:italic;font-size:10pt;color:#555}
figcaption small{display:block;font-style:normal;font-family:Arial,sans-serif;font-size:7pt;letter-spacing:.12em;color:#999;text-transform:uppercase}
.bk-links li{margin:.5em 0}.bk-links small{display:block;color:#666}
`;
const bkInline = (s) => esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");
export function exportBook(book, cover, notes = []) {
  let h = `<style>${BOOK_CSS}</style><section class="bk-title">`;
  if (cover) h += `<img src="${esc(cover)}" alt="">`;
  h += `<div class="eyebrow">Bibliothèque d'Alexandrie · ${esc(book.cote || "")}</div><h1>${esc(book.title)}</h1>`;
  if (book.sub) h += `<p class="bk-sub">${esc(book.sub)}</p>`;
  if (book.about) h += `<p class="bk-about">${esc(book.about)}</p>`;
  h += `</section>`;
  const chs = (book.chapters || []).filter((c) => c.title);
  if (chs.length > 2) h += `<section class="bk-toc"><h2>Sommaire</h2><ol>${chs.map((c) => `<li>${esc(c.title)}</li>`).join("")}${(book.links || []).length ? "<li>Pour aller plus loin</li>" : ""}</ol></section>`;
  (book.chapters || []).forEach((c, i) => {
    h += `<section class="bk-ch">`;
    if (c.title) h += `<div class="num">${String(i + 1).padStart(2, "0")}</div><h2>${esc(c.title)}</h2>`;
    c.blocks.forEach((b, j) => {
      if (b.t === "q") h += `<blockquote><p>${bkInline(b.x)}</p>${b.by ? `<cite>${esc(b.by)}</cite>` : ""}</blockquote>`;
      else if (b.t === "h") h += `<h3>${bkInline(b.x)}</h3>`;
      else if (b.t === "box") h += `<div class="bk-box"><b>${esc(b.label || "À RETENIR")}</b><p>${bkInline(b.x)}</p></div>`;
      else if (b.t === "img") h += `<figure><img src="${esc(b.src)}" alt="" onerror="this.parentNode.remove()">${b.cap || b.credit ? `<figcaption>${b.cap ? bkInline(b.cap) : ""}${b.credit ? `<small>${esc(b.credit)}</small>` : ""}</figcaption>` : ""}</figure>`;
      else if (b.t === "yt") h += `<figure><img src="https://i.ytimg.com/vi/${esc(b.id)}/hqdefault.jpg" alt="" style="max-height:6cm" onerror="this.remove()"><figcaption>${b.cap ? bkInline(b.cap) : "Vidéo"}<small>youtube.com/watch?v=${esc(b.id)}</small></figcaption></figure>`;
      else h += `<p${j === 0 && c.title ? ' class="first"' : ""}>${bkInline(b.x)}</p>`;
    });
    h += `</section>`;
  });
  if ((book.links || []).length) h += `<section class="bk-ch"><h2>Pour aller plus loin</h2><ul class="bk-links">${book.links.map((l) => `<li>${l.url ? `<a href="${esc(l.url)}">${esc(l.label)}</a>` : esc(l.label)}${l.note ? `<small>${esc(l.note)}</small>` : ""}</li>`).join("")}</ul></section>`;
  if (notes.length) h += `<section class="bk-ch"><h2>Mes notes</h2><ul class="bk-links">${notes.map((n) => `<li><b>Page ${n.page + 1}${n.ch ? ` · ${esc(n.ch)}` : ""}</b><small>${esc(n.t).replace(/\n/g, "<br>")}</small></li>`).join("")}</ul></section>`;
  h += `<footer>Atelier Nexus · Alexandrie</footer>`;
  printDoc(book.title, h);
}
