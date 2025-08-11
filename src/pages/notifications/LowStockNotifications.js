import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNotifications } from "../../contexts/NotificationContext";
import LowStockWidget from "../../components/notifications/LowStockWidget";
import LowStockAlert from "../../components/notifications/LowStockAlert";
import {
  FaBell,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaPlay,
  FaStop,
} from "react-icons/fa";
import { testNotification } from "../../utils/api/notificationAPI";

const LowStockNotifications = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);
  const {
    lowStockItems,
    criticalItems,
    warningItems,
    simulateLowStockAlert,
    refreshData,
    loading,
  } = useNotifications();

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationInterval, setSimulationInterval] = useState(null);

  // Sample items for simulation
  const sampleItems = [
    {
      _id: "item-1",
      name: "Laptop Charger",
      sku: "LAP-CHRG-001",
      quantity: 0,
      threshold: 10,
    },
    {
      _id: "item-2",
      name: "Wireless Mouse",
      sku: "WIRE-MOUSE-002",
      quantity: 5,
      threshold: 15,
    },
    {
      _id: "item-3",
      name: "USB Cable",
      sku: "USB-CABLE-003",
      quantity: 3,
      threshold: 20,
    },
    {
      _id: "item-4",
      name: "Monitor Stand",
      sku: "MON-STAND-004",
      quantity: 8,
      threshold: 12,
    },
  ];

  const startSimulation = () => {
    setIsSimulating(true);
    const interval = setInterval(() => {
      const randomItem =
        sampleItems[Math.floor(Math.random() * sampleItems.length)];
      const simulatedItem = {
        ...randomItem,
        quantity: Math.floor(Math.random() * 5), // Random low quantity
      };
      simulateLowStockAlert(simulatedItem);
    }, 5000); // Simulate every 5 seconds
    setSimulationInterval(interval);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
  };

  const handleTestNotification = async () => {
    try {
      await testNotification();
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  };

  const handleViewDetails = (item) => {
    console.log("Navigate to inventory item:", item._id);
  };

  const handleUpdateThreshold = (item) => {
    console.log("Update threshold for item:", item._id);
  };

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Low Stock Notifications
        </h1>
        <p className="text-gray-600">
          Monitor and manage low stock alerts in real-time
        </p>
      </div>

      {/* Company Selection Notice for Super Admin */}
      {user?.role === "super_admin" && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <span className="text-blue-500 text-xl mr-2">ℹ️</span>
            <div>
              <p className="font-medium text-blue-700">
                {selectedCompany
                  ? `Managing low stock notifications for: ${selectedCompany.name}`
                  : "Please select a company from the dropdown in the header to manage specific notifications"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <div
            className={`w-4 h-4 border-2 border-white border-t-transparent rounded-full ${
              loading ? "animate-spin" : ""
            }`}
          ></div>
          <span>Refresh Data</span>
        </button>

        <button
          onClick={handleTestNotification}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <FaBell />
          <span>Send Test Notification</span>
        </button>

        {!isSimulating ? (
          <button
            onClick={startSimulation}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <FaPlay />
            <span>Start Simulation</span>
          </button>
        ) : (
          <button
            onClick={stopSimulation}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaStop />
            <span>Stop Simulation</span>
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Low Stock Items
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {lowStockItems.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">📦</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Critical (Out of Stock)
              </p>
              <p className="text-2xl font-bold text-red-900">
                {criticalItems.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-500">
              <FaExclamationCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Warning (Low Stock)
              </p>
              <p className="text-2xl font-bold text-yellow-900">
                {warningItems.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <FaExclamationTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Simulation Status
              </p>
              <p
                className={`text-lg font-bold ${
                  isSimulating ? "text-green-600" : "text-gray-600"
                }`}
              >
                {isSimulating ? "Running" : "Stopped"}
              </p>
            </div>
            <div
              className={`p-3 rounded-full ${
                isSimulating
                  ? "bg-green-100 text-green-500"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {isSimulating ? (
                <FaPlay className="w-6 h-6" />
              ) : (
                <FaStop className="w-6 h-6" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Widget */}
        <div>
          <LowStockWidget />
        </div>

        {/* Individual Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Individual Alerts
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading alerts...</p>
            </div>
          ) : lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBell className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-500">No low stock alerts</p>
              <p className="text-sm text-gray-400">
                All items are above their threshold levels
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <LowStockAlert
                  key={item._id}
                  item={item}
                  onViewDetails={handleViewDetails}
                  onUpdateThreshold={handleUpdateThreshold}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Simulation Info */}
      {isSimulating && (
        <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-orange-500 mr-2" />
            <div>
              <h3 className="font-medium text-orange-800">Simulation Active</h3>
              <p className="text-sm text-orange-600">
                Low stock alerts are being simulated every 5 seconds. Check the
                notification bell in the header for real-time updates.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockNotifications;
