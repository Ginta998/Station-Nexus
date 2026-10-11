import { IoClose, IoGridOutline, IoAppsOutline, IoListOutline } from "react-icons/io5";
import { useApp } from "@/context/AppContext";

const Seg = ({ value, onChange, options, testid }) => (
  <div className="flex gap-1.5 flex-wrap" data-testid={testid}>
    {options.map((o) => {
      const active = value === o.v;
      return (
        <button key={o.v} data-testid={`${testid}-${o.v}`} onClick={() => onChange(o.v)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-all"
          style={{ borderRadius: "999px", color: active ? "var(--bg-primary)" : "var(--text-secondary)", background: active ? "var(--brand)" : "var(--bg-secondary)", border: "1px solid " + (active ? "var(--brand)" : "var(--border-c)") }}>
          {o.Icon && <o.Icon size={15} />} {o.label}
        </button>
      );
    })}
  </div>
);

export default function HomeCustomizer({ open, onClose, isAdmin, onSaveDefault, saving }) {
  const { layout, setLayout, posterSize, setPosterSize, cardTagline, setCardTagline, sfx } = useApp();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex justify-end" data-testid="home-customizer">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }} onClick={onClose} />
      <div className="relative h-full w-full max-w-md overflow-y-auto" style={{ background: "var(--bg-primary)", borderLeft: "1px solid var(--border-c)", animation: "slideInRight .3s ease" }}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{ background: "var(--bg-primary)", borderBottom: "1px solid var(--border-c)" }}>
          <h3 className="font-display text-xl" style={{ color: "var(--text-primary)" }}>Personnaliser l'accueil</h3>
          <button data-testid="customizer-close" onClick={onClose} className="p-2" style={{ color: "var(--text-secondary)" }}><IoClose size={22} /></button>
        </div>

        <div className="px-5 py-5 space-y-6">
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Affichage</p>
            <Seg testid="cfg-layout" value={layout} onChange={(v) => { setLayout(v); sfx("nav"); }} options={[
              { v: "card", label: "Cartes", Icon: IoAppsOutline },
              { v: "grid", label: "Grille", Icon: IoGridOutline },
              { v: "list", label: "Liste", Icon: IoListOutline },
            ]} />
          </div>
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Taille des affiches</p>
            <Seg testid="cfg-poster" value={posterSize} onChange={(v) => { setPosterSize(v); sfx("nav"); }} options={[
              { v: "compact", label: "Compact" },
              { v: "normal", label: "Normal" },
              { v: "grand", label: "Grand" },
            ]} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Afficher les descriptions sur les cartes</p>
            <button data-testid="cfg-tagline" onClick={() => { setCardTagline(!cardTagline); sfx("nav"); }}
              className="relative w-12 h-7 rounded-full transition-colors" style={{ background: cardTagline ? "var(--brand)" : "var(--bg-secondary)", border: "1px solid var(--border-c)" }}>
              <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all" style={{ background: "#fff", left: cardTagline ? "calc(100% - 22px)" : "2px" }} />
            </button>
          </div>

          {isAdmin && (
            <div className="pt-4" style={{ borderTop: "1px solid var(--border-c)" }}>
              <button data-testid="customizer-save-default" onClick={onSaveDefault} disabled={saving}
                className="w-full py-3 font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Enregistrement…" : "Définir la taille des affiches par défaut pour tous"}
              </button>
            </div>
          )}
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Tes réglages sont enregistrés sur cet appareil.{isAdmin ? " En admin, tu peux définir la taille des affiches par défaut pour tout le monde." : ""}</p>
        </div>
      </div>
    </div>
  );
}
