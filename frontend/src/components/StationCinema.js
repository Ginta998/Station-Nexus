import { useEffect, useState } from "react";
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
export const isVerticalUrl = (u = "") => /youtube\.com\/shorts\//.test(u);

export default function StationCinema({ queue, start = 0, vertical, onIndex, onClose }) {
  const { enterMediaMode, exitMediaMode } = useApp();
  const [qi, setQi] = useState(Math.max(0, Math.min(start, queue.length - 1)));
  const cur = queue[qi] || {};
  const vert = vertical ?? isVerticalUrl(cur.url);
  const direct = isDirectVideo(cur.url);
  useEffect(() => { enterMediaMode?.(); return () => exitMediaMode?.(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { onIndex?.(qi); }, [qi]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const k = (e) => { if (e.key === "Escape" && !document.fullscreenElement) onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  useEffect(() => { document.body.classList.add("st-cine-open"); return () => document.body.classList.remove("st-cine-open"); }, []);
  return createPortal(
    <div className={"st-cine" + (vert ? " vert" : "")} role="dialog" aria-label={cur.title || "Lecteur"} data-testid="station-cinema">
      <div className="st-cine-box">
        <Cinema key={cur.url + ":" + qi} station url={direct ? "" : cur.url} fileSrc={direct ? mediaUrl(cur.url) : undefined} title={cur.title} queue={queue.length > 1 ? queue : undefined} qi={qi} goTo={setQi} onClose={onClose} />
      </div>
    </div>,
    document.body
  );
}
