import api from "./apiClient";

const forecastingAPI = {
  // Get forecasts by company ID
  getForecastsByCompany: async (companyId, filters = {}) => {
    try {
      const params = { ...filters };
      const response = await api.get(`/forecast/company/${companyId}`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get forecast analytics
  getForecastAnalytics: async (companyId) => {
    try {
      const response = await api.get(`/forecast/analytics/${companyId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get forecasts by date range
  getForecastsByDateRange: async (startDate, endDate, filters = {}) => {
    try {
      const params = { startDate, endDate, ...filters };
      const response = await api.get("/forecast", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get single forecast by ID
  getForecastById: async (forecastId) => {
    try {
      const response = await api.get(`/forecast/${forecastId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get forecasting data (legacy)
  getForecastingData: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/forecasting", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Upload forecasting file
  uploadForecastingFile: async (file, companyId = null) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      if (companyId) {
        formData.append("companyId", companyId);
      }

      const response = await api.post("/forecasting/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Download forecasting template
  downloadForecastingTemplate: async () => {
    try {
      const response = await api.get("/forecasting/template", {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get forecasting dashboard data (legacy)
  getForecastingDashboardData: async (companyId = null, filters = {}) => {
    try {
      const params = { ...filters };
      if (companyId) {
        params.companyId = companyId;
      }
      const response = await api.get("/forecasting/dashboard", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default forecastingAPI;
