import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { INTROS, playBoot } from "@/lib/intro";
import { introVideoUrl } from "@/lib/api";

function Logo({ delay = 1.4 }) {
  return (
    <div className="font-display text-3xl md:text-5xl" style={{ color: "#fff", opacity: 0, animation: `introWord 0.8s ease ${delay}s forwards`, letterSpacing: "0.15em" }}>
      STATION<span style={{ color: "var(--brand)" }}>EXUS</span>
    </div>
  );
}

function ProgressBar({ duration }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: 70, width: "min(60vw,320px)", height: 2, background: "rgba(255,255,255,0.12)" }}>
      <div style={{ height: "100%", background: "var(--brand)", animation: `introBarWipe ${duration}ms linear forwards` }} />
    </div>
  );
}

function TengokuAnim() {
  return (
    <div className="relative flex flex-col items-center justify-center gap-6">
      <div className="relative flex items-center justify-center rounded-full" style={{ width: "38vmin", height: "38vmin", background: "var(--brand)", animation: "introSun 1.1s cubic-bezier(.2,.8,.2,1) forwards, introSunGlow 2.4s ease 1.1s infinite" }}>
        <span className="font-display" style={{ color: "#fff", fontSize: "16vmin", opacity: 0, animation: "introKanjiPop 1s ease 0.7s forwards" }}>天</span>
        <div className="absolute" style={{ top: "48%", left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, transparent, #fff, transparent)", animation: "introSlash 0.7s ease 0.9s" }} />
      </div>
      <Logo delay={1.5} />
    </div>
  );
}

function KanjiAnim() {
  const chars = ["書", "物", "語", "夢", "光", "心", "刀", "花", "星", "海"];
  return (
    <div className="relative flex items-center justify-center" style={{ width: "80vmin", height: "80vmin" }}>
      {chars.map((ch, i) => {
        const dx = `${(Math.cos((i / chars.length) * 6.28) * 40).toFixed(0)}vmin`;
        const dy = `${(Math.sin((i / chars.length) * 6.28) * 40).toFixed(0)}vmin`;
        return (
          <span key={i} className="absolute font-display" style={{ color: "var(--brand)", fontSize: "9vmin", "--dx": dx, "--dy": dy, "--dr": `${i * 30}deg`, opacity: 0, animation: `introDrift 2.2s ease ${i * 0.05}s forwards` }}>{ch}</span>
        );
      })}
      <div className="absolute"><Logo delay={1.3} /></div>
    </div>
  );
}

function PulseAnim() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: "100%", height: "100%" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="absolute rounded-full" style={{ width: "18vmin", height: "18vmin", border: "2px solid var(--brand)", opacity: 0, animation: `introPulseRing 2.2s ease-out ${i * 0.5}s infinite` }} />
      ))}
      <div className="relative flex items-center justify-center rounded-full" style={{ width: "22vmin", height: "22vmin", background: "var(--brand)", animation: "introPulseCore 2.2s ease-in-out infinite" }}>
        <span className="font-display" style={{ color: "#fff", fontSize: "9vmin" }}>天</span>
      </div>
      <div className="absolute" style={{ bottom: "22%" }}><Logo delay={0.9} /></div>
    </div>
  );
}

function TowersAnim() {
  const bars = Array.from({ length: 12 });
  return (
    <div className="relative flex flex-col items-center justify-center gap-8" style={{ width: "100%", height: "100%" }}>
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-2" style={{ height: "60%" }}>
        {bars.map((_, i) => (
          <span key={i} style={{ width: "2.2vmin", background: "linear-gradient(to top, var(--brand), transparent)", height: 0, animation: `introTower 1.4s cubic-bezier(.2,.8,.2,1) ${i * 0.08}s forwards`, opacity: 0.85 }} />
        ))}
      </div>
      <div className="relative z-10 text-center">
        <div className="font-display" style={{ color: "#fff", fontSize: "12vmin", opacity: 0, animation: "introKanjiPop 1.1s ease 0.9s forwards" }}>光</div>
        <div style={{ opacity: 0, animation: "introWord 0.8s ease 1.5s forwards" }}><Logo delay={0} /></div>
      </div>
    </div>
  );
}

const ANIMS = { tengoku: TengokuAnim, kanji: KanjiAnim, pulse: PulseAnim, towers: TowersAnim };

export default function BootIntro({ type, hasVideo, onDone }) {
  const { muted, uiVolume, primeAudio } = useApp();
  const [leaving, setLeaving] = useState(false);
  const [ready, setReady] = useState(false);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    try { primeAudio(); } catch (_) {}
    setLeaving(true);
    setTimeout(onDone, 600);
  }, [onDone, primeAudio]);

  const isVideo = type === "video" && hasVideo;
  const Anim = ANIMS[type] || TengokuAnim;
  const duration = INTROS.find((i) => i.key === type)?.duration || 3000;

  useEffect(() => {
    if (!isVideo) playBoot(type, { muted, volume: uiVolume });
    // reveal the "Enter" prompt after the animation; user gesture unlocks audio
    const t = setTimeout(() => setReady(true), isVideo ? 12000 : duration);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, []);

  return (
    <div className={`intro-root ${leaving ? "intro-out" : ""}`} onClick={ready ? finish : undefined} data-testid="boot-intro">
      {isVideo ? (
        <video src={introVideoUrl()} autoPlay playsInline muted={muted} onEnded={() => setReady(true)} onError={() => setReady(true)}
          className="w-full h-full object-cover" data-testid="boot-video" />
      ) : (
        <>
          <Anim />
          {!ready && <ProgressBar duration={duration} />}
        </>
      )}

      {ready && (
        <button onClick={(e) => { e.stopPropagation(); finish(); }} data-testid="boot-enter"
          className="absolute left-1/2 -translate-x-1/2 px-10 py-3.5 font-display text-lg tracking-widest uppercase"
          style={{ bottom: 64, color: "var(--bg-primary)", background: "var(--brand)", borderRadius: "var(--radius-base)", boxShadow: "0 0 40px var(--brand)", animation: "introWord 0.6s ease forwards, introSunGlow 2.4s ease infinite" }}>
          Entrer
        </button>
      )}

      <button className="intro-skip flex items-center gap-1.5 px-4 py-2 border text-sm"
        style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff", borderRadius: "var(--radius-base)", background: "rgba(0,0,0,0.35)" }}
        onClick={(e) => { e.stopPropagation(); finish(); }} data-testid="boot-skip">
        Passer ›
      </button>
      {!ready && <p className="intro-hint" style={{ color: "rgba(255,255,255,0.4)" }}>Clique pour entrer</p>}
    </div>
  );
}
