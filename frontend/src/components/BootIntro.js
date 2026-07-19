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

function NeonAnim() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: "100%", height: "100%" }}>
      <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 4px)", animation: "introScan 2.5s linear infinite" }} />
      <div className="relative text-center" style={{ animation: "introGlitch 0.25s steps(2) 0.4s 6" }}>
        <div className="font-display text-4xl md:text-6xl" style={{ color: "var(--brand)", textShadow: "0 0 18px var(--brand)", letterSpacing: "0.2em" }}>STATIONEXUS</div>
        <div className="font-display text-lg mt-2" style={{ color: "#fff", opacity: 0.7, letterSpacing: "0.5em" }}>電 起動</div>
      </div>
    </div>
  );
}

function InkAnim() {
  return (
    <div className="relative flex flex-col items-center justify-center gap-6">
      <div className="relative flex items-center justify-center rounded-full" style={{ width: "40vmin", height: "40vmin", background: "radial-gradient(circle, var(--brand) 0%, rgba(0,0,0,0.9) 70%)", filter: "blur(2px)", animation: "introInk 1.6s ease forwards" }}>
        <span className="font-display" style={{ color: "#fff", fontSize: "18vmin", opacity: 0, animation: "introKanjiPop 1.2s ease 0.9s forwards" }}>墨</span>
      </div>
      <Logo delay={1.8} />
    </div>
  );
}

const ANIMS = { tengoku: TengokuAnim, kanji: KanjiAnim, neon: NeonAnim, ink: InkAnim };

export default function BootIntro({ type, hasVideo, onDone }) {
  const { muted, uiVolume } = useApp();
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setLeaving(true);
    setTimeout(onDone, 600);
  }, [onDone]);

  const isVideo = type === "video" && hasVideo;
  const Anim = ANIMS[type] || TengokuAnim;
  const duration = INTROS.find((i) => i.key === type)?.duration || 3000;

  useEffect(() => {
    if (!isVideo) playBoot(type, { muted, volume: uiVolume });
    const t = setTimeout(finish, isVideo ? 15000 : duration);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, []);

  return (
    <div className={`intro-root ${leaving ? "intro-out" : ""}`} onClick={finish} data-testid="boot-intro">
      {isVideo ? (
        <video src={introVideoUrl()} autoPlay playsInline muted={muted} onEnded={finish} onError={finish}
          className="w-full h-full object-cover" data-testid="boot-video" />
      ) : (
        <>
          <Anim />
          <ProgressBar duration={duration} />
        </>
      )}

      <button className="intro-skip flex items-center gap-1.5 px-4 py-2 border text-sm"
        style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff", borderRadius: "var(--radius-base)", background: "rgba(0,0,0,0.35)" }}
        onClick={(e) => { e.stopPropagation(); finish(); }} data-testid="boot-skip">
        Passer ›
      </button>
      <p className="intro-hint" style={{ color: "rgba(255,255,255,0.4)" }}>Clique pour passer</p>
    </div>
  );
}
