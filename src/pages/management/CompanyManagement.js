import React, { useState } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import SuperAdminCompanyManagement from "./SuperAdminCompanyManagement";

const CompanyManagement = () => {
  const { user } = useSelector((state) => state.auth);

  // All hooks must be called before any conditional returns
  const [filterText, setFilterText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [newCompany, setNewCompany] = useState({
    name: "",
    subscription: "simple",
    address: "",
    phone: "",
    email: "",
    website: "",
    status: "active",
  });

  // If user is super admin, show the super admin version
  if (user?.role === "super_admin") {
    return <SuperAdminCompanyManagement />;
  }

  // Sample data for companies
  const companiesData = [
    {
      id: 1,
      name: "NextGen Retail Corp",
      subscription: "premium",
      address: "123 Main St, New York, NY 10001",
      phone: "555-123-4567",
      email: "contact@nextgenretail.com",
      website: "www.nextgenretail.com",
      users: 12,
      createdAt: "2023-01-15",
      status: "active",
    },
    {
      id: 2,
      name: "Fashion Forward Inc",
      subscription: "yearly",
      address: "456 Market St, San Francisco, CA 94105",
      phone: "555-234-5678",
      email: "info@fashionforward.com",
      website: "www.fashionforward.com",
      users: 8,
      createdAt: "2023-02-20",
      status: "active",
    },
    {
      id: 3,
      name: "Tech Gadgets Ltd",
      subscription: "simple",
      address: "789 Tech Blvd, Austin, TX 78701",
      phone: "555-345-6789",
      email: "support@techgadgets.com",
      website: "www.techgadgets.com",
      users: 5,
      createdAt: "2023-03-10",
      status: "active",
    },
    {
      id: 4,
      name: "Home Essentials Co",
      subscription: "yearly",
      address: "321 Home Ave, Chicago, IL 60601",
      phone: "555-456-7890",
      email: "contact@homeessentials.com",
      website: "www.homeessentials.com",
      users: 7,
      createdAt: "2023-04-05",
      status: "inactive",
    },
    {
      id: 5,
      name: "Sports Unlimited",
      subscription: "premium",
      address: "555 Stadium Way, Seattle, WA 98101",
      phone: "555-567-8901",
      email: "info@sportsunlimited.com",
      website: "www.sportsunlimited.com",
      users: 10,
      createdAt: "2023-05-12",
      status: "active",
    },
    {
      id: 6,
      name: "Gourmet Foods Inc",
      subscription: "simple",
      address: "888 Culinary Blvd, Portland, OR 97201",
      phone: "555-678-9012",
      email: "hello@gourmetfoods.com",
      website: "www.gourmetfoods.com",
      users: 4,
      createdAt: "2023-06-01",
      status: "active",
    },
    {
      id: 7,
      name: "Office Solutions",
      subscription: "yearly",
      address: "444 Business Park, Denver, CO 80202",
      phone: "555-789-0123",
      email: "support@officesolutions.com",
      website: "www.officesolutions.com",
      users: 6,
      createdAt: "2023-06-15",
      status: "active",
    },
  ];

  // Filter data based on search input
  const filteredData = companiesData.filter((item) => {
    const searchText = filterText.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(searchText)) ||
      (item.subscription &&
        item.subscription.toLowerCase().includes(searchText)) ||
      (item.email && item.email.toLowerCase().includes(searchText)) ||
      (item.status && item.status.toLowerCase().includes(searchText))
    );
  });

  // Subscription display mapper
  const subscriptionDisplayMap = {
    premium: "Premium",
    yearly: "Yearly",
    simple: "Simple",
  };

  // Table columns
  const columns = [
    { name: "Company Name", selector: (row) => row.name, sortable: true },
    {
      name: "Subscription",
      selector: (row) => row.subscription,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.subscription === "premium"
              ? "bg-purple-100 text-purple-800"
              : row.subscription === "yearly"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {subscriptionDisplayMap[row.subscription] || row.subscription}
        </span>
      ),
    },
    { name: "Users", selector: (row) => row.users, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Phone", selector: (row) => row.phone, sortable: true },
    { name: "Created", selector: (row) => row.createdAt, sortable: true },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status === "active" ? "Active" : "Inactive"}
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
              setSelectedCompany(row);
              setShowEditModal(true);
            }}
          >
            Edit
          </button>
          <button className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
            {row.status === "active" ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  // Handle input change for company forms
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showAddModal) {
      setNewCompany({
        ...newCompany,
        [name]: value,
      });
    } else if (showEditModal && selectedCompany) {
      setSelectedCompany({
        ...selectedCompany,
        [name]: value,
      });
    }
  };

  // Handle form submission for adding a new company
  const handleAddSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send data to the backend
    // For now, we'll just close the modal
    setShowAddModal(false);
    setNewCompany({
      name: "",
      subscription: "simple",
      address: "",
      phone: "",
      email: "",
      website: "",
      status: "active",
    });
  };

  // Handle form submission for editing a company
  const handleEditSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send data to the backend
    // For now, we'll just close the modal
    setShowEditModal(false);
    setSelectedCompany(null);
  };

  // Calculate company statistics
  const totalCompanies = filteredData.length;
  const activeCompanies = filteredData.filter(
    (company) => company.status === "active"
  ).length;
  const inactiveCompanies = filteredData.filter(
    (company) => company.status === "inactive"
  ).length;

  // Get subscription counts
  const subscriptionCounts = filteredData.reduce((acc, company) => {
    acc[company.subscription] = (acc[company.subscription] || 0) + 1;
    return acc;
  }, {});

  // Calculate total users
  const totalUsers = filteredData.reduce(
    (sum, company) => sum + company.users,
    0
  );

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Company Management</h1>
        <p className="text-gray-600">
          Manage companies and their subscription plans
        </p>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search companies..."
            className="form-input w-full"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add New Company
        </button>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">🏢</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Companies
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {activeCompanies}
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
                Inactive Companies
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {inactiveCompanies}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-500">❌</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              👥
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Distribution */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Subscription Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="font-medium text-purple-800">Premium</p>
            <p className="text-2xl font-bold text-purple-900">
              {subscriptionCounts.premium || 0}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="font-medium text-blue-800">Yearly</p>
            <p className="text-2xl font-bold text-blue-900">
              {subscriptionCounts.yearly || 0}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="font-medium text-green-800">Simple</p>
            <p className="text-2xl font-bold text-green-900">
              {subscriptionCounts.simple || 0}
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
                {filteredData.length} companies found
              </span>
            </div>
          }
        />
      </div>

      {/* Add New Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Add New Company
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="name"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={newCompany.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="subscription"
                  >
                    Subscription Plan
                  </label>
                  <select
                    id="subscription"
                    name="subscription"
                    className="form-input"
                    value={newCompany.subscription}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="simple">Simple</option>
                    <option value="yearly">Yearly</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={newCompany.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="phone"
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    className="form-input"
                    value={newCompany.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="website"
                  >
                    Website
                  </label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    className="form-input"
                    value={newCompany.website}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="status"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="form-input"
                    value={newCompany.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="address"
                  >
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    className="form-input"
                    value={newCompany.address}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="edit-name"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    className="form-input"
                    value={selectedCompany.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="edit-subscription"
                  >
                    Subscription Plan
                  </label>
                  <select
                    id="edit-subscription"
                    name="subscription"
                    className="form-input"
                    value={selectedCompany.subscription}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="simple">Simple</option>
                    <option value="yearly">Yearly</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="edit-email"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    className="form-input"
                    value={selectedCompany.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="edit-phone"
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="edit-phone"
                    name="phone"
                    className="form-input"
                    value={selectedCompany.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="edit-website"
                  >
                    Website
                  </label>
                  <input
                    type="text"
                    id="edit-website"
                    name="website"
                    className="form-input"
                    value={selectedCompany.website}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="edit-status"
                  >
                    Status
                  </label>
                  <select
                    id="edit-status"
                    name="status"
                    className="form-input"
                    value={selectedCompany.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="edit-address"
                  >
                    Address
                  </label>
                  <textarea
                    id="edit-address"
                    name="address"
                    className="form-input"
                    value={selectedCompany.address}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  ></textarea>
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
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;
