import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoPlay, IoSearch, IoClose, IoMusicalNotes, IoLinkOutline, IoDocumentTextOutline, IoTimeOutline, IoSwapHorizontal } from "react-icons/io5";
import { toast } from "sonner";
import { listCreations, listCategories, getSettings, posterUrl, bgUrl } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { Face } from "@/components/atelier/Alexandrie";
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
const FMT_LABEL = { livre: "Livre", vhs: "Cassette", vinyle: "Vinyle" };
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

export default function NexusHome() {
  const nav = useNavigate();
  const { sfx, playAmbient } = useApp();
  const { data: all = [], isLoading } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const { data: settings } = useQuery({ queryKey: ["site-settings"], queryFn: getSettings });
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);      // œuvre choisie : sa fiche est ouverte
  const [launch, setLaunch] = useState(null); // œuvre en cours de lancement
  const catOf = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c])), [cats]);

  // L'objet de chaque œuvre, avec sa cote de station
  const books = useMemo(() => [...all].sort((a, b) => (a.order || 0) - (b.order || 0)).map((it, i) => {
    const c = catOf[it.category];
    return { it, b: { id: it.id, title: it.title || "Sans titre", sub: it.tagline || "", format: fmtOfCreation(it, c?.label), emblem: it.kanji || c?.kanji || "核", cote: `SN-${String(i + 1).padStart(3, "0")}`, roomLabel: c?.label || "Station", house: "STATION NEXUS" }, cover: it.has_poster ? posterUrl(it.id, it.updated_at, 480) : null };
  }), [all, catOf]);
  const shown = useMemo(() => { const s = q.trim().toLowerCase(); return s ? books.filter(({ it }) => `${it.title} ${it.tagline || ""} ${it.synopsis || ""}`.toLowerCase().includes(s)) : books; }, [books, q]);
  const shelves = useMemo(() => [...cats].sort((a, b) => (a.order || 0) - (b.order || 0)).map((c) => ({ ...c, list: shown.filter((x) => x.it.category === c.key) })).filter((s) => s.list.length), [cats, shown]);
  const flat = useMemo(() => shelves.flatMap((s) => s.list), [shelves]);

  // Accès rapide : ce qu'on a commencé d'abord, puis ce qu'on a ouvert récemment, puis la une
  const quick = useMemo(() => {
    const recent = readJ("sx_recent") || []; const byId = Object.fromEntries(books.map((x) => [x.it.id, x]));
    const started = books.filter((x) => progressOf(x.it)).map((x) => x.it.id);
    const feat = Array.isArray(settings?.featured_ids) ? settings.featured_ids : [];
    return [...new Set([...started, ...recent, ...feat])].map((id) => byId[id]).filter(Boolean).slice(0, 6);
  }, [books, settings]);

  const cur = sel && books.find((x) => x.it.id === sel);
  const pick = (id) => { sfx?.("nav"); setSel(id); };
  const remember = (id) => { const r = readJ("sx_recent") || []; try { localStorage.setItem("sx_recent", JSON.stringify([id, ...r.filter((x) => x !== id)].slice(0, 8))); } catch (_) {} };
  const reduce = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const go = useCallback((x) => { setLaunch(null); nav(`/oeuvre/${x.it.id}`, { state: progressOf(x.it)?.resume ? { resume: true } : undefined }); }, [nav]);
  const start = useCallback((x) => { if (!x) return; sfx?.("select"); remember(x.it.id); if (reduce()) return go(x); setLaunch(x); }, [sfx, go]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!launch) return; const t = setTimeout(() => go(launch), launch.b.format === "vinyle" ? 1700 : 1500); return () => clearTimeout(t); }, [launch, go]);

  const menu = (x) => () => ({ title: x.it.title, entries: [
    { label: "Lancer", icon: <IoPlay size={14} />, onClick: () => start(x) },
    { label: "Voir la fiche", icon: <IoDocumentTextOutline size={14} />, onClick: () => pick(x.it.id) },
    playAmbient && { label: "Écouter l'ambiance", icon: <IoMusicalNotes size={14} />, onClick: () => playAmbient(x.it.id) },
    "-",
    { label: "Copier le lien", icon: <IoLinkOutline size={14} />, onClick: () => { navigator.clipboard?.writeText(`${window.location.origin}/oeuvre/${x.it.id}`); toast.success("Lien copié"); } },
  ] });

  // Manette ou clavier : flèches pour se déplacer d'objet en objet et d'étagère en étagère, Entrée pour lancer, Échap pour refermer.
  useEffect(() => {
    const k = (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName) || e.target?.isContentEditable || document.querySelector(".at-ctx-wrap,[role=dialog]")) return;
      if (launch) { if (e.key === "Escape" || e.key === "Enter") { e.preventDefault(); go(launch); } return; }
      if (e.key === "Escape" && sel) { e.preventDefault(); setSel(null); return; }
      if (e.key === "Enter" && cur) { e.preventDefault(); start(cur); return; }
      if (!/^Arrow/.test(e.key) || !flat.length) return;
      e.preventDefault();
      if (!cur) return pick(flat[0].it.id);
      const si = shelves.findIndex((s) => s.key === cur.it.category); const s = shelves[si]; const i = s.list.indexOf(cur);
      let n = null;
      if (e.key === "ArrowRight") n = s.list[i + 1] || shelves[si + 1]?.list[0];
      if (e.key === "ArrowLeft") n = s.list[i - 1] || shelves[si - 1]?.list.slice(-1)[0];
      if (e.key === "ArrowDown") { const t = shelves[si + 1]; n = t?.list[Math.min(i, t.list.length - 1)]; }
      if (e.key === "ArrowUp") { const t = shelves[si - 1]; n = t?.list[Math.min(i, t.list.length - 1)]; }
      if (n) { pick(n.it.id); document.querySelector(`[data-testid="nx-obj-${n.it.id}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });

  const bg = cur ? (cur.it.has_bg ? bgUrl(cur.it.id, cur.it.updated_at) : cur.cover) : null;
  return (
    <div className={"nx-root ax-view" + (cur ? " has-sel" : "")} data-testid="nexus-home">
      {bg && <div className="nx-bg" key={bg} style={{ backgroundImage: `url(${bg})` }} aria-hidden="true" />}
      <header className="nx-head">
        <div>
          <p className="mono nx-k">// STATION NEXUS · {all.length} ŒUVRE{all.length > 1 ? "S" : ""}</p>
          <h1>La station</h1>
        </div>
        <label className="nx-search"><IoSearch size={14} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher une œuvre…" data-testid="nx-search" />{q && <button onClick={() => setQ("")} aria-label="Effacer"><IoClose size={14} /></button>}</label>
        <button className="nx-chip mono" onClick={() => { setExperience("classique"); toast.success("Station classique"); }} title="Revenir à la station classique (aussi dans Paramètres)" data-testid="nx-to-classic"><IoSwapHorizontal size={13} /> CLASSIQUE</button>
      </header>

      {quick.length > 0 && !q && (
        <section className="nx-quick" data-testid="nx-quick">
          <p className="mono nx-lbl"><IoTimeOutline size={12} /> ACCÈS RAPIDE</p>
          <div className="nx-qrow">
            {quick.map((x) => { const p = progressOf(x.it); return (
              <button key={x.it.id} className="nx-qcard" onClick={() => start(x)} {...pressMenu(menu(x))} data-testid={`nx-quick-${x.it.id}`}>
                <span className="nx-qart" style={x.cover ? { backgroundImage: `url(${x.cover})` } : { "--h": [...x.b.title].reduce((a, c) => a + c.charCodeAt(0), 0) % 360 }}>{!x.cover && <i>{x.b.emblem}</i>}<em><IoPlay size={16} /></em></span>
                <span className="nx-qtx"><b>{x.it.title}</b><small className="mono">{p ? p.label : x.b.roomLabel.toUpperCase()}</small>{p && <span className="nx-qbar"><i style={{ width: `${Math.round(p.ratio * 100)}%` }} /></span>}</span>
              </button>
            ); })}
          </div>
        </section>
      )}

      {isLoading && <p className="nx-empty mono">CHARGEMENT…</p>}
      {!isLoading && !flat.length && <p className="nx-empty">Aucune œuvre{q ? " pour cette recherche" : ""}.</p>}
      {shelves.map((s) => (
        <section key={s.key} className="nx-shelf">
          <p className="mono nx-lbl"><b>{s.kanji}</b> {s.label.toUpperCase()} <span>· {s.list.length}</span></p>
          <div className="nx-row">
            {s.list.map((x, i) => (
              <button key={x.it.id} className={"ax-gc nx-obj" + (x.it.id === sel ? " on" : "")} style={{ animationDelay: `${Math.min(i, 20) * 22}ms` }}
                onClick={() => (x.it.id === sel ? start(x) : pick(x.it.id))} onDoubleClick={() => start(x)} {...pressMenu(menu(x))} onContextMenu={(e) => { setSel(x.it.id); pressMenu(menu(x)).onContextMenu(e); }}
                data-testid={`nx-obj-${x.it.id}`} aria-label={`${x.it.title} : ${x.it.id === sel ? "lancer" : "voir la fiche"}`}>
                <Face b={x.b} cover={x.cover} />
                <b>{x.it.title}</b>
                {progressOf(x.it) && <small className="mono">{progressOf(x.it).label}</small>}
              </button>
            ))}
          </div>
          <i className="nx-plank" aria-hidden="true" />
        </section>
      ))}
      <p className="mono nx-keys" aria-hidden="true">← → ↑ ↓ CHOISIR · ENTRÉE LANCER · ÉCHAP FERMER · CLIC DROIT ACTIONS</p>

      {cur && !launch && (
        <aside className="nx-sheet" data-testid="nx-sheet" key={cur.it.id}>
          <button className="nx-x" onClick={() => setSel(null)} aria-label="Fermer la fiche"><IoClose size={18} /></button>
          <div className="nx-sheet-cv"><Face b={cur.b} cover={cur.cover} /></div>
          <div className="nx-sheet-tx">
            <p className="mono nx-k">{cur.b.cote} · {cur.b.roomLabel.toUpperCase()} · {FMT_LABEL[cur.b.format].toUpperCase()}{UNIT[cur.it.launch_type] && cur.it[cur.it.launch_type]?.length ? ` · ${cur.it[cur.it.launch_type].length} ${UNIT[cur.it.launch_type]}${cur.it[cur.it.launch_type].length > 1 ? "s" : ""}` : ""}</p>
            <h2>{cur.it.title}</h2>
            {cur.it.tagline && <p className="nx-tag">{cur.it.tagline}</p>}
            {cur.it.synopsis && <p className="nx-syn">{cur.it.synopsis}</p>}
            {progressOf(cur.it) && <p className="mono nx-prog">{progressOf(cur.it).label}<span className="nx-qbar"><i style={{ width: `${Math.round(progressOf(cur.it).ratio * 100)}%` }} /></span></p>}
            <div className="nx-acts">
              <button className="nx-launch" onClick={() => start(cur)} data-testid="nx-launch"><IoPlay size={16} /> {progressOf(cur.it) ? "Reprendre" : cur.it.launch_label && cur.it.launch_label !== "Lancer" ? cur.it.launch_label : "Lancer"}</button>
              {playAmbient && <button className="nx-sec" onClick={() => playAmbient(cur.it.id)}><IoMusicalNotes size={15} /> Ambiance</button>}
            </div>
          </div>
        </aside>
      )}

      {launch && (
        <div className={"nx-launchfx f-" + launch.b.format} onClick={() => go(launch)} data-testid="nx-launchfx" role="status" aria-label={`Lancement de ${launch.it.title}`}>
          <div className="nx-lf-obj"><Face b={launch.b} cover={launch.cover} /></div>
          {launch.b.format === "vhs" && <i className="nx-lf-slot" />}
          <p className="nx-lf-t"><span className="mono">{launch.b.format === "vhs" ? "▶ PLAY" : launch.b.format === "vinyle" ? "◉ FACE A" : "OUVERTURE"}</span>{launch.it.title}</p>
          <small className="mono nx-lf-skip">TOUCHE OU CLIC POUR PASSER</small>
        </div>
      )}
      <ContextMenuHost />
    </div>
  );
}
