import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoClose, IoArrowForward } from "react-icons/io5";
import { toast } from "sonner";
import { getSettings } from "@/lib/api";
import { useApp } from "@/context/AppContext";

export const CB_PAGES = ["home", "detail", "reader", "cinema", "settings", "members", "novelties", "contact", "tutorial", "bunny_story"];
export const CB_PAGE_LABELS = {
  home: "Accueil", detail: "Fiche d'une création", reader: "Mode lecture", cinema: "Mode cinéma (film)", settings: "Paramètres",
  members: "Membres", novelties: "Nouveautés", contact: "Contact", tutorial: "Tutoriel",
  bunny_story: "Fiche Cosmic Bunny (son aventure)",
};

export const CB_DEFAULT_TIPS = {
  home: [
    { text: "Coucou toi ! Moi c'est Cosmic Bunny 🐰, ta copilote de l'espace. Je te fais le tour du vaisseau ?", button_label: "Personnaliser la station ⚙️", button_target: "/parametres" },
    { text: "Le bouton Aa en haut agrandit le texte. Fini de loucher comme un ninja myope !" },
    { text: "L'icône son 🔊 coupe ou remet la musique. Pratique quand mamie t'appelle. 😅" },
    { text: "Clique sur une affiche pour ouvrir une création. Promis, ça mord pas (moi non plus)." },
  ],
  detail: [
    { text: "Le gros bouton LANCER démarre l'aventure. Accroche ta ceinture ! 🚀" },
    { text: "Le petit cœur ❤️ ajoute la fiche à tes Favoris. Collectionne-les comme des cartes rares." },
    { text: "Tu peux Partager la fiche à tes potes. Un peu de pub pour moi, hein ? 😏" },
  ],
  reader: [
    { text: "Mode lecture activé ! Le bouton Aa règle la taille et le confort du texte. 👓" },
    { text: "L'icône musique lance une ambiance. Immersion garantie, mouchoirs non fournis. 🥲" },
    { text: "Ta progression se sauvegarde toute seule. Reviens quand tu veux, je garde ta page au chaud !" },
  ],
  cinema: [
    { text: "Bienvenue dans la salle de ciné ! 🎬 Installe-toi, j'ai gardé le meilleur fauteuil pour toi." },
    { text: "Le bouton 💡 baisse les lumières pour une immersion totale, et l'icône ⛶ passe en plein écran. Popcorn conseillé ! 🍿" },
    { text: "Le bouton 🔊 coupe ou remet le son, comme dans le menu. Et Échap (ou la croix) pour sortir de la salle." },
  ],
  settings: [
    { text: "Ici tu personnalises TOUT : thèmes, couleurs, sons… Éclate-toi ! 🎨" },
    { text: "Plus de 13 thèmes t'attendent. Trouve celui qui te ressemble (le rose te va à ravir)." },
    { text: "Tu me trouves bavarde ? Tu peux régler mes conseils ou m'éteindre juste ici. Sans rancune ! 🙈" },
  ],
  members: [{ text: "Voici la communauté ! Crée ton profil pour rejoindre la bande. 🎉", button_label: "Voir les membres 👥", button_target: "/membres" }],
  novelties: [{ text: "Toutes les dernières sorties sont ici. Fraîches du jour ! 🍡" }],
  contact: [{ text: "Envie de papoter avec le créateur ? C'est par ici. Sois adorable. 😇" }],
  tutorial: [{ text: "Le grand guide complet est là si tu veux tout savoir. Moi je résume, lui il raconte sa vie !" }],
  bunny_story: [
    { text: "Héhé, ça c'est MON histoire à moi ! *vrooom* je débarque en moto 🏍️" },
    { text: "Bienvenue dans mon aventure à travers les mondes hostiles. Accroche-toi, ça secoue !" },
    { text: "Lance la fiche pour me suivre. Et si tu vois des ennuis… c'est normal, moi je prends la fuite ! 😅" },
  ],
};

// Common navigation targets offered in the admin editor (label -> path)
export const CB_TARGETS = [
  { v: "", label: "Aucun bouton" },
  { v: "/parametres", label: "Paramètres" },
  { v: "/", label: "Accueil" },
  { v: "/membres", label: "Membres" },
  { v: "/nouveautes", label: "Nouveautés" },
  { v: "/contact", label: "Contact" },
  { v: "/tutoriel", label: "Tutoriel" },
];

// Tips may be plain strings (legacy) or objects — normalize to { text, button_label, button_target }
export const normalizeTip = (t) => (typeof t === "string" ? { text: t } : { text: (t && t.text) || "", button_label: (t && t.button_label) || "", button_target: (t && t.button_target) || "" });

function pathToKey(pathname) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/oeuvre/")) return "detail";
  if (pathname.startsWith("/parametres")) return "settings";
  if (pathname.startsWith("/membres")) return "members";
  if (pathname.startsWith("/nouveautes")) return "novelties";
  if (pathname.startsWith("/contact")) return "contact";
  if (pathname.startsWith("/tutoriel")) return "tutorial";
  return null;
}

const readSeen = () => { try { return JSON.parse(localStorage.getItem("sx_cb_seen") || "[]"); } catch { return []; } };

export default function CosmicBunny() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { sfx } = useApp();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });

  const [entered, setEntered] = useState(() => sessionStorage.getItem("sx_entered") === "1");
  const [hidden, setHidden] = useState(() => localStorage.getItem("sx_cb_hidden") === "1");
  const [tipsOff, setTipsOff] = useState(() => localStorage.getItem("sx_cb_tips_off") === "1");
  const [ctxKey, setCtxKey] = useState(null); // reader (modal) override
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [bounce, setBounce] = useState(false);
  const [pose, setPoseState] = useState("neutral");
  const poseTimer = useRef(null);
  const setPose = (p, holdMs) => {
    setPoseState(p);
    if (poseTimer.current) clearTimeout(poseTimer.current);
    if (holdMs) poseTimer.current = setTimeout(() => setPoseState("neutral"), holdMs);
  };

  const enabledGlobal = settings ? settings.cosmic_bunny_enabled !== false : true;
  const tipsMap = (settings && settings.cosmic_bunny_tips) || CB_DEFAULT_TIPS;
  const key = ctxKey || pathToKey(pathname);
  const tips = (key && ((tipsMap[key] && tipsMap[key].length ? tipsMap[key] : null) || CB_DEFAULT_TIPS[key])) || [];

  useEffect(() => {
    const onEntered = () => setEntered(true);
    const onPref = () => { setHidden(localStorage.getItem("sx_cb_hidden") === "1"); setTipsOff(localStorage.getItem("sx_cb_tips_off") === "1"); };
    const onCtx = (e) => setCtxKey(e.detail || null);
    window.addEventListener("sx-entered", onEntered);
    window.addEventListener("sx-cb-pref", onPref);
    window.addEventListener("sx-cb-context", onCtx);
    return () => {
      window.removeEventListener("sx-entered", onEntered);
      window.removeEventListener("sx-cb-pref", onPref);
      window.removeEventListener("sx-cb-context", onCtx);
    };
  }, []);

  const markSeen = (k) => { const s = readSeen(); if (!s.includes(k)) localStorage.setItem("sx_cb_seen", JSON.stringify([...s, k])); };

  // Auto-open on first visit of a context
  useEffect(() => {
    if (!entered || hidden || tipsOff || !enabledGlobal) return;
    if (!key || !tips.length || readSeen().includes(key)) return;
    const t = setTimeout(() => { setIdx(0); setOpen(true); setPose(key === "bunny_story" ? "moto" : "wave"); try { sfx("select"); } catch (_) {} }, ctxKey ? 500 : 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [entered, hidden, tipsOff, enabledGlobal, key, tips.length]);

  // Gentle attention bounce when a context has unseen tips and the bubble is closed
  useEffect(() => {
    if (hidden || !enabledGlobal || !entered || open) { setBounce(false); return; }
    setBounce(!!(key && tips.length && !readSeen().includes(key)));
  }, [open, key, tips.length, hidden, enabledGlobal, entered]);

  if (hidden || !enabledGlobal || !entered) return null;

  const onHome = !ctxKey && pathToKey(pathname) === "home";

  const closeTips = () => { if (key) markSeen(key); setOpen(false); setPose("sad", 2400); };
  const next = () => {
    if (idx < tips.length - 1) { setIdx(idx + 1); setPose("thumbs"); try { sfx("nav"); } catch (_) {} }
    else { if (key) markSeen(key); setOpen(false); setPose("excited", 2600); try { sfx("select"); } catch (_) {} }
  };
  const openManually = () => { setIdx(0); setOpen(true); setPose(key === "bunny_story" ? "moto" : "wave"); try { sfx("nav"); } catch (_) {} };
  const talkLess = () => {
    localStorage.setItem("sx_cb_tips_off", "1"); setTipsOff(true);
    if (key) markSeen(key); setOpen(false); setPose("sad", 2600);
    toast.success("Oh… d'accord, je me fais discrète ! Tape-moi quand tu veux un conseil. 🐰");
  };
  const goTo = (target) => { if (key) markSeen(key); setOpen(false); setPose("excited", 2000); try { sfx("select"); } catch (_) {} nav(target); };

  const cur = normalizeTip(tips[idx] || {});
  const customImg = settings && settings.cosmic_bunny_image;
  const spriteSrc = customImg || `/cosmic-bunny/${pose}.png`;

  return (
    <div className={`cb-root ${onHome ? "cb-home" : ""}`} data-testid="cosmic-bunny">
      {open && tips.length > 0 && (
        <div className="cb-bubble" data-testid="cb-bubble">
          <button className="cb-close" onClick={closeTips} data-testid="cb-close" aria-label="Fermer les conseils"><IoClose size={18} /></button>
          <p className="cb-name">Cosmic Bunny 🐰</p>
          <p className="cb-text" data-testid="cb-text">{cur.text}</p>
          {cur.button_label && cur.button_target && (
            <button className="cb-cta" data-testid="cb-cta" onClick={() => goTo(cur.button_target)}>{cur.button_label}</button>
          )}
          <div className="cb-actions">
            <button className="cb-next" onClick={next} data-testid="cb-next">
              {idx < tips.length - 1 ? (<>Conseil suivant <IoArrowForward size={14} /></>) : "Compris ! 🎉"}
            </button>
            {tips.length > 1 && <span className="cb-count">{idx + 1}/{tips.length}</span>}
          </div>
          <button className="cb-mute" onClick={talkLess} data-testid="cb-talk-less">Je parle trop ? 🙉 Chut !</button>
        </div>
      )}
      <div className="cb-mascot-wrap">
        <button className={`cb-mascot ${bounce ? "cb-bounce" : ""} ${customImg ? "cb-custom" : ""}`} onClick={() => (open ? closeTips() : openManually())} data-testid="cb-mascot" aria-label="Cosmic Bunny — conseils">
          {!customImg && <span className="cb-stage" aria-hidden="true" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/cosmic-bunny/alley.jpg)` }} />}
          <img className="cb-sprite" src={spriteSrc} alt="Cosmic Bunny" draggable="false" data-pose={pose} />
          {!customImg && <span className="cb-tint" aria-hidden="true" />}
        </button>
        {!open && <span className="cb-help" aria-hidden="true">?</span>}
      </div>
    </div>
  );
}
