import { IoClose, IoCheckmark } from "react-icons/io5";
import { PAGE_CATALOG } from "@/lib/homeShelves";

const Seg = ({ value, onChange, options, testid }) => (
  <div className="flex gap-1.5 flex-wrap" data-testid={testid}>
    {options.map((o) => {
      const active = value === o.v;
      return (
        <button key={o.v} data-testid={`${testid}-${o.v}`} onClick={() => onChange(o.v)}
          className="px-3.5 py-2 text-sm font-semibold transition-all"
          style={{ borderRadius: "999px", color: active ? "var(--bg-primary)" : "var(--text-secondary)", background: active ? "var(--brand)" : "var(--bg-secondary)", border: "1px solid " + (active ? "var(--brand)" : "var(--border-c)") }}>
          {o.label}
        </button>
      );
    })}
  </div>
);

export default function HomeCustomizer({ open, onClose, cfg, setCfg, shelves, setShelves, isAdmin, onSaveDefault, saving }) {
  if (!open) return null;
  const toggleShelf = (k) => setShelves(shelves.includes(k) ? shelves.filter((x) => x !== k) : [...shelves, k]);
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
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Taille de la grande tuile</p>
            <Seg testid="cfg-hero" value={cfg.heroSize} onChange={(v) => setCfg({ heroSize: v })} options={[{ v: "s", label: "Petite" }, { v: "m", label: "Moyenne" }, { v: "l", label: "Grande" }]} />
          </div>
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Taille des jaquettes</p>
            <Seg testid="cfg-card" value={cfg.cardSize} onChange={(v) => setCfg({ cardSize: v })} options={[{ v: "s", label: "Petites" }, { v: "m", label: "Moyennes" }, { v: "l", label: "Grandes" }]} />
          </div>
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Espacement</p>
            <Seg testid="cfg-density" value={cfg.density} onChange={(v) => setCfg({ density: v })} options={[{ v: "compact", label: "Compact" }, { v: "normal", label: "Normal" }, { v: "spacious", label: "Aéré" }]} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Afficher les titres sur les cartes</p>
            <button data-testid="cfg-titles" onClick={() => setCfg({ showTitles: !cfg.showTitles })}
              className="relative w-12 h-7 rounded-full transition-colors" style={{ background: cfg.showTitles ? "var(--brand)" : "var(--bg-secondary)", border: "1px solid var(--border-c)" }}>
              <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all" style={{ background: "#fff", left: cfg.showTitles ? "calc(100% - 22px)" : "2px" }} />
            </button>
          </div>

          {isAdmin && (
            <div className="pt-4" style={{ borderTop: "1px solid var(--border-c)" }}>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Rangées (pages) en bas</p>
              <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>Choisis les pages affichées comme raccourcis (Soutenir, Membres, Nouveautés…).</p>
              <div className="grid grid-cols-2 gap-2">
                {PAGE_CATALOG.map((p) => {
                  const on = shelves.includes(p.key);
                  return (
                    <button key={p.key} data-testid={`cfg-shelf-${p.key}`} onClick={() => toggleShelf(p.key)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-left"
                      style={{ borderRadius: "var(--radius-base)", border: "1px solid " + (on ? "var(--brand)" : "var(--border-c)"), background: on ? "color-mix(in srgb, var(--brand) 14%, var(--bg-secondary))" : "var(--bg-secondary)", color: "var(--text-primary)" }}>
                      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 4, background: on ? "var(--brand)" : "transparent", border: "1px solid " + (on ? "var(--brand)" : "var(--border-c)") }}>{on && <IoCheckmark size={12} style={{ color: "var(--bg-primary)" }} />}</span>
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <button data-testid="customizer-save-default" onClick={onSaveDefault} disabled={saving}
                className="mt-5 w-full py-3 font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Enregistrement…" : "Définir par défaut pour tous les visiteurs"}
              </button>
            </div>
          )}
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Tes réglages sont enregistrés sur cet appareil.{isAdmin ? " En tant qu'admin, tu peux aussi les définir par défaut pour tout le monde." : ""}</p>
        </div>
      </div>
    </div>
  );
}
