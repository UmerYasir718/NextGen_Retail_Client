import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import auditLogAPI from "../../utils/api/auditLogAPI";
import { formatDate } from "../../utils/helpfunction";
import { FaSearch, FaSync, FaDownload } from "react-icons/fa";

const AuditLogs = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  const [auditLogs, setAuditLogs] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await auditLogAPI.getAuditLogs();

      // Validate and clean the data to ensure no objects are rendered directly
      const cleanData = Array.isArray(response?.data)
        ? response?.data.map((log) => ({
            ...log,
            user:
              typeof log.user === "string"
                ? log.user
                : typeof log.user === "object" && log.user !== null
                ? log.user.name || log.user.email || JSON.stringify(log.user)
                : "",
            userRole:
              typeof log.userRole === "string"
                ? log.userRole
                : typeof log.userRole === "object" && log.userRole !== null
                ? JSON.stringify(log.userRole)
                : "",
            action:
              typeof log.action === "string"
                ? log.action
                : typeof log.action === "object" && log.action !== null
                ? JSON.stringify(log.action)
                : "",
            details:
              typeof log.details === "string"
                ? log.details
                : typeof log.details === "object" && log.details !== null
                ? JSON.stringify(log.details)
                : "",
            ipAddress:
              typeof log.ipAddress === "string"
                ? log.ipAddress
                : typeof log.ipAddress === "object" && log.ipAddress !== null
                ? JSON.stringify(log.ipAddress)
                : "",
            status:
              typeof log.status === "string"
                ? log.status
                : typeof log.status === "object" && log.status !== null
                ? JSON.stringify(log.status)
                : "",
            timestamp: log.timestamp || new Date().toISOString(),
          }))
        : [];

      setAuditLogs(cleanData);
      setError(null);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError("Failed to load audit logs. Please try again.");
      toast.error("Failed to load audit logs");
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search input and filters
  const filteredData = auditLogs.filter((item) => {
    const searchText = filterText.toLowerCase();
    const matchesSearch =
      (item.user && item.user.toLowerCase().includes(searchText)) ||
      (item.action && item.action.toLowerCase().includes(searchText)) ||
      (item.details && item.details.toLowerCase().includes(searchText)) ||
      (item.ipAddress && item.ipAddress.toLowerCase().includes(searchText));

    const matchesDate =
      !dateFilter || (item.timestamp && item.timestamp.includes(dateFilter));

    const matchesAction =
      !actionFilter ||
      (item.action && item.action.toLowerCase() === actionFilter.toLowerCase());

    return matchesSearch && matchesDate && matchesAction;
  });

  // Get unique actions for filter dropdown
  const uniqueActions = [...new Set(auditLogs.map((log) => log.action))].filter(
    Boolean
  );

  // Table columns
  const columns = [
    {
      name: "Timestamp",
      selector: (row) => row.timestamp,
      sortable: true,
      cell: (row) => (
        <div className="text-sm">
          <div className="font-medium">{formatDate(row.timestamp)}</div>
          <div className="text-gray-500 text-xs">
            {new Date(row.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      name: "User",
      selector: (row) => {
        // Handle case where user might be an object
        if (typeof row.user === "object" && row.user !== null) {
          return row.user.name || row.user.email || JSON.stringify(row.user);
        }
        return row.user || "";
      },
      sortable: true,
      cell: (row) => {
        // Handle case where user might be an object
        const userName =
          typeof row.user === "object" && row.user !== null
            ? row.user.name || row.user.email || JSON.stringify(row.user)
            : row.user || "";

        const userRole =
          typeof row.userRole === "object" && row.userRole !== null
            ? JSON.stringify(row.userRole)
            : row.userRole || "";

        return (
          <div className="text-sm">
            <div className="font-medium">{userName}</div>
            <div className="text-gray-500 text-xs">{userRole}</div>
          </div>
        );
      },
    },
    {
      name: "Action",
      selector: (row) => {
        // Handle case where action might be an object
        if (typeof row.action === "object" && row.action !== null) {
          return JSON.stringify(row.action);
        }
        return row.action || "";
      },
      sortable: true,
      cell: (row) => {
        // Handle case where action might be an object
        const action =
          typeof row.action === "object" && row.action !== null
            ? JSON.stringify(row.action)
            : row.action || "";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              action?.includes("Login") || action?.includes("Logout")
                ? "bg-blue-100 text-blue-800"
                : action?.includes("Create") || action?.includes("Add")
                ? "bg-green-100 text-green-800"
                : action?.includes("Update") || action?.includes("Edit")
                ? "bg-yellow-100 text-yellow-800"
                : action?.includes("Delete") || action?.includes("Remove")
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {action}
          </span>
        );
      },
    },
    {
      name: "Details",
      selector: (row) => {
        // Handle case where details might be an object
        if (typeof row.details === "object" && row.details !== null) {
          return JSON.stringify(row.details);
        }
        return row.details || "";
      },
      sortable: true,
      cell: (row) => {
        // Handle case where details might be an object
        const details =
          typeof row.details === "object" && row.details !== null
            ? JSON.stringify(row.details)
            : row.details || "";

        return (
          <div className="text-sm max-w-xs truncate" title={details}>
            {details}
          </div>
        );
      },
    },
    {
      name: "IP Address",
      selector: (row) => {
        // Handle case where ipAddress might be an object
        if (typeof row.ipAddress === "object" && row.ipAddress !== null) {
          return JSON.stringify(row.ipAddress);
        }
        return row.ipAddress || "";
      },
      sortable: true,
      cell: (row) => {
        // Handle case where ipAddress might be an object
        const ipAddress =
          typeof row.ipAddress === "object" && row.ipAddress !== null
            ? JSON.stringify(row.ipAddress)
            : row.ipAddress || "";

        return (
          <span className="text-sm font-mono text-gray-600">{ipAddress}</span>
        );
      },
    },
    {
      name: "Status",
      selector: (row) => {
        // Handle case where status might be an object
        if (typeof row.status === "object" && row.status !== null) {
          return JSON.stringify(row.status);
        }
        return row.status || "";
      },
      sortable: true,
      cell: (row) => {
        // Handle case where status might be an object
        const status =
          typeof row.status === "object" && row.status !== null
            ? JSON.stringify(row.status)
            : row.status || "";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              status === "success"
                ? "bg-green-100 text-green-800"
                : status === "error"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  // Export to CSV
  const handleExportCSV = () => {
    const csvContent = [
      [
        "Timestamp",
        "User",
        "User Role",
        "Action",
        "Details",
        "IP Address",
        "Status",
      ],
      ...filteredData.map((log) => [
        formatDate(log.timestamp),
        log.user,
        log.userRole,
        log.action,
        log.details,
        log.ipAddress,
        log.status,
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
  };

  // Calculate statistics
  const totalLogs = filteredData.length;
  const successLogs = filteredData.filter(
    (log) => log.status === "success"
  ).length;
  const errorLogs = filteredData.filter((log) => log.status === "error").length;
  const todayLogs = filteredData.filter(
    (log) =>
      new Date(log.timestamp).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Audit Logs</h1>
        <p className="text-gray-600">
          Monitor system activities and user actions
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
                {totalLogs}
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
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl font-semibold text-gray-900">
                {successLogs}
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
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-semibold text-gray-900">
                {errorLogs}
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
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search logs..."
              className="form-input pl-10 pr-4 py-2"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <input
            type="date"
            className="form-input py-2"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />

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

        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            className="btn btn-secondary flex items-center"
            onClick={fetchAuditLogs}
          >
            <FaSync className="mr-2" /> Refresh
          </button>
          <button
            className="btn btn-success flex items-center"
            onClick={handleExportCSV}
          >
            <FaDownload className="mr-2" /> Export CSV
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
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
              No audit logs found. Try adjusting your search or filters.
            </div>
          }
        />
      </div>
    </div>
  );
};

export default AuditLogs;
