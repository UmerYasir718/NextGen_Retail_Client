import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";
import {
  FaDownload,
  FaUpload,
  FaEye,
  FaSync,
  FaTrash,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import fileAPI from "../../utils/api/fileAPI";
import inventoryAPI from "../../utils/api/inventoryAPI";
import { formatDate, formatFileSize } from "../../utils/formatHelpers";
import InventoryDataModal from "../../components/inventory/InventoryDataModal";

const ForecastingManagement = () => {
  const { user } = useSelector((state) => state.auth); // Used for permissions and filtering
  const [forecastingFiles, setForecastingFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState("sale_forecasting");
  const [uploading, setUploading] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  const [tempInventoryData, setTempInventoryData] = useState([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      // Fetch sale forecasting files
      const forecastingResponse = await fileAPI.getFilesByType(
        "sale_forecasting"
      );

      // Handle the new API response structure
      let files = [];
      if (
        forecastingResponse?.data?.success ||
        forecastingResponse?.data?.data
      ) {
        files = Array.isArray(forecastingResponse?.data?.data)
          ? forecastingResponse?.data?.data
          : [];
      }

      setForecastingFiles(files);
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

  const handleViewInventory = async (fileId) => {
    try {
      setSelectedFileId(fileId);
      setInventoryLoading(true);
      setShowInventoryModal(true);

      const response = await inventoryAPI.getInventoryDataByFileId(fileId);

      // Handle the new API response structure
      let data = [];
      if (response.success || response.data) {
        data = Array.isArray(response.data) ? response.data : [];
      }

      setTempInventoryData(data);
      setTotalRecords(data.length);
      setCurrentPage(1);
      setTotalPages(Math.ceil(data.length / 10));
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      toast.error("Failed to load inventory data");
      setShowInventoryModal(false);
    } finally {
      setInventoryLoading(false);
    }
  };

  const handleDownloadProcessedFile = async (fileId) => {
    try {
      setDownloadingFile(fileId);
      const result = await fileAPI.downloadProcessedFile(fileId);
      console.log("result", result);
      if (result.success) {
        if (result.fallback) {
          toast.info(result.message);
        } else {
          toast.success(result.message || "File downloaded successfully");
        }
      } else {
        toast.error("Download failed");
      }
    } catch (err) {
      console.error("Error downloading file:", err);

      // Provide more specific error messages
      let errorMessage = "Failed to download file";

      if (err.message.includes("No response file URL")) {
        errorMessage = "No processed file available for download";
      } else if (err.message.includes("cloudinary.com")) {
        errorMessage = "Error accessing Cloudinary file. Please try again.";
      } else if (err.response?.status === 404) {
        errorMessage = "File not found on server";
      } else if (err.response?.status === 403) {
        errorMessage = "Access denied to this file";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      toast.error(errorMessage);
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleDownloadAsPDF = async (fileId) => {
    try {
      setDownloadingFile(`pdf_${fileId}`);
      const result = await fileAPI.downloadFileAsPDF(fileId);
      console.log("PDF result:", result);

      if (result.success) {
        toast.success(result.message || "PDF downloaded successfully");
      } else {
        toast.error("PDF generation failed");
      }
    } catch (err) {
      console.error("Error downloading as PDF:", err);

      // Provide specific error messages for PDF generation
      let errorMessage = "Failed to generate PDF";

      if (err.message.includes("No response file URL")) {
        errorMessage = "No file available for PDF generation";
      } else if (err.response?.status === 404) {
        errorMessage = "PDF generation endpoint not found";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error during PDF generation. Please try again.";
      } else if (err.message.includes("Failed to generate PDF")) {
        errorMessage = "PDF generation failed. The file may not be supported.";
      }

      toast.error(errorMessage);
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleDownloadOriginalFile = async (fileUrl, fileName) => {
    try {
      setDownloadingFile(fileName);
      // Create a temporary link element to download the file
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName || "downloaded_file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Original file downloaded successfully");
    } catch (err) {
      console.error("Error downloading original file:", err);
      toast.error("Failed to download original file");
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        await fileAPI.deleteFile(fileId);
        toast.success("File deleted successfully");
        fetchFiles();
      } catch (err) {
        console.error("Error deleting file:", err);
        toast.error("Failed to delete file");
      }
    }
  };

  const handleUpdateStatus = async (fileId, status) => {
    try {
      await fileAPI.updateFileStatus(fileId, status);
      toast.success(`File ${status} successfully`);
      fetchFiles();
    } catch (err) {
      console.error("Error updating file status:", err);
      toast.error("Failed to update file status");
    }
  };

  // Common columns for file tables
  const commonColumns = [
    {
      name: "File Name",
      selector: (row) => row.originalName || row.filename || "Unknown",
      sortable: true,
    },
    {
      name: "Upload Date",
      selector: (row) => formatDate(row.createdAt),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.status === "approved"
              ? "bg-green-100 text-green-800"
              : row.status === "rejected"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      name: "File Size",
      selector: (row) => row.fileSize || row.size,
      sortable: true,
      cell: (row) => {
        const size = row.fileSize || row.size;
        if (!size) return "N/A";
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
      },
    },
  ];

  // Sale forecasting columns
  const forecastingColumns = [
    ...commonColumns,
    {
      name: "Original File",
      cell: (row) => (
        <button
          className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() =>
            handleDownloadOriginalFile(
              row.fileUrl,
              row.originalName || row.name
            )
          }
          title="Download Original File"
          disabled={
            !row.fileUrl || downloadingFile === (row.originalName || row.name)
          }
        >
          {downloadingFile === (row.originalName || row.name) ? (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          ) : (
            <FaDownload />
          )}
        </button>
      ),
    },
    {
      name: "AI Response File",
      cell: (row) => (
        <div className="flex flex-col items-center space-y-1">
          <div className="flex space-x-1">
            <button
              className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleDownloadProcessedFile(row._id)}
              title="Download AI Processed File"
              disabled={
                !row.responseFileUrl ||
                row.status === "pending" ||
                downloadingFile === row._id
              }
            >
              {downloadingFile === row._id ? (
                <div className="animate-spin h-4 w-4 border-2 border-green-500 rounded-full border-t-transparent"></div>
              ) : (
                <FaDownload />
              )}
            </button>

            {/* PDF Download Button */}
            <button
              className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleDownloadAsPDF(row._id)}
              title="Download as PDF"
              disabled={
                !row.responseFileUrl ||
                row.status === "pending" ||
                downloadingFile === `pdf_${row._id}`
              }
            >
              {downloadingFile === `pdf_${row._id}` ? (
                <div className="animate-spin h-4 w-4 border-2 border-red-500 rounded-full border-t-transparent"></div>
              ) : (
                <span className="text-xs font-bold">PDF</span>
              )}
            </button>
          </div>

          {/* Show Cloudinary indicator */}
          {/* {row.responseFileUrl &&
            row.responseFileUrl.includes("cloudinary.com") && (
              <span
                className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full cursor-help"
                title="This file is stored on Cloudinary. If download fails, it will open in a new tab where you can save it manually."
              >
                Cloudinary
              </span>
            )} */}
        </div>
      ),
    },
  ];

  return (
    <div className="container-fluid mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Sale Forecasting Management</h1>

      {/* File Download Information */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-medium text-green-800 mb-2">
          📁 File Download Options
        </h3>
        <div className="text-sm text-green-700 space-y-1">
          <p>
            • <strong>📥 Download Button (Green):</strong> Downloads the
            original file format (CSV, PDF, Excel, etc.)
          </p>
          <p>
            • <strong>📄 PDF Button (Red):</strong> Converts any file to PDF
            format for consistent viewing
          </p>
          <p>
            • <strong>Cloudinary Files:</strong> Automatically handled with
            fallback options if direct download fails
          </p>
          <p>
            • <strong>File Types:</strong> Supports CSV, PDF, Excel, and other
            text-based formats for PDF conversion
          </p>
        </div>
      </div>

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

      {/* Action Buttons */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => {
            setFileType("sale_forecasting");
            setUploadModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaUpload />
          <span>Upload Sale Forecasting File</span>
        </button>
      </div>

      {/* File Type Information */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-700 mb-2">File Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium text-blue-600">📁 Original File:</span>{" "}
            The CSV file you uploaded for processing
          </div>
          <div>
            <span className="font-medium text-green-600">
              🤖 AI Response File:
            </span>{" "}
            The AI-processed forecasting results (PDF)
          </div>
        </div>
      </div>

      {/* Sale Forecasting Files Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          title="Sale Forecasting Files - Original & AI Processed"
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
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Upload Sale Forecasting File
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedFile(null);
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setUploadModalOpen(false);
                  setSelectedFile(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show Inventory Data Modal */}
      {showInventoryModal && (
        <InventoryDataModal
          isOpen={showInventoryModal}
          onClose={() => setShowInventoryModal(false)}
          fileId={selectedFileId}
          inventoryData={tempInventoryData}
          loading={inventoryLoading}
          onDataUpdate={() => {
            // Refresh data if needed
            fetchFiles();
          }}
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ForecastingManagement;
