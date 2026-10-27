import { useEffect, useMemo, useRef, useState } from "react";
import { IoSearch, IoAdd } from "react-icons/io5";
import { KINDS, stripHtml } from "@/lib/atelier";

// Palette de commande (Ctrl K) : retrouve n'importe quoi dans tout l'Atelier, au clavier
export default function CommandPalette({ at, go, open, onClose, newUniverse }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef(null);
  useEffect(() => { input.current?.focus(); }, []);
  const texts = useMemo(() => Object.fromEntries(at.items.map((i) => [i.id, `${i.title} ${(i.tags || []).join(" ")} ${stripHtml(i.content)}`.toLowerCase()])), [at.items]);
  const needle = q.trim().toLowerCase();

  const results = useMemo(() => {
    const uname = (id) => at.universes.find((u) => u.id === id)?.name;
    const unis = at.universes.filter((u) => !needle || `${u.name} ${u.group}`.toLowerCase().includes(needle)).slice(0, needle ? 8 : 5)
      .map((u) => ({ key: "u" + u.id, kj: u.kanji || u.name[0], color: u.color, title: u.name, sub: `UNIVERS${u.group ? " · " + u.group.toUpperCase() : ""}`, run: () => go({ name: "universe", id: u.id }) }));
    const items = (needle ? at.items.filter((i) => texts[i.id].includes(needle)) : at.items.slice(0, 6)).slice(0, 24).map((i) => {
      const t = texts[i.id]; const p = needle ? t.indexOf(needle) : -1;
      const snip = p > (i.title || "").length ? "…" + t.slice(Math.max(0, p - 30), p + 60) + "…" : "";
      return { key: "i" + i.id, kj: KINDS[i.kind]?.kanji, title: i.title || "Sans titre", sub: `${KINDS[i.kind]?.label.toUpperCase()} · ${(uname(i.universe_id) || "Inbox").toUpperCase()}`, snip, run: () => open(i.id) };
    });
    const actions = [
      { key: "a-note", kj: "＋", title: needle ? `Créer la note « ${q.trim()} »` : "Nouvelle note dans l'Inbox", sub: "ACTION", run: async () => { const it = await at.createItem({ kind: "note", title: q.trim() }); open(it.id); } },
      { key: "a-uni", kj: "＋", title: "Nouvel univers", sub: "ACTION", run: newUniverse },
    ];
    return [...unis, ...items, ...actions];
  }, [needle, q, at, texts, go, open, newUniverse]);

  useEffect(() => setSel(0), [needle]);
  const onKey = (e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    if (e.key === "Enter") results[sel]?.run();
  };

  return (
    <div className="at-pal-wrap" onClick={onClose} data-testid="atelier-palette">
      <div className="at-pal" onClick={(e) => e.stopPropagation()}>
        <label className="at-pal-in"><IoSearch size={18} /><input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Chercher dans tous tes univers, fiches, scènes, notes…" data-testid="atelier-palette-input" /></label>
        <div className="at-pal-res">
          {results.map((r, i) => (
            <button key={r.key} className={i === sel ? "on" : ""} onMouseEnter={() => setSel(i)} onClick={r.run} data-testid={`atelier-palette-result-${i}`}>
              <span className="kj" style={r.color ? { color: r.color } : undefined}>{r.kj === "＋" ? <IoAdd size={16} /> : r.kj}</span>
              <span className="tx"><b>{r.title}</b><small className="mono">{r.sub}</small>{r.snip && <em>{r.snip}</em>}</span>
            </button>
          ))}
        </div>
        <p className="at-pal-f mono">↑↓ NAVIGUER · ENTRÉE OUVRIR · ÉCHAP FERMER</p>
      </div>
    </div>
  );
}
