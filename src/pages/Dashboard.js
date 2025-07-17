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


// Sample data for charts
const salesData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Sales",
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    },
  ],
};


const inventoryData = {
  labels: ["Electronics", "Clothing", "Food", "Books", "Toys"],
  datasets: [
    {
      label: "Inventory Level",
      data: [300, 450, 200, 150, 350],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
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

const revenueData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Revenue",
      data: [5000, 7000, 6000, 8000, 9000, 11000],
      fill: false,
      backgroundColor: "rgba(54, 162, 235, 0.2)",
      borderColor: "rgba(54, 162, 235, 1)",
      tension: 0.1,
    },
  ],
};

// Sample data for tables
const recentSalesData = [
  {
    id: 1,
    product: "Laptop",
    customer: "John Doe",
    date: "2023-06-15",
    amount: 1200,
    status: "Completed",
  },
  {
    id: 2,
    product: "Smartphone",
    customer: "Jane Smith",
    date: "2023-06-14",
    amount: 800,
    status: "Completed",
  },
  {
    id: 3,
    product: "Headphones",
    customer: "Bob Johnson",
    date: "2023-06-13",
    amount: 150,
    status: "Pending",
  },
  {
    id: 4,
    product: "Monitor",
    customer: "Alice Brown",
    date: "2023-06-12",
    amount: 300,
    status: "Completed",
  },
  {
    id: 5,
    product: "Keyboard",
    customer: "Charlie Wilson",
    date: "2023-06-11",
    amount: 80,
    status: "Completed",
  },
];

const lowStockItems = [
  {
    id: 1,
    product: "Wireless Mouse",
    category: "Electronics",
    quantity: 5,
    threshold: 10,
  },
  {
    id: 2,
    product: "T-Shirt (L)",
    category: "Clothing",
    quantity: 8,
    threshold: 15,
  },
  {
    id: 3,
    product: "Protein Bars",
    category: "Food",
    quantity: 3,
    threshold: 20,
  },
  {
    id: 4,
    product: "Notebooks",
    category: "Stationery",
    quantity: 7,
    threshold: 25,
  },
  {
    id: 5,
    product: "Action Figures",
    category: "Toys",
    quantity: 4,
    threshold: 10,
  },
];

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  const [timeframe, setTimeframe] = useState("monthly");
  const [loading, setLoading] = useState(false);

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

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">$24,780</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              📈
            </div>
          </div>
          <p className="mt-2 text-sm text-green-600">+12.5% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">356</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">🛒</div>
          </div>
          <p className="mt-2 text-sm text-blue-600">+5.2% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Inventory Value
              </p>
              <p className="text-2xl font-bold text-gray-900">$157,350</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              📦
            </div>
          </div>
          <p className="mt-2 text-sm text-purple-600">+3.1% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Low Stock Items
              </p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-500">⚠️</div>
          </div>
          <p className="mt-2 text-sm text-red-600">Action needed</p>
        </div>
      </div>

      {/* Charts */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Sales
          </h2>
          <DataTable
            columns={recentSalesColumns}
            data={recentSalesData}
            pagination
            responsive
            highlightOnHover
            striped
          />
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

      {/* Low Stock Items */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Low Stock Items
        </h2>
        <DataTable
          columns={lowStockColumns}
          data={lowStockItems}
          pagination
          responsive
          highlightOnHover
          striped
        />
      </div>
    </div>
  );
};

export default Dashboard;
