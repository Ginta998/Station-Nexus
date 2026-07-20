import { forwardRef } from "react";
import { posterUrl } from "@/lib/api";

const PosterCard = forwardRef(function PosterCard(
  { item, focused, onFocus, onClick, catLabel },
  ref
) {
  const hasImg = item.has_poster || (item.poster && item.poster.length > 4);
  const src = item.poster && item.poster.length > 4 ? item.poster : posterUrl(item.id, item.updated_at);

  let prog = null;
  const total = item.chapters_count || 0;
  if (item.launch_type === "chapters" && total > 0) {
    try {
      const s = JSON.parse(localStorage.getItem("sx_progress_" + item.id) || "null");
      if (s && Number.isInteger(s.chapter)) {
        const ch = Math.min(Math.max(s.chapter, 0), total - 1);
        const ratio = typeof s.ratio === "number" ? Math.max(0, Math.min(1, s.ratio)) : 0;
        const pct = Math.min(100, Math.round(((ch + ratio) / total) * 100));
        prog = { ch: ch + 1, total, pct };
      }
    } catch (_) {}
  }
  return (
    <button
      ref={ref}
      data-testid={`poster-${item.id}`}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      onClick={onClick}
      style={{
        transform: focused ? "scale(1.06) translateY(-6px)" : "scale(1)",
        boxShadow: focused ? "var(--shadow-1)" : "none",
        borderRadius: "var(--radius-base)",
        borderWidth: focused ? "var(--border-width)" : "0px",
        transitionProperty: "transform, box-shadow, border-color, opacity",
      }}
      className="sx-poster relative flex-shrink-0 snap-center aspect-[2/3] overflow-hidden border-brand duration-300 ease-out outline-none group"
    >
      {hasImg ? (
        <img src={src} alt={item.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(160deg, var(--bg-secondary), var(--bg-primary))" }}>
          <span className="font-display text-6xl md:text-7xl" style={{ color: "var(--brand)", opacity: 0.9 }}>
            {item.kanji || item.title[0]}
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 h-2/5" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }} />

      {catLabel && (
        <div className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.45)", color: "#fff", borderRadius: "var(--radius-base)" }}>
          {catLabel}
        </div>
      )}
      {item.coming_soon && (
        <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
          style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
          À venir
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3 text-left">
        <p className="font-display text-base md:text-lg leading-tight" style={{ color: "#fff" }}>{item.title}</p>
        {prog ? (
          <p data-testid={`poster-progress-${item.id}`} className="text-[10px] mt-0.5 font-semibold tracking-wide flex items-center gap-1" style={{ color: "var(--brand)" }}>
            <span>▸ Ch. {prog.ch}/{prog.total} · {prog.pct}%</span>
          </p>
        ) : item.tagline ? (
          <p className="sx-card-tagline text-[11px] mt-0.5 line-clamp-1" style={{ color: "rgba(255,255,255,0.65)" }}>{item.tagline}</p>
        ) : null}
      </div>

      {prog && (
        <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: "rgba(255,255,255,0.18)" }}>
          <div style={{ height: "100%", width: `${prog.pct}%`, background: "var(--brand)", boxShadow: "0 0 8px var(--brand)", transition: "width 0.4s ease" }} />
        </div>
      )}

      {focused && <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 0 2px var(--brand)" }} />}
    </button>
  );
});

export default PosterCard;
