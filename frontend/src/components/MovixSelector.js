import { useState, useRef, useEffect } from "react";
import { IoChevronDown, IoChevronBack, IoChevronForward, IoPlay, IoLockClosed, IoMusicalNotes, IoCheckmark } from "react-icons/io5";

// Sélecteur façon Movix : menu déroulant pour choisir + grande affiche animée de l'élément sélectionné.
// items: [{ key, image, title, description, badge, locked, music, active, onOpen }]
export default function MovixSelector({ label, kanji, items, testid = "movix", mode = "movix" }) {
  const [sel, setSel] = useState(() => {
    const a = items.findIndex((x) => x.active);
    return a >= 0 ? a : 0;
  });
  const [open, setOpen] = useState(false);
  const ddRef = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  if (!items || items.length === 0) return null;
  const cur = items[Math.min(sel, items.length - 1)];
  const go = (i) => { setSel(Math.max(0, Math.min(items.length - 1, i))); };
  const countBadge = (
    <span className="text-xs px-2 py-0.5 flex-shrink-0" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }} data-testid={`${testid}-count`}>{items.length}</span>
  );

  // ---- Mode "liste complète" : grandes cartes verticales (image 16:9 + titre + description dessous) ----
  if (mode === "list") {
    return (
      <div className="mt-10" data-testid={testid}>
        <div className="flex items-center gap-3 mb-6">
          <span className="font-display text-lg opacity-70" style={{ color: "var(--brand)" }}>{kanji}</span>
          <h3 className="font-display text-xl" style={{ color: "var(--text-primary)" }}>{label}</h3>
          {countBadge}
        </div>
        <div className="flex flex-col gap-8" data-testid={`${testid}-list`}>
          {items.map((it, i) => (
            <button key={it.key || i} data-testid={`${testid}-row-${i}`} onClick={it.onOpen}
              className="group block w-full text-left overflow-hidden transition-transform hover:scale-[1.01] movix-pop"
              style={{ borderRadius: "calc(var(--radius-base)*1.5)", border: it.active ? "2px solid var(--brand)" : "1px solid rgba(255,255,255,0.1)", background: "var(--bg-secondary)", boxShadow: "var(--shadow-1)" }}>
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
                {it.image ? <img src={it.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  : <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--bg-secondary), rgba(0,0,0,0.8))" }}><span className="font-display text-8xl" style={{ color: "var(--brand)", opacity: 0.85 }}>{kanji || i + 1}</span></div>}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent 45%)" }} />
                <span className="absolute top-4 left-4 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>{it.badge || String(i + 1).padStart(2, "0")}</span>
                {it.music && <IoMusicalNotes size={18} className="absolute top-4 right-4" style={{ color: "#fff" }} />}
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="w-16 h-16 flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110" style={{ background: "var(--brand)", color: "var(--bg-primary)", boxShadow: "0 0 30px color-mix(in srgb, var(--brand) 55%, transparent)" }}>{it.locked ? <IoLockClosed size={26} /> : <IoPlay size={28} />}</span>
                </span>
              </div>
              <div className="p-5 md:p-7">
                <p className="font-display text-2xl md:text-3xl leading-tight" style={{ color: "var(--text-primary)" }}>{it.title}</p>
                {it.note && <p className="text-sm mt-1.5" style={{ color: "var(--brand)" }}>{it.note}</p>}
                {it.description && <p className="text-sm md:text-base mt-2.5 line-clamp-3" style={{ color: "var(--text-secondary)", maxWidth: "70ch" }}>{it.description}</p>}
                {it.locked && <span className="inline-flex items-center gap-1 mt-3 px-2 py-1 text-[11px] font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: 4 }}><IoLockClosed size={11} /> Réservé — payant</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10" data-testid={testid}>
      {/* Header + dropdown */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="font-display text-lg opacity-70" style={{ color: "var(--brand)" }}>{kanji}</span>
        <h3 className="font-display text-xl" style={{ color: "var(--text-primary)" }}>{label}</h3>
        {countBadge}
        <div className="relative ml-auto" ref={ddRef}>
          <button data-testid={`${testid}-dropdown`} onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold min-w-[200px] justify-between transition-colors"
            style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-c)", borderRadius: "999px" }}>
            <span className="truncate">{String(sel + 1).padStart(2, "0")} · {cur.title}</span>
            <IoChevronDown size={16} className="transition-transform flex-shrink-0" style={{ transform: open ? "rotate(180deg)" : "none", color: "var(--brand)" }} />
          </button>
          {open && (
            <div data-testid={`${testid}-menu`} className="absolute right-0 mt-2 w-[280px] max-h-[320px] overflow-y-auto hide-scrollbar z-30 py-1.5"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-c)", borderRadius: "calc(var(--radius-base)*1.2)", boxShadow: "0 18px 50px rgba(0,0,0,0.6)", animation: "fadeDown .2s ease" }}>
              {items.map((it, i) => (
                <button key={it.key || i} data-testid={`${testid}-opt-${i}`} onClick={() => { setSel(i); setOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors hover:brightness-125"
                  style={{ background: i === sel ? "color-mix(in srgb, var(--brand) 18%, transparent)" : "transparent" }}>
                  <span className="font-display text-sm w-7 flex-shrink-0 text-center" style={{ color: "var(--brand)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 min-w-0 text-sm truncate" style={{ color: "var(--text-primary)" }}>{it.title}</span>
                  {it.locked && <IoLockClosed size={13} style={{ color: "var(--brand)" }} />}
                  {i === sel && <IoCheckmark size={15} style={{ color: "var(--brand)" }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grande affiche de l'élément sélectionné */}
      <div className="relative">
        <button key={cur.key || sel} data-testid={`${testid}-feature`} onClick={cur.onOpen}
          className="group relative block w-full overflow-hidden text-left movix-pop"
          style={{ aspectRatio: "16/9", maxHeight: "clamp(340px, 64vh, 640px)", borderRadius: "calc(var(--radius-base)*1.6)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "var(--shadow-1)" }}>
          {cur.image ? <img src={cur.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            : <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--bg-secondary), rgba(0,0,0,0.8))" }}><span className="font-display text-8xl" style={{ color: "var(--brand)", opacity: 0.85 }}>{kanji || cur.title[0]}</span></div>}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 5%, rgba(0,0,0,0.25) 55%, transparent)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.55), transparent 55%)" }} />

          <span className="absolute top-4 left-4 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>{cur.badge || `N° ${String(sel + 1).padStart(2, "0")}`}</span>
          {cur.music && <IoMusicalNotes size={18} className="absolute top-4 right-4" style={{ color: "#fff" }} />}

          {/* play */}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-16 h-16 flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110" style={{ background: "var(--brand)", color: "var(--bg-primary)", boxShadow: "0 0 30px color-mix(in srgb, var(--brand) 55%, transparent)" }}>
              {cur.locked ? <IoLockClosed size={26} /> : <IoPlay size={28} />}
            </span>
          </span>

          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 movix-text">
            <p className="font-display text-2xl md:text-4xl leading-tight" style={{ color: "#fff", textShadow: "0 2px 18px rgba(0,0,0,0.7)" }}>{cur.title}</p>
            {cur.note && <p className="text-xs mt-1" style={{ color: "var(--brand)" }}>{cur.note}</p>}
            {cur.description && <p className="text-sm md:text-base mt-2 line-clamp-3" style={{ color: "rgba(255,255,255,0.85)", maxWidth: "60ch", textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}>{cur.description}</p>}
            {cur.locked && <span className="inline-flex items-center gap-1 mt-3 px-2 py-1 text-[11px] font-semibold" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: 4 }}><IoLockClosed size={11} /> Réservé — payant</span>}
          </div>
        </button>

        {/* prev / next */}
        {items.length > 1 && (
          <>
            <button data-testid={`${testid}-prev`} onClick={() => go(sel - 1)} disabled={sel === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-all" style={{ background: "rgba(0,0,0,0.55)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "999px", opacity: sel === 0 ? 0.3 : 1, backdropFilter: "blur(6px)" }}><IoChevronBack size={20} /></button>
            <button data-testid={`${testid}-next`} onClick={() => go(sel + 1)} disabled={sel === items.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-all" style={{ background: "rgba(0,0,0,0.55)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "999px", opacity: sel === items.length - 1 ? 0.3 : 1, backdropFilter: "blur(6px)" }}><IoChevronForward size={20} /></button>
          </>
        )}
      </div>

      {/* pagination dots */}
      {items.length > 1 && items.length <= 20 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {items.map((_, i) => (
            <button key={i} onClick={() => go(i)} aria-label={`Aller à ${i + 1}`} className="transition-all" style={{ width: i === sel ? 22 : 7, height: 7, borderRadius: 999, background: i === sel ? "var(--brand)" : "rgba(255,255,255,0.25)" }} />
          ))}
        </div>
      )}
    </div>
  );
}
