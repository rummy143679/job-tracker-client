import axios from "axios";

// const API_BASE = "http://localhost:5000/api";
// const API_BASE =
//   import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://jobtracker4-8wxafy46.b4a.run/api";



export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
