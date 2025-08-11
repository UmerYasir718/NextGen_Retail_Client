import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  FaCrown,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUsers,
  FaWarehouse,
  FaBoxes,
  FaChartLine,
  FaFileAlt,
} from "react-icons/fa";
import { refreshCurrentPlan } from "../redux/slices/authSlice";

const PlanStatus = () => {
  const { plan, isPlanExpired } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Refresh plan data when component mounts
  useEffect(() => {
    const refreshPlan = async () => {
      try {
        console.log("Refreshing plan data in PlanStatus component...");
        const result = await dispatch(refreshCurrentPlan());
        console.log("Plan refresh result:", result);
      } catch (error) {
        console.error("Error refreshing plan in PlanStatus:", error);
      }
    };

    // Only refresh if we have a plan and user is not super admin
    if (plan && user?.role !== "super_admin") {
      refreshPlan();
    }
  }, [dispatch, plan, user?.role]);

  // Debug: Log current plan data
  useEffect(() => {
    if (plan) {
      console.log("Current plan data in PlanStatus:", {
        id: plan._id,
        name: plan.name,
        isExpired: plan.isExpired,
        isTrialPeriod: plan.isTrialPeriod,
        isActive: plan.isActive,
        daysRemaining: plan.daysRemaining,
      });
    }
  }, [plan]);

  // Don't show for super admin
  if (user?.role === "super_admin") {
    return null;
  }

  if (!plan) {
    return null;
  }

  const {
    name,
    isTrialPeriod,
    isExpired,
    daysRemaining,
    limits,
    usage,
    features = [],
  } = plan;

  // Calculate usage percentages
  const userPercentage = usage?.users
    ? (usage.users.current / usage.users.limit) * 100
    : 0;
  const warehousePercentage = usage?.warehouses
    ? (usage.warehouses.current / usage.warehouses.limit) * 100
    : 0;
  const inventoryPercentage = usage?.inventory
    ? (usage.inventory.current / usage.inventory.limit) * 100
    : 0;

  // Determine plan status
  const getPlanStatus = () => {
    if (isExpired)
      return {
        type: "expired",
        icon: FaExclamationTriangle,
        color: "text-red-600",
        bgColor: "bg-red-50",
      };
    if (isTrialPeriod)
      return {
        type: "trial",
        icon: FaClock,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      };
    return {
      type: "active",
      icon: FaCheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    };
  };

  const status = getPlanStatus();
  const StatusIcon = status.icon;

  return (
    <div
      className={`${status.bgColor} border border-gray-200 rounded-xl p-6 mb-6 shadow-sm`}
    >
      {/* Plan Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-yellow-100">
            <FaCrown className="text-yellow-600 text-2xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <StatusIcon className={`${status.color} text-base`} />
              <span className={`text-sm font-semibold ${status.color}`}>
                {status.type === "expired" && "Plan Expired"}
                {status.type === "trial" &&
                  `Trial - ${daysRemaining} days remaining`}
                {status.type === "active" && "Active Plan"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Refresh Button */}
          <button
            onClick={() => dispatch(refreshCurrentPlan())}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="Refresh Plan Status"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {status.type === "trial" && (
            <Link
              to="/plans"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Upgrade Plan
            </Link>
          )}

          {status.type === "expired" && (
            <Link
              to="/plans"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Renew Plan
            </Link>
          )}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Users Usage */}
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <FaUsers className="text-blue-600 text-lg" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Users</span>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {usage?.users?.current || 0}/{usage?.users?.limit || 0}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                userPercentage > 90
                  ? "bg-red-500"
                  : userPercentage > 75
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(userPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round(userPercentage)}% used
          </p>
        </div>

        {/* Warehouses Usage */}
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-100">
                <FaWarehouse className="text-green-600 text-lg" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                Warehouses
              </span>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {usage?.warehouses?.current || 0}/{usage?.warehouses?.limit || 0}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                warehousePercentage > 90
                  ? "bg-red-500"
                  : warehousePercentage > 75
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(warehousePercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round(warehousePercentage)}% used
          </p>
        </div>

        {/* Inventory Usage */}
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <FaBoxes className="text-purple-600 text-lg" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                Inventory
              </span>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {usage?.inventory?.current || 0}/{usage?.inventory?.limit || 0}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                inventoryPercentage > 90
                  ? "bg-red-500"
                  : inventoryPercentage > 75
                  ? "bg-yellow-500"
                  : "bg-purple-500"
              }`}
              style={{ width: `${Math.min(inventoryPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round(inventoryPercentage)}% used
          </p>
        </div>
      </div>

      {/* Plan Features */}
      {features.length > 0 && (
        <div className="bg-white rounded-lg p-3 border">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Plan Features
          </h4>
          <div className="flex flex-wrap gap-2">
            {features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Warning Messages */}
      {status.type === "expired" && (
        <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <FaExclamationTriangle className="text-red-600" />
            <span className="text-sm text-red-800 font-medium">
              Your plan has expired. Some features may be limited. Please renew
              your plan to continue.
            </span>
          </div>
        </div>
      )}

      {status.type === "trial" && daysRemaining <= 7 && (
        <div className="mt-3 p-3 bg-orange-100 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <FaClock className="text-orange-600" />
            <span className="text-sm text-orange-800 font-medium">
              Trial ending soon! Only {daysRemaining} days remaining. Upgrade
              now to keep all features.
            </span>
          </div>
        </div>
      )}

      {/* Usage Warnings */}
      {userPercentage > 90 && (
        <div className="mt-3 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <FaExclamationTriangle className="text-yellow-600" />
            <span className="text-sm text-yellow-800 font-medium">
              User limit almost reached ({Math.round(userPercentage)}%).
              Consider upgrading your plan.
            </span>
          </div>
        </div>
      )}

      {warehousePercentage > 90 && (
        <div className="mt-3 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <FaExclamationTriangle className="text-yellow-600" />
            <span className="text-sm text-yellow-800 font-medium">
              Warehouse limit almost reached ({Math.round(warehousePercentage)}
              %). Consider upgrading your plan.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanStatus;
