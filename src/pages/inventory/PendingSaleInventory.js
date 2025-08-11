import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { exportToCSV } from "../../utils/helpfunction";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/helpfunction";
import inventoryAPI from "../../utils/api/inventoryAPI";
import { getCompanyId } from "../../utils/userUtils";

const PendingSaleInventory = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  // Get companyId from Redux or localStorage
  const companyId = selectedCompany?.id || getCompanyId() || null;

  // State for data and UI
  const [filterText, setFilterText] = useState("");
  const [pendingSaleData, setPendingSaleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [allData, setAllData] = useState(null);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Handle CSV export
  const handleExportCSV = () => {
    try {
      let exportData = [];
      if (allData && allData.success) {
        // Export all data, not just current page
        const allItems = Array.isArray(allData.data) ? allData.data : [];
        exportData = allItems.map((item) => ({
          name: item.name || "",
          category: item.category || "",
          quantity: item.quantity || 0,
          unitPrice: item.price?.retail || 0,
          totalCost: (item.quantity || 0) * (item.price?.cost || 0),
          orderDate: formatDate(item.createdAt),
          status: item.status || "",
          sku: item.sku || "",
          description: item.description || "",
        }));
      } else {
        // Fallback to current page data
        exportData = filteredData.map((item) => ({
          name: item.name || "",
          category: item.category || "",
          quantity: item.quantity || 0,
          unitPrice: item.price?.retail || 0,
          totalCost: (item.quantity || 0) * (item.price?.cost || 0),
          orderDate: formatDate(item.createdAt),
          status: item.status || "",
          sku: item.sku || "",
          description: item.description || "",
        }));
      }

      exportToCSV(exportData, "pending_sale_inventory.csv");
      toast.success("Pending sale inventory data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export inventory data");
    }
  };

  // Handle row selection
  const handleRowSelected = (state) => {
    setSelectedRows(state.selectedRows);
  };

  // Toggle batch processing mode
  const toggleBatchProcessing = () => {
    setBatchProcessing(!batchProcessing);
    if (!batchProcessing) {
      // Entering batch mode - clear any previous selections
      setSelectedRows([]);
    }
  };

  // Handle batch approval
  const handleBatchApprove = () => {
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one item to approve");
      return;
    }

    // Get IDs of selected rows
    const selectedIds = selectedRows.map((row) => row._id);
    console.log("Approving items with IDs:", selectedIds);

    // Here you would call the API to approve these items
    // For now, we'll just show a toast and log to console
    toast.success(`${selectedIds.length} items approved successfully`);

    // Reset selection after processing
    setSelectedRows([]);
    setBatchProcessing(false);

    // Refresh data
    fetchInventoryData();
  };

  // Handle batch rejection
  const handleBatchReject = () => {
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one item to reject");
      return;
    }

    // Get IDs of selected rows
    const selectedIds = selectedRows.map((row) => row._id);
    console.log("Rejecting items with IDs:", selectedIds);

    // Here you would call the API to reject these items
    // For now, we'll just show a toast and log to console
    toast.success(`${selectedIds.length} items rejected successfully`);

    // Reset selection after processing
    setSelectedRows([]);
    setBatchProcessing(false);

    // Refresh data
    fetchInventoryData();
  };
  const fetchInventoryData = async (
    page = 1,
    limit = 10,
    search = "",
    sortBy = "",
    sortOrder = "asc"
  ) => {
    try {
      setLoading(true);
      if (!companyId) {
        console.warn("No companyId available");
        setPendingSaleData([]);
        return;
      }

      const data = await inventoryAPI.getPendingSaleInventory(
        companyId,
        page,
        limit,
        search,
        sortBy,
        sortOrder
      );
      console.log("Pending sale inventory response:", data);

      // Handle the new API response structure
      let items = [];
      if (data.success || data.data) {
        items = Array.isArray(data.data) ? data.data : [];
      }

      // Clean and validate the data
      const cleanData = items.map((item) => ({
        ...item,
        name: item.name || "Unknown Item",
        category: item.category || "Uncategorized",
        sku: item.sku || "N/A",
        quantity: item.quantity || 0,
        price: item.price || { retail: 0, cost: 0 },
        status: item.status || "Processing",
        location: item.location || {},
      }));

      setPendingSaleData(cleanData);
      setAllData(data);

      // Update pagination info based on the new API response structure
      if (data.pagination && data.pagination.current) {
        const pagination = data.pagination.current;
        setTotalPages(pagination.pages || 1);
        setTotalRecords(pagination.total || cleanData.length);
        setCurrentPage(pagination.page || page);
        setPerPage(pagination.limit || limit);
      } else if (data.total) {
        // Fallback using the total field
        setTotalPages(Math.ceil(data.total / limit));
        setTotalRecords(data.total);
        setCurrentPage(page);
      } else {
        // Fallback if pagination info is not provided
        setTotalPages(1);
        setTotalRecords(cleanData.length);
        setCurrentPage(page);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      setError("Failed to load inventory data. Please try again.");
      toast.error("Failed to load inventory data");
      setPendingSaleData([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filterText !== "") {
        fetchInventoryData(1, perPage, filterText);
        setCurrentPage(1);
      } else {
        fetchInventoryData(1, perPage);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filterText, perPage]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchInventoryData(page, perPage, filterText);
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    fetchInventoryData(1, newPerPage, filterText);
  };

  // Filter data based on search input (for local filtering if needed)
  const filteredData = pendingSaleData.filter(
    (item) =>
      (item.orderNumber &&
        item.orderNumber.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.customer &&
        item.customer.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.status &&
        item.status.toLowerCase().includes(filterText.toLowerCase()))
  );
  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await inventoryAPI.updateInventoryStatus(
        id,
        status.toString()
      );
      console.log("response", response);
      toast.success("Inventory status updated successfully");
      fetchInventoryData();
    } catch (err) {
      console.error("Error updating inventory status:", err);
      toast.error("Failed to update inventory status");
    }
  };
  // Table columns
  const columns = [
    {
      name: "Select",
      selector: (row) => row._id,
      sortable: false,
      omit: !batchProcessing, // Only show when batch processing is active
      width: "50px",
      cell: () => <div className="flex justify-center w-full"></div>, // Empty cell for checkbox rendering by DataTable
    },
    { name: "Name ", selector: (row) => row.name, sortable: true },
    { name: "SKU", selector: (row) => row.sku, sortable: true },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
    },
    {
      name: "Items",
      selector: (row) => row.quantity ?? 0,
      cell: (row) => `${row.quantity ?? 0} `,
      sortable: true,
    },
    {
      name: "Total Amount",
      selector: (row) => {
        const quantity = row.quantity ?? 0;
        const unitPrice = row.price.retail ?? 0;
        return `$${(quantity * unitPrice).toFixed(2)}`;
      },
      sortable: true,
    },
    {
      name: "Order Date",
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
            row.status === "Ready to Ship"
              ? "bg-green-100 text-green-800"
              : row.status === "Processing"
              ? "bg-blue-100 text-blue-800"
              : row.status === "Awaiting Payment"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleUpdateStatus(row._id, "sale")}
            className="text-green-600 hover:text-green-900 mr-2"
          >
            Approve
          </button>
          <button
            onClick={() => handleUpdateStatus(row._id, "purchase")}
            className="text-red-600 hover:text-red-900"
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  // Calculate order statistics
  const totalOrders = pendingSaleData.length;
  const totalValue = pendingSaleData.reduce(
    (sum, order) => sum + order.quantity * order.price.retail,
    0
  );
  const readyToShip = pendingSaleData.filter(
    (order) => order.status === "Ready to Ship"
  ).length;
  const onHold = pendingSaleData.filter(
    (order) => order.status === "On Hold" || order.status === "Awaiting Payment"
  ).length;

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Pending Sale Inventory
        </h1>
        <p className="text-gray-600">
          Manage your pending orders and prepare them for shipment
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
                  ? `Managing pending sales for: ${selectedCompany.name}`
                  : "Please select a company from the dropdown in the header to manage specific orders"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search orders..."
            className="form-input w-full"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleExportCSV}
          >
            Export CSV
          </button>
          <button
            className={`${
              batchProcessing
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white px-4 py-2 rounded`}
            onClick={toggleBatchProcessing}
          >
            {batchProcessing ? "Cancel Batch" : "Batch Process"}
          </button>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">📋</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalValue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              💰
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ready to Ship</p>
              <p className="text-2xl font-bold text-gray-900">{readyToShip}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              🚚
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On Hold</p>
              <p className="text-2xl font-bold text-gray-900">{onHold}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              ⏸️
            </div>
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      {batchProcessing && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg flex justify-between items-center">
          <div>
            <span className="font-medium">
              {selectedRows.length} items selected
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={handleBatchApprove}
              disabled={selectedRows.length === 0}
            >
              Approve Selected
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={handleBatchReject}
              disabled={selectedRows.length === 0}
            >
              Reject Selected
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          paginationServer
          paginationTotalRows={totalRecords}
          paginationDefaultPage={currentPage}
          paginationPerPage={perPage}
          paginationRowsPerPageOptions={[10, 20, 50, 100]}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerPageChange}
          responsive
          highlightOnHover
          striped
          subHeader
          selectableRows={batchProcessing}
          selectableRowsHighlight={true}
          onSelectedRowsChange={handleRowSelected}
          clearSelectedRows={!batchProcessing}
          subHeaderComponent={
            <div className="w-full text-right py-2">
              <span className="text-sm text-gray-600">
                Showing {(currentPage - 1) * perPage + 1} to{" "}
                {Math.min(currentPage * perPage, totalRecords)} of{" "}
                {totalRecords} orders
              </span>
            </div>
          }
          progressPending={loading}
          progressComponent={
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default PendingSaleInventory;
