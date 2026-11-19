/*
  L'étagère du visiteur : ce qu'il a terminé, ce qu'il a commencé, les films qu'il a lancés.
  Tout reste dans son navigateur (comme sa progression de lecture), sans compte nécessaire.
*/
const get = (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } };
const set = (k, v) => { try { localStorage.setItem(k, v); } catch (_) { /* navigation privée */ } };

export const markDone = (id) => set("sx_done_" + id, String(Date.now()));
export const unmarkDone = (id) => { try { localStorage.removeItem("sx_done_" + id); } catch (_) { /* rien */ } };
export const markSeen = (id) => { if (!get("sx_seen_" + id)) set("sx_seen_" + id, String(Date.now())); };

// l'état d'une œuvre pour ce visiteur : done (terminée), reading (commencée), seen (film lancé), ou rien
export function shelfState(c) {
  const done = Number(get("sx_done_" + c.id) || 0);
  if (done) return { st: "done", at: done };
  let p = null;
  try { p = JSON.parse(get("sx_progress_" + c.id) || get("sx_progress_" + c.id + "_ep") || "null"); } catch (_) { p = null; }
  if (p) {
    const total = (c.launch_type === "chapters" ? c.chapters_count ?? c.chapters?.length : c.episodes?.length) || 0;
    return { st: "reading", at: p.t || 0, unit: (p.chapter ?? 0) + 1, total, ratio: total ? Math.min(1, ((p.chapter ?? 0) + (p.ratio || 0)) / total) : p.ratio || 0 };
  }
  const seen = Number(get("sx_seen_" + c.id) || 0);
  if (seen) return { st: "seen", at: seen };
  return null;
}
