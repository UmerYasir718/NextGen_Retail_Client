import api from "./apiClient";

const helpfileAPI = {
  // Get all help files
  getHelpFiles: async (category = null) => {
    try {
      const params = category ? { category } : {};
      const response = await api.get("/helpfiles", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get help file by ID
  getHelpFileById: async (helpfileId) => {
    try {
      const response = await api.get(`/helpfiles/${helpfileId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create help file
  createHelpFile: async (helpfileData) => {
    try {
      const response = await api.post("/helpfiles", helpfileData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update help file
  updateHelpFile: async (helpfileId, helpfileData) => {
    try {
      const response = await api.put(`/helpfiles/${helpfileId}`, helpfileData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete help file
  deleteHelpFile: async (helpfileId) => {
    try {
      const response = await api.delete(`/helpfiles/${helpfileId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get help file categories
  getHelpCategories: async () => {
    try {
      const response = await api.get("/helpfiles/categories");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Search help files
  searchHelpFiles: async (query) => {
    try {
      const response = await api.get(`/helpfiles/search`, {
        params: { query },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default helpfileAPI;
