import api from "./apiClient";

const uhfAPI = {
  // UHF Readers
  // Get all UHF readers
  getUHFReaders: async (params = {}) => {
    try {
      const response = await api.get("/uhf-readers", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get UHF reader by ID
  getUHFReaderById: async (readerId) => {
    try {
      const response = await api.get(`/uhf-readers/${readerId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get UHF reader by UHF ID
  getUHFReaderByUHFId: async (uhfId) => {
    try {
      const response = await api.get(`/uhf-readers/uhf/${uhfId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create UHF reader
  createUHFReader: async (readerData) => {
    try {
      const response = await api.post("/uhf-readers", readerData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update UHF reader
  updateUHFReader: async (readerId, readerData) => {
    try {
      const response = await api.put(`/uhf-readers/${readerId}`, readerData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete UHF reader
  deleteUHFReader: async (readerId) => {
    try {
      const response = await api.delete(`/uhf-readers/${readerId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // UHF Tags
  // Detect UHF tag
  detectUHFTag: async (tagData) => {
    try {
      const response = await api.post("/uhf-tags/detect", tagData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Notifications
  // Get all notifications
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get("/notifications", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Inventory
  // Get inventory item by ID
  getInventoryItem: async (itemId) => {
    try {
      const response = await api.get(`/inventory/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get inventory item by tag ID
  getInventoryItemByTagId: async (tagId) => {
    try {
      const response = await api.get(`/inventory/tag/${tagId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update inventory item
  updateInventoryItem: async (itemId, itemData) => {
    try {
      const response = await api.put(`/inventory/${itemId}`, itemData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default uhfAPI;
