import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ShipmentModal from "../components/shipment/ShipmentModal";
import shipmentAPI from "../utils/api/shipmentAPI";

const ShipmentDemo = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Fetch shipments on component mount
  useEffect(() => {
    fetchShipments();
  }, []);

  // Fetch shipments from API
  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await shipmentAPI.getShipments();
      console.log(response.data);
      setShipments(response.data || []);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast.error("Failed to load shipments");
    } finally {
      setLoading(false);
    }
  };

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
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Transit":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Delayed":
        return "bg-orange-100 text-orange-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Shipment Management
        </h1>
        <button
          onClick={handleAddShipment}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add New Shipment
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading shipments...</p>
        </div>
      ) : shipments.length === 0 ? (
        <div className="text-center py-10 bg-white shadow rounded-lg">
          <p className="text-gray-500">
            No shipments found. Create your first shipment!
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {shipments.map((shipment) => (
              <li key={shipment.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {shipment.shipmentNumber}
                      </p>
                      <span
                        className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          shipment.status
                        )}`}
                      >
                        {shipment.status}
                      </span>
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {shipment.type}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewShipment(shipment)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditShipment(shipment)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteShipment(shipment.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        From: {shipment.source.name}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        To: {shipment.destination.name}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Expected: {formatDate(shipment.expectedDate)}
                        {shipment.actualDate &&
                          ` | Actual: ${formatDate(shipment.actualDate)}`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Items: {shipment.items.length} | Total Value: $
                      {shipment.totalValue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Shipment Modal */}
      <ShipmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialData={selectedShipment}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default ShipmentDemo;
