import { useQuery } from "@tanstack/react-query";
import { IoClose, IoLogInOutline, IoPersonAddOutline } from "react-icons/io5";
import { getSettings } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// Message jovial de Bunny qui invite à créer un compte / se connecter avant de lancer une création.
export default function LaunchGate({ onClose }) {
  const { openAuth } = useAuth();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const title = settings?.launch_gate_title || "Rejoins l'aventure ! 🚀";
  const body = settings?.launch_gate_body || "Crée un compte gratuit pour lancer les créations et être prévenu·e des sorties ✨";
  const bunny = settings?.cosmic_bunny_image || "/cosmic-bunny/excited.png";
  const auth = () => { onClose?.(); openAuth(); };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-5" data-testid="launch-gate" style={{ background: "rgba(8,6,12,0.75)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div className="relative w-full max-w-sm text-center px-6 py-8 sx-celebrate-pop" onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-secondary)", border: "1px solid var(--brand)", borderRadius: "var(--radius-lg, 18px)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        <button data-testid="launch-gate-close" onClick={onClose} className="absolute top-3 right-3 p-1.5" style={{ color: "var(--text-secondary)" }}><IoClose size={22} /></button>
        <div className="flex justify-center mb-3">
          <div className="sx-celebrate-bounce" style={{ width: 108, height: 108, borderRadius: "50%", overflow: "hidden", border: "3px solid var(--brand)", boxShadow: "0 0 24px color-mix(in srgb, var(--brand) 40%, transparent)" }}>
            <img src={bunny} alt="Cosmic Bunny" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/cosmic-bunny/wave.png"; }} />
          </div>
        </div>
        <h2 className="font-display text-2xl mb-2 leading-tight" style={{ color: "var(--brand)" }} data-testid="launch-gate-title">{title}</h2>
        <p className="text-sm leading-relaxed whitespace-pre-line mb-6" style={{ color: "var(--text-primary)" }} data-testid="launch-gate-body">{body}</p>
        <div className="flex flex-col gap-2">
          <button data-testid="launch-gate-register" onClick={auth} className="flex items-center justify-center gap-2 px-5 py-3 font-semibold transition-transform hover:scale-105" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
            <IoPersonAddOutline size={18} /> Créer un compte
          </button>
          <button data-testid="launch-gate-login" onClick={auth} className="flex items-center justify-center gap-2 px-5 py-3 font-medium border transition-transform hover:scale-105" style={{ borderColor: "var(--border-c)", color: "var(--text-primary)", borderRadius: "var(--radius-base)" }}>
            <IoLogInOutline size={18} /> J'ai déjà un compte
          </button>
        </div>
      </div>
    </div>
  );
}
