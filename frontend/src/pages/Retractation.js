import { useState } from "react";
import { Link } from "react-router-dom";
import { IoPrintOutline } from "react-icons/io5";
import LegalNav from "@/components/LegalNav";
import { useLegal } from "@/lib/useLegal";
import { useAuth } from "@/context/AuthContext";
import { sendRetractation } from "@/lib/api";
import { toast } from "sonner";

// « Renoncer au contrat ici » (art. L221-21 C. conso) : formulaire → bouton « Confirmer la rétractation »
// → accusé de réception horodaté, à l'écran et par email. Repli par email si le serveur ne répond pas.
export default function Retractation() {
  const LEGAL = useLegal();
  const { user } = useAuth();
  const [f, setF] = useState({ nom: user?.name || "", email: user?.email || "", contrat: "abonnement", detail: "", date: "" });
  const [sent, setSent] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (p) => setF((o) => ({ ...o, ...p }));
  const ok = f.nom.trim() && /\S+@\S+/.test(f.email) && f.date && !busy;

  const confirm = async () => {
    setBusy(true);
    try {
      const r = await sendRetractation({ name: f.nom, email: f.email, contract: f.contrat, detail: f.detail, order_date: f.date });
      setSent({ at: new Date(r.at).toLocaleString("fr-FR"), ref: r.ref, server: true });
      setBusy(false); return;
    } catch (e) {
      if (e?.response?.status && e.response.status !== 404) { setBusy(false); return toast.error(e.response.data?.detail || "Envoi impossible"); }
    }
    setBusy(false);
    mailtoFallback();
  };
  const mailtoFallback = () => {
    const at = new Date().toLocaleString("fr-FR");
    const objet = f.contrat === "abonnement" ? "l'abonnement Station Nexus" : `l'achat de la création « ${f.detail || "…"} »`;
    const body = `À l'attention de ${LEGAL.editeur}, ${LEGAL.adresse}, ${LEGAL.email} :\n\nJe vous notifie par la présente ma rétractation du contrat portant sur ${objet}.\n\nCommandé le : ${f.date}\nNom : ${f.nom}\nEmail du compte : ${f.email}\n${f.detail && f.contrat === "abonnement" ? "Précisions : " + f.detail + "\n" : ""}\nDate : ${at}`;
    window.location.href = `mailto:${LEGAL.email}?subject=${encodeURIComponent("Rétractation — " + objet)}&body=${encodeURIComponent(body)}`;
    setSent({ at, body });
  };

  return (
    <div className="lg-page" data-testid="retractation-page">
      <div className="lg-wrap">
        <LegalNav />
        <h1 className="lg-title">Renoncer au contrat ici</h1>
        <p className="lg-meta">Droit de rétractation · <Link to="/legal/cgv">conditions de vente, article 8</Link></p>
        <section className="lg-sec">
          <p><b>Abonnement</b> : tu as 14 jours à compter de la souscription pour te rétracter, et tu es intégralement remboursé.</p>
          <p><b>Achat d'une création à l'unité</b> : si tu as demandé l'accès immédiat au moment de l'achat, la rétractation n'est plus possible une fois l'accès commencé.</p>
        </section>
        {!sent ? (
          <section className="lg-sec box" data-testid="retract-form">
            <label className="lg-field">Nom et prénom<input value={f.nom} onChange={(e) => set({ nom: e.target.value })} /></label>
            <label className="lg-field">Email de ton compte<input type="email" value={f.email} onChange={(e) => set({ email: e.target.value })} /></label>
            <label className="lg-field">Contrat concerné
              <select value={f.contrat} onChange={(e) => set({ contrat: e.target.value })}><option value="abonnement">Abonnement</option><option value="creation">Achat d'une création</option></select>
            </label>
            <label className="lg-field">{f.contrat === "abonnement" ? "Précisions (palier…) — facultatif" : "Titre de la création"}<input value={f.detail} onChange={(e) => set({ detail: e.target.value })} /></label>
            <label className="lg-field">Date de la commande<input type="date" value={f.date} onChange={(e) => set({ date: e.target.value })} /></label>
            <button className="lg-btn" disabled={!ok} onClick={confirm} data-testid="retract-confirm">{busy ? "Envoi…" : "Confirmer la rétractation"}</button>
            <p className="lg-small">Tu reçois aussitôt un accusé de réception à l'écran et par email.</p>
          </section>
        ) : (
          sent.server ? (
          <section className="lg-sec box" data-testid="retract-ack">
            <h2>Accusé de réception</h2>
            <p>Ta rétractation a bien été enregistrée le <b>{sent.at}</b>.</p>
            <dl className="lg-dl"><dt>Référence</dt><dd className="mono">{sent.ref}</dd><dt>Nom</dt><dd>{f.nom}</dd><dt>Contrat</dt><dd>{f.contrat === "abonnement" ? "Abonnement" : `Achat : ${f.detail || "création"}`}</dd><dt>Commande du</dt><dd>{f.date}</dd></dl>
            <p className="lg-small">Un email de confirmation a été envoyé à {f.email}. Pour un abonnement, le remboursement intégral intervient au plus tard 14 jours après cette déclaration.</p>
            <button className="lg-btn ghost" onClick={() => window.print()}><IoPrintOutline size={16} /> Imprimer / PDF</button>
          </section>
          ) : (
          <section className="lg-sec box" data-testid="retract-ack">
            <h2>Déclaration préparée le {sent.at}</h2>
            <p>Envoie l'email qui s'est ouvert pour transmettre ta rétractation, puis conserve ce récapitulatif. Si ta messagerie ne s'est pas ouverte, copie le texte ci-dessous et envoie-le à <b>{LEGAL.email}</b>.</p>
            <pre className="lg-pre">{sent.body}</pre>
            <button className="lg-btn ghost" onClick={() => window.print()}><IoPrintOutline size={16} /> Imprimer / PDF</button>
          </section>
          )
        )}
      </div>
    </div>
  );
}
