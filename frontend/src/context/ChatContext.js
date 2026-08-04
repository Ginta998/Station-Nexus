import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { chatUnread } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const ChatCtx = createContext(null);
export const useChat = () => useContext(ChatCtx);

const LS = "sx_chat_lastseen";
const NOTIF = "sx_chat_notif";        // "all" | "dm" | "off"
const NOTIF_SOUND = "sx_chat_notif_sound"; // "1" | "0"

let audioEl = null;
function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioEl = audioEl || new Ctx();
    const o = audioEl.createOscillator(); const g = audioEl.createGain();
    o.connect(g); g.connect(audioEl.destination);
    o.type = "sine"; o.frequency.value = 660;
    g.gain.setValueAtTime(0.0001, audioEl.currentTime);
    g.gain.exponentialRampToValueAtTime(0.12, audioEl.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, audioEl.currentTime + 0.25);
    o.start(); o.stop(audioEl.currentTime + 0.26);
  } catch { /* ignore */ }
}

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [unread, setUnread] = useState({ public: 0, dm: 0, total: 0 });
  const timer = useRef(null);
  const prev = useRef({ public: 0, dm: 0 });

  const refresh = useCallback(async () => {
    if (!user) { setUnread({ public: 0, dm: 0, total: 0 }); prev.current = { public: 0, dm: 0 }; return; }
    try {
      const since = localStorage.getItem(LS) || undefined;
      const u = await chatUnread(since);
      setUnread(u);
      // ---- Niveau 1: in-app notification on increase ----
      const pref = localStorage.getItem(NOTIF) || "all";
      const soundOn = (localStorage.getItem(NOTIF_SOUND) || "1") === "1";
      const onSalon = window.location.pathname.startsWith("/salon");
      const dPub = u.public - prev.current.public;
      const dDm = u.dm - prev.current.dm;
      if (!onSalon && pref !== "off") {
        if (dDm > 0) {
          toast.message("Nouveau message privé 💌", { description: "Tu as reçu un message privé dans le salon.", action: { label: "Ouvrir", onClick: () => (window.location.href = "/salon?tab=dm") } });
          if (soundOn) beep();
        } else if (dPub > 0 && pref === "all") {
          toast.message("Nouveau message dans le salon 💬", { description: `${dPub} nouveau${dPub > 1 ? "x" : ""} message${dPub > 1 ? "s" : ""}.`, action: { label: "Voir", onClick: () => (window.location.href = "/salon") } });
          if (soundOn) beep();
        }
      }
      prev.current = { public: u.public, dm: u.dm };
    } catch { /* not logged / ignore */ }
  }, [user]);

  const markPublicSeen = useCallback(() => {
    localStorage.setItem(LS, new Date().toISOString());
    setUnread((u) => ({ ...u, public: 0, total: u.dm }));
    prev.current = { ...prev.current, public: 0 };
  }, []);

  useEffect(() => {
    refresh();
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => { if (!document.hidden) refresh(); }, 12000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(timer.current); window.removeEventListener("focus", onFocus); };
  }, [refresh]);

  return <ChatCtx.Provider value={{ unread, refresh, markPublicSeen }}>{children}</ChatCtx.Provider>;
}
