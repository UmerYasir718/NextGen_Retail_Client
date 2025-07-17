import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

const PlanView = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Sample plan data - in a real app, this would be fetched based on planId
  const [plan, setPlan] = useState({
    id: planId || "1",
    name: "Premium Plan",
    type: "premium",
    price: 299.99,
    billingCycle: "monthly",
    annualPrice: 2999.99,
    description: "Our most comprehensive plan for businesses of all sizes",
    features: [
      "Full inventory management",
      "Unlimited users",
      "Unlimited store locations",
      "Priority support",
      "Advanced analytics",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "Staff training sessions",
      "Custom reporting",
      "Bulk import/export",
      "Multi-currency support",
    ],
    companiesUsing: [
      { id: 1, name: "NextGen Retail Corp" },
      { id: 5, name: "Sports Unlimited" },
    ],
    createdAt: "2023-01-20",
    updatedAt: "2023-06-15",
    status: "active",
  });

  // Plan type display mapper
  const planTypeDisplayMap = {
    premium: "Premium",
    yearly: "Yearly",
    simple: "Simple",
  };

  // Billing cycle display mapper
  const billingCycleDisplayMap = {
    monthly: "Monthly",
    yearly: "Annual",
  };

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
                  plan.type === "premium"
                    ? "bg-purple-100 text-purple-800"
                    : plan.type === "yearly"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {planTypeDisplayMap[plan.type] || plan.type} Plan
              </span>
              <span
                className={`inline-block ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  plan.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {plan.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
            {user.role === "super_admin" && (
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
                      / {plan.billingCycle}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Annual Price</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${plan.annualPrice}{" "}
                    <span className="text-sm font-normal text-gray-600">
                      / year
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Companies Using This Plan
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {plan.companiesUsing.length}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-gray-900">{plan.createdAt}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-gray-900">{plan.updatedAt}</p>
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
                {plan.features.map((feature, index) => (
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
      {plan.companiesUsing.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Companies Using This Plan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.companiesUsing.map((company) => (
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
      {user.role === "super_admin" && (
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <button className="btn btn-secondary">Duplicate Plan</button>
          <button
            className={`btn ${
              plan.status === "active" ? "btn-danger" : "btn-success"
            }`}
          >
            {plan.status === "active" ? "Deactivate Plan" : "Activate Plan"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PlanView;
