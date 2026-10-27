import { IoPin } from "react-icons/io5";
import { KINDS, imgSrc, stripHtml, fileType } from "@/lib/atelier";

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
  const thumb = it.image || (ft === "image" ? m.url : "");
  return (
    <button className={`at-card k-${it.kind}`} onClick={() => open(it.id)} data-testid={`atelier-item-${it.id}`} style={{ "--u": u?.color || "var(--brand)" }}>
      {thumb ? <div className="at-card-img"><img src={imgSrc(thumb)} alt="" loading="lazy" /></div> : m ? <div className="at-card-file mono"><span>{ft === "link" || ft === "drive" ? FT[ft] : (m.name || "").split(".").pop().slice(0, 5).toUpperCase() || FT[ft]}</span><small>{FT[ft]} · OUVRIR</small></div> : null}
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
