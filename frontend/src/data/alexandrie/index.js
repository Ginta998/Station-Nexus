// ALEXANDRIE — catalogue de la bibliothèque.
// Un livre = un fichier dans ce dossier : { id, title, sub, room, type, cote, about, voice?, links, text }.
// Format du texte : « # Titre de chapitre », « ## Intertitre », « > Citation | source »,
// « !! Encadré » (ou « !! LIBELLÉ :: texte »), paragraphes séparés par une ligne vide, *italique*.
import nietzsche from "./nietzsche";
import tarkovski from "./tarkovski";
import rodriguez from "./rodriguez";
import wuTang from "./wu-tang";
import nwa from "./nwa";
import michaelJackson from "./michael-jackson";
import mozart from "./mozart";
import debussy from "./debussy";
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
import xenoblade from "./xenoblade";
import skyrim from "./skyrim";
import airGear from "./air-gear";
import dreyfus from "./dreyfus";
import commune from "./commune-de-paris";
import darkSouls from "./dark-souls";
import hollowKnight from "./hollow-knight";
import nier from "./nier";
import berserk from "./berserk";
import outerWilds from "./outer-wilds";
import evangelion from "./evangelion";
import discoElysium from "./disco-elysium";
import madeInAbyss from "./made-in-abyss";
import sekiro from "./sekiro";
import pathologic from "./pathologic";
import rainWorld from "./rain-world";
import lain from "./serial-experiments-lain";
import limbo from "./limbo";
import inside from "./inside";
import shadowColossus from "./shadow-of-the-colossus";
import silentHill2 from "./silent-hill-2";
import akira from "./akira";
import blame from "./blame";
import hyperLight from "./hyper-light-drifter";
import kentucky from "./kentucky-route-zero";
import ergoProxy from "./ergo-proxy";
import planescape from "./planescape-torment";
import darkwood from "./darkwood";
import dorohedoro from "./dorohedoro";
import texhnolyze from "./texhnolyze";
import stalker from "./stalker";
import alien from "./alien";
import bladeRunner from "./blade-runner";
import fearHunger from "./fear-hunger";
import warhammer from "./warhammer-40-000";
import twinPeaks from "./twin-peaks";
import madMax from "./mad-max";
import hordeContrevent from "./la-horde-du-contrevent";
import hyperion from "./hyperion";
import gormenghast from "./gormenghast";
import annihilation from "./annihilation";
import nouveauSoleil from "./le-livre-du-nouveau-soleil";
import fondation from "./fondation";
import nausicaa from "./nausicaa";
import lumumba from "./lumumba";
import kimpaVita from "./kimpa-vita";
import kongo from "./royaume-du-kongo";
import ff12 from "./final-fantasy-xii";
import toussaint from "./toussaint-louverture";
import soundiata from "./soundiata-keita";
import saintJust from "./saint-just";
import danton from "./danton";
import rumbaCongolaise from "./rumba-congolaise";
import meroe from "./meroe";
import musashi from "./musashi";
import ramanujan from "./ramanujan";
import spinoza from "./spinoza";
import moebius from "./moebius";

export const ROOMS = [
  { key: "philo", label: "Philosophie", kanji: "哲", about: "Des pensées qui dérangent, expliquées de l'intérieur." },
  { key: "histoire", label: "Histoire", kanji: "史", about: "Affaires, règnes, chutes : ce qui s'est passé, et pourquoi." },
  { key: "cinema", label: "Cinéma", kanji: "映", about: "Les cinéastes qui ont inventé une manière de voir." },
  { key: "musique", label: "Musique", kanji: "音", format: "vinyle", about: "Des plus connus aux plus cachés : ceux qui ont changé ce qu'on entend." },
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
export const BOOKS = [nietzsche, hegel, stavisky, boulanger, robespierre, dreyfus, commune, cleopatre, tarkovski, bresson, kitano, hokusai, quatrevingtTreize, bushido, infini, bloodborne, eldenRing, dune, meridien, soma, psychoPass, signalis, hellraiser, deusEx, ff13, xenoblade, skyrim, airGear, darkSouls, hollowKnight, nier, berserk, outerWilds, evangelion, discoElysium, madeInAbyss, sekiro, pathologic, rainWorld, lain, limbo, inside, shadowColossus, silentHill2, akira, blame, hyperLight, kentucky, ergoProxy, planescape, darkwood, dorohedoro, texhnolyze, stalker, alien, bladeRunner, fearHunger, warhammer, twinPeaks, madMax, hordeContrevent, hyperion, gormenghast, annihilation, nouveauSoleil, fondation, nausicaa, lumumba, kimpaVita, kongo, ff12, toussaint, soundiata, saintJust, danton, rumbaCongolaise, meroe, musashi, ramanujan, spinoza, moebius, rodriguez, wuTang, nwa, michaelJackson, mozart, debussy];

const up = (room, type, title, sub, format) => ({ id: "up-" + title.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-"), room, type, title, sub, format: format || (room === "lore" ? "vhs" : room === "musique" ? "vinyle" : "livre") });
export const UPCOMING = [
  up("philo", "pensee", "Merleau-Ponty", "Le corps qui voit"), up("philo", "pensee", "Kierkegaard", "Le saut"),
  up("philo", "pensee", "Simone Weil", "L'attention"), up("philo", "apprentissage", "Kant", "Que puis-je savoir ?"), up("philo", "pensee", "Marc Aurèle", "Pensées pour soi"),
  up("philo", "apprentissage", "Platon", "La caverne et après"), up("philo", "pensee", "Camus", "L'absurde et la révolte"), up("philo", "apprentissage", "Bergson", "La durée"),
  up("histoire", "recit", "Néron", "L'empereur qui voulait être artiste"),
  up("histoire", "recit", "Napoléon", "Les Cent-Jours"), up("histoire", "recit", "Alexandre le Grand", "Jusqu'au bout du monde"),
  up("histoire", "recit", "L'affaire du collier de la reine", "L'escroquerie qui fit tomber un trône"),   up("histoire", "recit", "Le scandale de Panama", "Les chéquards"), up("histoire", "recit", "Jules César", "Le Rubicon"),
  up("cinema", "recit", "Le Nouvel Hollywood", "Dix ans où les fous ont eu les clés"), up("cinema", "pensee", "Kurosawa", "Le mouvement et la pluie"), up("cinema", "pensee", "Ozu", "La hauteur du tatami"),
  up("cinema", "recit", "La Nouvelle Vague", "Caméra à l'épaule"), up("cinema", "pensee", "Kubrick", "Le contrôle"), up("cinema", "pensee", "Bergman", "Les visages"),
  up("cinema", "pensee", "Satoshi Kon", "Le montage du rêve"), up("cinema", "pensee", "Miyazaki", "Le vent se lève"), up("cinema", "apprentissage", "Le montage", "D'Eisenstein à Murch"),
  up("cinema", "pensee", "Béla Tarr", "Le temps d'après"), up("cinema", "pensee", "Wong Kar-wai", "Le temps perdu"),
  // Musique : des plus connus aux plus cachés
  up("musique", "pensee", "Bach", "Le cantor de Leipzig"), up("musique", "pensee", "Nina Simone", "La colère et la grâce"), up("musique", "recit", "Public Enemy", "Le bruit qui dérange"),
  up("musique", "recit", "Daft Punk", "Les robots de Paris"), up("musique", "pensee", "Erik Satie", "Le velours et l'ennui"), up("musique", "recit", "Robert Johnson", "Le carrefour"),
  up("musique", "recit", "Fela Kuti", "La république de Kalakuta"), up("musique", "pensee", "Ryuichi Sakamoto", "Le son et le temps"), up("musique", "recit", "J Dilla", "Le temps qui boite"),
  up("musique", "recit", "MF DOOM", "L'homme au masque de fer"), up("musique", "recit", "Nick Drake", "Trois albums dans le silence"), up("musique", "recit", "Moondog", "Le Viking de la 6e Avenue"),
  up("musique", "recit", "Lili Boulanger", "Vingt-quatre ans pour tout écrire"), up("musique", "pensee", "Hildegard von Bingen", "La lumière vivante"), up("musique", "recit", "Arthur Russell", "Le violoncelle et la boule à facettes"),
  up("musique", "recit", "Vashti Bunyan", "Trente ans de silence"), up("musique", "recit", "Midori Takada", "À travers le miroir"), up("musique", "recit", "Hiroshi Yoshimura", "La musique d'environnement"),
  up("musique", "apprentissage", "L'échantillonnage", "Du breakbeat au sampler"),
  up("art", "recit", "Gustave Doré", "L'homme qui illustra tout"), up("art", "recit", "Katsuhiro Ōtomo", "Akira"),
  up("art", "recit", "Kim Jung Gi", "Dessiner sans esquisse"), up("art", "recit", "Yoshitaka Amano", "Les brumes"), up("art", "recit", "Mucha", "L'Art nouveau"),
  up("art", "recit", "Hiroshige", "La pluie sur le pont"), up("art", "recit", "Caravage", "La lumière et le couteau"), up("art", "recit", "Takehiko Inoue", "Vagabond"),
  up("art", "apprentissage", "La composition", "Où va l'œil"), up("art", "recit", "Franquin", "Le mouvement"), up("art", "recit", "Kentarō Miura", "Berserk"),
  up("lettres", "recit", "Les Misérables", "Hugo et le peuple"), up("lettres", "recit", "Dostoïevski", "Crime et châtiment"), up("lettres", "recit", "Homère", "La colère d'Achille"),
  up("lettres", "recit", "Dante", "Descendre pour remonter"), up("lettres", "pensee", "Rilke", "Lettres à un jeune poète"), up("lettres", "recit", "Mishima", "La mer de la fertilité"),
  up("japon", "pensee", "Hagakure", "À l'ombre des feuilles"), up("japon", "recit", "Les 47 rōnin", "La vengeance d'Akō"),
  up("japon", "apprentissage", "Wabi-sabi", "La beauté de l'imparfait"), up("japon", "recit", "Oda Nobunaga", "Le démon du sixième ciel"), up("japon", "apprentissage", "Le zen", "S'asseoir"),
  up("sciences", "apprentissage", "Gödel", "Ce qu'on ne peut pas prouver"), up("sciences", "apprentissage", "Le nombre d'or", "Mythe et géométrie"), up("sciences", "recit", "Évariste Galois", "Une nuit pour tout écrire"),
  up("sciences", "apprentissage", "La relativité", "Le temps n'est pas le même pour tous"), up("sciences", "apprentissage", "Les probabilités", "Penser le hasard"), 
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
    // @art 3 | légende : la 3e bannière SteamGridDB du jeu ; @art g 2 | légende : la 2e affiche verticale
    else if (s.startsWith("@art ")) { const [h, cap, credit] = s.slice(5).split(" | ").map((x) => x && x.trim()); push({ t: "art", kind: /^g\b/.test(h) ? "grids" : "heroes", n: parseInt(h.replace(/^g\s*/, ""), 10) || 1, cap, credit }); }
    else if (s.startsWith("!! ")) { const m = s.slice(3).split(" :: "); push(m.length > 1 ? { t: "box", label: m[0].trim(), x: m.slice(1).join(" :: ").trim() } : { t: "box", x: m[0].trim() }); }
    else push({ t: "p", x: s });
  }
  const words = b.text.split("\n").filter((l) => !/^@(img|yt|art) /.test(l.trim())).join(" ").split(/\s+/).filter(Boolean).length;
  return { ...b, chapters, words };
}
export const readingTime = (w) => { const m = Math.max(1, Math.round((w || 0) / 220)); return m < 60 ? `${m} MIN DE LECTURE` : `${Math.floor(m / 60)} H ${String(m % 60).padStart(2, "0")} DE LECTURE`; };
