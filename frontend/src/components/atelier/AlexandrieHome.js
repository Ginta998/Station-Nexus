import { useEffect, useState } from "react";
import { BOOKS, ROOMS, TYPES } from "@/data/alexandrie";
import { mergeCovers } from "@/data/alexandrie/covers";
import "@/components/atelier/alexandrie.css";

// Sur le Pont : reprendre une lecture, ou en commencer une. Un clic ouvre le livre à la bonne page.
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (_) { return d; } };
export default function AlexandrieHome({ at, go }) {
  const prog = read("nx-alex-progress", {});
  const [bad, setBad] = useState({});
  const covers = mergeCovers(read("nx-alex-covers", {}), at.config?.alexandrie?.covers, bad);
  const favs = read("nx-alex-fav", []);
  const favBooks = favs.map((id) => BOOKS.find((b) => b.id === id)).filter(Boolean);
  const started = BOOKS.filter((b) => prog[b.id]?.page > 0 && !favs.includes(b.id)).sort((a, b) => (prog[b.id].at || 0) - (prog[a.id].at || 0));
  const fresh = BOOKS.filter((b) => !(prog[b.id]?.page > 0) && !favs.includes(b.id)).reverse();
  const list = [...favBooks, ...started, ...fresh].slice(0, 6);
  useEffect(() => { list.forEach((b) => { const u = covers[b.id]; if (!u) return; const im = new Image(); im.onerror = () => setBad((x) => ({ ...x, [u]: 1 })); im.src = u; }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="ax-home ax-view">
      {list.map((b) => { const p = prog[b.id]; const R = ROOMS.find((r) => r.key === b.room); const going = p?.page > 0; const vhs = (b.format || (b.room === "lore" ? "vhs" : "livre")) === "vhs";
        return (
          <button key={b.id} className="ax-home-c" onClick={() => go({ name: "alexandrie", room: b.room, book: b.id })} data-testid={`atelier-home-alex-${b.id}`}>
            <span className={"ax-home-cv t-deep" + (vhs ? " vhs" : "")} style={{ "--h": b.color ?? 30, backgroundImage: covers[b.id] ? `url(${covers[b.id]})` : undefined }}>{!covers[b.id] && <i>{b.emblem || R?.kanji}</i>}{vhs && <em>VHS</em>}</span>
            <span className="ax-home-tx">
              <small className="mono">{favs.includes(b.id) ? "♥ " : ""}{going ? `PAGE ${p.page + 1} / ${p.pages}` : `${(R?.label || "").toUpperCase()} · ${(TYPES[b.type]?.label || "").toUpperCase()}`}</small>
              <b>{b.title}</b>
              <span>{b.sub}</span>
              {going && <u><i style={{ width: `${(p.page / Math.max(1, p.pages - 1)) * 100}%` }} /></u>}
            </span>
          </button>
        ); })}
    </div>
  );
}
