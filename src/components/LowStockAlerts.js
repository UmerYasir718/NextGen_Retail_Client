import React, { useEffect, useState } from "react";
import { useNotificationContext } from "../contexts/NotificationContext";
import { FaExclamationTriangle, FaBox, FaChartLine } from "react-icons/fa";

const LowStockAlerts = () => {
  const { lowStockItems, loading, error, refreshData } =
    useNotificationContext();
  const [lowStockNotifications, setLowStockNotifications] = useState([]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    // Convert low stock items to notification format for backward compatibility
    const notifications = lowStockItems.map((item) => ({
      id: item._id,
      type: "Stock",
      title: "Low Stock Alert",
      message: `${item.name} (${item.sku}) is below threshold`,
      priority: item.quantity === 0 ? "high" : "medium",
      timestamp: new Date().toISOString(),
      quantity: item.quantity,
      threshold: item.threshold,
    }));
    setLowStockNotifications(notifications);
  }, [lowStockItems]);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 border-red-300 text-red-800";
      case "medium":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "low":
        return "bg-blue-100 border-blue-300 text-blue-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getStockLevelColor = (quantity, threshold) => {
    const ratio = quantity / threshold;
    if (ratio <= 0.2) return "text-red-600";
    if (ratio <= 0.5) return "text-yellow-600";
    return "text-blue-600";
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FaExclamationTriangle className="text-red-500 text-xl" />
          <h3 className="text-lg font-semibold text-gray-800">
            Low Stock Alerts
          </h3>
        </div>
        <div className="text-center text-gray-500">Loading alerts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FaExclamationTriangle className="text-red-500 text-xl" />
          <h3 className="text-lg font-semibold text-gray-800">
            Low Stock Alerts
          </h3>
        </div>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FaExclamationTriangle className="text-red-500 text-xl" />
          <h3 className="text-lg font-semibold text-gray-800">
            Low Stock Alerts
          </h3>
        </div>
        <span className="text-sm text-gray-500">
          {lowStockNotifications.length} alert
          {lowStockNotifications.length !== 1 ? "s" : ""}
        </span>
      </div>

      {lowStockNotifications.length === 0 ? (
        <div className="text-center py-8">
          <FaBox className="text-gray-300 text-4xl mx-auto mb-2" />
          <p className="text-gray-500">No low stock alerts</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lowStockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 ${getPriorityColor(
                notification.priority
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                        notification.priority
                      )}`}
                    >
                      {notification.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span
                      className={`font-medium ${getStockLevelColor(
                        notification.quantity,
                        notification.threshold
                      )}`}
                    >
                      Stock: {notification.quantity}/{notification.threshold}
                    </span>
                    <span className="text-gray-500">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                </div>
                <FaChartLine className="text-gray-400 text-lg" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts;
