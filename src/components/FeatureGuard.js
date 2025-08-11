import React from 'react';
import { Link } from 'react-router-dom';
import { usePlan } from '../utils/hooks/usePlan';
import { FaLock, FaCrown } from 'react-icons/fa';

const FeatureGuard = ({ 
  feature, 
  children, 
  fallback = null, 
  showUpgradePrompt = true,
  upgradeMessage = null 
}) => {
  const { hasFeature, isExpired, isTrial, getTrialDaysRemaining } = usePlan();

  // If feature is available, render children
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // If fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }

  // If upgrade prompt is disabled, render nothing
  if (!showUpgradePrompt) {
    return null;
  }

  // Default upgrade messages
  const getDefaultMessage = () => {
    switch (feature) {
      case 'ai_forecasting':
        return 'AI Forecasting is a premium feature that helps predict inventory needs and optimize stock levels.';
      case 'advanced_reporting':
        return 'Advanced Reporting provides detailed analytics and custom reports for better business insights.';
      case 'multiple_warehouses':
        return 'Multiple Warehouses allow you to manage inventory across multiple locations.';
      case 'multiple_users':
        return 'Multiple Users enable team collaboration with role-based access control.';
      default:
        return 'This feature is available in our premium plans.';
    }
  };

  const message = upgradeMessage || getDefaultMessage();

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <FaLock className="text-purple-600 text-xl" />
          <FaCrown className="text-yellow-500 text-xl" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Premium Feature
          </h3>
          <p className="text-gray-600 mb-4 max-w-md">
            {message}
          </p>
        </div>

        {/* Show different CTAs based on plan status */}
        {isExpired() && (
          <div className="space-y-2">
            <p className="text-sm text-red-600 font-medium">
              Your plan has expired. Renew to access this feature.
            </p>
            <Link
              to="/plans"
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Renew Plan
            </Link>
          </div>
        )}

        {isTrial() && (
          <div className="space-y-2">
            <p className="text-sm text-orange-600 font-medium">
              Trial ends in {getTrialDaysRemaining()} days. Upgrade to keep this feature.
            </p>
            <Link
              to="/plans"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        )}

        {!isExpired() && !isTrial() && (
          <Link
            to="/plans"
            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            View Plans
          </Link>
        )}
      </div>
    </div>
  );
};

export default FeatureGuard; 