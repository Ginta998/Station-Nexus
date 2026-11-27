import { useEffect, useState } from "react";
import { PiSunHorizon, PiSun, PiSunHorizonFill, PiMoonStars } from "react-icons/pi";
import { pressMenu } from "@/components/atelier/ContextMenu";
import { PERIODES, periodeOf } from "@/lib/lumiere";

// Le moment de la journée, en haut à côté du menu : une aube, un soleil, un couchant ou une lune.
// L'icône et l'heure (clic droit : l'icône seule). Avec le pack Texte au téléphone, l'icône seule pour ne rien pousser.
// Les décors en mode « Suit l'heure » changent aux mêmes moments.
const ICON = { matin: PiSunHorizon, journee: PiSun, crepuscule: PiSunHorizonFill, nuit: PiMoonStars };
const read = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch (_) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };

export default function Cadran() {
  const [now, setNow] = useState(() => new Date());
  const [heure, setHeure] = useState(() => read("nx-cadran-h", "1") === "1");
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 20000); return () => clearInterval(t); }, []);
  const h = now.getHours(), m = now.getMinutes();
  const per = periodeOf(h); const label = PERIODES.find((p) => p[0] === per)?.[1];
  const hhmm = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const I = ICON[per];
  return (
    <div className={"nx-cadran p-" + per + (heure ? "" : " sans-h")} title={`${label} · ${hhmm}`} aria-label={`${label}, ${hhmm}`} role="img" data-testid="home-cadran"
      {...pressMenu(() => ({ title: `${label} · ${hhmm}`, entries: [{ label: heure ? "Ne montrer que l'icône" : "Montrer l'heure", onClick: () => { write("nx-cadran-h", heure ? "0" : "1"); setHeure(!heure); } }] }))}>
      <I size={20} /><b>{hhmm}</b>
    </div>
  );
}
