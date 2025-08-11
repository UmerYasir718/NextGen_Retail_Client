import React, { useState, useEffect } from "react";
import {
  FaExclamationTriangle,
  FaExclamationCircle,
  FaEdit,
  FaEye,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import {
  getLowStockItems,
  updateItemThreshold,
} from "../../utils/api/notificationAPI";
import LowStockAlert from "./LowStockAlert";

const LowStockWidget = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newThreshold, setNewThreshold] = useState("");

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    setLoading(true);
    try {
      const items = await getLowStockItems();
      setLowStockItems(items);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateThreshold = (item) => {
    setSelectedItem(item);
    setNewThreshold(item.threshold.toString());
    setUpdateModalVisible(true);
  };

  const handleThresholdUpdate = async () => {
    if (!selectedItem || !newThreshold) return;

    try {
      await updateItemThreshold(selectedItem._id, parseInt(newThreshold));
      setUpdateModalVisible(false);
      setSelectedItem(null);
      setNewThreshold("");
      fetchLowStockItems(); // Refresh the list
    } catch (error) {
      console.error("Error updating threshold:", error);
    }
  };

  const handleViewDetails = (item) => {
    // Navigate to inventory item details
    console.log("Navigate to inventory item:", item._id);
  };

  const criticalItems = lowStockItems.filter((item) => item.quantity === 0);
  const warningItems = lowStockItems.filter((item) => item.quantity > 0);

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Low Stock Alerts
          </h2>
          <button
            onClick={fetchLowStockItems}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Refresh"
          >
            <div
              className={`w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full ${
                loading ? "animate-spin" : ""
              }`}
            ></div>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">
                  Critical (Out of Stock)
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {criticalItems.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FaExclamationCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">
                  Warning (Low Stock)
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {warningItems.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaExclamationTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Items List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading low stock items...</p>
            </div>
          ) : lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPlus className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-500">No low stock items</p>
              <p className="text-sm text-gray-400">
                All items are above their threshold levels
              </p>
            </div>
          ) : (
            lowStockItems.map((item) => (
              <LowStockAlert
                key={item._id}
                item={item}
                onViewDetails={handleViewDetails}
                onUpdateThreshold={handleUpdateThreshold}
              />
            ))
          )}
        </div>

        {/* View All Button */}
        {lowStockItems.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                // Navigate to full low stock page
                console.log("Navigate to low stock page");
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All Low Stock Items
            </button>
          </div>
        )}
      </div>

      {/* Update Threshold Modal */}
      {updateModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Threshold
              </h3>
              <button
                onClick={() => setUpdateModalVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Update threshold for <strong>{selectedItem?.name}</strong>
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Current Stock:</span>
                  <p className="font-medium">{selectedItem?.quantity}</p>
                </div>
                <div>
                  <span className="text-gray-500">Current Threshold:</span>
                  <p className="font-medium">{selectedItem?.threshold}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Threshold
              </label>
              <input
                type="number"
                min="0"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new threshold"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setUpdateModalVisible(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleThresholdUpdate}
                disabled={!newThreshold || parseInt(newThreshold) < 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LowStockWidget;
