import { useSelector, useDispatch } from "react-redux";
import { refreshCurrentPlan } from "../../redux/slices/authSlice";

export const usePlan = () => {
  const { plan, isPlanExpired } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Function to refresh current plan data
  const refreshPlan = async () => {
    try {
      const result = await dispatch(refreshCurrentPlan());
      return result;
    } catch (error) {
      console.error("Error refreshing plan:", error);
      return { success: false, error: error.message };
    }
  };

  // Check if a specific feature is available
  const hasFeature = (feature) => {
    if (!plan) return false;
    if (isPlanExpired) return false;

    // Check if feature is in the plan's features array
    if (plan.features && plan.features.includes(feature)) {
      return true;
    }

    // Check specific feature flags
    switch (feature) {
      case "ai_forecasting":
        return plan.limits?.includesAIForecasting || false;
      case "advanced_reporting":
        return plan.limits?.includesAdvancedReporting || false;
      case "multiple_warehouses":
        return (plan.limits?.warehouseLimit || 0) > 1;
      case "multiple_users":
        return (plan.limits?.userLimit || 0) > 1;
      default:
        return false;
    }
  };

  // Check if user can add more of a resource
  const canAdd = (resourceType) => {
    if (!plan || !plan.usage) return false;
    if (isPlanExpired) return false;

    switch (resourceType) {
      case "users":
        return (
          (plan.usage.users?.current || 0) < (plan.usage.users?.limit || 0)
        );
      case "warehouses":
        return (
          (plan.usage.warehouses?.current || 0) <
          (plan.usage.warehouses?.limit || 0)
        );
      case "inventory":
        return (
          (plan.usage.inventory?.current || 0) <
          (plan.usage.inventory?.limit || 0)
        );
      default:
        return false;
    }
  };

  // Get usage percentage for a resource
  const getUsagePercentage = (resourceType) => {
    if (!plan || !plan.usage) return 0;

    switch (resourceType) {
      case "users":
        return plan.usage.users
          ? (plan.usage.users.current / plan.usage.users.limit) * 100
          : 0;
      case "warehouses":
        return plan.usage.warehouses
          ? (plan.usage.warehouses.current / plan.usage.warehouses.limit) * 100
          : 0;
      case "inventory":
        return plan.usage.inventory
          ? (plan.usage.inventory.current / plan.usage.inventory.limit) * 100
          : 0;
      default:
        return 0;
    }
  };

  // Check if usage is near limit
  const isNearLimit = (resourceType, threshold = 90) => {
    return getUsagePercentage(resourceType) >= threshold;
  };

  // Get plan status
  const getPlanStatus = () => {
    if (!plan) return "no_plan";
    if (isPlanExpired) return "expired";
    if (plan.isTrialPeriod) return "trial";
    return "active";
  };

  // Check if plan is in trial
  const isTrial = () => {
    return plan?.isTrialPeriod || false;
  };

  // Check if plan is expired
  const isExpired = () => {
    return isPlanExpired || plan?.isExpired || false;
  };

  // Get days remaining in trial
  const getTrialDaysRemaining = () => {
    return plan?.daysRemaining || 0;
  };

  // Get plan limits
  const getLimits = () => {
    return plan?.limits || {};
  };

  // Get current usage
  const getUsage = () => {
    return plan?.usage || {};
  };

  // Get plan features
  const getFeatures = () => {
    return plan?.features || [];
  };

  return {
    plan,
    isPlanExpired,
    hasFeature,
    canAdd,
    getUsagePercentage,
    isNearLimit,
    getPlanStatus,
    isTrial,
    isExpired,
    getTrialDaysRemaining,
    getLimits,
    getUsage,
    getFeatures,
    refreshPlan,
  };
};
