import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Bar, Line, Pie } from "react-chartjs-2";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import DataTable from "react-data-table-component";
import systemAPI from "../utils/api/systemAPI";
import { FaSpinner } from "react-icons/fa";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Chart options for all charts
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
};

// Sample data will be replaced by API data

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  const [timeframe, setTimeframe] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  
  // State for chart data
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [recentSalesData, setRecentSalesData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get company ID if available
        const companyId = selectedCompany?.id || null;
        
        // Fetch dashboard data from API
        const response = await systemAPI.getDashboardData(companyId);
        
        if (response.success && response.data) {
          setDashboardData(response.data);
          
          // Set chart data from API response
          if (response.data.salesData) {
            setSalesData(response.data.salesData);
          }
          
          if (response.data.inventoryData) {
            setInventoryData(response.data.inventoryData);
          }
          
          if (response.data.revenueData) {
            setRevenueData(response.data.revenueData);
          }
          
          // Set table data
          setRecentSalesData(response.data.recentSalesData || []);
          setLowStockItems(response.data.lowStockItems || []);
        } else {
          throw new Error("Failed to fetch dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "An error occurred while fetching dashboard data");
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [selectedCompany]);

  // Table columns
  const recentSalesColumns = [
    { name: "Product", selector: (row) => row.product, sortable: true },
    { name: "Customer", selector: (row) => row.customer, sortable: true },
    { name: "Date", selector: (row) => row.date, sortable: true },
    { name: "Amount", selector: (row) => `$${row.amount}`, sortable: true },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.status === "Completed"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  const lowStockColumns = [
    { name: "Product", selector: (row) => row.product, sortable: true },
    { name: "Category", selector: (row) => row.category, sortable: true },
    { name: "Quantity", selector: (row) => row.quantity, sortable: true },
    { name: "Threshold", selector: (row) => row.threshold, sortable: true },
    {
      name: "Status",
      cell: (row) => (
        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
          Low Stock
        </span>
      ),
    },
  ];

  // Chart options are defined at the top of the file

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.name}! Here's what's happening with your store
          today.
        </p>
      </div>

      {/* Company Selection Notice for Super Admin */}
      {user?.role === "super_admin" && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <span className="text-blue-500 text-xl mr-2">ℹ️</span>
            <div>
              <p className="font-medium text-blue-700">
                {selectedCompany
                  ? `Viewing data for: ${selectedCompany.name}`
                  : "Please select a company from the dropdown in the header to view specific data"}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-blue-600 text-4xl" />
          <span className="ml-2 text-lg text-gray-700">Loading dashboard data...</span>
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            className="mt-2 text-sm underline" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Overview */}
      {!loading && !error && dashboardData && (
        <>
          {/* Company Info Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-900">{dashboardData.companyName}</h2>
                <div className="flex items-center mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${dashboardData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {dashboardData.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="ml-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                    {dashboardData.planStatus}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-sm font-medium text-gray-500">Plan expires in</div>
                <div className="text-lg font-bold text-gray-900">{dashboardData.daysRemaining} days</div>
              </div>
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.userCount}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                  👥
                </div>
              </div>
              <p className="mt-2 text-sm text-blue-600">Active accounts</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Plan Status</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.planStatus}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-500">📋</div>
              </div>
              <p className="mt-2 text-sm text-green-600">{dashboardData.daysRemaining} days remaining</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Inventory Categories
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.inventoryData?.labels?.length || 0}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 text-purple-500">
                  📦
                </div>
              </div>
              <p className="mt-2 text-sm text-purple-600">Product categories</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Low Stock Items
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
                </div>
                <div className="p-3 rounded-full bg-red-100 text-red-500">⚠️</div>
              </div>
              <p className="mt-2 text-sm text-red-600">{lowStockItems.length > 0 ? 'Action needed' : 'Stock levels good'}</p>
            </div>
          </div>
        </>
      )}

      {/* Charts */}
      {!loading && !error && dashboardData && salesData && revenueData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Sales Overview
              </h2>
              <select
                className="form-input py-1 px-2 text-sm"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="h-80">
              <Bar data={salesData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Revenue Trends
            </h2>
            <div className="h-80">
              <Line data={revenueData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {!loading && !error && dashboardData && inventoryData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Sales
            </h2>
            {recentSalesData && recentSalesData.length > 0 ? (
              <DataTable
                columns={recentSalesColumns}
                data={recentSalesData}
                pagination
                responsive
                highlightOnHover
                striped
                noDataComponent={
                  <div className="p-4 text-center text-gray-500">No recent sales data available</div>
                }
              />
            ) : (
              <div className="p-8 text-center">
                <div className="bg-gray-50 rounded-lg p-6 inline-block shadow-sm border border-gray-200">
                  <div className="text-gray-400 text-5xl mb-3">🛒</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">
                    No recent sales data
                  </h3>
                  <p className="text-gray-500">
                    Sales data will appear here once available
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Inventory by Category
            </h2>
            <div className="h-64">
              <Pie data={inventoryData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Items */}
      {!loading && !error && dashboardData && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Low Stock Items
          </h2>
          {lowStockItems && lowStockItems.length > 0 ? (
            <DataTable
              columns={lowStockColumns}
              data={lowStockItems}
              pagination
              responsive
              highlightOnHover
              striped
              noDataComponent={
                <div className="p-4 text-center text-gray-500">No low stock items found</div>
              }
            />
          ) : (
            <div className="p-8 text-center">
              <div className="bg-gray-50 rounded-lg p-6 inline-block shadow-sm border border-gray-200">
                <div className="text-gray-400 text-5xl mb-3">✅</div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  No low stock items
                </h3>
                <p className="text-gray-500">
                  All inventory items are at healthy stock levels
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
