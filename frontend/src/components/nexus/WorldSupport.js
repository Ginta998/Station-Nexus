import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { IoCheckmark, IoHeart, IoHeartOutline, IoLinkOutline, IoChatbubbleOutline, IoCreateOutline, IoLockOpenOutline } from "react-icons/io5";
import { getMembershipPlan, getLibrary, listProfiles, startCheckout } from "@/lib/api";
import { confirmCheckout } from "@/components/CheckoutConfirm";
import { useAuth } from "@/context/AuthContext";

/*
  « Soutenir la station », dans le monde de l'œuvre : on ne sort pas.
  Les paliers (réglés sur la page Soutien), les autres façons d'aider, et le mur de ceux qui soutiennent déjà.
  L'habillage suit le monde (ses couleurs, ses polices) : chaque monde a sa version de la page.
*/
const WS_KICK = { dock: "SOUTIEN · 応援", panorama: "RAVITAILLEMENT DE LA STATION", sommaire: "Appel aux lecteurs", vhs: "▶ SOUTIEN · SP", arcade: "CONTINUE ?", yorha: "SOUTIEN // ARCHIVES", sengoku: "応援", cinema: "Entracte · Soutien" };

export default function WorldSupport({ item, ws, isAdmin, unlock, onComments, onFav, fav, sfx = () => {} }) {
  const nav = useNavigate();
  const { user, openAuth } = useAuth() || {};
  const { data: plan } = useQuery({ queryKey: ["membership-plan"], queryFn: getMembershipPlan });
  const { data: lib } = useQuery({ queryKey: ["library"], queryFn: getLibrary, enabled: !!user });
  const { data: profiles = [] } = useQuery({ queryKey: ["profiles"], queryFn: listProfiles });
  const [busy, setBusy] = useState(false);
  const tiers = plan?.tiers || [];
  const active = lib?.membership?.active; const activeTier = lib?.membership?.tier_id;
  const supporters = profiles.filter((p) => p.tier_name);

  const subscribe = async (t) => {
    sfx("select");
    if (!user) { toast.info("Connecte-toi pour soutenir la station."); openAuth?.(); return; }
    const consents = await confirmCheckout({ kind: "membership", title: `Abonnement ${t?.name || "Station Nexus"}`, price: t?.price_eur ?? plan?.price_eur });
    if (!consents) return;
    setBusy(true);
    try { const r = await startCheckout({ kind: "membership", tier_id: t.id, consents }); window.location.href = r.checkout_url; }
    catch (e) { toast.error(e?.response?.data?.detail || "Impossible de démarrer l'abonnement"); setBusy(false); }
  };
  const share = () => { navigator.clipboard?.writeText(`${window.location.origin}/oeuvre/${item.id}`).then(() => toast.success("Lien de l'œuvre copié : partage-le"), () => toast.info(`${window.location.origin}/oeuvre/${item.id}`)); };

  return (
    <div className={"nw-sup nw-scroll s-" + ws} data-testid="nw-support-page">
      <header className="nw-sup-head">
        <p className="nw-k">{WS_KICK[ws] || "Soutenir la station"}</p>
        <h2 className="nw-rt">{plan?.page_title || "Faire vivre la station"}</h2>
        <div className="nw-sup-body">{(plan?.page_body || "Station Nexus vit grâce à celles et ceux qui la soutiennent. Chaque soutien finance la suite : de nouveaux chapitres, de nouveaux épisodes, de nouveaux mondes.").split("\n").filter(Boolean).map((t, i) => <p key={i}>{t}</p>)}</div>
        {isAdmin && <button className="nw-sup-adm" onClick={() => nav("/soutien")} data-testid="nw-support-edit"><IoCreateOutline size={14} /> Modifier les paliers (page Soutien)</button>}
      </header>

      {plan?.enabled && tiers.length > 0 ? (
        <div className="nw-sup-tiers" data-testid="nw-support-tiers">
          {tiers.map((t, i) => { const mine = active && activeTier === t.id; return (
            <article key={t.id || i} className={"nw-sup-tier" + (i === 1 ? " star" : "") + (mine ? " mine" : "")} style={{ animationDelay: `${i * 70}ms` }} data-testid={`nw-tier-${t.id || i}`}>
              <span className="nw-sup-n">{String(i + 1).padStart(2, "0")}</span>
              {i === 1 && <em className="nw-sup-badge">Le plus choisi</em>}
              <h3>{t.name}</h3>
              <p className="nw-sup-price"><b>{t.price_eur}€</b><small>/mois</small></p>
              <ul>{(t.perks || []).map((p, x) => <li key={x}><IoCheckmark size={14} />{p}</li>)}</ul>
              {mine ? <span className="nw-act on"><IoCheckmark /> Ton palier</span>
                : <button className="nw-act" disabled={busy} onClick={() => subscribe(t)} data-testid={`nw-tier-go-${t.id || i}`}>{active ? "Changer pour ce palier" : "Choisir ce palier"}</button>}
            </article>
          ); })}
        </div>
      ) : <p className="nw-desc nw-sup-off">L'abonnement n'est pas encore ouvert. En attendant, il y a d'autres façons d'aider, juste en dessous.</p>}

      <section className="nw-sup-ways">
        <h3 className="nw-sup-h">Les autres façons d'aider</h3>
        <div className="nw-sup-grid">
          {unlock && <button onClick={unlock.onBuy} disabled={unlock.buying}><IoLockOpenOutline size={18} /><b>Acheter « {item.title} »</b><small>Accès définitif à cette œuvre · {unlock.price}</small></button>}
          <button onClick={share} data-testid="nw-support-share"><IoLinkOutline size={18} /><b>Partager l'œuvre</b><small>Le bouche-à-oreille est le meilleur soutien</small></button>
          <button onClick={onComments}><IoChatbubbleOutline size={18} /><b>Laisser un mot</b><small>Un commentaire, ça compte vraiment</small></button>
          {onFav && <button onClick={onFav}>{fav ? <IoHeart size={18} /> : <IoHeartOutline size={18} />}<b>{fav ? "Dans tes coups de cœur" : "Ajouter aux coups de cœur"}</b><small>Pour la retrouver vite, et savoir ce qui plaît</small></button>}
        </div>
      </section>

      {supporters.length > 0 && (
        <section className="nw-sup-wall">
          <h3 className="nw-sup-h">Ils soutiennent déjà <small>{supporters.length}</small></h3>
          <p>{supporters.map((s) => <span key={s.id || s.name}>{s.name || "Anonyme"}<i>{s.tier_name}</i></span>)}</p>
        </section>
      )}
    </div>
  );
}
