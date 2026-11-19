import "@/components/journal/tape.css";
import { mediaUrl } from "@/lib/api";

/*
  La cassette, dessinée comme les VHS d'Alexandrie : plastique noir mat rayé, vis, étiquette de papier usée
  (bandeau, titre écrit à la main, bandes de couleur tirées du titre), fenêtre avec bobines dentées et bande brune.
*/
const hue = (str = "") => { let h = 0; for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; };
export function Cassette({ title = "", sub = "", side = "A", p = 0, spinning = false, starting = false, small = false, img = "" }) {
  const rl = 44 - 22 * p, rr = 22 + 22 * p; // la bande passe d'une bobine à l'autre
  return (
    <span className={"cs" + (small ? " sm" : "") + (spinning ? " spin" : "") + (starting ? " starting" : "") + (img ? " has-img" : "")} style={{ "--h": hue(title) }} aria-hidden="true">
      <span className="cs-shell" />
      <span className="cs-gear l" /><span className="cs-gear r" />
      <span className="cs-screw a" /><span className="cs-screw b" /><span className="cs-screw c" /><span className="cs-screw d" /><span className="cs-screw e" />
      <span className="cs-label">
        {img && <span className="cs-photo" style={{ backgroundImage: `url(${mediaUrl(img)})` }} />}
        <span className="cs-band"><b>C-46</b><span>STATION NEXUS · AUDIO</span><i>{side}</i></span>
        <span className="cs-title">{title}</span>
        {sub && <span className="cs-sub">{sub}</span>}
        <span className="cs-stripes" />
        <span className="cs-win">
          <span className="cs-reel l" style={{ "--tape": `${rl}%` }}><i /></span>
          <span className="cs-tape" />
          <span className="cs-reel r" style={{ "--tape": `${rr}%` }}><i /></span>
        </span>
      </span>
      <span className="cs-mouth"><i /><i /><i /></span>
      <span className="cs-wear" />
      <span className="cs-gloss" />
    </span>
  );
}

// La cassette comme objet (listes du journal, Making of) : on sait que c'est un enregistrement avant de l'ouvrir.
export default function TapeObject({ e, small }) {
  return <span className="tpo" data-testid={`tape-object-${e.id}`} aria-label="Cassette audio"><Cassette title={e.tape_label || e.title} sub={e.tape_voice ? `Voix : ${e.tape_voice}` : ""} small={small} img={e.cover} /></span>;
}
