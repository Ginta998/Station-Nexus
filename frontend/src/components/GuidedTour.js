import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoClose, IoArrowBack, IoArrowForward, IoSparkles, IoPlay } from "react-icons/io5";
import { getSettings, listAmbiences } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { THEMES } from "@/lib/themes";

const DONE_KEY = "sx_tour_done";

export default function GuidedTour() {
  const nav = useNavigate();
  const { theme, setTheme, setAccent, selectAmbience, setReaderFont, setReaderSize, sfx } = useApp();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const { data: ambiences = [] } = useQuery({ queryKey: ["ambiences"], queryFn: listAmbiences });
  const [phase, setPhase] = useState("hidden"); // hidden | welcome | running
  const [idx, setIdx] = useState(0);
  const bunny = settings?.cosmic_bunny_image || "/cosmic-bunny/wave.png";

  const demoTheme = useCallback(() => { const keys = (THEMES || []).map((t) => t.key).filter(Boolean); const other = keys.find((k) => k !== theme) || keys[0]; if (other) setTheme(other); }, [theme, setTheme]);
  const demoAccent = useCallback(() => setAccent("#ff5d8f"), [setAccent]);
  const demoMusic = useCallback(() => { if (ambiences[0]?.id) selectAmbience(ambiences[0].id); }, [ambiences, selectAmbience]);
  const demoFont = useCallback(() => { setReaderFont("sans"); setReaderSize(23); }, [setReaderFont, setReaderSize]);

  const STEPS = [
    { route: "/", title: "L'accueil 🏠", text: "Voici ta station ! Toutes les créations rangées par catégories. Tu peux changer l'affichage en cartes, grille ou liste quand tu veux." },
    { route: "/planning", title: "Le Planning 🗓️", text: "Ici tu vois tout ce qui arrive, avec un compte à rebours en direct. Tu peux même ajouter une sortie à ton agenda pour ne rien louper !" },
    { route: "/salon", title: "Le Salon 💬", text: "La communauté se retrouve ici : discute en public, envoie des messages privés, et papote avec le créateur." },
    { route: "/soutien", title: "Le Soutien 💛", text: "Tu peux soutenir la station et rejoindre le mur des soutiens. C'est ce qui fait vivre tout cet univers." },
    { route: "/parametres", title: "La personnalisation ✨", text: "Les Paramètres, ton terrain de jeu ! Regarde bien, je vais tout transformer sous tes yeux…" },
    { route: "/parametres", title: "Le thème 🎨", text: "Hop ! Je change le thème d'un simple geste. Tu choisiras le tien juste ici après la visite.", run: demoTheme },
    { route: "/parametres", title: "Les couleurs 🌈", text: "Et voilà la couleur d'accent qui change tout ! Chaque détail s'adapte à ton goût.", run: demoAccent },
    { route: "/parametres", title: "La musique 🎵", text: "J'allume une ambiance sonore ! Tu peux couper le son ou changer de morceau quand tu veux.", run: demoMusic },
    { route: "/parametres", title: "La lecture 📖", text: "Quand tu lis un chapitre, tu peux changer la police et la taille du texte pour lire tout confortablement.", run: demoFont },
    { route: "/", title: "Bonne visite ! 🐰", text: "Et voilà le tour du propriétaire ! Amuse-toi bien. Tu pourras refaire cette visite quand tu veux depuis les Paramètres." },
  ];

  const finish = useCallback(() => { localStorage.setItem(DONE_KEY, "1"); setPhase("hidden"); setIdx(0); }, []);
  const start = useCallback(() => { setIdx(0); setPhase("running"); }, []);

  // Première visite (après l'intro) : proposer la visite. Écoute aussi le relancement depuis les Paramètres.
  useEffect(() => {
    const maybeWelcome = () => { if (!localStorage.getItem(DONE_KEY) && sessionStorage.getItem("sx_entered")) setPhase((p) => (p === "hidden" ? "welcome" : p)); };
    const t = setTimeout(maybeWelcome, 1200);
    const onEntered = () => setTimeout(maybeWelcome, 400);
    const onStart = () => start();
    window.addEventListener("sx-entered", onEntered);
    window.addEventListener("sx-start-tour", onStart);
    return () => { clearTimeout(t); window.removeEventListener("sx-entered", onEntered); window.removeEventListener("sx-start-tour", onStart); };
  }, [start]);

  // Exécute la navigation + l'action de démonstration à chaque étape
  useEffect(() => {
    if (phase !== "running") return;
    const step = STEPS[idx];
    if (!step) return;
    nav(step.route);
    if (step.run) { const t = setTimeout(() => { try { step.run(); } catch (_) {} sfx("select"); }, 500); return () => clearTimeout(t); }
    sfx("nav");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, phase]);

  if (phase === "hidden") return null;

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

  const step = STEPS[idx];
  const last = idx === STEPS.length - 1;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[130] p-3 sm:p-5 flex justify-center pointer-events-none" data-testid="tour-step">
      <div className="w-full max-w-lg pointer-events-auto sx-celebrate-pop" style={{ background: "var(--bg-secondary)", border: "1px solid var(--brand)", borderRadius: "var(--radius-lg, 16px)", boxShadow: "0 -8px 40px rgba(0,0,0,0.5)" }}>
        <div className="flex items-start gap-3 p-4">
          <div className="sx-celebrate-bounce flex-none" style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--brand)" }}>
            <img src={bunny} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/cosmic-bunny/neutral.png"; }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-lg" style={{ color: "var(--brand)" }} data-testid="tour-title">{step.title}</p>
              <button data-testid="tour-close" onClick={finish} style={{ color: "var(--text-secondary)" }}><IoClose size={18} /></button>
            </div>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--text-primary)" }} data-testid="tour-text">{step.text}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{idx + 1} / {STEPS.length}</span>
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
