import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { PLATFORMS } from "@/lib/arcade";

// Le guide de Nexus Arcade : ce qu'il fait tourner, ce qu'il ne fait pas tourner, comment apporter un jeu,
// sauvegardes, manettes, dépannage. Un sommaire à gauche (en haut sur téléphone), les chapitres à droite.
const LEVEL = { ok: ["Fluide", "ok"], good: ["Bon", "good"], beta: ["Expérimental", "beta"] };
const NOTES = {
  gba: "Le cœur mGBA. La quasi-totalité des jeux tourne parfaitement, sans BIOS.",
  gbc: "Même cœur que le Game Boy. Couleurs d'origine.",
  gb: "Cœur Gambatte. Parfait.",
  nes: "Cœur Nestopia. Les jeux Famicom Disk System (.fds) demandent le BIOS du lecteur de disquettes.",
  snes: "Cœur Snes9x. Parfait, y compris les jeux à puce (Star Fox, Yoshi's Island).",
  segaMD: "Cœur Genesis Plus GX. Parfait. Le Mega-CD n'est pas encore ouvert dans l'Arcade.",
  segaMS: "Cœur Genesis Plus GX. Parfait.",
  segaGG: "Cœur Genesis Plus GX. Parfait.",
  nds: "Cœur DeSmuME. Deux écrans, le tactile au doigt ou à la souris. Fluide sur ordinateur, plus lent sur un vieux téléphone.",
  psx: "Cœur PCSX ReARMed, sans BIOS obligatoire. Prends un .chd ou un .pbp (un seul fichier). Les gros disques demandent un ordinateur ou un téléphone récent.",
  n64: "Cœur Mupen64Plus. Exigeant : ordinateur conseillé, certains jeux ont des défauts graphiques.",
  arcade: "Cœur FinalBurn Neo. Le .zip du jeu doit correspondre à la version FBNeo (romset). Les jeux Neo Geo demandent aussi neogeo.zip (pas encore géré).",
};
const CH = [
  ["intro", "Nexus Arcade en bref"],
  ["consoles", "Les consoles"],
  ["non", "Ce qui ne tourne pas"],
  ["apporter", "Apporter un jeu"],
  ["officiels", "Jeux officiels et copies"],
  ["formats", "Formats et archives"],
  ["sauvegardes", "Sauvegardes"],
  ["manettes", "Clavier, manettes, tactile"],
  ["telephone", "Sur téléphone"],
  ["depannage", "Dépannage"],
  ["credits", "Crédits"],
];

export default function ArcadeGuide({ onClose }) {
  const body = useRef(null); const [on, setOn] = useState("intro");
  const go = (k) => { setOn(k); body.current?.querySelector(`#ag-${k}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const spy = () => {
    const el = body.current; if (!el) return;
    let cur = "intro"; CH.forEach(([k]) => { const s = el.querySelector(`#ag-${k}`); if (s && s.offsetTop - el.scrollTop < 120) cur = k; }); setOn(cur);
  };
  return createPortal(
    <div className="ar-dlg-wrap" onClick={onClose}>
      <div className="ar-guide" onClick={(e) => e.stopPropagation()} data-testid="arcade-guide-panel">
        <header className="ar-guide-h"><div><p className="mono">NEXUS ARCADE · GUIDE</p><h3>Le guide de l'Arcade</h3></div><button className="ar-add-x" onClick={onClose} aria-label="Fermer"><IoClose size={18} /></button></header>
        <div className="ar-guide-in">
          <nav className="ar-guide-nav">{CH.map(([k, l], i) => <button key={k} className={on === k ? "on" : ""} onClick={() => go(k)}><i>{String(i + 1).padStart(2, "0")}</i>{l}</button>)}</nav>
          <article className="ar-guide-body" ref={body} onScroll={spy}>
            <section id="ag-intro"><h4>Nexus Arcade en bref</h4>
              <p>L'Arcade est ta ludothèque rétro dans l'Atelier. Chaque jeu est rangé dans la section de sa console, sur une étagère que tu parcours au doigt, à la souris, au clavier ou à la manette. Un clic sur le jeu au centre : il entre dans sa console, l'écran s'allume et la partie démarre en plein écran.</p>
              <p>Tout est rangé sur ta Station : les jeux (en morceaux, jusqu'à 4 Go par jeu), leurs sauvegardes et ton temps de jeu. Tu commences sur l'ordinateur, tu reprends sur le téléphone. L'Arcade est réservée à ton compte : rien n'est montré au public.</p>
              <p>Le moteur s'appelle <b>EmulatorJS</b> : il fait tourner dans le navigateur les émulateurs de RetroArch, la référence de l'émulation libre. Il se charge depuis son propre serveur la première fois, puis reste en cache.</p></section>

            <section id="ag-consoles"><h4>Les consoles</h4>
              <p>« Fluide » : parfait partout, même sur un téléphone d'entrée de gamme. « Bon » : parfait sur ordinateur, correct sur un téléphone récent. « Expérimental » : ordinateur conseillé.</p>
              <div className="ar-gtable">
                {PLATFORMS.map((p) => (
                  <div key={p.k} className="ar-grow" style={{ "--pc": p.color }}>
                    <span className="ar-pill">{p.short}</span>
                    <div><b>{p.label}</b><small>{p.ext.length ? p.ext.map((e) => "." + e).join(" ") : ".zip (romset)"} · .zip · .7z</small><p>{NOTES[p.k]}</p></div>
                    <i className={"ar-lvl " + LEVEL[p.level][1]}>{LEVEL[p.level][0]}</i>
                  </div>
                ))}
              </div></section>

            <section id="ag-non"><h4>Ce qui ne tourne pas</h4>
              <ul>
                <li><b>PSP</b> : le cœur existe mais il demande un réglage spécial du serveur (le « multithread »). Pas encore ouvert.</li>
                <li><b>GameCube, Wii, PlayStation 2, Xbox, 3DS, Switch et au-delà</b> : beaucoup trop lourds pour un navigateur aujourd'hui. Pour ceux-là, un émulateur installé (Dolphin, PCSX2, Azahar…) reste la solution.</li>
                <li><b>Saturn, Mega-CD, PC Engine, Atari, Neo Geo Pocket, WonderSwan</b> : le moteur sait les faire tourner, l'Arcade ne les a pas encore ouverts. Dis-le si tu en veux une : c'est rapide à ajouter.</li>
                <li><b>Le multijoueur en ligne</b> et les câbles link (échanges Pokémon entre deux appareils) : pas encore.</li>
              </ul></section>

            <section id="ag-apporter"><h4>Apporter un jeu</h4>
              <p>Tout passe par le bouton <b>Ajouter des jeux</b> :</p>
              <ul>
                <li><b>Mes fichiers</b> : glisse tes fichiers (plusieurs à la fois) ou choisis-les. La console est reconnue à l'extension ; pour une archive .zip ou .7z, tu la choisis. Les fichiers partent en morceaux de 8 Mo, tu peux continuer à naviguer pendant l'envoi.</li>
                <li><b>Par un lien</b> : un lien Google Drive (partagé « à toute personne disposant du lien »), Dropbox ou un lien direct. C'est le serveur de ta Station qui télécharge : pratique pour un gros jeu depuis ton téléphone.</li>
                <li><b>Catalogue libre</b> : des centaines de jeux indépendants (homebrews) Game Boy, Game Boy Color, GBA et NES, gratuits et publiés avec leur licence, sur Homebrew Hub. Un clic sur Installer.</li>
                <li><b>Jeux officiels</b> : cherche n'importe quel jeu pour le ranger avec sa jaquette, sans fichier. Tu ajoutes ensuite ta copie depuis sa fiche (« Ajouter mon fichier » ou « Par un lien »).</li>
              </ul>
              <p>Glisser des fichiers directement sur l'étagère ouvre aussi ce menu.</p></section>

            <section id="ag-officiels"><h4>Jeux officiels et copies</h4>
              <p>L'Arcade ne télécharge pas de jeux du commerce. La recherche « Jeux officiels » sert à tenir ta collection à jour : titres, jaquettes, statut (à faire, en cours, terminé, culte), notes.</p>
              <p>Pour jouer, ajoute la copie d'un jeu que tu possèdes. On l'obtient en « dumpant » sa cartouche ou son disque : un lecteur USB de cartouches (type GB Operator, Retrode, Sanni Cart Reader), une DS ou une 3DS modifiée pour les cartes DS, un lecteur de CD et un logiciel comme ImgBurn ou chdman pour les disques PlayStation. Les règles varient selon les pays : renseigne-toi sur la copie privée chez toi.</p></section>

            <section id="ag-formats"><h4>Formats et archives</h4>
              <ul>
                <li>Une cartouche = un fichier (.gba, .sfc, .md…). Tu peux l'envoyer tel quel ou dans un .zip / .7z : l'Arcade le décompresse au lancement.</li>
                <li><b>PlayStation</b> : préfère un seul fichier, <b>.chd</b> (compressé, le meilleur) ou <b>.pbp</b>. Un jeu en .cue + .bin doit être mis ensemble dans un .zip.</li>
                <li><b>Arcade</b> : envoie le .zip du jeu tel quel, sans le décompresser, et choisis la console « Arcade ».</li>
                <li>Ne mets qu'un seul jeu par archive.</li>
              </ul></section>

            <section id="ag-sauvegardes"><h4>Sauvegardes</h4>
              <ul>
                <li><b>La sauvegarde du jeu</b> (celle que le jeu écrit lui-même, « Sauvegarder » dans un menu Pokémon par exemple) part au serveur dès qu'elle change.</li>
                <li><b>Quatre emplacements</b> : Auto, 1, 2 et 3, avec une capture d'écran. Auto se remplit quand tu quittes, toutes les 3 minutes, et quand le téléphone passe à une autre appli. Les autres : bouton Sauver en jeu.</li>
                <li><b>Reprendre</b> relance ta dernière partie exactement où tu l'as laissée, sur n'importe quel appareil.</li>
                <li>Si deux appareils sauvegardent le même jeu en même temps, l'Arcade te demande laquelle garder. L'avant-dernière reste récupérable (fiche › Sauvegardes › Restaurer la précédente).</li>
                <li>Un état sauvé (emplacements) dépend de la version du cœur ; la sauvegarde du jeu, elle, est universelle. Pour une longue aventure, sauvegarde aussi dans le jeu.</li>
              </ul></section>

            <section id="ag-manettes"><h4>Clavier, manettes, tactile</h4>
              <ul>
                <li><b>Clavier</b> : les touches se règlent dans la barre de l'émulateur (icône manette, en bas du jeu). Elles sont retenues par console.</li>
                <li><b>Manette</b> : branche-la en USB ou connecte-la en Bluetooth, puis appuie sur un bouton une fois le jeu lancé. Xbox, PlayStation, Switch Pro et 8BitDo sont reconnues.</li>
                <li><b>Téléphone</b> : des boutons tactiles apparaissent par-dessus le jeu ; une manette Bluetooth les remplace.</li>
                <li>Sur l'étagère : ← → pour parcourir, Entrée pour jouer.</li>
              </ul></section>

            <section id="ag-telephone"><h4>Sur téléphone</h4>
              <ul>
                <li>Bouton plein écran en haut à droite du jeu : il bascule aussi en paysage quand le téléphone le permet.</li>
                <li>Un jeu déjà lancé une fois reste sur l'appareil : il redémarre sans retélécharger.</li>
                <li>PlayStation et N64 consomment beaucoup de mémoire : sur un vieux téléphone, préfère l'ordinateur.</li>
              </ul></section>

            <section id="ag-depannage"><h4>Dépannage</h4>
              <ul>
                <li><b>« L'Arcade ne répond pas »</b> : le serveur de la Station n'est pas à jour. Republie-le sur Emergent.</li>
                <li><b>La console reste sur « Démarrage… »</b> : le moteur se charge depuis cdn.emulatorjs.org. Vérifie la connexion, désactive un bloqueur trop strict, relance.</li>
                <li><b>Écran noir ou « format non reconnu »</b> : mauvaise console (clic droit › Console) ou archive avec plusieurs jeux dedans.</li>
                <li><b>Un lien refusé</b> : le lien mène à une page web et pas au fichier. Sur Drive, vérifie le partage ; sinon, envoie le fichier.</li>
                <li><b>Un jeu d'arcade ne démarre pas</b> : le romset ne correspond pas à FinalBurn Neo.</li>
              </ul></section>

            <section id="ag-credits"><h4>Crédits</h4>
              <p><b>EmulatorJS</b> (licence GPL-3.0) et les émulateurs de <b>RetroArch / libretro</b> : mGBA, Gambatte, Nestopia, Snes9x, Genesis Plus GX, DeSmuME, PCSX ReARMed, Mupen64Plus, FinalBurn Neo. <b>Homebrew Hub</b> (gbdev) pour le catalogue libre, <b>GameBrew</b> pour la sélection de test, <b>SteamGridDB</b> et <b>Wikipédia</b> pour les jaquettes et les fiches. Merci aux créateurs de homebrews.</p></section>
          </article>
        </div>
      </div>
    </div>, document.body);
}
