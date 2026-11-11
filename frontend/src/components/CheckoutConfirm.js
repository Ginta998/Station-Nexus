import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoClose, IoLockClosed } from "react-icons/io5";
import { LEGAL } from "@/lib/legal";
import { useLegal } from "@/lib/useLegal";
import { useAuth } from "@/context/AuthContext";

// Récapitulatif + consentements avant paiement (art. L221-14 et L221-28 13° C. conso).
// Usage : const c = await confirmCheckout({ kind: "creation" | "membership", title, price }); if (!c) return;
export const confirmCheckout = (opts) => new Promise((resolve) => window.dispatchEvent(new CustomEvent("nx-checkout", { detail: { opts, resolve } })));

const WAIVER = "Je demande à accéder immédiatement au contenu numérique acheté, avant l'expiration du délai de rétractation de 14 jours, et je reconnais qu'en conséquence je perds mon droit de rétractation dès le début de la fourniture.";

export function CheckoutConfirmHost() {
  const { user } = useAuth();
  const legal = useLegal();
  const [req, setReq] = useState(null);
  const [parent, setParent] = useState(false);
  const [cgv, setCgv] = useState(false);
  const [waiver, setWaiver] = useState(false);
  useEffect(() => {
    const on = (e) => { setReq(e.detail); setCgv(false); setWaiver(false); setParent(false); };
    window.addEventListener("nx-checkout", on);
    return () => window.removeEventListener("nx-checkout", on);
  }, []);
  if (!req) return null;
  const { opts, resolve } = req;
  const isSub = opts.kind === "membership";
  const close = (v) => { resolve(v); setReq(null); };
  const minor = !!user?.is_minor;
  const ok = cgv && (isSub || waiver) && (!minor || parent);
  const tva = legal.tva_mention;
  const go = () => close({ cgv_version: LEGAL.version, cgv_accepted: true, immediate_access_waiver: isSub ? undefined : true, waiver_text: isSub ? undefined : WAIVER, parental_ok: minor ? true : undefined, accepted_at: new Date().toISOString() });

  return (
    <div className="ck-wrap" onClick={() => close(null)} data-testid="checkout-confirm">
      <div className="ck-box" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="ck-t">
        <button className="ck-x" onClick={() => close(null)} aria-label="Annuler"><IoClose size={18} /></button>
        <p className="ck-k mono">RÉCAPITULATIF DE TA COMMANDE</p>
        <h2 id="ck-t">{opts.title}</h2>
        <div className="ck-price"><b>{Number(opts.price || 0).toFixed(2)} €</b>{isSub ? " / mois" : ""}<small> TTC{tva ? ` · ${tva}` : ""}</small></div>
        <ul className="ck-info">
          {isSub ? (<>
            <li>Abonnement mensuel sans engagement, renouvelé automatiquement chaque mois.</li>
            <li>Résiliable à tout moment via « Résilier votre contrat » (bas de page, Paramètres, Bibliothèque).</li>
            <li>14 jours pour te rétracter après la souscription, avec remboursement intégral.</li>
          </>) : (<>
            <li>Accès numérique à cette création depuis ta Bibliothèque, ouvert dès le paiement.</li>
          </>)}
          <li>Paiement sécurisé par Stripe — ta carte n'est jamais enregistrée par la Station.</li>
        </ul>
        <label className="ck-chk"><input type="checkbox" checked={cgv} onChange={(e) => setCgv(e.target.checked)} data-testid="ck-cgv" /><span>J'ai lu et j'accepte les <Link to="/legal/cgv" target="_blank">conditions générales de vente</Link> et les <Link to="/legal/cgu" target="_blank">conditions d'utilisation</Link>.</span></label>
        {minor && <label className="ck-chk"><input type="checkbox" checked={parent} onChange={(e) => setParent(e.target.checked)} data-testid="ck-parent" /><span>J'ai moins de 18 ans : un de mes parents (ou mon responsable légal) est d'accord avec cet achat.</span></label>}
        {!isSub && <label className="ck-chk"><input type="checkbox" checked={waiver} onChange={(e) => setWaiver(e.target.checked)} data-testid="ck-waiver" /><span>{WAIVER}</span></label>}
        <button className="ck-go" disabled={!ok} onClick={go} data-testid="ck-pay"><IoLockClosed size={15} /> Commande avec obligation de paiement</button>
        <button className="ck-cancel" onClick={() => close(null)}>Annuler</button>
      </div>
    </div>
  );
}
