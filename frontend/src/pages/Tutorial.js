import { useNavigate } from "react-router-dom";
import {
  IoArrowBack, IoHome, IoTextOutline, IoColorPaletteOutline, IoBookOutline, IoMusicalNotes,
  IoHeartOutline, IoPersonCircleOutline, IoMegaphoneOutline, IoGameControllerOutline, IoImagesOutline, IoSparkles,
} from "react-icons/io5";
import { useApp } from "@/context/AppContext";
import MobileMenu from "@/components/MobileMenu";

const fs = { background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" };

const SECTIONS = [
  {
    icon: IoGameControllerOutline, title: "Naviguer",
    text: "Sur ordinateur : utilise les flèches ← → pour parcourir les créations, ↑ ↓ pour changer de catégorie, et Entrée pour ouvrir. Sur mobile : glisse verticalement pour changer de catégorie, ou utilise le pavé directionnel (D-pad) et le bouton OK en bas de l'écran.",
  },
  {
    icon: IoTextOutline, title: "Taille du texte (Aa)",
    text: "Le bouton Aa (en haut, et dans le menu sur mobile) agrandit ou réduit tout le texte de l'application — pratique pour lire plus confortablement. Ton choix est mémorisé sur ton appareil.",
  },
  {
    icon: IoColorPaletteOutline, title: "Personnaliser la station",
    text: "Dans Paramètres, tu peux changer le thème (13 ambiances japonaises), la couleur d'accent, la forme des coins, la taille des affiches (compact, normal, grand) et activer/couper les sons et les musiques d'ambiance.",
  },
  {
    icon: IoBookOutline, title: "Lecture confort",
    text: "Pour les créations en chapitres, un mode lecture immersif s'ouvre. Tu peux ajuster la taille du texte pour ton confort, et ta progression est sauvegardée : reprends là où tu t'es arrêté·e grâce au bouton « Reprendre » sur la fiche.",
  },
  {
    icon: IoMusicalNotes, title: "Ambiances & mini-lecteur",
    text: "Certaines créations ont une musique d'ambiance (bouton « Ambiance » sur la fiche). Pendant la lecture d'un chapitre, un mini-lecteur flottant te laisse écouter, mettre en pause et te déplacer dans la piste sans quitter ta lecture.",
  },
  {
    icon: IoHeartOutline, title: "Favoris",
    text: "Appuie sur le cœur d'une fiche (ou en haut d'une affiche à l'accueil) pour l'ajouter à tes favoris. Retrouve-les toutes dans la catégorie « Favoris » sur l'accueil.",
  },
  {
    icon: IoPersonCircleOutline, title: "Profil & Membres",
    text: "Crée ton profil (nom + photo, et ton Instagram si tu veux) pour être accueilli·e par un message à chaque retour. Découvre les autres lecteurs dans la page Membres.",
  },
  {
    icon: IoMegaphoneOutline, title: "Nouveautés & notifications",
    text: "Une pastille rouge s'affiche dès qu'il y a du nouveau (nouveau chapitre, épisode…). Ouvre la page Nouveautés pour voir les dernières annonces. Ajoute ton email dans ton profil pour être prévenu·e par mail.",
  },
  {
    icon: IoImagesOutline, title: "Galeries & médias",
    text: "Les fiches peuvent contenir des galeries d'images, des vidéos et des liens. Explore chaque création pour découvrir tout son univers.",
  },
];

export default function Tutorial() {
  const nav = useNavigate();
  const { sfx } = useApp();
  return (
    <div className="relative min-h-screen w-full" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-8">
        <div className="flex items-center justify-between gap-2 mb-8">
          <div className="flex items-center gap-2">
            <button data-testid="tutorial-back" onClick={() => { sfx("back"); nav(-1); }} className="flex items-center gap-2 px-3 py-2 border" style={{ ...fs, background: "var(--bg-primary)" }}><IoArrowBack /> <span className="text-sm">Retour</span></button>
            <button data-testid="tutorial-home" onClick={() => { sfx("nav"); nav("/"); }} className="flex items-center gap-2 px-3 py-2 border" style={{ ...fs, background: "var(--bg-primary)" }}><IoHome size={16} /> <span className="text-sm hidden sm:inline">Accueil</span></button>
          </div>
          <MobileMenu />
        </div>

        <div className="flex items-center gap-3 mb-2">
          <IoSparkles size={30} style={{ color: "var(--brand)" }} />
          <h1 className="font-display text-4xl md:text-5xl" style={{ color: "var(--text-primary)" }}>Comment ça marche</h1>
        </div>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>Bienvenue sur Stationexus — voici tout ce que tu peux faire.</p>

        <div className="space-y-3" data-testid="tutorial-sections">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} data-testid={`tutorial-section-${i}`} className="flex items-start gap-4 p-4 border" style={fs}>
                <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--brand) 18%, transparent)" }}>
                  <Icon size={22} style={{ color: "var(--brand)" }} />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg mb-1" style={{ color: "var(--text-primary)" }}>{s.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button data-testid="tutorial-start" onClick={() => { sfx("select"); nav("/"); }}
            className="px-6 py-3 font-semibold transition-transform hover:scale-105" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
            C'est parti !
          </button>
        </div>
      </div>
    </div>
  );
}
