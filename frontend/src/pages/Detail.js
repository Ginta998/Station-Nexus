import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import { IoArrowBack, IoPlay, IoPause, IoClose, IoShareSocial, IoCart, IoCreateOutline, IoTrashOutline, IoMusicalNotes, IoOpenOutline } from "react-icons/io5";
import { toast } from "sonner";
import { getCreation, deleteCreation } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import EditorDialog from "@/components/EditorDialog";

export default function Detail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { isAdmin, playAmbient, stopAmbient, isPlaying, playingId } = useApp();
  const { data: item, refetch, isLoading } = useQuery({ queryKey: ["creation", id], queryFn: () => getCreation(id) });

  const [readerOpen, setReaderOpen] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const cardRef = useRef(null);

  if (isLoading || !item) {
    return <div className="h-screen flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>Chargement…</div>;
  }

  const hasImg = item.poster && item.poster.length > 4;
  const thisPlaying = isPlaying && playingId === item.id;

  const launch = () => {
    if (item.has_audio) playAmbient(item.id);
    if (item.launch_type === "reader") setReaderOpen(true);
    else if (item.launch_type === "episodes") setShowEpisodes(true);
    else if (item.launch_type === "link") {
      if (item.launch_url) window.open(item.launch_url, "_blank", "noopener");
      else toast.info("Le lien du film sera bientôt disponible.");
    } else {
      toast.success(`« ${item.title} » lancé.`);
    }
  };

  const doDelete = async () => {
    if (!window.confirm(`Supprimer « ${item.title} » ?`)) return;
    await deleteCreation(item.id);
    stopAmbient();
    toast.success("Supprimé");
    nav("/");
  };

  const share = async () => {
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2, useCORS: true });
      const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
      const file = new File([blob], `${item.title}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: item.title, text: `${item.title} — Stationexus` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${item.title}.png`; a.click();
        URL.revokeObjectURL(url);
        toast.success("Carte téléchargée");
      }
    } catch {
      toast.error("Partage impossible");
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* bg */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        {hasImg ? (
          <div className="absolute inset-0 bg-cover bg-center scale-110" style={{ backgroundImage: `url(${item.poster})`, filter: "blur(32px) brightness(0.45)" }} />
        ) : (
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 30%, var(--bg-secondary), var(--bg-primary) 70%)" }} />
        )}
        <div className="absolute inset-0" style={{ background: "var(--scrim)" }} />
      </div>

      <div className="relative z-10">
        {/* top bar */}
        <div className="flex items-center justify-between px-5 md:px-12 pt-6">
          <button data-testid="detail-back" onClick={() => nav(-1)} className="flex items-center gap-2 px-3 py-2 border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)" }}>
            <IoArrowBack /> <span className="text-sm">Retour</span>
          </button>
          <div className="flex items-center gap-2">
            <button data-testid="detail-share" onClick={share} className="p-2.5 border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)" }}><IoShareSocial size={18} /></button>
            {isAdmin && (
              <>
                <button data-testid="detail-edit" onClick={() => setEditorOpen(true)} className="p-2.5 border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)" }}><IoCreateOutline size={18} /></button>
                <button data-testid="detail-delete" onClick={doDelete} className="p-2.5 border" style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--brand)" }}><IoTrashOutline size={18} /></button>
              </>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-5 md:px-12 py-8 md:py-14 flex flex-col md:flex-row gap-8 md:gap-14 items-center md:items-start">
          {/* Poster (shareable card) */}
          <div ref={cardRef} className="flex-shrink-0 w-56 sm:w-64 md:w-80 aspect-[2/3] overflow-hidden border relative fade-up"
            style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", boxShadow: "var(--shadow-1)" }} data-testid="detail-poster">
            {hasImg ? (
              <img src={item.poster} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
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

          {/* Info */}
          <div className="flex-1 fade-up">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-display text-2xl" style={{ color: "var(--brand)" }}>{item.kanji}</span>
              {item.coming_soon && <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest" style={{ background: "var(--brand)", color: "var(--bg-primary)" }}>À venir</span>}
            </div>
            <h1 className="font-display text-4xl md:text-6xl leading-none" style={{ color: "var(--text-primary)" }} data-testid="detail-title">{item.title}</h1>
            <p className="mt-3 text-base md:text-lg" style={{ color: "var(--brand)" }}>{item.tagline}</p>
            <p className="mt-5 leading-relaxed max-w-xl" style={{ color: "var(--text-secondary)" }}>{item.synopsis}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {!item.coming_soon && (
                <button data-testid="detail-launch" onClick={launch}
                  className="flex items-center gap-2 px-7 py-3.5 font-semibold text-lg transition-transform hover:scale-105"
                  style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)", boxShadow: "var(--shadow-1)" }}>
                  <IoPlay size={20} /> {item.launch_label || "Lancer"}
                </button>
              )}
              {item.buy_url && (
                <a data-testid="detail-buy" href={item.buy_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3.5 border font-medium transition-colors"
                  style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: "var(--text-primary)" }}>
                  <IoCart size={18} /> Acheter
                </a>
              )}
              {item.has_audio && (
                <button data-testid="detail-ambient" onClick={() => playAmbient(item.id)}
                  className="flex items-center gap-2 px-5 py-3.5 border font-medium"
                  style={{ borderColor: "var(--border-c)", borderRadius: "var(--radius-base)", color: thisPlaying ? "var(--brand)" : "var(--text-primary)" }}>
                  {thisPlaying ? <IoPause size={18} /> : <IoMusicalNotes size={18} />} Ambiance
                </button>
              )}
            </div>

            {/* Episodes */}
            {(showEpisodes || item.launch_type === "episodes") && (item.episodes?.length > 0) && (
              <div className="mt-10" data-testid="detail-episodes">
                <h3 className="font-display text-xl mb-3" style={{ color: "var(--text-primary)" }}>Épisodes</h3>
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
          </div>
        </div>
      </div>

      {/* Reader modal */}
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

      <EditorDialog open={editorOpen} onClose={() => setEditorOpen(false)} initial={item} onSaved={refetch} />
    </div>
  );
}
