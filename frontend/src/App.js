import "@/App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProvider } from "@/context/AppContext";
import Home from "@/pages/Home";
import Detail from "@/pages/Detail";
import Settings from "@/pages/Settings";
import Contact from "@/pages/Contact";
import BootIntro from "@/components/BootIntro";
import { getSettings } from "@/lib/api";
import { INTROS } from "@/lib/intro";

function IntroGate() {
  const [show, setShow] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem("sx_intro_shown") === "1") return;
    if (localStorage.getItem("sx_intro_off") === "1") return;
    getSettings()
      .then((s) => {
        let type = s.intro_type || "tengoku";
        const hasVideo = !!s.intro_has_video;
        if (type === "random") {
          const hidden = s.intro_hidden || [];
          const pool = INTROS.filter((i) => !hidden.includes(i.key)).map((i) => i.key);
          if (hasVideo) pool.push("video");
          type = pool.length ? pool[Math.floor(Math.random() * pool.length)] : "tengoku";
        }
        setConfig({ type, hasVideo });
        setShow(true);
      })
      .catch(() => {});
  }, []);

  if (!show || !config) return null;
  return (
    <BootIntro
      type={config.type}
      hasVideo={config.hasVideo}
      onDone={() => { sessionStorage.setItem("sx_intro_shown", "1"); setShow(false); }}
    />
  );
}

function App() {
  return (
    <div className="App">
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/oeuvre/:id" element={<Detail />} />
            <Route path="/parametres" element={<Settings />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </BrowserRouter>
        <IntroGate />
        <Toaster position="top-center" theme="dark" richColors />
      </AppProvider>
    </div>
  );
}

export default App;
