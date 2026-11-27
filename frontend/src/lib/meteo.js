import { PiSun, PiMoonStars, PiCloudSun, PiCloudMoon, PiCloud, PiCloudFog, PiCloudRain, PiCloudSnow, PiCloudLightning } from "react-icons/pi";

// Météo de l'Atelier (seulement pour l'admin) : Open-Meteo, gratuit et sans clé. La ville se règle dans
// Réglages de l'Atelier ; le public n'a rien à autoriser.
const CODES = [
  [[0], "Ciel dégagé", "clair"], [[1, 2], "Quelques nuages", "voile"], [[3], "Couvert", "nuage"], [[45, 48], "Brouillard", "brume"],
  [[51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82], "Pluie", "pluie"], [[71, 73, 75, 77, 85, 86], "Neige", "neige"], [[95, 96, 99], "Orage", "orage"],
];
const ICONS = { clair: [PiSun, PiMoonStars], voile: [PiCloudSun, PiCloudMoon], nuage: [PiCloud, PiCloud], brume: [PiCloudFog, PiCloudFog], pluie: [PiCloudRain, PiCloudRain], neige: [PiCloudSnow, PiCloudSnow], orage: [PiCloudLightning, PiCloudLightning] };
export const meteoOf = (code, jour = true) => { const c = CODES.find((x) => x[0].includes(code)) || CODES[2]; return { label: c[1], kind: c[2], Icon: ICONS[c[2]][jour ? 0 : 1] }; };

export async function chercherVille(q) {
  const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?count=6&language=fr&name=${encodeURIComponent(q)}`);
  const d = await r.json();
  return (d.results || []).map((v) => ({ ville: v.name, region: [v.admin1, v.country].filter(Boolean).join(", "), lat: v.latitude, lon: v.longitude }));
}

export async function meteoDe({ lat, lon }, force = false) {
  const k = `nx-meteo-${lat},${lon}`;
  if (!force) try { const c = JSON.parse(sessionStorage.getItem(k)); if (c && Date.now() - c.t < 20 * 60000) return c.d; } catch (_) {}
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto`);
  const j = await r.json();
  const d = { temp: Math.round(j.current?.temperature_2m), code: j.current?.weather_code, jour: j.current?.is_day === 1, max: Math.round(j.daily?.temperature_2m_max?.[0]), min: Math.round(j.daily?.temperature_2m_min?.[0]) };
  try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), d })); } catch (_) {}
  return d;
}
