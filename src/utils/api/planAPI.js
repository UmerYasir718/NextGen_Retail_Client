import api from "./apiClient";

const planAPI = {
  // Get all plans (for catalog view)
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

  // Create new plan (super admin only)
  createPlan: async (planData) => {
    try {
      const response = await api.post("/plans", planData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update plan (super admin only)
  updatePlan: async (planId, planData) => {
    try {
      const response = await api.put(`/plans/${planId}`, planData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete plan (super admin only)
  deletePlan: async (planId) => {
    try {
      const response = await api.delete(`/plans/${planId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get current company plan details
  getCurrentPlan: async () => {
    try {
      const response = await api.get("/companies/plan");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get company dashboard stats (includes plan info)
  getCompanyDashboardStats: async () => {
    try {
      const response = await api.get("/companies/dashboard/stats");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create Stripe checkout session for plan purchase
  createCheckoutSession: async (planId) => {
    try {
      const response = await api.post("/plans/checkout", { planId });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get checkout session status
  getCheckoutSession: async (sessionId) => {
    try {
      const response = await api.get(`/plans/checkout/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Cancel subscription
  cancelSubscription: async () => {
    try {
      const response = await api.post("/plans/cancel-subscription");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get subscription details
  getSubscription: async () => {
    try {
      const response = await api.get("/plans/subscription");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update subscription (change plan)
  updateSubscription: async (planId) => {
    try {
      const response = await api.put("/plans/subscription", { planId });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get plan usage statistics
  getPlanUsage: async () => {
    try {
      const response = await api.get("/plans/usage");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get plan limits
  getPlanLimits: async () => {
    try {
      const response = await api.get("/plans/limits");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Check if feature is available in current plan
  checkFeatureAccess: async (feature) => {
    try {
      const response = await api.post("/plans/check-feature", { feature });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get plan history
  getPlanHistory: async () => {
    try {
      const response = await api.get("/plans/history");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get available upgrades
  getAvailableUpgrades: async () => {
    try {
      const response = await api.get("/plans/upgrades");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Request plan upgrade
  requestUpgrade: async (planId) => {
    try {
      const response = await api.post("/plans/upgrade", { planId });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get plan comparison
  getPlanComparison: async () => {
    try {
      const response = await api.get("/plans/compare");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get billing information
  getBillingInfo: async () => {
    try {
      const response = await api.get("/plans/billing");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update billing information
  updateBillingInfo: async (billingData) => {
    try {
      const response = await api.put("/plans/billing", billingData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get invoices
  getInvoices: async () => {
    try {
      const response = await api.get("/plans/invoices");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Download invoice
  downloadInvoice: async (invoiceId) => {
    try {
      const response = await api.get(`/plans/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default planAPI;
