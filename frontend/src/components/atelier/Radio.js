import { useEffect, useRef, useState } from "react";
import { IoPlay, IoPause, IoPlaySkipForward, IoPlaySkipBack, IoShuffle, IoRadioOutline, IoVolumeHigh, IoVolumeMute, IoClose, IoAdd, IoTrashOutline, IoImageOutline, IoInfinite, IoListOutline, IoPencil, IoSearch, IoCheckmark, IoLogoYoutube } from "react-icons/io5";
import { toast } from "sonner";
import { uploadJournalImage } from "@/lib/api";
import { imgSrc, useMediaClaim, atelierApi } from "@/lib/atelier";
import "@/components/atelier/radio.css";

const ORIGIN = typeof window !== "undefined" ? window.location.origin : "";
const listOf = (u = "") => (u.match(/[?&]list=([\w-]+)/) || [])[1];
const vidOf = (u = "") => (u.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/) || [])[1];
const thumb = (v, q = "hqdefault") => (v ? `https://i.ytimg.com/vi/${v}/${q}.jpg` : "");
export const coverOf = (p) => (p?.cover ? imgSrc(p.cover) : p?.thumb || thumb(vidOf(p?.url)));
const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const saved = (id) => { try { return JSON.parse(localStorage.getItem("nx-radio:" + id)) || {}; } catch (_) { return {}; } };

function srcFor(p) {
  const l = listOf(p.url); const v = vidOf(p.url); const s = saved(p.id);
  const q = `autoplay=1&enablejsapi=1&playsinline=1&rel=0&origin=${encodeURIComponent(ORIGIN)}${s.t > 5 ? `&start=${Math.floor(s.t)}` : ""}`;
  if (l) return `https://www.youtube.com/embed/${v && !s.i ? v : "videoseries"}?list=${l}${s.i ? `&index=${s.i}` : ""}&${q}`;
  return v ? `https://www.youtube.com/embed/${v}?${q}` : "";
}

export function useRadio(at) {
  const list = at.config.radio || [];
  const fr = useRef(null);
  const [pl, setPl] = useState(null);
  const [info, setInfo] = useState({});
  const [station, setStation] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [vol, setVol] = useState(80);
  const [muted, setMuted] = useState(false);
  const cmd = (func, args = []) => { try { fr.current.contentWindow.postMessage(JSON.stringify({ event: "command", func, args }), "*"); } catch (_) {} };
  const play = (p) => { const src = srcFor(p); if (!src) return toast.error("Lien YouTube invalide"); setInfo({}); setPl({ ...p, src }); };
  const playAt = (p, k) => { if (pl?.id === p.id) return cmd("playVideoAt", [k]); live.current.skipRand = true; try { localStorage.setItem("nx-radio:" + p.id, JSON.stringify({ i: k, t: 0 })); } catch (_) {} play(p); };
  const nextPl = () => { if (!list.length) return; const i = list.findIndex((x) => x.id === pl?.id); play(list[shuffle ? Math.floor(Math.random() * list.length) : (i + 1) % list.length]); };
  const live = useRef({});
  const r = { live: live.current, list, pl, info, station, shuffle, vol, muted, fr, cmd, play, playAt, nextPl, setStation,
    playing: info.state === 1,
    toggle: () => cmd(info.state === 1 ? "pauseVideo" : "playVideo"),
    pause: () => pl && cmd("pauseVideo"),
    next: () => (shuffle && info.n > 1 ? cmd("playVideoAt", [Math.floor(Math.random() * info.n)]) : cmd("nextVideo")),
    prev: () => (info.t > 4 ? cmd("seekTo", [0, true]) : cmd("previousVideo")),
    jump: (k) => cmd("playVideoAt", [k]),
    seek: (t) => cmd("seekTo", [t, true]),
    setShuffle,
    setVol: (v) => { setVol(v); setMuted(false); cmd("setVolume", [v]); cmd("unMute"); },
    mute: () => { cmd(muted ? "unMute" : "mute"); setMuted(!muted); },
    stop: () => { setPl(null); setInfo({}); },
    save: (l) => at.saveConfig({ radio: l }),
  };
  Object.assign(live.current, r);
  useEffect(() => {
    const on = (m) => {
      if (!fr.current || m.source !== fr.current.contentWindow) return;
      let d; try { d = JSON.parse(m.data); } catch (_) { return; }
      const c = live.current;
      if (d.event === "onReady") { c.ready = true; c.cmd("setVolume", [c.vol]); c.cmd("playVideo"); return; }
      const x = d.info; if (!x) return;
      setInfo((o) => {
        const n = { ...o };
        if (x.playerState != null) n.state = x.playerState;
        if (x.currentTime != null) n.t = x.currentTime;
        if (x.duration) n.d = x.duration;
        if (x.videoData?.video_id) { n.vid = x.videoData.video_id; n.title = x.videoData.title; n.author = x.videoData.author; }
        if (x.playlistIndex != null) n.i = x.playlistIndex;
        if (Array.isArray(x.playlist)) { n.n = x.playlist.length; n.ids = x.playlist; }
        return n;
      });
      if (c.pl && x.currentTime > 5) { try { localStorage.setItem("nx-radio:" + c.pl.id, JSON.stringify({ i: c.info.i || 0, t: x.currentTime })); } catch (_) {} }
      if (Array.isArray(x.playlist) && c.shuffle && c.randOnce !== c.pl?.src && x.playlist.length > 1) { c.randOnce = c.pl.src; if (c.skipRand) c.skipRand = false; else c.cmd("playVideoAt", [Math.floor(Math.random() * x.playlist.length)]); }
      if (x.playerState === 0 && c.shuffle && !c.station && (c.info.n || 0) > 1) { c.cmd("playVideoAt", [Math.floor(Math.random() * c.info.n)]); return; }
      if (x.playerState === 0 && c.station && (c.info.i == null || c.info.i >= (c.info.n || 1) - 1)) { try { localStorage.removeItem("nx-radio:" + c.pl.id); } catch (_) {} c.nextPl(); }
    };
    window.addEventListener("message", on); return () => window.removeEventListener("message", on);
  }, []);
  useEffect(() => {
    if (pl && !pl.cover && !pl.thumb && info.vid) at.saveConfig({ radio: list.map((x) => (x.id === pl.id ? { ...x, thumb: thumb(info.vid) } : x)) });
  }, [info.vid]); // eslint-disable-line
  useEffect(() => { if (pl && info.ids?.length) { try { localStorage.setItem("nx-radio-ids:" + pl.id, JSON.stringify(info.ids)); } catch (_) {} } }, [pl?.id, info.ids?.length]); // eslint-disable-line
  return r;
}

// L'API YouTube ne répond qu'après "listening" : on insiste jusqu'à onReady, sinon les clics sont perdus
const hello = (r) => {
  const live = r.live; live.ready = false; let n = 0;
  const go = () => { if (live.ready || n++ > 40 || !r.fr.current) return; try { r.fr.current.contentWindow.postMessage(JSON.stringify({ event: "listening", id: "rd" }), "*"); } catch (_) {} setTimeout(go, 250); };
  go();
};

export function RadioEngine({ radio: r }) {
  useMediaClaim(!!r.pl && r.info.state !== 2 && r.info.state !== 0);
  if (!r.pl) return null;
  return <iframe key={r.pl.src} ref={r.fr} className="rd-engine" src={r.pl.src} title="Radio Nexus" allow="autoplay; encrypted-media" referrerPolicy="strict-origin-when-cross-origin" onLoad={() => hello(r)} />;
}

export function RadioBar({ radio: r, onOpen }) {
  const i = r.info;
  const [q, setQ] = useState(false);
  if (!r.pl) return null;
  return (
    <div className="rd-bar" style={{ "--rc": r.pl.color || "var(--brand)" }} data-testid="radio-bar">
      {q && <div className="rd-qpop" data-testid="radio-queue-pop"><Queue r={r} /></div>}
      <button className="rd-bar-now" onClick={onOpen} data-testid="radio-bar-open">
        <span className="rd-bar-art" style={{ backgroundImage: `url(${thumb(i.vid) || coverOf(r.pl)})` }} />
        <span className="rd-bar-txt"><b>{i.title || r.pl.title}</b><small>{i.author ? `${i.author} · ` : ""}{r.pl.title}</small></span>
      </button>
      <div className="rd-bar-mid">
        <Controls r={r} small />
        <Progress r={r} />
      </div>
      <div className="rd-bar-r">
        <button className={"rd-ic" + (q ? " on" : "")} onClick={() => setQ(!q)} title="File d'attente" data-testid="radio-queue-toggle"><IoListOutline size={18} /></button>
        <button className="rd-ic" onClick={r.mute} data-testid="radio-mute">{r.muted ? <IoVolumeMute size={17} /> : <IoVolumeHigh size={17} />}</button>
        <input className="rd-vol" type="range" min="0" max="100" value={r.muted ? 0 : r.vol} onChange={(e) => r.setVol(+e.target.value)} style={{ "--p": (r.muted ? 0 : r.vol) + "%" }} data-testid="radio-volume" />
        <button className="rd-ic" onClick={r.stop} title="Couper la radio" data-testid="radio-stop"><IoClose size={18} /></button>
      </div>
    </div>
  );
}

function Controls({ r, small }) {
  const s = small ? 18 : 22;
  return (
    <div className={"rd-ctrl" + (small ? " sm" : "")}>
      <button className={"rd-ic" + (r.shuffle ? " on" : "")} onClick={() => r.setShuffle(!r.shuffle)} title="Aléatoire" data-testid="radio-shuffle"><IoShuffle size={s - 2} /></button>
      <button className="rd-ic" onClick={r.prev} title="Précédent" data-testid="radio-prev"><IoPlaySkipBack size={s} /></button>
      <button className="rd-play" onClick={r.toggle} data-testid="radio-toggle">{r.playing ? <IoPause size={s + 2} /> : <IoPlay size={s + 2} />}</button>
      <button className="rd-ic" onClick={r.next} title="Suivant" data-testid="radio-next"><IoPlaySkipForward size={s} /></button>
      <button className={"rd-ic" + (r.station ? " on" : "")} onClick={() => r.setStation(!r.station)} title="Mode Station : enchaîne tes playlists" data-testid="radio-station"><IoInfinite size={s} /></button>
    </div>
  );
}

function Progress({ r }) {
  const { t = 0, d = 0 } = r.info;
  return (
    <div className="rd-prog">
      <span className="mono">{fmt(t)}</span>
      <input type="range" min="0" max={d || 1} step="1" value={Math.min(t, d || 1)} onChange={(e) => r.seek(+e.target.value)} style={{ "--p": (d ? (t / d) * 100 : 0) + "%" }} data-testid="radio-seek" />
      <span className="mono">{fmt(d)}</span>
    </div>
  );
}

export default function RadioView({ radio: r }) {
  const [adding, setAdding] = useState(false);
  const [yt, setYt] = useState(false);
  const [edit, setEdit] = useState(null);
  const cur = r.pl; const i = r.info;
  const hero = cur ? thumb(i.vid) || coverOf(cur) : coverOf(r.list[0]);
  return (
    <section className="at-view rd-view" style={{ "--rc": cur?.color || r.list[0]?.color || "var(--brand)" }} data-testid="radio-view">
      <div className="rd-hero" style={{ "--art": hero ? `url(${hero})` : "none" }}>
        <div className="rd-hero-bg" />
        <div className="rd-hero-in">
          <span className="rd-hero-art" style={{ backgroundImage: `url(${cur ? thumb(i.vid) || coverOf(cur) : coverOf(r.list[0])})` }}>{!hero && <IoRadioOutline size={64} />}</span>
          <div className="rd-hero-txt">
            <p className="mono rd-eye"><span className={"rd-live" + (r.playing ? " on" : "")} /> {cur ? (r.playing ? "EN ONDE" : "EN PAUSE") : "RADIO NEXUS"}{r.station ? " · MODE STATION" : ""}</p>
            <h1 data-testid="radio-now-title">{cur ? i.title || cur.title : "Ta radio personnelle"}</h1>
            <p className="rd-sub">{cur ? `${i.author ? i.author + " · " : ""}${cur.title}${i.n ? ` · ${(i.i || 0) + 1}/${i.n}` : ""}` : `${r.list.length} playlist${r.list.length > 1 ? "s" : ""} · lance-en une ou laisse la Station choisir.`}</p>
            {cur ? <><Controls r={r} /><Progress r={r} /></> : (
              <div className="rd-hero-cta">
                <button className="rd-btn" disabled={!r.list.length} onClick={() => r.play(r.list[0])} data-testid="radio-start"><IoPlay size={18} /> Écouter</button>
                <button className="rd-btn ghost" disabled={!r.list.length} onClick={() => { r.setStation(true); r.setShuffle(true); r.play(r.list[Math.floor(Math.random() * r.list.length)]); }} data-testid="radio-start-station"><IoInfinite size={18} /> Mode Station</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rd-sec-h"><h2>Tes playlists</h2><div className="rd-sec-a"><button className={"rd-btn sm ghost" + (yt ? " on" : "")} onClick={() => { setYt((v) => !v); setAdding(false); }} data-testid="radio-yt-toggle"><IoSearch size={15} /> Chercher sur YouTube</button><button className="rd-btn sm" onClick={() => { setAdding(true); setYt(false); }} data-testid="radio-add"><IoAdd size={16} /> Ajouter un lien</button></div></div>
      {yt && <RadioYt r={r} />}
      {r.list.length > 0 && <SearchAll r={r} />}
      {adding && <AddForm r={r} onDone={() => setAdding(false)} />}
      {!r.list.length && !adding && <p className="rd-empty">Colle le lien d'une playlist YouTube (ou d'une vidéo) pour créer ta première station.</p>}
      <div className="rd-grid">
        {r.list.map((p, k) => <PlCard key={p.id} p={p} k={k} r={r} on={cur?.id === p.id} onEdit={() => setEdit(p)} />)}
      </div>
      {cur && i.ids?.length > 1 && <><div className="rd-sec-h"><h2>À suivre</h2></div><Queue r={r} /></>}
      {edit && <PlEditor p={edit} r={r} onClose={() => setEdit(null)} />}
    </section>
  );
}

const titles = (() => { try { return JSON.parse(localStorage.getItem("nx-yt-titles")) || {}; } catch (_) { return {}; } })();
const loadTitles = async (ids) => {
  const miss = [...new Set(ids.filter((v) => !titles[v]?.title))];
  for (let k = 0; k < miss.length; k += 100) {
    try { Object.assign(titles, await atelierApi.ytTitles(miss.slice(k, k + 100).join(","))); } catch (_) {}
  }
  try { localStorage.setItem("nx-yt-titles", JSON.stringify(titles)); } catch (_) {}
};
const norm = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const match = (v, q) => norm(`${titles[v]?.title} ${titles[v]?.author}`).includes(norm(q));

function SearchAll({ r }) {
  const [q, setQ] = useState(""); const [idx, setIdx] = useState(null); const [busy, setBusy] = useState(false);
  const prep = async () => {
    if (idx || busy) return; setBusy(true);
    const out = await Promise.all(r.list.map(async (p) => {
      let ids; try { ids = JSON.parse(localStorage.getItem("nx-radio-ids:" + p.id)); } catch (_) {}
      if (!ids?.length) { const l = listOf(p.url); ids = l ? await atelierApi.ytPlaylist(l).catch(() => []) : [vidOf(p.url)].filter(Boolean); }
      return { p, ids };
    }));
    await loadTitles(out.flatMap((x) => x.ids)); setIdx(out); setBusy(false);
  };
  const res = idx && q.trim().length > 1 ? idx.flatMap(({ p, ids }) => ids.map((v, k) => ({ p, v, k })).filter(({ v }) => match(v, q))).slice(0, 40) : [];
  return (
    <div className="rd-search">
      <input value={q} onFocus={prep} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un morceau dans toutes tes playlists…" data-testid="radio-search-all" />
      {busy && <p className="rd-empty">Indexation de tes playlists…</p>}
      {res.length > 0 && <ol className="rd-queue" data-testid="radio-search-results">{res.map(({ p, v, k }) => (
        <li key={p.id + v + k} onClick={() => r.playAt(p, k)}>
          <span className="n mono">{k + 1}</span><img src={thumb(v, "default")} alt="" loading="lazy" />
          <span className="t"><b>{titles[v]?.title}</b><small>{titles[v]?.author} · {p.title}</small></span>
        </li>))}</ol>}
      {idx && q.trim().length > 1 && !res.length && <p className="rd-empty">Aucun morceau trouvé.</p>}
    </div>
  );
}

// Recherche YouTube directement dans la radio : écoute en un clic ou ajoute à tes playlists.
function RadioYt({ r }) {
  const [q, setQ] = useState(""); const [res, setRes] = useState(null); const [busy, setBusy] = useState(false);
  const have = new Set(r.list.map((p) => vidOf(p.url)).filter(Boolean));
  const go = async (e) => { e.preventDefault(); if (!q.trim()) return; setBusy(true); try { setRes(await atelierApi.ytSearch(q.trim())); } catch (_) { toast.error("Recherche impossible"); } setBusy(false); };
  const playNow = (v) => r.play({ id: "yt" + v.id, url: `https://www.youtube.com/watch?v=${v.id}`, title: v.title, thumb: thumb(v.id) });
  const add = (v) => { if (have.has(v.id)) return; r.save([...r.list, { id: Date.now().toString(36), url: `https://www.youtube.com/watch?v=${v.id}`, title: v.title, thumb: thumb(v.id) }]); toast.success("Ajouté à la radio"); };
  return (
    <div className="rd-yt" data-testid="radio-ytsearch">
      <form className="rd-yt-form" onSubmit={go}><IoLogoYoutube size={18} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Un titre, un artiste, un mix lo-fi d'écriture…" data-testid="radio-ytsearch-input" />{res && <button type="button" className="rd-ic" onClick={() => { setRes(null); setQ(""); }}><IoClose size={16} /></button>}<button className="rd-btn sm" type="submit" disabled={busy} data-testid="radio-ytsearch-submit">{busy ? "…" : "Chercher"}</button></form>
      {res && <div className="rd-yt-grid">{res.map((v) => (
        <div key={v.id} className="rd-yt-card" data-testid={`radio-ytres-${v.id}`}>
          <span className="th" style={{ backgroundImage: `url(${thumb(v.id)})` }} onClick={() => playNow(v)}>{v.length && <em>{v.length}</em>}<span className="pl"><IoPlay size={20} /></span></span>
          <b title={v.title}>{v.title}</b><small>{v.author}{v.date ? ` · ${v.date}` : ""}</small>
          <button className={"rd-yt-add" + (have.has(v.id) ? " on" : "")} disabled={have.has(v.id)} onClick={() => add(v)} data-testid={`radio-ytadd-${v.id}`}>{have.has(v.id) ? <><IoCheckmark size={14} /> Dans la radio</> : <><IoAdd size={14} /> Ajouter</>}</button>
        </div>))}
        {!res.length && <p className="rd-empty">Aucun résultat.</p>}
      </div>}
    </div>
  );
}

function Queue({ r }) {
  const { ids = [], i = 0, vid } = r.info;
  const [, tick] = useState(0);
  const [q, setQ] = useState("");
  const box = useRef(null);
  useEffect(() => { loadTitles(ids).then(() => tick((x) => x + 1)); }, [ids.join(",")]); // eslint-disable-line
  useEffect(() => { if (!q) box.current?.querySelector(".on")?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [i, q]);
  if (!ids.length) return <p className="rd-empty">La file apparaît dès que la playlist joue.</p>;
  const rows = ids.map((v, k) => ({ v, k })).filter(({ v }) => !q.trim() || match(v, q));
  return (
    <>
      <input className="rd-qsearch" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher dans la file…" data-testid="radio-queue-search" />
      <ol className="rd-queue" ref={box} data-testid="radio-queue">
        {rows.map(({ v, k }) => (
          <li key={v + k} className={(v === vid ? "on" : "") + (k < i ? " past" : "")} onClick={() => r.jump(k)} data-testid={`radio-queue-item-${k}`}>
            <span className="n mono">{v === vid && r.playing ? <span className="rd-eq"><i /><i /><i /></span> : k + 1}</span>
            <img src={thumb(v, "default")} alt="" loading="lazy" />
            <span className="t"><b>{titles[v]?.title || "…"}</b><small>{titles[v]?.author || ""}</small></span>
          </li>
        ))}
      </ol>
    </>
  );
}

function PlEditor({ p, r, onClose }) {
  const [title, setTitle] = useState(p.title); const [color, setColor] = useState(p.color || "#3f86ff"); const [cover, setCover] = useState(p.cover || "");
  const file = useRef(null);
  const up = async (f) => { if (!f) return; try { setCover((await uploadJournalImage(f)).url); } catch (_) { toast.error("Envoi impossible"); } };
  const save = () => { r.save(r.list.map((x) => (x.id === p.id ? { ...x, title: title.trim() || x.title, color, cover } : x))); onClose(); };
  const c = cover ? imgSrc(cover) : p.thumb || thumb(vidOf(p.url));
  return (
    <div className="rd-modal" onClick={onClose} data-testid="radio-editor">
      <div className="rd-modal-in" onClick={(e) => e.stopPropagation()} style={{ "--rc": color }}>
        <div className="rd-cov" style={c ? { backgroundImage: `url(${c})` } : undefined} onClick={() => file.current?.click()}>
          {!c && <span className="rd-cov-k">{title.slice(0, 2)}</span>}
          <span className="rd-cov-edit"><IoImageOutline size={20} /> Changer</span>
        </div>
        <div className="rd-modal-f">
          <label>Nom<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} data-testid="radio-editor-title" /></label>
          <label>Couleur d'ambiance<span className="rd-colors">{["#3f86ff", "#ff3b5c", "#ffb020", "#2ecc8f", "#a35cff", "#ff6a3c", "#e2e7ef"].map((x) => <i key={x} className={x === color ? "on" : ""} style={{ background: x }} onClick={() => setColor(x)} />)}<input type="color" value={color} onChange={(e) => setColor(e.target.value)} data-testid="radio-editor-color" /></span></label>
          {cover && <button className="rd-btn ghost sm" onClick={() => setCover("")}>Retirer la couverture</button>}
          <div className="rd-modal-a"><button className="rd-btn ghost sm" onClick={onClose}>Annuler</button><button className="rd-btn sm" onClick={save} data-testid="radio-editor-save">Enregistrer</button></div>
        </div>
        <input ref={file} hidden type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; up(f); }} />
      </div>
    </div>
  );
}

function AddForm({ r, onDone }) {
  const [url, setUrl] = useState(""); const [title, setTitle] = useState("");
  const add = (e) => {
    e.preventDefault();
    if (!listOf(url) && !vidOf(url)) return toast.error("Colle un lien de playlist ou de vidéo YouTube");
    r.save([...r.list, { id: Date.now().toString(36), url: url.trim(), title: title.trim() || "Nouvelle playlist" }]); onDone();
  };
  return (
    <form className="rd-add" onSubmit={add} data-testid="radio-add-form">
      <input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Lien de la playlist YouTube" data-testid="radio-add-url" />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nom (ex. Lo-fi d'écriture)" data-testid="radio-add-title" />
      <button className="rd-btn sm" type="submit" data-testid="radio-add-save">Créer</button>
      <button className="rd-ic" type="button" onClick={onDone}><IoClose size={18} /></button>
    </form>
  );
}

function PlCard({ p, k, r, on, onEdit }) {
  const c = coverOf(p);
  return (
    <div className={"rd-card" + (on ? " on" : "")} style={{ animationDelay: `${k * 40}ms`, "--rc": p.color || "var(--brand)" }} onContextMenu={(e) => { e.preventDefault(); onEdit(); }} data-testid={`radio-pl-${p.id}`}>
      <div className="rd-cov" style={c ? { backgroundImage: `url(${c})` } : undefined} onClick={() => (on ? r.toggle() : r.play(p))}>
        {!c && <span className="rd-cov-k">{p.title.slice(0, 2)}</span>}
        <button className="rd-cov-play" data-testid={`radio-pl-play-${p.id}`}>{on && r.playing ? <IoPause size={22} /> : <IoPlay size={22} />}</button>
        {on && r.playing && <span className="rd-eq"><i /><i /><i /></span>}
      </div>
      <div className="rd-card-t" onDoubleClick={onEdit}>{p.title}</div>
      <div className="rd-card-a">
        <button className="rd-ic" onClick={onEdit} title="Modifier (ou clic droit)" data-testid={`radio-pl-edit-${p.id}`}><IoPencil size={14} /></button>
        <button className="rd-ic" onClick={() => { if (on) r.stop(); r.save(r.list.filter((x) => x.id !== p.id)); }} title="Supprimer" data-testid={`radio-pl-del-${p.id}`}><IoTrashOutline size={15} /></button>
      </div>
    </div>
  );
}
