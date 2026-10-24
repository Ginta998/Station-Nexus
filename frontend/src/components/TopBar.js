import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoPersonCircle, IoExpand, IoContract } from "react-icons/io5";
import { useApp } from "@/context/AppContext";
import { TextSizeButton } from "@/components/TextSizeButton";
import { listAnnouncements } from "@/lib/api";
import StationMenu, { SoundBtn } from "@/components/StationMenu";

export default function TopBar({ onAdd, onProfile }) {
  const nav = useNavigate();
  const { sfx, profile, seenAnnouncements } = useApp();
  const [isFs, setIsFs] = useState(typeof document !== "undefined" && !!document.fullscreenElement);
  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);
  const toggleFs = () => {
    sfx("nav");
    try {
      if (document.fullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      else { const el = document.documentElement; (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el); }
    } catch (_) {}
  };
  const { data: announcements = [] } = useQuery({ queryKey: ["announcements"], queryFn: listAnnouncements });
  const unread = announcements.filter((a) => !seenAnnouncements.includes(a.id)).length;

  const btn = { borderColor: "rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)", color: "var(--on-media)", background: "rgba(0,0,0,0.25)" };

  const Dot = ({ n }) => (n > 0 ? (
    <span data-testid="notif-badge" className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full"
      style={{ background: "var(--brand)", color: "var(--bg-primary)", boxShadow: "0 0 8px var(--brand)" }}>{n > 9 ? "9+" : n}</span>
  ) : null);

  return (
    <header className="sx-header relative z-20 flex items-center justify-between px-5 md:px-12 pt-6 md:pt-8">
      <button data-testid="logo-home" onClick={() => { sfx("select"); nav("/"); }} className="sx-logo flex items-center gap-3 outline-none" aria-label="Station Nexus — accueil">
        <NexusEmblem />
        <span className="hidden md:inline font-display text-2xl" style={{ color: "var(--on-media)", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
          STATION <span style={{ color: "var(--brand)" }}>NEXUS</span>
        </span>
      </button>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Toujours visibles : profil · son · agrandissement · Aa */}
        {onProfile && (
          <button data-testid="profile-btn" onClick={() => { sfx("nav"); onProfile(); }} title="Mon profil"
            className="relative hidden md:flex items-center gap-1.5 pl-1.5 pr-4 py-1.5 border transition-transform hover:scale-105 text-sm font-medium" style={btn}>
            {profile?.avatar
              ? <img src={profile.avatar} alt="" className="w-7 h-7 rounded-full object-cover" style={{ border: "1px solid var(--brand)" }} />
              : <IoPersonCircle size={24} style={{ color: profile ? "var(--brand)" : "var(--on-media-2)" }} />}
            <span className="hidden sm:inline max-w-[90px] truncate">{profile?.name || "Profil"}</span>
            <Dot n={unread} />
          </button>
        )}
        <SoundBtn btn={btn} />
        <button data-testid="fullscreen-toggle" onClick={toggleFs} title={isFs ? "Quitter le plein écran" : "Plein écran"}
          className="p-2.5 border transition-colors" style={{ ...btn, color: isFs ? "var(--brand)" : "var(--on-media)" }}>
          {isFs ? <IoContract size={18} /> : <IoExpand size={18} />}
        </button>
        <TextSizeButton btnStyle={btn} />

        {/* LE menu unique (bouton + tiroir) — identique partout */}
        <StationMenu onAdd={onAdd} onProfile={onProfile} />
      </div>
    </header>
  );
}

// emblème : anneaux qui tournent autour du kanji 天
function NexusEmblem() {
  return (
    <span className="sx-emblem" data-testid="logo-emblem" aria-hidden="true">
      <svg viewBox="0 0 64 64" className="em-ring em-r1">
        <circle cx="32" cy="32" r="29" fill="none" stroke="var(--brand)" strokeWidth="1.4" strokeDasharray="14 4 2 4" strokeLinecap="round" />
        {[0, 90, 180, 270].map((a) => <rect key={a} x="31" y="0.5" width="2" height="5" rx="1" fill="var(--brand)" transform={`rotate(${a} 32 32)`} />)}
      </svg>
      <svg viewBox="0 0 64 64" className="em-ring em-r2">
        <circle cx="32" cy="32" r="23" fill="none" stroke="var(--on-media)" strokeOpacity=".45" strokeWidth="0.8" strokeDasharray="1 3" />
        <circle cx="32" cy="9" r="1.8" fill="var(--brand-2, var(--brand))" />
      </svg>
      <span className="em-kj font-display">天</span>
    </span>
  );
}
