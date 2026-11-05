import { IoArrowBack, IoCreateOutline, IoDocumentTextOutline, IoDownloadOutline, IoMusicalNotes } from "react-icons/io5";
import { isOeuvre, isFolder, oeuvreFmt, imgSrc } from "@/lib/atelier";
import { toEmbed, popOut } from "@/lib/embed";
import { exportOeuvre } from "@/lib/exportPdf";
import DriveSpace from "@/components/atelier/DriveSpace";

// L'espace d'une Œuvre : affiche, pitch, scénario + son Nexus Drive (dossiers & éléments dédiés).
export default function OeuvreView({ at, open, go, launch, mini, id, importDocs, editOeuvre }) {
  const o = at.items.find((i) => i.id === id);
  if (!o || !isOeuvre(o)) {
    return <section className="at-view"><p className="at-empty big">Cette œuvre est introuvable. <button className="at-link" onClick={() => go({ name: "universes" })}>Retour aux archives</button></p></section>;
  }
  const fmt = oeuvreFmt(o);
  const u = at.universes.find((x) => x.id === o.universe_id);
  const col = o.fields?.color || u?.color || "var(--brand)";
  const kanji = o.fields?.kanji || fmt.kanji;
  const els = at.items.filter((i) => i.fields?.oeuvre_id === id && !isFolder(i));

  return (
    <section className="at-view" data-testid="atelier-oeuvre" style={{ "--u": col }}>
      <button className="at-link at-back" onClick={() => (u ? go({ name: "universe", id: u.id }) : go({ name: "universes" }))}><IoArrowBack size={13} /> {u ? u.name : "Archives"}</button>

      <header className={"at-uhero" + (o.image ? " has" : "")}>
        {o.image && <img src={imgSrc(o.image)} alt="" className="bg" />}
        <div className="in">
          <span className="k">{kanji}</span>
          <div>
            <p className="at-eyebrow mono">// ŒUVRE · {fmt.label.toUpperCase()}{u ? ` · ${u.name.toUpperCase()}` : ""}</p>
            <h1 data-testid="atelier-oeuvre-name">{o.title || "Œuvre sans titre"}</h1>
            {o.fields?.desc && <p className="at-sub">{o.fields.desc}</p>}
            <p className="at-sub">{els.length} élément{els.length > 1 ? "s" : ""} · {o.fields?.status || "en cours"}</p>
          </div>
          <div className="at-oeuvre-acts">
            <button className="at-btn" onClick={() => open(o.id)} data-testid="atelier-oeuvre-scenario"><IoDocumentTextOutline size={15} /> Le scénario</button>
            {o.fields?.playlist && <button className="at-btn ghost" onClick={() => { const em = toEmbed(o.fields.playlist); if (em?.blocked) return popOut(o.fields.playlist); (mini || launch)?.({ title: `Playlist · ${o.title}`, url: o.fields.playlist }); }} data-testid="atelier-oeuvre-playlist"><IoMusicalNotes size={15} /> Playlist</button>}
            <button className="at-btn ghost" onClick={() => exportOeuvre(o, els, u)} data-testid="atelier-oeuvre-pdf"><IoDownloadOutline size={15} /> Exporter PDF</button>
            <button className="at-btn ghost" onClick={() => editOeuvre(o)} data-testid="atelier-oeuvre-edit"><IoCreateOutline size={15} /> Modifier</button>
          </div>
        </div>
      </header>

      <DriveSpace at={at} open={open} importDocs={importDocs} universe_id={o.universe_id} oeuvre_id={id} label={o.title || "Œuvre"} />
    </section>
  );
}
