import { useEffect, useRef, useState, useCallback } from "react";
import { IoClose, IoBulbOutline, IoBulb, IoExpandOutline, IoContractOutline, IoFilmOutline } from "react-icons/io5";
import { useApp } from "@/context/AppContext";
import { videoUrl } from "@/lib/api";
import { resolveVideoEmbed } from "@/lib/video";

// Immersive cinema-mode player. kind = "film" | "trailer"
export default function CinemaPlayer({ item, kind = "film", onClose }) {
  const { sfx, enterMediaMode, exitMediaMode } = useApp();
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const hideTimer = useRef(null);
  const [dim, setDim] = useState(true);        // "lights off" for immersion (default on)
  const [fs, setFs] = useState(false);
  const [showBars, setShowBars] = useState(true);
  const [intro, setIntro] = useState(true);    // cinema entrance (curtains) animation

  useEffect(() => { const t = setTimeout(() => setIntro(false), 1200); return () => clearTimeout(t); }, []);

  const hasUpload = kind === "film" ? item.has_film : item.has_trailer;
  const link = kind === "film" ? item.film_url : item.trailer_url;
  const source = (link && link.trim())
    ? resolveVideoEmbed(link)
    : (hasUpload ? { type: "video", src: videoUrl(item.id, kind, item.updated_at) } : null);

  const label = kind === "trailer" ? "Bande-annonce" : (item.launch_label || "Film");

  // Signal Cosmic Bunny cinema context (she explains this mode the first time)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("sx-cb-context", { detail: "cinema" }));
    return () => window.dispatchEvent(new CustomEvent("sx-cb-context", { detail: null }));
  }, []);

  // Immersive audio: only the film plays. Silence app/card ambience while open, restore on exit.
  useEffect(() => {
    enterMediaMode();
    return () => exitMediaMode();
    // eslint-disable-next-line
  }, []);

  // Auto-hide the control bars after inactivity
  const poke = useCallback(() => {
    setShowBars(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowBars(false), 3200);
  }, []);
  useEffect(() => { poke(); return () => hideTimer.current && clearTimeout(hideTimer.current); }, [poke]);

  useEffect(() => {
    const onFsChange = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    const onKey = (e) => { if (e.key === "Escape" && !document.fullscreenElement) close(); };
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("fullscreenchange", onFsChange); window.removeEventListener("keydown", onKey); };
    // eslint-disable-next-line
  }, []);

  const close = () => { try { if (document.fullscreenElement) document.exitFullscreen(); } catch (_) {} sfx && sfx("back"); onClose(); };
  const toggleFs = async () => {
    sfx && sfx("nav");
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await rootRef.current?.requestFullscreen(); } catch (_) {}
  };

  const barStyle = { transition: "opacity 0.4s ease, transform 0.4s ease", opacity: showBars ? 1 : 0, pointerEvents: showBars ? "auto" : "none" };
  const btn = { color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "999px", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" };

  return (
    <div ref={rootRef} data-testid="cinema-player"
      onMouseMove={poke} onClick={poke}
      className="fixed inset-0 z-[55] flex flex-col items-center justify-center"
      style={{ background: "#000", cursor: showBars ? "default" : "none" }}>

      {/* Theater ambience — clear contrast between lights ON and OFF */}
      <div aria-hidden="true" className="absolute inset-0" style={{ transition: "opacity 0.6s ease", opacity: dim ? 0 : 1,
        background: "radial-gradient(95% 75% at 50% 42%, color-mix(in srgb, var(--brand) 26%, #201318) 0%, rgba(26,16,20,0.65) 42%, #0a0709 78%)" }} />
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ transition: "box-shadow 0.6s ease, background 0.6s ease",
        boxShadow: dim ? "inset 0 0 320px 130px #000" : "inset 0 0 150px 30px rgba(0,0,0,0.7)",
        background: dim ? "rgba(0,0,0,0.55)" : "transparent" }} />
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-[12vw]" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.85), transparent)" }} />
      <div aria-hidden="true" className="absolute inset-y-0 right-0 w-[12vw]" style={{ background: "linear-gradient(270deg, rgba(0,0,0,0.85), transparent)" }} />

      {/* Entrance: curtains opening */}
      {intro && (
        <div className="cinema-curtains" data-testid="cinema-curtains" aria-hidden="true">
          <span className="cinema-curtain cinema-curtain-l" />
          <span className="cinema-curtain cinema-curtain-r" />
        </div>
      )}

      {/* Top bar */}
      <div className="sx-safe-top absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 md:px-8 py-4" style={barStyle}>
        <div className="flex items-center gap-2.5 min-w-0">
          <IoFilmOutline size={20} style={{ color: "var(--brand)", flexShrink: 0 }} />
          <div className="min-w-0">
            <p className="font-display text-base md:text-lg truncate" style={{ color: "#fff" }} data-testid="cinema-title">{item.title}</p>
            <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--brand)" }}>{label}</p>
          </div>
        </div>
        <button data-testid="cinema-close" onClick={close} className="p-2.5 transition-transform hover:scale-105" style={btn} title="Fermer (Échap)"><IoClose size={22} /></button>
      </div>

      {/* Screen */}
      <div className="relative z-10 w-[86vw] max-w-6xl" style={{ aspectRatio: "16 / 9", boxShadow: "0 0 80px 8px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)", borderRadius: "8px", overflow: "hidden", background: "#000", animation: "cinemaScreenIn 1.1s cubic-bezier(.2,.7,.2,1) both" }} data-testid="cinema-screen">
        {!source ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center px-6" style={{ color: "rgba(255,255,255,0.7)" }}>
            <IoFilmOutline size={44} style={{ color: "var(--brand)", marginBottom: 12 }} />
            <p className="font-display text-xl" style={{ color: "#fff" }}>Le film sera bientôt disponible</p>
            <p className="text-sm mt-1">Aucune source vidéo n'a encore été ajoutée à cette création.</p>
          </div>
        ) : source.type === "video" ? (
          <video ref={videoRef} data-testid="cinema-video" src={source.src} controls autoPlay playsInline
            className="w-full h-full" style={{ background: "#000" }} />
        ) : (
          <iframe data-testid="cinema-iframe" src={source.src} title={item.title} className="w-full h-full" frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
        )}
      </div>

      {/* Bottom immersion controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 md:gap-3 px-4 py-5" style={barStyle}>
        <button data-testid="cinema-lights" onClick={() => { setDim((v) => !v); sfx && sfx("nav"); }} className="flex items-center gap-2 px-4 py-2.5 text-sm transition-transform hover:scale-105" style={btn} title="Ambiance lumineuse">
          {dim ? <IoBulbOutline size={18} /> : <IoBulb size={18} style={{ color: "var(--brand)" }} />}
          <span className="hidden sm:inline">{dim ? "Allumer les lumières" : "Baisser les lumières"}</span>
        </button>
        <button data-testid="cinema-fullscreen" onClick={toggleFs} className="p-2.5 transition-transform hover:scale-105" style={btn} title={fs ? "Quitter le plein écran" : "Plein écran"}>
          {fs ? <IoContractOutline size={20} /> : <IoExpandOutline size={20} />}
        </button>
      </div>
    </div>
  );
}
