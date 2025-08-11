import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { refreshCurrentPlan } from "../../redux/slices/authSlice";
import planAPI from "../../utils/api/planAPI";
import { usePlan } from "../../utils/hooks/usePlan";

const CurrentPlan = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { plan, isPlanExpired, isTrial, getTrialDaysRemaining } = usePlan();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [usageStats, setUsageStats] = useState(null);

  useEffect(() => {
    // Redirect if user is not company user or admin
    if (
      !user ||
      (user.role !== "company_admin" && user.role !== "company_user")
    ) {
      toast.error("You don't have permission to access this page");
      navigate("/dashboard");
      return;
    }

    loadCurrentPlanData();
  }, [user, navigate, dispatch]);

  const loadCurrentPlanData = async () => {
    try {
      setLoading(true);

      // Refresh current plan data
      await dispatch(refreshCurrentPlan());

      // Get detailed plan information
      const planResponse = await planAPI.getCurrentPlan();
      if (planResponse?.success) {
        setPlanDetails(planResponse.data);
      }

      // Get usage statistics
      const statsResponse = await planAPI.getCompanyDashboardStats();
      if (statsResponse?.success) {
        setUsageStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Error loading current plan data:", error);
      setError(error.message || "Failed to load plan data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePlan = () => {
    navigate("/plans");
  };

  const handleRefresh = async () => {
    await loadCurrentPlanData();
    toast.success("Plan data refreshed successfully!");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Current Plan</h1>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
            <div className="h-24 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Current Plan</h1>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 mb-4">
            <p className="text-lg">Error loading plan data</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Current Plan</h1>
            <p className="text-gray-600">
              View your subscription details and usage
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Refresh
          </button>
          <button
            onClick={handleUpgradePlan}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Plan Overview Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Plan Overview</h2>
          <div className="flex items-center space-x-2">
            {isTrial && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                Trial Plan
              </span>
            )}
            {plan?.isActive ? (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                Inactive
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Plan Name
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {plan?.name || "Free Trial"}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Price</h3>
            <p className="text-2xl font-bold text-green-600">
              {plan?.price === 0 ? "Free" : `$${plan?.price}/month`}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Duration
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {plan?.duration || 1} month{plan?.duration !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {plan?.description && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Description
            </h3>
            <p className="text-gray-600">{plan.description}</p>
          </div>
        )}

        {isTrial && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Trial Information
            </h3>
            <p className="text-yellow-700">
              You are currently on a trial plan. {getTrialDaysRemaining()} days
              remaining.
            </p>
          </div>
        )}
      </div>

      {/* Usage Limits and Current Usage */}
      {plan?.limits && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Usage & Limits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Users */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Users
              </h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-blue-600">
                  {usageStats?.users?.current || 0}
                </span>
                <span className="text-sm text-blue-600">
                  / {plan.limits.userLimit || "∞"}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      ((usageStats?.users?.current || 0) /
                        (plan.limits.userLimit || 1)) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Warehouses */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Warehouses
              </h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-green-600">
                  {usageStats?.warehouses?.current || 0}
                </span>
                <span className="text-sm text-green-600">
                  / {plan.limits.warehouseLimit || "∞"}
                </span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      ((usageStats?.warehouses?.current || 0) /
                        (plan.limits.warehouseLimit || 1)) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Inventory Items */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                Inventory Items
              </h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-purple-600">
                  {usageStats?.inventory?.current || 0}
                </span>
                <span className="text-sm text-purple-600">
                  / {plan.limits.inventoryLimit || "∞"}
                </span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      ((usageStats?.inventory?.current || 0) /
                        (plan.limits.inventoryLimit || 1)) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* AI Forecasting */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                AI Forecasting
              </h3>
              <div className="text-center">
                <span
                  className={`text-2xl font-bold ${
                    plan.limits.includesAIForecasting
                      ? "text-orange-600"
                      : "text-gray-400"
                  }`}
                >
                  {plan.limits.includesAIForecasting ? "✓" : "✗"}
                </span>
                <p className="text-sm text-orange-600 mt-1">
                  {plan.limits.includesAIForecasting
                    ? "Available"
                    : "Not Available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Features */}
      {plan?.features && plan.features.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Plan Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-green-500 text-xl">✓</span>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing Information */}
      {planDetails && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Billing Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Subscription Start
              </h3>
              <p className="text-gray-600">
                {planDetails.planStartDate
                  ? new Date(planDetails.planStartDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Next Billing Date
              </h3>
              <p className="text-gray-600">
                {planDetails.nextBillingDate
                  ? new Date(planDetails.nextBillingDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Payment Method
              </h3>
              <p className="text-gray-600">
                {planDetails.paymentMethod || "Not configured"}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Auto-Renewal
              </h3>
              <p className="text-gray-600">
                {planDetails.autoRenewal ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentPlan;
