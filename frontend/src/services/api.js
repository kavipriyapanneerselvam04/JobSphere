import axios from "axios";

// Use environment variable in production
// Fallback to localhost for local development
const baseURL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL,
});

// 🔹 Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔹 Handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("role");

      // Optional: redirect to login page
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
