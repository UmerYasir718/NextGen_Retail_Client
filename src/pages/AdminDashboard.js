import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Pie, Bar } from "react-chartjs-2";
import DataTable from "react-data-table-component";

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany, companies } = useSelector((state) => state.company);

  const [timeframe, setTimeframe] = useState("monthly");

  // Sample data for charts
  const userRolesData = {
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

  const companySubscriptionsData = {
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

  const revenueByCompanyData = {
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

  // Sample data for tables
  const recentActivitiesData = [
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
    {
      id: 4,
      user: "Alice Brown",
      action: "Generated Report",
      company: "Home Essentials Co",
      timestamp: "2023-06-15 11:15:30",
    },
    {
      id: 5,
      user: "Charlie Wilson",
      action: "User Logout",
      company: "Sports Unlimited",
      timestamp: "2023-06-15 10:05:45",
    },
  ];

  const newCompaniesData = [
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
    {
      id: 4,
      name: "Home Essentials Co",
      subscription: "Yearly",
      users: 7,
      joined: "2023-04-10",
      status: "Inactive",
    },
    {
      id: 5,
      name: "Sports Unlimited",
      subscription: "Premium",
      users: 10,
      joined: "2023-05-05",
      status: "Active",
    },
  ];

  // Table columns
  const recentActivitiesColumns = [
    { name: "User", selector: (row) => row.user, sortable: true },
    { name: "Action", selector: (row) => row.action, sortable: true },
    { name: "Company", selector: (row) => row.company, sortable: true },
    { name: "Timestamp", selector: (row) => row.timestamp, sortable: true },
  ];

  const newCompaniesColumns = [
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

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">
          System overview and management statistics
        </p>
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
                {companies.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">🏢</div>
          </div>
          <p className="mt-2 text-sm text-blue-600">+2 new this month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">42</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              👥
            </div>
          </div>
          <p className="mt-2 text-sm text-green-600">+5 new this month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Devices
              </p>
              <p className="text-2xl font-bold text-gray-900">28</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              📱
            </div>
          </div>
          <p className="mt-2 text-sm text-purple-600">+3 new this month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$142,500</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              💰
            </div>
          </div>
          <p className="mt-2 text-sm text-yellow-600">+12% from last month</p>
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
          <button className="btn btn-primary">Add New Company</button>
          <button className="btn btn-secondary">Manage Users</button>
          <button className="btn btn-success">Generate Reports</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
