import axios from "axios";
import { getToken, removeToken } from "../utils/token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const data       = err.response?.data || {};
    const statusCode = err.response?.status;
    if (statusCode === 401) {
      removeToken();
      localStorage.removeItem("wb_user");
    }
    const error       = new Error(data.message || err.message || "Something went wrong");
    error.statusCode  = statusCode;
    error.data        = data;
    return Promise.reject(error);
  }
);

export default api;