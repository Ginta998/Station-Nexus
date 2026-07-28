import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoClose, IoArrowForward } from "react-icons/io5";
import { toast } from "sonner";
import { getSettings } from "@/lib/api";
import { useApp } from "@/context/AppContext";

export const CB_PAGES = ["home", "detail", "reader", "settings", "members", "novelties", "contact", "tutorial"];
export const CB_PAGE_LABELS = {
  home: "Accueil", detail: "Fiche d'une création", reader: "Mode lecture", settings: "Paramètres",
  members: "Membres", novelties: "Nouveautés", contact: "Contact", tutorial: "Tutoriel",
};

export const CB_DEFAULT_TIPS = {
  home: [
    "Coucou toi ! Moi c'est Cosmic Bunny 🐰, ta copilote de l'espace. Je te fais le tour du vaisseau ?",
    "Le bouton Aa en haut agrandit le texte. Fini de loucher comme un ninja myope !",
    "L'icône son 🔊 coupe ou remet la musique. Pratique quand mamie t'appelle. 😅",
    "Clique sur une affiche pour ouvrir une création. Promis, ça mord pas (moi non plus).",
  ],
  detail: [
    "Le gros bouton LANCER démarre l'aventure. Accroche ta ceinture ! 🚀",
    "Le petit cœur ❤️ ajoute la fiche à tes Favoris. Collectionne-les comme des cartes rares.",
    "Tu peux Partager la fiche à tes potes. Un peu de pub pour moi, hein ? 😏",
  ],
  reader: [
    "Mode lecture activé ! Le bouton Aa règle la taille et le confort du texte. 👓",
    "L'icône musique lance une ambiance. Immersion garantie, mouchoirs non fournis. 🥲",
    "Ta progression se sauvegarde toute seule. Reviens quand tu veux, je garde ta page au chaud !",
  ],
  settings: [
    "Ici tu personnalises TOUT : thèmes, couleurs, sons… Éclate-toi ! 🎨",
    "Plus de 13 thèmes t'attendent. Trouve celui qui te ressemble (le rose te va à ravir).",
    "Tu me trouves bavarde ? Tu peux régler mes conseils ou m'éteindre juste ici. Sans rancune ! 🙈",
  ],
  members: ["Voici la communauté ! Crée ton profil pour rejoindre la bande. 🎉"],
  novelties: ["Toutes les dernières sorties sont ici. Fraîches du jour ! 🍡"],
  contact: ["Envie de papoter avec le créateur ? C'est par ici. Sois adorable. 😇"],
  tutorial: ["Le grand guide complet est là si tu veux tout savoir. Moi je résume, lui il raconte sa vie !"],
};

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
  const { sfx } = useApp();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });

  const [entered, setEntered] = useState(() => sessionStorage.getItem("sx_entered") === "1");
  const [hidden, setHidden] = useState(() => localStorage.getItem("sx_cb_hidden") === "1");
  const [tipsOff, setTipsOff] = useState(() => localStorage.getItem("sx_cb_tips_off") === "1");
  const [ctxKey, setCtxKey] = useState(null); // reader (modal) override
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [bounce, setBounce] = useState(false);

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
    const t = setTimeout(() => { setIdx(0); setOpen(true); try { sfx("select"); } catch (_) {} }, ctxKey ? 500 : 900);
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

  const closeTips = () => { if (key) markSeen(key); setOpen(false); };
  const next = () => {
    if (idx < tips.length - 1) { setIdx(idx + 1); try { sfx("nav"); } catch (_) {} }
    else { closeTips(); try { sfx("select"); } catch (_) {} }
  };
  const openManually = () => { setIdx(0); setOpen(true); try { sfx("nav"); } catch (_) {} };
  const talkLess = () => {
    localStorage.setItem("sx_cb_tips_off", "1"); setTipsOff(true);
    if (key) markSeen(key); setOpen(false);
    toast.success("Promis, je me fais discrète ! Tape-moi quand tu veux un conseil. 🐰");
  };

  return (
    <div className={`cb-root ${onHome ? "cb-home" : ""}`} data-testid="cosmic-bunny">
      {open && tips.length > 0 && (
        <div className="cb-bubble" data-testid="cb-bubble">
          <button className="cb-close" onClick={closeTips} data-testid="cb-close" aria-label="Fermer les conseils"><IoClose size={18} /></button>
          <p className="cb-name">Cosmic Bunny 🐰</p>
          <p className="cb-text" data-testid="cb-text">{tips[idx]}</p>
          <div className="cb-actions">
            <button className="cb-next" onClick={next} data-testid="cb-next">
              {idx < tips.length - 1 ? (<>Conseil suivant <IoArrowForward size={14} /></>) : "Compris ! 🎉"}
            </button>
            {tips.length > 1 && <span className="cb-count">{idx + 1}/{tips.length}</span>}
          </div>
          <button className="cb-mute" onClick={talkLess} data-testid="cb-talk-less">Je parle trop ? 🙉 Chut !</button>
        </div>
      )}
      <button className={`cb-mascot ${bounce ? "cb-bounce" : ""}`} onClick={() => (open ? closeTips() : openManually())} data-testid="cb-mascot" aria-label="Cosmic Bunny — conseils">
        <img src="/cosmic-bunny.png" alt="Cosmic Bunny" draggable="false" />
      </button>
    </div>
  );
}
