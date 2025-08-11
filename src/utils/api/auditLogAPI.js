import api from "./apiClient";

const auditLogAPI = {
  // Get all audit logs with pagination and filtering
  getAuditLogs: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        dateFilter = "",
        actionFilter = "",
        moduleFilter = "",
        companyId = null,
        sortBy = "timestamp",
        sortOrder = "desc",
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) queryParams.append("search", search);
      if (dateFilter) queryParams.append("dateFilter", dateFilter);
      if (actionFilter) queryParams.append("actionFilter", actionFilter);
      if (moduleFilter) queryParams.append("moduleFilter", moduleFilter);
      if (companyId) queryParams.append("companyId", companyId);

      const response = await api.get(`/audit-logs?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get audit logs count for pagination
  getAuditLogsCount: async (params = {}) => {
    try {
      const {
        search = "",
        dateFilter = "",
        actionFilter = "",
        moduleFilter = "",
        companyId = null,
      } = params;

      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (dateFilter) queryParams.append("dateFilter", dateFilter);
      if (actionFilter) queryParams.append("actionFilter", actionFilter);
      if (moduleFilter) queryParams.append("moduleFilter", moduleFilter);
      if (companyId) queryParams.append("companyId", companyId);

      const response = await api.get(
        `/audit-logs/count?${queryParams.toString()}`
      );
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
  getAuditLogStats: async (companyId = null) => {
    try {
      const queryParams = companyId ? `?companyId=${companyId}` : "";
      const response = await api.get(`/audit-logs/stats${queryParams}`);
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
