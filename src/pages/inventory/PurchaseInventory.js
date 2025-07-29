import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { inventoryAPI, exportToCSV } from "../../utils/helpfunction";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/helpfunction";
import InventoryModal from "../../components/inventory/InventoryModal";

const PurchaseInventory = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  // State for data and UI
  const [filterText, setFilterText] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add, edit, view
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch inventory data from API
  useEffect(() => {
    // if (selectedCompany?.id) {
    //   fetchInventoryData();
    // }
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

      const data = await inventoryAPI.getPurchaseInventory(
        "6876bda9694900c60234bf5e"
      );
      console.log("object", data);

      // Validate and clean the data to ensure no objects are rendered directly
      const cleanData = Array.isArray(data?.data)
        ? data?.data.map((item) => ({
            ...item,
            name:
              typeof item.name === "string"
                ? item.name
                : JSON.stringify(item.name),
            category:
              typeof item.category === "string"
                ? item.category
                : JSON.stringify(item.category),
            status:
              typeof item.status === "string"
                ? item.status
                : JSON.stringify(item.status),
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
          }))
        : [];

      setInventoryData(cleanData);
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
  const filteredData =
    inventoryData &&
    inventoryData.filter(
      (item) =>
        (item?.name &&
          item?.name.toLowerCase().includes(filterText.toLowerCase())) ||
        (item?.category &&
          item.category.toLowerCase().includes(filterText.toLowerCase())) ||
        // (item?.supplier &&
        //   item.supplier.toLowerCase().includes(filterText.toLowerCase())) ||
        (item?.status &&
          item.status.toLowerCase().includes(filterText.toLowerCase()))
    );

  // Table columns
  const columns = [
    {
      name: "Item Name",
      selector: (row) => {
        if (typeof row.name === "object" && row.name !== null) {
          return JSON.stringify(row.name);
        }
        return row.name || "";
      },
      sortable: true,
    },
    {
      name: "Category",
      selector: (row) => {
        if (typeof row.category === "object" && row.category !== null) {
          return JSON.stringify(row.category);
        }
        return row.category || "";
      },
      sortable: true,
    },
    // { name: "Supplier", selector: (row) => row.supplier || "", sortable: true },
    {
      name: "Quantity",
      selector: (row) => {
        if (typeof row.quantity === "object" && row.quantity !== null) {
          return JSON.stringify(row.quantity);
        }
        return row.quantity || 0;
      },
      sortable: true,
    },
    {
      name: "Unit Price",
      selector: (row) => {
        if (typeof row.unitPrice === "object" && row.unitPrice !== null) {
          return JSON.stringify(row.unitPrice);
        }
        return `$${row.unitPrice || 0}`;
      },
      sortable: true,
    },
    {
      name: "Total Price",
      selector: (row) => {
        if (typeof row.price === "object" && row.price !== null) {
          return `$${row.price?.cost || 0}`;
        }
        return `$${row.price?.cost || 0}`;
      },
      sortable: true,
    },
    {
      name: "Purchase Date",
      selector: (row) => {
        if (typeof row.createdAt === "object" && row.createdAt !== null) {
          return JSON.stringify(row.createdAt);
        }
        return formatDate(row.createdAt);
      },
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => {
        if (typeof row.status === "object" && row.status !== null) {
          return JSON.stringify(row.status);
        }
        return row.status || "";
      },
      sortable: true,
      cell: (row) => {
        const status =
          typeof row.status === "object" && row.status !== null
            ? JSON.stringify(row.status)
            : row.status || "";

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
            className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
            onClick={() => handleEditItem(row)}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => console.log("Delete button clicked")}
          >
            Delete
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
  const handleExportCSV = () => {
    try {
      // Prepare data for export (remove complex objects)
      const exportData = filteredData.map((item) => ({
        name: item.name || "",
        category: item.category || "",
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        totalCost: item.price?.cost || 0,
        purchaseDate: formatDate(item.createdAt),
        status: item.status || "",
        sku: item.sku || "",
        description: item.description || "",
      }));

      exportToCSV(exportData, "purchase_inventory.csv");
      toast.success("Inventory data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export inventory data");
    }
  };

  const totalItems = inventoryData.length;
  const totalPurchaseValue = inventoryData.reduce(
    (sum, order) => sum + order.price.cost,
    0
  );
  const totalRetailValue = inventoryData.reduce(
    (sum, order) => sum + order.price.retail,
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

      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search inventory..."
            className="form-input w-full"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleAddItem}
          >
            Add New Purchase
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleExportCSV}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Purchase Value
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalPurchaseValue}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">💰</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Retail Value
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalRetailValue}
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
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              📦
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
          progressPending={loading}
          progressComponent={<div className="py-8">Loading...</div>}
          noDataComponent={error ? error : "No inventory items found"}
          subHeader
          subHeaderComponent={
            <div className="w-full text-right py-2">
              <span className="text-sm text-gray-600">
                {filteredData.length} records found
              </span>
            </div>
          }
        />
      </div>

      {/* Inventory Modal */}
      <InventoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        inventoryType="purchase"
        initialData={selectedItem}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default PurchaseInventory;
