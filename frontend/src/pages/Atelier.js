import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { atelierApi, imgSrc } from "@/lib/atelier";
import { mediaUrl } from "@/lib/api";
import AtelierLoader from "@/components/atelier/AtelierLoader";

const loadApp = () => import("@/components/atelier/AtelierApp");
const AtelierApp = lazy(loadApp);
const preloadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = i.onerror = res; i.src = src; setTimeout(res, 8000); });
const fadeOut = (a, ms, done) => {
  const v0 = a.volume; const t0 = performance.now();
  const step = (t) => { const k = Math.min(1, (t - t0) / ms); a.volume = v0 * (1 - k); if (k < 1) requestAnimationFrame(step); else { a.pause(); done(); } };
  requestAnimationFrame(step);
};
const STEPS = ["Ouverture du portail", "Synchronisation de tes univers", "Assemblage des modules", "Matérialisation des visuels", "Arrimage à l'Atelier"];
const MIN_TRAVEL = 5200;

// Vrai chargement façon voyage : données, code et images prêts avant d'entrer ; la musique du voyage s'estompe à l'arrivée
export default function Atelier() {
  const { isAdmin, enterMediaMode, exitMediaMode, musicVolume, muted } = useApp();
  const { ready } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState("loading");
  const audio = useRef(null);
  const inMedia = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (!isAdmin) { nav("/", { replace: true }); return; }
    let alive = true;
    const t0 = Date.now();
    const cached = qc.getQueryData(["atelier"]);
    (async () => {
      try {
        setStep(1);
        const data = cached || await qc.fetchQuery({ queryKey: ["atelier"], queryFn: atelierApi.bootstrap, staleTime: Infinity });
        if (!alive) return;
        const cfg = data.config || {};
        if (cfg.music_url && !muted) {
          enterMediaMode(); inMedia.current = true;
          const a = new Audio(mediaUrl(cfg.music_url));
          a.volume = musicVolume * 0.85; audio.current = a;
          a.play().catch(() => {});
        }
        setProgress(25); setStep(2);
        await loadApp();
        if (!alive) return;
        setProgress(45); setStep(3);
        const imgs = [...new Set([...data.universes.map((u) => u.cover), ...data.items.map((i) => i.image)].filter(Boolean))].map(imgSrc);
        let done = 0;
        await Promise.all(imgs.map((s) => preloadImg(s).then(() => { done++; if (alive) setProgress(45 + Math.round((done / imgs.length) * 45)); })));
        if (!alive) return;
        setProgress(92); setStep(4);
        await new Promise((r) => setTimeout(r, Math.max(0, (cached ? 2200 : MIN_TRAVEL) - (Date.now() - t0))));
        if (!alive) return;
        setProgress(100);
        setTimeout(() => {
          if (!alive) return;
          setPhase("arrive");
          const release = () => { if (inMedia.current) { inMedia.current = false; exitMediaMode(); } };
          if (audio.current) fadeOut(audio.current, 2600, release); else release();
          setTimeout(() => alive && setPhase("ready"), 1100);
        }, 500);
      } catch {
        if (alive) setPhase("error");
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line
  }, [ready, isAdmin]);

  useEffect(() => () => { audio.current?.pause(); if (inMedia.current) exitMediaMode(); }, []); // eslint-disable-line
  useEffect(() => { if (audio.current && phase === "loading") audio.current.volume = muted ? 0 : musicVolume * 0.85; }, [muted, musicVolume, phase]);

  const leave = () => nav("/");
  return (
    <div className="at-root" data-testid="atelier-page">
      {phase !== "loading" && phase !== "error" && (
        <Suspense fallback={null}><AtelierApp onLeave={leave} /></Suspense>
      )}
      {phase !== "ready" && <AtelierLoader progress={progress} label={STEPS[step]} error={phase === "error"} leaving={phase === "arrive"} onLeave={leave} />}
    </div>
  );
}
