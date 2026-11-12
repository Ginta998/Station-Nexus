import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoPrintOutline } from "react-icons/io5";
import LegalNav from "@/components/LegalNav";
import { toast } from "sonner";
import { getLibrary, getMembershipPlan, cancelMembership } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Fill } from "@/components/LegalText";

// Résiliation « en trois clics » (art. L215-1-1 et D215-1 à D215-3 du Code de la consommation) :
// 1. identification · 2. récapitulatif modifiable · 3. notification + accusé de réception.
const fmtDate = (v) => { if (!v) return null; const d = new Date(typeof v === "number" ? (v < 1e12 ? v * 1000 : v) : v); return isNaN(d) ? null : d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); };

export default function Resiliation() {
  const { user, openAuth } = useAuth();
  const { data: lib, refetch } = useQuery({ queryKey: ["library"], queryFn: getLibrary, enabled: !!user });
  const { data: plan } = useQuery({ queryKey: ["membership-plan"], queryFn: getMembershipPlan });
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [ack, setAck] = useState(null);
  const m = lib?.membership;
  const tier = plan?.tiers?.find((t) => t.id === m?.tier_id);
  const tierLabel = tier ? `${tier.name} (${Number(tier.price_eur).toFixed(2)} € / mois)` : "Abonnement Station Nexus";
  const end = fmtDate(m?.current_period_end) || "la fin de la période mensuelle en cours";

  const notify = async () => {
    setBusy(true);
    try {
      const r = await cancelMembership();
      const at = r?.at ? new Date(r.at) : new Date();
      setAck({ at: at.toLocaleString("fr-FR"), ref: r?.ref || "RES-" + at.getTime().toString(36).toUpperCase(), end: fmtDate(r?.current_period_end) || end, emailed: !!r?.ref });
      setStep(3); refetch();
    } catch (e) { toast.error(e?.response?.data?.detail || "La résiliation n'a pas pu être enregistrée. Réessaie ou écris-nous."); }
    setBusy(false);
  };

  return (
    <div className="lg-page" data-testid="resiliation-page">
      <div className="lg-wrap">
        <LegalNav />
        <h1 className="lg-title">Résilier votre contrat</h1>
        <p className="lg-meta">Abonnement mensuel, sans engagement · <Link to="/legal/cgv">conditions de vente</Link></p>

        {!user ? (
          <section className="lg-sec box">
            <p>Pour identifier ton abonnement, connecte-toi au compte avec lequel tu l'as souscrit.</p>
            <button className="lg-btn" onClick={() => openAuth()} data-testid="resil-login">Se connecter</button>
            <p className="lg-small">Tu n'arrives pas à te connecter ? Écris à <Fill k="email" /> en indiquant l'email de ton compte.</p>
          </section>
        ) : !m?.active && step !== 3 ? (
          <section className="lg-sec box">
            <p>Aucun abonnement actif n'est rattaché au compte <b>{user.email}</b>.</p>
            <p className="lg-small">Tu as souscrit avec un autre compte ? Connecte-toi avec celui-ci, ou écris à <Fill k="email" />.</p>
          </section>
        ) : (
          <>
            <ol className="lg-steps"><li className={step >= 1 ? "on" : ""}>Identification</li><li className={step >= 2 ? "on" : ""}>Récapitulatif</li><li className={step >= 3 ? "on" : ""}>Confirmation</li></ol>

            {step === 1 && (
              <section className="lg-sec box" data-testid="resil-step1">
                <h2>1. Ton abonnement</h2>
                <dl className="lg-dl">
                  <dt>Compte</dt><dd>{user.email}</dd>
                  <dt>Abonnement</dt><dd>{tierLabel}</dd>
                  <dt>Date d'effet</dt><dd>À la fin de la période déjà payée : <b>{end}</b>. Tu gardes ton accès jusqu'à cette date, et aucun nouveau prélèvement n'aura lieu.</dd>
                </dl>
                <p className="lg-small">Abonné depuis moins de 14 jours ? Tu peux aussi te rétracter et être intégralement remboursé : <Link to="/retractation">Renoncer au contrat ici</Link>.</p>
                <button className="lg-btn" onClick={() => setStep(2)} data-testid="resil-next">Continuer</button>
              </section>
            )}

            {step === 2 && (
              <section className="lg-sec box" data-testid="resil-step2">
                <h2>2. Récapitulatif</h2>
                <p>Tu demandes la résiliation de l'abonnement <b>{tierLabel}</b> rattaché au compte <b>{user.email}</b>, avec effet le <b>{end}</b>.</p>
                <div className="lg-row">
                  <button className="lg-btn ghost" onClick={() => setStep(1)}>Modifier</button>
                  <button className="lg-btn" disabled={busy} onClick={notify} data-testid="resil-notify">{busy ? "Envoi…" : "Notification de la résiliation"}</button>
                </div>
              </section>
            )}

            {step === 3 && ack && (
              <section className="lg-sec box" data-testid="resil-ack">
                <h2>Accusé de réception</h2>
                <p>Ta résiliation a bien été enregistrée le <b>{ack.at}</b>.</p>
                <dl className="lg-dl">
                  <dt>Référence</dt><dd className="mono">{ack.ref}</dd>
                  <dt>Compte</dt><dd>{user.email}</dd>
                  <dt>Abonnement</dt><dd>{tierLabel}</dd>
                  <dt>Fin de l'abonnement</dt><dd>{ack.end} — accès conservé jusqu'à cette date, plus aucun prélèvement ensuite.</dd>
                </dl>
                <p className="lg-small">{ack.emailed ? `Un email de confirmation a été envoyé à ${user.email}. ` : ""}Conserve ce récapitulatif : imprime-le ou enregistre-le en PDF.</p>
                <button className="lg-btn ghost" onClick={() => window.print()}><IoPrintOutline size={16} /> Imprimer / PDF</button>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
