import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { userAPI } from "../../utils/helpfunction";
import { formatDate } from "../../utils/helpfunction";

const UserManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany, companies } = useSelector((state) => state.company);
  const [usersData, setuserData] = useState([]);

  const [filterText, setFilterText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    company: "",
    phone: "",
    status: "active",
  });

  // Sample data for users
  // const usersData = [
  //   {
  //     id: 1,
  //     name: "John Doe",
  //     email: "john.doe@example.com",
  //     role: "super_admin",
  //     company: "NextGen Retail Corp",
  //     phone: "555-123-4567",
  //     lastLogin: "2023-06-15 14:30:22",
  //     status: "active",
  //   },
  //   {
  //     id: 2,
  //     name: "Jane Smith",
  //     email: "jane.smith@example.com",
  //     role: "company_admin",
  //     company: "Fashion Forward Inc",
  //     phone: "555-234-5678",
  //     lastLogin: "2023-06-15 13:45:10",
  //     status: "active",
  //   },
  //   {
  //     id: 3,
  //     name: "Bob Johnson",
  //     email: "bob.johnson@example.com",
  //     role: "store_manager",
  //     company: "Tech Gadgets Ltd",
  //     phone: "555-345-6789",
  //     lastLogin: "2023-06-15 12:20:05",
  //     status: "active",
  //   },
  //   {
  //     id: 4,
  //     name: "Alice Brown",
  //     email: "alice.brown@example.com",
  //     role: "analyst",
  //     company: "Home Essentials Co",
  //     phone: "555-456-7890",
  //     lastLogin: "2023-06-15 11:15:30",
  //     status: "inactive",
  //   },
  //   {
  //     id: 5,
  //     name: "Charlie Wilson",
  //     email: "charlie.wilson@example.com",
  //     role: "auditor",
  //     company: "Sports Unlimited",
  //     phone: "555-567-8901",
  //     lastLogin: "2023-06-15 10:05:45",
  //     status: "active",
  //   },
  //   {
  //     id: 6,
  //     name: "Diana Miller",
  //     email: "diana.miller@example.com",
  //     role: "company_admin",
  //     company: "NextGen Retail Corp",
  //     phone: "555-678-9012",
  //     lastLogin: "2023-06-14 16:30:20",
  //     status: "active",
  //   },
  //   {
  //     id: 7,
  //     name: "Ethan Davis",
  //     email: "ethan.davis@example.com",
  //     role: "store_manager",
  //     company: "Fashion Forward Inc",
  //     phone: "555-789-0123",
  //     lastLogin: "2023-06-14 15:25:18",
  //     status: "active",
  //   },
  //   {
  //     id: 8,
  //     name: "Fiona Clark",
  //     email: "fiona.clark@example.com",
  //     role: "analyst",
  //     company: "Tech Gadgets Ltd",
  //     phone: "555-890-1234",
  //     lastLogin: "2023-06-14 14:10:05",
  //     status: "inactive",
  //   },
  //   {
  //     id: 9,
  //     name: "George White",
  //     email: "george.white@example.com",
  //     role: "auditor",
  //     company: "Home Essentials Co",
  //     phone: "555-901-2345",
  //     lastLogin: "2023-06-14 13:05:30",
  //     status: "active",
  //   },
  //   {
  //     id: 10,
  //     name: "Hannah Green",
  //     email: "hannah.green@example.com",
  //     role: "store_manager",
  //     company: "Sports Unlimited",
  //     phone: "555-012-3456",
  //     lastLogin: "2023-06-14 12:00:15",
  //     status: "active",
  //   },
  // ];
  useEffect(() => {
    fetchInventoryData();
  }, []);
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      // const companyId = selectedCompany?.id || null;
      // if (!companyId) {
      //   setInventoryData([]);
      //   return;
      // }

      const data = await userAPI.getUsers("6876bda9694900c60234bf5e");
      console.log("object", data);
      setuserData(Array.isArray(data?.data) ? data?.data : []);
      console.log("DATA RESPONSE", data);

      setError(null);
    } catch (err) {
      // console.error("Error fetching inventory data:", err);
      setError("Failed to load inventory data. Please try again.");
      toast.error("Failed to load inventory data");
      setuserData([]);
    } finally {
      setLoading(false);
    }
  };
  // Filter data based on search input
  const filteredData = usersData.filter((item) => {
    const searchText = filterText.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(searchText)) ||
      (item.email && item.email.toLowerCase().includes(searchText)) ||
      (item.role && item.role.toLowerCase().includes(searchText)) ||
      (item.company && item.company.toLowerCase().includes(searchText)) ||
      (item.status && item.status.toLowerCase().includes(searchText))
    );
  });

  // Filter users by company if a company is selected and user is not super_admin
  const displayData =
    user?.role === "super_admin"
      ? filteredData
      : filteredData.filter((item) => item.company === user?.company);

  // Role display mapper
  const roleDisplayMap = {
    super_admin: "Super Admin",
    company_admin: "Company Admin",
    store_manager: "Store Manager",
    analyst: "Analyst",
    auditor: "Auditor",
  };

  // Table columns
  const columns = [
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true },
    {
      name: "Role",
      selector: (row) => row.role,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.role === "super_admin"
              ? "bg-purple-100 text-purple-800"
              : row.role === "company_admin"
              ? "bg-blue-100 text-blue-800"
              : row.role === "store_manager"
              ? "bg-green-100 text-green-800"
              : row.role === "analyst"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {roleDisplayMap[row.role] || row.role}
        </span>
      ),
    },
    { name: "Company", selector: (row) => row.companyId.name, sortable: true },
    { name: "Phone", selector: (row) => row.phone, sortable: true },
    {
      name: "Last Login",
      selector: (row) => formatDate(row.createdAt),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.isActive,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.isActive === true
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.isActive === "active" ? "Active" : "Inactive"}
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
              setSelectedUser(row);
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

  // Handle input change for user forms
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showAddModal) {
      setNewUser({
        ...newUser,
        [name]: value,
      });
    } else if (showEditModal && selectedUser) {
      setSelectedUser({
        ...selectedUser,
        [name]: value,
      });
    }
  };

  // Handle form submission for adding a new user
  const handleAddSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send data to the backend
    // For now, we'll just close the modal
    setShowAddModal(false);
    setNewUser({
      name: "",
      email: "",
      role: "",
      company: "",
      phone: "",
      status: "active",
    });
  };

  // Handle form submission for editing a user
  const handleEditSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send data to the backend
    // For now, we'll just close the modal
    setShowEditModal(false);
    setSelectedUser(null);
  };

  // Calculate user statistics
  const totalUsers = displayData.length;
  const activeUsers = displayData.filter(
    (user) => user.isActive === true
  ).length;
  const inactiveUsers = displayData.filter(
    (user) => user.isActive !== true
  ).length;

  // Get role counts
  const roleCounts = displayData.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600">Manage users, roles, and permissions</p>
      </div>

      {/* Company Selection Notice for Super Admin */}
      {user?.role === "super_admin" && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <span className="text-blue-500 text-xl mr-2">ℹ️</span>
            <div>
              <p className="font-medium text-blue-700">
                {selectedCompany
                  ? `Viewing users for: ${selectedCompany.name}`
                  : "You are viewing users across all companies. Select a company from the dropdown to filter."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search users..."
            className="form-input w-full"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add New User
        </button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
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
                Inactive Users
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {inactiveUsers}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-500">❌</div>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Role Distribution
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(roleCounts).map(([role, count]) => (
            <div key={role} className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="font-medium text-gray-800">
                {roleDisplayMap[role] || role}
              </p>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
          data={displayData}
          pagination
          responsive
          highlightOnHover
          striped
          subHeader
          subHeaderComponent={
            <div className="w-full text-right py-2">
              <span className="text-sm text-gray-600">
                {displayData.length} users found
              </span>
            </div>
          }
        />
      </div>

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add New User</h2>
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
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                  />
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
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="role"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="form-input"
                    value={newUser.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Role</option>
                    {user?.role === "super_admin" && (
                      <option value="super_admin">Super Admin</option>
                    )}
                    <option value="company_admin">Company Admin</option>
                    <option value="store_manager">Store Manager</option>
                    <option value="analyst">Analyst</option>
                    <option value="auditor">Auditor</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="company"
                  >
                    Company
                  </label>
                  <select
                    id="company"
                    name="company"
                    className="form-input"
                    value={newUser.company}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Company</option>
                    {user?.role === "super_admin" ? (
                      companies.map((company) => (
                        <option key={company.id} value={company.name}>
                          {company.name}
                        </option>
                      ))
                    ) : (
                      <option value={user?.company}>{user?.company}</option>
                    )}
                  </select>
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
                    value={newUser.phone}
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
                    value={newUser.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password will be auto-generated and sent to the user's email
                </label>
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
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Edit User: {selectedUser.name}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
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
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    className="form-input"
                    value={selectedUser.name}
                    onChange={handleInputChange}
                    required
                  />
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
                    value={selectedUser.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="edit-role"
                  >
                    Role
                  </label>
                  <select
                    id="edit-role"
                    name="role"
                    className="form-input"
                    value={selectedUser.role}
                    onChange={handleInputChange}
                    required
                  >
                    {user?.role === "super_admin" && (
                      <option value="super_admin">Super Admin</option>
                    )}
                    <option value="company_admin">Company Admin</option>
                    <option value="store_manager">Store Manager</option>
                    <option value="analyst">Analyst</option>
                    <option value="auditor">Auditor</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="edit-company"
                  >
                    Company
                  </label>
                  <select
                    id="edit-company"
                    name="company"
                    className="form-input"
                    value={selectedUser.company}
                    onChange={handleInputChange}
                    required
                    disabled={user?.role !== "super_admin"}
                  >
                    {user?.role === "super_admin" ? (
                      companies.map((company) => (
                        <option key={company.id} value={company.name}>
                          {company.name}
                        </option>
                      ))
                    ) : (
                      <option value={user?.company}>{user?.company}</option>
                    )}
                  </select>
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
                    value={selectedUser.phone}
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
                    value={selectedUser.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Reset Password
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  This will send a password reset link to the user's email
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
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

export default UserManagement;
