import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoSend, IoTrashOutline, IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { toast } from "sonner";
import { listComments, addComment, deleteComment } from "@/lib/api";
import { useApp } from "@/context/AppContext";

export default function CommentsSection({ creationId }) {
  const { isAdmin, sfx } = useApp();
  const { data: comments = [], refetch } = useQuery({ queryKey: ["comments", creationId], queryFn: () => listComments(creationId) });
  const [name, setName] = useState(() => localStorage.getItem("sx_cname") || "");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const fs = { background: "var(--bg-primary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" };

  const submit = async () => {
    if (!name.trim() || !text.trim()) return toast.error("Nom et commentaire requis");
    setBusy(true);
    try {
      await addComment({ creation_id: creationId, name: name.trim(), text: text.trim() });
      localStorage.setItem("sx_cname", name.trim());
      setText(""); sfx("select"); refetch();
    } catch { toast.error("Erreur"); } finally { setBusy(false); }
  };
  const remove = async (id) => { await deleteComment(id); refetch(); };

  return (
    <div className="mt-12" data-testid="comments-section">
      <h3 className="font-display text-xl mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
        <IoChatbubbleEllipsesOutline style={{ color: "var(--brand)" }} /> Commentaires <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{comments.length}</span>
      </h3>
      <p className="text-sm mb-5 max-w-xl leading-relaxed" style={{ color: "var(--text-secondary)" }} data-testid="comment-prompt">
        Ton avis compte énormément ✨ Qu'as-tu ressenti en découvrant cette création ? Partage ton émotion, ton passage préféré ou un petit mot d'encouragement — avec bienveillance et respect. Chaque message fait vivre l'univers un peu plus fort. 🌸
      </p>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input data-testid="comment-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton nom"
          className="sm:w-40 px-3 py-2 border outline-none text-sm" style={fs} />
        <input data-testid="comment-text" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Laisse un commentaire…" className="flex-1 px-3 py-2 border outline-none text-sm" style={fs} />
        <button data-testid="comment-submit" onClick={submit} disabled={busy}
          className="flex items-center justify-center gap-1.5 px-4 py-2 font-semibold text-sm" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
          <IoSend size={16} /> Publier
        </button>
      </div>

      <div className="space-y-3">
        {comments.length === 0 && <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Sois le premier à commenter.</p>}
        {comments.map((c) => (
          <div key={c.id} data-testid={`comment-${c.id}`} className="p-3 border flex items-start justify-between gap-3"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--brand)" }}>{c.name}</p>
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
