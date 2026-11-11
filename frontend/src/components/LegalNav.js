import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoHome } from "react-icons/io5";
import { useApp } from "@/context/AppContext";
import MobileMenu from "@/components/MobileMenu";

// Barre du haut des pages légales : retour, accueil et menu principal de la Station.
export default function LegalNav() {
  const nav = useNavigate();
  const { sfx } = useApp();
  return (
    <div className="lg-nav sx-safe-top">
      <div className="lg-row">
        <button className="lg-back" onClick={() => { sfx?.("back"); if (window.history.length > 1) nav(-1); else nav("/"); }} aria-label="Retour" data-testid="legal-back"><IoArrowBack size={18} /> <span>Retour</span></button>
        <button className="lg-back" onClick={() => { sfx?.("nav"); nav("/"); }} aria-label="Accueil" data-testid="legal-home"><IoHome size={17} /> <span>Accueil</span></button>
      </div>
      <MobileMenu />
    </div>
  );
}
