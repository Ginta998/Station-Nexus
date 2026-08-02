import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack, IoHome, IoCashOutline, IoCartOutline, IoPeopleOutline, IoTrendingUpOutline, IoWarningOutline } from "react-icons/io5";
import { getAdminRevenue } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import QuickControls from "@/components/QuickControls";
import MobileMenu from "@/components/MobileMenu";

const eur = (n) => `${(Number(n) || 0).toFixed(2)} €`;

export default function Revenue() {
  const nav = useNavigate();
  const { sfx } = useApp();
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-revenue"], queryFn: getAdminRevenue, retry: false });

  const btn = { border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)", background: "var(--bg-secondary)" };
  const card = { background: "var(--bg-secondary)", border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)" };

  const forbidden = error && (error?.response?.status === 403 || error?.response?.status === 401);

  return (
    <div className="min-h-screen pb-16" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }} data-testid="revenue-page">
      <div className="sx-safe-top flex items-center justify-between px-5 md:px-12 pt-6">
        <div className="flex items-center gap-2">
          <button data-testid="revenue-back" onClick={() => { sfx("back"); nav(-1); }} className="flex items-center gap-2 px-3 py-2" style={btn}><IoArrowBack /> <span className="text-sm hidden sm:inline">Retour</span></button>
          <button data-testid="revenue-home" onClick={() => { sfx("nav"); nav("/"); }} className="flex items-center gap-2 px-3 py-2" style={btn}><IoHome size={16} /></button>
        </div>
        <div className="flex items-center gap-2">
          <MobileMenu />
          <QuickControls />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-12 py-8">
        <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "var(--brand)" }}>✦ Espace créateur</p>
        <h1 className="font-display text-3xl md:text-5xl mb-2">Mes revenus</h1>
        <p className="text-sm md:text-base mb-8" style={{ color: "var(--text-secondary)" }}>Calculés à partir de tes membres : leurs abonnements et leurs achats.</p>

        {isLoading ? (
          <p style={{ color: "var(--text-secondary)" }}>Chargement…</p>
        ) : forbidden ? (
          <div className="p-8 text-center" style={card} data-testid="revenue-forbidden">
            <IoWarningOutline size={36} style={{ color: "var(--brand)" }} className="mx-auto mb-3" />
            <p className="font-display text-xl mb-2">Réservé à l'administrateur</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Connecte-toi avec ton compte créateur (admin) pour voir tes revenus.</p>
          </div>
        ) : data ? (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="p-5" style={{ ...card, borderColor: "var(--brand)" }} data-testid="revenue-total">
                <div className="flex items-center gap-2 mb-2" style={{ color: "var(--brand)" }}><IoCashOutline size={20} /> <span className="text-xs uppercase tracking-widest">Total estimé</span></div>
                <p className="font-display text-4xl" style={{ color: "var(--brand)" }}>{eur(data.total_estimated)}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Achats cumulés + 1 mois d'abonnements</p>
              </div>
              <div className="p-5" style={card} data-testid="revenue-unit">
                <div className="flex items-center gap-2 mb-2" style={{ color: "var(--text-secondary)" }}><IoCartOutline size={20} /> <span className="text-xs uppercase tracking-widest">Ventes à l'unité</span></div>
                <p className="font-display text-3xl">{eur(data.unit.revenue)}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{data.unit.count} achat{data.unit.count > 1 ? "s" : ""}</p>
              </div>
              <div className="p-5" style={card} data-testid="revenue-subs">
                <div className="flex items-center gap-2 mb-2" style={{ color: "var(--text-secondary)" }}><IoTrendingUpOutline size={20} /> <span className="text-xs uppercase tracking-widest">Revenu mensuel (MRR)</span></div>
                <p className="font-display text-3xl">{eur(data.subscriptions.mrr)}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{data.subscriptions.active_count} abonné{data.subscriptions.active_count > 1 ? "s" : ""} actif{data.subscriptions.active_count > 1 ? "s" : ""}</p>
              </div>
            </div>

            {/* Subscriptions by tier */}
            <div className="p-6 mb-8" style={card} data-testid="revenue-by-tier">
              <h2 className="font-display text-xl mb-4 flex items-center gap-2"><IoPeopleOutline style={{ color: "var(--brand)" }} /> Abonnements par palier</h2>
              {data.subscriptions.by_tier.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Aucun abonné actif pour l'instant.</p>
              ) : (
                <div className="space-y-3">
                  {data.subscriptions.by_tier.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <span className="font-semibold">{t.name}</span>
                        <span className="text-sm ml-2" style={{ color: "var(--text-secondary)" }}>{t.count} × {eur(t.price)}/mois</span>
                      </div>
                      <span className="font-display text-lg" style={{ color: "var(--brand)" }}>{eur(t.monthly)}/mois</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top creations */}
            <div className="p-6 mb-8" style={card} data-testid="revenue-top-creations">
              <h2 className="font-display text-xl mb-4 flex items-center gap-2"><IoCartOutline style={{ color: "var(--brand)" }} /> Créations les plus vendues</h2>
              {data.top_creations.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Aucune vente à l'unité pour l'instant.</p>
              ) : (
                <div className="space-y-2">
                  {data.top_creations.map((c, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b" style={{ borderColor: "var(--border-c)" }}>
                      <span className="truncate">{c.title}</span>
                      <span className="text-sm whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{c.count} vente{c.count > 1 ? "s" : ""} · <b style={{ color: "var(--text-primary)" }}>{eur(c.revenue)}</b></span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent transactions */}
            <div className="p-6" style={card} data-testid="revenue-recent">
              <h2 className="font-display text-xl mb-4">Transactions récentes</h2>
              {data.recent.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Aucune transaction pour l'instant.</p>
              ) : (
                <div className="space-y-2">
                  {data.recent.map((r, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b" style={{ borderColor: "var(--border-c)" }}>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 mr-2" style={{ background: "color-mix(in srgb, var(--brand) 18%, transparent)", color: "var(--brand)", borderRadius: "999px" }}>{r.kind}</span>
                        <span className="text-sm">{r.label}</span>
                        {r.member && <span className="text-xs ml-2" style={{ color: "var(--text-secondary)" }}>· {r.member}</span>}
                      </div>
                      <span className="text-sm whitespace-nowrap font-semibold">{eur(r.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <p style={{ color: "var(--text-secondary)" }}>Impossible de charger les revenus.</p>
        )}
      </div>
    </div>
  );
}
