import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoSend, IoTrashOutline, IoReturnDownForward, IoClose } from "react-icons/io5";
import { toast } from "sonner";
import { listComments, addComment, deleteComment } from "@/lib/api";
import { ReportFlag } from "@/components/ReportDialog";
import { useApp } from "@/context/AppContext";
import AutoTextarea from "@/components/AutoTextarea";

/*
  Les commentaires d'une œuvre, dessinés par le thème du monde (lettre scellée, terminal, bulle, carnet…).
  On peut répondre à un commentaire (un niveau de réponse) ; la réponse du créateur porte la marque « Auteur ».
*/
const ago = (iso) => { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }); };
const TITLES = { vhs: "MESSAGES REÇUS", arcade: "HIGH SCORES · MESSAGES", yorha: "Journal des transmissions", cathedrale: "Lettres", couronne: "Paroles des visiteurs", trait: "Le courrier des lecteurs", sengoku: "Paroles", survivance: "Notes laissées", cristal: "Échos", cinema: "Le mot des spectateurs", eve: "Signaux", hero: "Messages de l'équipe" };

export default function WorldComments({ creationId, units = [], term = "Chapitre", ws }) {
  const { isAdmin, sfx, profile } = useApp();
  const { data: comments = [], refetch } = useQuery({ queryKey: ["comments", creationId], queryFn: () => listComments(creationId) });
  const [name, setName] = useState(() => { try { return localStorage.getItem("sx_cname") || profile?.name || ""; } catch (_) { return profile?.name || ""; } });
  const [text, setText] = useState("");
  const [reply, setReply] = useState(null); // commentaire auquel on répond
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);
  const [target, setTarget] = useState(-1);
  const [filter, setFilter] = useState("all");
  const hasUnits = units.length > 0;
  const unitLabel = (i) => units[i]?.title || `${term} ${i + 1}`;

  // fils : les commentaires principaux, du plus récent au plus ancien ; leurs réponses dans l'ordre
  const threads = useMemo(() => {
    const top = comments.filter((c) => !c.parent_id);
    const kids = (id) => comments.filter((c) => c.parent_id === id).sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
    return top.filter((c) => filter === "all" || String(c.episode_index ?? -1) === filter).map((c) => ({ c, replies: kids(c.id) }));
  }, [comments, filter]);

  const send = async (payload, done) => {
    if (!name.trim() || !payload.text.trim()) { toast.error("Ton nom et ton message"); return; }
    setBusy(true);
    try {
      await addComment({ creation_id: creationId, name: name.trim(), ...payload, text: payload.text.trim() });
      try { localStorage.setItem("sx_cname", name.trim()); } catch (_) {}
      sfx("select"); done(); refetch();
    } catch (_) { toast.error("Envoi impossible"); }
    setBusy(false);
  };
  const remove = async (id) => { await deleteComment(id); refetch(); };

  const One = ({ c, child }) => (
    <article className={"wc-item" + (child ? " child" : "") + (c.is_author ? " author" : "")} data-testid={`wc-${c.id}`}>
      <header className="wc-h">
        <span className="wc-av" aria-hidden="true">{(c.name || "?").trim()[0]?.toUpperCase()}</span>
        <b className="wc-name">{c.name}</b>
        {c.is_author && <em className="wc-badge">AUTEUR</em>}
        {c.episode_index >= 0 && !child && <span className="wc-unit">{c.episode_label || unitLabel(c.episode_index)}</span>}
        <time className="wc-date">{ago(c.created_at)}</time>
      </header>
      <p className="wc-text">{c.text}</p>
      <footer className="wc-f">
        {!child && <button type="button" onClick={() => { setReply(reply?.id === c.id ? null : c); setReplyText(""); }} data-testid={`wc-reply-${c.id}`}><IoReturnDownForward size={14} /> Répondre</button>}
        <ReportFlag target={{ target_type: "comment", target_id: c.id, label: c.text }} size={14} className="wc-rep" style={{ color: "inherit" }} />
        {isAdmin && <button type="button" onClick={() => remove(c.id)} aria-label="Supprimer" data-testid={`wc-del-${c.id}`}><IoTrashOutline size={14} /></button>}
      </footer>
    </article>
  );

  return (
    <div className={"wc wc-" + ws} id="commentaires" data-testid="world-comments">
      <header className="wc-top">
        <h2>{TITLES[ws] || "Commentaires"}</h2>
        <span className="wc-count">{comments.length}</span>
      </header>
      <p className="wc-intro">Ton avis compte : un passage, une émotion, un encouragement. Avec bienveillance.</p>

      <div className="wc-form" data-testid="wc-form">
        <input className="wc-in name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton nom" maxLength={40} data-testid="wc-name" />
        {hasUnits && (
          <select className="wc-in" value={target} onChange={(e) => setTarget(Number(e.target.value))} aria-label="À propos de">
            <option value={-1}>L'œuvre en général</option>
            {units.map((u, i) => <option key={i} value={i}>{unitLabel(i)}</option>)}
          </select>
        )}
        <AutoTextarea className="wc-in text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Laisse un mot à l'auteur…" data-testid="wc-text"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send({ text, episode_index: hasUnits ? target : -1, episode_label: hasUnits && target >= 0 ? unitLabel(target) : "" }, () => setText("")); } }} />
        <button type="button" className="wc-send" disabled={busy} onClick={() => send({ text, episode_index: hasUnits ? target : -1, episode_label: hasUnits && target >= 0 ? unitLabel(target) : "" }, () => setText(""))} data-testid="wc-send"><IoSend size={15} /> Publier</button>
      </div>

      {hasUnits && comments.length > 0 && (
        <div className="wc-filters" role="tablist">
          <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>Tout</button>
          <button className={filter === "-1" ? "on" : ""} onClick={() => setFilter("-1")}>Général</button>
          {units.map((u, i) => comments.some((c) => c.episode_index === i && !c.parent_id) && <button key={i} className={filter === String(i) ? "on" : ""} onClick={() => setFilter(String(i))}>{unitLabel(i)}</button>)}
        </div>
      )}

      <div className="wc-list">
        {threads.length === 0 && <p className="wc-empty">Aucun message pour l'instant. Le premier mot est pour toi.</p>}
        {threads.map(({ c, replies }) => (
          <div className="wc-thread" key={c.id}>
            {One({ c })}
            {replies.map((r) => <div key={r.id}>{One({ c: r, child: true })}</div>)}
            {reply?.id === c.id && (
              <div className="wc-replyform" data-testid="wc-replyform">
                <span className="wc-to">Réponse à {c.name}<button type="button" onClick={() => setReply(null)} aria-label="Annuler"><IoClose size={14} /></button></span>
                {!name.trim() && <input className="wc-in name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton nom" maxLength={40} data-testid="wc-reply-name" />}
                <AutoTextarea className="wc-in text" autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={`Répondre à ${c.name}…`} data-testid="wc-reply-text"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send({ text: replyText, parent_id: c.id, episode_index: c.episode_index ?? -1 }, () => { setReply(null); setReplyText(""); }); } }} />
                <button type="button" className="wc-send" disabled={busy} onClick={() => send({ text: replyText, parent_id: c.id, episode_index: c.episode_index ?? -1 }, () => { setReply(null); setReplyText(""); })} data-testid="wc-reply-send"><IoSend size={14} /> Répondre</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
