import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import uhfAPI from "../../utils/api/uhfAPI";
import { formatDate } from "../../utils/helpfunction";
import {
  FaSearch,
  FaPlus,
  FaSync,
  FaEye,
  FaEdit,
  FaTrash,
  FaTag,
} from "react-icons/fa";
import UHFReaderModal from "../../components/uhf/UHFReaderModal";

const UHFManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  const [uhfReaders, setUHFReaders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showReaderModal, setShowReaderModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedReader, setSelectedReader] = useState(null);

  // Tag detection state
  const [showTagDetection, setShowTagDetection] = useState(false);
  const [tagDetectionData, setTagDetectionData] = useState({
    tagId: "",
    uhfId: "",
  });

  useEffect(() => {
    fetchUHFReaders();
    fetchNotifications();
  }, []);

  const fetchUHFReaders = async () => {
    try {
      setLoading(true);
      const response = await uhfAPI.getUHFReaders();
      setUHFReaders(Array.isArray(response?.data) ? response?.data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching UHF readers:", err);
      setError("Failed to load UHF readers. Please try again.");
      toast.error("Failed to load UHF readers");
      setUHFReaders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await uhfAPI.getNotifications();
      setNotifications(Array.isArray(response?.data) ? response?.data : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // Filter data based on search input and filters
  const filteredData = uhfReaders.filter((item) => {
    const searchText = filterText.toLowerCase();
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(searchText)) ||
      (item.uhfId && item.uhfId.toLowerCase().includes(searchText)) ||
      (item.description && item.description.toLowerCase().includes(searchText));

    const matchesStatus =
      !statusFilter ||
      (item.status && item.status.toLowerCase() === statusFilter.toLowerCase());

    const matchesLocation =
      !locationFilter ||
      (item.location?.type &&
        item.location.type.toLowerCase() === locationFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Get unique statuses and location types for filters
  const uniqueStatuses = [
    ...new Set(uhfReaders.map((reader) => reader.status)),
  ].filter(Boolean);
  const uniqueLocationTypes = [
    ...new Set(uhfReaders.map((reader) => reader.location?.type)),
  ].filter(Boolean);

  // Table columns
  const columns = [
    {
      name: "Name",
      selector: (row) => row.name || "",
      sortable: true,
      cell: (row) => (
        <div className="text-sm">
          <div className="font-medium">{row.name}</div>
          <div className="text-gray-500 text-xs">{row.uhfId}</div>
        </div>
      ),
    },
    {
      name: "Description",
      selector: (row) => row.description || "",
      sortable: true,
      cell: (row) => (
        <div className="text-sm max-w-xs truncate" title={row.description}>
          {row.description}
        </div>
      ),
    },
    {
      name: "Location",
      selector: (row) => row.location?.type || "",
      sortable: true,
      cell: (row) => {
        const locationType = row.location?.type || "";
        const locationName = getLocationName(row.location);

        return (
          <div className="text-sm">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                locationType === "Warehouse"
                  ? "bg-blue-100 text-blue-800"
                  : locationType === "Zone"
                  ? "bg-green-100 text-green-800"
                  : locationType === "Shelf"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {locationType}
            </span>
            <div className="text-gray-500 text-xs mt-1">{locationName}</div>
          </div>
        );
      },
    },
    {
      name: "Status",
      selector: (row) => row.status || "",
      sortable: true,
      cell: (row) => {
        const status = row.status || "";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              status === "Active"
                ? "bg-green-100 text-green-800"
                : status === "Inactive"
                ? "bg-red-100 text-red-800"
                : status === "Maintenance"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      name: "Last Activity",
      selector: (row) => row.lastActivity || row.createdAt,
      sortable: true,
      cell: (row) => (
        <div className="text-sm">
          <div className="font-medium">
            {formatDate(row.lastActivity || row.createdAt)}
          </div>
          <div className="text-gray-500 text-xs">
            {row.lastActivity ? "Last seen" : "Created"}
          </div>
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleViewReader(row)}
            title="View Details"
          >
            <FaEye className="inline" />
          </button>
          <button
            className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
            onClick={() => handleEditReader(row)}
            title="Edit Reader"
          >
            <FaEdit className="inline" />
          </button>
          <button
            className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
            onClick={() => handleTagDetection(row)}
            title="Tag Detection"
          >
            <FaTag className="inline" />
          </button>
          <button
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => handleDeleteReader(row)}
            title="Delete Reader"
          >
            <FaTrash className="inline" />
          </button>
        </div>
      ),
    },
  ];

  const getLocationName = (location) => {
    if (!location) return "Unknown";

    // This would need to be implemented based on your data structure
    // For now, returning a placeholder
    return `${location.type} Location`;
  };

  const handleViewReader = (reader) => {
    setSelectedReader(reader);
    setModalMode("view");
    setShowReaderModal(true);
  };

  const handleEditReader = (reader) => {
    setSelectedReader(reader);
    setModalMode("edit");
    setShowReaderModal(true);
  };

  const handleAddReader = () => {
    setSelectedReader(null);
    setModalMode("add");
    setShowReaderModal(true);
  };

  const handleDeleteReader = async (reader) => {
    if (
      window.confirm(
        `Are you sure you want to delete UHF reader "${reader.name}"?`
      )
    ) {
      try {
        setLoading(true);
        await uhfAPI.deleteUHFReader(reader._id);
        toast.success("UHF reader deleted successfully");
        fetchUHFReaders();
      } catch (err) {
        console.error("Error deleting UHF reader:", err);
        toast.error(err.message || "Failed to delete UHF reader");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTagDetection = (reader) => {
    setTagDetectionData({
      tagId: "",
      uhfId: reader.uhfId,
    });
    setShowTagDetection(true);
  };

  const handleTagDetectionSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await uhfAPI.detectUHFTag(tagDetectionData);
      toast.success("Tag detection processed successfully");
      setShowTagDetection(false);
      setTagDetectionData({ tagId: "", uhfId: "" });
      // Refresh data to show any inventory updates
      fetchUHFReaders();
    } catch (err) {
      console.error("Error processing tag detection:", err);
      toast.error(err.message || "Failed to process tag detection");
    } finally {
      setLoading(false);
    }
  };

  const handleReaderSubmit = async (formData) => {
    try {
      setLoading(true);
      if (modalMode === "add") {
        await uhfAPI.createUHFReader(formData);
        toast.success("UHF reader created successfully");
      } else if (modalMode === "edit") {
        await uhfAPI.updateUHFReader(selectedReader._id, formData);
        toast.success("UHF reader updated successfully");
      }
      fetchUHFReaders();
    } catch (err) {
      console.error("Error saving UHF reader:", err);
      toast.error(err.message || "Failed to save UHF reader");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await uhfAPI.markNotificationAsRead(notificationId);
      toast.success("Notification marked as read");
      fetchNotifications();
    } catch (err) {
      console.error("Error marking notification as read:", err);
      toast.error("Failed to mark notification as read");
    }
  };

  // Calculate statistics
  const totalReaders = filteredData.length;
  const activeReaders = filteredData.filter(
    (reader) => reader.status === "Active"
  ).length;
  const inactiveReaders = filteredData.filter(
    (reader) => reader.status === "Inactive"
  ).length;
  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          UHF Tracking System
        </h1>
        <p className="text-gray-600">
          Manage UHF readers, track inventory movements, and monitor system
          notifications
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
                  ? `Managing UHF system for: ${selectedCompany.name}`
                  : "Please select a company from the dropdown in the header to manage specific UHF readers"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
          <button
            className="flex items-center mt-2 text-sm font-medium text-red-700 hover:text-red-900"
            onClick={fetchUHFReaders}
          >
            <FaSync className="mr-1" /> Retry
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Readers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalReaders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Readers
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {activeReaders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Inactive Readers
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {inactiveReaders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM20 4h-6v6h6V4zM4 4h6v6H4V4z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Unread Notifications
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {unreadNotifications}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search readers..."
              className="form-input pl-10 pr-4 py-2"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <select
            className="form-input py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            className="form-input py-2"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            {uniqueLocationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            className="btn btn-secondary flex items-center"
            onClick={fetchUHFReaders}
          >
            <FaSync className="mr-2" /> Refresh
          </button>
          <button
            className="btn btn-primary flex items-center"
            onClick={handleAddReader}
          >
            <FaPlus className="mr-2" /> Add Reader
          </button>
        </div>
      </div>

      {/* UHF Readers Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={filteredData}
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
              No UHF readers found. Try adjusting your search or filters.
            </div>
          }
        />
      </div>

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Notifications
          </h2>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification._id}
                className={`p-3 rounded-lg border ${
                  notification.read
                    ? "bg-gray-50"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      onClick={() =>
                        handleMarkNotificationAsRead(notification._id)
                      }
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UHF Reader Modal */}
      <UHFReaderModal
        isOpen={showReaderModal}
        onClose={() => setShowReaderModal(false)}
        mode={modalMode}
        initialData={selectedReader}
        onSubmit={handleReaderSubmit}
      />

      {/* Tag Detection Modal */}
      {showTagDetection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Tag Detection</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowTagDetection(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTagDetectionSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  UHF Reader ID
                </label>
                <input
                  type="text"
                  value={tagDetectionData.uhfId}
                  onChange={(e) =>
                    setTagDetectionData((prev) => ({
                      ...prev,
                      uhfId: e.target.value,
                    }))
                  }
                  className="form-input w-full"
                  placeholder="Enter UHF Reader ID"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tag ID
                </label>
                <input
                  type="text"
                  value={tagDetectionData.tagId}
                  onChange={(e) =>
                    setTagDetectionData((prev) => ({
                      ...prev,
                      tagId: e.target.value,
                    }))
                  }
                  className="form-input w-full"
                  placeholder="Enter Tag ID"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowTagDetection(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Process Detection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UHFManagement;
