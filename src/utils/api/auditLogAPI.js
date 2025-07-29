import api from "./apiClient";

const auditLogAPI = {
  // Get all audit logs
  getAuditLogs: async () => {
    try {
      const response = await api.get("/audit-logs");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get single audit log
  getAuditLogById: async (logId) => {
    try {
      const response = await api.get(`/audit-logs/${logId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create audit log
  createAuditLog: async (logData) => {
    try {
      const response = await api.post("/audit-logs", logData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get audit log statistics
  getAuditLogStats: async () => {
    try {
      const response = await api.get("/audit-logs/stats");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete old audit logs
  cleanupAuditLogs: async () => {
    try {
      const response = await api.delete("/audit-logs/cleanup");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default auditLogAPI;
