import api from "./apiClient";

const companyAPI = {
  // Get all companies
  getCompanies: async () => {
    try {
      const response = await api.get("/companies");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get company by ID
  getCompanyById: async (companyId) => {
    try {
      const response = await api.get(`/companies/${companyId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create company
  createCompany: async (companyData) => {
    try {
      const response = await api.post("/companies", companyData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update company
  updateCompany: async (companyId, companyData) => {
    try {
      const response = await api.put(`/companies/${companyId}`, companyData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete company
  deleteCompany: async (companyId) => {
    try {
      const response = await api.delete(`/companies/${companyId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get company dashboard stats
  getCompanyDashboard: async (companyId) => {
    try {
      const response = await api.get(`/companies/${companyId}/dashboard`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get company dashboard statistics
  getCompanyDashboardStats: async () => {
    try {
      const response = await api.get("/companies/dashboard/stats");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default companyAPI;
