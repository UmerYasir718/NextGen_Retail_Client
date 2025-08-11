import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import auditLogAPI from "../../utils/api/auditLogAPI";
import { formatDate } from "../../utils/helpfunction";
import {
  FaSearch,
  FaSync,
  FaDownload,
  FaEye,
  FaTimes,
  FaFilter,
} from "react-icons/fa";

const AuditLogs = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  const [auditLogs, setAuditLogs] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Data state
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter state
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  // Define the module types
  const moduleTypes = [
    "Authentication",
    "User",
    "Company",
    "Plan",
    "Warehouse",
    "Zone",
    "Shelf",
    "Bin",
    "Inventory",
    "Shipment",
    "Report",
    "Settings",
    "UHF Reader",
  ];

  // Get company ID for filtering
  const companyId = selectedCompany?.id || null;

  useEffect(() => {
    fetchAuditLogs();
  }, [companyId]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filterText !== "") {
        fetchAuditLogs();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filterText]);

  // Effect for filters
  useEffect(() => {
    if (filtersApplied) {
      fetchAuditLogs();
      setFiltersApplied(false);
    }
  }, [filtersApplied]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: filterText,
        dateFilter,
        actionFilter,
        moduleFilter,
        companyId,
      };

      const logsResponse = await auditLogAPI.getAuditLogs(params);

      // Validate and clean the data to ensure proper structure
      const cleanData = Array.isArray(logsResponse?.data || logsResponse)
        ? (logsResponse?.data || logsResponse).map((log) => ({
            ...log,
            // Handle userId object structure
            userId: log.userId || log.user || null,
            userName:
              log.userName ||
              log.userId?.name ||
              log.user?.name ||
              "Unknown User",
            userRole:
              log.userRole ||
              log.userId?.role ||
              log.user?.role ||
              "Unknown Role",
            userEmail: log.userId?.email || log.user?.email || "",
            // Ensure other fields are properly handled
            action: log.action || "Unknown Action",
            module: log.module || "Unknown Module",
            description: log.description || "No description available",
            details: log.details || {},
            ipAddress: log.ipAddress || "N/A",
            companyId: log.companyId || null,
            timestamp: log.timestamp || new Date().toISOString(),
          }))
        : [];

      setAuditLogs(cleanData);
      // Set total records to the length of current data since we're not fetching count separately
      setTotalRecords(cleanData.length);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError("Failed to load audit logs. Please try again.");
      toast.error("Failed to load audit logs");
      setAuditLogs([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [filterText, dateFilter, actionFilter, moduleFilter, companyId]);

  // Apply filters
  const applyFilters = () => {
    setFiltersApplied(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterText("");
    setDateFilter("");
    setActionFilter("");
    setModuleFilter("");
    setFiltersApplied(true);
  };

  // Get unique actions and modules for filter dropdowns
  const uniqueActions = [...new Set(auditLogs.map((log) => log.action))].filter(
    Boolean
  );
  const uniqueModules = [...new Set(auditLogs.map((log) => log.module))].filter(
    Boolean
  );

  // Handle viewing log details
  const handleViewLog = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedLog(null);
  };

  // Table columns - compact display with essential information only
  const columns = [
    {
      name: "Time",
      selector: (row) => row.timestamp,
      width: "100px",
      cell: (row) => (
        <div className="text-xs">
          <div className="font-medium">{formatDate(row.timestamp)}</div>
          <div className="text-gray-500">
            {new Date(row.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          {/* Show if it's today */}
          {new Date(row.timestamp).toDateString() ===
            new Date().toDateString() && (
            <div className="text-green-600 text-xs font-medium">Today</div>
          )}
        </div>
      ),
    },
    {
      name: "User",
      selector: (row) => row.userName,
      width: "120px",
      cell: (row) => (
        <div className="text-xs">
          <div className="font-medium truncate" title={row.userName}>
            {row.userName}
          </div>
          <div className="text-gray-500 text-xs truncate" title={row.userRole}>
            {row.userRole}
          </div>
        </div>
      ),
    },
    {
      name: "Module",
      selector: (row) => row.module,
      width: "90px",
      cell: (row) => (
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
          {row.module}
        </span>
      ),
    },
    {
      name: "Action",
      selector: (row) => row.action,
      width: "90px",
      cell: (row) => (
        <div className="space-y-1">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.action?.includes("Login") || row.action?.includes("Logout")
                ? "bg-blue-100 text-blue-800"
                : row.action?.includes("Create") || row.action?.includes("Add")
                ? "bg-green-100 text-green-800"
                : row.action?.includes("Update") || row.action?.includes("Edit")
                ? "bg-yellow-100 text-yellow-800"
                : row.action?.includes("Delete") ||
                  row.action?.includes("Remove")
                ? "bg-red-100 text-red-800"
                : row.action?.includes("Process")
                ? "bg-purple-100 text-purple-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.action}
          </span>
          {/* Impact indicator */}
          <div className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                row.action?.includes("Delete") || row.action?.includes("Remove")
                  ? "bg-red-500"
                  : row.action?.includes("Create") ||
                    row.action?.includes("Add")
                  ? "bg-green-500"
                  : row.action?.includes("Update") ||
                    row.action?.includes("Edit")
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              }`}
            ></span>
            <span className="text-xs text-gray-500">
              {row.action?.includes("Delete") || row.action?.includes("Remove")
                ? "High"
                : row.action?.includes("Create") || row.action?.includes("Add")
                ? "Medium"
                : row.action?.includes("Update") || row.action?.includes("Edit")
                ? "Medium"
                : "Low"}
            </span>
          </div>
        </div>
      ),
    },
    {
      name: "Summary",
      selector: (row) => row.description,
      cell: (row) => (
        <div className="text-xs max-w-xs">
          <div className="truncate font-medium" title={row.description}>
            {row.description}
          </div>
          {/* Show key details if available */}
          {row.details && (
            <div className="text-gray-500 mt-1">
              {row.details.fileName && (
                <span className="inline-block bg-gray-100 px-1 py-0.5 rounded text-xs mr-1">
                  📄 {row.details.fileName}
                </span>
              )}
              {row.details.itemName && (
                <span className="inline-block bg-gray-100 px-1 py-0.5 rounded text-xs mr-1">
                  📦 {row.details.itemName}
                </span>
              )}
              {row.details.sku && (
                <span className="inline-block bg-gray-100 px-1 py-0.5 rounded text-xs">
                  🏷️ {row.details.sku}
                </span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      name: "View",
      width: "60px",
      cell: (row) => (
        <button
          onClick={() => handleViewLog(row)}
          className="btn btn-sm btn-outline-primary"
          title="View Full Details"
        >
          <FaEye className="w-3 h-3" />
        </button>
      ),
    },
  ];

  // Export to CSV
  const handleExportCSV = async () => {
    try {
      setFilterLoading(true);

      // For export, fetch all data without pagination
      const allData = await auditLogAPI.getAuditLogs({
        search: filterText,
        dateFilter,
        actionFilter,
        moduleFilter,
        companyId,
      });

      const dataToExport = Array.isArray(allData?.data || allData)
        ? allData?.data || allData
        : [];

      const csvContent = [
        [
          "Timestamp",
          "User",
          "User Role",
          "Module",
          "Action",
          "Description",
          "IP Address",
        ],
        ...dataToExport.map((log) => [
          formatDate(log.timestamp),
          log.userName || "Unknown User",
          log.userRole || "Unknown Role",
          log.module || "Unknown Module",
          log.action || "Unknown Action",
          log.description || "No description",
          log.ipAddress || "N/A",
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Audit logs exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export audit logs");
    } finally {
      setFilterLoading(false);
    }
  };

  // Calculate statistics
  const totalLogs = totalRecords;
  const todayLogs = auditLogs.filter(
    (log) =>
      new Date(log.timestamp).toDateString() === new Date().toDateString()
  ).length;

  // Group logs by module for statistics
  const moduleStats = moduleTypes.reduce((acc, module) => {
    acc[module] = auditLogs.filter((log) => log.module === module).length;
    return acc;
  }, {});

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Audit Logs</h1>
        <p className="text-gray-600">
          Monitor system activities and user actions across all modules
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
                  ? `Viewing audit logs for: ${selectedCompany.name}`
                  : "You are viewing audit logs across all companies. Select a company from the dropdown to filter."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
          role="alert"
        >
          <p>{error}</p>
          <button
            className="flex items-center mt-2 text-sm font-medium text-red-700 hover:text-red-900"
            onClick={fetchAuditLogs}
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalLogs.toLocaleString()}
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-semibold text-gray-900">
                {todayLogs}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Modules
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {Object.values(moduleStats).filter((count) => count > 0).length}
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-sm font-semibold text-gray-900">
                {auditLogs.length > 0
                  ? formatDate(auditLogs[0].timestamp)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search logs by user, action, description, or module..."
                className="form-input pl-10 pr-4 py-2 w-full"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              className="form-input py-2"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <select
              className="form-input py-2"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module
            </label>
            <select
              className="form-input py-2"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <option value="">All Modules</option>
              {moduleTypes.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              className="btn btn-primary flex items-center"
              onClick={applyFilters}
              disabled={filterLoading}
            >
              <FaFilter className="mr-2" />
              {filterLoading ? "Applying..." : "Apply Filters"}
            </button>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">
          Showing {auditLogs.length} entries
        </div>
        <div className="flex space-x-2">
          <button
            className="btn btn-secondary flex items-center"
            onClick={fetchAuditLogs}
            disabled={loading}
          >
            <FaSync className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            className="btn btn-success flex items-center"
            onClick={handleExportCSV}
            disabled={filterLoading}
          >
            <FaDownload className="mr-2" />
            {filterLoading ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={auditLogs}
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
              {loading
                ? "Loading audit logs..."
                : "No audit logs found. Try adjusting your search or filters."}
            </div>
          }
        />
      </div>

      {/* Log Details Modal */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gray-50">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Audit Log Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Detailed information about this system activity
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-medium text-blue-800 border-b border-blue-200 pb-2 mb-4">
                      Basic Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700">
                          Timestamp
                        </label>
                        <p className="text-sm text-blue-900 font-medium">
                          {formatDate(selectedLog.timestamp)} at{" "}
                          {new Date(selectedLog.timestamp).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            }
                          )}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {new Date(selectedLog.timestamp).toLocaleDateString(
                            [],
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700">
                          User Information
                        </label>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-sm text-blue-900 font-medium">
                            {selectedLog.userName}
                          </p>
                          <p className="text-xs text-blue-600">
                            Role: {selectedLog.userRole}
                          </p>
                          {selectedLog.userEmail && (
                            <p className="text-xs text-blue-600">
                              Email: {selectedLog.userEmail}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700">
                          Module & Action
                        </label>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                            {selectedLog.module}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              selectedLog.action?.includes("Login") ||
                              selectedLog.action?.includes("Logout")
                                ? "bg-blue-100 text-blue-800"
                                : selectedLog.action?.includes("Create") ||
                                  selectedLog.action?.includes("Add")
                                ? "bg-green-100 text-green-800"
                                : selectedLog.action?.includes("Update") ||
                                  selectedLog.action?.includes("Edit")
                                ? "bg-yellow-100 text-yellow-800"
                                : selectedLog.action?.includes("Delete") ||
                                  selectedLog.action?.includes("Remove")
                                ? "bg-red-100 text-red-800"
                                : selectedLog.action?.includes("Process")
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {selectedLog.action}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700">
                          IP Address
                        </label>
                        <p className="text-sm font-mono text-blue-900 bg-white p-2 rounded border">
                          {selectedLog.ipAddress}
                        </p>
                      </div>

                      {selectedLog.companyId && (
                        <div>
                          <label className="block text-sm font-medium text-blue-700">
                            Company ID
                          </label>
                          <p className="text-sm text-blue-900 bg-white p-2 rounded border">
                            {selectedLog.companyId}
                          </p>
                        </div>
                      )}

                      {/* Technical Details */}
                      <div>
                        <label className="block text-sm font-medium text-blue-700">
                          Technical Details
                        </label>
                        <div className="bg-white p-3 rounded border space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Log ID:</span>
                              <span className="ml-1 font-mono text-gray-700">
                                {selectedLog._id || selectedLog.id || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Version:</span>
                              <span className="ml-1 text-gray-700">
                                {selectedLog.__v || "N/A"}
                              </span>
                            </div>
                          </div>
                          {selectedLog.details?.changedBy && (
                            <div className="border-t border-gray-100 pt-2">
                              <div className="text-xs text-gray-500 mb-1">
                                Changed By:
                              </div>
                              <div className="text-xs text-gray-700">
                                <div>
                                  👤 {selectedLog.details.changedBy.userName}
                                </div>
                                <div>
                                  🔑 {selectedLog.details.changedBy.userRole}
                                </div>
                                <div>
                                  ⏰{" "}
                                  {new Date(
                                    selectedLog.details.changedBy.timestamp
                                  ).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description and Details */}
                <div className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="text-lg font-medium text-green-800 border-b border-green-200 pb-2 mb-4">
                      Description & Details
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700">
                          Description
                        </label>
                        <div className="bg-white p-3 rounded border min-h-[60px]">
                          <p className="text-sm text-green-900">
                            {selectedLog.description ||
                              "No description available"}
                          </p>
                        </div>
                      </div>

                      {selectedLog.details &&
                        Object.keys(selectedLog.details).length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-green-700">
                              Detailed Information
                            </label>
                            <div className="bg-white p-3 rounded border space-y-3">
                              {/* File Information */}
                              {selectedLog.details.fileId && (
                                <div className="border-b border-gray-100 pb-2">
                                  <div className="text-xs font-medium text-gray-600 mb-1">
                                    File Details
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-gray-500">
                                        File ID:
                                      </span>
                                      <span className="ml-1 font-mono text-gray-700">
                                        {selectedLog.details.fileId}
                                      </span>
                                    </div>
                                    {selectedLog.details.fileName && (
                                      <div>
                                        <span className="text-gray-500">
                                          Name:
                                        </span>
                                        <span className="ml-1 text-gray-700">
                                          {selectedLog.details.fileName}
                                        </span>
                                      </div>
                                    )}
                                    {selectedLog.details.status && (
                                      <div>
                                        <span className="text-gray-500">
                                          Status:
                                        </span>
                                        <span
                                          className={`ml-1 px-2 py-0.5 rounded text-xs ${
                                            selectedLog.details.status ===
                                            "approved"
                                              ? "bg-green-100 text-green-800"
                                              : selectedLog.details.status ===
                                                "rejected"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-yellow-100 text-yellow-800"
                                          }`}
                                        >
                                          {selectedLog.details.status}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Inventory Information */}
                              {selectedLog.details.inventoryId && (
                                <div className="border-b border-gray-100 pb-2">
                                  <div className="text-xs font-medium text-gray-600 mb-1">
                                    Inventory Details
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-gray-500">ID:</span>
                                      <span className="ml-1 font-mono text-gray-700">
                                        {selectedLog.details.inventoryId}
                                      </span>
                                    </div>
                                    {selectedLog.details.itemName && (
                                      <div>
                                        <span className="text-gray-500">
                                          Item:
                                        </span>
                                        <span className="ml-1 text-gray-700">
                                          {selectedLog.details.itemName}
                                        </span>
                                      </div>
                                    )}
                                    {selectedLog.details.sku && (
                                      <div>
                                        <span className="text-gray-500">
                                          SKU:
                                        </span>
                                        <span className="ml-1 font-mono text-gray-700">
                                          {selectedLog.details.sku}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Location Changes */}
                              {selectedLog.details.previousLocation &&
                                selectedLog.details.currentLocation && (
                                  <div className="border-b border-gray-100 pb-2">
                                    <div className="text-xs font-medium text-gray-600 mb-1">
                                      Location Changes
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-500">
                                          From:
                                        </span>
                                        <div className="ml-1 text-gray-700">
                                          <div>
                                            🏢{" "}
                                            {
                                              selectedLog.details
                                                .previousLocation.warehouseName
                                            }
                                          </div>
                                          <div>
                                            📍{" "}
                                            {
                                              selectedLog.details
                                                .previousLocation.zoneName
                                            }
                                          </div>
                                          <div>
                                            📦{" "}
                                            {
                                              selectedLog.details
                                                .previousLocation.shelfName
                                            }
                                          </div>
                                          <div>
                                            🗃️{" "}
                                            {
                                              selectedLog.details
                                                .previousLocation.binName
                                            }
                                          </div>
                                          <div>
                                            📊 Qty:{" "}
                                            {
                                              selectedLog.details
                                                .previousLocation.quantity
                                            }
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          To:
                                        </span>
                                        <div className="ml-1 text-gray-700">
                                          <div>
                                            🏢{" "}
                                            {
                                              selectedLog.details
                                                .currentLocation.warehouseName
                                            }
                                          </div>
                                          <div>
                                            📍{" "}
                                            {
                                              selectedLog.details
                                                .currentLocation.zoneName
                                            }
                                          </div>
                                          <div>
                                            📦{" "}
                                            {
                                              selectedLog.details
                                                .currentLocation.shelfName
                                            }
                                          </div>
                                          <div>
                                            🗃️{" "}
                                            {
                                              selectedLog.details
                                                .currentLocation.binName
                                            }
                                          </div>
                                          <div>
                                            📊 Qty:{" "}
                                            {
                                              selectedLog.details
                                                .currentLocation.quantity
                                            }
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                              {/* Processing Results */}
                              {selectedLog.details.totalRecords && (
                                <div className="border-b border-gray-100 pb-2">
                                  <div className="text-xs font-medium text-gray-600 mb-1">
                                    Processing Results
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-gray-500">
                                        Total:
                                      </span>
                                      <span className="ml-1 text-gray-700">
                                        {selectedLog.details.totalRecords}
                                      </span>
                                    </div>
                                    {selectedLog.details.approvedCount !==
                                      undefined && (
                                      <div>
                                        <span className="text-gray-500">
                                          Approved:
                                        </span>
                                        <span className="ml-1 text-green-600 font-medium">
                                          {selectedLog.details.approvedCount}
                                        </span>
                                      </div>
                                    )}
                                    {selectedLog.details.rejectedCount !==
                                      undefined && (
                                      <div>
                                        <span className="text-gray-500">
                                          Rejected:
                                        </span>
                                        <span className="ml-1 text-red-600 font-medium">
                                          {selectedLog.details.rejectedCount}
                                        </span>
                                      </div>
                                    )}
                                    {selectedLog.details.processedRecords !==
                                      undefined && (
                                      <div>
                                        <span className="text-gray-500">
                                          Processed:
                                        </span>
                                        <span className="ml-1 text-blue-600 font-medium">
                                          {selectedLog.details.processedRecords}
                                        </span>
                                      </div>
                                    )}
                                    {selectedLog.details.errors !==
                                      undefined && (
                                      <div>
                                        <span className="text-gray-500">
                                          Errors:
                                        </span>
                                        <span className="ml-1 text-red-600 font-medium">
                                          {selectedLog.details.errors}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Raw Details for any other information */}
                              <div>
                                <div className="text-xs font-medium text-gray-600 mb-1">
                                  Raw Data
                                </div>
                                <div className="bg-gray-50 p-2 rounded border">
                                  <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto max-h-32">
                                    {JSON.stringify(
                                      selectedLog.details,
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Action Impact Assessment */}
                      <div>
                        <label className="block text-sm font-medium text-green-700">
                          Action Impact
                        </label>
                        <div className="bg-white p-3 rounded border">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3 h-3 rounded-full ${
                                selectedLog.action?.includes("Delete") ||
                                selectedLog.action?.includes("Remove")
                                  ? "bg-red-500"
                                  : selectedLog.action?.includes("Create") ||
                                    selectedLog.action?.includes("Add")
                                  ? "bg-green-500"
                                  : selectedLog.action?.includes("Update") ||
                                    selectedLog.action?.includes("Edit")
                                  ? "bg-yellow-500"
                                  : "bg-blue-500"
                              }`}
                            ></span>
                            <span className="text-sm text-green-900">
                              {selectedLog.action?.includes("Delete") ||
                              selectedLog.action?.includes("Remove")
                                ? "High Impact - Data Deletion"
                                : selectedLog.action?.includes("Create") ||
                                  selectedLog.action?.includes("Add")
                                ? "Medium Impact - Data Creation"
                                : selectedLog.action?.includes("Update") ||
                                  selectedLog.action?.includes("Edit")
                                ? "Medium Impact - Data Modification"
                                : "Low Impact - Data Access/View"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Summary Section */}
              <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2 mb-4">
                  Quick Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedLog.module}
                    </div>
                    <div className="text-sm text-gray-500">Module</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedLog.action}
                    </div>
                    <div className="text-sm text-gray-500">Action</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedLog.userRole}
                    </div>
                    <div className="text-sm text-gray-500">User Role</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedLog.ipAddress}
                    </div>
                    <div className="text-sm text-gray-500">IP Address</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Generated:</span>{" "}
                {new Date(selectedLog.timestamp).toLocaleString()}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Copy log details to clipboard
                    const logInfo = `Audit Log: ${selectedLog.action} on ${
                      selectedLog.module
                    } by ${selectedLog.userName} at ${formatDate(
                      selectedLog.timestamp
                    )}`;
                    navigator.clipboard.writeText(logInfo);
                    toast.success("Log information copied to clipboard");
                  }}
                  className="btn btn-secondary text-sm"
                >
                  Copy Info
                </button>
                <button
                  onClick={closeModal}
                  className="btn btn-primary text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
