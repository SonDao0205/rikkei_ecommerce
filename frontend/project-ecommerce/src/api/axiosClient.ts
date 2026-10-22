import axios from "axios";

// In-memory token storage (isolated in JavaScript memory, not persisted in localStorage)
let inMemoryAccessToken: string | null = null;

export const setInMemoryAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getInMemoryAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});

axiosClient.interceptors.request.use(
  (config) => {
    // Read access token strictly from memory
    const token = inMemoryAccessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const message =
      data?.message ||
      (Array.isArray(data?.errors) && data.errors[0]?.message) ||
      error.message ||
      "An unexpected error occurred";

    const enhancedError = new Error(message);
    (enhancedError as any).response = error.response;
    (enhancedError as any).errors = data?.errors;
    return Promise.reject(enhancedError);
  }
);

export default axiosClient;
