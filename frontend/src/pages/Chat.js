import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { IoArrowBack, IoHome, IoSend, IoImageOutline, IoBarChartOutline, IoTrashOutline, IoClose, IoAddOutline, IoHappyOutline, IoBanOutline, IoVolumeMuteOutline, IoLockClosed, IoPeople, IoSparkles, IoCheckmarkCircle } from "react-icons/io5";
import { chatStatus, chatMessages, chatPost, chatDelete, chatReact, chatVote, chatPing, chatModerate, chatUpload, assetUrl } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import MobileMenu from "@/components/MobileMenu";

const REACTIONS = ["❤️", "😂", "🔥", "👍", "😮", "🎉"];
const btn = { border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)", background: "var(--bg-secondary)" };

const Avatar = ({ name, avatar, size = 40 }) => (
  <div className="rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ width: size, height: size, border: "1.5px solid var(--brand)", background: "var(--bg-secondary)" }}>
    {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : <span className="font-display" style={{ color: "var(--brand)", fontSize: size * 0.42 }}>{(name || "?")[0].toUpperCase()}</span>}
  </div>
);

const renderText = (text) => (text || "").split(/(\s+)/).map((w, i) =>
  w.startsWith("@") && w.length > 1
    ? <span key={i} style={{ color: "var(--brand)", fontWeight: 600 }}>{w}</span>
    : <span key={i}>{w}</span>);

function Poll({ msg, uid, onVote }) {
  const poll = msg.poll;
  const total = poll.options.reduce((s, o) => s + (o.votes?.length || 0), 0);
  return (
    <div className="mt-1" data-testid={`chat-poll-${msg.id}`}>
      <p className="font-semibold mb-2 flex items-center gap-1.5"><IoBarChartOutline style={{ color: "var(--brand)" }} /> {poll.question}</p>
      <div className="space-y-1.5">
        {poll.options.map((o, i) => {
          const votes = o.votes?.length || 0;
          const pct = total ? Math.round((votes / total) * 100) : 0;
          const mine = (o.votes || []).includes(uid);
          return (
            <button key={i} onClick={() => onVote(msg.id, i)} data-testid={`chat-poll-opt-${msg.id}-${i}`}
              className="relative w-full text-left px-3 py-2 overflow-hidden transition-transform hover:scale-[1.01]"
              style={{ border: `1px solid ${mine ? "var(--brand)" : "var(--border-c)"}`, borderRadius: "var(--radius-base)", background: "var(--bg-primary)" }}>
              <div className="absolute inset-0" style={{ width: `${pct}%`, background: "color-mix(in srgb, var(--brand) 22%, transparent)" }} />
              <div className="relative flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-1.5">{mine && <IoCheckmarkCircle style={{ color: "var(--brand)" }} />}{o.text}</span>
                <span style={{ color: "var(--text-secondary)" }}>{pct}% · {votes}</span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs mt-1.5" style={{ color: "var(--text-secondary)" }}>{total} vote{total > 1 ? "s" : ""}</p>
    </div>
  );
}

export default function Chat() {
  const nav = useNavigate();
  const { sfx } = useApp();
  const { user, openAuth } = useAuth();
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState(0);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [emojiFor, setEmojiFor] = useState(null);
  const [pollMode, setPollMode] = useState(false);
  const [poll, setPoll] = useState({ question: "", options: ["", ""] });
  const [modFor, setModFor] = useState(null);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const lastTs = useRef(null);
  const nearBottom = useRef(true);
  const initialLoaded = useRef(false);

  const uid = user?.id;
  const isAdmin = status?.is_admin;
  const canRead = status?.can_read;

  const scrollToBottom = () => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; };

  const merge = useCallback((incoming, isPoll) => {
    if (!incoming?.length) return;
    setMessages((prev) => {
      const map = new Map(prev.map((m) => [m.id, m]));
      let hasNew = false;
      incoming.forEach((m) => { if (!map.has(m.id)) hasNew = true; map.set(m.id, m); });
      const arr = Array.from(map.values()).sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
      lastTs.current = arr[arr.length - 1]?.created_at || lastTs.current;
      // sound on incoming from others
      if (initialLoaded.current && hasNew) {
        const newest = incoming[incoming.length - 1];
        if (newest && newest.author_id !== uid) { try { sfx("select"); } catch {} }
      }
      return arr;
    });
  }, [uid, sfx]);

  // initial load + status
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const st = await chatStatus();
        if (!alive) return;
        setStatus(st);
        if (st.can_read) {
          const msgs = await chatMessages();
          if (!alive) return;
          setMessages(msgs);
          lastTs.current = msgs[msgs.length - 1]?.created_at || null;
          setTimeout(scrollToBottom, 60);
          setTimeout(() => { initialLoaded.current = true; }, 400);
        }
      } catch (e) {
        if (e?.response?.status === 401) setStatus({ can_read: false, need_login: true });
      }
    })();
    return () => { alive = false; };
  }, [user]);

  // polling messages + presence
  useEffect(() => {
    if (!canRead) return;
    const poll1 = setInterval(async () => {
      if (document.hidden) return;
      try { const msgs = await chatMessages(lastTs.current); merge(msgs); if (nearBottom.current) setTimeout(scrollToBottom, 40); } catch {}
    }, 2500);
    const ping = async () => { try { const r = await chatPing(); setOnline(r.count); } catch {} };
    ping();
    const poll2 = setInterval(ping, 20000);
    return () => { clearInterval(poll1); clearInterval(poll2); };
  }, [canRead, merge]);

  const onScroll = () => { const el = scrollRef.current; if (!el) return; nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120; };

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setSending(true);
    try { const m = await chatPost({ text: t }); setText(""); merge([m]); setTimeout(scrollToBottom, 40); sfx("select"); }
    catch (e) { toast.error(e?.response?.data?.detail || "Erreur d'envoi"); }
    finally { setSending(false); }
  };

  const sendImage = async (file) => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) return toast.error("Image trop lourde (max 12 Mo)");
    try { const up = await chatUpload(file); const m = await chatPost({ image_id: up.id }); merge([m]); setTimeout(scrollToBottom, 40); sfx("select"); }
    catch (e) { toast.error("Échec de l'envoi de l'image"); }
  };

  const sendPoll = async () => {
    const opts = poll.options.map((o) => o.trim()).filter(Boolean);
    if (!poll.question.trim() || opts.length < 2) return toast.error("Une question et au moins 2 options");
    try { const m = await chatPost({ poll: { question: poll.question, options: opts, multi: false } }); merge([m]); setPoll({ question: "", options: ["", ""] }); setPollMode(false); setTimeout(scrollToBottom, 40); sfx("select"); }
    catch { toast.error("Erreur sondage"); }
  };

  const react = async (mid, emoji) => {
    setEmojiFor(null);
    try { const r = await chatReact(mid, emoji); setMessages((prev) => prev.map((m) => m.id === mid ? { ...m, reactions: r.reactions } : m)); }
    catch {}
  };
  const vote = async (mid, opt) => {
    try { const r = await chatVote(mid, opt); setMessages((prev) => prev.map((m) => m.id === mid ? { ...m, poll: r.poll } : m)); }
    catch {}
  };
  const del = async (mid) => { try { await chatDelete(mid); setMessages((prev) => prev.filter((m) => m.id !== mid)); toast.success("Message supprimé"); } catch {} };
  const moderate = async (userId, action) => {
    setModFor(null);
    try { await chatModerate(userId, action); toast.success({ ban: "Membre banni", unban: "Ban levé", mute: "Membre en sourdine", unmute: "Sourdine levée" }[action]); }
    catch { toast.error("Action impossible"); }
  };

  // ---- Access gates ----
  if (status && !canRead) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }} data-testid="chat-locked">
        <Header nav={nav} sfx={sfx} online={0} showOnline={false} />
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="max-w-md text-center p-8" style={{ background: "var(--bg-secondary)", border: "1px solid var(--brand)", borderRadius: "var(--radius-base)" }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--brand) 18%, transparent)", border: "1.5px solid var(--brand)" }}>
              <IoLockClosed size={30} style={{ color: "var(--brand)" }} />
            </div>
            <h1 className="font-display text-2xl md:text-3xl mb-2">Le salon des soutiens</h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              {status.need_login
                ? "Connecte-toi et deviens membre pour rejoindre la discussion, suivre les coulisses et poser tes questions."
                : "Le salon est réservé aux abonnés de la station. Rejoins la communauté pour discuter, voir les updates et participer aux sondages !"}
            </p>
            {status.need_login && <button data-testid="chat-login" onClick={openAuth} className="w-full mb-2 px-5 py-3 font-semibold" style={btn}>Se connecter</button>}
            <button data-testid="chat-subscribe" onClick={() => { sfx("select"); nav("/soutien"); }} className="w-full px-5 py-3 font-semibold inline-flex items-center justify-center gap-2" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
              <IoSparkles /> Devenir membre
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }} data-testid="chat-page">
      <Header nav={nav} sfx={sfx} online={online} showOnline />

      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-4 max-w-3xl w-full mx-auto" data-testid="chat-messages">
        {messages.length === 0 && <p className="text-center text-sm mt-10" style={{ color: "var(--text-secondary)" }}>Sois le premier à écrire dans le salon 🚀</p>}
        {messages.map((m) => {
          const mine = m.author_id === uid;
          const counts = Object.entries(m.reactions || {}).filter(([, u]) => u.length);
          return (
            <div key={m.id} className="flex gap-3 group" data-testid={`chat-msg-${m.id}`}>
              <Avatar name={m.author_name} avatar={m.author_avatar} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm" style={{ color: mine ? "var(--brand)" : "var(--text-primary)" }}>{m.author_name}</span>
                  <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{new Date(m.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative">
                    <button onClick={() => setEmojiFor(emojiFor === m.id ? null : m.id)} className="p-1" style={{ color: "var(--text-secondary)" }} data-testid={`chat-react-btn-${m.id}`}><IoHappyOutline size={16} /></button>
                    {isAdmin && <button onClick={() => del(m.id)} className="p-1" style={{ color: "var(--brand)" }} data-testid={`chat-del-${m.id}`}><IoTrashOutline size={15} /></button>}
                    {isAdmin && !mine && <button onClick={() => setModFor(modFor === m.id ? null : m.id)} className="p-1" style={{ color: "var(--text-secondary)" }} data-testid={`chat-mod-${m.id}`}><IoBanOutline size={15} /></button>}
                    {emojiFor === m.id && (
                      <div className="absolute top-6 right-0 z-20 flex gap-1 p-1.5" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)", boxShadow: "var(--shadow-1)" }}>
                        {REACTIONS.map((e) => <button key={e} onClick={() => react(m.id, e)} className="text-lg hover:scale-125 transition-transform" data-testid={`chat-emoji-${m.id}-${e}`}>{e}</button>)}
                      </div>
                    )}
                    {modFor === m.id && (
                      <div className="absolute top-6 right-0 z-20 w-40 py-1" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)", boxShadow: "var(--shadow-1)" }}>
                        <button onClick={() => moderate(m.author_id, "mute")} className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm" style={{ color: "var(--text-primary)" }}><IoVolumeMuteOutline /> Mute</button>
                        <button onClick={() => moderate(m.author_id, "unmute")} className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm" style={{ color: "var(--text-secondary)" }}>Lever la sourdine</button>
                        <button onClick={() => moderate(m.author_id, "ban")} className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm" style={{ color: "var(--brand)" }}><IoBanOutline /> Bannir</button>
                      </div>
                    )}
                  </div>
                </div>
                {m.text && <p className="text-sm leading-relaxed break-words" style={{ color: "var(--text-primary)" }}>{renderText(m.text)}</p>}
                {m.image_id && <img src={assetUrl(m.image_id)} alt="" className="mt-2 max-h-72 rounded-lg border" style={{ borderColor: "var(--border-c)" }} data-testid={`chat-img-${m.id}`} />}
                {m.poll && <Poll msg={m} uid={uid} onVote={vote} />}
                {counts.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {counts.map(([e, u]) => (
                      <button key={e} onClick={() => react(m.id, e)} className="px-2 py-0.5 text-xs flex items-center gap-1" data-testid={`chat-reaction-${m.id}-${e}`}
                        style={{ background: u.includes(uid) ? "color-mix(in srgb, var(--brand) 22%, transparent)" : "var(--bg-secondary)", border: `1px solid ${u.includes(uid) ? "var(--brand)" : "var(--border-c)"}`, borderRadius: "999px" }}>
                        {e} {u.length}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="border-t px-4 md:px-8 py-3 max-w-3xl w-full mx-auto" style={{ borderColor: "var(--border-c)" }}>
        {status?.muted && <p className="text-xs mb-2" style={{ color: "var(--brand)" }}>Tu es en sourdine — tu ne peux pas écrire pour le moment.</p>}
        {pollMode ? (
          <div className="p-3 space-y-2" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)" }} data-testid="chat-poll-builder">
            <div className="flex items-center justify-between"><span className="text-sm font-semibold flex items-center gap-1.5"><IoBarChartOutline style={{ color: "var(--brand)" }} /> Nouveau sondage</span>
              <button onClick={() => setPollMode(false)} style={{ color: "var(--text-secondary)" }}><IoClose /></button></div>
            <input data-testid="chat-poll-question" value={poll.question} onChange={(e) => setPoll((p) => ({ ...p, question: e.target.value }))} placeholder="Ta question…" className="w-full px-3 py-2 border outline-none text-sm" style={btn} />
            {poll.options.map((o, i) => (
              <div key={i} className="flex gap-2">
                <input data-testid={`chat-poll-option-${i}`} value={o || ""} onChange={(e) => setPoll((p) => ({ ...p, options: p.options.map((x, j) => j === i ? e.target.value : x) }))} placeholder={`Option ${i + 1}`} className="flex-1 px-3 py-2 border outline-none text-sm" style={btn} />
                {poll.options.length > 2 && <button onClick={() => setPoll((p) => ({ ...p, options: p.options.filter((_, j) => j !== i) }))} style={{ color: "var(--brand)" }}><IoTrashOutline /></button>}
              </div>
            ))}
            <div className="flex items-center justify-between">
              {poll.options.length < 6 ? <button onClick={() => setPoll((p) => ({ ...p, options: [...p.options, ""] }))} className="text-xs flex items-center gap-1" style={{ color: "var(--brand)" }} data-testid="chat-poll-add-option"><IoAddOutline /> Ajouter une option</button> : <span />}
              <button data-testid="chat-poll-send" onClick={sendPoll} className="px-4 py-2 text-sm font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>Publier le sondage</button>
            </div>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <button data-testid="chat-image-btn" onClick={() => fileRef.current?.click()} className="p-2.5" style={btn} title="Envoyer une image" disabled={status?.muted}><IoImageOutline size={18} /></button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => sendImage(e.target.files?.[0])} />
            <button data-testid="chat-poll-btn" onClick={() => setPollMode(true)} className="p-2.5" style={btn} title="Créer un sondage" disabled={status?.muted}><IoBarChartOutline size={18} /></button>
            <textarea data-testid="chat-input" rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={status?.muted ? "En sourdine…" : "Écris un message… (@ pour mentionner)"} disabled={status?.muted}
              className="flex-1 px-3 py-2.5 border outline-none resize-none text-sm" style={{ ...btn, background: "var(--bg-primary)", maxHeight: 120 }} />
            <button data-testid="chat-send" onClick={send} disabled={sending || status?.muted || !text.trim()} className="p-2.5 disabled:opacity-40" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}><IoSend size={18} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ nav, sfx, online, showOnline }) {
  return (
    <div className="sx-safe-top flex items-center justify-between gap-2 px-4 md:px-8 py-3 border-b" style={{ borderColor: "var(--border-c)", background: "var(--bg-primary)" }}>
      <div className="flex items-center gap-2">
        <button data-testid="chat-back" onClick={() => { sfx("back"); nav(-1); }} className="flex items-center gap-2 px-3 py-2" style={btn}><IoArrowBack /> <span className="text-sm hidden sm:inline">Retour</span></button>
        <button data-testid="chat-home" onClick={() => { sfx("nav"); nav("/"); }} className="flex items-center gap-2 px-3 py-2" style={btn}><IoHome size={16} /></button>
        <div className="ml-1">
          <h1 className="font-display text-lg leading-none">Salon</h1>
          {showOnline && <span className="text-[11px] flex items-center gap-1" style={{ color: "var(--brand)" }} data-testid="chat-online"><IoPeople size={12} /> {online} en ligne</span>}
        </div>
      </div>
      <MobileMenu />
    </div>
  );
}
