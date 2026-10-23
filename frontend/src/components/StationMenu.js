import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoSettingsOutline, IoAddOutline, IoVolumeHigh, IoVolumeMute, IoPersonCircle, IoMenu, IoClose, IoPeople, IoMegaphone, IoLogInOutline, IoLogOutOutline, IoExpand, IoContract, IoSparklesOutline, IoPlanetOutline, IoCashOutline, IoChatbubbles, IoCalendarOutline, IoMusicalNotes, IoMusicalNote } from "react-icons/io5";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { TextSizeButton } from "@/components/TextSizeButton";
import { listAnnouncements, listAmbiences } from "@/lib/api";
import { THEMES } from "@/lib/themes";
import { getCover } from "@/lib/covers";

const btn = { borderColor: "rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)", color: "var(--on-media)", background: "rgba(0,0,0,0.25)" };

/* Bouton son : égaliseur animé quand la musique joue + sélecteur de pistes */
// vignette de couverture (image d'album) ou icône de repli
function Cov({ id, playing, small }) {
  const src = getCover(id);
  const sz = small ? 26 : 34;
  const box = { width: sz, height: sz, borderRadius: 7, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-c)" };
  if (src) return <span className="ic" style={box}><img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></span>;
  return <span className="ic" style={box}>{playing ? <span className="sx-eq" style={{ width: 14, height: 14 }}><i /><i /><i /><i /></span> : <IoMusicalNote size={15} />}</span>;
}

export function SoundBtn({ btn: bstyle = btn }) {
  const nav = useNavigate();
  const { muted, toggleMute, ambienceId, selectAmbience, appPlaying, sfx } = useApp();
  const [open, setOpen] = useState(false);
  const [, setTick] = useState(0);
  useEffect(() => { const h = () => setTick((t) => t + 1); window.addEventListener("sx-covers", h); return () => window.removeEventListener("sx-covers", h); }, []);
  const { data: ambiences = [] } = useQuery({ queryKey: ["ambiences"], queryFn: listAmbiences });
  const playing = appPlaying && !muted;
  const current = ambiences.find((a) => a.id === ambienceId);
  const pick = (id) => { if (muted) toggleMute(); selectAmbience(id); sfx("select"); setOpen(false); };
  return (
    <div className="relative">
      <button data-testid="sound-btn" onClick={() => { sfx("nav"); setOpen((o) => !o); }} title="Musique / ambiance"
        className="p-2.5 border transition-colors" style={{ ...bstyle, color: playing ? "var(--brand)" : "var(--on-media-2)" }}>
        {playing ? <span className="sx-eq"><i /><i /><i /><i /></span> : (muted ? <IoVolumeMute size={18} /> : <IoMusicalNotes size={18} />)}
      </button>
      {open && (<>
        <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
        <div className="sx-sound-menu">
          {/* En-tête lecteur : couverture + piste en cours */}
          {current && !muted && (
            <div className="ssm-now" style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px 10px", borderBottom: "1px solid var(--border-c)", marginBottom: 6 }}>
              <Cov id={current.id} playing={playing} />
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 9, letterSpacing: "0.18em", opacity: 0.6 }}>EN LECTURE</span>
                <span style={{ display: "block", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{current.name || current.title || "Piste"}</span>
              </span>
            </div>
          )}
          <div className="ssm-h">AMBIANCE SONORE</div>
          <button className={"ssm-row" + (muted ? " on" : "")} onClick={() => { if (!muted) toggleMute(); setOpen(false); }}>
            <span className="ic"><IoVolumeMute size={16} /></span> Couper le son
          </button>
          {ambiences.map((a) => (
            <button key={a.id} className={"ssm-row" + (a.id === ambienceId && !muted ? " on" : "")} onClick={() => pick(a.id)} style={{ alignItems: "center" }}>
              <Cov id={a.id} small playing={a.id === ambienceId && !muted} />
              <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name || a.title || "Piste"}</span>
            </button>
          ))}
          <div className="ssm-f" onClick={() => { setOpen(false); nav("/parametres"); }}>+ Gérer dans Paramètres → Musique</div>
        </div>
      </>)}
    </div>
  );
}

function MuteBtn() {
  const { muted, toggleMute, sfx } = useApp();
  return (
    <button data-testid="mute-toggle" onClick={() => { toggleMute(); sfx("nav"); }} title="Couper le son"
      className="p-2.5 border transition-colors" style={{ ...btn, color: muted ? "var(--on-media-2)" : "var(--brand)" }}>
      {muted ? <IoVolumeMute size={18} /> : <IoVolumeHigh size={18} />}
    </button>
  );
}

function FsBtn({ style }) {
  const { sfx } = useApp();
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
  return (
    <button data-testid="fullscreen-toggle" onClick={toggleFs} title={isFs ? "Quitter le plein écran" : "Plein écran"}
      className="p-2.5 border transition-colors" style={{ ...btn, ...style, color: isFs ? "var(--brand)" : "var(--on-media)" }}>
      {isFs ? <IoContract size={18} /> : <IoExpand size={18} />}
    </button>
  );
}

/*
 * StationMenu — LE menu unique de la station.
 * Rendu identique partout (accueil + toutes les sous-pages) : bouton « Menu »
 * + tiroir cosmique. C'est la seule implémentation du menu : plus d'ancien menu.
 *   onAdd     : (admin) ouvre la création d'une œuvre — optionnel
 *   onProfile : ouvre l'édition du profil — si absent, renvoie vers /parametres
 */
export default function StationMenu({ onAdd, onProfile }) {
  const nav = useNavigate();
  const { isAdmin, sfx, profile, seenAnnouncements, theme, setTheme } = useApp();
  const { user, openAuth, logout } = useAuth();
  const { unread: chatUnreadCount } = useChat() || { unread: { total: 0 } };
  const salonUnread = chatUnreadCount?.total || 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: announcements = [] } = useQuery({ queryKey: ["announcements"], queryFn: listAnnouncements });
  const unread = announcements.filter((a) => !seenAnnouncements.includes(a.id)).length;
  const go = (p) => { sfx("select"); setMenuOpen(false); nav(p); };
  const openProfile = () => { setMenuOpen(false); if (onProfile) onProfile(); else nav("/parametres"); };

  const menuItems = [
    { label: "Journal de bord", sub: "COULISSES & NOUVEAUTÉS", icon: <IoMegaphone size={18} />, badge: unread, onClick: () => go("/nouveautes") },
    { label: "Planning de sortie", sub: "UNE SORTIE CHAQUE DIMANCHE", icon: <IoCalendarOutline size={18} />, onClick: () => go("/planning") },
    { label: "Salon", sub: "DISCUTE EN DIRECT", icon: <IoChatbubbles size={18} />, badge: salonUnread, onClick: () => go("/salon") },
    { label: "Membres", sub: "LA COMMUNAUTÉ", icon: <IoPeople size={18} />, onClick: () => go("/membres") },
    { label: "Soutien", sub: "FAIS GRANDIR LA STATION", icon: <IoSparklesOutline size={18} />, onClick: () => go("/soutien") },
    { label: "À propos", sub: "LA STATION", icon: <IoPlanetOutline size={18} />, onClick: () => go("/a-propos") },
    { label: "Paramètres", sub: "COMPTE · THÈME · AMBIANCE", icon: <IoSettingsOutline size={18} />, onClick: () => go("/parametres") },
    ...(isAdmin && onAdd ? [{ label: "Créer une création", sub: "MODE CRÉATION", icon: <IoAddOutline size={18} />, onClick: () => { setMenuOpen(false); onAdd(); } }] : []),
    ...(isAdmin ? [{ label: "Mes revenus", sub: "TABLEAU DE BORD", icon: <IoCashOutline size={18} />, onClick: () => go("/revenus") }] : []),
  ];

  return (
    <>
      <button data-testid="mobile-menu-btn" onClick={() => { sfx("nav"); setMenuOpen(true); }}
        className="relative flex items-center gap-1.5 px-4 py-2.5 font-semibold text-sm transition-transform hover:scale-105 flex-shrink-0"
        style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
        <IoMenu size={18} /> Menu
        {(unread > 0 || salonUnread > 0) && <span data-testid="notif-badge-mobile" className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full" style={{ background: "#fff", color: "var(--brand)" }}>{(unread + salonUnread) > 9 ? "9+" : (unread + salonUnread)}</span>}
      </button>

      {menuOpen && (
        <div className="sx-menu-scrim" onClick={() => setMenuOpen(false)} data-testid="mobile-menu">
          <aside className="sx-menu" onClick={(e) => e.stopPropagation()}>
            {/* HUD : balayage scanline + coins d'encadrement */}
            <span className="sm-scan" />
            <span className="sm-corner tl" /><span className="sm-corner tr" />
            <span className="sm-corner bl" /><span className="sm-corner br" />

            <div className="sx-menu-top">
              <span className="sx-menu-wm font-display">STATION <b style={{ color: "var(--brand)" }}>NEXUS</b></span>
              <button data-testid="mobile-menu-close" className="sx-menu-x" onClick={() => setMenuOpen(false)}><IoClose size={20} /></button>
            </div>
            <div className="sx-menu-sys mono"><i />SYSTÈME EN LIGNE<b>v2.0 · 天</b></div>

            <button data-testid="menu-profile" className="sx-menu-profile" onClick={openProfile}>
              {profile?.avatar
                ? <img src={profile.avatar} alt="" className="av" />
                : <span className="av av-ph"><IoPersonCircle size={30} /></span>}
              <div className="pid">
                <div className="nm">{profile?.name || "Créer mon profil"}</div>
                <div className="lb mono">{profile ? "VOIR / MODIFIER" : "PERSONNALISE TON EXPÉRIENCE"}</div>
              </div>
              <span className="ar">→</span>
            </button>

            <div className="sx-menu-list">
              {menuItems.map((m, i) => (
                <button key={m.label} className="sx-menu-card" style={{ animationDelay: `${0.08 + i * 0.045}s` }} onClick={m.onClick}>
                  <span className="mc-ic">{m.icon}</span>
                  <span className="mc-tx">
                    <span className="mc-t">{m.label}{m.badge > 0 && <span className="mc-badge">{m.badge > 9 ? "9+" : m.badge}</span>}</span>
                    <span className="mc-s mono">// {m.sub}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="sx-menu-themes">
              <div className="smt-h mono">// THÈME DE LA STATION</div>
              <div className="smt-grid">
                {THEMES.map((t) => (
                  <button key={t.key} className={"smt-chip" + (t.key === theme ? " on" : "")} onClick={() => { sfx("select"); setTheme(t.key); }}>
                    <span className="dot" style={{ background: `linear-gradient(135deg, ${t.swatch[1]}, ${t.swatch[2]})` }} />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="sx-menu-foot">
              {user ? (
                <button className="sx-menu-auth" onClick={() => { setMenuOpen(false); logout(); }}><IoLogOutOutline size={16} /> Se déconnecter</button>
              ) : (
                <button className="sx-menu-auth" onClick={() => { setMenuOpen(false); openAuth(); }}><IoLogInOutline size={16} /> Se connecter / créer un compte</button>
              )}
              <div className="sx-menu-ctrls">
                <MuteBtn />
                <FsBtn />
                <TextSizeButton btnStyle={btn} dropUp />
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
