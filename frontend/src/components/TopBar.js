import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoSettingsOutline, IoAddOutline, IoLockOpen, IoVolumeHigh, IoVolumeMute, IoMailOutline, IoPersonCircle, IoMenu, IoClose, IoPeople, IoColorPaletteOutline, IoMegaphone, IoHelpCircleOutline, IoLogInOutline, IoLogOutOutline } from "react-icons/io5";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { TextSizeButton } from "@/components/TextSizeButton";
import { listAnnouncements } from "@/lib/api";

export default function TopBar({ onAdd, onProfile }) {
  const nav = useNavigate();
  const { isAdmin, muted, toggleMute, sfx, profile, seenAnnouncements } = useApp();
  const { user, openAuth, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: announcements = [] } = useQuery({ queryKey: ["announcements"], queryFn: listAnnouncements });
  const unread = announcements.filter((a) => !seenAnnouncements.includes(a.id)).length;
  const go = (p) => { sfx("select"); setMenuOpen(false); nav(p); };

  const btn = { borderColor: "rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)", color: "var(--on-media)", background: "rgba(0,0,0,0.25)" };

  const Dot = ({ n }) => (n > 0 ? (
    <span data-testid="notif-badge" className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full"
      style={{ background: "var(--brand)", color: "var(--bg-primary)", boxShadow: "0 0 8px var(--brand)" }}>{n > 9 ? "9+" : n}</span>
  ) : null);

  const MuteBtn = ({ style }) => (
    <button data-testid="mute-toggle" onClick={() => { toggleMute(); sfx("nav"); }} title="Couper le son"
      className="p-2.5 border transition-colors" style={{ ...btn, ...style, color: muted ? "var(--on-media-2)" : "var(--brand)" }}>
      {muted ? <IoVolumeMute size={18} /> : <IoVolumeHigh size={18} />}
    </button>
  );

  const openProfile = () => { setMenuOpen(false); onProfile && onProfile(); };

  const MenuRow = ({ testid, icon, label, onClick, badge }) => (
    <button data-testid={testid} onClick={onClick} className="flex items-center gap-3 w-full px-4 py-3 text-left border-b transition-colors"
      style={{ borderColor: "var(--border-c)", color: "var(--text-primary)" }}>
      {icon} <span className="text-base flex-1">{label}</span>
      {badge > 0 && <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold rounded-full" style={{ background: "var(--brand)", color: "var(--bg-primary)" }}>{badge > 9 ? "9+" : badge}</span>}
    </button>
  );

  return (
    <header className="relative z-20 flex items-center justify-between px-5 md:px-12 pt-6 md:pt-8">
      <button data-testid="logo-home" onClick={() => go("/")} className="flex items-baseline gap-2 outline-none">
        <span className="font-display text-2xl md:text-3xl" style={{ color: "var(--on-media)", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
          STATION<span style={{ color: "var(--brand)" }}>EXUS</span>
        </span>
        <span className="font-display text-lg" style={{ color: "var(--brand)", opacity: 0.7 }}>天</span>
      </button>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Always visible: mute + text size */}
        <MuteBtn />
        <TextSizeButton btnStyle={btn} />

        {/* Desktop: full button set */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button data-testid="account-btn" onClick={() => { sfx("nav"); logout(); }} title="Se déconnecter"
              className="relative flex items-center gap-1.5 px-4 py-2.5 border transition-transform hover:scale-105 text-sm font-medium" style={btn}>
              <IoLogOutOutline size={18} /> <span className="max-w-[90px] truncate">{user.name || "Compte"}</span>
            </button>
          ) : (
            <button data-testid="login-btn" onClick={() => { sfx("select"); openAuth(); }} title="Se connecter pour sauvegarder tes favoris"
              className="relative flex items-center gap-1.5 px-4 py-2.5 border transition-transform hover:scale-105 text-sm font-medium" style={btn}>
              <IoLogInOutline size={18} /> Se connecter
            </button>
          )}
          {onProfile && (
            <button data-testid="profile-btn" onClick={() => { sfx("nav"); onProfile(); }}
              className="relative flex items-center gap-1.5 pl-1.5 pr-4 py-1.5 border transition-transform hover:scale-105 text-sm font-medium" style={btn}>
              {profile?.avatar
                ? <img src={profile.avatar} alt="" className="w-7 h-7 rounded-full object-cover" style={{ border: "1px solid var(--brand)" }} />
                : <IoPersonCircle size={24} style={{ color: profile ? "var(--brand)" : "var(--on-media-2)" }} />}
              <span className="max-w-[90px] truncate">{profile?.name || "Profil"}</span>
              <Dot n={unread} />
            </button>
          )}
          <button data-testid="novelties-btn" onClick={() => go("/nouveautes")}
            className="relative flex items-center gap-1.5 px-4 py-2.5 border transition-transform hover:scale-105 text-sm font-medium" style={btn}>
            <IoMegaphone size={18} /> Nouveautés
            <Dot n={unread} />
          </button>
          <button data-testid="members-btn" onClick={() => go("/membres")}
            className="flex items-center gap-1.5 px-4 py-2.5 border transition-transform hover:scale-105 text-sm font-medium" style={btn}>
            <IoPeople size={18} /> Membres
          </button>
          <button data-testid="contact-btn" onClick={() => go("/contact")}
            className="flex items-center gap-1.5 px-4 py-2.5 border transition-transform hover:scale-105 text-sm font-medium" style={btn}>
            <IoMailOutline size={18} /> Contact
          </button>
          {isAdmin && onAdd && (
            <button data-testid="add-creation-btn" onClick={() => { sfx("select"); onAdd(); }}
              className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-sm transition-transform hover:scale-105"
              style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
              <IoAddOutline size={18} /> Créer
            </button>
          )}
          {isAdmin && (
            <div data-testid="admin-badge" className="flex items-center gap-1.5 px-3 py-2.5 border text-xs" style={{ ...btn, color: "var(--brand)" }}>
              <IoLockOpen size={14} style={{ color: "var(--brand)" }} /> Création
            </div>
          )}
          <button data-testid="tutorial-btn" onClick={() => go("/tutoriel")} title="Comment ça marche"
            className="flex items-center gap-1.5 px-3 py-2.5 border transition-transform hover:scale-105 text-sm font-medium" style={btn}>
            <IoHelpCircleOutline size={18} />
          </button>
          <button data-testid="settings-btn" onClick={() => go("/parametres")}
            className="flex items-center gap-1.5 px-4 py-2.5 font-semibold text-sm transition-transform hover:scale-105"
            style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
            <IoSettingsOutline size={18} /> Paramètres
          </button>
        </div>

        {/* Mobile: menu button (label + theme color) */}
        <button data-testid="mobile-menu-btn" onClick={() => { sfx("nav"); setMenuOpen(true); }}
          className="relative md:hidden flex items-center gap-1.5 px-4 py-2.5 font-semibold text-sm transition-transform hover:scale-105"
          style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
          <IoMenu size={18} /> Menu
          {unread > 0 && <span data-testid="notif-badge-mobile" className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full" style={{ background: "#fff", color: "var(--brand)" }}>{unread > 9 ? "9+" : unread}</span>}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[70] flex justify-end" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setMenuOpen(false)} data-testid="mobile-menu">
          <div className="w-72 max-w-[85%] h-full flex flex-col" style={{ background: "var(--bg-secondary)", borderLeft: "1px solid var(--border-c)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border-c)" }}>
              <span className="font-display text-lg" style={{ color: "var(--text-primary)" }}>Menu</span>
              <button data-testid="mobile-menu-close" onClick={() => setMenuOpen(false)} style={{ color: "var(--text-secondary)" }}><IoClose size={22} /></button>
            </div>

            {/* Profile header */}
            <button data-testid="menu-profile" onClick={openProfile} className="flex items-center gap-3 p-4 border-b text-left" style={{ borderColor: "var(--border-c)" }}>
              {profile?.avatar
                ? <img src={profile.avatar} alt="" className="w-12 h-12 rounded-full object-cover" style={{ border: "2px solid var(--brand)" }} />
                : <IoPersonCircle size={44} style={{ color: profile ? "var(--brand)" : "var(--text-secondary)" }} />}
              <div className="min-w-0">
                <p className="font-display text-lg truncate" style={{ color: "var(--text-primary)" }}>{profile?.name || "Créer mon profil"}</p>
                <p className="text-xs" style={{ color: "var(--brand)" }}>{profile ? "Voir / modifier" : "Personnalise ton expérience"}</p>
              </div>
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="flex items-start gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--border-c)", background: "rgba(0,0,0,0.15)" }}>
                <IoColorPaletteOutline size={18} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 2 }} />
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Personnalise ta station (thème, sons, affichage) dans les <span style={{ color: "var(--brand)" }}>Paramètres</span>.
                </p>
              </div>
              <MenuRow testid="menu-novelties" icon={<IoMegaphone size={20} style={{ color: "var(--brand)" }} />} label="Nouveautés" onClick={() => go("/nouveautes")} badge={unread} />
              <MenuRow testid="menu-members" icon={<IoPeople size={20} style={{ color: "var(--brand)" }} />} label="Membres" onClick={() => go("/membres")} />
              <MenuRow testid="menu-contact" icon={<IoMailOutline size={20} style={{ color: "var(--brand)" }} />} label="Contact" onClick={() => go("/contact")} />
              <MenuRow testid="menu-settings" icon={<IoSettingsOutline size={20} style={{ color: "var(--brand)" }} />} label="Paramètres" onClick={() => go("/parametres")} />
              <MenuRow testid="menu-tutorial" icon={<IoHelpCircleOutline size={20} style={{ color: "var(--brand)" }} />} label="Comment ça marche" onClick={() => go("/tutoriel")} />
              {user ? (
                <MenuRow testid="menu-logout" icon={<IoLogOutOutline size={20} style={{ color: "var(--brand)" }} />} label={`Se déconnecter (${user.name || "compte"})`} onClick={() => { setMenuOpen(false); logout(); }} />
              ) : (
                <MenuRow testid="menu-login" icon={<IoLogInOutline size={20} style={{ color: "var(--brand)" }} />} label="Se connecter / créer un compte" onClick={() => { setMenuOpen(false); openAuth(); }} />
              )}
              {isAdmin && onAdd && (
                <MenuRow testid="menu-create" icon={<IoAddOutline size={20} style={{ color: "var(--brand)" }} />} label="Créer une création" onClick={() => { setMenuOpen(false); onAdd(); }} />
              )}
              {isAdmin && (
                <div className="flex items-center gap-2 px-3 py-2 text-xs" style={{ color: "var(--brand)" }}>
                  <IoLockOpen size={13} style={{ color: "var(--brand)" }} /> Mode création
                </div>
              )}            </div>

            {/* Quick controls also inside the menu */}
            <div className="flex items-center gap-3 p-4 border-t" style={{ borderColor: "var(--border-c)" }}>
              <MuteBtn />
              <TextSizeButton btnStyle={btn} dropUp />
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Son &amp; taille du texte</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
