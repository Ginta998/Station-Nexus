import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { IoClose, IoDownloadOutline, IoShareSocialOutline, IoCopyOutline, IoLogoWhatsapp, IoMailOutline, IoChatbubbleOutline, IoPaperPlaneOutline, IoLogoFacebook, IoLogoTwitter, IoLinkOutline } from "react-icons/io5";
import { shareCardBlob, worldPalette, CARD_SIZES, CARD_LAYOUTS } from "@/lib/shareCard";

/*
  Partager une œuvre, un chapitre ou un épisode : de belles cartes (six dessins, trois formats) aux couleurs du monde,
  et toutes les façons de l'envoyer : partage du téléphone (Instagram, WhatsApp…), WhatsApp, Messages, Telegram, email, X, Facebook, lien.
*/
const longDate = (iso) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) + " · " + new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h");
const PREF = "nx-card-pref";
const readPref = () => { try { return JSON.parse(localStorage.getItem(PREF) || "{}"); } catch (_) { return {}; } };

export default function ShareCardDialog({ item, unit, onClose, poster, catLabel }) {
  const future = unit?.release_at && new Date(unit.release_at) > new Date();
  const pref = readPref();
  const [layout, setLayout] = useState(future ? "compte" : pref.layout || "affiche");
  const [size, setSize] = useState(pref.size || "story");
  const [mode, setMode] = useState(future ? "date" : "now");
  const [quote, setQuote] = useState(() => { const first = (item.synopsis || "").split(/(?<=[.!?…])\s/)[0] || ""; return first.length > 20 ? first : item.tagline || first; });
  const [url, setUrl] = useState(null); const [blob, setBlob] = useState(null);
  const link = `${window.location.origin}/oeuvre/${item.id}`;
  const unitName = unit ? `${unit.kind === "episode" ? "Épisode" : (item.unit_label || "Chapitre")} ${unit.index}` : "";
  const kicker = unit ? `${unitName}${unit.title ? " · " + unit.title : ""}` : (catLabel || "Nouvelle œuvre");
  const when = mode === "date" && unit?.release_at ? `Sortie ${longDate(unit.release_at)}` : unit ? "Disponible maintenant sur la station" : "À découvrir sur la station";
  const days = mode === "date" && unit?.release_at ? Math.max(0, Math.ceil((new Date(unit.release_at) - new Date()) / 864e5)) : -1;
  const defaultMsg = unit ? (mode === "date" ? `${unitName} de « ${item.title} » sort ${longDate(unit.release_at)} sur Station Nexus.` : `${unitName} de « ${item.title} » est sorti sur Station Nexus !`) : `Découvre « ${item.title} » sur Station Nexus.`;
  const [msg, setMsg] = useState(defaultMsg);
  useEffect(() => setMsg(defaultMsg), [mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const full = `${msg} ${link}`;

  useEffect(() => {
    let alive = true; let made = null; setUrl(null);
    try { localStorage.setItem(PREF, JSON.stringify({ layout, size })); } catch (_) { /* rien */ }
    const pal = worldPalette(document.querySelector('[data-testid="nexus-world"]'));
    const t = setTimeout(() => shareCardBlob({ layout, size, title: item.title, kicker, when, url: link, poster, pal, quote, days }).then((b) => { if (!alive || !b) return; made = URL.createObjectURL(b); setBlob(b); setUrl(made); }), 120);
    return () => { alive = false; clearTimeout(t); if (made) URL.revokeObjectURL(made); };
  }, [layout, size, mode, quote]); // eslint-disable-line react-hooks/exhaustive-deps

  const fname = `${item.title.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-")}${unit ? "-" + unit.index : ""}-${layout}-${size}.png`;
  const download = () => { if (!url) return; const a = document.createElement("a"); a.href = url; a.download = fname; document.body.appendChild(a); a.click(); a.remove(); };
  const native = async () => {
    const f = blob && new File([blob], fname, { type: "image/png" });
    if (f && navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], title: item.title, text: full }); } catch (_) { /* annulé */ } return; }
    if (navigator.share) { try { await navigator.share({ title: item.title, text: msg, url: link }); } catch (_) { /* annulé */ } return; }
    download(); toast.info("Image téléchargée : ajoute-la à ta story ou ton message depuis ta galerie");
  };
  const copy = (t, ok) => navigator.clipboard?.writeText(t).then(() => toast.success(ok), () => toast.info(t));
  const open = (u) => window.open(u, "_blank", "noopener");
  const E = encodeURIComponent;
  const TARGETS = [
    { k: "native", t: "Partager l'image", sub: "Instagram, WhatsApp, Snap…", ic: <IoShareSocialOutline size={18} />, go: native, main: true },
    { k: "wa", t: "WhatsApp", ic: <IoLogoWhatsapp size={18} />, go: () => open(`https://wa.me/?text=${E(full)}`) },
    { k: "sms", t: "Messages", ic: <IoChatbubbleOutline size={18} />, go: () => { window.location.href = `sms:?&body=${E(full)}`; } },
    { k: "tg", t: "Telegram", ic: <IoPaperPlaneOutline size={18} />, go: () => open(`https://t.me/share/url?url=${E(link)}&text=${E(msg)}`) },
    { k: "mail", t: "Email", ic: <IoMailOutline size={18} />, go: () => { window.location.href = `mailto:?subject=${E(item.title + (unitName ? " · " + unitName : ""))}&body=${E(full)}`; } },
    { k: "x", t: "X", ic: <IoLogoTwitter size={18} />, go: () => open(`https://twitter.com/intent/tweet?text=${E(msg)}&url=${E(link)}`) },
    { k: "fb", t: "Facebook", ic: <IoLogoFacebook size={18} />, go: () => open(`https://www.facebook.com/sharer/sharer.php?u=${E(link)}`) },
    { k: "link", t: "Copier le lien", ic: <IoLinkOutline size={18} />, go: () => copy(link, "Lien copié") },
    { k: "text", t: "Copier le message", ic: <IoCopyOutline size={18} />, go: () => copy(full, "Message copié : colle-le où tu veux") },
  ];
  const ratio = size === "story" ? "9/16" : size === "post" ? "4/5" : "1/1";
  return createPortal(
    <div className="sc-wrap" onClick={onClose} data-testid="share-card">
      <div className="sc-box" onClick={(e) => e.stopPropagation()}>
        <div className="sc-h"><b>Partager {unit ? unitName.toLowerCase() : "l'œuvre"}</b><button onClick={onClose} aria-label="Fermer"><IoClose size={18} /></button></div>
        <div className="sc-cols">
          <div className="sc-left">
            <div className="sc-prev" style={{ aspectRatio: ratio }}>{url ? <img src={url} alt={`Carte ${layout} de ${item.title}`} /> : <span className="sc-wait">Dessin de la carte…</span>}</div>
            <div className="sc-dl"><button onClick={download} disabled={!url} data-testid="share-card-dl"><IoDownloadOutline size={15} /> Télécharger l'image</button></div>
          </div>
          <div className="sc-right">
            <p className="sc-lbl">DESSIN</p>
            <div className="sc-lay">{CARD_LAYOUTS.map(([k, t, d]) => <button key={k} className={layout === k ? "on" : ""} onClick={() => setLayout(k)} title={d} data-testid={`card-layout-${k}`}><b>{t}</b><small>{d}</small></button>)}</div>
            <p className="sc-lbl">FORMAT</p>
            <div className="sc-seg">{CARD_SIZES.map(([k, t, w, h]) => <button key={k} className={size === k ? "on" : ""} onClick={() => setSize(k)} data-testid={`card-size-${k}`}>{t}<small>{w}×{h}</small></button>)}</div>
            {unit?.release_at && <><p className="sc-lbl">ANNONCE</p><div className="sc-seg">
              <button className={mode === "now" ? "on" : ""} onClick={() => setMode("now")}>« Disponible maintenant »</button>
              <button className={mode === "date" ? "on" : ""} onClick={() => setMode("date")}>La date de sortie</button></div></>}
            {layout === "citation" && <><p className="sc-lbl">LA PHRASE</p><textarea className="sc-in" rows={3} value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Une phrase de l'œuvre, une réplique…" data-testid="card-quote" /></>}
            <p className="sc-lbl">LE MESSAGE</p>
            <textarea className="sc-in" rows={2} value={msg} onChange={(e) => setMsg(e.target.value)} data-testid="card-msg" />
            <p className="sc-lbl">ENVOYER</p>
            <div className="sc-tg">{TARGETS.map((x) => <button key={x.k} className={x.main ? "main" : ""} onClick={x.go} disabled={x.k === "native" && !url} data-testid={`share-${x.k}`}>{x.ic}<span><b>{x.t}</b>{x.sub && <small>{x.sub}</small>}</span></button>)}</div>
            <p className="sc-note">Pour une story Instagram : « Partager l'image » sur ton téléphone, choisis Instagram, puis pose un sticker « Lien » sur le cadre du lien.</p>
          </div>
        </div>
      </div>
    </div>, document.body
  );
}
