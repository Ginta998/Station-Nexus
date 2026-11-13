// Identité visuelle de chaque livre : polices, papier, encre, accent, ornement et texture,
// tirés de l'univers de l'œuvre, de son époque ou de son auteur.
// Un livre sans entrée garde l'habillage de sa salle.
//   d : police des titres   r : police de lecture   p/p2/p3 : papier (fond, tranche, ombre)
//   ink/ink2 : encre principale et secondaire   acc : accent   orn : ornement   tex : texture de la page

// Polices qui ne sont pas embarquées dans le site : chargées depuis Google Fonts à l'ouverture du livre.
export const WEB_FONTS = ["IM Fell English", "Old Standard TT", "UnifrakturMaguntia", "Special Elite", "Libre Baskerville", "Oranienbaum"];

const L = {
  gothique: { d: "IM Fell English", r: "Spectral", p: "#16110f", p2: "#0e0a09", p3: "#060404", ink: "#e9dccb", ink2: "#a5927b", acc: "#b3262e", orn: "✠", tex: "vignette" },
  cendre: { d: "Cinzel", r: "Spectral", p: "#15120c", p2: "#0d0b07", p3: "#060503", ink: "#ebe0c4", ink2: "#a8997a", acc: "#c9a24a", orn: "✦", tex: "vignette" },
  givre: { d: "Cinzel", r: "Spectral", p: "#e7e4dc", p2: "#d6d3ca", p3: "#bdb9ae", ink: "#20262c", ink2: "#5d6670", acc: "#46667c", orn: "◆", tex: "frost" },
  washi: { d: "Shippori Mincho", r: "Spectral", p: "#efe8d8", p2: "#e1d8c4", p3: "#cdc2aa", ink: "#1d1a17", ink2: "#6d6457", acc: "#b3261e", orn: "〇", tex: "washi" },
  terminal: { d: "Chakra Petch", r: "Space Grotesk", p: "#0c1013", p2: "#080b0d", p3: "#030506", ink: "#d7e3e8", ink2: "#7f939c", acc: "#2fd3c4", orn: "▮", tex: "scan" },
  presse: { d: "Old Standard TT", r: "Libre Baskerville", p: "#ece5d3", p2: "#ddd4bf", p3: "#c7bca2", ink: "#171615", ink2: "#5f5a50", acc: "#7a1d1d", orn: "❦", tex: "news" },
  revolution: { d: "IM Fell English", r: "Spectral", p: "#efe5cc", p2: "#e0d4b6", p3: "#c9ba97", ink: "#2b2116", ink2: "#6f5f47", acc: "#1f3f8f", orn: "✶", tex: "laid" },
  papyrus: { d: "Marcellus", r: "Spectral", p: "#e7d6a8", p2: "#d6c290", p3: "#bfa873", ink: "#3a2a12", ink2: "#75603b", acc: "#1d6f8a", orn: "☥", tex: "fiber" },
  fraktur: { d: "UnifrakturMaguntia", r: "Spectral", p: "#f1ece1", p2: "#e3dccd", p3: "#cdc4b0", ink: "#1c1b19", ink2: "#64605a", acc: "#5b1f1f", orn: "⁂", tex: "laid" },
  didone: { d: "Bodoni Moda", r: "Spectral", p: "#f5f2ea", p2: "#e6e1d5", p3: "#cfc8b7", ink: "#141311", ink2: "#615c53", acc: "#7a1a1a", orn: "◇", tex: "plain" },
  sable: { d: "Michroma", r: "Spectral", p: "#dcc08a", p2: "#cba972", p3: "#b18e57", ink: "#2a1b0c", ink2: "#6b4f2c", acc: "#8a3f10", orn: "◈", tex: "sand" },
  western: { d: "Old Standard TT", r: "Libre Baskerville", p: "#e8d6b0", p2: "#d6c095", p3: "#bea477", ink: "#2a1c10", ink2: "#6e5639", acc: "#8b2f14", orn: "✶", tex: "sand" },
  machine: { d: "Space Grotesk", r: "Spectral", p: "#d8d1bc", p2: "#c8c0a8", p3: "#b0a88f", ink: "#4a463c", ink2: "#7b7565", acc: "#4a463c", orn: "▲", tex: "plain" },
  brume: { d: "Special Elite", r: "Spectral", p: "#cfd0cb", p2: "#bfc0ba", p3: "#a6a7a0", ink: "#22231f", ink2: "#5b5d56", acc: "#7a1f1f", orn: "✕", tex: "fog" },
  ombre: { d: "Cormorant Garamond", r: "Spectral", p: "#141414", p2: "#0c0c0c", p3: "#050505", ink: "#dcdcdc", ink2: "#8a8a8a", acc: "#f2f2f2", orn: "●", tex: "grain" },
  cosmos: { d: "Sora", r: "Spectral", p: "#0e1828", p2: "#0a1220", p3: "#050a12", ink: "#e9e3d4", ink2: "#97a0ad", acc: "#e8823a", orn: "✦", tex: "stars" },
  peinture: { d: "Playfair Display", r: "Libre Baskerville", p: "#e6dbc4", p2: "#d6c9ad", p3: "#bdae8e", ink: "#1c1915", ink2: "#615747", acc: "#b8462c", orn: "◉", tex: "canvas" },
  manga: { d: "Anton", r: "Spectral", p: "#f2efe8", p2: "#e2ded5", p3: "#c9c4b8", ink: "#141414", ink2: "#5c5a55", acc: "#e3202b", orn: "■", tex: "screen" },
  neon: { d: "Bebas Neue", r: "Space Grotesk", p: "#111015", p2: "#0a090d", p3: "#040306", ink: "#ecebf2", ink2: "#8d8a9a", acc: "#3fd0ff", orn: "◢", tex: "scan" },
};

// [style, retouches] pour chaque livre
const B = {
  // Lore & mondes
  bloodborne: ["gothique"],
  "dark-souls": ["cendre", { acc: "#d8742a", orn: "☉" }],
  "elden-ring": ["cendre"],
  hellraiser: ["gothique", { acc: "#c9a24a", orn: "◇" }],
  skyrim: ["givre"],
  sekiro: ["washi", { orn: "隻" }],
  "xenoblade-chronicles": ["givre", { d: "Marcellus", acc: "#c5302f", orn: "◬" }],
  "final-fantasy-xii": ["sable", { d: "Cinzel", acc: "#b8862b", orn: "✶" }],
  "final-fantasy-xiii": ["givre", { d: "Michroma", acc: "#4d7fbf", p: "#e8edf3", p2: "#d6dde6", p3: "#bcc6d2", orn: "◇" }],
  "air-gear": ["neon", { acc: "#4fe3ff", orn: "✈" }],
  "psycho-pass": ["terminal", { acc: "#2fd3c4" }],
  "deus-ex": ["terminal", { d: "Rajdhani", acc: "#d9a441", orn: "◣" }],
  signalis: ["terminal", { d: "VT323", acc: "#e0412f", orn: "◉" }],
  soma: ["terminal", { acc: "#4fb3c9", p: "#0a1418", orn: "≈" }],
  "serial-experiments-lain": ["terminal", { d: "VT323", acc: "#e23a5e", orn: "◌" }],
  blame: ["terminal", { d: "Michroma", acc: "#9aa4ad", ink: "#cdd3d6", orn: "▥" }],
  dune: ["sable"],
  "meridien-de-sang": ["western"],
  "hollow-knight": ["ombre", { d: "Cinzel", p: "#0f1520", p2: "#0a0f17", ink: "#dfe5ee", ink2: "#8796a8", acc: "#a9bedb", orn: "◈" }],
  "silent-hill-2": ["brume"],
  limbo: ["ombre", { tex: "film" }],
  inside: ["ombre", { d: "Space Grotesk", p: "#c9cfd2", p2: "#b8bec1", p3: "#9ea4a7", ink: "#1e2326", ink2: "#5a6064", acc: "#c4211b", orn: "■", tex: "fog" }],
  "outer-wilds": ["cosmos"],
  "disco-elysium": ["peinture"],
  pathologic: ["gothique", { d: "Oranienbaum", acc: "#c2412e", p: "#211915", orn: "✚" }],
  "rain-world": ["terminal", { d: "Rajdhani", p: "#141c1d", acc: "#7fd36b", orn: "◍", tex: "grain" }],
  "shadow-of-the-colossus": ["givre", { d: "Marcellus", p: "#dfe0d8", p2: "#cfd0c7", p3: "#b4b5ab", ink: "#26292a", acc: "#5f7d5e", orn: "◯", tex: "fog" }],
  "hyper-light-drifter": ["neon", { d: "Sora", p: "#1a1330", p2: "#120d22", ink: "#f2e9ff", ink2: "#a99cc4", acc: "#ff4fa3", orn: "◆" }],
  nier: ["machine"],
  berserk: ["gothique", { d: "Cinzel", acc: "#9e1b1b", orn: "✝" }],
  evangelion: ["neon", { d: "Bodoni Moda", acc: "#f08a24", orn: "✚" }],
  "made-in-abyss": ["papyrus", { d: "Marcellus", acc: "#b9772a", orn: "◎", tex: "fiber" }],
  "kentucky-route-zero": ["ombre", { d: "Space Grotesk", p: "#141a22", p2: "#0e131a", p3: "#070a0e", ink: "#e8e4d6", ink2: "#8c939c", acc: "#e8c24a", orn: "▲", tex: "stars" }],
  "ergo-proxy": ["terminal", { d: "Bodoni Moda", p: "#121518", p2: "#0c0e10", ink: "#dfe3e6", ink2: "#8a939a", acc: "#8fb4cf", orn: "◐", tex: "grain" }],
  "planescape-torment": ["gothique", { d: "Cinzel", p: "#1a1410", p2: "#110d0a", acc: "#b5793a", orn: "✶" }],
  darkwood: ["ombre", { d: "IM Fell English", p: "#12140f", p2: "#0b0d09", p3: "#050604", ink: "#dcd8c6", ink2: "#878a78", acc: "#a3412c", orn: "✣", tex: "vignette" }],
  dorohedoro: ["manga", { d: "Anton", p: "#d9d2c0", p2: "#c8c0ac", p3: "#ada48d", ink: "#1b1a17", ink2: "#5f594c", acc: "#3f7d3a", orn: "✚", tex: "grain" }],
  texhnolyze: ["ombre", { d: "Michroma", p: "#15130f", p2: "#0d0c09", ink: "#d9d2c3", ink2: "#857e70", acc: "#c8a24a", orn: "◩", tex: "film" }],
  stalker: ["brume", { d: "Oranienbaum", p: "#cfcab8", p2: "#bfb9a5", p3: "#a39c86", ink: "#26261f", ink2: "#615f52", acc: "#5e7232", orn: "◌", tex: "fog" }],
  alien: ["terminal", { d: "Michroma", p: "#0c0f0d", p2: "#080a09", ink: "#d6e0d3", ink2: "#7f8c7c", acc: "#86d07e", orn: "◬", tex: "scan" }],
  "blade-runner": ["neon", { d: "Rajdhani", p: "#0f1118", p2: "#0a0b11", ink: "#e6e3ef", ink2: "#8e8a9e", acc: "#ff8a3d", orn: "◆", tex: "grain" }],
  "fear-hunger": ["gothique", { d: "IM Fell English", p: "#120e0c", p2: "#0b0807", ink: "#e2d6c6", ink2: "#968774", acc: "#9a2a22", orn: "☾", tex: "vignette" }],
  "warhammer-40-000": ["gothique", { d: "Cinzel", p: "#15120e", p2: "#0d0b08", ink: "#e8dcc2", ink2: "#9c8e73", acc: "#c9a24a", orn: "✠", tex: "grain" }],
  "twin-peaks": ["ombre", { d: "Playfair Display", p: "#1a0d0e", p2: "#120809", p3: "#070303", ink: "#eee1d6", ink2: "#a08c84", acc: "#c8312b", orn: "◭", tex: "vignette" }],
  "mad-max": ["sable", { d: "Anton", p: "#d8b47c", p2: "#c69f64", p3: "#a9844b", ink: "#2a1608", ink2: "#6e4a26", acc: "#c2410c", orn: "✹", tex: "sand" }],
  "la-horde-du-contrevent": ["givre", { d: "Cormorant Garamond", p: "#e6e9e6", p2: "#d4d9d6", p3: "#b9c0bc", ink: "#1f2a2e", ink2: "#5c6a6e", acc: "#3f6f82", orn: "≋", tex: "frost" }],
  hyperion: ["cosmos", { d: "Cinzel", acc: "#d4a24a", orn: "✧" }],
  gormenghast: ["didone", { d: "IM Fell English", p: "#e2d8c3", p2: "#d2c6ad", p3: "#b8aa8c", ink: "#2a2218", acc: "#6b3a2a", orn: "❧", tex: "laid" }],
  annihilation: ["brume", { d: "Cormorant Garamond", p: "#d9dccd", p2: "#c9cdbc", p3: "#b0b5a1", acc: "#4f7a3a", orn: "❦" }],
  "le-livre-du-nouveau-soleil": ["gothique", { d: "Cinzel", acc: "#a8322a", orn: "✹" }],
  fondation: ["cosmos", { d: "Marcellus", acc: "#8fb8d8", orn: "◈" }],
  nausicaa: ["washi", { p: "#efe4cc", p2: "#e1d3b6", p3: "#c9b893", ink: "#2b2014", acc: "#2f6fa8", orn: "✣" }],
  akira: ["manga", { p: "#121212", p2: "#0a0a0a", p3: "#030303", ink: "#efefef", ink2: "#9a9a9a", acc: "#e3202b", tex: "scan" }],
  // Histoire
  "affaire-dreyfus": ["presse"],
  "commune-de-paris": ["presse", { acc: "#b3231e", orn: "✪" }],
  stavisky: ["presse", { d: "Playfair Display", acc: "#2d5b4a", orn: "◆" }],
  boulanger: ["presse", { acc: "#2c3f7a" }],
  robespierre: ["revolution"],
  "saint-just": ["revolution", { acc: "#8f1f1f", orn: "✠" }],
  danton: ["revolution", { acc: "#5a3a1c", orn: "✶" }],
  "toussaint-louverture": ["revolution", { acc: "#1d4f9c", orn: "✦" }],
  "soundiata-keita": ["papyrus", { d: "Cinzel", acc: "#b5761c", orn: "◆" }],
  lumumba: ["presse", { acc: "#1f6fb5", orn: "★" }],
  "kimpa-vita": ["papyrus", { acc: "#a8321e", orn: "✦" }],
  "royaume-du-kongo": ["papyrus", { d: "Cinzel", acc: "#7a2e1a", orn: "⊕" }],
  cleopatre: ["papyrus"],
  // Pensée, art, cinéma
  nietzsche: ["fraktur"],
  hegel: ["fraktur", { acc: "#2b3f5c" }],
  infini: ["didone", { acc: "#1f4fbf", orn: "∞" }],
  "quatrevingt-treize": ["revolution", { acc: "#9e2b25" }],
  bushido: ["washi"],
  hokusai: ["washi", { acc: "#1f3f6b", orn: "波" }],
  kitano: ["washi", { d: "Zen Kaku Gothic New", acc: "#2f5d8a", orn: "■" }],
  tarkovski: ["didone", { d: "Cormorant Garamond", p: "#e6dcc4", p2: "#d8ccb0", p3: "#bfb091", ink: "#2a241a", acc: "#5d6b4a", orn: "◦", tex: "laid" }],
  bresson: ["didone"],
  // Musique (vinyles)
  rodriguez: ["peinture", { d: "Playfair Display", acc: "#c2621f", orn: "☼" }],
  "wu-tang": ["manga", { d: "Anton", p: "#111", p2: "#0a0a0a", p3: "#030303", ink: "#f4f4f4", ink2: "#9a9a9a", acc: "#f5c400", orn: "W", tex: "grain" }],
  nwa: ["manga", { d: "Anton", p: "#0f0f0f", p2: "#080808", p3: "#020202", ink: "#f2f2f2", ink2: "#9a9a9a", acc: "#d0102e", orn: "■", tex: "grain" }],
  "michael-jackson": ["neon", { d: "Bebas Neue", acc: "#d9b45a", orn: "★" }],
  mozart: ["didone", { acc: "#8a6a2f", orn: "♪" }],
  debussy: ["didone", { d: "Cormorant Garamond", p: "#e9ecef", p2: "#d9dde2", p3: "#c0c6cd", ink: "#1f2a33", acc: "#4c7c8f", orn: "∿", tex: "laid" }],
};

const DARK = (hex) => { const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16); return ((n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) < 110; };

export function lookOf(book) {
  const e = B[book?.id]; if (!e) return null;
  const base = L[e[0]]; if (!base) return null;
  const k = { ...base, ...(e[1] || {}), key: e[0] };
  k.dark = DARK(k.p);
  return k;
}
