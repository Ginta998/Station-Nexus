/*
  Les pièces d'Alexandrie partagées avec la station (face d'un livre, lecteur, rail, recherche d'artwork) :
  sans le catalogue des livres, pour que la station publique reste légère.
*/
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { playPageTurn } from "@/lib/sound";
import { createPortal } from "react-dom";
import { IoArrowBack, IoArrowForward, IoClose, IoAdd, IoBookmark, IoBookmarkOutline, IoList, IoSearch, IoStar, IoStarOutline, IoOpenOutline, IoImageOutline, IoMusicalNotes, IoPlay, IoPause, IoLogoYoutube, IoCreateOutline, IoTrashOutline, IoCloudUploadOutline, IoHeart, IoHeartOutline, IoExpandOutline, IoContractOutline, IoImagesOutline } from "react-icons/io5";
import { toast } from "sonner";
import { atelierApi } from "@/lib/atelier";
import { uploadJournalImage } from "@/lib/api";
import { DEFAULT_COVERS, mergeCovers, sgdbTerm } from "@/data/alexandrie/covers";
import { IoCheckmarkCircle, IoTimeOutline, IoClipboardOutline, IoDownloadOutline, IoPencil, IoPrintOutline, IoSwapHorizontal, IoArrowUndo, IoVolumeHighOutline, IoVolumeMuteOutline, IoGridOutline, IoLibraryOutline, IoPlaySkipForward, IoListOutline, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { lookOf, WEB_FONTS, fontHref } from "@/data/alexandrie/looks";
import { SEP, parsePaste, pasteToBook, bookToPaste, nextCote, withCote } from "@/data/alexandrie/paste";
import { Controls, Progress, Queue, thumb as ytThumb, coverOf } from "@/components/atelier/Radio";
import { pressMenu } from "@/components/atelier/ContextMenu";
import { labConfirm, labPrompt } from "@/components/atelier/LabDialog";
// le PDF ne se charge qu'au moment de l'export
export const exportBook = (...a) => import("@/lib/exportPdf").then((m) => m.exportBook(...a));
import { ROOMS, TYPES, parseBook, readingTime } from "@/data/alexandrie/meta";
import { stripHtml } from "@/lib/atelier";
import { useApp } from "@/context/AppContext";
import { playLaunch, getLaunchSound, useLaunchSync } from "@/lib/launchSound";
import "@/components/nexus/nexus.css";
import "@/components/atelier/alexandrie.css";

// ALEXANDRIE — la bibliothèque de l'Atelier. Des salles, des rayonnages, des livres qui s'ouvrent.
// Les livres de fond sont dans src/data/alexandrie ; les tiens sont des fiches de l'Atelier (fields.alexandrie).
const LS = { hideUp: "nx-alex-hide-up", prog: "nx-alex-progress", wish: "nx-alex-wish", covers: "nx-alex-covers", fav: "nx-alex-fav", view: "nx-alex-view", shelf: "nx-alex-shelf" };
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || "") ?? d; } catch (_) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
const NOEDITS = {};
const normT = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const ytId = (s = "") => (s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/) || [])[1] || (/^[\w-]{11}$/.test(s.trim()) ? s.trim() : null);
const hue = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };

// Fiche de l'Atelier → livre lisible (HTML simple découpé en chapitres sur les titres)
function itemToBook(it) {
  const a = it.fields?.alexandrie || {};
  if (a.src) { try { return pasteToBook(a.src, { id: "item:" + it.id, itemId: it.id, mine: true }); } catch (_) { /* repli plus bas */ } }
  try { return itemToBookRaw(it); } catch (_) { return { id: "item:" + it.id, itemId: it.id, mine: true, title: String(it.title || "Sans titre"), sub: "", room: "atelier", type: "recit", about: "", cote: "PERS.", chapters: [{ title: "", blocks: [{ t: "p", x: "Ce livre n'a pas pu être lu. Ouvre-le pour le corriger." }] }], words: 0, links: [] }; }
}
// Texte d'un nœud avec l'italique gardé (*mot*)
const nodeText = (n) => [...n.childNodes].map((c) => (c.nodeType === 3 ? c.textContent : /^(EM|I)$/.test(c.nodeName) ? `*${c.textContent}*` : /^(STRONG|B)$/.test(c.nodeName) ? `**${c.textContent}**` : c.nodeName === "BR" ? " " : nodeText(c))).join("").replace(/\s+/g, " ").trim();
const YT_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;
function itemToBookRaw(it) {
  const doc = new DOMParser().parseFromString(`<div>${it.content || ""}</div>`, "text/html").body.firstChild;
  const chapters = []; let cur = { title: "", blocks: [] };
  const newCh = (t) => { if (cur.blocks.length || cur.title) chapters.push(cur); cur = { title: t, blocks: [] }; };
  const nodes = [...doc.childNodes];
  nodes.forEach((n, ni) => { const c = cur, k = c.blocks.length; try { one(n, ni); } catch (_) {} c.blocks.slice(k).forEach((b) => { b.si = ni; }); if (cur !== c) cur.blocks.forEach((b) => { b.si = b.si ?? ni; }); if (cur) cur.end = ni; });
  function one(n, ni) {
    const tag = n.nodeName; const txt = (n.textContent || "").trim();
    // Une vidéo YouTube : lien seul, lien dans une phrase, adresse collée telle quelle, ou lecteur intégré.
    const fr = n.nodeType === 1 && (tag === "IFRAME" ? n : n.querySelector?.("iframe"));
    const frId = fr && (fr.getAttribute("src") || "").match(YT_RE);
    if (frId) { cur.blocks.push({ t: "yt", id: frId[1], cap: txt.replace(/^▶\s*/, "") }); return; }
    // Une musique insérée dans le texte (journal, chapitre) : un bouton dans la page, une seule musique à la fois
    const cue = n.nodeType === 1 && (n.classList?.contains("sx-music-cue") ? n : n.querySelector?.(".sx-music-cue"));
    if (cue) { cur.blocks.push({ t: "mus", url: cue.getAttribute("data-track") || "", x: cue.getAttribute("data-title") || txt || "Musique" }); return; }
    // Une galerie : chaque image devient une illustration
    if (n.nodeType === 1 && tag === "FIGURE" && (n.querySelectorAll?.("img").length || 0) > 1) { const cap = n.querySelector("figcaption")?.textContent?.trim() || ""; [...n.querySelectorAll("img")].forEach((im, k, all) => cur.blocks.push({ t: "img", src: im.getAttribute("src"), cap: k === all.length - 1 ? cap : "" })); return; }
    const img = n.nodeType === 1 && (tag === "IMG" ? n : n.querySelector?.("img"));
    if (img && (tag === "FIGURE" || tag === "IMG" || !txt)) { const [cap, credit] = (n.querySelector?.("figcaption")?.textContent || img.alt || "").split(" | ").map((x) => x.trim()); cur.blocks.push({ t: "img", src: img.getAttribute("src"), cap, credit }); return; }
    if (!txt) return;
    if (!/^H[1-4]$/.test(tag)) {
      const a = n.nodeType === 1 ? [...(n.querySelectorAll?.("a[href]") || [])].find((x) => YT_RE.test(x.getAttribute("href") || "")) : null;
      const yt = (a && (a.getAttribute("href") || "").match(YT_RE)) || txt.match(YT_RE);
      if (yt) {
        // la légende : le reste du paragraphe, sans l'adresse ni le ▶
        let cap = txt; if (a && /^https?:/.test(a.textContent.trim())) cap = cap.replace(a.textContent.trim(), " ");
        cap = cap.replace(/https?:\/\/\S+/g, " ").replace(/^[\s▶|:–-]+|[\s|:–-]+$/g, "").replace(/\s+/g, " ").trim();
        if (cap.length > 220) { cur.blocks.push({ t: "p", x: cap }); cap = ""; }
        cur.blocks.push({ t: "yt", id: yt[1], cap }); return;
      }
    }
    if (/^H[12]$/.test(tag)) { newCh(txt); return; }
    if (tag === "H3" || tag === "H4") { cur.blocks.push({ t: "h", x: nodeText(n) }); return; }
    if (tag === "BLOCKQUOTE") { const ps = [...n.querySelectorAll("p")].map(nodeText).filter(Boolean); cur.blocks.push(ps.length > 1 ? { t: "q", x: ps.slice(0, -1).join(" "), by: ps[ps.length - 1] } : { t: "q", x: nodeText(n) }); return; }
    // Une phrase toute en gras, courte : un titre de chapitre. Un début en gras suivi de « : » : un encadré.
    const strong = n.nodeType === 1 && n.querySelector?.("strong,b");
    if (strong && strong.textContent.trim() === txt && txt.length < 90) { newCh(txt.replace(/[:.]\s*$/, "")); return; }
    if (strong && txt.startsWith(strong.textContent.trim()) && /:\s*$/.test(strong.textContent.trim())) { cur.blocks.push({ t: "box", label: strong.textContent.trim().replace(/\s*:\s*$/, "").toUpperCase(), x: nodeText(n).replace(/^\*\*[^*]*\*\*\s*/, "").trim() }); return; }
    cur.blocks.push({ t: "p", x: n.nodeType === 1 ? nodeText(n) : txt });
  }
  if (cur.blocks.length || cur.title) chapters.push(cur);
  const a = it.fields?.alexandrie || {};
  return { id: "item:" + it.id, itemId: it.id, mine: true, title: String(it.title || "Sans titre"), sub: a.sub || "", room: a.room || "atelier", type: a.type || "recit", about: a.about || "", color: a.color, cote: "PERS.", chapters: chapters.length ? chapters : [{ title: "", blocks: [{ t: "p", x: "Ce livre est encore vide. Ouvre-le dans l'éditeur pour l'écrire." }] }], links: [], text: stripHtml(it.content || ""), words: stripHtml(it.content || "").split(/\s+/).filter(Boolean).length };
}
// Un texte HTML de la station (chapitre, épisode, entrée du journal) → blocs d'une page d'Alexandrie.
// Ses propres titres deviennent des intertitres : le chapitre reste un seul chapitre du livre.
export function htmlToAlexBlocks(html) {
  let chs = [];
  try { chs = itemToBookRaw({ id: "x", title: "", content: html || "" }).chapters; } catch (_) { chs = []; }
  return chs.flatMap((c, k) => [...(c.title && (k > 0 || c.blocks.length) ? [{ t: "h", x: c.title }] : []), ...c.blocks.filter((b) => !(b.t === "p" && /^Ce livre est encore vide/.test(b.x)))]);
}
// Livre de la bibliothèque → document de l'éditeur (pour le modifier avec le même éditeur que tes livres)
const hEsc = (x) => String(x || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Liens « pour aller plus loin » : sans adresse précise, on ouvre une recherche (YouTube pour la musique et les vidéos, le web sinon).
const AV = /bande originale|album|chanson|générique|playlist|musique|vidéo|chaîne|clip|\bOST\b/i;
const linkUrl = (l, title = "") => {
  if (l.url) return l.url;
  const q = l.label.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  // un libellé générique (« Les livres du jeu ») reçoit le titre du livre pour que la recherche ait du sens
  const generic = /^(les?|la|l')\s?/i.test(q) && !q.includes(",");
  const full = generic && title && !q.toLowerCase().includes(title.toLowerCase()) ? `${q} ${title}` : q;
  return (AV.test(`${l.label} ${l.note || ""}`) ? "https://www.youtube.com/results?search_query=" : "https://www.google.com/search?q=") + encodeURIComponent(full);
};
const hEm = (x) => hEsc(x).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>");
function bookToHtml(text) {
  return String(text || "").trim().split(/\n\s*\n/).map((raw) => {
    const s = raw.replace(/\s*\n\s*/g, " ").trim(); if (!s) return "";
    if (s.startsWith("# ")) return `<h2>${hEsc(s.slice(2))}</h2>`;
    if (s.startsWith("## ")) return `<h3>${hEm(s.slice(3))}</h3>`;
    if (s.startsWith("> ")) { const [x, by] = s.slice(2).split(" | "); return `<blockquote><p>${hEm(x)}</p>${by ? `<p>${hEm(by)}</p>` : ""}</blockquote>`; }
    if (s.startsWith("!! ")) { const m = s.slice(3).split(" :: "); return m.length > 1 ? `<p><strong>${hEsc(m[0])} :</strong> ${hEm(m.slice(1).join(" :: "))}</p>` : `<p><strong>À RETENIR :</strong> ${hEm(m[0])}</p>`; }
    if (s.startsWith("@img ")) { const [src, cap, credit] = s.slice(5).split(" | ").map((x) => (x || "").trim()); return `<figure><img src="${hEsc(src)}" alt="${hEsc(cap)}"><figcaption>${hEsc([cap, credit].filter(Boolean).join(" | "))}</figcaption></figure>`; }
    if (s.startsWith("@yt ")) { const [id, cap] = s.slice(4).split(" | ").map((x) => (x || "").trim()); return `<p><a href="https://www.youtube.com/watch?v=${hEsc(id)}">▶ ${hEsc(cap || "Vidéo")}</a></p>`; }
    return `<p>${hEm(s)}</p>`;
  }).join("");
}

// Changer de plage : la bande qui saute (cassette), l'onde qui part du centre (disque). Seulement transform, opacité et découpe.
const VHS_KF = [{ transform: "translate3d(-8px,0,0)", opacity: 0.2 }, { transform: "translate3d(6px,0,0)", opacity: 0.75, offset: 0.18 }, { transform: "translate3d(-3px,0,0)", opacity: 0.45, offset: 0.36 }, { transform: "translate3d(2px,0,0)", opacity: 0.9, offset: 0.62 }, { transform: "none", opacity: 1 }];
const PAPER_KF = (d) => [{ transform: `translate3d(${d * 18}px,0,0)`, opacity: 0 }, { transform: "none", opacity: 1 }];
const VINYL_KF = [{ clipPath: "circle(0% at 50% 50%)", opacity: 0.6 }, { clipPath: "circle(76% at 50% 50%)", opacity: 1 }];
// Une fiche renvoyée telle quelle au serveur : aucun champ vide (null) que le serveur refuserait.
const clean = (it) => ({ ...it, kind: it.kind || "document", title: it.title ?? "", content: it.content ?? "", image: it.image ?? "", date: it.date ?? "", pinned: !!it.pinned, fields: it.fields || {}, tags: it.tags || [], links: it.links || [], media: it.media || [] });
// Message d'erreur lisible : la raison donnée par le serveur, sinon le code, sinon le message.
const errText = (e) => { const d = e?.response?.data?.detail; const st = e?.response?.status; if (typeof d === "string" && d) return d; if (Array.isArray(d) && d[0]?.msg) return d[0].msg; if (st === 401 || st === 403) return "connexion requise (reconnecte-toi en admin)"; if (st) return `erreur ${st} du serveur`; if (/network|timeout/i.test(e?.message || "")) return "le serveur ne répond pas"; return e?.message || "erreur inconnue"; };
// Le corps d'un bloc collé : tout ce qui suit l'en-tête (mêmes règles que parsePaste)
const splitSrc = (src) => { const ls = String(src || "").replace(/\r/g, "").split("\n"); let i = 0;
  for (; i < ls.length; i++) { const t = ls[i].trim(); if (t.startsWith("# ")) break; if (/^-{3,}$/.test(t)) { i++; break; } }
  return { head: ls.slice(0, i).join("\n"), body: ls.slice(i).join("\n").trim() }; };
const joinSrc = (head, body) => `${head.replace(/\s+$/, "")}\n\n${body.trim()}\n`;
// Vidéos dans un texte source : insérer après le paragraphe si, remplacer, retirer
const bodyEdit = (src, fn) => { const { head, body } = splitSrc(src); const parts = body.split(/\n\s*\n/); fn(parts); return joinSrc(head, parts.filter((x) => x !== null).join("\n\n")); };
const ytIns = (si, line) => (parts) => parts.splice(Math.min(parts.length, Math.max(0, si + 1)), 0, line);
const ytDel = (id) => (parts) => parts.forEach((x, i) => { if (x.trim().startsWith(`@yt ${id}`)) parts[i] = null; });
const ytSwap = (oldId, newId) => (parts) => parts.forEach((x, i) => { if (x.trim().startsWith(`@yt ${oldId}`)) parts[i] = x.replace(`@yt ${oldId}`, `@yt ${newId}`); });
// Un livre (quel qu'il soit) → texte collable, pour l'export et la copie
const blockText = (b) => (b.t === "q" ? `> ${b.x}${b.by ? ` | ${b.by}` : ""}` : b.t === "h" ? `## ${b.x}` : b.t === "yt" ? `@yt ${b.id} | ${b.cap || ""}` : b.t === "img" ? `@img ${b.src} | ${b.cap || ""}${b.credit ? ` | ${b.credit}` : ""}` : b.t === "art" ? `@art ${b.kind === "grids" ? "g " : ""}${b.n} | ${b.cap || ""}` : b.t === "box" ? `!! ${b.label || "À RETENIR"} :: ${b.x}` : b.x);
const asPaste = (b) => b.src || bookToPaste({ ...b, cote: b.cote === "PERS." ? "" : b.cote, text: b.text && !b.mine && !b.edited ? b.text : b.chapters.map((c) => [c.title && `# ${c.title}`, ...c.blocks.map(blockText)].filter(Boolean).join("\n\n")).join("\n\n") });
const inline = (s) => s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((p, i) => (p.startsWith("**") && p.endsWith("**") && p.length > 4 ? <strong key={i}>{p.slice(2, -2)}</strong> : p.startsWith("*") && p.endsWith("*") && p.length > 2 ? <em key={i}>{p.slice(1, -1)}</em> : p));

// Un volume sur le rayonnage : tranche (illustration, titre vertical, étiquette de cote) ou, s'il est choisi, boîtier de face.
const TONES = ["ink", "color", "paper", "color", "ink", "deep", "color"];
const fmtOf = (b) => b.format || (b.room === "lore" ? "vhs" : b.room === "musique" ? "vinyle" : "livre");
const volLook = (b, upcoming) => {
  const r = hue(b.title + "r"); const fmt = fmtOf(b);
  const w = fmt === "vhs" ? 62 : fmt === "vinyle" ? 30 + (r % 3) * 4 : upcoming ? 54 + (r % 22) : 54 + Math.min(28, Math.round((b.words || 1500) / 280));
  const hgt = fmt === "vhs" ? 336 : fmt === "vinyle" ? 318 : 312 + (r % 5) * 7;
  return { r, fmt, w, hgt, tone: (fmt === "vhs" ? ["color", "deep", "ink", "color", "deep"] : TONES)[hue(b.title + "t") % (fmt === "vhs" ? 5 : TONES.length)], lean: ((r % 9) - 4) * 0.12 };
};
// Le boîtier de face (livre, cassette, pochette) : utilisé sur le rayon, dans la grille et dans la notice.
// Étiquette discrète : lu, à lire, coup de cœur
const StTag = ({ st }) => (st && (st.read || st.want || st.fav) ? <span className="ax-stag mono" aria-label={[st.read && "lu", st.want && "à lire", st.fav && "coup de cœur"].filter(Boolean).join(", ")}>{st.read ? "✓ LU" : st.want ? "À LIRE" : ""}{st.fav && <i>♥</i>}</span> : null);
// Un livre de 2 000 mots ou moins n'est pas encore complet : un badge orange le signale, il disparaît tout seul quand le livre grandit.
export const SHORT_WORDS = 2000;
export const isShort = (b) => !!b && b.words > 0 && b.words <= SHORT_WORDS;
function CoverInner({ b, cover, upcoming, wished, fmt, R, em, cfs, st }) {
  return (
    <>
      {!upcoming && isShort(b) && <span className="ax-todo mono" title={`${b.words} mots : ce livre n'est pas encore complet`} data-testid={`alex-todo-${b.id}`}>À COMPLÉTER</span>}
      {fmt === "vinyle" && <span className="ax-disc" aria-hidden="true"><i /></span>}
      {cover && <span className="ax-cover-img" style={{ backgroundImage: `url(${cover})` }} />}
      {fmt === "vhs" && <span className="ax-cover-band mono"><b>VHS</b><span>{(b.roomLabel || R?.label || "LORE").toUpperCase()}</span><i>{b.cote || "À PARAÎTRE"}</i></span>}
      {!cover && (
        <>
          {fmt === "livre" && <span className="ax-cover-top mono">{b.house || "ALEXANDRIE"} · {(b.roomLabel || R?.label || "MES LIVRES").toUpperCase()}</span>}
          <span className="ax-cover-t" style={{ "--fs": cfs }}>{b.title}</span>
          <span className="ax-cover-sun"><i>{em}</i></span>
          {b.sub && <span className="ax-cover-sub">{b.sub}</span>}
        </>
      )}
      {fmt === "vhs" ? upcoming && <span className="ax-sticker">BIENTÔT</span> : <span className="ax-cover-tag mono">{upcoming ? (wished ? "★ DEMANDÉ" : "À PARAÎTRE") : b.cote}</span>}
      <span className="ax-wear" aria-hidden="true" />
      <StTag st={st} />
    </>
  );
}
// Partagé avec la station publique (expérience Nexus) : le même objet physique partout.
export function Face({ b, cover, upcoming, wished, st }) {
  const L = volLook(b, upcoming); const fmt = L.fmt; const R = ROOMS.find((r) => r.key === b.room);
  const em = b.emblem || (upcoming ? b.title.replace(/^(Le |La |Les |L')/, "")[0].toUpperCase() : R?.kanji || "書");
  const len = b.title.length; const longest = Math.max(...b.title.split(/[\s-]+/).map((w) => w.length));
  const cfs = Math.max(17, Math.min(40, Math.floor((fmt === "vhs" ? 168 : 190) / (longest * 0.8)), len > 22 ? 22 : 40));
  return (
    <span className={`ax-face f-${fmt}`} aria-hidden="true">
      <span className={`ax-cover t-${L.tone} f-${fmt}` + (upcoming ? " up" : "") + (cover ? " img" : "")} style={{ "--h": b.color ?? hue(b.title), "--r": L.r % 40, "--c": 18 + (L.r % 60) }}>
        <CoverInner b={b} cover={cover} upcoming={upcoming} wished={wished} fmt={fmt} R={R} em={em} cfs={cfs} st={st} />
      </span>
    </span>
  );
}
function Volume({ b, sel, cover, upcoming, wished, onPick, onOpen, menu, st }) {
  const pm = menu ? pressMenu(menu) : {};
  const ctx = menu ? { ...pm, onContextMenu: (e) => { if (!sel) onPick?.(); pm.onContextMenu(e); } } : {};
  const h = b.color ?? hue(b.title); const L = volLook(b, upcoming); const fmt = L.fmt;
  const R = ROOMS.find((r) => r.key === b.room); const em = b.emblem || (upcoming ? b.title.replace(/^(Le |La |Les |L')/, "")[0].toUpperCase() : R?.kanji || "書");
  const cls = ` t-${L.tone} f-${fmt}` + (upcoming ? " up" : "") + (b.mine ? " mine" : "");
  const len = b.title.length; const fs = Math.max(11.5, Math.min(21, Math.floor(196 / (len * 0.66))));
  const longest = Math.max(...b.title.split(/[\s-]+/).map((w) => w.length)); const cfs = Math.max(17, Math.min(40, Math.floor((fmt === "vhs" ? 168 : 190) / (longest * 0.8)), len > 22 ? 22 : 40));
  const vars = { "--h": h, "--r": L.r % 40, "--c": 18 + (L.r % 60) };
  if (sel) return (
    <button className={"ax-cover" + cls + (cover ? " img" : "")} style={vars} onClick={onOpen} data-testid={`alex-cover-${b.id}`} aria-label={`${b.title} : ${upcoming ? "à paraître" : "ouvrir"}`} {...ctx}>
      <CoverInner b={b} cover={cover} upcoming={upcoming} wished={wished} fmt={fmt} R={R} em={em} cfs={cfs} st={st} />
    </button>
  );
  return (
    <button className={"ax-vol" + cls} style={{ ...vars, width: L.w, height: L.hgt, "--lean": `${L.lean}deg` }} onClick={onPick} title={`${b.title}${b.sub ? " · " + b.sub : ""}${upcoming ? " (à paraître)" : ""}`} data-testid={`alex-book-${b.id}`} {...ctx}>
      <span className="ax-vol-art" style={cover ? { backgroundImage: `url(${cover})` } : undefined}>{!cover && <i>{em}</i>}</span>
      {!upcoming && isShort(b) && <span className="ax-vtodo" title="À compléter" aria-hidden="true" />}
      {st && (st.read || st.want || st.fav) && <span className="ax-vmark mono" aria-hidden="true">{st.read ? "✓" : st.want ? "◷" : ""}{st.fav ? "♥" : ""}</span>}
      <span className="ax-vol-t" style={{ fontSize: fs }}>{b.title}</span>
      {fmt === "vhs"
        ? <span className="ax-vol-f"><em className="ax-dot" />{upcoming && <small className="ax-soon">{wished ? "★" : "BIENTÔT"}</small>}<b className="ax-vhs">VHS</b></span>
        : <span className="ax-vol-f"><small className="ax-cote mono">{upcoming ? (wished ? "★" : "···") : (b.cote || "").replace("-", "\n")}</small></span>}
      <span className="ax-wear" aria-hidden="true" />
    </button>
  );
}

// Notes de lecture : prises dans le livre, retrouvées dans le livre (liste par page, repères sur la barre de progression).
// Elles sont gardées dans une fiche « Notes de lecture » du Nexus Drive, une par livre.
const notesItemOf = (at, id) => at?.items.find((i) => i.fields?.alexNotes === id);
function notesOf(item) {
  if (!item) return [];
  if (Array.isArray(item.fields?.notes)) return item.fields.notes;
  // anciennes notes, écrites en texte : « Page 12 · Chapitre : texte »
  const d = new DOMParser().parseFromString(`<div>${item.content || ""}</div>`, "text/html").body.firstChild;
  return [...d.querySelectorAll("p")].map((p, k) => { const m = p.textContent.trim().match(/^Page (\d+)(?: · (.*?))? : ([\s\S]*)$/); return m ? { id: "old" + k, p: +m[1] - 1, n: 0, ch: m[2] || "", t: m[3] } : null; }).filter(Boolean);
}
// Notes d'un livre, avec la page recalculée pour la mise en page actuelle
const bookNotes = (at, id, pages) => notesOf(notesItemOf(at, id)).map((n) => ({ ...n, page: Math.max(0, pages ? Math.min(pages - 1, n.n ? Math.round((n.p / n.n) * pages) : n.p) : n.p) })).sort((a, b) => a.page - b.page);
function ReaderNotes({ at, book, page, pages, chapter, onClose, onJump }) {
  const item = notesItemOf(at, book.id); const list = notesOf(item);
  const [txt, setTxt] = useState(() => { const s = String(window.getSelection?.() || "").trim(); return s && s.length < 600 ? `« ${s} »\n` : ""; });
  const [busy, setBusy] = useState(false); const [edit, setEdit] = useState(null);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const save = async (next, msg) => {
    setBusy(true);
    const sorted = [...next].sort((a, b) => (a.n ? a.p / a.n : 0) - (b.n ? b.p / b.n : 0));
    const html = sorted.map((n) => `<p><strong>${esc(`Page ${n.p + 1}${n.ch ? ` · ${n.ch}` : ""}`)}</strong> : ${esc(n.t).replace(/\n/g, "<br>")}</p>`).join("");
    try {
      if (item) await at.saveItem({ ...item, content: html, fields: { ...item.fields, notes: sorted } });
      else await at.createItem({ kind: "note", title: `Notes de lecture · ${book.title}`, content: html, tags: ["alexandrie", "notes de lecture"], fields: { alexNotes: book.id, notes: sorted } });
      if (msg) toast.success(msg); setBusy(false); return true;
    } catch (e) { toast.error("La note n'a pas pu être gardée"); setBusy(false); return false; }
  };
  const keep = async () => {
    const t = txt.trim(); if (!t || busy) return;
    const next = edit ? list.map((n) => (n.id === edit ? { ...n, t } : n)) : [...list, { id: Date.now().toString(36), p: page, n: pages, ch: chapter || "", t, at: Date.now() }];
    if (await save(next, edit ? "Note modifiée" : "Note gardée")) { setTxt(""); setEdit(null); }
  };
  const del = async (n) => { if (await labConfirm("Supprimer cette note ?")) save(list.filter((x) => x.id !== n.id), "Note supprimée"); };
  const here = (n) => (n.n ? Math.round((n.p / n.n) * pages) : n.p);
  return (
    <aside className="ax-music ax-notes" data-testid="alex-notes-panel">
      <p className="mono">{edit ? "MODIFIER LA NOTE" : `NOTE · PAGE ${page + 1}${chapter ? ` · ${chapter.toUpperCase()}` : ""}`}</p>
      <textarea autoFocus value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") keep(); }} placeholder="Une idée, une phrase à garder, ce que ça t'inspire… (sélectionne un passage avant d'ouvrir les notes pour le citer)" rows={4} data-testid="alex-notes-input" />
      <div className="ax-acts">
        <button className="at-btn" onClick={keep} disabled={busy || !txt.trim()} data-testid="alex-notes-keep">{busy ? "…" : edit ? "Enregistrer" : "Garder la note"}</button>
        {edit && <button className="ax-ghost" onClick={() => { setEdit(null); setTxt(""); }}>Annuler</button>}
        <button className="ax-ghost" onClick={onClose}>Fermer</button>
      </div>
      <p className="mono" style={{ marginTop: 16 }}>MES NOTES SUR CE LIVRE · {list.length}</p>
      {!list.length && <p className="ax-note" style={{ opacity: 0.7 }}>Tes notes s'afficheront ici, rangées par page. Un clic sur une note te ramène à sa page.</p>}
      <div className="ax-nlist">
        {[...list].sort((a, b) => here(a) - here(b)).map((n) => (
          <div key={n.id} className={"ax-n" + (here(n) === page || here(n) === page + 1 ? " on" : "")}>
            <button className="ax-n-go" onClick={() => onJump(here(n))} title="Aller à cette page" data-testid="alex-note-go"><b className="mono">P. {here(n) + 1}{n.ch ? ` · ${n.ch}` : ""}</b><span>{n.t}</span></button>
            <span className="ax-n-a"><button onClick={() => { setEdit(n.id); setTxt(n.t); }} title="Modifier"><IoPencil size={12} /></button><button onClick={() => del(n)} title="Supprimer"><IoTrashOutline size={12} /></button></span>
          </div>
        ))}
      </div>
    </aside>
  );
}

// Musique pendant la lecture : recherche YouTube, lecture par la Radio de l'Atelier.
// Le lecteur de la Radio, dans le livre : pochette, titre, avance, morceau suivant, file d'attente, volume.
function NowPlaying({ r }) {
  const [q, setQ] = useState(false); const i = r.info || {};
  return (
    <div className="ax-player" style={{ "--rc": r.pl.color || "var(--lab-acc)" }} data-testid="alex-player">
      <div className="ax-pl-top">
        <span className="ax-pl-art" style={{ backgroundImage: `url(${ytThumb(i.vid) || coverOf(r.pl)})` }}>{r.playing && <span className="sx-eq"><i /><i /><i /><i /></span>}</span>
        <span className="ax-pl-tx"><b>{i.title || r.pl.title}</b><small>{i.author ? `${i.author} · ` : ""}{r.pl.title}{i.n > 1 ? ` · ${(i.i || 0) + 1} / ${i.n}` : ""}</small></span>
        <button className="rd-ic" onClick={r.stop} title="Couper la musique" data-testid="alex-player-stop"><IoClose size={17} /></button>
      </div>
      <Controls r={r} small />
      <Progress r={r} />
      <div className="ax-pl-row">
        <button className="rd-ic" onClick={r.mute} title={r.muted ? "Remettre le son" : "Couper le son"}>{r.muted ? <IoVolumeMute size={16} /> : <IoVolumeHigh size={16} />}</button>
        <input className="rd-vol" type="range" min="0" max="100" value={r.muted ? 0 : r.vol} onChange={(e) => r.setVol(+e.target.value)} style={{ "--p": (r.muted ? 0 : r.vol) + "%" }} aria-label="Volume" />
        <button className={"rd-ic" + (q ? " on" : "")} onClick={() => setQ(!q)} title="File d'attente" data-testid="alex-player-queue"><IoListOutline size={17} /></button>
      </div>
      {q && <div className="ax-pl-q"><Queue r={r} /></div>}
    </div>
  );
}
// Musique pendant la lecture : recherche YouTube, lecture par la Radio de l'Atelier.
// Un résultat lancé devient une file : les autres résultats suivent, on peut passer au suivant.
function ReaderMusic({ radio, onClose }) {
  const [q, setQ] = useState(""); const [res, setRes] = useState(null); const [busy, setBusy] = useState(false);
  const go = async (e) => { e.preventDefault(); if (!q.trim()) return; setBusy(true); try { setRes(await atelierApi.ytSearch(q.trim())); } catch (_) { toast.error("Recherche impossible"); } setBusy(false); };
  const play = (v) => { const ids = res.map((x) => x.id); const k = ids.indexOf(v.id); const vids = [...ids.slice(k), ...ids.slice(0, k)];
    radio.play({ id: "yt-q-" + Date.now(), url: `https://www.youtube.com/watch?v=${v.id}`, title: `Recherche : ${q.trim()}`, thumb: `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`, vids }); };
  return (
    <aside className="ax-music" data-testid="alex-music-panel">
      <p className="mono">MUSIQUE DE LECTURE</p>
      {radio.pl && <NowPlaying r={radio} />}
      {radio.pl && radio.kept && !radio.kept() && <button className="ax-rb" style={{ marginBottom: 10 }} onClick={radio.keep} data-testid="alex-music-keep"><IoAdd size={14} /> Ajouter ce morceau à ma radio</button>}
      <form onSubmit={go} className="ax-ytq"><IoLogoYoutube size={17} /><input autoFocus={!radio.pl} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher sur YouTube : Hisaishi, pluie, lo-fi…" data-testid="alex-music-input" /><button type="submit" disabled={busy}>{busy ? "…" : "Chercher"}</button></form>
      {res && (res.length ? res.slice(0, 12).map((v) => <button key={v.id} className={"ax-ytr" + (radio.info?.vid === v.id ? " on" : "")} onClick={() => play(v)} data-testid={`alex-yt-${v.id}`}><i style={{ backgroundImage: `url(https://i.ytimg.com/vi/${v.id}/mqdefault.jpg)` }} /><span><b>{v.title}</b><small>{v.author}{v.length ? ` · ${v.length}` : ""}</small></span></button>) : <p className="ax-empty">Aucun résultat.</p>)}
      {!res && (radio.list || []).length > 0 && <><p className="mono" style={{ marginTop: 14 }}>MES PLAYLISTS</p>{radio.list.slice(0, 8).map((p) => <button key={p.id} className={"ax-ytr" + (radio.pl?.id === p.id ? " on" : "")} onClick={() => radio.play(p)}><i style={{ backgroundImage: p.cover || p.thumb ? `url(${coverOf(p)})` : undefined }} /><span><b>{p.title}</b><small>Playlist de ta radio</small></span></button>)}</>}
      <button className="ax-rb" style={{ marginTop: 12 }} onClick={onClose}>Fermer</button>
    </aside>
  );
}

// Illustration dans le livre : image (cachée si le lien ne répond pas) ou vidéo YouTube lancée sur place.
function Fig({ b, si }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <figure className="ax-fig" data-si={si}>
      <a href={b.src} target="_blank" rel="noopener noreferrer"><img src={b.src} alt={b.cap || ""} loading="lazy" referrerPolicy="no-referrer" onError={() => setOk(false)} /></a>
      {(b.cap || b.credit) && <figcaption>{b.cap && inline(b.cap)}{b.credit && <small className="mono">{b.credit}</small>}</figcaption>}
    </figure>
  );
}
// Les illustrations pendant la lecture, jamais stockées ici. Trois sources :
// SteamGridDB (lu par le serveur de la Station) pour les jeux, MyAnimeList (Jikan) pour les mangas et les animes,
// Open Library pour les couvertures des éditions d'un roman. Une requête par source et par livre ; une source qui ne répond pas rend null.
const ART = new Map();
const once = (k, f) => { if (!ART.has(k)) ART.set(k, f().catch(() => { setTimeout(() => ART.delete(k), 30000); return null; })); return ART.get(k); };
const artList = (term, kind) => once(`sgdb|${term}|${kind}`, () => atelierApi.sgdbSearch(term, null, kind).then((r) => (r?.items || []).map((a) => ({ ...a, src: "sgdb", page: `https://www.steamgriddb.com/search/${kind}?term=${encodeURIComponent(term)}` }))));
const getJ = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(String(r.status)); return r.json(); };
const nrm = (x) => String(x || "").toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "");
// « anime:Psycho-Pass », « manga:Berserk » : la fiche la plus proche du titre, puis toutes ses images (affiches, couvertures des tomes)
const malList = (type, q, strict = false) => once(`mal|${type}|${q}|${strict}`, async () => {
  const d = await getJ(`https://api.jikan.moe/v4/${type}?q=${encodeURIComponent(q)}&limit=6&sfw=true`);
  const xs = d.data || []; const hit = xs.find((x) => [x.title, x.title_english, ...(x.titles || []).map((t) => t.title)].some((t) => nrm(t) === nrm(q))) || (strict ? null : xs[0]);
  if (!hit) return [];
  await new Promise((r) => setTimeout(r, 450)); // Jikan : trois appels par seconde au plus
  const p = await getJ(`https://api.jikan.moe/v4/${type}/${hit.mal_id}/pictures`);
  return (p.data || []).map((x) => x.jpg?.large_image_url || x.jpg?.image_url).filter(Boolean).map((u) => ({ id: u, url: u, thumb: u, src: "mal", page: hit.url }));
});
// « ol:Dune Frank Herbert » : les couvertures de toutes les éditions du roman (traductions, rééditions)
const olList = (q) => once(`ol|${q}`, async () => {
  const d = await getJ(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=1&fields=key`);
  const key = d.docs?.[0]?.key; if (!key) return [];
  const e = await getJ(`https://openlibrary.org${key}/editions.json?limit=80`);
  const ids = [...new Set((e.entries || []).flatMap((x) => x.covers || []).filter((c) => c > 0))];
  return ids.map((c) => ({ id: "ol" + c, url: `https://covers.openlibrary.org/b/id/${c}-L.jpg`, thumb: `https://covers.openlibrary.org/b/id/${c}-L.jpg`, src: "ol", page: `https://openlibrary.org${key}` }));
});
const SRC = { sgdb: "STEAMGRIDDB", mal: "MYANIMELIST", ol: "OPEN LIBRARY" };
// Les sources d'un livre : son champ pics (« sgdb:… », « anime:… », « manga:… », « ol:… »), sinon SteamGridDB sur son titre
const picSources = (book, term) => (book.pics?.length ? book.pics : [`sgdb:${term}`]).map((x) => { const i = x.indexOf(":"); return [x.slice(0, i), x.slice(i + 1).trim()]; });
// Jamais deux fois la même image dans un livre : on répartit les artworks avant d'afficher.
// D'abord chaque @art garde l'image demandée si elle est libre, puis les autres prennent la suivante libre
// (même format, sinon l'autre format) ; s'il n'en reste plus, l'illustration est retirée. L'image de couverture compte comme prise.
const artKey = (a) => String(a.id || a.url);
export async function planArt(book, term, cover) {
  const blocks = book.chapters.flatMap((c) => c.blocks);
  const out = new Map(); const seen = new Set();
  blocks.forEach((b) => { if (b.t === "img") { if (seen.has(b.src)) out.set(b.si, { hide: true }); seen.add(b.src); } });
  const arts = blocks.filter((b) => b.t === "art");
  if (!arts.length) return out;
  // les bannières larges viennent de SteamGridDB ; les images verticales de toutes les sources, dans l'ordre donné
  const lists = { heroes: [], grids: [] }; let answered = false;
  for (const [k, q] of picSources(book, term)) {
    const got = k === "sgdb" ? [await artList(q, "heroes"), await artList(q, "grids")] : k === "anime" || k === "manga" ? [null, await malList(k, q)] : k === "ol" ? [null, await olList(q)] : k === "commons" ? [null, await commonsList(q)] : [null, null];
    if (got[0]) { answered = true; lists.heroes.push(...got[0]); }
    if (got[1]) { answered = true; lists.grids.push(...got[1]); }
  }
  if (!answered) return out; // aucune source ne répond : le lien reste proposé
  const used = new Set();
  if (cover) Object.values(lists).flat().forEach((a) => { if (a.url === cover || a.thumb === cover) used.add(artKey(a)); });
  const take = (b, a, kind) => { used.add(artKey(a)); out.set(b.si, { a, kind }); };
  arts.forEach((b) => { const a = lists[b.kind][b.n - 1]; if (a && !used.has(artKey(a))) take(b, a, b.kind); });
  arts.forEach((b) => {
    if (out.has(b.si)) return;
    const other = b.kind === "heroes" ? "grids" : "heroes";
    const xs = lists[b.kind]; const from = Math.min(Math.max(0, b.n - 1), xs.length);
    const a = [...xs.slice(from), ...xs.slice(0, from)].find((x) => !used.has(artKey(x)));
    if (a) take(b, a, b.kind);
    else { const o = lists[other].find((x) => !used.has(artKey(x))); if (o) take(b, o, other); else out.set(b.si, { hide: true }); }
  });
  return out;
}
// Wikimedia Commons : portraits, gravures, photos d'archives libres (pour l'histoire, la philosophie, la musique…)
const commonsList = (q) => once(`commons|${q}`, async () => {
  const d = await getJ(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q + " filetype:bitmap")}&gsrlimit=40&prop=imageinfo&iiprop=url%7Cmime%7Csize%7Cextmetadata&iiurlwidth=1280`);
  const txt = (h) => String(h || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return Object.values(d.query?.pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0)).map((p) => p.imageinfo?.[0]).filter((i) => i && /image\/(jpeg|png)/.test(i.mime) && i.width >= 600)
    .map((i) => { const m = i.extmetadata || {}; const who = txt(m.Artist?.value).slice(0, 60); const lic = txt(m.LicenseShortName?.value);
      return { id: i.url, url: i.thumburl || i.url, src: "commons", page: i.descriptionurl, credit: ["Wikimedia Commons", who, lic].filter(Boolean).join(" · ") }; });
});
const CREDIT = { sgdb: "SteamGridDB", mal: "MyAnimeList", ol: "Open Library", commons: "Wikimedia Commons" };
// Les sources essayées pour illustrer un livre automatiquement : celles du livre (ligne ILLUSTRATIONS),
// sinon, pour le Lore, SteamGridDB, MyAnimeList (titre exact) et Open Library ; pour les autres salles, Wikimedia Commons.
const autoSources = (book, term) => book.pics?.length ? picSources(book, term)
  : fmtOf(book) === "vhs" || book.room === "lore" ? [["sgdb", term], ["anime!", book.title], ["manga!", book.title], ["ol", book.title]]
  : [["commons", book.title], ...(book.sub ? [["commons", `${book.title} ${book.sub}`]] : [])];
async function poolOf(book, term) {
  const out = [];
  for (const [k0, q] of autoSources(book, term)) {
    const k = k0.replace("!", ""); const strict = k0.endsWith("!");
    let xs = null;
    if (k === "sgdb") { const [h, g] = [await artList(q, "heroes"), await artList(q, "grids")]; xs = []; for (let i = 0; i < Math.max(h?.length || 0, g?.length || 0); i++) { if (h?.[i]) xs.push(h[i]); if (g?.[i]) xs.push(g[i]); } }
    else if (k === "anime" || k === "manga") xs = await malList(k, q, strict);
    else if (k === "ol") xs = await olList(q);
    else if (k === "commons") xs = await commonsList(q);
    (xs || []).forEach((a) => out.push({ ...a, credit: a.credit || [CREDIT[a.src], a.author && `par ${a.author}`].filter(Boolean).join(" · ") }));
  }
  return out;
}
// Illustrer un livre : une image par chapitre qui n'en a pas, posée après le premier paragraphe, jamais deux fois la même
// (ni une image déjà dans le livre, ni la couverture). Renvoie le texte complet (en-tête compris), prêt à relire et enregistrer.
export async function autoIllustrate(text, book, cover) {
  const term = book.art || sgdbTerm(book);
  const plan = await planArt(book, term, cover).catch(() => new Map());
  const used = new Set([cover].filter(Boolean));
  book.chapters.flatMap((c) => c.blocks).forEach((b) => { if (b.t === "img") used.add(b.src); const p = plan.get(b.si); if (p?.a) { used.add(p.a.url); used.add(p.a.thumb); } });
  const pool = (await poolOf(book, term)).filter((a) => { const k = a.url; if (used.has(k) || used.has(a.thumb)) return false; used.add(k); return true; });
  const cut = text.search(/^\s*(-{3,}\s*$|# )/m); const head = cut > 0 ? text.slice(0, cut) : ""; const body = cut > 0 ? text.slice(cut) : text;
  const blocks = body.split(/\n\s*\n/);
  const heads = blocks.map((b, i) => (b.trim().startsWith("# ") ? i : -1)).filter((i) => i >= 0);
  const ins = new Map(); let n = 0;
  heads.forEach((h, ci) => {
    const end = ci + 1 < heads.length ? heads[ci + 1] : blocks.length;
    if (blocks.slice(h, end).some((b) => /^\s*@(art|img) /.test(b))) return;
    const pos = blocks.findIndex((b, j) => j > h && j < end && b.trim() && !/^\s*(##? |@|> |!! )/.test(b));
    if (pos < 0 || n >= pool.length) return;
    const a = pool[n++]; ins.set(pos, `@img ${a.url} |  | ${a.credit.replace(/\|/g, "/")}`);
  });
  const out = blocks.flatMap((b, i) => (ins.has(i) ? [b, ins.get(i)] : [b])).join("\n\n");
  return { text: head + out, added: ins.size, found: pool.length, chapters: heads.length };
}
function ArtFig({ b, term, si, pick }) {
  const [bad, setBad] = useState(false);
  if (pick?.hide) return null;
  const a = pick === undefined ? undefined : bad ? null : pick?.a || null; const kind = pick?.kind || b.kind;
  const link = a?.page || `https://www.steamgriddb.com/search/${kind}?term=${encodeURIComponent(term)}`;
  return (
    <figure className={`ax-fig ax-art ${kind}`} data-si={si}>
      <a className="ax-art-box" href={a?.src === "sgdb" ? a.url : link} target="_blank" rel="noopener noreferrer">{a ? <img src={a.thumb || a.url} alt={b.cap || ""} loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)} /> : <span className="mono">{a === null ? "VOIR LES ARTWORKS SUR STEAMGRIDDB ↗" : "…"}</span>}</a>
      <figcaption>{b.cap && inline(b.cap)}<small className="mono">{b.credit ? `${b.credit} · ` : ""}{a?.author ? `ARTWORK PAR ${a.author} · ` : ""}<a href={link} target="_blank" rel="noopener noreferrer">{SRC[a?.src] || "STEAMGRIDDB"} ↗</a></small></figcaption>
    </figure>
  );
}
// Ajouter une vidéo YouTube à un chapitre, depuis la lecture : on colle le lien, on écrit la légende, on choisit le chapitre.
const VSEARCH = [["beauty", "beauty"], ["analyse", "analysis"], ["lore", "lore"], ["musique", "soundtrack"], ["making-of", "making of"]];
// Recherche YouTube intégrée : on tape, on clique sur une vignette, c'est choisi (plus besoin d'aller copier un lien).
function YtPicker({ initial = "", onPick, pickedId }) {
  const [q, setQ] = useState(initial); const [res, setRes] = useState(null); const [busy, setBusy] = useState(false);
  const go = async (e) => { e?.preventDefault(); if (!q.trim()) return; setBusy(true); try { setRes(await atelierApi.ytSearch(q.trim())); } catch (_) { toast.error("Recherche impossible"); } setBusy(false); };
  return (
    <div className="ax-ytpick" data-testid="alex-ytpick">
      <form onSubmit={go} className="ax-ytq"><IoLogoYoutube size={17} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher une vidéo sur YouTube…" data-testid="alex-ytpick-input" /><button type="submit" disabled={busy}>{busy ? "…" : "Chercher"}</button></form>
      {res && (res.length ? <div className="ax-ytpick-res">{res.slice(0, 9).map((v) => (
        <button type="button" key={v.id} className={"ax-ytr" + (pickedId === v.id ? " on" : "")} onClick={() => onPick(v)} data-testid={`alex-ytpick-${v.id}`}><i style={{ backgroundImage: `url(https://i.ytimg.com/vi/${v.id}/mqdefault.jpg)` }} /><span><b>{v.title}</b><small>{v.author}{v.length ? ` · ${v.length}` : ""}</small></span></button>
      ))}</div> : <p className="ax-empty">Aucun résultat.</p>)}
    </div>
  );
}
function VideoAdd({ book, page, onAdd, onClose }) {
  const [v, setV] = useState(""); const [cap, setCap] = useState(""); const [busy, setBusy] = useState(false);
  const id = ytId(v.trim());
  const submit = async (e) => { e.preventDefault(); if (!id) { toast.error("Lien YouTube non reconnu"); return; } setBusy(true); try { await onAdd(id, cap.replace(/\s*\|\s*/g, " / ").replace(/\s+/g, " ").trim()); } finally { setBusy(false); } };
  return (
    <aside className="ax-toc ax-vadd" data-testid="alex-vadd" onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } }}>
      <p className="mono">AJOUTER UNE VIDÉO</p>
      <YtPicker initial={book.title} pickedId={id} onPick={(x) => { setV(`https://www.youtube.com/watch?v=${x.id}`); if (!cap.trim()) setCap(x.title); }} />
      <form onSubmit={submit}>
        <label><span className="mono">LIEN YOUTUBE</span><input autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder="https://www.youtube.com/watch?v=… ou youtu.be/…" data-testid="alex-vadd-url" /></label>
        {v.trim() && (id ? <span className="ax-vadd-thumb" style={{ backgroundImage: `url(https://i.ytimg.com/vi/${id}/mqdefault.jpg)` }}><IoPlay size={18} /></span> : <small className="ax-vadd-bad">Ce n'est pas un lien YouTube reconnu.</small>)}
        <label><span className="mono">LÉGENDE</span><input value={cap} onChange={(e) => setCap(e.target.value)} placeholder="Ce que montre la vidéo, et sa langue" data-testid="alex-vadd-cap" /></label>
        <p className="ax-vadd-where mono">ELLE SE PLACE ICI, À LA PAGE {page}.</p>
        <button type="submit" className="ax-vadd-ok" disabled={!id || busy} data-testid="alex-vadd-ok">{busy ? "Ajout…" : "Ajouter à cette page"}</button>
      </form>
      <p className="ax-vadd-find"><span className="mono">CHERCHER</span>{VSEARCH.map(([l, q]) => <a key={q} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${book.title} ${q}`)}`} target="_blank" rel="noopener noreferrer">{l} ↗</a>)}</p>
    </aside>
  );
}
function YtFig({ b, onSwap, onRemove, si }) {
  const [on, setOn] = useState(false); const [ed, setEd] = useState(false); const [v, setV] = useState("");
  const swap = (e) => { e.preventDefault(); const id = ytId(v); if (!id) { toast.error("Lien YouTube non reconnu"); return; } onSwap(b.id, id); setEd(false); setOn(false); };
  return (
    <figure className="ax-fig ax-yt" data-si={si}>
      {on ? <iframe src={`https://www.youtube-nocookie.com/embed/${b.id}?autoplay=1&rel=0`} title={b.cap || "Vidéo"} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        : <button type="button" onClick={() => setOn(true)} style={{ backgroundImage: `url(https://i.ytimg.com/vi/${b.id}/hqdefault.jpg)` }} aria-label={`Lire la vidéo : ${b.cap || ""}`}><IoPlay size={26} /></button>}
      <figcaption>{b.cap && inline(b.cap)}<small className="mono"><a href={`https://www.youtube.com/watch?v=${b.id}`} target="_blank" rel="noopener noreferrer">VOIR SUR YOUTUBE ↗</a>{onSwap && <button type="button" className="ax-yt-sw" onClick={() => { setEd((x) => !x); setV(""); }} data-testid={`alex-yt-swap-${b.id}`}><IoSwapHorizontal size={11} /> CHANGER</button>}{onRemove && <button type="button" className="ax-yt-sw" onClick={async () => { if (await labConfirm(`Supprimer cette vidéo du livre ?${b.cap ? `\n« ${b.cap} »` : ""}`)) onRemove(b.id); }} data-testid={`alex-yt-del-${b.id}`}><IoTrashOutline size={11} /> SUPPRIMER</button>}</small></figcaption>
      {ed && <div className="ax-yt-ed ax-yt-edpick"><YtPicker initial={b.cap || ""} onPick={(x) => { onSwap(b.id, x.id); setEd(false); setOn(false); }} /></div>}
      {ed && <form className="ax-yt-ed" onSubmit={swap}><input ref={(el) => el && !el.dataset.f && (el.dataset.f = "1", el.focus({ preventScroll: true }))} value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); setEd(false); } }} placeholder="Colle le lien de la nouvelle vidéo YouTube" data-testid="alex-yt-swap-in" /><button className="at-btn" type="submit">OK</button></form>}
    </figure>
  );
}

export function Reader({ book, onClose, onEdit, onModify, onIllustrate, onSwap, onRemoveVideo, onAddVideo, onDone, paused, radio, cover, at, startNotes, onCover, startCh = null, keepSaved = false, onProgress, workMusic, onCue, backLabel = "Rayonnages", path, noPdf = false, onEditChapter }) {
  const { sfx } = useApp();
  const flow = useRef(null);
  const spreadR = useRef(0); const stepR = useRef(0); const glide = useRef(0);
  // Taille du texte (Aa) : gardée pour toutes les lectures de ce navigateur
  const [fs, setFs] = useState(() => { const v = Number(read("nx-alex-fs", 1)); return v >= 0.8 && v <= 1.6 ? v : 1; });
  // le confort de lecture (gardé pour la prochaine fois) : interligne, police, couleur de page, marges
  const [cf, setCf] = useState(() => ({ lh: "m", ...(read("nx-alex-cf", {}) || {}) }));
  const setCfK = (k, v) => setCf((o) => ({ ...o, [k]: v }));
  const cfFirst = useRef(true);
  useEffect(() => {
    write("nx-alex-cf", cf);
    if (cf.ff === "lisible" && !document.getElementById("ax-font-lisible")) { const l = document.createElement("link"); l.id = "ax-font-lisible"; l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap"; document.head.appendChild(l); }
    if (cfFirst.current) { cfFirst.current = false; return; }
    relayoutRef.current?.();
  }, [cf]); // eslint-disable-line react-hooks/exhaustive-deps
  const relayoutRef = useRef(null);
  const [aa, setAa] = useState(false);
  // Plein écran : le livre (ou la cassette) prend tout l'écran, les barres se cachent et reviennent quand on bouge
  const [full, setFull] = useState(false);
  const [ui, setUi] = useState(true);
  const uiT = useRef(null);
  const wake = () => { setUi(true); clearTimeout(uiT.current); uiT.current = setTimeout(() => setUi(false), 2300); };
  const [page, setPage] = useState(() => read(LS.prog, {})[book.id]?.page || 0);
  const [pages, setPages] = useState(1);
  const [per, setPer] = useState(2);
  const [toc, setToc] = useState(false);
  const [music, setMusic] = useState(false);
  const [notes, setNotes] = useState(!!startNotes);
  const [mark, setMark] = useState(() => !!read(LS.prog, {})[book.id]?.mark);
  const [vid, setVid] = useState(false);
  // Géométrie des colonnes : le pas d'une page = largeur de colonne + gouttière, hors marges.
  const geom = () => {
    const el = flow.current; const cs = getComputedStyle(el);
    const pad = parseFloat(cs.paddingLeft) || 0; const gap = parseFloat(cs.columnGap) || 0;
    const p = window.innerWidth < 900 ? 1 : 2;
    const colW = (el.clientWidth - pad * 2 - gap * (p - 1)) / p;
    return { el, pad, gap, p, step: colW + gap };
  };
  // Tourner les pages : au doigt (la page suit le doigt), en touchant le bord de la page, ou au clavier.
  const drag = useRef(null); const anim = useRef(0); const wheel = useRef({ x: 0, lock: 0 });
  const [turn, setTurn] = useState(null); const turnT = useRef(0);
  const fmt = fmtOf(book); const look = useMemo(() => lookOf(book), [book]);
  const [turnSound, setTurnSound] = useState(() => read("nx-alex-turn-sound", true) !== false);
  const turnFx = (d) => { if (turnSound) playPageTurn(fmt, d); };
  const bookEl = useRef(null);
  useEffect(() => () => clearTimeout(turnT.current), []);
  useEffect(() => { // polices de l'identité du livre qui ne sont pas embarquées
    if (!look) return;
    [look.d, look.r].filter((f) => WEB_FONTS.includes(f) || look.web?.includes(f)).forEach((f) => { const id = "axf-" + f.replace(/\W/g, ""); if (document.getElementById(id)) return; const l = document.createElement("link"); l.id = id; l.rel = "stylesheet"; l.href = fontHref(f); document.head.appendChild(l); });
  }, [look]);
  const measure = () => {
    if (!flow.current) return;
    const g = geom(); setPer(g.p);
    const n = Math.max(1, Math.round((g.el.scrollWidth - g.pad * 2 + g.gap) / g.step));
    setPages(n); setPage((x) => Math.min(x, Math.max(0, n - 1)));
    // la largeur d'une page a pu changer (fenêtre, plein écran, taille du texte) : on se recale sur la page affichée
    // (seulement si la largeur d'une page a réellement changé : sinon on ne touche à rien pendant qu'on tourne les pages)
    try { if (stepR.current && Math.abs(stepR.current - g.step) > 1 && !drag.current?.on && !anim.current) g.el.scrollLeft = Math.round(spreadR.current * g.step); stepR.current = g.step; } catch (_) {}
  };
  useEffect(() => { const el = flow.current; if (!el) return; const f = () => measure(); el.addEventListener("load", f, true); el.addEventListener("error", f, true); return () => { el.removeEventListener("load", f, true); el.removeEventListener("error", f, true); }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Taille du texte ou plein écran : la mise en page change, on garde l'endroit où l'on en était
  const relayout = () => {
    const r = pages > 1 ? page / (pages - 1) : 0;
    const run = () => { try { measure(); const g = geom(); const n = Math.max(1, Math.round((g.el.scrollWidth - g.pad * 2 + g.gap) / g.step)); setPage(Math.round(r * (n - 1))); } catch (_) {} };
    requestAnimationFrame(run); setTimeout(run, 380);
  };
  relayoutRef.current = () => relayout();
  const fsFirst = useRef(true);
  useEffect(() => {
    if (fsFirst.current) { fsFirst.current = false; return; }
    write("nx-alex-fs", fs); relayout();
  }, [fs]); // eslint-disable-line react-hooks/exhaustive-deps
  const fullFirst = useRef(true);
  useEffect(() => {
    if (fullFirst.current) { fullFirst.current = false; return; }
    relayout(); if (full) wake(); else { clearTimeout(uiT.current); setUi(true); }
  }, [full]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const f = () => { if (!document.fullscreenElement) setFull(false); }; document.addEventListener("fullscreenchange", f); return () => { document.removeEventListener("fullscreenchange", f); clearTimeout(uiT.current); }; }, []);
  const toggleFull = () => {
    const el = document.querySelector(".ax-reader");
    if (full) { setFull(false); try { if (document.fullscreenElement) document.exitFullscreen(); } catch (_) {} return; }
    setFull(true); try { el?.requestFullscreen?.()?.catch?.(() => {}); } catch (_) {}
  };
  useLayoutEffect(() => { measure(); const t = setTimeout(measure, 350); document.fonts?.ready?.then(measure).catch(() => {}); window.addEventListener("resize", measure); return () => { clearTimeout(t); window.removeEventListener("resize", measure); }; }, [book]); // eslint-disable-line
  const spread = Math.floor(page / per) * per;
  spreadR.current = spread;
  useEffect(() => {
    if (!flow.current) return;
    const g = geom(); const left = Math.round(spread * g.step);
    if (anim.current && Math.abs(g.el.scrollLeft - left) < g.step * 2.2) {
      // la page finit sa course sous le doigt : glissement court et net (on ne laisse plus le navigateur décider de la durée)
      clearTimeout(anim.current); cancelAnimationFrame(glide.current);
      const el = g.el; const from = el.scrollLeft; const d = left - from; const T = Math.max(160, Math.min(300, Math.abs(d) * 0.55)); const t0 = performance.now();
      const ease = (x) => 1 - Math.pow(1 - x, 3);
      const step = (now) => { const k = Math.min(1, (now - t0) / T); el.scrollLeft = from + d * ease(k); if (k < 1) glide.current = requestAnimationFrame(step); else { el.scrollLeft = left; anim.current = 0; } };
      anim.current = setTimeout(() => { anim.current = 0; }, T + 120);
      glide.current = requestAnimationFrame(step);
    }
    else { clearTimeout(anim.current); anim.current = 0; g.el.scrollLeft = left; }
  }, [spread, per, pages, book]); // eslint-disable-line
  useEffect(() => { if (book.preview) return; const all = read(LS.prog, {}); all[book.id] = { page, pages, mark, at: Date.now() }; write(LS.prog, all); }, [page, pages, mark, book.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // Ouvrir directement au chapitre demandé (sauf si on reprend une page déjà gardée)
  const startedR = useRef(startCh == null || (keepSaved && read(LS.prog, {})[book.id]?.page > 0));
  const [ready, setReady] = useState(startedR.current); // le livre reste caché le temps de se placer au bon chapitre (pas de saut visible)
  useEffect(() => {
    if (startedR.current || pages < 2) return; startedR.current = true;
    // le minuteur n'est pas annulé si la mise en page bouge encore (polices, images) : on saute quand même, puis on se recale
    setTimeout(() => { jump(startCh); setTimeout(() => { jump(startCh); setReady(true); }, 380); }, 60);
  }, [pages]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) return; const t = setTimeout(() => setReady(true), 1200); return () => clearTimeout(t); }, [ready]);
  // Où en est le lecteur : le chapitre affiché et la part lue (pour « Reprendre » et la musique du chapitre)
  const progR = useRef(onProgress); progR.current = onProgress;
  // On donne : le chapitre affiché, la part lue du livre, la part lue du chapitre et la première phrase de la page.
  useEffect(() => {
    if (!progR.current || !flow.current) return;
    // calculé après l'animation de la page (lire la position des paragraphes force une mise en page : ça saccadait sur téléphone)
    const t = setTimeout(() => { if (!flow.current) return; try {
      const g = geom(); const pg = (el) => Math.max(0, Math.round((el.offsetLeft - g.pad) / g.step));
      const x = spread * g.step + g.pad + 2 + g.step * (g.p - 1);
      const chs = [...flow.current.querySelectorAll("[data-ch]")].filter((el) => !Number.isNaN(Number(el.dataset.ch)));
      let ci = 0; let k = 0; chs.forEach((el, j) => { if (el.offsetLeft <= x) { ci = Number(el.dataset.ch); k = j; } });
      const a = chs[k] ? pg(chs[k]) : 0; const b = chs[k + 1] ? pg(chs[k + 1]) : pages;
      const inCh = Math.max(0, Math.min(1, (spread + per - a) / Math.max(1, b - a)));
      const left = spread * g.step + g.pad - 4; const first = [...flow.current.querySelectorAll(".ax-ch p")].find((el) => el.offsetLeft >= left && el.textContent.trim());
      const excerpt = first ? first.textContent.trim().split(/(?<=[.!?…])\s/)[0].slice(0, 160) : "";
      progR.current(ci, Math.min(1, (spread + per) / Math.max(1, pages)), { inCh, excerpt, page: spread });
    } catch (_) {} }, 1400);
    return () => clearTimeout(t);
  }, [spread, pages, per]); // eslint-disable-line react-hooks/exhaustive-deps
  const cueR = useRef(onCue); cueR.current = onCue;
  const doneR = useRef(false); // arrivé à la dernière page : le livre passe dans « Lus »
  useEffect(() => { if (!doneR.current && pages > 2 && page + per >= pages && onDone) { doneR.current = true; onDone(); } }, [page, pages, per]); // eslint-disable-line react-hooks/exhaustive-deps
  const go = (d) => {
    const n = Math.max(0, Math.min(pages - 1, spread + d * per));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // Téléphone : la page glisse sous le doigt, quel que soit le format. Pas d'effet par-dessus le texte
    // (les calques animés sur une colonne aussi large faisaient clignoter l'écran).
    const phone = per === 1;
    if (!phone && n !== spread) { // ordinateur, cassette, disque : la page change d'un coup, une courte animation l'accompagne
      clearTimeout(anim.current); anim.current = 0; setPage(n); turnFx(n > spread ? 1 : -1);
      if (!reduce) {
        const dir = n > spread ? 1 : -1; clearTimeout(turnT.current); setTurn({ dir: dir > 0 ? "next" : "prev", k: Date.now() }); turnT.current = setTimeout(() => setTurn(null), fmt === "vinyle" ? 640 : 520);
        const fl = flow.current; try { fl.getAnimations?.().forEach((x) => x.cancel()); fl.animate?.(fmt === "vhs" ? VHS_KF : fmt === "vinyle" ? VINYL_KF : PAPER_KF(dir), fmt === "vhs" ? { duration: 380, easing: "linear" } : fmt === "vinyle" ? { duration: 620, easing: "cubic-bezier(.25,.7,.3,1)" } : { duration: 340, easing: "cubic-bezier(.2,.7,.3,1)" }); } catch (_) {}
      }
      return;
    }
    anim.current = anim.current || 1; if (n !== spread) { setPage(n); turnFx(n > spread ? 1 : -1);
      // téléphone : la même animation qu'à l'ordinateur accompagne la page (reflet du papier, bande VHS « ▶▶ FF », disque)
      if (!reduce) {
        const dir = n > spread ? 1 : -1; clearTimeout(turnT.current); setTurn({ dir: dir > 0 ? "next" : "prev", k: Date.now() }); turnT.current = setTimeout(() => setTurn(null), fmt === "vinyle" ? 640 : 520);
        if (fmt !== "livre") setTimeout(() => { const fl = flow.current; try { fl?.animate?.(fmt === "vhs" ? VHS_KF : VINYL_KF, fmt === "vhs" ? { duration: 340, easing: "linear" } : { duration: 520, easing: "cubic-bezier(.25,.7,.3,1)" }); } catch (_) {} }, 200);
      }
    } else if (flow.current) { const g = geom(); flow.current.scrollTo({ left: Math.round(spread * g.step), behavior: "smooth" }); anim.current = setTimeout(() => { anim.current = 0; }, 420); } };
  // À la souris : on attrape la page et on la fait glisser, comme au doigt. Au pavé tactile : un glissement horizontal à deux doigts.
  const onMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest?.("a,button,iframe,input,textarea,figure,.ax-yt-ed")) return;
    drag.current = { x: e.clientX, y: e.clientY, t: Date.now(), base: flow.current?.scrollLeft || 0, on: false };
    const move = (ev) => { const d = drag.current; if (!d || !flow.current) return; const dx = ev.clientX - d.x, dy = ev.clientY - d.y;
      if (!d.on && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) { d.on = true; document.body.classList.add("ax-grabbing"); window.getSelection?.()?.removeAllRanges(); }
      if (d.on) ev.preventDefault(); };
    const up = (ev) => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); document.body.classList.remove("ax-grabbing");
      const d = drag.current; drag.current = null; if (!d?.on) return; const dx = ev.clientX - d.x, dt = Date.now() - d.t; const fast = Math.abs(dx) / Math.max(1, dt) > 0.35;
      if (Math.abs(dx) > 50 || (fast && Math.abs(dx) > 25)) go(dx < 0 ? 1 : -1); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
  };
  const onWheel = (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; const w = wheel.current; const now = Date.now();
    if (now < w.lock) return; w.x += e.deltaX; if (Math.abs(w.x) > 70) { go(w.x > 0 ? 1 : -1); w.x = 0; w.lock = now + 550; }
  };
  const onTouchStart = (e) => { cancelAnimationFrame(glide.current); if (anim.current) { clearTimeout(anim.current); anim.current = 0; } const t = e.touches[0]; drag.current = { x: t.clientX, y: t.clientY, t: Date.now(), base: flow.current?.scrollLeft || 0, on: false }; };
  const onTouchMove = (e) => {
    const d = drag.current; if (!d || !flow.current) return; const t = e.touches[0]; const dx = t.clientX - d.x, dy = t.clientY - d.y;
    if (!d.on && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) d.on = true;
    if (d.on) { const atEdge = (dx > 0 && spread === 0) || (dx < 0 && spread + per >= pages); flow.current.scrollLeft = d.base - dx * (atEdge ? 0.25 : 1); }
  };
  const onTouchEnd = (e) => {
    const d = drag.current; drag.current = null; if (!d) return; const t = e.changedTouches[0]; const dx = t.clientX - d.x, dt = Date.now() - d.t;
    if (d.on) { const fast = Math.abs(dx) / Math.max(1, dt) > 0.35; go(Math.abs(dx) > (flow.current?.clientWidth || 300) * 0.22 || (fast && Math.abs(dx) > 30) ? (dx < 0 ? 1 : -1) : 0); return; }
    // toucher les bords de la page la tourne (sauf sur un lien, une vidéo, une image)
    if (Math.abs(dx) < 8 && dt < 400 && !e.target.closest?.("a,button,iframe,input,textarea,figure,.ax-yt-ed")) { const r = e.currentTarget.getBoundingClientRect(); const x = (t.clientX - r.left) / r.width; if (x > 0.66) go(1); else if (x < 0.34) go(-1); }
  };
  useEffect(() => {
    const k = (e) => { if (paused) return; if (e.key === "Escape") { e.stopPropagation(); vid ? setVid(false) : notes ? setNotes(false) : music ? setMusic(false) : toc ? setToc(false) : onClose(); return; } if (/^(INPUT|TEXTAREA)$/.test(e.target?.tagName) || e.target?.isContentEditable) return; if ((e.key === "n" || e.key === "N") && at && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); setNotes((x) => !x); setToc(false); setMusic(false); return; } if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); go(1); } if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); } };
    window.addEventListener("keydown", k, true); return () => window.removeEventListener("keydown", k, true);
  });
  const chIdxAt = () => { try { const g = geom(); const x = spread * g.step + g.pad + 2; let n = 0; flow.current.querySelectorAll("[data-ch]").forEach((el) => { if (/^\d+$/.test(el.dataset.ch) && el.offsetLeft <= x + g.step * (g.p - 1)) n = Number(el.dataset.ch); }); return n; } catch (_) { return 0; } };
  const chapterAt = () => { try { const g = geom(); const x = spread * g.step + g.pad + 2; let t = ""; flow.current.querySelectorAll("[data-ch]").forEach((el) => { if (el.offsetLeft <= x + g.step * (g.p - 1)) t = el.querySelector("h2")?.textContent || t; }); return t; } catch (_) { return ""; } };
  const jump = (i) => { const el = flow.current?.querySelector(`[data-ch="${i}"]`); if (!el) return; const g = geom(); setPage(Math.max(0, Math.round((el.offsetLeft - g.pad) / g.step))); setToc(false); };
  const T = TYPES[book.type] || TYPES.recit; const R = ROOMS.find((r) => r.key === book.room);
  const half = Math.ceil(book.chapters.length / 2); const track = (i) => (i < half ? "A" : "B") + (i < half ? i + 1 : i - half + 1);
  // Le corps du livre ne dépend que du livre : tourner une page ne le redessine pas.
  const swapR = useRef(onSwap); swapR.current = onSwap;
  const swapS = useMemo(() => (onSwap ? (a, b) => swapR.current?.(a, b) : null), [!!onSwap]); // eslint-disable-line react-hooks/exhaustive-deps
  const remR = useRef(onRemoveVideo); remR.current = onRemoveVideo;
  const removeS = useMemo(() => (onRemoveVideo ? (id) => remR.current?.(id) : null), [!!onRemoveVideo]); // eslint-disable-line react-hooks/exhaustive-deps
  // Où l'on est : le dernier paragraphe qui commence sur la page (ou la double page) affichée
  const hereSi = () => { try { const g = geom(); const end = (spread + per) * g.step + g.pad - 4; let si = null;
    flow.current.querySelectorAll("[data-si]").forEach((el) => { if (el.offsetLeft < end && el.dataset.si !== "") si = Number(el.dataset.si); });
    return si ?? (book.chapters[0]?.si ?? -1); } catch (_) { return -1; } };
  const artTerm = book.art || sgdbTerm(book);
  const [plan, setPlan] = useState(null);
  useEffect(() => { let on = true; setPlan(null); planArt(book, artTerm, cover).then((p) => { if (!on) return; setPlan(p); relayoutRef.current?.(); }, () => on && setPlan(new Map())); return () => { on = false; }; }, [book, cover]); // eslint-disable-line react-hooks/exhaustive-deps
  const body = useMemo(() => (<>
            <section className="ax-titlepage">
              {fmt === "vinyle" ? <span className="ax-tp-sleeve"><span className="ax-tp-disc" />{cover ? <span className="ax-tp-art" style={{ backgroundImage: `url(${cover})` }} /> : <span className="ax-tp-art blank" />}</span> : cover && <span className="ax-tp-art" style={{ backgroundImage: `url(${cover})` }} />}
              <p className="mono ax-tp-room">{book.roomLabel ? book.roomLabel.toUpperCase() : R ? `${R.kanji} ${R.label.toUpperCase()}` : "MES LIVRES"}</p>
              <h1>{book.title}</h1>
              {book.sub && <p className="ax-tp-sub">{book.sub}</p>}
              <span className="ax-rule" />
              <p className="mono ax-tp-type">{T.label.toUpperCase()} · {readingTime(book.words)}{isShort(book) && <span className="ax-todo-in"> · À COMPLÉTER</span>}</p>
              {book.about && <p className="ax-tp-about">{book.about}</p>}
              <p className="mono ax-tp-foot">{book.house || "BIBLIOTHÈQUE D'ALEXANDRIE"} · COTE {book.cote}</p>
            </section>
            {book.chapters.map((c, i) => (
              <section className="ax-ch" key={i} data-ch={i}>
                {c.title && <header><span className="mono">{fmt === "vinyle" ? track(i) : String(i + 1).padStart(2, "0")}</span><h2>{c.title}</h2></header>}
                {c.blocks.map((b, j) => b.t === "q" ? <blockquote key={j} data-si={b.si}><p>{inline(b.x)}</p>{b.by && <cite>{b.by}</cite>}</blockquote>
                  : b.t === "h" ? <h3 key={j} data-si={b.si}>{inline(b.x)}</h3>
                  : b.t === "img" ? (plan?.get(b.si)?.hide ? null : <Fig key={j} b={b} si={b.si} />)
                  : b.t === "yt" ? <YtFig key={j} b={b} si={b.si} onSwap={swapS} onRemove={removeS} />
                  : b.t === "art" ? <ArtFig key={j} b={b} si={b.si} term={artTerm} pick={plan ? plan.get(b.si) || null : undefined} />
                  : b.t === "box" ? <aside className="ax-box" key={j} data-si={b.si}><b className="mono">{b.label || "À RETENIR"}</b><p>{inline(b.x)}</p></aside>
                  : b.t === "mus" ? <p key={j} data-si={b.si} className="ax-cue-p"><button type="button" className="ax-cue" data-url={b.url} onClick={() => cueR.current?.(b.url, b.x)} data-testid="alex-cue"><IoMusicalNotes size={14} /> <span>{b.x}</span></button></p>
                  : <p key={j} data-si={b.si} className={j === 0 && c.title ? "first" : ""}>{inline(b.x)}</p>)}
              </section>
            ))}
            {(book.links || []).length > 0 && (
              <section className="ax-ch ax-more" data-ch="more">
                <header><span className="mono">→</span><h2>Pour aller plus loin</h2></header>
                <ul>{book.links.map((l, i) => <li key={i}><a href={linkUrl(l, book.title)} target="_blank" rel="noopener noreferrer" title={l.url ? "Ouvrir" : "Rechercher"}>{l.label} <IoOpenOutline size={12} /></a>{l.note && <small>{l.note}</small>}</li>)}</ul>
              </section>
            )}
  </>), [book, fmt, cover, swapS, plan]); // eslint-disable-line react-hooks/exhaustive-deps
  const noteMarks = notesOf(notesItemOf(at, book.id)).map((n) => ({ id: n.id, t: n.t, at: Math.max(0, Math.min(pages - 1, n.n ? Math.round((n.p / n.n) * pages) : n.p)) }));
  return createPortal(
    <div onMouseMove={full ? wake : undefined} onTouchStart={full ? wake : undefined} className={(full ? "ax-full" + (ui ? " ui" : "") + " " : "") + "ax-reader ax-view fmt-" + fmt + ` cf-lh-${cf.lh || "m"} cf-mg-${cf.mg || "m"}` + (cf.ff ? " cf-ff-" + cf.ff : "") + (cf.bg ? " cf-bg-" + cf.bg : "") + (fmt === "vhs" ? " skin-vhs" : "") + (fmt === "vinyle" ? " skin-vinyle" : "") + (look ? ` has-look look-${look.key} tex-${look.tex}` + (look.dark ? " look-dark" : " look-light") : "")} style={{ "--h": book.color ?? hue(book.title), "--ax-fs": fs, ...(look ? { "--bk-d": `"${look.d}"`, "--bk-r": `"${look.r}"`, "--paper": look.p, "--paper-2": look.p2, "--paper-3": look.p3, "--ink": look.ink, "--ink-2": look.ink2, "--acc": look.acc, "--orn": `"${look.orn}"` } : {}) }} data-testid="alex-reader" role="dialog" aria-modal="true" aria-label={book.title}>
      <header className="ax-rbar">
        <button className="ax-rb" onClick={onClose} data-testid="alex-close"><IoArrowBack size={15} /> <span>{backLabel}</span></button>
        <p className="mono ax-rpath">{path || <>ALEXANDRIE / {(R?.label || "MES LIVRES").toUpperCase()} / <b>{book.cote}</b></>}</p>
        <span className="grow" />
        {book.mine && !book.src ? onEdit && <button className="ax-rb" onClick={() => onEdit(book.itemId)}><IoCreateOutline size={15} /> <span>Écrire</span></button>
          : onModify && <button className="ax-rb" onClick={onModify} title="Modifier le texte, les images, les vidéos" data-testid="alex-modify"><IoCreateOutline size={15} /> <span>Modifier</span></button>}
        {onIllustrate && !(book.mine && !book.src) && <button className="ax-rb" onClick={onIllustrate} title="Ajouter une image à chaque chapitre qui n'en a pas (SteamGridDB, MyAnimeList, Open Library, Wikimedia Commons), jamais deux fois la même" data-testid="alex-illustrate"><IoImagesOutline size={15} /> <span>Illustrer</span></button>}
        {at && <button className={"ax-rb" + (notes ? " on" : "")} onClick={() => { setNotes((n) => !n); setToc(false); setMusic(false); }} aria-expanded={notes} title="Notes (touche N)" data-testid="alex-notes"><IoPencil size={14} /> <span>Notes{noteMarks.length ? ` · ${noteMarks.length}` : ""}</span></button>}
        {radio && <button className={"ax-rb" + (radio.playing ? " on" : "")} onClick={() => { setMusic((m) => !m); setToc(false); setNotes(false); }} aria-expanded={music} data-testid="alex-music" title={radio.pl ? radio.info?.title || radio.pl.title : "Musique"}><IoMusicalNotes size={15} /> <span>{radio.pl ? <span className="ax-rb-now">{radio.info?.title || radio.pl.title}</span> : "Musique"}</span></button>}
        {!radio && workMusic && <button className={"ax-rb" + (workMusic.playing ? " on" : "")} onClick={workMusic.toggle} title={workMusic.playing ? "Mettre la musique en pause" : "Lancer la musique de lecture"} data-testid="alex-work-music">{workMusic.playing ? <IoPause size={15} /> : <IoMusicalNotes size={15} />} <span>{workMusic.playing ? <span className="ax-rb-now">{workMusic.title || "Musique"}</span> : "Musique"}</span></button>}
        {radio?.pl && <button className="ax-rb ax-rb-sq" onClick={radio.toggle} title={radio.playing ? "Pause" : "Lecture"} data-testid="alex-music-toggle">{radio.playing ? <IoPause size={15} /> : <IoPlay size={15} />}</button>}
        {radio?.pl && <button className="ax-rb ax-rb-sq" onClick={radio.next} title="Morceau suivant" data-testid="alex-music-next"><IoPlaySkipForward size={15} /></button>}
        {onAddVideo && <button className={"ax-rb" + (vid ? " on" : "")} onClick={() => { setVid((v) => !v); setToc(false); setMusic(false); setNotes(false); }} aria-expanded={vid} title="Ajouter une vidéo YouTube à cette page" data-testid="alex-addvid"><IoLogoYoutube size={15} /> <span>Vidéo</span></button>}
        {!noPdf && <button className="ax-rb" onClick={() => exportBook(book, cover, bookNotes(at, book.id, pages))} title="Exporter le livre en PDF, avec tes notes" data-testid="alex-pdf"><IoPrintOutline size={15} /> <span>PDF</span></button>}
        {onEditChapter && <button className="ax-rb" onClick={() => onEditChapter(chIdxAt())} title="Modifier ce chapitre ici même" data-testid="alex-edit-chapter"><IoCreateOutline size={15} /> <span>Modifier</span></button>}
        <span className="ax-aa-wrap">
          <button className={"ax-rb ax-rb-sq ax-aa-b" + (aa ? " on" : "")} onClick={() => setAa((v) => !v)} aria-expanded={aa} title="Confort de lecture : taille, interligne, police, page" data-testid="alex-aa">Aa</button>
          {aa && createPortal(<>
            <span className="ax-aa-scrim" onClick={() => setAa(false)} />
            <span className="ax-aa ax-comfort" role="group" aria-label="Confort de lecture" data-testid="alex-aa-panel">
              <span className="ax-cf-h mono">CONFORT DE LECTURE<button onClick={() => setAa(false)} aria-label="Fermer"><IoClose size={15} /></button></span>
              <span className="ax-cf-row"><small className="mono">TAILLE</small>
                <button onClick={() => setFs((v) => Math.max(0.8, Math.round((v - 0.1) * 10) / 10))} disabled={fs <= 0.8} aria-label="Texte plus petit" data-testid="alex-aa-minus">A−</button>
                <b className="mono">{Math.round(fs * 100)}%</b>
                <button onClick={() => setFs((v) => Math.min(1.6, Math.round((v + 0.1) * 10) / 10))} disabled={fs >= 1.6} aria-label="Texte plus grand" data-testid="alex-aa-plus">A+</button></span>
              <span className="ax-cf-row"><small className="mono">INTERLIGNE</small>{[["s", "Serré"], ["m", "Normal"], ["l", "Aéré"]].map(([k, t]) => <button key={k} className={cf.lh === k ? "on" : ""} onClick={() => setCfK("lh", k)}>{t}</button>)}</span>
              <span className="ax-cf-row"><small className="mono">POLICE</small>{[["", "Livre"], ["sans", "Moderne"], ["lisible", "Très lisible"]].map(([k, t]) => <button key={k} className={(cf.ff || "") === k ? "on" : ""} onClick={() => setCfK("ff", k)} data-testid={`alex-ff-${k || "book"}`}>{t}</button>)}</span>
              <span className="ax-cf-row"><small className="mono">PAGE</small>{[["", "Du livre"], ["clair", "Claire"], ["sepia", "Sépia"], ["nuit", "Nuit"]].map(([k, t]) => <button key={k} className={"sw-" + (k || "book") + ((cf.bg || "") === k ? " on" : "")} onClick={() => setCfK("bg", k)} data-testid={`alex-bg-${k || "book"}`}><i />{t}</button>)}</span>
              <span className="ax-cf-row"><small className="mono">MARGES</small>{[["s", "Étroites"], ["m", "Normales"], ["l", "Larges"]].map(([k, t]) => <button key={k} className={(cf.mg || "m") === k ? "on" : ""} onClick={() => setCfK("mg", k)}>{t}</button>)}</span>
              {(fs !== 1 || cf.lh !== "m" || cf.ff || cf.bg || (cf.mg && cf.mg !== "m")) && <button className="rst" onClick={() => { setFs(1); setCf({ lh: "m" }); }}>Tout remettre comme le livre</button>}
            </span>
          </>, document.body)}
        </span>
        {onCover && <button className="ax-rb" onClick={onCover} title="Changer l'artwork du livre" data-testid="alex-reader-cover"><IoImageOutline size={15} /> <span>Artwork</span></button>}
        <button className={"ax-rb ax-rb-sq" + (full ? " on" : "")} onClick={toggleFull} title={full ? "Quitter le plein écran" : "Plein écran : le livre prend tout l'écran"} aria-pressed={full} data-testid="alex-fullscreen">{full ? <IoContractOutline size={15} /> : <IoExpandOutline size={15} />}</button>
        <button className="ax-rb" onClick={() => { setToc((t) => !t); setMusic(false); setVid(false); }} aria-expanded={toc} data-testid="alex-toc"><IoList size={16} /> <span>Sommaire</span></button>
        <button className="ax-rb" onClick={() => { const v = !turnSound; setTurnSound(v); write("nx-alex-turn-sound", v); if (v) playPageTurn(fmt, 1); }} aria-pressed={!turnSound} title={turnSound ? "Couper le bruit des pages" : "Remettre le bruit des pages"} data-testid="alex-turn-sound">{turnSound ? <IoVolumeHighOutline size={16} /> : <IoVolumeMuteOutline size={16} />}</button>
        <button className={"ax-rb" + (mark ? " on" : "")} onClick={() => { setMark((m) => !m); sfx?.("select"); }} aria-pressed={mark} title="Marque-page">{mark ? <IoBookmark size={16} /> : <IoBookmarkOutline size={16} />}</button>
      </header>
      <div className="ax-stage">
        <button className="ax-turn l" onClick={() => go(-1)} disabled={spread === 0} aria-label="Page précédente"><IoArrowBack size={20} /></button>
        <div ref={bookEl} className={"ax-book" + (per === 1 ? " single" : "") + (ready ? "" : " ax-pending")} onMouseDown={onMouseDown} onWheel={onWheel} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={() => { drag.current = null; go(0); }}>
          {turn && <i key={turn.k} className={"ax-turnfx " + turn.dir} aria-hidden="true"><b /><em>{turn.dir === "next" ? "▶▶ FF" : "◀◀ REW"}</em></i>}
          <div className="ax-flow" ref={flow} onScroll={() => { try { if (drag.current?.on || anim.current) return; const g = geom(); const want = Math.round(spread * g.step); if (Math.abs(g.el.scrollLeft - want) > 2) g.el.scrollLeft = want; } catch (_) {} }}>
            {body}
          </div>
        </div>
        <button className="ax-turn r" onClick={() => go(1)} disabled={spread + per >= pages} aria-label="Page suivante"><IoArrowForward size={20} /></button>
      </div>
      <footer className="ax-rfoot mono"><button className="ax-fturn" onClick={() => go(-1)} disabled={spread === 0} aria-label="Page précédente" data-testid="alex-prev"><IoArrowBack size={18} /></button><span>{book.title.toUpperCase()}</span><span className="ax-prog"><i style={{ width: `${Math.min(100, ((spread + per) / pages) * 100)}%` }} />{noteMarks.map((n) => <button key={n.id} className="ax-pmark" style={{ left: `${(n.at / Math.max(1, pages - 1)) * 100}%` }} onClick={() => { setPage(n.at); setNotes(true); }} title={`Note page ${n.at + 1} : ${n.t.slice(0, 80)}`} aria-label={`Note page ${n.at + 1}`} />)}</span><span>{fmt === "vinyle" ? (spread < pages / 2 ? "FACE A · " : "FACE B · ") : ""}PAGE {Math.min(pages, spread + 1)}{per === 2 && spread + 2 <= pages ? `–${spread + 2}` : ""} / {pages}</span><button className="ax-fturn" onClick={() => go(1)} disabled={spread + per >= pages} aria-label="Page suivante" data-testid="alex-next"><IoArrowForward size={18} /></button></footer>
      {vid && onAddVideo && <VideoAdd book={book} page={spread + 1} onClose={() => setVid(false)} onAdd={async (id, cap) => { if (await onAddVideo(hereSi(), id, cap)) setVid(false); }} />}
      {music && radio && <ReaderMusic radio={radio} onClose={() => setMusic(false)} />}
      {notes && at && <ReaderNotes at={at} book={book} page={spread} pages={pages} chapter={chapterAt()} onClose={() => setNotes(false)} onJump={(p) => { setPage(Math.max(0, Math.min(pages - 1, p))); sfx?.("nav"); }} />}
      {toc && (
        <aside className="ax-toc" data-testid="alex-toc-panel">
          <p className="mono">SOMMAIRE</p>
          {book.chapters.map((c, i) => <button key={i} onClick={() => jump(i)}><span className="mono">{fmt === "vinyle" ? track(i) : String(i + 1).padStart(2, "0")}</span>{c.title || "Texte"}</button>)}
          {(book.links || []).length > 0 && <button onClick={() => jump("more")}><span className="mono">→</span>Pour aller plus loin</button>}
        </aside>
      )}
    </div>,
    document.querySelector(".at-root") || document.body
  );
}

// Index de la bibliothèque : même répertoire que l'Index des archives, mais sur les rayonnages (titres et plein texte).
const STABS = [["all", "TOUT"], ["lire", "À LIRE"], ["up", "À PARAÎTRE"], ["pensee", "PENSÉE"], ["recit", "RÉCIT"], ["apprentissage", "APPRENTISSAGE"]];
export function AlexSearch({ books, upcoming = [], onClose, onOpen, onGoto }) {
  const { sfx } = useApp();
  const [q, setQ] = useState(""); const [tab, setTab] = useState("all"); const [sel, setSel] = useState(0);
  const input = useRef(null); const list = useRef(null);
  useEffect(() => { input.current?.focus(); sfx?.("open"); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const texts = useMemo(() => Object.fromEntries(books.map((b) => [b.id, `${b.title} ${b.sub || ""} ${b.about || ""} ${(b.text || "").replace(/[#>*!]|::/g, " ")}`.toLowerCase()])), [books]);
  const needle = q.trim().toLowerCase();
  const results = useMemo(() => {
    const room = (k) => ROOMS.find((r) => r.key === k);
    const a = books.filter((b) => !needle || texts[b.id].includes(needle)).map((b) => {
      const t = texts[b.id]; const p = needle ? t.indexOf(needle) : -1; const headLen = `${b.title} ${b.sub || ""}`.length;
      return { key: b.id, up: false, type: b.type, code: b.cote || "MES-LIV", kj: room(b.room)?.kanji || "私", title: b.title, sub: (b.sub || "").toUpperCase(), snip: p > headLen ? "…" + t.slice(Math.max(0, p - 40), p + 70).replace(/\s+/g, " ") + "…" : "", ty: TYPES[b.type]?.label || "Récit", where: room(b.room)?.label || "Mes livres", dur: b.words ? readingTime(b.words) : "", run: () => onOpen(b) };
    });
    const u = upcoming.filter((b) => !needle || `${b.title} ${b.sub || ""}`.toLowerCase().includes(needle)).slice(0, needle ? 40 : 8).map((b) => (
      { key: b.id, up: true, type: b.type, code: "À VENIR", kj: room(b.room)?.kanji, title: b.title, sub: (b.sub || "").toUpperCase(), snip: "", ty: TYPES[b.type]?.label, where: room(b.room)?.label, dur: "à paraître", run: () => onGoto(b) }));
    return [...a, ...u].filter((r) => tab === "all" || (tab === "lire" ? !r.up : tab === "up" ? r.up : r.type === tab)).slice(0, 60);
  }, [needle, books, upcoming, texts, tab, onOpen, onGoto]);
  useEffect(() => setSel(0), [needle, tab]);
  useEffect(() => { list.current?.querySelector(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" }); }, [sel]);
  const close = () => { sfx?.("close"); onClose(); };
  const onKey = (e) => {
    if (e.key === "Escape") { e.stopPropagation(); close(); }
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); sfx?.("hover"); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); sfx?.("hover"); }
    if (e.key === "Tab") { e.preventDefault(); const i = STABS.findIndex(([k]) => k === tab); setTab(STABS[(i + (e.shiftKey ? STABS.length - 1 : 1)) % STABS.length][0]); sfx?.("nav"); }
    if (e.key === "Enter") results[sel]?.run();
  };
  return createPortal(
    <div className="ai-wrap ax-search" onClick={close} data-testid="alex-search">
      <div className="ai" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="axs-t">
        <div className="ai-top"><span>ALEXANDRIE / RÉPERTOIRE DES RAYONNAGES</span><button onClick={close} aria-label="Fermer">FERMER <IoClose size={13} /></button></div>
        <h2 id="axs-t" className="ai-title">INDEX DE LA BIBLIOTHÈQUE <small>蔵書検索</small></h2>
        <label className="ai-in"><IoSearch size={17} aria-hidden="true" /><input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Titre, nom, idée, ou un mot à l'intérieur d'un livre…" aria-label="Chercher dans la bibliothèque" data-testid="alex-search-input" /><kbd>ÉCHAP</kbd></label>
        <div className="ai-tabs" role="tablist" aria-label="Filtrer">{STABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); sfx?.("nav"); input.current?.focus(); }}>{l}</button>)}</div>
        <div className="ai-head" aria-hidden="true"><span>COTE</span><span>TITRE / 題名</span><span>GENRE</span><span>SALLE</span><span>DURÉE</span></div>
        <div className="ai-list" ref={list}>
          {results.length === 0 && <p className="ai-empty">Aucun volume ne correspond{needle ? ` à « ${q.trim()} »` : ""}.</p>}
          {results.map((r, i) => (
            <button key={r.key} data-i={i} className={"ai-row" + (i === sel ? " on" : "") + (r.up ? " ax-row-up" : "")} style={{ animationDelay: `${Math.min(i, 12) * 22}ms` }} onMouseEnter={() => setSel(i)} onClick={r.run}>
              <span className="code">{r.code}</span>
              <span className="tx"><b><i>{r.kj}</i>{r.title}</b>{r.sub && <small>{r.sub}</small>}{r.snip && <em>{r.snip}</em>}</span>
              <span className="ty">{r.ty}</span><span className="wh">{r.where}</span><span className="dt">{r.dur}</span>
            </button>
          ))}
        </div>
        <div className="ai-foot"><span>↑ ↓ PARCOURIR · ENTRÉE OUVRIR · TAB FILTRER</span><span className="db"><i />{results.length} VOLUME{results.length > 1 ? "S" : ""}</span></div>
      </div>
    </div>,
    document.querySelector(".at-root") || document.body
  );
}

// Un rayon : une rangée de volumes sur sa planche, avec son étiquette. Partagé avec la station publique (Nexus).
export function Rail({ code, label, list, upFrom, selId, onSel, covers, wish, onOpen, kanji, menuFor, stOf }) {
  const rail = useRef(null);
  const k = list.findIndex((b) => b.id === selId);
  useEffect(() => { const box = rail.current; const el = box?.querySelector(".ax-cover"); if (!el) return; box.scrollTo({ left: el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2, behavior: "smooth" }); }, [selId, list.length]);
  const move = (d) => { const x = list[Math.max(0, Math.min(list.length - 1, (k < 0 ? 0 : k) + d))]; if (x) onSel(x.id); };
  const page = (d) => rail.current?.scrollBy({ left: d * rail.current.clientWidth * 0.7, behavior: "smooth" });
  return (
    <div className="ax-rack">
      <span className="ax-rack-k" aria-hidden="true">{kanji}</span>
      <button className="ax-step l" onClick={() => (k < 0 ? page(-1) : move(-1))} aria-label="Précédent"><IoArrowBack size={17} /></button>
      <div className="ax-rail" ref={rail} tabIndex={0} onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); move(1); } if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); } if (e.key === "Enter" && k >= 0) onOpen(list[k], k >= upFrom); }}>
        {list.map((b, i) => <Volume key={b.id} b={b} sel={i === k} cover={covers[b.id]} upcoming={i >= upFrom} wished={wish.includes(b.id)} onPick={() => onSel(b.id)} onOpen={() => onOpen(b, i >= upFrom)} menu={menuFor && menuFor(b, i >= upFrom)} st={i < upFrom && stOf ? stOf(b.id) : null} />)}
      </div>
      <button className="ax-step r" onClick={() => (k < 0 ? page(1) : move(1))} aria-label="Suivant"><IoArrowForward size={17} /></button>
      <p className="ax-rack-tag mono"><b>{code}</b><span>{label}</span><i>{list.length} VOLUME{list.length > 1 ? "S" : ""}</i></p>
    </div>
  );
}

// La salle en grille : toutes les couvertures d'un coup d'œil. Un clic choisit (la notice s'affiche au-dessus), un double-clic ouvre.
function Grid({ list, upFrom, selId, onSel, covers, onOpen, menuFor, stOf }) {
  return (
    <div className="ax-grid" data-testid="alex-grid">
      {list.map((b, i) => { const u = i >= upFrom; const pm = menuFor ? pressMenu(menuFor(b, u)) : {}; const cv = covers[b.id];
        return (
          <button key={b.id} className={"ax-gc" + (b.id === selId ? " on" : "") + (u ? " up" : "")} style={{ animationDelay: `${Math.min(i, 30) * 18}ms` }} onClick={() => onSel(b.id)} onDoubleClick={() => onOpen(b, u)} {...pm} onContextMenu={(e) => { onSel(b.id); pm.onContextMenu?.(e); }} data-testid={`alex-gc-${b.id}`}>
            <Face b={b} cover={cv} upcoming={u} st={!u && stOf ? stOf(b.id) : null} />
            <b>{b.title}</b>{b.sub && <small>{b.sub}</small>}
          </button>
        ); })}
    </div>
  );
}

// Une salle : on y est entré par sa porte. Rayon A (à lire), notice du volume choisi, rayon B (à paraître).
function Room({ r, n, here, up, selId, onSel, covers, wish, prog, onRead, onWish, onWriteUp, onHideUp, onCover, onEdit, onModify, menuFor, noteCount, onNotes, favs, onFav, view, stOf, onStatus }) {
  const all = [...here, ...up]; const cur = all.find((b) => b.id === selId) || all[0]; const isUp = cur ? !here.includes(cur) : false;
  const id = cur?.id; const pg = cur && prog[cur.id]; const T = TYPES[cur?.type] || TYPES.recit; const fmt = cur ? fmtOf(cur) : "livre";
  const act = (b, u) => (u ? onWish(b.id) : onRead(b));
  const num = String(n).padStart(2, "0");
  const split = here.length >= 6 && up.length > 0;
  const grid = view === "grille"; const nref = useRef(null);
  useEffect(() => { if (grid && selId) nref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [selId]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="ax-room" aria-label={r.label} data-testid={`alex-room-${r.key}`} key={r.key}>
      {grid ? null : split ? (here.length > 0 && <Rail code={`RAYON ${num}-A`} label={r.format === "vhs" ? "À DÉCOUVRIR" : "À LIRE"} list={here} upFrom={here.length} selId={id} onSel={onSel} covers={covers} wish={wish} onOpen={act} kanji={r.kanji} menuFor={menuFor} stOf={stOf} />)
        : all.length > 0 && <Rail code={`RAYON ${num}-A`} label={(r.format === "vhs" ? "À DÉCOUVRIR" : "À LIRE") + (up.length ? " · PUIS À PARAÎTRE" : "")} list={all} upFrom={here.length} selId={id} onSel={onSel} covers={covers} wish={wish} onOpen={act} kanji={r.kanji} menuFor={menuFor} stOf={stOf} />}
      {cur && (
        <div className={"ax-notice" + (grid ? " cv" : "")} key={cur.id} ref={nref}>
          {grid && <span className="ax-notice-cv"><Face b={cur} cover={covers[cur.id]} upcoming={isUp} wished={wish.includes(cur.id)} st={isUp ? null : stOf(cur.id)} /></span>}
          <p className="mono meta">{isUp ? "À PARAÎTRE" : cur.cote || "MES LIVRES"} · {T.label.toUpperCase()} · {fmt === "vhs" ? "CASSETTE" : fmt === "vinyle" ? "DISQUE" : "LIVRE"}{!isUp && isShort(cur) ? " · À COMPLÉTER" : ""}{!isUp && cur.words ? ` · ${readingTime(cur.words).toUpperCase()}` : ""}</p>
          <h3>{cur.title}{favs.includes(cur.id) && <IoHeart className="ax-favh" size={20} aria-label="Coup de cœur" />}</h3>
          {cur.sub && <p className="sub">{cur.sub}</p>}
          {cur.about && <p className="ab">{cur.about}</p>}
          {isUp && <p className="ab">Pas encore écrit. Écris-le toi-même, marque-le d'une étoile pour qu'il passe en premier, ou retire-le des rayons.</p>}
          <div className="ax-acts">
            {isUp ? <button className="at-btn" onClick={() => onWish(cur.id)} data-testid="alex-wish">{wish.includes(cur.id) ? <><IoStar size={15} /> Demandé</> : <><IoStarOutline size={15} /> Je veux le lire</>}</button>
              : <button className="at-btn" onClick={() => onRead(cur)} data-testid="alex-read"><IoPlay size={14} /> {pg && pg.page > 0 ? `Reprendre page ${pg.page + 1}` : fmt === "vhs" ? "Lancer" : "Lire"}</button>}
            {isUp && <button className="ax-ghost" onClick={() => onWriteUp(cur)} data-testid="alex-up-write"><IoCreateOutline size={15} /> Écrire ce livre</button>}
            {isUp && <button className="ax-ghost" onClick={() => onHideUp(cur)} data-testid="alex-up-hide"><IoTrashOutline size={15} /> Retirer</button>}
            {cur.mine && !cur.src && <button className="ax-ghost" onClick={() => onEdit(cur.itemId)}><IoCreateOutline size={15} /> Écrire</button>}
            {!isUp && noteCount(cur.id) > 0 && <button className="ax-ghost" onClick={() => onNotes(cur)} data-testid="alex-notes-notice"><IoPencil size={14} /> Mes notes · {noteCount(cur.id)}</button>}
            {!isUp && (() => { const st = stOf(cur.id); return <>
              <button className={"ax-ghost" + (st.read ? " on" : "")} onClick={() => onStatus("read", cur.id)} aria-pressed={st.read} data-testid="alex-st-read"><IoCheckmarkCircle size={15} /> {st.read ? "Lu" : "Marquer lu"}</button>
              <button className={"ax-ghost" + (st.want ? " on" : "")} onClick={() => onStatus("want", cur.id)} aria-pressed={st.want} data-testid="alex-st-want"><IoTimeOutline size={15} /> À lire</button>
            </>; })()}
            {!isUp && <button className={"ax-ghost" + (favs.includes(cur.id) ? " on" : "")} onClick={() => onFav(cur.id)} aria-pressed={favs.includes(cur.id)} data-testid="alex-fav">{favs.includes(cur.id) ? <IoHeart size={15} /> : <IoHeartOutline size={15} />} Coup de cœur</button>}
            {(!cur.mine || cur.src) && !isUp && <button className="ax-ghost" onClick={() => onModify(cur)} data-testid="alex-modify-notice"><IoCreateOutline size={15} /> Modifier</button>}
            <button className="ax-ghost" onClick={() => onCover(cur)} data-testid="alex-cover-edit"><IoImageOutline size={15} /> {covers[cur.id] ? "Changer l'artwork" : "Mettre un artwork"}</button>
          </div>
        </div>
      )}
      {grid && all.length > 0 && <Grid list={all} upFrom={here.length} selId={id} onSel={onSel} covers={covers} onOpen={act} menuFor={menuFor} stOf={stOf} />}
      {!grid && split && up.length > 0 && <Rail code={`RAYON ${num}-B`} label="À PARAÎTRE" list={up} upFrom={0} selId={id} onSel={onSel} covers={covers} wish={wish} onOpen={act} kanji={r.kanji} menuFor={menuFor} stOf={stOf} />}
      {!all.length && <p className="ax-empty">Rien sur ces rayons pour l'instant.</p>}
    </section>
  );
}

// Sources d'artworks sans clé, interrogées depuis le navigateur. Chacune rend une liste { id, url, thumb, title }.
const getJson = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(String(r.status)); return r.json(); };
const ART_SOURCES = [
  { k: "sgdb", label: "Jeux", hint: "SteamGridDB", ph: "Nom du jeu, en anglais de préférence" },
  { k: "wiki", label: "Affiches", hint: "Wikipédia : films, séries, albums, jeux", ph: "Titre du film, de la série, de l'album…",
    run: async (q) => { const d = await getJson(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=16&prop=pageimages&piprop=thumbnail%7Coriginal&pithumbsize=600&pilicense=any`);
      return Object.values(d.query?.pages || {}).filter((x) => x.thumbnail).sort((a, b) => a.index - b.index).map((x) => ({ id: "w" + x.pageid, url: x.thumbnail.source, thumb: x.thumbnail.source, title: x.title })); } },
  { k: "jikan", label: "Manga & anime", hint: "MyAnimeList", ph: "Titre du manga ou de l'anime",
    run: async (q) => { const [a, m] = await Promise.all(["anime", "manga"].map((t) => getJson(`https://api.jikan.moe/v4/${t}?q=${encodeURIComponent(q)}&limit=8&sfw=true`).catch(() => ({ data: [] }))));
      return [...(m.data || []), ...(a.data || [])].map((x) => ({ id: x.url, url: x.images?.jpg?.large_image_url || x.images?.jpg?.image_url, thumb: x.images?.jpg?.image_url, title: x.title })).filter((x) => x.url); } },
  { k: "ol", label: "Livres", hint: "Open Library", ph: "Titre du livre, auteur",
    run: async (q) => { const d = await getJson(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=20&fields=key,title,cover_i,author_name`);
      return (d.docs || []).filter((x) => x.cover_i).map((x) => ({ id: x.key, url: `https://covers.openlibrary.org/b/id/${x.cover_i}-L.jpg`, thumb: `https://covers.openlibrary.org/b/id/${x.cover_i}-M.jpg`, title: `${x.title}${x.author_name ? " · " + x.author_name[0] : ""}` })); } },
  { k: "aic", label: "Domaine public", hint: "Art Institute of Chicago : œuvres du domaine public (CC0)", ph: "Thème, artiste, époque : samurai, Hokusai, nuit…",
    run: async (q) => { const d = await getJson(`https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(q)}&query[term][is_public_domain]=true&fields=id,title,image_id,artist_title&limit=24`);
      return (d.data || []).filter((x) => x.image_id).map((x) => ({ id: "a" + x.id, url: `https://www.artic.edu/iiif/2/${x.image_id}/full/1686,/0/default.jpg`, thumb: `https://www.artic.edu/iiif/2/${x.image_id}/full/400,/0/default.jpg`, title: `${x.title}${x.artist_title ? " · " + x.artist_title : ""} (domaine public)` })); } },
  { k: "commons", label: "Commons", hint: "Wikimedia Commons : vérifie la licence de chaque image", ph: "Ce que tu cherches, en anglais de préférence",
    run: async (q) => { const d = await getJson(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q)}&gsrlimit=24&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=420`);
      return Object.values(d.query?.pages || {}).filter((x) => x.imageinfo?.[0]?.thumburl && /\.(jpe?g|png|webp)$/i.test(x.title)).map((x) => { const ii = x.imageinfo[0]; const lic = ii.extmetadata?.LicenseShortName?.value || "licence à vérifier"; return { id: "c" + x.pageid, url: ii.url, thumb: ii.thumburl, title: `${x.title.replace(/^File:/, "")} · ${lic}` }; }); } },
  { k: "itunes", label: "Musique", hint: "Pochettes d'albums", ph: "Artiste, album",
    run: async (q) => { const d = await getJson(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=album&limit=20`);
      return (d.results || []).map((x) => ({ id: "i" + x.collectionId, url: (x.artworkUrl100 || "").replace("100x100", "600x600"), thumb: (x.artworkUrl100 || "").replace("100x100", "200x200"), title: `${x.collectionName} · ${x.artistName}` })).filter((x) => x.url); } },
];
const artDefault = (b) => (fmtOf(b) === "vhs" ? "sgdb" : fmtOf(b) === "vinyle" ? "itunes" : b.room === "cinema" ? "wiki" : b.room === "lore" ? "ol" : "wiki");

// Choisir l'artwork d'un volume : recherche intégrée (jeux, affiches, manga, livres, musique), adresse, fichier, glisser-déposer ou coller.
export function CoverDialog({ b, current, def, onSave, onClose }) {
  const [url, setUrl] = useState(current || ""); const [busy, setBusy] = useState(false);
  const send = async (f) => { if (!f || !/^image\//.test(f.type)) return; setBusy(true); try { const r = await uploadJournalImage(f); setUrl(r.url); onSave(r.url); } catch (_) { toast.error("Envoi de l'image impossible"); } setBusy(false); };
  useEffect(() => {
    const paste = (e) => { const f = [...(e.clipboardData?.files || [])].find((x) => /^image\//.test(x.type)); if (f) { e.preventDefault(); send(f); } };
    window.addEventListener("paste", paste); return () => window.removeEventListener("paste", paste);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const term = encodeURIComponent(b.title);
  const [src, setSrc] = useState(() => artDefault(b)); const S = ART_SOURCES.find((x) => x.k === src);
  const [sq, setSq] = useState(() => sgdbTerm(b)); const [res, setRes] = useState(null); const [games, setGames] = useState(null); const [sBusy, setSBusy] = useState(false); const [sErr, setSErr] = useState("");
  const go = async (game, k = src) => {
    const q = sq.trim(); if (!q) return; setSBusy(true); setSErr(""); setRes(null);
    try {
      if (k === "sgdb") { const r = await atelierApi.sgdbSearch(q, game); setGames(r.games?.length > 1 ? { list: r.games, cur: r.game } : null); setRes((r.items || []).map((a) => ({ id: a.id, url: a.url, thumb: a.thumb, title: a.author ? `par ${a.author}` : "" }))); }
      else { setGames(null); setRes(await ART_SOURCES.find((x) => x.k === k).run(q)); }
    } catch (e) { setSErr(k === "sgdb" ? (e?.response?.status === 404 ? "La recherche SteamGridDB n'est pas encore installée sur le serveur de la Station (backend Emergent)." : e?.response?.data?.detail || "SteamGridDB ne répond pas.") : "Cette source ne répond pas pour l'instant. Essaie une autre source ou les liens ci-dessus."); }
    setSBusy(false);
  };
  useEffect(() => { go(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const pickSrc = (k) => { setSrc(k); go(undefined, k); };
  return createPortal(
    <div className="ax-fiche-wrap sx-pal" onClick={onClose}>
      <form className="ax-fiche ax-coverdlg" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(url.trim()); }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) send(f); else { const u = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain"); if (/^https?:/.test(u)) setUrl(u.trim()); } }} role="dialog" aria-modal="true" aria-label="Artwork">
        <p className="mono ax-fiche-top"><span>ARTWORK · 表紙</span><button type="button" onClick={onClose} aria-label="Fermer"><IoClose size={15} /></button></p>
        <div className="ax-cd">
          <span className="ax-cd-prev" style={url ? { backgroundImage: `url(${url})` } : undefined}>{!url && <i>Glisse une image ici</i>}</span>
          <div>
            <h3>{b.title}</h3>
            <p className="ab">Choisis une image dans la recherche, colle une adresse ou une image copiée (Ctrl V), glisse-la ici ou envoie un fichier.</p>
            <input className="ax-in" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… (clic droit sur une image : copier l'adresse)" data-testid="alex-cover-url" />
            <p className="mono ax-cd-l">CHERCHER AILLEURS</p>
            <div className="ax-acts">
              <a className="ax-ghost" href={`https://www.google.com/search?tbm=isch&q=${term}+affiche+poster`} target="_blank" rel="noreferrer"><IoOpenOutline size={14} /> Google Images</a>
              <a className="ax-ghost" href={`https://www.themoviedb.org/search?query=${term}`} target="_blank" rel="noreferrer"><IoOpenOutline size={14} /> TMDB</a>
              <a className="ax-ghost" href={`https://www.steamgriddb.com/search/grids?term=${term}`} target="_blank" rel="noreferrer"><IoOpenOutline size={14} /> SteamGridDB</a>
              <a className="ax-ghost" href={`https://www.pinterest.com/search/pins/?q=${term}+poster`} target="_blank" rel="noreferrer"><IoOpenOutline size={14} /> Pinterest</a>
              <a className="ax-ghost" href={`https://www.metmuseum.org/art/collection/search?q=${term}&showOnly=openAccess`} target="_blank" rel="noreferrer"><IoOpenOutline size={14} /> The Met (libre)</a>
              <a className="ax-ghost" href={`https://www.rijksmuseum.nl/en/search?q=${term}`} target="_blank" rel="noreferrer"><IoOpenOutline size={14} /> Rijksmuseum</a>
            </div>
          </div>
        </div>
        <div className="ax-sg" data-testid="alex-sgdb">
          <div className="ax-sg-games ax-srcs" role="tablist" aria-label="Source">{ART_SOURCES.map((x) => <button type="button" key={x.k} role="tab" aria-selected={src === x.k} className={src === x.k ? "on" : ""} onClick={() => pickSrc(x.k)} title={x.hint} data-testid={`alex-src-${x.k}`}>{x.label}</button>)}</div>
          <div className="ax-sg-bar">
            <p className="mono ax-cd-l">{S.hint.toUpperCase()}</p>
            <label className="ax-ytq"><IoSearch size={15} /><input value={sq} onChange={(e) => setSq(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); go(); } }} placeholder={S.ph} data-testid="alex-sgdb-q" /><button type="button" onClick={() => go()} disabled={sBusy}>{sBusy ? "…" : "Chercher"}</button></label>
          </div>
          {games && <div className="ax-sg-games">{games.list.map((g) => <button type="button" key={g.id} className={g.id === games.cur ? "on" : ""} onClick={() => go(g.id)}>{g.name}</button>)}</div>}
          {sErr && <p className="ax-empty" style={{ padding: "12px 0" }}>{sErr}</p>}
          {!sErr && res && !res.length && <p className="ax-empty" style={{ padding: "12px 0" }}>Rien trouvé. Essaie le titre original ou une autre source.</p>}
          {res?.length > 0 && <div className="ax-sg-grid">{res.map((a) => <button type="button" key={a.id} className={url === a.url ? "on" : ""} onClick={() => setUrl(a.url)} onDoubleClick={() => onSave(a.url)} title={a.title} data-testid={`alex-sgdb-${a.id}`}><img src={a.thumb} alt={a.title || ""} loading="lazy" referrerPolicy="no-referrer" /></button>)}</div>}
        </div>
        <div className="ax-acts">
          <button className="at-btn" type="submit" disabled={busy}>{busy ? "Envoi…" : "Enregistrer"}</button>
          <label className="ax-ghost"><IoCloudUploadOutline size={15} /> Envoyer un fichier<input type="file" accept="image/*" hidden onChange={(e) => send(e.target.files?.[0])} /></label>
          {current && <button type="button" className="ax-ghost" onClick={() => onSave("")} data-testid="alex-cover-remove"><IoTrashOutline size={15} /> Retirer l'artwork</button>}
          {def && current !== def && <button type="button" className="ax-ghost" onClick={() => onSave(null)} data-testid="alex-cover-default"><IoArrowUndo size={15} /> Artwork d'origine</button>}
        </div>
      </form>
    </div>,
    document.querySelector(".at-root") || document.body
  );
}


// partagés avec la page de la bibliothèque
export { Grid, LS, NOEDITS, Room, asPaste, bodyEdit, bookNotes, bookToHtml, clean, errText, fmtOf, hue, itemToBook, itemToBookRaw, normT, notesItemOf, notesOf, read, splitSrc, volLook, write, ytDel, ytIns, ytSwap };
