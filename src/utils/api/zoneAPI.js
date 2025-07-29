import api from "./apiClient";

const zoneAPI = {
  // Get all zones
  getZones: async (warehouseId = null) => {
    try {
      const params = warehouseId ? { warehouseId } : {};
      const response = await api.get("/zones", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get zone by ID
  getZoneById: async (zoneId) => {
    try {
      const response = await api.get(`/zones/${zoneId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create zone
  createZone: async (warehouseId, zoneData) => {
    try {
      const response = await api.post(`/warehouses/${warehouseId}/zones`, zoneData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update zone
  updateZone: async (zoneId, zoneData) => {
    try {
      const response = await api.put(`/zones/${zoneId}`, zoneData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete zone
  deleteZone: async (zoneId) => {
    try {
      const response = await api.delete(`/zones/${zoneId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get zone stats
  getZoneStats: async (zoneId) => {
    try {
      const response = await api.get(`/zones/${zoneId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get zone shelves
  getZoneShelves: async (zoneId) => {
    try {
      const response = await api.get(`/zones/${zoneId}/shelves`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get zone inventory
  getZoneInventory: async (zoneId) => {
    try {
      const response = await api.get(`/zones/${zoneId}/inventory`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Update zone capacity
  updateZoneCapacity: async (zoneId, capacityData) => {
    try {
      const response = await api.put(`/zones/${zoneId}/capacity`, capacityData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get zone utilization
  getZoneUtilization: async (zoneId) => {
    try {
      const response = await api.get(`/zones/${zoneId}/utilization`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get all zones by company
  getZonesByCompany: async (companyId) => {
    try {
      const response = await api.get(`/companies/${companyId}/zones`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  // Get simplified zone list (only id, name, and warehouseId)
  getSimplifiedZones: async (warehouseId, isActive) => {
    try {
      const params = {};
      if (warehouseId) {
        params.warehouseId = warehouseId;
      }
      if (isActive !== undefined) {
        params.isActive = isActive;
      }
      const response = await api.get("/zones/simple", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default zoneAPI;
