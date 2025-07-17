import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";

const ShelfManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  
  // Get zoneId from URL query params if available
  const queryParams = new URLSearchParams(location.search);
  const zoneIdFromUrl = queryParams.get("zoneId") ? parseInt(queryParams.get("zoneId")) : null;

  const [filterText, setFilterText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [selectedZone, setSelectedZone] = useState(zoneIdFromUrl);
  const [zones, setZones] = useState([]);

  // Form state for new/edit shelf
  const [shelfForm, setShelfForm] = useState({
    name: "",
    description: "",
    zoneId: zoneIdFromUrl ? zoneIdFromUrl.toString() : "",
    type: "standard",
    capacity: 100,
    status: "active",
  });

  // Sample data for shelves
  const shelvesData = [
    {
      id: 1,
      name: "Shelf A1",
      description: "Electronics - Small Items",
      zoneId: 1,
      zoneName: "Zone A",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
      type: "standard",
      capacity: 100,
      utilized: 65,
      binCount: 4,
      itemCount: 45,
      status: "active",
      lastUpdated: "2023-06-15",
    },
    {
      id: 2,
      name: "Shelf A2",
      description: "Electronics - Medium Items",
      zoneId: 1,
      zoneName: "Zone A",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
      type: "heavy-duty",
      capacity: 150,
      utilized: 120,
      binCount: 6,
      itemCount: 75,
      status: "active",
      lastUpdated: "2023-06-14",
    },
    {
      id: 3,
      name: "Shelf B1",
      description: "Clothing - Tops",
      zoneId: 2,
      zoneName: "Zone B",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
      type: "standard",
      capacity: 80,
      utilized: 45,
      binCount: 8,
      itemCount: 120,
      status: "active",
      lastUpdated: "2023-06-12",
    },
    {
      id: 4,
      name: "Shelf B2",
      description: "Clothing - Bottoms",
      zoneId: 2,
      zoneName: "Zone B",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
      type: "standard",
      capacity: 80,
      utilized: 60,
      binCount: 8,
      itemCount: 95,
      status: "active",
      lastUpdated: "2023-06-11",
    },
    {
      id: 5,
      name: "Shelf C1",
      description: "Home Goods - Kitchen",
      zoneId: 3,
      zoneName: "Zone C",
      warehouseId: 2,
      warehouseName: "West Coast Facility",
      type: "heavy-duty",
      capacity: 200,
      utilized: 180,
      binCount: 10,
      itemCount: 65,
      status: "active",
      lastUpdated: "2023-06-10",
    },
    {
      id: 6,
      name: "Shelf D1",
      description: "Under maintenance",
      zoneId: 4,
      zoneName: "Zone D",
      warehouseId: 2,
      warehouseName: "West Coast Facility",
      type: "standard",
      capacity: 100,
      utilized: 0,
      binCount: 0,
      itemCount: 0,
      status: "maintenance",
      lastUpdated: "2023-06-18",
    },
  ];

  // Sample data for zones
  const zonesData = [
    {
      id: 1,
      name: "Zone A",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
    },
    {
      id: 2,
      name: "Zone B",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
    },
    {
      id: 3,
      name: "Zone C",
      warehouseId: 2,
      warehouseName: "West Coast Facility",
    },
    {
      id: 4,
      name: "Zone D",
      warehouseId: 2,
      warehouseName: "West Coast Facility",
    },
    {
      id: 5,
      name: "Zone E",
      warehouseId: 3,
      warehouseName: "Central Storage",
    },
  ];

  // Load zones on component mount
  useEffect(() => {
    // In a real app, this would be an API call
    setZones(zonesData);
    
    // If zoneId is provided in URL, set it as selected
    if (zoneIdFromUrl) {
      setSelectedZone(zoneIdFromUrl);
      setShelfForm(prev => ({
        ...prev,
        zoneId: zoneIdFromUrl.toString()
      }));
    }
  }, [zoneIdFromUrl]);

  // Filter data based on search input and selected zone
  const filteredData = shelvesData.filter((item) => {
    // Filter by zone if one is selected
    if (selectedZone && item.zoneId !== selectedZone) {
      return false;
    }

    // Then filter by search text
    const searchText = filterText.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(searchText)) ||
      (item.description && item.description.toLowerCase().includes(searchText)) ||
      (item.type && item.type.toLowerCase().includes(searchText)) ||
      (item.zoneName && item.zoneName.toLowerCase().includes(searchText))
    );
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShelfForm({
      ...shelfForm,
      [name]: value,
    });
  };

  // Handle form submission for new shelf
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would be an API call to create a new shelf
    console.log("Creating new shelf:", shelfForm);
    setShowAddModal(false);
    // Reset form but keep selected zone
    setShelfForm({
      name: "",
      description: "",
      zoneId: selectedZone ? selectedZone.toString() : "",
      type: "standard",
      capacity: 100,
      status: "active",
    });
  };

  // Handle edit shelf
  const handleEdit = (shelf) => {
    setSelectedShelf(shelf);
    setShelfForm({
      name: shelf.name,
      description: shelf.description,
      zoneId: shelf.zoneId.toString(),
      type: shelf.type,
      capacity: shelf.capacity,
      status: shelf.status,
    });
    setShowEditModal(true);
  };

  // Handle update shelf
  const handleUpdate = (e) => {
    e.preventDefault();
    // In a real app, this would be an API call to update the shelf
    console.log("Updating shelf:", selectedShelf.id, shelfForm);
    setShowEditModal(false);
  };

  // Handle delete shelf
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this shelf?")) {
      // In a real app, this would be an API call to delete the shelf
      console.log("Deleting shelf:", id);
    }
  };

  // Handle zone filter change
  const handleZoneChange = (e) => {
    const zoneId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedZone(zoneId);
  };

  // Table columns
  const columns = [
    { name: "Shelf Name", selector: (row) => row.name, sortable: true },
    { name: "Zone", selector: (row) => row.zoneName, sortable: true },
    { name: "Type", selector: (row) => row.type, sortable: true },
    {
      name: "Capacity",
      selector: (row) => `${row.utilized}/${row.capacity}`,
      sortable: true,
      cell: (row) => {
        const utilizationPercent = Math.round((row.utilized / row.capacity) * 100);
        return (
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span>{row.utilized}/{row.capacity}</span>
              <span>{utilizationPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  utilizationPercent > 90 ? 'bg-red-500' : 
                  utilizationPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${utilizationPercent}%` }}
              ></div>
            </div>
          </div>
        );
      }
    },
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
            title="Edit Shelf"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete Shelf"
          >
            🗑️
          </button>
          <button
            onClick={() => window.location.href = `/warehouse/bins?shelfId=${row.id}`}
            className="p-1 text-green-600 hover:text-green-800"
            title="View Bins"
          >
            🔍
          </button>
        </div>
      ),
    },
  ];

  // Get selected zone details
  const selectedZoneDetails = zones.find(z => z.id === selectedZone);

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {selectedZoneDetails 
            ? `Shelves in ${selectedZoneDetails.name}` 
            : "Shelf Management"}
        </h1>
        <p className="text-gray-600">
          {selectedZoneDetails
            ? `Manage shelves in ${selectedZoneDetails.name} at ${selectedZoneDetails.warehouseName}`
            : "Manage shelves across all warehouse zones"}
        </p>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="w-full md:w-1/4 mb-4 md:mb-0">
          <select
            className="form-input w-full"
            value={selectedZone || ""}
            onChange={handleZoneChange}
          >
            <option value="">All Zones</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name} ({zone.warehouseName})
              </option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mx-4">
          <input
            type="text"
            placeholder="Search shelves..."
            className="form-input w-full"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add New Shelf
        </button>
      </div>

      {/* Shelf Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Shelves</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">📚</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Shelves</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.filter((s) => s.status === "active").length}
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
              <p className="text-sm font-medium text-gray-600">Total Bins</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.reduce((sum, shelf) => sum + shelf.binCount, 0)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              📦
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Utilization</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.length > 0 
                  ? Math.round(
                      (filteredData.reduce(
                        (sum, shelf) => sum + (shelf.utilized / shelf.capacity),
                        0
                      ) /
                        filteredData.length) *
                        100
                    )
                  : 0}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              📊
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
                {filteredData.length} shelves found
              </span>
            </div>
          }
        />
      </div>

      {/* Add Shelf Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add New Shelf</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="zoneId"
                    >
                      Zone
                    </label>
                    <select
                      id="zoneId"
                      name="zoneId"
                      className="form-input w-full"
                      value={shelfForm.zoneId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Zone</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} ({zone.warehouseName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="name"
                    >
                      Shelf Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-input w-full"
                      value={shelfForm.name}
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
                      value={shelfForm.description}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="type"
                    >
                      Shelf Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      className="form-input w-full"
                      value={shelfForm.type}
                      onChange={handleInputChange}
                    >
                      <option value="standard">Standard</option>
                      <option value="heavy-duty">Heavy Duty</option>
                      <option value="refrigerated">Refrigerated</option>
                      <option value="secure">Secure/Locked</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="capacity"
                    >
                      Capacity
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      className="form-input w-full"
                      value={shelfForm.capacity}
                      onChange={handleInputChange}
                      min="1"
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
                      className="form-input w-full"
                      value={shelfForm.status}
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
                    Add Shelf
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Shelf Modal */}
      {showEditModal && selectedShelf && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Edit Shelf</h2>
              <form onSubmit={handleUpdate}>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="zoneId"
                    >
                      Zone
                    </label>
                    <select
                      id="zoneId"
                      name="zoneId"
                      className="form-input w-full"
                      value={shelfForm.zoneId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Zone</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} ({zone.warehouseName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="name"
                    >
                      Shelf Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-input w-full"
                      value={shelfForm.name}
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
                      value={shelfForm.description}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="type"
                    >
                      Shelf Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      className="form-input w-full"
                      value={shelfForm.type}
                      onChange={handleInputChange}
                    >
                      <option value="standard">Standard</option>
                      <option value="heavy-duty">Heavy Duty</option>
                      <option value="refrigerated">Refrigerated</option>
                      <option value="secure">Secure/Locked</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="capacity"
                    >
                      Capacity
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      className="form-input w-full"
                      value={shelfForm.capacity}
                      onChange={handleInputChange}
                      min="1"
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
                      className="form-input w-full"
                      value={shelfForm.status}
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
                    Update Shelf
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

export default ShelfManagement;
