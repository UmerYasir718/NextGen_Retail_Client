import api from "./apiClient";

const binAPI = {
  // Get all bins
  getBins: async (shelfId = null) => {
    try {
      const params = shelfId ? { shelfId } : {};
      const response = await api.get("/bins", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get bin by ID
  getBinById: async (binId) => {
    try {
      const response = await api.get(`/bins/${binId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create bin
  createBin: async (shelfId, binData) => {
    try {
      const response = await api.post(`/shelves/${shelfId}/bins`, binData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update bin
  updateBin: async (binId, binData) => {
    try {
      const response = await api.put(`/bins/${binId}`, binData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete bin
  deleteBin: async (binId) => {
    try {
      const response = await api.delete(`/bins/${binId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get bin inventory
  getBinInventory: async (binId) => {
    try {
      const response = await api.get(`/bins/${binId}/inventory`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update bin capacity
  updateBinCapacity: async (binId, capacityData) => {
    try {
      const response = await api.put(`/bins/${binId}/capacity`, capacityData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get bins by warehouse
  getBinsByWarehouse: async (warehouseId) => {
    try {
      const response = await api.get(`/warehouses/${warehouseId}/bins`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get bins by zone
  getBinsByZone: async (zoneId) => {
    try {
      const response = await api.get(`/zones/${zoneId}/bins`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get bin utilization
  getBinUtilization: async (binId) => {
    try {
      const response = await api.get(`/bins/${binId}/utilization`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Assign item to bin
  assignItemToBin: async (binId, itemData) => {
    try {
      const response = await api.post(`/bins/${binId}/items`, itemData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Remove item from bin
  removeItemFromBin: async (binId, itemId) => {
    try {
      const response = await api.delete(`/bins/${binId}/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get simplified bin list (only id, name, shelfId, zoneId, and warehouseId)
  getSimplifiedBins: async (shelfId, zoneId, warehouseId, isActive) => {
    try {
      const params = {};
      if (shelfId) {
        params.shelfId = shelfId;
      }
      if (zoneId) {
        params.zoneId = zoneId;
      }
      if (warehouseId) {
        params.warehouseId = warehouseId;
      }
      if (isActive !== undefined) {
        params.isActive = isActive;
      }
      const response = await api.get("/bins/simple", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default binAPI;
