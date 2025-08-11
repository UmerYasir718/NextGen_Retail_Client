import { toast } from "react-toastify";

// WebSocket connection for real-time notifications
class NotificationWebSocket {
  constructor(companyId, userId) {
    this.companyId = companyId;
    this.userId = userId;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.handlers = {
      lowStockAlert: null,
      newNotification: null,
      uhfLowStock: null,
    };
  }

  connect() {
    try {
      // For now, we'll use a mock WebSocket connection
      // In production, replace with actual socket.io connection
      this.socket = {
        on: (event, callback) => {
          if (event === "connect") {
            console.log("Connected to notification server");
            this.reconnectAttempts = 0;
          } else if (event === "disconnect") {
            console.log("Disconnected from notification server");
            this.handleReconnection();
          } else if (event === "low-stock-alert") {
            this.handlers.lowStockAlert = callback;
          } else if (event === "new_notification") {
            this.handlers.newNotification = callback;
          } else if (event === "uhf-low-stock") {
            this.handlers.uhfLowStock = callback;
          }
        },
        emit: (event, data) => {
          console.log(`Emitting ${event}:`, data);
        },
        disconnect: () => {
          console.log("Disconnected from WebSocket");
        },
      };

      this.setupEventListeners();
    } catch (error) {
      console.error("WebSocket connection failed:", error);
    }
  }

  setupEventListeners() {
    // Connection events
    this.socket.on("connect", () => {
      console.log("Connected to notification server");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from notification server");
      this.handleReconnection();
    });

    // Low stock notifications
    this.socket.on("low-stock-alert", (data) => {
      this.handleLowStockAlert(data);
    });

    // General notifications
    this.socket.on("new_notification", (data) => {
      this.handleNewNotification(data);
    });

    // UHF-specific notifications
    this.socket.on("uhf-low-stock", (data) => {
      this.handleUHFLowStock(data);
    });
  }

  handleLowStockAlert(data) {
    const { item, companyId, timestamp } = data;

    // Update local state
    this.updateInventoryState(item);

    // Show notification
    this.showNotification({
      title: "Low Stock Alert",
      message: `${item.name} (${item.sku}) is below threshold`,
      type: "warning",
      priority: item.quantity === 0 ? "high" : "medium",
    });

    // Trigger UI updates
    this.triggerUIUpdate();
  }

  handleNewNotification(data) {
    const { notification } = data;

    // Add to notifications list
    this.addToNotificationsList(notification);

    // Show toast/alert
    this.showToast(notification);
  }

  handleUHFLowStock(data) {
    const { item, readerId, timestamp } = data;

    // Handle UHF-specific low stock alerts
    this.handleLowStockAlert({
      item,
      source: "UHF",
      readerId,
      timestamp,
    });
  }

  updateInventoryState(item) {
    // This will be overridden by the component using this class
    console.log("Updating inventory state:", item);
  }

  showNotification(notification) {
    toast.warning(notification.message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  showToast(notification) {
    toast.info(notification.message, {
      position: "top-right",
      autoClose: 3000,
    });
  }

  triggerUIUpdate() {
    // This will be overridden by the component using this class
    console.log("Triggering UI update");
  }

  addToNotificationsList(notification) {
    // This will be overridden by the component using this class
    console.log("Adding to notifications list:", notification);
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, 1000 * Math.pow(2, this.reconnectAttempts)); // Exponential backoff
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Method to simulate low stock alerts for testing
  simulateLowStockAlert(item) {
    const mockData = {
      item: {
        _id: item._id || "test-item",
        name: item.name || "Test Item",
        sku: item.sku || "TEST001",
        quantity: item.quantity || 5,
        threshold: item.threshold || 10,
      },
      companyId: this.companyId,
      timestamp: new Date().toISOString(),
    };

    this.handleLowStockAlert(mockData);
  }
}

export default NotificationWebSocket;
