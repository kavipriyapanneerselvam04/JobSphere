import axios from "axios";

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

export const resolveAssetUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (/\.pdf$/i.test(value) && !value.startsWith("/")) {
    return `${API_BASE_URL}/uploads/${value}`;
  }
  if (!value.startsWith("/") && /\.(png|jpe?g|gif|webp|svg)$/i.test(value)) {
    return `${API_BASE_URL}/profile/${value}`;
  }
  return `${API_BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("role");
    }

    return Promise.reject(error);
  }
);

export default api;
