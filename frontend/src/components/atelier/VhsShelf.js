import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { IoAdd, IoClose, IoCloudUploadOutline, IoTrashOutline, IoPlay, IoArrowUp, IoArrowDown, IoSearch, IoListOutline } from "react-icons/io5";
import { atelierApi, imgSrc } from "@/lib/atelier";
import { useApp } from "@/context/AppContext";
import { playLaunch, getLaunchSound, useLaunchSync } from "@/lib/launchSound";
import { pressMenu } from "@/components/atelier/ContextMenu";
import Box3D from "@/components/nexus/Box3D";
import { Face } from "@/components/atelier/Alexandrie";
import { vidOf } from "@/components/atelier/Cinema";
import { ArtSearch } from "@/components/journal/BlocksEditor";
import "@/components/atelier/alexandrie.css";
import "@/components/nexus/nexus.css";
import "@/components/atelier/vhsShelf.css";

/*
  La vidéothèque du Salon : des films et des séries rangés en cassettes VHS.
  Un clic : la cassette entre dans le magnétoscope (le son de lancement « VHS »), puis ton lecteur s'ouvre.
  Une série enchaîne ses épisodes. Rangé dans les fiches de l'atelier (records « vhs »).
*/
const ytThumb = (u) => { const v = vidOf(u || ""); return v ? `https://i.ytimg.com/vi/${v}/hqdefault.jpg` : ""; };
const coverOf = (r) => (r.cover ? imgSrc(r.cover) : ytThumb(r.url || r.eps?.[0]?.url || r.playlist));
const listOf = (u = "") => (u.match(/[?&]list=([\w-]+)/) || [])[1];
const URLS = (t = "") => t.match(/https?:\/\/[^\s,;]+/g) || [];
const isSerieEmpty = (r) => !(r.playlist || r.eps?.length);

export default function VhsShelf({ at, launch, links = [] }) {
  const { uiVolume = 0.6, muted } = useApp() || {};
  useLaunchSync();
  const tapes = (at.records || []).filter((r) => r.rk === "vhs").sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.created_at).localeCompare(String(b.created_at)));
  const [edit, setEdit] = useState(null);
  const [going, setGoing] = useState(null);

  const play = (r) => {
    if (r.kind === "serie" ? isSerieEmpty(r) : !r.url) { toast.info("Cette cassette est vide : ajoute un lien."); setEdit(r); return; }
    playLaunch(muted ? 0 : uiVolume, getLaunchSound("vhs"));
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return start(r);
    setGoing(r);
  };
  const start = (r, k = 0) => {
    setGoing(null);
    if (r.kind === "serie" && r.playlist && !r.eps?.length) launch({ title: r.title, url: r.playlist });
    else if (r.kind === "serie") launch({ title: r.eps[k]?.title || r.title, url: r.eps[k].url, queue: r.eps.map((e) => ({ title: e.title, url: e.url })), qi: k });
    else launch({ title: r.title, url: r.url });
  };
  useEffect(() => { if (!going) return; const t = setTimeout(() => start(going), 1700); return () => clearTimeout(t); }, [going]); // eslint-disable-line react-hooks/exhaustive-deps

  const box = (r) => ({ id: r.id, title: r.title || "Sans titre", sub: r.kind === "serie" ? (r.eps?.length ? `${r.eps.length} épisodes` : "Playlist") : (r.year || "Film"), format: "vhs", emblem: r.kanji || (r.kind === "serie" ? "連" : "映"), cote: r.kind === "serie" ? "SÉRIE" : "FILM", roomLabel: "Salon", house: "VIDÉOTHÈQUE" });
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
            <b>{r.title}</b><small>{r.kind === "serie" ? (r.eps?.length ? `Série · ${r.eps.length} ép.` : "Série · playlist") : "Film"}</small>
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
  const [d, setD] = useState({ ...r, eps: (r.eps || []).map((e, i) => ({ ...e, k: i + "-" + Math.random() })), src: r.playlist && !r.eps?.length ? "playlist" : "eps" });
  const [busy, setBusy] = useState(false);
  const set = (p) => setD((o) => ({ ...o, ...p }));
  const addEps = (list) => set({ eps: [...d.eps, ...list.map((e) => ({ ...e, k: Math.random().toString(36).slice(2) }))] });
  const setEp = (i, p) => set({ eps: d.eps.map((e, k) => (k === i ? { ...e, ...p } : e)) });
  const moveEp = (i, dir) => { const e = [...d.eps]; const j = i + dir; if (j < 0 || j >= e.length) return; [e[i], e[j]] = [e[j], e[i]]; set({ eps: e }); };
  const save = async () => {
    const eps = d.kind === "serie" && d.src === "eps" ? d.eps.filter((e) => e.url?.trim()).map((e, i) => ({ title: e.title?.trim() || `Épisode ${i + 1}`, url: e.url.trim() })) : [];
    if (!d.title.trim()) { toast.error("Donne un titre à la cassette"); return; }
    if (d.kind === "film" && !d.url?.trim()) { toast.error("Colle le lien du film"); return; }
    if (d.kind === "serie" && d.src === "eps" && !eps.length) { toast.error("Ajoute au moins un épisode"); return; }
    if (d.kind === "serie" && d.src === "playlist" && !listOf(d.playlist || "")) { toast.error("Colle le lien d'une playlist YouTube (il contient « list= »)"); return; }
    const { src, ...rest } = d; // eslint-disable-line no-unused-vars
    await at.saveRecord("vhs", { ...rest, title: d.title.trim(), url: d.kind === "film" ? d.url.trim() : "", eps, playlist: d.kind === "serie" && d.src === "playlist" ? d.playlist.trim() : "" });
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
        {d.kind === "film" && <>
          <label>Lien du film<input value={d.url || ""} onChange={(e) => set({ url: e.target.value })} placeholder="Lien YouTube (non répertorié) ou d'un fichier vidéo" data-testid="vhs-url" /></label>
          <EpFinder label="ou chercher le film sur YouTube" one onAdd={([e]) => set({ url: e.url, title: d.title || e.title })} />
        </>}
        {d.kind === "serie" && <>
          <div className="vh-src">{[["eps", "Épisode par épisode"], ["playlist", "Une playlist YouTube"]].map(([k, t]) => <button key={k} className={d.src === k ? "on" : ""} onClick={() => set({ src: k })} data-testid={`vhs-src-${k}`}>{t}</button>)}</div>
          {d.src === "playlist"
            ? <label>Lien de la playlist <small>tous les épisodes d'un coup, dans l'ordre de la playlist</small><input value={d.playlist || ""} onChange={(e) => set({ playlist: e.target.value })} placeholder="https://www.youtube.com/playlist?list=…" data-testid="vhs-playlist" /></label>
            : <>
              <div className="vh-eps" data-testid="vhs-eps">
                {d.eps.length === 0 && <p className="vh-eps-empty">Aucun épisode. Cherche-les sur YouTube, colle un ou plusieurs liens d'un coup, ou prends-les dans le Salon.</p>}
                {d.eps.map((e, i) => (
                  <div key={e.k} className="vh-ep" data-testid={`vhs-ep-${i}`}>
                    <span className="vh-ep-n mono">{String(i + 1).padStart(2, "0")}</span>
                    <span className="vh-ep-th" style={ytThumb(e.url) ? { backgroundImage: `url(${ytThumb(e.url)})` } : undefined} />
                    <span className="vh-ep-f"><input value={e.title || ""} onChange={(ev) => setEp(i, { title: ev.target.value })} placeholder={`Épisode ${i + 1}`} aria-label="Titre de l'épisode" /><input value={e.url || ""} onChange={(ev) => setEp(i, { url: ev.target.value })} placeholder="Lien" aria-label="Lien de l'épisode" className="url" /></span>
                    <span className="vh-ep-a"><button onClick={() => moveEp(i, -1)} aria-label="Monter"><IoArrowUp size={13} /></button><button onClick={() => moveEp(i, 1)} aria-label="Descendre"><IoArrowDown size={13} /></button><button onClick={() => set({ eps: d.eps.filter((_, k) => k !== i) })} aria-label="Retirer"><IoTrashOutline size={13} /></button></span>
                  </div>
                ))}
              </div>
              <EpFinder label="Ajouter des épisodes : chercher sur YouTube, ou coller un ou plusieurs liens" next={d.eps.length} onAdd={addEps} />
            </>}
        </>}
        {fromSalon.length > 0 && !(d.kind === "serie" && d.src === "playlist") && (
          <details className="vh-from"><summary>Prendre {d.kind === "film" ? "une vidéo" : "des épisodes"} du Salon</summary>
            <div>{fromSalon.slice(0, 40).map((l) => <button key={l.id} onClick={() => (d.kind === "film" ? set({ url: l.url, title: d.title || l.title }) : addEps([{ title: l.title, url: l.url }]))}>{d.kind === "serie" && <IoAdd size={11} />} {l.title}</button>)}</div>
          </details>
        )}
        <div className="vh-cover">
          <span className="vh-cover-prev vh-face"><Face b={{ id: "p", title: d.title || "Titre", sub: "", format: "vhs", emblem: d.kind === "serie" ? "連" : "映", cote: d.kind === "serie" ? "SÉRIE" : "FILM", roomLabel: "Salon", house: "VIDÉOTHÈQUE" }} cover={coverOf(d)} /></span>
          <div>
            <p>La jaquette : la miniature de la vidéo par défaut, ou ton image.</p>
            <ArtSearch term={d.title} label="Chercher un artwork" onPick={(u) => set({ cover: u })} />
            <label className="at-btn ghost vh-up"><IoCloudUploadOutline size={15} /> {busy ? "Envoi…" : "Choisir une image"}<input hidden type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; upload(f); }} /></label>
            <input value={d.cover || ""} onChange={(e) => set({ cover: e.target.value })} placeholder="ou le lien d'une image" />
          </div>
        </div>
        <div className="vh-acts"><button className="at-btn ghost" onClick={onClose}>Annuler</button><button className="at-btn" onClick={save} data-testid="vhs-save">{r.id ? "Enregistrer" : "Ranger sur l'étagère"}</button></div>
      </div>
    </div>
  );
}

// Trouver des épisodes : une recherche YouTube (on ajoute un par un ou tout), ou des liens collés (un ou plusieurs d'un coup)
function EpFinder({ onAdd, label, next = 0, one = false }) {
  const [q, setQ] = useState(""); const [res, setRes] = useState(null); const [busy, setBusy] = useState(false); const [added, setAdded] = useState([]);
  const fromUrls = (t) => { const us = URLS(t); if (!us.length) return false; onAdd(us.map((u, i) => ({ title: one ? "" : `Épisode ${next + i + 1}`, url: u }))); setQ(""); toast.success(us.length > 1 ? `${us.length} épisodes ajoutés` : one ? "Lien posé" : "Épisode ajouté"); return true; };
  const go = async (e) => {
    e?.preventDefault(); const t = q.trim(); if (!t) return;
    if (fromUrls(t)) return;
    setBusy(true); try { setRes(await atelierApi.ytSearch(t)); setAdded([]); } catch (_) { setRes([]); } setBusy(false);
  };
  const pick = (v) => { onAdd([{ title: v.title, url: `https://www.youtube.com/watch?v=${v.id}` }]); setAdded((a) => [...a, v.id]); if (one) setRes(null); };
  return (
    <div className="vh-find" data-testid="vhs-find">
      <form onSubmit={go}><IoSearch size={15} />
        <input value={q} onChange={(e) => setQ(e.target.value)} onPaste={(e) => { const t = e.clipboardData.getData("text"); if (URLS(t).length) { e.preventDefault(); fromUrls(t); } }} placeholder={label} data-testid="vhs-find-in" />
        <button className="at-btn ghost" type="submit" disabled={busy}>{busy ? "…" : "OK"}</button>
      </form>
      {res && (
        <div className="vh-res">
          {!one && res.length > 1 && <button className="vh-res-all" onClick={() => { const rest = res.filter((v) => !added.includes(v.id)); onAdd(rest.map((v) => ({ title: v.title, url: `https://www.youtube.com/watch?v=${v.id}` }))); setAdded(res.map((v) => v.id)); }}><IoListOutline size={13} /> Tout ajouter dans cet ordre</button>}
          {res.slice(0, 12).map((v) => (
            <button key={v.id} className={added.includes(v.id) ? "on" : ""} onClick={() => pick(v)} disabled={added.includes(v.id)} data-testid={`vhs-res-${v.id}`}>
              <span style={{ backgroundImage: `url(https://i.ytimg.com/vi/${v.id}/mqdefault.jpg)` }} /><b>{v.title}</b><small>{added.includes(v.id) ? "Ajouté" : (v.length || "")}</small>
            </button>))}
          {!res.length && <p className="vh-eps-empty">Aucun résultat.</p>}
          <button className="vh-res-x" onClick={() => setRes(null)}><IoClose size={13} /> Fermer la recherche</button>
        </div>
      )}
    </div>
  );
}
