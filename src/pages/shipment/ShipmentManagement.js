import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import ShipmentModal from "../../components/shipment/ShipmentModal";
import shipmentAPI from "../../utils/api/shipmentAPI";

const ShipmentManagement = () => {
  const { user } = useSelector((state) => state.auth);

  const [filterText, setFilterText] = useState("");
  // Loading state for API calls
  const [loading, setLoading] = useState(false);
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  // Fetch shipments from API
  const fetchShipments = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await shipmentAPI.getShipments();
      console.log("Fetched shipments:", response.data);
      setShipments(response.data || []);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast.error("Failed to load shipments");
      
      // Sample data for shipments (fallback)
      const sampleShipmentsData = [
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
        // Other sample shipments...
      ];
      
      // Fallback to sample data if API fails
      setShipments(sampleShipmentsData);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch shipments on component mount
  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // Open modal in add mode

  // Open modal in add mode
  const handleAddShipment = () => {
    setModalMode("add");
    setSelectedShipment(null);
    setModalOpen(true);
  };

  // Open modal in edit mode
  const handleEditShipment = (shipment) => {
    setModalMode("edit");
    setSelectedShipment(shipment);
    setModalOpen(true);
  };

  // Open modal in view mode
  const handleViewShipment = (shipment) => {
    setModalMode("view");
    setSelectedShipment(shipment);
    setModalOpen(true);
  };

  // Handle shipment deletion
  const handleDeleteShipment = async (shipmentId) => {
    if (window.confirm("Are you sure you want to delete this shipment?")) {
      try {
        await shipmentAPI.deleteShipment(shipmentId);
        toast.success("Shipment deleted successfully");
        fetchShipments(); // Refresh the list
      } catch (error) {
        console.error("Error deleting shipment:", error);
        toast.error("Failed to delete shipment");
      }
    }
  };

  // Handle modal submission
  const handleModalSubmit = async (formData) => {
    // Modal will handle the API call
    // Just refresh the list after submission
    fetchShipments();
    setModalOpen(false);
  };

  // Filter data based on search input and user's company (if not super_admin)
  const filteredData = shipments.filter((item) => {
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
    "Pending": { label: "Pending", class: "bg-blue-100 text-blue-800" },
    "In Transit": {
      label: "In Transit",
      class: "bg-yellow-100 text-yellow-800",
    },
    "Delivered": { label: "Delivered", class: "bg-green-100 text-green-800" },
    "Delayed": { label: "Delayed", class: "bg-red-100 text-red-800" },
    "Cancelled": { label: "Cancelled", class: "bg-gray-100 text-gray-800" },
    // Fallback for old data format
    "processing": { label: "Pending", class: "bg-blue-100 text-blue-800" },
    "in-transit": { label: "In Transit", class: "bg-yellow-100 text-yellow-800" },
    "delivered": { label: "Delivered", class: "bg-green-100 text-green-800" },
    "delayed": { label: "Delayed", class: "bg-red-100 text-red-800" },
    "cancelled": { label: "Cancelled", class: "bg-gray-100 text-gray-800" },
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
            onClick={() => handleViewShipment(row)}
          >
            View
          </button>
          <button
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => handleEditShipment(row)}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => handleDeleteShipment(row.id)}
          >
            Delete
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
    (shipment) => shipment.status === "Pending"
  ).length;
  const inTransitShipments = filteredData.filter(
    (shipment) => shipment.status === "In Transit"
  ).length;
  const deliveredShipments = filteredData.filter(
    (shipment) => shipment.status === "Delivered"
  ).length;
  const delayedShipments = filteredData.filter(
    (shipment) => shipment.status === "Delayed"
  ).length;



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
          onClick={handleAddShipment}
        >
          Create New Shipment
        </button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading shipments...</span>
        </div>
      )}

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

      {/* Shipment Modal - Management Version */}
      <ShipmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialData={selectedShipment}
        onSubmit={handleModalSubmit}
        customTitle={`${modalMode === 'add' ? 'Create' : modalMode === 'edit' ? 'Edit' : 'View'} Shipment - Management Portal`}
        theme="management"
        showCompanySelector={user.role === "super_admin"}
        showAdvancedOptions={true}
        allowDocumentUpload={true}
      />
    </div>
  );
};

export default ShipmentManagement;
