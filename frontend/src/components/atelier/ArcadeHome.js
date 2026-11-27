import { useEffect, useState } from "react";
import { IoPlayForward, IoTimeOutline, IoAdd } from "react-icons/io5";
import { arcadeApi, pf, playTime, ago } from "@/lib/arcade";
import GameBox from "@/components/atelier/ArcadeCart";
import "@/components/atelier/arcade.css";

// Sur le Pont : reprendre sa partie en un geste (la capture de la dernière partie, sinon la boîte du jeu).
export default function ArcadeHome({ go }) {
  const [games, setGames] = useState(null);
  useEffect(() => { arcadeApi.list().then(setGames, () => setGames([])); }, []);
  if (games === null) return <div className="ar-home ar-home-wait" aria-hidden="true" />;
  const ready = games.filter((g) => g.ready !== false && g.kind !== "wish");
  const played = ready.filter((g) => g.last_played_at).sort((a, b) => b.last_played_at.localeCompare(a.last_played_at));
  const list = (played.length ? played : [...ready].sort((a, b) => (b.added_at || "").localeCompare(a.added_at || ""))).slice(0, 3);
  if (!list.length) return (
    <button className="ar-home-empty" onClick={() => go({ name: "arcade" })} data-testid="atelier-home-arcade-empty"><IoAdd size={18} /> Ajoute ton premier jeu à la ludothèque</button>
  );
  return (
    <div className="ar-home" data-testid="atelier-home-arcade-list">
      {list.map((g, i) => {
        const shot = g.prefs?.shots?.auto?.img; const p = pf(g.platform); const going = !!g.last_played_at;
        return (
          <button key={g.id} className={"ar-resume ar-home-c" + (i === 0 && going ? " first" : "")} style={{ "--pc": p.color }}
            onClick={() => go({ name: "arcade", play: g.id, resume: going && shot ? "auto" : null, t: Date.now() })} data-testid={`atelier-home-arcade-${g.id}`}>
            {shot ? <span className="ar-resume-shot" style={{ backgroundImage: `url("${shot}")` }}><i className="ar-pill">{p.short}</i></span>
              : <span className="ar-home-box"><GameBox g={g} size={0.5} /></span>}
            <span className="ar-resume-txt">
              <small className="mono">{going ? "REPRENDRE" : "NOUVEAU · " + p.short}</small>
              <b>{g.title}</b>
              <em><IoTimeOutline size={12} /> {going ? `${ago(g.last_played_at)} · ${playTime(g.play_seconds)}` : "jamais lancé"}</em>
            </span>
            <span className="ar-resume-go"><IoPlayForward size={18} /></span>
          </button>
        );
      })}
    </div>
  );
}
