import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

const KEY = "sx_start";
export const startTarget = () => localStorage.getItem(KEY) || "station";

// À l'ouverture de l'app (une fois par session) : arrive directement dans l'Atelier si choisi
export function StartupRedirect() {
  const { isAdmin } = useApp();
  const { ready } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  useEffect(() => {
    if (!ready || sessionStorage.getItem("sx_start_done")) return;
    sessionStorage.setItem("sx_start_done", "1");
    if (startTarget() === "atelier" && isAdmin && loc.pathname === "/") nav("/atelier", { replace: true });
    // eslint-disable-next-line
  }, [ready, isAdmin]);
  return null;
}

// Réglage « au démarrage, ouvrir » : la Station ou directement l'Atelier (sur cet appareil)
export function StartupSetting({ className = "" }) {
  const [v, setV] = useState(startTarget());
  const pick = (x) => { localStorage.setItem(KEY, x); setV(x); };
  return (
    <div className={"sx-startup " + className} data-testid="startup-setting">
      {[["station", "La Station", "Ton launcher public"], ["atelier", "L'Atelier Nexus", "Directement ton espace privé"]].map(([k, l, d]) => (
        <button key={k} className={v === k ? "on" : ""} onClick={() => pick(k)} data-testid={`startup-${k}`}><b>{l}</b><small>{d}</small></button>
      ))}
    </div>
  );
}
