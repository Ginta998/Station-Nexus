// Artworks par défaut : des liens vers les images des éditeurs (Steam, Open Library). Rien n'est copié ici.
// Si une image ne répond pas, le volume garde sa couverture dessinée. Chaque artwork se remplace ou se retire dans la bibliothèque.
const steam = (id) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_600x900.jpg`;
const isbn = (n) => `https://covers.openlibrary.org/b/isbn/${n}-L.jpg?default=false`;
const both = (key, url) => ({ [key]: url, ["up-" + key]: url });
export const DEFAULT_COVERS = {
  "elden-ring": steam(1245620),
  soma: steam(282140),
  dune: isbn("9780441172719"),
  "meridien-de-sang": isbn("9780679728757"),
  ...both("signalis", steam(1262350)),
  ...both("deus-ex", steam(6910)),
  ...both("final-fantasy-xiii", steam(292120)),
  ...both("skyrim", steam(489830)),
  ...both("limbo", steam(48000)),
  ...both("inside", steam(304430)),
  ...both("dark-souls", steam(570940)),
  ...both("sekiro", steam(814380)),
  ...both("nier", steam(524220)),
  ...both("hollow-knight", steam(367520)),
  ...both("pathologic", steam(505230)),
  ...both("disco-elysium", steam(632470)),
  ...both("rain-world", steam(312520)),
  ...both("hyper-light-drifter", steam(257850)),
  ...both("kentucky-route-zero", steam(231200)),
};
// Fusionne défauts, choix locaux et choix enregistrés ; "-" veut dire « retiré ».
export const mergeCovers = (local, saved, bad) => Object.fromEntries(Object.entries({ ...DEFAULT_COVERS, ...(local || {}), ...(saved || {}) }).filter(([, u]) => u && u !== "-" && !(bad && bad[u])));

// Termes de recherche SteamGridDB quand le titre français ou court ne suffit pas.
export const SGDB_TERMS = {
  "final-fantasy-xiii": "Final Fantasy XIII", nier: "NieR:Automata", "dark-souls": "Dark Souls Remastered", sekiro: "Sekiro: Shadows Die Twice",
  skyrim: "The Elder Scrolls V: Skyrim", pathologic: "Pathologic 2", "disco-elysium": "Disco Elysium", "deus-ex": "Deus Ex", "fear-hunger": "Fear & Hunger",
  "planescape-torment": "Planescape: Torment", "silent-hill-2": "Silent Hill 2", "shadow-of-the-colossus": "Shadow of the Colossus", "outer-wilds": "Outer Wilds",
  "warhammer-40-000": "Warhammer 40,000", alien: "Alien: Isolation", stalker: "S.T.A.L.K.E.R.: Shadow of Chernobyl", "psycho-pass": "Psycho-Pass: Mandatory Happiness",
  "blade-runner": "Blade Runner", "mad-max": "Mad Max", akira: "Akira", evangelion: "Evangelion", berserk: "Berserk", "made-in-abyss": "Made in Abyss",
};
export const sgdbTerm = (b) => SGDB_TERMS[String(b.id).replace(/^up-/, "")] || b.title;
