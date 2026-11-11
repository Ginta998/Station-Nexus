import { Link, useLocation } from "react-router-dom";
import { useLegal } from "@/lib/useLegal";

// Pied de page légal, présent sur toutes les pages publiques (pas dans l'Atelier ni le salon plein écran).
const HIDE = [/^\/atelier/, /^\/salon/, /^\/d\//];

export default function LegalFooter() {
  const { pathname } = useLocation();
  const LEGAL = useLegal();
  if (HIDE.some((r) => r.test(pathname))) return null;
  return (
    <footer className="lg-foot" data-testid="legal-footer">
      <nav>
        <Link to="/legal/mentions">Mentions légales</Link>
        <Link to="/legal/cgu">CGU</Link>
        <Link to="/legal/cgv">CGV</Link>
        <Link to="/legal/confidentialite">Confidentialité</Link>
        <Link to="/legal/cookies">Cookies</Link>
        <Link to="/legal/communaute">Règles de la communauté</Link>
      </nav>
      <nav>
        <Link to="/resiliation" data-testid="footer-resilier">Résilier votre contrat</Link>
        <Link to="/retractation" data-testid="footer-renoncer">Renoncer au contrat ici</Link>
      </nav>
      <p className="mono">© {new Date().getFullYear()} {LEGAL.marque} — {LEGAL.editeur}, EI</p>
    </footer>
  );
}
