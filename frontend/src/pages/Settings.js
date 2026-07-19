import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoLockOpen, IoLockClosed, IoCheckmarkCircle } from "react-icons/io5";
import { toast } from "sonner";
import { THEMES } from "@/lib/themes";
import { useApp } from "@/context/AppContext";

export default function Settings() {
  const nav = useNavigate();
  const { theme, setTheme, isAdmin, unlock, lock, changePin, volume, setVolume } = useApp();
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");

  const tryUnlock = () => {
    if (unlock(pin)) { toast.success("Mode création déverrouillé"); setPin(""); }
    else { toast.error("PIN incorrect"); }
  };
  const savePin = () => {
    if (!/^\d{4,6}$/.test(newPin)) return toast.error("Le PIN doit contenir 4 à 6 chiffres");
    changePin(newPin);
    toast.success("PIN mis à jour");
    setNewPin("");
  };

  const fs = { background: "var(--bg-primary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" };

  return (
    <div className="relative min-h-screen w-full" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-8">
        <button data-testid="settings-back" onClick={() => nav("/")} className="flex items-center gap-2 px-3 py-2 border mb-8" style={fs}>
          <IoArrowBack /> <span className="text-sm">Retour</span>
        </button>

        <h1 className="font-display text-4xl md:text-5xl mb-2" style={{ color: "var(--text-primary)" }}>Paramètres</h1>
        <p className="mb-10" style={{ color: "var(--text-secondary)" }}>Personnalise ta station.</p>

        {/* Admin */}
        <section className="mb-12">
          <h2 className="font-display text-2xl mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            {isAdmin ? <IoLockOpen style={{ color: "var(--brand)" }} /> : <IoLockClosed />} Mode création
          </h2>
          {isAdmin ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm" style={{ color: "var(--brand)" }}><IoCheckmarkCircle /> Déverrouillé — tu peux ajouter, modifier et supprimer.</div>
              <button data-testid="lock-btn" onClick={() => { lock(); toast.success("Verrouillé"); }} className="px-5 py-2.5 border font-medium" style={fs}>Verrouiller</button>
              <div className="pt-4 border-t" style={{ borderColor: "var(--border-c)" }}>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)" }}>Changer le PIN (4 à 6 chiffres)</p>
                <div className="flex gap-2">
                  <input data-testid="new-pin-input" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} maxLength={6} inputMode="numeric" placeholder="Nouveau PIN" className="px-4 py-2.5 border outline-none" style={fs} />
                  <button data-testid="save-pin-btn" onClick={savePin} className="px-5 py-2.5 font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>Enregistrer</button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>Entre ton PIN pour débloquer la création (défaut : 1234).</p>
              <div className="flex gap-2">
                <input data-testid="pin-input" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} maxLength={6} inputMode="numeric" type="password"
                  onKeyDown={(e) => e.key === "Enter" && tryUnlock()} placeholder="PIN" className="px-4 py-2.5 border outline-none" style={fs} />
                <button data-testid="unlock-btn" onClick={tryUnlock} className="px-5 py-2.5 font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>Déverrouiller</button>
              </div>
            </div>
          )}
        </section>

        {/* Volume */}
        <section className="mb-12">
          <h2 className="font-display text-2xl mb-4" style={{ color: "var(--text-primary)" }}>Ambiance sonore</h2>
          <label className="text-xs uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Volume ({Math.round(volume * 100)}%)</label>
          <input data-testid="volume-slider" type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full mt-2" style={{ accentColor: "var(--brand)" }} />
        </section>

        {/* Themes */}
        <section>
          <h2 className="font-display text-2xl mb-4" style={{ color: "var(--text-primary)" }}>Thèmes <span style={{ color: "var(--text-secondary)" }} className="text-base">— 12 ambiances</span></h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" data-testid="theme-grid">
            {THEMES.map((t) => {
              const active = theme === t.key;
              return (
                <button
                  key={t.key}
                  data-testid={`theme-${t.key}`}
                  onClick={() => { setTheme(t.key); toast.success(`Thème ${t.name}`); }}
                  className="text-left p-4 border transition-transform hover:scale-[1.02]"
                  style={{ ...fs, background: "var(--bg-secondary)", outline: active ? "2px solid var(--brand)" : "none" }}
                >
                  <div className="flex items-center gap-1.5 mb-3">
                    {t.swatch.map((c, i) => <span key={i} className="w-5 h-5 rounded-full border" style={{ background: c, borderColor: "rgba(255,255,255,0.15)" }} />)}
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-lg" style={{ color: "var(--text-primary)" }}>{t.name}</span>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{t.kanji}</span>
                  </div>
                  <p className="text-[11px] mt-1 line-clamp-1" style={{ color: "var(--text-secondary)" }}>{t.tagline}</p>
                  {active && <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: "var(--brand)" }}><IoCheckmarkCircle /> Actif</div>}
                </button>
              );
            })}
          </div>
        </section>

        <p className="mt-12 text-xs text-center" style={{ color: "var(--text-secondary)" }}>
          Astuce : installe Stationexus sur ton écran d'accueil via le menu de ton navigateur (« Ajouter à l'écran d'accueil »).
        </p>
      </div>
    </div>
  );
}
