import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const fmt = (iso) => new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

// historique des 10 dernières versions d'une création, restaurables en un clic
export default function VersionHistory({ creationId, onRestored }) {
  const [list, setList] = useState(null);
  const [busy, setBusy] = useState("");
  const load = () => api.get(`/creations/${creationId}/versions`).then((r) => setList(r.data)).catch(() => setList([]));
  useEffect(() => { load(); }, [creationId]); // eslint-disable-line

  const restore = async (v) => {
    if (!window.confirm(`Revenir à la version du ${fmt(v.saved_at)} ? La version actuelle restera dans l'historique.`)) return;
    setBusy(v.id);
    try {
      const r = await api.post(`/creations/${creationId}/versions/${v.id}/restore`, {}, { timeout: 120000 });
      toast.success("Version restaurée"); onRestored?.(r.data); load();
    } catch { toast.error("Restauration impossible"); }
    setBusy("");
  };

  return (
    <div className="p-5 border-b" style={{ borderColor: "var(--border-c)" }} data-testid="version-history">
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--brand)" }}>Historique — 10 dernières versions</p>
      {list === null && <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Chargement…</p>}
      {list?.length === 0 && <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Aucune version enregistrée pour l'instant : elles apparaîtront à chaque modification.</p>}
      <div className="flex flex-col gap-2">
        {list?.map((v) => (
          <div key={v.id} className="flex items-center justify-between gap-3 px-3 py-2 border text-sm" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)" }} data-testid={`version-${v.id}`}>
            <span>{fmt(v.saved_at)} <span style={{ color: "var(--text-secondary)" }}>· {v.episodes_count} épisode(s) · {v.chapters_count} chapitre(s)</span></span>
            <button onClick={() => restore(v)} disabled={!!busy} className="px-3 py-1 border text-xs" style={{ borderColor: "var(--brand)", color: "var(--brand)", borderRadius: "var(--radius-base)" }} data-testid={`version-restore-${v.id}`}>
              {busy === v.id ? "…" : "Restaurer"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
