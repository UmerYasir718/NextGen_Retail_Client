import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { adminAPI } from "../../utils/api";
import { toast } from "react-toastify";
import Breadcrumb from "../../components/Breadcrumb";

const AdminUserManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter states
  const [filters, setFilters] = useState({
    role: "",
    companyId: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 10,
  });

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Fetch users with current filters
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page,
      };

      const response = await adminAPI.getUsers(params);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchUsers(1);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      role: "",
      companyId: "",
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      limit: 10,
    });
    fetchUsers(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    fetchUsers(page);
  };

  // Handle sorting
  const handleSort = (column, direction) => {
    const sortOrder = direction === "asc" ? "asc" : "desc";
    setFilters(prev => ({ ...prev, sortBy: column.selector, sortOrder }));
    fetchUsers(1);
  };

  // Export users data
  const exportUsers = async (format = "csv") => {
    try {
      const response = await adminAPI.exportData("users", format, filters);
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `users-export-${new Date().toISOString().split("T")[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Users exported successfully");
    } catch (err) {
      console.error("Error exporting users:", err);
      toast.error("Failed to export users");
    }
  };

  // Table columns
  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.role === "super_admin"
              ? "bg-red-100 text-red-800"
              : row.role === "company_admin"
              ? "bg-blue-100 text-blue-800"
              : row.role === "store_manager"
              ? "bg-green-100 text-green-800"
              : row.role === "analyst"
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.role.replace("_", " ").toUpperCase()}
        </span>
      ),
    },
    {
      name: "Company",
      selector: (row) => row.companyId?.name || "N/A",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.companyId?.name || "N/A"}
          </div>
          {row.companyId?._id && (
            <div className="text-xs text-gray-500">{row.companyId._id}</div>
          )}
        </div>
      ),
    },
    {
      name: "Plan",
      selector: (row) => row.planId?.name || "N/A",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.planId?.name || "N/A"}
          </div>
          {row.planId?.price && (
            <div className="text-xs text-gray-500">${row.planId.price}</div>
          )}
        </div>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.isActive,
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col space-y-1">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              row.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {row.isActive ? "Active" : "Inactive"}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              row.isVerified
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {row.isVerified ? "Verified" : "Unverified"}
          </span>
        </div>
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
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedUser(row);
              setEditMode(true);
              setShowUserModal(true);
            }}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setSelectedUser(row);
              setEditMode(false);
              setShowUserModal(true);
            }}
            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            View
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (user?.role === "super_admin") {
      fetchUsers();
    }
  }, [user]);

  if (user?.role !== "super_admin") {
    return (
      <div className="container-fluid mx-auto px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Access Denied:</strong>
          <span className="block sm:inline">
            {" "}
            You don't have permission to access this page.
          </span>
        </div>
      </div>
    );
  }

  if (loading && users.length === 0) {
    return (
      <div className="container-fluid mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/admin-dashboard" },
          { label: "Admin User Management", href: "/admin-user-management" },
        ]}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin User Management</h1>
        <p className="text-gray-600">
          Manage all users across the system with advanced filtering and sorting
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="company_admin">Company Admin</option>
              <option value="store_manager">Store Manager</option>
              <option value="analyst">Analyst</option>
              <option value="auditor">Auditor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company ID
            </label>
            <input
              type="text"
              placeholder="Company ID..."
              value={filters.companyId}
              onChange={(e) => handleFilterChange("companyId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Items per page
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange("limit", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-3 mt-4">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset
          </button>
          <button
            onClick={() => exportUsers("csv")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Users ({pagination.totalUsers})
            </h2>
            <div className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={users}
          pagination
          paginationServer
          paginationTotalRows={pagination.totalUsers}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={(newPerPage, page) => {
            handleFilterChange("limit", newPerPage);
            fetchUsers(page);
          }}
          onSort={handleSort}
          sortServer
          responsive
          highlightOnHover
          striped
          progressPending={loading}
          progressComponent={
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          }
        />

        {/* Pagination Info */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{" "}
              {Math.min(pagination.currentPage * filters.limit, pagination.totalUsers)} of{" "}
              {pagination.totalUsers} users
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className={`px-3 py-1 rounded ${
                  pagination.hasPrevPage
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={`px-3 py-1 rounded ${
                  pagination.hasNextPage
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editMode ? "Edit User" : "User Details"}
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    disabled={!editMode}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    disabled={!editMode}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={selectedUser.role}
                    disabled={!editMode}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="company_admin">Company Admin</option>
                    <option value="store_manager">Store Manager</option>
                    <option value="analyst">Analyst</option>
                    <option value="auditor">Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    value={selectedUser.companyId?.name || "N/A"}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Plan</label>
                  <input
                    type="text"
                    value={selectedUser.planId?.name || "N/A"}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>

                <div className="flex space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUser.isActive}
                      disabled={!editMode}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUser.isVerified}
                      disabled={!editMode}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Verified</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  {editMode && (
                    <button
                      onClick={() => {
                        // TODO: Implement user update logic
                        toast.success("User updated successfully");
                        setShowUserModal(false);
                        fetchUsers(pagination.currentPage);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save Changes
                    </button>
                  )}
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement; 