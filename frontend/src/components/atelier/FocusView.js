import { useEffect, useMemo, useRef, useState } from "react";
import { IoClose, IoPlay, IoPause, IoStop, IoExpand, IoVideocamOutline, IoVolumeHigh, IoVolumeMute, IoMusicalNotes, IoChevronDown, IoChevronUp, IoAdd, IoTrashOutline, IoPlayBack, IoPlayForward, IoDesktopOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { useThemeList } from "@/lib/themeStore";
import { getUniPlaylist } from "@/lib/atelier";
import { toEmbed, toScreen } from "@/lib/embed";
import CosmicBackground from "@/components/CosmicBackground";
import { SoundBtn } from "@/components/StationMenu";

const DURS = [["25", 25], ["50", 50], ["90", 90], ["Libre", 0]];
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const weekKey = () => { const d = new Date(); const o = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); o.setUTCDate(o.getUTCDate() + 4 - (o.getUTCDay() || 7)); const y = new Date(Date.UTC(o.getUTCFullYear(), 0, 1)); return o.getUTCFullYear() + "-W" + Math.ceil(((o - y) / 86400000 + 1) / 7); };

// Bibliothèque de liens vidéo/ambiance du Focus (stockée en local) — tu choisis, rien ne se lance tout seul avec le son.
const VKEY = "nexus-focus-vids";
const loadVids = () => { try { const v = JSON.parse(localStorage.getItem(VKEY) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } };
const saveVids = (v) => { try { localStorage.setItem(VKEY, JSON.stringify(v)); } catch (_) {} };

// Lien → fond vidéo (toujours démarré muet ; le son s'active ensuite via l'API, sans recharger)
const ORIGIN = typeof window !== "undefined" ? window.location.origin : "";
const ytThumb = (u = "") => { const y = (u.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/) || [])[1]; return y ? `https://i.ytimg.com/vi/${y}/mqdefault.jpg` : ""; };
const bgVideo = (raw) => {
  const url = (raw || "").trim(); if (!url) return null;
  const common = `&enablejsapi=1&origin=${encodeURIComponent(ORIGIN)}&modestbranding=1&playsinline=1&rel=0`;
  const listId = (url.match(/[?&]list=([\w-]+)/) || [])[1];
  const y = (url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/) || [])[1];
  if (listId && !y) return { yt: `https://www.youtube.com/embed/videoseries?list=${listId}&autoplay=1&mute=1&loop=1${common}`, canSound: true };
  if (y) return { yt: `https://www.youtube.com/embed/${y}?autoplay=1&mute=1&controls=0&loop=1&playlist=${listId || y}${common}&iv_load_policy=3`, canSound: true };
  const em = toEmbed(url);
  if (em?.video) return { video: em.video, canSound: true };
  if (em?.src && !em.blocked) return { src: em.src, canSound: false };
  return null;
};
const sbtn = { borderColor: "var(--line)", borderRadius: "999px", color: "var(--text-primary)", background: "color-mix(in srgb,var(--bg-primary) 60%,transparent)" };

// Mode Focus — un lieu immersif : concentration, repos, ou immersion totale. Pas un pomodoro, une respiration.
export default function FocusView({ at, onClose }) {
  const THEMES = useThemeList();
  const { sfx, theme, setTheme, enterMediaMode, exitMediaMode } = useApp();
  const [mode, setMode] = useState("focus"); // focus | repos | immersion
  const [dur, setDur] = useState(25);
  const [left, setLeft] = useState(25 * 60);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [streak, setStreak] = useState({ sessions: 0, seconds: 0 });
  const [vidUrl, setVidUrl] = useState("");
  const [vidSound, setVidSound] = useState(false);
  const [ambOpen, setAmbOpen] = useState(false);
  const vids = at.config.focus_vids || loadVids();
  const setVids = (v) => at.saveConfig({ focus_vids: v });
  const [hideUi, setHideUi] = useState(false);
  const [vPlaying, setVPlaying] = useState(false);
  const vRef = useRef(null);
  const tRef = useRef(0);
  const [adding, setAdding] = useState(false);
  const themeAtOpen = useRef(theme);
  const ytRef = useRef(null);

  const targets = useMemo(() => at.universes.map((u) => ({ id: u.id, name: u.name, color: u.color || "var(--brand)", kanji: u.kanji || u.name[0], playlist: getUniPlaylist(u.id) })), [at.universes]);
  const target = targets.find((t) => t.id === targetId) || null;
  const vid = useMemo(() => bgVideo(vidUrl), [vidUrl]);

  const setVideo = (url) => { setVidUrl(url); setVidSound(false); setVPlaying(false); };
  const ytCmd = (func, args = []) => { try { ytRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func, args }), "*"); } catch (_) {} };
  const seek = (d) => { if (vid?.yt) ytCmd("seekTo", [Math.max(0, tRef.current + d), true]); else if (vRef.current) vRef.current.currentTime = Math.max(0, vRef.current.currentTime + d); };
  // Jamais deux sons : la musique se coupe dès qu'une vidéo joue avec le son, et revient en pause / à la sortie
  useEffect(() => { if (vid && vidSound && vPlaying) { enterMediaMode(); return () => exitMediaMode(); } }, [vid, vidSound, vPlaying, enterMediaMode, exitMediaMode]);
  useEffect(() => {
    const on = (e) => {
      if (!ytRef.current || e.source !== ytRef.current.contentWindow) return;
      let d; try { d = JSON.parse(e.data); } catch { return; }
      const i = d?.info || {};
      if (typeof i.currentTime === "number") tRef.current = i.currentTime;
      if (typeof i.playerState === "number") setVPlaying(i.playerState === 1);
    };
    window.addEventListener("message", on); return () => window.removeEventListener("message", on);
  }, []);
  const ytLoad = () => { try { ytRef.current.contentWindow.postMessage(JSON.stringify({ event: "listening", id: "fx" }), "*"); } catch (_) {} };
  const close = () => { try { if (themeAtOpen.current && themeAtOpen.current !== theme) setTheme(themeAtOpen.current); } catch (_) {} onClose(); };

  useEffect(() => { try { const r = JSON.parse(localStorage.getItem("nexus-focus") || "{}"); if (r.week === weekKey()) setStreak({ sessions: r.sessions || 0, seconds: r.seconds || 0 }); } catch (_) {} }, []);
  useEffect(() => { setLeft(dur * 60); setElapsed(0); setRunning(false); }, [dur]);

  // Son de la vidéo YouTube via l'API iframe — on coupe/active SANS recharger la vidéo
  useEffect(() => {
    if (!vid?.yt || !ytRef.current) return;
    try { ytRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func: vidSound ? "unMute" : "mute", args: [] }), "*"); } catch (_) {}
  }, [vidSound, vid]);

  const record = (secs) => {
    try {
      const wk = weekKey(); const r = JSON.parse(localStorage.getItem("nexus-focus") || "{}");
      const base = r.week === wk ? r : { week: wk, sessions: 0, seconds: 0 };
      base.sessions += 1; base.seconds += secs; localStorage.setItem("nexus-focus", JSON.stringify(base));
      setStreak({ sessions: base.sessions, seconds: base.seconds });
    } catch (_) {}
  };
  const finish = (natural) => {
    const secs = dur > 0 ? dur * 60 - left : elapsed;
    setRunning(false);
    if (secs > 20) { record(secs); try { sfx(natural ? "chirp" : "select"); } catch (_) {} toast.success(mode === "repos" ? "Belle pause. Reviens quand tu veux." : "Séance terminée — bien joué."); }
    setLeft(dur * 60); setElapsed(0);
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed((e) => e + 1);
      if (dur > 0) setLeft((l) => { if (l <= 1) { setTimeout(() => finish(true), 0); return 0; } return l - 1; });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, dur, left, elapsed, mode]);

  const addVid = (url, title) => {
    const u = (url || "").trim(); if (!u) return;
    if (!bgVideo(u)) return toast.error("Lien non lisible en fond");
    const t = (title || "").trim() || (u.match(/[?&]list=([\w-]+)/) ? "Playlist" : "Vidéo");
    const next = [{ id: "v-" + Date.now(), title: t, url: u }, ...vids].slice(0, 24);
    setVids(next); setVideo(u); setAdding(false);
  };
  const removeVid = (id) => setVids(vids.filter((v) => v.id !== id));

  const toggleFull = () => { const el = document.querySelector(".fx-root"); if (!document.fullscreenElement) el?.requestFullscreen?.().catch(() => {}); else document.exitFullscreen?.().catch(() => {}); };
  const display = dur > 0 ? fmt(left) : fmt(elapsed);
  const prog = dur > 0 ? 1 - left / (dur * 60) : (elapsed % 60) / 60;

  return (
    <div className={"fx-root mode-" + mode + (hideUi ? " fx-hideui" : "")} style={{ "--u": target?.color || "var(--brand)" }} data-testid="atelier-focus">
      <div className="fx-canvas" aria-hidden="true">
        <div className="fx-cosmic"><CosmicBackground /></div>
        {vid && (
          <div className="fx-video">
            {vid.yt ? <iframe ref={ytRef} src={vid.yt} onLoad={ytLoad} title="Ambiance" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen />
              : vid.video ? <video ref={vRef} src={vid.video} autoPlay muted={!vidSound} loop playsInline onPlay={() => setVPlaying(true)} onPause={() => setVPlaying(false)} />
              : <iframe src={vid.src} title="Ambiance" frameBorder="0" allow="autoplay; encrypted-media" />}
          </div>
        )}
      </div>
      <div className="fx-veil" aria-hidden="true" />

      <div className="fx-top">
        <button className="fx-icon" onClick={close} data-testid="atelier-focus-close"><IoClose size={18} /> Quitter</button>
        <div className="fx-modes">
          <button className={mode === "focus" ? "on" : ""} onClick={() => setMode("focus")}>禅 Focus</button>
          <button className={mode === "repos" ? "on" : ""} onClick={() => setMode("repos")}>憩 Repos</button>
          <button className={mode === "immersion" ? "on" : ""} onClick={() => setMode("immersion")}>没 Immersion</button>
        </div>
        <button className="fx-icon" onClick={() => { toScreen(window.location.origin + "/atelier#focus"); close(); }} title="Ouvrir le Focus sur l'autre écran" data-testid="atelier-focus-screen2"><IoDesktopOutline size={16} /></button>
        <button className="fx-icon" onClick={toggleFull} title="Plein écran"><IoExpand size={16} /></button>
      </div>

      <div className="fx-center">
        {mode === "immersion" ? null : mode === "focus" ? (
          <>
              <div className="fx-eyebrow mono">// SÉANCE {target ? "· " + target.name.toUpperCase() : "· LE PONT EST À TOI"}</div>
              <div className="fx-dial" style={{ "--p": prog }}>
                <div className="fx-time">{display}</div>
                <div className="fx-state mono">{running ? "EN COURS" : dur > 0 ? dur + " MINUTES" : "LIBRE"}</div>
              </div>
              <div className="fx-controls">
                {!running ? <button className="fx-go" onClick={() => { setRunning(true); try { sfx("select"); } catch (_) {} }}><IoPlay size={18} /> {elapsed ? "Reprendre" : "Démarrer"}</button>
                  : <button className="fx-go ghost" onClick={() => setRunning(false)}><IoPause size={18} /> Pause</button>}
                {(running || elapsed > 0) && <button className="fx-stop" onClick={() => finish(false)}><IoStop size={16} /> Terminer</button>}
              </div>
              <div className="fx-durs">{DURS.map(([l, v]) => <button key={l} className={dur === v ? "on" : ""} onClick={() => setDur(v)}>{l}</button>)}</div>
            </>
          ) : (
            <div className="fx-repos">
              <div className="fx-breathe"><span /></div>
              <h2>Respire.</h2>
              <p>Rien à produire ici. Suis le cercle — il grandit, tu inspires ; il se referme, tu expires.</p>
            </div>
          )}
        </div>

      <button className="fx-tab" onClick={() => setHideUi((h) => !h)} title={hideUi ? "Déplier le menu" : "Replier le menu"} data-testid="atelier-focus-hideui">{hideUi ? <IoChevronUp size={16} /> : <IoChevronDown size={16} />}</button>
      <div className="fx-bottom">
        <div className="fx-row">
          <span className="fx-lbl mono">CIBLE</span>
          <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className="fx-select" data-testid="atelier-focus-target">
            <option value="">Rien de précis</option>
            {targets.map((t) => <option key={t.id} value={t.id}>{t.kanji}  {t.name}</option>)}
          </select>
        </div>
        <div className="fx-row fx-music">
          <span className="fx-lbl mono">MUSIQUE</span>
          <SoundBtn btn={sbtn} up />
        </div>
        <div className="fx-row fx-vidrow">
          <span className="fx-lbl mono">VIDÉO</span>
          {vid && vid.canSound && (
            <button className={"fx-chip" + (vidSound ? " on" : "")} onClick={() => setVidSound((s) => !s)} data-testid="atelier-focus-vidsound" title={vidSound ? "Couper le son de la vidéo" : "Activer le son de la vidéo"}>
              {vidSound ? <IoVolumeHigh size={14} /> : <IoVolumeMute size={14} />} {vidSound ? "Son" : "Muet"}
            </button>
          )}
          {target?.playlist && <button className="fx-chip" onClick={() => setVideo(target.playlist)} title={`Playlist de ${target.name}`}><IoMusicalNotes size={14} /> {target.name}</button>}
          {vids.map((v) => (
            <span key={v.id} className={"fx-vchip" + (v.url === vidUrl ? " on" : "")}>
              <button onClick={() => setVideo(v.url)} title={v.title} data-testid={`atelier-focus-vid-${v.id}`}>{ytThumb(v.url) ? <img className="th" src={ytThumb(v.url)} alt="" loading="lazy" /> : <IoVideocamOutline size={13} />}<span>{v.title}</span></button>
              <i onClick={() => removeVid(v.id)} title="Retirer" role="button"><IoTrashOutline size={11} /></i>
            </span>
          ))}
          {adding ? (
            <input className="fx-select" autoFocus placeholder="Colle un lien puis Entrée" onKeyDown={(e) => { if (e.key === "Enter") addVid(e.target.value); if (e.key === "Escape") setAdding(false); }} style={{ minWidth: 220 }} />
          ) : (
            <button className="fx-chip" onClick={() => setAdding(true)} data-testid="atelier-focus-vidadd"><IoAdd size={14} /> Lien</button>
          )}
          {vid && (vid.yt || vid.video) && <><button className="fx-chip" onClick={() => seek(-10)} title="Reculer de 10 s" data-testid="atelier-focus-back"><IoPlayBack size={14} /> 10 s</button><button className="fx-chip" onClick={() => seek(10)} title="Avancer de 10 s" data-testid="atelier-focus-fwd">10 s <IoPlayForward size={14} /></button></>}
          {vid && <button className="fx-chip" onClick={() => setVideo("")} title="Couper la vidéo de fond"><IoClose size={14} /> Stop</button>}
        </div>
        <div className="fx-row fx-ambrow">
          <button className="fx-lbl mono fx-ambtoggle" onClick={() => setAmbOpen((o) => !o)} data-testid="atelier-focus-ambtoggle">AMBIANCE {ambOpen ? <IoChevronUp size={11} /> : <IoChevronDown size={11} />}</button>
          {ambOpen && (
            <div className="fx-amb" data-testid="atelier-focus-amb">
              {THEMES.map((t) => (
                <button key={t.key} className={theme === t.key ? "on" : ""} onClick={() => { setTheme(t.key); try { sfx("nav"); } catch (_) {} }} title={t.tagline} style={{ "--sw": t.swatch[1] }}>
                  <span className="sw" style={{ background: t.swatch[1] }} />{t.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="fx-streak mono">CETTE SEMAINE · {streak.sessions} SÉANCE{streak.sessions > 1 ? "S" : ""} · {Math.floor(streak.seconds / 3600)} H {String(Math.floor((streak.seconds % 3600) / 60)).padStart(2, "0")} EN FOCUS</div>
      </div>
    </div>
  );
}
