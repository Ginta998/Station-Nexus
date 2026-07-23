import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack, IoHome, IoMegaphone, IoChevronForward } from "react-icons/io5";
import { listAnnouncements, listCreations, posterUrl } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const fs = { background: "var(--bg-primary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" };

function fmt(iso) {
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); } catch { return ""; }
}

export default function Novelties() {
  const nav = useNavigate();
  const { sfx, markAnnouncementsSeen } = useApp();
  const { data: list = [], isLoading } = useQuery({ queryKey: ["announcements"], queryFn: listAnnouncements });
  const { data: creations = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const byId = useMemo(() => Object.fromEntries(creations.map((c) => [c.id, c])), [creations]);

  useEffect(() => { if (list.length) markAnnouncementsSeen(list.map((a) => a.id)); }, [list, markAnnouncementsSeen]);

  const go = (a) => { if (a.creation_id) { sfx("select"); nav(`/oeuvre/${a.creation_id}`); } };

  return (
    <div className="relative min-h-screen w-full" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-8">
        <div className="flex items-center gap-2 mb-8">
          <button data-testid="novelties-back" onClick={() => { sfx("back"); nav(-1); }} className="flex items-center gap-2 px-3 py-2 border" style={fs}><IoArrowBack /> <span className="text-sm">Retour</span></button>
          <button data-testid="novelties-home" onClick={() => { sfx("nav"); nav("/"); }} className="flex items-center gap-2 px-3 py-2 border" style={fs}><IoHome size={16} /> <span className="text-sm">Accueil</span></button>
        </div>

        <h1 className="font-display text-4xl md:text-5xl mb-2" style={{ color: "var(--text-primary)" }}>Nouveautés</h1>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>Les dernières annonces, nouveaux chapitres et épisodes.</p>

        {(!isLoading && list.length === 0) && (
          <p style={{ color: "var(--text-secondary)" }} data-testid="novelties-empty">Aucune nouveauté pour l'instant. Reviens bientôt !</p>
        )}

        <div className="space-y-3" data-testid="novelties-list">
          {list.map((a) => {
            const c = a.creation_id ? byId[a.creation_id] : null;
            return (
              <div key={a.id} data-testid={`novelty-${a.id}`} className="flex items-stretch gap-4 p-4 border" style={{ ...fs, background: "var(--bg-secondary)" }}>
                {c ? (
                  <button onClick={() => go(a)} className="flex-shrink-0 w-16 md:w-20 aspect-[2/3] overflow-hidden rounded" style={{ borderRadius: "var(--radius-base)", background: "var(--bg-primary)" }} data-testid={`novelty-poster-${a.id}`}>
                    {c.has_poster || (c.poster && c.poster.length > 4)
                      ? <img src={c.poster && c.poster.length > 4 ? c.poster : posterUrl(c.id, c.updated_at)} alt={c.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center font-display text-3xl" style={{ color: "var(--brand)" }}>{c.kanji || c.title[0]}</div>}
                  </button>
                ) : (
                  <div className="flex-shrink-0 w-12 flex items-start justify-center pt-1"><IoMegaphone size={24} style={{ color: "var(--brand)" }} /></div>
                )}
                <div className="min-w-0 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {c && <p className="text-xs uppercase tracking-widest truncate" style={{ color: "var(--brand)" }} data-testid={`novelty-creation-${a.id}`}>{c.title}</p>}
                      <p className="font-display text-lg md:text-xl leading-tight" style={{ color: "var(--text-primary)" }} data-testid={`novelty-title-${a.id}`}>{a.title}</p>
                    </div>
                    <span className="text-[11px] whitespace-nowrap mt-0.5" style={{ color: "var(--text-secondary)" }}>{fmt(a.created_at)}</span>
                  </div>
                  {a.text && <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{a.text}</p>}
                  {c && (
                    <button data-testid={`novelty-go-${a.id}`} onClick={() => go(a)} className="mt-auto self-start flex items-center gap-1 text-xs font-semibold px-3 py-1.5" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
                      Découvrir <IoChevronForward size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
