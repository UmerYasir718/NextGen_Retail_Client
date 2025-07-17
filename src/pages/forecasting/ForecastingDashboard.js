import React, { useState } from "react";
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
import { Line, Bar, Pie } from "react-chartjs-2";
import DataTable from "react-data-table-component";

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
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedYear, setSelectedYear] = useState("2023");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Sample data for forecasting
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const quarters = ["Q1", "Q2", "Q3", "Q4"];

  // Sales forecast data
  const salesForecastData = {
    monthly: {
      2023: [
        42000, 38000, 52000, 48000, 54000, 59000, 65000, 61000, 68000, 74000,
        78000, 85000,
      ],
      2022: [
        35000, 32000, 40000, 38000, 45000, 48000, 52000, 50000, 55000, 60000,
        65000, 70000,
      ],
    },
    quarterly: {
      2023: [132000, 161000, 194000, 237000],
      2022: [107000, 131000, 157000, 195000],
    },
  };

  // Inventory forecast data
  const inventoryForecastData = {
    monthly: {
      2023: [
        1200, 1150, 1300, 1250, 1400, 1450, 1500, 1550, 1600, 1650, 1700, 1750,
      ],
      2022: [
        1000, 950, 1100, 1050, 1200, 1250, 1300, 1350, 1400, 1450, 1500, 1550,
      ],
    },
    quarterly: {
      2023: [3650, 4100, 4650, 5100],
      2022: [3050, 3500, 4050, 4500],
    },
  };

  // Demand forecast data
  const demandForecastData = {
    monthly: {
      2023: [
        850, 800, 950, 900, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350,
      ],
      2022: [700, 650, 800, 750, 850, 900, 950, 1000, 1050, 1100, 1150, 1200],
    },
    quarterly: {
      2023: [2600, 2950, 3450, 3900],
      2022: [2150, 2500, 3000, 3450],
    },
  };

  // Get labels based on selected period
  const labels = selectedPeriod === "monthly" ? months : quarters;

  // Get data based on selected period, year and category
  const getSalesData = () => {
    return salesForecastData[selectedPeriod][selectedYear] || [];
  };

  const getInventoryData = () => {
    return inventoryForecastData[selectedPeriod][selectedYear] || [];
  };

  const getDemandData = () => {
    return demandForecastData[selectedPeriod][selectedYear] || [];
  };

  // Sales trend chart data
  const salesTrendData = {
    labels,
    datasets: [
      {
        label: `${selectedYear} Sales Forecast`,
        data: getSalesData(),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.3,
      },
      {
        label: `${parseInt(selectedYear) - 1} Sales Actual`,
        data:
          salesForecastData[selectedPeriod][parseInt(selectedYear) - 1] || [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderDash: [5, 5],
        tension: 0.3,
      },
    ],
  };

  // Inventory forecast chart data
  const inventoryForecastChartData = {
    labels,
    datasets: [
      {
        label: "Inventory Forecast",
        data: getInventoryData(),
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        borderColor: "rgb(153, 102, 255)",
        borderWidth: 1,
      },
    ],
  };

  // Demand vs. Supply chart data
  const demandVsSupplyData = {
    labels,
    datasets: [
      {
        label: "Demand Forecast",
        data: getDemandData(),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgb(255, 99, 132)",
        borderWidth: 1,
      },
      {
        label: "Supply Capacity",
        data: getInventoryData().map((val) => val * 0.85), // Simulated supply data
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1,
      },
    ],
  };

  // Category distribution data
  const categoryDistributionData = {
    labels: ["Electronics", "Clothing", "Home Goods", "Sporting Goods", "Toys"],
    datasets: [
      {
        label: "Sales Distribution by Category",
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
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

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Sales Trend Forecast",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Inventory Forecast",
      },
    },
  };

  const demandChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Demand vs. Supply Capacity",
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Sales Distribution by Category",
      },
    },
  };

  // Sample data for top selling products forecast
  const topSellingProductsData = [
    {
      id: 1,
      name: "Smartphone X Pro",
      category: "Electronics",
      currentSales: 1250,
      forecastedSales: 1500,
      growth: 20,
      price: 899.99,
      revenue: 1349985,
    },
    {
      id: 2,
      name: "Designer Jeans",
      category: "Clothing",
      currentSales: 2800,
      forecastedSales: 3200,
      growth: 14.3,
      price: 89.99,
      revenue: 287968,
    },
    {
      id: 3,
      name: "Smart Home Hub",
      category: "Electronics",
      currentSales: 950,
      forecastedSales: 1100,
      growth: 15.8,
      price: 129.99,
      revenue: 142989,
    },
    {
      id: 4,
      name: "Fitness Tracker",
      category: "Sporting Goods",
      currentSales: 1800,
      forecastedSales: 2100,
      growth: 16.7,
      price: 79.99,
      revenue: 167979,
    },
    {
      id: 5,
      name: "Coffee Maker Deluxe",
      category: "Home Goods",
      currentSales: 750,
      forecastedSales: 850,
      growth: 13.3,
      price: 149.99,
      revenue: 127492,
    },
  ];

  // Filter products by category
  const filteredProducts =
    selectedCategory === "all"
      ? topSellingProductsData
      : topSellingProductsData.filter(
          (product) => product.category.toLowerCase() === selectedCategory
        );

  // Table columns for top selling products
  const columns = [
    { name: "Product Name", selector: (row) => row.name, sortable: true },
    { name: "Category", selector: (row) => row.category, sortable: true },
    {
      name: "Current Sales",
      selector: (row) => row.currentSales,
      sortable: true,
      format: (row) => row.currentSales.toLocaleString(),
    },
    {
      name: "Forecasted Sales",
      selector: (row) => row.forecastedSales,
      sortable: true,
      format: (row) => row.forecastedSales.toLocaleString(),
    },
    {
      name: "Growth",
      selector: (row) => row.growth,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.growth > 15
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {row.growth}%
        </span>
      ),
    },
    {
      name: "Forecasted Revenue",
      selector: (row) => row.revenue,
      sortable: true,
      format: (row) => `$${row.revenue.toLocaleString()}`,
    },
  ];

  // Calculate forecast statistics
  const totalCurrentSales = filteredProducts.reduce(
    (sum, product) => sum + product.currentSales,
    0
  );
  const totalForecastedSales = filteredProducts.reduce(
    (sum, product) => sum + product.forecastedSales,
    0
  );
  const totalRevenue = filteredProducts.reduce(
    (sum, product) => sum + product.revenue,
    0
  );
  const averageGrowth =
    filteredProducts.reduce((sum, product) => sum + product.growth, 0) /
    filteredProducts.length;

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Forecasting Dashboard
        </h1>
        <p className="text-gray-600">
          Visualize sales, inventory, and demand forecasts
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              className="form-input w-full"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              className="form-input w-full"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Category
            </label>
            <select
              className="form-input w-full"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home goods">Home Goods</option>
              <option value="sporting goods">Sporting Goods</option>
              <option value="toys">Toys</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forecast Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCurrentSales.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Forecasted Sales
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalForecastedSales.toLocaleString()}
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
              <p className="text-sm font-medium text-gray-600">
                Average Growth
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {averageGrowth.toFixed(1)}%
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
                Forecasted Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${(totalRevenue / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              💰
            </div>
          </div>
        </div>
      </div>

      {/* Charts - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <Line options={lineChartOptions} data={salesTrendData} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <Bar options={barChartOptions} data={inventoryForecastChartData} />
        </div>
      </div>

      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <Bar options={demandChartOptions} data={demandVsSupplyData} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <Pie options={pieChartOptions} data={categoryDistributionData} />
        </div>
      </div>

      {/* Top Selling Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Top Selling Products Forecast
          </h2>
          <p className="text-sm text-gray-600">
            Projected sales and revenue for top performing products
          </p>
        </div>
        <DataTable
          columns={columns}
          data={filteredProducts}
          pagination
          responsive
          highlightOnHover
          striped
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
        <button className="btn btn-primary">Generate Full Report</button>
        <button className="btn btn-secondary">Export to Excel</button>
        <button className="btn btn-secondary">Schedule Forecast Update</button>
      </div>
    </div>
  );
};

export default ForecastingDashboard;
