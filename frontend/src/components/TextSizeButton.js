import { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";

const SCALES = [
  { v: "petit", label: "Petit", size: 11 },
  { v: "normal", label: "Normal", size: 13 },
  { v: "grand", label: "Grand", size: 16 },
  { v: "xl", label: "Très grand", size: 20 },
  { v: "max", label: "Maximum", size: 24 },
];

export function TextSizeButton({ btnStyle }) {
  const { textScale, setTextScale, sfx } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button data-testid="text-size-btn" onClick={() => { setOpen((o) => !o); sfx("nav"); }}
        title="Taille du texte" aria-label="Taille du texte"
        className="px-2.5 py-2.5 border transition-transform hover:scale-105 flex items-end gap-0.5 leading-none"
        style={btnStyle}>
        <span className="font-display" style={{ fontSize: 12 }}>A</span>
        <span className="font-display" style={{ fontSize: 18 }}>A</span>
      </button>

      {open && (
        <div data-testid="text-size-menu"
          className="absolute right-0 mt-2 z-50 p-2 border min-w-[180px]"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
          <p className="text-[10px] uppercase tracking-widest px-2 pb-1.5" style={{ color: "var(--text-secondary)" }}>Taille du texte</p>
          {SCALES.map((s) => {
            const active = (textScale || "grand") === s.v;
            return (
              <button key={s.v} data-testid={`text-size-${s.v}`}
                onClick={() => { setTextScale(s.v); sfx("select"); setOpen(false); }}
                className="w-full flex items-center justify-between gap-3 px-2 py-2 transition-colors"
                style={{ background: active ? "var(--brand)" : "transparent", borderRadius: "var(--radius-base)" }}>
                <span className="text-sm" style={{ color: active ? "var(--bg-primary)" : "var(--text-primary)" }}>{s.label}</span>
                <span className="font-display" style={{ fontSize: s.size, lineHeight: 1, color: active ? "var(--bg-primary)" : "var(--text-secondary)" }}>A</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
