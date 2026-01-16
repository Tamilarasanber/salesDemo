// Axios configuration with interceptors
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { Environment } from "@/API/Environment/Environment";

// Create axios instance
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: Environment.serverURL + "/api/",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem("auth_token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
