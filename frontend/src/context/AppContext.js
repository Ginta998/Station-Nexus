import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { audioUrl } from "@/lib/api";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const LS_THEME = "sx_theme";
const LS_PIN = "sx_pin";
const LS_VOL = "sx_volume";
const DEFAULT_PIN = "1234";

export function AppProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem(LS_THEME) || "tengoku");
  const [isAdmin, setIsAdmin] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const v = parseFloat(localStorage.getItem(LS_VOL));
    return Number.isFinite(v) ? v : 0.6;
  });
  const audioRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem(LS_PIN)) localStorage.setItem(LS_PIN, DEFAULT_PIN);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    audioRef.current.volume = volume;
    localStorage.setItem(LS_VOL, String(volume));
  }, [volume]);

  const setTheme = (t) => {
    setThemeState(t);
    localStorage.setItem(LS_THEME, t);
  };

  const unlock = (pin) => {
    const stored = localStorage.getItem(LS_PIN) || DEFAULT_PIN;
    if (pin === stored) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };
  const lock = () => setIsAdmin(false);
  const changePin = (newPin) => {
    localStorage.setItem(LS_PIN, newPin);
    return true;
  };

  const playAmbient = useCallback((id) => {
    const a = audioRef.current;
    if (!a) return;
    if (playingId === id && isPlaying) {
      a.pause();
      setIsPlaying(false);
      return;
    }
    a.src = audioUrl(id);
    a.volume = volume;
    a.play()
      .then(() => {
        setPlayingId(id);
        setIsPlaying(true);
      })
      .catch(() => {
        setPlayingId(id);
        setIsPlaying(false);
      });
  }, [playingId, isPlaying, volume]);

  const stopAmbient = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    setIsPlaying(false);
    setPlayingId(null);
  }, []);

  const value = {
    theme, setTheme,
    isAdmin, unlock, lock, changePin,
    playingId, isPlaying, playAmbient, stopAmbient,
    volume, setVolume,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
