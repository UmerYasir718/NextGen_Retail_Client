import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import planAPI from "../../utils/api/planAPI";
import AddPlanModal from "../../components/plans/AddPlanModal";
import { refreshCurrentPlan } from "../../redux/slices/authSlice";

const PlanView = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const isSuperAdmin = user?.role === "super_admin";

  const [plan, setPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [companiesUsing, setCompaniesUsing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  // Check if user is viewing a specific plan or catalog
  const isViewingCatalog = !planId;
  const isCompanyAdmin = user?.role === "company_admin";

  // Handle plan purchase with Stripe checkout
  const handlePurchasePlan = async (selectedPlan) => {
    try {
      setProcessingPayment(true);
      toast.info(`Processing your request for ${selectedPlan.name}...`);

      const response = await planAPI.createCheckoutSession(selectedPlan._id);
      console.log(response);
      if (response?.success && response?.url) {
        // Redirect to Stripe checkout page
        window.location.href = response.url;
      } else {
        toast.error("Failed to create checkout session. Please try again.");
        console.error("Checkout session creation failed:", response);
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      toast.error(
        `Payment processing error: ${err.message || "Unknown error"}`
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  // Handle duplicate plan
  const handleDuplicatePlan = async (duplicateData) => {
    try {
      setLoading(true);
      const response = await planAPI.createPlan(duplicateData);

      if (response?.success) {
        toast.success("Plan duplicated successfully!");
        setShowDuplicateModal(false);
        // Navigate to the new plan
        navigate(`/plans/${response.data._id}`);
      } else {
        toast.error(response?.message || "Failed to duplicate plan");
      }
    } catch (error) {
      console.error("Error duplicating plan:", error);
      toast.error(
        "Error duplicating plan: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle activate/deactivate plan
  const handleTogglePlanStatus = async () => {
    if (!plan?._id) {
      toast.error("Plan ID not found");
      return;
    }

    try {
      setLoading(true);
      const response = await planAPI.updatePlan(plan._id, {
        isActive: !plan.isActive,
      });

      if (response?.success) {
        const newStatus = !plan.isActive;
        setPlan((prev) => ({ ...prev, isActive: newStatus }));
        toast.success(
          `Plan ${newStatus ? "activated" : "deactivated"} successfully!`
        );
      } else {
        toast.error(response?.message || "Failed to update plan status");
      }
    } catch (error) {
      console.error("Error updating plan status:", error);
      toast.error(
        "Error updating plan status: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  // Redirect if user is not authorized
  useEffect(() => {
    if (
      !user ||
      (user.role !== "super_admin" && user.role !== "company_admin")
    ) {
      toast.error("You don't have permission to access this page");
      navigate("/dashboard");
    }

    // If company_admin tries to access specific plan view/edit
    if (isCompanyAdmin && planId && !isViewingCatalog) {
      toast.error("You don't have permission to edit plans");
      navigate("/plans");
    }
  }, [user, navigate, planId, isCompanyAdmin, isViewingCatalog]);

  // Fetch plan data when component mounts
  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        setLoading(true);

        // Refresh current plan data for the user
        if (user?.role !== "super_admin") {
          try {
            await dispatch(refreshCurrentPlan());
          } catch (error) {
            console.error("Error refreshing current plan:", error);
          }
        }

        if (isViewingCatalog || isCompanyAdmin) {
          // Fetch all plans for catalog view
          const response = await planAPI.getPlans();
          console.log("All plans data:", response);

          if (response?.success && Array.isArray(response?.data)) {
            setAllPlans(response.data);
            // If no specific plan is being viewed, we're done
            if (isViewingCatalog) {
              setLoading(false);
              return;
            }
          } else {
            setError("Failed to load plans data");
            toast.error("Failed to load plans data");
            setLoading(false);
            return;
          }
        }

        if (planId) {
          // Fetch specific plan by ID
          const response = await planAPI.getPlanById(planId);
          console.log("Specific plan data:", response);

          if (response?.success && response?.data) {
            setPlan(response.data);
            // In a real app, you would also fetch companies using this plan
            // For now, we'll use empty array
            setCompaniesUsing([]);
          } else {
            setError("Failed to load plan data");
            toast.error("Failed to load plan data");
          }
        }
      } catch (err) {
        console.error("Error fetching plan:", err);
        setError(
          "Error loading plan data: " + (err.message || "Unknown error")
        );
        toast.error(
          "Error loading plan data: " + (err.message || "Unknown error")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [planId, isViewingCatalog, isCompanyAdmin, dispatch, user?.role]);

  // If loading, show loading state
  if (loading) {
    return (
      <div className="container-fluid mx-auto px-4 py-6">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {isViewingCatalog ? "Loading Plans..." : "Loading Plan..."}
            </h1>
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

  // If error and not viewing catalog, show error state
  if (error && !isViewingCatalog) {
    return (
      <div className="container-fluid mx-auto px-4 py-6">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Plan Not Found</h1>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-500 mb-4">
            {error || "Plan data not available"}
          </p>
          <button
            onClick={() => navigate("/plans")}
            className="btn btn-primary"
          >
            Go to Plans
          </button>
        </div>
      </div>
    );
  }

  // If viewing catalog (company_admin or navigated to /plans without ID)
  if (isViewingCatalog || isCompanyAdmin) {
    return (
      <div className="container-fluid mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Plan Catalog</h1>
          <p className="text-gray-600">
            {isCompanyAdmin
              ? "Choose a subscription plan for your company"
              : "Available subscription plans"}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {allPlans.map((plan) => {
            // Check if this plan is active for the current user
            const isActivePlan = user?.planId === plan._id;

            return (
              <div
                key={plan._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
              >
                {/* Plan Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {plan.name}
                    </h2>
                    {isCompanyAdmin && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          isActivePlan
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {isActivePlan ? "Active" : "Inactive"}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    ${plan.price}
                    <span className="text-sm text-gray-500">/month</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {plan.duration} month{plan.duration !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Plan Features */}
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Features
                    </h3>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-600 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Limits
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        Warehouses: {plan.limits.warehouseLimit}
                      </p>
                      <p className="text-gray-600">
                        Users: {plan.limits.userLimit}
                      </p>
                      <p className="text-gray-600">
                        Inventory Items: {plan.limits.inventoryLimit}
                      </p>
                      <p className="text-gray-600">
                        AI Forecasting:{" "}
                        {plan.limits.includesAIForecasting ? "Yes" : "No"}
                      </p>
                      <p className="text-gray-600">
                        Advanced Reporting:{" "}
                        {plan.limits.includesAdvancedReporting ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  {isCompanyAdmin && (
                    <div className="mt-6">
                      {isActivePlan ? (
                        <button
                          className="w-full py-2 px-4 bg-gray-200 text-gray-800 font-medium rounded-md cursor-not-allowed"
                          disabled
                        >
                          Current Plan
                        </button>
                      ) : (
                        <button
                          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                          onClick={() => handlePurchasePlan(plan)}
                          disabled={processingPayment}
                        >
                          {processingPayment ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <span className="mr-2">Buy Now</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Admin Actions */}
                  {isSuperAdmin && (
                    <div className="mt-6 flex space-x-2">
                      <button
                        className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-200"
                        onClick={() => navigate(`/plans/${plan._id}`)}
                      >
                        View Details
                      </button>
                      <button
                        className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition duration-200"
                        onClick={() =>
                          navigate(`/plan-management?edit=${plan._id}`)
                        }
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Add Plan Button */}
        {isSuperAdmin && (
          <div className="flex justify-end">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/plan-management")}
            >
              Manage Plans
            </button>
          </div>
        )}
      </div>
    );
  }

  // If specific plan not found
  if (!plan) {
    return (
      <div className="container-fluid mx-auto px-4 py-6">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-blue-600 hover:text-blue-800"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Plan Not Found</h1>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-500 mb-4">Plan data not available</p>
          <button
            onClick={() => navigate("/plans")}
            className="btn btn-primary"
          >
            Go to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header with Back Button */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{plan.name}</h1>
          <p className="text-gray-600">Plan details and information</p>
        </div>
      </div>

      {/* Plan Overview Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  plan.duration >= 12
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {plan.duration >= 12 ? "Annual" : "Monthly"} Plan
              </span>
              <span
                className={`inline-block ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  plan.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {plan.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            {user?.role === "super_admin" && (
              <button className="btn btn-primary mt-4 md:mt-0">
                Edit Plan
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Plan Information
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${plan.price}{" "}
                    <span className="text-sm font-normal text-gray-600">
                      / {plan.duration} months
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-lg font-bold text-gray-900">
                    {plan.duration} months
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Stripe Price ID</p>
                  <p className="text-gray-900 text-sm">{plan.stripePriceId}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-gray-900">
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Plan Limits</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Warehouse Limit:</span>
                      <span className="font-medium">
                        {plan.limits.warehouseLimit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">User Limit:</span>
                      <span className="font-medium">
                        {plan.limits.userLimit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Inventory Limit:</span>
                      <span className="font-medium">
                        {plan.limits.inventoryLimit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">AI Forecasting:</span>
                      <span className="font-medium">
                        {plan.limits.includesAIForecasting ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Advanced Reporting:</span>
                      <span className="font-medium">
                        {plan.limits.includesAdvancedReporting ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Description
              </h2>
              <p className="text-gray-700 mb-6">{plan.description}</p>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Features
              </h2>
              <ul className="space-y-2">
                {plan.features &&
                  plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Using This Plan */}
      {companiesUsing.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Companies Using This Plan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companiesUsing.map((company) => (
                <div
                  key={company.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <h3 className="font-medium text-gray-900">{company.name}</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-800 mt-2">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isSuperAdmin && (
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <button
            className="btn btn-secondary"
            onClick={() => setShowDuplicateModal(true)}
          >
            Duplicate Plan
          </button>
          <button
            className={`btn ${plan.isActive ? "btn-danger" : "btn-success"}`}
            onClick={handleTogglePlanStatus}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : plan.isActive
              ? "Deactivate Plan"
              : "Activate Plan"}
          </button>
        </div>
      )}

      {/* Duplicate Plan Modal */}
      {showDuplicateModal && plan && (
        <AddPlanModal
          isOpen={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          onPlanAdded={handleDuplicatePlan}
          initialData={{
            name: `${plan.name} (Copy)`,
            description: plan.description,
            duration: plan.duration,
            price: plan.price,
            features: plan.features || [],
            stripePriceId: plan.stripePriceId || "",
            limits: {
              warehouseLimit: plan.limits?.warehouseLimit || 1,
              userLimit: plan.limits?.userLimit || 1,
              inventoryLimit: plan.limits?.inventoryLimit || 1000,
              includesAIForecasting:
                plan.limits?.includesAIForecasting || false,
              includesAdvancedReporting:
                plan.limits?.includesAdvancedReporting || false,
            },
            isActive: false, // New duplicated plans start as inactive
          }}
          mode="duplicate"
          submitButtonText="Duplicate Plan"
        />
      )}
    </div>
  );
};

export default PlanView;
