// Couvertures des pistes (ambiances) — stockées sur le serveur, visibles sur tous les appareils.
import { API, api } from "@/lib/api";

const LEGACY_KEY = "sx_ambience_covers"; // anciennes couvertures restées dans ce navigateur
const versions = {}; // id -> version de la couverture côté serveur
const migrating = new Set();

const emit = () => { try { window.dispatchEvent(new Event("sx-covers")); } catch (_) {} };
const readLegacy = () => { try { return JSON.parse(localStorage.getItem(LEGACY_KEY) || "{}") || {}; } catch (_) { return {}; } };
const dropLegacy = (id) => { const m = readLegacy(); delete m[id]; Object.keys(m).length ? localStorage.setItem(LEGACY_KEY, JSON.stringify(m)) : localStorage.removeItem(LEGACY_KEY); };

// à appeler avec la liste des ambiences reçue du serveur
export function registerAmbiences(list = []) {
  const legacy = readLegacy();
  list.forEach((a) => {
    versions[a.id] = a.has_cover ? (a.cover_v || "1") : "";
    // une couverture restée en local : on l'envoie une fois sur le serveur
    if (!a.has_cover && legacy[a.id] && !migrating.has(a.id)) {
      migrating.add(a.id);
      setCover(a.id, legacy[a.id]).then(() => dropLegacy(a.id)).catch(() => {}).finally(() => migrating.delete(a.id));
    } else if (a.has_cover && legacy[a.id]) dropLegacy(a.id);
  });
}

export function getCover(id) {
  if (!id) return "";
  const v = versions[id];
  if (v) return `${API}/ambiences/${id}/cover?v=${encodeURIComponent(v)}`;
  return readLegacy()[id] || "";
}

export async function setCover(id, dataUrl) {
  if (!id) return;
  await api.put(`/ambiences/${id}/cover`, { cover: dataUrl || "" });
  versions[id] = dataUrl ? String(Date.now()) : "";
  emit();
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
          c.getContext("2d").drawImage(img, sx, sy, side, side, 0, 0, max, max);
          resolve(c.toDataURL("image/jpeg", 0.85));
        } catch (e) { reject(e); }
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}
