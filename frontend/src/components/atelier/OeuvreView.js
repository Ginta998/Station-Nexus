import { IoArrowBack, IoCreateOutline, IoDocumentTextOutline, IoDownloadOutline, IoMusicalNotes } from "react-icons/io5";
import { isOeuvre, isFolder, oeuvreFmt, imgSrc } from "@/lib/atelier";
import { toEmbed, popOut } from "@/lib/embed";
import { exportOeuvre } from "@/lib/exportPdf";
import DriveSpace from "@/components/atelier/DriveSpace";
import { archiveCodes, uniCode, words, fmtDate } from "@/lib/archive";

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
  const code = archiveCodes(at.items)[o.id] || "O-000";
  const status = (o.fields?.status || "En cours").toUpperCase();

  return (
    <section className="at-view" data-testid="atelier-oeuvre" style={{ "--u": col }}>
      <button className="at-link at-back" onClick={() => (u ? go({ name: "universe", id: u.id }) : go({ name: "universes" }))}><IoArrowBack size={13} /> {u ? u.name : "Archives"}</button>

      {/* Dossier d'archive de l'œuvre : planche (affiche), code, classification, tampon de statut */}
      <header className="ar-file" data-testid="atelier-oeuvre-file">
        <div className="ar-plate">
          {o.image ? <img src={imgSrc(o.image)} alt={`Affiche de ${o.title || "l'œuvre"}`} /> : <span className="ar-kj" aria-hidden="true">{kanji}</span>}
          <span className="ar-cap mono">PLANCHE 01 · AFFICHE</span>
        </div>
        <div className="ar-body">
          <p className="ar-path mono"><span>ARCHIVES</span> / <span>ŒUVRES</span> / <b>{code}</b><i>記録</i></p>
          <h1 data-testid="atelier-oeuvre-name">{o.title || "Œuvre sans titre"}</h1>
          {o.fields?.desc && <p className="ar-desc">{o.fields.desc}</p>}
          <span className="ar-stamp mono" aria-label={`Statut : ${status}`}>{status}</span>
          <dl className="ar-meta">
            <div><dt>Code</dt><dd className="mono">{code}</dd></div>
            <div><dt>Format</dt><dd>{fmt.label}</dd></div>
            <div><dt>Univers</dt><dd>{u ? <button className="ar-lnk" onClick={() => go({ name: "universe", id: u.id })}>{u.name} <span aria-hidden="true">↗</span></button> : "—"}</dd></div>
            <div><dt>Réf. univers</dt><dd className="mono">{u ? uniCode(at.universes, u.id) : "—"}</dd></div>
            <div><dt>Éléments</dt><dd className="mono">{String(els.length).padStart(2, "0")}</dd></div>
            <div><dt>Scénario</dt><dd className="mono">{words(o.content).toLocaleString("fr-FR")} mots</dd></div>
            <div><dt>Ouvert le</dt><dd className="mono">{fmtDate(o.created_at, true)}</dd></div>
            <div><dt>Modifié le</dt><dd className="mono">{fmtDate(o.updated_at, true)}</dd></div>
          </dl>
          <div className="ar-acts">
            <button className="at-btn" onClick={() => open(o.id)} data-testid="atelier-oeuvre-scenario"><IoDocumentTextOutline size={15} /> Le scénario</button>
            {o.fields?.playlist && <button className="at-btn ghost" onClick={() => { const em = toEmbed(o.fields.playlist); if (em?.blocked) return popOut(o.fields.playlist); (mini || launch)?.({ title: `Playlist · ${o.title}`, url: o.fields.playlist }); }} data-testid="atelier-oeuvre-playlist"><IoMusicalNotes size={15} /> Playlist</button>}
            <button className="at-btn ghost" onClick={() => exportOeuvre(o, els, u)} data-testid="atelier-oeuvre-pdf"><IoDownloadOutline size={15} /> Exporter PDF</button>
            <button className="at-btn ghost" onClick={() => editOeuvre(o)} data-testid="atelier-oeuvre-edit"><IoCreateOutline size={15} /> Modifier</button>
          </div>
        </div>
      </header>
      <p className="ar-sec mono"><b>02</b> CONTENU DU DOSSIER <i>· {els.length} élément{els.length > 1 ? "s" : ""}</i></p>

      <DriveSpace at={at} open={open} importDocs={importDocs} universe_id={o.universe_id} oeuvre_id={id} label={o.title || "Œuvre"} />
    </section>
  );
}
