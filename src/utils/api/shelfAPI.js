import api from "./apiClient";

const shelfAPI = {
  // Get all shelves
  getShelves: async (zoneId = null) => {
    try {
      const params = zoneId ? { zoneId } : {};
      const response = await api.get("/shelves", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get shelf by ID
  getShelfById: async (shelfId) => {
    try {
      const response = await api.get(`/shelves/${shelfId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create shelf
  createShelf: async (zoneId, shelfData) => {
    try {
      const response = await api.post(`/zones/${zoneId}/shelves`, shelfData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update shelf
  updateShelf: async (shelfId, shelfData) => {
    try {
      const response = await api.put(`/shelves/${shelfId}`, shelfData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete shelf
  deleteShelf: async (shelfId) => {
    try {
      const response = await api.delete(`/shelves/${shelfId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get shelf stats
  getShelfStats: async (shelfId) => {
    try {
      const response = await api.get(`/shelves/${shelfId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get shelf bins
  getShelfBins: async (shelfId) => {
    try {
      const response = await api.get(`/shelves/${shelfId}/bins`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get shelf inventory
  getShelfInventory: async (shelfId) => {
    try {
      const response = await api.get(`/shelves/${shelfId}/inventory`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Update shelf capacity
  updateShelfCapacity: async (shelfId, capacityData) => {
    try {
      const response = await api.put(`/shelves/${shelfId}/capacity`, capacityData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get shelf utilization
  getShelfUtilization: async (shelfId) => {
    try {
      const response = await api.get(`/shelves/${shelfId}/utilization`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get shelves by warehouse
  getShelvesByWarehouse: async (warehouseId) => {
    try {
      const response = await api.get(`/warehouses/${warehouseId}/shelves`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get all shelves by company
  getShelvesByCompany: async (companyId) => {
    try {
      const response = await api.get(`/companies/${companyId}/shelves`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get simplified shelf list (only id, name, zoneId, and warehouseId)
  getSimplifiedShelves: async (zoneId, warehouseId, isActive) => {
    try {
      const params = {};
      if (zoneId) {
        params.zoneId = zoneId;
      }
      if (warehouseId) {
        params.warehouseId = warehouseId;
      }
      if (isActive !== undefined) {
        params.isActive = isActive;
      }
      const response = await api.get("/shelves/simple", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default shelfAPI;
