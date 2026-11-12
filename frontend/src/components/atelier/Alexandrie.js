import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoArrowBack, IoArrowForward, IoClose, IoAdd, IoBookmark, IoBookmarkOutline, IoList, IoSearch, IoStar, IoStarOutline, IoOpenOutline, IoImageOutline, IoMusicalNotes, IoPlay, IoPause, IoLogoYoutube, IoCreateOutline, IoTrashOutline, IoCloudUploadOutline } from "react-icons/io5";
import { toast } from "sonner";
import { atelierApi } from "@/lib/atelier";
import { uploadJournalImage } from "@/lib/api";
import { DEFAULT_COVERS, mergeCovers, sgdbTerm } from "@/data/alexandrie/covers";
import { IoPencil, IoPrintOutline, IoSwapHorizontal, IoArrowUndo, IoText } from "react-icons/io5";
import { pressMenu } from "@/components/atelier/ContextMenu";
import { labConfirm } from "@/components/atelier/LabDialog";
import { exportBook } from "@/lib/exportPdf";
import { ROOMS, TYPES, BOOKS, UPCOMING, parseBook, readingTime } from "@/data/alexandrie";
import { stripHtml } from "@/lib/atelier";
import { useApp } from "@/context/AppContext";
import "@/components/atelier/alexandrie.css";

// ALEXANDRIE — la bibliothèque de l'Atelier. Des salles, des rayonnages, des livres qui s'ouvrent.
// Les livres de fond sont dans src/data/alexandrie ; les tiens sont des fiches de l'Atelier (fields.alexandrie).
const LS = { prog: "nx-alex-progress", wish: "nx-alex-wish", covers: "nx-alex-covers" };
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || "") ?? d; } catch (_) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
const NOEDITS = {};
const ytId = (s = "") => (s.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/) || [])[1] || (/^[\w-]{11}$/.test(s.trim()) ? s.trim() : null);
const hue = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };

// Fiche de l'Atelier → livre lisible (HTML simple découpé en chapitres sur les titres)
function itemToBook(it) {
  try { return itemToBookRaw(it); } catch (_) { return { id: "item:" + it.id, itemId: it.id, mine: true, title: String(it.title || "Sans titre"), sub: "", room: "atelier", type: "recit", about: "", cote: "PERS.", chapters: [{ title: "", blocks: [{ t: "p", x: "Ce livre n'a pas pu être lu. Ouvre-le pour le corriger." }] }], words: 0, links: [] }; }
}
function itemToBookRaw(it) {
  const doc = new DOMParser().parseFromString(`<div>${it.content || ""}</div>`, "text/html").body.firstChild;
  const chapters = []; let cur = { title: "", blocks: [] };
  for (const n of [...doc.childNodes]) {
    const tag = n.nodeName; const txt = (n.textContent || "").trim(); if (!txt) continue;
    if (/^H[12]$/.test(tag)) { if (cur.blocks.length || cur.title) chapters.push(cur); cur = { title: txt, blocks: [] }; }
    else if (tag === "H3") cur.blocks.push({ t: "h", x: txt });
    else if (tag === "BLOCKQUOTE") cur.blocks.push({ t: "q", x: txt });
    else cur.blocks.push({ t: "p", x: txt });
  }
  if (cur.blocks.length || cur.title) chapters.push(cur);
  const a = it.fields?.alexandrie || {};
  return { id: "item:" + it.id, itemId: it.id, mine: true, title: String(it.title || "Sans titre"), sub: a.sub || "", room: a.room || "atelier", type: a.type || "recit", about: a.about || "", color: a.color, cote: "PERS.", chapters: chapters.length ? chapters : [{ title: "", blocks: [{ t: "p", x: "Ce livre est encore vide. Ouvre-le dans l'éditeur pour l'écrire." }] }], links: [], words: stripHtml(it.content || "").split(/\s+/).filter(Boolean).length };
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

// Notes de lecture : écrites sans quitter le livre, rangées dans le Nexus Drive (une note par livre, étiquetée « alexandrie »).
function ReaderNotes({ at, book, page, per, chapter, onClose, onOpen }) {
  const item = at.items.find((i) => i.fields?.alexNotes === book.id);
  const [txt, setTxt] = useState(() => { const s = String(window.getSelection?.() || "").trim(); return s && s.length < 600 ? `« ${s} »\n` : ""; });
  const [busy, setBusy] = useState(false);
  const past = useMemo(() => { if (!item?.content) return []; const d = new DOMParser().parseFromString(`<div>${item.content}</div>`, "text/html").body.firstChild; return [...d.querySelectorAll("p")].map((p) => p.textContent.trim()).filter(Boolean).reverse(); }, [item?.content]);
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const keep = async () => {
    const t = txt.trim(); if (!t || busy) return; setBusy(true);
    const where = `Page ${page + 1}${chapter ? ` · ${chapter}` : ""}`;
    const html = `<p><strong>${esc(where)}</strong> : ${esc(t).replace(/\n/g, "<br>")}</p>`;
    try {
      if (item) await at.saveItem({ ...item, content: (item.content || "") + html });
      else await at.createItem({ kind: "note", title: `Notes de lecture · ${book.title}`, content: html, tags: ["alexandrie", "notes de lecture"], fields: { alexNotes: book.id } });
      setTxt(""); toast.success("Note gardée dans le Nexus Drive");
    } catch (e) { toast.error("La note n'a pas pu être gardée"); }
    setBusy(false);
  };
  return (
    <aside className="ax-music ax-notes" data-testid="alex-notes-panel">
      <p className="mono">NOTES DE LECTURE · PAGE {page + 1}</p>
      <textarea autoFocus value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") keep(); }} placeholder="Une idée, une phrase à garder, ce que ça t'inspire… (sélectionne un passage avant d'ouvrir les notes pour le citer)" rows={5} data-testid="alex-notes-input" />
      <div className="ax-acts">
        <button className="at-btn" onClick={keep} disabled={busy || !txt.trim()} data-testid="alex-notes-keep">{busy ? "…" : "Garder la note"}</button>
        {item && <button className="ax-ghost" onClick={() => onOpen(item.id)}><IoOpenOutline size={14} /> Ouvrir dans le Drive</button>}
        <button className="ax-ghost" onClick={onClose}>Fermer</button>
      </div>
      {past.length > 0 && <><p className="mono" style={{ marginTop: 16 }}>DÉJÀ NOTÉ · {past.length}</p>{past.slice(0, 20).map((p, i) => <p key={i} className="ax-note">{p}</p>)}</>}
      {!past.length && <p className="ax-note" style={{ opacity: 0.7 }}>Tes notes sur ce livre iront dans une seule note du Nexus Drive, « Notes de lecture · {book.title} », avec la page et le chapitre.</p>}
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

function Reader({ book, onClose, onEdit, onModify, onSwap, paused, radio, cover, at }) {
  const { sfx } = useApp();
  const flow = useRef(null);
  const tx = useRef(0);
  const [page, setPage] = useState(() => read(LS.prog, {})[book.id]?.page || 0);
  const [pages, setPages] = useState(1);
  const [per, setPer] = useState(2);
  const [toc, setToc] = useState(false);
  const [music, setMusic] = useState(false);
  const [notes, setNotes] = useState(false);
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
    const k = (e) => { if (paused) return; if (e.key === "Escape") { e.stopPropagation(); notes ? setNotes(false) : music ? setMusic(false) : toc ? setToc(false) : onClose(); return; } if (/^(INPUT|TEXTAREA)$/.test(e.target?.tagName)) return; if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); go(1); } if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); } };
    window.addEventListener("keydown", k, true); return () => window.removeEventListener("keydown", k, true);
  });
  const chapterAt = () => { try { const g = geom(); const x = spread * g.step + g.pad + 2; let t = ""; flow.current.querySelectorAll("[data-ch]").forEach((el) => { if (el.offsetLeft <= x + g.step * (g.p - 1)) t = el.querySelector("h2")?.textContent || t; }); return t; } catch (_) { return ""; } };
  const jump = (i) => { const el = flow.current?.querySelector(`[data-ch="${i}"]`); if (!el) return; const g = geom(); setPage(Math.max(0, Math.round((el.offsetLeft - g.pad) / g.step))); setToc(false); };
  const T = TYPES[book.type] || TYPES.recit; const R = ROOMS.find((r) => r.key === book.room);
  return createPortal(
    <div className={"ax-reader ax-view" + (fmtOf(book) === "vhs" ? " skin-vhs" : "")} style={{ "--h": book.color ?? hue(book.title) }} data-testid="alex-reader" role="dialog" aria-modal="true" aria-label={book.title}>
      <header className="ax-rbar">
        <button className="ax-rb" onClick={onClose} data-testid="alex-close"><IoArrowBack size={15} /> <span>Rayonnages</span></button>
        <p className="mono ax-rpath">ALEXANDRIE / {(R?.label || "MES LIVRES").toUpperCase()} / <b>{book.cote}</b></p>
        <span className="grow" />
        {book.mine ? <button className="ax-rb" onClick={() => onEdit(book.itemId)}><IoCreateOutline size={15} /> <span>Écrire</span></button>
          : onModify && <button className="ax-rb" onClick={onModify} title="Modifier le texte, les images, les vidéos" data-testid="alex-modify"><IoCreateOutline size={15} /> <span>Modifier</span></button>}
        {at && <button className={"ax-rb" + (notes ? " on" : "")} onClick={() => { setNotes((n) => !n); setToc(false); setMusic(false); }} aria-expanded={notes} data-testid="alex-notes"><IoPencil size={14} /> <span>Notes</span></button>}
        {radio && <button className={"ax-rb" + (radio.playing ? " on" : "")} onClick={() => { setMusic((m) => !m); setToc(false); setNotes(false); }} aria-expanded={music} data-testid="alex-music"><IoMusicalNotes size={15} /> <span>Musique</span></button>}
        <button className="ax-rb" onClick={() => exportBook(book, cover)} title="Exporter le livre en PDF" data-testid="alex-pdf"><IoPrintOutline size={15} /> <span>PDF</span></button>
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
      <footer className="ax-rfoot mono"><span>{book.title.toUpperCase()}</span><span className="ax-prog"><i style={{ width: `${Math.min(100, ((spread + per) / pages) * 100)}%` }} /></span><span>PAGE {Math.min(pages, spread + 1)}{per === 2 && spread + 2 <= pages ? `–${spread + 2}` : ""} / {pages}</span></footer>
      {music && radio && <ReaderMusic radio={radio} onClose={() => setMusic(false)} />}
      {notes && at && <ReaderNotes at={at} book={book} page={page} per={per} chapter={chapterAt()} onClose={() => setNotes(false)} onOpen={onEdit} />}
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
function Room({ r, n, here, up, selId, onSel, covers, wish, prog, onRead, onWish, onCover, onEdit, onModify, menuFor }) {
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
          <h3>{cur.title}</h3>
          {cur.sub && <p className="sub">{cur.sub}</p>}
          {cur.about && <p className="ab">{cur.about}</p>}
          {isUp && <p className="ab">Pas encore écrit. Marque-le d'une étoile : les titres étoilés passent en premier.</p>}
          <div className="ax-acts">
            {isUp ? <button className="at-btn" onClick={() => onWish(cur.id)} data-testid="alex-wish">{wish.includes(cur.id) ? <><IoStar size={15} /> Demandé</> : <><IoStarOutline size={15} /> Je veux le lire</>}</button>
              : <button className="at-btn" onClick={() => onRead(cur)} data-testid="alex-read"><IoPlay size={14} /> {pg && pg.page > 0 ? `Reprendre page ${pg.page + 1}` : fmt === "vhs" ? "Lancer" : "Lire"}</button>}
            {cur.mine && <button className="ax-ghost" onClick={() => onEdit(cur.itemId)}><IoCreateOutline size={15} /> Écrire</button>}
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

// Modifier un livre de la bibliothèque : le texte balisé, le titre, le sous-titre, la présentation.
// Les changements sont gardés dans la configuration de l'Atelier ; l'original reste dans le code et se retrouve d'un clic.
const MARKUP = [["# Titre", "Nouveau chapitre"], ["## Titre", "Intertitre"], ["> Citation | Auteur, source", "Citation sourcée"], ["!! LIBELLÉ :: texte", "Encadré"], ["*mot*", "Italique"], ["@img lien | légende | crédit", "Image"], ["@yt lien ou ID | légende", "Vidéo YouTube"]];
function BookEditor({ base, edit, onSave, onReset, onClose }) {
  const src = { ...base, ...(edit || {}) };
  const [f, setF] = useState({ title: src.title, sub: src.sub || "", about: src.about || "", text: String(src.text || "").trim() });
  const [media, setMedia] = useState(""); const [help, setHelp] = useState(false); const [busy, setBusy] = useState(false);
  const ta = useRef(null);
  const put = (snip) => { const el = ta.current; const at = el ? el.selectionStart : f.text.length; const before = f.text.slice(0, at).replace(/\s*$/, ""); const t = `${before}\n\n${snip}\n\n${f.text.slice(at).replace(/^\s*/, "")}`; setF({ ...f, text: t }); setTimeout(() => { if (!el) return; const p = before.length + 2 + snip.length; el.focus(); el.setSelectionRange(p, p); }, 0); };
  const addMedia = () => { const u = media.trim(); if (!u) return; const id = /youtu/.test(u) || /^[\w-]{11}$/.test(u) ? ytId(u) : null; put(id ? `@yt ${id} | Légende` : `@img ${u} | Légende | Crédit`); setMedia(""); };
  const save = async () => {
    const patch = { title: f.title.trim() || base.title, sub: f.sub.trim(), about: f.about.trim(), text: f.text.replace(/^@yt\s+(\S+)/gm, (m, v) => `@yt ${ytId(v) || v}`) };
    try { parseBook({ ...base, ...patch }); } catch (_) { toast.error("Le texte n'a pas pu être lu : vérifie le balisage"); return; }
    setBusy(true); await onSave(patch); setBusy(false);
  };
  useEffect(() => { const k = (e) => { if (document.querySelector(".ld-wrap")) return; if (e.key === "Escape") { e.stopPropagation(); onClose(); } if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); save(); } }; window.addEventListener("keydown", k, true); return () => window.removeEventListener("keydown", k, true); });
  return createPortal(
    <div className="ax-fiche-wrap ax-edwrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ax-fiche ax-editor" role="dialog" aria-modal="true" aria-label={`Modifier ${base.title}`} data-testid="alex-editor">
        <p className="mono ax-fiche-top"><span>MODIFIER · {base.cote || ""} · 編集</span><button type="button" onClick={onClose} aria-label="Fermer"><IoClose size={15} /></button></p>
        <div className="ax-ed-head">
          <label><span className="mono">TITRE</span><input className="ax-in" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
          <label><span className="mono">SOUS-TITRE</span><input className="ax-in" value={f.sub} onChange={(e) => setF({ ...f, sub: e.target.value })} /></label>
          <label className="wide"><span className="mono">PRÉSENTATION</span><textarea className="ax-in" rows={2} value={f.about} onChange={(e) => setF({ ...f, about: e.target.value })} /></label>
        </div>
        <div className="ax-ed-tools">
          <button type="button" className="ax-ghost" onClick={() => put("# Nouveau chapitre")}><IoAdd size={14} /> Chapitre</button>
          <button type="button" className="ax-ghost" onClick={() => put("> La citation | Auteur, source")}><IoText size={14} /> Citation</button>
          <button type="button" className="ax-ghost" onClick={() => put("!! À RETENIR :: Le texte de l'encadré.")}><IoText size={14} /> Encadré</button>
          <label className="ax-ytq ax-ed-media"><IoLogoYoutube size={15} /><input value={media} onChange={(e) => setMedia(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMedia(); } }} placeholder="Lien YouTube ou adresse d'une image, puis Entrée" data-testid="alex-ed-media" /><button type="button" onClick={addMedia}>Insérer</button></label>
          <button type="button" className={"ax-ghost" + (help ? " on" : "")} onClick={() => setHelp((h) => !h)}>Balisage</button>
        </div>
        {help && <div className="ax-ed-help mono">{MARKUP.map(([m, l]) => <span key={m}><b>{m}</b>{l}</span>)}<span><b>(ligne vide)</b>Nouveau paragraphe</span></div>}
        <textarea ref={ta} className="ax-ed-text" value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} spellCheck data-testid="alex-ed-text" />
        <div className="ax-acts">
          <button className="at-btn" onClick={save} disabled={busy} data-testid="alex-ed-save">{busy ? "…" : "Enregistrer"} <kbd className="mono">Ctrl S</kbd></button>
          <button className="ax-ghost" onClick={onClose}>Annuler</button>
          <span className="grow" />
          {edit && <button className="ax-ghost" onClick={onReset} data-testid="alex-ed-reset"><IoArrowUndo size={14} /> Revenir à l'original</button>}
        </div>
      </div>
    </div>,
    document.querySelector(".at-root") || document.body
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
  const [localCovers, setLocalCovers] = useState(() => read(LS.covers, {}));
  const [bad, setBad] = useState({});
  const rawCovers = { ...localCovers, ...(at.config?.alexandrie?.covers || {}) };
  const covers = mergeCovers(localCovers, at.config?.alexandrie?.covers, bad);
  // Un artwork par défaut qui ne répond pas est écarté : le volume garde sa couverture dessinée.
  useEffect(() => { Object.values(DEFAULT_COVERS).forEach((u) => { const im = new Image(); im.onerror = () => setBad((x) => ({ ...x, [u]: 1 })); im.src = u; }); }, []);
  const prog = read(LS.prog, {});
  // Livres de la bibliothèque, avec tes modifications par-dessus (texte, titre, vidéos).
  const edits = at.config?.alexandrie?.edits || NOEDITS;
  const withEdit = (b) => { const e = edits[b.id]; if (!e) return parseBook(b); try { return { ...parseBook({ ...b, ...e }), edited: true }; } catch (_) { return parseBook(b); } };
  const books = useMemo(() => BOOKS.map(withEdit), [edits]); // eslint-disable-line react-hooks/exhaustive-deps
  const [editing, setEditing] = useState(null);
  const saveEdit = async (id, patch) => {
    const e = { ...edits }; if (patch) e[id] = patch; else delete e[id];
    try {
      await at.saveConfig({ alexandrie: { ...(at.config?.alexandrie || {}), edits: e } });
      const base = BOOKS.find((x) => x.id === id);
      setReading((r) => (r && r.id === id ? (patch ? { ...parseBook({ ...base, ...patch }), edited: true } : parseBook(base)) : r));
      toast.success(patch ? "Livre modifié" : "Texte d'origine rétabli"); setEditing(null); return true;
    } catch (err) { toast.error("La modification n'a pas pu être enregistrée"); return false; }
  };
  const swapVideo = (bookId, oldId, newId) => {
    const base = BOOKS.find((x) => x.id === bookId); if (!base) return;
    const cur = { ...base, ...(edits[bookId] || {}) };
    const text = cur.text.replace(new RegExp(`^@yt\\s+${oldId.replace(/[-]/g, "\\-")}`, "m"), `@yt ${newId}`);
    saveEdit(bookId, { ...(edits[bookId] || {}), text });
  };
  const revertEdit = async (b) => { if (await labConfirm(`Revenir au texte d'origine de « ${b.title} » ? Tes modifications seront perdues.`)) saveEdit(b.id, null); };
  const menuFor = (b, upc) => () => ({ title: b.title, entries: [
    !upc && { id: "read", label: prog[b.id]?.page > 0 ? `Reprendre page ${prog[b.id].page + 1}` : "Lire", icon: <IoPlay size={14} />, onClick: () => openBook(b) },
    upc && { id: "wish", label: wish.includes(b.id) ? "Ne plus demander" : "Je veux le lire", icon: <IoStarOutline size={14} />, onClick: () => toggleWish(b.id) },
    !upc && (b.mine ? { id: "write", label: "Écrire", icon: <IoCreateOutline size={14} />, onClick: () => open(b.itemId) } : { id: "modify", label: "Modifier le livre", icon: <IoCreateOutline size={14} />, onClick: () => setEditing(b.id) }),
    !upc && { id: "pdf", label: "Exporter en PDF", icon: <IoPrintOutline size={14} />, onClick: () => exportBook(b, covers[b.id]) },
    "-",
    { id: "cover", label: covers[b.id] ? "Changer l'artwork" : "Mettre un artwork", icon: <IoImageOutline size={14} />, onClick: () => setCoverFor(b) },
    covers[b.id] && { id: "uncover", label: "Retirer l'artwork", icon: <IoTrashOutline size={14} />, onClick: () => saveCover(b.id, "") },
    DEFAULT_COVERS[b.id] && covers[b.id] !== DEFAULT_COVERS[b.id] && { id: "recover", label: "Remettre l'artwork d'origine", icon: <IoArrowUndo size={14} />, onClick: () => saveCover(b.id, null) },
    !upc && b.edited && "-",
    !upc && b.edited && { id: "revert", label: "Revenir au texte d'origine", icon: <IoArrowUndo size={14} />, danger: true, onClick: () => revertEdit(b) },
  ] });
  const mine = useMemo(() => at.items.filter((i) => i.fields?.alexandrie).map(itemToBook), [at.items]);
  const all = useMemo(() => [...books, ...mine], [books, mine]);
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
    const k = (e) => { if (reading || coverFor || search || editing) return; if (/^(INPUT|TEXTAREA)$/.test(e.target?.tagName) || e.target?.isContentEditable) return;
      if (e.key === "/") { e.preventDefault(); setSearch(true); } if (e.key === "Escape" && room) { setRoom(null); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [reading, coverFor, search, room, editing]);
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
                  <span className="ax-door-strip" aria-hidden="true">{strip.map((b, j) => { const L = volLook(b, j >= here.length); return <i key={b.id} className={`t-${L.tone}` + (j >= here.length ? " up" : "")} style={{ "--h": b.color ?? hue(b.title), width: Math.round(L.w / 4.4), height: Math.round(L.hgt / 5.4), backgroundImage: covers[b.id] ? `url(${covers[b.id]})` : undefined }} />; })}</span>
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
          <Room r={R} n={ri + 1} here={inRoom(R.key).here.filter(match)} up={inRoom(R.key).up.filter(match)} selId={sel[R.key]} onSel={(id) => { sfx?.("nav"); setSel((s) => ({ ...s, [R.key]: id })); }} covers={covers} wish={wish} prog={prog} onRead={openBook} onWish={toggleWish} onCover={setCoverFor} onEdit={open} onModify={(b) => setEditing(b.id)} menuFor={menuFor} />
        </>
      )}
      {wish.length > 0 && <p className="ax-wishes mono">★ {wish.length} TITRE{wish.length > 1 ? "S" : ""} DEMANDÉ{wish.length > 1 ? "S" : ""} : {wish.map((id) => UPCOMING.find((u) => u.id === id)?.title).filter(Boolean).join(" · ")}</p>}
      {coverFor && <CoverDialog b={coverFor} current={covers[coverFor.id]} def={DEFAULT_COVERS[coverFor.id]} onSave={(u) => saveCover(coverFor.id, u)} onClose={() => setCoverFor(null)} />}
      {search && <AlexSearch books={all} onClose={() => setSearch(false)} onOpen={openBook} onGoto={(b) => { setSearch(false); setRoom(b.room); setSel((s) => ({ ...s, [b.room]: b.id })); }} />}
      {reading && <Reader key={reading.id} book={reading} at={at} radio={radio} cover={covers[reading.id]} paused={!!editing} onClose={() => { sfx?.("close"); setReading(null); }} onEdit={(id) => { setReading(null); open(id); }}
        onModify={reading.mine ? null : () => setEditing(reading.id)} onSwap={reading.mine ? null : (oldId, newId) => swapVideo(reading.id, oldId, newId)} />}
      {editing && BOOKS.find((x) => x.id === editing) && <BookEditor base={BOOKS.find((x) => x.id === editing)} edit={edits[editing]} onSave={(p) => saveEdit(editing, p)} onReset={() => revertEdit(BOOKS.find((x) => x.id === editing))} onClose={() => setEditing(null)} />}
    </section>
  );
}
