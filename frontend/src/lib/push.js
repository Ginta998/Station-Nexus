import { pushPublicKey, pushSubscribe, pushUnsubscribe, pushPref } from "@/lib/api";

const NOTIF = "sx_chat_notif";            // "all" | "dm" | "off"
const NOTIF_SOUND = "sx_chat_notif_sound"; // "1" | "0"

export const pushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export const getNotifPref = () => localStorage.getItem(NOTIF) || "all";
export const getSoundPref = () => (localStorage.getItem(NOTIF_SOUND) || "1") === "1";
export const setSoundPref = (on) => localStorage.setItem(NOTIF_SOUND, on ? "1" : "0");

export async function getPermission() {
  if (!pushSupported()) return "unsupported";
  return Notification.permission;
}

// Ask permission (if needed), subscribe with the given pref, persist locally + server-side.
export async function enablePush(pref = "all") {
  if (!pushSupported()) throw new Error("unsupported");
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("denied");

  const { key, enabled } = await pushPublicKey();
  if (!enabled || !key) throw new Error("server-disabled");

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });
  }
  const json = sub.toJSON();
  await pushSubscribe(json, pref);
  localStorage.setItem(NOTIF, pref);
  return true;
}

// Update preference. "off" also unsubscribes the browser push subscription.
export async function updatePref(pref) {
  localStorage.setItem(NOTIF, pref);
  try {
    await pushPref(pref);
  } catch (_) { /* not logged / no sub yet */ }
}

export async function disablePush() {
  localStorage.setItem(NOTIF, "off");
  try {
    if (pushSupported()) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await pushUnsubscribe(sub.endpoint);
        await sub.unsubscribe();
      }
    }
  } catch (_) { /* ignore */ }
}

// Is this browser currently subscribed?
export async function isSubscribed() {
  if (!pushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch (_) {
    return false;
  }
}
