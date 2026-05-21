import axios from "axios";
import { HOST } from "@/utils/constants";

export const apiClient = axios.create({
  baseURL: HOST,
});

// Add token to request headers if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
