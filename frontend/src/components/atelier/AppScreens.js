import { useRef, useState, useEffect } from "react";
import { IoClose, IoOpenOutline, IoContractOutline, IoExpandOutline, IoPlayForward, IoPlayBack } from "react-icons/io5";
import { toEmbed, popOut } from "@/lib/embed";
import { imgSrc, useMediaClaim } from "@/lib/atelier";

const POS = "nx-pos:";
const getPos = (url) => { try { return Math.floor(+localStorage.getItem(POS + url) || 0); } catch (_) { return 0; } };
const setPos = (url, t) => { try { if (t > 5) localStorage.setItem(POS + url, String(Math.floor(t))); } catch (_) {} };

export function EmbedFrame({ url, onEnded }) {
  const e = toEmbed(url);
  const fr = useRef(null);
  const [start] = useState(() => getPos(url));
  const isYt = e?.provider === "YouTube" && !!e.src;
  useMediaClaim(!!e && !e.blocked && (e.ratio === "video" || e.ratio === "audio"));
  useEffect(() => {
    if (!isYt) return;
    const on = (m) => {
      if (!fr.current || m.source !== fr.current.contentWindow) return;
      try { const d = JSON.parse(m.data); if (d.info?.currentTime) setPos(url, d.info.currentTime); if (d.info?.playerState === 0) { localStorage.removeItem(POS + url); onEnded?.(); } } catch (_) {}
    };
    window.addEventListener("message", on); return () => window.removeEventListener("message", on);
  }, [isYt, url, onEnded]);
  if (!e) return <div className="at-embed-msg"><p>Lien invalide.</p></div>;
  if (e.blocked) return (
    <div className="at-embed-msg" data-testid="atelier-embed-blocked">
      <b>{e.provider}</b>
      <p>Ce service interdit l'affichage à l'intérieur d'un autre site. On l'ouvre dans une fenêtre à côté, la Station reste ouverte.</p>
      <button className="at-btn" onClick={() => popOut(url)} data-testid="atelier-embed-popout"><IoOpenOutline size={15} /> Ouvrir à côté</button>
    </div>
  );
  return (
    <div className={`at-embed r-${e.ratio}`} data-testid="atelier-embed">
      {e.video ? <video src={imgSrc(e.video)} controls autoPlay playsInline onLoadedMetadata={(ev) => { if (start) ev.target.currentTime = start; }} onTimeUpdate={(ev) => setPos(url, ev.target.currentTime)} onEnded={() => { try { localStorage.removeItem(POS + url); } catch (_) {} onEnded?.(); }} /> : e.audio ? <audio src={imgSrc(e.audio)} controls autoPlay onEnded={onEnded} /> :
        <iframe ref={fr} onLoad={() => { if (isYt) try { fr.current.contentWindow.postMessage(JSON.stringify({ event: "listening", id: "nx" }), "*"); } catch (_) {} }} title={e.provider} src={isYt ? `${e.src}&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}${start ? `&start=${start}` : ""}` : e.src} allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
      {(e.note || e.maybe) && <p className="at-embed-note">{e.note || "Page vide ? Ce site bloque peut-être l'intégration."} <span onClick={() => popOut(url)}>Ouvrir à côté ↗</span></p>}
    </div>
  );
}

// Écran plein (dans l'Atelier) : lecteur avec file d'attente (playlist), enchaînement auto façon Netflix,
// collage d'un autre lien, mini-lecteur, ou ouverture à côté.
// Un seul lecteur : passer en mini / plein écran ne recharge jamais la vidéo
export function Player({ screen, onClose, onNavigate }) {
  const box = useRef(null);
  const mini = !!screen.mini;
  useEffect(() => { if (!mini && box.current) box.current.removeAttribute("style"); }, [mini]);
  const queue = Array.isArray(screen.queue) && screen.queue.length ? screen.queue : null;
  const qi = queue ? Math.max(0, Math.min(screen.qi || 0, queue.length - 1)) : 0;
  const cur = queue ? queue[qi] : { title: screen.title, url: screen.url };
  const goTo = (i) => { if (!queue) return; const n = (i + queue.length) % queue.length; onNavigate({ ...screen, queue, qi: n, title: queue[n].title, url: queue[n].url }); };
  const next = queue && queue.length > 1 ? () => goTo(qi + 1) : undefined;
  return (
    <div className={mini ? "at-mini" : "at-appwin"} ref={box} data-testid={mini ? "atelier-mini" : "atelier-appwin"}>
      {mini ? <MiniBar box={box} title={cur.title} onExpand={() => onNavigate({ ...screen, mini: false })} onClose={onClose} />
        : <AppBar screen={screen} cur={cur} queue={queue} qi={qi} goTo={goTo} onMini={() => onNavigate({ ...screen, mini: true })} onClose={onClose} onNavigate={onNavigate} />}
      <div className={mini ? "at-mini-body" : "at-appwin-body"}><EmbedFrame key={cur.url} url={cur.url} onEnded={next} /></div>
    </div>
  );
}

function AppBar({ cur, queue, qi, goTo, onMini, onClose, onNavigate }) {
  const hasQ = !!(queue && queue.length > 1);
  const [q, setQ] = useState(cur.url);
  useEffect(() => { setQ(cur.url); }, [cur.url]);
  return (
    <div className="at-appwin-bar">
      {hasQ && <button className="at-icon" onClick={() => goTo(qi - 1)} title="Précédente" data-testid="atelier-appwin-prev"><IoPlayBack size={16} /></button>}
      <b>{cur.title}{hasQ && <small className="mono" style={{ opacity: 0.6, marginLeft: 8 }}>{qi + 1}/{queue.length}</small>}</b>
      <form onSubmit={(e) => { e.preventDefault(); onNavigate({ title: cur.title, url: q.trim() }); }}><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Colle un lien…" data-testid="atelier-appwin-url" /></form>
      {hasQ && <button className="at-icon" onClick={() => goTo(qi + 1)} title="Vidéo suivante" data-testid="atelier-appwin-next"><IoPlayForward size={16} /></button>}
      <button className="at-icon" onClick={onMini} title="Mini-lecteur" data-testid="atelier-appwin-mini"><IoContractOutline size={16} /></button>
      <button className="at-icon" onClick={() => popOut(cur.url)} title="Ouvrir à côté"><IoOpenOutline size={16} /></button>
      <button className="at-icon" onClick={onClose} title="Fermer" data-testid="atelier-appwin-close"><IoClose size={18} /></button>
    </div>
  );
}

function MiniBar({ box, title, onExpand, onClose }) {
  const drag = (e) => {
    const el = box.current; const r = el.getBoundingClientRect(); const dx = e.clientX - r.left; const dy = e.clientY - r.top;
    const move = (ev) => { el.style.left = `${Math.max(0, Math.min(window.innerWidth - r.width, ev.clientX - dx))}px`; el.style.top = `${Math.max(0, Math.min(window.innerHeight - 60, ev.clientY - dy))}px`; el.style.right = "auto"; el.style.bottom = "auto"; };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  return (
    <div className="at-mini-bar" onPointerDown={drag}>
      <span>{title}</span>
      <button onPointerDown={(e) => e.stopPropagation()} onClick={onExpand} aria-label="Agrandir" data-testid="atelier-mini-expand"><IoExpandOutline size={14} /></button>
      <button onPointerDown={(e) => e.stopPropagation()} onClick={onClose} aria-label="Fermer" data-testid="atelier-mini-close"><IoClose size={15} /></button>
    </div>
  );
}

