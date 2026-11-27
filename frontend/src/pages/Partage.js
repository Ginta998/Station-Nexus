import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoLogoYoutube, IoCheckmarkCircle, IoAlertCircle } from "react-icons/io5";
import { useApp } from "@/context/AppContext";
import { atelierApi } from "@/lib/atelier";

// « Partager vers Station Nexus » : depuis l'appli YouTube (Partager › Station Nexus), la vidéo arrive dans le Salon de l'Atelier.
// Il faut que la Station soit installée sur le téléphone (Ajouter à l'écran d'accueil) et être connecté en admin.
const YT = /(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/;
export default function Partage() {
  const nav = useNavigate(); const { isAdmin } = useApp();
  const [st, setSt] = useState({ k: "wait" });
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const raw = [q.get("url"), q.get("text"), q.get("title")].filter(Boolean).join(" ");
    const list = (raw.match(/[?&]list=([\w-]{10,64})/) || [])[1];
    const vid = (raw.match(YT) || [])[1];
    if (!isAdmin) { const t = setTimeout(() => setSt({ k: "err", m: "Connecte-toi en admin sur la Station, puis partage à nouveau." }), 2500); return () => clearTimeout(t); }
    if (!vid && !list) { setSt({ k: "err", m: "Ce partage ne contient pas de vidéo YouTube." }); return; }
    let done = false;
    (async () => { if (done) return; done = true;
      try {
        if (list && !vid) { const r = await atelierApi.ytSync({ list, keep: false }); setSt({ k: "ok", m: `${r.added} vidéo(s) de « ${r.name} » ajoutée(s) au Salon` }); return; }
        let title = (q.get("title") || "").trim();
        try { const t = await atelierApi.ytTitles(vid); title = t?.[vid]?.title || title; } catch (_) {}
        await atelierApi.createLink({ title: title || "Vidéo YouTube", url: `https://www.youtube.com/watch?v=${vid}`, kind: "watch", color: "", cover: "", universe_id: null, order: 0 });
        setSt({ k: "ok", m: `« ${title || "La vidéo"} » est dans ton Salon`, vid });
      } catch (e) { setSt({ k: "err", m: e?.response?.data?.detail || "Ajout impossible pour l'instant." }); }
    })();
  }, [isAdmin]);
  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, background: "var(--bg-primary)", color: "var(--text-primary)" }} data-testid="partage">
      <div style={{ maxWidth: 420, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {st.vid ? <img src={`https://i.ytimg.com/vi/${st.vid}/hqdefault.jpg`} alt="" style={{ width: "100%", borderRadius: 14 }} /> : <IoLogoYoutube size={46} style={{ color: "var(--brand)" }} />}
        {st.k === "wait" && <p>Ajout au Salon…</p>}
        {st.k !== "wait" && <p style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 17 }}>{st.k === "ok" ? <IoCheckmarkCircle style={{ color: "var(--brand)" }} /> : <IoAlertCircle />}{st.m}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn" onClick={() => nav("/atelier")} style={{ padding: "10px 16px", borderRadius: 10, background: "var(--brand)", color: "var(--bg-primary)" }}>Ouvrir l'Atelier</button>
          <button className="btn" onClick={() => nav("/")} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid var(--border-c)" }}>La Station</button>
        </div>
      </div>
    </div>
  );
}
