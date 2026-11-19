import { getCreationFull, updateCreation, createJournalEntry, updateJournalEntry, getJournalEntry } from "@/lib/api";

/*
  La passerelle Atelier → Station.
  Un élément de l'atelier (document, scène, note…) part sur la station comme chapitre d'une création ou comme entrée du journal.
  Ce qu'il est devenu reste noté sur l'élément (fields.published) : republier met à jour au même endroit au lieu de dupliquer.
  Les images de l'atelier ont des adresses publiques (/api/atelier-files/…) : elles s'affichent telles quelles sur la station.
*/

// ---- HTML de l'atelier → blocs du journal (titres, paragraphes, listes, images, citations, YouTube, musiques)
const ytId = (u = "") => (u.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/) || [])[1];
function inlineMd(node) {
  let s = "";
  node.childNodes.forEach((n) => {
    if (n.nodeType === 3) { s += n.textContent; return; }
    if (n.nodeType !== 1) return;
    const t = n.tagName;
    if (t === "BR") s += "\n";
    else if (t === "STRONG" || t === "B") { const x = inlineMd(n); s += x.trim() ? `**${x}**` : x; }
    else if (t === "EM" || t === "I") { const x = inlineMd(n); s += x.trim() ? `*${x}*` : x; }
    else if (t === "IMG" || (n.classList?.contains("sx-music-cue"))) { /* traité à part */ }
    else s += inlineMd(n);
  });
  return s.replace(/ /g, " ");
}
export function htmlToBlocks(html = "") {
  const root = new DOMParser().parseFromString(`<div id="r">${html}</div>`, "text/html").getElementById("r");
  const out = []; let buf = [];
  const flush = () => { const t = buf.join("\n\n").trim(); if (t) out.push({ type: "text", text: t }); buf = []; };
  const pushText = (t) => { t = (t || "").replace(/[ \t]+\n/g, "\n").trim(); if (t) buf.push(t); };
  const media = (el) => {
    // ce qu'un paragraphe porte en plus du texte : vidéo YouTube, image, musique
    el.querySelectorAll("a.sx-yt, img, .sx-music-cue").forEach((m) => {
      if (m.matches("a.sx-yt")) { flush(); out.push({ type: "youtube", url: m.getAttribute("href") }); return; }
      if (m.tagName === "IMG") { if (m.closest("a.sx-yt")) return; const src = m.getAttribute("src"); if (src) { flush(); out.push({ type: "image", url: src, caption: m.getAttribute("alt") || "" }); } return; }
      const url = m.getAttribute("data-track"); if (url) { flush(); out.push({ type: "music", url, caption: m.getAttribute("data-title") || m.textContent.trim() }); }
    });
  };
  const walk = (parent) => {
    parent.childNodes.forEach((n) => {
      if (n.nodeType === 3) { pushText(n.textContent); return; }
      if (n.nodeType !== 1) return;
      const t = n.tagName;
      if (/^H[1-6]$/.test(t)) { flush(); const x = n.textContent.trim(); if (x) out.push({ type: "heading", text: x }); return; }
      if (t === "BLOCKQUOTE") { flush(); const x = inlineMd(n).trim(); if (x) out.push({ type: "quote", text: x, author: "" }); return; }
      if (t === "UL" || t === "OL") { pushText([...n.children].filter((li) => li.tagName === "LI").map((li, i) => `${t === "OL" ? `${i + 1}.` : "•"} ${inlineMd(li).trim()}`).join("\n")); return; }
      if (t === "HR") { flush(); return; }
      if (t === "IMG") { const src = n.getAttribute("src"); if (src) { flush(); out.push({ type: "image", url: src, caption: n.getAttribute("alt") || "" }); } return; }
      if (t === "FIGURE") { const img = n.querySelector("img"); if (img?.getAttribute("src")) { flush(); out.push({ type: "image", url: img.getAttribute("src"), caption: n.querySelector("figcaption")?.textContent.trim() || img.getAttribute("alt") || "" }); } return; }
      if (t === "IFRAME") { const src = n.getAttribute("src") || ""; if (ytId(src)) { flush(); out.push({ type: "youtube", url: `https://www.youtube.com/watch?v=${ytId(src)}` }); } return; }
      if (t === "A" && n.classList.contains("sx-yt")) { media(n.parentElement === parent ? wrap(n) : n); return; }
      if (n.classList?.contains("sx-music-cue")) { const url = n.getAttribute("data-track"); if (url) { flush(); out.push({ type: "music", url, caption: n.getAttribute("data-title") || n.textContent.trim() }); } return; }
      // un bloc qui contient d'autres blocs : on descend
      if ([...n.children].some((c) => /^(P|DIV|H[1-6]|UL|OL|BLOCKQUOTE|FIGURE|SECTION|ARTICLE|PRE|TABLE)$/.test(c.tagName))) { walk(n); return; }
      // un paragraphe : son texte (gras/italique gardés), puis ce qu'il porte (images, vidéos, musiques)
      pushText(inlineMd(n)); media(n);
    });
  };
  const wrap = (el) => { const d = document.createElement("div"); d.appendChild(el.cloneNode(true)); return d; };
  walk(root); flush();
  return out.length ? out : [{ type: "text", text: "" }];
}

// ---- ce qu'un élément est devenu sur la station
// fields.published = le chapitre ; fields.published_j = l'entrée du journal (un document peut être les deux)
export const publishedOf = (it, target) => (target === "journal" ? it?.fields?.published_j : target === "chapter" ? it?.fields?.published : it?.fields?.published || it?.fields?.published_j) || null;
export const liveTag = (it) => [it?.fields?.published && `CH. ${(it.fields.published.index ?? 0) + 1}`, it?.fields?.published_j && "JOURNAL"].filter(Boolean).join(" · ");
export function publishedLabel(p, creations = []) {
  if (!p) return "";
  if (p.target === "journal") return "Publié · journal de bord";
  const c = creations.find((x) => x.id === p.creation_id);
  return `Publié · ${p.unit_word || "chapitre"}${p.index != null ? ` ${p.index + 1}` : ""}${c ? ` · ${c.title}` : ""}`;
}
export const stationUrl = (p) => (!p ? "" : p.target === "journal" ? `/journal/${p.entry_id}` : `/oeuvre/${p.creation_id}`);

// ---- depuis la station : ouvrir l'œuvre d'une création dans l'atelier (créée et reliée au besoin à l'arrivée)
export const openInAtelier = (nav, creationId) => { try { sessionStorage.setItem("nx-at-open", creationId); } catch (_) {} nav("/atelier"); };

// ---- vers un chapitre (nouveau, ou remplace celui choisi ; republier retrouve le chapitre par son identifiant)
export async function publishChapter(it, { creation_id, mode, chapter_id, title }) {
  const full = await getCreationFull(creation_id);
  const units = [...(full.chapters || [])];
  let idx = mode === "replace" ? units.findIndex((u) => u.id === chapter_id) : -1;
  const html = it.content || "";
  if (idx >= 0) units[idx] = { ...units[idx], title: title || units[idx].title, content: html, rich: true };
  else { units.push({ title: title || it.title || "Sans titre", content: html, description: "", image: "", rich: true, has_music: false }); idx = units.length - 1; }
  const saved = await updateCreation(creation_id, { ...full, chapters: units }, true);
  const ch = (saved?.chapters || [])[idx] || units[idx];
  return { target: "chapter", creation_id, chapter_id: ch.id || chapter_id || "", index: idx, unit_word: "chapitre", date: new Date().toISOString() };
}

// ---- vers le journal de bord (republier met à jour la même entrée si elle existe encore)
export async function publishJournal(it, { entry_id, title, creation_id, category_id, format, published, show_home }) {
  const blocks = htmlToBlocks(it.content || "");
  const base = { title: title || it.title || "Sans titre", subtitle: "", cover: it.image || "", blocks, creation_id: creation_id || "", category_id: category_id || "", format: format || "livre", published: !!published, show_home: !!show_home };
  let r = null;
  if (entry_id) {
    try { const old = await getJournalEntry(entry_id); const p = { ...old, ...base, date: old.date }; ["id", "created_at", "updated_at"].forEach((k) => delete p[k]); r = await updateJournalEntry(entry_id, p); }
    catch (e) { if (e?.response?.status !== 404) throw e; }
  }
  if (!r) r = await createJournalEntry({ ...base, date: new Date().toISOString().slice(0, 10) });
  return { target: "journal", entry_id: r.id, published: !!published, date: new Date().toISOString() };
}
