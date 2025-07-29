import api from "./apiClient";

const warehouseAPI = {
  // Get all warehouses
  getWarehouses: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/warehouses", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get warehouse by ID
  getWarehouseById: async (warehouseId) => {
    try {
      const response = await api.get(`/warehouses/${warehouseId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create warehouse
  createWarehouse: async (warehouseData) => {
    try {
      const response = await api.post("/warehouses", warehouseData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update warehouse
  updateWarehouse: async (warehouseId, warehouseData) => {
    try {
      const response = await api.put(`/warehouses/${warehouseId}`, warehouseData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete warehouse
  deleteWarehouse: async (warehouseId) => {
    try {
      const response = await api.delete(`/warehouses/${warehouseId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get warehouse stats
  getWarehouseStats: async (warehouseId) => {
    try {
      const response = await api.get(`/warehouses/${warehouseId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get warehouse structure
  getWarehouseStructure: async (warehouseId) => {
    try {
      const response = await api.get(`/warehouses/${warehouseId}/structure`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get simplified warehouse list (only id and name)
  getSimplifiedWarehouses: async (isActive) => {
    try {
      const params = {};
      if (isActive !== undefined) {
        params.isActive = isActive;
      }
      const response = await api.get("/warehouses/simple", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default warehouseAPI;
