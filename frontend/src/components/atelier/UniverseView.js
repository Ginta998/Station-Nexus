import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoCreateOutline, IoAdd, IoDownloadOutline, IoMusicalNotes } from "react-icons/io5";
import { imgSrc, isOeuvre, isFolder, oeuvreFmt, getUniPlaylist } from "@/lib/atelier";
import { toEmbed, popOut } from "@/lib/embed";
import { exportUniverseBible } from "@/lib/exportPdf";
import { listCreations, posterUrl } from "@/lib/api";
import DriveSpace from "@/components/atelier/DriveSpace";

export default function UniverseView({ at, open, go, launch, mini, universe: u, editUniverse, editOeuvre, importDocs }) {
  const nav = useNavigate();
  const playlist = getUniPlaylist(u?.id);
  const playPlaylist = () => { if (!playlist) return; const em = toEmbed(playlist); if (em?.blocked) return popOut(playlist); (mini || launch)?.({ title: `Playlist · ${u.name}`, url: playlist }); };
  const { data: creations = [] } = useQuery({ queryKey: ["creations", "all"], queryFn: () => listCreations() });
  if (!u) return null;
  const oeuvres = at.items.filter((i) => i.universe_id === u.id && isOeuvre(i));
  const allEls = at.items.filter((i) => i.universe_id === u.id && !isOeuvre(i) && !isFolder(i));
  const linked = creations.filter((c) => (u.creation_ids || []).includes(c.id));

  return (
    <section className="at-view" data-testid="atelier-universe" style={{ "--u": u.color || "var(--brand)" }}>
      <header className={"at-uhero" + (u.cover ? " has" : "")}>
        {u.cover && <img src={imgSrc(u.cover)} alt="" className="bg" />}
        <div className="in">
          <span className="k">{u.kanji || u.name[0]}</span>
          <div>
            <p className="at-eyebrow mono">// UNIVERS</p>
            <h1 data-testid="atelier-universe-name">{u.name}</h1>
            {u.description && <p className="at-sub">{u.description}</p>}
          </div>
          <div className="at-oeuvre-acts">
            {playlist && <button className="at-btn" onClick={playPlaylist} data-testid="atelier-universe-playlist"><IoMusicalNotes size={15} /> Écouter la playlist</button>}
            <button className="at-btn ghost" onClick={() => exportUniverseBible(u, allEls)} data-testid="atelier-universe-bible"><IoDownloadOutline size={15} /> Bible PDF</button>
            <button className="at-btn ghost" onClick={() => editUniverse(u)} data-testid="atelier-universe-edit"><IoCreateOutline size={15} /> Modifier</button>
          </div>
        </div>
        {linked.length > 0 && (
          <div className="at-works">
            {linked.map((c) => <button key={c.id} onClick={() => nav(`/oeuvre/${c.id}`)} title={c.title}><img src={posterUrl(c.id, c.updated_at, 200)} alt={c.title} /></button>)}
          </div>
        )}
      </header>

      <section className="at-oeuvres-sec" data-testid="atelier-universe-oeuvres">
        <div className="at-sechead"><div className="tt"><p className="at-eyebrow mono">// LES ŒUVRES DE CET UNIVERS</p><h2>Œuvres</h2></div><span className="at-link" onClick={() => editOeuvre({ universe_id: u.id })} data-testid="atelier-oeuvre-new"><IoAdd size={13} /> Nouvelle œuvre</span></div>
        {oeuvres.length > 0 ? (
          <div className="at-unis-big">
            {oeuvres.map((o) => {
              const f = oeuvreFmt(o); const n = at.items.filter((i) => i.fields?.oeuvre_id === o.id && !isFolder(i)).length;
              return (
                <button key={o.id} className="at-uni-big" onClick={() => go({ name: "oeuvre", id: o.id })} style={{ "--u": o.fields?.color || u.color || "var(--brand)" }} data-testid={`atelier-oeuvre-${o.id}`}>
                  <span className="cov">{o.image ? <img src={imgSrc(o.image)} alt="" loading="lazy" /> : <span className="k">{o.fields?.kanji || f.kanji}</span>}</span>
                  <span className="t"><b>{o.title || "Sans titre"}</b><small>{f.label.toUpperCase()} · {n} ÉLÉMENT{n > 1 ? "S" : ""}</small></span>
                </button>
              );
            })}
          </div>
        ) : <p className="at-empty">Pas encore d'œuvre ici. Une série, un film, un livre… chacun aura son espace, son affiche et son réseau d'éléments.</p>}
      </section>

      <DriveSpace at={at} open={open} importDocs={importDocs} universe_id={u.id} label={u.name} />
    </section>
  );
}
