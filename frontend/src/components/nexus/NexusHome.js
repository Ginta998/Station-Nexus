import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoPlay, IoSearch, IoClose, IoMusicalNotes, IoLinkOutline, IoDocumentTextOutline, IoTimeOutline, IoSwapHorizontal } from "react-icons/io5";
import { toast } from "sonner";
import { posterUrl } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { Face, Rail } from "@/components/atelier/Alexandrie";
import { ContextMenuHost, pressMenu } from "@/components/atelier/ContextMenu";
import { setExperience } from "@/lib/experience";
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

// Expérience Nexus : les créations rangées sur des rayons comme dans Alexandrie (tranches, l'œuvre choisie de face),
// avec l'accès rapide au-dessus et la notice sous le rayon. Le reste de l'accueil (la une, le journal…) ne change pas.
export default function NexusHome({ all = [], cats = [], settings }) {
  const nav = useNavigate();
  const { sfx, playAmbient } = useApp();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [launch, setLaunch] = useState(null);
  const catOf = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c])), [cats]);

  const books = useMemo(() => [...all].sort((a, b) => (a.order || 0) - (b.order || 0)).map((it, i) => {
    const c = catOf[it.category];
    return { id: it.id, it, title: it.title || "Sans titre", sub: it.tagline || "", format: fmtOfCreation(it, c?.label), emblem: it.kanji || c?.kanji || "核", cote: `SN-${String(i + 1).padStart(3, "0")}`, roomLabel: c?.label || "Station", house: "STATION NEXUS", up: it.category === "avenir" };
  }), [all, catOf]);
  const covers = useMemo(() => Object.fromEntries(all.filter((x) => x.has_poster).map((x) => [x.id, posterUrl(x.id, x.updated_at, 480)])), [all]);
  const shown = useMemo(() => { const s = q.trim().toLowerCase(); return s ? books.filter(({ it }) => `${it.title} ${it.tagline || ""} ${it.synopsis || ""}`.toLowerCase().includes(s)) : books; }, [books, q]);
  const shelves = useMemo(() => [...cats].sort((a, b) => (a.order || 0) - (b.order || 0)).map((c) => ({ ...c, list: shown.filter((x) => x.it.category === c.key) })).filter((s) => s.list.length), [cats, shown]);

  // Accès rapide : ce qu'on a commencé d'abord, puis ce qu'on a ouvert récemment, puis la une
  const quick = useMemo(() => {
    const byId = Object.fromEntries(books.map((x) => [x.id, x]));
    const feat = Array.isArray(settings?.featured_ids) ? settings.featured_ids : [];
    return [...new Set([...books.filter((x) => progressOf(x.it)).map((x) => x.id), ...(readJ("sx_recent") || []), ...feat])].map((id) => byId[id]).filter(Boolean).slice(0, 6);
  }, [books, settings]);

  const cur = sel && books.find((x) => x.id === sel);
  const pick = (id) => { sfx?.("nav"); setSel(id); };
  const remember = (id) => { const r = readJ("sx_recent") || []; try { localStorage.setItem("sx_recent", JSON.stringify([id, ...r.filter((x) => x !== id)].slice(0, 8))); } catch (_) {} };
  const go = useCallback((x) => { setLaunch(null); nav(`/oeuvre/${x.id}`, { state: progressOf(x.it)?.resume ? { resume: true } : undefined }); }, [nav]);
  const start = useCallback((x) => { if (!x) return; sfx?.("select"); remember(x.id); if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return go(x); setLaunch(x); }, [sfx, go]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!launch) return; const t = setTimeout(() => go(launch), launch.format === "vinyle" ? 1700 : 1500); return () => clearTimeout(t); }, [launch, go]);

  const menuFor = (x) => () => ({ title: x.title, entries: [
    { label: "Lancer", icon: <IoPlay size={14} />, onClick: () => start(x) },
    { label: "Voir la notice", icon: <IoDocumentTextOutline size={14} />, onClick: () => pick(x.id) },
    playAmbient && { label: "Écouter l'ambiance", icon: <IoMusicalNotes size={14} />, onClick: () => playAmbient(x.id) },
    "-",
    { label: "Copier le lien", icon: <IoLinkOutline size={14} />, onClick: () => { navigator.clipboard?.writeText(`${window.location.origin}/oeuvre/${x.id}`).catch(() => {}); toast.success("Lien copié"); } },
  ] });

  // Clavier ou manette : ← → dans un rayon (géré par le rayon), ↑ ↓ d'un rayon à l'autre, Entrée lance, Échap referme.
  useEffect(() => {
    const k = (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName) || e.target?.isContentEditable || document.querySelector(".at-ctx-wrap,[role=dialog]")) return;
      if (launch) { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); go(launch); } return; }
      if (!cur) return;
      if (e.key === "Escape") { e.preventDefault(); setSel(null); return; }
      if (e.target?.closest?.(".ax-rail")) return;
      if (e.key === "Enter") { e.preventDefault(); start(cur); return; }
      const si = shelves.findIndex((s) => s.key === cur.it.category); const s = shelves[si]; const i = s ? s.list.indexOf(cur) : -1;
      let n = null;
      if (e.key === "ArrowRight") n = s?.list[i + 1]; if (e.key === "ArrowLeft") n = s?.list[i - 1];
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { const t = shelves[si + (e.key === "ArrowDown" ? 1 : -1)]; n = t?.list[Math.min(i, t.list.length - 1)]; }
      if (n) { e.preventDefault(); pick(n.id); setTimeout(() => document.querySelector(`[data-testid="nx-shelf-${n.it.category}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 30); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });

  return (
    <div className="nx-root ax-view" data-testid="nexus-home">
      {quick.length > 0 && !q && (
        <section className="nx-quick" data-testid="nx-quick">
          <div className="seclabel"><div className="lt"><h2>Accès rapide</h2><span className="kj">続</span></div></div>
          <div className="nx-qrow">
            {quick.map((x) => { const p = progressOf(x.it); return (
              <button key={x.id} className="nx-qcard" onClick={() => start(x)} {...pressMenu(menuFor(x))} data-testid={`nx-quick-${x.id}`}>
                <span className="nx-qart"><Face b={x} cover={covers[x.id]} upcoming={x.up} /><em><IoPlay size={16} /></em></span>
                <span className="nx-qtx"><small className="mono">{FMT_LABEL[x.format]} · {x.roomLabel.toUpperCase()}</small><b>{x.title}</b><small className="mono nx-qp">{p ? p.label : progressOf(x.it) === null && x.up ? "À VENIR" : "LANCER"}</small>{p && <span className="nx-qbar"><i style={{ width: `${Math.round(p.ratio * 100)}%` }} /></span>}</span>
              </button>
            ); })}
          </div>
        </section>
      )}

      <div className="seclabel sx-explore-head">
        <div className="lt"><h2>Les rayons</h2><span className="kj">蔵</span></div>
        <span className="all mono">{all.length} ŒUVRE{all.length > 1 ? "S" : ""}</span>
      </div>
      <div className="nx-bar">
        <label className="nx-search"><IoSearch size={14} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher une œuvre…" data-testid="nx-search" />{q && <button onClick={() => setQ("")} aria-label="Effacer"><IoClose size={14} /></button>}</label>
        <button className="nx-chip mono" onClick={() => { setExperience("classique"); toast.success("Station classique"); }} title="Revenir à la station classique (aussi dans Paramètres)" data-testid="nx-to-classic"><IoSwapHorizontal size={13} /> CLASSIQUE</button>
      </div>
      {!shelves.length && <p className="nx-empty">Aucune œuvre{q ? " pour cette recherche" : ""}.</p>}

      {shelves.map((s, n) => (
        <section key={s.key} className="nx-shelf" data-testid={`nx-shelf-${s.key}`}>
          <Rail code={`RAYON ${String(n + 1).padStart(2, "0")}`} label={s.label.toUpperCase()} list={s.list} upFrom={s.list.findIndex((x) => x.up) < 0 ? s.list.length : s.list.findIndex((x) => x.up)}
            selId={cur && cur.it.category === s.key ? cur.id : null} onSel={pick} covers={covers} wish={[]} onOpen={(b) => start(b)} kanji={s.kanji} menuFor={(b) => menuFor(b)} />
          {cur && cur.it.category === s.key && (
            <div className="ax-notice nx-notice" key={cur.id} data-testid="nx-sheet">
              <p className="mono meta">{cur.cote} · {cur.roomLabel.toUpperCase()} · {FMT_LABEL[cur.format]}{UNIT[cur.it.launch_type] && cur.it[cur.it.launch_type]?.length ? ` · ${cur.it[cur.it.launch_type].length} ${UNIT[cur.it.launch_type].toUpperCase()}${cur.it[cur.it.launch_type].length > 1 ? "S" : ""}` : ""}</p>
              <h3>{cur.title}</h3>
              {cur.sub && <p className="sub">{cur.sub}</p>}
              {cur.it.synopsis && <p className="ab">{cur.it.synopsis}</p>}
              {progressOf(cur.it) && <p className="mono nx-prog">{progressOf(cur.it).label}<span className="nx-qbar"><i style={{ width: `${Math.round(progressOf(cur.it).ratio * 100)}%` }} /></span></p>}
              <div className="ax-acts">
                <button className="at-btn" onClick={() => start(cur)} data-testid="nx-launch"><IoPlay size={14} /> {progressOf(cur.it) ? "Reprendre" : cur.up ? "Découvrir" : "Lancer"}</button>
                {playAmbient && <button className="ax-ghost" onClick={() => playAmbient(cur.id)}><IoMusicalNotes size={15} /> Ambiance</button>}
                <button className="ax-ghost" onClick={() => setSel(null)}><IoClose size={15} /> Fermer</button>
              </div>
            </div>
          )}
        </section>
      ))}
      <p className="mono nx-keys" aria-hidden="true">← → CHOISIR · ↑ ↓ CHANGER DE RAYON · ENTRÉE LANCER · ÉCHAP FERMER · CLIC DROIT ACTIONS</p>

      {launch && (
        <div className={"nx-launchfx f-" + launch.format} onClick={() => go(launch)} data-testid="nx-launchfx" role="status" aria-label={`Lancement de ${launch.title}`}>
          <div className="nx-lf-obj"><Face b={launch} cover={covers[launch.id]} /></div>
          {launch.format === "vhs" && <i className="nx-lf-slot" />}
          <p className="nx-lf-t"><span className="mono">{launch.format === "vhs" ? "▶ PLAY" : launch.format === "vinyle" ? "◉ FACE A" : "OUVERTURE"}</span>{launch.title}</p>
          <small className="mono nx-lf-skip">TOUCHE OU CLIC POUR PASSER</small>
        </div>
      )}
      <ContextMenuHost />
    </div>
  );
}
