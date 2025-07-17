import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { inventoryAPI } from "../../utils/helpfunction";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/helpfunction";

const PendingSaleInventory = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);
  const [pendingSaleData, setPendingSaleData] = useState([]);

  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
    ,
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
              setShowDetailsModal(true);
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
          <button className="btn btn-secondary">Export Orders</button>
          <button className="btn btn-primary">Batch Process</button>
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
                {filteredData.length} orders found
              </span>
            </div>
          }
        />
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Order Details: {selectedOrder.orderNumber}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedOrder(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.customer}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Order Date
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.orderDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedOrder.status === "Ready to Ship"
                        ? "bg-green-100 text-green-800"
                        : selectedOrder.status === "Processing"
                        ? "bg-blue-100 text-blue-800"
                        : selectedOrder.status === "Awaiting Payment"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Order Items
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100">
                      <td className="px-4 py-2 text-sm font-bold" colSpan="3">
                        Total
                      </td>
                      <td className="px-4 py-2 text-sm font-bold">
                        ${selectedOrder.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Shipping Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Expected Ship Date
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedOrder.expectedShipDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Shipping Method
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    Standard Shipping
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedOrder(null);
                }}
              >
                Close
              </button>
              <button type="button" className="btn btn-primary">
                Update Status
              </button>
              {selectedOrder.status === "Ready to Ship" && (
                <button type="button" className="btn btn-success">
                  Ship Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingSaleInventory;
