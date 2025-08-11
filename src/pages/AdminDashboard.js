import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Pie, Bar } from "react-chartjs-2";
import DataTable from "react-data-table-component";
import Breadcrumb from "../components/Breadcrumb";
import { adminAPI } from "../utils/api";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany, companies } = useSelector((state) => state.company);

  const [timeframe, setTimeframe] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      const response = await adminAPI.getAnalytics(30);
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  // Fetch system health
  const fetchSystemHealth = async () => {
    try {
      const response = await adminAPI.getHealth();
      if (response.data.success) {
        setSystemHealth(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching system health:", err);
    }
  };

  // Perform maintenance action
  const performMaintenance = async (action, options = {}) => {
    try {
      const response = await adminAPI.performMaintenance(action, options);
      if (response.data.success) {
        toast.success(response.data.message || "Maintenance completed successfully");
        // Refresh data after maintenance
        fetchDashboardData();
        fetchSystemHealth();
      }
    } catch (err) {
      console.error("Error performing maintenance:", err);
      toast.error("Failed to perform maintenance action");
    }
  };

  useEffect(() => {
    if (user?.role === "super_admin") {
      fetchDashboardData();
      fetchAnalyticsData();
      fetchSystemHealth();
    }
  }, [user]);

  // Chart data from API or fallback to static data
  const userRolesData = dashboardData?.charts?.userRoles || {
    labels: [
      "Super Admin",
      "Company Admin",
      "Store Manager",
      "Analyst",
      "Auditor",
    ],
    datasets: [
      {
        label: "Users by Role",
        data: [2, 8, 15, 10, 5],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const companySubscriptionsData = dashboardData?.charts?.companySubscriptions || {
    labels: ["Premium", "Yearly", "Simple"],
    datasets: [
      {
        label: "Subscriptions",
        data: [12, 19, 8],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
        ],
      },
    ],
  };

  const revenueByCompanyData = dashboardData?.charts?.revenueByCompany || {
    labels: companies.map((company) => company.name),
    datasets: [
      {
        label: "Revenue",
        data: [45000, 32000, 28000, 15000, 22000],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Table data from API or fallback to static data
  const recentActivitiesData = dashboardData?.tables?.recentActivities?.data || [
    {
      id: 1,
      user: "John Doe",
      action: "User Login",
      company: "NextGen Retail Corp",
      timestamp: "2023-06-15 14:30:22",
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "Updated Inventory",
      company: "Fashion Forward Inc",
      timestamp: "2023-06-15 13:45:10",
    },
    {
      id: 3,
      user: "Bob Johnson",
      action: "Added New Product",
      company: "Tech Gadgets Ltd",
      timestamp: "2023-06-15 12:20:05",
    },
  ];

  const newCompaniesData = dashboardData?.tables?.newCompanies?.data || [
    {
      id: 1,
      name: "NextGen Retail Corp",
      subscription: "Premium",
      users: 12,
      joined: "2023-01-01",
      status: "Active",
    },
    {
      id: 2,
      name: "Fashion Forward Inc",
      subscription: "Yearly",
      users: 8,
      joined: "2023-02-15",
      status: "Active",
    },
    {
      id: 3,
      name: "Tech Gadgets Ltd",
      subscription: "Simple",
      users: 5,
      joined: "2023-03-20",
      status: "Active",
    },
  ];

  // Table columns
  const recentActivitiesColumns = dashboardData?.tables?.recentActivities?.columns || [
    { name: "User", selector: (row) => row.user, sortable: true },
    { name: "Action", selector: (row) => row.action, sortable: true },
    { name: "Company", selector: (row) => row.company, sortable: true },
    { name: "Timestamp", selector: (row) => row.timestamp, sortable: true },
  ];

  const newCompaniesColumns = dashboardData?.tables?.newCompanies?.columns || [
    { name: "Company Name", selector: (row) => row.name, sortable: true },
    {
      name: "Subscription",
      selector: (row) => row.subscription,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.subscription === "Premium"
              ? "bg-purple-100 text-purple-800"
              : row.subscription === "Yearly"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {row.subscription}
        </span>
      ),
    },
    { name: "Users", selector: (row) => row.users, sortable: true },
    { name: "Joined", selector: (row) => row.joined, sortable: true },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  if (loading) {
    return (
      <div className="container-fluid mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid mx-auto px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <button
            onClick={fetchDashboardData}
            className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">
          System overview and management statistics
        </p>
        {systemHealth && (
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-sm text-gray-500">System Status:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                systemHealth.status === "Healthy"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {systemHealth.status}
            </span>
            <span className="text-sm text-gray-500">
              Uptime: {systemHealth.uptime?.process}
            </span>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Companies
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.overview?.companies?.total || companies.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">🏢</div>
          </div>
          <p className="mt-2 text-sm text-blue-600">
            {dashboardData?.overview?.companies?.active || 0} active
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.overview?.users?.total || 42}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              👥
            </div>
          </div>
          <p className="mt-2 text-sm text-green-600">
            {dashboardData?.overview?.users?.verified || 0} verified
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Plans
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.overview?.plans?.active || 4}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              📱
            </div>
          </div>
          <p className="mt-2 text-sm text-purple-600">
            {dashboardData?.overview?.plans?.total || 5} total plans
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemHealth?.status || "Unknown"}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              💰
            </div>
          </div>
          <p className="mt-2 text-sm text-yellow-600">
            {systemHealth?.activeConnections || 0} active connections
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Revenue by Company
            </h2>
            <select
              className="form-input py-1 px-2 text-sm"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="h-80">
            <Bar data={revenueByCompanyData} options={chartOptions} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Users by Role
            </h2>
            <div className="h-64">
              <Pie data={userRolesData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Subscription Types
            </h2>
            <div className="h-64">
              <Pie data={companySubscriptionsData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Activities
          </h2>
          <DataTable
            columns={recentActivitiesColumns}
            data={recentActivitiesData}
            pagination
            responsive
            highlightOnHover
            striped
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Companies
          </h2>
          <DataTable
            columns={newCompaniesColumns}
            data={newCompaniesData}
            pagination
            responsive
            highlightOnHover
            striped
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/company-management" className="btn btn-primary">
            🏢 Company Management
          </a>
          <a href="/user-management" className="btn btn-secondary">
            👥 Manage Users
          </a>
          <a href="/stripe-transactions" className="btn btn-warning">
            💳 Stripe Transactions
          </a>
          <button
            onClick={() => performMaintenance("cleanup-audit-logs")}
            className="btn btn-info"
          >
            🧹 Cleanup Logs
          </button>
          <button
            onClick={() => performMaintenance("optimize-database")}
            className="btn btn-success"
          >
            ⚡ Optimize DB
          </button>
          <button
            onClick={() => performMaintenance("backup-data")}
            className="btn btn-warning"
          >
            💾 Backup Data
          </button>
        </div>
      </div>

      {/* System Health Details */}
      {systemHealth && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            System Health Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Memory Usage</p>
              <p className="text-lg font-semibold">
                {systemHealth.memory?.heapUsed || "N/A"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Active Connections</p>
              <p className="text-lg font-semibold">
                {systemHealth.activeConnections || "N/A"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Environment</p>
              <p className="text-lg font-semibold">
                {systemHealth.environment || "N/A"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-lg font-semibold">
                {new Date(systemHealth.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
