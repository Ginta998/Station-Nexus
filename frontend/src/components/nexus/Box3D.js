import { Face } from "@/components/atelier/AlexCore";
import { EditionSpine, edOf, edCls } from "@/components/atelier/AlexEdition";

// L'objet en volume : la couverture d'Alexandrie devant, une vraie tranche sur le côté et un dos derrière.
// On le voit de trois quarts, il a une épaisseur : un livre relié, un boîtier VHS, une pochette de disque.
// Avec « open » (le lancement), il a aussi un dedans : la couverture s'ouvre comme un couvercle sur les pages du livre
// ou sur la cassette rangée dans son boîtier ; pour le disque, c'est le vinyle qui sort de sa pochette.
function Inside({ b }) {
  if (b.format === "vhs") return (
    <div className="nx-box-inner in-vhs" aria-hidden="true">
      {/* Une vraie cassette vue de dessus, debout : coque noire striée, deux fenêtres de bobine, l'étiquette au milieu */}
      <div className="nx-tape">
        <i className="nx-tape-rib l" /><i className="nx-tape-rib r" />
        <div className="nx-tape-win t"><i className="hub full" /></div>
        <div className="nx-tape-lab">
          <div className="nx-tl-top"><small>{b.house || "STATION NEXUS"}</small><b>{b.title}</b></div>
          <div className="nx-tl-band"><small>VIDEO CASSETTE</small></div>
          <div className="nx-tl-stripes"><i /><i /><i /></div>
          <div className="nx-tl-bot"><span>{b.cote || "SN-000"}<br />T-120</span><em>VHS</em></div>
        </div>
        <div className="nx-tape-win b"><i className="hub" /></div>
      </div>
    </div>
  );
  if (b.format === "vinyle") return null;
  return (
    <div className="nx-box-inner in-livre" aria-hidden="true">
      <div className="nx-bpage"><small>{b.house || "STATION NEXUS"}</small><b>{b.title}</b>{b.sub && <em>{b.sub}</em>}</div>
      <i className="nx-leaf l1" /><i className="nx-leaf l2" /><i className="nx-leaf l3" />
    </div>
  );
}

export default function Box3D({ b, cover, className = "", open = false, full = false }) {
  const front = <div className="nx-box-front"><Face b={b} cover={cover} /></div>;
  const lid = open && b.format !== "vinyle";
  return (
    <div className={`nx-box f-${b.format} ${open ? "opening" : ""} ${className}`}>
      <div className="nx-box-in">
        {open && <Inside b={b} />}
        {lid ? <div className="nx-box-lid">{front}<div className="nx-lid-in" /></div> : front}
        {edOf(b)
          ? <div className={"nx-box-side ed-side" + edCls(b)}><EditionSpine b={b} em={b.emblem || "書"}>{b.title}</EditionSpine></div>
          : <div className="nx-box-side" style={cover ? { backgroundImage: `url(${cover})` } : undefined}>
            <span>{b.title}</span>
          </div>}
        <div className="nx-box-back" />
        {full && <><div className="nx-box-edge" /><div className="nx-box-top" /><div className="nx-box-bot" /></>}
      </div>
    </div>
  );
}
