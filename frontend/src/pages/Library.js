import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack, IoHome, IoLibraryOutline, IoSparkles, IoCheckmarkCircle } from "react-icons/io5";
import { getLibrary, getMembershipPlan, startCheckout, posterUrl } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import QuickControls from "@/components/QuickControls";
import MobileMenu from "@/components/MobileMenu";

export default function Library() {
  const nav = useNavigate();
  const { sfx } = useApp();
  const { user, openAuth } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ["library"], queryFn: getLibrary, enabled: !!user });
  const { data: plan } = useQuery({ queryKey: ["membership-plan"], queryFn: getMembershipPlan });
  const [busy, setBusy] = useState(false);

  const btn = { border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)", background: "var(--bg-secondary)" };
  const primary = { background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" };

  const subscribe = async () => { nav("/soutien"); };

  const creations = data?.creations || [];
  const membership = data?.membership || { active: false };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }} data-testid="library-page">
      <div className="sx-safe-top flex items-center justify-between px-5 md:px-12 pt-6">
        <div className="flex items-center gap-2">
          <button data-testid="library-back" onClick={() => { sfx("back"); nav(-1); }} className="flex items-center gap-2 px-3 py-2" style={btn}><IoArrowBack /> <span className="text-sm hidden sm:inline">Retour</span></button>
          <button data-testid="library-home" onClick={() => { sfx("nav"); nav("/"); }} className="flex items-center gap-2 px-3 py-2" style={btn}><IoHome size={16} /></button>
        </div>
        <div className="flex items-center gap-2">
          <MobileMenu />
          <QuickControls />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-12 py-8">
        <h1 className="font-display text-4xl md:text-5xl flex items-center gap-3 mb-2"><IoLibraryOutline style={{ color: "var(--brand)" }} /> Ma bibliothèque</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>Tes créations débloquées et ton abonnement au même endroit.</p>

        {!user && (
          <div className="p-6 mb-8 text-center" style={{ ...btn }}>
            <p className="mb-3">Connecte-toi pour voir tes achats et ton abonnement.</p>
            <button data-testid="library-login" onClick={openAuth} className="px-5 py-2.5 font-semibold" style={primary}>Se connecter</button>
          </div>
        )}

        {/* Membership card */}
        {plan?.enabled && (
          membership.active ? (
            <div className="p-6 mb-10" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--brand) 26%, var(--bg-secondary)), var(--bg-secondary))", border: "1px solid var(--brand)", borderRadius: "var(--radius-base)" }} data-testid="membership-card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-widest mb-3" style={{ ...primary }} data-testid="membership-active"><IoCheckmarkCircle size={14} /> Abonné actif</span>
                  <h2 className="font-display text-3xl mb-1 flex items-center gap-2"><IoSparkles style={{ color: "var(--brand)" }} /> Merci pour ton soutien ! 💛</h2>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Palier <b style={{ color: "var(--text-primary)" }}>{(plan.tiers?.find((t) => t.id === membership.tier_id)?.name) || "Nexus"}</b> · tu as accès à <b style={{ color: "var(--text-primary)" }}>tout le catalogue payant</b> et tu aides directement la station à grandir.
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <button data-testid="membership-change" onClick={() => nav("/soutien")} className="px-4 py-2 text-sm font-medium" style={btn}>Changer de palier</button>
                  <button data-testid="membership-cancel" onClick={() => nav("/resiliation")} className="text-xs underline" style={{ color: "var(--text-secondary)" }}>Résilier votre contrat</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 mb-10" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--brand) 16%, var(--bg-secondary)), var(--bg-secondary))", border: "1px solid var(--brand)", borderRadius: "var(--radius-base)" }} data-testid="membership-card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--brand)" }}>Abonnement Nexus</p>
                  <h2 className="font-display text-2xl mb-2 flex items-center gap-2"><IoSparkles style={{ color: "var(--brand)" }} /> Soutiens la station</h2>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Accède à tout le catalogue, sois prévenu·e des nouveautés et sauvegarde tes favoris partout.</p>
                </div>
                <button data-testid="membership-subscribe" onClick={subscribe} className="px-5 py-2.5 font-semibold self-center" style={primary}>Voir les formules</button>
              </div>
            </div>
          )
        )}

        {/* Owned creations */}
        <h2 className="font-display text-2xl mb-4">Mes créations débloquées</h2>
        {isLoading ? <p style={{ color: "var(--text-secondary)" }}>Chargement…</p> : creations.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>Tu n'as pas encore d'achat. {membership.active ? "Mais ton abonnement te donne accès à tout le catalogue payant !" : "Explore le catalogue et débloque tes favoris ✨"}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4" data-testid="library-grid">
            {creations.map((c) => {
              const img = c.has_poster;
              return (
                <button key={c.id} data-testid={`library-item-${c.id}`} onClick={() => { sfx("select"); nav(`/oeuvre/${c.id}`); }} className="text-left transition-transform hover:scale-[1.03]">
                  <div className="w-full aspect-[2/3] overflow-hidden relative" style={{ borderRadius: "var(--radius-base)", border: "1px solid var(--border-c)" }}>
                    {img ? <img src={posterUrl(c.id, c.updated_at, 360)} alt={c.title} className="w-full h-full object-cover" /> : (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(160deg, var(--bg-secondary), var(--bg-primary))" }}><span className="font-display text-4xl" style={{ color: "var(--brand)" }}>{c.kanji || c.title[0]}</span></div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold" style={{ ...primary }}>Débloqué</span>
                  </div>
                  <p className="text-sm mt-1.5 line-clamp-2">{c.title}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
