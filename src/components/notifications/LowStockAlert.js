import React from "react";
import {
  FaExclamationTriangle,
  FaExclamationCircle,
  FaEye,
  FaEdit,
} from "react-icons/fa";

const LowStockAlert = ({ item, onViewDetails, onUpdateThreshold }) => {
  const isCritical = item.quantity === 0;
  const alertType = isCritical ? "error" : "warning";
  const Icon = isCritical ? FaExclamationCircle : FaExclamationTriangle;

  return (
    <div
      className={`bg-white rounded-lg border-l-4 border-${
        alertType === "error" ? "red" : "yellow"
      }-500 p-4 mb-4 shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div
            className={`p-2 rounded-full ${
              alertType === "error"
                ? "bg-red-100 text-red-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4
                className={`font-semibold text-lg ${
                  alertType === "error" ? "text-red-800" : "text-yellow-800"
                }`}
              >
                {item.name}
              </h4>
              <span className="text-sm text-gray-500">(SKU: {item.sku})</span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Current Stock:</span>{" "}
              {item.quantity} |
              <span className="font-medium ml-2">Threshold:</span>{" "}
              {item.threshold}
            </div>
            <div className="text-xs text-gray-500">
              {isCritical
                ? "Item is out of stock!"
                : "Item is below threshold level"}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(item)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <FaEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onUpdateThreshold(item)}
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
            title="Update Threshold"
          >
            <FaEdit className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert;
