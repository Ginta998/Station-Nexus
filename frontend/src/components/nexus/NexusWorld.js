import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack, IoHeart, IoHeartOutline, IoCreateOutline, IoLockClosed, IoChevronBack, IoChevronForward, IoDownloadOutline, IoOpenOutline, IoLinkOutline, IoPlay, IoHomeOutline, IoExitOutline, IoChevronDown, IoMenu, IoGridOutline, IoListOutline, IoEllipsisHorizontal, IoDiscOutline } from "react-icons/io5";
import { toast } from "sonner";
import { getJournalEntry, mediaUrl } from "@/lib/api";
import { JournalBlocks, fmtDate } from "@/components/journal/JournalParts";
import { ContextMenuHost, pressMenu, showMenu } from "@/components/atelier/ContextMenu";
import StationMenu, { SoundBtn } from "@/components/StationMenu";
import { Face } from "@/components/atelier/Alexandrie";
import "@/components/nexus/world.css";

/*
  Le monde d'une œuvre, en plein écran, comme le menu d'un jeu.
  Chaque bouton ouvre un écran ; chaque écran peut en ouvrir un autre (poupée russe).
  Le fil d'Ariane en haut montre toujours où l'on est ; Échap ou ← remonte d'un cran.
*/

const OVERLAYS = '[data-testid="chapter-reader"],[data-testid="cinema-player"],[data-testid="cosmic-bunny-game"],[data-testid="reader-modal"],[data-testid="world-studio"],[data-testid="editor-dialog"],[data-testid="alex-reader"],[role="menu"],.sx-menu-scrim,.sx-sound-menu';
const typing = (t) => /^(INPUT|TEXTAREA|SELECT)$/.test(t?.tagName) || t?.isContentEditable;
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
const roman = (i) => ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][i] || String(i + 1);
// Écran large : le menu de l'œuvre reste en colonne à gauche, la section s'ouvre dans le grand panneau
const WIDE = "(min-width: 1100px)";
function useWide() {
  const [w, setW] = useState(() => typeof window !== "undefined" && window.matchMedia?.(WIDE).matches);
  useEffect(() => { const m = window.matchMedia?.(WIDE); if (!m) return; const h = () => setW(m.matches); m.addEventListener?.("change", h); return () => m.removeEventListener?.("change", h); }, []);
  return w;
}
// Nombre de colonnes réellement affichées par une grille (pour les flèches du clavier)
const colsOf = (el) => { if (!el) return 1; const t = getComputedStyle(el).gridTemplateColumns; return t && t !== "none" ? t.split(" ").length : 1; };
const VIEW_KEY = "sx_units_view";
const readView = () => { try { return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid"; } catch (_) { return "grid"; } };

export default function NexusWorld(p) {
  const { item, ws, catLabel, cover, bg, making = [], trailer, launchLabel, progress, onLaunch, locked, unitLocked, onChapter, onEpisode,
    current, unlock, comments, commentsCount = 0, neighbors = [], coverOf, onNeighbor, fav, onFav, onAmbient, ambientOn, onAmbientSetup, isAdmin, onEdit, onExit, onHome, onEntry, sfx = () => {}, intentionUrl } = p;

  const wide = useWide();
  const [view, setViewS] = useState(readView);
  const setView = (v) => { setViewS(v); sfx("nav"); try { localStorage.setItem(VIEW_KEY, v); } catch (_) {} };
  const isUnits = (item.launch_type === "chapters" && item.chapters?.length > 0) || (item.launch_type === "episodes" && item.episodes?.length > 0);
  const unitWord = item.launch_type === "chapters" ? "chapitre" : "épisode";
  const unitsLabel = item.unit_label || (item.launch_type === "chapters" ? "Chapitres" : "Épisodes");

  // ---------- la pile d'écrans ----------
  const [stack, setStack] = useState([{ k: "home", sel: 0, n: 0 }]);
  const [leaving, setLeaving] = useState(null); // l'écran qui s'en va, le temps de son animation
  const seq = useRef(1);
  const top = stack[stack.length - 1];
  const change = (next, dir) => {
    setLeaving({ s: top, dir, n: seq.current, depth: stack.length });
    seq.current += 1;
    setStack(next);
  };
  useEffect(() => { if (!leaving) return; const t = setTimeout(() => setLeaving(null), 520); return () => clearTimeout(t); }, [leaving]);
  const push = (s) => { sfx("select"); change([...stack, { sel: 0, ...s, n: seq.current }], "f"); };
  const pop = () => { if (stack.length === 1) { sfx("back"); onExit(); return; } sfx("back"); change(stack.slice(0, -1), "b"); };
  const goto = (i) => { if (i >= stack.length - 1) return; sfx("back"); change(stack.slice(0, i + 1), "b"); };
  const replaceAt1 = (s) => { if (stack[1]?.k === s.k && stack.length === 2) return; sfx("select"); change([stack[0], { sel: 0, ...s, n: seq.current }], "f"); };
  const setSel = (i) => setStack((st) => (st[st.length - 1].sel === i ? st : [...st.slice(0, -1), { ...st[st.length - 1], sel: i }]));

  // ---------- ce que contient le monde ----------
  const startLabel = item.coming_soon ? "Bientôt" : launchLabel;
  const sections = useMemo(() => [
    trailer && { k: "trailer", label: "Bande-annonce", desc: "Regarder la bande-annonce dans le monde.", img: bg || cover },
    item.gallery?.length > 0 && { k: "gallery", label: "Moodboard", desc: `${plural(item.gallery.length, "image", "images")} : les visuels, les recherches, l'atmosphère.`, img: item.gallery[0] },
    making.length > 0 && { k: "making", label: "Making of", desc: `${plural(making.length, "entrée", "entrées")} du journal de bord : les coulisses, les intentions, la fabrication.`, img: making.find((e) => e.cover)?.cover ? mediaUrl(making.find((e) => e.cover).cover) : null },
    item.embeds?.length > 0 && { k: "embeds", label: "Réseaux", desc: `${plural(item.embeds.length, "lien", "liens")} vers l'œuvre ailleurs.` },
    neighbors.length > 0 && { k: "neighbors", label: "Autres mondes", desc: "Passer directement dans l'univers d'une autre œuvre.", img: coverOf(neighbors[0]) },
  ].filter(Boolean), [item, making, trailer, neighbors, bg, cover]); // eslint-disable-line

  const units = item.launch_type === "chapters" ? (item.chapters || []) : (item.episodes || []);
  const openUnit = (i, opts) => {
    if (unitLocked(i)) { sfx("nav"); push({ k: "unlock" }); return; }
    item.launch_type === "chapters" ? onChapter(i, opts) : onEpisode(i, opts);
  };
  const start = () => {
    if (item.coming_soon) { toast.info("Bientôt disponible"); return; }
    if (locked && /^(film|reader|link)$/.test(item.launch_type)) { push({ k: "unlock" }); return; }
    if (isUnits) { push({ k: "units", sel: current ?? 0 }); return; }
    onLaunch();
  };

  const homeItems = [
    current != null && progress && { id: "resume", label: "Reprendre", sub: progress.label, desc: `Reprendre là où tu t'étais arrêté : ${progress.label.toLowerCase()}.`, go: () => openUnit(current, { resume: true }), main: true, win: units[current]?.image || cover },
    { id: "launch", label: isUnits ? (current != null && progress ? unitsLabel : startLabel) : startLabel, sub: isUnits ? plural(units.length, unitWord, unitWord + "s") : "", desc: isUnits ? `Choisir parmi ${plural(units.length, unitWord, unitWord + "s")}.` : (item.synopsis || ""), go: start, main: !(current != null && progress), win: cover || bg },
    locked && !item.coming_soon && { id: "unlock", label: "Débloquer", sub: unlock?.price, desc: "Accès définitif à l'œuvre, ou l'abonnement pour tout le catalogue.", go: () => push({ k: "unlock" }) },
    ...sections.map((s) => ({ id: s.k, label: s.label, desc: s.desc, win: s.img, go: () => push({ k: s.k }) })),
  ].filter(Boolean);

  // ---------- chaque écran : son titre (fil d'Ariane), ses éléments (clavier) ----------
  const entryQ = useQuery({ queryKey: ["journal-entry", top.e?.id], queryFn: () => getJournalEntry(top.e.id), enabled: top.k === "entry" && !!top.e?.id });

  const itemsOf = (s) => {
    switch (s.k) {
      case "home": return homeItems;
      case "units": return units.map((u, i) => ({ id: "u" + i, idx: i, label: u.title || `${unitWord[0].toUpperCase() + unitWord.slice(1)} ${i + 1}`, sub: item.launch_type === "chapters" ? `CH. ${String(i + 1).padStart(2, "0")}` : `EP. ${String(i + 1).padStart(2, "0")}`, desc: u.description || "", img: u.image, lock: unitLocked(i), mark: current === i, go: () => openUnit(i) }));
      case "gallery": return (item.gallery || []).map((g, i) => ({ id: "g" + i, img: g, go: () => push({ k: "image", list: item.gallery, i }) }));
      case "making": return making.map((e) => ({ id: e.id, label: e.title, sub: fmtDate(e.date), desc: e.subtitle || e.excerpt || "", img: e.cover ? mediaUrl(e.cover) : null, go: () => (onEntry ? onEntry(e) : push({ k: "entry", e })) }));
      case "embeds": return (item.embeds || []).map((em, i) => ({ id: "e" + i, label: em.label || (em.platform === "youtube" ? "Voir sur YouTube" : em.platform === "wattpad" ? "Lire sur Wattpad" : "Ouvrir le lien"), sub: (em.platform || "lien").toUpperCase(), desc: em.url, go: () => window.open(em.url, "_blank", "noopener,noreferrer") }));
      case "neighbors": return neighbors.map((c) => ({ id: c.id, label: c.title, sub: c.catLabel || "", desc: c.tagline || c.synopsis || "", img: coverOf(c), box: c, go: () => { sfx("select"); onNeighbor(c.id); } }));
      default: return [];
    }
  };
  const titleOf = (s) => ({
    home: item.title, units: unitsLabel, gallery: "Moodboard", making: "Making of", entry: s.e?.title || "Entrée", intention: item.intention_title || "Intentions",
    embeds: "Réseaux", comments: "Commentaires", neighbors: "Autres mondes", trailer: "Bande-annonce", unlock: "Débloquer", image: `Image ${(s.i || 0) + 1} / ${s.list?.length || 1}`,
  })[s.k];

  const items = itemsOf(top);
  const sel = Math.min(top.sel || 0, Math.max(0, items.length - 1));

  // ---------- clavier / manette ----------
  const keyRef = useRef(null);
  keyRef.current = (e) => {
    if (typing(e.target) || document.querySelector(OVERLAYS)) return;
    const k = e.key;
    if (k === "Escape" || (k === "Backspace" && !typing(e.target))) { e.preventDefault(); pop(); return; }
    if (top.k === "image") {
      const n = top.list.length;
      if (k === "ArrowRight") { e.preventDefault(); sfx("nav"); setStack((st) => [...st.slice(0, -1), { ...top, i: (top.i + 1) % n }]); }
      if (k === "ArrowLeft") { e.preventDefault(); sfx("nav"); setStack((st) => [...st.slice(0, -1), { ...top, i: (top.i - 1 + n) % n }]); }
      return;
    }
    if (!items.length) return;
    const gridEl = stage.current?.querySelector(".nw-cur .nw-ugrid, .nw-cur .nw-gal");
    const grid = gridEl ? colsOf(gridEl) : 1;
    let d = 0;
    if (k === "ArrowDown") d = grid; if (k === "ArrowUp") d = -grid;
    if (k === "ArrowRight" && grid > 1) d = 1; if (k === "ArrowLeft" && grid > 1) d = -1;
    if (k === "ArrowLeft" && grid === 1 && stack.length > 1) { e.preventDefault(); pop(); return; }
    if (d) { e.preventDefault(); sfx("nav"); setSel(Math.max(0, Math.min(items.length - 1, sel + d))); return; }
    if (k === "Enter" || (k === "ArrowRight" && grid === 1)) { e.preventDefault(); items[sel]?.go(); }
  };
  useEffect(() => { const h = (e) => keyRef.current(e); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);
  // L'élément choisi reste visible quand on descend la liste
  const stage = useRef(null);
  // (on fait défiler la liste elle-même, jamais la page : sur téléphone, la page ne doit pas bouger)
  useEffect(() => {
    if (top.k === "home") return; // l'accueil tient dans l'écran : on ne le fait pas défiler tout seul
    const el = stage.current?.querySelector(".nw-cur .on"); if (!el) return;
    let box = el.parentElement; while (box && box !== stage.current && !(box.scrollHeight > box.clientHeight + 2 && /(auto|scroll)/.test(getComputedStyle(box).overflowY))) box = box.parentElement;
    if (!box || box === stage.current) return;
    const r = el.getBoundingClientRect(); const b = box.getBoundingClientRect();
    if (r.top < b.top) box.scrollBy({ top: r.top - b.top - 8, behavior: "smooth" }); else if (r.bottom > b.bottom) box.scrollBy({ top: r.bottom - b.bottom + 8, behavior: "smooth" });
  }, [sel, top.n, top.k]);

  // ---------- menu contextuel ----------
  const link = (hash = "") => { navigator.clipboard?.writeText(`${window.location.origin}/oeuvre/${item.id}${hash}`).catch(() => {}); toast.success("Lien copié"); };
  const menuFor = (it) => () => ({ title: it.label || titleOf(top), entries: [
    { label: it.lock ? "Débloquer" : "Ouvrir", icon: it.lock ? <IoLockClosed size={14} /> : <IoPlay size={14} />, onClick: it.go },
    it.img && top.k !== "gallery" && { label: "Voir l'image", icon: <IoOpenOutline size={14} />, onClick: () => push({ k: "image", list: [it.img], i: 0 }) },
    isAdmin && { label: "Modifier l'œuvre", icon: <IoCreateOutline size={14} />, onClick: onEdit },
    "-",
    { label: "Copier le lien de l'œuvre", icon: <IoLinkOutline size={14} />, onClick: () => link() },
  ].filter(Boolean) });

  // ---------- briques communes ----------
  // Sur téléphone, le menu d'options d'un élément s'ouvre avec ce bouton « ⋯ » (au lieu d'un appui long invisible)
  const More = (it) => (
    <span className="nw-more" role="button" tabIndex={-1} aria-label="Plus d'options" data-testid={`nw-more-${it.id}`}
      onClick={(e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); const b = menuFor(it)(); showMenu(r.left, r.bottom, b.entries, b.title); }}><IoEllipsisHorizontal size={16} /></span>
  );
  const Menu = ({ c, className = "", num, col }) => (
    <nav className={"nw-menu " + className} aria-label={titleOf(c.s)}>
      {c.its.map((it, i) => (
        <button key={it.id} className={(i === c.sel ? "on " : "") + (it.main ? "go " : "") + (it.lock ? "lock" : "")} onMouseMove={col ? undefined : () => c.sel !== i && setSel(i)} onFocus={col ? undefined : () => setSel(i)}
          onClick={() => { if (col) { col(it); return; } setSel(i); it.go(); }} {...pressMenu(menuFor(it))} data-testid={`nw-${col ? "col-" : ""}${it.id}`}>
          {it.img && <span className="nw-th" style={{ backgroundImage: `url(${it.img})` }} />}
          {num && <i className="nw-n">{num(i)}</i>}
          <span className="nw-l">{it.label}</span>
          {it.sub && <small className="nw-s">{it.sub}</small>}
          {it.lock && <IoLockClosed className="nw-lk" size={13} />}
          {it.mark && <em className="nw-mk">EN COURS</em>}
          {!col && c.s.k !== "home" && More(it)}
        </button>
      ))}
    </nav>
  );
  const Prog = () => (progress ? <div className="nw-prog"><span>{progress.label}</span><b><i style={{ width: `${Math.round(progress.ratio * 100)}%` }} /></b></div> : null);
  const year = new Date(item.created_at || Date.now()).getFullYear();
  // « Reprendre » avec le visuel du chapitre ou de l'épisode en cours : le menu vit
  const Resume = () => {
    if (current == null || !progress) return Prog();
    const u = units[current] || {}; const img = u.image || cover || bg;
    return (
      <button className="nw-resume" onClick={() => openUnit(current, { resume: true })} data-testid="nw-resume-card">
        <span className="nw-resume-img" style={img ? { backgroundImage: `url(${img})` } : undefined} />
        <span className="nw-resume-t"><small>REPRENDRE</small><b>{u.title || progress.label}</b><em>{progress.label}</em><i><u style={{ width: `${Math.round(progress.ratio * 100)}%` }} /></i></span>
      </button>
    );
  };

  // ---------- l'écran d'accueil : une mise en page par ambiance ----------
  // La fenêtre façon Nier : l'image et le texte suivent le bouton choisi ; « Reprendre » y montre son visuel
  const Win = (c, cls = "") => {
    const cur = c.cur || {}; const img = cur.win || cover || bg;
    return (
      <section className={"nw-win " + cls} key={"w" + (cur.id || "")} data-testid="nw-win">
        <header><span>{cur.label || item.title}</span>{cur.sub && <small>{cur.sub}</small>}</header>
        <div className="nw-win-in">
          {img && <span className="nw-win-img" style={{ backgroundImage: `url(${img})` }} />}
          <div className="nw-win-txt">
            <p className="nw-desc">{cur.desc || item.synopsis}</p>
            {(cur.id === "resume" || cur.id === "launch") && Resume()}
          </div>
        </div>
      </section>
    );
  };
  const Head = ({ k = true, tag = true } = {}) => (<>
    {k && <p className="nw-k">{catLabel} · {year}</p>}
    <h1 className="nw-title" data-testid="detail-title">{item.title}</h1>
    {tag && item.tagline && <p className="nw-tag">{item.tagline}</p>}
  </>);
  // l'écran d'accueil : une mise en page par thème, la même fenêtre partout
  const Home = (c) => {
    const phoneResume = <div className="nw-phone-resume">{Resume()}</div>;
    switch (ws) {
      case "cinema": return (
        <div className="nw-home h-cinema">
          <div className="hc-txt">{Head()}{Win(c, "w-cinema")}{phoneResume}</div>
          {Menu({ c, className: "m-dvd" })}
        </div>
      );
      case "vhs": return (
        <div className="nw-home h-vhs">
          <div className="hv-main">{Head({ k: false })}{Menu({ c, className: "m-osd", num: (i) => String(i + 1).padStart(2, "0") })}{phoneResume}</div>
          <aside className="hv-side">{Win(c, "w-vhs")}</aside>
        </div>
      );
      case "arcade": return (
        <div className="nw-home h-arcade">
          <p className="nw-k">© {year} STATION NEXUS</p>
          <h1 className="nw-title" data-testid="detail-title">{item.title}</h1>
          {item.tagline && <p className="nw-tag">{item.tagline}</p>}
          <div className="ha-row">{Menu({ c, className: "m-pix" })}{Win(c, "w-arcade")}</div>
          {phoneResume}
          <p className="ha-credit">CREDIT 01 · PLAYER 1</p>
        </div>
      );
      case "yorha": return (
        <div className="nw-home h-yorha">
          <header className="hy-head"><h1 className="nw-title" data-testid="detail-title">{item.title}</h1><span>{catLabel}</span></header>
          <div className="hy-grid">{Menu({ c, className: "m-sq" })}{Win(c, "w-yorha")}</div>
          {phoneResume}
        </div>
      );
      case "eve": return (
        <div className="nw-home h-eve">
          <div className="he-col"><p className="nw-k"><i />{catLabel}<i /></p><h1 className="nw-title" data-testid="detail-title">{item.title}</h1>{item.tagline && <p className="nw-tag">{item.tagline}</p>}{Menu({ c, className: "m-line" })}{phoneResume}</div>
          {Win(c, "w-eve")}
        </div>
      );
      case "cathedrale": return (
        <div className="nw-home h-cath">
          <div className="hk-col"><span className="hk-sigil" aria-hidden="true" />{Head()}{Menu({ c, className: "m-cath" })}{phoneResume}</div>
          {Win(c, "w-cath")}
        </div>
      );
      case "couronne": return (
        <div className="nw-home h-crown">
          <div className="hr-col"><span className="hr-halo" aria-hidden="true" />{Head({ k: false })}{Menu({ c, className: "m-crown" })}{phoneResume}</div>
          {Win(c, "w-crown")}
        </div>
      );
      case "trait": return (
        <div className="nw-home h-trait">
          <div className="ht-art" key={"a" + (c.cur?.id || "")} style={(c.cur?.win || cover) ? { backgroundImage: `url(${c.cur?.win || cover})` } : undefined}><span className="ht-sticker">{c.cur?.label || catLabel}</span></div>
          <div className="ht-col">
            <h1 className="nw-title" data-testid="detail-title"><span>{item.title}</span></h1>
            {item.tagline && <p className="nw-tag">{item.tagline}</p>}
            {Menu({ c, className: "m-pill" })}
            <div className="ht-bubble"><p className="nw-desc" key={c.cur?.id}>{c.cur?.desc || item.synopsis}</p></div>
            {Resume()}
          </div>
        </div>
      );
      case "sengoku": return (
        <div className="nw-home h-sengoku">
          <div className="hs-col"><span className="hs-seal" aria-hidden="true">{item.kanji || "忍"}</span>{item.tagline && <p className="nw-tag">{item.tagline}</p>}{Menu({ c, className: "m-brush" })}{phoneResume}</div>
          {Win(c, "w-sengoku")}
          <h1 className="nw-title hs-title" data-testid="detail-title">{item.title}</h1>
        </div>
      );
      case "survivance": return (
        <div className="nw-home h-surv">
          <div className="hv2-col">{Head()}{Menu({ c, className: "m-surv" })}{phoneResume}</div>
          <div className="hv2-note"><span className="hv2-tape" aria-hidden="true" />{Win(c, "w-surv")}</div>
        </div>
      );
      case "cristal": return (
        <div className="nw-home h-crys">
          <div className="hc3-col">
            <p className="nw-k">{catLabel}</p>
            <h1 className="nw-title" data-testid="detail-title">{item.title}</h1>
            {item.tagline && <p className="nw-tag">{item.tagline}</p>}
            <div className="hc3-menu"><span className="hc3-line" aria-hidden="true" />{Menu({ c, className: "m-crys" })}</div>
            {phoneResume}
          </div>
          {Win(c, "w-crys")}
        </div>
      );
      default: return ( // hero
        <div className="nw-home h-hero">
          <div className="hh-left">{Head({ k: false })}{Menu({ c, className: "m-skew" })}{phoneResume}</div>
          {Win(c, "w-hero")}
        </div>
      );
    }
  };

  // ---------- un sélecteur : la liste à gauche, l'aperçu à droite ----------
  const Selector = ({ c, num, kind }) => { const cur = c.cur; return (
    <div className={"nw-sel s-" + kind}>
      {Menu({ c, className: "nw-list", num: num })}
      <aside className="nw-pane" key={cur?.id}>
        {cur?.box ? <div className="nw-pane-box"><Face b={{ id: cur.box.id, title: cur.box.title, sub: cur.box.tagline || "", format: cur.box.fmt || "livre", emblem: cur.box.kanji || "核", cote: "SN", roomLabel: cur.box.catLabel || "Station", house: "STATION NEXUS" }} cover={cur.img} /></div>
          : cur?.img ? <span className="nw-pane-img" style={{ backgroundImage: `url(${cur.img})` }} /> : <span className="nw-pane-img none"><b>{cur?.sub}</b></span>}
        <p className="nw-k">{cur?.sub}</p>
        <h2>{cur?.label}</h2>
        {cur?.desc && <p className="nw-desc">{cur.desc}</p>}
        {cur && <button className="nw-act" onClick={cur.go}>{cur.lock ? <><IoLockClosed /> Débloquer</> : kind === "units" ? <><IoPlay /> {item.launch_type === "chapters" ? "Lire" : "Regarder"}</> : kind === "neighbors" ? <>Entrer dans ce monde</> : kind === "embeds" ? <><IoOpenOutline /> Ouvrir</> : <>Ouvrir</>}</button>}
      </aside>
    </div>
  ); };


  // ---------- chapitres / épisodes : grille de vignettes ou liste avec visuel ----------
  const Units = (c) => (
    <div className={"nw-units v-" + view} data-testid="nw-units">
      <div className="nw-utools">
        <p className="nw-k">{plural(units.length, unitWord, unitWord + "s")}{current != null ? ` · en cours : ${unitWord} ${current + 1}` : ""}</p>
        <div className="nw-vt" role="radiogroup" aria-label="Affichage">
          <button role="radio" aria-checked={view === "grid"} className={view === "grid" ? "on" : ""} onClick={() => setView("grid")} data-testid="nw-view-grid" title="Grille"><IoGridOutline size={15} /><span>Grille</span></button>
          <button role="radio" aria-checked={view === "list"} className={view === "list" ? "on" : ""} onClick={() => setView("list")} data-testid="nw-view-list" title="Liste"><IoListOutline size={16} /><span>Liste</span></button>
        </div>
      </div>
      <div className={view === "grid" ? "nw-ugrid" : "nw-ulist"}>
        {c.its.map((it, i) => {
          const n = ws === "yorha" ? roman(i) : String(i + 1).padStart(2, "0"); const img = it.img || cover;
          return (
            <button key={it.id} className={"nw-u" + (i === c.sel ? " on" : "") + (it.lock ? " lock" : "") + (it.mark ? " cur" : "") + (it.img ? "" : " noimg")} style={{ animationDelay: `${Math.min(i, 16) * 30}ms` }}
              onMouseMove={() => c.sel !== i && setSel(i)} onFocus={() => setSel(i)} onClick={() => { setSel(i); it.go(); }} {...pressMenu(menuFor(it))} data-testid={`nw-${it.id}`}>
              <span className="nw-u-img" style={img ? { backgroundImage: `url(${img})` } : undefined}>
                <i className="nw-u-n">{n}</i>
                {it.lock && <span className="nw-u-lk"><IoLockClosed size={14} /></span>}
                {it.mark && <em className="nw-mk">EN COURS</em>}
                <span className="nw-u-play"><IoPlay size={18} /></span>
              </span>
              <span className="nw-u-t"><b>{it.label}</b>{it.desc && <small>{it.desc}</small>}</span>
              {More(it)}
            </button>
          );
        })}
      </div>
    </div>
  );

  const ctxOf = (s) => { const its = itemsOf(s); const sl = Math.min(s.sel || 0, Math.max(0, its.length - 1)); return { s, its, sel: sl, cur: its[sl] }; };
  const screen = (s) => {
    const c = ctxOf(s);
    switch (s.k) {
      case "home": return (
        <div className="nw-homewrap nw-scroll" data-testid="nw-homewrap">
          <div className="nw-homefill">{Home(c)}
            <button className="nw-tocm" onClick={(e) => { const w = e.currentTarget.closest(".nw-homewrap"); const cm = w?.querySelector(".nw-cm"); if (cm) w.scrollTo({ top: cm.offsetTop - 10, behavior: "smooth" }); }} data-testid="nw-to-comments">
              <IoChevronDown size={14} /> Commentaires{commentsCount ? ` · ${commentsCount}` : ""}
            </button>
          </div>
          <section className="nw-cm" data-testid="nw-comments">{comments}</section>
        </div>
      );
      case "units": return Units(c);
      case "making": return Selector({ c, kind: "making" });
      case "embeds": return Selector({ c, kind: "embeds" });
      case "neighbors": return Selector({ c, kind: "neighbors" });
      case "gallery": return (
        <div className="nw-gal">
          {(item.gallery || []).map((g, i) => (
            <button key={i} className={i === c.sel ? "on" : ""} style={{ backgroundImage: `url(${g})`, animationDelay: `${i * 40}ms` }} onMouseMove={() => c.sel !== i && setSel(i)} onClick={() => push({ k: "image", list: item.gallery, i })} {...pressMenu(menuFor(c.its[i]))} data-testid={`nw-g${i}`} aria-label={`Image ${i + 1}`}>{More(c.its[i])}</button>
          ))}
        </div>
      );
      case "image": {
        const n = s.list.length; const nav = (d) => { sfx("nav"); setStack((st) => [...st.slice(0, -1), { ...s, i: (s.i + d + n) % n }]); };
        return (
          <div className="nw-img">
            <img src={s.list[s.i]} alt="" key={s.i} />
            {n > 1 && <><button className="nw-img-p" onClick={() => nav(-1)} aria-label="Précédente"><IoChevronBack size={26} /></button><button className="nw-img-n" onClick={() => nav(1)} aria-label="Suivante"><IoChevronForward size={26} /></button></>}
          </div>
        );
      }
      case "entry": {
        const e = entryQ.data || s.e;
        return (
          <article className="nw-read nw-scroll" data-testid="nw-entry">
            <p className="nw-k">MAKING OF · {fmtDate(e.date)}</p>
            <h2 className="nw-rt">{e.title}</h2>
            {e.subtitle && <p className="nw-tag">{e.subtitle}</p>}
            {e.cover && <img className="nw-rcover" src={mediaUrl(e.cover)} alt="" onClick={() => push({ k: "image", list: [mediaUrl(e.cover)], i: 0 })} />}
            <div className="jr-body"><JournalBlocks blocks={e.blocks || []} onImage={(u) => push({ k: "image", list: [u], i: 0 })} /></div>
            {!(e.blocks || []).length && e.body && <div className="jr-body"><p className="jr-p">{e.body}</p></div>}
            {entryQ.isLoading && <p className="nw-desc">Chargement…</p>}
          </article>
        );
      }
      case "intention": return (
        <article className="nw-read nw-scroll" data-testid="nw-intention">
          <p className="nw-k">DE L'AUTEUR</p>
          <h2 className="nw-rt">{item.intention_title || "Intentions"}</h2>
          {(item.intention_text || "").split("\n").filter(Boolean).map((t, i) => <p key={i} className="nw-p">{t}</p>)}
          {item.intention_images?.length > 0 && <div className="nw-gal mini">{item.intention_images.map((g, i) => <button key={i} style={{ backgroundImage: `url(${g})` }} onClick={() => push({ k: "image", list: item.intention_images, i })} aria-label={`Image ${i + 1}`} />)}</div>}
          {intentionUrl && <a className="nw-act" href={intentionUrl} target="_blank" rel="noopener noreferrer"><IoDownloadOutline /> Télécharger le dossier{item.intention_file_name ? ` · ${item.intention_file_name}` : ""}</a>}
        </article>
      );
      case "trailer": return (
        <div className="nw-trailer">
          <div className="nw-screen">
            {trailer.type === "video" ? <video src={trailer.src} controls autoPlay playsInline /> : <iframe src={trailer.src} title="Bande-annonce" frameBorder="0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />}
          </div>
        </div>
      );
      case "comments": return <div className="nw-read wide nw-scroll" data-testid="nw-comments">{comments}</div>;
      case "unlock": return (
        <div className="nw-unlock" data-testid="nw-unlock">
          <IoLockClosed size={34} />
          <h2 className="nw-rt">Débloquer « {item.title} »</h2>
          <p className="nw-desc">{unlock?.note || "Accès définitif à cette œuvre, ou l'abonnement pour soutenir le créateur et tout lire."}</p>
          <div className="nw-unlock-acts">
            <button className="nw-act" disabled={unlock?.buying} onClick={unlock?.onBuy} data-testid="nw-buy">Acheter · {unlock?.price}</button>
            {unlock?.onSubscribe && <button className="nw-act ghost" disabled={unlock?.buying} onClick={unlock.onSubscribe}>{unlock.subLabel}</button>}
          </div>
        </div>
      );
      default: return null;
    }
  };

  // Habillage propre à l'ambiance autour de tous les écrans
  const chrome = { vhs: <><span className="nw-osd l">▶ PLAY<em>SP</em></span><span className="nw-osd r">{titleOf(top).toUpperCase().slice(0, 22)}</span></>, arcade: <span className="nw-osd r">HI-SCORE 099999</span> }[ws];

  // Grand écran : colonne du menu de l'œuvre + grand panneau de la section (comme un menu de jeu sur PC)
  const splitMode = wide && stack.length > 1;
  const colPick = (it) => {
    if (it.id === "resume") { it.go(); return; }
    if (it.id === "launch") { if (isUnits) replaceAt1({ k: "units", sel: current ?? 0 }); else start(); return; }
    replaceAt1({ k: it.id });
  };
  const colCtx = () => { const its = homeItems; const key = stack[1]?.k === "units" ? "launch" : stack[1]?.k; const i = Math.max(0, its.findIndex((x) => x.id === key)); return { s: stack[0], its, sel: i, cur: its[i] }; };
  const Split = (body, cls = "") => (
    <div className={"nw-split " + cls}>
      <aside className="nw-col">
        <p className="nw-k">{catLabel}</p>
        <h2 className="nw-col-t">{item.title}</h2>
        {Menu({ c: colCtx(), className: "nw-colmenu", col: colPick })}
      </aside>
      <section className="nw-panel">
        <header className="nw-ph">
          <h1>{titleOf(stack[1] || top)}</h1>
          {stack.length > 2 && <p className="nw-ph-sub">› {titleOf(top)}</p>}
        </header>
        <div className="nw-pbody">{body}</div>
        <footer className="nw-pf"><button onClick={pop} data-testid="nw-panel-back"><IoArrowBack size={15} /> {stack.length > 2 ? "Retour" : "Retour au menu"}</button></footer>
      </section>
    </div>
  );
  const leavingWasSplit = !!leaving && wide && leaving.depth > 1;
  const curLayer = <div className={"nw-scr nw-cur in-" + (leaving?.dir || "f")} key={"c" + top.n}>{screen(top)}</div>;
  const leaveLayer = leaving && <div className={"nw-scr out-" + leaving.dir} key={"l" + leaving.n} aria-hidden="true">{screen(leaving.s)}</div>;

  return (
    <div className={"nw ws-" + ws + " at-" + top.k + (splitMode ? " is-split" : "")} data-ws={ws} data-testid="nexus-world" style={{ ...p.style, "--bgimg": bg ? `url(${bg})` : undefined }}>
      {bg && <div className="nw-bg" aria-hidden="true" style={{ backgroundImage: `url(${bg})` }} />}
      <div className="nw-fx" aria-hidden="true" />
      <div className="nw-pt" aria-hidden="true" />

      <header className="nw-hud">
        <button className="nw-back" onClick={pop} aria-label={stack.length > 1 ? "Retour" : "Quitter le monde"} data-testid="nw-back"><IoArrowBack size={18} /></button>
        <nav className="nw-crumbs" aria-label="Où je suis">
          <button onClick={() => { sfx("back"); onExit(); }} className="c0">Station</button>
          {stack.map((s, i) => <button key={i} onClick={() => goto(i)} className={i === stack.length - 1 ? "here" : ""} aria-current={i === stack.length - 1 ? "page" : undefined}>{titleOf(s)}</button>)}
        </nav>
        <div className="nw-tools">
          {(onAmbient || isAdmin) && (
            <button onClick={onAmbient || onAmbientSetup} className={(ambientOn ? "on" : "") + (onAmbient ? "" : " off")} data-testid="nw-ambient"
              title={onAmbient ? (ambientOn ? "Couper l'ambiance de l'œuvre" : "Lancer l'ambiance de l'œuvre") : "Pas encore de musique : l'ajouter (atelier › Son)"} aria-label="Ambiance sonore de l'œuvre">
              {ambientOn ? <span className="sx-eq"><i /><i /><i /><i /></span> : <IoDiscOutline size={17} />}
            </button>
          )}
          <SoundBtn className="nw-tb" />
          <button onClick={onFav} className={fav ? "on" : ""} title={fav ? "Retirer des favoris" : "Ajouter aux favoris"} aria-label="Favori" data-testid="nw-fav">{fav ? <IoHeart size={16} /> : <IoHeartOutline size={16} />}</button>
          {isAdmin && <button onClick={onEdit} title="Modifier l'œuvre (identité, monde, contenu, médias…)" aria-label="Modifier l'œuvre" data-testid="detail-edit"><IoCreateOutline size={16} /></button>}
          <StationMenu trigger={(open, badge) => <button onClick={open} title="Menu de la station" aria-label="Menu de la station" data-testid="nw-menu" className="nw-menu-btn"><IoMenu size={17} />{badge > 0 && <b className="nw-badge">{badge}</b>}</button>} />
          <button onClick={() => { sfx("back"); onHome(); }} title="Accueil de la station" aria-label="Accueil de la station" data-testid="nw-home"><IoHomeOutline size={17} /></button>
          <button className="nw-quit" onClick={() => { sfx("back"); onExit(); }} title="Quitter l'univers (revenir où tu étais)" data-testid="nw-exit"><IoExitOutline size={16} /><span>Quitter l'univers</span></button>
        </div>
      </header>

      <main className="nw-stage" ref={stage}>
        {chrome}
        {splitMode ? (<>
          {leaving && !leavingWasSplit && leaveLayer}
          {Split(<>{leavingWasSplit && leaveLayer}{curLayer}</>, leaving && !leavingWasSplit ? "in-f" : "")}
        </>) : (<>
          {leaving && (leavingWasSplit
            ? <div className={"nw-scr out-" + leaving.dir} key={"l" + leaving.n} aria-hidden="true">{Split(<div className="nw-scr">{screen(leaving.s)}</div>)}</div>
            : leaveLayer)}
          {curLayer}
        </>)}
      </main>

      <footer className="nw-keys" aria-hidden="true">
        <span><kbd>↑</kbd><kbd>↓</kbd> Choisir</span><span><kbd>Entrée</kbd> Valider</span><span><kbd>Échap</kbd> {stack.length > 1 ? "Retour" : "Quitter"}</span>
        <span className="nw-depth">{"◆".repeat(stack.length)}{"◇".repeat(Math.max(0, 3 - stack.length))}</span>
      </footer>
      <ContextMenuHost />
    </div>
  );
}
