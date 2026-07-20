import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
export const api = axios.create({ baseURL: API });

// creations
export const listCreations = (category) =>
  api.get("/creations", { params: category ? { category } : {} }).then((r) => r.data);
export const getCreation = (id) => api.get(`/creations/${id}`).then((r) => r.data);
export const getCreationFull = (id) => api.get(`/creations/${id}`, { params: { media: 1 } }).then((r) => r.data);
export const posterUrl = (id, v) => `${API}/creations/${id}/poster${v ? `?v=${encodeURIComponent(v)}` : ""}`;
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

export const uploadChapterAudio = (cid, chid, file) => {
  const fd = new FormData(); fd.append("file", file);
  return api.post(`/creations/${cid}/chapters/${chid}/audio`, fd).then((r) => r.data);
};
export const deleteChapterAudio = (cid, chid) => api.delete(`/creations/${cid}/chapters/${chid}/audio`).then((r) => r.data);
export const chapterAudioUrl = (cid, chid) => `${API}/creations/${cid}/chapters/${chid}/audio`;

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

// intro / boot screen
export const uploadIntroVideo = (file) => {
  const fd = new FormData(); fd.append("file", file);
  return api.post("/intro/video", fd).then((r) => r.data);
};
export const deleteIntroVideo = () => api.delete("/intro/video").then((r) => r.data);
export const introVideoUrl = () => `${API}/intro/video`;
