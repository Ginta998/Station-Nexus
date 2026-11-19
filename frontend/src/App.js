import "@/App.css";
import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import AuthDialog from "@/components/AuthDialog";
import Home from "@/pages/Home";
import Detail from "@/pages/Detail";
const Settings = lazy(() => import("@/pages/Settings"));
const Contact = lazy(() => import("@/pages/Contact"));
const Members = lazy(() => import("@/pages/Members"));
const Journal = lazy(() => import("@/pages/Journal"));
const JournalEntry = lazy(() => import("@/pages/JournalEntry"));
const JournalEditor = lazy(() => import("@/pages/JournalEditor"));
const Planning = lazy(() => import("@/pages/Planning"));
const Tutorial = lazy(() => import("@/pages/Tutorial"));
const Library = lazy(() => import("@/pages/Library"));
const SupportPage = lazy(() => import("@/pages/SupportPage"));
const About = lazy(() => import("@/pages/About"));
const Revenue = lazy(() => import("@/pages/Revenue"));
const Chat = lazy(() => import("@/pages/Chat"));
import { ChatProvider } from "@/context/ChatContext";
const PaymentResult = lazy(() => import("@/pages/PaymentResult"));
const Legal = lazy(() => import("@/pages/Legal"));
const Resiliation = lazy(() => import("@/pages/Resiliation"));
const Retractation = lazy(() => import("@/pages/Retractation"));
import LegalFooter from "@/components/LegalFooter";
import { CheckoutConfirmHost } from "@/components/CheckoutConfirm";
import AgeGate from "@/components/AgeGate";
import { ReportHost } from "@/components/ReportDialog";
import BootIntro from "@/components/BootIntro";
import CosmicBunny from "@/components/CosmicBunny";
import GlobalSound from "@/components/GlobalSound";
import SpectatorBadge from "@/components/SpectatorBadge";
import YtMini from "@/components/YtMini";
import PortalListener from "@/components/atelier/PortalListener";
const Atelier = lazy(() => import("@/pages/Atelier"));
const SharedDoc = lazy(() => import("@/pages/SharedDoc"));
const Shelf = lazy(() => import("@/pages/Shelf"));
import CyberOverlay from "@/components/CyberOverlay";
import CosmicBackground from "@/components/CosmicBackground";
import ThemeRuntime from "@/components/ThemeRuntime";
import { ThemeLoader } from "@/components/ThemeStudio";
import SiteMeta from "@/components/SiteMeta";
import GuidedTour from "@/components/GuidedTour";
import { getSettings, listCreations, listCategories, posterUrl, hit } from "@/lib/api";
import { INTROS } from "@/lib/intro";
import { StartupRedirect, startTarget } from "@/components/Startup";
import { useQueryClient } from "@tanstack/react-query";

const markEntered = () => { sessionStorage.setItem("sx_entered", "1"); window.dispatchEvent(new Event("sx-entered")); };

// Navigue in-app quand l'utilisateur clique sur une notification push (app déjà ouverte)
function PushClickNav() {
  const nav = useNavigate();
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onMsg = (e) => {
      if (e.data && e.data.type === "navigate" && e.data.url) {
        try { nav(e.data.url.replace(window.location.origin, "")); } catch (_) {}
      }
    };
    navigator.serviceWorker.addEventListener("message", onMsg);
    return () => navigator.serviceWorker.removeEventListener("message", onMsg);
  }, [nav]);
  return null;
}

function IntroGate() {
  const [show, setShow] = useState(false);
  const [config, setConfig] = useState(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (sessionStorage.getItem("sx_intro_shown") === "1") { markEntered(); return; }
    // L'Atelier a son propre splash : jamais l'intro publique par-dessus
    if (window.location.pathname.startsWith("/atelier")) { markEntered(); return; }
    if (localStorage.getItem("sx_intro_off") === "1") { markEntered(); return; }
    if (startTarget() === "atelier" && window.location.pathname === "/" && !sessionStorage.getItem("sx_start_done")) { markEntered(); return; }

    // Prefetch the Home data + warm poster images while the intro animation plays,
    // so the launcher appears instantly (no loading spinner) once the intro ends.
    qc.prefetchQuery({ queryKey: ["categories"], queryFn: listCategories });
    qc.prefetchQuery({ queryKey: ["creations"], queryFn: () => listCreations() }).then(() => {
      const data = qc.getQueryData(["creations"]) || [];
      data.slice(0, 16).forEach((c) => { if (c.has_poster) { const img = new Image(); img.src = posterUrl(c.id, c.updated_at, 360); } });
    });

    qc.fetchQuery({ queryKey: ["settings"], queryFn: getSettings })
      .then((s) => {
        let type = s.intro_type || "tengoku";
        const hasVideo = !!s.intro_has_video;
        if (type === "random") {
          const hidden = s.intro_hidden || [];
          const pool = INTROS.filter((i) => !hidden.includes(i.key)).map((i) => i.key);
          if (hasVideo) pool.push("video");
          type = pool.length ? pool[Math.floor(Math.random() * pool.length)] : "tengoku";
        }
        setConfig({ type, hasVideo, welcomeMessages: s.welcome_messages || [] });
        setShow(true);
      })
      .catch(() => {});
    // eslint-disable-next-line
  }, []);

  if (!show || !config) return null;
  return (
    <BootIntro
      type={config.type}
      hasVideo={config.hasVideo}
      welcomeMessages={config.welcomeMessages}
      onDone={() => { sessionStorage.setItem("sx_intro_shown", "1"); markEntered(); setShow(false); }}
    />
  );
}

// Les pages autres que l'accueil et l'œuvre se chargent à la demande : la station s'ouvre plus vite
function RouteLoading() {
  return <div className="route-loading" role="status" aria-label="Chargement"><span /></div>;
}

// Tes chiffres : une visite par session, avec le site d'où l'on vient (le domaine seulement)
function VisitHit() {
  useEffect(() => {
    try { if (sessionStorage.getItem("nx-visit")) return; sessionStorage.setItem("nx-visit", "1"); } catch (_) { /* rien */ }
    const ref = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : "";
    const utm = new URLSearchParams(window.location.search).get("utm_source") || "";
    hit("visit", { ref: utm || ref });
  }, []);
  return null;
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
      <AppProvider>
        <ChatProvider>
        <BrowserRouter>
          <CosmicBackground />
          <ThemeRuntime />
          <ThemeLoader />
          <SiteMeta />
          <VisitHit />
          <StartupRedirect />
          <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/oeuvre/:id" element={<Detail />} />
            <Route path="/parametres" element={<Settings />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/membres" element={<Members />} />
            <Route path="/nouveautes" element={<Navigate to="/journal" replace />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/nouveau" element={<JournalEditor />} />
            <Route path="/journal/:id" element={<JournalEntry />} />
            <Route path="/journal/:id/modifier" element={<JournalEditor />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/etagere" element={<Shelf />} />
            <Route path="/soutien" element={<SupportPage />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/atelier" element={<Atelier />} />
            <Route path="/d/:token" element={<SharedDoc />} />
            <Route path="/revenus" element={<Revenue />} />
            <Route path="/salon" element={<Chat />} />
            <Route path="/payment/success" element={<PaymentResult mode="success" />} />
            <Route path="/payment/cancel" element={<PaymentResult mode="cancel" />} />
            <Route path="/legal/:doc" element={<Legal />} />
            <Route path="/resiliation" element={<Resiliation />} />
            <Route path="/retractation" element={<Retractation />} />
          </Routes>
          </Suspense>
          <LegalFooter />
          <CheckoutConfirmHost />
          <AgeGate />
          <ReportHost />
          <CosmicBunny />
          <GlobalSound />
          <SpectatorBadge />
          <YtMini />
          <PortalListener />
          <PushClickNav />
          <GuidedTour />
        </BrowserRouter>
        <CyberOverlay />
        <IntroGate />
        <AuthDialog />
        <Toaster position="top-center" theme="dark" richColors />
        </ChatProvider>
      </AppProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
