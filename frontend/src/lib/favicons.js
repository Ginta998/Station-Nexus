// Favicons de la direction « Laboratoire » (Rhine Lab) : à choisir dans Réglages > Identité du site.
// Chaque icône est un SVG 512 × 512, converti en PNG au moment du choix (le serveur garde le PNG).
const INK = "#111317", PAPER = "#ecebe6", ACC = "#f26b1d", CYAN = "#3fe6f0", GREY = "#8b8e94";

// 天 dessiné en traits (aucune police nécessaire)
const ten = (c, w = 34, s = 1, dx = 0, dy = 0) => `<g transform="translate(${dx} ${dy}) translate(256 256) scale(${s}) translate(-256 -256)" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M158 150H354"/><path d="M118 252H394"/><path d="M256 150V252"/><path d="M256 252Q236 352 124 414"/><path d="M256 252Q278 352 388 414"/></g>`;
const svg = (body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${bg ? `<rect width="512" height="512" fill="${bg}"/>` : ""}${body}</svg>`;
const corners = (c, w = 14, m = 64, l = 70) => `<g fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="square">
  <path d="M${m} ${m + l}V${m}H${m + l}"/><path d="M${512 - m - l} ${m}H${512 - m}V${m + l}"/><path d="M${512 - m} ${512 - m - l}V${512 - m}H${512 - m - l}"/><path d="M${m + l} ${512 - m}H${m}V${512 - m - l}"/></g>`;

export const FAVICONS = [
  { key: "labo", label: "Labo", hint: "天 noir sur papier, crochets orange", svg: svg(corners(ACC) + ten(INK, 36, 0.86), PAPER) },
  { key: "nuit", label: "Labo nuit", hint: "Le même, en négatif", svg: svg(corners(ACC) + ten(PAPER, 36, 0.86), INK) },
  { key: "reticule", label: "Réticule", hint: "Viseur de laboratoire autour du 天", svg: svg(`<circle cx="256" cy="256" r="178" fill="none" stroke="${GREY}" stroke-width="10"/><circle cx="256" cy="256" r="206" fill="none" stroke="${ACC}" stroke-width="14" stroke-dasharray="60 34"/><g stroke="${PAPER}" stroke-width="14" stroke-linecap="round"><path d="M256 18V70"/><path d="M256 442V494"/><path d="M18 256H70"/><path d="M442 256H494"/></g>` + ten(PAPER, 30, 0.6), INK) },
  { key: "hexa", label: "Hexagone", hint: "Cellule hexagonale, 天 au centre", svg: svg(`<path d="M256 52L432 154V358L256 460L80 358V154Z" fill="none" stroke="${ACC}" stroke-width="18" stroke-linejoin="round"/><path d="M256 96L394 176V336L256 416L118 336V176Z" fill="${PAPER}"/>` + ten(INK, 32, 0.62), INK) },
  { key: "bande", label: "Bande", hint: "Bande de danger en bas, comme un badge d'accès", svg: svg(`<defs><clipPath id="c"><rect width="512" height="512"/></clipPath><pattern id="h" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="32" height="64" fill="${ACC}"/><rect x="32" width="32" height="64" fill="${INK}"/></pattern></defs><g clip-path="url(#c)"><rect y="392" width="512" height="120" fill="url(#h)"/></g>` + ten(INK, 38, 0.74, 0, -48), PAPER) },
  { key: "fiole", label: "Fiole", hint: "Fiole de laboratoire, liquide orange", svg: svg(`<path d="M206 76H306M222 76V206L118 398Q104 432 140 436H372Q408 432 394 398L290 206V76" fill="none" stroke="${PAPER}" stroke-width="22" stroke-linejoin="round" stroke-linecap="round"/><path d="M176 330H336L376 404Q382 418 366 418H146Q130 418 136 404Z" fill="${ACC}"/><circle cx="226" cy="300" r="12" fill="${CYAN}"/><circle cx="276" cy="268" r="8" fill="${CYAN}"/>`, INK) },
  { key: "plaque", label: "Plaque", hint: "Plaque d'échantillons, une case allumée", svg: svg(Array.from({ length: 9 }, (_, i) => { const x = 104 + (i % 3) * 108, y = 104 + Math.floor(i / 3) * 108; return i === 4 ? `<rect x="${x}" y="${y}" width="88" height="88" rx="14" fill="${ACC}"/>` : `<rect x="${x}" y="${y}" width="88" height="88" rx="14" fill="none" stroke="${i % 2 ? GREY : PAPER}" stroke-width="10"/>`; }).join(""), INK) },
  { key: "noyau", label: "Noyau", hint: "Orbite du Nexus et son point d'ancrage", svg: svg(`<ellipse cx="256" cy="256" rx="200" ry="86" fill="none" stroke="${CYAN}" stroke-width="12" transform="rotate(-28 256 256)"/><ellipse cx="256" cy="256" rx="200" ry="86" fill="none" stroke="${GREY}" stroke-width="8" transform="rotate(32 256 256)"/><circle cx="256" cy="256" r="64" fill="${ACC}"/><circle cx="420" cy="166" r="20" fill="${PAPER}"/>`, INK) },
  { key: "sn", label: "SN", hint: "Monogramme Station Nexus, trait de laboratoire", svg: svg(`<g fill="none" stroke="${INK}" stroke-width="36" stroke-linecap="square" stroke-linejoin="miter"><path d="M226 172Q222 150 176 150Q122 150 122 200Q122 252 174 252Q226 252 226 304Q226 354 172 354Q126 354 122 332" stroke-linecap="round"/><path d="M290 354V150L390 354V150"/></g><rect x="122" y="398" width="268" height="18" fill="${ACC}"/>`, PAPER) },
];

export const faviconUri = (s) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`;
export const faviconPng = (s, size = 512) => new Promise((res, rej) => {
  const img = new Image(); img.onerror = rej;
  img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = size; c.getContext("2d").drawImage(img, 0, 0, size, size); res(c.toDataURL("image/png")); };
  img.src = faviconUri(s);
});
