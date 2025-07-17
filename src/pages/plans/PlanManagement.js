import React, { useState } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";

const PlanManagement = () => {
  const { user } = useSelector((state) => state.auth);

  const [filterText, setFilterText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Sample data for plans
  const plansData = [
    {
      id: 1,
      name: "Basic Plan",
      type: "basic",
      price: 29.99,
      billingCycle: "monthly",
      features: ["Inventory Management", "Basic Reporting", "Single User"],
      status: "active",
      companies: 12,
    },
    {
      id: 2,
      name: "Standard Plan",
      type: "standard",
      price: 49.99,
      billingCycle: "monthly",
      features: [
        "Inventory Management",
        "Advanced Reporting",
        "Up to 5 Users",
        "Customer Management",
      ],
      status: "active",
      companies: 25,
    },
    {
      id: 3,
      name: "Premium Plan",
      type: "premium",
      price: 99.99,
      billingCycle: "monthly",
      features: [
        "All Features",
        "Unlimited Users",
        "API Access",
        "Priority Support",
      ],
      status: "active",
      companies: 18,
    },
    {
      id: 4,
      name: "Basic Annual",
      type: "basic",
      price: 299.99,
      billingCycle: "yearly",
      features: ["Inventory Management", "Basic Reporting", "Single User"],
      status: "active",
      companies: 8,
    },
    {
      id: 5,
      name: "Standard Annual",
      type: "standard",
      price: 499.99,
      billingCycle: "yearly",
      features: [
        "Inventory Management",
        "Advanced Reporting",
        "Up to 5 Users",
        "Customer Management",
      ],
      status: "active",
      companies: 15,
    },
    {
      id: 6,
      name: "Premium Annual",
      type: "premium",
      price: 999.99,
      billingCycle: "yearly",
      features: [
        "All Features",
        "Unlimited Users",
        "API Access",
        "Priority Support",
      ],
      status: "active",
      companies: 10,
    },
    {
      id: 7,
      name: "Legacy Plan",
      type: "basic",
      price: 19.99,
      billingCycle: "monthly",
      features: ["Basic Inventory", "Simple Reporting"],
      status: "inactive",
      companies: 3,
    },
  ];

  // Filter data based on search input
  const filteredData = plansData.filter((item) => {
    return (
      (item.name &&
        item.name.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.type &&
        item.type.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.billingCycle &&
        item.billingCycle.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.status &&
        item.status.toLowerCase().includes(filterText.toLowerCase()))
    );
  });

  // Plan type display mapper
  const planTypeDisplayMap = {
    basic: { label: "Basic", class: "bg-blue-100 text-blue-800" },
    standard: { label: "Standard", class: "bg-purple-100 text-purple-800" },
    premium: { label: "Premium", class: "bg-green-100 text-green-800" },
  };

  // Table columns
  const columns = [
    { name: "Plan Name", selector: (row) => row.name, sortable: true },
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
      cell: (row) => {
        const planType = planTypeDisplayMap[row.type] || {
          label: row.type,
          class: "bg-gray-100 text-gray-800",
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${planType.class}`}>
            {planType.label}
          </span>
        );
      },
    },
    {
      name: "Price",
      selector: (row) => row.price,
      sortable: true,
      format: (row) => `$${row.price}`,
    },
    {
      name: "Billing Cycle",
      selector: (row) => row.billingCycle,
      sortable: true,
      cell: (row) => <span className="capitalize">{row.billingCycle}</span>,
    },
    {
      name: "Companies",
      selector: (row) => row.companies,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              setSelectedPlan(row);
              setShowEditModal(true);
            }}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
            onClick={() => (window.location.href = `/plan-view?id=${row.id}`)}
          >
            View
          </button>
          <button className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
            {row.status === "active" ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  // Calculate plan statistics
  const totalPlans = filteredData.length;
  const activePlans = filteredData.filter(
    (plan) => plan.status === "active"
  ).length;
  const totalCompanies = filteredData.reduce(
    (sum, plan) => sum + plan.companies,
    0
  );

  // Calculate plan type distribution
  const planTypes = filteredData.reduce((acc, plan) => {
    acc[plan.type] = (acc[plan.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Plan Management</h1>
        <p className="text-gray-600">
          Create, edit, and manage subscription plans
        </p>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search plans..."
            className="form-input"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add New Plan
        </button>
      </div>

      {/* Plan Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Plans</p>
              <p className="text-2xl font-bold text-gray-900">{totalPlans}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">📝</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Plans</p>
              <p className="text-2xl font-bold text-gray-900">{activePlans}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Companies
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCompanies}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              🏭
            </div>
          </div>
        </div>
      </div>

      {/* Plan Type Distribution */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Plan Type Distribution
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="font-medium text-blue-800">Basic</p>
            <p className="text-2xl font-bold text-blue-900">
              {planTypes.basic || 0}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="font-medium text-purple-800">Standard</p>
            <p className="text-2xl font-bold text-purple-900">
              {planTypes.standard || 0}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="font-medium text-green-800">Premium</p>
            <p className="text-2xl font-bold text-green-900">
              {planTypes.premium || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          responsive
          highlightOnHover
          striped
          subHeader
          subHeaderComponent={
            <div className="w-full text-right py-2">
              <span className="text-sm text-gray-600">
                {filteredData.length} plans found
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default PlanManagement;
