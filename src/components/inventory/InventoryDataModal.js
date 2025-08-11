import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaCheck,
  FaTimes,
  FaSpinner,
  FaCheckSquare,
  FaSquare,
  FaBox,
  FaTruck,
  FaShoppingCart,
  FaClipboardList,
  FaInfoCircle,
  FaWarehouse,
  FaChartBar,
} from "react-icons/fa";
import inventoryAPI from "../../utils/api/inventoryAPI";
import fileAPI from "../../utils/api/fileAPI";
import { formatCurrency } from "../../utils/formatHelpers";

const InventoryDataModal = ({
  isOpen,
  onClose,
  fileId,
  inventoryData,
  loading,
  onDataUpdate,
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(true); // Default to select all
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");
  const [currentChunk, setCurrentChunk] = useState(0);
  const [chunkSize] = useState(50); // Items per chunk
  const [fileStatus, setFileStatus] = useState(null); // File status: approved, rejected, pending
  const [summary, setSummary] = useState({
    totalRetailPrice: 0,
    totalCostPrice: 0,
    totalQuantity: 0,
    totalItems: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
  });

  // Debug logging
  useEffect(() => {
    console.log("InventoryDataModal - inventoryData:", inventoryData);
    console.log("InventoryDataModal - loading:", loading);
    console.log("InventoryDataModal - fileId:", fileId);
    console.log("InventoryDataModal - fileStatus:", fileStatus);
    console.log(
      "InventoryDataModal - isConfirmationPending:",
      fileStatus === "confirmation_pending"
    );
    console.log(
      "InventoryDataModal - shouldShowButtons:",
      fileStatus === "confirmation_pending"
    );
  }, [inventoryData, loading, fileId, fileStatus]);

  // Accordion state for purchase tab
  const [openSections, setOpenSections] = useState({
    basicInfo: true,
    inventoryDetails: true,
    locationInfo: false,
    pricingInfo: true,
    utilization: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Auto-switch to inventory tab when data is loaded
  useEffect(() => {
    if (inventoryData && inventoryData.length > 0 && !loading) {
      setActiveTab("inventory");
      // Select all items by default only if confirmation is pending
      if (fileStatus === "confirmation_pending") {
        const allIds = new Set(inventoryData.map((item) => item._id));
        setSelectedRows(allIds);
        setSelectAll(true);
      } else {
        setSelectedRows(new Set());
        setSelectAll(false);
      }
    }
  }, [inventoryData, loading, fileStatus]);

  // Check file status when component loads or fileId changes
  const checkFileStatus = async () => {
    try {
      if (fileId) {
        console.log("Checking file status for fileId:", fileId);
        // Get file status from the file API
        const response = await fileAPI.getFile(fileId);
        console.log("File API response:", response);
        console.log("File API response.data:", response.data);
        console.log("File API response.data.status:", response.data?.status);

        let status = null;

        // Try different possible response structures
        if (response.data && response.data.status) {
          status = response.data.status;
          console.log("Found status in response.data.status:", status);
        } else if (
          response.data &&
          response.data.data &&
          response.data.data.status
        ) {
          status = response.data.data.status;
          console.log("Found status in response.data.data.status:", status);
        } else if (response.status) {
          status = response.status;
          console.log("Found status in response.status:", status);
        } else {
          console.log("No status found in any expected location");
        }

        if (status) {
          console.log("Setting file status to:", status);
          setFileStatus(status);
        } else {
          console.log("No status found in response");
        }
      } else {
        console.log("No fileId provided");
      }
    } catch (error) {
      console.error("Error checking file status:", error);
      console.error("Error details:", error.response?.data);
      // Fallback: try to get status from inventory data
      if (inventoryData && inventoryData.length > 0) {
        const firstItem = inventoryData[0];
        if (firstItem.status) {
          console.log(
            "Setting file status from inventory data:",
            firstItem.status
          );
          setFileStatus(firstItem.status);
        } else if (firstItem.fileStatus) {
          console.log(
            "Setting file status from inventory data fileStatus:",
            firstItem.fileStatus
          );
          setFileStatus(firstItem.fileStatus);
        }
      }
    }
  };

  useEffect(() => {
    console.log("useEffect triggered - fileId:", fileId, "isOpen:", isOpen);
    if (fileId && isOpen) {
      console.log("Calling checkFileStatus");
      checkFileStatus();
    } else {
      console.log(
        "Not calling checkFileStatus - fileId:",
        fileId,
        "isOpen:",
        isOpen
      );
    }
  }, [fileId, isOpen]);

  // Tab configuration - Single tab for inventory
  const tabs = [
    {
      id: "inventory",
      name: "Inventory Review",
      icon: FaBox,
      description: "Review and manage all inventory items",
    },
  ];

  useEffect(() => {
    if (inventoryData && inventoryData.length > 0) {
      calculateSummary(inventoryData);
    }
  }, [inventoryData]);

  const calculateSummary = (data) => {
    const summaryData = {
      totalRetailPrice: 0,
      totalCostPrice: 0,
      totalQuantity: 0,
      totalItems: data.length,
      approvedCount: 0,
      rejectedCount: 0,
      pendingCount: 0,
    };

    data.forEach((item) => {
      summaryData.totalRetailPrice +=
        (item.retailPrice || 0) * (item.quantity || 0);
      summaryData.totalCostPrice +=
        (item.costPrice || 0) * (item.quantity || 0);
      summaryData.totalQuantity += item.quantity || 0;

      if (item.status === "approved") summaryData.approvedCount++;
      else if (item.status === "rejected") summaryData.rejectedCount++;
      else summaryData.pendingCount++;
    });

    setSummary(summaryData);
  };

  const handleSelectAll = () => {
    if (fileStatus !== "confirmation_pending") return;

    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(inventoryData.map((item) => item._id));
      setSelectedRows(allIds);
      setSelectAll(true);
    }
  };

  // Get current chunk of data
  const getCurrentChunkData = () => {
    if (!inventoryData) return [];
    const startIndex = currentChunk * chunkSize;
    const endIndex = startIndex + chunkSize;
    return inventoryData.slice(startIndex, endIndex);
  };

  // Get total chunks
  const getTotalChunks = () => {
    if (!inventoryData) return 0;
    return Math.ceil(inventoryData.length / chunkSize);
  };

  // Handle chunk navigation
  const handleChunkChange = (direction) => {
    const totalChunks = getTotalChunks();
    if (direction === "next" && currentChunk < totalChunks - 1) {
      setCurrentChunk(currentChunk + 1);
    } else if (direction === "prev" && currentChunk > 0) {
      setCurrentChunk(currentChunk - 1);
    }
  };

  const handleRowSelect = (itemId) => {
    if (fileStatus !== "confirmation_pending") return;

    const newSelected = new Set(selectedRows);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedRows(newSelected);
    setSelectAll(newSelected.size === inventoryData.length);
  };

  const handleApprove = async (itemId = null) => {
    try {
      console.log("handleApprove", itemId);
      setProcessing(true);

      if (itemId) {
        // Individual item approval - use existing API
        const response = await inventoryAPI.approveTempInventory(itemId);
        if (response.success) {
          toast.success("Item approved successfully!");
          onDataUpdate();
        } else {
          toast.error(response.message || "Failed to approve item");
        }
      } else {
        // Bulk approval - use new process-temp-file API
        const response = await inventoryAPI.processTempFile(fileId, "approved");
        if (response.success) {
          toast.success("File approved successfully!");
          setFileStatus("approved");
          onDataUpdate();
        } else {
          toast.error(response.message || "Failed to approve file");
        }
      }
    } catch (error) {
      console.error("Error approving items:", error);
      toast.error("Failed to approve items");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (itemId = null) => {
    try {
      console.log("handleReject", itemId);
      setProcessing(true);

      if (itemId) {
        // Individual item rejection - use existing API
        const response = await inventoryAPI.rejectTempInventory(itemId);
        if (response.success) {
          toast.success("Item rejected successfully!");
          onDataUpdate();
        } else {
          toast.error(response.message || "Failed to reject item");
        }
      } else {
        // Bulk rejection - use new process-temp-file API
        const response = await inventoryAPI.processTempFile(fileId, "rejected");
        if (response.success) {
          toast.success("File rejected successfully!");
          setFileStatus("rejected");
          onDataUpdate();
        } else {
          toast.error(response.message || "Failed to reject file");
        }
      }
    } catch (error) {
      console.error("Error rejecting items:", error);
      toast.error("Failed to reject items");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: "bg-green-100 text-green-800", text: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      processing: { color: "bg-blue-100 text-blue-800", text: "Processing" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const getErrorBadge = (errors) => {
    if (!errors || errors.length === 0) return null;
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        {errors.length} Error(s)
      </span>
    );
  };

  const renderInventoryTab = () => {
    const currentChunkData = getCurrentChunkData();
    const totalChunks = getTotalChunks();
    const startIndex = currentChunk * chunkSize + 1;
    const endIndex = Math.min(
      (currentChunk + 1) * chunkSize,
      inventoryData?.length || 0
    );

    return (
      <div className="space-y-6">
        {/* Bulk Actions Header */}
        <div className="bg-white rounded-lg shadow p-6 border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Inventory Review
              </h3>
              <span className="text-sm text-gray-500">
                Showing {startIndex}-{endIndex} of {inventoryData?.length || 0}{" "}
                items
              </span>
              {fileStatus && (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    fileStatus === "approved"
                      ? "bg-green-100 text-green-800"
                      : fileStatus === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {fileStatus.charAt(0).toUpperCase() + fileStatus.slice(1)}
                </span>
              )}
            </div>
            {fileStatus === "confirmation_pending" && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleApprove()}
                  disabled={processing || selectedRows.size === 0}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaCheck className="mr-2" />
                  Approve File
                </button>
                <button
                  onClick={() => handleReject()}
                  disabled={processing || selectedRows.size === 0}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTimes className="mr-2" />
                  Reject File
                </button>
              </div>
            )}
          </div>

          {/* Select All and Chunk Navigation */}
          {fileStatus === "confirmation_pending" && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center text-gray-500 hover:text-gray-700"
                >
                  {selectAll ? (
                    <FaCheckSquare className="text-blue-600 mr-2" />
                  ) : (
                    <FaSquare className="mr-2" />
                  )}
                  <span className="text-sm font-medium">
                    {selectAll ? "Deselect All" : "Select All"}
                  </span>
                </button>
                <span className="text-sm text-gray-500">
                  {selectedRows.size} of {inventoryData?.length || 0} items
                  selected
                </span>
              </div>

              {/* Chunk Navigation */}
              {totalChunks > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleChunkChange("prev")}
                    disabled={currentChunk === 0}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {currentChunk + 1} of {totalChunks}
                  </span>
                  <button
                    onClick={() => handleChunkChange("next")}
                    disabled={currentChunk === totalChunks - 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Read-only message */}
          {fileStatus !== "confirmation_pending" && (
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <FaInfoCircle className="text-blue-500 mr-2" />
                <span className="text-sm text-gray-700">
                  {fileStatus === "approved"
                    ? "This file has been approved. You can only view the inventory data."
                    : fileStatus === "rejected"
                    ? "This file has been rejected. You can only view the inventory data."
                    : "This file is not pending confirmation. You can only view the inventory data."}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow p-6 border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {fileStatus === "confirmation_pending" && (
                    <th className="px-3 py-3 text-left">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {selectAll ? (
                          <FaCheckSquare className="text-blue-600" />
                        ) : (
                          <FaSquare />
                        )}
                      </button>
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bin ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retail Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {fileStatus === "confirmation_pending" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={fileStatus === "confirmation_pending" ? 10 : 9}
                      className="px-6 py-4 text-center"
                    >
                      <div className="flex items-center justify-center">
                        <FaSpinner className="animate-spin text-2xl text-blue-600 mr-2" />
                        <span>Loading inventory data...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentChunkData && currentChunkData.length > 0 ? (
                  currentChunkData.map((item, index) => (
                    <tr key={item._id || index} className="hover:bg-gray-50">
                      {fileStatus === "confirmation_pending" && (
                        <td className="px-3 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleRowSelect(item._id)}
                            className="flex items-center text-gray-500 hover:text-gray-700"
                          >
                            {selectedRows.has(item._id) ? (
                              <FaCheckSquare className="text-blue-600" />
                            ) : (
                              <FaSquare />
                            )}
                          </button>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.binId || item.bin_id || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.sku || item.SKU || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {item.name || item.itemName || "N/A"}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {item.description || item.desc || ""}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category || item.Category || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity || item.Quantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(
                          item.costPrice ||
                            item.cost_price ||
                            item.unitPrice ||
                            0
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(
                          item.retailPrice ||
                            item.retail_price ||
                            item.price ||
                            0
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {getStatusBadge(item.status)}
                          {getErrorBadge(item.errors)}
                        </div>
                      </td>
                      {fileStatus === "confirmation_pending" && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(item._id)}
                              disabled={processing}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              <FaCheck className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleReject(item._id)}
                              disabled={processing}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              <FaTimes className="text-sm" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={fileStatus === "confirmation_pending" ? 10 : 9}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {loading ? "Loading..." : "No inventory data available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  // Check if file is already approved or rejected
  const isFileProcessed =
    fileStatus === "approved" || fileStatus === "rejected";
  const isReadOnly = isFileProcessed;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Inventory Data Review
              </h1>
              <span className="text-sm text-gray-500">File ID: {fileId}</span>
              {fileStatus && (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    fileStatus === "approved"
                      ? "bg-green-100 text-green-800"
                      : fileStatus === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {fileStatus.charAt(0).toUpperCase() + fileStatus.slice(1)}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {fileStatus === "confirmation_pending" && (
                <>
                  <button
                    onClick={() => handleApprove()}
                    disabled={processing || selectedRows.size === 0}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaCheck className="mr-2" />
                    Approve File
                  </button>
                  <button
                    onClick={() => handleReject()}
                    disabled={processing || selectedRows.size === 0}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaTimes className="mr-2" />
                    Reject File
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 border-b">
          <div className="px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Debug Section - Remove in production */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                Debug Info:
              </h4>
              <div className="text-xs text-yellow-700">
                <p>Data Length: {inventoryData?.length || 0}</p>
                <p>Loading: {loading ? "Yes" : "No"}</p>
                <p>Active Tab: {activeTab}</p>
                {inventoryData && inventoryData.length > 0 && (
                  <p>
                    First Item Keys: {Object.keys(inventoryData[0]).join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "inventory" && renderInventoryTab()}
        </div>
      </div>
    </div>
  );
};

export default InventoryDataModal;
