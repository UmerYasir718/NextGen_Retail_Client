import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaCrown, FaUsers, FaWarehouse, FaBoxes } from 'react-icons/fa';
import { usePlan } from '../utils/hooks/usePlan';

const PlanLimitModal = ({ 
  isOpen, 
  onClose, 
  resourceType, 
  currentUsage, 
  limit 
}) => {
  const { getUsagePercentage, isTrial, getTrialDaysRemaining } = usePlan();

  if (!isOpen) return null;

  const getResourceInfo = () => {
    switch (resourceType) {
      case 'users':
        return {
          icon: FaUsers,
          title: 'User Limit Reached',
          description: 'You have reached the maximum number of users allowed in your current plan.',
          color: 'blue'
        };
      case 'warehouses':
        return {
          icon: FaWarehouse,
          title: 'Warehouse Limit Reached',
          description: 'You have reached the maximum number of warehouses allowed in your current plan.',
          color: 'green'
        };
      case 'inventory':
        return {
          icon: FaBoxes,
          title: 'Inventory Limit Reached',
          description: 'You have reached the maximum inventory items allowed in your current plan.',
          color: 'purple'
        };
      default:
        return {
          icon: FaExclamationTriangle,
          title: 'Limit Reached',
          description: 'You have reached a limit in your current plan.',
          color: 'gray'
        };
    }
  };

  const resourceInfo = getResourceInfo();
  const IconComponent = resourceInfo.icon;
  const usagePercentage = getUsagePercentage(resourceType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-2 rounded-full bg-${resourceInfo.color}-100`}>
            <IconComponent className={`text-${resourceInfo.color}-600 text-xl`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {resourceInfo.title}
            </h3>
            <p className="text-sm text-gray-600">
              {resourceInfo.description}
            </p>
          </div>
        </div>

        {/* Usage Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Current Usage
            </span>
            <span className="text-sm text-gray-500">
              {currentUsage} / {limit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-${resourceInfo.color}-500`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {Math.round(usagePercentage)}% of limit used
          </p>
        </div>

        {/* Plan Status */}
        {isTrial() && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <FaCrown className="text-orange-600" />
              <span className="text-sm text-orange-800 font-medium">
                Trial Plan - {getTrialDaysRemaining()} days remaining
              </span>
            </div>
          </div>
        )}

        {/* Upgrade Options */}
        <div className="space-y-3">
          <Link
            to="/plans"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium text-center block transition-colors"
            onClick={onClose}
          >
            View Upgrade Options
          </Link>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Maybe Later
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Upgrading your plan will give you access to more {resourceType} and additional features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanLimitModal; 