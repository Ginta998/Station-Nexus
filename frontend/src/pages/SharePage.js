import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { IoArrowBack, IoShareSocialOutline, IoCopyOutline, IoSparklesOutline } from "react-icons/io5";
import { listCreations, listCategories, posterUrl, getCreation, getSettings, shareLink } from "@/lib/api";
import { WT_BASE, worldThemeOf } from "@/lib/worldThemes";
import ShareCardDialog from "@/components/nexus/ShareCardDialog";
import "@/pages/shelf.css";

/*
  Partager : la page du menu qui rassemble tout. La station elle-même (le lien de ta bio), chaque œuvre, et sa dernière sortie.
  Chaque carte se dessine aux couleurs du monde de l'œuvre ; le lien envoyé montre l'affiche dans WhatsApp, Messages, Discord…
*/
const palOf = (c) => {
  const ws = c?.world_style || ""; const t = worldThemeOf(ws);
  const b = t ? { paper: t.paper, ink: t.ink, hl: t.hl, ft: t.ft, fu: t.fu } : WT_BASE[ws];
  if (!b) return null;
  return { paper: b.paper || "#0b0c10", ink: b.ink || "#f1f2f5", hl: b.hl || "#d4b26a", ft: b.ft || "Playfair Display", fu: b.fu || "Space Grotesk", fb: b.fb || b.fu || "Georgia", ws };
};

export default function SharePage() {
  const nav = useNavigate();
  const { data: all = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const { data: st } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [open, setOpen] = useState(null); // { item, unit, poster, pal, catLabel }
  const works = useMemo(() => [...all].filter((c) => c.category !== "avenir").sort((a, b) => (a.order || 0) - (b.order || 0)), [all]);
  const catLabel = (c) => cats.find((k) => k.key === c.category)?.label || "";
  const cover = (c) => (c.has_poster ? posterUrl(c.id, c.updated_at, 640) : null);
  const work = (c) => setOpen({ item: c, poster: cover(c), pal: palOf(c), catLabel: catLabel(c) });
  const latest = async (c) => {
    try {
      const full = await getCreation(c.id); const key = full.launch_type === "chapters" ? "chapters" : "episodes";
      const units = full[key] || []; if (!units.length) { work(full); return; }
      const now = Date.now(); let i = units.length - 1; while (i > 0 && units[i].release_at && new Date(units[i].release_at).getTime() > now) i--;
      const u = units[i]; setOpen({ item: full, unit: { kind: key === "chapters" ? "chapter" : "episode", index: i + 1, title: u.title || "", release_at: u.release_at || "" }, poster: cover(c), pal: palOf(full), catLabel: catLabel(c) });
    } catch (_) { toast.error("Impossible de charger cette œuvre"); }
  };
  const station = { id: "", title: st?.name ? `Station Nexus · ${st.name}` : "Station Nexus", tagline: st?.bio || "", synopsis: st?.bio || "" };
  return (
    <main className="sh shp" data-testid="share-page">
      <header className="sh-h">
        <button className="sh-back" onClick={() => nav(-1)} aria-label="Retour"><IoArrowBack size={18} /></button>
        <div><p className="sh-k">FAIRE CONNAÎTRE</p><h1>Partager</h1><p className="sh-sub">Une belle carte pour chaque œuvre et chaque sortie, aux couleurs de son monde : pour une story, un post, ou un message. Le lien envoyé montre l'affiche dans WhatsApp, Messages et Discord.</p></div>
      </header>

      <section className="shp-station">
        <div><b>La station</b><span>Le lien à mettre dans ta bio Instagram, TikTok, YouTube…</span><code>{window.location.origin}</code></div>
        <div className="shp-acts">
          <button onClick={() => navigator.clipboard?.writeText(window.location.origin + "/?utm_source=instagram").then(() => toast.success("Lien de bio copié (Instagram reconnu dans Tes chiffres)"))}><IoCopyOutline size={15} /> Lien de bio</button>
          <button className="main" onClick={() => setOpen({ item: station, poster: null, pal: null, catLabel: "La station" })} data-testid="share-station"><IoShareSocialOutline size={15} /> Carte de la station</button>
        </div>
      </section>

      <h2>Les œuvres</h2>
      <div className="shp-grid">
        {works.map((c) => (
          <article key={c.id} className="shp-w" data-testid={`share-work-${c.id}`}>
            <span className="shp-img" style={cover(c) ? { backgroundImage: `url(${cover(c)})` } : undefined} />
            <div className="shp-t"><b>{c.title}</b><small>{catLabel(c)}</small></div>
            <div className="shp-acts">
              <button className="main" onClick={() => work(c)}><IoShareSocialOutline size={14} /> L'œuvre</button>
              {(c.chapters_count || c.episodes?.length || c.launch_type) && <button onClick={() => latest(c)} data-testid={`share-latest-${c.id}`}><IoSparklesOutline size={14} /> Dernière sortie</button>}
              <button onClick={() => navigator.clipboard?.writeText(shareLink(c.id)).then(() => toast.success("Lien copié (avec l'aperçu de l'affiche)"))} aria-label={`Copier le lien de ${c.title}`}><IoCopyOutline size={14} /></button>
            </div>
          </article>
        ))}
      </div>
      {open && <ShareCardDialog item={open.item} unit={open.unit} poster={open.poster} pal={open.pal} catLabel={open.catLabel} onClose={() => setOpen(null)} />}
    </main>
  );
}
