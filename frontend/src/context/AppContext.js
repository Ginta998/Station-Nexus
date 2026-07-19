import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { audioUrl, ambienceUrl } from "@/lib/api";
import { configureSound, playUiSound } from "@/lib/sound";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const LS = {
  theme: "sx_theme", pin: "sx_pin", admin: "sx_admin", vol: "sx_volume",
  mute: "sx_mute", pack: "sx_soundpack", custom: "sx_customsounds", ambience: "sx_ambience",
};
const DEFAULT_PIN = "1234";

export function AppProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem(LS.theme) || "tengoku");
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(LS.admin) === "1");
  const [volume, setVolume] = useState(() => {
    const v = parseFloat(localStorage.getItem(LS.vol)); return Number.isFinite(v) ? v : 0.6;
  });
  const [muted, setMuted] = useState(() => localStorage.getItem(LS.mute) === "1");
  const [soundPack, setSoundPack] = useState(() => localStorage.getItem(LS.pack) || "zen");
  const [customSounds, setCustomSounds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS.custom) || "null"); } catch { return null; }
  });
  const [ambienceId, setAmbienceId] = useState(() => localStorage.getItem(LS.ambience) || "");

  // creation ambient
  const [playingId, setPlayingId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [appPlaying, setAppPlaying] = useState(false);

  const cardAudio = useRef(null);
  const appAudio = useRef(null);

  if (!cardAudio.current && typeof Audio !== "undefined") { cardAudio.current = new Audio(); cardAudio.current.loop = true; }
  if (!appAudio.current && typeof Audio !== "undefined") { appAudio.current = new Audio(); appAudio.current.loop = true; }

  useEffect(() => { if (!localStorage.getItem(LS.pin)) localStorage.setItem(LS.pin, DEFAULT_PIN); }, []);
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  useEffect(() => { configureSound({ pack: soundPack, muted, custom: customSounds }); }, [soundPack, muted, customSounds]);
  useEffect(() => {
    const v = muted ? 0 : volume;
    if (cardAudio.current) cardAudio.current.volume = v;
    if (appAudio.current) appAudio.current.volume = v * 0.7;
    localStorage.setItem(LS.vol, String(volume));
  }, [volume, muted]);

  // app ambience control
  const startAppAmbience = useCallback(() => {
    const a = appAudio.current;
    if (!a || !ambienceId || muted) return;
    if (isPlaying) return; // a card ambient is active
    if (a.dataset.aid !== ambienceId) { a.src = ambienceUrl(ambienceId); a.dataset.aid = ambienceId; }
    a.volume = volume * 0.7;
    a.play().then(() => setAppPlaying(true)).catch(() => setAppPlaying(false));
  }, [ambienceId, muted, isPlaying, volume]);

  const stopAppAmbience = useCallback(() => {
    const a = appAudio.current; if (a) a.pause(); setAppPlaying(false);
  }, []);

  useEffect(() => {
    if (!ambienceId || muted) { stopAppAmbience(); return; }
    startAppAmbience();
  }, [ambienceId, muted, startAppAmbience, stopAppAmbience]);

  // try to resume audio on first user gesture (autoplay policies)
  useEffect(() => {
    const kick = () => { startAppAmbience(); window.removeEventListener("pointerdown", kick); };
    window.addEventListener("pointerdown", kick);
    return () => window.removeEventListener("pointerdown", kick);
  }, [startAppAmbience]);

  const setTheme = (t) => { setThemeState(t); localStorage.setItem(LS.theme, t); };
  const setPack = (p) => { setSoundPack(p); localStorage.setItem(LS.pack, p); };
  const setCustom = (obj) => { setCustomSounds(obj); localStorage.setItem(LS.custom, JSON.stringify(obj)); };
  const toggleMute = () => setMuted((m) => { const nv = !m; localStorage.setItem(LS.mute, nv ? "1" : "0"); return nv; });
  const selectAmbience = (id) => { setAmbienceId(id); localStorage.setItem(LS.ambience, id || ""); };

  const unlock = (pin) => {
    if (pin === (localStorage.getItem(LS.pin) || DEFAULT_PIN)) {
      setIsAdmin(true); localStorage.setItem(LS.admin, "1"); return true;
    } return false;
  };
  const lock = () => { setIsAdmin(false); localStorage.removeItem(LS.admin); };
  const changePin = (p) => { localStorage.setItem(LS.pin, p); return true; };

  const sfx = useCallback((event) => { if (!muted) playUiSound(event); }, [muted]);

  const playAmbient = useCallback((id) => {
    const a = cardAudio.current; if (!a) return;
    if (playingId === id && isPlaying) { a.pause(); setIsPlaying(false); startAppAmbience(); return; }
    stopAppAmbience();
    a.src = audioUrl(id); a.volume = muted ? 0 : volume;
    a.play().then(() => { setPlayingId(id); setIsPlaying(true); }).catch(() => { setPlayingId(id); setIsPlaying(false); });
  }, [playingId, isPlaying, volume, muted, startAppAmbience, stopAppAmbience]);

  const stopAmbient = useCallback(() => {
    const a = cardAudio.current; if (a) { a.pause(); a.currentTime = 0; }
    setIsPlaying(false); setPlayingId(null); startAppAmbience();
  }, [startAppAmbience]);

  const value = {
    theme, setTheme, isAdmin, unlock, lock, changePin,
    volume, setVolume, muted, toggleMute,
    soundPack, setPack, customSounds, setCustom, sfx,
    ambienceId, selectAmbience, appPlaying,
    playingId, isPlaying, playAmbient, stopAmbient,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
