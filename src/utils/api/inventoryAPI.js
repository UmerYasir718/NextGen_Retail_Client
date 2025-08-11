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
  getPurchaseInventory: async (
    companyId = null,
    page = 1,
    limit = 10,
    search = "",
    sortBy = "",
    sortOrder = "asc"
  ) => {
    try {
      const params = { page, limit };

      if (companyId) {
        params.companyId = companyId;
      }

      if (search) {
        params.search = search;
      }

      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;
      }

      const response = await api.get("/inventory/purchase", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get inventory with sale_pending status
  getPendingSaleInventory: async (
    companyId = null,
    page = 1,
    limit = 10,
    search = "",
    sortBy = "",
    sortOrder = "asc"
  ) => {
    try {
      const params = { page, limit };

      if (companyId) {
        params.companyId = companyId;
      }

      if (search) {
        params.search = search;
      }

      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;
      }

      const response = await api.get("/inventory/sale-pending", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get inventory with sale status
  getSaleInventory: async (
    companyId = null,
    page = 1,
    limit = 10,
    search = "",
    sortBy = "",
    sortOrder = "asc"
  ) => {
    try {
      const params = { page, limit };

      if (companyId) {
        params.companyId = companyId;
      }

      if (search) {
        params.search = search;
      }

      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;
      }

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

  // Get temp inventory records by file ID
  getTempInventoryByFileId: async (fileId) => {
    try {
      const response = await api.get(`/inventory/temp/file/${fileId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get inventory data by file ID (alias for getTempInventoryByFileId)
  getInventoryDataByFileId: async (fileId) => {
    try {
      const response = await api.get(`/inventory/temp/file/${fileId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Approve temp inventory record
  approveTempInventory: async (recordId) => {
    try {
      const response = await api.put(`/inventory/temp/${recordId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Reject temp inventory record
  rejectTempInventory: async (recordId, reason = "") => {
    try {
      const response = await api.put(`/inventory/temp/${recordId}/reject`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Batch approve temp inventory records
  batchApproveTempInventory: async (recordIds) => {
    try {
      const response = await api.put(`/inventory/temp/batch/approve`, {
        recordIds,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Batch reject temp inventory records
  batchRejectTempInventory: async (recordIds, reason = "") => {
    try {
      const response = await api.put(`/inventory/temp/batch/reject`, {
        recordIds,
        reason,
      });
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
      const response = await api.get(
        `/inventory/location/${locationType}/${locationId}`
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Process temp file - approve or reject entire file
  processTempFile: async (fileId, status) => {
    try {
      const response = await api.post("/inventory/process-temp-file", {
        fileId,
        status,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default inventoryAPI;
