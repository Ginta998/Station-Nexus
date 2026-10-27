import { useState } from "react";
import { IoRefresh, IoSparkles } from "react-icons/io5";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { atelierApi } from "@/lib/atelier";
import { playUiSound } from "@/lib/sound";
import BunnySprite from "@/components/atelier/BunnySprite";

const SECTIONS = [["avance", "進", "Ce qui avance"], ["bloque", "障", "Ce qui bloque"], ["echeance", "期", "Prochaine échéance"], ["idee", "想", "Une idée"], ["conseil", "助", "Le conseil du jour"]];
const fdt = (iso) => new Date(iso).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

// Briefing du matin : préparé par Bunny uniquement quand on le demande
export default function BunnyBriefing() {
  const qc = useQueryClient();
  const { data: b } = useQuery({ queryKey: ["bunny-briefing"], queryFn: atelierApi.bunnyBriefing, staleTime: Infinity });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [pose, setPose] = useState("neutral");
  const [hop, setHop] = useState(0);
  const has = b?.sections;
  const isToday = has && new Date(b.at).toDateString() === new Date().toDateString();

  const make = async () => {
    setBusy(true); setErr(""); setPose("thumbs");
    try {
      const doc = await atelierApi.bunnyMakeBriefing();
      qc.setQueryData(["bunny-briefing"], doc); setPose("excited"); setHop((h) => h + 1); playUiSound("chirp", "bunny");
    } catch (e) { setErr(e?.response?.data?.detail || "Bunny a renversé son café cosmique… réessaie !"); setPose("sad"); playUiSound("oops", "bunny"); }
    finally { setBusy(false); }
  };

  return (
    <div className={"at-panel bn-brief" + (busy ? " busy" : "")} data-testid="bunny-briefing">
      <div className="bn-brief-h">
        <BunnySprite pose={busy ? "thumbs" : pose} hop={hop} size={64} />
        <div className="grow">
          <p className="at-eyebrow mono">// BRIEFING DU MATIN · COSMIC BUNNY</p>
          <h2>{has ? b.sections.salut || "Ton briefing est prêt !" : "On fait le point ensemble ?"}</h2>
          <small className="mono" data-testid="bunny-briefing-date">{has ? `${isToday ? "AUJOURD'HUI" : "PRÉPARÉ"} · ${fdt(b.at).toUpperCase()} · VIA ${b.via.toUpperCase()}` : "BUNNY LIT TES TÂCHES, ÉCHÉANCES ET UNIVERS"}</small>
        </div>
        <button className="at-btn" onClick={make} disabled={busy} data-testid="bunny-briefing-btn">
          {busy ? <><span className="bn-spin" />Bunny prépare…</> : has ? <><IoRefresh size={15} />Refaire le briefing</> : <><IoSparkles size={15} />Briefing du matin</>}
        </button>
      </div>
      {err && <p className="bn-err" data-testid="bunny-briefing-error">{err}</p>}
      {has && (
        <>
          <div className="bn-brief-meta mono">
            <span className={b.meta?.overdue ? "warn" : ""}>{b.meta?.overdue || 0} EN RETARD</span><span>{b.meta?.today || 0} AUJOURD'HUI</span><span>{b.meta?.open || 0} OUVERTES</span>
            {b.meta?.next && <span>PROCHAINE : {b.meta.next.title.toUpperCase()} · {b.meta.next.date}</span>}
          </div>
          <div className="bn-brief-grid">
            {SECTIONS.filter(([k]) => b.sections[k]).map(([k, kj, label]) => (
              <div key={k} className="bn-brief-c" data-testid={`bunny-briefing-${k}`}><span className="kj">{kj}</span><div><small className="mono">{label.toUpperCase()}</small><p>{b.sections[k]}</p></div></div>
            ))}
          </div>
          {b.sections.mot && <p className="bn-brief-mot" data-testid="bunny-briefing-mot">« {b.sections.mot} »</p>}
        </>
      )}
    </div>
  );
}
