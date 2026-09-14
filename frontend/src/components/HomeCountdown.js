import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoRocketOutline, IoChevronForward } from "react-icons/io5";
import { listRoadmap, getSettings } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const pad = (n) => String(n).padStart(2, "0");
const calDate = (e) => (e.date_type === "approx" ? e.approx_date : e.release_date);

// Bannière compte à rebours sur l'accueil (activable dans les Paramètres). Clic → Planning.
export default function HomeCountdown() {
  const nav = useNavigate();
  const { sfx } = useApp();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const { data: entries = [] } = useQuery({ queryKey: ["roadmap"], queryFn: listRoadmap });
  const [nowTs, setNowTs] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNowTs(Date.now()), 1000); return () => clearInterval(t); }, []);

  if (settings && settings.home_countdown_enabled === false) return null;

  const todayMid = new Date(); todayMid.setHours(0, 0, 0, 0);
  const next = entries.find((e) => { const d = calDate(e); return d && new Date(d).setHours(0, 0, 0, 0) >= todayMid.getTime(); });
  if (!next) return null;

  const diff = new Date(calDate(next)).setHours(0, 0, 0, 0) - nowTs;
  const days = Math.max(0, Math.floor(diff / 86400000));
  const h = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const m = Math.max(0, Math.floor((diff % 3600000) / 60000));
  const s = Math.max(0, Math.floor((diff % 60000) / 1000));
  const title = next.title || "Nouvelle création";

  return (
    <button data-testid="home-countdown" onClick={() => { sfx("nav"); nav("/planning"); }}
      className="mx-5 md:mx-12 mt-5 flex items-center gap-3 px-4 py-2.5 border transition-transform hover:scale-[1.01] text-left w-[calc(100%-2.5rem)] md:w-auto md:self-start"
      style={{ background: "rgba(0,0,0,0.42)", borderColor: "var(--brand)", borderRadius: "var(--radius-base)", backdropFilter: "blur(8px)" }}>
      <span className="w-2 h-2 rounded-full animate-pulse flex-none" style={{ background: "var(--brand)", boxShadow: "0 0 8px var(--brand)" }} />
      <IoRocketOutline size={18} style={{ color: "var(--brand)" }} className="flex-none" />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] uppercase tracking-widest" style={{ color: "var(--brand)" }}>Prochaine sortie</span>
        <span className="block text-sm font-semibold truncate" style={{ color: "#fff" }}>
          {title} · {diff <= 0 ? "Aujourd'hui ! 🎉" : <span className="font-mono tabular-nums">J-{days} · {pad(h)}h {pad(m)}m {pad(s)}s</span>}
        </span>
      </span>
      <IoChevronForward size={16} style={{ color: "var(--brand)" }} className="flex-none" />
    </button>
  );
}
