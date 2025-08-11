import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { userAPI } from "../../utils/helpfunction";
import { formatDate } from "../../utils/helpfunction";
import { FaSearch, FaPlus, FaSync, FaKey } from "react-icons/fa";
import PasswordUpdateModal from "../../components/PasswordUpdateModal";

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
    password: "",
    role: "",
    phone: "",
    status: "active",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordUpdateModal, setShowPasswordUpdateModal] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);

  // Handle toggling user status (activate/deactivate)
  const handleToggleStatus = async (user) => {
    try {
      setLoading(true);

      // Prepare update data
      const userData = {
        isActive: !user.isActive,
      };

      // Call API to update user status
      await userAPI.updateUser(user._id, userData);

      // Success message and refresh data
      toast.success(
        `User ${userData.isActive ? "activated" : "deactivated"} successfully`
      );
      fetchUserData();
    } catch (err) {
      console.error("Error updating user status:", err);
      toast.error(err.message || "Failed to update user status");
    } finally {
      setLoading(false);
    }
  };

  // Handle resetting user password
  const handleResetPassword = async (userId) => {
    try {
      setLoading(true);

      // Call API to reset password
      await userAPI.resetPassword(userId);

      // Success message
      toast.success("Password reset link sent to user's email");
    } catch (err) {
      console.error("Error resetting password:", err);
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Handle opening password update modal
  const handleUpdatePassword = (user) => {
    setSelectedUserForPassword(user);
    setShowPasswordUpdateModal(true);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const companyId = selectedCompany?._id || null;
      
      console.log("Fetching users with companyId:", companyId);
      console.log("Selected company:", selectedCompany);
      console.log("User role:", user?.role);

      // Get users based on role
      const response = await userAPI.getUsers(companyId);
      console.log("API response:", response);
      
      setuserData(Array.isArray(response.data) ? response.data : []);

      setError(null);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data. Please try again.");
      toast.error("Failed to load user data");
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
    {
      name: "Company",
      selector: (row) => row.companyId?.name || "N/A",
      sortable: true,
    },
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
          {row.isActive === true ? "Active" : "Inactive"}
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
          <button
            className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
            onClick={() => handleUpdatePassword(row)}
            title="Update Password"
          >
            <FaKey className="inline" />
          </button>
          <button
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => handleToggleStatus(row)}
          >
            {row.isActive === true ? "Deactivate" : "Activate"}
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
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Prepare user data for API
      const userData = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        companyId:
          user.role === "super_admin"
            ? companies.find((c) => c.name === newUser.company)?._id
            : user.companyId,
        phone: newUser.phone,
        isActive: newUser.status === "active",
      };

      // Call API to create user
      await userAPI.createUser(userData);
      // Success message and refresh data
      toast.success("User created successfully");
      fetchUserData();

      // Reset form and close modal
      setShowAddModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "",
        company: "",
        phone: "",
        status: "active",
      });
    } catch (err) {
      console.error("Error creating user:", err);
      toast.error(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for editing a user
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Prepare user data for API
      const userData = {
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        companyId:
          user.role === "super_admin"
            ? companies.find((c) => c.name === selectedUser.company)?._id
            : user.companyId,
        phone: selectedUser.phone,
        isActive: selectedUser.status === "active",
      };

      // Call API to update user
      await userAPI.updateUser(selectedUser._id, userData);

      // Success message and refresh data
      toast.success("User updated successfully");
      fetchUserData();

      // Close modal and reset selected user
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* Error display */}
      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
          role="alert"
        >
          <p>{error}</p>
                  <button
          className="flex items-center mt-2 text-sm font-medium text-red-700 hover:text-red-900"
          onClick={fetchUserData}
        >
            <FaSync className="mr-1" /> Retry
          </button>
        </div>
      )}

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

      {/* Search and Add User */}
      <div className="flex justify-between mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            className="form-input pl-10 pr-4 py-2"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <button
          className="btn btn-primary flex items-center"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="mr-2" /> Add User
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

      {/* User Table */}
      <DataTable
        columns={columns}
        data={displayData}
        pagination
        persistTableHead
        highlightOnHover
        striped
        responsive
        progressPending={loading}
        progressComponent={
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }
        noDataComponent={
          <div className="p-4 text-center text-gray-500">
            No users found. Try adjusting your search or filters.
          </div>
        }
      />

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
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      className="form-input pr-10"
                      value={newUser.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <span className="text-gray-500">👁️</span>
                      ) : (
                        <span className="text-gray-500">👁️‍🗨️</span>
                      )}
                    </button>
                  </div>
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
                      <option value="company_admin">Company Admin</option>
                    )}
                    <option value="store_manager">Store Manager</option>
                    <option value="analyst">Analyst</option>
                    <option value="auditor">Auditor</option>
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
                        <option key={company._id} value={company.name}>
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
                  onClick={() => handleResetPassword(selectedUser._id)}
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

      {/* Password Update Modal */}
      <PasswordUpdateModal
        isOpen={showPasswordUpdateModal}
        onClose={() => {
          setShowPasswordUpdateModal(false);
          setSelectedUserForPassword(null);
        }}
        userId={selectedUserForPassword?._id}
        userName={selectedUserForPassword?.name}
      />
    </div>
  );
};

export default UserManagement;
