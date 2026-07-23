import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IoClose, IoMegaphone, IoChevronForward } from "react-icons/io5";
import { listAnnouncements } from "@/lib/api";
import { useApp } from "@/context/AppContext";

export default function AnnouncementBanner() {
  const nav = useNavigate();
  const { sfx, seenAnnouncements, markAnnouncementsSeen } = useApp();
  const { data: list = [] } = useQuery({ queryKey: ["announcements"], queryFn: listAnnouncements });

  const unseen = list.filter((a) => !seenAnnouncements.includes(a.id));
  if (!unseen.length) return null;
  const a = unseen[0];

  const dismiss = () => markAnnouncementsSeen([a.id]);
  const go = () => { markAnnouncementsSeen([a.id]); if (a.creation_id) { sfx("select"); nav(`/oeuvre/${a.creation_id}`); } };

  return (
    <div className="mx-5 md:mx-12 mt-3 flex items-center gap-3 px-4 py-3 border fade-up" data-testid="announcement-banner"
      style={{ background: "rgba(0,0,0,0.4)", borderColor: "var(--brand)", borderRadius: "var(--radius-base)", backdropFilter: "blur(8px)" }}>
      <IoMegaphone size={20} style={{ color: "var(--brand)", flexShrink: 0 }} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate" style={{ color: "var(--on-media)" }}>{a.title}</p>
        <p className="text-xs truncate" style={{ color: "var(--on-media-2)" }}>{a.text}</p>
      </div>
      {a.creation_id && (
        <button data-testid="announcement-go" onClick={go} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 whitespace-nowrap"
          style={{ background: "var(--brand)", color: "var(--bg-primary)", borderRadius: "var(--radius-base)" }}>Découvrir <IoChevronForward size={12} /></button>
      )}
      <button data-testid="announcement-dismiss" onClick={dismiss} className="p-1" style={{ color: "var(--on-media-2)" }}><IoClose size={18} /></button>
    </div>
  );
}
