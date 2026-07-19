import { forwardRef } from "react";

const PosterCard = forwardRef(function PosterCard(
  { item, focused, onFocus, onClick, index },
  ref
) {
  const hasImg = item.poster && item.poster.length > 4;
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
      className="relative flex-shrink-0 snap-center w-44 sm:w-52 md:w-60 aspect-[2/3] overflow-hidden border-brand duration-300 ease-out outline-none group"
    >
      {hasImg ? (
        <img src={item.poster} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(160deg, var(--bg-secondary), var(--bg-primary))" }}
        >
          <span className="font-display text-6xl md:text-7xl" style={{ color: "var(--brand)", opacity: 0.9 }}>
            {item.kanji || item.title[0]}
          </span>
        </div>
      )}

      {/* gradient scrim bottom */}
      <div className="absolute inset-x-0 bottom-0 h-2/5" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }} />

      {item.coming_soon && (
        <div
          className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
          style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}
        >
          À venir
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-3 text-left">
        <p className="font-display text-base md:text-lg leading-tight" style={{ color: "#fff" }}>
          {item.title}
        </p>
        {item.tagline ? (
          <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: "rgba(255,255,255,0.65)" }}>
            {item.tagline}
          </p>
        ) : null}
      </div>

      {focused && (
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 0 2px var(--brand)" }} />
      )}
    </button>
  );
});

export default PosterCard;
