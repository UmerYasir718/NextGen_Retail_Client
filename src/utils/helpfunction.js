import axios from "axios";

// Base URL for API
export const API_BASE_URL = "http://192.168.0.107:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Regular user login
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Superadmin login (different URL)
  superadminLogin: async (email, password) => {
    try {
      const response = await api.post("/auth/superadmin/login", { email, password });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Request password reset
  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.put("/auth/reset-password", { token, newPassword });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },
};

// User API functions
export const userAPI = {
  // Get all users
  getUsers: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/users", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create a new user
  createUser: async (userData) => {
    try {
      const response = await api.post("/users", userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};



// Company API functions
export const companyAPI = {
  // Get all companies
  getCompanies: async () => {
    try {
      const response = await api.get("/companies");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get company by ID
  getCompanyById: async (companyId) => {
    try {
      const response = await api.get(`/companies/${companyId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create company
  createCompany: async (companyData) => {
    try {
      const response = await api.post("/companies", companyData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update company
  updateCompany: async (companyId, companyData) => {
    try {
      const response = await api.put(`/companies/${companyId}`, companyData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete company
  deleteCompany: async (companyId) => {
    try {
      const response = await api.delete(`/companies/${companyId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get company dashboard stats
  getCompanyDashboard: async (companyId) => {
    try {
      const response = await api.get(`/companies/${companyId}/dashboard`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Inventory API functions
export const inventoryAPI = {
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
      const response = await api.get("/inventory/status/purchase", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get inventory with sale_pending status
  getPendingSaleInventory: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/inventory/status/sale-pending", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get inventory with sale status
  getSaleInventory: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/inventory/status/sale", { params });
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
      const response = await api.put(`/inventory/uploads/${uploadId}/approve`);
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
};

// Plan API functions
export const planAPI = {
  // Get all plans
  getPlans: async () => {
    try {
      const response = await api.get("/plans");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get plan by ID
  getPlanById: async (planId) => {
    try {
      const response = await api.get(`/plans/${planId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create plan
  createPlan: async (planData) => {
    try {
      const response = await api.post("/plans", planData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update plan
  updatePlan: async (planId, planData) => {
    try {
      const response = await api.put(`/plans/${planId}`, planData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete plan
  deletePlan: async (planId) => {
    try {
      const response = await api.delete(`/plans/${planId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create checkout session for plan
  createCheckoutSession: async (planId) => {
    try {
      const response = await api.post(`/plans/checkout/${planId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Handle Stripe webhook
  handleStripeWebhook: async (webhookData) => {
    try {
      const response = await api.post("/plans/webhook", webhookData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Warehouse API functions
export const warehouseAPI = {
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
      const response = await api.put(
        `/warehouses/${warehouseId}`,
        warehouseData
      );
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

  // Get zones in warehouse
  getWarehouseZones: async (warehouseId) => {
    try {
      const response = await api.get(`/warehouses/${warehouseId}/zones`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Zone API functions
export const zoneAPI = {
  // Get all zones in warehouse
  getZones: async (warehouseId) => {
    try {
      const response = await api.get(`/warehouses/${warehouseId}/zones`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get single zone
  getZoneById: async (warehouseId, zoneId) => {
    try {
      const response = await api.get(`/warehouses/${warehouseId}/zones/${zoneId}`);
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
  updateZone: async (warehouseId, zoneId, zoneData) => {
    try {
      const response = await api.put(`/warehouses/${warehouseId}/zones/${zoneId}`, zoneData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete zone
  deleteZone: async (warehouseId, zoneId) => {
    try {
      const response = await api.delete(`/warehouses/${warehouseId}/zones/${zoneId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Shelf API functions
export const shelfAPI = {
  // Get all shelves
  getShelves: async () => {
    try {
      const response = await api.get("/shelves");
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
  createShelf: async (shelfData) => {
    try {
      const response = await api.post("/shelves", shelfData);
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

  // Get shelf utilization
  getShelfUtilization: async (shelfId) => {
    try {
      const response = await api.get(`/shelves/${shelfId}/utilization`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Bin API functions
export const binAPI = {
  // Get all bins
  getBins: async () => {
    try {
      const response = await api.get("/bins");
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
  createBin: async (binData) => {
    try {
      const response = await api.post("/bins", binData);
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

  // Get inventory in bin
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
};

// Forecasting API functions
export const forecastingAPI = {
  getForecastingData: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/forecasting", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  uploadForecastingFile: async (file, companyId = null) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (companyId) {
        formData.append("companyId", companyId);
      }

      const response = await api.post("/forecasting/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  downloadForecastingTemplate: async () => {
    try {
      const response = await api.get("/forecasting/template", {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  getForecastingDashboardData: async (companyId = null, filters = {}) => {
    try {
      const params = { ...filters };
      if (companyId) {
        params.companyId = companyId;
      }

      const response = await api.get("/forecasting/dashboard", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Shipment API functions
export const shipmentAPI = {
  // Get all shipments
  getShipments: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/shipments", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get shipment by ID
  getShipmentById: async (shipmentId) => {
    try {
      const response = await api.get(`/shipments/${shipmentId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create shipment
  createShipment: async (shipmentData) => {
    try {
      const response = await api.post("/shipments", shipmentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update shipment
  updateShipment: async (shipmentId, shipmentData) => {
    try {
      const response = await api.put(`/shipments/${shipmentId}`, shipmentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete shipment
  deleteShipment: async (shipmentId) => {
    try {
      const response = await api.delete(`/shipments/${shipmentId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Upload shipment document
  uploadShipmentDocument: async (shipmentId, formData) => {
    try {
      const response = await api.put(`/shipments/${shipmentId}/document`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get shipment statistics
  getShipmentStats: async () => {
    try {
      const response = await api.get("/shipments/stats");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// System Management API functions
export const systemAPI = {
  getSystemSettings: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/system/settings", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  updateSystemSettings: async (settingsData) => {
    try {
      const response = await api.put("/system/settings", settingsData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  getUHFDevices: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/system/uhf-devices", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  getRFIDDevices: async (companyId = null) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await api.get("/system/rfid-devices", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  addDevice: async (deviceData) => {
    try {
      const response = await api.post("/system/devices", deviceData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  updateDevice: async (deviceId, deviceData) => {
    try {
      const response = await api.put(`/system/devices/${deviceId}`, deviceData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  deleteDevice: async (deviceId) => {
    try {
      const response = await api.delete(`/system/devices/${deviceId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Help File API functions
export const helpfileAPI = {
  // Get all help files
  getHelpFiles: async (category = null) => {
    try {
      const params = category ? { category } : {};
      const response = await api.get("/helpfiles", { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get help file by ID
  getHelpFileById: async (helpfileId) => {
    try {
      const response = await api.get(`/helpfiles/${helpfileId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create help file
  createHelpFile: async (helpfileData) => {
    try {
      const response = await api.post("/helpfiles", helpfileData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update help file
  updateHelpFile: async (helpfileId, helpfileData) => {
    try {
      const response = await api.put(`/helpfiles/${helpfileId}`, helpfileData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete help file
  deleteHelpFile: async (helpfileId) => {
    try {
      const response = await api.delete(`/helpfiles/${helpfileId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get help file categories
  getHelpCategories: async () => {
    try {
      const response = await api.get("/helpfiles/categories");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Search help files
  searchHelpFiles: async (query) => {
    try {
      const response = await api.get("/helpfiles/search", { params: { query } });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

// Audit Logs API functions
export const auditLogAPI = {
  // Get all audit logs
  getAuditLogs: async () => {
    try {
      const response = await api.get("/audit-logs");
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
  getAuditLogStats: async () => {
    try {
      const response = await api.get("/audit-logs/stats");
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

// Notifications API functions
export const notificationAPI = {
  // Get user notifications
  getUserNotifications: async () => {
    try {
      const response = await api.get("/notifications");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get all notifications (admin)
  getAllNotifications: async () => {
    try {
      const response = await api.get("/notifications/all");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get single notification
  getNotificationById: async (notificationId) => {
    try {
      const response = await api.get(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Create notification
  createNotification: async (notificationData) => {
    try {
      const response = await api.post("/notifications", notificationData);
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

  // Mark all notifications as read
  markAllNotificationsAsRead: async () => {
    try {
      const response = await api.put("/notifications/read-all");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get unread notification count
  getUnreadCount: async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Utility functions
export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const getStatusColor = (status) => {
  const statusColors = {
    active: "green",
    inactive: "red",
    pending: "yellow",
    completed: "blue",
    processing: "purple",
  };

  return statusColors[status.toLowerCase()] || "gray";
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// WebSocket Events API
export const websocketAPI = {
  // Socket instance
  socket: null,

  // Initialize and connect to UHF/RFID namespace with JWT authentication
  connect: (token, onConnect, onDisconnect) => {
    try {
      // Import socket.io-client dynamically to avoid SSR issues
      const io = require('socket.io-client');
      
      // Connect to the UHF namespace with auth token
      websocketAPI.socket = io(`${API_BASE_URL}/uhf`, {
        auth: {
          token
        }
      });

      // Setup event listeners
      websocketAPI.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        if (onConnect) onConnect();
      });

      websocketAPI.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason);
        if (onDisconnect) onDisconnect(reason);
      });

      return websocketAPI.socket;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      throw error;
    }
  },

  // Disconnect from WebSocket server
  disconnect: () => {
    if (websocketAPI.socket) {
      websocketAPI.socket.disconnect();
      websocketAPI.socket = null;
    }
  },

  // Subscribe to RFID tag read events
  onTagRead: (callback) => {
    if (websocketAPI.socket) {
      websocketAPI.socket.on('tag_read', (data) => {
        callback(data);
      });
    } else {
      console.error('WebSocket not connected. Call connect() first.');
    }
  },

  // Subscribe to item movement events
  onItemMoved: (callback) => {
    if (websocketAPI.socket) {
      websocketAPI.socket.on('item_moved', (data) => {
        callback(data);
      });
    } else {
      console.error('WebSocket not connected. Call connect() first.');
    }
  },

  // Subscribe to stock alert events
  onStockAlert: (callback) => {
    if (websocketAPI.socket) {
      websocketAPI.socket.on('stock_alert', (data) => {
        callback(data);
      });
    } else {
      console.error('WebSocket not connected. Call connect() first.');
    }
  },

  // Unsubscribe from an event
  unsubscribe: (eventName) => {
    if (websocketAPI.socket) {
      websocketAPI.socket.off(eventName);
    }
  },
};

export default {
  authAPI,
  userAPI,
  companyAPI,
  inventoryAPI,
  planAPI,
  warehouseAPI,
  zoneAPI,
  shelfAPI,
  binAPI,
  forecastingAPI,
  shipmentAPI,
  systemAPI,
  auditLogAPI,
  notificationAPI,
  helpfileAPI,
  websocketAPI,
  formatDate,
  formatCurrency,
  getStatusColor,
  downloadFile,
};
