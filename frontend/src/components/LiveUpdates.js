import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import changelog from "@/data/changelog.json";

// Paramètres › Mises à jour : les versions de l'interface publiées sur GitHub (branche « site »).
// Tester (pour soi seul) → Mettre en ligne (pour tout le monde) → Revenir à une version, ou à la version Emergent.
const fmt = (iso) => { try { return new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch (_) { return iso || ""; } };
const clearLocal = () => { try { localStorage.removeItem("nx_live"); localStorage.removeItem("nx_live_bad"); } catch (_) { /* rien */ } };

export default function LiveUpdates() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");
  const [ask, setAsk] = useState("");       // version en attente de confirmation
  const [open, setOpen] = useState({});
  const load = useCallback(() => {
    setErr("");
    api.get("/site/live-admin").then((r) => setD(r.data)).catch((e) => setErr(e?.response?.status === 404 ? "old" : "net"));
  }, []);
  useEffect(() => { load(); }, [load]);

  const L = window.__NX_LIVE;
  const running = L ? (L.test ? `Version de test · ${L.version}` : `Version GitHub · ${L.version}`) : "Version Emergent (le socle)";
  const appVer = changelog?.version || "";

  const publish = async (version) => {
    setBusy(version || "socle"); setAsk("");
    try {
      const r = await api.put("/site/live-admin", { published: version });
      setD((x) => ({ ...x, settings: r.data })); clearLocal();
      toast.success(version ? `Version ${version} en ligne. Recharge la page pour l'utiliser ici aussi.` : "La station revient à la version Emergent");
    } catch (e) { toast.error(e?.response?.data?.detail || "Publication impossible"); }
    setBusy("");
  };
  const setAuto = async (auto) => {
    try { const r = await api.put("/site/live-admin", { auto }); setD((x) => ({ ...x, settings: r.data })); clearLocal(); toast.success(auto ? "Chaque nouvelle version partira en ligne toute seule" : "Tu choisis toi-même la version en ligne"); }
    catch (_) { toast.error("Réglage impossible"); }
  };
  const test = (version) => { try { sessionStorage.setItem("nx_test", version); sessionStorage.removeItem("nx_socle"); } catch (_) { /* rien */ } window.location.reload(); };

  const box = { border: "1px solid var(--border-c)", borderRadius: "var(--radius-base)", background: "var(--bg-secondary)" };
  const btn = (strong) => ({ border: "1px solid " + (strong ? "var(--brand)" : "var(--border-c)"), background: strong ? "var(--brand)" : "transparent", color: strong ? "var(--bg-primary)" : "var(--text-primary)", borderRadius: "var(--radius-base)", padding: "6px 12px", fontSize: 13, fontWeight: strong ? 600 : 400 });
  const muted = { color: "var(--text-secondary)" };

  if (err === "old") return <p className="text-sm" style={muted} data-testid="live-old-server">Le serveur Emergent n'a pas encore la fonction de mises à jour : republie la station une fois sur Emergent.</p>;
  if (err) return <p className="text-sm" style={muted}>Impossible de joindre le serveur. <button style={btn()} onClick={load}>Réessayer</button></p>;
  if (!d) return <p className="text-sm" style={muted}>Chargement…</p>;

  const pub = d.settings?.published || "";
  const versions = d.versions || [];
  const idxPub = versions.findIndex((v) => v.version === pub);
  return (
    <div className="flex flex-col gap-4" data-testid="live-updates">
      <div className="p-4 flex flex-wrap gap-x-8 gap-y-2" style={box}>
        <div><div className="text-xs" style={muted}>Sur cet appareil</div><div className="font-semibold" data-testid="live-running">{running}</div><div className="text-xs" style={muted}>Interface {appVer}</div></div>
        <div><div className="text-xs" style={muted}>En ligne pour tout le monde</div><div className="font-semibold" data-testid="live-published">{d.settings?.auto ? "La plus récente (automatique)" : pub ? pub : "Version Emergent"}</div>{d.settings?.published_at && <div className="text-xs" style={muted}>depuis le {fmt(d.settings.published_at)}</div>}</div>
        <div><div className="text-xs" style={muted}>Serveur</div><div className="font-semibold">Niveau {d.api_level}{d.private ? " · dépôt privé" : ""}</div>{d.error && <div className="text-xs" style={{ color: "var(--brand)" }}>GitHub ne répond pas : la station garde la dernière version connue.</div>}</div>
      </div>

      {!versions.length && <p className="text-sm" style={muted} data-testid="live-empty">Aucune version publiée sur GitHub pour l'instant. Quand Claude « pousse », la nouvelle version apparaît ici.</p>}

      <div className="flex flex-col gap-2">
        {versions.map((v, i) => {
          const isPub = !d.settings?.auto && v.version === pub;
          const newer = idxPub < 0 || i < idxPub;
          const here = L && L.version === v.version;
          return (
            <div key={v.version} className="p-3" style={{ ...box, borderColor: isPub ? "var(--brand)" : "var(--border-c)" }} data-testid={`live-v-${v.version}`}>
              <div className="flex flex-wrap items-center gap-2">
                <b style={{ color: "var(--text-primary)" }}>{v.version}</b>
                <span className="text-xs" style={muted}>{fmt(v.built_at)}</span>
                {isPub && <span className="text-xs px-2 py-0.5" style={{ border: "1px solid var(--brand)", borderRadius: 99, color: "var(--brand)" }}>En ligne</span>}
                {here && <span className="text-xs px-2 py-0.5" style={{ border: "1px solid var(--border-c)", borderRadius: 99 }}>Sur cet appareil</span>}
                {!v.compatible && <span className="text-xs" style={{ color: "var(--brand)" }}>Demande une mise à jour du serveur sur Emergent (niveau {v.requires_api})</span>}
                <span className="flex-1" />
                {v.compatible && <button style={btn()} onClick={() => test(v.version)} data-testid={`live-test-${v.version}`}>Tester</button>}
                {v.compatible && !isPub && (ask === v.version
                  ? <><button style={btn(true)} disabled={!!busy} onClick={() => publish(v.version)} data-testid={`live-confirm-${v.version}`}>{busy === v.version ? "…" : "Confirmer"}</button><button style={btn()} onClick={() => setAsk("")}>Annuler</button></>
                  : <button style={btn(newer)} onClick={() => setAsk(v.version)} data-testid={`live-publish-${v.version}`}>{newer ? "Mettre en ligne" : "Revenir à celle-ci"}</button>)}
              </div>
              {v.notes?.length > 0 && <>
                <button className="text-xs mt-1" style={muted} onClick={() => setOpen((o) => ({ ...o, [v.version]: !o[v.version] }))}>{open[v.version] ? "Masquer les nouveautés" : `Nouveautés (${v.notes.length})`}</button>
                {open[v.version] && <ul className="text-sm mt-1 pl-4" style={{ listStyle: "disc", color: "var(--text-primary)" }}>{v.notes.map((n, k) => <li key={k}>{n}</li>)}</ul>}
              </>}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
          <input type="checkbox" checked={!!d.settings?.auto} onChange={(e) => setAuto(e.target.checked)} data-testid="live-auto" />
          Publication automatique (sans test)
        </label>
        <span className="flex-1" />
        {(pub || d.settings?.auto) && (ask === "socle"
          ? <><button style={btn(true)} onClick={() => { publish(""); if (d.settings?.auto) setAuto(false); }} data-testid="live-socle-confirm">Confirmer le retour</button><button style={btn()} onClick={() => setAsk("")}>Annuler</button></>
          : <button style={btn()} onClick={() => setAsk("socle")} data-testid="live-socle">Revenir à la version Emergent</button>)}
        <button style={btn()} onClick={load}>Actualiser</button>
      </div>
      <p className="text-xs" style={muted}>Secours : <b>stationexus.store/?socle</b> ouvre toujours la version Emergent sur l'appareil, <b>?normal</b> revient au fonctionnement habituel. Une version qui ne démarre pas est écartée toute seule.</p>
    </div>
  );
}
