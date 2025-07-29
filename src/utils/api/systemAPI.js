import api from "./apiClient";

const systemAPI = {
  // Get system settings
  getSystemSettings: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/system/settings", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update system settings
  updateSystemSettings: async (settingsData) => {
    try {
      const response = await api.put("/system/settings", settingsData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get UHF devices
  getUHFDevices: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/system/devices/uhf", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get RFID devices
  getRFIDDevices: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/system/devices/rfid", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Add device
  addDevice: async (deviceData) => {
    try {
      const response = await api.post("/system/devices", deviceData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update device
  updateDevice: async (deviceId, deviceData) => {
    try {
      const response = await api.put(`/system/devices/${deviceId}`, deviceData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete device
  deleteDevice: async (deviceId) => {
    try {
      const response = await api.delete(`/system/devices/${deviceId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get dashboard data for company
  getDashboardData: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/companies/dashboard/stats", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default systemAPI;
