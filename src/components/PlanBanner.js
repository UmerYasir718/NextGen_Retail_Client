import React, { useState } from "react";
import { Link } from "react-router-dom";
import { usePlan } from "../utils/hooks/usePlan";
import {
  FaExclamationTriangle,
  FaClock,
  FaCrown,
  FaTimes,
} from "react-icons/fa";

const PlanBanner = () => {
  const {
    plan,
    isPlanExpired,
    isTrial,
    getTrialDaysRemaining,
    getUsagePercentage,
    isNearLimit,
  } = usePlan();
  const [isVisible, setIsVisible] = useState(true);

  // Don't show for super admin or if no plan
  if (!plan || plan.role === "super_admin") {
    return null;
  }

  // Don't show if dismissed
  if (!isVisible) {
    return null;
  }

  // Check for critical warnings
  const isExpired = isPlanExpired;
  const trialEndingSoon = isTrial() && getTrialDaysRemaining() <= 3;
  const usageCritical =
    isNearLimit("users", 95) ||
    isNearLimit("warehouses", 95) ||
    isNearLimit("inventory", 95);

  // Priority order: expired > trial ending > usage critical
  if (isExpired) {
    return (
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 relative shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="text-2xl" />
            </div>
            <div>
              <p className="font-semibold text-lg">Plan Expired</p>
              <p className="text-sm opacity-90">
                Some features may be limited. Please renew your plan to continue
                using all features.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/plans"
              className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-md"
            >
              Renew Plan
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (trialEndingSoon) {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 relative shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <FaClock className="text-2xl" />
            </div>
            <div>
              <p className="font-semibold text-lg">Trial Ending Soon</p>
              <p className="text-sm opacity-90">
                Your trial ends in {getTrialDaysRemaining()} days. Upgrade now
                to keep all features.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/plans"
              className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-md"
            >
              Upgrade Now
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (usageCritical) {
    const criticalResources = [];
    if (isNearLimit("users", 95)) criticalResources.push("users");
    if (isNearLimit("warehouses", 95)) criticalResources.push("warehouses");
    if (isNearLimit("inventory", 95)) criticalResources.push("inventory");

    return (
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-4 relative shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="text-2xl" />
            </div>
            <div>
              <p className="font-semibold text-lg">Usage Limit Approaching</p>
              <p className="text-sm opacity-90">
                You're approaching the limit for: {criticalResources.join(", ")}
                . Consider upgrading your plan.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/plans"
              className="bg-white text-yellow-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-md"
            >
              View Plans
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show trial banner for remaining trial days
  if (isTrial()) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 relative shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <FaCrown className="text-2xl" />
            </div>
            <div>
              <p className="font-semibold text-lg">Trial Plan Active</p>
              <p className="text-sm opacity-90">
                You have {getTrialDaysRemaining()} days remaining in your trial.
                Upgrade anytime to unlock premium features.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/plans"
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-md"
            >
              View Plans
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PlanBanner;
