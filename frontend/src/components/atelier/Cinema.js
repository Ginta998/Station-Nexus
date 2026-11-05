import { useEffect, useRef, useState } from "react";
import { IoPlay, IoPause, IoPlaySkipForward, IoVolumeHigh, IoVolumeMute, IoExpand, IoContract, IoClose, IoListOutline, IoContractOutline, IoDesktopOutline, IoChevronBack } from "react-icons/io5";
import { useMediaClaim, atelierApi } from "@/lib/atelier";
import { toScreen } from "@/lib/embed";
import "@/components/atelier/cinema.css";

const listOf = (u = "") => (u.match(/[?&]list=([\w-]+)/) || [])[1];
export const vidOf = (u = "") => (u.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/) || [])[1];
export const isYouTube = (u = "") => /youtu\.?be/.test(u) && !!(vidOf(u) || listOf(u));
const thumb = (v) => (v ? `https://i.ytimg.com/vi/${v}/mqdefault.jpg` : "");
const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return `${h ? h + ":" + String(m).padStart(2, "0") : m}:${String(s % 60).padStart(2, "0")}`; };
const POS = "nx-pos:";
const getPos = (u) => { try { return Math.floor(+localStorage.getItem(POS + u) || 0); } catch (_) { return 0; } };
const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
const titles = {};

// Lecteur cinéma : interface YouTube masquée, contrôles Nexus
export default function Cinema({ url, title, queue, qi = 0, goTo, mini, onMini, onClose, fileSrc }) {
  const box = useRef(null); const fr = useRef(null); const vr = useRef(null); const ready = useRef(false); const idle = useRef(null); const ccRef = useRef(false);
  const [src] = useState(() => {
    const v = vidOf(url); const l = listOf(url); const st = getPos(url);
    const q = `autoplay=1&controls=0&disablekb=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&fs=0&enablejsapi=1&cc_load_policy=0&origin=${encodeURIComponent(window.location.origin)}${st > 5 ? `&start=${st}` : ""}`;
    return `https://www.youtube.com/embed/${v || "videoseries"}?${l ? `list=${l}&` : ""}${q}`;
  });
  const [s, setS] = useState({ state: -1, t: 0, d: 0, vol: 100, muted: false, rate: 1, buf: 0 });
  const [ui, setUi] = useState(true); const [panel, setPanel] = useState(false); const [rates, setRates] = useState(false);
  const [cc, setCc] = useState(false); const [full, setFull] = useState(false); const [count, setCount] = useState(null); const [, tick] = useState(0);
  useMediaClaim(true);
  const cmd = (func, args = []) => {
    const v = vr.current;
    if (v) { const a = args[0]; ({ playVideo: () => v.play().catch(() => {}), pauseVideo: () => v.pause(), seekTo: () => { v.currentTime = a; }, setVolume: () => { v.volume = a / 100; }, mute: () => { v.muted = true; }, unMute: () => { v.muted = false; }, setPlaybackRate: () => { v.playbackRate = a; } }[func] || (() => {}))(); return; }
    try { fr.current.contentWindow.postMessage(JSON.stringify({ event: "command", func, args }), "*"); } catch (_) {}
  };
  const onV = (e) => {
    const v = e.target; const st = { playing: 1, pause: 2, waiting: 3, ended: 0 }[e.type];
    setS((o) => ({ ...o, t: v.currentTime, d: v.duration || o.d, vol: Math.round(v.volume * 100), muted: v.muted, rate: v.playbackRate, buf: v.buffered.length && v.duration ? v.buffered.end(v.buffered.length - 1) / v.duration : o.buf, ...(st != null && { state: st }) }));
    if (e.type === "loadedmetadata") { const p = getPos(url); if (p > 5 && p < v.duration - 5) v.currentTime = p; }
    if (e.type === "timeupdate" && v.currentTime > 5) try { localStorage.setItem(POS + url, String(Math.floor(v.currentTime))); localStorage.setItem("nx-dur:" + url, String(Math.floor(v.duration || 0))); } catch (_) {}
    if (e.type === "ended") { try { localStorage.removeItem(POS + url); } catch (_) {} setCount(5); }
  };
  const hasQ = queue && queue.length > 1;
  const items = hasQ ? queue.map((x, k) => { const v = vidOf(x.url); return { v, title: titles[v]?.title || x.title, k }; }) : (s.ids || []).map((v, k) => ({ v, title: titles[v]?.title, k }));
  const qids = hasQ ? queue.map((x) => vidOf(x.url)).filter(Boolean) : s.ids || [];
  const curK = hasQ ? qi : s.i || 0;
  const nextItem = items[curK + 1];
  const playK = (k) => { setCount(null); if (hasQ) goTo(k); else cmd("playVideoAt", [k]); };
  const next = () => nextItem && playK(curK + 1);

  useEffect(() => {
    const on = (m) => {
      if (!fr.current || m.source !== fr.current.contentWindow) return;
      let d; try { d = JSON.parse(m.data); } catch (_) { return; }
      if (d.event === "onReady") { ready.current = true; cmd("playVideo"); if (!ccRef.current) cmd("unloadModule", ["captions"]); return; }
      if (d.event === "onApiChange") { if (!ccRef.current) cmd("unloadModule", ["captions"]); return; }
      const x = d.info; if (!x) return;
      setS((o) => ({ ...o, ...(x.playerState != null && { state: x.playerState }), ...(x.currentTime != null && { t: x.currentTime }), ...(x.duration && { d: x.duration }), ...(x.volume != null && { vol: x.volume }), ...(x.muted != null && { muted: x.muted }), ...(x.playbackRate && { rate: x.playbackRate }), ...(x.videoLoadedFraction != null && { buf: x.videoLoadedFraction }), ...(x.videoData?.title && { vt: x.videoData.title, va: x.videoData.author }), ...(Array.isArray(x.playlist) && { ids: x.playlist }), ...(x.playlistIndex != null && { i: x.playlistIndex }) }));
      if (x.currentTime > 5) try { localStorage.setItem(POS + url, String(Math.floor(x.currentTime))); if (x.duration || s.d) localStorage.setItem("nx-dur:" + url, String(Math.floor(x.duration || s.d))); } catch (_) {}
      if (x.playerState === 0) { try { localStorage.removeItem(POS + url); } catch (_) {} setCount(5); }
    };
    window.addEventListener("message", on); return () => window.removeEventListener("message", on);
  }, [url]); // eslint-disable-line
  useEffect(() => { const ids = qids.filter((v) => !titles[v]).slice(0, 100); if (ids.length) atelierApi.ytTitles(ids.join(",")).then((d) => { Object.assign(titles, d); tick((x) => x + 1); }).catch(() => {}); }, [qids.join(",")]); // eslint-disable-line
  useEffect(() => { if (count == null) return; if (!nextItem) { setCount(null); return; } if (count <= 0) { next(); return; } const t = setTimeout(() => setCount((c) => (c == null ? c : c - 1)), 1000); return () => clearTimeout(t); }, [count]); // eslint-disable-line
  useEffect(() => { const on = () => setFull(document.fullscreenElement === box.current); document.addEventListener("fullscreenchange", on); return () => document.removeEventListener("fullscreenchange", on); }, []);

  const hello = () => { let n = 0; ready.current = false; const go = () => { if (ready.current || n++ > 40 || !fr.current) return; try { fr.current.contentWindow.postMessage(JSON.stringify({ event: "listening", id: "cine" }), "*"); } catch (_) {} setTimeout(go, 250); }; go(); };
  const playing = s.state === 1 || s.state === 3;
  const toggle = () => cmd(playing ? "pauseVideo" : "playVideo");
  const seek = (t) => { cmd("seekTo", [Math.max(0, Math.min(s.d || t, t)), true]); setS((o) => ({ ...o, t })); };
  const vol = (v) => { cmd("setVolume", [v]); cmd(v ? "unMute" : "mute"); setS((o) => ({ ...o, vol: v, muted: !v })); };
  const fs = () => (document.fullscreenElement ? document.exitFullscreen() : box.current?.requestFullscreen?.()).catch?.(() => {});
  const poke = () => { setUi(true); clearTimeout(idle.current); idle.current = setTimeout(() => setUi(false), 2800); };
  const toggleCc = () => { ccRef.current = !cc; if (cc) cmd("unloadModule", ["captions"]); else { cmd("loadModule", ["captions"]); cmd("setOption", ["captions", "track", { languageCode: "fr" }]); } setCc(!cc); };

  useEffect(() => {
    if (mini) return;
    const on = (e) => {
      if (/INPUT|TEXTAREA/.test(e.target.tagName) || e.target.isContentEditable) return;
      const k = e.key.toLowerCase(); const map = { " ": toggle, k: toggle, arrowright: () => seek(s.t + 10), arrowleft: () => seek(s.t - 10), arrowup: () => vol(Math.min(100, s.vol + 10)), arrowdown: () => vol(Math.max(0, s.vol - 10)), f: fs, m: () => vol(s.muted ? s.vol || 60 : 0), n: next };
      if (map[k]) { e.preventDefault(); map[k](); poke(); }
    };
    window.addEventListener("keydown", on); return () => window.removeEventListener("keydown", on);
  });

  const show = !mini && (ui || !playing || panel);
  const name = s.vt || title;
  return (
    <div ref={box} className={"cine" + (mini ? " mini" : "") + (show ? " ui" : "")} onMouseMove={poke} onTouchStart={poke} data-testid="cinema-player">
      {fileSrc
        ? <video ref={vr} src={fileSrc} autoPlay playsInline onPlaying={onV} onPause={onV} onWaiting={onV} onEnded={onV} onTimeUpdate={onV} onLoadedMetadata={onV} onProgress={onV} onVolumeChange={onV} onRateChange={onV} />
        : <iframe ref={fr} src={src} title={title || "Vidéo"} allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" onLoad={hello} />}
      {!mini && <>
        <div className="cine-hit" onClick={() => { toggle(); poke(); }} onDoubleClick={fs} />
        {!playing && s.state !== -1 && <button className="cine-big" onClick={toggle} data-testid="cinema-big-play"><IoPlay size={40} /></button>}
        {s.state === 3 && <span className="cine-spin" />}
        <div className="cine-top">
          <button className="cine-ic" onClick={onClose} title="Fermer" data-testid="cinema-close"><IoChevronBack size={22} /></button>
          <div className="cine-tt"><small className="mono">{hasQ || items.length ? `${curK + 1} / ${items.length}` : "SALON"}{s.va ? ` · ${s.va}` : ""}</small><b>{name}</b></div>
          <button className="cine-ic" onClick={onMini} title="Mini-lecteur" data-testid="cinema-mini"><IoContractOutline size={19} /></button>
          <button className="cine-ic" onClick={() => { toScreen(`https://www.youtube.com/embed/${vidOf(url) || "videoseries"}?autoplay=1${listOf(url) ? `&list=${listOf(url)}` : ""}&start=${Math.floor(s.t)}`); onClose(); }} title="Envoyer sur l'autre écran" data-testid="cinema-screen2"><IoDesktopOutline size={19} /></button>
        </div>
        <div className="cine-bot">
          <Bar s={s} seek={seek} />
          <div className="cine-row">
            <button className="cine-ic lg" onClick={toggle} data-testid="cinema-toggle">{playing ? <IoPause size={26} /> : <IoPlay size={26} />}</button>
            <button className="cine-ic" onClick={() => seek(s.t - 10)} title="-10 s" data-testid="cinema-back10"><b className="cine-n">-10</b></button>
            <button className="cine-ic" onClick={() => seek(s.t + 10)} title="+10 s" data-testid="cinema-fwd10"><b className="cine-n">+10</b></button>
            {nextItem && <button className="cine-ic" onClick={next} title="Suivant" data-testid="cinema-next"><IoPlaySkipForward size={20} /></button>}
            <div className="cine-vol"><button className="cine-ic" onClick={() => vol(s.muted || !s.vol ? 60 : 0)} data-testid="cinema-mute">{s.muted || !s.vol ? <IoVolumeMute size={20} /> : <IoVolumeHigh size={20} />}</button>
              <input type="range" min="0" max="100" value={s.muted ? 0 : s.vol} onChange={(e) => vol(+e.target.value)} style={{ "--p": (s.muted ? 0 : s.vol) + "%" }} data-testid="cinema-volume" /></div>
            <span className="cine-time mono">{fmt(s.t)} <i>/ {fmt(s.d)}</i></span>
            <span className="grow" />
            <div className="cine-rate"><button className="cine-ic" onClick={() => setRates(!rates)} data-testid="cinema-rate"><b className="cine-n">{s.rate}×</b></button>
              {rates && <div className="cine-menu">{RATES.map((r) => <button key={r} className={r === s.rate ? "on" : ""} onClick={() => { cmd("setPlaybackRate", [r]); setS((o) => ({ ...o, rate: r })); setRates(false); }}>{r === 1 ? "Normale" : r + "×"}</button>)}</div>}</div>
            {!fileSrc && <button className={"cine-ic" + (cc ? " on" : "")} onClick={toggleCc} title="Sous-titres" data-testid="cinema-cc"><b className="cine-n cc">CC</b></button>}
            {items.length > 1 && <button className={"cine-ic" + (panel ? " on" : "")} onClick={() => setPanel(!panel)} title="À suivre" data-testid="cinema-queue"><IoListOutline size={21} /></button>}
            <button className="cine-ic" onClick={fs} title="Plein écran" data-testid="cinema-fullscreen">{full ? <IoContract size={20} /> : <IoExpand size={20} />}</button>
          </div>
        </div>
        {panel && <UpNext items={items} cur={curK} play={playK} close={() => setPanel(false)} />}
        {count != null && nextItem && (
          <div className="cine-next" data-testid="cinema-countdown">
            <img src={thumb(nextItem.v)} alt="" /><div><small className="mono">À SUIVRE DANS {count}</small><b>{nextItem.title || titles[nextItem.v]?.title || "Vidéo suivante"}</b>
              <span><button className="cine-btn" onClick={next}>Lire maintenant</button><button className="cine-btn ghost" onClick={() => setCount(null)}>Annuler</button></span></div>
          </div>
        )}
      </>}
    </div>
  );
}

function Bar({ s, seek }) {
  const [hov, setHov] = useState(null);
  const at = (e) => { const r = e.currentTarget.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); };
  const p = s.d ? (s.t / s.d) * 100 : 0;
  return (
    <div className="cine-bar" onMouseMove={(e) => setHov(at(e))} onMouseLeave={() => setHov(null)} onClick={(e) => seek(at(e) * s.d)} data-testid="cinema-seek">
      <i className="buf" style={{ width: s.buf * 100 + "%" }} /><i className="pl" style={{ width: p + "%" }} /><i className="dot" style={{ left: p + "%" }} />
      {hov != null && <span className="tip mono" style={{ left: hov * 100 + "%" }}>{fmt(hov * s.d)}</span>}
    </div>
  );
}

function UpNext({ items, cur, play, close }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.querySelector(".on")?.scrollIntoView({ block: "center" }); }, []);
  return (
    <aside className="cine-panel" data-testid="cinema-upnext">
      <div className="cine-ph"><b>À suivre</b><button className="cine-ic" onClick={close}><IoClose size={18} /></button></div>
      <ol ref={ref}>{items.map((x) => (
        <li key={x.k} className={(x.k === cur ? "on" : "") + (x.k < cur ? " past" : "")} onClick={() => play(x.k)} data-testid={`cinema-upnext-${x.k}`}>
          <span className="th" style={{ backgroundImage: `url(${thumb(x.v)})` }}>{x.k === cur && <em>EN COURS</em>}</span>
          <span className="tx"><small className="mono">{String(x.k + 1).padStart(2, "0")}</small><b>{x.title || titles[x.v]?.title || "…"}</b></span>
        </li>))}</ol>
    </aside>
  );
}
