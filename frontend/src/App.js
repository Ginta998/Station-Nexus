import "@/App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import AuthDialog from "@/components/AuthDialog";
import Home from "@/pages/Home";
import Detail from "@/pages/Detail";
import Settings from "@/pages/Settings";
import Contact from "@/pages/Contact";
import Members from "@/pages/Members";
import Novelties from "@/pages/Novelties";
import Tutorial from "@/pages/Tutorial";
import Library from "@/pages/Library";
import PaymentResult from "@/pages/PaymentResult";
import BootIntro from "@/components/BootIntro";
import CosmicBunny from "@/components/CosmicBunny";
import { getSettings, listCreations, listCategories, posterUrl } from "@/lib/api";
import { INTROS } from "@/lib/intro";
import { useQueryClient } from "@tanstack/react-query";

const markEntered = () => { sessionStorage.setItem("sx_entered", "1"); window.dispatchEvent(new Event("sx-entered")); };

function IntroGate() {
  const [show, setShow] = useState(false);
  const [config, setConfig] = useState(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (sessionStorage.getItem("sx_intro_shown") === "1") { markEntered(); return; }
    if (localStorage.getItem("sx_intro_off") === "1") { markEntered(); return; }

    // Prefetch the Home data + warm poster images while the intro animation plays,
    // so the launcher appears instantly (no loading spinner) once the intro ends.
    qc.prefetchQuery({ queryKey: ["categories"], queryFn: listCategories });
    qc.prefetchQuery({ queryKey: ["creations"], queryFn: () => listCreations() }).then(() => {
      const data = qc.getQueryData(["creations"]) || [];
      data.slice(0, 16).forEach((c) => { if (c.has_poster) { const img = new Image(); img.src = posterUrl(c.id, c.updated_at); } });
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

function App() {
  return (
    <div className="App">
      <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/oeuvre/:id" element={<Detail />} />
            <Route path="/parametres" element={<Settings />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/membres" element={<Members />} />
            <Route path="/nouveautes" element={<Novelties />} />
            <Route path="/tutoriel" element={<Tutorial />} />
            <Route path="/bibliotheque" element={<Library />} />
            <Route path="/payment/success" element={<PaymentResult mode="success" />} />
            <Route path="/payment/cancel" element={<PaymentResult mode="cancel" />} />
          </Routes>
          <CosmicBunny />
        </BrowserRouter>
        <IntroGate />
        <AuthDialog />
        <Toaster position="top-center" theme="dark" richColors />
      </AppProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
