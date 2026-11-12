// ALEXANDRIE — catalogue de la bibliothèque.
// Un livre = un fichier dans ce dossier : { id, title, sub, room, type, cote, about, voice?, links, text }.
// Format du texte : « # Titre de chapitre », « ## Intertitre », « > Citation | source »,
// « !! Encadré » (ou « !! LIBELLÉ :: texte »), paragraphes séparés par une ligne vide, *italique*.
import nietzsche from "./nietzsche";
import tarkovski from "./tarkovski";
import bresson from "./bresson";
import bushido from "./bushido";
import stavisky from "./stavisky";
import boulanger from "./boulanger";
import robespierre from "./robespierre";
import cleopatre from "./cleopatre";
import hokusai from "./hokusai";
import quatrevingtTreize from "./quatrevingt-treize";
import hegel from "./hegel";
import infini from "./infini";
import kitano from "./kitano";
import bloodborne from "./bloodborne";
import eldenRing from "./elden-ring";
import dune from "./dune";
import meridien from "./meridien-de-sang";
import soma from "./soma";
import psychoPass from "./psycho-pass";
import signalis from "./signalis";
import hellraiser from "./hellraiser";
import deusEx from "./deus-ex";
import ff13 from "./final-fantasy-xiii";

export const ROOMS = [
  { key: "philo", label: "Philosophie", kanji: "哲", about: "Des pensées qui dérangent, expliquées de l'intérieur." },
  { key: "histoire", label: "Histoire", kanji: "史", about: "Affaires, règnes, chutes : ce qui s'est passé, et pourquoi." },
  { key: "cinema", label: "Cinéma", kanji: "映", about: "Les cinéastes qui ont inventé une manière de voir." },
  { key: "art", label: "Art & illustration", kanji: "絵", about: "Dessinateurs, peintres, illustrateurs, de l'estampe au manga." },
  { key: "lettres", label: "Littérature", kanji: "文", about: "Des livres qui parlent d'autres livres, pour donner envie de les ouvrir." },
  { key: "japon", label: "Japon", kanji: "和", about: "Samouraïs, voies, esthétiques." },
  { key: "sciences", label: "Mathématiques & sciences", kanji: "数", about: "Les idées vertigineuses, pas à pas." },
  { key: "lore", label: "Lore & mondes", kanji: "伝", format: "vhs", about: "Jeux, films, romans, mangas : leurs mythes, leurs personnages, ce qu'ils cachent." },
  { key: "atelier", label: "Mes livres", kanji: "私", about: "Ceux que tu écris ou que tu ajoutes." },
];
export const TYPES = {
  pensee: { label: "Pensée", about: "Une voix te parle." },
  recit: { label: "Récit", about: "Un narrateur raconte, plusieurs points de vue." },
  apprentissage: { label: "Apprentissage", about: "On t'accompagne dans une notion difficile." },
};
export const BOOKS = [nietzsche, hegel, stavisky, boulanger, robespierre, cleopatre, tarkovski, bresson, kitano, hokusai, quatrevingtTreize, bushido, infini, bloodborne, eldenRing, dune, meridien, soma, psychoPass, signalis, hellraiser, deusEx, ff13];

const up = (room, type, title, sub, format) => ({ id: "up-" + title.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-"), room, type, title, sub, format: format || (room === "lore" ? "vhs" : "livre") });
const lo = (title, sub, format) => up("lore", "recit", title, sub, format);
export const UPCOMING = [
  up("philo", "pensee", "Merleau-Ponty", "Le corps qui voit"), up("philo", "pensee", "Spinoza", "La joie comme méthode"), up("philo", "pensee", "Kierkegaard", "Le saut"),
  up("philo", "pensee", "Simone Weil", "L'attention"), up("philo", "apprentissage", "Kant", "Que puis-je savoir ?"), up("philo", "pensee", "Marc Aurèle", "Pensées pour soi"),
  up("philo", "apprentissage", "Platon", "La caverne et après"), up("philo", "pensee", "Camus", "L'absurde et la révolte"), up("philo", "apprentissage", "Bergson", "La durée"),
  up("histoire", "recit", "Néron", "L'empereur qui voulait être artiste"), up("histoire", "recit", "L'affaire Dreyfus", "Un pays coupé en deux"), up("histoire", "recit", "La Commune de Paris", "Soixante-douze jours"),
  up("histoire", "recit", "Napoléon", "Les Cent-Jours"), up("histoire", "recit", "Toussaint Louverture", "La révolution haïtienne"), up("histoire", "recit", "Alexandre le Grand", "Jusqu'au bout du monde"),
  up("histoire", "recit", "L'affaire du collier de la reine", "L'escroquerie qui fit tomber un trône"), up("histoire", "recit", "Saint-Just", "L'archange"), up("histoire", "recit", "Soundiata Keïta", "L'empire du Mali"),
  up("histoire", "recit", "Le scandale de Panama", "Les chéquards"), up("histoire", "recit", "Danton", "L'audace"), up("histoire", "recit", "Jules César", "Le Rubicon"),
  up("cinema", "recit", "Le Nouvel Hollywood", "Dix ans où les fous ont eu les clés"), up("cinema", "pensee", "Kurosawa", "Le mouvement et la pluie"), up("cinema", "pensee", "Ozu", "La hauteur du tatami"),
  up("cinema", "recit", "La Nouvelle Vague", "Caméra à l'épaule"), up("cinema", "pensee", "Kubrick", "Le contrôle"), up("cinema", "pensee", "Bergman", "Les visages"),
  up("cinema", "pensee", "Satoshi Kon", "Le montage du rêve"), up("cinema", "pensee", "Miyazaki", "Le vent se lève"), up("cinema", "apprentissage", "Le montage", "D'Eisenstein à Murch"),
  up("cinema", "pensee", "Béla Tarr", "Le temps d'après"), up("cinema", "pensee", "Wong Kar-wai", "Le temps perdu"),
  up("art", "recit", "Moebius", "Le trait qui voyage"), up("art", "recit", "Gustave Doré", "L'homme qui illustra tout"), up("art", "recit", "Katsuhiro Ōtomo", "Akira"),
  up("art", "recit", "Kim Jung Gi", "Dessiner sans esquisse"), up("art", "recit", "Yoshitaka Amano", "Les brumes"), up("art", "recit", "Mucha", "L'Art nouveau"),
  up("art", "recit", "Hiroshige", "La pluie sur le pont"), up("art", "recit", "Caravage", "La lumière et le couteau"), up("art", "recit", "Takehiko Inoue", "Vagabond"),
  up("art", "apprentissage", "La composition", "Où va l'œil"), up("art", "recit", "Franquin", "Le mouvement"), up("art", "recit", "Kentarō Miura", "Berserk"),
  up("lettres", "recit", "Les Misérables", "Hugo et le peuple"), up("lettres", "recit", "Dostoïevski", "Crime et châtiment"), up("lettres", "recit", "Homère", "La colère d'Achille"),
  up("lettres", "recit", "Dante", "Descendre pour remonter"), up("lettres", "pensee", "Rilke", "Lettres à un jeune poète"), up("lettres", "recit", "Mishima", "La mer de la fertilité"),
  up("japon", "pensee", "Hagakure", "À l'ombre des feuilles"), up("japon", "pensee", "Musashi", "Le Livre des cinq anneaux"), up("japon", "recit", "Les 47 rōnin", "La vengeance d'Akō"),
  up("japon", "apprentissage", "Wabi-sabi", "La beauté de l'imparfait"), up("japon", "recit", "Oda Nobunaga", "Le démon du sixième ciel"), up("japon", "apprentissage", "Le zen", "S'asseoir"),
  up("sciences", "apprentissage", "Gödel", "Ce qu'on ne peut pas prouver"), up("sciences", "apprentissage", "Le nombre d'or", "Mythe et géométrie"), up("sciences", "recit", "Évariste Galois", "Une nuit pour tout écrire"),
  up("sciences", "apprentissage", "La relativité", "Le temps n'est pas le même pour tous"), up("sciences", "apprentissage", "Les probabilités", "Penser le hasard"), up("sciences", "recit", "Ramanujan", "L'homme qui connaissait l'infini"),
  // Lore & mondes : les univers demandés, puis des pistes moins connues
  lo("Xenoblade Chronicles", "Deux titans, un monde"), 
  lo("Skyrim", "Les Parchemins des Anciens"), 
  lo("Air Gear", "Les rois et les routes"), 
  lo("Limbo", "Le garçon à la lisière"), lo("Inside", "Le garçon et la masse"),
  lo("Dark Souls", "L'âge du feu"), lo("Sekiro", "L'héritage du dragon"), lo("NieR", "Les réplicants et les ombres"), lo("Hollow Knight", "Le royaume de Hallownest"),
  lo("Pathologic", "Douze jours de peste"), lo("Disco Elysium", "Revachol et le Pâle"), lo("Outer Wilds", "Les Nomaï et la boucle"), lo("Fear & Hunger", "Les donjons et les dieux anciens"),
  lo("Rain World", "Le cycle et les itérateurs"), lo("Hyper Light Drifter", "La maladie et le voyageur"), lo("Kentucky Route Zero", "La route sous la route"), lo("Darkwood", "La forêt qui se referme"),
  lo("Planescape: Torment", "Qu'est-ce qui peut changer la nature d'un homme ?"), lo("Silent Hill 2", "La ville qui te connaît"), lo("Shadow of the Colossus", "Seize géants pour une morte"),
  lo("Berserk", "L'Éclipse et la causalité"), lo("Blame!", "La Cité sans fin"), lo("Made in Abyss", "La malédiction de la remontée"), lo("Dorohedoro", "Hole et les mages"),
  lo("Serial Experiments Lain", "Le Wired"), lo("Texhnolyze", "La ville de Lux"), lo("Ergo Proxy", "Romdeau et les proxys"), lo("Evangelion", "Les Anges et le Projet"),
  lo("Stalker", "La Zone, de Strougatski à Tarkovski"), lo("Annihilation", "La Zone X", "livre"), lo("Hypérion", "Le Gritche et les sept pèlerins", "livre"), lo("Le Livre du Nouveau Soleil", "Severian le bourreau", "livre"),
  lo("Gormenghast", "Le château et le rituel", "livre"), lo("La Horde du Contrevent", "Remonter le vent", "livre"), lo("Le Cycle de Fondation", "La psychohistoire", "livre"),
  lo("Warhammer 40 000", "L'Hérésie d'Horus"), lo("Alien", "Les Ingénieurs et la Compagnie"), lo("Blade Runner", "Plus humain que l'humain"), lo("Akira", "Néo-Tokyo et le numéro 28"),
  lo("Mad Max", "Le monde d'après le pétrole"), lo("Twin Peaks", "La Loge noire"),
  up("sciences", "apprentissage", "Les fractales", "La côte de Bretagne"), up("sciences", "recit", "Alan Turing", "La machine"),
];

export function parseBook(b) {
  const chapters = []; let cur = null;
  const push = (blk) => { if (!cur) { cur = { title: "", blocks: [] }; chapters.push(cur); } cur.blocks.push(blk); };
  for (const raw of b.text.trim().split(/\n\s*\n/)) {
    const s = raw.replace(/\s*\n\s*/g, " ").trim(); if (!s) continue;
    if (s.startsWith("# ")) { cur = { title: s.slice(2).trim(), blocks: [] }; chapters.push(cur); }
    else if (s.startsWith("## ")) push({ t: "h", x: s.slice(3).trim() });
    else if (s.startsWith("> ")) { const [x, by] = s.slice(2).split(" | "); push({ t: "q", x: x.trim(), by: by?.trim() }); }
    else if (s.startsWith("@img ")) { const [src, cap, credit] = s.slice(5).split(" | ").map((x) => x && x.trim()); push({ t: "img", src, cap, credit }); }
    else if (s.startsWith("@yt ")) { const [id, cap] = s.slice(4).split(" | ").map((x) => x && x.trim()); push({ t: "yt", id, cap }); }
    else if (s.startsWith("!! ")) { const m = s.slice(3).split(" :: "); push(m.length > 1 ? { t: "box", label: m[0].trim(), x: m.slice(1).join(" :: ").trim() } : { t: "box", x: m[0].trim() }); }
    else push({ t: "p", x: s });
  }
  const words = b.text.split("\n").filter((l) => !/^@(img|yt) /.test(l.trim())).join(" ").split(/\s+/).filter(Boolean).length;
  return { ...b, chapters, words };
}
export const readingTime = (w) => { const m = Math.max(1, Math.round((w || 0) / 220)); return m < 60 ? `${m} MIN DE LECTURE` : `${Math.floor(m / 60)} H ${String(m % 60).padStart(2, "0")} DE LECTURE`; };
