import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose, IoPlay, IoPause, IoPlayBack, IoPlayForward, IoStop } from "react-icons/io5";
import { useApp } from "@/context/AppContext";
import { mediaUrl } from "@/lib/api";
import { JournalBlocks } from "@/components/journal/JournalParts";
import { tapeStart, tapeRelease, tapeHiss } from "@/lib/tapeSound";
import "@/components/journal/tape.css";

/*
  Une entrée du journal au format « cassette » : un enregistrement qu'on écoute, comme les journaux audio de BioShock.
  On appuie sur lecture : la touche s'enfonce, le moteur démarre, la bande prend de la vitesse, puis la voix arrive.
  Les bobines tournent et se vident d'un côté pour se remplir de l'autre ; le texte de l'entrée sert de transcription.
*/
const mmss = (s) => { if (!isFinite(s)) return "--:--"; const m = Math.floor(s / 60); return `${String(m).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`; };

export default function TapePlayer({ entry: e, onClose }) {
  const { uiVolume = 0.5, muted, pauseReading } = useApp();
  const a = useRef(null); const hiss = useRef(null); const startT = useRef(null);
  const [on, setOn] = useState(false); const [pos, setPos] = useState(0); const [dur, setDur] = useState(0); const [starting, setStarting] = useState(false);
  const vol = muted ? 0 : Math.min(1, (uiVolume ?? 0.5) * 1.1);
  const p = dur ? pos / dur : 0;
  const stopFx = () => { clearTimeout(startT.current); hiss.current?.(); hiss.current = null; };

  const play = () => {
    const el = a.current; if (!el || !e.tape_url) return;
    pauseReading?.(); setStarting(true); setOn(true); tapeStart(vol);
    startT.current = setTimeout(() => { // la voix arrive quand la bande a pris sa vitesse
      el.volume = 0; el.play().then(() => { let v = 0; const f = setInterval(() => { v = Math.min(1, v + 0.1); el.volume = v; if (v >= 1) clearInterval(f); }, 40); }).catch(() => { setOn(false); });
      hiss.current = tapeHiss(vol); setStarting(false);
    }, 650);
  };
  const pause = () => { a.current?.pause(); stopFx(); tapeRelease(vol); setOn(false); setStarting(false); };
  const toggle = () => (on ? pause() : play());
  const seek = (d) => { const el = a.current; if (!el) return; el.currentTime = Math.max(0, Math.min(dur || 0, el.currentTime + d)); setPos(el.currentTime); tapeRelease(vol * 0.6); };
  const stop = () => { pause(); if (a.current) a.current.currentTime = 0; setPos(0); };
  const close = () => { a.current?.pause(); stopFx(); onClose(); };

  useEffect(() => {
    const k = (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); close(); } if (ev.key === " " && !/INPUT|TEXTAREA/.test(ev.target?.tagName)) { ev.preventDefault(); toggle(); } };
    window.addEventListener("keydown", k, true); return () => window.removeEventListener("keydown", k, true);
  });
  useEffect(() => () => { a.current?.pause(); stopFx(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // bobines : la gauche se vide, la droite se remplit
  const rl = 44 - 22 * p, rr = 22 + 22 * p;
  const label = e.tape_label || e.title;
  // un enregistrement n'a pas forcément de texte : alors seule la cassette s'affiche, au centre
  const hasText = (e.blocks || []).some((b) => (b.text || "").trim() || b.url || (b.urls || []).length) || (e.body || "").trim();
  return createPortal(
    <div className={"tp" + (on ? " on" : "") + (starting ? " starting" : "") + (hasText ? "" : " solo")} role="dialog" aria-label={`Cassette : ${e.title}`} data-testid="tape-player">
      <button className="tp-x" onClick={close} aria-label="Fermer" data-testid="tape-close"><IoClose size={18} /></button>
      <div className="tp-deck">
        <div className="tp-cass" aria-hidden="true">
          <span className="tp-screw a" /><span className="tp-screw b" /><span className="tp-screw c" /><span className="tp-screw d" />
          <div className="tp-label">
            <span className="tp-side">A</span>
            <b>{label}</b>
            <small>{[e.tape_voice && `Voix : ${e.tape_voice}`, e.date && new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })].filter(Boolean).join(" · ")}</small>
            <div className="tp-win">
              <span className="tp-reel l" style={{ "--tape": `${rl}px` }}><i /></span>
              <span className="tp-tape" />
              <span className="tp-reel r" style={{ "--tape": `${rr}px` }}><i /></span>
            </div>
          </div>
          <span className="tp-mouth" />
        </div>
        <div className="tp-ctl">
          <span className="tp-count mono" aria-label="Compteur">{String(Math.floor(pos)).padStart(3, "0").slice(-3)}</span>
          <div className="tp-keys">
            <button onClick={() => seek(-10)} aria-label="Reculer de 10 secondes" title="Reculer (10 s)"><IoPlayBack /></button>
            <button className={"play" + (on ? " down" : "")} onClick={toggle} aria-label={on ? "Pause" : "Lecture"} data-testid="tape-play">{on ? <IoPause /> : <IoPlay />}</button>
            <button onClick={() => seek(10)} aria-label="Avancer de 10 secondes" title="Avancer (10 s)"><IoPlayForward /></button>
            <button onClick={stop} aria-label="Stop" title="Stop, retour au début"><IoStop /></button>
          </div>
          <span className="tp-time mono">{mmss(pos)} / {mmss(dur)}</span>
        </div>
        <div className="tp-bar" onClick={(ev) => { const r = ev.currentTarget.getBoundingClientRect(); const el = a.current; if (el && dur) { el.currentTime = ((ev.clientX - r.left) / r.width) * dur; setPos(el.currentTime); } }} role="slider" aria-valuemin={0} aria-valuemax={Math.round(dur)} aria-valuenow={Math.round(pos)} aria-label="Position"><i style={{ width: `${p * 100}%` }} /></div>
        {!e.tape_url && <p className="tp-none">Pas encore d'enregistrement sur cette cassette.</p>}
      </div>
      {!hasText && <p className="tp-solo-t"><b>{e.title}</b>{e.subtitle && <small>{e.subtitle}</small>}</p>}
      {hasText && <article className="tp-script">
        <p className="mono tp-k">TRANSCRIPTION</p>
        <h1>{e.title}</h1>
        {e.subtitle && <p className="tp-sub">{e.subtitle}</p>}
        <div className="tp-text"><JournalBlocks blocks={e.blocks || []} /></div>
      </article>}
      {e.tape_url && <audio ref={a} src={mediaUrl(e.tape_url)} preload="metadata" onLoadedMetadata={(ev) => setDur(ev.currentTarget.duration)} onTimeUpdate={(ev) => setPos(ev.currentTarget.currentTime)} onEnded={() => { stopFx(); tapeRelease(vol); setOn(false); }} />}
    </div>,
    document.body
  );
}
