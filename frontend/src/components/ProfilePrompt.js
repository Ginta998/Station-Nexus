import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose, IoPersonCircle, IoSparkles, IoHelpCircleOutline, IoLogInOutline } from "react-icons/io5";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePrompt({ onCreate }) {
  const nav = useNavigate();
  const { profile } = useApp();
  const { user, openAuth } = useAuth();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("sx_profile_prompted") === "1");
  const [tourActive, setTourActive] = useState(() => typeof window !== "undefined" && !localStorage.getItem("sx_tour_done"));
  useEffect(() => {
    const on = (e) => setTourActive(!!(e && e.detail));
    window.addEventListener("sx-tour-active", on);
    return () => window.removeEventListener("sx-tour-active", on);
  }, []);
  if (profile || dismissed || user || tourActive) return null;

  const later = () => { localStorage.setItem("sx_profile_prompted", "1"); setDismissed(true); };
  const create = () => { localStorage.setItem("sx_profile_prompted", "1"); setDismissed(true); onCreate(); };
  const connect = () => { localStorage.setItem("sx_profile_prompted", "1"); setDismissed(true); openAuth(); };
  const openTuto = () => { localStorage.setItem("sx_profile_prompted", "1"); setDismissed(true); nav("/tutoriel"); };

  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} data-testid="profile-prompt">
      <div className="w-full sm:max-w-md border p-6 relative fade-up" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
        <button onClick={later} className="absolute top-3 right-3 p-1" style={{ color: "var(--text-secondary)" }} data-testid="profile-prompt-close"><IoClose size={20} /></button>
        <div className="flex justify-center mb-3"><IoPersonCircle size={56} style={{ color: "var(--brand)" }} /></div>
        <h3 className="font-display text-2xl text-center mb-2" style={{ color: "var(--text-primary)" }}>Bienvenue sur la Stationexus !</h3>
        <p className="text-sm text-center mb-4" style={{ color: "var(--text-secondary)" }}>
          Crée ton compte pour <span style={{ color: "var(--text-primary)" }}>avoir ton profil, garder tes favoris et tes préférences sur tous tes appareils</span> et être prévenu·e des nouveautés. Tu peux aussi explorer en visiteur.
        </p>
        <div className="flex flex-col gap-2">
          <button data-testid="profile-prompt-connect" onClick={connect} className="flex items-center justify-center gap-2 w-full py-3 font-semibold transition-transform hover:scale-[1.02]"
            style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
            <IoLogInOutline size={18} /> Créer mon compte / me connecter
          </button>
          <button data-testid="profile-prompt-tutorial" onClick={openTuto} className="flex items-center justify-center gap-2 w-full py-2.5 border font-medium text-sm transition-transform hover:scale-[1.02]"
            style={{ borderColor: "var(--brand)", color: "var(--brand)", borderRadius: "var(--radius-base)", background: "color-mix(in srgb, var(--brand) 12%, transparent)" }}>
            <IoHelpCircleOutline size={18} /> Découvrir comment ça marche
          </button>
          <button data-testid="profile-prompt-later" onClick={later} className="w-full py-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
