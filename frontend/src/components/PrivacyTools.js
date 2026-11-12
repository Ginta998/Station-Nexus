import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { IoDownloadOutline, IoTrashOutline } from "react-icons/io5";
import { useAuth } from "@/context/AuthContext";
import { exportMyData, deleteMyAccount, listReports, decideReport, getLegalInfo, saveLegalInfo } from "@/lib/api";
import { LEGAL, LEGAL_FIELDS } from "@/lib/legal";
import { REASONS } from "@/components/ReportDialog";

const btn = { border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)", background: "var(--bg-primary)" };

// Paramètres → Compte : droits RGPD en libre-service (export, suppression)
export function MyData() {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState("");
  if (!user) return <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Connecte-toi pour gérer tes données.</p>;
  const doExport = async () => {
    setBusy("export");
    try {
      const blob = await exportMyData();
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "station-nexus-mes-donnees.json"; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast.success("Tes données sont téléchargées");
    } catch (e) { toast.error(e?.response?.status === 404 ? "Fonction pas encore active sur le serveur" : "Export impossible"); }
    setBusy("");
  };
  const doDelete = async () => {
    const v = window.prompt("Supprimer définitivement ton compte ?\n\nTon profil, tes messages et ton inscription à la newsletter seront effacés, et un abonnement en cours sera arrêté immédiatement. Seules les preuves d'achat que la loi impose de garder sont conservées.\n\nTape SUPPRIMER pour confirmer :");
    if (v === null) return;
    if (v.trim().toUpperCase() !== "SUPPRIMER") return toast.error("Suppression annulée : il fallait taper SUPPRIMER");
    setBusy("delete");
    try { await deleteMyAccount("SUPPRIMER"); toast.success("Ton compte a été supprimé. À bientôt peut-être !"); logout(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Suppression impossible"); }
    setBusy("");
  };
  return (
    <div data-testid="my-data">
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Récupère une copie de toutes tes données, ou supprime ton compte. <a href="/legal/confidentialite" className="underline">Tes droits</a></p>
      <div className="flex flex-wrap gap-2">
        <button onClick={doExport} disabled={!!busy} className="flex items-center gap-2 px-4 py-2 text-sm" style={btn} data-testid="my-data-export"><IoDownloadOutline /> {busy === "export" ? "…" : "Télécharger mes données"}</button>
        <button onClick={doDelete} disabled={!!busy} className="flex items-center gap-2 px-4 py-2 text-sm" style={{ ...btn, color: "#ff8fa3", borderColor: "color-mix(in srgb, #ff8fa3 45%, transparent)" }} data-testid="my-data-delete"><IoTrashOutline /> {busy === "delete" ? "…" : "Supprimer mon compte"}</button>
      </div>
    </div>
  );
}

// Paramètres → Admin : traitement des signalements (décision motivée, envoyée par email)
const ST = { ouvert: "Ouvert", en_cours: "En cours", retire: "Retiré", rejete: "Rejeté" };
export function ReportsAdmin() {
  const { data: list = [], refetch, error } = useQuery({ queryKey: ["reports"], queryFn: listReports, retry: 0 });
  const [f, setF] = useState("ouvert");
  const reason = (k) => (REASONS.find((r) => r[0] === k) || [k, k])[1];
  const decide = async (r, status) => {
    let decision = "";
    if (status !== "en_cours") {
      decision = window.prompt(status === "retire" ? "Motif du retrait (envoyé à l'auteur et au signalant) :" : "Pourquoi le contenu n'est pas retiré (envoyé au signalant) :", status === "retire" ? `Contraire aux règles de la communauté (${reason(r.reason)}).` : "Après examen, ce contenu ne contrevient pas aux règles de la communauté.");
      if (decision === null) return;
    }
    try { await decideReport(r.id, { status, decision }); toast.success("Décision enregistrée"); refetch(); }
    catch (e) { toast.error(e?.response?.data?.detail || "Erreur"); }
  };
  if (error) return <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Signalements indisponibles (le serveur doit être redéployé).</p>;
  const shown = list.filter((r) => f === "tous" || (f === "ouvert" ? ["ouvert", "en_cours"].includes(r.status) : r.status === f));
  return (
    <div data-testid="reports-admin">
      <div className="flex flex-wrap gap-2 mb-3">
        {[["ouvert", "À traiter"], ["retire", "Retirés"], ["rejete", "Rejetés"], ["tous", "Tous"]].map(([k, l]) => (
          <button key={k} onClick={() => setF(k)} className="px-3 py-1 text-xs" style={{ ...btn, borderRadius: 999, ...(f === k ? { background: "var(--brand)", color: "var(--bg-primary)" } : {}) }}>{l} {k === "ouvert" ? `(${list.filter((r) => ["ouvert", "en_cours"].includes(r.status)).length})` : ""}</button>
        ))}
      </div>
      {shown.length === 0 && <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Aucun signalement.</p>}
      <div className="space-y-2">
        {shown.map((r) => (
          <div key={r.id} className="p-3" style={{ ...btn, background: "var(--bg-secondary)" }}>
            <div className="flex flex-wrap items-center gap-2 text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
              <b style={{ color: "var(--brand)" }}>{reason(r.reason)}</b><span>· {r.target_type}</span><span>· {new Date(r.created_at).toLocaleString("fr-FR")}</span><span className="mono">· {r.ref}</span><span>· {ST[r.status] || r.status}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{r.snapshot?.text || r.snapshot?.name ? `« ${r.snapshot.text || ""} » — ${r.snapshot.author_name || r.snapshot.from_name || r.snapshot.name || ""}` : (r.url || r.target_id || "—")}</p>
            {r.details && <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Précisions : {r.details}</p>}
            {r.decision && <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Décision : {r.decision}</p>}
            {["ouvert", "en_cours"].includes(r.status) && (
              <div className="flex flex-wrap gap-2 mt-2">
                <button onClick={() => decide(r, "retire")} className="px-3 py-1 text-xs" style={{ ...btn, color: "#ff8fa3" }}>Retirer le contenu</button>
                <button onClick={() => decide(r, "rejete")} className="px-3 py-1 text-xs" style={btn}>Rejeter</button>
                {r.status === "ouvert" && <button onClick={() => decide(r, "en_cours")} className="px-3 py-1 text-xs" style={btn}>En cours</button>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Paramètres → Admin : informations légales (remplissent les pages légales ; vides = phrase masquée au public)
export function LegalInfoAdmin() {
  const { data, refetch, error } = useQuery({ queryKey: ["legal-info"], queryFn: getLegalInfo, retry: 0 });
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const vals = f || { ...LEGAL, ...(data || {}) };
  const set = (k, v) => setF({ ...vals, [k]: v });
  const missing = LEGAL_FIELDS.filter(([k]) => !String(vals[k] || "").trim()).map(([, l]) => l);
  const save = async () => {
    setBusy(true);
    try { await saveLegalInfo(Object.fromEntries(LEGAL_FIELDS.map(([k]) => [k, vals[k] || ""]))); toast.success("Informations légales enregistrées"); setF(null); refetch(); }
    catch (e) { toast.error(e?.response?.status === 404 ? "Le serveur doit d'abord être redéployé" : (e?.response?.data?.detail || "Erreur")); }
    setBusy(false);
  };
  const fld = { ...btn, width: "100%", padding: "8px 10px", fontSize: 13 };
  return (
    <div data-testid="legal-info-admin">
      {error && <p className="text-xs mb-3" style={{ color: "#ffb547" }}>Serveur pas encore redéployé : tu peux préparer les champs, l'enregistrement marchera après le redéploiement.</p>}
      <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
        Ces informations remplissent les mentions légales, CGU, CGV et la politique de confidentialité. Tant qu'un champ est vide, la phrase qui l'utilise est masquée pour le public (toi, tu la vois en orange).
        {missing.length > 0 && <><br /><b style={{ color: "#ffb547" }}>À compléter : {missing.join(", ")}.</b></>}
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {LEGAL_FIELDS.map(([k, l, type]) => (
          <label key={k} className={"text-xs" + (type === "long" ? " sm:col-span-2" : "")} style={{ color: "var(--text-secondary)" }}>{l}
            {type === "tva" ? (
              <select value={vals[k] || ""} onChange={(e) => set(k, e.target.value)} style={fld} className="mt-1" data-testid={`legal-field-${k}`}>
                <option value="">— à préciser —</option><option value="franchise">Franchise en base (TVA non applicable, art. 293 B)</option><option value="assujetti">Je facture la TVA</option>
              </select>
            ) : type === "long" ? (
              <textarea rows={2} value={vals[k] || ""} onChange={(e) => set(k, e.target.value)} style={fld} className="mt-1" data-testid={`legal-field-${k}`} />
            ) : (
              <input value={vals[k] || ""} onChange={(e) => set(k, e.target.value)} style={fld} className="mt-1" data-testid={`legal-field-${k}`} />
            )}
          </label>
        ))}
      </div>
      <button onClick={save} disabled={busy} className="mt-4 px-5 py-2.5 font-semibold text-sm" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }} data-testid="legal-info-save">{busy ? "…" : "Enregistrer"}</button>
    </div>
  );
}
