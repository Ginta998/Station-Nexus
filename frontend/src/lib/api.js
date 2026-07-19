import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const listCreations = (category) =>
  api.get("/creations", { params: category ? { category } : {} }).then((r) => r.data);

export const getCreation = (id) => api.get(`/creations/${id}`).then((r) => r.data);

export const createCreation = (payload) => api.post("/creations", payload).then((r) => r.data);

export const updateCreation = (id, payload) => api.put(`/creations/${id}`, payload).then((r) => r.data);

export const deleteCreation = (id) => api.delete(`/creations/${id}`).then((r) => r.data);

export const uploadAudio = (id, file) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post(`/creations/${id}/audio`, fd, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
};

export const deleteAudio = (id) => api.delete(`/creations/${id}/audio`).then((r) => r.data);

export const audioUrl = (id) => `${API}/creations/${id}/audio`;
