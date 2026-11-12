import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoArrowBack, IoArrowForward, IoClose, IoAdd, IoBookmark, IoBookmarkOutline, IoList, IoSearch, IoStar, IoStarOutline, IoOpenOutline, IoImageOutline, IoMusicalNotes, IoPlay, IoPause, IoLogoYoutube, IoCreateOutline, IoTrashOutline, IoCloudUploadOutline, IoHeart, IoHeartOutline } from "react-icons/io5";
import { toast } from "sonner";
import { atelierApi } from "@/lib/atelier";
import { uploadJournalImage } from "@/lib/api";
import { DEFAULT_COVERS, mergeCovers, sgdbTerm } from "@/data/alexandrie/covers";
import { IoPencil, IoPrintOutline, IoSwapHorizontal, IoArrowUndo } from "react-icons/io5";
import { pressMenu } from "@/components/atelier/ContextMenu";
import { labConfirm } from "@/components/atelier/LabDialog";
import { exportBook } from "@/lib/exportPdf";
import { ROOMS, TYPES, BOOKS, UPCOMING, parseBook, readingTime } from "@/data/alexandrie";
import { stripHtml } from "@/lib/atelier";
import { useApp } from "@/context/AppContext";
import "@/components/atelier/alexandrie.css";

// ALEXANDRIE — la bibliothèque de l'Atelier. Des salles, des rayonnages, des livres qui s'ouvrent.
// Les livres de fond sont dans src/data/alexandrie ; les tiens sont des fiches de l'Atelier (fields.alexandrie).
const LS = { prog: "nx-alex-progress", wish: "nx-alex-wish", covers: "nx-alex-covers", fav: "nx-alex-fav" };
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || "") ?? d; } catch (_) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
const NOEDITS = {};
const ytId = (s = "") => (s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/) || [])[1] || (/^[\w-]{11}$/.test(s.trim()) ? s.trim() : null);
const hue = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };

// Fiche de l'Atelier → livre lisible (HTML simple découpé en chapitres sur les titres)
function itemToBook(it) {
  try { return itemToBookRaw(it); } catch (_) { return { id: "item:" + it.id, itemId: it.id, mine: true, title: String(it.title || "Sans titre"), sub: "", room: "atelier", type: "recit", about: "", cote: "PERS.", chapters: [{ title: "", blocks: [{ t: "p", x: "Ce livre n'a pas pu être lu. Ouvre-le pour le corriger." }] }], words: 0, links: [] }; }
}
// Texte d'un nœud avec l'italique gardé (*mot*)
const nodeText = (n) => [...n.childNodes].map((c) => (c.nodeType === 3 ? c.textContent : /^(EM|I)$/.test(c.nodeName) ? `*${c.textContent}*` : c.nodeName === "BR" ? " " : nodeText(c))).join("").replace(/\s+/g, " ").trim();
const YT_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;
function itemToBookRaw(it) {
  const doc = new DOMParser().parseFromString(`<div>${it.content || ""}</div>`, "text/html").body.firstChild;
  const chapters = []; let cur = { title: "", blocks: [] };
  const newCh = (t) => { if (cur.blocks.length || cur.title) chapters.push(cur); cur = { title: t, blocks: [] }; };
  for (const n of [...doc.childNodes]) {
    const tag = n.nodeName; const txt = (n.textContent || "").trim();
    const img = n.nodeType === 1 && (tag === "IMG" ? n : n.querySelector?.("img"));
    if (img && (tag === "FIGURE" || tag === "IMG" || !txt)) { const [cap, credit] = (n.querySelector?.("figcaption")?.textContent || img.alt || "").split(" | ").map((x) => x.trim()); cur.blocks.push({ t: "img", src: img.getAttribute("src"), cap, credit }); continue; }
    if (!txt) continue;
    const a = n.nodeType === 1 && n.querySelector?.("a[href]"); const yt = a && (a.getAttribute("href") || "").match(YT_RE);
    if (yt && a.textContent.trim() === txt) { cur.blocks.push({ t: "yt", id: yt[1], cap: txt.replace(/^▶\s*/, "").replace(/^https?:\S+$/, "") }); continue; }
    if (/^H[12]$/.test(tag)) { newCh(txt); continue; }
    if (tag === "H3" || tag === "H4") { cur.blocks.push({ t: "h", x: nodeText(n) }); continue; }
    if (tag === "BLOCKQUOTE") { const ps = [...n.querySelectorAll("p")].map(nodeText).filter(Boolean); cur.blocks.push(ps.length > 1 ? { t: "q", x: ps.slice(0, -1).join(" "), by: ps[ps.length - 1] } : { t: "q", x: nodeText(n) }); continue; }
    // Une phrase toute en gras, courte : un titre de chapitre. Un début en gras suivi de « : » : un encadré.
    const strong = n.nodeType === 1 && n.querySelector?.("strong,b");
    if (strong && strong.textContent.trim() === txt && txt.length < 90) { newCh(txt.replace(/[:.]\s*$/, "")); continue; }
    if (strong && txt.startsWith(strong.textContent.trim()) && /:\s*$/.test(strong.textContent.trim())) { cur.blocks.push({ t: "box", label: strong.textContent.trim().replace(/\s*:\s*$/, "").toUpperCase(), x: nodeText(n).slice(strong.textContent.trim().length).trim() }); continue; }
    cur.blocks.push({ t: "p", x: n.nodeType === 1 ? nodeText(n) : txt });
  }
  if (cur.blocks.length || cur.title) chapters.push(cur);
  const a = it.fields?.alexandrie || {};
  return { id: "item:" + it.id, itemId: it.id, mine: true, title: String(it.title || "Sans titre"), sub: a.sub || "", room: a.room || "atelier", type: a.type || "recit", about: a.about || "", color: a.color, cote: "PERS.", chapters: chapters.length ? chapters : [{ title: "", blocks: [{ t: "p", x: "Ce livre est encore vide. Ouvre-le dans l'éditeur pour l'écrire." }] }], links: [], text: stripHtml(it.content || ""), words: stripHtml(it.content || "").split(/\s+/).filter(Boolean).length };
}
// Livre de la bibliothèque → document de l'éditeur (pour le modifier avec le même éditeur que tes livres)
const hEsc = (x) => String(x || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const hEm = (x) => hEsc(x).replace(/\*([^*]+)\*/g, "<em>$1</em>");
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

const inline = (s) => s.split(/(\*[^*]+\*)/g).map((p, i) => (p.startsWith("*") && p.endsWith("*") && p.length > 2 ? <em key={i}>{p.slice(1, -1)}</em> : p));

// Un volume sur le rayonnage : tranche (illustration, titre vertical, étiquette de cote) ou, s'il est choisi, boîtier de face.
const TONES = ["ink", "color", "paper", "color", "ink", "deep", "color"];
const fmtOf = (b) => b.format || (b.room === "lore" ? "vhs" : b.room === "musique" ? "vinyle" : "livre");
const volLook = (b, upcoming) => {
  const r = hue(b.title + "r"); const fmt = fmtOf(b);
  const w = fmt === "vhs" ? 62 : fmt === "vinyle" ? 30 + (r % 3) * 4 : upcoming ? 54 + (r % 22) : 54 + Math.min(28, Math.round((b.words || 1500) / 280));
  const hgt = fmt === "vhs" ? 336 : fmt === "vinyle" ? 318 : 312 + (r % 5) * 7;
  return { r, fmt, w, hgt, tone: (fmt === "vhs" ? ["color", "deep", "ink", "color", "deep"] : TONES)[hue(b.title + "t") % (fmt === "vhs" ? 5 : TONES.length)], lean: ((r % 9) - 4) * 0.12 };
};
function Volume({ b, sel, cover, upcoming, wished, onPick, onOpen, menu }) {
  const pm = menu ? pressMenu(menu) : {};
  const ctx = menu ? { ...pm, onContextMenu: (e) => { if (!sel) onPick?.(); pm.onContextMenu(e); } } : {};
  const h = b.color ?? hue(b.title); const L = volLook(b, upcoming); const fmt = L.fmt;
  const R = ROOMS.find((r) => r.key === b.room); const em = b.emblem || (upcoming ? b.title.replace(/^(Le |La |Les |L')/, "")[0].toUpperCase() : R?.kanji || "書");
  const cls = ` t-${L.tone} f-${fmt}` + (upcoming ? " up" : "") + (b.mine ? " mine" : "");
  const len = b.title.length; const fs = Math.max(11.5, Math.min(21, Math.floor(196 / (len * 0.66))));
  const longest = Math.max(...b.title.split(/[\s-]+/).map((w) => w.length)); const cfs = Math.max(17, Math.min(40, Math.floor((fmt === "vhs" ? 168 : 190) / (longest * 0.7)), len > 22 ? 22 : 40));
  const vars = { "--h": h, "--r": L.r % 40, "--c": 18 + (L.r % 60) };
  if (sel) return (
    <button className={"ax-cover" + cls + (cover ? " img" : "")} style={vars} onClick={onOpen} data-testid={`alex-cover-${b.id}`} aria-label={`${b.title} : ${upcoming ? "à paraître" : "ouvrir"}`} {...ctx}>
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
      {fmt === "vhs" ? <span className="ax-sticker">{upcoming ? "BIENTÔT" : "REMBOBINER SVP"}</span> : <span className="ax-cover-tag mono">{upcoming ? (wished ? "★ DEMANDÉ" : "À PARAÎTRE") : b.cote}</span>}
      <span className="ax-wear" aria-hidden="true" />
    </button>
  );
  return (
    <button className={"ax-vol" + cls} style={{ ...vars, width: L.w, height: L.hgt, "--lean": `${L.lean}deg` }} onClick={onPick} title={`${b.title}${b.sub ? " · " + b.sub : ""}${upcoming ? " (à paraître)" : ""}`} data-testid={`alex-book-${b.id}`} {...ctx}>
      <span className="ax-vol-art" style={cover ? { backgroundImage: `url(${cover})` } : undefined}>{!cover && <i>{em}</i>}</span>
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
function ReaderMusic({ radio, onClose }) {
  const [q, setQ] = useState(""); const [res, setRes] = useState(null); const [busy, setBusy] = useState(false);
  const go = async (e) => { e.preventDefault(); if (!q.trim()) return; setBusy(true); try { setRes(await atelierApi.ytSearch(q.trim())); } catch (_) { toast.error("Recherche impossible"); } setBusy(false); };
  const play = (v) => radio.play({ id: "yt" + v.id, url: `https://www.youtube.com/watch?v=${v.id}`, title: v.title, thumb: `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg` });
  return (
    <aside className="ax-music" data-testid="alex-music-panel">
      <p className="mono">MUSIQUE DE LECTURE</p>
      {radio.pl && <div className="ax-now"><button onClick={radio.toggle} aria-label={radio.playing ? "Pause" : "Lecture"}>{radio.playing ? <IoPause size={15} /> : <IoPlay size={15} />}</button><span>{radio.info?.title || radio.pl.title}</span><input type="range" min="0" max="100" value={radio.muted ? 0 : radio.vol ?? 60} onChange={(e) => radio.setVol(+e.target.value)} aria-label="Volume" /><button onClick={radio.stop} aria-label="Arrêter"><IoClose size={15} /></button></div>}
      <form onSubmit={go} className="ax-ytq"><IoLogoYoutube size={17} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher sur YouTube : Hisaishi, pluie, lo-fi…" data-testid="alex-music-input" /><button type="submit" disabled={busy}>{busy ? "…" : "Chercher"}</button></form>
      {res && (res.length ? res.slice(0, 12).map((v) => <button key={v.id} className="ax-ytr" onClick={() => play(v)} data-testid={`alex-yt-${v.id}`}><i style={{ backgroundImage: `url(https://i.ytimg.com/vi/${v.id}/mqdefault.jpg)` }} /><span><b>{v.title}</b><small>{v.author}{v.length ? ` · ${v.length}` : ""}</small></span></button>) : <p className="ax-empty">Aucun résultat.</p>)}
      {!res && (radio.list || []).length > 0 && <><p className="mono" style={{ marginTop: 14 }}>MES PLAYLISTS</p>{radio.list.slice(0, 8).map((p) => <button key={p.id} className="ax-ytr" onClick={() => radio.play(p)}><i style={{ backgroundImage: p.cover || p.thumb ? `url(${p.cover || p.thumb})` : undefined }} /><span><b>{p.title}</b><small>Playlist de ta radio</small></span></button>)}</>}
      <button className="ax-rb" style={{ marginTop: 12 }} onClick={onClose}>Fermer</button>
    </aside>
  );
}

// Illustration dans le livre : image (cachée si le lien ne répond pas) ou vidéo YouTube lancée sur place.
function Fig({ b }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <figure className="ax-fig">
      <a href={b.src} target="_blank" rel="noopener noreferrer"><img src={b.src} alt={b.cap || ""} loading="lazy" referrerPolicy="no-referrer" onError={() => setOk(false)} /></a>
      {(b.cap || b.credit) && <figcaption>{b.cap && inline(b.cap)}{b.credit && <small className="mono">{b.credit}</small>}</figcaption>}
    </figure>
  );
}
function YtFig({ b, onSwap }) {
  const [on, setOn] = useState(false); const [ed, setEd] = useState(false); const [v, setV] = useState("");
  const swap = (e) => { e.preventDefault(); const id = ytId(v); if (!id) { toast.error("Lien YouTube non reconnu"); return; } onSwap(b.id, id); setEd(false); setOn(false); };
  return (
    <figure className="ax-fig ax-yt">
      {on ? <iframe src={`https://www.youtube-nocookie.com/embed/${b.id}?autoplay=1&rel=0`} title={b.cap || "Vidéo"} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        : <button type="button" onClick={() => setOn(true)} style={{ backgroundImage: `url(https://i.ytimg.com/vi/${b.id}/hqdefault.jpg)` }} aria-label={`Lire la vidéo : ${b.cap || ""}`}><IoPlay size={26} /></button>}
      <figcaption>{b.cap && inline(b.cap)}<small className="mono"><a href={`https://www.youtube.com/watch?v=${b.id}`} target="_blank" rel="noopener noreferrer">VOIR SUR YOUTUBE ↗</a>{onSwap && <button type="button" className="ax-yt-sw" onClick={() => { setEd((x) => !x); setV(""); }} data-testid={`alex-yt-swap-${b.id}`}><IoSwapHorizontal size={11} /> CHANGER</button>}</small></figcaption>
      {ed && <form className="ax-yt-ed" onSubmit={swap}><input ref={(el) => el && !el.dataset.f && (el.dataset.f = "1", el.focus({ preventScroll: true }))} value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); setEd(false); } }} placeholder="Colle le lien de la nouvelle vidéo YouTube" data-testid="alex-yt-swap-in" /><button className="at-btn" type="submit">OK</button></form>}
    </figure>
  );
}

function Reader({ book, onClose, onEdit, onModify, onSwap, paused, radio, cover, at, startNotes }) {
  const { sfx } = useApp();
  const flow = useRef(null);
  const tx = useRef(0);
  const [page, setPage] = useState(() => read(LS.prog, {})[book.id]?.page || 0);
  const [pages, setPages] = useState(1);
  const [per, setPer] = useState(2);
  const [toc, setToc] = useState(false);
  const [music, setMusic] = useState(false);
  const [notes, setNotes] = useState(!!startNotes);
  const [mark, setMark] = useState(() => !!read(LS.prog, {})[book.id]?.mark);
  // Géométrie des colonnes : le pas d'une page = largeur de colonne + gouttière, hors marges.
  const geom = () => {
    const el = flow.current; const cs = getComputedStyle(el);
    const pad = parseFloat(cs.paddingLeft) || 0; const gap = parseFloat(cs.columnGap) || 0;
    const p = window.innerWidth < 900 ? 1 : 2;
    const colW = (el.clientWidth - pad * 2 - gap * (p - 1)) / p;
    return { el, pad, gap, p, step: colW + gap };
  };
  const measure = () => {
    if (!flow.current) return; const g = geom(); setPer(g.p);
    const n = Math.max(1, Math.round((g.el.scrollWidth - g.pad * 2 + g.gap) / g.step));
    setPages(n); setPage((x) => Math.min(x, Math.max(0, n - 1)));
  };
  useEffect(() => { const el = flow.current; if (!el) return; const f = () => measure(); el.addEventListener("load", f, true); el.addEventListener("error", f, true); return () => { el.removeEventListener("load", f, true); el.removeEventListener("error", f, true); }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => { measure(); const t = setTimeout(measure, 350); document.fonts?.ready?.then(measure).catch(() => {}); window.addEventListener("resize", measure); return () => { clearTimeout(t); window.removeEventListener("resize", measure); }; }, [book]); // eslint-disable-line
  const spread = Math.floor(page / per) * per;
  useEffect(() => { if (!flow.current) return; const g = geom(); g.el.scrollLeft = Math.round(spread * g.step); }, [spread, per, pages, book]); // eslint-disable-line
  useEffect(() => { const all = read(LS.prog, {}); all[book.id] = { page, pages, mark, at: Date.now() }; write(LS.prog, all); }, [page, pages, mark, book.id]);
  const go = (d) => { const n = Math.max(0, Math.min(pages - 1, spread + d * per)); if (n !== spread) { setPage(n); sfx?.("nav"); } };
  useEffect(() => {
    const k = (e) => { if (paused) return; if (e.key === "Escape") { e.stopPropagation(); notes ? setNotes(false) : music ? setMusic(false) : toc ? setToc(false) : onClose(); return; } if (/^(INPUT|TEXTAREA)$/.test(e.target?.tagName) || e.target?.isContentEditable) return; if ((e.key === "n" || e.key === "N") && at && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); setNotes((x) => !x); setToc(false); setMusic(false); return; } if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); go(1); } if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); } };
    window.addEventListener("keydown", k, true); return () => window.removeEventListener("keydown", k, true);
  });
  const chapterAt = () => { try { const g = geom(); const x = spread * g.step + g.pad + 2; let t = ""; flow.current.querySelectorAll("[data-ch]").forEach((el) => { if (el.offsetLeft <= x + g.step * (g.p - 1)) t = el.querySelector("h2")?.textContent || t; }); return t; } catch (_) { return ""; } };
  const jump = (i) => { const el = flow.current?.querySelector(`[data-ch="${i}"]`); if (!el) return; const g = geom(); setPage(Math.max(0, Math.round((el.offsetLeft - g.pad) / g.step))); setToc(false); };
  const T = TYPES[book.type] || TYPES.recit; const R = ROOMS.find((r) => r.key === book.room);
  const noteMarks = notesOf(notesItemOf(at, book.id)).map((n) => ({ id: n.id, t: n.t, at: Math.max(0, Math.min(pages - 1, n.n ? Math.round((n.p / n.n) * pages) : n.p)) }));
  return createPortal(
    <div className={"ax-reader ax-view" + (fmtOf(book) === "vhs" ? " skin-vhs" : "")} style={{ "--h": book.color ?? hue(book.title) }} data-testid="alex-reader" role="dialog" aria-modal="true" aria-label={book.title}>
      <header className="ax-rbar">
        <button className="ax-rb" onClick={onClose} data-testid="alex-close"><IoArrowBack size={15} /> <span>Rayonnages</span></button>
        <p className="mono ax-rpath">ALEXANDRIE / {(R?.label || "MES LIVRES").toUpperCase()} / <b>{book.cote}</b></p>
        <span className="grow" />
        {book.mine ? <button className="ax-rb" onClick={() => onEdit(book.itemId)}><IoCreateOutline size={15} /> <span>Écrire</span></button>
          : onModify && <button className="ax-rb" onClick={onModify} title="Modifier le texte, les images, les vidéos" data-testid="alex-modify"><IoCreateOutline size={15} /> <span>Modifier</span></button>}
        {at && <button className={"ax-rb" + (notes ? " on" : "")} onClick={() => { setNotes((n) => !n); setToc(false); setMusic(false); }} aria-expanded={notes} title="Notes (touche N)" data-testid="alex-notes"><IoPencil size={14} /> <span>Notes{noteMarks.length ? ` · ${noteMarks.length}` : ""}</span></button>}
        {radio && <button className={"ax-rb" + (radio.playing ? " on" : "")} onClick={() => { setMusic((m) => !m); setToc(false); setNotes(false); }} aria-expanded={music} data-testid="alex-music"><IoMusicalNotes size={15} /> <span>Musique</span></button>}
        <button className="ax-rb" onClick={() => exportBook(book, cover, bookNotes(at, book.id, pages))} title="Exporter le livre en PDF, avec tes notes" data-testid="alex-pdf"><IoPrintOutline size={15} /> <span>PDF</span></button>
        <button className="ax-rb" onClick={() => { setToc((t) => !t); setMusic(false); }} aria-expanded={toc} data-testid="alex-toc"><IoList size={16} /> <span>Sommaire</span></button>
        <button className={"ax-rb" + (mark ? " on" : "")} onClick={() => { setMark((m) => !m); sfx?.("select"); }} aria-pressed={mark} title="Marque-page">{mark ? <IoBookmark size={16} /> : <IoBookmarkOutline size={16} />}</button>
      </header>
      <div className="ax-stage">
        <button className="ax-turn l" onClick={() => go(-1)} disabled={spread === 0} aria-label="Page précédente"><IoArrowBack size={20} /></button>
        <div className={"ax-book" + (per === 1 ? " single" : "")} onTouchStart={(e) => { tx.current = e.touches[0].clientX; }} onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - tx.current; if (Math.abs(d) > 45) go(d < 0 ? 1 : -1); }}>
          <div className="ax-flow" ref={flow} onScroll={() => { try { const g = geom(); const want = Math.round(spread * g.step); if (Math.abs(g.el.scrollLeft - want) > 2) g.el.scrollLeft = want; } catch (_) {} }}>
            <section className="ax-titlepage">
              {cover && <span className="ax-tp-art" style={{ backgroundImage: `url(${cover})` }} />}
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
                {c.title && <header><span className="mono">{String(i + 1).padStart(2, "0")}</span><h2>{c.title}</h2></header>}
                {c.blocks.map((b, j) => b.t === "q" ? <blockquote key={j}><p>{inline(b.x)}</p>{b.by && <cite>{b.by}</cite>}</blockquote>
                  : b.t === "h" ? <h3 key={j}>{inline(b.x)}</h3>
                  : b.t === "img" ? <Fig key={j} b={b} />
                  : b.t === "yt" ? <YtFig key={j} b={b} onSwap={onSwap} />
                  : b.t === "box" ? <aside className="ax-box" key={j}><b className="mono">{b.label || "À RETENIR"}</b><p>{inline(b.x)}</p></aside>
                  : <p key={j} className={j === 0 && c.title ? "first" : ""}>{inline(b.x)}</p>)}
              </section>
            ))}
            {(book.links || []).length > 0 && (
              <section className="ax-ch ax-more" data-ch="more">
                <header><span className="mono">→</span><h2>Pour aller plus loin</h2></header>
                <ul>{book.links.map((l, i) => <li key={i}>{l.url ? <a href={l.url} target="_blank" rel="noopener noreferrer">{l.label} <IoOpenOutline size={12} /></a> : <span>{l.label}</span>}{l.note && <small>{l.note}</small>}</li>)}</ul>
              </section>
            )}
          </div>
        </div>
        <button className="ax-turn r" onClick={() => go(1)} disabled={spread + per >= pages} aria-label="Page suivante"><IoArrowForward size={20} /></button>
      </div>
      <footer className="ax-rfoot mono"><span>{book.title.toUpperCase()}</span><span className="ax-prog"><i style={{ width: `${Math.min(100, ((spread + per) / pages) * 100)}%` }} />{noteMarks.map((n) => <button key={n.id} className="ax-pmark" style={{ left: `${(n.at / Math.max(1, pages - 1)) * 100}%` }} onClick={() => { setPage(n.at); setNotes(true); }} title={`Note page ${n.at + 1} : ${n.t.slice(0, 80)}`} aria-label={`Note page ${n.at + 1}`} />)}</span><span>PAGE {Math.min(pages, spread + 1)}{per === 2 && spread + 2 <= pages ? `–${spread + 2}` : ""} / {pages}</span></footer>
      {music && radio && <ReaderMusic radio={radio} onClose={() => setMusic(false)} />}
      {notes && at && <ReaderNotes at={at} book={book} page={spread} pages={pages} chapter={chapterAt()} onClose={() => setNotes(false)} onJump={(p) => { setPage(Math.max(0, Math.min(pages - 1, p))); sfx?.("nav"); }} />}
      {toc && (
        <aside className="ax-toc" data-testid="alex-toc-panel">
          <p className="mono">SOMMAIRE</p>
          {book.chapters.map((c, i) => <button key={i} onClick={() => jump(i)}><span className="mono">{String(i + 1).padStart(2, "0")}</span>{c.title || "Texte"}</button>)}
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
function Rail({ code, label, list, upFrom, selId, onSel, covers, wish, onOpen, kanji, menuFor }) {
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
        {list.map((b, i) => <Volume key={b.id} b={b} sel={i === k} cover={covers[b.id]} upcoming={i >= upFrom} wished={wish.includes(b.id)} onPick={() => onSel(b.id)} onOpen={() => onOpen(b, i >= upFrom)} menu={menuFor && menuFor(b, i >= upFrom)} />)}
      </div>
      <button className="ax-step r" onClick={() => (k < 0 ? page(1) : move(1))} aria-label="Suivant"><IoArrowForward size={17} /></button>
      <p className="ax-rack-tag mono"><b>{code}</b><span>{label}</span><i>{list.length} VOLUME{list.length > 1 ? "S" : ""}</i></p>
    </div>
  );
}

// Une salle : on y est entré par sa porte. Rayon A (à lire), notice du volume choisi, rayon B (à paraître).
function Room({ r, n, here, up, selId, onSel, covers, wish, prog, onRead, onWish, onCover, onEdit, onModify, menuFor, noteCount, onNotes, favs, onFav }) {
  const all = [...here, ...up]; const cur = all.find((b) => b.id === selId) || all[0]; const isUp = cur ? !here.includes(cur) : false;
  const id = cur?.id; const pg = cur && prog[cur.id]; const T = TYPES[cur?.type] || TYPES.recit; const fmt = cur ? fmtOf(cur) : "livre";
  const act = (b, u) => (u ? onWish(b.id) : onRead(b));
  const num = String(n).padStart(2, "0");
  const split = here.length >= 6 && up.length > 0;
  return (
    <section className="ax-room" aria-label={r.label} data-testid={`alex-room-${r.key}`} key={r.key}>
      {split ? (here.length > 0 && <Rail code={`RAYON ${num}-A`} label={r.format === "vhs" ? "À DÉCOUVRIR" : "À LIRE"} list={here} upFrom={here.length} selId={id} onSel={onSel} covers={covers} wish={wish} onOpen={act} kanji={r.kanji} menuFor={menuFor} />)
        : all.length > 0 && <Rail code={`RAYON ${num}-A`} label={(r.format === "vhs" ? "À DÉCOUVRIR" : "À LIRE") + (up.length ? " · PUIS À PARAÎTRE" : "")} list={all} upFrom={here.length} selId={id} onSel={onSel} covers={covers} wish={wish} onOpen={act} kanji={r.kanji} menuFor={menuFor} />}
      {cur && (
        <div className="ax-notice" key={cur.id}>
          <p className="mono meta">{isUp ? "À PARAÎTRE" : cur.cote || "MES LIVRES"} · {T.label.toUpperCase()} · {fmt === "vhs" ? "CASSETTE" : fmt === "vinyle" ? "DISQUE" : "LIVRE"}{!isUp && cur.words ? ` · ${readingTime(cur.words).toUpperCase()}` : ""}</p>
          <h3>{cur.title}{favs.includes(cur.id) && <IoHeart className="ax-favh" size={20} aria-label="Coup de cœur" />}</h3>
          {cur.sub && <p className="sub">{cur.sub}</p>}
          {cur.about && <p className="ab">{cur.about}</p>}
          {isUp && <p className="ab">Pas encore écrit. Marque-le d'une étoile : les titres étoilés passent en premier.</p>}
          <div className="ax-acts">
            {isUp ? <button className="at-btn" onClick={() => onWish(cur.id)} data-testid="alex-wish">{wish.includes(cur.id) ? <><IoStar size={15} /> Demandé</> : <><IoStarOutline size={15} /> Je veux le lire</>}</button>
              : <button className="at-btn" onClick={() => onRead(cur)} data-testid="alex-read"><IoPlay size={14} /> {pg && pg.page > 0 ? `Reprendre page ${pg.page + 1}` : fmt === "vhs" ? "Lancer" : "Lire"}</button>}
            {cur.mine && <button className="ax-ghost" onClick={() => onEdit(cur.itemId)}><IoCreateOutline size={15} /> Écrire</button>}
            {!isUp && noteCount(cur.id) > 0 && <button className="ax-ghost" onClick={() => onNotes(cur)} data-testid="alex-notes-notice"><IoPencil size={14} /> Mes notes · {noteCount(cur.id)}</button>}
            {!isUp && <button className={"ax-ghost" + (favs.includes(cur.id) ? " on" : "")} onClick={() => onFav(cur.id)} aria-pressed={favs.includes(cur.id)} data-testid="alex-fav">{favs.includes(cur.id) ? <IoHeart size={15} /> : <IoHeartOutline size={15} />} Coup de cœur</button>}
            {!cur.mine && !isUp && <button className="ax-ghost" onClick={() => onModify(cur)} data-testid="alex-modify-notice"><IoCreateOutline size={15} /> Modifier</button>}
            <button className="ax-ghost" onClick={() => onCover(cur)} data-testid="alex-cover-edit"><IoImageOutline size={15} /> {covers[cur.id] ? "Changer l'artwork" : "Mettre un artwork"}</button>
          </div>
        </div>
      )}
      {split && up.length > 0 && <Rail code={`RAYON ${num}-B`} label="À PARAÎTRE" list={up} upFrom={0} selId={id} onSel={onSel} covers={covers} wish={wish} onOpen={act} kanji={r.kanji} menuFor={menuFor} />}
      {!all.length && <p className="ax-empty">Rien sur ces rayons pour l'instant.</p>}
    </section>
  );
}

// Choisir l'artwork d'un volume : adresse, fichier, glisser-déposer ou coller. Raccourcis de recherche d'images.
function CoverDialog({ b, current, def, onSave, onClose }) {
  const [url, setUrl] = useState(current || ""); const [busy, setBusy] = useState(false);
  const send = async (f) => { if (!f || !/^image\//.test(f.type)) return; setBusy(true); try { const r = await uploadJournalImage(f); setUrl(r.url); onSave(r.url); } catch (_) { toast.error("Envoi de l'image impossible"); } setBusy(false); };
  useEffect(() => {
    const paste = (e) => { const f = [...(e.clipboardData?.files || [])].find((x) => /^image\//.test(x.type)); if (f) { e.preventDefault(); send(f); } };
    window.addEventListener("paste", paste); return () => window.removeEventListener("paste", paste);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const term = encodeURIComponent(b.title); const game = fmtOf(b) === "vhs";
  // Recherche SteamGridDB intégrée (passe par le serveur, qui garde la clé)
  const [sq, setSq] = useState(() => sgdbTerm(b)); const [sg, setSg] = useState(null); const [sgBusy, setSgBusy] = useState(false); const [sgErr, setSgErr] = useState("");
  const sgGo = async (game) => { const q = sq.trim(); if (!q) return; setSgBusy(true); setSgErr(""); try { setSg(await atelierApi.sgdbSearch(q, game)); } catch (e) { setSgErr(e?.response?.status === 404 ? "La recherche SteamGridDB n'est pas encore installée sur le serveur de la Station (backend Emergent)." : e?.response?.data?.detail || "SteamGridDB ne répond pas."); } setSgBusy(false); };
  useEffect(() => { sgGo(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="ax-fiche-wrap" onClick={onClose}>
      <form className="ax-fiche ax-coverdlg" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(url.trim()); }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) send(f); else { const u = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain"); if (/^https?:/.test(u)) setUrl(u.trim()); } }} role="dialog" aria-modal="true" aria-label="Artwork">
        <p className="mono ax-fiche-top"><span>ARTWORK · 表紙</span><button type="button" onClick={onClose} aria-label="Fermer"><IoClose size={15} /></button></p>
        <div className="ax-cd">
          <span className="ax-cd-prev" style={url ? { backgroundImage: `url(${url})` } : undefined}>{!url && <i>Glisse une image ici</i>}</span>
          <div>
            <h3>{b.title}</h3>
            <p className="ab">Colle l'adresse d'une image, colle une image copiée (Ctrl V), glisse-la ici ou envoie un fichier. Elle habille le boîtier, la tranche et la page de titre.</p>
            <input className="ax-in" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… (clic droit sur une image : copier l'adresse)" autoFocus data-testid="alex-cover-url" />
            <p className="mono ax-cd-l">TROUVER UN ARTWORK</p>
            <div className="ax-acts">
              <a className="ax-ghost" href={`https://www.steamgriddb.com/search/grids?term=${term}`} target="_blank" rel="noreferrer"><IoOpenOutline size={14} /> SteamGridDB</a>
              <a className="ax-ghost" href={`https://www.google.com/search?tbm=isch&q=${term}+${game ? "artwork" : "couverture"}`} target="_blank" rel="noreferrer"><IoOpenOutline size={14} /> Images</a>
            </div>
          </div>
        </div>
        <div className="ax-sg" data-testid="alex-sgdb">
          <div className="ax-sg-bar">
            <p className="mono ax-cd-l">STEAMGRIDDB</p>
            <label className="ax-ytq"><IoSearch size={15} /><input value={sq} onChange={(e) => setSq(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sgGo(); } }} placeholder="Nom du jeu, en anglais de préférence" data-testid="alex-sgdb-q" /><button type="button" onClick={() => sgGo()} disabled={sgBusy}>{sgBusy ? "…" : "Chercher"}</button></label>
          </div>
          {sg?.games?.length > 1 && <div className="ax-sg-games">{sg.games.map((g) => <button type="button" key={g.id} className={g.id === sg.game ? "on" : ""} onClick={() => sgGo(g.id)}>{g.name}</button>)}</div>}
          {sgErr && <p className="ax-empty" style={{ padding: "12px 0" }}>{sgErr}</p>}
          {!sgErr && sg && !sg.items.length && <p className="ax-empty" style={{ padding: "12px 0" }}>Aucun artwork trouvé. Essaie le titre anglais exact.</p>}
          {sg?.items?.length > 0 && <div className="ax-sg-grid">{sg.items.map((a) => <button type="button" key={a.id} className={url === a.url ? "on" : ""} onClick={() => setUrl(a.url)} onDoubleClick={() => onSave(a.url)} title={a.author ? `par ${a.author}` : ""} data-testid={`alex-sgdb-${a.id}`}><img src={a.thumb} alt="" loading="lazy" /></button>)}</div>}
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
  const [search, setSearch] = useState(false);
  const [reading, setReading] = useState(null);
  const [sel, setSel] = useState({});
  const [coverFor, setCoverFor] = useState(null);
  const [wish, setWish] = useState(() => read(LS.wish, []));
  const [favs, setFavs] = useState(() => read(LS.fav, []));
  const toggleFav = (id) => { const f = favs.includes(id) ? favs.filter((x) => x !== id) : [id, ...favs]; setFavs(f); write(LS.fav, f); sfx?.("select"); };
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
    try { const x = itemToBookRaw(o); const a = o.fields.alexandrie; return { ...base, title: o.title || base.title, sub: a.sub ?? base.sub, about: a.about ?? base.about, chapters: x.chapters, words: x.words, text: x.text, edited: true, copyId: o.id }; } catch (_) { return base; }
  }), [edits, overrides]); // eslint-disable-line react-hooks/exhaustive-deps
  const modifyBook = async (b) => {
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
  const swapVideo = async (b, oldId, newId) => {
    const it = b.itemId ? at.items.find((i) => i.id === b.itemId) : overrides[b.id];
    try {
      if (it) await at.saveItem({ ...it, content: String(it.content || "").split(oldId).join(newId) });
      else {
        const raw = rawOf(BOOKS.find((x) => x.id === b.id) || b);
        const text = raw.text.split(`@yt ${oldId}`).join(`@yt ${newId}`);
        const made = await at.createItem({ kind: "document", title: raw.title, content: bookToHtml(text), tags: ["alexandrie"], fields: { alexandrie: { of: b.id, room: b.room, type: b.type, sub: raw.sub || "", about: raw.about || "" } } });
        if (!made?.id) throw new Error("création refusée");
      }
      toast.success("Vidéo remplacée");
    } catch (_) { toast.error("La vidéo n'a pas pu être remplacée"); }
  };
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
    !upc && (b.mine ? { id: "write", label: "Écrire", icon: <IoCreateOutline size={14} />, onClick: () => open(b.itemId) } : { id: "modify", label: "Modifier le livre", icon: <IoCreateOutline size={14} />, onClick: () => modifyBook(b) }),
    !upc && { id: "fav", label: favs.includes(b.id) ? "Retirer des coups de cœur" : "Coup de cœur", icon: favs.includes(b.id) ? <IoHeart size={14} /> : <IoHeartOutline size={14} />, onClick: () => toggleFav(b.id) },
    !upc && { id: "pdf", label: "Exporter en PDF", icon: <IoPrintOutline size={14} />, onClick: () => exportBook(b, covers[b.id], bookNotes(at, b.id, 0)) },
    "-",
    { id: "cover", label: covers[b.id] ? "Changer l'artwork" : "Mettre un artwork", icon: <IoImageOutline size={14} />, onClick: () => setCoverFor(b) },
    covers[b.id] && { id: "uncover", label: "Retirer l'artwork", icon: <IoTrashOutline size={14} />, onClick: () => saveCover(b.id, "") },
    DEFAULT_COVERS[b.id] && covers[b.id] !== DEFAULT_COVERS[b.id] && { id: "recover", label: "Remettre l'artwork d'origine", icon: <IoArrowUndo size={14} />, onClick: () => saveCover(b.id, null) },
    !upc && b.edited && "-",
    !upc && b.edited && { id: "revert", label: "Revenir au texte d'origine", icon: <IoArrowUndo size={14} />, danger: true, onClick: () => revertEdit(b) },
  ] });
  const mine = useMemo(() => at.items.filter((i) => i.fields?.alexandrie && !i.fields.alexandrie.of).map(itemToBook), [at.items]);
  const all = useMemo(() => [...books, ...mine], [books, mine]);
  const readingBook = reading && (all.find((b) => b.id === reading.id) || reading);
  const match = (b) => type === "all" || b.type === type;
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
            <div className="ax-tools">{searchBtn}<button className="at-btn" onClick={() => addBook("atelier")} data-testid="alex-add"><IoAdd size={16} /> Écrire un livre</button></div>
          </header>
          {current.length > 0 && (
            <div className="ax-current">
              <p className="mono">LECTURES EN COURS</p>
              <div>{current.map((b) => <button key={b.id} onClick={() => openBook(b)} style={{ "--h": b.color ?? hue(b.title) }}><b>{b.title}</b><small className="mono">PAGE {prog[b.id].page + 1} / {prog[b.id].pages}</small><span><i style={{ width: `${(prog[b.id].page / Math.max(1, prog[b.id].pages - 1)) * 100}%` }} /></span></button>)}</div>
            </div>
          )}
          <p className="mono ax-plan-t"><span>PLAN DES SALLES · 館内図</span><i /></p>
          <div className="ax-plan" data-testid="alex-plan">
            {ROOMS.map((r, i) => { const { here, up } = inRoom(r.key); const strip = [...here, ...up].slice(0, 16);
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
              <div className="ax-types" role="tablist" aria-label="Genre">{[["all", "Tous"], ...Object.entries(TYPES).map(([k, v]) => [k, v.label])].map(([k, l]) => <button key={k} role="tab" aria-selected={type === k} className={type === k ? "on" : ""} onClick={() => setType(k)}>{l}</button>)}</div>
              {R.format === "vhs" && <button className="ax-ghost" onClick={() => dressRoom([...inRoom(R.key).here, ...inRoom(R.key).up])} disabled={dressing} data-testid="alex-dress"><IoImageOutline size={15} /> {dressing ? "Recherche…" : "Habiller la salle"}</button>}
              <button className="at-btn" onClick={() => addBook(R.key)} data-testid="alex-add"><IoAdd size={16} /> Écrire</button>
            </div>
          </header>
          <Room r={R} n={ri + 1} here={inRoom(R.key).here.filter(match)} up={inRoom(R.key).up.filter(match)} selId={sel[R.key]} onSel={(id) => { sfx?.("nav"); setSel((s) => ({ ...s, [R.key]: id })); }} covers={covers} wish={wish} prog={prog} onRead={openBook} onWish={toggleWish} onCover={setCoverFor} onEdit={open} onModify={modifyBook} menuFor={menuFor} noteCount={(id) => notesOf(notesItemOf(at, id)).length} onNotes={(b) => { setReadNotes(true); openBook(b); }} favs={favs} onFav={toggleFav} />
        </>
      )}
      {wish.length > 0 && <p className="ax-wishes mono">★ {wish.length} TITRE{wish.length > 1 ? "S" : ""} DEMANDÉ{wish.length > 1 ? "S" : ""} : {wish.map((id) => UPCOMING.find((u) => u.id === id)?.title).filter(Boolean).join(" · ")}</p>}
      {coverFor && <CoverDialog b={coverFor} current={covers[coverFor.id]} def={DEFAULT_COVERS[coverFor.id]} onSave={(u) => saveCover(coverFor.id, u)} onClose={() => setCoverFor(null)} />}
      {search && <AlexSearch books={all} onClose={() => setSearch(false)} onOpen={openBook} onGoto={(b) => { setSearch(false); setRoom(b.room); setSel((s) => ({ ...s, [b.room]: b.id })); }} />}
      {readingBook && <Reader key={readingBook.id} book={readingBook} at={at} startNotes={readNotes} radio={radio} cover={covers[readingBook.id]} onClose={() => { sfx?.("close"); setReading(null); setReadNotes(false); }} onEdit={(id) => { setReading(null); open(id); }}
        onModify={() => modifyBook(readingBook)} onSwap={(oldId, newId) => swapVideo(readingBook, oldId, newId)} />}
    </section>
  );
}
