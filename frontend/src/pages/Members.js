import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack, IoLogoInstagram, IoTrashOutline, IoHome, IoPersonAdd, IoCreateOutline, IoHeart, IoStar, IoDiamond, IoSparkles, IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { toast } from "sonner";
import { listProfiles, deleteProfile } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import ProfileDialog from "@/components/ProfileDialog";
import MobileMenu from "@/components/MobileMenu";

const fs = { background: "var(--bg-primary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" };

const TIER_STYLE = {
  soutien: { color: "#4d8dff", Icon: IoHeart },
  mecene: { color: "#ffcc33", Icon: IoStar },
  legende: { color: "#ff5d8f", Icon: IoDiamond },
};
const tierStyle = (id) => TIER_STYLE[id] || { color: "var(--brand)", Icon: IoSparkles };

function instaUrl(handle) {
  if (!handle) return null;
  const h = handle.trim();
  if (/^https?:\/\//i.test(h)) return h;
  return `https://instagram.com/${h.replace(/^@/, "")}`;
}

export default function Members() {
  const nav = useNavigate();
  const { isAdmin, profile, sfx } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const { data: list = [], isLoading, refetch } = useQuery({ queryKey: ["profiles"], queryFn: listProfiles });

  const del = async (p) => {
    if (!window.confirm(`Retirer le membre « ${p.name} » ?`)) return;
    await deleteProfile(p.id); toast.success("Membre retiré"); refetch();
  };
  const closeProfile = () => { setProfileOpen(false); setTimeout(() => refetch(), 400); };

  return (
    <div className="relative min-h-screen w-full" style={{ background: "transparent" }}>
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-8">
        <div className="flex items-center justify-between gap-2 mb-8">
          <div className="flex items-center gap-2">
            <button data-testid="members-back" onClick={() => { sfx("back"); nav(-1); }} className="flex items-center gap-2 px-3 py-2 border" style={fs}><IoArrowBack /> <span className="text-sm">Retour</span></button>
            <button data-testid="members-home" onClick={() => { sfx("nav"); nav("/"); }} className="flex items-center gap-2 px-3 py-2 border" style={fs}><IoHome size={16} /> <span className="text-sm hidden sm:inline">Accueil</span></button>
          </div>
          <MobileMenu />
        </div>

        <h1 className="font-display text-4xl md:text-5xl mb-2" style={{ color: "var(--text-primary)" }}>Membres</h1>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <p style={{ color: "var(--text-secondary)" }} data-testid="members-count">
            {isLoading ? "Chargement…" : `${list.length} membre${list.length > 1 ? "s" : ""} dans la communauté`}
          </p>
          <button data-testid="members-create-profile" onClick={() => { sfx("select"); setProfileOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 font-semibold text-sm transition-transform hover:scale-105"
            style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
            {profile ? <><IoCreateOutline size={18} /> Modifier mon profil</> : <><IoPersonAdd size={18} /> Créer mon profil</>}
          </button>
        </div>

        {(!isLoading && list.length === 0) && (
          <p style={{ color: "var(--text-secondary)" }}>Aucun membre pour l'instant. Sois le premier à créer ton profil !</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" data-testid="members-grid">
          {list.map((p) => {
            const insta = instaUrl(p.instagram);
            const ts = p.tier_name ? tierStyle(p.tier_id) : null;
            return (
              <div key={p.id} data-testid={`member-${p.id}`} className="relative flex flex-col items-center text-center p-4 border" style={{ ...fs, background: "var(--bg-secondary)" }}>
                {isAdmin && (
                  <button onClick={() => del(p)} className="absolute top-2 right-2" style={{ color: "var(--brand)" }} data-testid={`member-del-${p.id}`}><IoTrashOutline size={15} /></button>
                )}
                <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center mb-3 relative" style={{ border: `2px solid ${ts ? ts.color : "var(--brand)"}`, background: "var(--bg-primary)" }}>
                  {p.avatar
                    ? <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                    : <span className="font-display text-3xl" style={{ color: ts ? ts.color : "var(--brand)" }}>{(p.name || "?")[0].toUpperCase()}</span>}
                  {ts && (
                    <span className="absolute -bottom-1 -right-1 w-7 h-7 flex items-center justify-center rounded-full" style={{ background: ts.color, border: "2px solid var(--bg-secondary)" }} data-testid={`member-tier-icon-${p.id}`}>
                      <ts.Icon size={13} style={{ color: "#0a0a0a" }} />
                    </span>
                  )}
                </div>
                <p className="font-display text-base truncate w-full" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                {p.account_id && p.account_id !== profile?.account_id && (
                  <button data-testid={`member-dm-${p.id}`} onClick={() => { sfx("nav"); nav(`/salon?tab=dm&to=${p.account_id}&name=${encodeURIComponent(p.name || "Membre")}`); }}
                    className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold transition-transform hover:scale-105" style={{ border: "1px solid var(--brand)", color: "var(--brand)", borderRadius: "999px" }}>
                    <IoChatbubbleEllipsesOutline size={12} /> Message
                  </button>
                )}
                {ts && (
                  <span data-testid={`member-tier-${p.id}`} className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide" style={{ background: `color-mix(in srgb, ${ts.color} 20%, transparent)`, color: ts.color, border: `1px solid ${ts.color}`, borderRadius: "999px" }}>
                    <ts.Icon size={11} /> {p.tier_name}
                  </span>
                )}
                {insta && (
                  <a href={insta} target="_blank" rel="noopener noreferrer" data-testid={`member-insta-${p.id}`}
                    className="mt-1 flex items-center gap-1 text-xs" style={{ color: "var(--brand)" }}>
                    <IoLogoInstagram size={14} /> Instagram
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <ProfileDialog open={profileOpen} onClose={closeProfile} />
    </div>
  );
}
