import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/lib/api";

// La Bunny de la Station publique (mêmes poses et habillage), animée selon ce qu'elle vit
export default function BunnySprite({ pose = "neutral", hop = 0, size = 66, className = "", testid, onClick, title }) {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const custom = settings?.cosmic_bunny_image;
  const [hopping, setHopping] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setHopping(true); const t = setTimeout(() => setHopping(false), 900); return () => clearTimeout(t);
  }, [hop]);
  const Tag = onClick ? "button" : "span";
  return (
    <Tag className={`cb-mascot bn-sprite ${custom ? "cb-custom" : ""} ${hopping ? "bn-hop" : ""} ${className}`} style={{ width: size, height: size }}
      onClick={onClick} title={title} data-testid={testid} data-pose={pose} aria-label={title || "Cosmic Bunny"}>
      {!custom && <span className="cb-stage" aria-hidden="true" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/cosmic-bunny/alley.jpg)` }} />}
      <img className="cb-sprite" src={custom || `/cosmic-bunny/${pose}.png`} alt="" draggable="false" />
      {!custom && <span className="cb-tint" aria-hidden="true" />}
    </Tag>
  );
}
