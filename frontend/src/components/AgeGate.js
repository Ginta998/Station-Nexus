import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { setAge } from "@/lib/api";

// « Finalise ton compte » : date de naissance obligatoire (15 ans minimum) pour les comptes
// créés avant cette règle ou via Google. Ne s'affiche que si le serveur indique birthdate_set === false.
export default function AgeGate() {
  const { user, updateUser, logout } = useAuth();
  const [bd, setBd] = useState("");
  const [nl, setNl] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!user || user.birthdate_set !== false) return null;

  const save = async () => {
    if (!bd) return;
    setBusy(true);
    try { const r = await setAge({ birthdate: bd, newsletter: nl }); updateUser(r.user); toast.success("Merci, ton compte est à jour."); }
    catch (e) {
      if (e?.response?.status === 403) { toast.error(e.response.data?.detail || "Station Nexus est réservée aux 15 ans et plus."); logout(); }
      else toast.error(e?.response?.data?.detail || "Enregistrement impossible");
    }
    setBusy(false);
  };

  return (
    <div className="ck-wrap" data-testid="age-gate">
      <div className="ck-box" role="dialog" aria-modal="true" aria-labelledby="ag-t">
        <p className="ck-k mono">FINALISE TON COMPTE</p>
        <h2 id="ag-t">Ta date de naissance</h2>
        <p className="lg-small" style={{ margin: "0 0 12px" }}>La Station est ouverte à partir de 15 ans. Ta date de naissance reste privée : elle sert seulement à vérifier l'âge minimum et à protéger les plus jeunes (accord parental pour les achats avant 18 ans).</p>
        <input type="date" value={bd} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setBd(e.target.value)} className="ag-in" data-testid="age-gate-date" />
        <label className="ck-chk"><input type="checkbox" checked={nl} onChange={(e) => setNl(e.target.checked)} /><span>Je veux recevoir la newsletter de la Station. Désinscription en un clic dans chaque email.</span></label>
        <button className="ck-go" disabled={!bd || busy} onClick={save} data-testid="age-gate-save">{busy ? "…" : "Valider"}</button>
        <button className="ck-cancel" onClick={logout}>Se déconnecter</button>
        <p className="lg-small" style={{ textAlign: "center", margin: 0 }}><Link to="/legal/confidentialite">Politique de confidentialité</Link></p>
      </div>
    </div>
  );
}
