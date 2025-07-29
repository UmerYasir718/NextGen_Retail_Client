import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { inventoryAPI, exportToCSV } from "../../utils/helpfunction";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/helpfunction";

const PendingSaleInventory = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);
  const [pendingSaleData, setPendingSaleData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [batchProcessing, setBatchProcessing] = useState(false);

  // Sample data for pending sale inventory
  // const pendingSaleData = [
  //   {
  //     id: 1,
  //     orderNumber: "ORD-2023-0001",
  //     customer: "Tech Solutions Inc.",
  //     items: [
  //       { name: "Laptop Dell XPS 13", quantity: 5, price: 1299, total: 6495 },
  //       { name: "Wireless Mouse", quantity: 5, price: 29.99, total: 149.95 },
  //     ],
  //     totalAmount: 6644.95,
  //     orderDate: "2023-06-10",
  //     expectedShipDate: "2023-06-18",
  //     status: "Processing",
  //   },
  //   {
  //     id: 2,
  //     orderNumber: "ORD-2023-0002",
  //     customer: "Global Retail Ltd.",
  //     items: [
  //       { name: "iPhone 13 Pro", quantity: 3, price: 1099, total: 3297 },
  //       { name: "iPhone Case", quantity: 3, price: 49.99, total: 149.97 },
  //     ],
  //     totalAmount: 3446.97,
  //     orderDate: "2023-06-12",
  //     expectedShipDate: "2023-06-19",
  //     status: "Awaiting Payment",
  //   },
  //   {
  //     id: 3,
  //     orderNumber: "ORD-2023-0003",
  //     customer: "Office Supplies Co.",
  //     items: [
  //       { name: "Office Desk Chair", quantity: 10, price: 199, total: 1990 },
  //       { name: "Desk Lamp LED", quantity: 10, price: 49.99, total: 499.9 },
  //     ],
  //     totalAmount: 2489.9,
  //     orderDate: "2023-06-13",
  //     expectedShipDate: "2023-06-20",
  //     status: "Processing",
  //   },
  //   {
  //     id: 4,
  //     orderNumber: "ORD-2023-0004",
  //     customer: "Education First",
  //     items: [
  //       { name: 'LED Monitor 27"', quantity: 8, price: 299.99, total: 2399.92 },
  //       {
  //         name: "Ergonomic Keyboard",
  //         quantity: 8,
  //         price: 89.99,
  //         total: 719.92,
  //       },
  //     ],
  //     totalAmount: 3119.84,
  //     orderDate: "2023-06-14",
  //     expectedShipDate: "2023-06-21",
  //     status: "Ready to Ship",
  //   },
  //   {
  //     id: 5,
  //     orderNumber: "ORD-2023-0005",
  //     customer: "Healthcare Systems",
  //     items: [
  //       { name: "Laptop Dell XPS 13", quantity: 3, price: 1299, total: 3897 },
  //       {
  //         name: "Printer Ink Cartridges",
  //         quantity: 10,
  //         price: 34.99,
  //         total: 349.9,
  //       },
  //     ],
  //     totalAmount: 4246.9,
  //     orderDate: "2023-06-15",
  //     expectedShipDate: "2023-06-22",
  //     status: "On Hold",
  //   },
  //   {
  //     id: 6,
  //     orderNumber: "ORD-2023-0006",
  //     customer: "Retail Chain Inc.",
  //     items: [
  //       {
  //         name: "USB Flash Drives 64GB",
  //         quantity: 50,
  //         price: 19.99,
  //         total: 999.5,
  //       },
  //       {
  //         name: "Wireless Headphones",
  //         quantity: 10,
  //         price: 159.99,
  //         total: 1599.9,
  //       },
  //     ],
  //     totalAmount: 2599.4,
  //     orderDate: "2023-06-16",
  //     expectedShipDate: "2023-06-23",
  //     status: "Processing",
  //   },
  // ];
  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Handle CSV export
  const handleExportCSV = () => {
    try {
      // Prepare data for export (remove complex objects)
      const exportData = filteredData.map((item) => ({
        name: item.name || "",
        category: item.category || "",
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        totalCost: item.price?.cost || 0,
        orderDate: formatDate(item.createdAt),
        status: item.status || "",
        sku: item.sku || "",
        description: item.description || "",
      }));

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
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      // const companyId = selectedCompany?.id || null;
      // if (!companyId) {
      //   setInventoryData([]);
      //   return;
      // }

      const data = await inventoryAPI.getPendingSaleInventory(
        "6876bda9694900c60234bf5e"
      );
      console.log("object", data);
      setPendingSaleData(Array.isArray(data?.data) ? data?.data : []);
      console.log("DATA RESPONSE", data);

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

  // Filter data based on search input
  const filteredData = pendingSaleData.filter(
    (item) =>
      (item.orderNumber &&
        item.orderNumber.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.customer &&
        item.customer.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.status &&
        item.status.toLowerCase().includes(filterText.toLowerCase()))
  );

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
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              setSelectedOrder(row);
              // setShowDetailsModal(true);
            }}
          >
            Details
          </button>
          <button className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">
            Ship
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
                {filteredData.length} orders found
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default PendingSaleInventory;
