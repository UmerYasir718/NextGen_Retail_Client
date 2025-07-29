import api, { API_BASE_URL } from "./apiClient";
import authAPI from "./authAPI";
import userAPI from "./userAPI";
import companyAPI from "./companyAPI";
import warehouseAPI from "./warehouseAPI";
import zoneAPI from "./zoneAPI";
import shelfAPI from "./shelfAPI";
import binAPI from "./binAPI";
import planAPI from "./planAPI";
import inventoryAPI from "./inventoryAPI";
import shipmentAPI from "./shipmentAPI";
import forecastingAPI from "./forecastingAPI";
import systemAPI from "./systemAPI";
import helpfileAPI from "./helpfileAPI";
import auditLogAPI from "./auditLogAPI";
import uhfAPI from "./uhfAPI";
import notificationAPI from "./notificationAPI";
import websocketAPI from "./websocketAPI";

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

// Export all APIs
export {
  api,
  API_BASE_URL,
  authAPI,
  userAPI,
  companyAPI,
  warehouseAPI,
  zoneAPI,
  shelfAPI,
  binAPI,
  planAPI,
  inventoryAPI,
  shipmentAPI,
  forecastingAPI,
  systemAPI,
  helpfileAPI,
  auditLogAPI,
  uhfAPI,
  notificationAPI,
  websocketAPI,
};

// Create a default export object for backward compatibility
const apiHelpers = {
  api,
  API_BASE_URL,
  authAPI,
  userAPI,
  companyAPI,
  warehouseAPI,
  zoneAPI,
  shelfAPI,
  binAPI,
  planAPI,
  inventoryAPI,
  shipmentAPI,
  forecastingAPI,
  systemAPI,
  helpfileAPI,
  auditLogAPI,
  uhfAPI,
  notificationAPI,
  websocketAPI,
  formatDate,
  formatCurrency,
  getStatusColor,
  downloadFile,
};

export default apiHelpers;
