import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playLaunch } from "@/lib/launchSound";
import { useNavigate } from "react-router-dom";
import { IoPlay, IoClose, IoMusicalNotes, IoLinkOutline, IoDocumentTextOutline, IoArrowUndo } from "react-icons/io5";
import { toast } from "sonner";
import { posterUrl, bgUrl, updateCreation } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/context/AppContext";
import { Face, Rail } from "@/components/atelier/Alexandrie";
import { ContextMenuHost, pressMenu } from "@/components/atelier/ContextMenu";
import Box3D from "@/components/nexus/Box3D";
import "@/components/atelier/alexandrie.css";
import "@/components/nexus/nexus.css";

// L'objet qui porte une œuvre : un livre pour ce qui se lit, une cassette pour ce qui se regarde ou se joue, un vinyle pour ce qui s'écoute.
export const fmtOfCreation = (it, catLabel = "") => {
  if (/musi|son|album|audio|disque|ost/i.test(`${it.category} ${catLabel}`)) return "vinyle";
  if (["episodes", "film", "game"].includes(it.launch_type)) return "vhs";
  return "livre";
};
const FMT_LABEL = { livre: "LIVRE", vhs: "CASSETTE", vinyle: "DISQUE" };
const UNIT = { chapters: "chapitre", episodes: "épisode" };
const readJ = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (_) { return null; } };

// Où le visiteur en est : chapitre en cours, dernier épisode vu.
function progressOf(it) {
  if (it.launch_type === "chapters" && it.chapters?.length) {
    const p = readJ("sx_progress_" + it.id); if (!p) return null;
    const n = it.chapters.length; const i = Math.min(p.chapter || 0, n - 1);
    return { label: `Chapitre ${i + 1} / ${n}`, ratio: (i + (p.ratio || 0)) / n, resume: true };
  }
  if (it.launch_type === "episodes" && it.episodes?.length) {
    const last = readJ("sx_eplast_" + it.id); if (last == null) return null;
    const n = it.episodes.length; const i = Math.min(Number(last) + 1, n - 1);
    return { label: `Épisode ${i + 1} / ${n}`, ratio: (Number(last) + 1) / n };
  }
  return null;
}

// Expérience Nexus : les créations en objets, avec les trois manières de regarder de l'accueil (rayons, carte, arcade).
// La barre d'outils (recherche, thèmes, choix de la vue) est celle de l'accueil, passée telle quelle.
export default function NexusHome({ all = [], cats = [], settings, query = "", view = "rails", toolbar }) {
  const nav = useNavigate();
  const { sfx, playAmbient, isAdmin, favorites = [], uiVolume = 0.6, muted } = useApp();
  const qc = useQueryClient();
  const [sel, setSel] = useState(null);       // œuvre choisie : sa notice est ouverte
  const [launch, setLaunch] = useState(null);
  const [mapCat, setMapCat] = useState("__all__");
  const [arcCat, setArcCat] = useState("__all__");
  const catOf = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c])), [cats]);
  const sortedCats = useMemo(() => [...cats].sort((a, b) => (a.order || 0) - (b.order || 0)), [cats]);

  const books = useMemo(() => [...all].sort((a, b) => (a.order || 0) - (b.order || 0)).map((it, i) => {
    const c = catOf[it.category];
    return { id: it.id, it, title: it.title || "Sans titre", sub: it.tagline || "", format: fmtOfCreation(it, c?.label), emblem: it.kanji || c?.kanji || "核", cote: `SN-${String(i + 1).padStart(3, "0")}`, roomLabel: c?.label || "Station", house: "STATION NEXUS", up: it.category === "avenir" };
  }), [all, catOf]);
  const covers = useMemo(() => Object.fromEntries(all.filter((x) => x.has_poster).map((x) => [x.id, posterUrl(x.id, x.updated_at, 480)])), [all]);
  const shown = useMemo(() => { const s = query.trim().toLowerCase(); return s ? books.filter(({ it }) => `${it.title} ${it.tagline || ""} ${it.synopsis || ""}`.toLowerCase().includes(s)) : books; }, [books, query]);
  const shelves = useMemo(() => sortedCats.map((c) => ({ ...c, list: shown.filter((x) => x.it.category === c.key) })).filter((s) => s.list.length), [sortedCats, shown]);
  const mapList = useMemo(() => (mapCat === "__all__" ? shown : shown.filter((x) => x.it.category === mapCat)), [shown, mapCat]);
  const arcList = useMemo(() => (arcCat === "__all__" ? shown : shown.filter((x) => x.it.category === arcCat)), [shown, arcCat]);

  // Accès rapide : ce qu'on a commencé d'abord, puis ce qu'on a ouvert récemment, puis la une
  const quick = useMemo(() => {
    const byId = Object.fromEntries(books.map((x) => [x.id, x]));
    const feat = Array.isArray(settings?.featured_ids) ? settings.featured_ids : [];
    return [...new Set([...books.filter((x) => progressOf(x.it)).map((x) => x.id), ...(readJ("sx_recent") || []), ...feat])].map((id) => byId[id]).filter(Boolean).slice(0, 6);
  }, [books, settings]);

  // Coups de cœur : les œuvres marquées d'un cœur, de la plus récente à la plus ancienne
  const favs = useMemo(() => { const byId = Object.fromEntries(books.map((x) => [x.id, x])); return [...favorites].reverse().map((id) => byId[id]).filter(Boolean); }, [books, favorites]);
  const cur = sel && books.find((x) => x.id === sel);
  const arcCur = (cur && arcList.includes(cur) && cur) || arcList[0];
  const pick = (id) => { sfx?.("nav"); setSel(id); };
  const remember = (id) => { const r = readJ("sx_recent") || []; try { localStorage.setItem("sx_recent", JSON.stringify([id, ...r.filter((x) => x !== id)].slice(0, 8))); } catch (_) {} };
  // Seul l'accès rapide reprend la lecture ; partout ailleurs (rayons, carte, arcade) on entre dans l'univers, sur son accueil.
  const quickR = useRef(false);
  const go = useCallback((x) => {
    setLaunch(null);
    // Un voile reste posé le temps que le monde se charge : on ne revoit pas la station entre la pochette et l'entrée
    if (!document.getElementById("nx-veil")) { const v = document.createElement("div"); v.id = "nx-veil"; v.setAttribute("aria-hidden", "true"); document.body.appendChild(v); setTimeout(() => v.remove(), 4000); }
    nav(`/oeuvre/${x.id}`, { state: quickR.current && progressOf(x.it)?.resume ? { resume: true } : undefined });
  }, [nav]);
  // Pendant l'animation de lancement, on charge déjà les grandes images du monde (affiche, fond) : il arrive sans à-coup
  const preload = (x) => { try { [posterUrl(x.id, x.it.updated_at), x.it.has_bg ? bgUrl(x.id, x.it.updated_at) : null].filter(Boolean).forEach((u) => { const im = new Image(); im.decoding = "async"; im.src = u; im.decode?.().catch(() => {}); }); } catch (_) {} };
  const start = useCallback((x, quick = false) => { if (!x) return; preload(x); quickR.current = quick; sfx?.("select"); remember(x.id); playLaunch(muted ? 0 : uiVolume); if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return go(x); setLaunch(x); }, [sfx, go]); // eslint-disable-line react-hooks/exhaustive-deps
  const [leaving, setLeaving] = useState(false);
  useEffect(() => { if (!launch) return; setLeaving(false); const a = setTimeout(() => setLeaving(true), 1500); const t = setTimeout(() => go(launch), 1820); return () => { clearTimeout(a); clearTimeout(t); }; }, [launch, go]);
  useEffect(() => { setSel(null); }, [view]);

  const menuFor = (x) => () => ({ title: x.title, entries: [
    { label: "Lancer", icon: <IoPlay size={14} />, onClick: () => start(x) },
    { label: "Voir la notice", icon: <IoDocumentTextOutline size={14} />, onClick: () => pick(x.id) },
    playAmbient && { label: "Écouter l'ambiance", icon: <IoMusicalNotes size={14} />, onClick: () => playAmbient(x.id) },
    isAdmin && { label: "Mettre de face (en tête du rayon)", icon: <IoArrowUndo size={14} />, onClick: () => toFront(x) },
    "-",
    { label: "Copier le lien", icon: <IoLinkOutline size={14} />, onClick: () => { navigator.clipboard?.writeText(`${window.location.origin}/oeuvre/${x.id}`).catch(() => {}); toast.success("Lien copié"); } },
  ] });

  // Admin : l'œuvre passe en tête de son rayon, donc de face (l'ordre est celui des créations, le même qu'en Classique)
  const toFront = async (x) => {
    const min = Math.min(...all.filter((c) => c.category === x.it.category).map((c) => c.order || 0));
    try { await updateCreation(x.id, { ...x.it, order: min - 1 }); await qc.invalidateQueries({ queryKey: ["creations"] }); toast.success(`« ${x.title} » est de face`); } catch (_) { toast.error("Impossible de changer l'ordre (reconnecte-toi en admin)"); }
  };

  // Arcade : la tuile choisie reste visible
  const arcRail = useRef(null);
  useEffect(() => { if (view !== "arcade") return; const el = arcRail.current?.querySelector(".on"); el?.scrollIntoView?.({ inline: "center", block: "nearest", behavior: "smooth" }); }, [arcCur, view]);

  // Clavier ou manette : ← → dans un rayon ou dans l'arcade, ↑ ↓ d'un rayon à l'autre, Entrée lance, Échap referme.
  useEffect(() => {
    const k = (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName) || e.target?.isContentEditable || document.querySelector(".at-ctx-wrap,[role=dialog]")) return;
      if (launch) { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); go(launch); } return; }
      if (view === "arcade") {
        const i = arcList.indexOf(arcCur);
        if (e.key === "ArrowRight" && arcList[i + 1]) { e.preventDefault(); pick(arcList[i + 1].id); }
        if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); pick(arcList[i - 1].id); }
        if (e.key === "Enter" && arcCur) { e.preventDefault(); start(arcCur); }
        return;
      }
      if (!cur) return;
      if (e.key === "Escape") { e.preventDefault(); setSel(null); return; }
      if (e.target?.closest?.(".ax-rail")) return;
      if (e.key === "Enter") { e.preventDefault(); start(cur); return; }
      const list = view === "map" ? [mapList] : shelves.map((s) => s.list);
      const si = list.findIndex((l) => l.includes(cur)); const l = list[si]; const i = l ? l.indexOf(cur) : -1;
      let n = null;
      if (e.key === "ArrowRight") n = l?.[i + 1]; if (e.key === "ArrowLeft") n = l?.[i - 1];
      if (view !== "map" && (e.key === "ArrowDown" || e.key === "ArrowUp")) { const t = list[si + (e.key === "ArrowDown" ? 1 : -1)]; n = t?.[Math.min(i, t.length - 1)]; }
      if (n) { e.preventDefault(); pick(n.id); setTimeout(() => document.querySelector(".nx-notice")?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 40); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });

  // La notice de l'œuvre choisie (sous son rayon, ou au-dessus de la grille de la carte)
  const notice = (x, withCover) => (
    <div className={"ax-notice nx-notice" + (withCover ? " cv" : "")} key={x.id} data-testid="nx-sheet">
      {withCover && <span className="ax-notice-cv"><Face b={x} cover={covers[x.id]} upcoming={x.up} /></span>}
      <p className="mono meta">{x.cote} · {x.roomLabel.toUpperCase()} · {FMT_LABEL[x.format]}{UNIT[x.it.launch_type] && x.it[x.it.launch_type]?.length ? ` · ${x.it[x.it.launch_type].length} ${UNIT[x.it.launch_type].toUpperCase()}${x.it[x.it.launch_type].length > 1 ? "S" : ""}` : ""}</p>
      <h3>{x.title}</h3>
      {x.sub && <p className="sub">{x.sub}</p>}
      {x.it.synopsis && <p className="ab">{x.it.synopsis}</p>}
      {progressOf(x.it) && <p className="mono nx-prog">{progressOf(x.it).label}<span className="nx-qbar"><i style={{ width: `${Math.round(progressOf(x.it).ratio * 100)}%` }} /></span></p>}
      <div className="ax-acts">
        <button className="at-btn" onClick={() => start(x)} data-testid="nx-launch"><IoPlay size={14} /> {x.up ? "Découvrir" : "Lancer"}</button>
        {playAmbient && <button className="ax-ghost" onClick={() => playAmbient(x.id)}><IoMusicalNotes size={15} /> Ambiance</button>}
        <button className="ax-ghost" onClick={() => setSel(null)}><IoClose size={15} /> Fermer</button>
      </div>
    </div>
  );
  const objGrid = (list) => (
    <div className="ax-grid nx-grid">
      {list.map((x, i) => (
        <button key={x.id} className={"ax-gc" + (x.id === sel ? " on" : "") + (x.up ? " up" : "")} style={{ animationDelay: `${Math.min(i, 30) * 22}ms` }} onClick={() => (x.id === sel ? start(x) : pick(x.id))} onDoubleClick={() => start(x)} {...pressMenu(menuFor(x))} data-testid={`nx-gc-${x.id}`}>
          <Face b={x} cover={covers[x.id]} upcoming={x.up} />
          <b>{x.title}</b>{x.sub && <small>{x.sub}</small>}
        </button>
      ))}
    </div>
  );

  return (
    <div className="nx-root ax-view" data-testid="nexus-home">
      {quick.length > 0 && !query && (
        <section className="nx-quick" data-testid="nx-quick">
          <div className="seclabel"><div className="lt"><h2>Accès rapide</h2><span className="kj">続</span></div></div>
          <div className="nx-qrow">
            {quick.map((x) => { const p = progressOf(x.it); return (
              <button key={x.id} className="nx-qcard" onClick={() => start(x, true)} {...pressMenu(menuFor(x))} data-testid={`nx-quick-${x.id}`}>
                <span className="nx-qart"><Face b={x} cover={covers[x.id]} upcoming={x.up} /><em><IoPlay size={16} /></em></span>
                <span className="nx-qtx"><small className="mono">{FMT_LABEL[x.format]} · {x.roomLabel.toUpperCase()}</small><b>{x.title}</b><small className="mono nx-qp">{p ? p.label : x.up ? "À VENIR" : "LANCER"}</small>{p && <span className="nx-qbar"><i style={{ width: `${Math.round(p.ratio * 100)}%` }} /></span>}</span>
              </button>
            ); })}
          </div>
        </section>
      )}

      {favs.length > 0 && !query && (
        <section className="nx-quick nx-favs" data-testid="nx-favs">
          <div className="seclabel"><div className="lt"><h2>Coups de cœur</h2><span className="kj">愛</span></div><span className="mono nx-favn">{favs.length} ŒUVRE{favs.length > 1 ? "S" : ""}</span></div>
          <div className="nx-qrow">
            {favs.map((x) => (
              <button key={x.id} className="nx-qcard" onClick={() => start(x)} {...pressMenu(menuFor(x))} data-testid={`nx-fav-${x.id}`}>
                <span className="nx-qart"><Face b={x} cover={covers[x.id]} upcoming={x.up} /><em><IoPlay size={16} /></em></span>
                <span className="nx-qtx"><small className="mono">{FMT_LABEL[x.format]} · {x.roomLabel.toUpperCase()}</small><b>{x.title}</b><small className="mono nx-qp">♥ COUP DE CŒUR</small></span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="nx-toolbar">{toolbar}</div>
      {!shown.length && <div className="empty">Aucune création{query ? " pour cette recherche." : "."}</div>}

      {/* RAYONS : la première œuvre de chaque rayon est de face, les autres en tranche */}
      {view === "rails" && shelves.map((s, n) => {
        const mine = cur && cur.it.category === s.key;
        return (
          <section key={s.key} className="nx-shelf" data-testid={`nx-shelf-${s.key}`}>
            <Rail code={`RAYON ${String(n + 1).padStart(2, "0")}`} label={s.label.toUpperCase()} list={s.list} upFrom={s.list.findIndex((x) => x.up) < 0 ? s.list.length : s.list.findIndex((x) => x.up)}
              selId={mine ? cur.id : s.list[0].id} onSel={pick} covers={covers} wish={[]} onOpen={(b) => (sel === b.id ? start(b) : pick(b.id))} kanji={s.kanji} menuFor={(b) => menuFor(b)} />
            {mine && notice(cur, false)}
          </section>
        );
      })}

      {/* CARTE : les secteurs en constellation, puis leurs œuvres en objets */}
      {view === "map" && (
        <div>
          <div className="const nx-const">
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              {sortedCats.map((c, i) => { const a = (i / Math.max(1, sortedCats.length)) * Math.PI * 2 - Math.PI / 2; return <line key={c.key} x1="50%" y1="50%" x2={`${50 + Math.cos(a) * 32}%`} y2={`${50 + Math.sin(a) * 32}%`} stroke="var(--border-c)" strokeWidth="1" />; })}
            </svg>
            {[...sortedCats.map((c, i) => { const a = (i / Math.max(1, sortedCats.length)) * Math.PI * 2 - Math.PI / 2; return { key: c.key, label: c.label, kanji: c.kanji, x: 50 + Math.cos(a) * 32, y: 50 + Math.sin(a) * 32 }; }), { key: "__all__", label: "Tout", kanji: "全", x: 50, y: 50 }].map((nd) => (
              <div key={nd.key} className={"cnode" + (mapCat === nd.key ? " sel" : "")} onClick={() => { sfx?.("select"); setMapCat(nd.key); setSel(null); }}
                style={{ position: "absolute", left: `${nd.x}%`, top: `${nd.y}%`, transform: "translate(-50%,-50%)", cursor: "pointer", textAlign: "center" }}>
                <div className="cdisc">{nd.kanji}</div><div className="cnm">{nd.label}</div>
              </div>
            ))}
          </div>
          <div className="nx-mapres">
            {cur && mapList.includes(cur) && notice(cur, true)}
            {objGrid(mapList)}
          </div>
        </div>
      )}

      {/* ARCADE : l'objet en grand sur sa scène, la rangée en dessous, comme une console */}
      {view === "arcade" && (
        <div className="arc">
          <div className="arc-filters">
            {[{ key: "__all__", label: "Tout" }, ...sortedCats].map((c) => <button key={c.key} className={"arc-chip" + (arcCat === c.key ? " on" : "")} onClick={() => { sfx?.("nav"); setArcCat(c.key); setSel(null); }}>{c.label}</button>)}
          </div>
          {arcCur && (
            <div className="nx-arc-stage" key={arcCur.id}>
              {covers[arcCur.id] && <div className="nx-arc-bg" style={{ backgroundImage: `url(${covers[arcCur.id]})` }} />}
              <div className="nx-arc-obj" onClick={() => start(arcCur)}><Face b={arcCur} cover={covers[arcCur.id]} upcoming={arcCur.up} /></div>
              <div className="nx-arc-info">
                <p className="mono meta">◆ {arcCur.cote} · {arcCur.roomLabel.toUpperCase()} · {FMT_LABEL[arcCur.format]}</p>
                <h2>{arcCur.title}</h2>
                {arcCur.sub && <p className="sub">{arcCur.sub}</p>}
                {arcCur.it.synopsis && <p className="ab">{arcCur.it.synopsis}</p>}
                {progressOf(arcCur.it) && <p className="mono nx-prog">{progressOf(arcCur.it).label}<span className="nx-qbar"><i style={{ width: `${Math.round(progressOf(arcCur.it).ratio * 100)}%` }} /></span></p>}
                <div className="ax-acts"><button className="at-btn" onClick={() => start(arcCur)} data-testid="nx-arc-launch"><IoPlay size={14} /> Lancer</button>{playAmbient && <button className="ax-ghost" onClick={() => playAmbient(arcCur.id)}><IoMusicalNotes size={15} /> Ambiance</button>}</div>
              </div>
            </div>
          )}
          <div className="arc-railwrap">
            <button className="arc-nav prev" aria-label="Précédent" onClick={() => { const i = arcList.indexOf(arcCur); if (i > 0) pick(arcList[i - 1].id); }}>‹</button>
            <div className="arc-rail nx-arc-rail" ref={arcRail}>
              {arcList.map((x) => <button key={x.id} className={"nx-arc-tile" + (x === arcCur ? " on" : "")} onClick={() => (x === arcCur ? start(x) : pick(x.id))} {...pressMenu(menuFor(x))} data-testid={`nx-arc-${x.id}`}><Face b={x} cover={covers[x.id]} upcoming={x.up} /></button>)}
            </div>
            <button className="arc-nav next" aria-label="Suivant" onClick={() => { const i = arcList.indexOf(arcCur); if (arcList[i + 1]) pick(arcList[i + 1].id); }}>›</button>
          </div>
        </div>
      )}
      <p className="mono nx-keys" aria-hidden="true">← → CHOISIR · {view === "rails" ? "↑ ↓ CHANGER DE RAYON · " : ""}ENTRÉE LANCER · ÉCHAP FERMER · CLIC DROIT ACTIONS</p>

      {launch && (
        <div className={"nx-launchfx f-" + launch.format + (leaving ? " out" : "")} onClick={() => go(launch)} data-testid="nx-launchfx" role="status" aria-label={`Lancement de ${launch.title}`}>
          <i className="nx-lf-glow" aria-hidden="true" />
          <div className="nx-lf-obj"><Box3D b={launch} cover={covers[launch.id]} /></div>
          <p className="nx-lf-t"><span className="mono">{launch.format === "vhs" ? "▶ PLAY" : launch.format === "vinyle" ? "◉ FACE A" : "OUVERTURE"}</span>{launch.title}</p>
          <small className="mono nx-lf-skip">TOUCHE OU CLIC POUR PASSER</small>
        </div>
      )}
      <ContextMenuHost />
    </div>
  );
}
