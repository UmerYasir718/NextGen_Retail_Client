import api from "./apiClient";

const inventoryAPI = {
  // Get all inventory items
  getAllInventory: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/inventory", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get single inventory item
  getInventoryById: async (itemId) => {
    try {
      const response = await api.get(`/inventory/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get inventory with purchase status
  getPurchaseInventory: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/inventory/purchase", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get inventory with sale_pending status
  getPendingSaleInventory: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/inventory/sale-pending", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get inventory with sale status
  getSaleInventory: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/inventory/sale", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create inventory item
  addInventoryItem: async (inventoryData) => {
    try {
      const response = await api.post("/inventory", inventoryData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update inventory item
  updateInventoryItem: async (itemId, inventoryData) => {
    try {
      const response = await api.put(`/inventory/${itemId}`, inventoryData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete inventory item
  deleteInventoryItem: async (itemId) => {
    try {
      const response = await api.delete(`/inventory/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update inventory status
  updateInventoryStatus: async (itemId, statusData) => {
    try {
      const response = await api.put(`/inventory/${itemId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Upload inventory CSV
  uploadInventoryCSV: async (formData) => {
    try {
      const response = await api.post("/inventory/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get all inventory uploads
  getInventoryUploads: async () => {
    try {
      const response = await api.get("/inventory/uploads");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get single inventory upload
  getInventoryUploadById: async (uploadId) => {
    try {
      const response = await api.get(`/inventory/uploads/${uploadId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Approve inventory upload
  approveInventoryUpload: async (uploadId) => {
    try {
      const response = await api.post(`/inventory/uploads/${uploadId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete inventory upload
  deleteInventoryUpload: async (uploadId) => {
    try {
      const response = await api.delete(`/inventory/uploads/${uploadId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get inventory statistics
  getInventoryStats: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/inventory/stats", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get inventory by location (warehouse, zone, shelf, bin)
  getInventoryByLocation: async (locationType, locationId) => {
    try {
      const response = await api.get(`/inventory/location/${locationType}/${locationId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default inventoryAPI;
