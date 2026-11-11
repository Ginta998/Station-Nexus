import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoClose, IoFlagOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { reportContent } from "@/lib/api";

// Signalement d'un contenu (règlement européen sur les services numériques, art. 16).
// Usage : openReport({ target_type: "chat" | "dm" | "comment", target_id, label })
export const openReport = (target) => window.dispatchEvent(new CustomEvent("nx-report", { detail: target }));

export const REASONS = [
  ["harcelement", "Harcèlement ou insultes"], ["haine", "Haine, discrimination ou menaces"], ["sexuel", "Contenu sexuel"],
  ["mineur", "Danger pour un mineur"], ["violence", "Violence ou contenu choquant"], ["spam", "Spam, arnaque ou lien douteux"],
  ["droits", "Atteinte aux droits d'auteur"], ["illegal", "Autre contenu illégal"], ["autre", "Autre"],
];

export function ReportFlag({ target, className = "p-1", size = 15, style }) {
  return <button onClick={(e) => { e.stopPropagation(); openReport(target); }} className={className} style={{ color: "var(--text-secondary)", ...style }} title="Signaler" aria-label="Signaler" data-testid={`report-${target.target_type}-${target.target_id}`}><IoFlagOutline size={size} /></button>;
}

export function ReportHost() {
  const { user } = useAuth();
  const [t, setT] = useState(null);
  const [f, setF] = useState({ reason: "", details: "", email: "", good_faith: false });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const on = (e) => { setT(e.detail); setF({ reason: "", details: "", email: "", good_faith: false }); };
    window.addEventListener("nx-report", on);
    return () => window.removeEventListener("nx-report", on);
  }, []);
  if (!t) return null;
  const needEmail = !user && f.reason !== "mineur";
  const ok = f.reason && f.good_faith && (!needEmail || /\S+@\S+\.\S+/.test(f.email));
  const send = async () => {
    setBusy(true);
    try {
      const r = await reportContent({ ...t, label: undefined, url: window.location.href, ...f });
      toast.success(`Signalement envoyé (réf. ${r.ref}). Merci !`); setT(null);
    } catch (e) { toast.error(e?.response?.data?.detail || "Envoi impossible. Écris-nous par email si besoin."); }
    setBusy(false);
  };
  return (
    <div className="ck-wrap" onClick={() => setT(null)} data-testid="report-dialog">
      <div className="ck-box" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="rp-t">
        <button className="ck-x" onClick={() => setT(null)} aria-label="Fermer"><IoClose size={18} /></button>
        <p className="ck-k mono">SIGNALER UN CONTENU</p>
        <h2 id="rp-t">Qu'est-ce qui ne va pas ?</h2>
        {t.label && <p className="rp-quote">« {t.label.slice(0, 160)} »</p>}
        <div className="rp-reasons">{REASONS.map(([k, l]) => <button key={k} className={f.reason === k ? "on" : ""} onClick={() => setF({ ...f, reason: k })} data-testid={`report-reason-${k}`}>{l}</button>)}</div>
        <textarea className="ag-in" rows={3} placeholder="Explique en quelques mots (facultatif)" value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} />
        {!user && <input className="ag-in" type="email" placeholder={f.reason === "mineur" ? "Ton email (facultatif)" : "Ton email, pour te répondre"} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />}
        <label className="ck-chk"><input type="checkbox" checked={f.good_faith} onChange={(e) => setF({ ...f, good_faith: e.target.checked })} data-testid="report-good-faith" /><span>Je signale ce contenu de bonne foi, en pensant qu'il enfreint la loi ou les <Link to="/legal/communaute" target="_blank">règles de la communauté</Link>.</span></label>
        <button className="ck-go" disabled={!ok || busy} onClick={send} data-testid="report-send">{busy ? "Envoi…" : "Envoyer le signalement"}</button>
        <p className="lg-small" style={{ textAlign: "center", marginTop: 8 }}>Danger immédiat ? Appelle le 17. Cyberharcèlement : 3018 (gratuit).</p>
      </div>
    </div>
  );
}
