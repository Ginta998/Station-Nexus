import { openJaquette } from "@/components/nexus/JaquetteHost";
import { useMemo, useState } from "react";
import { IoPlay, IoArrowForward } from "react-icons/io5";
import { posterUrl, bgUrl, videoUrl } from "@/lib/api";
import { Face } from "@/components/atelier/AlexCore";
import { pressMenu } from "@/components/atelier/ContextMenu";
import { fmtOfCreation } from "@/components/nexus/NexusHome";
import { useJaqDefault, mergeJaq, edOfIt, kindOfCreation } from "@/lib/jaquette";
import Box3D from "@/components/nexus/Box3D";
import "@/components/nexus/blocs.css";

// Les blocs de Nexus OS qui n'existaient pas dans l'accueil d'origine (accès rapide en objets, univers, une en affiche ou en cinéma).
// Ils utilisent les VRAIS objets de la Station (la face d'Alexandrie : livre, VHS, vinyle) et prennent
// les couleurs et les polices du thème. Entrer dans une œuvre passe par le lancement Nexus (nx-start).
const readJ = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (_) { return null; } };
const launch = (id, quick = false) => window.dispatchEvent(new CustomEvent("nx-start", { detail: { id, quick } }));
const FMT = { livre: "Livre", vhs: "VHS", vinyle: "Vinyle" };
export const univSlug = (name) => encodeURIComponent((name || "").trim());
// Ouvre la fenêtre d'un univers (l'accueil l'écoute)
export const openUnivers = (name) => window.dispatchEvent(new CustomEvent("nx-univers", { detail: { name } }));

export function useObjs(all, cats) {
  const jd = useJaqDefault();
  return useMemo(() => {
    const catOf = Object.fromEntries(cats.map((c) => [c.key, c]));
    return [...all].sort((a, b) => (a.order || 0) - (b.order || 0)).map((it, i) => {
      const c = catOf[it.category];
      return { id: it.id, it, title: it.title || "Sans titre", sub: it.tagline || "", format: fmtOfCreation(it, c?.label), emblem: it.kanji || c?.kanji || "核", cote: `SN-${String(i + 1).padStart(3, "0")}`, roomLabel: c?.label || "Station", house: "", up: it.category === "avenir", kind: kindOfCreation(it, fmtOfCreation(it, c?.label)), spine: mergeJaq(jd, it.jaquette), ...edOfIt(it, jd),
        cover: it.has_poster ? posterUrl(it.id, it.updated_at, 480) : "", bg: it.has_bg ? bgUrl(it.id, it.updated_at) : it.has_poster ? posterUrl(it.id, it.updated_at, 900) : "" };
    });
  }, [all, cats, jd]);
}
// Où le visiteur en est (chapitre, épisode) et la part déjà vue
export const progressOf = (it) => {
  if (it.launch_type === "chapters" && it.chapters?.length) { const p = readJ("sx_progress_" + it.id); if (p) { const n = it.chapters.length; const i = Math.min(p.chapter || 0, n - 1); return { label: `Chapitre ${i + 1} / ${n}`, ratio: (i + (p.ratio || 0)) / n }; } }
  if (it.launch_type === "episodes" && it.episodes?.length) { const l = readJ("sx_eplast_" + it.id); if (l != null) { const n = it.episodes.length; return { label: `Épisode ${Math.min(Number(l) + 2, n)} / ${n}`, ratio: (Number(l) + 1) / n }; } }
  return null;
};
// Accès rapide : ce qu'on a commencé, puis ouvert récemment, puis la une ; "fill" complète avec le reste
function quickOf(objs, featured, fill) {
  const byId = Object.fromEntries(objs.map((o) => [o.id, o]));
  const l = [...new Set([...objs.filter((o) => progressOf(o.it)).map((o) => o.id), ...(readJ("sx_recent") || []), ...featured])].map((id) => byId[id]).filter(Boolean);
  if (!fill) return l.slice(0, 6);
  return [...l, ...objs.filter((o) => !l.includes(o) && !o.up), ...objs.filter((o) => !l.includes(o) && o.up)].slice(0, 6);
}
// Actions admin du clic droit / appui long (fournies par l'accueil : modifier la création, la mettre à la une)
let ADMIN = null; export const setBlocAdmin = (a) => { ADMIN = a; };
const objMenu = (o) => () => ({ title: o.title, entries: [
  { label: "Lancer", onClick: () => launch(o.id) },
  { label: "Reprendre où j'en étais", onClick: () => launch(o.id, true) },
  { label: "Voir l'objet en 3D", onClick: () => window.dispatchEvent(new CustomEvent("nx-objet", { detail: { b: o, cover: o.cover } })) },
  { label: "Copier le lien", onClick: () => navigator.clipboard?.writeText(`${window.location.origin}/oeuvre/${o.id}`).catch(() => {}) },
  ...(ADMIN && o.it ? ["-", { label: "Jaquette et reliure…", onClick: () => openJaquette({ id: o.id, b: o, cover: o.cover }) }, { label: "Modifier la création", onClick: () => ADMIN.edit(o.it) }, { label: "Crédits…", onClick: () => ADMIN.edit(o.it, "credits") }, { label: ADMIN.featured(o.id) ? "Retirer de la une" : "Mettre à la une", onClick: () => ADMIN.feature(o.it) }] : []),
] });

// Un objet de la Station, debout, avec son ombre et son étiquette
export function Obj({ o, z = 0.6, label = true, line, quick = false }) {
  return (
    <button type="button" className={"hb-obj f-" + o.format} onClick={() => launch(o.id, quick)} {...pressMenu(objMenu(o))} aria-label={o.title}>
      <span className="hb-obj-in" style={{ "--z": z, "--zv": z * 0.62 }}><Box3D b={o} cover={o.cover} /></span>
      <span className="hb-obj-sh" aria-hidden="true" />
      {label && <span className="hb-obj-l"><b>{o.title}</b><i>{FMT[o.format]} · {o.roomLabel}</i>{line && <i>{line}</i>}</span>}
    </button>
  );
}
const Head = ({ title, kj, sub }) => (
  <div className="seclabel hb-head"><div className="lt"><h2>{title}</h2>{kj && <span className="kj">{kj}</span>}</div>{sub && <span className="all mono">{sub}</span>}</div>
);

/* ---------- Accès rapide ---------- */
function Cartes({ objs, featured }) {
  const l = quickOf(objs, featured, false);
  if (!l.length) return null;
  return (
    <section className="nx-root ax-view nx-quick hb-rapide" data-testid="bloc-rapide-cartes">
      <Head title="Accès rapide" kj="続" />
      <div className="nx-qrow">{l.map((o) => { const p = progressOf(o.it); return (
        <button key={o.id} className="nx-qcard" onClick={() => launch(o.id, true)} {...pressMenu(objMenu(o))}>
          <span className="nx-qart"><Face b={o} cover={o.cover} upcoming={o.up} /><em><IoPlay size={16} /></em></span>
          <span className="nx-qtx"><small className="mono">{FMT[o.format].toUpperCase()} · {o.roomLabel.toUpperCase()}</small><b>{o.title}</b><small className="mono nx-qp">{p ? p.label : o.up ? "À VENIR" : "LANCER"}</small>{p && <span className="nx-qbar"><i style={{ width: `${Math.round(p.ratio * 100)}%` }} /></span>}</span>
        </button>); })}
      </div>
    </section>
  );
}
function Comptoir({ objs, featured }) {
  const p = quickOf(objs, featured, true);
  return (
    <section className="hb hb-comptoir" data-testid="bloc-rapide-comptoir">
      <Head title="Accès rapide" kj="続" sub="REPRENDS OÙ TU EN ÉTAIS" />
      <div className="hb-objs">{p.map((o) => <Obj key={o.id} o={o} line={progressOf(o.it)?.label} quick />)}</div>
      <div className="hb-counter" aria-hidden="true" />
    </section>
  );
}
function Vitrines({ objs, featured }) {
  const p = quickOf(objs, featured, true).slice(0, 4);
  return (
    <section className="hb hb-vitrines" data-testid="bloc-rapide-vitrines">
      <Head title="Accès rapide" kj="続" sub="SURVOLE : LA LAMPE S'ALLUME" />
      <div className="hb-cases">{p.map((o, i) => (
        <article key={o.id} className="hb-case">
          <div className="glass"><span className="lamp" aria-hidden="true" /><div className="stage"><Obj o={o} label={false} quick /></div><span className="num mono">{String(i + 1).padStart(3, "0")}</span></div>
          <button type="button" className="card" onClick={() => launch(o.id, true)} {...pressMenu(objMenu(o))}>
            <span className="mono code">{o.cote}</span><h3>{o.title}</h3>
            <dl className="mono"><dt>Format</dt><dd>{FMT[o.format]}</dd><dt>Salle</dt><dd>{o.roomLabel}</dd><dt>État</dt><dd>{o.up ? "En préparation" : progressOf(o.it)?.label || "Exposé"}</dd></dl>
          </button>
        </article>))}
      </div>
    </section>
  );
}
function Carnet({ objs, featured }) {
  const l = quickOf(objs, featured, true).slice(0, 5);
  return (
    <section className="hb hb-carnet" data-testid="bloc-rapide-carnet">
      <Head title="Accès rapide" kj="続" />
      <div className="hb-notes">{l.map((o) => { const p = progressOf(o.it); return (
        <button type="button" key={o.id} className="hb-note" onClick={() => launch(o.id, true)} {...pressMenu(objMenu(o))}>
          <span className="th">{o.cover && <img src={o.cover} alt="" loading="lazy" />}</span>
          <span className="tx"><b>{o.title}</b><small>{p ? p.label : o.up ? "Bientôt" : `${FMT[o.format]} · ${o.roomLabel}`}</small><span className="bar"><i style={{ width: `${Math.round((p?.ratio || 0) * 100)}%` }} /></span></span>
          <span className="go" aria-hidden="true"><IoArrowForward size={16} /></span>
        </button>); })}
      </div>
    </section>
  );
}

/* ---------- Les univers : les œuvres regroupées par leur champ « Univers » ---------- */
export function useUnivers(objs) {
  return useMemo(() => {
    const m = new Map();
    objs.forEach((o) => { const n = (o.it.univers || "").trim(); if (!n) return; if (!m.has(n)) m.set(n, []); m.get(n).push(o); });
    return [...m.entries()].map(([name, list]) => ({ name, list, bg: (list.find((o) => o.it.has_bg) || list.find((o) => o.bg) || {}).bg || "", kj: list[0].emblem }));
  }, [objs]);
}
const FINE_PTR = typeof window !== "undefined" && window.matchMedia?.("(pointer:fine)").matches;
function Accordeon({ objs }) {
  const u = useUnivers(objs).slice(0, 6);
  const [open, setOpen] = useState(0);
  if (u.length < 2) return null;
  return (
    <section className="hb hb-univ" data-testid="bloc-univers-accordeon">
      <Head title="Les univers" kj="世界" sub={`${u.length} MONDES`} />
      <div className="hb-acc">{u.map((w, i) => (
        <button type="button" key={w.name} className={"pan" + (i === open ? " op" : "")} onMouseEnter={FINE_PTR ? () => setOpen(i) : undefined} onFocus={FINE_PTR ? () => setOpen(i) : undefined}
          onClick={() => (!FINE_PTR || i === open ? openUnivers(w.name) : setOpen(i))} aria-label={w.name}>
          <span className="bg" style={{ backgroundImage: w.bg ? `url("${w.bg}")` : undefined }} />
          <span className="v" aria-hidden="true">{w.kj}</span>
          <span className="lab"><span className="mono">{w.list.length} œuvre{w.list.length > 1 ? "s" : ""} · entrer →</span><b>{w.name}</b>
            <span className="mini">{w.list.slice(0, 4).map((o) => o.cover && <img key={o.id} src={o.cover} alt="" loading="lazy" />)}</span></span>
        </button>))}
      </div>
    </section>
  );
}
function Galerie({ objs }) {
  const u = useUnivers(objs);
  if (!u.length) return null;
  return (
    <section className="hb hb-galerie" data-testid="bloc-univers-galerie">
      <Head title="Les univers" kj="世界" sub={`${u.length} MONDE${u.length > 1 ? "S" : ""}`} />
      <div className="hb-gal">{u.map((w) => (
        <button type="button" key={w.name} className="hb-uc" onClick={() => openUnivers(w.name)} aria-label={w.name}>
          <span className="bg" style={{ backgroundImage: w.bg ? `url("${w.bg}")` : undefined }} />
          <span className="fan" aria-hidden="true">{w.list.slice(0, 3).map((o, i) => <span key={o.id} className={"f" + i} style={{ "--z": 0.5, "--zv": 0.31 }}><Face b={o} cover={o.cover} upcoming={o.up} /></span>)}</span>
          <span className="lab"><b>{w.name}</b><span className="mono">{w.list.length} œuvre{w.list.length > 1 ? "s" : ""} · entrer →</span></span>
        </button>))}
      </div>
    </section>
  );
}

const VIEWS = { rapide: { cartes: Cartes, comptoir: Comptoir, vitrines: Vitrines, carnet: Carnet }, univers: { accordeon: Accordeon, galerie: Galerie } };
export default function HomeBloc({ k, v, all = [], cats = [], featured = [] }) {
  const objs = useObjs(all, cats);
  const C = VIEWS[k]?.[v];
  if (!C || !objs.length) return null;
  return <C objs={objs} cats={cats} featured={featured} />;
}

/* ---------- La une en affiche (Séance) : plein écran ---------- */
export function UneAffiche({ hero, all, cats, catLabel, onOpen, onAmbiance, admin }) {
  const objs = useObjs(all, cats);
  const o = objs.find((x) => x.id === hero.id);
  const img = hero.has_poster ? posterUrl(hero.id, hero.updated_at, 900) : hero.has_bg ? bgUrl(hero.id, hero.updated_at) : "";
  return (
    <section className="hb-affiche" data-testid="bloc-une-affiche">
      <div className="af-in">
        <div className="af-meta mono">{catLabel}</div>
        <span className="af-kj" aria-hidden="true">{hero.kanji || o?.emblem}</span>
        <h1 className="af-title">{hero.title}</h1>
        <div className="af-stage">
          {o && <div className="af-obj"><Obj o={o} z={0.8} label={false} /></div>}
          <button type="button" className="af-img" onClick={onOpen} aria-label={hero.title}>{img && <img src={img} alt="" />}</button>
        </div>
        <div className="af-foot">
          {(hero.tagline || hero.synopsis) && <p>{hero.tagline || hero.synopsis}</p>}
          <div className="af-btns">
            <button type="button" className="af-btn f" onClick={onOpen}>Entrer dans l'univers</button>
            <button type="button" className="af-btn o" onClick={onAmbiance}>▷ Ambiance</button>
          </div>
          {admin}
        </div>
      </div>
    </section>
  );
}

/* ---------- La une en cinéma : l'image (ou la bande-annonce muette) derrière le titre, plein écran ---------- */
export function UneCinema({ hero, catLabel, onOpen, onAmbiance, admin }) {
  const img = hero.has_bg ? bgUrl(hero.id, hero.updated_at) : hero.has_poster ? posterUrl(hero.id, hero.updated_at, 900) : "";
  const vid = hero.has_trailer ? videoUrl(hero.id, "trailer", hero.updated_at) : /\.(mp4|webm)(\?|$)/i.test(hero.trailer_url || "") ? hero.trailer_url : "";
  return (
    <section className="hb-cinema" data-testid="bloc-une-cinema">
      <div className="cn-media" onClick={onOpen}>
        {img && <img src={img} alt="" />}
        {vid && <video src={vid} poster={img || undefined} autoPlay muted loop playsInline />}
      </div>
      <div className="cn-shade" aria-hidden="true" />
      <div className="cn-in">
        <div className="mono cn-meta">{catLabel}</div>
        <h1 className="cn-title">{hero.title}</h1>
        {(hero.tagline || hero.synopsis) && <p className="cn-sub">{hero.tagline || hero.synopsis}</p>}
        <div className="af-btns">
          <button type="button" className="af-btn f" onClick={onOpen}>Entrer dans l'univers</button>
          <button type="button" className="af-btn o" onClick={onAmbiance}>▷ Ambiance</button>
        </div>
        {admin}
      </div>
      <span className="cn-scroll mono" aria-hidden="true">Défiler ↓</span>
    </section>
  );
}
