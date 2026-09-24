import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { audioUrl, ambienceUrl, readingAudioUrl, getSettings, upsertProfile } from "@/lib/api";
import { configureSound, playUiSound, primeAudioCtx } from "@/lib/sound";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const LS = {
  theme: "sx_theme", pin: "sx_pin", admin: "sx_admin", music: "sx_musicvolume", ui: "sx_uivolume",
  mute: "sx_mute", pack: "sx_soundpack", custom: "sx_customsounds", ambience: "sx_ambience",
  accent: "sx_accent", radius: "sx_radius", posterSize: "sx_postersize", motion: "sx_motion", cardTagline: "sx_cardtagline", textScale: "sx_textscale", layout: "sx_layout",
  rFont: "sx_reader_font", rSize: "sx_reader_size", rLine: "sx_reader_line", rWidth: "sx_reader_width", rDrop: "sx_reader_dropcap",
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
  const storedTheme = localStorage.getItem(LS.theme);
  const [theme, setThemeState] = useState(() => storedTheme || "tengoku");
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(LS.admin) === "1");
  const [musicVolume, setMusicVolumeState] = useState(() => {
    const v = parseFloat(localStorage.getItem(LS.music) ?? localStorage.getItem("sx_volume")); return Number.isFinite(v) ? v : 0.2;
  });
  const [uiVolume, setUiVolumeState] = useState(() => {
    const v = parseFloat(localStorage.getItem(LS.ui)); return Number.isFinite(v) ? v : 0.8;
  });
  const [muted, setMuted] = useState(() => localStorage.getItem(LS.mute) === "1");
  const [soundPack, setSoundPack] = useState(() => localStorage.getItem(LS.pack) || "zen");
  const [customSounds, setCustomSounds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS.custom) || "null"); } catch { return null; }
  });
  const storedAmbience = localStorage.getItem(LS.ambience);
  const [ambienceId, setAmbienceId] = useState(storedAmbience || "");

  // ---- visitor social profile ----
  const [profile, setProfileState] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sx_profile") || "null"); } catch { return null; }
  });
  const saveProfile = useCallback((data) => {
    let id = (profile && profile.id) || localStorage.getItem("sx_visitor_id");
    if (!id) {
      id = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
      localStorage.setItem("sx_visitor_id", id);
    }
    const next = { id, name: data.name ?? profile?.name ?? "", avatar: data.avatar ?? profile?.avatar ?? "", email: data.email ?? profile?.email ?? "", instagram: data.instagram ?? profile?.instagram ?? "", account_id: data.account_id ?? profile?.account_id ?? "", hide_tier: data.hide_tier ?? profile?.hide_tier ?? false };
    localStorage.setItem("sx_profile", JSON.stringify(next));
    setProfileState(next);
    upsertProfile(next).catch(() => {});
    return next;
  }, [profile]);
  const clearProfile = useCallback(() => { localStorage.removeItem("sx_profile"); setProfileState(null); }, []);

  // hydrate profile from localStorage when AuthContext links/fetches an account profile
  useEffect(() => {
    const hyd = () => { try { const p = JSON.parse(localStorage.getItem("sx_profile") || "null"); if (p) setProfileState(p); } catch {} };
    window.addEventListener("sx-hydrate-profile", hyd);
    const clr = () => { setProfileState(null); };
    window.addEventListener("sx-clear-profile", clr);
    return () => { window.removeEventListener("sx-hydrate-profile", hyd); window.removeEventListener("sx-clear-profile", clr); };
  }, []);

  // ---- favorites ----
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sx_favorites") || "[]"); } catch { return []; }
  });
  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("sx_favorites", JSON.stringify(next));
      return next;
    });
  }, []);
  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  // ---- announcements read-state (notification badge) ----
  const [seenAnnouncements, setSeenAnn] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sx_seen_ann") || "[]"); } catch { return []; }
  });
  const markAnnouncementsSeen = useCallback((ids) => {
    if (!ids || !ids.length) return;
    setSeenAnn((prev) => {
      const next = Array.from(new Set([...prev, ...ids]));
      localStorage.setItem("sx_seen_ann", JSON.stringify(next));
      return next;
    });
  }, []);

  // ---- interface customization ----
  const [accent, setAccentState] = useState(() => localStorage.getItem(LS.accent) || "");
  const [radius, setRadiusState] = useState(() => localStorage.getItem(LS.radius) || "");
  const phoneMQ = "(max-width: 767px)";
  const isPhoneNow = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia(phoneMQ).matches;
  const posterKey = (phone) => (phone ? "sx_postersize_mobile" : "sx_postersize_desktop");
  const resolvePoster = (phone) => localStorage.getItem(posterKey(phone)) || localStorage.getItem(LS.posterSize) || (phone ? "compact" : "compact");
  const [posterSize, setPosterSizeState] = useState(() => resolvePoster(isPhoneNow()));
  const [reduceMotion, setReduceMotionState] = useState(() => localStorage.getItem(LS.motion) === "1");
  const [cardTagline, setCardTaglineState] = useState(() => localStorage.getItem(LS.cardTagline) !== "0");
  const [layout, setLayoutState] = useState(() => localStorage.getItem(LS.layout) || "card");
  const scaleKey = (phone) => (phone ? "sx_textscale_mobile" : "sx_textscale_desktop");
  // resolve per-device text scale: device key -> legacy key -> default (petit on phone, grand on PC)
  const resolveScale = (phone) => localStorage.getItem(scaleKey(phone)) || localStorage.getItem(LS.textScale) || (phone ? "petit" : "grand");
  const [textScale, setTextScaleState] = useState(() => resolveScale(isPhoneNow()));

  // per-device values (for choosing PC & mobile independently from settings)
  const [posterDesktop, setPosterDesktopState] = useState(() => resolvePoster(false));
  const [posterMobile, setPosterMobileState] = useState(() => resolvePoster(true));
  const [textDesktop, setTextDesktopState] = useState(() => resolveScale(false));
  const [textMobile, setTextMobileState] = useState(() => resolveScale(true));
  const setPosterSizeFor = (phone, v) => {
    localStorage.setItem(posterKey(phone), v);
    if (phone) setPosterMobileState(v); else setPosterDesktopState(v);
    if (isPhoneNow() === phone) setPosterSizeState(v);
  };
  const setTextScaleFor = (phone, v) => {
    localStorage.setItem(scaleKey(phone), v);
    if (phone) setTextMobileState(v); else setTextDesktopState(v);
    if (isPhoneNow() === phone) setTextScaleState(v);
  };

  // ---- reader (chapter) preferences ----
  const [readerFont, setReaderFontState] = useState(() => localStorage.getItem(LS.rFont) || "serif");
  const [readerSize, setReaderSizeState] = useState(() => { const v = parseInt(localStorage.getItem(LS.rSize)); return Number.isFinite(v) ? v : 20; });
  const [readerLine, setReaderLineState] = useState(() => { const v = parseFloat(localStorage.getItem(LS.rLine)); return Number.isFinite(v) ? v : 1.9; });
  const [readerWidth, setReaderWidthState] = useState(() => localStorage.getItem(LS.rWidth) || "normal");
  const [readerDropcap, setReaderDropcapState] = useState(() => localStorage.getItem(LS.rDrop) !== "0");

  // creation ambient
  const [playingId, setPlayingId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [appPlaying, setAppPlaying] = useState(false);

  const cardAudio = useRef(null);
  const appAudio = useRef(null);
  const cardActiveRef = useRef(false); // synchronous guard: is a card ambient active?
  const mediaActiveRef = useRef(false); // synchronous guard: immersive media (cinema) owns the audio

  if (!cardAudio.current && typeof Audio !== "undefined") { cardAudio.current = new Audio(); cardAudio.current.loop = true; }
  if (!appAudio.current && typeof Audio !== "undefined") { appAudio.current = new Audio(); appAudio.current.loop = true; }

  useEffect(() => { if (!localStorage.getItem(LS.pin)) localStorage.setItem(LS.pin, DEFAULT_PIN); }, []);
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  // non-looping reading tracks (music cues) reset the UI when they finish
  useEffect(() => {
    const a = cardAudio.current; if (!a) return;
    const onEnded = () => { setIsPlaying(false); };
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, []);

  // apply interface customization to <html>
  useEffect(() => {
    const el = document.documentElement;
    if (accent) { el.style.setProperty("--brand", accent); el.style.setProperty("--brand-2", accent); }
    else { el.style.removeProperty("--brand"); el.style.removeProperty("--brand-2"); }
  }, [accent, theme]);
  useEffect(() => {
    const el = document.documentElement;
    if (radius) el.style.setProperty("--radius-base", radius);
    else el.style.removeProperty("--radius-base");
  }, [radius, theme]);
  useEffect(() => { document.documentElement.setAttribute("data-poster", posterSize); }, [posterSize]);
  useEffect(() => { document.documentElement.setAttribute("data-motion", reduceMotion ? "reduced" : "full"); }, [reduceMotion]);
  useEffect(() => { document.documentElement.setAttribute("data-card-tagline", cardTagline ? "on" : "off"); }, [cardTagline]);
  useEffect(() => { document.documentElement.setAttribute("data-textscale", textScale); }, [textScale]);
  // switch to the device's own remembered size when crossing the phone/desktop breakpoint
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(phoneMQ);
    const onChange = () => { setTextScaleState(resolveScale(mq.matches)); setPosterSizeState(resolvePoster(mq.matches)); };
    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
    return () => { mq.removeEventListener ? mq.removeEventListener("change", onChange) : mq.removeListener(onChange); };
    // eslint-disable-next-line
  }, []);

  useEffect(() => { configureSound({ pack: soundPack, muted, custom: customSounds, volume: uiVolume }); }, [soundPack, muted, customSounds, uiVolume]);
  useEffect(() => {
    const v = muted ? 0 : musicVolume;
    if (cardAudio.current) cardAudio.current.volume = v;
    if (appAudio.current) appAudio.current.volume = v * 0.85;
    localStorage.setItem(LS.music, String(musicVolume));
  }, [musicVolume, muted]);
  useEffect(() => { localStorage.setItem(LS.ui, String(uiVolume)); }, [uiVolume]);

  // default ambience, theme & poster size from server settings when the visitor has never chosen
  useEffect(() => {
    const legacyPoster = localStorage.getItem(LS.posterSize);
    const needPosterD = !(localStorage.getItem(posterKey(false)) || legacyPoster);
    const needPosterM = !(localStorage.getItem(posterKey(true)) || legacyPoster);
    const needAmb = storedAmbience === null;
    const needTheme = storedTheme === null;
    if (!needAmb && !needTheme && !needPosterD && !needPosterM) return;
    getSettings().then((s) => {
      if (needAmb && s?.default_ambience_id) setAmbienceId(s.default_ambience_id);
      if (needTheme && s?.default_theme) setThemeState(s.default_theme);
      if (needPosterD && s?.default_poster_desktop) { setPosterDesktopState(s.default_poster_desktop); if (!isPhoneNow()) setPosterSizeState(s.default_poster_desktop); }
      if (needPosterM && s?.default_poster_mobile) { setPosterMobileState(s.default_poster_mobile); if (isPhoneNow()) setPosterSizeState(s.default_poster_mobile); }
    }).catch(() => {});
  }, []); // eslint-disable-line

  // app ambience control (never overlaps with a card ambient)
  const startAppAmbience = useCallback(() => {
    const a = appAudio.current;
    if (!a || !ambienceId || muted) return;
    if (mediaActiveRef.current) return;           // cinema / immersive media owns the channel
    if (cardActiveRef.current) return;            // a card ambient owns the audio channel
    if (cardAudio.current && !cardAudio.current.paused) return; // card still audible (during fade)
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

  const setAccent = (v) => { setAccentState(v); v ? localStorage.setItem(LS.accent, v) : localStorage.removeItem(LS.accent); };
  const setRadius = (v) => { setRadiusState(v); v ? localStorage.setItem(LS.radius, v) : localStorage.removeItem(LS.radius); };
  const setPosterSize = (v) => { const ph = isPhoneNow(); setPosterSizeState(v); localStorage.setItem(posterKey(ph), v); if (ph) setPosterMobileState(v); else setPosterDesktopState(v); };
  const setReduceMotion = (v) => { setReduceMotionState(v); localStorage.setItem(LS.motion, v ? "1" : "0"); };
  const setCardTagline = (v) => { setCardTaglineState(v); localStorage.setItem(LS.cardTagline, v ? "1" : "0"); };
  const setLayout = (v) => { setLayoutState(v); localStorage.setItem(LS.layout, v); };
  const setTextScale = (v) => { const ph = isPhoneNow(); setTextScaleState(v); localStorage.setItem(scaleKey(ph), v); if (ph) setTextMobileState(v); else setTextDesktopState(v); };

  const setReaderFont = (v) => { setReaderFontState(v); localStorage.setItem(LS.rFont, v); };
  const setReaderSize = (v) => { setReaderSizeState(v); localStorage.setItem(LS.rSize, String(v)); };
  const setReaderLine = (v) => { setReaderLineState(v); localStorage.setItem(LS.rLine, String(v)); };
  const setReaderWidth = (v) => { setReaderWidthState(v); localStorage.setItem(LS.rWidth, v); };
  const setReaderDropcap = (v) => { setReaderDropcapState(v); localStorage.setItem(LS.rDrop, v ? "1" : "0"); };

  const unlock = (pin) => {
    if (pin === (localStorage.getItem(LS.pin) || DEFAULT_PIN)) {
      setIsAdmin(true); localStorage.setItem(LS.admin, "1"); return true;
    } return false;
  };
  const lock = () => { setIsAdmin(false); localStorage.removeItem(LS.admin); };
  const changePin = (p) => { localStorage.setItem(LS.pin, p); return true; };

  const sfx = useCallback((event) => { if (!muted) playUiSound(event); }, [muted]);

  // Called on the first explicit user gesture (entry screen) to unlock audio playback.
  const primeAudio = useCallback(() => {
    primeAudioCtx();
    if (!cardActiveRef.current) startAppAmbience();
  }, [startAppAmbience]);

  const playAmbient = useCallback((id) => {
    const a = cardAudio.current; if (!a) return;
    // toggle off if this card is already playing
    if (playingId === id && isPlaying) {
      fadeTo(a, 0, 250, () => { a.pause(); a.currentTime = 0; cardActiveRef.current = false; startAppAmbience(); });
      setIsPlaying(false);
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
    if (a && !a.paused) {
      fadeTo(a, 0, 200, () => { a.pause(); a.currentTime = 0; cardActiveRef.current = false; startAppAmbience(); });
    } else {
      cardActiveRef.current = false;
      if (a) { a.pause(); a.currentTime = 0; }
      startAppAmbience();
    }
    setIsPlaying(false); setPlayingId(null);
  }, [startAppAmbience]);

  // Immersive media mode (Cinema): only the film's sound plays. Silence app ambience + card ambient
  // and block the auto-restart, then restore everything on exit.
  const enterMediaMode = useCallback(() => {
    mediaActiveRef.current = true;
    stopAppAmbience(true);
    const a = cardAudio.current;
    if (a && !a.paused) { a.pause(); a.currentTime = 0; }
    cardActiveRef.current = false;
    setIsPlaying(false); setPlayingId(null);
  }, [stopAppAmbience]);

  const exitMediaMode = useCallback(() => {
    mediaActiveRef.current = false;
    if (!cardActiveRef.current) startAppAmbience();
  }, [startAppAmbience]);

  // Reading / immersion track (chapter reader) — distinct from the card ambient.
  const readingKey = (id) => "reading:" + id;
  const playReading = useCallback((id, hasReading) => {
    const a = cardAudio.current; if (!a) return;
    const key = readingKey(id);
    // toggle pause while staying in reading mode (no app ambience resume)
    if (playingId === key && isPlaying) {
      fadeTo(a, 0, 200, () => a.pause());
      setIsPlaying(false);
      return;
    }
    cardActiveRef.current = true;      // own the channel; blocks app ambience
    stopAppAmbience(true);
    if (!hasReading) {                 // no reading track -> immersive silence
      a.pause(); a.currentTime = 0; setIsPlaying(false); setPlayingId(key); return;
    }
    a.src = readingAudioUrl(id); a.volume = 0;
    a.play().then(() => { setPlayingId(key); setIsPlaying(true); if (!muted) fadeTo(a, musicVolume, 400); })
      .catch(() => { setPlayingId(key); setIsPlaying(false); });
  }, [playingId, isPlaying, muted, musicVolume, stopAppAmbience]);

  // Play a specific reading track (per-chapter music). Fades between sources and
  // dedupes so switching chapters that share the same fallback track won't restart it.
  const playReadingUrl = useCallback((url, key, opts = {}) => {
    const a = cardAudio.current; if (!a) return;
    const loop = opts.loop !== false;
    cardActiveRef.current = true;      // own the channel; blocks app ambience
    stopAppAmbience(true);
    if (!url) {                        // no track -> immersive silence
      if (!a.paused) fadeTo(a, 0, 200, () => a.pause());
      a.dataset.rsrc = ""; setIsPlaying(false); setPlayingId(key); return;
    }
    // already playing this exact source: just keep going
    if (!a.paused && a.dataset.rsrc === url) { setPlayingId(key); setIsPlaying(true); return; }
    const swap = () => {
      a.loop = loop;
      a.src = url; a.dataset.rsrc = url; a.volume = 0;
      a.play().then(() => { setPlayingId(key); setIsPlaying(true); if (!muted) fadeTo(a, musicVolume, 400); })
        .catch(() => { setPlayingId(key); setIsPlaying(false); });
    };
    if (!a.paused) fadeTo(a, 0, 200, swap); else swap();
  }, [muted, musicVolume, stopAppAmbience]);

  const toggleReadingUrl = useCallback((url, key, opts = {}) => {
    const a = cardAudio.current; if (!a) return;
    if (playingId === key && isPlaying) { fadeTo(a, 0, 200, () => a.pause()); setIsPlaying(false); return; }
    playReadingUrl(url, key, opts);
  }, [playingId, isPlaying, playReadingUrl]);

  // Stop whatever reading track is playing (immersive OR an inline music cue),
  // without leaving reading mode — used by the reader top-bar stop button.
  const pauseReading = useCallback(() => {
    const a = cardAudio.current; if (!a) return;
    if (!a.paused) fadeTo(a, 0, 200, () => a.pause());
    setIsPlaying(false);
  }, []);

  // Resume the currently loaded reading track (used by the mini player).
  const resumeReading = useCallback(() => {
    const a = cardAudio.current; if (!a || !a.src) return;
    cardActiveRef.current = true; stopAppAmbience(true);
    if (a.ended || (a.duration && a.currentTime >= a.duration - 0.05)) a.currentTime = 0;
    a.play().then(() => { setIsPlaying(true); if (!muted) fadeTo(a, musicVolume, 300); }).catch(() => {});
  }, [muted, musicVolume, stopAppAmbience]);

  const getReadingAudio = useCallback(() => cardAudio.current, []);

  // Called when leaving the chapter reader: restore the card ambient (or app ambience).
  const endReading = useCallback((creationId, hasCardAudio) => {
    const a = cardAudio.current;
    const resume = () => {
      cardActiveRef.current = false;
      if (hasCardAudio && creationId) playAmbient(creationId);
      else startAppAmbience();
    };
    if (a && !a.paused) fadeTo(a, 0, 200, () => { a.pause(); a.currentTime = 0; resume(); });
    else { if (a) { a.pause(); a.currentTime = 0; } resume(); }
    setIsPlaying(false); setPlayingId(null);
  }, [playAmbient, startAppAmbience]);

  const value = {
    theme, setTheme, isAdmin, unlock, lock, changePin,
    musicVolume, setMusicVolume, uiVolume, setUiVolume, muted, toggleMute,
    soundPack, setPack, customSounds, setCustom, sfx,
    ambienceId, selectAmbience, appPlaying,
    profile, saveProfile, clearProfile,
    favorites, toggleFavorite, isFavorite,
    seenAnnouncements, markAnnouncementsSeen,
    playingId, isPlaying, playAmbient, stopAmbient, playReading, endReading, primeAudio,
    playReadingUrl, toggleReadingUrl, pauseReading, resumeReading, getReadingAudio,
    enterMediaMode, exitMediaMode,
    accent, setAccent, radius, setRadius, posterSize, setPosterSize, reduceMotion, setReduceMotion, cardTagline, setCardTagline, textScale, setTextScale,
    layout, setLayout,
    posterDesktop, posterMobile, setPosterSizeFor, textDesktop, textMobile, setTextScaleFor,
    readerFont, setReaderFont, readerSize, setReaderSize, readerLine, setReaderLine, readerWidth, setReaderWidth, readerDropcap, setReaderDropcap,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
