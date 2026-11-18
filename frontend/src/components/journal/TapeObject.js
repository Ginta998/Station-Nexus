import "@/components/journal/tape.css";

/*
  La cassette, dessinée comme une vraie (inspirée des cassettes japonaises des années 80-90) :
  coque en plastique transparent fumé qui laisse voir la mécanique, vis, étiquette imprimée
  (bandes de couleur, marque, type, durée), fenêtre avec bobines dentées et bande brune.
*/
export function Cassette({ title = "", sub = "", side = "A", p = 0, spinning = false, starting = false, small = false }) {
  const rl = 44 - 22 * p, rr = 22 + 22 * p; // la bande passe d'une bobine à l'autre
  return (
    <span className={"cs" + (small ? " sm" : "") + (spinning ? " spin" : "") + (starting ? " starting" : "")} aria-hidden="true">
      <span className="cs-shell" />
      <span className="cs-gear l" /><span className="cs-gear r" />
      <span className="cs-screw a" /><span className="cs-screw b" /><span className="cs-screw c" /><span className="cs-screw d" /><span className="cs-screw e" />
      <span className="cs-label">
        <span className="cs-disc" />
        <span className="cs-brand"><i>SN</i><b>STATION NEXUS</b><em>AUDIO CASSETTE</em></span>
        <span className="cs-side">{side}</span>
        <span className="cs-title">{title}</span>
        {sub && <span className="cs-sub">{sub}</span>}
        <span className="cs-type"><b>NORMAL</b> TYPE I · Superior Sound</span>
        <span className="cs-len">46</span>
        <span className="cs-win">
          <span className="cs-reel l" style={{ "--tape": `${rl}%` }}><i /></span>
          <span className="cs-tape" />
          <span className="cs-reel r" style={{ "--tape": `${rr}%` }}><i /></span>
        </span>
      </span>
      <span className="cs-mouth"><i /><i /><i /></span>
      <span className="cs-gloss" />
    </span>
  );
}

// La cassette comme objet (listes du journal, Making of) : on sait que c'est un enregistrement avant de l'ouvrir.
export default function TapeObject({ e, small }) {
  return <span className="tpo" data-testid={`tape-object-${e.id}`} aria-label="Cassette audio"><Cassette title={e.tape_label || e.title} sub={e.tape_voice ? `Voix : ${e.tape_voice}` : ""} small={small} /></span>;
}
