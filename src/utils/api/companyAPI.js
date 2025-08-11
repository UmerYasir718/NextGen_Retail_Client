import api from "./apiClient";

const companyAPI = {
  // Edit company details (without company name permission)
  editCompanyDetails: async (companyData) => {
    try {
      const response = await api.put("/companies/edit-details", companyData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get company profile
  getCompanyProfile: async () => {
    try {
      const response = await api.get("/companies/profile");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Super Admin Company Management APIs
  // Get all companies with pagination, filtering, and search
  getAllCompanies: async (params = {}) => {
    try {
      const response = await api.get("/companies", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get company statistics
  getCompanyStats: async () => {
    try {
      const response = await api.get("/companies/stats");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get single company details
  getCompanyById: async (companyId) => {
    try {
      const response = await api.get(`/companies/${companyId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update company details
  updateCompany: async (companyId, updateData) => {
    try {
      const response = await api.put(`/companies/${companyId}`, updateData);
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

  // Approve company subscription
  approveCompanySubscription: async (companyId, subscriptionData) => {
    try {
      const response = await api.post(
        `/companies/${companyId}/approve-subscription`,
        subscriptionData
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get Stripe transactions
  getStripeTransactions: async (params = {}) => {
    try {
      const response = await api.get("/companies/stripe/transactions", {
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Super admin company token switch
  switchCompanyToken: async (companyId) => {
    try {
      const response = await api.post("/auth/superadmin/company-token", {
        companyId,
      });
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
};

export default companyAPI;
