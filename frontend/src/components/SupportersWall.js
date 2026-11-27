import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IoSparkles, IoHeart, IoStar, IoDiamond, IoCheckmarkCircle } from "react-icons/io5";
import { listProfiles, getSettings, getMembershipPlan } from "@/lib/api";
import { pressMenu } from "@/components/atelier/ContextMenu";
import { useApp } from "@/context/AppContext";

const WALL_STYLE = {
  soutien: { color: "#4d8dff", Icon: IoHeart },
  mecene: { color: "#ffcc33", Icon: IoStar },
  legende: { color: "#ff5d8f", Icon: IoDiamond },
};
const PALETTE = ["#4d8dff", "#ffcc33", "#ff5d8f", "#57d39b", "#b98cff"];
const ICONS = [IoHeart, IoStar, IoDiamond, IoSparkles];

// Les soutiens, rangés du palier le plus haut au premier : même ordre que la page Soutien
export function useSupporters() {
  const { data: allProfiles = [] } = useQuery({ queryKey: ["profiles"], queryFn: listProfiles });
  const { data: plan } = useQuery({ queryKey: ["membership-plan"], queryFn: getMembershipPlan });
  const tiers = plan?.tiers || [];
  const rank = (id) => { const i = tiers.findIndex((t) => t.id === id); return i < 0 ? -1 : i; };
  const style = (id) => { const i = rank(id); return WALL_STYLE[id] || { color: PALETTE[Math.max(0, i) % PALETTE.length], Icon: ICONS[Math.max(0, i) % ICONS.length] }; };
  const list = allProfiles.filter((p) => p.tier_name).sort((a, b) => rank(b.tier_id) - rank(a.tier_id) || (a.name || "").localeCompare(b.name || ""));
  const groups = [];
  list.forEach((p) => { const g = groups.find((x) => x.id === p.tier_id); if (g) g.people.push(p); else groups.push({ id: p.tier_id, name: p.tier_name, people: [p], ...style(p.tier_id) }); });
  return { list, groups, style };
}

const Avatar = ({ p, color, size }) => (
  <span className="sw-av" style={{ "--c": color, width: size, height: size }}>
    {p.avatar ? <img src={p.avatar} alt="" /> : <b>{(p.name || "?")[0].toUpperCase()}</b>}
  </span>
);

// Clic droit / appui long sur un soutien : voir son profil chez les Membres, lui écrire
const supMenu = (p, nav) => () => ({ title: p.name || "Soutien", entries: [
  { label: "Voir son profil", onClick: () => nav(`/membres#m-${p.id}`) },
  ...(p.account_id ? [{ label: "Lui écrire au Salon", onClick: () => nav(`/salon?tab=dm&to=${p.account_id}&name=${encodeURIComponent(p.name || "Membre")}`) }] : []),
  ...(p.instagram ? [{ label: "Son Instagram", onClick: () => window.open(`https://instagram.com/${String(p.instagram).replace(/^@/, "")}`, "_blank", "noopener") }] : []),
] });

// Mur des soutiens : un étage par palier (le plus haut en premier, portraits plus grands), nom et palier sous chaque portrait.
// Le même sur la page Soutien et sur la fiche des œuvres (compact).
export function SupportersWall({ compact = false, title, eyebrow }) {
  const nav = useNavigate();
  const { list, groups } = useSupporters();
  if (list.length === 0) return null;
  return (
    <div className={"sw" + (compact ? " compact" : "")} data-testid="supporters-wall">
      <div className="sw-head">
        <p className="sw-eye">{eyebrow || "✦ Rendue possible grâce à"}</p>
        <h3 className="font-display">{title || "Nos soutiens"}</h3>
        <p className="sw-n">{list.length} soutien{list.length > 1 ? "s" : ""} font grandir la station, œuvre après œuvre.</p>
      </div>
      {groups.map((g, gi) => (
        <div key={g.id} className={"sw-tier" + (gi === 0 && groups.length > 1 ? " top" : "")} style={{ "--c": g.color }}>
          <p className="sw-tier-h"><g.Icon size={13} /> {g.name} <i>{g.people.length}</i></p>
          <div className="sw-grid">
            {g.people.map((p) => (
              <div key={p.id} className="sw-p" data-testid={`supporter-${p.id}`} title={`${p.name} · ${g.name}`} onClick={() => nav(`/membres#m-${p.id}`)} {...pressMenu(supMenu(p, nav))}>
                <Avatar p={p} color={g.color} />
                <span className="sw-name">{p.name || "Anonyme"}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Le bloc Soutien de l'accueil : une rangée de portraits qui se chevauchent, le nombre, et un clic vers la page Soutien
export function SupportersStrip({ max = 9 }) {
  const nav = useNavigate();
  const { list, style } = useSupporters();
  if (list.length === 0) return null;
  const shown = list.slice(0, max);
  return (
    <div className="sw-strip" data-testid="supporters-strip">
      <div className="sw-stack">
        {shown.map((p) => <span key={p.id} title={`${p.name} · ${p.tier_name}`} onClick={(e) => { e.stopPropagation(); nav(`/membres#m-${p.id}`); }} {...pressMenu(supMenu(p, nav))}><Avatar p={p} color={style(p.tier_id).color} /></span>)}
        {list.length > max && <span className="sw-more" onClick={() => nav("/soutien")}>+{list.length - max}</span>}
      </div>
      <p><b>{list.length} soutien{list.length > 1 ? "s" : ""}</b> font déjà vivre la station{shown[0] ? <> — dont <b>{shown[0].name}</b>{shown[1] ? <>, <b>{shown[1].name}</b></> : null}</> : null}.</p>
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
      <SupportersWall compact eyebrow="✦ Cette œuvre existe grâce à" title="Ils la soutiennent" />
    </div>
  );
}
