import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { KINDS, isOeuvre, isFolder } from "@/lib/atelier";
import "@/components/atelier/network.css";

/*
  @mentions dans les textes de l'atelier : on tape @ puis le début d'un nom, une liste propose les fiches,
  Entrée (ou un clic) insère la mention. La fiche devient reliée toute seule (réseau narratif).
  Ctrl/⌘ + clic sur une mention ouvre sa fiche.
*/
const esc = (t = "") => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const norm = (t = "") => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function Mentions({ at, scope, selfId, onOpen }) {
  const [st, setSt] = useState(null); // { q, x, y, sel }
  const range = useRef(null);
  const pool = at.items.filter((x) => x.id !== selfId && !isOeuvre(x) && !isFolder(x) && x.kind !== "file" && (x.title || "").trim());
  const list = st ? pool.filter((x) => norm(x.title).includes(norm(st.q))).sort((a, b) => (scope && (a.universe_id === scope) !== (b.universe_id === scope) ? (a.universe_id === scope ? -1 : 1) : norm(a.title).indexOf(norm(st.q)) - norm(b.title).indexOf(norm(st.q)))).slice(0, 8) : [];

  useEffect(() => {
    const root = () => document.querySelector(".at-editor-body, .at-editor") || document;
    const edOf = (t) => t?.closest?.("[contenteditable='true'],[contenteditable='']");
    const onKeyUp = (e) => {
      if (!edOf(e.target) || ["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"].includes(e.key)) return;
      const sel = window.getSelection(); if (!sel.rangeCount) return; const r = sel.getRangeAt(0); const node = r.startContainer;
      if (node.nodeType !== 3) { setSt(null); return; }
      const before = node.textContent.slice(0, r.startOffset); const m = before.match(/(?:^|[\s(«"'])@([\p{L}\p{N}'’\- ]{0,30})$/u);
      if (!m) { setSt(null); return; }
      const rr = document.createRange(); rr.setStart(node, r.startOffset - m[1].length - 1); rr.setEnd(node, r.startOffset); range.current = rr;
      const b = r.getBoundingClientRect(); setSt({ q: m[1], x: b.left, y: b.bottom + 6, sel: 0 });
    };
    const onKeyDown = (e) => {
      if (!st || !edOf(e.target) || !list.length) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setSt((s) => ({ ...s, sel: (s.sel + 1) % list.length })); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSt((s) => ({ ...s, sel: (s.sel - 1 + list.length) % list.length })); }
      else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); insert(list[st.sel]); }
      else if (e.key === "Escape") { e.stopPropagation(); setSt(null); }
    };
    const onClick = (e) => { const a = e.target.closest?.(".nx-mention"); if (a && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onOpen?.(a.dataset.id); } };
    const r0 = root(); r0.addEventListener("keyup", onKeyUp); r0.addEventListener("keydown", onKeyDown, true); r0.addEventListener("click", onClick);
    return () => { r0.removeEventListener("keyup", onKeyUp); r0.removeEventListener("keydown", onKeyDown, true); r0.removeEventListener("click", onClick); };
  });

  function insert(x) {
    const r = range.current; if (!r || !x) return;
    const ed = r.startContainer.parentElement?.closest("[contenteditable]");
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
    document.execCommand("insertHTML", false, `<a class="nx-mention" data-id="${esc(x.id)}" href="#" contenteditable="false">@${esc(x.title)}</a>&nbsp;`);
    setSt(null); ed?.dispatchEvent(new Event("input", { bubbles: true }));
  }

  if (!st || !list.length) return null;
  return createPortal(
    <div className="nx-mpop" style={{ left: Math.min(st.x, window.innerWidth - 300), top: Math.min(st.y, window.innerHeight - 320) }} data-testid="mention-popup" onMouseDown={(e) => e.preventDefault()}>
      <p className="mono">RELIER UNE FICHE</p>
      {list.map((x, i) => (
        <button key={x.id} className={i === st.sel ? "on" : ""} onMouseEnter={() => setSt((s) => ({ ...s, sel: i }))} onClick={() => insert(x)} data-testid={`mention-${x.id}`}>
          <i>{KINDS[x.kind]?.kanji}</i><b>{x.title}</b><small>{KINDS[x.kind]?.label}</small>
        </button>
      ))}
    </div>,
    document.body
  );
}
