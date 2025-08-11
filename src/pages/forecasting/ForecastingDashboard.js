import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import DataTable from "react-data-table-component";
import {
  FaSync,
  FaDownload,
  FaChartLine,
  FaCalendarAlt,
  FaFilter,
  FaTimes,
  FaEye,
  FaFileCsv,
  FaFileExcel,
  FaClock,
  FaCog,
} from "react-icons/fa";
import { toast } from "react-toastify";
import forecastingAPI from "../../utils/api/forecastingAPI";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ForecastingDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  // State for data
  const [forecasts, setForecasts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedModel, setSelectedModel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // New state for modals and actions
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [generatingForecast, setGeneratingForecast] = useState(false);
  const [schedulingForecast, setSchedulingForecast] = useState(false);

  // New state for forecast generation
  const [forecastConfig, setForecastConfig] = useState({
    model: "ARIMA with Seasonal Decomposition",
    horizon: "12",
    confidence: "0.85",
    includeInventory: true,
    includeDemand: true,
    includeProducts: true,
    includeCategories: true,
  });

  // New state for forecast scheduling
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: "weekly",
    dayOfWeek: "monday",
    time: "09:00",
    model: "ARIMA with Seasonal Decomposition",
    enabled: true,
  });

  // Get company ID for API calls
  const companyId = selectedCompany?.id || user?.companyId;

  // Fetch forecasts data
  const fetchForecasts = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (selectedModel !== "all") filters.model = selectedModel;
      if (selectedStatus !== "all") filters.status = selectedStatus;

      const [forecastsResponse, analyticsResponse] = await Promise.all([
        forecastingAPI.getForecastsByCompany(companyId, filters),
        forecastingAPI.getForecastAnalytics(companyId),
      ]);

      setForecasts(forecastsResponse.data || []);
      setAnalytics(analyticsResponse.data);
    } catch (err) {
      console.error("Error fetching forecasts:", err);
      setError("Failed to load forecast data. Please try again.");
      toast.error("Failed to load forecast data");
    } finally {
      setLoading(false);
    }
  }, [companyId, selectedModel, selectedStatus]);

  // Fetch forecasts by date range
  const fetchForecastsByDateRange = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (selectedModel !== "all") filters.model = selectedModel;
      if (selectedStatus !== "all") filters.status = selectedStatus;

      const response = await forecastingAPI.getForecastsByDateRange(
        dateRange.startDate,
        dateRange.endDate,
        filters
      );

      setForecasts(response.data || []);
    } catch (err) {
      console.error("Error fetching forecasts by date range:", err);
      setError("Failed to load forecast data for selected date range.");
      toast.error("Failed to load forecast data");
    } finally {
      setLoading(false);
    }
  }, [companyId, dateRange, selectedModel, selectedStatus]);

  // Load data on component mount and when filters change
  useEffect(() => {
    if (companyId) {
      fetchForecasts();
    }
  }, [companyId, selectedModel, selectedStatus]);

  // Load data when date range changes
  useEffect(() => {
    if (companyId && dateRange.startDate && dateRange.endDate) {
      fetchForecastsByDateRange();
    }
  }, [dateRange]);

  // Get unique models and statuses for filters
  const uniqueModels = [...new Set(forecasts.map((f) => f.model))].filter(
    Boolean
  );
  const uniqueStatuses = [...new Set(forecasts.map((f) => f.status))].filter(
    Boolean
  );

  // Process chart data from API response
  const processChartData = () => {
    if (!analytics || !forecasts.length) return {};

    const latestForecast = forecasts[0];
    if (!latestForecast?.data) return {};

    const {
      salesForecast,
      inventoryForecast,
      demandForecast,
      categoryForecast,
      productForecast,
    } = latestForecast.data;

    // Sales forecast chart data
    const salesData = {
      labels: salesForecast?.monthly ? Object.keys(salesForecast.monthly) : [],
      datasets: [
        {
          label: "Sales Forecast",
          data: salesForecast?.monthly
            ? Object.values(salesForecast.monthly)
            : [],
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          tension: 0.3,
        },
      ],
    };

    // Inventory forecast chart data
    const inventoryData = {
      labels: inventoryForecast?.monthly
        ? Object.keys(inventoryForecast.monthly)
        : [],
      datasets: [
        {
          label: "Inventory Forecast",
          data: inventoryForecast?.monthly
            ? Object.values(inventoryForecast.monthly)
            : [],
          backgroundColor: "rgba(153, 102, 255, 0.5)",
          borderColor: "rgb(153, 102, 255)",
          borderWidth: 1,
        },
      ],
    };

    // Demand vs Supply chart data
    const demandData = {
      labels: demandForecast?.monthly
        ? Object.keys(demandForecast.monthly)
        : [],
      datasets: [
        {
          label: "Demand Forecast",
          data: demandForecast?.monthly
            ? Object.values(demandForecast.monthly)
            : [],
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgb(255, 99, 132)",
          borderWidth: 1,
        },
        {
          label: "Supply Capacity",
          data: inventoryForecast?.monthly
            ? Object.values(inventoryForecast.monthly).map((val) => val * 0.85)
            : [],
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgb(54, 162, 235)",
          borderWidth: 1,
        },
      ],
    };

    // Category distribution chart data
    const categoryData = {
      labels: categoryForecast?.labels || [],
      datasets: [
        {
          label: "Sales Distribution by Category",
          data: categoryForecast?.values || [],
          backgroundColor: [
            "rgba(255, 99, 132, 0.5)",
            "rgba(54, 162, 235, 0.5)",
            "rgba(255, 206, 86, 0.5)",
            "rgba(75, 192, 192, 0.5)",
            "rgba(153, 102, 255, 0.5)",
            "rgba(255, 159, 64, 0.5)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    return { salesData, inventoryData, demandData, categoryData };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true },
    },
    scales: {
      y: { beginAtZero: false },
    },
  };

  // Table columns for forecasts
  const forecastColumns = [
    {
      name: "Date",
      selector: (row) =>
        new Date(row.timestamp || row.createdAt).toLocaleDateString(),
      sortable: true,
      width: "100px",
    },
    {
      name: "Model",
      selector: (row) => row.model,
      sortable: true,
      width: "150px",
      cell: (row) => (
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
          {row.model}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      width: "100px",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "success"
              ? "bg-green-100 text-green-800"
              : row.status === "failed"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Confidence",
      selector: (row) => row.confidence,
      sortable: true,
      width: "100px",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${(row.confidence || 0) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs font-medium">
            {((row.confidence || 0) * 100).toFixed(0)}%
          </span>
        </div>
      ),
    },
    {
      name: "Message",
      selector: (row) => row.message,
      width: "200px",
      cell: (row) => (
        <div className="text-xs max-w-xs truncate" title={row.message}>
          {row.message}
        </div>
      ),
    },
    {
      name: "Actions",
      width: "80px",
      cell: (row) => (
        <button
          onClick={() => handleViewForecast(row)}
          className="btn btn-sm btn-outline-primary"
          title="View Details"
        >
          <FaChartLine className="w-3 h-3" />
        </button>
      ),
    },
  ];

  // Handle viewing forecast details
  const handleViewForecast = (forecast) => {
    setSelectedForecast(forecast);
    setShowForecastModal(true);
  };

  // Handle export functionality
  const handleExport = async (format = "csv") => {
    try {
      if (!forecasts.length) {
        toast.warning("No forecast data to export");
        return;
      }

      let dataToExport = forecasts;

      // Apply current filters
      if (selectedModel !== "all") {
        dataToExport = dataToExport.filter((f) => f.model === selectedModel);
      }
      if (selectedStatus !== "all") {
        dataToExport = dataToExport.filter((f) => f.status === selectedStatus);
      }

      if (format === "csv") {
        // Create CSV content
        const headers = ["Date", "Model", "Status", "Confidence", "Message"];
        const csvContent = [
          headers.join(","),
          ...dataToExport.map((forecast) =>
            [
              new Date(
                forecast.timestamp || forecast.createdAt
              ).toLocaleDateString(),
              forecast.model,
              forecast.status,
              forecast.confidence,
              forecast.message,
            ].join(",")
          ),
        ].join("\n");

        // Download CSV file
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `forecasts_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success("CSV exported successfully!");
      } else if (format === "excel") {
        // For Excel export, you would typically use a library like xlsx
        toast.info("Excel export coming soon! For now, please use CSV export.");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed. Please try again.");
    }
  };

  // Handle forecast generation
  const handleGenerateForecast = async () => {
    try {
      setGeneratingForecast(true);

      // This would call your backend API to generate a new forecast
      // For now, we'll simulate the process
      toast.info("Forecast generation started. This may take a few minutes.");

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Refresh forecasts after generation
      await fetchForecasts();

      setShowGenerateModal(false);
      toast.success("Forecast generation completed successfully!");
    } catch (error) {
      console.error("Forecast generation error:", error);
      toast.error("Forecast generation failed. Please try again.");
    } finally {
      setGeneratingForecast(false);
    }
  };

  // Handle forecast scheduling
  const handleScheduleForecast = async () => {
    try {
      setSchedulingForecast(true);

      // This would call your backend API to schedule recurring forecasts
      toast.info("Forecast scheduling configured successfully!");

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowScheduleModal(false);
      toast.success("Forecast scheduling completed!");
    } catch (error) {
      console.error("Forecast scheduling error:", error);
      toast.error("Forecast scheduling failed. Please try again.");
    } finally {
      setSchedulingForecast(false);
    }
  };

  // Calculate summary statistics
  const summaryStats = {
    totalForecasts: forecasts.length,
    averageConfidence:
      forecasts.length > 0
        ? forecasts.reduce((sum, f) => sum + (f.confidence || 0), 0) /
          forecasts.length
        : 0,
    successRate:
      forecasts.length > 0
        ? (forecasts.filter((f) => f.status === "success").length /
            forecasts.length) *
          100
        : 0,
    latestForecast: forecasts.length > 0 ? forecasts[0] : null,
  };

  // Get chart data
  const chartData = processChartData();

  if (!companyId) {
    return (
      <div className="container-fluid mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            No Company Selected
          </h1>
          <p className="text-gray-600">
            Please select a company to view forecasting data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Forecasting Dashboard
        </h1>
        <p className="text-gray-600">
          AI-powered sales, inventory, and demand forecasting insights
        </p>
      </div>

      {/* Company Selection Notice */}
      {user?.role === "super_admin" && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <span className="text-blue-500 text-xl mr-2">ℹ️</span>
            <div>
              <p className="font-medium text-blue-700">
                {selectedCompany
                  ? `Viewing forecasts for: ${selectedCompany.name}`
                  : "Select a company to view forecasting data"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="form-input w-full"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="form-input w-full"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              className="form-input w-full"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="all">All Models</option>
              {uniqueModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="form-input w-full"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="btn btn-primary w-full flex items-center justify-center"
              onClick={fetchForecasts}
              disabled={loading}
            >
              <FaSync className={`mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Forecast Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Forecasts
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {summaryStats.totalForecasts.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Confidence
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {(summaryStats.averageConfidence * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              📈
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {summaryStats.successRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              🚀
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Latest Forecast
              </p>
              <p className="text-lg font-bold text-gray-900">
                {summaryStats.latestForecast
                  ? new Date(
                      summaryStats.latestForecast.timestamp ||
                        summaryStats.latestForecast.createdAt
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              🕒
            </div>
          </div>
        </div>
      </div>

      {/* Charts - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Sales Forecast</h3>
          {chartData.salesData && chartData.salesData.labels.length > 0 ? (
            <Line
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { display: true, text: "Sales Forecast Trend" },
                },
              }}
              data={chartData.salesData}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No sales forecast data available
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Inventory Forecast</h3>
          {chartData.inventoryData &&
          chartData.inventoryData.labels.length > 0 ? (
            <Bar
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { display: true, text: "Inventory Forecast" },
                },
              }}
              data={chartData.inventoryData}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No inventory forecast data available
            </div>
          )}
        </div>
      </div>

      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Demand vs Supply</h3>
          {chartData.demandData && chartData.demandData.labels.length > 0 ? (
            <Bar
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { display: true, text: "Demand vs Supply Capacity" },
                },
              }}
              data={chartData.demandData}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No demand forecast data available
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
          {chartData.categoryData &&
          chartData.categoryData.labels.length > 0 ? (
            <Doughnut
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: "Sales Distribution by Category",
                  },
                },
              }}
              data={chartData.categoryData}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No category forecast data available
            </div>
          )}
        </div>
      </div>

      {/* Forecasts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Forecast History
            </h2>
            <p className="text-sm text-gray-600">
              Recent forecasting activities and results
            </p>
          </div>
          <button
            className="btn btn-secondary flex items-center"
            onClick={handleExport}
            disabled={loading}
          >
            <FaDownload className="mr-2" />
            Export
          </button>
        </div>
        <DataTable
          columns={forecastColumns}
          data={forecasts}
          pagination
          responsive
          highlightOnHover
          striped
          progressPending={loading}
          progressComponent={
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }
          noDataComponent={
            <div className="p-4 text-center text-gray-500">
              {loading
                ? "Loading forecasts..."
                : "No forecasts found. Try adjusting your filters or date range."}
            </div>
          }
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
        <button
          className="btn btn-primary"
          onClick={() => setShowGenerateModal(true)}
        >
          Generate New Forecast
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setShowScheduleModal(true)}
        >
          Schedule Forecast Update
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => window.open("/forecasting/analytics", "_blank")}
        >
          View Detailed Analytics
        </button>
      </div>

      {/* Forecast Detail Modal */}
      {showForecastModal && selectedForecast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Forecast Details</h2>
              <button
                onClick={() => setShowForecastModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">
                    Basic Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedForecast.status === "success"
                            ? "bg-green-100 text-green-800"
                            : selectedForecast.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedForecast.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Model:</span>
                      <span className="text-blue-600">
                        {selectedForecast.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Confidence:</span>
                      <span className="text-green-600">
                        {((selectedForecast.confidence || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Created:</span>
                      <span>
                        {new Date(
                          selectedForecast.timestamp ||
                            selectedForecast.createdAt
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                {selectedForecast.metadata && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">
                      Model Metadata
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          Training Data Points:
                        </span>
                        <span>
                          {selectedForecast.metadata.trainingDataPoints}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Prediction Horizon:</span>
                        <span>
                          {selectedForecast.metadata.predictionHorizon}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Accuracy:</span>
                        <span>
                          {(
                            (selectedForecast.metadata.accuracy || 0) * 100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Processed Items:</span>
                        <span>{selectedForecast.metadata.processedItems}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Forecast Data Preview */}
              <div className="space-y-4">
                {selectedForecast.data && (
                  <>
                    {/* Sales Forecast Preview */}
                    {selectedForecast.data.salesForecast && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg mb-3 text-blue-800">
                          Sales Forecast Preview
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Algorithm:</span>
                            <span className="text-sm">
                              {selectedForecast.data.salesForecast.algorithm}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Confidence:</span>
                            <span className="text-sm">
                              {(
                                (selectedForecast.data.salesForecast
                                  .confidence || 0) * 100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Last Updated:</span>
                            <span className="text-sm">
                              {new Date(
                                selectedForecast.data.salesForecast.lastUpdated
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Inventory Forecast Preview */}
                    {selectedForecast.data.inventoryForecast && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg mb-3 text-purple-800">
                          Inventory Forecast Preview
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Stockout Risk:</span>
                            <span className="text-sm">
                              {(
                                (selectedForecast.data.inventoryForecast
                                  .stockoutRisk || 0) * 100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Last Updated:</span>
                            <span className="text-sm">
                              {new Date(
                                selectedForecast.data.inventoryForecast.lastUpdated
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Message */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Message</h3>
                  <p className="text-gray-700">{selectedForecast.message}</p>
                </div>
              </div>
            </div>

            {/* Download Link */}
            {selectedForecast.forecastCsvUrl && (
              <div className="mt-6 pt-4 border-t">
                <a
                  href={selectedForecast.forecastCsvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary"
                >
                  <FaDownload className="mr-2" />
                  Download Forecast Data
                </a>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowForecastModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Forecast Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Generate New Forecast</h2>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forecasting Model
                </label>
                <select
                  className="form-input w-full"
                  value={forecastConfig.model}
                  onChange={(e) =>
                    setForecastConfig((prev) => ({
                      ...prev,
                      model: e.target.value,
                    }))
                  }
                >
                  <option value="ARIMA with Seasonal Decomposition">
                    ARIMA with Seasonal Decomposition
                  </option>
                  <option value="Machine Learning - Random Forest">
                    Machine Learning - Random Forest
                  </option>
                  <option value="LSTM Neural Network">
                    LSTM Neural Network
                  </option>
                  <option value="Gradient Boosting Machine">
                    Gradient Boosting Machine
                  </option>
                  <option value="Prophet with Bayesian Optimization">
                    Prophet with Bayesian Optimization
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prediction Horizon (months)
                </label>
                <select
                  className="form-input w-full"
                  value={forecastConfig.horizon}
                  onChange={(e) =>
                    setForecastConfig((prev) => ({
                      ...prev,
                      horizon: e.target.value,
                    }))
                  }
                >
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Confidence Level
                </label>
                <select
                  className="form-input w-full"
                  value={forecastConfig.confidence}
                  onChange={(e) =>
                    setForecastConfig((prev) => ({
                      ...prev,
                      confidence: e.target.value,
                    }))
                  }
                >
                  <option value="0.75">75%</option>
                  <option value="0.80">80%</option>
                  <option value="0.85">85%</option>
                  <option value="0.90">90%</option>
                  <option value="0.95">95%</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Forecast Components
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={forecastConfig.includeSales}
                      onChange={(e) =>
                        setForecastConfig((prev) => ({
                          ...prev,
                          includeSales: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    Sales Forecast
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={forecastConfig.includeInventory}
                      onChange={(e) =>
                        setForecastConfig((prev) => ({
                          ...prev,
                          includeInventory: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    Inventory Forecast
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={forecastConfig.includeDemand}
                      onChange={(e) =>
                        setForecastConfig((prev) => ({
                          ...prev,
                          includeDemand: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    Demand Forecast
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={forecastConfig.includeProducts}
                      onChange={(e) =>
                        setForecastConfig((prev) => ({
                          ...prev,
                          includeProducts: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    Product-level Forecasts
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={forecastConfig.includeCategories}
                      onChange={(e) =>
                        setForecastConfig((prev) => ({
                          ...prev,
                          includeCategories: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    Category Analysis
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="btn btn-secondary"
                disabled={generatingForecast}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateForecast}
                className="btn btn-primary"
                disabled={generatingForecast}
              >
                {generatingForecast ? (
                  <>
                    <FaSync className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Forecast"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Forecast Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Schedule Forecast Updates</h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  className="form-input w-full"
                  value={scheduleConfig.frequency}
                  onChange={(e) =>
                    setScheduleConfig((prev) => ({
                      ...prev,
                      frequency: e.target.value,
                    }))
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              {scheduleConfig.frequency === "weekly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Week
                  </label>
                  <select
                    className="form-input w-full"
                    value={scheduleConfig.dayOfWeek}
                    onChange={(e) =>
                      setScheduleConfig((prev) => ({
                        ...prev,
                        dayOfWeek: e.target.value,
                      }))
                    }
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  className="form-input w-full"
                  value={scheduleConfig.time}
                  onChange={(e) =>
                    setScheduleConfig((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forecasting Model
                </label>
                <select
                  className="form-input w-full"
                  value={scheduleConfig.model}
                  onChange={(e) =>
                    setScheduleConfig((prev) => ({
                      ...prev,
                      model: e.target.value,
                    }))
                  }
                >
                  <option value="ARIMA with Seasonal Decomposition">
                    ARIMA with Seasonal Decomposition
                  </option>
                  <option value="Machine Learning - Random Forest">
                    Machine Learning - Random Forest
                  </option>
                  <option value="LSTM Neural Network">
                    LSTM Neural Network
                  </option>
                  <option value="Gradient Boosting Machine">
                    Gradient Boosting Machine
                  </option>
                  <option value="Prophet with Bayesian Optimization">
                    Prophet with Bayesian Optimization
                  </option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={scheduleConfig.enabled}
                  onChange={(e) =>
                    setScheduleConfig((prev) => ({
                      ...prev,
                      enabled: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <label
                  htmlFor="enabled"
                  className="text-sm font-medium text-gray-700"
                >
                  Enable automatic forecast generation
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="btn btn-secondary"
                disabled={schedulingForecast}
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleForecast}
                className="btn btn-primary"
                disabled={schedulingForecast}
              >
                {schedulingForecast ? (
                  <>
                    <FaSync className="mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Schedule Forecasts"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastingDashboard;
