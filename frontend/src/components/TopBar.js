import { useNavigate } from "react-router-dom";
import { IoSettingsOutline, IoAddOutline, IoLockClosed, IoLockOpen, IoVolumeHigh, IoVolumeMute, IoMailOutline, IoPersonCircle } from "react-icons/io5";
import { useApp } from "@/context/AppContext";
import { TextSizeButton } from "@/components/TextSizeButton";

export default function TopBar({ onAdd, onProfile }) {
  const nav = useNavigate();
  const { isAdmin, muted, toggleMute, sfx, profile } = useApp();
  const go = (p) => { sfx("select"); nav(p); };

  const btn = { borderColor: "rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)", color: "var(--on-media)", background: "rgba(0,0,0,0.25)" };

  return (
    <header className="relative z-20 flex items-center justify-between px-5 md:px-12 pt-6 md:pt-8">
      <button data-testid="logo-home" onClick={() => go("/")} className="flex items-baseline gap-2 outline-none">
        <span className="font-display text-2xl md:text-3xl" style={{ color: "var(--on-media)", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
          STATION<span style={{ color: "var(--brand)" }}>EXUS</span>
        </span>
        <span className="font-display text-lg" style={{ color: "var(--brand)", opacity: 0.7 }}>天</span>
      </button>

      <div className="flex items-center gap-2 md:gap-3">
        <button data-testid="mute-toggle" onClick={() => { toggleMute(); sfx("nav"); }} title="Couper le son"
          className="p-2.5 border transition-colors" style={{ ...btn, color: muted ? "var(--on-media-2)" : "var(--brand)" }}>
          {muted ? <IoVolumeMute size={18} /> : <IoVolumeHigh size={18} />}
        </button>

        <TextSizeButton btnStyle={btn} />

        {onProfile && (
          <button data-testid="profile-btn" onClick={() => { sfx("nav"); onProfile(); }}
            className="flex items-center gap-1.5 pl-1.5 pr-3 md:pr-4 py-1.5 border transition-transform hover:scale-105 text-sm font-medium" style={btn}>
            {profile?.avatar
              ? <img src={profile.avatar} alt="" className="w-7 h-7 rounded-full object-cover" style={{ border: "1px solid var(--brand)" }} />
              : <IoPersonCircle size={24} style={{ color: profile ? "var(--brand)" : "var(--on-media-2)" }} />}
            <span className="hidden sm:inline max-w-[90px] truncate">{profile?.name || "Profil"}</span>
          </button>
        )}

        <button data-testid="contact-btn" onClick={() => go("/contact")}
          className="flex items-center gap-1.5 px-3 md:px-4 py-2.5 border transition-transform hover:scale-105 text-sm font-medium" style={btn}>
          <IoMailOutline size={18} /> <span className="hidden sm:inline">Contact</span>
        </button>

        {isAdmin && onAdd && (
          <button data-testid="add-creation-btn" onClick={() => { sfx("select"); onAdd(); }}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2.5 font-semibold text-sm transition-transform hover:scale-105"
            style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
            <IoAddOutline size={18} /> <span className="hidden sm:inline">Créer</span>
          </button>
        )}

        <div data-testid="admin-badge" className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 border text-xs"
          style={{ ...btn, color: "var(--on-media-2)" }}>
          {isAdmin ? <IoLockOpen size={14} style={{ color: "var(--brand)" }} /> : <IoLockClosed size={14} />}
          {isAdmin ? "Création" : "Visiteur"}
        </div>

        <button data-testid="settings-btn" onClick={() => go("/parametres")}
          className="flex items-center gap-1.5 px-3 md:px-4 py-2.5 border transition-transform hover:scale-105 text-sm font-medium" style={btn}>
          <IoSettingsOutline size={18} /> <span className="hidden sm:inline">Paramètres</span>
        </button>
      </div>
    </header>
  );
}
