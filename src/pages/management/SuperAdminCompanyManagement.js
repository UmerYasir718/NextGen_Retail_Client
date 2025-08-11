import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import companyAPI from "../../utils/api/companyAPI";
import planAPI from "../../utils/api/planAPI";
import { useWebSocket } from "../../utils/hooks/useWebSocket";
import Breadcrumb from "../../components/Breadcrumb";

const SuperAdminCompanyManagement = () => {
  const { user } = useSelector((state) => state.auth);

  // State management
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    planType: "",
    subscriptionStatus: "",
    search: "",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    email: "",
    domain: "",
    status: "active",
    plan: {
      planType: "trial",
      subscriptionStatus: "trialing",
    },
  });
  const [approvalData, setApprovalData] = useState({
    planType: "premium",
    subscriptionStatus: "active",
    trialDays: 30,
    notes: "",
  });
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);

  // WebSocket connection for real-time updates
  const { lastMessage, sendMessage } = useWebSocket(
    process.env.REACT_APP_WS_URL || "ws://localhost:5000/ws"
  );

  // Load companies data
  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      const response = await companyAPI.getAllCompanies(params);

      if (response.success) {
        setCompanies(response.data);
        setPagination((prev) => ({
          ...prev,
          total: response.total,
          pages: response.pagination?.current?.pages || 1,
        }));

        // Update stats from the response
        if (response.summary) {
          setStats({
            overview: {
              totalCompanies: response.summary.totalCompanies,
              activeCompanies: response.summary.activeCompanies,
            },
            planBreakdown: {
              trial: response.summary.trialCompanies,
              paid: response.summary.paidCompanies,
            },
          });
        }
      } else {
        toast.error(response.message || "Failed to load companies");
      }
    } catch (error) {
      console.error("Error loading companies:", error);
      toast.error(error.error || "Failed to load companies");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Load plans data
  const loadPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      const response = await planAPI.getPlans();

      if (response.success && response.data) {
        setPlans(response.data);
      } else {
        console.warn("Failed to load plans:", response.message);
        // Fallback to default plans if API fails
        setPlans([
          { _id: "trial", name: "Free Trial", type: "trial" },
          { _id: "basic", name: "Basic", type: "basic" },
          { _id: "premium", name: "Premium", type: "premium" },
          { _id: "enterprise", name: "Enterprise", type: "enterprise" },
        ]);
      }
    } catch (error) {
      console.error("Error loading plans:", error);
      // Fallback to default plans if API fails
      setPlans([
        { _id: "trial", name: "Free Trial", type: "trial" },
        { _id: "basic", name: "Basic", type: "basic" },
        { _id: "premium", name: "Premium", type: "premium" },
        { _id: "enterprise", name: "Enterprise", type: "enterprise" },
      ]);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  // Load company statistics
  const loadStats = useCallback(async () => {
    try {
      const response = await companyAPI.getCompanyStats();
      if (response.success) {
        setStats(response.data);
      } else {
        console.error("Failed to load stats:", response.message);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadCompanies();
    loadPlans(); // Add this line to load plans
    // Load stats separately for better performance
    loadStats();
  }, [loadCompanies, loadPlans, loadStats]);

  // Handle real-time updates from WebSocket
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (
          data.type === "company_updated" ||
          data.type === "company_created" ||
          data.type === "company_deleted"
        ) {
          // Refresh data when companies are modified
          loadCompanies();

          // Show notification
          if (data.type === "company_created") {
            toast.success("New company created");
          } else if (data.type === "company_updated") {
            toast.success("Company updated");
          } else if (data.type === "company_deleted") {
            toast.success("Company deleted");
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage, loadCompanies]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Handle search with debouncing
  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle company approval
  const handleApproveSubscription = async () => {
    try {
      setModalLoading(true);
      const response = await companyAPI.approveCompanySubscription(
        selectedCompany._id,
        approvalData
      );

      if (response.success) {
        toast.success("Company subscription approved successfully");
        setShowApproveModal(false);
        setSelectedCompany(null);
        loadCompanies();

        // Send real-time update
        sendMessage(
          JSON.stringify({
            type: "company_subscription_approved",
            companyId: selectedCompany._id,
            data: approvalData,
          })
        );
      } else {
        toast.error(response.message || "Failed to approve subscription");
      }
    } catch (error) {
      toast.error(error.error || "Failed to approve subscription");
    } finally {
      setModalLoading(false);
    }
  };

  // Handle company update
  const handleUpdateCompany = async () => {
    try {
      setModalLoading(true);
      const response = await companyAPI.updateCompany(
        selectedCompany._id,
        selectedCompany
      );

      if (response.success) {
        toast.success("Company updated successfully");
        setShowEditModal(false);
        setSelectedCompany(null);
        loadCompanies();

        // Send real-time update
        sendMessage(
          JSON.stringify({
            type: "company_updated",
            companyId: selectedCompany._id,
            data: selectedCompany,
          })
        );
      } else {
        toast.error(response.message || "Failed to update company");
      }
    } catch (error) {
      toast.error(error.error || "Failed to update company");
    } finally {
      setModalLoading(false);
    }
  };

  // Handle company deletion
  const handleDeleteCompany = async () => {
    try {
      setModalLoading(true);
      const response = await companyAPI.deleteCompany(selectedCompany._id);

      if (response.success) {
        toast.success("Company deleted successfully");
        setShowDeleteModal(false);
        setSelectedCompany(null);
        loadCompanies();

        // Send real-time update
        sendMessage(
          JSON.stringify({
            type: "company_deleted",
            companyId: selectedCompany._id,
          })
        );
      } else {
        toast.error(response.message || "Failed to delete company");
      }
    } catch (error) {
      toast.error(error.error || "Failed to delete company");
    } finally {
      setModalLoading(false);
    }
  };

  // Handle company creation
  const handleCreateCompany = async () => {
    try {
      setModalLoading(true);
      const response = await companyAPI.createCompany(newCompany);

      if (response.success) {
        toast.success("Company created successfully");
        setShowAddModal(false);
        setNewCompany({
          name: "",
          email: "",
          domain: "",
          status: "active",
          plan: {
            planType: "trial",
            subscriptionStatus: "trialing",
          },
        });
        loadCompanies();

        // Send real-time update
        sendMessage(
          JSON.stringify({
            type: "company_created",
            data: response.data,
          })
        );
      } else {
        toast.error(response.message || "Failed to create company");
      }
    } catch (error) {
      toast.error(error.error || "Failed to create company");
    } finally {
      setModalLoading(false);
    }
  };

  // Handle input change for new company form
  const handleNewCompanyInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "planType" || name === "subscriptionStatus") {
      setNewCompany({
        ...newCompany,
        plan: {
          ...newCompany.plan,
          [name]: value,
        },
      });
    } else {
      setNewCompany({
        ...newCompany,
        [name]: value,
      });
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedCompanies.length === 0) return;

    try {
      setModalLoading(true);
      const promises = selectedCompanies.map((companyId) => {
        switch (bulkAction) {
          case "activate":
            return companyAPI.updateCompany(companyId, { isActive: true });
          case "deactivate":
            return companyAPI.updateCompany(companyId, { isActive: false });
          case "delete":
            return companyAPI.deleteCompany(companyId);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);

      toast.success(
        `Bulk action '${bulkAction}' completed successfully for ${selectedCompanies.length} companies`
      );
      setSelectedCompanies([]);
      setBulkAction("");
      setShowBulkConfirmModal(false);
      loadCompanies();
    } catch (error) {
      toast.error(
        `Failed to complete bulk action: ${error.error || error.message}`
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Confirm bulk action
  const confirmBulkAction = () => {
    if (!bulkAction || selectedCompanies.length === 0) return;
    setShowBulkConfirmModal(true);
  };

  // Handle row selection
  const handleRowSelected = (state) => {
    setSelectedCompanies(state.selectedRows.map((row) => row._id));
  };

  // Table columns
  const columns = [
    {
      name: "Company Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.contactEmail}</div>
        </div>
      ),
    },
    {
      name: "Contact",
      selector: (row) => row.contactEmail,
      sortable: true,
      cell: (row) => (
        <div>
          <div className="text-sm text-gray-900">{row.contactEmail}</div>
          <div className="text-xs text-gray-500">{row.phone || "N/A"}</div>
        </div>
      ),
    },
    {
      name: "Plan",
      selector: (row) => row.planId?.name || "Trial",
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.planId?.name === "Enterprise"
                ? "bg-purple-100 text-purple-800"
                : row.planId?.name === "Premium"
                ? "bg-blue-100 text-blue-800"
                : row.planId?.name === "Basic"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.planId?.name || "Free Trial"}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              row.isTrialPeriod
                ? "bg-yellow-100 text-yellow-800"
                : row.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {row.isTrialPeriod ? "Trial" : row.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      name: "Users",
      selector: (row) => row.userCount || 0,
      sortable: true,
      cell: (row) => (
        <div className="text-center">
          <span className="text-sm font-medium text-gray-900">
            {row.userCount || 0}
          </span>
          <div className="text-xs text-gray-500">Active Users</div>
        </div>
      ),
    },
    {
      name: "Last Activity",
      selector: (row) => row.lastActivity || row.createdAt,
      sortable: true,
      cell: (row) => (
        <div className="text-sm text-gray-900">
          {row.lastActivity
            ? new Date(row.lastActivity).toLocaleDateString()
            : new Date(row.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.isActive,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      name: "Created",
      selector: (row) => row.createdAt,
      sortable: true,
      cell: (row) => (
        <div className="text-sm text-gray-900">
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      name: "Created By",
      selector: (row) => row.createdBy?.name,
      sortable: true,
      cell: (row) => (
        <div className="text-sm text-gray-900">
          {row.createdBy?.name || "N/A"}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              setSelectedCompany(row);
              setShowDetailsModal(true);
            }}
          >
            View
          </button>
          <button
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              setSelectedCompany(row);
              setShowEditModal(true);
            }}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => {
              setSelectedCompany(row);
              setShowApproveModal(true);
            }}
          >
            Approve
          </button>
          <button
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => {
              setSelectedCompany(row);
              setShowDeleteModal(true);
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Filtered data
  const filteredData = companies.filter((company) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !company.name.toLowerCase().includes(searchLower) &&
        !company.contactEmail.toLowerCase().includes(searchLower) &&
        !(
          company.domain && company.domain.toLowerCase().includes(searchLower)
        ) &&
        !(company.phone && company.phone.toLowerCase().includes(searchLower))
      ) {
        return false;
      }
    }

    if (filters.status && company.isActive !== (filters.status === "active"))
      return false;
    if (filters.planType && company.planId?.name !== filters.planType)
      return false;
    if (
      filters.subscriptionStatus &&
      (company.isTrialPeriod ? "trialing" : "active") !==
        filters.subscriptionStatus
    )
      return false;

    return true;
  });

  // Get filtered data statistics
  const getFilteredStats = () => {
    const filtered = filteredData;
    return {
      total: filtered.length,
      active: filtered.filter((c) => c.isActive).length,
      inactive: filtered.filter((c) => !c.isActive).length,
      trial: filtered.filter((c) => c.isTrialPeriod).length,
      paid: filtered.filter((c) => !c.isTrialPeriod && c.isActive).length,
    };
  };

  const filteredStats = getFilteredStats();

  // Export companies data
  const exportCompanies = (format = "csv") => {
    if (format === "csv") {
      const headers = [
        "Name",
        "Email",
        "Phone",
        "Domain",
        "Status",
        "Plan",
        "Created Date",
      ];
      const csvContent = [
        headers.join(","),
        ...filteredData.map((company) =>
          [
            `"${company.name}"`,
            `"${company.contactEmail}"`,
            `"${company.phone || ""}"`,
            `"${company.domain || ""}"`,
            `"${company.isActive ? "Active" : "Inactive"}"`,
            `"${company.planId?.name || "Free Trial"}"`,
            `"${new Date(company.createdAt).toLocaleDateString()}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `companies_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Companies exported successfully");
    }
  };

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Super Admin Company Management
            </h1>
            <p className="text-gray-600">
              Manage all companies in the system with real-time updates
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/stripe-transactions"
              className="btn btn-secondary flex items-center gap-2"
            >
              💳 Stripe Transactions
            </a>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { text: "Dashboard", href: "/dashboard", icon: "📊" },
            {
              text: "Company Management",
              href: "/company-management",
              icon: "🏢",
            },
          ]}
        />
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search companies..."
              className="form-input w-full"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="form-select w-full"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan Type
            </label>
            <select
              className="form-select w-full"
              value={filters.planType}
              onChange={(e) => handleFilterChange("planType", e.target.value)}
            >
              <option value="">All Plans</option>
              <option value="Free Trial">Free Trial</option>
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subscription
            </label>
            <select
              className="form-select w-full"
              value={filters.subscriptionStatus}
              onChange={(e) =>
                handleFilterChange("subscriptionStatus", e.target.value)
              }
            >
              <option value="">All Subscriptions</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="btn btn-secondary w-full"
              onClick={() => {
                setFilters({
                  status: "",
                  planType: "",
                  subscriptionStatus: "",
                  search: "",
                });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              Clear Filters
            </button>
          </div>
          <div className="flex items-end">
            <button
              className="btn btn-success w-full"
              onClick={() => exportCompanies("csv")}
            >
              📊 Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Menu */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            onClick={() => setShowAddModal(true)}
          >
            <div className="text-2xl mb-2">🏢</div>
            <span className="text-sm font-medium text-gray-700">
              Add Company
            </span>
          </button>

          <button
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            onClick={() => exportCompanies("csv")}
          >
            <div className="text-2xl mb-2">📊</div>
            <span className="text-sm font-medium text-gray-700">
              Export Data
            </span>
          </button>

          <a
            href="/stripe-transactions"
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">💳</div>
            <span className="text-sm font-medium text-gray-700">
              Stripe Transactions
            </span>
          </a>

          <button
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            onClick={() => loadCompanies()}
          >
            <div className="text-2xl mb-2">🔄</div>
            <span className="text-sm font-medium text-gray-700">
              Refresh Data
            </span>
          </button>
        </div>
      </div>

      {/* Add Company Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            ➕ Add New Company
          </button>
        </div>
        <div className="flex gap-3">
          <a
            href="/stripe-transactions"
            className="btn btn-secondary flex items-center gap-2"
          >
            💳 Stripe Transactions
          </a>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedCompanies.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-700">
                {selectedCompanies.length} company(ies) selected
              </span>
              <select
                className="form-select w-48"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <option value="">Select Action</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="delete">Delete</option>
              </select>
              <button
                className="btn btn-primary"
                onClick={confirmBulkAction}
                disabled={!bulkAction}
              >
                Apply Action
              </button>
            </div>
            <button
              className="text-blue-600 hover:text-blue-800 text-sm"
              onClick={() => setSelectedCompanies([])}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Bulk Action Confirmation Modal */}
      {showBulkConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Confirm Bulk Action
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to <strong>{bulkAction}</strong>{" "}
                <strong>{selectedCompanies.length}</strong> selected
                company(ies)? This action cannot be undone.
              </p>

              <div className="flex justify-center space-x-4">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowBulkConfirmModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleBulkAction}
                  disabled={modalLoading}
                >
                  {modalLoading ? "Processing..." : `Confirm ${bulkAction}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Companies
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.overview.totalCompanies}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                🏢
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Companies
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.overview.activeCompanies}
                </p>
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
                  Trial Companies
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.planBreakdown.trial}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                🆓
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Paid Companies
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.planBreakdown.paid}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-500">
                💰
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtered Results Summary */}
      {filters.search ||
      filters.status ||
      filters.planType ||
      filters.subscriptionStatus ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-yellow-700">
                🔍 Filtered Results: {filteredStats.total} companies found
              </span>
              <div className="flex gap-2 text-xs text-yellow-600">
                <span>Active: {filteredStats.active}</span>
                <span>Inactive: {filteredStats.inactive}</span>
                <span>Trial: {filteredStats.trial}</span>
                <span>Paid: {filteredStats.paid}</span>
              </div>
            </div>
            <button
              className="text-yellow-600 hover:text-yellow-800 text-sm"
              onClick={() => {
                setFilters({
                  status: "",
                  planType: "",
                  subscriptionStatus: "",
                  search: "",
                });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : null}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          paginationServer
          paginationTotalRows={pagination.total}
          onChangePage={handlePageChange}
          progressPending={loading}
          responsive
          highlightOnHover
          striped
          subHeader
          selectableRows
          selectableRowsComponentProps={{
            color: "primary",
          }}
          onSelectedRowsChange={handleRowSelected}
          subHeaderComponent={
            <div className="w-full text-right py-2">
              <span className="text-sm text-gray-600">
                {filteredData.length} of {pagination.total} companies found
              </span>
            </div>
          }
        />
      </div>

      {/* Edit Company Modal */}
      {showEditModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Edit Company: {selectedCompany.name}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCompany(null);
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateCompany();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    value={selectedCompany.name}
                    onChange={(e) =>
                      setSelectedCompany({
                        ...selectedCompany,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-input w-full"
                    value={selectedCompany.contactEmail}
                    onChange={(e) =>
                      setSelectedCompany({
                        ...selectedCompany,
                        contactEmail: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Status
                  </label>
                  <select
                    className="form-select w-full"
                    value={selectedCompany.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      setSelectedCompany({
                        ...selectedCompany,
                        isActive: e.target.value === "active",
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Plan Type
                  </label>
                  <select
                    className="form-select w-full"
                    value={selectedCompany.planId?.name || "Free Trial"}
                    onChange={(e) =>
                      setSelectedCompany({
                        ...selectedCompany,
                        planId: {
                          ...selectedCompany.planId,
                          name: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="Free Trial">Free Trial</option>
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    value={selectedCompany.phone || ""}
                    onChange={(e) =>
                      setSelectedCompany({
                        ...selectedCompany,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Address
                  </label>
                  <textarea
                    className="form-textarea w-full"
                    value={selectedCompany.address || ""}
                    onChange={(e) =>
                      setSelectedCompany({
                        ...selectedCompany,
                        address: e.target.value,
                      })
                    }
                    rows={2}
                    placeholder="Enter company address"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    className="form-input w-full"
                    value={selectedCompany.website || ""}
                    onChange={(e) =>
                      setSelectedCompany({
                        ...selectedCompany,
                        website: e.target.value,
                      })
                    }
                    placeholder="Enter website URL"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Domain
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    value={selectedCompany.domain || ""}
                    onChange={(e) =>
                      setSelectedCompany({
                        ...selectedCompany,
                        domain: e.target.value,
                      })
                    }
                    placeholder="Enter company domain"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCompany(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Subscription Modal */}
      {showApproveModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Approve Subscription: {selectedCompany.name}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedCompany(null);
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleApproveSubscription();
              }}
            >
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Plan Type
                  </label>
                  <select
                    className="form-select w-full"
                    value={approvalData.planType}
                    onChange={(e) =>
                      setApprovalData({
                        ...approvalData,
                        planType: e.target.value,
                      })
                    }
                    required
                  >
                    {plansLoading ? (
                      <option>Loading plans...</option>
                    ) : (
                      plans.map((plan) => (
                        <option key={plan._id} value={plan.name}>
                          {plan.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Subscription Status
                  </label>
                  <select
                    className="form-select w-full"
                    value={approvalData.subscriptionStatus}
                    onChange={(e) =>
                      setApprovalData({
                        ...approvalData,
                        subscriptionStatus: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="active">Active</option>
                    <option value="trialing">Trialing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Trial Days
                  </label>
                  <input
                    type="number"
                    className="form-input w-full"
                    value={approvalData.trialDays}
                    onChange={(e) =>
                      setApprovalData({
                        ...approvalData,
                        trialDays: parseInt(e.target.value),
                      })
                    }
                    min="0"
                    max="365"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Notes
                  </label>
                  <textarea
                    className="form-textarea w-full"
                    value={approvalData.notes}
                    onChange={(e) =>
                      setApprovalData({
                        ...approvalData,
                        notes: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Optional notes about this approval..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedCompany(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? "Approving..." : "Approve Subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Delete Company
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <strong>{selectedCompany.name}</strong>? This action cannot be
                undone.
              </p>

              <div className="flex justify-center space-x-4">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCompany(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteCompany}
                  disabled={modalLoading}
                >
                  {modalLoading ? "Deleting..." : "Delete Company"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Add New Company
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowAddModal(false);
                  setNewCompany({
                    name: "",
                    email: "",
                    domain: "",
                    status: "active",
                    plan: {
                      planType: "trial",
                      subscriptionStatus: "trialing",
                    },
                  });
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateCompany();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-input w-full"
                    value={newCompany.name}
                    onChange={handleNewCompanyInputChange}
                    required
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-input w-full"
                    value={newCompany.email}
                    onChange={handleNewCompanyInputChange}
                    required
                    placeholder="Enter contact email"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Domain
                  </label>
                  <input
                    type="text"
                    name="domain"
                    className="form-input w-full"
                    value={newCompany.domain}
                    onChange={handleNewCompanyInputChange}
                    placeholder="Enter company domain (optional)"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    className="form-select w-full"
                    value={newCompany.status}
                    onChange={handleNewCompanyInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Initial Plan Type
                  </label>
                  <select
                    name="planType"
                    className="form-select w-full"
                    value={newCompany.plan.planType}
                    onChange={handleNewCompanyInputChange}
                  >
                    {plansLoading ? (
                      <option>Loading plans...</option>
                    ) : (
                      plans.map((plan) => (
                        <option key={plan._id} value={plan.name}>
                          {plan.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Subscription Status
                  </label>
                  <select
                    name="subscriptionStatus"
                    className="form-select w-full"
                    value={newCompany.plan.subscriptionStatus}
                    onChange={handleNewCompanyInputChange}
                  >
                    <option value="trialing">Trialing</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCompany({
                      name: "",
                      email: "",
                      domain: "",
                      status: "active",
                      plan: {
                        planType: "trial",
                        subscriptionStatus: "trialing",
                      },
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? "Creating..." : "Create Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Details Modal */}
      {showDetailsModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Company Details: {selectedCompany.name}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedCompany(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  Basic Information
                </h3>
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Company Name
                  </label>
                  <p className="text-gray-900">{selectedCompany.name}</p>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Contact Email
                  </label>
                  <p className="text-gray-900">
                    {selectedCompany.contactEmail}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Phone
                  </label>
                  <p className="text-gray-900">
                    {selectedCompany.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Website
                  </label>
                  <p className="text-gray-900">
                    {selectedCompany.website ? (
                      <a
                        href={selectedCompany.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {selectedCompany.website}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Domain
                  </label>
                  <p className="text-gray-900">
                    {selectedCompany.domain || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Address
                  </label>
                  <p className="text-gray-900">
                    {selectedCompany.address || "N/A"}
                  </p>
                </div>
              </div>

              {/* Plan & Subscription */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  Plan & Subscription
                </h3>
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Plan Type
                  </label>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedCompany.planId?.name === "Enterprise"
                        ? "bg-purple-100 text-purple-800"
                        : selectedCompany.planId?.name === "Premium"
                        ? "bg-blue-100 text-blue-800"
                        : selectedCompany.planId?.name === "Basic"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedCompany.planId?.name || "Free Trial"}
                  </span>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Subscription Status
                  </label>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedCompany.isTrialPeriod
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedCompany.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedCompany.isTrialPeriod
                      ? "Trial"
                      : selectedCompany.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Company Status
                  </label>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedCompany.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedCompany.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Created Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedCompany.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-1">
                    Created By
                  </label>
                  <p className="text-gray-900">
                    {selectedCompany.createdBy?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="btn btn-secondary mr-2"
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowEditModal(true);
                }}
              >
                Edit Company
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedCompany(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminCompanyManagement;
