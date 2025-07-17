import React, { useState } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";

const ShipmentManagement = () => {
  const { user } = useSelector((state) => state.auth);

  const [filterText, setFilterText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Sample data for shipments
  const shipmentsData = [
    {
      id: "SHP-2023-001",
      origin: "Main Distribution Center",
      destination: "West Coast Facility",
      items: 45,
      weight: "320 kg",
      shipDate: "2023-06-15",
      estimatedArrival: "2023-06-18",
      status: "in-transit",
      carrier: "Express Logistics",
      trackingNumber: "EL789456123",
      companyId: 1,
      companyName: "NextGen Retail Corp",
    },
    {
      id: "SHP-2023-002",
      origin: "Main Distribution Center",
      destination: "Northeast Depot",
      items: 32,
      weight: "180 kg",
      shipDate: "2023-06-14",
      estimatedArrival: "2023-06-16",
      status: "delivered",
      carrier: "Fast Freight",
      trackingNumber: "FF456789012",
      companyId: 1,
      companyName: "NextGen Retail Corp",
    },
    {
      id: "SHP-2023-003",
      origin: "Central Storage",
      destination: "Southern Hub",
      items: 28,
      weight: "210 kg",
      shipDate: "2023-06-16",
      estimatedArrival: "2023-06-19",
      status: "processing",
      carrier: "Express Logistics",
      trackingNumber: "EL789456124",
      companyId: 2,
      companyName: "Fashion Forward Inc",
    },
    {
      id: "SHP-2023-004",
      origin: "Tech Storage Facility",
      destination: "West Coast Facility",
      items: 15,
      weight: "95 kg",
      shipDate: "2023-06-12",
      estimatedArrival: "2023-06-15",
      status: "delivered",
      carrier: "Reliable Shipping",
      trackingNumber: "RS123456789",
      companyId: 3,
      companyName: "Tech Gadgets Ltd",
    },
    {
      id: "SHP-2023-005",
      origin: "Pacific Northwest Storage",
      destination: "Main Distribution Center",
      items: 50,
      weight: "350 kg",
      shipDate: "2023-06-17",
      estimatedArrival: "2023-06-20",
      status: "processing",
      carrier: "Fast Freight",
      trackingNumber: "FF456789013",
      companyId: 5,
      companyName: "Sports Unlimited",
    },
    {
      id: "SHP-2023-006",
      origin: "West Coast Facility",
      destination: "Southern Hub",
      items: 22,
      weight: "140 kg",
      shipDate: "2023-06-13",
      estimatedArrival: "2023-06-17",
      status: "in-transit",
      carrier: "Express Logistics",
      trackingNumber: "EL789456125",
      companyId: 1,
      companyName: "NextGen Retail Corp",
    },
    {
      id: "SHP-2023-007",
      origin: "Main Distribution Center",
      destination: "Tech Storage Facility",
      items: 18,
      weight: "120 kg",
      shipDate: "2023-06-10",
      estimatedArrival: "2023-06-14",
      status: "delayed",
      carrier: "Reliable Shipping",
      trackingNumber: "RS123456790",
      companyId: 3,
      companyName: "Tech Gadgets Ltd",
    },
  ];

  // Filter data based on search input and user's company (if not super_admin)
  const filteredData = shipmentsData.filter((item) => {
    // First filter by company if user is not super_admin
    if (user.role !== "super_admin" && user.companyId !== item.companyId) {
      return false;
    }

    // Then filter by search text
    const searchText = filterText.toLowerCase();
    return (
      (item.id && item.id.toLowerCase().includes(searchText)) ||
      (item.origin && item.origin.toLowerCase().includes(searchText)) ||
      (item.destination &&
        item.destination.toLowerCase().includes(searchText)) ||
      (item.carrier && item.carrier.toLowerCase().includes(searchText)) ||
      (item.trackingNumber &&
        item.trackingNumber.toLowerCase().includes(searchText)) ||
      (item.status && item.status.toLowerCase().includes(searchText))
    );
  });

  // Status display mapper
  const statusDisplayMap = {
    processing: { label: "Processing", class: "bg-blue-100 text-blue-800" },
    "in-transit": {
      label: "In Transit",
      class: "bg-yellow-100 text-yellow-800",
    },
    delivered: { label: "Delivered", class: "bg-green-100 text-green-800" },
    delayed: { label: "Delayed", class: "bg-red-100 text-red-800" },
    cancelled: { label: "Cancelled", class: "bg-gray-100 text-gray-800" },
  };

  // Table columns
  const columns = [
    { name: "Shipment ID", selector: (row) => row.id, sortable: true },
    { name: "Origin", selector: (row) => row.origin, sortable: true },
    { name: "Destination", selector: (row) => row.destination, sortable: true },
    { name: "Items", selector: (row) => row.items, sortable: true },
    { name: "Ship Date", selector: (row) => row.shipDate, sortable: true },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => {
        const status = statusDisplayMap[row.status] || {
          label: row.status,
          class: "bg-gray-100 text-gray-800",
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${status.class}`}>
            {status.label}
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
            onClick={() => {
              setSelectedShipment(row);
              setShowViewModal(true);
            }}
          >
            View
          </button>
          <button className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600">
            Track
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

  // Calculate shipment statistics
  const totalShipments = filteredData.length;
  const processingShipments = filteredData.filter(
    (shipment) => shipment.status === "processing"
  ).length;
  const inTransitShipments = filteredData.filter(
    (shipment) => shipment.status === "in-transit"
  ).length;
  const deliveredShipments = filteredData.filter(
    (shipment) => shipment.status === "delivered"
  ).length;
  const delayedShipments = filteredData.filter(
    (shipment) => shipment.status === "delayed"
  ).length;

  // Sample shipment items for the selected shipment
  const getShipmentItems = (shipmentId) => {
    // In a real app, this would fetch from an API
    return [
      {
        id: 1,
        sku: "PROD-001",
        name: "Smartphone X Pro",
        quantity: 10,
        price: 899.99,
      },
      {
        id: 2,
        sku: "PROD-015",
        name: "Wireless Earbuds",
        quantity: 15,
        price: 129.99,
      },
      {
        id: 3,
        sku: "PROD-023",
        name: "Smart Watch",
        quantity: 8,
        price: 249.99,
      },
      {
        id: 4,
        sku: "PROD-047",
        name: "Tablet Pro",
        quantity: 5,
        price: 649.99,
      },
      {
        id: 5,
        sku: "PROD-089",
        name: "Bluetooth Speaker",
        quantity: 7,
        price: 79.99,
      },
    ];
  };

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Shipment Management
        </h1>
        <p className="text-gray-600">
          Track and manage shipments across all locations
        </p>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search shipments..."
            className="form-input w-full"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Create New Shipment
        </button>
      </div>

      {/* Shipment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Shipments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalShipments}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">📦</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-gray-900">
                {processingShipments}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">🔄</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-gray-900">
                {inTransitShipments}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              🚚
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {deliveredShipments}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delayed</p>
              <p className="text-2xl font-bold text-gray-900">
                {delayedShipments}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-500">⚠️</div>
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
                {filteredData.length} shipments found
              </span>
            </div>
          }
        />
      </div>

      {/* View Shipment Modal */}
      {showViewModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Shipment Details: {selectedShipment.id}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedShipment(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Shipment Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        statusDisplayMap[selectedShipment.status].class
                      }`}
                    >
                      {statusDisplayMap[selectedShipment.status].label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Origin:</span>
                    <span className="font-medium">
                      {selectedShipment.origin}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destination:</span>
                    <span className="font-medium">
                      {selectedShipment.destination}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ship Date:</span>
                    <span className="font-medium">
                      {selectedShipment.shipDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Arrival:</span>
                    <span className="font-medium">
                      {selectedShipment.estimatedArrival}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium">
                      {selectedShipment.items}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium">
                      {selectedShipment.weight}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Carrier Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Carrier:</span>
                    <span className="font-medium">
                      {selectedShipment.carrier}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking Number:</span>
                    <span className="font-medium">
                      {selectedShipment.trackingNumber}
                    </span>
                  </div>
                  <div className="mt-4">
                    <button className="btn btn-primary w-full">
                      Track Shipment
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Shipment Items
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      SKU
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Product Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Unit Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getShipmentItems(selectedShipment.id).map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td
                      colSpan="3"
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                    ></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Total:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      $
                      {getShipmentItems(selectedShipment.id)
                        .reduce(
                          (sum, item) => sum + item.quantity * item.price,
                          0
                        )
                        .toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedShipment(null);
                }}
              >
                Close
              </button>
              <button className="btn btn-primary">Print Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentManagement;
