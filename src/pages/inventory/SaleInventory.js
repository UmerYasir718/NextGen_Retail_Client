import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { exportToCSV } from "../../utils/helpfunction";
import { toast } from "react-toastify";
import inventoryAPI from "../../utils/api/inventoryAPI";
import { getCompanyId } from "../../utils/userUtils";

const SaleInventory = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  // Get companyId from Redux or localStorage
  const companyId = selectedCompany?.id || getCompanyId() || null;

  // State for data and UI
  const [filterText, setFilterText] = useState("");
  const [saleInventoryData, setSaleInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [allData, setAllData] = useState(null);
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

  // Fetch inventory data from API
  useEffect(() => {
    if (companyId) {
      fetchInventoryData();
    } else {
      console.warn("No companyId available");
      setSaleInventoryData([]);
    }
  }, [companyId]);

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
        setSaleInventoryData([]);
        return;
      }

      const data = await inventoryAPI.getSaleInventory(
        companyId,
        page,
        limit,
        search,
        sortBy,
        sortOrder
      );
      console.log("Sale inventory response:", data);

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
        status: item.status || "In Stock",
        location: item.location || {},
      }));

      setSaleInventoryData(cleanData);
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
      setSaleInventoryData([]);
    } finally {
      setLoading(false);
    }
  };

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
          totalValue: (item.quantity || 0) * (item.price?.retail || 0),
          location: item.location?.warehouseId || "",
          status: item.status || "",
          sku: item.sku || "",
          description: item.description || "",
          dateAdded: item.createdAt || "",
        }));
      } else {
        // Fallback to current page data
        exportData = filteredData.map((item) => ({
          name: item.name || "",
          category: item.category || "",
          quantity: item.quantity || 0,
          unitPrice: item.price?.retail || 0,
          totalValue: (item.quantity || 0) * (item.price?.retail || 0),
          location: item.location?.warehouseId || "",
          status: item.status || "",
          sku: item.sku || "",
          description: item.description || "",
          dateAdded: item.createdAt || "",
        }));
      }

      exportToCSV(exportData, "sale_inventory.csv");
      toast.success("Sale inventory data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export inventory data");
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
          subHeaderComponent={
            <div className="w-full text-right py-2">
              <span className="text-sm text-gray-600">
                Showing {(currentPage - 1) * perPage + 1} to{" "}
                {Math.min(currentPage * perPage, totalRecords)} of{" "}
                {totalRecords} records
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

export default SaleInventory;
