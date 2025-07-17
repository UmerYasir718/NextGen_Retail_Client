import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";

const ZoneManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  const [filterText, setFilterText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouses, setWarehouses] = useState([]);

  // Form state for new/edit zone
  const [zoneForm, setZoneForm] = useState({
    name: "",
    description: "",
    warehouseId: "",
    type: "general",
    status: "active",
  });

  // Sample data for zones
  const zonesData = [
    {
      id: 1,
      name: "Zone A",
      description: "Front storage area",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
      type: "general",
      status: "active",
      shelfCount: 12,
      binCount: 48,
      itemCount: 250,
      lastUpdated: "2023-06-15",
    },
    {
      id: 2,
      name: "Zone B",
      description: "Electronics storage",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
      type: "electronics",
      status: "active",
      shelfCount: 8,
      binCount: 32,
      itemCount: 180,
      lastUpdated: "2023-06-12",
    },
    {
      id: 3,
      name: "Zone C",
      description: "Clothing and apparel",
      warehouseId: 2,
      warehouseName: "West Coast Facility",
      type: "apparel",
      status: "active",
      shelfCount: 15,
      binCount: 60,
      itemCount: 320,
      lastUpdated: "2023-06-10",
    },
    {
      id: 4,
      name: "Zone D",
      description: "Home goods",
      warehouseId: 2,
      warehouseName: "West Coast Facility",
      type: "home",
      status: "maintenance",
      shelfCount: 10,
      binCount: 40,
      itemCount: 0,
      lastUpdated: "2023-06-18",
    },
    {
      id: 5,
      name: "Zone E",
      description: "High-value items",
      warehouseId: 3,
      warehouseName: "Central Storage",
      type: "secure",
      status: "active",
      shelfCount: 6,
      binCount: 24,
      itemCount: 85,
      lastUpdated: "2023-06-14",
    },
  ];

  // Sample data for warehouses
  const warehousesData = [
    {
      id: 1,
      name: "Main Distribution Center",
      location: "New York, NY",
    },
    {
      id: 2,
      name: "West Coast Facility",
      location: "Los Angeles, CA",
    },
    {
      id: 3,
      name: "Central Storage",
      location: "Chicago, IL",
    },
    {
      id: 4,
      name: "Southern Hub",
      location: "Atlanta, GA",
    },
  ];

  // Load warehouses on component mount
  useEffect(() => {
    // In a real app, this would be an API call
    setWarehouses(warehousesData);
  }, []);

  // Filter data based on search input and user's company (if not super_admin)
  const filteredData = zonesData.filter((item) => {
    // Filter by warehouse if one is selected
    if (selectedWarehouse && item.warehouseId !== selectedWarehouse) {
      return false;
    }

    // Then filter by search text
    const searchText = filterText.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(searchText)) ||
      (item.description && item.description.toLowerCase().includes(searchText)) ||
      (item.type && item.type.toLowerCase().includes(searchText)) ||
      (item.warehouseName && item.warehouseName.toLowerCase().includes(searchText))
    );
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setZoneForm({
      ...zoneForm,
      [name]: value,
    });
  };

  // Handle form submission for new zone
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would be an API call to create a new zone
    console.log("Creating new zone:", zoneForm);
    setShowAddModal(false);
    // Reset form
    setZoneForm({
      name: "",
      description: "",
      warehouseId: "",
      type: "general",
      status: "active",
    });
  };

  // Handle edit zone
  const handleEdit = (zone) => {
    setSelectedZone(zone);
    setZoneForm({
      name: zone.name,
      description: zone.description,
      warehouseId: zone.warehouseId.toString(),
      type: zone.type,
      status: zone.status,
    });
    setShowEditModal(true);
  };

  // Handle update zone
  const handleUpdate = (e) => {
    e.preventDefault();
    // In a real app, this would be an API call to update the zone
    console.log("Updating zone:", selectedZone.id, zoneForm);
    setShowEditModal(false);
  };

  // Handle delete zone
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this zone?")) {
      // In a real app, this would be an API call to delete the zone
      console.log("Deleting zone:", id);
    }
  };

  // Handle warehouse filter change
  const handleWarehouseChange = (e) => {
    const warehouseId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedWarehouse(warehouseId);
  };

  // Table columns
  const columns = [
    { name: "Zone Name", selector: (row) => row.name, sortable: true },
    { name: "Warehouse", selector: (row) => row.warehouseName, sortable: true },
    { name: "Type", selector: (row) => row.type, sortable: true },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Shelves",
      selector: (row) => row.shelfCount,
      sortable: true,
    },
    {
      name: "Bins",
      selector: (row) => row.binCount,
      sortable: true,
    },
    {
      name: "Items",
      selector: (row) => row.itemCount,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Edit Zone"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete Zone"
          >
            🗑️
          </button>
          <button
            onClick={() => window.location.href = `/warehouse/shelves?zoneId=${row.id}`}
            className="p-1 text-green-600 hover:text-green-800"
            title="View Shelves"
          >
            🔍
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Zone Management</h1>
        <p className="text-gray-600">
          Manage warehouse zones and their organization
        </p>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="w-full md:w-1/4 mb-4 md:mb-0">
          <select
            className="form-input w-full"
            value={selectedWarehouse || ""}
            onChange={handleWarehouseChange}
          >
            <option value="">All Warehouses</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mx-4">
          <input
            type="text"
            placeholder="Search zones..."
            className="form-input w-full"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add New Zone
        </button>
      </div>

      {/* Zone Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Zones</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">🏷️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Zones</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.filter((z) => z.status === "active").length}
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
              <p className="text-sm font-medium text-gray-600">Total Shelves</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.reduce((sum, zone) => sum + zone.shelfCount, 0)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              📚
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bins</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.reduce((sum, zone) => sum + zone.binCount, 0)}
              </p>
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
          subHeader
          subHeaderComponent={
            <div className="w-full text-right py-2">
              <span className="text-sm text-gray-600">
                {filteredData.length} zones found
              </span>
            </div>
          }
        />
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add New Zone</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="warehouseId"
                    >
                      Warehouse
                    </label>
                    <select
                      id="warehouseId"
                      name="warehouseId"
                      className="form-input w-full"
                      value={zoneForm.warehouseId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="name"
                    >
                      Zone Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-input w-full"
                      value={zoneForm.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="description"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-input w-full"
                      value={zoneForm.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="type"
                    >
                      Zone Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      className="form-input w-full"
                      value={zoneForm.type}
                      onChange={handleInputChange}
                    >
                      <option value="general">General</option>
                      <option value="electronics">Electronics</option>
                      <option value="apparel">Apparel</option>
                      <option value="home">Home Goods</option>
                      <option value="secure">Secure/High Value</option>
                      <option value="refrigerated">Refrigerated</option>
                      <option value="hazardous">Hazardous Materials</option>
                    </select>
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
                      className="form-input w-full"
                      value={zoneForm.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Zone
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      {showEditModal && selectedZone && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Edit Zone</h2>
              <form onSubmit={handleUpdate}>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="warehouseId"
                    >
                      Warehouse
                    </label>
                    <select
                      id="warehouseId"
                      name="warehouseId"
                      className="form-input w-full"
                      value={zoneForm.warehouseId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="name"
                    >
                      Zone Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-input w-full"
                      value={zoneForm.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="description"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-input w-full"
                      value={zoneForm.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="type"
                    >
                      Zone Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      className="form-input w-full"
                      value={zoneForm.type}
                      onChange={handleInputChange}
                    >
                      <option value="general">General</option>
                      <option value="electronics">Electronics</option>
                      <option value="apparel">Apparel</option>
                      <option value="home">Home Goods</option>
                      <option value="secure">Secure/High Value</option>
                      <option value="refrigerated">Refrigerated</option>
                      <option value="hazardous">Hazardous Materials</option>
                    </select>
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
                      className="form-input w-full"
                      value={zoneForm.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Zone
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneManagement;
