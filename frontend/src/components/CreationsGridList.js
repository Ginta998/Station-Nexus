import { IoHeart, IoHeartOutline, IoPlay, IoChevronForward, IoFilmOutline } from "react-icons/io5";
import { posterUrl } from "@/lib/api";

const hasTrailer = (it) => !!((it.trailer_url && it.trailer_url.trim()) || it.has_trailer);
const hasImg = (it) => it.has_poster || (it.poster && it.poster.length > 4);
const imgSrc = (it) => (it.poster && it.poster.length > 4 ? it.poster : posterUrl(it.id, it.updated_at));

export default function CreationsGridList({ items, layout, isLoading, catLabelByKey, onOpen, isFavorite, toggleFavorite, onTrailer }) {
  if (!items.length) {
    return <div className="flex-1 flex items-center justify-center"><p style={{ color: "var(--on-media-2)" }}>{isLoading ? "Chargement…" : "Aucune création."}</p></div>;
  }

  if (layout === "list") {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-5 md:px-12 pb-8 mt-4" data-testid="browse-list">
        <div className="flex flex-col gap-2 max-w-3xl">
          {items.map((it) => (
            <div key={it.id} data-testid={`list-row-${it.id}`} role="button" tabIndex={0} onClick={() => onOpen(it.id)}
              className="flex items-center gap-4 p-2.5 border cursor-pointer transition-transform hover:translate-x-1"
              style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", background: "rgba(0,0,0,0.3)" }}>
              <div className="relative w-12 h-16 flex-shrink-0 overflow-hidden rounded" style={{ background: "var(--bg-secondary)" }}>
                {hasImg(it) ? <img src={imgSrc(it)} alt="" loading="lazy" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center font-display text-2xl" style={{ color: "var(--brand)" }}>{it.kanji || it.title[0]}</div>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: 2 }}>{catLabelByKey[it.category] || it.category}</span>
                  {hasTrailer(it) && <IoFilmOutline size={13} style={{ color: "var(--brand)" }} title="Bande-annonce" />}
                </div>
                <p className="font-display text-lg truncate" style={{ color: "var(--on-media)" }}>{it.title}</p>
                <p className="text-xs truncate" style={{ color: "var(--on-media-2)" }}>{it.tagline}</p>
              </div>
              <button data-testid={`list-fav-${it.id}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(it.id); }} className="p-2" style={{ color: "var(--brand)" }} aria-label="Favori">
                {isFavorite(it.id) ? <IoHeart size={18} /> : <IoHeartOutline size={18} />}
              </button>
              <IoChevronForward size={18} style={{ color: "var(--on-media-2)" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // grid
  return (
    <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-5 md:px-12 pb-8 mt-4" data-testid="browse-grid">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
        {items.map((it) => (
          <div key={it.id} data-testid={`grid-card-${it.id}`} role="button" tabIndex={0} onClick={() => onOpen(it.id)}
            className="group relative aspect-[2/3] w-full overflow-hidden text-left cursor-pointer transition-transform hover:scale-[1.04]"
            style={{ borderRadius: "var(--radius-base)", background: "var(--bg-secondary)", boxShadow: "var(--shadow-1)" }}>
            {hasImg(it) ? <img src={imgSrc(it)} alt={it.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              : <div className="absolute inset-0 flex items-center justify-center font-display text-5xl" style={{ color: "var(--brand)" }}>{it.kanji || it.title[0]}</div>}
            <div className="absolute inset-x-0 bottom-0 h-2/5" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }} />
            <span className="absolute top-1.5 left-1.5 text-[8px] uppercase tracking-widest px-1 py-0.5" style={{ background: "rgba(0,0,0,0.5)", color: "#fff", borderRadius: 2 }}>{catLabelByKey[it.category] || it.category}</span>
            <button data-testid={`grid-fav-${it.id}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(it.id); }} className="absolute top-1.5 right-1.5 p-1 rounded-full" style={{ background: "rgba(0,0,0,0.4)", color: "var(--brand)" }} aria-label="Favori">
              {isFavorite(it.id) ? <IoHeart size={13} /> : <IoHeartOutline size={13} />}
            </button>
            {hasTrailer(it) && (
              <span data-testid={`grid-trailer-${it.id}`} role="button" onClick={(e) => { e.stopPropagation(); onTrailer(it.id); }}
                className="absolute bottom-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full" style={{ background: "rgba(0,0,0,0.55)", color: "var(--brand)", border: "1px solid color-mix(in srgb, var(--brand) 55%, transparent)" }} title="Bande-annonce"><IoPlay size={11} /></span>
            )}
            <p className="absolute bottom-1.5 left-1.5 right-8 font-display text-xs leading-tight truncate" style={{ color: "#fff" }}>{it.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
