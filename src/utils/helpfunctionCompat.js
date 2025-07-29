// This file provides backward compatibility for code that uses the old helpfunction.js imports
// It re-exports everything from the new modular API structure

import apiHelpers, {
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
  API_BASE_URL
} from './api';

// Re-export the API_BASE_URL constant
export const API_BASE_URL = API_BASE_URL;

// Re-export all the API objects
export const authAPI = authAPI;
export const userAPI = userAPI;
export const companyAPI = companyAPI;
export const inventoryAPI = inventoryAPI;
export const planAPI = planAPI;
export const warehouseAPI = warehouseAPI;
export const zoneAPI = zoneAPI;
export const shelfAPI = shelfAPI;
export const binAPI = binAPI;
export const forecastingAPI = forecastingAPI;
export const shipmentAPI = shipmentAPI;
export const systemAPI = systemAPI;
export const auditLogAPI = auditLogAPI;
export const notificationAPI = notificationAPI;
export const helpfileAPI = helpfileAPI;
export const websocketAPI = websocketAPI;

// Re-export utility functions
export {
  formatDate,
  formatCurrency,
  getStatusColor,
  downloadFile
};

// Default export for backward compatibility
export default apiHelpers;
