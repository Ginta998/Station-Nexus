import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { chatUnread } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const ChatCtx = createContext(null);
export const useChat = () => useContext(ChatCtx);

const LS = "sx_chat_lastseen";

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [unread, setUnread] = useState({ public: 0, dm: 0, total: 0 });
  const timer = useRef(null);

  const refresh = useCallback(async () => {
    if (!user) { setUnread({ public: 0, dm: 0, total: 0 }); return; }
    try {
      const since = localStorage.getItem(LS) || undefined;
      const u = await chatUnread(since);
      setUnread(u);
    } catch { /* not a subscriber / not logged: ignore */ }
  }, [user]);

  const markPublicSeen = useCallback(() => {
    localStorage.setItem(LS, new Date().toISOString());
    setUnread((u) => ({ ...u, public: 0, total: u.dm }));
  }, []);

  useEffect(() => {
    refresh();
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => { if (!document.hidden) refresh(); }, 30000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(timer.current); window.removeEventListener("focus", onFocus); };
  }, [refresh]);

  return <ChatCtx.Provider value={{ unread, refresh, markPublicSeen }}>{children}</ChatCtx.Provider>;
}
