import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { inventoryAPI } from "../../utils/helpfunction";
import { toast } from "react-toastify";
import moment from "moment";
import { formatDate } from "../../utils/helpfunction";

const PurchaseInventory = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  // State for data and UI
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    supplier: "",
    quantity: "",
    unitPrice: "",
    totalPrice: "",
    purchaseDate: moment().format("YYYY-MM-DD"),
    status: "Pending",
  });

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
      setInventoryData(Array.isArray(data?.data) ? data?.data : []);
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
    { name: "Item Name", selector: (row) => row.name || "", sortable: true },
    { name: "Category", selector: (row) => row.category || "", sortable: true },
    // { name: "Supplier", selector: (row) => row.supplier || "", sortable: true },
    { name: "Quantity", selector: (row) => row.quantity || 0, sortable: true },
    {
      name: "Unit Price",
      selector: (row) => `$${row.unitPrice || 0}`,
      sortable: true,
    },
    {
      name: "Total Price",
      selector: (row) => `$${row.price.cost}`,
      sortable: true,
    },
    {
      name: "Purchase Date",
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
            row.status === "Received"
              ? "bg-green-100 text-green-800"
              : row.status === "In Transit"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
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
          <button className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
            Delete
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

    // Calculate total price if quantity or unit price changes
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
        totalPrice: (quantity * unitPrice).toFixed(2),
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send data to the backend
    // For now, we'll just close the modal
    setShowAddModal(false);
    setNewItem({
      name: "",
      category: "",
      supplier: "",
      quantity: "",
      unitPrice: "",
      totalPrice: "",
      purchaseDate: "",
      status: "Pending",
    });
  };

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
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add New Purchase
        </button>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Purchase Value
              </p>
              <p className="text-2xl font-bold text-gray-900">$35,735</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Orders
              </p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              ⏳
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Received This Month
              </p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              ✅
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
                {filteredData.length} records found
              </span>
            </div>
          }
        />
      </div>

      {/* Add New Purchase Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Add New Purchase
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="name"
                  >
                    Item Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={newItem.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="category"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="form-input"
                    value={newItem.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Food">Food</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="supplier"
                  >
                    Supplier
                  </label>
                  <input
                    type="text"
                    id="supplier"
                    name="supplier"
                    className="form-input"
                    value={newItem.supplier}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="quantity"
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    className="form-input"
                    value={newItem.quantity}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="unitPrice"
                  >
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    id="unitPrice"
                    name="unitPrice"
                    className="form-input"
                    value={newItem.unitPrice}
                    onChange={handleInputChange}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="totalPrice"
                  >
                    Total Price ($)
                  </label>
                  <input
                    type="number"
                    id="totalPrice"
                    name="totalPrice"
                    className="form-input"
                    value={newItem.totalPrice}
                    readOnly
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="purchaseDate"
                  >
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    id="purchaseDate"
                    name="purchaseDate"
                    className="form-input"
                    value={newItem.purchaseDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="status"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="form-input"
                    value={newItem.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Received">Received</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseInventory;
