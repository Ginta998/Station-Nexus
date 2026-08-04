import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { IoArrowBack, IoHome, IoSend, IoImageOutline, IoBarChartOutline, IoTrashOutline, IoClose, IoAddOutline, IoHappyOutline, IoBanOutline, IoVolumeMuteOutline, IoLockClosed, IoPeople, IoSparkles, IoCheckmarkCircle, IoChatbubblesOutline, IoMailOutline, IoBookmark, IoBookmarkOutline, IoMegaphone } from "react-icons/io5";
import { chatStatus, chatMessages, chatPost, chatDelete, chatReact, chatVote, chatPing, chatModerate, chatUpload, assetUrl, chatPin, chatPinned, dmConversations, dmThread, dmSend, chatChannels, chatChannelCreate, chatChannelDelete } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import MobileMenu from "@/components/MobileMenu";

const REACTIONS = ["❤️", "😂", "🔥", "👍", "😮", "🎉"];
const btn = { border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)", background: "var(--bg-secondary)" };

const Avatar = ({ name, avatar, size = 40, onClick }) => (
  <div onClick={onClick} className={`rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center ${onClick ? "cursor-pointer" : ""}`} style={{ width: size, height: size, border: "1.5px solid var(--brand)", background: "var(--bg-secondary)" }}>
    {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : <span className="font-display" style={{ color: "var(--brand)", fontSize: size * 0.42 }}>{(name || "?")[0].toUpperCase()}</span>}
  </div>
);

const renderText = (text) => (text || "").split(/(\s+)/).map((w, i) =>
  w.startsWith("@") && w.length > 1 ? <span key={i} style={{ color: "var(--brand)", fontWeight: 600 }}>{w}</span> : <span key={i}>{w}</span>);

const fmt = (d) => new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

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
  const [params, setParams] = useSearchParams();
  const { sfx } = useApp();
  const { user, openAuth } = useAuth();
  const { markPublicSeen, refresh: refreshUnread } = useChat() || {};
  const [status, setStatus] = useState(null);
  const [tab, setTab] = useState(params.get("tab") === "dm" ? "dm" : "salon");

  // public salon state
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [channel, setChannel] = useState("general");
  const [pinned, setPinned] = useState(null);
  const [online, setOnline] = useState(0);
  const [text, setText] = useState("");
  const [emojiFor, setEmojiFor] = useState(null);
  const [pollMode, setPollMode] = useState(false);
  const [poll, setPoll] = useState({ question: "", options: ["", ""] });
  const [modFor, setModFor] = useState(null);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const lastTs = useRef(null);
  const nearBottom = useRef(true);
  const initialLoaded = useRef(false);

  // DM state
  const [convos, setConvos] = useState([]);
  const [partner, setPartner] = useState(params.get("to") ? { id: params.get("to"), name: params.get("name") || "Membre", avatar: "" } : null);
  const [dmMsgs, setDmMsgs] = useState([]);
  const [dmText, setDmText] = useState("");
  const dmScrollRef = useRef(null);
  const dmFileRef = useRef(null);
  const dmLastTs = useRef(null);

  const uid = user?.id;
  const isAdmin = status?.is_admin;
  const canRead = status?.can_read;

  const scrollBottom = (ref) => { const el = ref.current; if (el) el.scrollTop = el.scrollHeight; };

  const merge = useCallback((incoming) => {
    if (!incoming?.length) return;
    setMessages((prev) => {
      const map = new Map(prev.map((m) => [m.id, m]));
      let hasNew = false;
      incoming.forEach((m) => { if (!map.has(m.id)) hasNew = true; map.set(m.id, m); });
      const arr = Array.from(map.values()).sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
      lastTs.current = arr[arr.length - 1]?.created_at || lastTs.current;
      if (initialLoaded.current && hasNew) {
        const newest = incoming[incoming.length - 1];
        if (newest && newest.author_id !== uid) { try { sfx("select"); } catch {} }
      }
      return arr;
    });
  }, [uid, sfx]);

  // status + channels
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const st = await chatStatus();
        if (!alive) return;
        setStatus(st);
        if (st.can_read) { try { setChannels(await chatChannels()); } catch {} }
      } catch (e) { if (e?.response?.status === 401) setStatus({ can_read: false, need_login: true }); }
    })();
    return () => { alive = false; };
  }, [user]); // eslint-disable-line

  // load messages + pinned for the active channel
  useEffect(() => {
    if (!canRead || tab !== "salon") return;
    let alive = true;
    initialLoaded.current = false;
    setMessages([]); lastTs.current = null;
    (async () => {
      try {
        const [msgs, pin] = await Promise.all([chatMessages(null, channel), chatPinned(channel)]);
        if (!alive) return;
        setMessages(msgs); setPinned(pin && pin.id ? pin : null);
        lastTs.current = msgs[msgs.length - 1]?.created_at || null;
        setTimeout(() => scrollBottom(scrollRef), 60);
        setTimeout(() => { initialLoaded.current = true; }, 400);
        markPublicSeen && markPublicSeen();
      } catch {}
    })();
    return () => { alive = false; };
  }, [canRead, tab, channel]); // eslint-disable-line

  // public polling + presence
  useEffect(() => {
    if (!canRead || tab !== "salon") return;
    const p1 = setInterval(async () => {
      if (document.hidden) return;
      try { const msgs = await chatMessages(lastTs.current, channel); merge(msgs); if (msgs.length) markPublicSeen && markPublicSeen(); if (nearBottom.current) setTimeout(() => scrollBottom(scrollRef), 40); } catch {}
    }, 2500);
    const ping = async () => { try { const r = await chatPing(); setOnline(r.count); } catch {} };
    ping();
    const p2 = setInterval(ping, 20000);
    return () => { clearInterval(p1); clearInterval(p2); };
  }, [canRead, tab, channel, merge]); // eslint-disable-line

  // DM conversations polling (when in dm tab, no active partner)
  useEffect(() => {
    if (!canRead || tab !== "dm" || partner) return;
    const load = async () => { try { setConvos(await dmConversations()); } catch {} };
    load();
    const t = setInterval(() => { if (!document.hidden) load(); }, 5000);
    return () => clearInterval(t);
  }, [canRead, tab, partner]);

  // DM thread polling (active partner)
  useEffect(() => {
    if (!canRead || !partner) return;
    let alive = true;
    const load = async (since) => {
      try {
        const r = await dmThread(partner.id, since);
        if (!alive) return;
        if (r.partner) setPartner((p) => ({ ...p, name: r.partner.name, avatar: r.partner.avatar }));
        if (r.messages?.length) {
          setDmMsgs((prev) => {
            const map = new Map(prev.map((m) => [m.id, m]));
            r.messages.forEach((m) => map.set(m.id, m));
            const arr = Array.from(map.values()).sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
            dmLastTs.current = arr[arr.length - 1]?.created_at || dmLastTs.current;
            return arr;
          });
          setTimeout(() => scrollBottom(dmScrollRef), 40);
        }
        refreshUnread && refreshUnread();
      } catch {}
    };
    setDmMsgs([]); dmLastTs.current = null;
    load();
    const t = setInterval(() => { if (!document.hidden) load(dmLastTs.current); }, 2500);
    return () => { alive = false; clearInterval(t); };
  }, [canRead, partner?.id]); // eslint-disable-line

  const onScroll = () => { const el = scrollRef.current; if (!el) return; nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120; };

  const send = async () => {
    const t = text.trim(); if (!t) return;
    try { const m = await chatPost({ text: t, channel_id: channel }); setText(""); merge([m]); setTimeout(() => scrollBottom(scrollRef), 40); sfx("select"); }
    catch (e) { toast.error(e?.response?.data?.detail || "Erreur d'envoi"); }
  };
  const sendImage = async (file) => {
    if (!file) return; if (file.size > 12 * 1024 * 1024) return toast.error("Image trop lourde (max 12 Mo)");
    try { const up = await chatUpload(file); const m = await chatPost({ image_id: up.id, channel_id: channel }); merge([m]); setTimeout(() => scrollBottom(scrollRef), 40); }
    catch { toast.error("Échec de l'image"); }
  };
  const sendPoll = async () => {
    const opts = poll.options.map((o) => o.trim()).filter(Boolean);
    if (!poll.question.trim() || opts.length < 2) return toast.error("Une question et au moins 2 options");
    try { const m = await chatPost({ poll: { question: poll.question, options: opts, multi: false }, channel_id: channel }); merge([m]); setPoll({ question: "", options: ["", ""] }); setPollMode(false); setTimeout(() => scrollBottom(scrollRef), 40); }
    catch { toast.error("Erreur sondage"); }
  };
  const createChannel = async () => {
    const name = window.prompt("Nom du nouveau salon :");
    if (!name || !name.trim()) return;
    try { const ch = await chatChannelCreate(name.trim()); setChannels((c) => [...c, ch]); setChannel(ch.id); toast.success(`Salon « ${ch.name} » créé`); }
    catch (e) { toast.error(e?.response?.data?.detail || "Erreur"); }
  };
  const removeChannel = async (cid, name) => {
    if (!window.confirm(`Supprimer le salon « ${name} » et tous ses messages ?`)) return;
    try { await chatChannelDelete(cid); setChannels((c) => c.filter((x) => x.id !== cid)); if (channel === cid) setChannel("general"); toast.success("Salon supprimé"); }
    catch (e) { toast.error(e?.response?.data?.detail || "Erreur"); }
  };
  const react = async (mid, emoji) => { setEmojiFor(null); try { const r = await chatReact(mid, emoji); setMessages((prev) => prev.map((m) => m.id === mid ? { ...m, reactions: r.reactions } : m)); } catch {} };
  const vote = async (mid, opt) => { try { const r = await chatVote(mid, opt); setMessages((prev) => prev.map((m) => m.id === mid ? { ...m, poll: r.poll } : m)); if (pinned?.id === mid) setPinned((p) => ({ ...p, poll: r.poll })); } catch {} };
  const del = async (mid) => { try { await chatDelete(mid); setMessages((prev) => prev.filter((m) => m.id !== mid)); if (pinned?.id === mid) setPinned(null); toast.success("Message supprimé"); } catch {} };
  const pin = async (mid) => { try { const r = await chatPin(mid); const m = messages.find((x) => x.id === mid); setPinned(r.pinned ? m : null); toast.success(r.pinned ? "Message épinglé en haut du salon" : "Message désépinglé"); } catch {} };
  const moderate = async (userId, action) => { setModFor(null); try { await chatModerate(userId, action); toast.success({ ban: "Membre banni", unban: "Ban levé", mute: "Membre en sourdine", unmute: "Sourdine levée" }[action]); } catch { toast.error("Action impossible"); } };

  const openDM = (id, name, avatar) => { setPartner({ id, name, avatar: avatar || "" }); setTab("dm"); };
  const sendDM = async () => {
    const t = dmText.trim(); if (!t || !partner) return;
    try { const m = await dmSend(partner.id, { text: t }); setDmText(""); setDmMsgs((prev) => [...prev, m]); dmLastTs.current = m.created_at; setTimeout(() => scrollBottom(dmScrollRef), 40); sfx("select"); }
    catch (e) { toast.error(e?.response?.data?.detail || "Erreur"); }
  };
  const sendDMImage = async (file) => {
    if (!file || !partner) return; if (file.size > 12 * 1024 * 1024) return toast.error("Image trop lourde");
    try { const up = await chatUpload(file); const m = await dmSend(partner.id, { image_id: up.id }); setDmMsgs((prev) => [...prev, m]); setTimeout(() => scrollBottom(dmScrollRef), 40); }
    catch { toast.error("Échec de l'image"); }
  };
  const goTab = (t) => { setTab(t); setPartner(null); setParams({}, { replace: true }); };

  // ---- Access gate ----
  if (status && !canRead) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }} data-testid="chat-locked">
        <Header nav={nav} sfx={sfx} online={0} showOnline={false} tab={null} />
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="max-w-md text-center p-8" style={{ background: "var(--bg-secondary)", border: "1px solid var(--brand)", borderRadius: "var(--radius-base)" }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--brand) 18%, transparent)", border: "1.5px solid var(--brand)" }}><IoLockClosed size={30} style={{ color: "var(--brand)" }} /></div>
            {status.banned ? (
              <>
                <h1 className="font-display text-2xl md:text-3xl mb-2">Accès au salon suspendu</h1>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Tu n'as plus accès au salon pour le moment.</p>
              </>
            ) : (
              <>
                <h1 className="font-display text-2xl md:text-3xl mb-2">Rejoins le salon</h1>
                <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Connecte-toi ou crée un compte pour discuter avec la communauté, suivre les coulisses et poser tes questions. C'est gratuit !</p>
                <button data-testid="chat-login" onClick={openAuth} className="w-full px-5 py-3 font-semibold inline-flex items-center justify-center gap-2" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}><IoSparkles /> Se connecter / Créer un compte</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }} data-testid="chat-page">
      <Header nav={nav} sfx={sfx} online={online} showOnline={tab === "salon"} tab={tab} onTab={goTab} />

      {tab === "salon" ? (
        <>
          {/* Channel selector */}
          <div className="max-w-3xl w-full mx-auto px-4 md:px-8 pt-3 flex items-center gap-2 overflow-x-auto" data-testid="chat-channels" style={{ scrollbarWidth: "none" }}>
            {channels.map((c) => (
              <div key={c.id} className="relative group flex-shrink-0">
                <button data-testid={`chat-channel-${c.id}`} onClick={() => setChannel(c.id)}
                  className="px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors"
                  style={{ background: channel === c.id ? "var(--brand)" : "var(--bg-secondary)", color: channel === c.id ? "var(--bg-primary)" : "var(--text-secondary)", border: `1px solid ${channel === c.id ? "var(--brand)" : "var(--border-c)"}`, borderRadius: "999px" }}>
                  # {c.name}
                </button>
                {isAdmin && c.id !== "general" && (
                  <button onClick={() => removeChannel(c.id, c.name)} data-testid={`chat-channel-del-${c.id}`} className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "var(--brand)", color: "var(--bg-primary)" }}><IoClose size={10} /></button>
                )}
              </div>
            ))}
            {isAdmin && (
              <button data-testid="chat-channel-add" onClick={createChannel} className="px-2.5 py-1.5 flex-shrink-0 flex items-center gap-1 text-sm" style={{ border: "1px dashed var(--brand)", color: "var(--brand)", borderRadius: "999px" }}><IoAddOutline size={15} /> Salon</button>
            )}
          </div>

          {pinned && (
            <div className="max-w-3xl w-full mx-auto px-4 md:px-8 pt-3" data-testid="chat-pinned">
              <div className="flex items-start gap-2 px-3 py-2.5" style={{ background: "color-mix(in srgb, var(--brand) 12%, var(--bg-secondary))", border: "1px solid var(--brand)", borderRadius: "var(--radius-base)" }}>
                <IoMegaphone size={16} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 2 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "var(--brand)" }}>Épinglé · {pinned.author_name}</p>
                  {pinned.text && <p className="text-sm break-words">{renderText(pinned.text)}</p>}
                  {pinned.image_id && <img src={assetUrl(pinned.image_id)} alt="" className="mt-1 max-h-40 rounded border" style={{ borderColor: "var(--border-c)" }} />}
                  {pinned.poll && <Poll msg={pinned} uid={uid} onVote={vote} />}
                </div>
                {isAdmin && <button onClick={() => pin(pinned.id)} data-testid="chat-unpin" style={{ color: "var(--brand)" }} title="Désépingler"><IoClose size={16} /></button>}
              </div>
            </div>
          )}

          <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-4 max-w-3xl w-full mx-auto" data-testid="chat-messages">
            {messages.length === 0 && <p className="text-center text-sm mt-10" style={{ color: "var(--text-secondary)" }}>Sois le premier à écrire dans le salon 🚀</p>}
            {messages.map((m) => {
              const mine = m.author_id === uid;
              const counts = Object.entries(m.reactions || {}).filter(([, u]) => u.length);
              return (
                <div key={m.id} className="flex gap-3 group" data-testid={`chat-msg-${m.id}`}>
                  <Avatar name={m.author_name} avatar={m.author_avatar} onClick={!mine ? () => openDM(m.author_id, m.author_name, m.author_avatar) : undefined} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <button onClick={!mine ? () => openDM(m.author_id, m.author_name, m.author_avatar) : undefined} className="font-semibold text-sm" style={{ color: mine ? "var(--brand)" : "var(--text-primary)" }} data-testid={`chat-author-${m.id}`}>{m.author_name}</button>
                      <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{fmt(m.created_at)}</span>
                      <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative">
                        <button onClick={() => setEmojiFor(emojiFor === m.id ? null : m.id)} className="p-1" style={{ color: "var(--text-secondary)" }} data-testid={`chat-react-btn-${m.id}`}><IoHappyOutline size={16} /></button>
                        {isAdmin && <button onClick={() => pin(m.id)} className="p-1" style={{ color: pinned?.id === m.id ? "var(--brand)" : "var(--text-secondary)" }} data-testid={`chat-pin-${m.id}`} title="Épingler">{pinned?.id === m.id ? <IoBookmark size={15} /> : <IoBookmarkOutline size={15} />}</button>}
                        {isAdmin && <button onClick={() => del(m.id)} className="p-1" style={{ color: "var(--brand)" }} data-testid={`chat-del-${m.id}`}><IoTrashOutline size={15} /></button>}
                        {isAdmin && !mine && <button onClick={() => setModFor(modFor === m.id ? null : m.id)} className="p-1" style={{ color: "var(--text-secondary)" }} data-testid={`chat-mod-${m.id}`}><IoBanOutline size={15} /></button>}
                        {emojiFor === m.id && (
                          <div className="absolute top-6 right-0 z-20 flex gap-1 p-1.5" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)", boxShadow: "var(--shadow-1)" }}>
                            {REACTIONS.map((e) => <button key={e} onClick={() => react(m.id, e)} className="text-lg hover:scale-125 transition-transform" data-testid={`chat-emoji-${m.id}-${e}`}>{e}</button>)}
                          </div>
                        )}
                        {modFor === m.id && (
                          <div className="absolute top-6 right-0 z-20 w-40 py-1" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)", boxShadow: "var(--shadow-1)" }}>
                            <button onClick={() => moderate(m.author_id, "mute")} className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm"><IoVolumeMuteOutline /> Mute</button>
                            <button onClick={() => moderate(m.author_id, "unmute")} className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm" style={{ color: "var(--text-secondary)" }}>Lever la sourdine</button>
                            <button onClick={() => moderate(m.author_id, "ban")} className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm" style={{ color: "var(--brand)" }}><IoBanOutline /> Bannir</button>
                          </div>
                        )}
                      </div>
                    </div>
                    {m.text && <p className="text-sm leading-relaxed break-words">{renderText(m.text)}</p>}
                    {m.image_id && <img src={assetUrl(m.image_id)} alt="" className="mt-2 max-h-72 rounded-lg border" style={{ borderColor: "var(--border-c)" }} data-testid={`chat-img-${m.id}`} />}
                    {m.poll && <Poll msg={m} uid={uid} onVote={vote} />}
                    {counts.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {counts.map(([e, u]) => (
                          <button key={e} onClick={() => react(m.id, e)} className="px-2 py-0.5 text-xs flex items-center gap-1" data-testid={`chat-reaction-${m.id}-${e}`}
                            style={{ background: u.includes(uid) ? "color-mix(in srgb, var(--brand) 22%, transparent)" : "var(--bg-secondary)", border: `1px solid ${u.includes(uid) ? "var(--brand)" : "var(--border-c)"}`, borderRadius: "999px" }}>{e} {u.length}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t px-4 md:px-8 py-3 max-w-3xl w-full mx-auto" style={{ borderColor: "var(--border-c)" }}>
            {status?.muted && <p className="text-xs mb-2" style={{ color: "var(--brand)" }}>Tu es en sourdine — tu ne peux pas écrire pour le moment.</p>}
            {pollMode ? (
              <div className="p-3 space-y-2" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)" }} data-testid="chat-poll-builder">
                <div className="flex items-center justify-between"><span className="text-sm font-semibold flex items-center gap-1.5"><IoBarChartOutline style={{ color: "var(--brand)" }} /> Nouveau sondage</span><button onClick={() => setPollMode(false)} style={{ color: "var(--text-secondary)" }}><IoClose /></button></div>
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
                <button data-testid="chat-image-btn" onClick={() => fileRef.current?.click()} className="p-2.5" style={btn} disabled={status?.muted}><IoImageOutline size={18} /></button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => sendImage(e.target.files?.[0])} />
                <button data-testid="chat-poll-btn" onClick={() => setPollMode(true)} className="p-2.5" style={btn} disabled={status?.muted}><IoBarChartOutline size={18} /></button>
                <textarea data-testid="chat-input" rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={status?.muted ? "En sourdine…" : "Écris un message… (@ pour mentionner)"} disabled={status?.muted} className="flex-1 px-3 py-2.5 border outline-none resize-none text-sm" style={{ ...btn, background: "var(--bg-primary)", maxHeight: 120 }} />
                <button data-testid="chat-send" onClick={send} disabled={status?.muted || !text.trim()} className="p-2.5 disabled:opacity-40" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}><IoSend size={18} /></button>
              </div>
            )}
          </div>
        </>
      ) : (
        // ---- Messages privés ----
        partner ? (
          <>
            <div className="flex items-center gap-3 px-4 md:px-8 py-2.5 border-b max-w-3xl w-full mx-auto" style={{ borderColor: "var(--border-c)" }}>
              <button data-testid="dm-back" onClick={() => { setPartner(null); setParams({ tab: "dm" }, { replace: true }); }} className="p-2" style={btn}><IoArrowBack size={16} /></button>
              <Avatar name={partner.name} avatar={partner.avatar} size={34} />
              <span className="font-semibold" data-testid="dm-partner-name">{partner.name}</span>
            </div>
            <div ref={dmScrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-2 max-w-3xl w-full mx-auto" data-testid="dm-thread">
              {dmMsgs.length === 0 && <p className="text-center text-sm mt-10" style={{ color: "var(--text-secondary)" }}>Écris le premier message à {partner.name} 💬</p>}
              {dmMsgs.map((m) => {
                const mine = m.from_id === uid;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`} data-testid={`dm-msg-${m.id}`}>
                    <div className="max-w-[75%] px-3 py-2" style={{ background: mine ? "var(--brand)" : "var(--bg-secondary)", color: mine ? "var(--bg-primary)" : "var(--text-primary)", borderRadius: "var(--radius-base)", border: mine ? "none" : "1px solid var(--border-c)" }}>
                      {m.text && <p className="text-sm break-words">{m.text}</p>}
                      {m.image_id && <img src={assetUrl(m.image_id)} alt="" className="mt-1 max-h-56 rounded" />}
                      <p className="text-[10px] mt-0.5 opacity-70 text-right">{fmt(m.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t px-4 md:px-8 py-3 max-w-3xl w-full mx-auto" style={{ borderColor: "var(--border-c)" }}>
              <div className="flex items-end gap-2">
                <button data-testid="dm-image-btn" onClick={() => dmFileRef.current?.click()} className="p-2.5" style={btn}><IoImageOutline size={18} /></button>
                <input ref={dmFileRef} type="file" accept="image/*" hidden onChange={(e) => sendDMImage(e.target.files?.[0])} />
                <textarea data-testid="dm-input" rows={1} value={dmText} onChange={(e) => setDmText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendDM(); } }} placeholder={`Message à ${partner.name}…`} className="flex-1 px-3 py-2.5 border outline-none resize-none text-sm" style={{ ...btn, background: "var(--bg-primary)", maxHeight: 120 }} />
                <button data-testid="dm-send" onClick={sendDM} disabled={!dmText.trim()} className="p-2.5 disabled:opacity-40" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}><IoSend size={18} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 max-w-3xl w-full mx-auto" data-testid="dm-conversations">
            {convos.length === 0 && (
              <div className="text-center mt-12" style={{ color: "var(--text-secondary)" }}>
                <IoChatbubblesOutline size={40} className="mx-auto mb-3" style={{ color: "var(--brand)" }} />
                <p className="text-sm mb-2">Aucune conversation privée pour l'instant.</p>
                <p className="text-xs">Va sur la page <button onClick={() => nav("/membres")} className="underline" style={{ color: "var(--brand)" }}>Membres</button> ou clique sur le nom d'un membre dans le salon pour lui écrire.</p>
              </div>
            )}
            {convos.map((c) => (
              <button key={c.partner_id} onClick={() => openDM(c.partner_id, c.partner_name, c.partner_avatar)} data-testid={`dm-convo-${c.partner_id}`}
                className="flex items-center gap-3 w-full px-3 py-3 text-left border-b transition-colors" style={{ borderColor: "var(--border-c)" }}>
                <Avatar name={c.partner_name} avatar={c.partner_avatar} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="font-semibold truncate">{c.partner_name}</span><span className="text-[10px] ml-auto" style={{ color: "var(--text-secondary)" }}>{c.last_at ? fmt(c.last_at) : ""}</span></div>
                  <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>{c.last_text}</p>
                </div>
                {c.unread > 0 && <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold rounded-full" style={{ background: "var(--brand)", color: "var(--bg-primary)" }} data-testid={`dm-unread-${c.partner_id}`}>{c.unread}</span>}
              </button>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function Header({ nav, sfx, online, showOnline, tab, onTab }) {
  const { unread } = useChat() || { unread: { dm: 0 } };
  const dmUnread = unread?.dm || 0;
  return (
    <div className="sx-safe-top border-b" style={{ borderColor: "var(--border-c)", background: "var(--bg-primary)" }}>
      <div className="flex items-center justify-between gap-2 px-3 md:px-8 pt-3 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <button data-testid="chat-back" onClick={() => { sfx("back"); nav(-1); }} className="flex items-center gap-2 px-2.5 py-2" style={btn}><IoArrowBack size={18} /></button>
          <button data-testid="chat-home" onClick={() => { sfx("nav"); nav("/"); }} className="flex items-center gap-2 px-2.5 py-2" style={btn}><IoHome size={16} /></button>
          <div className="ml-1 min-w-0">
            <h1 className="font-display text-lg leading-none flex items-center gap-1.5"><IoChatbubblesOutline size={18} style={{ color: "var(--brand)" }} /> Salon</h1>
            {showOnline && <span className="text-[11px] flex items-center gap-1" style={{ color: "var(--brand)" }} data-testid="chat-online"><IoPeople size={11} /> {online} en ligne</span>}
          </div>
        </div>
        <MobileMenu />
      </div>
      {tab && (
        <div className="flex items-center gap-2 px-3 md:px-8 pb-2 max-w-3xl w-full mx-auto">
          <button data-testid="chat-tab-salon" onClick={() => onTab("salon")} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold transition-colors"
            style={{ background: tab === "salon" ? "var(--brand)" : "var(--bg-secondary)", color: tab === "salon" ? "var(--bg-primary)" : "var(--text-secondary)", border: `1px solid ${tab === "salon" ? "var(--brand)" : "var(--border-c)"}`, borderRadius: "var(--radius-base)" }}>
            <IoChatbubblesOutline size={16} /> Salon
          </button>
          <button data-testid="chat-tab-dm" onClick={() => onTab("dm")} className="relative flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold transition-colors"
            style={{ background: tab === "dm" ? "var(--brand)" : "var(--bg-secondary)", color: tab === "dm" ? "var(--bg-primary)" : "var(--text-secondary)", border: `1px solid ${tab === "dm" ? "var(--brand)" : "var(--border-c)"}`, borderRadius: "var(--radius-base)" }}>
            <IoMailOutline size={16} /> Messages
            {dmUnread > 0 && <span data-testid="chat-tab-dm-badge" className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full" style={{ background: tab === "dm" ? "var(--bg-primary)" : "var(--brand)", color: tab === "dm" ? "var(--brand)" : "var(--bg-primary)" }}>{dmUnread > 9 ? "9+" : dmUnread}</span>}
          </button>
        </div>
      )}
    </div>
  );
}
