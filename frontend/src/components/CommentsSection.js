import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoSend, IoTrashOutline, IoChatbubbleEllipsesOutline, IoTvOutline } from "react-icons/io5";
import { toast } from "sonner";
import { listComments, addComment, deleteComment } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import AutoTextarea from "@/components/AutoTextarea";

export default function CommentsSection({ creationId, units = [], term = "Épisode" }) {
  const { isAdmin, sfx } = useApp();
  const { data: comments = [], refetch } = useQuery({ queryKey: ["comments", creationId], queryFn: () => listComments(creationId) });
  const [name, setName] = useState(() => localStorage.getItem("sx_cname") || "");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const hasUnits = units && units.length > 0;
  const [target, setTarget] = useState(-1); // -1 = général, sinon index d'unité
  const [filter, setFilter] = useState("all"); // "all" | "-1" | "<index>"

  const fs = { background: "var(--bg-primary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" };
  const unitLabel = (i) => (units[i]?.title ? units[i].title : `${term} ${i + 1}`);

  const shown = useMemo(() => {
    if (!hasUnits || filter === "all") return comments;
    const f = Number(filter);
    return comments.filter((c) => (c.episode_index ?? -1) === f);
  }, [comments, filter, hasUnits]);

  const submit = async () => {
    if (!name.trim() || !text.trim()) return toast.error("Nom et commentaire requis");
    setBusy(true);
    try {
      await addComment({
        creation_id: creationId,
        name: name.trim(),
        text: text.trim(),
        episode_index: hasUnits ? target : -1,
        episode_label: hasUnits && target >= 0 ? unitLabel(target) : "",
      });
      localStorage.setItem("sx_cname", name.trim());
      setText(""); sfx("select"); refetch();
    } catch { toast.error("Erreur"); } finally { setBusy(false); }
  };
  const remove = async (id) => { await deleteComment(id); refetch(); };

  return (
    <div className="mt-12" data-testid="comments-section">
      <h3 className="font-display text-xl mb-2 flex items-center gap-2" style={{ color: "#fff" }}>
        <IoChatbubbleEllipsesOutline style={{ color: "var(--brand)" }} /> Commentaires <span className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{comments.length}</span>
      </h3>
      <p className="text-sm mb-5 max-w-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }} data-testid="comment-prompt">
        Ton avis compte énormément ✨ Qu'as-tu ressenti en découvrant cette création ? Partage ton émotion, ton passage préféré ou un petit mot d'encouragement — avec bienveillance et respect. Chaque message fait vivre l'univers un peu plus fort. 🌸
      </p>

      {hasUnits && (
        <div className="mb-4">
          <label className="block text-xs uppercase tracking-widest mb-1.5 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
            <IoTvOutline size={13} style={{ color: "var(--brand)" }} /> À propos de
          </label>
          <select data-testid="comment-episode-select" value={target} onChange={(e) => setTarget(Number(e.target.value))}
            className="w-full sm:w-80 px-3 py-2 border outline-none text-sm" style={fs}>
            <option value={-1}>💬 Commentaire général</option>
            {units.map((u, i) => (
              <option key={i} value={i}>{String(i + 1).padStart(2, "0")} · {unitLabel(i)}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-6 items-start">
        <input data-testid="comment-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton nom"
          className="sm:w-40 px-3 py-2 border outline-none text-sm" style={fs} />
        <AutoTextarea data-testid="comment-text" value={text} maxHeight={200} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder="Laisse un commentaire… (Entrée pour publier, Maj+Entrée pour un retour à la ligne)" className="w-full sm:flex-1 px-3 py-2 border outline-none text-sm" style={fs} />
        <button data-testid="comment-submit" onClick={submit} disabled={busy}
          className="flex items-center justify-center gap-1.5 px-4 py-2 font-semibold text-sm flex-shrink-0" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
          <IoSend size={16} /> Publier
        </button>
      </div>

      {hasUnits && (
        <div className="flex items-center gap-2 flex-wrap mb-5" data-testid="comment-filter">
          <button onClick={() => setFilter("all")} data-testid="comment-filter-all"
            className="px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{ borderRadius: "999px", border: "1px solid var(--border-c)", background: filter === "all" ? "var(--brand)" : "transparent", color: filter === "all" ? "var(--bg-primary)" : "rgba(255,255,255,0.8)" }}>Tout</button>
          <button onClick={() => setFilter("-1")} data-testid="comment-filter-general"
            className="px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{ borderRadius: "999px", border: "1px solid var(--border-c)", background: filter === "-1" ? "var(--brand)" : "transparent", color: filter === "-1" ? "var(--bg-primary)" : "rgba(255,255,255,0.8)" }}>Général</button>
          {units.map((u, i) => (
            <button key={i} onClick={() => setFilter(String(i))} data-testid={`comment-filter-ep-${i}`}
              className="px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{ borderRadius: "999px", border: "1px solid var(--border-c)", background: filter === String(i) ? "var(--brand)" : "transparent", color: filter === String(i) ? "var(--bg-primary)" : "rgba(255,255,255,0.8)" }}>{String(i + 1).padStart(2, "0")}</button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {shown.length === 0 && <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Aucun commentaire ici pour le moment.</p>}
        {shown.map((c) => (
          <div key={c.id} data-testid={`comment-${c.id}`} className="p-3 border flex items-start justify-between gap-3"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold" style={{ color: "var(--brand)" }}>{c.name}</p>
                {(c.episode_index ?? -1) >= 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--brand) 20%, transparent)", color: "var(--brand)", borderRadius: 4 }}>
                    <IoTvOutline size={10} /> {c.episode_label || unitLabel(c.episode_index)}
                  </span>
                )}
              </div>
              <p className="text-sm mt-0.5 whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{c.text}</p>
              <p className="text-[10px] mt-1" style={{ color: "var(--text-secondary)" }}>{new Date(c.created_at).toLocaleDateString("fr-FR")}</p>
            </div>
            {isAdmin && (
              <button data-testid={`comment-delete-${c.id}`} onClick={() => remove(c.id)} style={{ color: "var(--brand)" }}><IoTrashOutline size={16} /></button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
