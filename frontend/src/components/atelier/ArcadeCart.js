import { pf } from "@/lib/arcade";

// Le support d'un jeu sur l'étagère, selon sa console : cartouche (GBA, Game Boy, grosse cartouche de salon),
// boîtier, carte (DS), boîtier de CD (PlayStation), affiche de borne (arcade). Dessins génériques, sans marque.
// Sans artwork, l'étiquette se dessine d'elle-même avec le titre (couleur tirée du titre).
export const SHELLS = [["", "Couleur de la console"], ["gris", "Gris"], ["nuit", "Noire"], ["violet", "Violet translucide"], ["glacier", "Glacier translucide"], ["rouge", "Rouge"], ["or", "Or"]];

const hue = (s = "") => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };

export function Cartridge({ g, mini = false }) {
  const p = pf(g.platform);
  const shell = g.prefs?.shell || "";
  const art = g.cover ? { backgroundImage: `url("${g.cover}")` } : undefined;
  return (
    <span className={`ar-cart m-${p.media}${shell ? " sh-" + shell : ""}${mini ? " mini" : ""}${g.ready === false && g.kind === "wish" ? " nofile" : ""}`} style={{ "--ar-h": hue(g.title), "--pc": p.color }}>
      <span className="ar-cart-side" aria-hidden="true" />
      <span className="ar-cart-face">
        <span className="ar-cart-top" aria-hidden="true" />
        {p.media === "cd" && <span className="ar-disc" aria-hidden="true" />}
        {p.media === "boite" && <span className="ar-box-band" aria-hidden="true"><em>{p.short}</em></span>}
        {p.media === "flyer" && <span className="ar-marquee" aria-hidden="true"><em>INSERT COIN</em></span>}
        <span className={"ar-label" + (g.cover ? "" : " drawn")} style={art}>
          {!g.cover && <><i className="ar-lb-sun" /><b>{g.title}</b></>}
          <span className="ar-lb-band"><em>{p.short}</em></span>
        </span>
        <span className="ar-grip" aria-hidden="true" />
      </span>
    </span>
  );
}

// La boîte d'un jeu, pour l'étagère du collectionneur : un vrai volume en 3D (face, tranche, dessus).
// Carton (Game Boy, GBA, salon), boîtier plastique (Mega Drive, Master System), boîtier DS, boîtier de CD, affiche de borne.
// La jaquette occupe la face ; la tranche porte la couleur de la console et le titre, comme sur une étagère de vraies boîtes.
export default function GameBox({ g, size = 1 }) {
  const p = pf(g.platform); const kind = p.box || "carton";
  const art = g.cover ? { backgroundImage: `url("${g.cover}")` } : undefined;
  const wish = g.ready === false && g.kind === "wish";
  // Une boîte vit : plus on joue, plus elle s'use ; jamais lancée, elle est encore sous blister.
  // Le reste (éraflures, pli, autocollant) est tiré du titre : chaque boîte garde le même caractère.
  const h = hue(g.title); const r = h % 10; const crease = 18 + (h * 7) % 64;
  const age = Math.min(1, (g.play_seconds || 0) / 36000);
  const sealed = !wish && g.ready !== false && !g.play_seconds && !g.last_played_at;
  const carton = kind === "carton" || kind === "carton-l";
  const dog = carton && !sealed && (age > 0.25 || h % 3 === 0);
  const stk = sealed ? (h % 2 ? "prix" : "") : ["", "prix", "occ", "vf", "club", "mine", ""][h % 7];
  const PRIX = ["29,90 F", "49 F", "199 F", "15,24 €", "9,99 €", "349 F"];
  return (
    <span className={`ar-box b-${kind}${wish ? " nofile" : ""}${sealed ? " blister" : ""}${dog ? " dog" : ""}`} style={{ "--ar-h": h, "--pc": p.color, "--bs": size, "--r": r, "--c": crease, "--age": age.toFixed(2) }}>
      <span className="ar-box-top" aria-hidden="true" />
      <span className="ar-box-side" aria-hidden="true"><i className="ar-box-sp">{p.short}</i><b>{g.title}</b>{kind !== "flyer" && <i className="ar-box-bar" />}</span>
      <span className="ar-box-front">
        {kind === "cd" && <span className="ar-box-hinge" aria-hidden="true" />}
        {(kind === "carton" || kind === "carton-l") && <span className="ar-box-strip" aria-hidden="true"><em>{p.label}</em></span>}
        {kind === "ds" && <span className="ar-box-dsband" aria-hidden="true"><em>{p.short}</em></span>}
        {kind === "flyer" && <span className="ar-marquee" aria-hidden="true"><em>INSERT COIN</em></span>}
        <span className={"ar-box-art" + (g.cover ? "" : " drawn")} style={art}>
          {!g.cover && <><i className="ar-lb-sun" /><b>{g.title}</b></>}
        </span>
        <span className="ar-box-seal" aria-hidden="true">NX</span>
        {stk === "prix" && <i className="ar-stk prix">{PRIX[h % PRIX.length]}</i>}
        {stk === "occ" && <i className="ar-stk occ">Occasion</i>}
        {stk === "vf" && <i className="ar-stk vf">Version française</i>}
        {stk === "club" && <i className="ar-stk club">Club<br />Nexus</i>}
        {stk === "mine" && <i className="ar-stk mine">{["Noël 98", "Anniv. 2001", "À finir !", "Prêté à Max"][h % 4]}</i>}
        <span className="ar-box-wear" aria-hidden="true" />
        <span className="ar-box-gloss" aria-hidden="true" />
      </span>
    </span>
  );
}
