import { getCreation, getCreationFull, updateCreation, createJournalEntry, updateJournalEntry, getJournalEntry } from "@/lib/api";

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
export const liveTag = (it) => [it?.fields?.published && `${it.fields.published.unit === "episodes" ? "ÉP." : "CH."} ${(it.fields.published.index ?? 0) + 1}${it.fields.published.release_at && new Date(it.fields.published.release_at) > new Date() ? " · PROGRAMMÉ" : ""}`, it?.fields?.published_j && "JOURNAL"].filter(Boolean).join(" · ");
export function publishedLabel(p, creations = []) {
  if (!p) return "";
  if (p.target === "journal") return "Publié · journal de bord";
  const c = creations.find((x) => x.id === p.creation_id);
  return `${p.release_at && new Date(p.release_at) > new Date() ? `Programmé ${relLabel(p.release_at)}` : "Publié"} · ${p.unit_word || "chapitre"}${p.index != null ? ` ${p.index + 1}` : ""}${c ? ` · ${c.title}` : ""}`;
}
export const stationUrl = (p) => (!p ? "" : p.target === "journal" ? `/journal/${p.entry_id}` : `/oeuvre/${p.creation_id}`);

// ---- depuis la station : ouvrir l'œuvre d'une création dans l'atelier (créée et reliée au besoin à l'arrivée)
export const openInAtelier = (nav, creationId) => { try { sessionStorage.setItem("nx-at-open", creationId); } catch (_) {} nav("/atelier"); };

// ---- sorties programmées
export const relLabel = (iso) => { try { return new Date(iso).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch { return iso; } };
export const isScheduled = (u) => !!u?.release_at && new Date(u.release_at) > new Date();
// le prochain dimanche à 18 h (heure locale), au format attendu par <input type="datetime-local">
export function nextSunday(h = 18) { const d = new Date(); d.setHours(h, 0, 0, 0); const add = (7 - d.getDay()) % 7 || (new Date().getHours() >= h ? 7 : 0); d.setDate(d.getDate() + add); const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:00`; }
export const localToIso = (v) => (v ? new Date(v).toISOString() : "");

// ---- empreintes : savoir ce qui a bougé depuis la publication, côté atelier (le brouillon) et côté station (en ligne)
export const hashOf = (v) => { const t = typeof v === "string" ? v.replace(/\s+/g, " ").trim() : JSON.stringify(v || ""); let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
const nowIso = () => new Date().toISOString();
// un épisode se reconnaît à sa vidéo et à son résumé ; un chapitre à son texte
const remoteOfChapter = (ch, unit) => (unit === "episodes" ? hashOf(`${ch?.url || ""}|${ch?.description || ""}`) : hashOf(ch?.content || ""));
const plain = (html = "") => { const d = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html"); return (d.body.textContent || "").replace(/\s+/g, " ").trim(); };
// la vidéo d'un élément de l'atelier : un lien YouTube ou une vidéo déposée, sinon le premier lien YouTube du texte
export function videoOf(it) {
  const m = (it?.media || []).find((x) => x.type === "youtube" || x.type === "video"); if (m) return m.url;
  const html = it?.content || ""; const a = html.match(/href="([^"]*(?:youtube\.com|youtu\.be)[^"]*)"/); if (a) return a[1];
  const t = html.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}[^\s"<]*/); return t ? t[0] : "";
}
const epSig = (it) => `${videoOf(it)}|${plain(it?.content || "").slice(0, 400)}`;
const localSig = (it, p) => (p?.unit === "episodes" ? epSig(it) : it.content || "");
const remoteOfEntry = (e) => hashOf((e?.blocks || []).map((b) => ({ t: b.type, x: b.text || "", u: b.url || "", c: b.caption || "" })));

// l'état d'une publication : "ok" à jour, "local" modifié dans l'atelier, "remote" modifié en ligne, "both", "gone" disparu en ligne, "?" inconnu
export function syncState(it, p, remote) {
  if (!p) return "none";
  if (remote === null) return "gone";
  if (remote === undefined || !p.local_hash) return "?";
  const loc = hashOf(localSig(it, p)) !== p.local_hash;
  const rem = (p.target === "journal" ? remoteOfEntry(remote) : remoteOfChapter(remote, p.unit)) !== p.remote_hash;
  return loc && rem ? "both" : loc ? "local" : rem ? "remote" : "ok";
}
export const SYNC_LABEL = { ok: "À jour", local: "Modifié dans l'atelier", remote: "Modifié en ligne", both: "Modifié des deux côtés", gone: "Supprimé en ligne", "?": "En ligne", none: "" };

// ce qui est en ligne pour une publication (null = n'existe plus)
export async function fetchRemote(p) {
  if (!p) return null;
  if (p.target === "journal") { try { return await getJournalEntry(p.entry_id); } catch (e) { if (e?.response?.status === 404) return null; throw e; } }
  const c = await getCreation(p.creation_id); return (c?.[p.unit || "chapters"] || []).find((x) => x.id === p.chapter_id) || null;
}

// la version en ligne, ramenée dans le brouillon (HTML pour l'atelier)
const esc = (t = "") => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const mdInline = (t = "") => esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/\n/g, "<br>");
export function blocksToHtml(blocks = []) {
  return blocks.map((b) => {
    if (b.type === "heading") return `<h2>${esc(b.text || "")}</h2>`;
    if (b.type === "quote") return `<blockquote>${mdInline(b.text || "")}${b.author ? `<br>— ${esc(b.author)}` : ""}</blockquote>`;
    if (b.type === "image") return `<p><img src="${esc(b.url || "")}" alt="${esc(b.caption || "")}" class="sx-rich-img"></p>`;
    if (b.type === "gallery") return (b.urls || []).map((u) => `<p><img src="${esc(u)}" class="sx-rich-img"></p>`).join("");
    if (b.type === "youtube") return `<p><a class="sx-yt" href="${esc(b.url || "")}">${esc(b.url || "")}</a></p>`;
    if (b.type === "music") return `<p><span class="sx-music-cue" data-track="${esc(b.url || "")}" data-title="${esc(b.caption || "")}">${esc(b.caption || "Musique")}</span></p>`;
    return (b.text || "").split(/\n{2,}/).map((para) => `<p>${mdInline(para)}</p>`).join("");
  }).join("");
}
export const chapterHtml = (ch) => (!ch ? "" : ch.rich ? ch.content || "" : String(ch.content || "").split(/\n{2,}/).map((x) => `<p>${mdInline(x)}</p>`).join(""));
export async function pullRemote(at, it, p) {
  if (p.unit === "episodes") throw new Error("episode");
  const r = await fetchRemote(p); if (!r) throw new Error("gone");
  const html = p.target === "journal" ? blocksToHtml(r.blocks || []) : chapterHtml(r);
  const key = p.target === "journal" ? "published_j" : "published";
  const np = { ...p, local_hash: hashOf(html), remote_hash: p.target === "journal" ? remoteOfEntry(r) : remoteOfChapter(r, p.unit), date: nowIso() };
  return at.saveItem({ ...it, content: html, fields: { ...(it.fields || {}), [key]: np } });
}

// ---- vers un chapitre (nouveau, ou remplace celui choisi ; republier retrouve le chapitre par son identifiant)
export async function publishChapter(it, { creation_id, mode, chapter_id, title, unit = "chapters", release_at }) {
  const full = await getCreationFull(creation_id);
  const units = [...(full[unit] || [])];
  let idx = mode === "replace" ? units.findIndex((u) => u.id === chapter_id) : -1;
  const rel = release_at === undefined ? {} : { release_at: release_at || "" };
  let body;
  if (unit === "episodes") {
    const url = videoOf(it); const desc = plain(it.content || "").replace(/https?:\/\/\S+/g, "").trim().slice(0, 600);
    const yid = (url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/) || [])[1];
    body = { url, description: desc, image: it.image || (yid ? `https://i.ytimg.com/vi/${yid}/hqdefault.jpg` : ""), content: "", rich: false };
  } else body = { content: it.content || "", rich: true };
  if (idx >= 0) units[idx] = { ...units[idx], title: title || units[idx].title, ...body, ...rel };
  else { units.push({ title: title || it.title || "Sans titre", description: "", image: "", has_music: false, ...body, ...rel }); idx = units.length - 1; }
  const saved = await updateCreation(creation_id, { ...full, [unit]: units }, true);
  const ch = (saved?.[unit] || [])[idx] || units[idx];
  return { target: "chapter", unit, creation_id, chapter_id: ch.id || chapter_id || "", index: idx, unit_word: unit === "episodes" ? "épisode" : "chapitre", title: ch.title, release_at: ch.release_at || "", date: nowIso(), local_hash: hashOf(unit === "episodes" ? epSig(it) : it.content || ""), remote_hash: remoteOfChapter(ch, unit) };
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
  return { target: "journal", entry_id: r.id || entry_id, title: base.title, creation_id: base.creation_id, category_id: base.category_id, format: base.format, published: base.published, show_home: base.show_home, date: nowIso(), local_hash: hashOf(it.content || ""), remote_hash: remoteOfEntry(r.blocks ? r : base) };
}

// ---- republier en un geste, avec les mêmes réglages qu'à la dernière fois
export async function republish(at, it, p) {
  const np = p.target === "journal"
    ? await publishJournal(it, { entry_id: p.entry_id, title: p.title || it.title, creation_id: p.creation_id, category_id: p.category_id, format: p.format, published: p.published, show_home: p.show_home })
    : await publishChapter(it, { creation_id: p.creation_id, mode: "replace", chapter_id: p.chapter_id, title: p.title || it.title, unit: p.unit || "chapters" });
  return at.saveItem({ ...it, fields: { ...(it.fields || {}), [p.target === "journal" ? "published_j" : "published"]: np } });
}

// ---- « écrit sur la station » → ramené dans l'atelier comme brouillon déjà relié (republier mettra à jour au même endroit)
export function linkFromChapter(ch, creation_id, index, unit = "chapters") {
  if (unit === "episodes") {
    const html = `${ch.url ? `<p><a class="sx-yt" href="${esc(ch.url)}">${esc(ch.url)}</a></p>` : ""}${ch.description ? `<p>${esc(ch.description)}</p>` : ""}`;
    const it = { content: html, media: [] };
    return { html, link: { target: "chapter", unit, creation_id, chapter_id: ch.id, index, unit_word: "épisode", title: ch.title, date: nowIso(), local_hash: hashOf(epSig(it)), remote_hash: remoteOfChapter(ch, unit) } };
  }
  const html = chapterHtml(ch);
  return { html, link: { target: "chapter", unit, creation_id, chapter_id: ch.id, index, unit_word: "chapitre", title: ch.title, date: nowIso(), local_hash: hashOf(html), remote_hash: remoteOfChapter(ch, unit) } };
}
export function linkFromEntry(e) {
  const html = blocksToHtml(e.blocks || []);
  return { html, link: { target: "journal", entry_id: e.id, title: e.title, creation_id: e.creation_id || "", category_id: e.category_id || "", format: e.format || "livre", published: !!e.published, show_home: !!e.show_home, date: nowIso(), local_hash: hashOf(html), remote_hash: remoteOfEntry(e) } };
}

// ---- un lot : plusieurs documents deviennent des chapitres, dans l'ordre (ceux déjà publiés dans cette création sont mis à jour sur place)
export async function publishBatch(at, items, creation_id, onStep, { unit = "chapters", release_at } = {}) {
  const done = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i]; const prev = it.fields?.published;
    const same = prev && prev.creation_id === creation_id && (prev.unit || "chapters") === unit;
    const p = await publishChapter(it, same ? { creation_id, mode: "replace", chapter_id: prev.chapter_id, title: prev.title || it.title, unit, release_at } : { creation_id, mode: "new", title: it.title, unit, release_at });
    await at.saveItem({ ...it, fields: { ...(it.fields || {}), published: p } });
    done.push(p); onStep?.(i + 1);
  }
  return done;
}
