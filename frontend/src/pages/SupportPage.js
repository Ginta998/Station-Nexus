import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { IoArrowBack, IoHome, IoSparkles, IoCheckmarkCircle, IoCreateOutline, IoSaveOutline, IoCloseOutline, IoAddOutline, IoTrashOutline, IoHeart, IoStar, IoDiamond } from "react-icons/io5";
import { getMembershipPlan, getSettings, updateSettings, startCheckout, getLibrary, listProfiles } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import QuickControls from "@/components/QuickControls";
import MobileMenu from "@/components/MobileMenu";

const TIER_ACCENTS = ["#4d8dff", "#ffcc33", "#ff5d8f"];
const TIER_ICONS = [(p) => <IoHeart {...p} />, (p) => <IoStar {...p} />, (p) => <IoDiamond {...p} />];
const WALL_STYLE = {
  soutien: { color: "#4d8dff", Icon: IoHeart },
  mecene: { color: "#ffcc33", Icon: IoStar },
  legende: { color: "#ff5d8f", Icon: IoDiamond },
};
const wallStyle = (id) => WALL_STYLE[id] || { color: "var(--brand)", Icon: IoSparkles };

export default function SupportPage() {
  const nav = useNavigate();
  const { isAdmin, sfx } = useApp();
  const { user, openAuth } = useAuth();
  const { data: plan, refetch } = useQuery({ queryKey: ["membership-plan"], queryFn: getMembershipPlan });
  const { data: lib } = useQuery({ queryKey: ["library"], queryFn: getLibrary, enabled: !!user });
  const { data: allProfiles = [] } = useQuery({ queryKey: ["profiles"], queryFn: listProfiles });
  const supporters = allProfiles.filter((p) => p.tier_name);
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);

  const active = lib?.membership?.active;
  const activeTier = lib?.membership?.tier_id;

  useEffect(() => {
    if (edit && plan) setDraft({ page_title: plan.page_title, page_body: plan.page_body, enabled: plan.enabled, tiers: JSON.parse(JSON.stringify(plan.tiers || [])) });
  }, [edit, plan]);

  const btn = { border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)", background: "var(--bg-secondary)" };
  const primary = { background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" };

  const subscribe = async (tierId) => {
    if (!user) { toast.info("Connecte-toi pour t'abonner."); openAuth(); return; }
    setBusy(true);
    try { const r = await startCheckout({ kind: "membership", tier_id: tierId }); window.location.href = r.checkout_url; }
    catch (e) { toast.error(e?.response?.data?.detail || "Impossible de démarrer l'abonnement"); setBusy(false); }
  };

  const save = async () => {
    const s = await getSettings();
    const tiers = (draft.tiers || []).map((t) => ({ id: t.id || t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20), name: t.name, price_eur: Number(t.price_eur) || 0, perks: (Array.isArray(t.perks) ? t.perks : String(t.perks).split("\n")).map((p) => p.trim()).filter(Boolean) }));
    await updateSettings({ ...s, membership_enabled: draft.enabled, membership_page_title: draft.page_title, membership_page_body: draft.page_body, membership_tiers: tiers });
    toast.success("Page Soutien mise à jour"); setEdit(false); refetch();
  };
  const setTier = (i, k, v) => setDraft((d) => ({ ...d, tiers: d.tiers.map((t, x) => x === i ? { ...t, [k]: v } : t) }));
  const addTier = () => setDraft((d) => ({ ...d, tiers: [...d.tiers, { id: "", name: "Nouveau palier", price_eur: 5, perks: ["Avantage"] }] }));
  const delTier = (i) => setDraft((d) => ({ ...d, tiers: d.tiers.filter((_, x) => x !== i) }));

  const tiers = edit ? (draft?.tiers || []) : (plan?.tiers || []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }} data-testid="support-page">
      <div className="sx-safe-top flex items-center justify-between px-5 md:px-12 pt-6">
        <div className="flex items-center gap-2">
          <button data-testid="support-back" onClick={() => { sfx("back"); nav(-1); }} className="flex items-center gap-2 px-3 py-2" style={btn}><IoArrowBack /> <span className="text-sm hidden sm:inline">Retour</span></button>
          <button data-testid="support-home" onClick={() => { sfx("nav"); nav("/"); }} className="flex items-center gap-2 px-3 py-2" style={btn}><IoHome size={16} /></button>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (edit ? (
            <>
              <button data-testid="support-save" onClick={save} className="flex items-center gap-2 px-4 py-2 font-semibold" style={primary}><IoSaveOutline /> Enregistrer</button>
              <button data-testid="support-cancel" onClick={() => setEdit(false)} className="px-3 py-2" style={btn}><IoCloseOutline /></button>
            </>
          ) : (
            <button data-testid="support-edit" onClick={() => setEdit(true)} className="flex items-center gap-2 px-3 py-2" style={btn}><IoCreateOutline /> <span className="text-sm hidden sm:inline">Modifier</span></button>
          ))}
          <MobileMenu />
          <QuickControls />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-12 py-8">
        {/* Hero — attractif */}
        <div className="relative overflow-hidden mb-10 p-8 md:p-10" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--brand) 22%, var(--bg-secondary)), var(--bg-secondary))", border: "1px solid var(--brand)", borderRadius: "var(--radius-base)" }}>
          <div className="relative max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: "var(--brand)" }}>✦ Abonnement Nexus</p>
            {edit ? (
              <input data-testid="support-title-input" value={draft?.page_title || ""} onChange={(e) => setDraft((d) => ({ ...d, page_title: e.target.value }))} className="w-full font-display text-3xl md:text-5xl mb-3 px-3 py-2 border outline-none" style={btn} />
            ) : (
              <h1 className="font-display text-3xl md:text-5xl mb-3 leading-tight">{plan?.page_title}</h1>
            )}
            {edit ? (
              <textarea data-testid="support-body-input" rows={6} value={draft?.page_body || ""} onChange={(e) => setDraft((d) => ({ ...d, page_body: e.target.value }))} className="w-full px-3 py-2 border outline-none resize-none" style={btn} />
            ) : (
              <div className="space-y-2 text-base md:text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {(plan?.page_body || "").split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm" style={{ color: "var(--text-primary)" }}>
              <span className="flex items-center gap-1.5"><IoCheckmarkCircle style={{ color: "var(--brand)" }} /> Accès à tout le catalogue</span>
              <span className="flex items-center gap-1.5"><IoCheckmarkCircle style={{ color: "var(--brand)" }} /> Prévenu·e des nouveautés</span>
              <span className="flex items-center gap-1.5"><IoCheckmarkCircle style={{ color: "var(--brand)" }} /> Favoris & préférences sauvegardés</span>
            </div>
          </div>
        </div>

        {edit && (
          <label className="flex items-center gap-2 text-sm mb-6 cursor-pointer" style={{ color: "var(--text-primary)" }}>
            <input type="checkbox" data-testid="support-enable" checked={!!draft?.enabled} onChange={(e) => setDraft((d) => ({ ...d, enabled: e.target.checked }))} /> Abonnement activé (visible par les visiteurs)
          </label>
        )}

        {!plan?.enabled && !edit ? (
          <p style={{ color: "var(--text-secondary)" }}>L'abonnement n'est pas encore activé.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3" data-testid="support-tiers">
            {tiers.map((t, i) => {
              const accent = TIER_ACCENTS[i % TIER_ACCENTS.length];
              const isActive = active && activeTier === t.id;
              return (
                <div key={i} data-testid={`tier-${t.id || i}`} className="relative p-6 flex flex-col transition-transform hover:-translate-y-1" style={{ background: "var(--bg-secondary)", border: `1px solid ${isActive || i === 1 ? "var(--brand)" : "var(--border-c)"}`, borderRadius: "var(--radius-base)", boxShadow: isActive ? "0 0 0 2px var(--brand) inset" : (i === 1 ? "0 12px 32px rgba(0,0,0,0.35)" : "none"), transform: i === 1 && !edit ? "scale(1.03)" : "none" }}>
                  {i === 1 && !edit && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "999px" }}>★ Le plus choisi</span>}
                  {edit ? (
                    <>
                      <input value={t.name} onChange={(e) => setTier(i, "name", e.target.value)} className="font-display text-xl mb-2 px-2 py-1 border outline-none" style={btn} placeholder="Nom" data-testid={`tier-name-${i}`} />
                      <div className="flex items-center gap-2 mb-2"><input type="number" min="0" step="0.5" value={t.price_eur} onChange={(e) => setTier(i, "price_eur", e.target.value)} className="w-24 px-2 py-1 border outline-none" style={btn} data-testid={`tier-price-${i}`} /> <span style={{ color: "var(--text-secondary)" }}>€/mois</span></div>
                      <textarea rows={4} value={Array.isArray(t.perks) ? t.perks.join("\n") : t.perks} onChange={(e) => setTier(i, "perks", e.target.value.split("\n"))} className="px-2 py-1 border outline-none resize-none text-sm" style={btn} placeholder="Un avantage par ligne" data-testid={`tier-perks-${i}`} />
                      <button onClick={() => delTier(i)} className="mt-2 text-xs flex items-center gap-1" style={{ color: "var(--brand)" }}><IoTrashOutline /> Supprimer</button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center w-14 h-14 mb-4" style={{ background: `color-mix(in srgb, ${accent} 20%, transparent)`, borderRadius: "50%", border: `1.5px solid ${accent}` }}>
                        {TIER_ICONS[i % TIER_ICONS.length]({ size: 26, style: { color: accent } })}
                      </div>
                      <p className="font-display text-2xl mb-1">{t.name}</p>
                      <p className="font-display text-4xl mb-4" style={{ color: accent }}>{t.price_eur}€<span className="text-sm" style={{ color: "var(--text-secondary)" }}>/mois</span></p>
                      <ul className="space-y-2 text-sm mb-6 flex-1" style={{ color: "var(--text-secondary)" }}>
                        {(t.perks || []).map((p, x) => <li key={x} className="flex items-start gap-2"><IoCheckmarkCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: accent }} /> {p}</li>)}
                      </ul>
                      {isActive ? (
                        <span className="flex items-center justify-center gap-2 px-5 py-3 font-semibold" style={primary} data-testid={`tier-current-${t.id}`}><IoCheckmarkCircle /> Ton palier actuel</span>
                      ) : (
                        <button data-testid={`tier-subscribe-${t.id}`} disabled={busy} onClick={() => subscribe(t.id)} className="flex items-center justify-center gap-2 px-5 py-3 font-semibold transition-transform hover:scale-105 disabled:opacity-60" style={i === 1 ? primary : { border: `2px solid ${accent}`, color: accent, borderRadius: "var(--radius-base)" }}>
                          {TIER_ICONS[i % TIER_ICONS.length]({ size: 16 })} {active ? "Changer pour ce palier" : "S'abonner"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
            {edit && <button onClick={addTier} className="p-6 flex items-center justify-center gap-2 border-2 border-dashed" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-secondary)" }} data-testid="support-add-tier"><IoAddOutline size={20} /> Ajouter un palier</button>}
          </div>
        )}

        {active && !edit && <p className="mt-6 text-sm" style={{ color: "var(--brand)" }}>✓ Tu es abonné — merci pour ton soutien ! Gère ton abonnement depuis <button onClick={() => nav("/bibliotheque")} className="underline">ta bibliothèque</button>.</p>}

        {/* Mur des soutiens */}
        {!edit && supporters.length > 0 && (
          <div className="mt-16" data-testid="supporters-wall">
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: "var(--brand)" }}>✦ Mur des soutiens</p>
              <h2 className="font-display text-3xl md:text-4xl mb-2">Merci à nos soutiens 💛</h2>
              <p className="text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>Ces voyageurs font grandir la station, œuvre après œuvre.</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {supporters.map((p) => {
                const ws = wallStyle(p.tier_id);
                return (
                  <div key={p.id} data-testid={`supporter-${p.id}`} className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center relative" style={{ border: `2px solid ${ws.color}`, background: "var(--bg-secondary)" }}>
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
        )}
      </div>
    </div>
  );
}
