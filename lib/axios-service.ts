import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

/**
 * Axios instance with base configuration
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Adds authentication token and logs requests
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Axios Request] ${config.method?.toUpperCase()} ${config.url}`,
        config.data
      );
    }

    return config;
  },
  (error) => {
    console.error("[Axios Request Error]", error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles responses and errors globally
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Axios Response] ${response.status} ${response.config.url}`,
        response.data
      );
    }

    return response;
  },
  (error: AxiosError) => {
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          console.error("[Axios] Unauthorized - redirecting to login");
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
          }
          break;
        case 403:
          console.error("[Axios] Forbidden - insufficient permissions");
          break;
        case 404:
          console.error("[Axios] Resource not found");
          break;
        case 429:
          console.error("[Axios] Rate limit exceeded");
          break;
        case 500:
          console.error("[Axios] Server error");
          break;
        default:
          console.error(`[Axios] Error ${status}`, error.response.data);
      }
    } else if (error.request) {
      console.error("[Axios] No response received", error.request);
    } else {
      console.error("[Axios] Request setup error", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const blogAxiosApi = {
  async getAllPosts(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const response = await axiosInstance.get(`/api/posts?${params.toString()}`);
    return response.data;
  },

  async getPostById(id: string) {
    const response = await axiosInstance.get(`/api/posts/${id}`);
    return response.data.data;
  },

  async createPost(title: string, description: string) {
    const response = await axiosInstance.post("/api/posts", {
      title,
      description,
    });
    return response.data.data;
  },

  async updatePost(id: string, title: string, description: string) {
    const response = await axiosInstance.put(`/api/posts/${id}`, {
      title,
      description,
    });
    return response.data.data;
  },

  async deletePost(id: string) {
    await axiosInstance.delete(`/api/posts/${id}`);
  },
};
