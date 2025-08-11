import axios from "axios";
import AI_CONFIG from "../../config/aiConfig";

// AI Base URL - different from main API
export const AI_BASE_URL = AI_CONFIG.BASE_URL;

// Create axios instance for AI services with default config
const aiApi = axios.create({
  baseURL: AI_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: AI_CONFIG.TIMEOUT,
});

// Request interceptor to add auth token to all requests
aiApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
aiApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      // Only redirect to login if we're not already on a protected route
      const currentPath = window.location.pathname;
      if (!currentPath.includes("/login") && !currentPath.includes("/signup")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// AI API functions
export const aiAPI = {
  // Text-based forecasting
  getForecastText: async (inputText, jobId = null) => {
    try {
      const payload = {
        inputText,
        ...(jobId && { jobId }),
      };

      const response = await aiApi.post(
        AI_CONFIG.ENDPOINTS.FORECAST_TEXT,
        payload
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get forecast CSV file
  getForecastCsv: async (csvUrl) => {
    try {
      const response = await aiApi.get(csvUrl);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Download forecast CSV file
  downloadForecastCsv: async (csvUrl, filename = "forecast.csv") => {
    try {
      const response = await aiApi.get(csvUrl, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Chat with AI assistant
  chatWithAI: async (message, context = null) => {
    try {
      const payload = {
        message,
        ...(context && { context }),
      };

      const response = await aiApi.post(AI_CONFIG.ENDPOINTS.CHAT, payload);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get AI service status
  getAIStatus: async () => {
    try {
      const response = await aiApi.get(AI_CONFIG.ENDPOINTS.STATUS);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default aiAPI;
