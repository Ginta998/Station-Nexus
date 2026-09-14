import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IoSparkles, IoHeart, IoStar, IoDiamond, IoCheckmarkCircle } from "react-icons/io5";
import { listProfiles, getSettings } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const WALL_STYLE = {
  soutien: { color: "#4d8dff", Icon: IoHeart },
  mecene: { color: "#ffcc33", Icon: IoStar },
  legende: { color: "#ff5d8f", Icon: IoDiamond },
};
const wallStyle = (id) => WALL_STYLE[id] || { color: "var(--brand)", Icon: IoSparkles };

// Mur des soutiens réutilisable (identique à la page Soutien).
export function SupportersWall({ compact = false }) {
  const { data: allProfiles = [] } = useQuery({ queryKey: ["profiles"], queryFn: listProfiles });
  const supporters = allProfiles.filter((p) => p.tier_name);
  if (supporters.length === 0) return null;
  return (
    <div data-testid="supporters-wall">
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ color: "var(--brand)" }}>✦ Rendue possible grâce à</p>
        <h3 className="font-display text-2xl md:text-3xl" style={{ color: "var(--text-primary)" }}>Nos soutiens 💛</h3>
        {!compact && <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Ces voyageurs font grandir la station, œuvre après œuvre.</p>}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {supporters.map((p) => {
          const ws = wallStyle(p.tier_id);
          return (
            <div key={p.id} data-testid={`supporter-${p.id}`} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex items-center justify-center relative" style={{ border: `2px solid ${ws.color}`, background: "var(--bg-secondary)" }}>
                {p.avatar
                  ? <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  : <span className="font-display text-2xl" style={{ color: ws.color }}>{(p.name || "?")[0].toUpperCase()}</span>}
                <span className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center rounded-full" style={{ background: ws.color, border: "2px solid var(--bg-primary)" }}>
                  <ws.Icon size={11} style={{ color: "#0a0a0a" }} />
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold truncate w-full" style={{ color: "var(--text-primary)" }}>{p.name || "Anonyme"}</p>
              <span className="text-[10px] uppercase tracking-wide" style={{ color: ws.color }}>{p.tier_name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Bloc "Soutenir la station" (ou remerciement si déjà membre) + mur des soutiens.
export function FicheSupport({ membershipActive }) {
  const nav = useNavigate();
  const { sfx } = useApp();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const inviteTitle = settings?.fiche_support_title || "Soutiens la station 🌟";
  const inviteBody = settings?.fiche_support_body || "Cette création existe grâce aux soutiens. Rejoins-les pour débloquer tout le catalogue et faire grandir l'univers.";
  const thanksTitle = settings?.fiche_support_thanks_title || "Merci pour ton soutien 💛";
  const thanksBody = settings?.fiche_support_thanks_body || "Grâce à toi, cette création et tout l'univers de la station peuvent exister. Tu es une étoile ✨";
  return (
    <div className="my-10 space-y-8" data-testid="fiche-support">
      <div className="p-6 sm:p-8 text-center border relative overflow-hidden" style={{ background: "var(--bg-secondary)", borderColor: "var(--brand)", borderRadius: "var(--radius-base)" }}>
        {membershipActive ? (
          <>
            <IoCheckmarkCircle size={40} style={{ color: "var(--brand)" }} className="mx-auto mb-3" />
            <h3 className="font-display text-2xl sm:text-3xl mb-2" style={{ color: "var(--text-primary)" }} data-testid="fiche-support-thanks">{thanksTitle}</h3>
            <p className="text-sm max-w-lg mx-auto whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>{thanksBody}</p>
          </>
        ) : (
          <>
            <IoSparkles size={40} style={{ color: "var(--brand)" }} className="mx-auto mb-3" />
            <h3 className="font-display text-2xl sm:text-3xl mb-2" style={{ color: "var(--text-primary)" }}>{inviteTitle}</h3>
            <p className="text-sm max-w-lg mx-auto mb-5 whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>{inviteBody}</p>
            <button data-testid="fiche-support-cta" onClick={() => { sfx("select"); nav("/soutien"); }} className="inline-flex items-center gap-2 px-6 py-3 font-semibold transition-transform hover:scale-105" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
              <IoHeart size={18} /> Soutenir la station
            </button>
          </>
        )}
      </div>
      <SupportersWall compact />
    </div>
  );
}
