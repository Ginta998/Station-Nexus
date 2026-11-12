import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { atelierApi, imgSrc } from "@/lib/atelier";
import { mediaUrl } from "@/lib/api";
import AtelierLoader from "@/components/atelier/AtelierLoader";
import { configureSound, startPortalAmbience, PORTAL_AMBIENCES } from "@/lib/sound";

const loadApp = () => import("@/components/atelier/AtelierApp");
const AtelierApp = lazy(loadApp);
const preloadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = i.onerror = res; i.src = src; setTimeout(res, 8000); });
const fadeOut = (a, ms, done) => {
  const v0 = a.volume; const t0 = performance.now();
  const step = (t) => { const k = Math.min(1, (t - t0) / ms); a.volume = v0 * (1 - k); if (k < 1) requestAnimationFrame(step); else { a.pause(); done(); } };
  requestAnimationFrame(step);
};
const STEPS = ["Identification", "Synchronisation des archives", "Assemblage des modules", "Chargement des visuels", "Ouverture du pont"];
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
  const [granted, setGranted] = useState(false);
  const skipRef = useRef(false);
  const appReady = useRef(false);
  const finishRef = useRef(null);
  const audio = useRef(null);
  const amb = useRef(null);
  const inMedia = useRef(false);
  const real = useRef(0);
  const direct = useRef(new URLSearchParams(window.location.search).has("direct") || !!window.history.state?.usr?.direct).current;
  const setReal = (v) => { real.current = Math.max(real.current, v); };

  useEffect(() => {
    if (!ready) return;
    if (!isAdmin) { nav("/", { replace: true }); return; }
    let alive = true;
    const t0 = Date.now();
    const release = () => { if (inMedia.current) { inMedia.current = false; exitMediaMode(); } };
    // Ambiance du portail : réglage de l'Atelier (Réglages → Portail), mémorisé aussi sur l'appareil
    const SYN = PORTAL_AMBIENCES.map((a) => a.key);
    const pref = localStorage.getItem("nx-portal-amb");
    let ambKind = SYN.includes(pref) ? pref : pref ? null : "archives";
    if (!direct && ambKind) amb.current = startPortalAmbience(ambKind);
    finishRef.current = () => {
      if (!alive) return; alive = false;
      amb.current?.stop(900);
      if (audio.current) fadeOut(audio.current, 900, release); else release();
      setPhase("arrive"); setTimeout(() => setPhase("ready"), 700);
    };
    const cached = qc.getQueryData(["atelier"]);
    (async () => {
      try {
        // la barre monte progressivement (durée du voyage) et ne finit que quand tout est réellement chargé
        const bar = new Promise((resolve) => {
          let shown = 0;
          const tick = () => {
            if (!alive) return resolve();
            const travel = Math.min(1, (Date.now() - t0) / (cached ? 2400 : MIN_TRAVEL));
            const target = Math.min(real.current, real.current === 100 && travel >= 1 ? 100 : travel * 99);
            shown += (target - shown) * 0.09;
            if (target - shown < 0.4) shown = target;
            setProgress(Math.floor(shown));
            if (shown >= 100) resolve(); else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
        setStep(1);
        const data = cached || await qc.fetchQuery({ queryKey: ["atelier"], queryFn: atelierApi.bootstrap, staleTime: Infinity });
        if (!alive) return;
        if (direct) { await loadApp(); if (alive) setPhase("ready"); return; }
        const cfg = data.config || {};
        try { if (cfg.portal_key) localStorage.setItem("nx-portal-key", cfg.portal_key); } catch (_) {}
        const choice = cfg.portal_ambience || pref || (cfg.music_url ? "music" : "archives");
        if (choice !== ambKind) {
          amb.current?.stop(choice === "music" ? 1500 : 500); amb.current = null;
          if (SYN.includes(choice) && alive) { ambKind = choice; amb.current = startPortalAmbience(choice); }
        }
        if (choice === "music" && cfg.music_url && !muted) {
          enterMediaMode(); inMedia.current = true;
          const a = new Audio(mediaUrl(cfg.music_url));
          a.volume = musicVolume * 0.85; audio.current = a;
          a.play().catch(() => {});
        }
        setReal(25); setStep(2);
        await loadApp();
        if (!alive) return;
        appReady.current = true;
        if (skipRef.current) { finishRef.current(); return; }
        setReal(45); setStep(3);
        const imgs = [...new Set([...data.universes.map((u) => u.cover), ...data.items.map((i) => i.image)].filter(Boolean))].map(imgSrc);
        let done = 0;
        await Promise.all(imgs.map((s) => preloadImg(s).then(() => { done++; if (alive) setReal(45 + Math.round((done / imgs.length) * 45)); })));
        if (!alive) return;
        setReal(96); setStep(4);
        await document.fonts?.ready;
        if (!alive) return;
        setReal(100);
        await bar;
        if (!alive) return;
        setGranted(true); // « ACCÈS AUTORISÉ » se décode, puis l'obturateur se referme sur le pont
        setTimeout(() => {
          if (!alive) return;
          setPhase("arrive");
          amb.current?.stop(2200);
          if (audio.current) fadeOut(audio.current, 2600, release); else release();
          setTimeout(() => alive && setPhase("ready"), 1000);
        }, 1300);
      } catch {
        amb.current?.stop(600);
        if (alive) setPhase("error");
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line
  }, [ready, isAdmin]);

  useEffect(() => () => { amb.current?.stop(300); audio.current?.pause(); if (inMedia.current) exitMediaMode(); }, []); // eslint-disable-line
  useEffect(() => { configureSound({ zone: "atelier" }); document.documentElement.classList.add("in-atelier"); return () => { configureSound({ zone: "" }); document.documentElement.classList.remove("in-atelier"); }; }, []);
  useEffect(() => { if (audio.current && phase === "loading") audio.current.volume = muted ? 0 : musicVolume * 0.85; }, [muted, musicVolume, phase]);

  const leave = () => nav("/");
  // Passer le splash : dès que le code de l'Atelier est chargé (sinon dès qu'il l'est)
  const skip = () => { if (appReady.current) finishRef.current?.(); else skipRef.current = true; };
  return (
    <div className="at-root" data-testid="atelier-page">
      {phase !== "loading" && phase !== "error" && (
        <Suspense fallback={null}><AtelierApp onLeave={leave} /></Suspense>
      )}
      {phase !== "ready" && <AtelierLoader progress={progress} label={STEPS[step]} steps={STEPS} step={step} granted={granted} error={phase === "error"} leaving={phase === "arrive"} onLeave={leave} onSkip={phase === "loading" ? skip : undefined} />}
    </div>
  );
}
