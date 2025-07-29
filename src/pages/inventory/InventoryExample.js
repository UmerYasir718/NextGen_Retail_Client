import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { inventoryAPI } from "../../utils/helpfunction";
import { toast } from "react-toastify";
import InventoryModal from "../../components/inventory/InventoryModal";

const InventoryExample = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  // State for data and UI
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState("");
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add, edit, view
  const [modalType, setModalType] = useState("purchase"); // purchase, pending_sale, sale
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch inventory data from API
  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const companyId = selectedCompany?.id || "6876bda9694900c60234bf5e"; // Default ID for example
      
      // Fetch all inventory types
      const purchaseData = await inventoryAPI.getPurchaseInventory(companyId);
      const pendingSaleData = await inventoryAPI.getPendingSaleInventory(companyId);
      const saleData = await inventoryAPI.getSaleInventory(companyId);
      
      // Combine and mark with type
      const combinedData = [
        ...(Array.isArray(purchaseData?.data) ? purchaseData.data.map(item => ({...item, inventoryType: 'purchase'})) : []),
        ...(Array.isArray(pendingSaleData?.data) ? pendingSaleData.data.map(item => ({...item, inventoryType: 'pending_sale'})) : []),
        ...(Array.isArray(saleData?.data) ? saleData.data.map(item => ({...item, inventoryType: 'sale'})) : [])
      ];
      
      setInventoryData(combinedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      setError("Failed to load inventory data. Please try again.");
      toast.error("Failed to load inventory data");
      setInventoryData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search input
  const filteredData = inventoryData.filter(
    (item) =>
      (item?.name && item.name.toLowerCase().includes(filterText.toLowerCase())) ||
      (item?.category && item.category.toLowerCase().includes(filterText.toLowerCase())) ||
      (item?.sku && item.sku.toLowerCase().includes(filterText.toLowerCase())) ||
      (item?.status && item.status.toLowerCase().includes(filterText.toLowerCase()))
  );

  // Handle opening modal for different actions
  const handleAddItem = (type) => {
    setModalMode("add");
    setModalType(type);
    setSelectedItem(null);
    setModalOpen(true);
  };

  const handleEditItem = (item) => {
    setModalMode("edit");
    setModalType(item.inventoryType || "purchase");
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleViewItem = (item) => {
    setModalMode("view");
    setModalType(item.inventoryType || "purchase");
    setSelectedItem(item);
    setModalOpen(true);
  };

  // Handle form submission from modal
  const handleModalSubmit = (formData) => {
    console.log("Form submitted:", formData);
    
    // In a real application, you would save the data to your backend here
    // For this example, we'll just show a success message and close the modal
    toast.success(`Inventory item ${modalMode === "add" ? "added" : "updated"} successfully`);
    setModalOpen(false);
    
    // Refresh data
    fetchInventoryData();
  };

  // Table columns
  const columns = [
    { name: "Item Name", selector: (row) => row.name || "", sortable: true },
    { name: "SKU", selector: (row) => row.sku || "", sortable: true },
    { name: "Category", selector: (row) => row.category || "", sortable: true },
    { name: "Quantity", selector: (row) => row.quantity || 0, sortable: true },
    {
      name: "Price",
      selector: (row) => `$${row.price?.retail || 0}`,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.status || "",
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.status === "Available"
              ? "bg-green-100 text-green-800"
              : row.status === "Low Stock"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status || "Unknown"}
        </span>
      ),
    },
    {
      name: "Type",
      selector: (row) => row.inventoryType || "purchase",
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.inventoryType === "purchase"
              ? "bg-blue-100 text-blue-800"
              : row.inventoryType === "pending_sale"
              ? "bg-purple-100 text-purple-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {row.inventoryType === "purchase"
            ? "Purchase"
            : row.inventoryType === "pending_sale"
            ? "Pending Sale"
            : "Sale"}
        </span>
      ),
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
            className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
            onClick={() => handleEditItem(row)}
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Inventory Management</h1>
        <p className="text-gray-600">
          Manage all your inventory items across purchase, pending sale, and sale categories.
        </p>
      </div>

      {/* Action buttons and search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => handleAddItem("purchase")}
          >
            Add Purchase Item
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            onClick={() => handleAddItem("pending_sale")}
          >
            Add Pending Sale
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => handleAddItem("sale")}
          >
            Add Sale Item
          </button>
        </div>
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search inventory..."
            className="w-full px-4 py-2 border border-gray-300 rounded"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      {/* Data table */}
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          progressPending={loading}
          progressComponent={<div className="py-8">Loading...</div>}
          noDataComponent="No inventory items found"
          persistTableHead
          highlightOnHover
          pointerOnHover
        />
      )}

      {/* Inventory Modal */}
      <InventoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        inventoryType={modalType}
        initialData={selectedItem}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default InventoryExample;
