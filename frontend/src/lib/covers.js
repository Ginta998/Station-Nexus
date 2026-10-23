/*
 * Couvertures des pistes (ambiances) — image d'album.
 *
 * Le backend ne stocke pas encore d'image de couverture pour les ambiances
 * (champs : id, title, emoji, order). En attendant un endpoint dédié, la
 * couverture est enregistrée localement (localStorage), redimensionnée pour
 * rester légère, et affichée dans le lecteur + les paramètres.
 *
 * Dès qu'un endpoint /ambiences/{id}/cover existera côté backend (miroir de
 * l'audio), il suffira de brancher ambienceCoverUrl() dans `coverSrc`.
 */
const KEY = "sx_ambience_covers";

function readMap() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (_) { return {}; }
}

export function getCover(id) {
  if (!id) return "";
  return readMap()[id] || "";
}

export function setCover(id, dataUrl) {
  if (!id) return;
  try {
    const m = readMap();
    if (dataUrl) m[id] = dataUrl; else delete m[id];
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch (_) {}
  try { window.dispatchEvent(new Event("sx-covers")); } catch (_) {}
}

// Lit un fichier image et le redimensionne (carré, max px) en dataURL JPEG léger.
export function fileToCover(file, max = 256) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("no file"));
    if (!/^image\//.test(file.type)) return reject(new Error("not an image"));
    const r = new FileReader();
    r.onerror = () => reject(new Error("read error"));
    r.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode error"));
      img.onload = () => {
        try {
          const side = Math.min(img.width, img.height);
          const sx = (img.width - side) / 2, sy = (img.height - side) / 2;
          const c = document.createElement("canvas");
          c.width = max; c.height = max;
          const ctx = c.getContext("2d");
          ctx.drawImage(img, sx, sy, side, side, 0, 0, max, max);
          resolve(c.toDataURL("image/jpeg", 0.82));
        } catch (e) { reject(e); }
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}
