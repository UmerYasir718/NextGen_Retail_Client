import api from "./apiClient";

const planAPI = {
  // Get all plans
  getPlans: async () => {
    try {
      const response = await api.get("/plans");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get plan by ID
  getPlanById: async (planId) => {
    try {
      const response = await api.get(`/plans/${planId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create plan
  createPlan: async (planData) => {
    try {
      const response = await api.post("/plans", planData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update plan
  updatePlan: async (planId, planData) => {
    try {
      const response = await api.put(`/plans/${planId}`, planData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete plan
  deletePlan: async (planId) => {
    try {
      const response = await api.delete(`/plans/${planId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Assign plan to company
  assignPlanToCompany: async (planId, companyId) => {
    try {
      const response = await api.post(`/plans/${planId}/assign`, { companyId });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create checkout session
  createCheckoutSession: async (planId) => {
    try {
      // Get the current domain for success and cancel URLs
      const domain = window.location.origin;
      const successUrl = `${domain}/payment/success`;
      const cancelUrl = `${domain}/payment/cancel`;
      
      const response = await api.post(`/plans/${planId}/checkout`, {
        successUrl,
        cancelUrl
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default planAPI;
