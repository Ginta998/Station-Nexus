const CACHE = "stationexus-v7";
const ASSETS = [];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never intercept API or media streams — always hit the network fresh.
  if (url.pathname.startsWith("/api")) return;

  const isDocument =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  // App shell (HTML): network-first so a new deploy is picked up immediately.
  if (isDocument) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200 && url.origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("/index.html")))
    );
    return;
  }

  // Static assets (JS/CSS/images): network-first so the latest code is always served;
  // fall back to cache only when offline.
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});

// ---------------- Web Push (Niveau 2) ----------------
// Compteur de pastille persistant (Badging API) via IndexedDB.
function idb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("sx-badge", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("kv");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbGet(key) {
  try {
    const db = await idb();
    return await new Promise((res) => {
      const tx = db.transaction("kv", "readonly").objectStore("kv").get(key);
      tx.onsuccess = () => res(tx.result || 0);
      tx.onerror = () => res(0);
    });
  } catch (_) { return 0; }
}
async function idbSet(key, val) {
  try {
    const db = await idb();
    await new Promise((res) => {
      const tx = db.transaction("kv", "readwrite").objectStore("kv").put(val, key);
      tx.onsuccess = () => res();
      tx.onerror = () => res();
    });
  } catch (_) { /* ignore */ }
}
async function applyBadge(count) {
  const n = Math.max(0, count || 0);
  await idbSet("badge", n);
  if (self.navigator && "setAppBadge" in self.navigator) {
    try {
      if (n > 0) await self.navigator.setAppBadge(n);
      else await self.navigator.clearAppBadge();
    } catch (_) { /* ignore */ }
  }
}

self.addEventListener("message", (event) => {
  const d = event.data || {};
  if (d.type === "set-badge") event.waitUntil(applyBadge(Number(d.value) || 0));
});

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data ? event.data.text() : "" }; }
  const title = data.title || "Station Nexus";
  const options = {
    body: data.body || "",
    tag: data.tag || "stationexus",
    renotify: true,
    icon: "/api/site/icon?size=192",
    badge: "/api/site/icon?size=96",
    data: { url: data.url || "/salon" },
  };
  event.waitUntil((async () => {
    await self.registration.showNotification(title, options);
    // Incrémente la pastille seulement si aucune fenêtre visible (app fermée / arrière-plan).
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const visible = wins.some((w) => w.visibilityState === "visible");
    if (!visible) {
      const cur = await idbGet("badge");
      await applyBadge((cur || 0) + 1);
    }
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/salon";
  event.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of list) {
      if ("focus" in client) {
        client.postMessage({ type: "navigate", url: target });
        return client.focus();
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(target);
  })());
});
