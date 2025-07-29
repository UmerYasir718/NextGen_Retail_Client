import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import planAPI from "../../utils/api/planAPI";
import AddPlanModal from "../../components/plans/AddPlanModal";

const PlanManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [filterText, setFilterText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  // Edit modal functionality will be implemented in the future
  // const [showEditModal, setShowEditModal] = useState(false);
  // const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Redirect if user is not super_admin
  useEffect(() => {
    if (!user || user.role !== "super_admin") {
      toast.error("You don't have permission to access this page");
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  // State for API data
  const [plansData, setPlansData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch plans data when component mounts
  useEffect(() => {
    fetchPlans();
  }, []);
  
  // Function to fetch plans from API
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await planAPI.getPlans();
      console.log('Plans data:', response);
      
      if (response?.success && Array.isArray(response?.data)) {
        setPlansData(response.data);
      } else {
        setError('Failed to load plans data');
        toast.error('Failed to load plans data');
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Error loading plans: ' + (err.message || 'Unknown error'));
      toast.error('Error loading plans: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle plan added event
  const handlePlanAdded = (newPlan) => {
    fetchPlans(); // Refresh the plans list
    toast.success('Plan added successfully!');
  };
  
  // View plan details
  const viewPlanDetails = (planId) => {
    navigate(`/plans/${planId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container-fluid mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Plan Management</h1>
        <p className="text-gray-600 mb-6">Loading plans...</p>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Filter data based on search input
  const filteredData = plansData.filter((item) => {
    return (
      (item.name &&
        item.name.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.description &&
        item.description.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.duration &&
        item.duration.toString().includes(filterText)) ||
      ((item.isActive ? "active" : "inactive").includes(filterText.toLowerCase()))
    );
  });
  
  // Plan duration display mapper
  const getPlanTypeDisplay = (duration) => {
    if (duration >= 12) {
      return { label: "Annual", class: "bg-purple-100 text-purple-800" };
    } else if (duration >= 6) {
      return { label: "Bi-Annual", class: "bg-blue-100 text-blue-800" };
    } else {
      return { label: "Monthly", class: "bg-green-100 text-green-800" };
    }
  };

  // Table columns
  const columns = [
    { name: "Plan Name", selector: (row) => row.name, sortable: true },
    {
      name: "Duration",
      selector: (row) => row.duration,
      sortable: true,
      cell: (row) => {
        const planType = getPlanTypeDisplay(row.duration);
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${planType.class}`}>
            {row.duration} months
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
      name: "Warehouse Limit",
      selector: (row) => row.limits?.warehouseLimit,
      sortable: true,
    },
    {
      name: "User Limit",
      selector: (row) => row.limits?.userLimit,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.isActive,
      sortable: true,
      cell: (row) => {
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              row.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {row.isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      name: "Actions",
      cell: (row) => {
        return (
          <div className="flex space-x-2">
            <button
              className="text-blue-600 hover:text-blue-900"
              onClick={() => viewPlanDetails(row._id)}
            >
              View
            </button>
            <button
              className="text-green-600 hover:text-green-900"
              onClick={() => {
                // Edit functionality will be implemented in the future
                toast.info("Edit functionality coming soon!");
                // setSelectedPlan(row);
                // setShowEditModal(true);
              }}
            >
              Edit
            </button>
          </div>
        );
      },
    },
  ];

  // Calculate statistics
  const totalPlans = plansData.length;
  const activePlans = plansData.filter((plan) => plan.isActive).length;
  
  // Calculate plan durations
  const planDurations = plansData.reduce(
    (types, plan) => {
      const durationType = plan.duration >= 12 ? 'annual' : 
                          plan.duration >= 6 ? 'biannual' : 'monthly';
      
      if (durationType in types) {
        types[durationType] += 1;
      } else {
        types[durationType] = 1;
      }
      return types;
    },
    { monthly: 0, biannual: 0, annual: 0 }
  );

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
                Inactive Plans
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalPlans - activePlans}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              ⏸️
            </div>
          </div>
        </div>
      </div>

      {/* Plan Duration Distribution */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Plan Duration Distribution
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="font-medium text-green-800">Monthly</p>
            <p className="text-2xl font-bold text-green-900">
              {planDurations.monthly || 0}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="font-medium text-blue-800">Bi-Annual</p>
            <p className="text-2xl font-bold text-blue-900">
              {planDurations.biannual || 0}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="font-medium text-purple-800">Annual</p>
            <p className="text-2xl font-bold text-purple-900">
              {planDurations.annual || 0}
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
          progressPending={loading}
          progressComponent={
            <div className="p-4 text-center">
              <p>Loading plans data...</p>
            </div>
          }
          noDataComponent={
            <div className="p-4 text-center">
              <p>{error || "No plans found"}</p>
            </div>
          }
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
      
      {/* Add Plan Modal */}
      {showAddModal && (
        <AddPlanModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onPlanAdded={handlePlanAdded}
        />
      )}
    </div>
  );
};

export default PlanManagement;
