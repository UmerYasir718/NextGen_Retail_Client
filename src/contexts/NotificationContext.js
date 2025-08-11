import React, { createContext, useContext, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import NotificationWebSocket from "../utils/notificationWebSocket";
import {
  getLowStockItems,
  getNotifications,
} from "../utils/api/notificationAPI";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

// Backward compatibility export
export const useNotificationContext = useNotifications;

export const NotificationProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  const [notifications, setNotifications] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [wsConnection, setWsConnection] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize WebSocket connection
  useEffect(() => {
    if (user && selectedCompany) {
      const ws = new NotificationWebSocket(selectedCompany.id, user.id);

      // Override handlers to update state
      ws.updateInventoryState = (item) => {
        setLowStockItems((prev) => {
          const existing = prev.find((i) => i._id === item._id);
          if (existing) {
            return prev.map((i) => (i._id === item._id ? item : i));
          } else {
            return [...prev, item];
          }
        });
      };

      ws.addToNotificationsList = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        if (!notification.read) {
          setUnreadCount((prev) => prev + 1);
        }
      };

      ws.triggerUIUpdate = () => {
        // Trigger any UI updates needed
        console.log("UI update triggered");
      };

      ws.connect();
      setWsConnection(ws);

      return () => {
        ws.disconnect();
      };
    }
  }, [user, selectedCompany]);

  // Fetch initial data
  useEffect(() => {
    if (user && selectedCompany) {
      fetchInitialData();
    }
  }, [user, selectedCompany]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch low stock items
      const lowStockData = await getLowStockItems();
      setLowStockItems(lowStockData);

      // Fetch notifications
      const notificationData = await getNotifications(1, 20);
      setNotifications(notificationData.notifications || []);
      setUnreadCount(
        (notificationData.notifications || []).filter((n) => !n.read).length
      );
    } catch (error) {
      console.error("Error fetching initial notification data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add low stock item
  const addLowStockItem = (item) => {
    setLowStockItems((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) => (i._id === item._id ? item : i));
      } else {
        return [...prev, item];
      }
    });
  };

  // Remove low stock item
  const removeLowStockItem = (itemId) => {
    setLowStockItems((prev) => prev.filter((item) => item._id !== itemId));
  };

  // Add notification
  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Remove notification
  const removeNotification = (notificationId) => {
    const notification = notifications.find((n) => n._id === notificationId);
    setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    if (notification && !notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Simulate low stock alert (for testing)
  const simulateLowStockAlert = (item) => {
    if (wsConnection) {
      wsConnection.simulateLowStockAlert(item);
    }
  };

  // Refresh data
  const refreshData = () => {
    fetchInitialData();
  };

  const value = {
    // State
    notifications,
    lowStockItems,
    unreadCount,
    loading,
    wsConnection,

    // Actions
    addLowStockItem,
    removeLowStockItem,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    simulateLowStockAlert,
    refreshData,

    // Computed values
    criticalItems: lowStockItems.filter((item) => item.quantity === 0),
    warningItems: lowStockItems.filter((item) => item.quantity > 0),
    unreadNotifications: notifications.filter((n) => !n.read),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
