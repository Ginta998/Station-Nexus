import { useEffect, useRef, useState } from "react";
import { IoPlay, IoPause, IoPlaySkipForward, IoPlaySkipBack, IoShuffle, IoRadioOutline, IoVolumeHigh, IoVolumeMute, IoClose, IoAdd, IoTrashOutline, IoImageOutline, IoInfinite, IoListOutline, IoPencil } from "react-icons/io5";
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
  if (l) return `https://www.youtube-nocookie.com/embed/${v && !s.i ? v : "videoseries"}?list=${l}${s.i ? `&index=${s.i}` : ""}&${q}`;
  return v ? `https://www.youtube-nocookie.com/embed/${v}?${q}` : "";
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
  const play = (p) => { if (!srcFor(p)) return toast.error("Lien YouTube invalide"); setInfo({}); setPl(p); };
  const nextPl = () => { if (!list.length) return; const i = list.findIndex((x) => x.id === pl?.id); play(list[shuffle ? Math.floor(Math.random() * list.length) : (i + 1) % list.length]); };
  const r = { list, pl, info, station, shuffle, vol, muted, fr, cmd, play, nextPl, setStation,
    playing: info.state === 1,
    toggle: () => cmd(info.state === 1 ? "pauseVideo" : "playVideo"),
    pause: () => pl && cmd("pauseVideo"),
    next: () => cmd("nextVideo"), prev: () => (info.t > 4 ? cmd("seekTo", [0, true]) : cmd("previousVideo")),
    jump: (k) => cmd("playVideoAt", [k]),
    seek: (t) => cmd("seekTo", [t, true]),
    setShuffle: (s) => { setShuffle(s); cmd("setShuffle", [s]); },
    setVol: (v) => { setVol(v); setMuted(false); cmd("setVolume", [v]); cmd("unMute"); },
    mute: () => { cmd(muted ? "unMute" : "mute"); setMuted(!muted); },
    stop: () => { setPl(null); setInfo({}); },
    save: (l) => at.saveConfig({ radio: l }),
  };
  const live = useRef(r); live.current = r;
  useEffect(() => {
    const on = (m) => {
      if (!fr.current || m.source !== fr.current.contentWindow) return;
      let x; try { x = JSON.parse(m.data).info; } catch (_) { return; }
      if (!x) return;
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
      const c = live.current;
      if (c.pl && x.currentTime > 5) { try { localStorage.setItem("nx-radio:" + c.pl.id, JSON.stringify({ i: c.info.i || 0, t: x.currentTime })); } catch (_) {} }
      if (x.playerState === 0 && c.station && (c.info.i == null || c.info.i >= (c.info.n || 1) - 1)) { try { localStorage.removeItem("nx-radio:" + c.pl.id); } catch (_) {} c.nextPl(); }
    };
    window.addEventListener("message", on); return () => window.removeEventListener("message", on);
  }, []);
  useEffect(() => {
    if (pl && !pl.cover && !pl.thumb && info.vid) at.saveConfig({ radio: list.map((x) => (x.id === pl.id ? { ...x, thumb: thumb(info.vid) } : x)) });
  }, [info.vid]); // eslint-disable-line
  return r;
}

export function RadioEngine({ radio: r }) {
  useMediaClaim(!!r.pl && r.info.state !== 2 && r.info.state !== 0);
  const pid = r.pl?.id;
  if (!r.pl) return null;
  return <iframe key={pid} ref={r.fr} className="rd-engine" src={srcFor(r.pl)} title="Radio Nexus" allow="autoplay; encrypted-media" onLoad={() => { try { r.fr.current.contentWindow.postMessage(JSON.stringify({ event: "listening", id: "rd" }), "*"); } catch (_) {} r.cmd("setVolume", [r.vol]); }} />;
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

      <div className="rd-sec-h"><h2>Tes playlists</h2><button className="rd-btn sm" onClick={() => setAdding(true)} data-testid="radio-add"><IoAdd size={16} /> Ajouter</button></div>
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

const titles = {};
function Queue({ r }) {
  const { ids = [], i = 0, vid } = r.info;
  const [, tick] = useState(0);
  const box = useRef(null);
  useEffect(() => {
    const miss = ids.filter((v) => !titles[v]).slice(0, 60);
    if (miss.length) atelierApi.ytTitles(miss.join(",")).then((d) => { Object.assign(titles, d); tick((x) => x + 1); }).catch(() => {});
  }, [ids.join(",")]); // eslint-disable-line
  useEffect(() => { box.current?.querySelector(".on")?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [i]);
  if (!ids.length) return <p className="rd-empty">La file apparaît dès que la playlist joue.</p>;
  return (
    <ol className="rd-queue" ref={box} data-testid="radio-queue">
      {ids.map((v, k) => (
        <li key={v + k} className={(v === vid ? "on" : "") + (k < i ? " past" : "")} onClick={() => r.jump(k)} data-testid={`radio-queue-item-${k}`}>
          <span className="n mono">{v === vid && r.playing ? <span className="rd-eq"><i /><i /><i /></span> : k + 1}</span>
          <img src={thumb(v, "default")} alt="" loading="lazy" />
          <span className="t"><b>{titles[v]?.title || "…"}</b><small>{titles[v]?.author || ""}</small></span>
        </li>
      ))}
    </ol>
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
