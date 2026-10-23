import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { authRegister, authLogin, authGoogleSession, authMe, authSync, authClaimAdmin, upsertProfile, listProfiles } from "@/lib/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// localStorage keys that follow the account across devices (NOT admin/pin/session)
const PREF_KEYS = [
  "sx_theme", "sx_radius", "sx_motion", "sx_cardtagline",
  "sx_musicvolume", "sx_uivolume", "sx_mute", "sx_soundpack", "sx_customsounds", "sx_ambience",
  "sx_postersize", "sx_postersize_desktop", "sx_postersize_mobile", "sx_layout",
  "sx_textscale", "sx_textscale_desktop", "sx_textscale_mobile",
  "sx_reader_font", "sx_reader_size", "sx_reader_line", "sx_reader_width", "sx_reader_dropcap",
  "sx_profile", "sx_visitor_id",
];

const buildPrefs = () => {
  const o = {};
  PREF_KEYS.forEach((k) => { const v = localStorage.getItem(k); if (v !== null) o[k] = v; });
  return o;
};
const applyPrefs = (prefs) => {
  if (!prefs) return;
  Object.entries(prefs).forEach(([k, v]) => { if (PREF_KEYS.includes(k) && typeof v === "string") localStorage.setItem(k, v); });
};
const readFavorites = () => { try { return JSON.parse(localStorage.getItem("sx_favorites") || "[]"); } catch { return []; } };
const snapshot = () => JSON.stringify({ p: buildPrefs(), f: readFavorites() });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const lastSync = useRef("");

  const setToken = (t) => { if (t) localStorage.setItem("sx_token", t); else localStorage.removeItem("sx_token"); };

  // Apply server data to this device (returning user on a new device) then reload once
  const applyAccountAndReload = (u) => {
    const hasData = (u.preferences && Object.keys(u.preferences).length) || (u.favorites && u.favorites.length);
    if (hasData) {
      applyPrefs(u.preferences);
      if (Array.isArray(u.favorites)) localStorage.setItem("sx_favorites", JSON.stringify(u.favorites));
      sessionStorage.setItem("sx_auth_applied", "1");
      window.location.reload();
    }
  };

  const finishAuth = useCallback(async (res, greet) => {
    setToken(res.token);
    const u = res.user;
    const empty = !(u.preferences && Object.keys(u.preferences).length) && !(u.favorites && u.favorites.length);
    if (empty) {
      // first time on account -> push this device's data up
      try {
        const up = await authSync({ favorites: readFavorites(), preferences: buildPrefs(), name: u.name, avatar: u.avatar });
        setUser(up.user);
      } catch { setUser(u); }
      lastSync.current = snapshot();
      if (u.is_admin) { localStorage.setItem("sx_admin", "1"); window.dispatchEvent(new Event("sx-admin-on")); }
      setAuthOpen(false);
      if (greet) toast.success(greet);
      // parcours compte -> profil : si aucun profil local, on invite à en créer un dans la foulée
      let hasProfile = false;
      try { hasProfile = !!JSON.parse(localStorage.getItem("sx_profile") || "null"); } catch { hasProfile = false; }
      if (!hasProfile) {
        // le compte a peut-être déjà un profil lié côté serveur (autre appareil) -> on l'hydrate
        try {
          const all = await listProfiles();
          const mine = all.find((p) => p.account_id === u.id);
          if (mine) { localStorage.setItem("sx_profile", JSON.stringify(mine)); window.dispatchEvent(new CustomEvent("sx-hydrate-profile")); hasProfile = true; }
        } catch { /* ignore */ }
      }
      if (!hasProfile) setTimeout(() => window.dispatchEvent(new CustomEvent("sx-open-profile")), 350);
    } else {
      if (u.is_admin) { localStorage.setItem("sx_admin", "1"); window.dispatchEvent(new Event("sx-admin-on")); }
      setUser(u);
      setAuthOpen(false);
      if (greet) toast.success(greet);
      applyAccountAndReload(u); // reloads if server has data
    }
  }, []);

  const register = useCallback(async (email, password, name) => {
    const res = await authRegister({ email, password, name });
    await finishAuth(res, "Compte créé — tes favoris te suivront partout ! 🐰");
  }, [finishAuth]);

  const login = useCallback(async (email, password) => {
    const res = await authLogin({ email, password });
    await finishAuth(res, "Content de te revoir !");
  }, [finishAuth]);

  const startGoogle = useCallback(() => {
    const redirect = window.location.origin + window.location.pathname;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`;
  }, []);

  const logout = useCallback(() => {
    setToken(null); setUser(null); lastSync.current = "";
    // compte = profil : se déconnecter déconnecte aussi le profil
    localStorage.removeItem("sx_profile"); localStorage.removeItem("sx_visitor_id");
    window.dispatchEvent(new CustomEvent("sx-clear-profile"));
    toast.success("Déconnecté·e");
  }, []);

  const claimAdmin = useCallback(async (pin) => {
    const res = await authClaimAdmin(pin);
    setUser(res.user);
    localStorage.setItem("sx_admin", "1");
    return res.user;
  }, []);

  // Initial load: handle Google redirect (#session_id=) then restore session via token
  useEffect(() => {
    (async () => {
      const hash = window.location.hash || "";
      const m = hash.match(/session_id=([^&]+)/);
      if (m) {
        try {
          const res = await authGoogleSession(decodeURIComponent(m[1]));
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
          await finishAuth(res, "Connecté·e avec Google !");
          setReady(true);
          return;
        } catch {
          toast.error("Connexion Google échouée");
        }
      }
      if (sessionStorage.getItem("sx_auth_applied")) sessionStorage.removeItem("sx_auth_applied");
      if (localStorage.getItem("sx_token")) {
        try { const d = await authMe(); setUser(d.user); lastSync.current = snapshot(); if (d.user.is_admin) { localStorage.setItem("sx_admin", "1"); window.dispatchEvent(new Event("sx-admin-on")); } }
        catch { setToken(null); }
      }
      setReady(true);
    })();
    // eslint-disable-next-line
  }, []);

  // Autosave favorites/preferences to the account while logged in
  useEffect(() => {
    if (!user) return;
    const id = setInterval(async () => {
      const snap = snapshot();
      if (snap === lastSync.current) return;
      lastSync.current = snap;
      try { await authSync({ favorites: readFavorites(), preferences: buildPrefs() }); } catch { /* silent */ }
    }, 6000);
    return () => clearInterval(id);
  }, [user]);

  // Link the local profile to this account (for public subscription-tier display) or hydrate it from the server
  useEffect(() => {
    if (!user) return;
    (async () => {
      let p = null;
      try { p = JSON.parse(localStorage.getItem("sx_profile") || "null"); } catch { p = null; }
      if (p && p.id && p.account_id !== user.id) {
        const linked = { ...p, account_id: user.id };
        localStorage.setItem("sx_profile", JSON.stringify(linked));
        upsertProfile(linked).catch(() => {});
        window.dispatchEvent(new CustomEvent("sx-hydrate-profile"));
      } else if (!p) {
        try {
          const all = await listProfiles();
          const mine = all.find((x) => x.account_id === user.id);
          if (mine) { localStorage.setItem("sx_profile", JSON.stringify(mine)); window.dispatchEvent(new CustomEvent("sx-hydrate-profile")); }
        } catch { /* ignore */ }
      }
    })();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, ready, authOpen, openAuth: () => setAuthOpen(true), closeAuth: () => setAuthOpen(false), register, login, startGoogle, logout, claimAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
