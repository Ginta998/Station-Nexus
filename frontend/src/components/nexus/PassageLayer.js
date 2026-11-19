import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IoChatbubble, IoChatbubbleEllipsesOutline, IoClose, IoSend } from "react-icons/io5";
import { listComments, addComment } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

/*
  Les commentaires sur un passage, posés sur le lecteur de la station.
  Le lecteur sélectionne une phrase (double-clic sur une phrase, ou sélection au doigt), puis « Réagir ».
  Les passages commentés sont surlignés dans le texte (sans toucher au texte lui-même) avec une bulle qui dit combien de réactions ;
  toucher la bulle ouvre le fil.
*/
const FLOW = ".ax-reader .ax-flow";
const TEXT = "p,li,blockquote"; const SKIP = "[class*=\"ax-tp\"],button,figure,.ax-yt-ed,h1,h2";
const norm = (t) => String(t || "").replace(/\s+/g, " ").trim();
const ago = (d) => { const m = Math.round((Date.now() - new Date(d)) / 60000); return m < 60 ? `il y a ${Math.max(1, m)} min` : m < 1440 ? `il y a ${Math.round(m / 60)} h` : new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }); };

// tous les nœuds texte du livre, à la suite, pour retrouver une phrase et en faire une plage (Range)
function textIndex(root) {
  const nodes = []; let text = "";
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement?.closest("button,figure,.ax-yt-ed") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
  for (let n = w.nextNode(); n; n = w.nextNode()) { nodes.push({ n, start: text.length }); text += n.data; }
  return { nodes, text };
}
function rangeAt(idx, from, to) {
  const at = (pos) => { let lo = 0, hi = idx.nodes.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (idx.nodes[mid].start <= pos) lo = mid; else hi = mid - 1; } const x = idx.nodes[lo]; return [x.n, Math.min(x.n.data.length, pos - x.start)]; };
  const r = document.createRange(); const [a, ao] = at(from); const [b, bo] = at(to); r.setStart(a, ao); r.setEnd(b, bo); return r;
}
// cherche la phrase dans le texte (espaces souples)
function findQuote(idx, q) {
  const words = norm(q).split(" ").map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!words.length) return null;
  const m = new RegExp(words.join("\\s+")).exec(idx.text);
  return m ? [m.index, m.index + m[0].length] : null;
}

export default function PassageLayer({ item, unit, unitIndex, unitLabel }) {
  const qc = useQueryClient();
  const { user } = useAuth() || {};
  const { data: all = [] } = useQuery({ queryKey: ["comments", item.id], queryFn: () => listComments(item.id) });
  const mine = useMemo(() => all.filter((c) => c.quote && c.chapter_id === (unit?.id || "")), [all, unit?.id]);
  const groups = useMemo(() => { const g = new Map(); mine.forEach((c) => { const k = norm(c.quote); g.set(k, [...(g.get(k) || []), c]); }); return g; }, [mine]);
  const [ask, setAsk] = useState(null);     // { quote, x, y } : le bouton « Réagir » sur une sélection
  const [thread, setThread] = useState(null); // la phrase dont on lit (ou écrit) le fil
  const [bubbles, setBubbles] = useState([]);
  const ranges = useRef([]);

  // surligner les passages commentés, et placer les bulles là où ils sont visibles
  const place = useCallback(() => {
    const root = document.querySelector(FLOW); if (!root) { setBubbles([]); return; }
    const idx = textIndex(root); const box = root.getBoundingClientRect(); const out = []; ranges.current = [];
    groups.forEach((list, q) => {
      const hitAt = findQuote(idx, q); if (!hitAt) return;
      const r = rangeAt(idx, hitAt[0], hitAt[1]); ranges.current.push(r);
      const rects = [...r.getClientRects()].filter((x) => x.width > 1 && x.right > box.left && x.left < box.right);
      const last = rects[rects.length - 1]; if (last) out.push({ q, n: list.length, x: Math.min(last.right + 4, window.innerWidth - 40), y: last.top - 6 });
    });
    try { if (window.CSS?.highlights && window.Highlight) { if (ranges.current.length) CSS.highlights.set("nx-passage", new window.Highlight(...ranges.current)); else CSS.highlights.delete("nx-passage"); } } catch (_) { /* navigateur ancien : bulles seulement */ }
    setBubbles(out);
  }, [groups]);
  useEffect(() => {
    place(); const t = setInterval(place, 900);
    const root = document.querySelector(FLOW); const on = () => requestAnimationFrame(place);
    root?.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
    return () => { clearInterval(t); root?.removeEventListener("scroll", on); window.removeEventListener("resize", on); try { CSS.highlights?.delete("nx-passage"); } catch (_) { /* rien */ } };
  }, [place]);

  // une sélection dans le texte du livre : proposer « Réagir »
  useEffect(() => {
    const check = () => setTimeout(() => {
      const sel = window.getSelection(); const root = document.querySelector(FLOW);
      if (!sel || sel.isCollapsed || !root || !root.contains(sel.anchorNode)) return;
      const host = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
      if (!host?.closest(TEXT) || host.closest(SKIP)) return; // seulement le texte du chapitre (pas la page de titre)
      const q = norm(sel.toString()); if (q.length < 6 || q.length > 400) return;
      const r = sel.getRangeAt(0).getBoundingClientRect(); setAsk({ quote: q, x: r.left + r.width / 2, y: r.top });
    }, 10);
    // double-clic sur une phrase : on sélectionne toute la phrase (le glisser horizontal tourne les pages)
    const dbl = (e) => {
      const root = document.querySelector(FLOW); if (!root || !root.contains(e.target) || e.target.closest(SKIP)) return;
      const para = e.target.closest(TEXT); if (!para) return; const idx = textIndex(para);
      const pos = document.caretRangeFromPoint ? document.caretRangeFromPoint(e.clientX, e.clientY) : null;
      let at = 0; if (pos) { const hitN = idx.nodes.find((x) => x.n === pos.startContainer); at = hitN ? hitN.start + pos.startOffset : 0; }
      const t = idx.text; let a = at, b = at;
      while (a > 0 && !/[.!?…»]\s/.test(t.slice(a - 2, a))) a--;
      while (b < t.length && !/[.!?…]/.test(t[b])) b++;
      b = Math.min(t.length, b + 1); while (a < b && /\s/.test(t[a])) a++;
      if (b - a < 6) return;
      const r = rangeAt(idx, a, b); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); check();
    };
    const clear = (e) => { if (!e.target.closest?.(".pc-ask,.pc-thread")) { const sel = window.getSelection(); if (!sel || sel.isCollapsed) setAsk(null); } };
    document.addEventListener("mouseup", check); document.addEventListener("touchend", check); document.addEventListener("dblclick", dbl); document.addEventListener("mousedown", clear);
    return () => { document.removeEventListener("mouseup", check); document.removeEventListener("touchend", check); document.removeEventListener("dblclick", dbl); document.removeEventListener("mousedown", clear); };
  }, []);

  if (!unit?.id) return null;
  return createPortal(<>
    {bubbles.map((b) => (
      <button key={b.q} className="pc-bub" style={{ left: b.x, top: b.y }} onClick={() => setThread(b.q)} title={`${b.n} réaction${b.n > 1 ? "s" : ""} sur ce passage`} data-testid="pc-bubble"><IoChatbubble size={11} />{b.n}</button>
    ))}
    {ask && !thread && (
      <button className="pc-ask" style={{ left: Math.max(70, Math.min(window.innerWidth - 70, ask.x)), top: Math.max(8, ask.y - 46) }} onMouseDown={(e) => e.preventDefault()} onClick={() => { setThread(ask.quote); setAsk(null); }} data-testid="pc-ask">
        <IoChatbubbleEllipsesOutline size={15} /> Réagir
      </button>
    )}
    {thread && <Thread quote={thread} list={groups.get(norm(thread)) || []} user={user} onClose={() => { setThread(null); window.getSelection()?.removeAllRanges(); }}
      onSend={async (name, text) => {
        await addComment({ creation_id: item.id, name, text, episode_index: unitIndex, episode_label: unitLabel, chapter_id: unit.id, quote: thread, anchor: -1 });
        qc.invalidateQueries({ queryKey: ["comments", item.id] }); toast.success("Réaction publiée");
      }} />}
  </>, document.body);
}

function Thread({ quote, list, user, onClose, onSend }) {
  const [name, setName] = useState(() => user?.name || (() => { try { return localStorage.getItem("sx_name") || ""; } catch (_) { return ""; } })());
  const [text, setText] = useState(""); const [busy, setBusy] = useState(false);
  const send = async () => {
    if (!name.trim() || !text.trim()) { toast.error("Ton prénom et ta réaction"); return; }
    setBusy(true); try { localStorage.setItem("sx_name", name.trim()); } catch (_) { /* rien */ }
    try { await onSend(name.trim(), text.trim()); setText(""); } catch (e) { toast.error(e?.response?.data?.detail || "Réaction non envoyée"); } setBusy(false);
  };
  return (
    <div className="pc-thread-w" onClick={onClose}>
      <aside className="pc-thread" onClick={(e) => e.stopPropagation()} data-testid="pc-thread" aria-label="Réactions sur ce passage">
        <header><b>Sur ce passage</b><button onClick={onClose} aria-label="Fermer"><IoClose size={17} /></button></header>
        <blockquote>« {quote} »</blockquote>
        <div className="pc-list">
          {list.length === 0 && <p className="pc-empty">Personne n'a encore réagi ici. Sois le premier.</p>}
          {[...list].sort((a, b) => a.created_at.localeCompare(b.created_at)).map((c) => (
            <div key={c.id} className="pc-c"><p><b>{c.name}</b>{c.is_author && <em>AUTEUR</em>}<small>{ago(c.created_at)}</small></p><span>{c.text}</span></div>
          ))}
        </div>
        <div className="pc-form">
          {!user && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton prénom" maxLength={40} />}
          <div><textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ta réaction…" maxLength={1000} autoFocus data-testid="pc-text" onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send(); }} />
            <button onClick={send} disabled={busy} aria-label="Publier" data-testid="pc-send"><IoSend size={16} /></button></div>
        </div>
      </aside>
    </div>
  );
}
