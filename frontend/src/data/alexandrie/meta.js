// Le catalogue sans les livres : salles, types, lecture d'un livre. Léger, utilisable partout sans charger la bibliothèque.
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
export function parseBook(b) {
  const chapters = []; let cur = null;
  // si : rang du paragraphe dans le texte source (pour insérer ou retirer une vidéo à cet endroit)
  let si = -1;
  const push = (blk) => { if (!cur) { cur = { title: "", blocks: [] }; chapters.push(cur); } blk.si = si; cur.blocks.push(blk); };
  for (const raw of b.text.trim().split(/\n\s*\n/)) {
    si++; const s = raw.replace(/\s*\n\s*/g, " ").trim(); if (!s) continue;
    if (s.startsWith("# ")) { cur = { title: s.slice(2).trim(), blocks: [], si }; chapters.push(cur); }
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
