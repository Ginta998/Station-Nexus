import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listCreations, listCategories, posterUrl, bgUrl } from "@/lib/api";
import { playLaunch, getLaunchSound } from "@/lib/launchSound";
import { useApp } from "@/context/AppContext";
import Box3D from "@/components/nexus/Box3D";
import { EtuiLaunch, edOf } from "@/components/atelier/AlexEdition";
import { Face } from "@/components/atelier/AlexCore";
import { useJaqDefault, mergeJaq, edOfIt, kindOfCreation } from "@/lib/jaquette";
import { launchDuration } from "@/components/nexus/launchTiming";
import { fmtOfCreation } from "@/components/nexus/NexusHome";
import "@/components/atelier/alexandrie.css";
import "@/components/nexus/nexus.css";
import "@/components/nexus/launch.css";

// Le lancement d'une œuvre, pour toute la Station : d'où qu'on entre (rayons, la une, l'accès rapide, un univers,
// la recherche, une page d'univers…), on voit l'objet de l'œuvre s'ouvrir avant d'arriver dans son monde.
// N'importe quel endroit demande l'entrée avec l'événement nx-start { id, quick }.
const readJ = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (_) { return null; } };
const resumable = (it) => (it.launch_type === "chapters" && it.chapters?.length && readJ("sx_progress_" + it.id)) || (it.launch_type === "episodes" && it.episodes?.length && readJ("sx_eplast_" + it.id) != null);
const CTA = { vhs: "▶ PLAY", vinyle: "◉ FACE A", livre: "OUVERTURE" };

export default function LaunchHost() {
  const nav = useNavigate();
  const { sfx, uiVolume = 0.6, muted } = useApp();
  const { data: all = [] } = useQuery({ queryKey: ["creations"], queryFn: () => listCreations() });
  const { data: cats = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const catOf = useMemo(() => Object.fromEntries(cats.map((c) => [c.key, c])), [cats]);
  const [launch, setLaunch] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const allR = useRef(all); allR.current = all;
  const jd = useJaqDefault(); const jdR = useRef(jd); jdR.current = jd;
  const quickR = useRef(false);

  const go = useCallback((x) => {
    setLaunch(null);
    // Un voile tient l'écran le temps que le monde se charge (il est retiré par le monde, ou au bout de 4 s au plus tard)
    if (!document.getElementById("nx-veil")) { const v = document.createElement("div"); v.id = "nx-veil"; v.setAttribute("aria-hidden", "true"); document.body.appendChild(v); setTimeout(() => v.remove(), 4000); }
    nav(`/oeuvre/${x.id}`, { state: quickR.current && resumable(x.it) ? { resume: true } : undefined });
  }, [nav]);

  useEffect(() => {
    const h = (ev) => {
      const id = ev.detail?.id; if (!id) return;
      const all = allR.current; const it = all.find((c) => c.id === id);
      if (!it) { sfx?.("select"); nav(`/oeuvre/${id}`); return; }
      const c = catOf[it.category];
      const x = { id, it, title: it.title || "Sans titre", sub: it.tagline || "", format: fmtOfCreation(it, c?.label), emblem: it.kanji || c?.kanji || "核", house: (it.univers || "STATION NEXUS").toUpperCase(), cote: `SN-${String((it.order ?? all.indexOf(it)) + 1).padStart(3, "0")}`, kind: kindOfCreation(it), spine: mergeJaq(jdR.current, it.jaquette), ...edOfIt(it, jdR.current), up: it.category === "avenir", cover: it.has_poster ? posterUrl(it.id, it.updated_at, 480) : "" };
      try { const r = readJ("sx_recent") || []; localStorage.setItem("sx_recent", JSON.stringify([id, ...r.filter((y) => y !== id)].slice(0, 8))); } catch (_) {}
      try { [posterUrl(id, it.updated_at), it.has_bg ? bgUrl(id, it.updated_at) : null].filter(Boolean).forEach((u) => { const im = new Image(); im.decoding = "async"; im.src = u; im.decode?.().catch(() => {}); }); } catch (_) {}
      quickR.current = !!ev.detail?.quick;
      sfx?.("select");
      playLaunch(muted ? 0 : uiVolume, getLaunchSound(x.format === "vhs" || x.format === "vinyle" ? x.format : "livre"));
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { go(x); return; }
      setLaunch(x);
    };
    window.addEventListener("nx-start", h); return () => window.removeEventListener("nx-start", h);
  }, [catOf, go, nav, sfx, muted, uiVolume]);

  useEffect(() => {
    if (!launch) return undefined;
    setLeaving(false);
    const d = launchDuration();
    const a = setTimeout(() => setLeaving(true), d - 320); const t = setTimeout(() => go(launch), d);
    const k = (e) => { if (["Escape", "Enter", " "].includes(e.key)) { e.preventDefault(); go(launch); } };
    window.addEventListener("keydown", k);
    return () => { clearTimeout(a); clearTimeout(t); window.removeEventListener("keydown", k); };
  }, [launch, go]);

  if (!launch) return null;
  // Rendu dans <body> : au-dessus de tout ce qui est ouvert (fenêtre d'univers, notice…), quel que soit l'empilement de l'App
  return createPortal(
    <div className={"nx-launchfx f-" + launch.format + (leaving ? " out" : "")} onClick={() => go(launch)} data-testid="nx-launchfx" role="status" aria-label={`Lancement de ${launch.title}`}>
      <i className="nx-lf-glow" aria-hidden="true" />
      <div className="nx-lf-obj">{edOf(launch)?.etui ? <EtuiLaunch b={launch} em={launch.emblem}><Face b={launch} cover={launch.cover} /></EtuiLaunch> : <Box3D b={launch} cover={launch.cover} open />}</div>
      <p className="nx-lf-t"><span className="mono">{CTA[launch.format] || CTA.livre}</span>{launch.title}</p>
      <small className="mono nx-lf-skip">TOUCHE OU CLIC POUR PASSER</small>
    </div>, document.body);
}
