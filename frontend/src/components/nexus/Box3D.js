import { Face } from "@/components/atelier/Alexandrie";

// L'objet en volume : la couverture d'Alexandrie devant, une vraie tranche sur le côté et un dos derrière.
// On le voit de trois quarts, il a une épaisseur : un livre relié, un boîtier VHS, une pochette de disque.
export default function Box3D({ b, cover, className = "" }) {
  return (
    <div className={`nx-box f-${b.format} ${className}`}>
      <div className="nx-box-in">
        <div className="nx-box-front"><Face b={b} cover={cover} /></div>
        <div className="nx-box-side" style={cover ? { backgroundImage: `url(${cover})` } : undefined}>
          <span>{b.title}</span>
        </div>
        <div className="nx-box-back" />
      </div>
    </div>
  );
}
