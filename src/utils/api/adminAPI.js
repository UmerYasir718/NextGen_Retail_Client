import apiClient from "./apiClient";

const adminAPI = {
  // Get Admin Dashboard
  getDashboard: async () => {
    return apiClient.get("/admin/dashboard");
  },

  // Get All Users with pagination, filtering, and sorting
  getUsers: async (params = {}) => {
    const {
      page = 1,
      limit = 10,
      role,
      companyId,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const queryParams = new URLSearchParams();

    if (page) queryParams.append("page", page);
    if (limit) queryParams.append("limit", limit);
    if (role) queryParams.append("role", role);
    if (companyId) queryParams.append("companyId", companyId);
    if (search) queryParams.append("search", search);
    if (sortBy) queryParams.append("sortBy", sortBy);
    if (sortOrder) queryParams.append("sortOrder", sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `/admin/users?${queryString}` : "/admin/users";

    return apiClient.get(url);
  },

  // Get System Analytics
  getAnalytics: async (timeRange = 30) => {
    return apiClient.get(`/admin/analytics?timeRange=${timeRange}`);
  },

  // Get System Settings
  getSettings: async () => {
    return apiClient.get("/admin/settings");
  },

  // Update System Settings
  updateSettings: async (settings) => {
    return apiClient.put("/admin/settings", { settings });
  },

  // Get System Health
  getHealth: async () => {
    return apiClient.get("/admin/health");
  },

  // Perform System Maintenance
  performMaintenance: async (action, options = {}) => {
    return apiClient.post("/admin/maintenance", {
      action,
      options,
    });
  },

  // Convenience methods for common maintenance actions
  cleanupAuditLogs: async (retentionDays = 365) => {
    return adminAPI.performMaintenance("cleanup-audit-logs", { retentionDays });
  },

  cleanupTempFiles: async () => {
    return adminAPI.performMaintenance("cleanup-temp-files");
  },

  optimizeDatabase: async () => {
    return adminAPI.performMaintenance("optimize-database");
  },

  backupData: async () => {
    return adminAPI.performMaintenance("backup-data");
  },

  // Get user statistics for dashboard
  getUserStats: async () => {
    return apiClient.get("/admin/users/stats");
  },

  // Get company statistics for dashboard
  getCompanyStats: async () => {
    return apiClient.get("/admin/companies/stats");
  },

  // Get plan statistics for dashboard
  getPlanStats: async () => {
    return apiClient.get("/admin/plans/stats");
  },

  // Get revenue statistics for dashboard
  getRevenueStats: async () => {
    return apiClient.get("/admin/revenue/stats");
  },

  // Get recent activities for dashboard
  getRecentActivities: async (limit = 10) => {
    return apiClient.get(`/admin/activities/recent?limit=${limit}`);
  },

  // Get new companies for dashboard
  getNewCompanies: async (limit = 10) => {
    return apiClient.get(`/admin/companies/new?limit=${limit}`);
  },

  // Get system logs
  getSystemLogs: async (params = {}) => {
    const { page = 1, limit = 50, level, startDate, endDate, search } = params;

    const queryParams = new URLSearchParams();

    if (page) queryParams.append("page", page);
    if (limit) queryParams.append("limit", limit);
    if (level) queryParams.append("level", level);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (search) queryParams.append("search", search);

    const queryString = queryParams.toString();
    const url = queryString ? `/admin/logs?${queryString}` : "/admin/logs";

    return apiClient.get(url);
  },

  // Export data
  exportData: async (dataType, format = "csv", filters = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append("type", dataType);
    queryParams.append("format", format);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });

    return apiClient.get(`/admin/export?${queryParams.toString()}`, {
      responseType: "blob",
    });
  },

  // Get audit trail
  getAuditTrail: async (params = {}) => {
    const {
      page = 1,
      limit = 50,
      userId,
      companyId,
      action,
      startDate,
      endDate,
      sortBy = "timestamp",
      sortOrder = "desc",
    } = params;

    const queryParams = new URLSearchParams();

    if (page) queryParams.append("page", page);
    if (limit) queryParams.append("limit", limit);
    if (userId) queryParams.append("userId", userId);
    if (companyId) queryParams.append("companyId", companyId);
    if (action) queryParams.append("action", action);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (sortBy) queryParams.append("sortBy", sortBy);
    if (sortOrder) queryParams.append("sortOrder", sortOrder);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/admin/audit-trail?${queryString}`
      : "/admin/audit-trail";

    return apiClient.get(url);
  },

  // Get system performance metrics
  getPerformanceMetrics: async (timeRange = 24) => {
    return apiClient.get(`/admin/performance?timeRange=${timeRange}`);
  },

  // Get error reports
  getErrorReports: async (params = {}) => {
    const {
      page = 1,
      limit = 50,
      severity,
      startDate,
      endDate,
      resolved,
    } = params;

    const queryParams = new URLSearchParams();

    if (page) queryParams.append("page", page);
    if (limit) queryParams.append("limit", limit);
    if (severity) queryParams.append("severity", severity);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (resolved !== undefined) queryParams.append("resolved", resolved);

    const queryString = queryParams.toString();
    const url = queryString ? `/admin/errors?${queryString}` : "/admin/errors";

    return apiClient.get(url);
  },

  // Mark error as resolved
  resolveError: async (errorId) => {
    return apiClient.put(`/admin/errors/${errorId}/resolve`);
  },

  // Get backup status
  getBackupStatus: async () => {
    return apiClient.get("/admin/backup/status");
  },

  // Initiate manual backup
  initiateBackup: async (backupType = "full") => {
    return apiClient.post("/admin/backup", { type: backupType });
  },

  // Get backup history
  getBackupHistory: async (params = {}) => {
    const { page = 1, limit = 20, startDate, endDate, status } = params;

    const queryParams = new URLSearchParams();

    if (page) queryParams.append("page", page);
    if (limit) queryParams.append("limit", limit);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (status) queryParams.append("status", status);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/admin/backup/history?${queryString}`
      : "/admin/backup/history";

    return apiClient.get(url);
  },

  // Restore from backup
  restoreFromBackup: async (backupId, options = {}) => {
    return apiClient.post(`/admin/backup/${backupId}/restore`, options);
  },

  // Get system notifications
  getSystemNotifications: async (params = {}) => {
    const { page = 1, limit = 20, type, read, startDate, endDate } = params;

    const queryParams = new URLSearchParams();

    if (page) queryParams.append("page", page);
    if (limit) queryParams.append("limit", limit);
    if (type) queryParams.append("type", type);
    if (read !== undefined) queryParams.append("read", read);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/admin/notifications?${queryString}`
      : "/admin/notifications";

    return apiClient.get(url);
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    return apiClient.put(`/admin/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    return apiClient.put("/admin/notifications/read-all");
  },

  // Send system notification
  sendSystemNotification: async (notification) => {
    return apiClient.post("/admin/notifications/send", notification);
  },

  // Get API usage statistics
  getAPIUsageStats: async (params = {}) => {
    const { timeRange = 30, endpoint, userId, companyId } = params;

    const queryParams = new URLSearchParams();

    if (timeRange) queryParams.append("timeRange", timeRange);
    if (endpoint) queryParams.append("endpoint", endpoint);
    if (userId) queryParams.append("userId", userId);
    if (companyId) queryParams.append("companyId", companyId);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/admin/api-usage?${queryString}`
      : "/admin/api-usage";

    return apiClient.get(url);
  },

  // Get rate limit information
  getRateLimitInfo: async () => {
    return apiClient.get("/admin/rate-limits");
  },

  // Update rate limits
  updateRateLimits: async (limits) => {
    return apiClient.put("/admin/rate-limits", limits);
  },

  // Get database statistics
  getDatabaseStats: async () => {
    return apiClient.get("/admin/database/stats");
  },

  // Get cache statistics
  getCacheStats: async () => {
    return apiClient.get("/admin/cache/stats");
  },

  // Clear cache
  clearCache: async (cacheType = "all") => {
    return apiClient.post("/admin/cache/clear", { type: cacheType });
  },

  // Get queue statistics
  getQueueStats: async () => {
    return apiClient.get("/admin/queue/stats");
  },

  // Retry failed jobs
  retryFailedJobs: async (queueName, jobIds = []) => {
    return apiClient.post("/admin/queue/retry", { queueName, jobIds });
  },

  // Clear failed jobs
  clearFailedJobs: async (queueName) => {
    return apiClient.delete(`/admin/queue/${queueName}/failed`);
  },

  // Get security logs
  getSecurityLogs: async (params = {}) => {
    const {
      page = 1,
      limit = 50,
      eventType,
      userId,
      companyId,
      startDate,
      endDate,
      severity,
    } = params;

    const queryParams = new URLSearchParams();

    if (page) queryParams.append("page", page);
    if (limit) queryParams.append("limit", limit);
    if (eventType) queryParams.append("eventType", eventType);
    if (userId) queryParams.append("userId", userId);
    if (companyId) queryParams.append("companyId", companyId);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (severity) queryParams.append("severity", severity);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/admin/security/logs?${queryString}`
      : "/admin/security/logs";

    return apiClient.get(url);
  },

  // Get failed login attempts
  getFailedLogins: async (params = {}) => {
    const {
      page = 1,
      limit = 50,
      userId,
      companyId,
      startDate,
      endDate,
      ipAddress,
    } = params;

    const queryParams = new URLSearchParams();

    if (page) queryParams.append("page", page);
    if (limit) queryParams.append("limit", limit);
    if (userId) queryParams.append("userId", userId);
    if (companyId) queryParams.append("companyId", companyId);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (ipAddress) queryParams.append("ipAddress", ipAddress);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/admin/security/failed-logins?${queryString}`
      : "/admin/security/failed-logins";

    return apiClient.get(url);
  },

  // Block IP address
  blockIPAddress: async (ipAddress, reason, duration = 24) => {
    return apiClient.post("/admin/security/block-ip", {
      ipAddress,
      reason,
      duration,
    });
  },

  // Unblock IP address
  unblockIPAddress: async (ipAddress) => {
    return apiClient.delete(`/admin/security/block-ip/${ipAddress}`);
  },

  // Get blocked IP addresses
  getBlockedIPs: async () => {
    return apiClient.get("/admin/security/blocked-ips");
  },
};

export default adminAPI;
