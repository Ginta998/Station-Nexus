import StationMenu from "@/components/StationMenu";

/*
 * MobileMenu — conservé pour compatibilité avec les sous-pages.
 * Il ne rend plus l'ancien tiroir : il affiche LE menu unique de la station
 * (StationMenu), strictement identique à celui de l'accueil. L'ancien menu
 * est supprimé ; il n'existe plus qu'une seule implémentation.
 */
export default function MobileMenu() {
  return <StationMenu />;
}
