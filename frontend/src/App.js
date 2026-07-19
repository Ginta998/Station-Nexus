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

function IntroGate() {
  const [show, setShow] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem("sx_intro_shown") === "1") return;
    if (localStorage.getItem("sx_intro_off") === "1") return;
    getSettings()
      .then((s) => { setConfig({ type: s.intro_type || "tengoku", hasVideo: !!s.intro_has_video }); setShow(true); })
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
