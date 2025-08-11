import { toast } from "react-toastify";

// Base API URL - replace with your actual API URL
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.id || user._id;
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Get low stock items
export const getLowStockItems = async () => {
  try {
    const data = await apiRequest("/inventory/low-stock");
    return data.items || [];
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    toast.error("Failed to fetch low stock items");
    return [];
  }
};

// Get notifications
export const getNotifications = async (page = 1, limit = 20) => {
  try {
    const data = await apiRequest(`/notifications?page=${page}&limit=${limit}`);
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    toast.error("Failed to fetch notifications");
    return { notifications: [], total: 0, page: 1, limit: 20 };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await apiRequest(`/notifications/${notificationId}/read`, {
      method: "PUT",
    });
    return response.success;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    toast.error("Failed to mark notification as read");
    return false;
  }
};

// Update item threshold
export const updateItemThreshold = async (itemId, threshold) => {
  try {
    const data = await apiRequest(`/inventory/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ threshold }),
    });
    toast.success("Threshold updated successfully");
    return data;
  } catch (error) {
    console.error("Error updating item threshold:", error);
    toast.error("Failed to update threshold");
    throw error;
  }
};

// Send FCM token to backend
export const sendTokenToServer = async (token) => {
  try {
    const response = await apiRequest("/fcm-tokens", {
      method: "POST",
      body: JSON.stringify({
        token,
        deviceType: "web",
        userId: getCurrentUserId(),
      }),
    });
    return response.success;
  } catch (error) {
    console.error("Error sending FCM token:", error);
    return false;
  }
};

// Get notification settings
export const getNotificationSettings = async () => {
  try {
    const data = await apiRequest("/notifications/settings");
    return data.settings || {};
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return {};
  }
};

// Update notification settings
export const updateNotificationSettings = async (settings) => {
  try {
    const data = await apiRequest("/notifications/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
    toast.success("Notification settings updated");
    return data;
  } catch (error) {
    console.error("Error updating notification settings:", error);
    toast.error("Failed to update notification settings");
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiRequest("/notifications/mark-all-read", {
      method: "PUT",
    });
    return response.success;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    toast.error("Failed to mark all notifications as read");
    return false;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await apiRequest(`/notifications/${notificationId}`, {
      method: "DELETE",
    });
    toast.success("Notification deleted");
    return response.success;
  } catch (error) {
    console.error("Error deleting notification:", error);
    toast.error("Failed to delete notification");
    return false;
  }
};

// Get notification statistics
export const getNotificationStats = async () => {
  try {
    const data = await apiRequest("/notifications/stats");
    return data.stats || {};
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    return {};
  }
};

// Subscribe to low stock alerts
export const subscribeToLowStockAlerts = async (itemIds) => {
  try {
    const response = await apiRequest("/notifications/subscribe-low-stock", {
      method: "POST",
      body: JSON.stringify({ itemIds }),
    });
    toast.success("Subscribed to low stock alerts");
    return response.success;
  } catch (error) {
    console.error("Error subscribing to low stock alerts:", error);
    toast.error("Failed to subscribe to alerts");
    return false;
  }
};

// Unsubscribe from low stock alerts
export const unsubscribeFromLowStockAlerts = async (itemIds) => {
  try {
    const response = await apiRequest("/notifications/unsubscribe-low-stock", {
      method: "POST",
      body: JSON.stringify({ itemIds }),
    });
    toast.success("Unsubscribed from low stock alerts");
    return response.success;
  } catch (error) {
    console.error("Error unsubscribing from low stock alerts:", error);
    toast.error("Failed to unsubscribe from alerts");
    return false;
  }
};

// Test notification
export const testNotification = async () => {
  try {
    const response = await apiRequest("/notifications/test", {
      method: "POST",
    });
    toast.success("Test notification sent");
    return response.success;
  } catch (error) {
    console.error("Error sending test notification:", error);
    toast.error("Failed to send test notification");
    return false;
  }
};

// Default export for backward compatibility
const notificationAPI = {
  getLowStockItems,
  getNotifications,
  markNotificationAsRead,
  updateItemThreshold,
  sendTokenToServer,
  getNotificationSettings,
  updateNotificationSettings,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStats,
  subscribeToLowStockAlerts,
  unsubscribeFromLowStockAlerts,
  testNotification,
};

export default notificationAPI;
