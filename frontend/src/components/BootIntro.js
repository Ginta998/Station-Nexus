import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { INTROS, playBoot } from "@/lib/intro";
import { introVideoUrl } from "@/lib/api";
import { pickWelcome } from "@/lib/social";

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

function SlashAnim() {
  const lines = Array.from({ length: 9 });
  return (
    <div className="relative flex items-center justify-center" style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      {/* speed lines */}
      <div className="absolute inset-0">
        {lines.map((_, i) => (
          <span key={i} className="absolute" style={{ top: `${6 + i * 10.5}%`, left: 0, width: "62%", height: "2px", background: "linear-gradient(90deg, transparent, var(--brand), #fff, transparent)", opacity: 0, animation: `introSpeed 0.85s ease ${i * 0.05}s forwards` }} />
        ))}
      </div>
      {/* crossing katana streaks */}
      <span className="absolute" style={{ width: "150%", height: "7px", background: "linear-gradient(90deg, transparent, #fff, transparent)", opacity: 0, animation: "introSlashStreak 0.65s cubic-bezier(.4,0,.2,1) 0.7s forwards" }} />
      <span className="absolute" style={{ width: "150%", height: "4px", background: "linear-gradient(90deg, transparent, var(--brand), transparent)", opacity: 0, animation: "introSlashStreak2 0.65s cubic-bezier(.4,0,.2,1) 0.95s forwards" }} />
      {/* impact flash */}
      <div className="absolute inset-0" style={{ background: "#fff", opacity: 0, animation: "introFlash 1.4s ease 0.9s" }} />
      {/* kanji */}
      <div className="relative z-10 text-center">
        <div className="font-display" style={{ color: "#fff", fontSize: "22vmin", opacity: 0, textShadow: "0 0 45px var(--brand)", animation: "introKanjiPop 0.8s ease 1.0s forwards, introGlitch 0.28s steps(2) 1.05s 2" }}>閃</div>
        <div style={{ opacity: 0, animation: "introWord 0.7s ease 1.6s forwards" }}><Logo delay={0} /></div>
      </div>
    </div>
  );
}

function HanabiAnim() {
  const parts = Array.from({ length: 30 });
  const colors = ["var(--brand)", "#ffd400", "#00fff5", "#ff4dcb", "#ffffff"];
  return (
    <div className="relative flex items-center justify-center" style={{ width: "92vmin", height: "92vmin" }}>
      {[0, 1, 2].map((i) => (
        <span key={"r" + i} className="absolute rounded-full" style={{ width: "20vmin", height: "20vmin", border: "2px solid var(--brand)", opacity: 0, animation: `introPulseRing 1.8s ease-out ${0.35 + i * 0.22}s forwards` }} />
      ))}
      {parts.map((_, i) => {
        const a = (i / parts.length) * 6.2832;
        const d = 30 + (i % 5) * 3;
        return (
          <span key={i} className="absolute rounded-full" style={{
            width: "1.5vmin", height: "1.5vmin", background: colors[i % colors.length],
            "--bx": `${(Math.cos(a) * d).toFixed(0)}vmin`, "--by": `${(Math.sin(a) * d).toFixed(0)}vmin`,
            opacity: 0, boxShadow: `0 0 10px ${colors[i % colors.length]}`,
            animation: `introBurst 1.7s cubic-bezier(.15,.7,.3,1) ${0.4 + (i % 6) * 0.03}s forwards`,
          }} />
        );
      })}
      <div className="absolute z-10 text-center">
        <div className="font-display" style={{ color: "#fff", fontSize: "18vmin", opacity: 0, textShadow: "0 0 55px var(--brand)", animation: "introKanjiPop 0.9s ease 0.5s forwards, introSunGlow 2.2s ease 1.2s infinite" }}>華</div>
        <div style={{ opacity: 0, animation: "introWord 0.7s ease 1.3s forwards" }}><Logo delay={0} /></div>
      </div>
    </div>
  );
}

const ANIMS = { tengoku: TengokuAnim, kanji: KanjiAnim, pulse: PulseAnim, towers: TowersAnim, slash: SlashAnim, hanabi: HanabiAnim };

export default function BootIntro({ type, hasVideo, onDone, welcomeMessages }) {
  const { muted, uiVolume, primeAudio, profile } = useApp();
  const [leaving, setLeaving] = useState(false);
  const [ready, setReady] = useState(false);
  const doneRef = useRef(false);
  const welcome = useMemo(() => (profile ? pickWelcome(welcomeMessages, profile.name) : null), []); // eslint-disable-line

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
          {!ready && <Anim />}
          {!ready && <ProgressBar duration={duration} />}
        </>
      )}

      {ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 text-center" data-testid="boot-ready">
          {profile ? (
            <div className="flex flex-col items-center gap-5" style={{ animation: "introWord 0.7s ease forwards" }} data-testid="boot-profile">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex items-center justify-center"
                style={{ border: "3px solid var(--brand)", boxShadow: "0 0 55px var(--brand)", background: "rgba(0,0,0,0.4)" }}>
                {profile.avatar
                  ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  : <span className="font-display text-6xl" style={{ color: "var(--brand)" }}>{(profile.name || "?")[0].toUpperCase()}</span>}
              </div>
              <div className="font-display text-3xl sm:text-4xl md:text-5xl" style={{ color: "#fff", textShadow: "0 2px 40px rgba(0,0,0,0.7)" }} data-testid="boot-welcome">
                {welcome}
              </div>
            </div>
          ) : (
            <div className="font-display text-4xl sm:text-5xl md:text-6xl" style={{ color: "#fff", letterSpacing: "0.15em", textShadow: "0 2px 40px rgba(0,0,0,0.7)", animation: "introWord 0.7s ease forwards" }}>
              STATION<span style={{ color: "var(--brand)" }}>EXUS</span>
              <span className="font-display text-2xl ml-2" style={{ color: "var(--brand)", opacity: 0.8 }}>天</span>
            </div>
          )}
          <button onClick={(e) => { e.stopPropagation(); finish(); }} data-testid="boot-enter"
            className="px-16 py-4 font-display text-xl md:text-2xl tracking-[0.25em] uppercase transition-transform hover:scale-105"
            style={{ color: "var(--bg-primary)", background: "var(--brand)", borderRadius: "var(--radius-base)", boxShadow: "0 0 50px var(--brand)", animation: "introWord 0.6s ease 0.15s both, introSunGlow 2.6s ease 0.8s infinite" }}>
            Entrer
          </button>
        </div>
      )}

      <button className="intro-skip flex items-center gap-1.5 px-4 py-2 border text-sm"
        style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff", borderRadius: "var(--radius-base)", background: "rgba(0,0,0,0.35)" }}
        onClick={(e) => { e.stopPropagation(); finish(); }} data-testid="boot-skip">
        Passer ›
      </button>
      {!ready && <p className="intro-hint" style={{ color: "rgba(255,255,255,0.4)" }}>Chargement…</p>}
    </div>
  );
}
