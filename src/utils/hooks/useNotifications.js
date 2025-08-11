import { useState, useEffect, useCallback } from "react";
import websocketAPI from "../api/websocketAPI";
import notificationAPI from "../api/notificationAPI";

const useNotifications = (serverUrl) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connect = useCallback(
    async (token) => {
      try {
        setError(null);
        setLoading(true);

        // Connect to notification socket with new configuration
        const socket = websocketAPI.connectNotifications(
          token,
          () => {
            setIsConnected(true);
            // Subscribe to notifications after connection
            if (websocketAPI.notificationSocket) {
              websocketAPI.notificationSocket.emit("subscribe_notifications");
            }
          },
          () => {
            setIsConnected(false);
          }
        );

        // Subscribe to notification events
        websocketAPI.onUnreadCount((data) => {
          setUnreadCount(data.count);
        });

        websocketAPI.onRecentNotifications((data) => {
          setNotifications(data.notifications || []);
        });

        websocketAPI.onNewNotification((notification) => {
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        });

        // Load initial data
        const [notificationsResponse, unreadResponse] = await Promise.all([
          notificationAPI.getNotifications({ limit: 20 }),
          notificationAPI.getUnreadCount(),
        ]);

        if (notificationsResponse.success) {
          setNotifications(notificationsResponse.data.notifications || []);
        }

        if (unreadResponse.success) {
          setUnreadCount(unreadResponse.data.count || 0);
        }
      } catch (error) {
        console.error("Error connecting to notifications:", error);
        setError(error.message || "Failed to connect to notifications");
      } finally {
        setLoading(false);
      }
    },
    [serverUrl]
  );

  const disconnect = useCallback(() => {
    websocketAPI.disconnect();
    setIsConnected(false);
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        // Mark via socket
        if (websocketAPI.notificationSocket) {
          websocketAPI.notificationSocket.emit("mark_read", { notificationId });
        }

        // Mark via API
        await notificationAPI.markAsRead(notificationId);

        // Update local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
        setError(error.message || "Failed to mark notification as read");
      }
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
      setError(error.message || "Failed to mark all notifications as read");
    }
  }, []);

  const loadNotifications = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        const response = await notificationAPI.getNotifications(params);
        if (response.success) {
          setNotifications(response.data.notifications || []);
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
        setError(error.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadLowStockNotifications = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        const response = await notificationAPI.getLowStockNotifications(params);
        if (response.success) {
          setNotifications(response.data.notifications || []);
        }
      } catch (error) {
        console.error("Error loading low stock notifications:", error);
        setError(error.message || "Failed to load low stock notifications");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      websocketAPI.disconnect();
    };
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    loading,
    error,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    loadNotifications,
    loadLowStockNotifications,
  };
};

export default useNotifications; 