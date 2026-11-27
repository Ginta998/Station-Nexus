// Durée du lancement d'une œuvre avant d'entrer, selon l'animation du thème (Nexus OS › Mouvement › Entrée dans une œuvre)
const DUREE = { "": 3300, tour: 3000, plongee: 3000, envol: 2800, feuillette: 3600, ejecte: 3300 };
export const launchDuration = () => DUREE[document.documentElement.getAttribute("data-lancement") || ""] || 3300;
