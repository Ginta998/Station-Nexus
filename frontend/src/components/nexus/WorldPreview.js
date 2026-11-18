import { useEffect, useRef, useState } from "react";
import NexusWorld from "@/components/nexus/NexusWorld";

// Le vrai monde de l'œuvre, en miniature (rendu à 1440 × 900 puis réduit) : ce qu'on voit est exactement ce qu'on aura.
export default function WorldPreview({ t, form, cover, bg, replay = 0 }) {
  const box = useRef(null); const [k, setK] = useState(0.4);
  useEffect(() => {
    const el = box.current; if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setK(Math.max(0.15, e.contentRect.width / 1440))); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const item = { ...form, id: form.id || "wt-preview", title: form.title || "Titre de l'œuvre", chapters: form.chapters || [], episodes: form.episodes || [] };
  return (
    <div className="wtp" ref={box} style={{ height: Math.round(900 * k) }} aria-hidden="true" data-testid="wt-real-preview">
      <div className="wtp-in" style={{ transform: `scale(${k})` }}>
        <NexusWorld key={t.base} item={item} ws={t.base} wt={{ ...t, cursor: "none", replay }} cover={cover} bg={bg} making={[]} catLabel=""
          sfx={() => {}} onExit={() => {}} onHome={() => {}} unitLocked={() => false} launchLabel="Lancer" fav={false} onFav={() => {}} />
      </div>
    </div>
  );
}
