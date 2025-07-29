import { API_BASE_URL } from "./apiClient";

const websocketAPI = {
  // Socket instance
  socket: null,

  // Initialize and connect to UHF/RFID namespace with JWT authentication
  connect: (token, onConnect, onDisconnect) => {
    try {
      // Import socket.io-client dynamically to avoid SSR issues
      const io = require("socket.io-client");

      // Connect to the UHF namespace with auth token
      websocketAPI.socket = io(`${API_BASE_URL}/uhf`, {
        auth: {
          token,
        },
      });

      // Setup event listeners
      websocketAPI.socket.on("connect", () => {
        console.log("Connected to WebSocket server");
        if (onConnect) onConnect();
      });

      websocketAPI.socket.on("disconnect", (reason) => {
        console.log("Disconnected from WebSocket server:", reason);
        if (onDisconnect) onDisconnect(reason);
      });

      return websocketAPI.socket;
    } catch (error) {
      console.error("WebSocket connection error:", error);
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
      websocketAPI.socket.on("tag_read", (data) => {
        callback(data);
      });
    } else {
      console.error("WebSocket not connected. Call connect() first.");
    }
  },

  // Subscribe to item movement events
  onItemMoved: (callback) => {
    if (websocketAPI.socket) {
      websocketAPI.socket.on("item_moved", (data) => {
        callback(data);
      });
    } else {
      console.error("WebSocket not connected. Call connect() first.");
    }
  },

  // Subscribe to stock alert events
  onStockAlert: (callback) => {
    if (websocketAPI.socket) {
      websocketAPI.socket.on("stock_alert", (data) => {
        callback(data);
      });
    } else {
      console.error("WebSocket not connected. Call connect() first.");
    }
  },

  // Unsubscribe from an event
  unsubscribe: (eventName) => {
    if (websocketAPI.socket) {
      websocketAPI.socket.off(eventName);
    }
  },
};

export default websocketAPI;
