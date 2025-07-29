import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { inventoryAPI, exportToCSV, formatDate } from "../../utils/helpfunction";
import { toast } from "react-toastify";

const SaleInventory = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);
  const [saleInventoryData, setSaleInventoryData] = useState([]);

  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    sku: "",
    quantity: "",
    unitPrice: "",
    totalValue: "",
    location: "",
    status: "In Stock",
  });

  // Sample data for sale inventory
  // const saleInventoryData = [
  //   {
  //     id: 1,
  //     name: "Laptop Dell XPS 13",
  //     category: "Electronics",
  //     sku: "DELL-XPS13-001",
  //     quantity: 8,
  //     unitPrice: 1299,
  //     totalValue: 10392,
  //     location: "Warehouse A",
  //     status: "In Stock",
  //   },
  //   {
  //     id: 2,
  //     name: "iPhone 13 Pro",
  //     category: "Electronics",
  //     sku: "APPLE-IP13P-001",
  //     quantity: 12,
  //     unitPrice: 1099,
  //     totalValue: 13188,
  //     location: "Store 1",
  //     status: "In Stock",
  //   },
  //   {
  //     id: 3,
  //     name: "Office Desk Chair",
  //     category: "Furniture",
  //     sku: "FURN-CHAIR-001",
  //     quantity: 15,
  //     unitPrice: 199,
  //     totalValue: 2985,
  //     location: "Warehouse B",
  //     status: "In Stock",
  //   },
  //   {
  //     id: 4,
  //     name: "Wireless Mouse",
  //     category: "Electronics",
  //     sku: "ACC-MOUSE-001",
  //     quantity: 25,
  //     unitPrice: 29.99,
  //     totalValue: 749.75,
  //     location: "Store 2",
  //     status: "Low Stock",
  //   },
  //   {
  //     id: 5,
  //     name: 'LED Monitor 27"',
  //     category: "Electronics",
  //     sku: "DISP-MON27-001",
  //     quantity: 5,
  //     unitPrice: 299.99,
  //     totalValue: 1499.95,
  //     location: "Warehouse A",
  //     status: "Low Stock",
  //   },
  //   {
  //     id: 6,
  //     name: "Printer Ink Cartridges",
  //     category: "Office Supplies",
  //     sku: "SUP-INK-001",
  //     quantity: 40,
  //     unitPrice: 34.99,
  //     totalValue: 1399.6,
  //     location: "Store 1",
  //     status: "In Stock",
  //   },
  //   {
  //     id: 7,
  //     name: "USB Flash Drives 64GB",
  //     category: "Electronics",
  //     sku: "ACC-USB64-001",
  //     quantity: 0,
  //     unitPrice: 19.99,
  //     totalValue: 0,
  //     location: "Warehouse B",
  //     status: "Out of Stock",
  //   },
  //   {
  //     id: 8,
  //     name: "Ergonomic Keyboard",
  //     category: "Electronics",
  //     sku: "ACC-KEYB-001",
  //     quantity: 18,
  //     unitPrice: 89.99,
  //     totalValue: 1619.82,
  //     location: "Store 3",
  //     status: "In Stock",
  //   },
  //   {
  //     id: 9,
  //     name: "Desk Lamp LED",
  //     category: "Office Supplies",
  //     sku: "LIGHT-DESK-001",
  //     quantity: 3,
  //     unitPrice: 49.99,
  //     totalValue: 149.97,
  //     location: "Store 2",
  //     status: "Low Stock",
  //   },
  //   {
  //     id: 10,
  //     name: "Wireless Headphones",
  //     category: "Electronics",
  //     sku: "AUDIO-HEAD-001",
  //     quantity: 0,
  //     unitPrice: 159.99,
  //     totalValue: 0,
  //     location: "Warehouse A",
  //     status: "Out of Stock",
  //   },
  // ];
  useEffect(() => {
    fetchInventoryData();
  }, []);
  
  // Handle CSV export
  const handleExportCSV = () => {
    try {
      // Prepare data for export (remove complex objects)
      const exportData = filteredData.map(item => ({
        name: item.name || '',
        category: item.category || '',
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        totalValue: item.price?.retail || 0,
        location: item.location?.warehouseId || '',
        status: item.status || '',
        sku: item.sku || '',
        description: item.description || '',
        dateAdded: formatDate(item.createdAt)
      }));
      
      exportToCSV(exportData, 'sale_inventory.csv');
      toast.success("Sale inventory data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export inventory data");
    }
  };
  const fetchInventoryData = async () => {
    try {
      setLoading(true);

      const data = await inventoryAPI.getSaleInventory(
        "6876bda9694900c60234bf5e"
      );
      console.log("object", data);
      setSaleInventoryData(Array.isArray(data?.data) ? data?.data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      setError("Failed to load inventory data. Please try again.");
      toast.error("Failed to load inventory data");
      setSaleInventoryData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search input
  const filteredData = saleInventoryData.filter(
    (item) =>
      (item.name &&
        item.name.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.category &&
        item.category.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.sku && item.sku.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.location &&
        item.location.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.status &&
        item.status.toLowerCase().includes(filterText.toLowerCase()))
  );

  // Table columns
  const columns = [
    { name: "Item Name", selector: (row) => row.name, sortable: true },
    { name: "Category", selector: (row) => row.category, sortable: true },
    { name: "SKU", selector: (row) => row.sku, sortable: true },
    { name: "Quantity", selector: (row) => row.quantity, sortable: true },
    {
      name: "Unit Price",
      selector: (row) => `$${row.price.retail}`,
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
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.status === "In Stock"
              ? "bg-green-100 text-green-800"
              : row.status === "Low Stock"
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
          <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
            Edit
          </button>
          <button className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">
            Sell
          </button>
        </div>
      ),
    },
  ];

  // Handle input change for new item form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: value,
    });

    // Calculate total value if quantity or unit price changes
    if (name === "quantity" || name === "unitPrice") {
      const quantity =
        name === "quantity"
          ? parseFloat(value) || 0
          : parseFloat(newItem.quantity) || 0;
      const unitPrice =
        name === "unitPrice"
          ? parseFloat(value) || 0
          : parseFloat(newItem.unitPrice) || 0;
      setNewItem({
        ...newItem,
        [name]: value,
        totalValue: (quantity * unitPrice).toFixed(2),
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send data to the backend
    // For now, we'll just close the modal
    // setShowAddModal(false);
    setNewItem({
      name: "",
      category: "",
      sku: "",
      quantity: "",
      unitPrice: "",
      totalValue: "",
      location: "",
      status: "In Stock",
    });
  };

  // Calculate inventory statistics
  const totalItems = saleInventoryData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalValue = saleInventoryData.reduce(
    (sum, item) => sum + item.price.retail * item.quantity,
    0
  );
  const lowStockItems = saleInventoryData.filter(
    (item) => item.status === "Low Stock"
  ).length;
  const outOfStockItems = saleInventoryData.filter(
    (item) => item.status === "Out of Stock"
  ).length;

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Sale Inventory Management
        </h1>
        <p className="text-gray-600">Manage your products available for sale</p>
      </div>

      {/* Company Selection Notice for Super Admin */}
      {user?.role === "super_admin" && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <span className="text-blue-500 text-xl mr-2">ℹ️</span>
            <div>
              <p className="font-medium text-blue-700">
                {selectedCompany
                  ? `Managing sale inventory for: ${selectedCompany.name}`
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
          {/* <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            Add New Item
          </button> */}
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleExportCSV}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">📦</div>
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
              <p className="text-sm font-medium text-gray-600">
                Low Stock Items
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {lowStockItems}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              ⚠️
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {outOfStockItems}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-500">❌</div>
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
                {filteredData.length} records found
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default SaleInventory;
