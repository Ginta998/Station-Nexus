import { useRef, useState } from "react";
import { IoClose, IoOpenOutline, IoContractOutline, IoExpandOutline } from "react-icons/io5";
import { toEmbed, popOut } from "@/lib/embed";
import { imgSrc } from "@/lib/atelier";

export function EmbedFrame({ url }) {
  const e = toEmbed(url);
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
      {e.video ? <video src={imgSrc(e.video)} controls autoPlay playsInline /> : e.audio ? <audio src={imgSrc(e.audio)} controls autoPlay /> :
        <iframe title={e.provider} src={e.src} allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
      {(e.note || e.maybe) && <p className="at-embed-note">{e.note || "Page vide ? Ce site bloque peut-être l'intégration."} <span onClick={() => popOut(url)}>Ouvrir à côté ↗</span></p>}
    </div>
  );
}

// Écran plein (dans l'Atelier) : colle un autre lien, réduis en mini-lecteur, ou ouvre à côté
export function AppWindow({ screen, onClose, onMini, onNavigate }) {
  const [q, setQ] = useState(screen.url);
  return (
    <div className="at-appwin" data-testid="atelier-appwin">
      <div className="at-appwin-bar">
        <b>{screen.title}</b>
        <form onSubmit={(e) => { e.preventDefault(); onNavigate({ title: screen.title, url: q.trim() }); }}><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Colle un lien…" data-testid="atelier-appwin-url" /></form>
        <button className="at-icon" onClick={() => onMini(screen)} title="Mini-lecteur" data-testid="atelier-appwin-mini"><IoContractOutline size={16} /></button>
        <button className="at-icon" onClick={() => popOut(screen.url)} title="Ouvrir à côté"><IoOpenOutline size={16} /></button>
        <button className="at-icon" onClick={onClose} title="Fermer" data-testid="atelier-appwin-close"><IoClose size={18} /></button>
      </div>
      <div className="at-appwin-body"><EmbedFrame key={screen.url} url={screen.url} /></div>
    </div>
  );
}

// Mini-lecteur flottant et déplaçable : continue de jouer pendant que tu écris
export function MiniPlayer({ mini, onClose, onExpand }) {
  const box = useRef(null);
  const drag = (e) => {
    const el = box.current; const r = el.getBoundingClientRect(); const dx = e.clientX - r.left; const dy = e.clientY - r.top;
    const move = (ev) => { el.style.left = `${Math.max(0, Math.min(window.innerWidth - r.width, ev.clientX - dx))}px`; el.style.top = `${Math.max(0, Math.min(window.innerHeight - 60, ev.clientY - dy))}px`; el.style.right = "auto"; el.style.bottom = "auto"; };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  return (
    <div className="at-mini" ref={box} data-testid="atelier-mini">
      <div className="at-mini-bar" onPointerDown={drag}>
        <span>{mini.title}</span>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onExpand(mini)} aria-label="Agrandir"><IoExpandOutline size={14} /></button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={onClose} aria-label="Fermer" data-testid="atelier-mini-close"><IoClose size={15} /></button>
      </div>
      <EmbedFrame key={mini.url} url={mini.url} />
    </div>
  );
}
