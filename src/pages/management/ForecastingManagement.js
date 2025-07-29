import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";
import { FaDownload, FaUpload, FaEye, FaSync, FaTrash } from "react-icons/fa";
import fileAPI from "../../utils/api/fileAPI";
import { formatDate, formatFileSize } from "../../utils/formatHelpers";

const ForecastingManagement = () => {
  const { user } = useSelector((state) => state.auth); // Used for permissions and filtering
  const [activeTab, setActiveTab] = useState("purchase_inventory");
  const [purchaseFiles, setPurchaseFiles] = useState([]);
  const [forecastingFiles, setForecastingFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState("purchase_inventory");
  const [uploading, setUploading] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      // Fetch purchase inventory files
      const purchaseResponse = await fileAPI.getFilesByType(
        "purchase_inventory"
      );
      setPurchaseFiles(
        Array.isArray(purchaseResponse.data?.data)
          ? purchaseResponse.data?.data
          : []
      );

      // Fetch sale forecasting files
      const forecastingResponse = await fileAPI.getFilesByType(
        "sale_forecasting"
      );
      setForecastingFiles(
        Array.isArray(forecastingResponse.data?.data)
          ? forecastingResponse.data?.data
          : []
      );

      setError(null);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to load files. Please try again.");
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is CSV
      if (!file.name.endsWith(".csv")) {
        toast.error("Only CSV files are allowed");
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      await fileAPI.uploadFile(selectedFile, fileType);
      toast.success("File uploaded successfully");
      setUploadModalOpen(false);
      setSelectedFile(null);
      fetchFiles();
    } catch (err) {
      console.error("Error uploading file:", err);
      toast.error(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleViewFile = async (fileId) => {
    try {
      setViewingFile(fileId);
      const response = await fileAPI.getFile(fileId);

      if (!response.data || !response.data.url) {
        throw new Error("File URL not found in response");
      }

      const fileUrl = response.data.url;
      window.open(fileUrl, "_blank");
    } catch (err) {
      console.error("Error viewing file:", err);
      toast.error(
        err.response?.data?.message || "Failed to view file. Please try again."
      );
    } finally {
      setViewingFile(null);
    }
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const handleDeleteFile = async (fileId) => {
    setFileToDelete(fileId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteFile = async () => {
    try {
      await fileAPI.deleteFile(fileToDelete);
      toast.success("File deleted successfully");
      fetchFiles();
      setDeleteConfirmOpen(false);
      setFileToDelete(null);
    } catch (err) {
      console.error("Error deleting file:", err);
      toast.error("Failed to delete file");
    }
  };

  const handleUpdateStatus = async (fileId, status) => {
    try {
      await fileAPI.updateFileStatus(fileId, status);
      toast.success(`File status updated to ${status}`);
      fetchFiles();
    } catch (err) {
      console.error("Error updating file status:", err);
      toast.error("Failed to update file status");
    }
  };

  const handleDownloadProcessedFile = async (fileId) => {
    try {
      setDownloadingFile(fileId);
      // In a real implementation, this would call a different API endpoint
      // that returns the processed version of the file
      const response = await fileAPI.getFile(fileId);

      if (!response.data || !response.data.url) {
        throw new Error("Processed file URL not found in response");
      }

      const fileUrl = response.data.url;

      // Create a temporary link element to trigger the download
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute(
        "download",
        `processed_${response.data.filename || "file.csv"}`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started");
    } catch (err) {
      console.error("Error downloading processed file:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to download processed file. Please try again."
      );
    } finally {
      setDownloadingFile(null);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let color = "";
    let icon = "";

    switch (status) {
      case "pending":
        color = "bg-yellow-100 text-yellow-800 border border-yellow-300";
        icon = "⏳";
        break;
      case "processing":
        color = "bg-blue-100 text-blue-800 border border-blue-300";
        icon = "⚙️";
        break;
      case "approved":
        color = "bg-green-100 text-green-800 border border-green-300";
        icon = "✅";
        break;
      case "rejected":
        color = "bg-red-100 text-red-800 border border-red-300";
        icon = "❌";
        break;
      default:
        color = "bg-gray-100 text-gray-800 border border-gray-300";
        icon = "❓";
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${color} flex items-center justify-center space-x-1 shadow-sm`}
      >
        <span>{icon}</span>
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  // Common columns for both tables
  const commonColumns = [
    {
      name: "File Name",
      selector: (row) => row.originalName || row.name,
      sortable: true,
    },
    {
      name: "Size",
      selector: (row) => formatFileSize(row.fileSize),
      sortable: true,
    },
    {
      name: "Uploaded On",
      selector: (row) => formatDate(row.createdAt),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  // Purchase inventory columns
  const purchaseColumns = [
    ...commonColumns,
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="p-1 text-blue-600 hover:text-blue-800"
            onClick={() => handleViewFile(row._id)}
            title="View File"
            disabled={viewingFile === row._id}
          >
            {viewingFile === row._id ? (
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            ) : (
              <FaEye />
            )}
          </button>
          <button
            className="p-1 text-red-600 hover:text-red-800"
            onClick={() => handleDeleteFile(row._id)}
            title="Delete File"
          >
            <FaTrash />
          </button>
          {user?.role === "super_admin" && row.status !== "approved" && (
            <button
              className="p-1 text-green-600 hover:text-green-800"
              onClick={() => handleUpdateStatus(row._id, "approved")}
              title="Approve File"
            >
              ✓
            </button>
          )}
        </div>
      ),
    },
  ];

  // Sale forecasting columns
  const forecastingColumns = [
    ...commonColumns,
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="p-1 text-blue-600 hover:text-blue-800"
            onClick={() => handleViewFile(row._id)}
            title="View File"
          >
            <FaEye />
          </button>
          <button
            className="p-1 text-green-600 hover:text-green-800"
            onClick={() => handleDownloadProcessedFile(row._id)}
            title="Download Processed File"
            disabled={row.status !== "approved" || downloadingFile === row._id}
          >
            {downloadingFile === row._id ? (
              <div className="animate-spin h-4 w-4 border-2 border-green-500 rounded-full border-t-transparent"></div>
            ) : (
              <FaDownload />
            )}
          </button>
          <button
            className="p-1 text-red-600 hover:text-red-800"
            onClick={() => handleDeleteFile(row._id)}
            title="Delete File"
          >
            <FaTrash />
          </button>
          {user?.role === "super_admin" && row.status !== "approved" && (
            <button
              className="p-1 text-green-600 hover:text-green-800"
              onClick={() => handleUpdateStatus(row._id, "approved")}
              title="Approve File"
            >
              ✓
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container-fluid mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Forecasting Management</h1>

      {/* Error display */}
      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
          role="alert"
        >
          <p>{error}</p>
          <button
            className="flex items-center mt-2 text-sm font-medium text-red-700 hover:text-red-900"
            onClick={fetchFiles}
          >
            <FaSync className="mr-1" /> Retry
          </button>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={fetchFiles}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
          disabled={loading}
        >
          <FaSync className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "purchase_inventory"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("purchase_inventory")}
            >
              Purchase Inventory
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "sale_forecasting"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("sale_forecasting")}
            >
              Sale Forecasting
            </button>
          </nav>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mb-6 space-x-4">
        {activeTab === "sale_forecasting" && (
          <>
            <button
              className="btn btn-primary flex items-center"
              onClick={() => {
                setFileType("sale_forecasting");
                setUploadModalOpen(true);
              }}
            >
              <FaUpload className="mr-2" /> Upload File
            </button>
            <button
              className="btn btn-success flex items-center"
              onClick={() => {
                // This would typically download a template file
                toast.info(
                  "Template download functionality would be implemented here"
                );
              }}
            >
              <FaDownload className="mr-2" /> Download Template
            </button>
          </>
        )}
        {activeTab === "purchase_inventory" && (
          <button
            className="btn btn-primary flex items-center"
            onClick={() => {
              setFileType("purchase_inventory");
              setUploadModalOpen(true);
            }}
          >
            <FaUpload className="mr-2" /> Upload File
          </button>
        )}
      </div>

      {/* File Tables */}
      {activeTab === "purchase_inventory" ? (
        <DataTable
          title="Purchase Inventory Files"
          columns={purchaseColumns}
          data={purchaseFiles}
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
            <div className="p-8 text-center">
              <div className="bg-gray-50 rounded-lg p-6 inline-block shadow-sm border border-gray-200">
                <div className="text-gray-400 text-5xl mb-3">📂</div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  No purchase inventory files found
                </h3>
                <p className="text-gray-500 mb-4">
                  Upload a CSV file to get started
                </p>
                <button
                  onClick={() => {
                    setFileType("purchase_inventory");
                    setUploadModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <FaUpload />
                  <span>Upload File</span>
                </button>
              </div>
            </div>
          }
        />
      ) : (
        <DataTable
          title="Sale Forecasting Files"
          columns={forecastingColumns}
          data={forecastingFiles}
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
            <div className="p-8 text-center">
              <div className="bg-gray-50 rounded-lg p-6 inline-block shadow-sm border border-gray-200">
                <div className="text-gray-400 text-5xl mb-3">📈</div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  No sale forecasting files found
                </h3>
                <p className="text-gray-500 mb-4">
                  Upload a CSV file to get started
                </p>
                <button
                  onClick={() => {
                    setFileType("sale_forecasting");
                    setUploadModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <FaUpload />
                  <span>Upload File</span>
                </button>
              </div>
            </div>
          }
        />
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Upload{" "}
                {fileType === "purchase_inventory"
                  ? "Purchase Inventory"
                  : "Sale Forecasting"}{" "}
                File
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedFile(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Select CSV File
              </label>
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <FaUpload className="text-blue-500 text-3xl mb-2" />
                  <span className="text-blue-600 font-medium">
                    Click to select a CSV file
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Only CSV files are allowed (max 10MB)
                  </span>
                </label>
              </div>

              {/* File Preview */}
              {selectedFile && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-md">
                      <span className="text-blue-700 text-xl">📄</span>
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-red-500 hover:text-red-700"
                      type="button"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedFile(null);
                }}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FaUpload />
                    <span>Upload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Confirm Delete
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setFileToDelete(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
                <div className="flex items-center">
                  <div className="text-red-500 text-3xl mr-3">⚠️</div>
                  <div>
                    <h3 className="font-medium text-red-800">Are you sure?</h3>
                    <p className="text-sm text-red-600">
                      This action cannot be undone. The file will be permanently
                      deleted.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setFileToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center space-x-2"
                onClick={confirmDeleteFile}
              >
                <FaTrash />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastingManagement;
