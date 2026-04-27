import axios from "axios";
import { getToken, removeToken } from "../utils/token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =========================
   RESPONSE INTERCEPTOR
   (FIXED - NO REDIRECTS)
========================= */
api.interceptors.response.use(
  (res) => res.data,

  (err) => {
    const data = err.response?.data || {};
    const statusCode = err.response?.status;

    // ✅ Handle unauthorized
    if (statusCode === 401) {
      removeToken();
      localStorage.removeItem("wb_user");

      // ❌ IMPORTANT: DO NOT redirect here
      // Let React AuthContext + Routes handle UI changes
    }

    const error = new Error(
      data.message || err.message || "Something went wrong"
    );

    error.statusCode = statusCode;
    error.data = data;

    return Promise.reject(error);
  }
);

export default api;