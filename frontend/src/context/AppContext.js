import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { audioUrl, ambienceUrl, getSettings } from "@/lib/api";
import { configureSound, playUiSound } from "@/lib/sound";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const LS = {
  theme: "sx_theme", pin: "sx_pin", admin: "sx_admin", music: "sx_musicvolume", ui: "sx_uivolume",
  mute: "sx_mute", pack: "sx_soundpack", custom: "sx_customsounds", ambience: "sx_ambience",
};
const DEFAULT_PIN = "1234";

function fadeTo(audio, target, ms, onDone) {
  if (!audio) return;
  if (audio._fade) clearInterval(audio._fade);
  const start = audio.volume;
  const steps = 14;
  let i = 0;
  audio._fade = setInterval(() => {
    i++;
    audio.volume = Math.max(0, Math.min(1, start + (target - start) * (i / steps)));
    if (i >= steps) { clearInterval(audio._fade); audio._fade = null; if (onDone) onDone(); }
  }, Math.max(16, ms / steps));
}

export function AppProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem(LS.theme) || "tengoku");
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(LS.admin) === "1");
  const [musicVolume, setMusicVolumeState] = useState(() => {
    const v = parseFloat(localStorage.getItem(LS.music) ?? localStorage.getItem("sx_volume")); return Number.isFinite(v) ? v : 0.6;
  });
  const [uiVolume, setUiVolumeState] = useState(() => {
    const v = parseFloat(localStorage.getItem(LS.ui)); return Number.isFinite(v) ? v : 0.7;
  });
  const [muted, setMuted] = useState(() => localStorage.getItem(LS.mute) === "1");
  const [soundPack, setSoundPack] = useState(() => localStorage.getItem(LS.pack) || "zen");
  const [customSounds, setCustomSounds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS.custom) || "null"); } catch { return null; }
  });
  const storedAmbience = localStorage.getItem(LS.ambience);
  const [ambienceId, setAmbienceId] = useState(storedAmbience || "");

  // creation ambient
  const [playingId, setPlayingId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [appPlaying, setAppPlaying] = useState(false);

  const cardAudio = useRef(null);
  const appAudio = useRef(null);
  const cardActiveRef = useRef(false); // synchronous guard: is a card ambient active?

  if (!cardAudio.current && typeof Audio !== "undefined") { cardAudio.current = new Audio(); cardAudio.current.loop = true; }
  if (!appAudio.current && typeof Audio !== "undefined") { appAudio.current = new Audio(); appAudio.current.loop = true; }

  useEffect(() => { if (!localStorage.getItem(LS.pin)) localStorage.setItem(LS.pin, DEFAULT_PIN); }, []);
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  useEffect(() => { configureSound({ pack: soundPack, muted, custom: customSounds, volume: uiVolume }); }, [soundPack, muted, customSounds, uiVolume]);
  useEffect(() => {
    const v = muted ? 0 : musicVolume;
    if (cardAudio.current) cardAudio.current.volume = v;
    if (appAudio.current) appAudio.current.volume = v * 0.85;
    localStorage.setItem(LS.music, String(musicVolume));
  }, [musicVolume, muted]);
  useEffect(() => { localStorage.setItem(LS.ui, String(uiVolume)); }, [uiVolume]);

  // default ambience from server settings when the visitor has never chosen
  useEffect(() => {
    if (storedAmbience === null) {
      getSettings().then((s) => { if (s?.default_ambience_id) setAmbienceId(s.default_ambience_id); }).catch(() => {});
    }
  }, []); // eslint-disable-line

  // app ambience control (never overlaps with a card ambient)
  const startAppAmbience = useCallback(() => {
    const a = appAudio.current;
    if (!a || !ambienceId || muted) return;
    if (cardActiveRef.current) return;            // a card ambient owns the audio channel
    if (!a.paused && a.dataset.aid === ambienceId) return; // already playing this track
    if (a.dataset.aid !== ambienceId) { a.src = ambienceUrl(ambienceId); a.dataset.aid = ambienceId; }
    a.volume = 0;
    a.play().then(() => { setAppPlaying(true); fadeTo(a, musicVolume * 0.85, 500); }).catch(() => setAppPlaying(false));
  }, [ambienceId, muted, musicVolume]);

  const stopAppAmbience = useCallback((immediate) => {
    const a = appAudio.current; if (!a) return;
    setAppPlaying(false);
    if (immediate || a.paused) { a.pause(); }
    else { fadeTo(a, 0, 250, () => a.pause()); }
  }, []);

  useEffect(() => {
    if (!ambienceId || muted) { stopAppAmbience(true); return; }
    if (!cardActiveRef.current) startAppAmbience();
  }, [ambienceId, muted, startAppAmbience, stopAppAmbience]);

  const startRef = useRef(startAppAmbience);
  startRef.current = startAppAmbience;
  useEffect(() => {
    const kick = () => { if (!cardActiveRef.current) startRef.current(); };
    const events = ["pointerdown", "click", "keydown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, kick, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, kick));
  }, []);

  const setTheme = (t) => { setThemeState(t); localStorage.setItem(LS.theme, t); };
  const setMusicVolume = (v) => setMusicVolumeState(v);
  const setUiVolume = (v) => setUiVolumeState(v);
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
    // toggle off if this card is already playing
    if (playingId === id && isPlaying) {
      cardActiveRef.current = false;
      fadeTo(a, 0, 250, () => a.pause());
      setIsPlaying(false);
      startAppAmbience();
      return;
    }
    // starting (or switching) a card ambient — take exclusive ownership
    cardActiveRef.current = true;
    stopAppAmbience(true); // cut app ambience immediately, no overlap
    a.src = audioUrl(id);
    a.volume = 0;
    a.play().then(() => {
      setPlayingId(id); setIsPlaying(true);
      if (!muted) fadeTo(a, musicVolume, 400);
    }).catch(() => { setPlayingId(id); setIsPlaying(false); });
  }, [playingId, isPlaying, musicVolume, muted, startAppAmbience, stopAppAmbience]);

  const stopAmbient = useCallback(() => {
    const a = cardAudio.current;
    cardActiveRef.current = false;
    if (a) {
      fadeTo(a, 0, 200, () => { a.pause(); a.currentTime = 0; });
    }
    setIsPlaying(false); setPlayingId(null);
    startAppAmbience();
  }, [startAppAmbience]);

  const value = {
    theme, setTheme, isAdmin, unlock, lock, changePin,
    musicVolume, setMusicVolume, uiVolume, setUiVolume, muted, toggleMute,
    soundPack, setPack, customSounds, setCustom, sfx,
    ambienceId, selectAmbience, appPlaying,
    playingId, isPlaying, playAmbient, stopAmbient,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
