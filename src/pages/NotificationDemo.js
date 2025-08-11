import React, { useState } from "react";
import { useNotificationContext } from "../contexts/NotificationContext";
import LowStockAlerts from "../components/LowStockAlerts";
import {
  FaBell,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheck,
} from "react-icons/fa";

const NotificationDemo = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refreshData,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    wsConnection,
  } = useNotificationContext();

  const [activeTab, setActiveTab] = useState("all");

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "stock":
        return "text-orange-600 bg-orange-100";
      case "shipment":
        return "text-purple-600 bg-purple-100";
      case "system":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "stock") return notification.type === "Stock";
    if (activeTab === "unread") return !notification.read;
    return true;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Notification System Demo
        </h1>
        <p className="text-gray-600">
          This page demonstrates the real-time notification system with
          WebSocket integration.
        </p>
      </div>

      {/* Connection Status */}
      <div className="mb-6">
        <div
          className={`inline-flex items-center px-4 py-2 rounded-lg ${
            wsConnection
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              wsConnection ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium">
            {wsConnection
              ? "Connected to WebSocket"
              : "Disconnected from WebSocket"}
          </span>
        </div>
        {error && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaBell className="text-blue-500 text-xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-800">
                {notifications.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 text-xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Unread Notifications</p>
              <p className="text-2xl font-bold text-gray-800">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaInfoCircle className="text-green-500 text-xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Connection Status</p>
              <p className="text-2xl font-bold text-gray-800">
                {wsConnection ? "Connected" : "Disconnected"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaCheck className="text-purple-500 text-xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Loading Status</p>
              <p className="text-2xl font-bold text-gray-800">
                {loading ? "Loading" : "Ready"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={refreshData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Refresh Data
        </button>
        <button
          onClick={markAllNotificationsAsRead}
          disabled={unreadCount === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Mark All as Read
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "all", name: "All Notifications" },
              { id: "stock", name: "Stock Alerts" },
              { id: "unread", name: "Unread" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeTab === "all" && "All Notifications"}
            {activeTab === "stock" && "Stock Alerts"}
            {activeTab === "unread" && "Unread Notifications"}
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <FaBell className="text-4xl mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3
                        className={`text-lg font-medium ${
                          !notification.read ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
                          notification.priority
                        )}`}
                      >
                        {notification.priority}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        {notification.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatTimestamp(notification.createdAt)}</span>
                      {!notification.read && (
                        <button
                          onClick={() =>
                            markNotificationAsRead(notification._id)
                          }
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="ml-4">
                      <span className="w-3 h-3 bg-blue-500 rounded-full block"></span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Low Stock Alerts Section */}
      <div className="mt-8">
        <LowStockAlerts />
      </div>
    </div>
  );
};

export default NotificationDemo;
