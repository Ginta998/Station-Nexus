import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack, IoHome, IoSettingsOutline, IoPlay, IoPause, IoClose, IoCart, IoCreateOutline, IoTrashOutline, IoMusicalNotes, IoOpenOutline, IoBookOutline, IoLogoYoutube } from "react-icons/io5";
import { toast } from "sonner";
import { getCreation, deleteCreation, listCategories, listCreations, posterUrl, bgUrl } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import EditorDialog from "@/components/EditorDialog";
import CommentsSection from "@/components/CommentsSection";
import ChapterReader from "@/components/ChapterReader";
import ShareMenu from "@/components/ShareMenu";

export default function Detail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAdmin, playAmbient, stopAmbient, isPlaying, playingId, sfx } = useApp();
  const { data: item, refetch, isLoading } = useQuery({ queryKey: ["creation", id], queryFn: () => getCreation(id) });
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const { data: allCreations = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });

  const [readerOpen, setReaderOpen] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const cardRef = useRef(null);

  // auto-play the creation ambient on open (cuts app ambience)
  useEffect(() => {
    if (item && item.has_audio) playAmbient(item.id);
    return () => stopAmbient();
    // eslint-disable-next-line
  }, [item?.id, item?.has_audio]);

  const recommendations = useMemo(() => {
    const others = allCreations.filter((c) => c.id !== id);
    for (let i = others.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [others[i], others[j]] = [others[j], others[i]]; }
    return others.slice(0, 6);
  }, [allCreations, id]);

  if (isLoading || !item) {
    return <div className="h-screen flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>Chargement…</div>;
  }

  const hasImg = item.has_poster || (item.poster && item.poster.length > 4);
  const posterSrc = item.poster && item.poster.length > 4 ? item.poster : posterUrl(item.id, item.updated_at);
  const bgSrc = item.has_bg ? bgUrl(item.id, item.updated_at) : (hasImg ? posterSrc : null);
  const thisPlaying = isPlaying && playingId === item.id;
  const catLabel = cats.find((c) => c.key === item.category)?.label || item.category;

  const ytEmbed = (url) => {
    const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  };

  const launch = () => {
    sfx("select");
    if (item.launch_type === "chapters") setChaptersOpen(true);
    else if (item.launch_type === "reader") setReaderOpen(true);
    else if (item.launch_type === "episodes") setShowEpisodes(true);
    else if (item.launch_type === "link") {
      if (item.launch_url) window.open(item.launch_url, "_blank", "noopener");
      else toast.info("Le lien du film sera bientôt disponible.");
    } else toast.success(`« ${item.title} » lancé.`);
  };

  const doDelete = async () => {
    if (!window.confirm(`Supprimer « ${item.title} » ?`)) return;
    await deleteCreation(item.id); stopAmbient(); toast.success("Supprimé"); nav("/");
  };

  const btn = { borderColor: "rgba(255,255,255,0.3)", borderRadius: "var(--radius-base)", color: "#fff", background: "rgba(0,0,0,0.25)" };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden" style={{ background: "var(--bg-primary)" }}>
      <div className="fixed inset-0 z-0" aria-hidden="true">
        {bgSrc ? (
          <div className="absolute inset-0 bg-cover bg-center scale-110" style={{ backgroundImage: `url(${bgSrc})`, filter: `blur(${item.bg_blur ?? 32}px)` }} />
        ) : (
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 30%, var(--bg-secondary), var(--bg-primary) 70%)" }} />
        )}
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${item.bg_dim ?? 0.55})` }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.25))" }} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between px-5 md:px-12 pt-6">
          <div className="flex items-center gap-2">
            <button data-testid="detail-back" onClick={() => { sfx("back"); nav(-1); }} className="flex items-center gap-2 px-3 py-2 border" style={btn}>
              <IoArrowBack /> <span className="text-sm">Retour</span>
            </button>
            <button data-testid="detail-home" onClick={() => { sfx("nav"); nav("/"); }} className="flex items-center gap-2 px-3 py-2 border" style={btn}>
              <IoHome size={16} /> <span className="text-sm">Accueil</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <ShareMenu item={item} cardRef={cardRef} />
            <button data-testid="detail-settings" onClick={() => { sfx("nav"); nav("/parametres"); }} className="p-2.5 border" style={btn}><IoSettingsOutline size={18} /></button>
            {isAdmin && (
              <>
                <button data-testid="detail-edit" onClick={() => setEditorOpen(true)} className="p-2.5 border" style={btn}><IoCreateOutline size={18} /></button>
                <button data-testid="detail-delete" onClick={doDelete} className="p-2.5 border" style={{ ...btn, color: "var(--brand)" }}><IoTrashOutline size={18} /></button>
              </>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-5 md:px-12 py-8 md:py-14 flex flex-col md:flex-row gap-8 md:gap-14 items-center md:items-start">
          <div ref={cardRef} className="flex-shrink-0 w-56 sm:w-64 md:w-80 aspect-[2/3] overflow-hidden border relative fade-up"
            style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", boxShadow: "var(--shadow-1)" }} data-testid="detail-poster">
            {hasImg ? (
              <img src={posterSrc} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "linear-gradient(160deg, var(--bg-secondary), var(--bg-primary))" }}>
                <span className="font-display text-8xl" style={{ color: "var(--brand)" }}>{item.kanji || item.title[0]}</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 p-4" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }}>
              <p className="font-display text-2xl" style={{ color: "#fff" }}>{item.title}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Stationexus 天</p>
            </div>
          </div>

          <div className="w-full md:flex-1 min-w-0 fade-up">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="text-[11px] uppercase tracking-widest px-2 py-0.5" style={{ background: "var(--brand)", color: "var(--bg-primary)" }} data-testid="detail-category">{catLabel}</span>
              <span className="font-display text-2xl" style={{ color: "var(--brand)" }}>{item.kanji}</span>
              {item.coming_soon && <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest border" style={{ borderColor: "rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.75)" }}>À venir</span>}
            </div>
            <h1 className="font-display text-4xl md:text-6xl leading-none break-words" style={{ color: "#fff", textShadow: "0 2px 20px rgba(0,0,0,0.6)" }} data-testid="detail-title">{item.title}</h1>
            <p className="mt-3 text-base md:text-lg" style={{ color: "rgba(255,255,255,0.9)" }}>{item.tagline}</p>
            <p className="mt-5 leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.72)" }}>{item.synopsis}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {!item.coming_soon && (
                <button data-testid="detail-launch" onClick={launch}
                  className="flex items-center gap-2 px-7 py-3.5 font-semibold text-lg transition-transform hover:scale-105"
                  style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)", boxShadow: "var(--shadow-1)" }}>
                  {item.launch_type === "chapters" ? <IoBookOutline size={20} /> : <IoPlay size={20} />} {item.launch_label || "Lancer"}
                </button>
              )}
              {item.buy_url && (
                <a data-testid="detail-buy" href={item.buy_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3.5 border font-medium" style={btn}>
                  <IoCart size={18} /> Acheter
                </a>
              )}
              {item.has_audio && (
                <button data-testid="detail-ambient" onClick={() => { sfx("nav"); playAmbient(item.id); }}
                  className="flex items-center gap-2 px-5 py-3.5 border font-medium" style={{ ...btn, color: thisPlaying ? "var(--brand)" : "var(--text-primary)" }}>
                  {thisPlaying ? <IoPause size={18} /> : <IoMusicalNotes size={18} />} Ambiance
                </button>
              )}
            </div>

            {(showEpisodes || item.launch_type === "episodes") && item.episodes?.length > 0 && (
              <div className="mt-10" data-testid="detail-episodes">
                <h3 className="font-display text-xl mb-3" style={{ color: "#fff" }}>Épisodes</h3>
                <div className="space-y-2">
                  {item.episodes.map((ep, i) => (
                    <div key={ep.id || i} className="flex items-center justify-between p-3 border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", background: "var(--bg-secondary)" }}>
                      <div>
                        <p style={{ color: "var(--text-primary)" }}>{ep.title}</p>
                        {ep.description && <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{ep.description}</p>}
                      </div>
                      {ep.url && <a href={ep.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand)" }}><IoOpenOutline size={18} /></a>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {item.gallery?.length > 0 && (
              <div className="mt-10" data-testid="detail-gallery">
                <h3 className="font-display text-xl mb-3" style={{ color: "#fff" }}>Galerie</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {item.gallery.map((g, i) => (
                    <button key={i} onClick={() => { sfx("nav"); setLightbox(g); }} data-testid={`gallery-img-${i}`}
                      className="aspect-square overflow-hidden border transition-transform hover:scale-[1.03]" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
                      <img src={g} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Embeds / réseaux */}
            {item.embeds?.length > 0 && (
              <div className="mt-10" data-testid="detail-embeds">
                <h3 className="font-display text-xl mb-3" style={{ color: "#fff" }}>Sur les réseaux</h3>
                <div className="space-y-4">
                  {item.embeds.map((em, i) => {
                    const yt = em.platform === "youtube" ? ytEmbed(em.url) : null;
                    if (yt) return (
                      <div key={i} className="aspect-video w-full overflow-hidden border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }} data-testid={`embed-${i}`}>
                        <iframe src={yt} title={em.label || "YouTube"} className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                    );
                    return (
                      <a key={i} href={em.url} target="_blank" rel="noopener noreferrer" onClick={() => sfx("nav")} data-testid={`embed-${i}`}
                        className="flex items-center gap-2 px-4 py-3 border font-medium" style={{ ...btn, background: "var(--bg-secondary)" }}>
                        {em.platform === "youtube" ? <IoLogoYoutube size={18} style={{ color: "var(--brand)" }} /> : <IoOpenOutline size={18} style={{ color: "var(--brand)" }} />}
                        {em.label || (em.platform === "wattpad" ? "Lire sur Wattpad" : em.platform === "youtube" ? "Voir sur YouTube" : "Ouvrir le lien")}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <CommentsSection creationId={item.id} />

            {recommendations.length > 0 && (
              <div className="mt-14" data-testid="recommendations">
                <h3 className="font-display text-xl mb-1" style={{ color: "#fff" }}>Recommandations</h3>
                <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.65)" }}>D'autres créations qui pourraient te plaire ✨</p>
                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                  {recommendations.map((r) => {
                    const rimg = r.has_poster || (r.poster && r.poster.length > 4);
                    return (
                      <button key={r.id} data-testid={`reco-${r.id}`} onClick={() => { sfx("select"); nav(`/oeuvre/${r.id}`); }}
                        className="flex-shrink-0 w-28 sm:w-32 text-left transition-transform hover:scale-105">
                        <div className="w-full aspect-[2/3] overflow-hidden border relative" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
                          {rimg ? <img src={r.poster && r.poster.length > 4 ? r.poster : posterUrl(r.id, r.updated_at)} alt={r.title} loading="lazy" className="w-full h-full object-cover" /> : (
                            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(160deg, var(--bg-secondary), var(--bg-primary))" }}>
                              <span className="font-display text-4xl" style={{ color: "var(--brand)" }}>{r.kanji || r.title[0]}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs mt-1.5 line-clamp-2" style={{ color: "rgba(255,255,255,0.85)" }}>{r.title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {readerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }} data-testid="reader-modal">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto border p-8" style={{ background: "var(--bg-secondary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl" style={{ color: "var(--text-primary)" }}>{item.title}</h2>
              <button data-testid="reader-close" onClick={() => setReaderOpen(false)} style={{ color: "var(--text-secondary)" }}><IoClose size={24} /></button>
            </div>
            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text-primary)" }}>{item.launch_content || "Contenu à venir."}</p>
          </div>
        </div>
      )}

      {chaptersOpen && <ChapterReader item={item} onClose={() => setChaptersOpen(false)} />}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.92)" }} onClick={() => setLightbox(null)} data-testid="lightbox">
          <button className="absolute top-4 right-4" style={{ color: "#fff" }} onClick={() => setLightbox(null)}><IoClose size={28} /></button>
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] object-contain" />
        </div>
      )}

      <EditorDialog open={editorOpen} onClose={() => setEditorOpen(false)} initial={item} categories={cats} onSaved={refetch} />
    </div>
  );
}
