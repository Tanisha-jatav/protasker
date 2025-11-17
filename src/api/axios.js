import axios from "axios";

// 🔥 LIVE BACKEND URL (Render)
const API = axios.create({
  baseURL: "https://protasker-server.onrender.com/api", 
  withCredentials: false,
});

// 🔐 Automatically attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    config.headers["Content-Type"] = "application/json";
    config.headers.Accept = "application/json";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No token found, request may be unauthorized");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚫 If token expires → auto logout
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      console.warn("❌ Token expired or invalid — forcing logout");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default API;
