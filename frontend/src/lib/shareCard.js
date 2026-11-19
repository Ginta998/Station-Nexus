/*
  Les cartes de partage pour Instagram : une image au format story (1080 × 1920), dessinée aux couleurs du monde de l'œuvre.
  L'affiche au centre, l'œuvre en grand, la sortie (maintenant ou la date), et le lien. Tout se fait dans le navigateur.
*/
const W = 1080, H = 1920;
const loadImg = (src) => new Promise((ok) => { if (!src) return ok(null); const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
const clean = (f = "") => f.replace(/["']/g, "").split(",")[0].trim();

// les couleurs et les polices du monde, lues sur la page du monde (ou des valeurs sûres)
export function worldPalette(el) {
  const cs = el ? getComputedStyle(el) : null;
  const v = (k, d) => (cs && cs.getPropertyValue(k).trim()) || d;
  return { paper: v("--paper", "#0b0c10"), ink: v("--ink", "#f1f2f5"), hl: v("--hl", "#d4b26a"), ft: clean(v("--ft", "Georgia")), fu: clean(v("--fu", "Arial")), ws: el?.dataset?.ws || "" };
}

function cover(ctx, img, x, y, w, h) {
  const r = Math.max(w / img.width, h / img.height); const iw = img.width * r, ih = img.height * r;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}
function wrap(ctx, text, maxW, maxLines) {
  const words = String(text).split(/\s+/); const lines = []; let cur = "";
  for (const w of words) { const t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "…"; }
  return lines;
}
const spaced = (ctx, text, x, y, sp, align = "center") => {
  const chars = [...text]; const w = chars.reduce((a, c) => a + ctx.measureText(c).width + sp, -sp);
  let cx = align === "center" ? x - w / 2 : x;
  chars.forEach((c) => { ctx.fillText(c, cx, y); cx += ctx.measureText(c).width + sp; });
};

export async function drawShareCard({ title, kicker, when, url, poster, pal }) {
  const c = document.createElement("canvas"); c.width = W; c.height = H; const ctx = c.getContext("2d");
  const paper = pal.ws === "sommaire";
  try { await Promise.all([document.fonts?.load(`700 120px "${pal.ft}"`), document.fonts?.load(`600 40px "${pal.fu}"`)]); } catch (_) { /* polices système */ }
  const img = await loadImg(poster);
  // le fond : l'affiche floue et sombre (ou le papier pour la Gazette)
  ctx.fillStyle = pal.paper; ctx.fillRect(0, 0, W, H);
  if (img && !paper) {
    ctx.save(); ctx.filter = "blur(36px) brightness(0.42) saturate(1.2)"; cover(ctx, img, -80, -80, W + 160, H + 160); ctx.restore();
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "rgba(0,0,0,.15)"); g.addColorStop(0.6, "rgba(0,0,0,.35)"); g.addColorStop(1, "rgba(0,0,0,.75)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  const ink = paper ? pal.ink : "#ffffff";
  // en-tête
  ctx.fillStyle = pal.hl; ctx.font = `600 30px "${pal.fu}", Arial, sans-serif`; ctx.textBaseline = "alphabetic";
  spaced(ctx, "STATION NEXUS", W / 2, 150, 12);
  if (paper) { ctx.strokeStyle = pal.ink; ctx.lineWidth = 3; [190, 200].forEach((yy) => { ctx.beginPath(); ctx.moveTo(90, yy); ctx.lineTo(W - 90, yy); ctx.stroke(); }); }
  // l'affiche
  const pw = 700, ph = Math.round(pw * 4 / 3), px = (W - pw) / 2, py = 250;
  ctx.save();
  if (pal.ws === "dock") { ctx.shadowColor = pal.hl; ctx.shadowBlur = 60; } else { ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24; }
  ctx.fillStyle = "#111"; ctx.fillRect(px, py, pw, ph); ctx.restore();
  if (img) { ctx.save(); ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip(); if (paper) ctx.filter = "grayscale(1) contrast(1.15)"; cover(ctx, img, px, py, pw, ph); ctx.restore(); }
  else { ctx.fillStyle = pal.hl; ctx.font = `700 90px "${pal.ft}", Georgia, serif`; ctx.textAlign = "center"; ctx.fillText((title || "?")[0], W / 2, py + ph / 2 + 30); ctx.textAlign = "left"; }
  if (pal.ws === "panorama") { // repères de visée
    ctx.strokeStyle = pal.hl; ctx.lineWidth = 6; const k = 46, o = 22;
    [[px - o, py - o, 1, 1], [px + pw + o, py - o, -1, 1], [px - o, py + ph + o, 1, -1], [px + pw + o, py + ph + o, -1, -1]].forEach(([x, y, sx, sy]) => { ctx.beginPath(); ctx.moveTo(x, y + sy * k); ctx.lineTo(x, y); ctx.lineTo(x + sx * k, y); ctx.stroke(); });
  } else if (!paper) { ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 2; ctx.strokeRect(px, py, pw, ph); }
  // ce qui sort
  let y = py + ph + 110;
  ctx.textAlign = "center"; ctx.fillStyle = pal.hl; ctx.font = `600 34px "${pal.fu}", Arial, sans-serif`;
  spaced(ctx, (kicker || "").toUpperCase(), W / 2, y, 7); ctx.textAlign = "center";
  y += 40;
  ctx.fillStyle = ink; let size = 104; ctx.font = `700 ${size}px "${pal.ft}", Georgia, serif`;
  let lines = wrap(ctx, title, W - 160, 2);
  while (lines.some((l) => ctx.measureText(l).width > W - 160) && size > 60) { size -= 6; ctx.font = `700 ${size}px "${pal.ft}", Georgia, serif`; lines = wrap(ctx, title, W - 160, 2); }
  if (pal.ws === "dock") { ctx.shadowColor = pal.hl; ctx.shadowBlur = 30; }
  lines.forEach((l) => { y += size * 1.05; ctx.fillText(l, W / 2, y); });
  ctx.shadowBlur = 0;
  // la date
  y += 80; ctx.font = `500 40px "${pal.fu}", Arial, sans-serif`; ctx.fillStyle = paper ? pal.ink : "rgba(255,255,255,.92)";
  const wl = wrap(ctx, when, W - 200, 2); wl.forEach((l, i) => ctx.fillText(l, W / 2, y + i * 52));
  // le lien, dans un cadre (pour un sticker « lien » par-dessus dans Instagram)
  const ly = H - 190; ctx.font = `600 34px "${pal.fu}", Arial, sans-serif`;
  const lt = url.replace(/^https?:\/\//, ""); const lw = Math.min(W - 160, ctx.measureText(lt).width + 80);
  ctx.strokeStyle = pal.hl; ctx.lineWidth = 3; ctx.strokeRect((W - lw) / 2, ly - 52, lw, 80);
  ctx.fillStyle = ink; ctx.fillText(lt.length > 44 ? lt.slice(0, 43) + "…" : lt, W / 2, ly);
  ctx.globalAlpha = 0.6; ctx.font = `500 26px "${pal.fu}", Arial, sans-serif`; ctx.fillText("Lien en bio · ou touche le lien", W / 2, ly + 78); ctx.globalAlpha = 1;
  return new Promise((ok) => {
    try { c.toBlob((b) => ok(b), "image/png"); }
    catch (_) { ok(null); } // affiche d'un autre site qui refuse le dessin : la carte part sans elle
  });
}

export async function shareCardBlob(opts) {
  let b = await drawShareCard(opts);
  if (!b && opts.poster) b = await drawShareCard({ ...opts, poster: "" });
  return b;
}
