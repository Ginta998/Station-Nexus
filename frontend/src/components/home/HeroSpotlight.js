import { IoPlay, IoStar, IoStarOutline, IoCreateOutline, IoTrashOutline, IoFilmOutline, IoHeart, IoHeartOutline } from "react-icons/io5";
import { bgUrl, posterUrl } from "@/lib/api";

// Shared cinematic hero / "création du moment" used by Steam & Overwatch layouts.
export const HeroSpotlight = ({
  item, catLabel, heroFocused, actionIndex = 0,
  onLaunch, onTrailer, onToggleFav, isFav,
  isAdmin, isFeatured, onSetFeatured, onEdit, onDelete,
  ratio = "aspect-[21/9]",
}) => {
  if (!item) return null;
  const hasTrailer = !!((item.trailer_url && item.trailer_url.trim()) || item.has_trailer);
  const bg = item.has_bg ? bgUrl(item.id, item.updated_at) : (item.has_poster ? posterUrl(item.id, item.updated_at) : null);
  const ring = (i) => heroFocused && actionIndex === i;
  return (
    <div
      data-testid="hero-spotlight-container"
      className={`relative w-full ${ratio} overflow-hidden`}
      style={{ borderRadius: "calc(var(--radius-base) * 2)", border: heroFocused ? "2px solid var(--brand)" : "1px solid rgba(255,255,255,0.08)", boxShadow: heroFocused ? "0 0 40px color-mix(in srgb, var(--brand) 35%, transparent)" : "var(--shadow-1)", transition: "border-color .3s, box-shadow .3s" }}
    >
      {bg ? (
        <img key={item.id} src={bg} alt={item.title} className="absolute inset-0 w-full h-full object-cover" style={{ animation: "bgFade .6s ease" }} />
      ) : (
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 35% 30%, var(--bg-secondary), var(--bg-primary) 75%)" }} />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-primary) 2%, rgba(0,0,0,0.35) 45%, transparent 85%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.75), rgba(0,0,0,0.15) 60%, transparent)" }} />

      {item.kanji && (
        <div className="absolute right-4 top-2 pointer-events-none select-none font-display leading-none" style={{ fontSize: "min(28vh, 220px)", color: "var(--brand)", opacity: 0.1 }}>{item.kanji}</div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5 md:p-10 max-w-3xl">
        <span className="inline-block text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.25em] px-2.5 py-1 mb-2 md:mb-3" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }} data-testid="hero-category">
          {item.coming_soon ? "Bientôt · " : ""}{catLabel}
        </span>
        <h1 className="font-display leading-none break-words text-3xl sm:text-5xl md:text-6xl" style={{ color: "#fff", textShadow: "0 2px 24px rgba(0,0,0,0.7)" }} data-testid="hero-title">{item.title}</h1>
        {(item.tagline || item.synopsis) && (
          <p className="mt-2 md:mt-3 text-sm md:text-base line-clamp-2 md:line-clamp-3" style={{ color: "rgba(255,255,255,0.82)", textShadow: "0 1px 10px rgba(0,0,0,0.7)", maxWidth: "52ch" }}>{item.tagline || item.synopsis}</p>
        )}

        <div className="mt-4 md:mt-6 flex flex-wrap items-center gap-2.5">
          <button data-testid="hero-launch-button" onClick={onLaunch}
            className="flex items-center gap-2 px-6 py-3 font-semibold transition-transform hover:scale-105"
            style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)", boxShadow: ring(0) ? "0 0 0 3px var(--bg-primary), 0 0 0 5px var(--brand)" : "var(--shadow-1)", transform: ring(0) ? "scale(1.05)" : "none" }}>
            <IoPlay size={18} /> {item.launch_label || "Lancer"}
          </button>
          {hasTrailer && (
            <button data-testid="hero-trailer-button" onClick={onTrailer}
              className="flex items-center gap-2 px-5 py-3 font-semibold transition-transform hover:scale-105"
              style={{ background: "rgba(0,0,0,0.5)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-base)", backdropFilter: "blur(6px)", boxShadow: ring(1) ? "0 0 0 3px var(--bg-primary), 0 0 0 5px var(--brand)" : "none" }}>
              <IoFilmOutline size={18} /> Bande-annonce
            </button>
          )}
          <button data-testid="hero-fav-button" onClick={onToggleFav} aria-label="Favori"
            className="w-12 h-12 flex items-center justify-center transition-transform hover:scale-110"
            style={{ background: "rgba(0,0,0,0.5)", color: isFav ? "var(--brand)" : "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "var(--radius-base)", backdropFilter: "blur(6px)" }}>
            {isFav ? <IoHeart size={20} /> : <IoHeartOutline size={20} />}
          </button>

          {isAdmin && (
            <div className="flex items-center gap-2 ml-1">
              <button data-testid="hero-set-featured" onClick={() => onSetFeatured(item.id)} title={isFeatured ? "Création du moment active" : "Mettre en avant"}
                className="w-11 h-11 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)", color: isFeatured ? "var(--brand)" : "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)" }}>
                {isFeatured ? <IoStar size={18} /> : <IoStarOutline size={18} />}
              </button>
              <button data-testid="hero-edit" onClick={() => onEdit(item)} className="w-11 h-11 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)" }}><IoCreateOutline size={18} /></button>
              <button data-testid="hero-delete" onClick={() => onDelete(item)} className="w-11 h-11 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)", color: "var(--brand)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "var(--radius-base)" }}><IoTrashOutline size={18} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSpotlight;
