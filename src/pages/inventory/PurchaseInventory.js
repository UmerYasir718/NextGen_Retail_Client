/**
 * PurchaseInventory Component
 *
 * This component implements server-side pagination for purchase inventory management.
 *
 * Key Features:
 * - Server-side pagination with configurable page size
 * - Server-side search with debouncing (500ms delay)
 * - Server-side sorting by column
 * - Real-time data updates
 * - Export functionality for all data
 * - Proper error handling and loading states
 *
 * API Endpoints:
 * - GET /api/inventory/purchase?page={page}&limit={limit}&search={search}&sortBy={sortBy}&sortOrder={sortOrder}
 *
 * Pagination Response Structure:
 * {
 *   success: true,
 *   count: number,
 *   data: [...],
 *   pagination: {
 *     current: {
 *       page: number,
 *       limit: number,
 *       total: number,
 *       pages: number
 *     },
 *     next: {
 *       page: number,
 *       limit: number
 *     }
 *   },
 *   total: number
 * }
 */
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { exportToCSV } from "../../utils/helpfunction";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/helpfunction";
import InventoryModal from "../../components/inventory/InventoryModal";
import InventoryDataModal from "../../components/inventory/InventoryDataModal";
import {
  FaDownload,
  FaUpload,
  FaEye,
  FaSync,
  FaTrash,
  FaTimes,
  FaCheck,
  FaBox,
  FaSearch,
  FaPlus,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import fileAPI from "../../utils/api/fileAPI";
import inventoryAPI from "../../utils/api/inventoryAPI";
import { getCompanyId } from "../../utils/userUtils";

const PurchaseInventory = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  // Get companyId from Redux or localStorage
  const companyId = selectedCompany?.id || getCompanyId() || null;

  // State for data and UI
  const [filterText, setFilterText] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Tab state - first tab active by default
  const [activeTab, setActiveTab] = useState("inventoryItems");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add, edit, view
  const [selectedItem, setSelectedItem] = useState(null);

  // File management state
  const [purchaseFiles, setPurchaseFiles] = useState([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState("purchase_inventory");
  const [uploading, setUploading] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  const [tempInventoryData, setTempInventoryData] = useState([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  // Fetch inventory data from API
  useEffect(() => {
    if (companyId) {
      fetchInventoryData();
      fetchFiles();
    } else {
      console.warn("No companyId available");
      setInventoryData([]);
      setPurchaseFiles([]);
    }
  }, [companyId]);

  // Debounced search effect
  useEffect(() => {
    if (!companyId) return;

    const timeoutId = setTimeout(() => {
      fetchInventoryData(1, filterText, sortBy, sortOrder);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filterText, companyId]);

  // Effect for pagination and sorting changes
  useEffect(() => {
    if (
      companyId &&
      (currentPage > 1 || perPage !== 10 || sortBy || sortOrder !== "asc")
    ) {
      fetchInventoryData(currentPage, filterText, sortBy, sortOrder);
    }
  }, [currentPage, perPage, sortBy, sortOrder]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Handle search
  const handleSearch = useCallback((searchTerm) => {
    setFilterText(searchTerm);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Handle sort
  const handleSort = useCallback((column, sortDirection) => {
    // Map DataTable sort direction to API format
    const sortOrder = sortDirection === "asc" ? "asc" : "desc";

    // Get the sort field from the column
    const sortField = column.sortField || column.name?.toLowerCase();

    setSortBy(sortField);
    setSortOrder(sortOrder);
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  // Handle per page change
  const handlePerPageChange = useCallback((newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
  }, []);

  const fetchInventoryData = async (
    page = currentPage,
    search = filterText,
    sortByParam = sortBy,
    sortOrderParam = sortOrder
  ) => {
    try {
      setLoading(true);
      if (!companyId) {
        console.warn("No companyId available");
        setInventoryData([]);
        setTotalPages(1);
        setTotalRecords(0);
        return;
      }

      const data = await inventoryAPI.getPurchaseInventory(
        companyId,
        page,
        perPage,
        search,
        sortByParam,
        sortOrderParam
      );
      console.log("pagination response:", data);

      // Handle the response structure for pagination
      if (data.success || data.data) {
        // Handle the new API response structure
        const items = Array.isArray(data.data) ? data.data : [];

        // Clean and validate the data
        const cleanData = items.map((item) => ({
          ...item,
          name:
            typeof item.name === "string"
              ? item.name
              : JSON.stringify(item.name || ""),
          category:
            typeof item.category === "string"
              ? item.category
              : JSON.stringify(item.category || ""),
          status:
            typeof item.status === "string"
              ? item.status
              : JSON.stringify(item.status || ""),
          quantity:
            typeof item.quantity === "number"
              ? item.quantity
              : typeof item.quantity === "string"
              ? parseInt(item.quantity) || 0
              : 0,
          unitPrice:
            typeof item.unitPrice === "number"
              ? item.unitPrice
              : typeof item.unitPrice === "string"
              ? parseFloat(item.unitPrice) || 0
              : 0,
          totalValue:
            typeof item.totalValue === "number"
              ? item.totalValue
              : typeof item.totalValue === "string"
              ? parseFloat(item.totalValue) || 0
              : 0,
          purchaseDate: item.purchaseDate || item.createdAt || "",
          supplier:
            typeof item.supplier === "string"
              ? item.supplier
              : JSON.stringify(item.supplier || ""),
          sku:
            typeof item.sku === "string"
              ? item.sku
              : JSON.stringify(item.sku || ""),
          description:
            typeof item.description === "string"
              ? item.description
              : JSON.stringify(item.description || ""),
        }));

        setInventoryData(cleanData);

        // Update pagination info based on the new API response structure
        if (data.pagination && data.pagination.current) {
          const pagination = data.pagination.current;
          setTotalPages(pagination.pages || 1);
          setTotalRecords(pagination.total || cleanData.length);
          setCurrentPage(pagination.page || page);
          setPerPage(pagination.limit || perPage);
        } else if (data.total) {
          // Fallback using the total field
          setTotalPages(Math.ceil(data.total / perPage));
          setTotalRecords(data.total);
          setCurrentPage(page);
        } else {
          // Fallback if pagination info is not provided
          setTotalPages(1);
          setTotalRecords(cleanData.length);
          setCurrentPage(page);
        }

        setError(null);
      } else {
        throw new Error(data.message || "Failed to fetch inventory data");
      }
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      setError("Failed to load inventory data. Please try again.");
      toast.error("Failed to load inventory data");
      setInventoryData([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      // Fetch purchase inventory files
      const purchaseResponse = await fileAPI.getFilesByType(
        "purchase_inventory"
      );
      setPurchaseFiles(
        Array.isArray(purchaseResponse.data?.data)
          ? purchaseResponse.data?.data
          : []
      );
    } catch (err) {
      console.error("Error fetching files:", err);
      toast.error("Failed to load files");
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

      console.log("Fetching inventory data for fileId:", fileId);

      // Call the API with error handling
      let response;
      try {
        response = await inventoryAPI.getTempInventoryByFileId(fileId);
        console.log("API Response:", response);
        console.log("Response type:", typeof response);
        console.log(
          "Response keys:",
          response ? Object.keys(response) : "No response"
        );
      } catch (apiError) {
        console.error("API Error:", apiError);
        // Try alternative endpoint if the first one fails
        try {
          console.log("Trying alternative endpoint...");
          response = await inventoryAPI.getInventoryDataByFileId(fileId);
          console.log("Alternative API Response:", response);
        } catch (altError) {
          console.error("Alternative API Error:", altError);
          throw apiError; // Throw the original error
        }
      }

      // Handle different possible response structures
      let data = [];
      if (response) {
        // If response is an array, use it directly
        if (Array.isArray(response)) {
          data = response;
        }
        // If response.data is an array, use it directly
        else if (response.data && Array.isArray(response.data)) {
          data = response.data;
        }
        // If response.data.data exists (nested structure), use that
        else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          data = response.data.data;
        }
        // If response.data is an object with a data property that's an array
        else if (
          response.data &&
          typeof response.data === "object" &&
          response.data.data
        ) {
          data = Array.isArray(response.data.data) ? response.data.data : [];
        }
        // If response has a different structure, try to find the data
        else if (response.data && typeof response.data === "object") {
          // Look for common data properties
          const possibleDataProps = ["items", "records", "inventory", "data"];
          for (const prop of possibleDataProps) {
            if (response.data[prop] && Array.isArray(response.data[prop])) {
              data = response.data[prop];
              break;
            }
          }
        }
      }

      console.log("Processed data:", data);
      console.log("Data length:", data.length);

      setTempInventoryData(data);
      setTotalRecords(data.length);
      setCurrentPage(1);
      setTotalPages(Math.ceil(data.length / 10));
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      console.error("Error details:", err.response || err.message);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);

      // Show more specific error message
      let errorMessage = "Failed to load inventory data";
      if (err.response?.status === 404) {
        errorMessage = "File not found or no inventory data available";
      } else if (err.response?.status === 401) {
        errorMessage = "Unauthorized access. Please login again.";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }

      toast.error(errorMessage);
      setShowInventoryModal(false);
    } finally {
      setInventoryLoading(false);
    }
  };

  const handleDownloadProcessedFile = async (fileId) => {
    try {
      setDownloadingFile(fileId);
      await fileAPI.downloadProcessedFile(fileId);
      toast.success("File downloaded successfully");
    } catch (err) {
      console.error("Error downloading file:", err);
      toast.error("Failed to download file");
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

  // Filter data based on search input
  const filteredData =
    inventoryData &&
    inventoryData.filter(
      (item) =>
        (item?.name &&
          item?.name.toLowerCase().includes(filterText.toLowerCase())) ||
        (item?.category &&
          item.category.toLowerCase().includes(filterText.toLowerCase())) ||
        (item?.status &&
          item.status.toLowerCase().includes(filterText.toLowerCase()))
    );

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
      name: "Size",
      selector: (row) => row.size,
      sortable: true,
      cell: (row) => {
        const size = row.size;
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
      },
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
            onClick={() => handleViewInventory(row._id)}
            title="View Inventory"
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
              <FaCheck />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Table columns for inventory items
  const columns = [
    {
      name: "Item Name",
      selector: (row) => row.name || "",
      sortable: true,
      sortField: "name",
    },
    {
      name: "Category",
      selector: (row) => row.category || "",
      sortable: true,
      sortField: "category",
    },
    {
      name: "Quantity",
      selector: (row) => row.quantity || 0,
      sortable: true,
      sortField: "quantity",
    },
    {
      name: "Unit Price",
      selector: (row) => `$${row.unitPrice || 0}`,
      sortable: true,
      sortField: "unitPrice",
    },
    {
      name: "Total Price",
      selector: (row) => `$${row.price?.cost || row.totalValue || 0}`,
      sortable: true,
      sortField: "totalValue",
    },
    {
      name: "Purchase Date",
      selector: (row) => formatDate(row.createdAt || row.purchaseDate),
      sortable: true,
      sortField: "createdAt",
    },
    {
      name: "Status",
      selector: (row) => row.status || "",
      sortable: true,
      sortField: "status",
      cell: (row) => {
        const status = row.status || "";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              status === "Received"
                ? "bg-green-100 text-green-800"
                : status === "In Transit"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleViewItem(row)}
          >
            View
          </button>
          <button
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => handleEditItem(row)}
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  // Handle opening modal for different actions
  const handleAddItem = () => {
    setSelectedItem(null);
    setModalMode("add");
    setModalOpen(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setModalMode("view");
    setModalOpen(true);
  };

  // Handle form submission from modal
  const handleModalSubmit = async (formData) => {
    try {
      if (modalMode === "add") {
        await inventoryAPI.addInventoryItem(formData);
        toast.success("Inventory item added successfully");
      } else if (modalMode === "edit") {
        await inventoryAPI.updateInventoryItem(selectedItem._id, formData);
        toast.success("Inventory item updated successfully");
      }

      setModalOpen(false);
      fetchInventoryData(); // Refresh data
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        `Failed to ${modalMode === "add" ? "add" : "update"} inventory item`
      );
    }
  };

  // Handle CSV export
  const handleExportCSV = async () => {
    try {
      // For export, fetch all data without pagination
      const allData = await inventoryAPI.getPurchaseInventory(
        companyId,
        1,
        10000,
        filterText,
        sortBy,
        sortOrder
      );

      let exportData = [];
      if (allData.success || allData.data) {
        // Handle the new API response structure
        const items = Array.isArray(allData.data) ? allData.data : [];

        exportData = items.map((item) => ({
          name: item.name || "",
          category: item.category || "",
          sku: item.sku || "",
          quantity: item.quantity || 0,
          unitPrice: item.unitPrice || 0,
          totalPrice: item.price?.cost || item.totalValue || 0,
          supplier: item.supplier || "",
          status: item.status || "",
          purchaseDate: formatDate(item.createdAt || item.purchaseDate),
          description: item.description || "",
        }));
      }

      exportToCSV(exportData, "purchase_inventory.csv");
      toast.success("Inventory data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export inventory data");
    }
  };

  const totalItems = totalRecords;
  const totalPurchaseValue = inventoryData.reduce(
    (sum, order) => sum + (order.price?.cost || order.totalValue || 0),
    0
  );
  const totalRetailValue = inventoryData.reduce(
    (sum, order) => sum + (order.price?.retail || order.totalValue || 0),
    0
  );
  const onHold = inventoryData.filter(
    (order) => order.status === "On Hold" || order.status === "Awaiting Payment"
  ).length;

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Purchase Inventory Management
        </h1>
        <p className="text-gray-600">
          Manage your purchase orders and inventory acquisitions
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
                  ? `Managing purchase inventory for: ${selectedCompany.name}`
                  : "Please select a company from the dropdown in the header to manage specific inventory"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium flex items-center space-x-2 ${
            activeTab === "inventoryItems"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("inventoryItems")}
        >
          <FaBox className="text-lg" />
          <span>Inventory Items</span>
        </button>
        <button
          className={`py-2 px-4 font-medium flex items-center space-x-2 ${
            activeTab === "fileUpload"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("fileUpload")}
        >
          <FaUpload className="text-lg" />
          <span>File Upload & Existing Files</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "inventoryItems" && (
        <div>
          {/* Search and Action Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <input
                type="text"
                placeholder="Search inventory..."
                className="form-input w-full"
                value={filterText}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2"
                onClick={handleAddItem}
              >
                <FaPlus />
                <span>Add New Purchase</span>
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center space-x-2"
                onClick={handleExportCSV}
              >
                <FaDownload />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Inventory Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Purchase Value
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalPurchaseValue.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                  💰
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Retail Value
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalRetailValue.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-500">
                  💰
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Items
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalItems}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                  📦
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Items Data Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <DataTable
              columns={columns}
              data={inventoryData}
              pagination
              paginationServer
              paginationTotalRows={totalRecords}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerPageChange}
              sortServer
              onSort={(column, direction) => handleSort(column, direction)}
              responsive
              highlightOnHover
              striped
              progressPending={loading}
              progressComponent={<div className="py-8">Loading...</div>}
              noDataComponent={error ? error : "No inventory items found"}
              subHeader
              subHeaderComponent={
                <div className="w-full flex justify-end items-center py-2">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {totalRecords} total records
                    </span>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      )}

      {activeTab === "fileUpload" && (
        <div>
          {/* Upload Button */}
          <div className="mb-6">
            <button
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center space-x-2"
              onClick={() => {
                setFileType("purchase_inventory");
                setUploadModalOpen(true);
              }}
            >
              <FaUpload />
              <span>Upload Purchase Inventory File</span>
            </button>
          </div>

          {/* Uploaded Files Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Upload Purchase Inventory File
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

      {/* Inventory Modal */}
      <InventoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        inventoryType="purchase"
        initialData={selectedItem}
        onSubmit={handleModalSubmit}
      />

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

export default PurchaseInventory;
