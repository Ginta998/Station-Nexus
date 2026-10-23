import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
export const api = axios.create({ baseURL: API, timeout: 20000 });

// attach auth token if present
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("sx_token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// auth
export const authRegister = (p) => api.post("/auth/register", p).then((r) => r.data);
export const authLogin = (p) => api.post("/auth/login", p).then((r) => r.data);
export const authGoogleSession = (session_id) => api.post("/auth/google/session", { session_id }).then((r) => r.data);
export const authMe = () => api.get("/auth/me").then((r) => r.data);
export const authSync = (p) => api.put("/auth/sync", p).then((r) => r.data);
export const authClaimAdmin = (pin) => api.post("/auth/claim-admin", { pin }).then((r) => r.data);

// creations
export const listCreations = (category) =>
  api.get("/creations", { params: category ? { category } : {} }).then((r) => r.data);
export const getCreation = (id) => api.get(`/creations/${id}`).then((r) => r.data);
export const getCreationFull = (id) => api.get(`/creations/${id}`, { params: { media: 1 } }).then((r) => r.data);
export const posterUrl = (id, v, w) => `${API}/creations/${id}/poster?${v ? `v=${encodeURIComponent(v)}` : ""}${w ? `&w=${w}` : ""}`;
export const bgUrl = (id, v) => `${API}/creations/${id}/bg${v ? `?v=${encodeURIComponent(v)}` : ""}`;
export const createCreation = (p) => api.post("/creations", p).then((r) => r.data);
export const updateCreation = (id, p) => api.put(`/creations/${id}`, p).then((r) => r.data);
export const deleteCreation = (id) => api.delete(`/creations/${id}`).then((r) => r.data);
export const uploadAudio = (id, file) => {
  const fd = new FormData(); fd.append("file", file);
  return api.post(`/creations/${id}/audio`, fd).then((r) => r.data);
};
export const deleteAudio = (id) => api.delete(`/creations/${id}/audio`).then((r) => r.data);
export const audioUrl = (id) => `${API}/creations/${id}/audio`;

export const uploadReadingAudio = (id, file) => {
  const fd = new FormData(); fd.append("file", file);
  return api.post(`/creations/${id}/reading-audio`, fd).then((r) => r.data);
};
export const deleteReadingAudio = (id) => api.delete(`/creations/${id}/reading-audio`).then((r) => r.data);
export const readingAudioUrl = (id) => `${API}/creations/${id}/reading-audio`;

// film / trailer video uploads (object storage). kind = "film" | "trailer"
export const uploadVideo = (id, kind, file, onProgress) => {
  const fd = new FormData(); fd.append("kind", kind); fd.append("file", file);
  return api.post(`/creations/${id}/video`, fd, {
    onUploadProgress: (e) => { if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100)); },
  }).then((r) => r.data);
};
export const deleteVideo = (id, kind) => api.delete(`/creations/${id}/video`, { params: { kind } }).then((r) => r.data);
export const videoUrl = (id, kind, v) => `${API}/creations/${id}/video?kind=${kind}${v ? `&v=${encodeURIComponent(v)}` : ""}`;

export const uploadChapterAudio = (cid, chid, file) => {
  const fd = new FormData(); fd.append("file", file);
  return api.post(`/creations/${cid}/chapters/${chid}/audio`, fd).then((r) => r.data);
};
export const deleteChapterAudio = (cid, chid) => api.delete(`/creations/${cid}/chapters/${chid}/audio`).then((r) => r.data);
export const chapterAudioUrl = (cid, chid) => `${API}/creations/${cid}/chapters/${chid}/audio`;

// inline media assets (images + music cues placed inside chapters)
export const uploadAsset = (cid, file, kind = "image", name = "") => {
  const fd = new FormData(); fd.append("file", file); fd.append("kind", kind); fd.append("name", name || file.name || "media");
  return api.post(`/creations/${cid}/assets`, fd).then((r) => r.data);
};
export const listAssets = (cid) => api.get(`/creations/${cid}/assets`).then((r) => r.data);
export const deleteAsset = (aid) => api.delete(`/assets/${aid}`).then((r) => r.data);
export const assetUrl = (aid) => `${API}/assets/${aid}`;
export const assetDownloadUrl = (aid) => `${API}/assets/${aid}?dl=1`;

// categories
export const listCategories = () => api.get("/categories").then((r) => r.data);
export const createCategory = (p) => api.post("/categories", p).then((r) => r.data);
export const updateCategory = (id, p) => api.put(`/categories/${id}`, p).then((r) => r.data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`).then((r) => r.data);

// comments
export const listComments = (cid) => api.get(`/creations/${cid}/comments`).then((r) => r.data);
export const addComment = (p) => api.post("/comments", p).then((r) => r.data);
export const deleteComment = (id) => api.delete(`/comments/${id}`).then((r) => r.data);

// ambiences
export const listAmbiences = () => api.get("/ambiences").then((r) => r.data);
export const createAmbience = (p) => api.post("/ambiences", p).then((r) => r.data);
export const updateAmbience = (id, p) => api.put(`/ambiences/${id}`, p).then((r) => r.data);
export const uploadAmbienceAudio = (id, file) => {
  const fd = new FormData(); fd.append("file", file);
  return api.post(`/ambiences/${id}/audio`, fd).then((r) => r.data);
};
export const deleteAmbience = (id) => api.delete(`/ambiences/${id}`).then((r) => r.data);
export const ambienceUrl = (id) => `${API}/ambiences/${id}/audio`;

// subscribers
export const listSubscribers = () => api.get("/subscribers").then((r) => r.data);
export const addSubscriber = (email) => api.post("/subscribers", { email }).then((r) => r.data);
export const deleteSubscriber = (id) => api.delete(`/subscribers/${id}`).then((r) => r.data);

// site settings
export const getSettings = () => api.get("/settings").then((r) => r.data);
export const updateSettings = (p) => api.put("/settings", p).then((r) => r.data);

// Planning / Roadmap des sorties
export const listRoadmap = () => api.get("/roadmap").then((r) => r.data);
export const createRoadmap = (p) => api.post("/roadmap", p).then((r) => r.data);
export const updateRoadmap = (id, p) => api.put(`/roadmap/${id}`, p).then((r) => r.data);
export const deleteRoadmap = (id) => api.delete(`/roadmap/${id}`).then((r) => r.data);

// intro / boot screen
export const uploadIntroVideo = (file) => {
  const fd = new FormData(); fd.append("file", file);
  return api.post("/intro/video", fd).then((r) => r.data);
};
export const deleteIntroVideo = () => api.delete("/intro/video").then((r) => r.data);
export const introVideoUrl = () => `${API}/intro/video`;

// profiles (visitor social profiles)
export const upsertProfile = (p) => api.post("/profiles", p).then((r) => r.data);
export const getProfile = (id) => api.get(`/profiles/${id}`).then((r) => r.data);
export const listProfiles = () => api.get("/profiles").then((r) => r.data);
export const deleteProfile = (id) => api.delete(`/profiles/${id}`).then((r) => r.data);
export const emailStatus = () => api.get("/email/status").then((r) => r.data);

// announcements (creator → visitors)
export const listAnnouncements = () => api.get("/announcements").then((r) => r.data);
export const createAnnouncement = (p) => api.post("/announcements", p).then((r) => r.data);
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}`).then((r) => r.data);

// monetization (Stripe)
export const startCheckout = (payload) => api.post("/payments/checkout", { ...payload, origin_url: window.location.origin }).then((r) => r.data);
export const paymentStatus = (sessionId) => api.get(`/payments/status/${sessionId}`).then((r) => r.data);
export const getEntitlements = () => api.get("/me/entitlements").then((r) => r.data);
export const getLibrary = () => api.get("/me/library").then((r) => r.data);
export const getMembershipPlan = () => api.get("/membership/plan").then((r) => r.data);
export const getAboutPage = () => api.get("/about").then((r) => r.data);
export const getAdminRevenue = () => api.get("/admin/revenue").then((r) => r.data);
export const cancelMembership = () => api.post("/membership/cancel").then((r) => r.data);

// community chat (salon)
export const chatStatus = () => api.get("/chat/status").then((r) => r.data);
export const chatMessages = (since, channel = "general") => api.get("/chat/messages", { params: { channel, ...(since ? { since } : {}) } }).then((r) => r.data);
export const chatPost = (payload) => api.post("/chat/messages", payload).then((r) => r.data);
export const chatDelete = (id) => api.delete(`/chat/messages/${id}`).then((r) => r.data);
export const chatReact = (id, emoji) => api.post(`/chat/messages/${id}/react`, { emoji }).then((r) => r.data);
export const chatVote = (id, option) => api.post(`/chat/messages/${id}/vote`, { option }).then((r) => r.data);
export const chatPing = () => api.post("/chat/ping").then((r) => r.data);
export const chatModerate = (user_id, action) => api.post("/chat/moderate", { user_id, action }).then((r) => r.data);
export const chatUpload = (file) => { const fd = new FormData(); fd.append("file", file); return api.post("/chat/upload", fd).then((r) => r.data); };
export const chatPin = (id) => api.post(`/chat/messages/${id}/pin`).then((r) => r.data);
export const chatPinned = (channel = "general") => api.get("/chat/pinned", { params: { channel } }).then((r) => r.data);
export const chatChannels = () => api.get("/chat/channels").then((r) => r.data);
export const chatChannelCreate = (name) => api.post("/chat/channels", { name }).then((r) => r.data);
export const chatChannelDelete = (id) => api.delete(`/chat/channels/${id}`).then((r) => r.data);
export const chatUnread = (since) => api.get("/chat/unread", { params: since ? { since } : {} }).then((r) => r.data);
export const dmConversations = () => api.get("/chat/dm").then((r) => r.data);
export const dmThread = (partnerId, since) => api.get(`/chat/dm/${partnerId}`, { params: since ? { since } : {} }).then((r) => r.data);
export const dmSend = (partnerId, payload) => api.post(`/chat/dm/${partnerId}`, payload).then((r) => r.data);

// web push (notifications OS/système)
export const pushPublicKey = () => api.get("/push/public-key").then((r) => r.data);
export const pushSubscribe = (subscription, pref) => api.post("/push/subscribe", { subscription, pref }).then((r) => r.data);
export const pushPref = (pref) => api.post("/push/pref", { pref }).then((r) => r.data);
export const pushUnsubscribe = (endpoint) => api.post("/push/unsubscribe", endpoint ? { endpoint } : {}).then((r) => r.data);
export const pushTest = () => api.post("/push/test").then((r) => r.data);
