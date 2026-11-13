import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { playPageTurn } from "@/lib/sound";
import { createPortal } from "react-dom";
import { IoArrowBack, IoArrowForward, IoClose, IoAdd, IoBookmark, IoBookmarkOutline, IoList, IoSearch, IoStar, IoStarOutline, IoOpenOutline, IoImageOutline, IoMusicalNotes, IoPlay, IoPause, IoLogoYoutube, IoCreateOutline, IoTrashOutline, IoCloudUploadOutline, IoHeart, IoHeartOutline } from "react-icons/io5";
import { toast } from "sonner";
import { atelierApi } from "@/lib/atelier";
import { uploadJournalImage } from "@/lib/api";
import { DEFAULT_COVERS, mergeCovers, sgdbTerm } from "@/data/alexandrie/covers";
import { IoCheckmarkCircle, IoTimeOutline, IoClipboardOutline, IoDownloadOutline, IoPencil, IoPrintOutline, IoSwapHorizontal, IoArrowUndo, IoVolumeHighOutline, IoVolumeMuteOutline, IoGridOutline, IoLibraryOutline, IoPlaySkipForward, IoListOutline, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { lookOf, WEB_FONTS, fontHref } from "@/data/alexandrie/looks";
import { SEP, parsePaste, pasteToBook, bookToPaste, nextCote, withCote } from "@/data/alexandrie/paste";
import AlexPaste from "@/components/atelier/AlexPaste";
import { Controls, Progress, Queue, thumb as ytThumb, coverOf } from "@/components/atelier/Radio";
import { pressMenu } from "@/components/atelier/ContextMenu";
import { labConfirm } from "@/components/atelier/LabDialog";
import { exportBook } from "@/lib/exportPdf";
import { ROOMS, TYPES, BOOKS, UPCOMING, parseBook, readingTime } from "@/data/alexandrie";
import { stripHtml } from "@/lib/atelier";
import { useApp } from "@/context/AppContext";
import "@/components/atelier/alexandrie.css";

// ALEXANDRIE — la bibliothèque de l'Atelier. Des salles, des rayonnages, des livres qui s'ouvrent.
// Les livres de fond sont dans src/data/alexandrie ; les tiens sont des fiches de l'Atelier (fields.alexandrie).
const LS = { prog: "nx-alex-progress", wish: "nx-alex-wish", covers: "nx-alex-covers", fav: "nx-alex-fav", view: "nx-alex-view", shelf: "nx-alex-shelf" };
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || "") ?? d; } catch (_) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
const NOEDITS = {};
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
function CoverInner({ b, cover, upcoming, wished, fmt, R, em, cfs, st }) {
  return (
    <>
      {fmt === "vinyle" && <span className="ax-disc" aria-hidden="true"><i /></span>}
      {cover && <span className="ax-cover-img" style={{ backgroundImage: `url(${cover})` }} />}
      {fmt === "vhs" && <span className="ax-cover-band mono"><b>VHS</b><span>{(R?.label || "LORE").toUpperCase()}</span><i>{b.cote || "À PARAÎTRE"}</i></span>}
      {!cover && (
        <>
          {fmt === "livre" && <span className="ax-cover-top mono">ALEXANDRIE · {(R?.label || "MES LIVRES").toUpperCase()}</span>}
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
function Face({ b, cover, upcoming, wished, st }) {
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
// Artwork du jeu pendant la lecture : lu sur SteamGridDB par le serveur de la Station, jamais stocké ici.
// Une seule requête par jeu et par format ; la vignette s'affiche, l'image entière s'ouvre au clic.
const ART = new Map();
const artList = (term, kind) => { const k = term + "|" + kind; if (!ART.has(k)) ART.set(k, atelierApi.sgdbSearch(term, null, kind).then((r) => r?.items || []).catch(() => { setTimeout(() => ART.delete(k), 30000); return []; })); return ART.get(k); };
function ArtFig({ b, term, si }) {
  const [a, setA] = useState(undefined);
  useEffect(() => { let on = true; artList(term, b.kind).then((xs) => on && setA(xs.length ? xs[(b.n - 1) % xs.length] : null)); return () => { on = false; }; }, [term, b.kind, b.n]);
  const link = `https://www.steamgriddb.com/search/${b.kind}?term=${encodeURIComponent(term)}`;
  return (
    <figure className={`ax-fig ax-art ${b.kind}`} data-si={si}>
      <a className="ax-art-box" href={a?.url || link} target="_blank" rel="noopener noreferrer">{a ? <img src={a.thumb || a.url} alt={b.cap || ""} loading="lazy" referrerPolicy="no-referrer" onError={() => setA(null)} /> : <span className="mono">{a === null ? "VOIR LES ARTWORKS SUR STEAMGRIDDB ↗" : "…"}</span>}</a>
      <figcaption>{b.cap && inline(b.cap)}<small className="mono">{b.credit ? `${b.credit} · ` : ""}{a?.author ? `ARTWORK PAR ${a.author} · ` : ""}<a href={link} target="_blank" rel="noopener noreferrer">STEAMGRIDDB ↗</a></small></figcaption>
    </figure>
  );
}
// Ajouter une vidéo YouTube à un chapitre, depuis la lecture : on colle le lien, on écrit la légende, on choisit le chapitre.
const VSEARCH = [["beauty", "beauty"], ["analyse", "analysis"], ["lore", "lore"], ["musique", "soundtrack"], ["making-of", "making of"]];
function VideoAdd({ book, page, onAdd, onClose }) {
  const [v, setV] = useState(""); const [cap, setCap] = useState(""); const [busy, setBusy] = useState(false);
  const id = ytId(v.trim());
  const submit = async (e) => { e.preventDefault(); if (!id) { toast.error("Lien YouTube non reconnu"); return; } setBusy(true); try { await onAdd(id, cap.replace(/\s*\|\s*/g, " / ").replace(/\s+/g, " ").trim()); } finally { setBusy(false); } };
  return (
    <aside className="ax-toc ax-vadd" data-testid="alex-vadd" onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } }}>
      <p className="mono">AJOUTER UNE VIDÉO</p>
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
      {ed && <form className="ax-yt-ed" onSubmit={swap}><input ref={(el) => el && !el.dataset.f && (el.dataset.f = "1", el.focus({ preventScroll: true }))} value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); setEd(false); } }} placeholder="Colle le lien de la nouvelle vidéo YouTube" data-testid="alex-yt-swap-in" /><button className="at-btn" type="submit">OK</button></form>}
    </figure>
  );
}

function Reader({ book, onClose, onEdit, onModify, onSwap, onRemoveVideo, onAddVideo, onDone, paused, radio, cover, at, startNotes }) {
  const { sfx } = useApp();
  const flow = useRef(null);
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
  };
  useEffect(() => { const el = flow.current; if (!el) return; const f = () => measure(); el.addEventListener("load", f, true); el.addEventListener("error", f, true); return () => { el.removeEventListener("load", f, true); el.removeEventListener("error", f, true); }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => { measure(); const t = setTimeout(measure, 350); document.fonts?.ready?.then(measure).catch(() => {}); window.addEventListener("resize", measure); return () => { clearTimeout(t); window.removeEventListener("resize", measure); }; }, [book]); // eslint-disable-line
  const spread = Math.floor(page / per) * per;
  useEffect(() => {
    if (!flow.current) return;
    const g = geom(); const left = Math.round(spread * g.step);
    if (anim.current && Math.abs(g.el.scrollLeft - left) < g.step * 2.2) { clearTimeout(anim.current); g.el.scrollTo({ left, behavior: "smooth" }); anim.current = setTimeout(() => { anim.current = 0; if (flow.current) flow.current.scrollLeft = left; }, 420); }
    else { clearTimeout(anim.current); anim.current = 0; g.el.scrollLeft = left; }
  }, [spread, per, pages, book]); // eslint-disable-line
  useEffect(() => { if (book.preview) return; const all = read(LS.prog, {}); all[book.id] = { page, pages, mark, at: Date.now() }; write(LS.prog, all); }, [page, pages, mark, book.id]); // eslint-disable-line react-hooks/exhaustive-deps
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
    anim.current = anim.current || 1; if (n !== spread) { setPage(n); turnFx(n > spread ? 1 : -1); } else if (flow.current) { const g = geom(); flow.current.scrollTo({ left: Math.round(spread * g.step), behavior: "smooth" }); anim.current = setTimeout(() => { anim.current = 0; }, 420); } };
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
  const onTouchStart = (e) => { const t = e.touches[0]; drag.current = { x: t.clientX, y: t.clientY, t: Date.now(), base: flow.current?.scrollLeft || 0, on: false }; };
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
  const body = useMemo(() => (<>
            <section className="ax-titlepage">
              {fmt === "vinyle" ? <span className="ax-tp-sleeve"><span className="ax-tp-disc" />{cover ? <span className="ax-tp-art" style={{ backgroundImage: `url(${cover})` }} /> : <span className="ax-tp-art blank" />}</span> : cover && <span className="ax-tp-art" style={{ backgroundImage: `url(${cover})` }} />}
              <p className="mono ax-tp-room">{R ? `${R.kanji} ${R.label.toUpperCase()}` : "MES LIVRES"}</p>
              <h1>{book.title}</h1>
              {book.sub && <p className="ax-tp-sub">{book.sub}</p>}
              <span className="ax-rule" />
              <p className="mono ax-tp-type">{T.label.toUpperCase()} · {readingTime(book.words)}</p>
              {book.about && <p className="ax-tp-about">{book.about}</p>}
              <p className="mono ax-tp-foot">BIBLIOTHÈQUE D'ALEXANDRIE · COTE {book.cote}</p>
            </section>
            {book.chapters.map((c, i) => (
              <section className="ax-ch" key={i} data-ch={i}>
                {c.title && <header><span className="mono">{fmt === "vinyle" ? track(i) : String(i + 1).padStart(2, "0")}</span><h2>{c.title}</h2></header>}
                {c.blocks.map((b, j) => b.t === "q" ? <blockquote key={j} data-si={b.si}><p>{inline(b.x)}</p>{b.by && <cite>{b.by}</cite>}</blockquote>
                  : b.t === "h" ? <h3 key={j} data-si={b.si}>{inline(b.x)}</h3>
                  : b.t === "img" ? <Fig key={j} b={b} si={b.si} />
                  : b.t === "yt" ? <YtFig key={j} b={b} si={b.si} onSwap={swapS} onRemove={removeS} />
                  : b.t === "art" ? <ArtFig key={j} b={b} si={b.si} term={book.art || sgdbTerm(book)} />
                  : b.t === "box" ? <aside className="ax-box" key={j} data-si={b.si}><b className="mono">{b.label || "À RETENIR"}</b><p>{inline(b.x)}</p></aside>
                  : <p key={j} data-si={b.si} className={j === 0 && c.title ? "first" : ""}>{inline(b.x)}</p>)}
              </section>
            ))}
            {(book.links || []).length > 0 && (
              <section className="ax-ch ax-more" data-ch="more">
                <header><span className="mono">→</span><h2>Pour aller plus loin</h2></header>
                <ul>{book.links.map((l, i) => <li key={i}><a href={linkUrl(l, book.title)} target="_blank" rel="noopener noreferrer" title={l.url ? "Ouvrir" : "Rechercher"}>{l.label} <IoOpenOutline size={12} /></a>{l.note && <small>{l.note}</small>}</li>)}</ul>
              </section>
            )}
  </>), [book, fmt, cover, swapS]); // eslint-disable-line react-hooks/exhaustive-deps
  const noteMarks = notesOf(notesItemOf(at, book.id)).map((n) => ({ id: n.id, t: n.t, at: Math.max(0, Math.min(pages - 1, n.n ? Math.round((n.p / n.n) * pages) : n.p)) }));
  return createPortal(
    <div className={"ax-reader ax-view fmt-" + fmt + (fmt === "vhs" ? " skin-vhs" : "") + (fmt === "vinyle" ? " skin-vinyle" : "") + (look ? ` has-look look-${look.key} tex-${look.tex}` + (look.dark ? " look-dark" : " look-light") : "")} style={{ "--h": book.color ?? hue(book.title), ...(look ? { "--bk-d": `"${look.d}"`, "--bk-r": `"${look.r}"`, "--paper": look.p, "--paper-2": look.p2, "--paper-3": look.p3, "--ink": look.ink, "--ink-2": look.ink2, "--acc": look.acc, "--orn": `"${look.orn}"` } : {}) }} data-testid="alex-reader" role="dialog" aria-modal="true" aria-label={book.title}>
      <header className="ax-rbar">
        <button className="ax-rb" onClick={onClose} data-testid="alex-close"><IoArrowBack size={15} /> <span>Rayonnages</span></button>
        <p className="mono ax-rpath">ALEXANDRIE / {(R?.label || "MES LIVRES").toUpperCase()} / <b>{book.cote}</b></p>
        <span className="grow" />
        {book.mine && !book.src ? onEdit && <button className="ax-rb" onClick={() => onEdit(book.itemId)}><IoCreateOutline size={15} /> <span>Écrire</span></button>
          : onModify && <button className="ax-rb" onClick={onModify} title="Modifier le texte, les images, les vidéos" data-testid="alex-modify"><IoCreateOutline size={15} /> <span>Modifier</span></button>}
        {at && <button className={"ax-rb" + (notes ? " on" : "")} onClick={() => { setNotes((n) => !n); setToc(false); setMusic(false); }} aria-expanded={notes} title="Notes (touche N)" data-testid="alex-notes"><IoPencil size={14} /> <span>Notes{noteMarks.length ? ` · ${noteMarks.length}` : ""}</span></button>}
        {radio && <button className={"ax-rb" + (radio.playing ? " on" : "")} onClick={() => { setMusic((m) => !m); setToc(false); setNotes(false); }} aria-expanded={music} data-testid="alex-music" title={radio.pl ? radio.info?.title || radio.pl.title : "Musique"}><IoMusicalNotes size={15} /> <span>{radio.pl ? <span className="ax-rb-now">{radio.info?.title || radio.pl.title}</span> : "Musique"}</span></button>}
        {radio?.pl && <button className="ax-rb ax-rb-sq" onClick={radio.toggle} title={radio.playing ? "Pause" : "Lecture"} data-testid="alex-music-toggle">{radio.playing ? <IoPause size={15} /> : <IoPlay size={15} />}</button>}
        {radio?.pl && <button className="ax-rb ax-rb-sq" onClick={radio.next} title="Morceau suivant" data-testid="alex-music-next"><IoPlaySkipForward size={15} /></button>}
        {onAddVideo && <button className={"ax-rb" + (vid ? " on" : "")} onClick={() => { setVid((v) => !v); setToc(false); setMusic(false); setNotes(false); }} aria-expanded={vid} title="Ajouter une vidéo YouTube à cette page" data-testid="alex-addvid"><IoLogoYoutube size={15} /> <span>Vidéo</span></button>}
        <button className="ax-rb" onClick={() => exportBook(book, cover, bookNotes(at, book.id, pages))} title="Exporter le livre en PDF, avec tes notes" data-testid="alex-pdf"><IoPrintOutline size={15} /> <span>PDF</span></button>
        <button className="ax-rb" onClick={() => { setToc((t) => !t); setMusic(false); setVid(false); }} aria-expanded={toc} data-testid="alex-toc"><IoList size={16} /> <span>Sommaire</span></button>
        <button className="ax-rb" onClick={() => { const v = !turnSound; setTurnSound(v); write("nx-alex-turn-sound", v); if (v) playPageTurn(fmt, 1); }} aria-pressed={!turnSound} title={turnSound ? "Couper le bruit des pages" : "Remettre le bruit des pages"} data-testid="alex-turn-sound">{turnSound ? <IoVolumeHighOutline size={16} /> : <IoVolumeMuteOutline size={16} />}</button>
        <button className={"ax-rb" + (mark ? " on" : "")} onClick={() => { setMark((m) => !m); sfx?.("select"); }} aria-pressed={mark} title="Marque-page">{mark ? <IoBookmark size={16} /> : <IoBookmarkOutline size={16} />}</button>
      </header>
      <div className="ax-stage">
        <button className="ax-turn l" onClick={() => go(-1)} disabled={spread === 0} aria-label="Page précédente"><IoArrowBack size={20} /></button>
        <div ref={bookEl} className={"ax-book" + (per === 1 ? " single" : "")} onMouseDown={onMouseDown} onWheel={onWheel} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={() => { drag.current = null; go(0); }}>
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
function AlexSearch({ books, onClose, onOpen, onGoto }) {
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
    const u = UPCOMING.filter((b) => !needle || `${b.title} ${b.sub || ""}`.toLowerCase().includes(needle)).slice(0, needle ? 40 : 8).map((b) => (
      { key: b.id, up: true, type: b.type, code: "À VENIR", kj: room(b.room)?.kanji, title: b.title, sub: (b.sub || "").toUpperCase(), snip: "", ty: TYPES[b.type]?.label, where: room(b.room)?.label, dur: "à paraître", run: () => onGoto(b) }));
    return [...a, ...u].filter((r) => tab === "all" || (tab === "lire" ? !r.up : tab === "up" ? r.up : r.type === tab)).slice(0, 60);
  }, [needle, books, texts, tab, onOpen, onGoto]);
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

// Un rayon : une rangée de volumes sur sa planche, avec son étiquette.
function Rail({ code, label, list, upFrom, selId, onSel, covers, wish, onOpen, kanji, menuFor, stOf }) {
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
function Room({ r, n, here, up, selId, onSel, covers, wish, prog, onRead, onWish, onCover, onEdit, onModify, menuFor, noteCount, onNotes, favs, onFav, view, stOf, onStatus }) {
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
          <p className="mono meta">{isUp ? "À PARAÎTRE" : cur.cote || "MES LIVRES"} · {T.label.toUpperCase()} · {fmt === "vhs" ? "CASSETTE" : fmt === "vinyle" ? "DISQUE" : "LIVRE"}{!isUp && cur.words ? ` · ${readingTime(cur.words).toUpperCase()}` : ""}</p>
          <h3>{cur.title}{favs.includes(cur.id) && <IoHeart className="ax-favh" size={20} aria-label="Coup de cœur" />}</h3>
          {cur.sub && <p className="sub">{cur.sub}</p>}
          {cur.about && <p className="ab">{cur.about}</p>}
          {isUp && <p className="ab">Pas encore écrit. Marque-le d'une étoile : les titres étoilés passent en premier.</p>}
          <div className="ax-acts">
            {isUp ? <button className="at-btn" onClick={() => onWish(cur.id)} data-testid="alex-wish">{wish.includes(cur.id) ? <><IoStar size={15} /> Demandé</> : <><IoStarOutline size={15} /> Je veux le lire</>}</button>
              : <button className="at-btn" onClick={() => onRead(cur)} data-testid="alex-read"><IoPlay size={14} /> {pg && pg.page > 0 ? `Reprendre page ${pg.page + 1}` : fmt === "vhs" ? "Lancer" : "Lire"}</button>}
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
  { k: "itunes", label: "Musique", hint: "Pochettes d'albums", ph: "Artiste, album",
    run: async (q) => { const d = await getJson(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=album&limit=20`);
      return (d.results || []).map((x) => ({ id: "i" + x.collectionId, url: (x.artworkUrl100 || "").replace("100x100", "600x600"), thumb: (x.artworkUrl100 || "").replace("100x100", "200x200"), title: `${x.collectionName} · ${x.artistName}` })).filter((x) => x.url); } },
];
const artDefault = (b) => (fmtOf(b) === "vhs" ? "sgdb" : fmtOf(b) === "vinyle" ? "itunes" : b.room === "cinema" ? "wiki" : b.room === "lore" ? "ol" : "wiki");

// Choisir l'artwork d'un volume : recherche intégrée (jeux, affiches, manga, livres, musique), adresse, fichier, glisser-déposer ou coller.
function CoverDialog({ b, current, def, onSave, onClose }) {
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
  return (
    <div className="ax-fiche-wrap" onClick={onClose}>
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
    </div>
  );
}

export default function Alexandrie({ at, open, radio, room: startRoom, book: startBook }) {
  const { sfx } = useApp();
  const [room, setRoom] = useState(startRoom || null);
  useEffect(() => { setRoom(startRoom || null); }, [startRoom]);
  const [type, setType] = useState("all");
  const [view, setView] = useState(() => read(LS.view, "rayon"));
  const pickView = (v) => { setView(v); write(LS.view, v); sfx?.("select"); };
  const [search, setSearch] = useState(false);
  const [reading, setReading] = useState(null);
  const [sel, setSel] = useState({});
  const [coverFor, setCoverFor] = useState(null);
  const [wish, setWish] = useState(() => read(LS.wish, []));
  // Mes lectures : lus, à lire, coups de cœur. Gardés sur le serveur (tous les appareils) et dans le navigateur.
  const [shelf, setShelf] = useState(() => ({ read: [], want: [], fav: read(LS.fav, []), ...read(LS.shelf, {}), ...(at.config?.alexandrie?.shelf || {}) }));
  const srvShelf = at.config?.alexandrie?.shelf;
  useEffect(() => { if (srvShelf) setShelf((x) => ({ ...x, ...srvShelf })); }, [JSON.stringify(srvShelf || null)]); // eslint-disable-line react-hooks/exhaustive-deps
  const saveShelf = (sh) => { setShelf(sh); write(LS.shelf, sh); at.saveConfig({ alexandrie: { ...(at.config?.alexandrie || {}), shelf: sh } }).catch(() => {}); };
  const setStatus = (k, id, on) => { const has = shelf[k].includes(id); const want = on ?? !has; if (want === has) return;
    const sh = { ...shelf, [k]: want ? [id, ...shelf[k]] : shelf[k].filter((x) => x !== id) };
    if (want && k === "read") sh.want = sh.want.filter((x) => x !== id); if (want && k === "want") sh.read = sh.read.filter((x) => x !== id);
    saveShelf(sh); sfx?.("select"); };
  const favs = shelf.fav; const toggleFav = (id) => setStatus("fav", id);
  const stOf = (id) => ({ read: shelf.read.includes(id), want: shelf.want.includes(id), fav: shelf.fav.includes(id) });
  const [stf, setStf] = useState("all"); const [mineTab, setMineTab] = useState(null);
  const [readNotes, setReadNotes] = useState(false);
  const [localCovers, setLocalCovers] = useState(() => read(LS.covers, {}));
  const [bad, setBad] = useState({});
  const rawCovers = { ...localCovers, ...(at.config?.alexandrie?.covers || {}) };
  const covers = mergeCovers(localCovers, at.config?.alexandrie?.covers, bad);
  // Un artwork par défaut qui ne répond pas est écarté : le volume garde sa couverture dessinée.
  useEffect(() => { Object.values(DEFAULT_COVERS).forEach((u) => { const im = new Image(); im.onerror = () => setBad((x) => ({ ...x, [u]: 1 })); im.src = u; }); }, []);
  const prog = read(LS.prog, {});
  // Livres de la bibliothèque. Les modifier ouvre une copie dans l'éditeur de documents (le même que pour écrire un livre) :
  // la copie remplace le livre sur les rayons, l'original reste dans le code et revient d'un clic.
  const edits = at.config?.alexandrie?.edits || NOEDITS;
  const overrides = useMemo(() => Object.fromEntries(at.items.filter((i) => i.fields?.alexandrie?.of).map((i) => [i.fields.alexandrie.of, i])), [at.items]);
  const rawOf = (b) => ({ ...b, ...(edits[b.id] || {}) });
  const books = useMemo(() => BOOKS.map((b) => {
    const base = (() => { try { return parseBook(rawOf(b)); } catch (_) { return parseBook(b); } })();
    const o = overrides[b.id]; if (!o) return edits[b.id] ? { ...base, edited: true } : base;
    if (o.fields.alexandrie.src) { try { const x = pasteToBook(o.fields.alexandrie.src, { id: b.id }); return { ...base, ...x, id: b.id, cote: x.cote === "PERS." ? base.cote : x.cote, edited: true, copyId: o.id }; } catch (_) { return base; } }
    try { const x = itemToBookRaw(o); const a = o.fields.alexandrie; return { ...base, title: o.title || base.title, sub: a.sub ?? base.sub, about: a.about ?? base.about, chapters: x.chapters, words: x.words, text: x.text, edited: true, copyId: o.id }; } catch (_) { return base; }
  }), [edits, overrides]); // eslint-disable-line react-hooks/exhaustive-deps
  // Modifier par copier-coller : le texte complet du livre (réglages + chapitres) s'ouvre dans la fenêtre de collage.
  const [paste, setPaste] = useState(null); // { text, item?, of?, title? }
  const itemOf = (b) => (b.itemId ? at.items.find((i) => i.id === b.itemId) : overrides[b.id]);
  const modifyBook = (b) => {
    const it = itemOf(b);
    if (it && !it.fields?.alexandrie?.src) { setReading(null); open(it.id, "document"); return; } // écrit dans l'éditeur : il s'y modifie
    setReading(null);
    setPaste({ text: it ? it.fields.alexandrie.src : asPaste(rawBook(b)), item: it, of: it ? undefined : b.id, title: b.title });
  };
  const rawBook = (b) => { const r = rawOf(BOOKS.find((x) => x.id === b.id) || b); return { ...b, ...r }; };
  // Méthode classique : une copie du livre dans l'éditeur de documents
  const modifyInEditor = async (b) => {
    if (b.mine) { setReading(null); open(b.itemId); return; }
    if (overrides[b.id]) { setReading(null); open(overrides[b.id].id); return; }
    const raw = rawOf(BOOKS.find((x) => x.id === b.id) || b);
    try {
      const it = await at.createItem({ kind: "document", title: raw.title, content: bookToHtml(raw.text), tags: ["alexandrie"], fields: { alexandrie: { of: b.id, room: b.room, type: b.type, sub: raw.sub || "", about: raw.about || "" } } });
      if (!it?.id) throw new Error("création refusée");
      setReading(null); open(it.id, "document");
      toast.success("Le livre s'ouvre dans l'éditeur. Tes changements apparaîtront sur les rayons.");
    } catch (e) { toast.error("Le livre n'a pas pu être ouvert : " + (e?.response?.data?.detail || e?.message || "erreur")); }
  };
  // Vidéos : dans le texte collé du livre (ou sa copie), sinon dans le document de l'éditeur. Un livre du code reçoit une copie.
  const editVideos = async (b, fn, htmlFn, ok) => {
    const it = itemOf(b);
    try {
      if (it?.fields?.alexandrie?.src) { const src = fn(it.fields.alexandrie.src); await at.saveItem({ ...clean(it), content: bookToHtml(splitSrc(src).body), fields: { ...it.fields, alexandrie: { ...it.fields.alexandrie, src } } }); }
      else if (it) { const doc = new DOMParser().parseFromString(`<div>${it.content || ""}</div>`, "text/html").body.firstChild; htmlFn(doc); await at.saveItem({ ...clean(it), title: it.title || b.title, content: doc.innerHTML }); }
      else { const src = fn(asPaste(rawBook(b))); const r = rawBook(b);
        const made = await at.createItem({ kind: "document", title: r.title, content: bookToHtml(splitSrc(src).body), tags: ["alexandrie"], fields: { alexandrie: { of: b.id, src, room: b.room, type: b.type, sub: r.sub || "", about: r.about || "" } } });
        if (!made?.id) throw new Error("le serveur n'a pas créé la copie"); }
      toast.success(ok); sfx?.("select"); return true;
    } catch (e) { console.error("[Alexandrie] vidéo", e); toast.error("La vidéo n'a pas pu être modifiée : " + errText(e)); return false; }
  };
  const ytNodes = (doc, id) => [...doc.childNodes].filter((n) => n.nodeType === 1 && (n.innerHTML || "").includes(id));
  const swapVideo = (b, oldId, newId) => editVideos(b, (src) => bodyEdit(src, ytSwap(oldId, newId)), (doc) => ytNodes(doc, oldId).forEach((n) => { n.innerHTML = n.innerHTML.split(oldId).join(newId); }), "Vidéo remplacée");
  const removeVideo = (b, id) => editVideos(b, (src) => bodyEdit(src, ytDel(id)), (doc) => ytNodes(doc, id).forEach((n) => n.remove()), "Vidéo supprimée");
  // Ajouter une vidéo à la page où l'on est : juste après le dernier paragraphe qui commence sur cette page.
  const addVideo = (b, si, id, cap) => { const line = `@yt ${id} | ${cap || "Vidéo"}`;
    return editVideos(b, (src) => bodyEdit(src, ytIns(si, line)), (doc) => {
      const p = document.createElement("p"); const a = document.createElement("a"); a.href = `https://www.youtube.com/watch?v=${id}`; a.textContent = `▶ ${cap || "Vidéo"}`; p.appendChild(a);
      const ref = doc.childNodes[si]; if (ref) ref.after(p); else doc.appendChild(p); }, "Vidéo ajoutée à cette page"); };
  const revertEdit = async (b) => {
    if (!(await labConfirm(`Revenir au texte d'origine de « ${b.title} » ? Tes modifications seront perdues.`))) return;
    try {
      if (overrides[b.id]) await at.removeItem(overrides[b.id].id);
      if (edits[b.id]) { const e = { ...edits }; delete e[b.id]; await at.saveConfig({ alexandrie: { ...(at.config?.alexandrie || {}), edits: e } }); }
      toast.success("Texte d'origine rétabli");
    } catch (_) { toast.error("Le texte d'origine n'a pas pu être rétabli"); }
  };
  const menuFor = (b, upc) => () => ({ title: b.title, entries: [
    !upc && { id: "read", label: prog[b.id]?.page > 0 ? `Reprendre page ${prog[b.id].page + 1}` : "Lire", icon: <IoPlay size={14} />, onClick: () => openBook(b) },
    upc && { id: "wish", label: wish.includes(b.id) ? "Ne plus demander" : "Je veux le lire", icon: <IoStarOutline size={14} />, onClick: () => toggleWish(b.id) },
    !upc && { id: "modify", label: b.mine && !b.src ? "Écrire" : "Modifier (copier-coller)", icon: <IoCreateOutline size={14} />, onClick: () => modifyBook(b) },
    !upc && !b.mine && !b.edited && { id: "modify-ed", label: "Modifier dans l'éditeur", icon: <IoPencil size={14} />, onClick: () => modifyInEditor(b) },
    !upc && { id: "copy", label: "Copier le texte du livre", icon: <IoClipboardOutline size={14} />, onClick: () => navigator.clipboard?.writeText(asPaste(b.mine || b.edited ? b : rawBook(b))).then(() => toast.success("Texte copié : il se colle tel quel dans « Coller un livre »"), () => toast.error("La copie n'a pas marché")) },
    "-",
    !upc && { id: "st-read", label: shelf.read.includes(b.id) ? "Retirer de « Lus »" : "Marquer comme lu", icon: <IoCheckmarkCircle size={14} />, onClick: () => setStatus("read", b.id) },
    !upc && { id: "st-want", label: shelf.want.includes(b.id) ? "Retirer de « À lire »" : "À lire", icon: <IoTimeOutline size={14} />, onClick: () => setStatus("want", b.id) },
    !upc && { id: "fav", label: favs.includes(b.id) ? "Retirer des coups de cœur" : "Coup de cœur", icon: favs.includes(b.id) ? <IoHeart size={14} /> : <IoHeartOutline size={14} />, onClick: () => toggleFav(b.id) },
    !upc && { id: "pdf", label: "Exporter en PDF", icon: <IoPrintOutline size={14} />, onClick: () => exportBook(b, covers[b.id], bookNotes(at, b.id, 0)) },
    "-",
    { id: "cover", label: covers[b.id] ? "Changer l'artwork" : "Mettre un artwork", icon: <IoImageOutline size={14} />, onClick: () => setCoverFor(b) },
    covers[b.id] && { id: "uncover", label: "Retirer l'artwork", icon: <IoTrashOutline size={14} />, onClick: () => saveCover(b.id, "") },
    DEFAULT_COVERS[b.id] && covers[b.id] !== DEFAULT_COVERS[b.id] && { id: "recover", label: "Remettre l'artwork d'origine", icon: <IoArrowUndo size={14} />, onClick: () => saveCover(b.id, null) },
    !upc && b.edited && "-",
    !upc && b.edited && { id: "revert", label: "Revenir au texte d'origine", icon: <IoArrowUndo size={14} />, danger: true, onClick: () => revertEdit(b) },
    b.mine && "-",
    b.mine && { id: "del", label: "Supprimer le livre", icon: <IoTrashOutline size={14} />, danger: true, onClick: () => deleteBook(b) },
  ] });
  const deleteBook = async (b) => {
    if (!(await labConfirm(`Supprimer « ${b.title} » ? Il disparaîtra des rayons et du Nexus Drive.`))) return;
    try { await at.removeItem(b.itemId); toast.success("Livre supprimé"); } catch (e) { toast.error("Le livre n'a pas pu être supprimé : " + errText(e)); }
  };
  // Enregistrer ce qui a été collé : un livre modifié, ou un ou plusieurs livres nouveaux.
  const savePaste = async (blocks) => {
    const roomNow = R?.key; const made = [];
    try {
      if (paste.item || paste.of) {
        const src = blocks[0]; const { meta, body } = parsePaste(src); const fa = { room: meta.room, type: meta.type, sub: meta.sub, about: meta.about };
        if (paste.item) await at.saveItem({ ...clean(paste.item), title: meta.title, content: bookToHtml(body), fields: { ...paste.item.fields, alexandrie: { ...paste.item.fields.alexandrie, ...fa, src } } });
        else { const it = await at.createItem({ kind: "document", title: meta.title, content: bookToHtml(body), tags: ["alexandrie"], fields: { alexandrie: { of: paste.of, ...fa, src } } }); if (!it?.id) throw new Error("création refusée"); }
        if (blocks.length > 1) toast("Seul le premier livre a été gardé : la modification porte sur un seul volume.");
        toast.success(`« ${meta.title} » enregistré`);
      } else {
        const sh = { ...shelf, read: [...shelf.read], want: [...shelf.want], fav: [...shelf.fav] }; const cv = {};
        for (const t0 of blocks) {
          let { meta } = parsePaste(t0);
          if (!/^\s*salle\s*:/im.test(t0) && roomNow) meta = { ...meta, room: roomNow }; // collé dans une salle : il y reste
          const src = meta.cote ? t0 : withCote(t0, nextCote(meta.room, [...all, ...made]));
          const { body } = parsePaste(src); const fa = { room: meta.room, type: meta.type, sub: meta.sub, about: meta.about };
          const it = await at.createItem({ kind: "document", title: meta.title, content: bookToHtml(body), tags: ["alexandrie"], fields: { alexandrie: { ...fa, src: /^\s*salle\s*:/im.test(src) ? src : src.replace(/^(\s*titre\s*:.*)$/im, `$1\nSALLE : ${meta.room}`) } } });
          if (!it?.id) throw new Error("création refusée");
          const id = "item:" + it.id; made.push({ id, cote: parsePaste(src).meta.cote, room: meta.room });
          if (meta.status) { sh[meta.status] = [id, ...sh[meta.status]]; if (meta.status === "read") sh.want = sh.want.filter((x) => x !== id); }
          if (meta.cover) cv[id] = meta.cover;
        }
        if (made.length) { if (JSON.stringify(sh) !== JSON.stringify(shelf)) saveShelf(sh);
          if (Object.keys(cv).length) { const c = { ...rawCovers, ...cv }; setLocalCovers(c); write(LS.covers, c); at.saveConfig({ alexandrie: { ...(at.config?.alexandrie || {}), covers: c } }).catch(() => {}); } }
        toast.success(made.length > 1 ? `${made.length} livres ajoutés aux rayons` : "Livre ajouté aux rayons");
      }
      sfx?.("select"); setPaste(null);
    } catch (e) { console.error("[Alexandrie] collage", e); toast.error(`Enregistrement interrompu${made.length ? ` après ${made.length} livre(s)` : ""} : ${errText(e)}`); }
  };
  // Exporter mes livres : tous les livres écrits ou collés, et les copies modifiées, dans un seul fichier à recoller.
  const exportMine = () => {
    const list = [...books.filter((b) => b.edited), ...mine];
    if (!list.length) { toast("Aucun livre à exporter pour l'instant : seuls tes livres et tes copies modifiées le sont."); return; }
    const txt = list.map(asPaste).join("\n\n=====\n\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain;charset=utf-8" }));
    a.download = `alexandrie-mes-livres-${new Date().toISOString().slice(0, 10)}.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast.success(`${list.length} livre${list.length > 1 ? "s" : ""} exporté${list.length > 1 ? "s" : ""}. Le fichier se recolle tel quel.`);
  };
  const mine = useMemo(() => at.items.filter((i) => i.fields?.alexandrie && !i.fields.alexandrie.of).map(itemToBook), [at.items]);
  const all = useMemo(() => [...books, ...mine], [books, mine]);
  const readingBook = reading && (all.find((b) => b.id === reading.id) || reading);
  const match = (b) => (type === "all" || b.type === type) && (stf === "all" || shelf[stf].includes(b.id));
  const matchUp = (b) => (type === "all" || b.type === type) && (stf === "all" || (stf === "want" && wish.includes(b.id)));
  useEffect(() => { if (!startBook) return; const b = all.find((x) => x.id === startBook); if (b) { setSel((x) => ({ ...x, [b.room]: b.id })); setReading(b); } }, [startBook]); // eslint-disable-line react-hooks/exhaustive-deps
  const current = all.filter((b) => prog[b.id] && prog[b.id].page > 0 && prog[b.id].page < (prog[b.id].pages || 1) - 1).sort((a, b) => prog[b.id].at - prog[a.id].at).slice(0, 4);
  const toggleWish = (id) => { const w = wish.includes(id) ? wish.filter((x) => x !== id) : [...wish, id]; setWish(w); write(LS.wish, w); sfx?.("select"); };
  const addBook = async (rk) => {
    try {
      const it = await at.createItem({ kind: "document", title: "Nouveau livre", content: "<h2>Chapitre 1</h2><p>Écris ici. Chaque titre ouvre un nouveau chapitre.</p>", tags: ["alexandrie"], fields: { alexandrie: { room: typeof rk === "string" && rk ? rk : "atelier", type: "recit" } } });
      if (it?.id) open(it.id, "document"); else toast.error("Le livre n'a pas pu être créé");
    } catch (e) { toast.error("Le livre n'a pas pu être créé : " + (e?.response?.data?.detail || e?.message || "erreur")); }
  };
  const openBook = (b) => { sfx?.("open"); setSearch(false); setReading(b); };
  const enter = (k) => { sfx?.("open"); setRoom(k); document.querySelector(".at-main, main")?.scrollTo?.({ top: 0 }); };
  // Habiller une salle : pour chaque cassette sans artwork choisi par toi, prend le mieux noté sur SteamGridDB.
  const [dressing, setDressing] = useState(false);
  const dressRoom = async (list) => {
    const todo = list.filter((b) => fmtOf(b) === "vhs" && !rawCovers[b.id]);
    if (!todo.length) { toast("Toutes les cassettes de cette salle ont déjà un artwork choisi."); return; }
    setDressing(true); const t = toast.loading(`Artworks : 0 / ${todo.length}`); const found = {}; let miss = 0;
    for (let i = 0; i < todo.length; i++) {
      try { const r = await atelierApi.sgdbSearch(sgdbTerm(todo[i])); if (r?.items?.[0]) found[todo[i].id] = r.items[0].url; else miss++; }
      catch (e) { const st = e?.response?.status; if (st === 503 || st === 404) { toast.error(st === 404 ? "La recherche SteamGridDB n'est pas encore installée sur le serveur de la Station." : e.response.data?.detail || "Clé SteamGridDB absente", { id: t }); setDressing(false); return; } miss++; }
      toast.loading(`Artworks : ${i + 1} / ${todo.length}`, { id: t });
    }
    const c = { ...rawCovers, ...found }; setLocalCovers(c); write(LS.covers, c); at.saveConfig({ alexandrie: { ...(at.config?.alexandrie || {}), covers: c } }).catch(() => {});
    toast.success(`${Object.keys(found).length} artworks posés${miss ? `, ${miss} introuvables` : ""}. Change ceux qui ne te plaisent pas.`, { id: t });
    setDressing(false);
  };
  // url : une adresse = cet artwork ; "" = retiré (couverture dessinée) ; null = artwork d'origine.
  const saveCover = (id, url) => { const c = { ...rawCovers }; if (url === null) delete c[id]; else if (url) c[id] = url; else if (DEFAULT_COVERS[id]) c[id] = "-"; else delete c[id]; setLocalCovers(c); write(LS.covers, c); at.saveConfig({ alexandrie: { ...(at.config?.alexandrie || {}), covers: c } }).catch(() => {}); setCoverFor(null); };
  // « / » ouvre l'index, Échap revient au plan
  useEffect(() => {
    const k = (e) => { if (reading || coverFor || search) return; if (/^(INPUT|TEXTAREA)$/.test(e.target?.tagName) || e.target?.isContentEditable) return;
      if (e.key === "/") { e.preventDefault(); setSearch(true); } if (e.key === "Escape" && room) { setRoom(null); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [reading, coverFor, search, room]);
  const R = ROOMS.find((r) => r.key === room); const ri = ROOMS.indexOf(R);
  const inRoom = (k) => ({ here: all.filter((b) => b.room === k), up: UPCOMING.filter((b) => b.room === k) });
  const searchBtn = <button className="ax-find" onClick={() => setSearch(true)} data-testid="alex-find"><IoSearch size={15} /><span>Chercher un titre, un nom, un mot dans un livre…</span><kbd className="mono">/</kbd></button>;

  return (
    <section className={"at-view ax-view" + (R ? " in-room" : "")} data-testid="alexandrie">
      {!R ? (
        <>
          <header className="ax-top">
            <div className="ax-top-t">
              <p className="at-eyebrow mono">// ALEXANDRIE · 図書館 · {all.length} VOLUMES · {UPCOMING.length} À PARAÎTRE</p>
              <h1>La bibliothèque</h1>
              <p className="ax-top-ab">Nérodus tient les rayonnages. Pousse une porte.</p>
            </div>
            <div className="ax-tools">{searchBtn}
              <button className="ax-ghost" onClick={() => setPaste({ text: "" })} data-testid="alex-paste-open"><IoClipboardOutline size={15} /> Coller un livre</button>
              <button className="at-btn" onClick={() => addBook("atelier")} data-testid="alex-add"><IoAdd size={16} /> Écrire un livre</button>
              <button className="ax-ghost ax-ico" onClick={exportMine} title="Exporter mes livres (un fichier texte à recoller)" aria-label="Exporter mes livres" data-testid="alex-export"><IoDownloadOutline size={15} /></button></div>
          </header>
          {current.length > 0 && (
            <div className="ax-current">
              <p className="mono">LECTURES EN COURS</p>
              <div>{current.map((b) => <button key={b.id} onClick={() => openBook(b)} style={{ "--h": b.color ?? hue(b.title) }}><b>{b.title}</b><small className="mono">PAGE {prog[b.id].page + 1} / {prog[b.id].pages}</small><span><i style={{ width: `${(prog[b.id].page / Math.max(1, prog[b.id].pages - 1)) * 100}%` }} /></span></button>)}</div>
            </div>
          )}
          {(shelf.read.length + shelf.want.length + shelf.fav.length > 0) && (() => {
            const k = mineTab || (shelf.want.length ? "want" : shelf.read.length ? "read" : "fav"); const list = shelf[k].map((id) => all.find((b) => b.id === id)).filter(Boolean);
            return (
              <div className="ax-mine" data-testid="alex-mine">
                <p className="mono ax-plan-t"><span>MES LECTURES · 読書</span><i /></p>
                <div className="ax-types" role="tablist" aria-label="Mes lectures">{[["want", "À lire"], ["read", "Lus"], ["fav", "Coups de cœur"]].map(([v, l]) => <button key={v} role="tab" aria-selected={k === v} className={k === v ? "on" : ""} onClick={() => setMineTab(v)} data-testid={`alex-mine-${v}`}>{l} · {shelf[v].filter((id) => all.some((b) => b.id === id)).length}</button>)}</div>
                {list.length ? <Grid list={list} upFrom={list.length} selId={null} onSel={(id) => { const b = all.find((x) => x.id === id); if (b) { setSel((x) => ({ ...x, [b.room]: b.id })); enter(b.room); } }} covers={covers} onOpen={(b) => openBook(b)} menuFor={menuFor} stOf={stOf} /> : <p className="ax-empty">Rien ici pour l'instant.</p>}
              </div>
            ); })()}
          <p className="mono ax-plan-t"><span>PLAN DES SALLES · 館内図</span><i /></p>
          <div className="ax-plan" data-testid="alex-plan">
            {ROOMS.map((r, i) => { const { here, up } = inRoom(r.key); const strip = [...here, ...up];
              return (
                <button key={r.key} className={"ax-door" + (r.key === "lore" ? " wide" : "")} onClick={() => enter(r.key)} data-testid={`alex-door-${r.key}`} style={{ animationDelay: `${i * 45}ms` }}>
                  <span className="ax-door-k" aria-hidden="true">{r.kanji}</span>
                  <span className="mono ax-door-n">SALLE {String(i + 1).padStart(2, "0")}<i>{here.length} À {r.format === "vhs" ? "VOIR" : "LIRE"} · {up.length} À VENIR</i></span>
                  <span className="ax-door-l">{r.label}</span>
                  <span className="ax-door-ab">{r.about}</span>
                  <span className="ax-door-strip" aria-hidden="true">{strip.map((b, j) => { const L = volLook(b, j >= here.length); return <i key={b.id} className={`t-${L.tone} f-${L.fmt}` + (j >= here.length ? " up" : "") + (covers[b.id] ? " img" : "")} style={{ "--h": b.color ?? hue(b.title), "--r": L.r % 40, "--lean": L.r % 7 === 0 ? "-4deg" : "0deg", width: Math.max(8, Math.round(L.w / 4)), height: Math.round(L.hgt / 4.9), "--img": covers[b.id] ? `url(${covers[b.id]})` : undefined }} />; })}</span>
                  <span className="mono ax-door-go">ENTRER <IoArrowForward size={13} /></span>
                </button>
              ); })}
          </div>
        </>
      ) : (
        <>
          <nav className="ax-crumb mono" aria-label="Où je suis">
            <button onClick={() => { sfx?.("close"); setRoom(null); }} data-testid="alex-plan-back"><IoArrowBack size={14} /> PLAN</button>
            <span>ALEXANDRIE / SALLE {String(ri + 1).padStart(2, "0")}</span>
            <i />
            {searchBtn}
            <button onClick={() => enter(ROOMS[(ri + ROOMS.length - 1) % ROOMS.length].key)} aria-label="Salle précédente"><IoArrowBack size={13} /> {ROOMS[(ri + ROOMS.length - 1) % ROOMS.length].label.toUpperCase()}</button>
            <button onClick={() => enter(ROOMS[(ri + 1) % ROOMS.length].key)} aria-label="Salle suivante">{ROOMS[(ri + 1) % ROOMS.length].label.toUpperCase()} <IoArrowForward size={13} /></button>
          </nav>
          <header className="ax-top ax-roomhead" key={R.key}>
            <span className="ax-plaque-k" aria-hidden="true">{R.kanji}</span>
            <div className="ax-top-t"><h1>{R.label}</h1><p className="ax-top-ab">{R.about}</p></div>
            <div className="ax-tools">
              <div className="ax-types" role="tablist" aria-label="Mes lectures">{[["all", "Tout"], ["read", "Lus"], ["want", "À lire"], ["fav", "Coups de cœur"]].map(([k, l]) => <button key={k} role="tab" aria-selected={stf === k} className={stf === k ? "on" : ""} onClick={() => setStf(k)} data-testid={`alex-stf-${k}`}>{l}</button>)}</div>
              <div className="ax-types" role="tablist" aria-label="Genre">{[["all", "Tous"], ...Object.entries(TYPES).map(([k, v]) => [k, v.label])].map(([k, l]) => <button key={k} role="tab" aria-selected={type === k} className={type === k ? "on" : ""} onClick={() => setType(k)}>{l}</button>)}</div>
              <div className="ax-viewsw" role="group" aria-label="Affichage">
                <button className={view === "rayon" ? "on" : ""} aria-pressed={view === "rayon"} onClick={() => pickView("rayon")} data-testid="alex-view-rayon"><IoLibraryOutline size={14} /> Rayon</button>
                <button className={view === "grille" ? "on" : ""} aria-pressed={view === "grille"} onClick={() => pickView("grille")} data-testid="alex-view-grille"><IoGridOutline size={14} /> Grille</button>
              </div>
              {R.format === "vhs" && <button className="ax-ghost" onClick={() => dressRoom([...inRoom(R.key).here, ...inRoom(R.key).up])} disabled={dressing} data-testid="alex-dress"><IoImageOutline size={15} /> {dressing ? "Recherche…" : "Habiller la salle"}</button>}
              <button className="ax-ghost" onClick={() => setPaste({ text: "" })} data-testid="alex-paste-open"><IoClipboardOutline size={15} /> Coller</button>
              <button className="at-btn" onClick={() => addBook(R.key)} data-testid="alex-add"><IoAdd size={16} /> Écrire</button>
            </div>
          </header>
          <Room r={R} n={ri + 1} here={inRoom(R.key).here.filter(match)} up={inRoom(R.key).up.filter(matchUp)} selId={sel[R.key]} onSel={(id) => { sfx?.("nav"); setSel((s) => ({ ...s, [R.key]: id })); }} covers={covers} wish={wish} prog={prog} onRead={openBook} onWish={toggleWish} onCover={setCoverFor} onEdit={open} onModify={modifyBook} menuFor={menuFor} noteCount={(id) => notesOf(notesItemOf(at, id)).length} onNotes={(b) => { setReadNotes(true); openBook(b); }} favs={favs} onFav={toggleFav} view={view} stOf={stOf} onStatus={setStatus} />
        </>
      )}
      {wish.length > 0 && <p className="ax-wishes mono">★ {wish.length} TITRE{wish.length > 1 ? "S" : ""} DEMANDÉ{wish.length > 1 ? "S" : ""} : {wish.map((id) => UPCOMING.find((u) => u.id === id)?.title).filter(Boolean).join(" · ")}</p>}
      {coverFor && <CoverDialog b={coverFor} current={covers[coverFor.id]} def={DEFAULT_COVERS[coverFor.id]} onSave={(u) => saveCover(coverFor.id, u)} onClose={() => setCoverFor(null)} />}
      {search && <AlexSearch books={all} onClose={() => setSearch(false)} onOpen={openBook} onGoto={(b) => { setSearch(false); setRoom(b.room); setSel((s) => ({ ...s, [b.room]: b.id })); }} />}
      {paste && <AlexPaste initial={paste.text} editing={paste.title} onSave={savePaste} onClose={() => setPaste(null)} onPreview={(b) => setReading(b)} renderCover={(b) => <Face b={b} cover={b.coverUrl || covers[b.id]} />} />}
      {readingBook && (readingBook.preview
        ? <Reader key={readingBook.id + readingBook.words} book={readingBook} at={null} radio={radio} cover={readingBook.coverUrl} onClose={() => { sfx?.("close"); setReading(null); }} />
        : <Reader key={readingBook.id} book={readingBook} at={at} startNotes={readNotes} radio={radio} cover={covers[readingBook.id]} onClose={() => { sfx?.("close"); setReading(null); setReadNotes(false); }} onEdit={(id) => { setReading(null); open(id); }}
          onModify={() => modifyBook(readingBook)} onSwap={(oldId, newId) => swapVideo(readingBook, oldId, newId)} onRemoveVideo={(id) => removeVideo(readingBook, id)} onAddVideo={(si, id, cap) => addVideo(readingBook, si, id, cap)}
          onDone={() => setStatus("read", readingBook.id, true)} />)}
    </section>
  );
}
