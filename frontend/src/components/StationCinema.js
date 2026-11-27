import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { createPortal } from "react-dom";
import Cinema from "@/components/atelier/Cinema";
import { useApp } from "@/context/AppContext";
import { mediaUrl } from "@/lib/api";
import "@/components/stationCinema.css";

/*
  Le beau lecteur de l'atelier, sur la station : YouTube est caché derrière nos propres contrôles
  (lecture, ±10 s, vitesse, sous-titres, reprise là où on s'était arrêté), avec « Épisode suivant »
  et un compte à rebours à la fin. Une série verticale (liens Shorts ou création réglée en 9:16) s'affiche en 9:16.
*/
export const isDirectVideo = (u = "") => /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i.test(u) || /^(blob:|data:video)/.test(u) || /\/creations\/[^/]+\/video\?kind=|\/api\/atelier-files\//.test(u);
export const isYouTubeUrl = (u = "") => /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))[\w-]{11}/.test(u);
export const canStationPlay = (u = "") => !!u && (isYouTubeUrl(u) || isDirectVideo(u));
const thumbOf = (u = "") => { const v = (u.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/) || [])[1]; return v ? `https://i.ytimg.com/vi/${v}/hqdefault.jpg` : ""; };
export const isVerticalUrl = (u = "") => /youtube\.com\/shorts\//.test(u);

export default function StationCinema({ queue, start = 0, vertical, onIndex, onClose, info }) {
  const { enterMediaMode, exitMediaMode } = useApp();
  const [qi, setQi] = useState(Math.max(0, Math.min(start, queue.length - 1)));
  const cur = queue[qi] || {};
  const vert = vertical ?? isVerticalUrl(cur.url);
  const direct = isDirectVideo(cur.url);
  useEffect(() => { enterMediaMode?.(); return () => exitMediaMode?.(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { onIndex?.(qi); }, [qi]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const k = (e) => { if (e.key === "Escape" && !document.fullscreenElement) onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  useEffect(() => { document.body.classList.add("st-cine-open"); return () => document.body.classList.remove("st-cine-open"); }, []);
  // Vertical, comme des réels : glisser vers le haut = épisode suivant, vers le bas = précédent
  const sw = useRef(null);
  const go = (d) => setQi((k) => Math.max(0, Math.min(queue.length - 1, k + d)));
  const swipe = vert && queue.length > 1 ? {
    onTouchStart: (e) => { const t = e.touches[0]; sw.current = { x: t.clientX, y: t.clientY, at: Date.now() }; },
    onTouchEnd: (e) => { const a = sw.current; sw.current = null; if (!a) return; const t = e.changedTouches[0]; const dy = t.clientY - a.y; const dx = t.clientX - a.x;
      if (Math.abs(dy) > 70 && Math.abs(dy) > Math.abs(dx) * 1.5 && Date.now() - a.at < 700) go(dy < 0 ? 1 : -1); },
  } : {};
  const img = (x) => x.image || thumbOf(x.url);
  return createPortal(
    <div className={"st-cine" + (vert ? " vert" : "")} role="dialog" aria-label={cur.title || "Lecteur"} data-testid="station-cinema">
      {vert && <div className="st-cine-bg" style={img(cur) ? { backgroundImage: `url(${img(cur)})` } : undefined} aria-hidden="true" />}
      {vert && (
        <aside className="st-cine-info" data-testid="station-cinema-info">
          {info?.work && <p className="mono st-ci-work">{info.work}</p>}
          <p className="mono st-ci-n">{queue.length > 1 ? `ÉPISODE ${qi + 1} / ${queue.length}` : "VIDÉO"}</p>
          <h2>{cur.title}</h2>
          {cur.desc && <p className="st-ci-d">{cur.desc}</p>}
          {queue.length > 1 && <p className="st-ci-hint mono">↑ ↓ OU GLISSER POUR CHANGER D'ÉPISODE</p>}
        </aside>
      )}
      <div className="st-cine-box" {...swipe}>
        <Cinema key={cur.url + ":" + qi} station url={direct ? "" : cur.url} fileSrc={direct ? mediaUrl(cur.url) : undefined} title={cur.title} queue={queue.length > 1 ? queue : undefined} qi={qi} goTo={setQi} onClose={onClose} />
      </div>
      {vert && queue.length > 1 && (
        <aside className="st-cine-list" aria-label="Épisodes" data-testid="station-cinema-list">
          {queue.map((x, k) => (
            <button key={k} className={k === qi ? "on" : ""} onClick={() => setQi(k)}>
              <span className="th" style={img(x) ? { backgroundImage: `url(${img(x)})` } : undefined}>{k === qi && <em className="mono">EN COURS</em>}</span>
              <span className="tx"><small className="mono">{String(k + 1).padStart(2, "0")}</small><b>{x.title}</b></span>
            </button>
          ))}
        </aside>
      )}
      {vert && <button className="st-cine-x" onClick={onClose} aria-label="Fermer le lecteur" data-testid="station-cinema-close"><IoClose size={22} /><span>Fermer</span></button>}
    </div>,
    document.body
  );
}
