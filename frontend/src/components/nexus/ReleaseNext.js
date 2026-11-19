import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IoNotificationsOutline, IoNotifications, IoClose } from "react-icons/io5";
import { getWatch, watchCreation, unwatchCreation } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

/*
  La prochaine sortie de l'œuvre, dans son monde : un compte à rebours, et « Me prévenir ».
  Avec un compte, un clic suffit ; sinon on laisse son email. À l'heure dite, une notification et un email partent tout seuls.
  Si les soutiens ont une avant-première, on le dit (et on mène à la page Soutenir du monde).
*/
const left = (ms) => {
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000); const d = Math.floor(s / 86400); const h = Math.floor((s % 86400) / 3600); const m = Math.floor((s % 3600) / 60); const sec = s % 60;
  return { d, h, m, s: sec };
};
const pad = (n) => String(n).padStart(2, "0");
const day = (iso) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export default function ReleaseNext({ item, onSupport, compact = false }) {
  const nr = item?.next_release;
  const { user } = useAuth() || {};
  const qc = useQueryClient();
  const [now, setNow] = useState(Date.now());
  const [ask, setAsk] = useState(false); const [email, setEmail] = useState(""); const [done, setDone] = useState(false);
  const [hide, setHide] = useState(false);
  const { data: w } = useQuery({ queryKey: ["watch", item?.id], queryFn: () => getWatch(item.id), enabled: !!nr && !!user });
  useEffect(() => { if (!nr) return undefined; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [nr]);
  if (!nr || hide) return null;
  const at = new Date(nr.at).getTime(); const L = left(at - now);
  const watching = done || w?.watching;
  const unit = nr.unit === "episode" ? "Épisode" : (item.unit_label || "Chapitre");
  const toggle = async () => {
    try {
      if (watching && user) { await unwatchCreation(item.id); setDone(false); qc.invalidateQueries({ queryKey: ["watch", item.id] }); toast("Tu ne seras plus prévenu pour cette œuvre"); return; }
      if (!user && !ask) { setAsk(true); return; }
      if (!user && !/^\S+@\S+\.\S+$/.test(email.trim())) { toast.error("Écris ton adresse email"); return; }
      await watchCreation(item.id, email.trim()); setDone(true); setAsk(false); qc.invalidateQueries({ queryKey: ["watch", item.id] });
      toast.success(user ? "C'est noté : tu seras prévenu à la sortie" : "C'est noté : un email t'attend à la sortie");
    } catch (e) { toast.error(e?.response?.data?.detail || "Impossible pour l'instant"); }
  };
  return (
    <aside className={"nw-next" + (compact ? " compact" : "")} data-testid="nw-next" aria-label="Prochaine sortie">
      <button className="nw-next-x" onClick={() => setHide(true)} aria-label="Masquer"><IoClose size={13} /></button>
      <p className="nw-next-k">PROCHAINE SORTIE</p>
      <p className="nw-next-t"><b>{unit} {nr.index}</b>{nr.title ? ` · ${nr.title}` : ""}</p>
      {L ? (
        <div className="nw-next-c" aria-live="polite">
          {L.d > 0 && <span><b>{L.d}</b><small>j</small></span>}
          <span><b>{pad(L.h)}</b><small>h</small></span><span><b>{pad(L.m)}</b><small>min</small></span><span><b>{pad(L.s)}</b><small>s</small></span>
        </div>
      ) : <p className="nw-next-now">C'est l'heure : recharge la page.</p>}
      <p className="nw-next-d">{day(nr.at)}</p>
      {nr.early_at && new Date(nr.early_at).getTime() > now - 1 && (
        <p className="nw-next-e">Les soutiens{nr.early_tier_name ? ` (${nr.early_tier_name} et au-dessus)` : ""} le lisent dès le {day(nr.early_at)}. {onSupport && <button onClick={onSupport}>Soutenir la station</button>}</p>
      )}
      {ask && !user && <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && toggle()} placeholder="ton@email.fr" autoFocus data-testid="nw-next-email" />}
      <button className={"nw-next-go" + (watching ? " on" : "")} onClick={toggle} data-testid="nw-next-watch">
        {watching ? <><IoNotifications size={15} /> Tu seras prévenu{user ? " · annuler" : ""}</> : <><IoNotificationsOutline size={15} /> {ask ? "Valider" : "Me prévenir"}</>}
      </button>
    </aside>
  );
}
