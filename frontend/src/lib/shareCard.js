/*
  Les cartes de partage : des images aux couleurs du monde de l'œuvre, en plusieurs formats et plusieurs dessins.
  Formats : story (1080 × 1920), post (1080 × 1350), carré (1080 × 1080).
  Dessins : Affiche, Plein cadre, Citation, Billet, Compte à rebours, Typo.
  Tout se dessine dans le navigateur (canvas), rien ne part sur un serveur.
*/
export const CARD_SIZES = [["story", "Story", 1080, 1920], ["post", "Post", 1080, 1350], ["carre", "Carré", 1080, 1080]];
export const CARD_LAYOUTS = [
  ["affiche", "Affiche", "L'affiche au centre, sur son propre flou"],
  ["plein", "Plein cadre", "L'image en grand, le titre posé dessus, comme un film"],
  ["citation", "Citation", "Une phrase de l'œuvre en grand, l'affiche en petit"],
  ["billet", "Billet", "Un ticket d'entrée, avec le talon de la date"],
  ["compte", "Compte à rebours", "J-2 en très grand : pour annoncer une sortie"],
  ["typo", "Typo", "Juste le titre, énorme, aux couleurs du monde"],
];

const loadImg = (src) => new Promise((ok) => { if (!src) return ok(null); const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
const clean = (f = "") => f.replace(/["']/g, "").split(",")[0].trim();
export function worldPalette(el) {
  const cs = el ? getComputedStyle(el) : null;
  const v = (k, d) => (cs && cs.getPropertyValue(k).trim()) || d;
  return { paper: v("--paper", "#0b0c10"), ink: v("--ink", "#f1f2f5"), hl: v("--hl", "#d4b26a"), ft: clean(v("--ft", "Georgia")), fu: clean(v("--fu", "Arial")), fb: clean(v("--fb", "Georgia")), ws: el?.dataset?.ws || "" };
}
const lum = (c) => { const m = /^#?([\da-f]{6})$/i.exec(String(c).trim()); if (!m) return 0.1; const n = parseInt(m[1], 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };

function cover(ctx, img, x, y, w, h) { const r = Math.max(w / img.width, h / img.height); const iw = img.width * r, ih = img.height * r; ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); }
function wrap(ctx, text, maxW, maxLines) {
  const words = String(text || "").split(/\s+/).filter(Boolean); const lines = []; let cur = "";
  for (const w of words) { const t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "…"; }
  return lines;
}
const spaced = (ctx, text, x, y, sp, align = "center") => {
  const chars = [...String(text)]; const w = chars.reduce((a, c) => a + ctx.measureText(c).width + sp, -sp);
  let cx = align === "center" ? x - w / 2 : align === "right" ? x - w : x; const prev = ctx.textAlign; ctx.textAlign = "left";
  chars.forEach((c) => { ctx.fillText(c, cx, y); cx += ctx.measureText(c).width + sp; }); ctx.textAlign = prev;
};
// un titre qui rentre : on réduit jusqu'à tenir sur maxLines
function fitTitle(ctx, text, font, size, maxW, maxLines, min = 50) {
  let s = size; let lines;
  do { ctx.font = font(s); lines = wrap(ctx, text, maxW, maxLines); s -= 4; } while ((lines.some((l) => ctx.measureText(l).width > maxW) || wrap(ctx, text, maxW, 99).length > maxLines) && s > min);
  return { lines, size: s + 4 };
}
function linkBox(ctx, pal, W, y, url, ink) {
  ctx.font = `600 32px "${pal.fu}", Arial, sans-serif`; ctx.textAlign = "center";
  const lt = url.replace(/^https?:\/\//, ""); const t = lt.length > 46 ? lt.slice(0, 45) + "…" : lt; const lw = Math.min(W - 140, ctx.measureText(t).width + 76);
  ctx.strokeStyle = pal.hl; ctx.lineWidth = 3; ctx.strokeRect((W - lw) / 2, y - 50, lw, 76); ctx.fillStyle = ink; ctx.fillText(t, W / 2, y);
}
const head = (ctx, pal, W, y, color) => { ctx.fillStyle = color || pal.hl; ctx.font = `600 28px "${pal.fu}", Arial, sans-serif`; spaced(ctx, "STATION NEXUS", W / 2, y, 12); };

const LAYOUTS = {
  // l'affiche au centre, sur son flou
  affiche(ctx, d) {
    const { W, H, pal, img } = d; const paper = pal.ws === "sommaire"; const ink = paper ? pal.ink : "#fff";
    ctx.fillStyle = pal.paper; ctx.fillRect(0, 0, W, H);
    if (img && !paper) { ctx.save(); ctx.filter = "blur(36px) brightness(0.42) saturate(1.2)"; cover(ctx, img, -80, -80, W + 160, H + 160); ctx.restore(); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "rgba(0,0,0,.15)"); g.addColorStop(1, "rgba(0,0,0,.75)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    const top = H > 1500 ? 150 : 110; head(ctx, pal, W, top);
    const room = H - (H > 1500 ? 860 : H > 1200 ? 640 : 560); const ph = Math.max(380, room); const pw = Math.round(ph * 0.75); const px = (W - pw) / 2, py = top + 70;
    ctx.save(); if (pal.ws === "dock") { ctx.shadowColor = pal.hl; ctx.shadowBlur = 60; } else { ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24; }
    ctx.fillStyle = "#111"; ctx.fillRect(px, py, pw, ph); ctx.restore();
    if (img) { ctx.save(); ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip(); if (paper) ctx.filter = "grayscale(1) contrast(1.15)"; cover(ctx, img, px, py, pw, ph); ctx.restore(); }
    if (pal.ws === "panorama") { ctx.strokeStyle = pal.hl; ctx.lineWidth = 6; const k = 46, o = 22; [[px - o, py - o, 1, 1], [px + pw + o, py - o, -1, 1], [px - o, py + ph + o, 1, -1], [px + pw + o, py + ph + o, -1, -1]].forEach(([x, y, sx, sy]) => { ctx.beginPath(); ctx.moveTo(x, y + sy * k); ctx.lineTo(x, y); ctx.lineTo(x + sx * k, y); ctx.stroke(); }); }
    let y = py + ph + 90; ctx.textAlign = "center"; ctx.fillStyle = pal.hl; ctx.font = `600 32px "${pal.fu}", Arial, sans-serif`; spaced(ctx, (d.kicker || "").toUpperCase().slice(0, 48), W / 2, y, 6);
    const t = fitTitle(ctx, d.title, (s) => `700 ${s}px "${pal.ft}", Georgia, serif`, 100, W - 160, 2); ctx.fillStyle = ink; if (pal.ws === "dock") { ctx.shadowColor = pal.hl; ctx.shadowBlur = 30; }
    t.lines.forEach((l) => { y += t.size * 1.05; ctx.fillText(l, W / 2, y); }); ctx.shadowBlur = 0;
    y += 70; ctx.font = `500 38px "${pal.fu}", Arial, sans-serif`; ctx.fillStyle = paper ? pal.ink : "rgba(255,255,255,.92)"; wrap(ctx, d.when, W - 200, 2).forEach((l, i) => ctx.fillText(l, W / 2, y + i * 50));
    linkBox(ctx, pal, W, H - (H > 1500 ? 170 : 90), d.url, ink);
  },
  // l'image en grand, comme une affiche de film
  plein(ctx, d) {
    const { W, H, pal, img } = d;
    ctx.fillStyle = pal.paper; ctx.fillRect(0, 0, W, H); if (img) cover(ctx, img, 0, 0, W, H);
    const g = ctx.createLinearGradient(0, H * 0.35, 0, H); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.55, "rgba(0,0,0,.65)"); g.addColorStop(1, "rgba(0,0,0,.92)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const g2 = ctx.createLinearGradient(0, 0, 0, 260); g2.addColorStop(0, "rgba(0,0,0,.55)"); g2.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, 260);
    ctx.textAlign = "left"; ctx.fillStyle = "#fff"; ctx.font = `600 28px "${pal.fu}", Arial, sans-serif`; spaced(ctx, "STATION NEXUS", 80, 120, 12, "left");
    const t = fitTitle(ctx, d.title, (s) => `800 ${s}px "${pal.ft}", Georgia, serif`, 150, W - 160, 3, 70);
    let y = H - (H > 1500 ? 470 : 360) - (t.lines.length - 1) * t.size;
    ctx.fillStyle = pal.hl; ctx.font = `600 32px "${pal.fu}", Arial, sans-serif`; spaced(ctx, (d.kicker || "").toUpperCase().slice(0, 44), 80, y - t.size * 1.25 - 16, 6, "left");
    ctx.fillStyle = "#fff"; ctx.font = `800 ${t.size}px "${pal.ft}", Georgia, serif`; t.lines.forEach((l, i) => ctx.fillText(l, 80, y + i * t.size * 1.02 - t.size * 0.2));
    y += (t.lines.length - 1) * t.size + 70; ctx.fillStyle = pal.hl; ctx.fillRect(80, y - 30, 120, 6);
    ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.font = `500 38px "${pal.fu}", Arial, sans-serif`; wrap(ctx, d.when, W - 160, 2).forEach((l, i) => ctx.fillText(l, 80, y + 40 + i * 50));
    ctx.font = `600 30px "${pal.fu}", Arial, sans-serif`; ctx.fillStyle = "#fff"; ctx.fillText(d.url.replace(/^https?:\/\//, ""), 80, H - (H > 1500 ? 150 : 80));
  },
  // une phrase de l'œuvre en grand
  citation(ctx, d) {
    const { W, H, pal, img } = d; const dark = lum(pal.paper) < 0.5; const ink = pal.ink;
    ctx.fillStyle = pal.paper; ctx.fillRect(0, 0, W, H);
    if (img) { ctx.save(); ctx.globalAlpha = dark ? 0.18 : 0.1; ctx.filter = "blur(24px) grayscale(.3)"; cover(ctx, img, -60, -60, W + 120, H + 120); ctx.restore(); }
    head(ctx, pal, W, H > 1500 ? 150 : 110);
    ctx.fillStyle = pal.hl; ctx.font = `700 260px Georgia, serif`; ctx.textAlign = "left"; ctx.fillText("“", 70, H > 1500 ? 470 : 360);
    const q = d.quote || d.title; const t = fitTitle(ctx, q, (s) => `italic 400 ${s}px "${pal.fb}", Georgia, serif`, H > 1500 ? 76 : 64, W - 200, H > 1500 ? 9 : 6, 40);
    let y = H > 1500 ? 520 : 400; ctx.fillStyle = ink; ctx.font = `italic 400 ${t.size}px "${pal.fb}", Georgia, serif`; t.lines.forEach((l) => { ctx.fillText(l, 100, y); y += t.size * 1.28; });
    y += 30; ctx.fillStyle = pal.hl; ctx.fillRect(100, y, 90, 5);
    const th = 220, tw = 165, ty = H - (H > 1500 ? 470 : 360);
    if (img) { ctx.save(); ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 30; ctx.fillRect(100, ty, tw, th); ctx.restore(); ctx.save(); ctx.beginPath(); ctx.rect(100, ty, tw, th); ctx.clip(); cover(ctx, img, 100, ty, tw, th); ctx.restore(); }
    const tx = img ? 300 : 100; ctx.fillStyle = ink; ctx.font = `700 54px "${pal.ft}", Georgia, serif`; wrap(ctx, d.title, W - tx - 80, 2).forEach((l, i) => ctx.fillText(l, tx, ty + 60 + i * 60));
    ctx.fillStyle = pal.hl; ctx.font = `600 28px "${pal.fu}", Arial, sans-serif`; spaced(ctx, (d.kicker || "").toUpperCase().slice(0, 34), tx, ty + 190, 4, "left");
    ctx.fillStyle = ink; ctx.globalAlpha = 0.75; ctx.font = `500 30px "${pal.fu}", Arial, sans-serif`; ctx.fillText(d.url.replace(/^https?:\/\//, ""), 100, H - (H > 1500 ? 150 : 80)); ctx.globalAlpha = 1;
  },
  // un ticket d'entrée
  billet(ctx, d) {
    const { W, H, pal, img } = d; ctx.fillStyle = pal.paper; ctx.fillRect(0, 0, W, H);
    if (img) { ctx.save(); ctx.filter = "blur(40px) brightness(.5)"; cover(ctx, img, -80, -80, W + 160, H + 160); ctx.restore(); }
    const tw = W - 160, th = Math.min(H - 300, 1500), tx = 80, ty = (H - th) / 2; const stub = Math.round(th * 0.22); const r = 34; const cream = "#f4ecd9", inkT = "#1a1714";
    const ticket = () => { ctx.beginPath(); ctx.moveTo(tx + r, ty); ctx.lineTo(tx + tw - r, ty); ctx.quadraticCurveTo(tx + tw, ty, tx + tw, ty + r); ctx.lineTo(tx + tw, ty + th - stub - r); ctx.arc(tx + tw, ty + th - stub, r, -Math.PI / 2, Math.PI / 2, true); ctx.lineTo(tx + tw, ty + th - r); ctx.quadraticCurveTo(tx + tw, ty + th, tx + tw - r, ty + th); ctx.lineTo(tx + r, ty + th); ctx.quadraticCurveTo(tx, ty + th, tx, ty + th - r); ctx.lineTo(tx, ty + th - stub + r); ctx.arc(tx, ty + th - stub, r, Math.PI / 2, -Math.PI / 2, true); ctx.lineTo(tx, ty + r); ctx.quadraticCurveTo(tx, ty, tx + r, ty); ctx.closePath(); };
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 60; ctx.shadowOffsetY = 30; ticket(); ctx.fillStyle = cream; ctx.fill(); ctx.restore();
    ctx.save(); ticket(); ctx.clip();
    const ih = th - stub - 360; if (img) { ctx.save(); ctx.beginPath(); ctx.rect(tx + 40, ty + 130, tw - 80, ih); ctx.clip(); cover(ctx, img, tx + 40, ty + 130, tw - 80, ih); ctx.restore(); }
    ctx.fillStyle = pal.hl; ctx.fillRect(tx, ty, tw, 90); ctx.fillStyle = lum(pal.hl) > 0.6 ? "#111" : "#fff"; ctx.font = `700 30px "${pal.fu}", Arial, sans-serif`; spaced(ctx, "STATION NEXUS · ENTRÉE", W / 2, ty + 58, 10);
    let y = ty + 130 + ih + 112; ctx.textAlign = "center"; ctx.fillStyle = inkT;
    const t = fitTitle(ctx, d.title, (s) => `800 ${s}px "${pal.ft}", Georgia, serif`, 92, tw - 120, 2); t.lines.forEach((l) => { ctx.fillText(l, W / 2, y); y += t.size * 1.02; });
    ctx.fillStyle = "#6b5f50"; ctx.font = `600 30px "${pal.fu}", Arial, sans-serif`; spaced(ctx, (d.kicker || "").toUpperCase().slice(0, 40), W / 2, y + 10, 5);
    ctx.setLineDash([14, 12]); ctx.strokeStyle = "#a99a85"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx + 50, ty + th - stub); ctx.lineTo(tx + tw - 50, ty + th - stub); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = inkT; ctx.font = `700 40px "${pal.fu}", Arial, sans-serif`; wrap(ctx, d.when, tw - 120, 2).forEach((l, i) => ctx.fillText(l, W / 2, ty + th - stub + 90 + i * 48));
    ctx.fillStyle = "#6b5f50"; ctx.font = `500 28px "${pal.fu}", Arial, sans-serif`; ctx.fillText(d.url.replace(/^https?:\/\//, ""), W / 2, ty + th - 50);
    ctx.restore();
  },
  // J-2 en très grand
  compte(ctx, d) {
    const { W, H, pal, img } = d; ctx.fillStyle = pal.paper; ctx.fillRect(0, 0, W, H);
    if (img) { ctx.save(); ctx.filter = "blur(30px) brightness(.35)"; cover(ctx, img, -80, -80, W + 160, H + 160); ctx.restore(); }
    const ink = img || lum(pal.paper) < 0.5 ? "#fff" : pal.ink; head(ctx, pal, W, H > 1500 ? 150 : 110);
    ctx.textAlign = "center"; ctx.fillStyle = pal.hl; ctx.font = `600 36px "${pal.fu}", Arial, sans-serif`; spaced(ctx, d.days === 0 ? "C'EST AUJOURD'HUI" : d.days > 0 ? "SORTIE DANS" : "SUR LA STATION", W / 2, H * 0.3, 10);
    const big = d.days === 0 ? "J" : d.days > 0 ? `J-${d.days}` : "NOUVEAU"; ctx.fillStyle = ink; ctx.font = `900 ${big.length > 4 ? 200 : 360}px "${pal.ft}", Georgia, serif`;
    if (pal.ws === "dock") { ctx.shadowColor = pal.hl; ctx.shadowBlur = 50; } ctx.fillText(big, W / 2, H * 0.3 + (big.length > 4 ? 230 : 360)); ctx.shadowBlur = 0;
    let y = H * 0.3 + (big.length > 4 ? 340 : 480); const t = fitTitle(ctx, d.title, (s) => `700 ${s}px "${pal.ft}", Georgia, serif`, 84, W - 160, 2); ctx.fillStyle = ink;
    t.lines.forEach((l) => { ctx.fillText(l, W / 2, y); y += t.size * 1.05; });
    ctx.fillStyle = pal.hl; ctx.font = `600 32px "${pal.fu}", Arial, sans-serif`; spaced(ctx, (d.kicker || "").toUpperCase().slice(0, 44), W / 2, y + 10, 6);
    ctx.fillStyle = ink; ctx.font = `500 38px "${pal.fu}", Arial, sans-serif`; wrap(ctx, d.when, W - 200, 2).forEach((l, i) => ctx.fillText(l, W / 2, y + 90 + i * 50));
    linkBox(ctx, pal, W, H - (H > 1500 ? 170 : 90), d.url, ink);
  },
  // juste le titre, énorme
  typo(ctx, d) {
    const { W, H, pal } = d; ctx.fillStyle = pal.paper; ctx.fillRect(0, 0, W, H); const ink = pal.ink;
    ctx.strokeStyle = pal.hl; ctx.lineWidth = 4; ctx.strokeRect(50, 50, W - 100, H - 100);
    ctx.textAlign = "left"; ctx.fillStyle = pal.hl; ctx.font = `600 28px "${pal.fu}", Arial, sans-serif`; spaced(ctx, "STATION NEXUS", 100, 140, 12, "left");
    const t = fitTitle(ctx, d.title.toUpperCase(), (s) => `900 ${s}px "${pal.ft}", Georgia, serif`, 220, W - 200, H > 1500 ? 5 : 4, 80);
    let y = H / 2 - (t.lines.length * t.size * 0.92) / 2 + t.size * 0.8; ctx.fillStyle = ink; ctx.font = `900 ${t.size}px "${pal.ft}", Georgia, serif`;
    if (pal.ws === "dock") { ctx.shadowColor = pal.hl; ctx.shadowBlur = 40; } t.lines.forEach((l) => { ctx.fillText(l, 100, y); y += t.size * 0.92; }); ctx.shadowBlur = 0;
    ctx.fillStyle = pal.hl; ctx.font = `600 34px "${pal.fu}", Arial, sans-serif`; spaced(ctx, (d.kicker || "").toUpperCase().slice(0, 40), 100, y + 30, 6, "left");
    ctx.fillStyle = ink; ctx.font = `500 36px "${pal.fu}", Arial, sans-serif`; wrap(ctx, d.when, W - 200, 2).forEach((l, i) => ctx.fillText(l, 100, H - 230 + i * 46));
    ctx.globalAlpha = 0.8; ctx.font = `500 30px "${pal.fu}", Arial, sans-serif`; ctx.fillText(d.url.replace(/^https?:\/\//, ""), 100, H - 110); ctx.globalAlpha = 1;
  },
};

export async function drawShareCard({ layout = "affiche", size = "story", title, kicker, when, url, poster, pal, quote, days }) {
  const [, , W, H] = CARD_SIZES.find((s) => s[0] === size) || CARD_SIZES[0];
  const c = document.createElement("canvas"); c.width = W; c.height = H; const ctx = c.getContext("2d");
  try { await Promise.all([document.fonts?.load(`700 120px "${pal.ft}"`), document.fonts?.load(`600 40px "${pal.fu}"`), document.fonts?.load(`italic 400 60px "${pal.fb}"`)]); } catch (_) { /* polices système */ }
  const img = await loadImg(poster); ctx.textBaseline = "alphabetic";
  (LAYOUTS[layout] || LAYOUTS.affiche)(ctx, { W, H, pal, img, title: title || "", kicker, when, url, quote, days });
  return new Promise((ok) => { try { c.toBlob((b) => ok(b), "image/png"); } catch (_) { ok(null); } });
}
export async function shareCardBlob(opts) {
  let b = await drawShareCard(opts);
  if (!b && opts.poster) b = await drawShareCard({ ...opts, poster: "" }); // affiche d'un autre site qui refuse le dessin : la carte part sans elle
  return b;
}
