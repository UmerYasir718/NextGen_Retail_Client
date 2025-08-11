import { API_BASE_URL } from "./apiClient";

const websocketAPI = {
  // Socket instances
  uhfSocket: null,
  notificationSocket: null,

  // Initialize and connect to UHF/RFID namespace with JWT authentication
  connectUHF: (token, onConnect, onDisconnect) => {
    try {
      // Import socket.io-client dynamically to avoid SSR issues
      const io = require("socket.io-client");

      // Get company ID from user
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Connect to the UHF namespace with auth token and company ID
      websocketAPI.uhfSocket = io(API_BASE_URL, {
        path: "/socket.io/",
        auth: {
          token,
          companyId: user.companyId,
        },
        transports: ["websocket", "polling"],
      });

      // Setup event listeners
      websocketAPI.uhfSocket.on("connect", () => {
        console.log("Connected to UHF WebSocket server");
        if (onConnect) onConnect();
      });

      websocketAPI.uhfSocket.on("disconnect", (reason) => {
        console.log("Disconnected from UHF WebSocket server:", reason);
        if (onDisconnect) onDisconnect(reason);
      });

      return websocketAPI.uhfSocket;
    } catch (error) {
      console.error("UHF WebSocket connection error:", error);
      throw error;
    }
  },

  // Initialize and connect to notifications namespace with JWT authentication
  connectNotifications: (token, onConnect, onDisconnect) => {
    try {
      // Import socket.io-client dynamically to avoid SSR issues
      const io = require("socket.io-client");

      // Get company ID from user
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Connect to the notifications namespace with auth token and company ID
      websocketAPI.notificationSocket = io(API_BASE_URL, {
        path: "/socket.io/",
        auth: {
          token,
          companyId: user.companyId,
        },
        transports: ["websocket", "polling"],
      });

      // Setup event listeners
      websocketAPI.notificationSocket.on("connect", () => {
        console.log("Connected to Notifications WebSocket server");
        if (onConnect) onConnect();
      });

      websocketAPI.notificationSocket.on("disconnect", (reason) => {
        console.log(
          "Disconnected from Notifications WebSocket server:",
          reason
        );
        if (onDisconnect) onDisconnect(reason);
      });

      return websocketAPI.notificationSocket;
    } catch (error) {
      console.error("Notifications WebSocket connection error:", error);
      throw error;
    }
  },

  // Disconnect from WebSocket servers
  disconnect: () => {
    if (websocketAPI.uhfSocket) {
      websocketAPI.uhfSocket.disconnect();
      websocketAPI.uhfSocket = null;
    }
    if (websocketAPI.notificationSocket) {
      websocketAPI.notificationSocket.disconnect();
      websocketAPI.notificationSocket = null;
    }
  },

  // Subscribe to RFID tag read events
  onTagRead: (callback) => {
    if (websocketAPI.uhfSocket) {
      websocketAPI.uhfSocket.on("tag_read", (data) => {
        callback(data);
      });
    } else {
      console.error("UHF WebSocket not connected. Call connectUHF() first.");
    }
  },

  // Subscribe to item movement events
  onItemMoved: (callback) => {
    if (websocketAPI.uhfSocket) {
      websocketAPI.uhfSocket.on("item_moved", (data) => {
        callback(data);
      });
    } else {
      console.error("UHF WebSocket not connected. Call connectUHF() first.");
    }
  },

  // Subscribe to stock alert events
  onStockAlert: (callback) => {
    if (websocketAPI.uhfSocket) {
      websocketAPI.uhfSocket.on("stock_alert", (data) => {
        callback(data);
      });
    } else {
      console.error("UHF WebSocket not connected. Call connectUHF() first.");
    }
  },

  // Subscribe to unread count updates
  onUnreadCount: (callback) => {
    if (websocketAPI.notificationSocket) {
      websocketAPI.notificationSocket.on("unread_count", (data) => {
        callback(data);
      });
    } else {
      console.error(
        "Notification WebSocket not connected. Call connectNotifications() first."
      );
    }
  },

  // Subscribe to recent notifications
  onRecentNotifications: (callback) => {
    if (websocketAPI.notificationSocket) {
      websocketAPI.notificationSocket.on("recent_notifications", (data) => {
        callback(data);
      });
    } else {
      console.error(
        "Notification WebSocket not connected. Call connectNotifications() first."
      );
    }
  },

  // Subscribe to new notification
  onNewNotification: (callback) => {
    if (websocketAPI.notificationSocket) {
      websocketAPI.notificationSocket.on("new_notification", (notification) => {
        callback(notification);
      });
    } else {
      console.error(
        "Notification WebSocket not connected. Call connectNotifications() first."
      );
    }
  },

  // Unsubscribe from an event
  unsubscribe: (eventName, socketType = "uhf") => {
    const socket =
      socketType === "notifications"
        ? websocketAPI.notificationSocket
        : websocketAPI.uhfSocket;
    if (socket) {
      socket.off(eventName);
    }
  },

  // Legacy methods for backward compatibility
  connect: (token, onConnect, onDisconnect) => {
    return websocketAPI.connectUHF(token, onConnect, onDisconnect);
  },
};

export default websocketAPI;
