import { IoPin } from "react-icons/io5";
import { KINDS, imgSrc, stripHtml, fileType, fileNature } from "@/lib/atelier";
import { pressMenu, ITEM_MIME } from "@/components/atelier/ContextMenu";
import { itemMenu } from "@/components/atelier/itemActions";

const FT = { image: "IMAGE", pdf: "PDF", office: "OFFICE", video: "VIDÉO", audio: "AUDIO", text: "TEXTE", link: "LIEN", drive: "DRIVE", other: "FICHIER", none: "" };

const ago = (iso) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "à l'instant"; if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60); if (h < 24) return `il y a ${h} h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

export default function ItemCard({ it, at, open }) {
  const k = KINDS[it.kind] || KINDS.note;
  const u = at.universes.find((x) => x.id === it.universe_id);
  const excerpt = stripHtml(it.content).slice(0, 140);
  const m = it.kind === "file" ? (it.media || [])[0] : null;
  const ft = m ? fileType(m) : "";
  // Vignette YouTube : si l'élément est une vidéo YouTube, on montre son aperçu au lieu de « LIEN »
  const yt = m && (m.yt || (m.url && (m.url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/) || [])[1]));
  const thumb = it.image || (ft === "image" ? m.url : "") || (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : "");
  const nat = m ? fileNature(m) : "";
  return (
    <button className={`at-card k-${it.kind}`} onClick={() => open(it.id)} data-testid={`atelier-item-${it.id}`} style={{ "--u": u?.color || "var(--brand)" }}
      draggable onDragStart={(e) => { e.dataTransfer.setData(ITEM_MIME, it.id); e.dataTransfer.effectAllowed = "move"; e.currentTarget.classList.add("at-dragging"); document.body.classList.add("at-item-drag"); }}
      onDragEnd={(e) => { e.currentTarget.classList.remove("at-dragging"); document.body.classList.remove("at-item-drag"); }} {...pressMenu(() => itemMenu(it, at, open))}>
      {m && nat && <span className={"at-card-nat mono nat-" + nat.toLowerCase().replace(/[^a-z]/g, "")} data-testid={`atelier-item-nat-${it.id}`}>{nat}</span>}
      {thumb ? <div className="at-card-img"><img src={imgSrc(thumb)} alt="" loading="lazy" draggable="false" /></div> : m ? <div className="at-card-file mono"><span>{nat}</span><small>OUVRIR →</small></div> : null}
      <div className="at-card-b">
        <p className="at-card-k mono"><span className="kj">{k.kanji}</span> {k.label.toUpperCase()}{u ? ` · ${u.name}` : " · INBOX"}{it.pinned && <IoPin size={11} />}</p>
        <h3>{it.title || "Sans titre"}</h3>
        {it.kind === "character" && it.fields?.role && <p className="at-card-f">{it.fields.role}</p>}
        {it.kind === "event" && it.date && <p className="at-card-f">{it.date}</p>}
        {excerpt && <p className="at-card-x">{excerpt}</p>}
        <p className="at-card-t mono">{ago(it.updated_at)}</p>
      </div>
    </button>
  );
}
