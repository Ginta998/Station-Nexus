import { IoLeafOutline, IoVolumeMute } from "react-icons/io5";
import { useAmbient, setAmbientMuted, setAmbientVol, toggleLayer, layerKey, ambientLabel } from "@/lib/ambient";

// Mixeur des sons d'ambiance du thème : coupe et volume à part de la musique et des bruitages
export default function AmbientMixer() {
  const a = useAmbient();
  if (!a.layers.length) return null;
  return (
    <div className="amb-mix" data-testid="ambient-mixer">
      <div className="amb-h"><span><IoLeafOutline size={13} /> SONS D'AMBIANCE</span>
        <button className={a.muted ? "on" : ""} onClick={() => setAmbientMuted(!a.muted)} data-testid="ambient-mute">{a.muted ? <><IoVolumeMute size={13} /> Coupés</> : "Couper"}</button>
      </div>
      {!a.muted && <>
        <input type="range" min="0" max="1" step="0.01" value={a.vol} onChange={(e) => setAmbientVol(+e.target.value)} data-testid="ambient-volume" />
        <div className="amb-chips">{a.layers.map((l) => <button key={layerKey(l)} className={a.off[layerKey(l)] ? "" : "on"} onClick={() => toggleLayer(layerKey(l))} data-testid={`ambient-layer-${l.id}`}>{ambientLabel(l)}</button>)}</div>
      </>}
    </div>
  );
}
