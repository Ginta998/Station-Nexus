import { useLocation } from "react-router-dom";
import { SoundBtn } from "@/components/StationMenu";

const floatBtn = { borderColor: "var(--border-c)", borderRadius: "999px", color: "var(--text-primary)", background: "color-mix(in srgb, var(--bg-secondary) 80%, transparent)", backdropFilter: "blur(12px)", boxShadow: "0 8px 26px rgba(0,0,0,0.45)" };

// Bouton musique flottant sur toutes les pages (l'accueil a déjà le sien dans la barre du haut)
export default function GlobalSound() {
  const { pathname } = useLocation();
  if (pathname === "/" || pathname.startsWith("/atelier")) return null;
  return (
    <div className="sx-global-sound" data-testid="global-sound">
      <SoundBtn btn={floatBtn} up />
    </div>
  );
}
