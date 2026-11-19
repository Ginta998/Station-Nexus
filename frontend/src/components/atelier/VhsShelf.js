import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { IoAdd, IoClose, IoCloudUploadOutline, IoTrashOutline, IoPlay } from "react-icons/io5";
import { atelierApi, imgSrc } from "@/lib/atelier";
import { useApp } from "@/context/AppContext";
import { playLaunch, getLaunchSound } from "@/lib/launchSound";
import { pressMenu } from "@/components/atelier/ContextMenu";
import Box3D from "@/components/nexus/Box3D";
import { Face } from "@/components/atelier/Alexandrie";
import { vidOf } from "@/components/atelier/Cinema";
import "@/components/atelier/alexandrie.css";
import "@/components/nexus/nexus.css";
import "@/components/atelier/vhsShelf.css";

/*
  La vidéothèque du Salon : des films et des séries rangés en cassettes VHS.
  Un clic : la cassette entre dans le magnétoscope (le son de lancement « VHS »), puis ton lecteur s'ouvre.
  Une série enchaîne ses épisodes. Rangé dans les fiches de l'atelier (records « vhs »).
*/
const ytThumb = (u) => { const v = vidOf(u || ""); return v ? `https://i.ytimg.com/vi/${v}/hqdefault.jpg` : ""; };
const coverOf = (r) => (r.cover ? imgSrc(r.cover) : ytThumb(r.url || r.eps?.[0]?.url));
const linesToEps = (txt) => txt.split("\n").map((l) => l.trim()).filter(Boolean).map((l, i) => { const m = l.match(/^(.*?)\s*[|·]\s*(https?:\/\/\S+)$/); return m ? { title: m[1], url: m[2] } : { title: `Épisode ${i + 1}`, url: l }; });
const epsToLines = (eps = []) => eps.map((e) => (e.title ? `${e.title} | ${e.url}` : e.url)).join("\n");

export default function VhsShelf({ at, launch, links = [] }) {
  const { uiVolume = 0.6, muted } = useApp() || {};
  const tapes = (at.records || []).filter((r) => r.rk === "vhs").sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.created_at).localeCompare(String(b.created_at)));
  const [edit, setEdit] = useState(null);
  const [going, setGoing] = useState(null);

  const play = (r) => {
    if (!(r.kind === "serie" ? r.eps?.length : r.url)) { toast.info("Cette cassette est vide : ajoute un lien."); setEdit(r); return; }
    playLaunch(muted ? 0 : uiVolume, getLaunchSound("vhs"));
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return start(r);
    setGoing(r);
  };
  const start = (r, k = 0) => {
    setGoing(null);
    if (r.kind === "serie") launch({ title: r.eps[k]?.title || r.title, url: r.eps[k].url, queue: r.eps.map((e) => ({ title: e.title, url: e.url })), qi: k });
    else launch({ title: r.title, url: r.url });
  };
  useEffect(() => { if (!going) return; const t = setTimeout(() => start(going), 1700); return () => clearTimeout(t); }, [going]); // eslint-disable-line react-hooks/exhaustive-deps

  const box = (r) => ({ id: r.id, title: r.title || "Sans titre", sub: r.kind === "serie" ? `${r.eps?.length || 0} épisodes` : (r.year || "Film"), format: "vhs", emblem: r.kanji || (r.kind === "serie" ? "連" : "映"), cote: r.kind === "serie" ? "SÉRIE" : "FILM", roomLabel: "Salon", house: "VIDÉOTHÈQUE" });
  const menuFor = (r) => () => ({ title: r.title, entries: [
    { label: "Lire", icon: <IoPlay size={14} />, onClick: () => play(r) },
    ...(r.kind === "serie" ? (r.eps || []).slice(0, 30).map((e, k) => ({ label: `   ${k + 1}. ${e.title || "Épisode " + (k + 1)}`, onClick: () => start(r, k) })) : []),
    { label: "Modifier la cassette", onClick: () => setEdit(r) },
    "-",
    { label: "Retirer de la vidéothèque", danger: true, icon: <IoTrashOutline size={14} />, onClick: async () => { await at.removeRecord("vhs", r.id); toast.success("Cassette retirée"); } },
  ] });

  return (
    <section className="sx-row vh-row" data-testid="atelier-salon-vhs">
      <div className="vh-head">
        <h3>Vidéothèque <small>{tapes.length ? `${tapes.length} cassette${tapes.length > 1 ? "s" : ""}` : "films et séries en VHS"}</small></h3>
        <button className="at-btn ghost" onClick={() => setEdit({ kind: "film", title: "", url: "", eps: [] })} data-testid="vhs-new"><IoAdd size={15} /> Nouvelle cassette</button>
      </div>
      {tapes.length === 0
        ? <p className="vh-empty">Range ici tes films et tes séries : chacun devient une cassette VHS sur l'étagère. Un clic la glisse dans le magnétoscope et ton lecteur s'ouvre. Une série enchaîne ses épisodes.</p>
        : <div className="vh-shelf">{tapes.map((r) => (
          <button key={r.id} className="vh-tape" onClick={() => play(r)} {...pressMenu(menuFor(r))} data-testid={`vhs-${r.id}`} title={r.title}>
            <span className="vh-face"><Face b={box(r)} cover={coverOf(r)} /></span>
            <b>{r.title}</b><small>{r.kind === "serie" ? `Série · ${r.eps?.length || 0} ép.` : "Film"}</small>
          </button>))}
        </div>}
      <span className="vh-plank" aria-hidden="true" />

      {edit && <VhsEdit at={at} r={edit} links={links} onClose={() => setEdit(null)} />}
      {going && createPortal(
        <div className="nx-launchfx f-vhs vh-go" onClick={() => start(going)} role="status" aria-label={`Lecture de ${going.title}`} data-testid="vhs-launch">
          <i className="nx-lf-glow" aria-hidden="true" />
          <div className="nx-lf-obj"><Box3D b={box(going)} cover={coverOf(going)} /></div>
          <p className="nx-lf-t"><span className="mono">▶ PLAY</span>{going.title}</p>
          <small className="mono nx-lf-skip">TOUCHE OU CLIC POUR PASSER</small>
        </div>, document.body
      )}
    </section>
  );
}

function VhsEdit({ at, r, links, onClose }) {
  const [d, setD] = useState({ ...r, epsTxt: epsToLines(r.eps) });
  const [busy, setBusy] = useState(false);
  const set = (p) => setD((o) => ({ ...o, ...p }));
  const save = async () => {
    const eps = d.kind === "serie" ? linesToEps(d.epsTxt || "") : [];
    if (!d.title.trim()) { toast.error("Donne un titre à la cassette"); return; }
    if (d.kind === "film" && !d.url.trim()) { toast.error("Colle le lien du film"); return; }
    if (d.kind === "serie" && !eps.length) { toast.error("Ajoute au moins un épisode (un lien par ligne)"); return; }
    const { epsTxt, ...rest } = d; // eslint-disable-line no-unused-vars
    await at.saveRecord("vhs", { ...rest, title: d.title.trim(), url: d.kind === "film" ? d.url.trim() : "", eps });
    toast.success(r.id ? "Cassette modifiée" : "Cassette rangée sur l'étagère"); onClose();
  };
  const upload = async (f) => { if (!f) return; setBusy(true); try { const x = await atelierApi.upload(f); set({ cover: x.url || x.path || x.id }); } catch (_) { toast.error("Image non envoyée"); } setBusy(false); };
  const fromSalon = links.filter((l) => vidOf(l.url) || /\.(mp4|webm|mov)(\?|$)/i.test(l.url));
  return (
    <div className="sx-pick" onClick={onClose} data-testid="vhs-edit">
      <div className="box vh-edit" onClick={(e) => e.stopPropagation()}>
        <div className="h"><b>{r.id ? "Modifier la cassette" : "Nouvelle cassette"}</b><button className="at-icon" onClick={onClose}><IoClose size={16} /></button></div>
        <div className="vh-kind">{[["film", "Film", "Un seul lien"], ["serie", "Série", "Des épisodes qui s'enchaînent"]].map(([k, t, s]) => <button key={k} className={d.kind === k ? "on" : ""} onClick={() => set({ kind: k })} data-testid={`vhs-kind-${k}`}><b>{t}</b><small>{s}</small></button>)}</div>
        <label>Titre<input value={d.title} onChange={(e) => set({ title: e.target.value })} placeholder="Akira, Cowboy Bebop…" autoFocus data-testid="vhs-title" /></label>
        {d.kind === "film"
          ? <label>Lien du film<input value={d.url} onChange={(e) => set({ url: e.target.value })} placeholder="YouTube, ou un fichier vidéo" data-testid="vhs-url" /></label>
          : <label>Épisodes <small>un lien par ligne · « Titre | lien » pour nommer l'épisode</small><textarea rows={6} value={d.epsTxt} onChange={(e) => set({ epsTxt: e.target.value })} placeholder={"Épisode 1 | https://youtu.be/…\nhttps://youtu.be/…"} data-testid="vhs-eps" /></label>}
        {fromSalon.length > 0 && (
          <details className="vh-from"><summary>Prendre une vidéo du Salon</summary>
            <div>{fromSalon.slice(0, 40).map((l) => <button key={l.id} onClick={() => (d.kind === "film" ? set({ url: l.url, title: d.title || l.title }) : set({ epsTxt: (d.epsTxt ? d.epsTxt + "\n" : "") + `${l.title} | ${l.url}` }))}>{l.title}</button>)}</div>
          </details>
        )}
        <div className="vh-cover">
          <span className="vh-cover-prev vh-face"><Face b={{ id: "p", title: d.title || "Titre", sub: "", format: "vhs", emblem: d.kind === "serie" ? "連" : "映", cote: d.kind === "serie" ? "SÉRIE" : "FILM", roomLabel: "Salon", house: "VIDÉOTHÈQUE" }} cover={coverOf({ ...d, eps: linesToEps(d.epsTxt || "") })} /></span>
          <div>
            <p>La jaquette : la miniature de la vidéo par défaut, ou ton image.</p>
            <label className="at-btn ghost vh-up"><IoCloudUploadOutline size={15} /> {busy ? "Envoi…" : "Choisir une image"}<input hidden type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; upload(f); }} /></label>
            <input value={d.cover || ""} onChange={(e) => set({ cover: e.target.value })} placeholder="ou le lien d'une image" />
          </div>
        </div>
        <div className="vh-acts"><button className="at-btn ghost" onClick={onClose}>Annuler</button><button className="at-btn" onClick={save} data-testid="vhs-save">{r.id ? "Enregistrer" : "Ranger sur l'étagère"}</button></div>
      </div>
    </div>
  );
}
