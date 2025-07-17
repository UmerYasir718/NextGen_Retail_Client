import React, { useState } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";

const ForecastingManagement = () => {
  const { user } = useSelector((state) => state.auth);

  const [filterText, setFilterText] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");

  // Sample data for forecasting files
  const forecastingFilesData = [
    {
      id: 1,
      name: "Q3_Sales_Forecast.xlsx",
      type: "sales",
      uploadedBy: "John Smith",
      uploadDate: "2023-06-15",
      size: "1.2 MB",
      status: "active",
      companyId: 1,
      companyName: "NextGen Retail Corp",
    },
    {
      id: 2,
      name: "Inventory_Forecast_2023.csv",
      type: "inventory",
      uploadedBy: "Sarah Johnson",
      uploadDate: "2023-06-10",
      size: "980 KB",
      status: "active",
      companyId: 1,
      companyName: "NextGen Retail Corp",
    },
    {
      id: 3,
      name: "Seasonal_Demand_Analysis.xlsx",
      type: "demand",
      uploadedBy: "Michael Brown",
      uploadDate: "2023-05-22",
      size: "1.5 MB",
      status: "active",
      companyId: 2,
      companyName: "Fashion Forward Inc",
    },
    {
      id: 4,
      name: "Supply_Chain_Forecast.csv",
      type: "supply",
      uploadedBy: "Jessica Williams",
      uploadDate: "2023-06-05",
      size: "850 KB",
      status: "active",
      companyId: 2,
      companyName: "Fashion Forward Inc",
    },
    {
      id: 5,
      name: "Product_Demand_Q2.xlsx",
      type: "demand",
      uploadedBy: "David Miller",
      uploadDate: "2023-04-12",
      size: "1.1 MB",
      status: "archived",
      companyId: 3,
      companyName: "Tech Gadgets Ltd",
    },
    {
      id: 6,
      name: "Annual_Sales_Projection.xlsx",
      type: "sales",
      uploadedBy: "Emily Davis",
      uploadDate: "2023-01-15",
      size: "2.3 MB",
      status: "active",
      companyId: 1,
      companyName: "NextGen Retail Corp",
    },
    {
      id: 7,
      name: "Warehouse_Capacity_Forecast.csv",
      type: "capacity",
      uploadedBy: "Robert Wilson",
      uploadDate: "2023-05-30",
      size: "760 KB",
      status: "active",
      companyId: 5,
      companyName: "Sports Unlimited",
    },
  ];

  // Filter data based on search input and user's company (if not super_admin)
  const filteredData = forecastingFilesData.filter((item) => {
    // First filter by company if user is not super_admin
    if (user.role !== "super_admin" && user.companyId !== item.companyId) {
      return false;
    }

    // Then filter by search text
    const searchText = filterText.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(searchText)) ||
      (item.type && item.type.toLowerCase().includes(searchText)) ||
      (item.uploadedBy && item.uploadedBy.toLowerCase().includes(searchText)) ||
      (item.status && item.status.toLowerCase().includes(searchText))
    );
  });

  // File type display mapper
  const fileTypeDisplayMap = {
    sales: "Sales",
    inventory: "Inventory",
    demand: "Demand",
    supply: "Supply Chain",
    capacity: "Capacity",
  };

  // Table columns
  const columns = [
    { name: "File Name", selector: (row) => row.name, sortable: true },
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
      cell: (row) => {
        let typeClass = "bg-blue-100 text-blue-800";
        if (row.type === "sales") {
          typeClass = "bg-green-100 text-green-800";
        } else if (row.type === "inventory") {
          typeClass = "bg-purple-100 text-purple-800";
        } else if (row.type === "demand") {
          typeClass = "bg-yellow-100 text-yellow-800";
        } else if (row.type === "supply") {
          typeClass = "bg-indigo-100 text-indigo-800";
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs ${typeClass}`}>
            {fileTypeDisplayMap[row.type] || row.type}
          </span>
        );
      },
    },
    { name: "Uploaded By", selector: (row) => row.uploadedBy, sortable: true },
    { name: "Upload Date", selector: (row) => row.uploadDate, sortable: true },
    { name: "Size", selector: (row) => row.size, sortable: true },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
            Download
          </button>
          <button className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
            {row.status === "active" ? "Archive" : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  // If user is super_admin, add company column
  if (user.role === "super_admin") {
    columns.splice(3, 0, {
      name: "Company",
      selector: (row) => row.companyName,
      sortable: true,
    });
  }

  // Calculate file statistics
  const totalFiles = filteredData.length;
  const activeFiles = filteredData.filter(
    (file) => file.status === "active"
  ).length;
  const archivedFiles = filteredData.filter(
    (file) => file.status === "archived"
  ).length;

  // Get file type counts
  const fileTypeCounts = filteredData.reduce((acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + 1;
    return acc;
  }, {});

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is CSV or XLSX
      const fileExt = file.name.split(".").pop().toLowerCase();
      if (fileExt === "csv" || fileExt === "xlsx") {
        setSelectedFile(file);
        setFileError("");
      } else {
        setSelectedFile(null);
        setFileError("Only CSV or XLSX files are allowed");
      }
    }
  };

  // Handle upload form submission
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send the file to the backend
    // For now, we'll just close the modal
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadType("");
    setFileError("");
  };

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Forecasting Management
        </h1>
        <p className="text-gray-600">
          Upload, download, and manage forecasting data files
        </p>
      </div>

      {/* Search and Upload Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search files..."
            className="form-input w-full"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          Upload New File
        </button>
      </div>

      {/* File Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">{totalFiles}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">📁</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Files</p>
              <p className="text-2xl font-bold text-gray-900">{activeFiles}</p>
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
                Archived Files
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {archivedFiles}
              </p>
            </div>
            <div className="p-3 rounded-full bg-gray-100 text-gray-500">🗄️</div>
          </div>
        </div>
      </div>

      {/* File Type Distribution */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          File Type Distribution
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="font-medium text-green-800">Sales</p>
            <p className="text-2xl font-bold text-green-900">
              {fileTypeCounts.sales || 0}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="font-medium text-purple-800">Inventory</p>
            <p className="text-2xl font-bold text-purple-900">
              {fileTypeCounts.inventory || 0}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="font-medium text-yellow-800">Demand</p>
            <p className="text-2xl font-bold text-yellow-900">
              {fileTypeCounts.demand || 0}
            </p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <p className="font-medium text-indigo-800">Supply Chain</p>
            <p className="text-2xl font-bold text-indigo-900">
              {fileTypeCounts.supply || 0}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="font-medium text-blue-800">Capacity</p>
            <p className="text-2xl font-bold text-blue-900">
              {fileTypeCounts.capacity || 0}
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
                {filteredData.length} files found
              </span>
            </div>
          }
        />
      </div>

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Upload Forecasting File
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setUploadType("");
                  setFileError("");
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="fileType"
                >
                  File Type
                </label>
                <select
                  id="fileType"
                  className="form-input"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  required
                >
                  <option value="">Select file type</option>
                  <option value="sales">Sales Forecast</option>
                  <option value="inventory">Inventory Forecast</option>
                  <option value="demand">Demand Analysis</option>
                  <option value="supply">Supply Chain Forecast</option>
                  <option value="capacity">Capacity Forecast</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="file"
                >
                  Upload File (CSV or XLSX)
                </label>
                <input
                  type="file"
                  id="file"
                  className="form-input"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  required
                />
                {fileError && (
                  <p className="text-red-500 text-xs mt-1">{fileError}</p>
                )}
                {selectedFile && (
                  <p className="text-green-500 text-xs mt-1">
                    Selected: {selectedFile.name} (
                    {Math.round(selectedFile.size / 1024)} KB)
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setUploadType("");
                    setFileError("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!selectedFile || !uploadType}
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Download Template Button */}
      <div className="mt-8 text-center">
        <button className="btn btn-secondary">Download Template Files</button>
        <p className="text-sm text-gray-600 mt-2">
          Download template files to ensure your data is formatted correctly for
          upload
        </p>
      </div>
    </div>
  );
};

export default ForecastingManagement;
