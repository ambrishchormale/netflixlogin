import axios from "axios";

// This check covers both common naming conventions just in case
const baseURL = import.meta.env.VITE_API_BASE_URL || 
                import.meta.env.VITE_API_URL || 
                "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  }
});

// Automatically attach the JWT token to every request sent to the backend
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});