import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMenu, IoClose, IoHome, IoSparklesOutline, IoLibraryOutline, IoPlanetOutline, IoPeople, IoMailOutline, IoHelpCircleOutline, IoSettingsOutline, IoLogInOutline, IoLogOutOutline, IoSparkles } from "react-icons/io5";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { to: "/", label: "Accueil", icon: IoHome },
  { to: "/nouveautes", label: "Nouveautés", icon: IoSparkles },
  { to: "/soutien", label: "Soutenir la station", icon: IoSparklesOutline },
  { to: "/bibliotheque", label: "Ma bibliothèque", icon: IoLibraryOutline },
  { to: "/a-propos", label: "À propos", icon: IoPlanetOutline },
  { to: "/membres", label: "Membres", icon: IoPeople },
  { to: "/contact", label: "Contact", icon: IoMailOutline },
  { to: "/tutoriel", label: "Comment ça marche", icon: IoHelpCircleOutline },
  { to: "/parametres", label: "Paramètres", icon: IoSettingsOutline },
];

// Bouton menu + tiroir de navigation, mobile uniquement, autonome (présent sur toutes les pages)
export default function MobileMenu() {
  const nav = useNavigate();
  const { sfx } = useApp();
  const { user, logout, openAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const go = (to) => { sfx("nav"); setOpen(false); nav(to); };

  return (
    <>
      <button data-testid="page-menu-btn" onClick={() => { sfx("nav"); setOpen(true); }} title="Menu" aria-label="Menu"
        className="md:hidden flex items-center gap-1.5 px-3.5 py-2.5 font-semibold text-sm"
        style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
        <IoMenu size={18} /> Menu
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 z-[60]" data-testid="page-menu-drawer">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setOpen(false)} />
          <div className="sx-drawer-header absolute top-0 right-0 h-full w-72 max-w-[85%] overflow-y-auto p-4 flex flex-col"
            style={{ background: "var(--bg-secondary)", borderLeft: "1px solid var(--border-c)" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-lg" style={{ color: "var(--brand)" }}>Menu</span>
              <button data-testid="page-menu-close" onClick={() => setOpen(false)} className="p-2 border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)" }}><IoClose size={20} /></button>
            </div>
            <div className="flex flex-col gap-1">
              {LINKS.map((l) => (
                <button key={l.to} data-testid={`page-menu-${l.to}`} onClick={() => go(l.to)} className="flex items-center gap-3 w-full px-3 py-3 text-left transition-colors"
                  style={{ color: "var(--text-primary)", borderRadius: "var(--radius-base)" }}>
                  <l.icon size={20} style={{ color: "var(--brand)" }} /> <span className="text-sm">{l.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-auto pt-4 border-t" style={{ borderColor: "var(--border-c)" }}>
              {user ? (
                <button data-testid="page-menu-logout" onClick={() => { logout(); setOpen(false); }} className="flex items-center gap-3 w-full px-3 py-3" style={{ color: "var(--text-primary)" }}><IoLogOutOutline size={20} style={{ color: "var(--brand)" }} /> <span className="text-sm">Se déconnecter</span></button>
              ) : (
                <button data-testid="page-menu-login" onClick={() => { openAuth(); setOpen(false); }} className="flex items-center gap-3 w-full px-3 py-3" style={{ color: "var(--text-primary)" }}><IoLogInOutline size={20} style={{ color: "var(--brand)" }} /> <span className="text-sm">Se connecter</span></button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
