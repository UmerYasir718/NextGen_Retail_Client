import React, { useState } from "react";
import { useSelector } from "react-redux";
import { usePlan } from "../utils/hooks/usePlan";
import FeatureGuard from "../components/FeatureGuard";
import PlanLimitModal from "../components/PlanLimitModal";
import PlanStatus from "../components/PlanStatus";
import {
  FaUsers,
  FaWarehouse,
  FaBoxes,
  FaChartLine,
  FaFileAlt,
} from "react-icons/fa";

const ExamplePlanIntegration = () => {
  const { user } = useSelector((state) => state.auth);
  const {
    plan,
    hasFeature,
    canAdd,
    getUsagePercentage,
    isNearLimit,
    isTrial,
    isExpired,
    getTrialDaysRemaining,
  } = usePlan();

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitResource, setLimitResource] = useState(null);

  // Example function to check if user can add a resource
  const handleAddResource = (resourceType) => {
    if (canAdd(resourceType)) {
      // Proceed with adding resource
      console.log(`Adding ${resourceType}...`);
    } else {
      // Show limit modal
      setLimitResource(resourceType);
      setShowLimitModal(true);
    }
  };

  // Example function to get current usage for a resource
  const getCurrentUsage = (resourceType) => {
    switch (resourceType) {
      case "users":
        return plan?.usage?.users?.current || 0;
      case "warehouses":
        return plan?.usage?.warehouses?.current || 0;
      case "inventory":
        return plan?.usage?.inventory?.current || 0;
      default:
        return 0;
    }
  };

  const getResourceLimit = (resourceType) => {
    switch (resourceType) {
      case "users":
        return plan?.usage?.users?.limit || 0;
      case "warehouses":
        return plan?.usage?.warehouses?.limit || 0;
      case "inventory":
        return plan?.usage?.inventory?.limit || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Plan Management Integration Example
      </h1>

      {/* Plan Status Component */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Current Plan Status
        </h2>
        <PlanStatus />
      </div>

      {/* Plan Information Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Plan Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Plan Details
          </h3>
          {plan ? (
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Plan Name:</span>
                <p className="font-medium">{plan.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Status:</span>
                <p className="font-medium">
                  {isExpired() ? "Expired" : isTrial() ? "Trial" : "Active"}
                </p>
              </div>
              {isTrial() && (
                <div>
                  <span className="text-sm text-gray-600">Days Remaining:</span>
                  <p className="font-medium text-orange-600">
                    {getTrialDaysRemaining()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No plan information available</p>
          )}
        </div>

        {/* Usage Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Usage Statistics
          </h3>
          <div className="space-y-4">
            {["users", "warehouses", "inventory"].map((resource) => (
              <div key={resource} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {resource === "users" && (
                    <FaUsers className="text-blue-500" />
                  )}
                  {resource === "warehouses" && (
                    <FaWarehouse className="text-green-500" />
                  )}
                  {resource === "inventory" && (
                    <FaBoxes className="text-purple-500" />
                  )}
                  <span className="text-sm font-medium capitalize">
                    {resource}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {getCurrentUsage(resource)} / {getResourceLimit(resource)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(getUsagePercentage(resource))}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Access */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Feature Access
          </h3>
          <div className="space-y-3">
            {[
              {
                key: "ai_forecasting",
                label: "AI Forecasting",
                icon: FaChartLine,
              },
              {
                key: "advanced_reporting",
                label: "Advanced Reporting",
                icon: FaFileAlt,
              },
              {
                key: "multiple_warehouses",
                label: "Multiple Warehouses",
                icon: FaWarehouse,
              },
              { key: "multiple_users", label: "Multiple Users", icon: FaUsers },
            ].map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.key}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent
                      className={
                        hasFeature(feature.key)
                          ? "text-green-500"
                          : "text-gray-400"
                      }
                    />
                    <span className="text-sm">{feature.label}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      hasFeature(feature.key)
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {hasFeature(feature.key) ? "Available" : "Premium"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Resource Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleAddResource("users")}
            className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
              canAdd("users")
                ? "border-blue-300 hover:border-blue-400 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <div className="text-center">
              <FaUsers
                className={`mx-auto text-2xl mb-2 ${
                  canAdd("users") ? "text-blue-500" : "text-gray-400"
                }`}
              />
              <p className="font-medium">Add User</p>
              <p className="text-sm text-gray-500">
                {canAdd("users") ? "Available" : "Limit reached"}
              </p>
            </div>
          </button>

          <button
            onClick={() => handleAddResource("warehouses")}
            className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
              canAdd("warehouses")
                ? "border-green-300 hover:border-green-400 bg-green-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <div className="text-center">
              <FaWarehouse
                className={`mx-auto text-2xl mb-2 ${
                  canAdd("warehouses") ? "text-green-500" : "text-gray-400"
                }`}
              />
              <p className="font-medium">Add Warehouse</p>
              <p className="text-sm text-gray-500">
                {canAdd("warehouses") ? "Available" : "Limit reached"}
              </p>
            </div>
          </button>

          <button
            onClick={() => handleAddResource("inventory")}
            className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
              canAdd("inventory")
                ? "border-purple-300 hover:border-purple-400 bg-purple-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <div className="text-center">
              <FaBoxes
                className={`mx-auto text-2xl mb-2 ${
                  canAdd("inventory") ? "text-purple-500" : "text-gray-400"
                }`}
              />
              <p className="font-medium">Add Inventory</p>
              <p className="text-sm text-gray-500">
                {canAdd("inventory") ? "Available" : "Limit reached"}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Feature Guard Examples */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            AI Forecasting Feature
          </h3>
          <FeatureGuard feature="ai_forecasting">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">
                AI Forecasting Dashboard
              </h4>
              <p className="text-green-700">
                This feature is available in your plan. You can access advanced
                AI-powered forecasting tools.
              </p>
              <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Access AI Forecasting
              </button>
            </div>
          </FeatureGuard>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Advanced Reporting Feature
          </h3>
          <FeatureGuard feature="advanced_reporting">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">
                Advanced Reporting Tools
              </h4>
              <p className="text-blue-700">
                This feature is available in your plan. You can generate
                detailed reports and analytics.
              </p>
              <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Access Reports
              </button>
            </div>
          </FeatureGuard>
        </div>
      </div>

      {/* Plan Limit Modal */}
      <PlanLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        resourceType={limitResource}
        currentUsage={limitResource ? getCurrentUsage(limitResource) : 0}
        limit={limitResource ? getResourceLimit(limitResource) : 0}
      />
    </div>
  );
};

export default ExamplePlanIntegration;
