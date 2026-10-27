import { useEffect, useRef, useState } from "react";
import { IoClose, IoSend, IoAdd, IoTrashOutline, IoDocumentTextOutline, IoHardwareChipOutline } from "react-icons/io5";
import { playUiSound } from "@/lib/sound";
import BunnySprite from "@/components/atelier/BunnySprite";
import { atelierApi, KINDS } from "@/lib/atelier";
import BunnyMessage from "@/components/atelier/BunnyMessage";

const QUICK = [
  ["Inspire-moi", "Propose-moi trois idées de scènes inattendues pour cet univers."],
  ["Écris une scène", "Écris une scène courte et intense entre deux personnages de cet univers."],
  ["Mes tâches", "Fais le point sur mes tâches du Cockpit et dis-moi par laquelle commencer."],
];

// Panneau de Cosmic Bunny : conversations sauvegardées, lore lu automatiquement, scènes insérables, tâches gérées
export default function BunnyPanel({ at, universeId, onClose, openBrains }) {
  const [sessions, setSessions] = useState([]);
  const [sid, setSid] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [focus, setFocus] = useState("");
  const [pose, setPose] = useState("wave");
  const [hop, setHop] = useState(0);
  const react = (p, sound) => { setPose(p); setHop((h) => h + 1); playUiSound(sound, "bunny"); };
  useEffect(() => { const t = setTimeout(() => setPose("neutral"), 2600); return () => clearTimeout(t); }, [pose]);
  const list = useRef(null);
  const uni = at.universes.find((u) => u.id === universeId);
  const docs = at.items.filter((i) => !universeId || i.universe_id === universeId).slice(0, 200);

  useEffect(() => { atelierApi.bunnySessions().then(setSessions).catch(() => {}); }, []);
  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" }); }, [msgs, busy]);

  const openSession = async (id) => {
    setErr(""); if (!id) { setSid(null); setMsgs([]); return; }
    try { const s = await atelierApi.bunnySession(id); setSid(s.id); setMsgs(s.messages); } catch { setErr("Impossible d'ouvrir cette conversation."); }
  };
  const remove = async () => {
    if (!sid || !window.confirm("Supprimer cette conversation avec Bunny ?")) return;
    try { await atelierApi.bunnyDelete(sid); setSessions((l) => l.filter((s) => s.id !== sid)); openSession(null); } catch { setErr("Suppression impossible, réessaie."); }
  };
  const send = async (msg) => {
    const m = (msg ?? text).trim(); if (!m || busy) return;
    const id = sid || crypto.randomUUID();
    setText(""); setErr(""); setBusy(true); setMsgs((l) => [...l, { role: "user", content: m }]);
    try {
      const r = await atelierApi.bunnyChat({ message: m, session_id: id, universe_id: universeId || null, focus_item_id: focus || null });
      setMsgs((l) => [...l, r.reply]);
      react(/<scene/.test(r.reply.content) || r.reply.tasks?.length ? "excited" : "thumbs", "chirp");
      if (!sessions.some((x) => x.id === r.session_id)) setSessions((l) => [{ id: r.session_id, title: r.title }, ...l]);
      setSid(r.session_id);
      if (r.tasks_changed.length || r.tasks_deleted.length) at.applyTasks(r.tasks_changed, r.tasks_deleted);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Bunny n'a pas pu répondre. Réessaie !"); react("sad", "oops");
      setMsgs((l) => l.slice(0, -1)); setText(m); setSid(id);
    } finally { setBusy(false); }
  };
  const insertScene = (title, body) => at.createItem({ kind: "scene", title, universe_id: universeId || null, tags: ["bunny"], content: body.trim().split(/\n{2,}/).map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br/>")}</p>`).join("") });

  return (
    <aside className="bn-panel" data-testid="bunny-panel">
      <header className="bn-head">
        <BunnySprite pose={busy ? "thumbs" : pose} hop={hop} size={52} className={busy ? "bn-think" : ""} testid="bunny-avatar" />
        <div className="bn-title"><b>Cosmic Bunny</b><small className="mono">{uni ? `// ${uni.name.toUpperCase()}` : "// TOUS TES UNIVERS"}</small></div>
        <button className="at-icon" onClick={openBrains} title="Cerveaux de Bunny" data-testid="bunny-brains-open"><IoHardwareChipOutline size={17} /></button>
        <button className="at-icon" onClick={onClose} title="Fermer" data-testid="bunny-close"><IoClose size={18} /></button>
      </header>
      <div className="bn-bar">
        <select value={sid || ""} onChange={(e) => openSession(e.target.value)} data-testid="bunny-session-select">
          <option value="">Nouvelle conversation</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <button className="at-icon" onClick={() => openSession(null)} title="Nouvelle conversation" data-testid="bunny-new"><IoAdd size={16} /></button>
        {sid && <button className="at-icon" onClick={remove} title="Supprimer la conversation" data-testid="bunny-delete"><IoTrashOutline size={15} /></button>}
      </div>
      <div className="bn-list" ref={list} data-testid="bunny-messages">
        {!msgs.length && (
          <div className="bn-hello" data-testid="bunny-hello">
            <BunnySprite pose={pose} hop={hop} size={110} />
            <p>Coucou ! C'est Bunny. J'ai lu tout ton lore — enfin, j'ai essayé de ne rien faire tomber en route. On écrit quoi aujourd'hui ?</p>
            <div className="bn-quick">{QUICK.map(([l, q], i) => <button key={l} onClick={() => send(q)} data-testid={`bunny-quick-${i}`}>{l}</button>)}</div>
          </div>
        )}
        {msgs.map((m, i) => <BunnyMessage key={i} m={m} idx={i} onInsertScene={insertScene} dest={uni ? uni.name : "l'Inbox"} />)}
        {busy && <div className="bn-msg ai" data-testid="bunny-typing"><span className="bn-av">兎</span><div className="bn-dots"><i /><i /><i /></div></div>}
        {err && <p className="bn-err" data-testid="bunny-error">{err}</p>}
      </div>
      <div className="bn-focus">
        <IoDocumentTextOutline size={14} />
        <select value={focus} onChange={(e) => setFocus(e.target.value)} data-testid="bunny-focus-select">
          <option value="">Aucun document en focus</option>
          {docs.map((d) => <option key={d.id} value={d.id}>{KINDS[d.kind]?.kanji} {d.title || "Sans titre"}</option>)}
        </select>
        {focus && <button onClick={() => send("Résume-moi ce document : idées clés, personnages, enjeux.")} data-testid="bunny-summarize">Résumer</button>}
      </div>
      <form className="bn-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={2} placeholder="Parle à Bunny… (Entrée pour envoyer)" data-testid="bunny-input" />
        <button type="submit" disabled={busy || !text.trim()} data-testid="bunny-send"><IoSend size={16} /></button>
      </form>
    </aside>
  );
}
