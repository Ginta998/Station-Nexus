import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoCheckmarkCircle, IoCloseCircle, IoHourglassOutline, IoLibraryOutline, IoHome } from "react-icons/io5";
import { useQueryClient } from "@tanstack/react-query";
import { paymentStatus } from "@/lib/api";
import Celebration from "@/components/Celebration";

const MAX_TRIES = 12;

export default function PaymentResult({ mode = "success" }) {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const qc = useQueryClient();
  const sessionId = params.get("session_id");
  const [state, setState] = useState(mode === "cancel" ? "canceled" : "checking");
  const [kind, setKind] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const tries = useRef(0);

  useEffect(() => {
    if (mode === "cancel" || !sessionId) return;
    let stop = false;
    const poll = async () => {
      try {
        const r = await paymentStatus(sessionId);
        if (stop) return;
        setKind(r.kind);
        if (r.payment_status === "paid") {
          setState("paid");
          if (r.kind === "membership") setCelebrate(true);
          qc.invalidateQueries({ queryKey: ["entitlements"] });
          qc.invalidateQueries({ queryKey: ["library"] });
          qc.invalidateQueries({ queryKey: ["creation"] });
          return;
        }
        if (["failed", "expired"].includes(r.payment_status)) { setState("failed"); return; }
      } catch (_) {}
      tries.current += 1;
      if (tries.current >= MAX_TRIES) { setState("timeout"); return; }
      setTimeout(poll, 2000);
    };
    poll();
    return () => { stop = true; };
  }, [sessionId, mode, qc]);

  const card = { background: "var(--bg-secondary)", border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)", boxShadow: "var(--shadow-1)" };
  const primary = { background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" };
  const ghost = { border: "1px solid var(--border-c)", color: "var(--text-primary)", borderRadius: "var(--radius-base)" };

  const content = {
    checking: { icon: <IoHourglassOutline size={54} style={{ color: "var(--brand)" }} className="animate-pulse" />, title: "Validation du paiement…", sub: "On confirme ta transaction, un instant." },
    paid: { icon: <IoCheckmarkCircle size={54} style={{ color: "var(--brand)" }} />, title: kind === "membership" ? "Abonnement activé ! 🎉" : "Achat réussi ! 🎉", sub: kind === "membership" ? "Tu as désormais accès à tout le catalogue payant. Merci pour ton soutien !" : "Ta création est débloquée et t'attend dans ta bibliothèque." },
    canceled: { icon: <IoCloseCircle size={54} style={{ color: "var(--text-secondary)" }} />, title: "Paiement annulé", sub: "Aucun montant n'a été prélevé. Tu peux réessayer quand tu veux." },
    failed: { icon: <IoCloseCircle size={54} style={{ color: "#ef4444" }} />, title: "Paiement échoué", sub: "Quelque chose s'est mal passé. Réessaie ou change de moyen de paiement." },
    timeout: { icon: <IoHourglassOutline size={54} style={{ color: "var(--text-secondary)" }} />, title: "Confirmation en cours", sub: "Le paiement met un peu de temps. Va voir ta bibliothèque dans un instant." },
  }[state];

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: "var(--bg-primary)" }} data-testid="payment-result">
      {celebrate && <Celebration onClose={() => setCelebrate(false)} />}
      <div className="w-full max-w-md text-center p-8" style={card}>
        <div className="flex justify-center mb-4">{content.icon}</div>
        <h1 className="font-display text-2xl mb-2" style={{ color: "var(--text-primary)" }} data-testid="payment-title">{content.title}</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>{content.sub}</p>
        <div className="flex flex-col gap-2">
          <button data-testid="payment-go-library" onClick={() => nav("/bibliotheque")} className="flex items-center justify-center gap-2 px-5 py-3 font-semibold" style={primary}>
            <IoLibraryOutline size={18} /> Ma bibliothèque
          </button>
          <button data-testid="payment-go-home" onClick={() => nav("/")} className="flex items-center justify-center gap-2 px-5 py-3" style={ghost}>
            <IoHome size={16} /> Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
