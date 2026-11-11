import { useEffect, useState } from "react";
import { IoClose, IoLogoGoogle, IoMailOutline, IoHeart, IoNotifications } from "react-icons/io5";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AuthDialog() {
  const { authOpen, authMode, closeAuth, register, login, startGoogle } = useAuth();
  const [mode, setMode] = useState("login");
  useEffect(() => { if (authOpen) setMode(authMode || "login"); }, [authOpen, authMode]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!authOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "register") await register(email, password, name, birthdate, newsletter);
      else await login(email, password);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Une erreur est survenue");
    } finally { setBusy(false); }
  };

  const fld = { background: "var(--bg-primary)", border: "1px solid var(--border-c)", color: "var(--text-primary)", borderRadius: "var(--radius-base)" };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} onClick={closeAuth} data-testid="auth-dialog">
      <div className="w-full max-w-md p-6 md:p-7" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-c)", borderRadius: "18px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-1">
          <h2 className="font-display text-2xl" style={{ color: "var(--text-primary)" }}>{mode === "register" ? "Créer un compte" : "Se connecter"}</h2>
          <button data-testid="auth-close" onClick={closeAuth} style={{ color: "var(--text-secondary)" }}><IoClose size={22} /></button>
        </div>
        <p className="text-sm mb-4 flex flex-col gap-1" style={{ color: "var(--text-secondary)" }}>
          <span className="flex items-center gap-2"><IoHeart style={{ color: "var(--brand)" }} /> Garde tes favoris et préférences sur tous tes appareils</span>
          <span className="flex items-center gap-2"><IoNotifications style={{ color: "var(--brand)" }} /> Sois prévenu·e des nouveautés</span>
        </p>

        <button data-testid="auth-google" onClick={startGoogle} className="w-full flex items-center justify-center gap-2 py-3 mb-4 font-semibold transition-transform hover:scale-[1.02]"
          style={{ background: "#fff", color: "#1f1f1f", borderRadius: "var(--radius-base)" }}>
          <IoLogoGoogle size={20} /> Continuer avec Google
        </button>

        <div className="flex items-center gap-3 my-3">
          <span className="flex-1 h-px" style={{ background: "var(--border-c)" }} />
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>ou</span>
          <span className="flex-1 h-px" style={{ background: "var(--border-c)" }} />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <input data-testid="auth-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton nom / pseudo" className="w-full px-4 py-3 text-sm outline-none" style={fld} />
          )}
          <input data-testid="auth-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Adresse email" className="w-full px-4 py-3 text-sm outline-none" style={fld} />
          <input data-testid="auth-password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe (6+ caractères)" className="w-full px-4 py-3 text-sm outline-none" style={fld} />
          {mode === "register" && (<>
            <label className="block text-xs" style={{ color: "var(--text-secondary)" }}>Date de naissance — la Station est ouverte à partir de 15 ans
              <input data-testid="auth-birthdate" type="date" required value={birthdate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setBirthdate(e.target.value)} className="w-full mt-1 px-4 py-3 text-sm outline-none" style={{ ...fld, colorScheme: "dark" }} />
            </label>
            <label className="flex items-start gap-2 text-xs cursor-pointer" style={{ color: "var(--text-secondary)" }}>
              <input data-testid="auth-newsletter" type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="mt-0.5" style={{ accentColor: "var(--brand)" }} />
              <span>Je veux recevoir la newsletter de la Station (nouveautés, sorties). Désinscription en un clic dans chaque email.</span>
            </label>
            <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>En créant un compte, tu acceptes les <Link to="/legal/cgu" onClick={closeAuth} className="underline">conditions d'utilisation</Link> et la <Link to="/legal/confidentialite" onClick={closeAuth} className="underline">politique de confidentialité</Link>. Entre 15 et 17 ans, demande l'accord d'un parent.</p>
          </>)}
          <button data-testid="auth-submit" type="submit" disabled={busy} className="w-full flex items-center justify-center gap-2 py-3 font-semibold transition-transform hover:scale-[1.02]"
            style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)", opacity: busy ? 0.6 : 1 }}>
            <IoMailOutline size={18} /> {busy ? "..." : mode === "register" ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          {mode === "register" ? (
            <>Déjà un compte ? <button data-testid="auth-switch-login" onClick={() => setMode("login")} className="font-semibold" style={{ color: "var(--brand)" }}>Se connecter</button></>
          ) : (
            <>Pas encore de compte ? <button data-testid="auth-switch-register" onClick={() => setMode("register")} className="font-semibold" style={{ color: "var(--brand)" }}>Créer un compte</button></>
          )}
        </div>
        <button data-testid="auth-guest" onClick={closeAuth} className="mt-3 w-full text-center text-xs underline" style={{ color: "var(--text-secondary)" }}>
          Continuer en visiteur (sans sauvegarde)
        </button>
      </div>
    </div>
  );
}
