import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoClose, IoArrowBack, IoArrowForward, IoSparkles, IoPlay } from "react-icons/io5";
import { getSettings, listAmbiences, listCreations } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { THEMES } from "@/lib/themes";
import { TOUR_STEPS } from "@/lib/tourSteps";

const DONE_KEY = "sx_tour_done";
const ROUTE = { home: "/", planning: "/planning", salon: "/salon", members: "/membres", contact: "/contact", about: "/a-propos", support: "/soutien", settings: "/parametres", theme: "/parametres", accent: "/parametres", music: "/parametres", reading: "/parametres", end: "/" };

export default function GuidedTour() {
  const nav = useNavigate();
  const { theme, setTheme, accent, setAccent, ambienceId, selectAmbience, readerFont, setReaderFont, readerSize, setReaderSize, sfx } = useApp();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const { data: ambiences = [] } = useQuery({ queryKey: ["ambiences"], queryFn: listAmbiences });
  const { data: creations = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const [phase, setPhase] = useState("hidden");
  const [idx, setIdx] = useState(0);
  const snap = useRef(null);
  const bunny = settings?.cosmic_bunny_image || "/cosmic-bunny/wave.png";
  const texts = settings?.tour_texts || {};
  const creationId = creations[0]?.id;

  const routeFor = (key) => (key === "creation" ? (creationId ? `/oeuvre/${creationId}` : "/") : (ROUTE[key] || "/"));
  const runFor = (key) => {
    if (key === "theme") { const keys = (THEMES || []).map((t) => t.key); const other = keys.find((k) => k !== theme) || keys[0]; if (other) setTheme(other); }
    else if (key === "accent") setAccent("#ff5d8f");
    else if (key === "music") { if (ambiences[0]?.id) selectAmbience(ambiences[0].id); }
    else if (key === "reading") { setReaderFont("sans"); setReaderSize(23); }
  };

  const restore = useCallback(() => {
    const s = snap.current; if (!s) return;
    setTheme(s.theme); setAccent(s.accent); selectAmbience(s.ambienceId); setReaderFont(s.readerFont); setReaderSize(s.readerSize);
  }, [setTheme, setAccent, selectAmbience, setReaderFont, setReaderSize]);

  const finish = useCallback(() => { restore(); localStorage.setItem(DONE_KEY, "1"); setPhase("hidden"); setIdx(0); }, [restore]);
  const start = useCallback(() => { snap.current = { theme, accent, ambienceId, readerFont, readerSize }; setIdx(0); setPhase("running"); }, [theme, accent, ambienceId, readerFont, readerSize]);

  useEffect(() => {
    const maybe = () => { if (!localStorage.getItem(DONE_KEY) && sessionStorage.getItem("sx_entered")) setPhase((p) => (p === "hidden" ? "welcome" : p)); };
    const t = setTimeout(maybe, 1200);
    const onEntered = () => setTimeout(maybe, 400);
    const onStart = () => start();
    window.addEventListener("sx-entered", onEntered);
    window.addEventListener("sx-start-tour", onStart);
    return () => { clearTimeout(t); window.removeEventListener("sx-entered", onEntered); window.removeEventListener("sx-start-tour", onStart); };
  }, [start]);

  useEffect(() => {
    if (phase !== "running") return;
    const step = TOUR_STEPS[idx]; if (!step) return;
    nav(routeFor(step.key));
    const t = setTimeout(() => { runFor(step.key); sfx("nav"); }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, phase]);

  if (phase === "hidden") return null;
  const meta = TOUR_STEPS[idx] || {};
  const stepTitle = texts[meta.key]?.title || meta.title;
  const stepText = texts[meta.key]?.text || meta.text;

  if (phase === "welcome") {
    return (
      <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-4" data-testid="tour-welcome" style={{ background: "rgba(8,6,12,0.7)", backdropFilter: "blur(4px)" }}>
        <div className="w-full max-w-sm text-center px-6 py-7 sx-celebrate-pop" style={{ background: "var(--bg-secondary)", border: "1px solid var(--brand)", borderRadius: "var(--radius-lg, 18px)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
          <div className="flex justify-center mb-3">
            <div className="sx-celebrate-bounce" style={{ width: 96, height: 96, borderRadius: "50%", overflow: "hidden", border: "3px solid var(--brand)" }}>
              <img src={bunny} alt="Cosmic Bunny" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/cosmic-bunny/neutral.png"; }} />
            </div>
          </div>
          <h2 className="font-display text-2xl mb-2" style={{ color: "var(--brand)" }}>Hey, c'est ta première fois ici ? 👀</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-primary)" }}>Ça te dit une petite visite guidée pour faire le tour du propriétaire ? Je te montre tout ! 🐰</p>
          <div className="flex flex-col gap-2">
            <button data-testid="tour-start" onClick={start} className="flex items-center justify-center gap-2 px-5 py-3 font-semibold transition-transform hover:scale-105" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}><IoPlay size={16} /> C'est parti !</button>
            <button data-testid="tour-skip" onClick={finish} className="text-sm py-2" style={{ color: "var(--text-secondary)" }}>Passer la visite</button>
          </div>
        </div>
      </div>
    );
  }

  const last = idx === TOUR_STEPS.length - 1;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[130] p-3 sm:p-5 flex justify-center pointer-events-none" data-testid="tour-step">
      <div className="w-full max-w-lg pointer-events-auto sx-celebrate-pop" style={{ background: "var(--bg-secondary)", border: "1px solid var(--brand)", borderRadius: "var(--radius-lg, 16px)", boxShadow: "0 -8px 40px rgba(0,0,0,0.5)" }}>
        <div className="flex items-start gap-3 p-4">
          <div className="sx-celebrate-bounce flex-none" style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--brand)" }}>
            <img src={bunny} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/cosmic-bunny/neutral.png"; }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-lg" style={{ color: "var(--brand)" }} data-testid="tour-title">{stepTitle}</p>
              <button data-testid="tour-close" onClick={finish} style={{ color: "var(--text-secondary)" }}><IoClose size={18} /></button>
            </div>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--text-primary)" }} data-testid="tour-text">{stepText}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{idx + 1} / {TOUR_STEPS.length}</span>
              <div className="flex items-center gap-2">
                {idx > 0 && <button data-testid="tour-prev" onClick={() => setIdx((i) => i - 1)} className="flex items-center gap-1 px-3 py-2 border text-sm" style={{ borderColor: "var(--border-c)", color: "var(--text-primary)", borderRadius: "var(--radius-base)" }}><IoArrowBack size={14} /></button>}
                {last
                  ? <button data-testid="tour-finish" onClick={finish} className="flex items-center gap-1.5 px-4 py-2 font-semibold text-sm" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}><IoSparkles size={15} /> Terminer</button>
                  : <button data-testid="tour-next" onClick={() => setIdx((i) => i + 1)} className="flex items-center gap-1.5 px-4 py-2 font-semibold text-sm" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>Suivant <IoArrowForward size={14} /></button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
