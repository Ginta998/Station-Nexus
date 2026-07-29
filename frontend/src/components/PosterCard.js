import { forwardRef } from "react";
import { IoHeart, IoHeartOutline, IoPlay } from "react-icons/io5";
import { posterUrl } from "@/lib/api";

const PosterCard = forwardRef(function PosterCard(
  { item, focused, onFocus, onClick, onResume, onTrailer, catLabel, isFav, onToggleFav },
  ref
) {
  const hasImg = item.has_poster || (item.poster && item.poster.length > 4);
  const src = item.poster && item.poster.length > 4 ? item.poster : posterUrl(item.id, item.updated_at);
  const hasTrailer = !!((item.trailer_url && item.trailer_url.trim()) || item.has_trailer);

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
  const done = !!prog && prog.pct >= 100;
  return (
    <button
      ref={ref}
      data-testid={`poster-${item.id}`}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      onClick={onClick}
      style={{
        boxShadow: focused ? "var(--shadow-1)" : "none",
        borderRadius: "var(--radius-base)",
        borderWidth: focused ? "var(--border-width)" : "0px",
        transitionProperty: "transform, box-shadow, border-color, opacity",
      }}
      className={`sx-poster ${focused ? "is-focused" : ""} relative flex-shrink-0 aspect-[2/3] overflow-hidden border-brand duration-300 ease-out outline-none group`}
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

      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
        {catLabel && (
          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.45)", color: "#fff", borderRadius: "var(--radius-base)" }}>
            {catLabel}
          </span>
        )}
        {item.coming_soon && (
          <span data-testid={`poster-release-${item.id}`} className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
            style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
            {[item.release_month, item.release_year].filter(Boolean).join(" ") || "À venir"}
          </span>
        )}
        {done && !item.coming_soon && (
          <span data-testid={`poster-done-${item.id}`} className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1"
            style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
            ✓ Terminé
          </span>
        )}
      </div>

      <span
        role="button"
        tabIndex={-1}
        data-testid={`poster-fav-${item.id}`}
        onClick={(e) => { e.stopPropagation(); onToggleFav && onToggleFav(); }}
        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm cursor-pointer transition-transform hover:scale-110"
        style={{ background: "rgba(0,0,0,0.45)", color: isFav ? "var(--brand)" : "#fff" }}
        title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
        aria-label="Favori"
      >
        {isFav ? <IoHeart size={16} /> : <IoHeartOutline size={16} />}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-3 text-left">
        <p className="font-display text-base md:text-lg leading-tight" style={{ color: "#fff" }}>{item.title}</p>
        {prog ? (
          <span
            role="button"
            data-testid={`poster-resume-${item.id}`}
            onClick={(e) => { e.stopPropagation(); onResume && onResume(); }}
            className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide cursor-pointer transition-transform hover:scale-105"
            style={{ color: "var(--brand)" }}
            title={done ? "Relire depuis le début" : "Reprendre la lecture"}
          >
            {done ? "✓ Terminé · Relire" : `▸ Reprendre · Ch. ${prog.ch}/${prog.total} · ${prog.pct}%`}
          </span>
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

      {hasTrailer && (
        <>
          {/* Desktop: pill fades in on hover/focus */}
          <span
            role="button"
            tabIndex={-1}
            data-testid={`poster-trailer-${item.id}`}
            onClick={(e) => { e.stopPropagation(); onTrailer && onTrailer(); }}
            className="hidden md:flex absolute bottom-3 right-3 z-10 items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full backdrop-blur-sm cursor-pointer"
            style={{ background: "rgba(0,0,0,0.6)", color: "var(--brand)", border: "1px solid color-mix(in srgb, var(--brand) 55%, transparent)", opacity: focused ? 1 : 0, transform: focused ? "translateY(0)" : "translateY(6px)", transition: "opacity 0.25s ease, transform 0.25s ease" }}
            title="Voir la bande-annonce"
          >
            <IoPlay size={12} /> Bande-annonce
          </span>
          {/* Mobile: fixed compact badge */}
          <span
            role="button"
            tabIndex={-1}
            data-testid={`poster-trailer-badge-${item.id}`}
            onClick={(e) => { e.stopPropagation(); onTrailer && onTrailer(); }}
            className="md:hidden absolute bottom-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full backdrop-blur-sm cursor-pointer"
            style={{ background: "rgba(0,0,0,0.55)", color: "var(--brand)", border: "1px solid color-mix(in srgb, var(--brand) 55%, transparent)" }}
            title="Voir la bande-annonce"
            aria-label="Bande-annonce"
          >
            <IoPlay size={13} />
          </span>
        </>
      )}
    </button>
  );
});

export default PosterCard;
