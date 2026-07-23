import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack, IoHome, IoMegaphone, IoChevronForward } from "react-icons/io5";
import { listAnnouncements } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const fs = { background: "var(--bg-primary)", color: "var(--text-primary)", borderColor: "var(--border-c)", borderRadius: "var(--radius-base)" };

function fmt(iso) {
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); } catch { return ""; }
}

export default function Novelties() {
  const nav = useNavigate();
  const { sfx, markAnnouncementsSeen } = useApp();
  const { data: list = [], isLoading } = useQuery({ queryKey: ["announcements"], queryFn: listAnnouncements });

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
          {list.map((a) => (
            <div key={a.id} data-testid={`novelty-${a.id}`} className="flex items-start gap-3 p-4 border" style={{ ...fs, background: "var(--bg-secondary)" }}>
              <IoMegaphone size={22} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 2 }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-lg" style={{ color: "var(--text-primary)" }}>{a.title}</p>
                  <span className="text-[11px] whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{fmt(a.created_at)}</span>
                </div>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{a.text}</p>
                {a.creation_id && (
                  <button data-testid={`novelty-go-${a.id}`} onClick={() => go(a)} className="mt-2 flex items-center gap-1 text-xs font-semibold px-3 py-1.5" style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>
                    Découvrir <IoChevronForward size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
