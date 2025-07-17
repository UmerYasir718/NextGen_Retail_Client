import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";

const BinManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  
  // Get shelfId from URL query params if available
  const queryParams = new URLSearchParams(location.search);
  const shelfIdFromUrl = queryParams.get("shelfId") ? parseInt(queryParams.get("shelfId")) : null;

  const [filterText, setFilterText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null);
  const [selectedShelf, setSelectedShelf] = useState(shelfIdFromUrl);
  const [shelves, setShelves] = useState([]);

  // Form state for new/edit bin
  const [binForm, setBinForm] = useState({
    name: "",
    description: "",
    shelfId: shelfIdFromUrl ? shelfIdFromUrl.toString() : "",
    type: "standard",
    capacity: 50,
    status: "active",
  });

  // Sample data for bins
  const binsData = [
    {
      id: 1,
      name: "Bin A1-1",
      description: "Electronics - Smartphones",
      shelfId: 1,
      shelfName: "Shelf A1",
      zoneId: 1,
      zoneName: "Zone A",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
      type: "standard",
      capacity: 50,
      utilized: 35,
      itemCount: 12,
      status: "active",
      lastUpdated: "2023-06-15",
    },
    {
      id: 2,
      name: "Bin A1-2",
      description: "Electronics - Tablets",
      shelfId: 1,
      shelfName: "Shelf A1",
      zoneId: 1,
      zoneName: "Zone A",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
      type: "standard",
      capacity: 50,
      utilized: 20,
      itemCount: 8,
      status: "active",
      lastUpdated: "2023-06-14",
    },
    {
      id: 3,
      name: "Bin A1-3",
      description: "Electronics - Accessories",
      shelfId: 1,
      shelfName: "Shelf A1",
      zoneId: 1,
      zoneName: "Zone A",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
      type: "small",
      capacity: 25,
      utilized: 10,
      itemCount: 25,
      status: "active",
      lastUpdated: "2023-06-13",
    },
    {
      id: 4,
      name: "Bin A2-1",
      description: "Electronics - Laptops",
      shelfId: 2,
      shelfName: "Shelf A2",
      zoneId: 1,
      zoneName: "Zone A",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
      type: "large",
      capacity: 75,
      utilized: 60,
      itemCount: 15,
      status: "active",
      lastUpdated: "2023-06-12",
    },
    {
      id: 5,
      name: "Bin B1-1",
      description: "Clothing - T-shirts",
      shelfId: 3,
      shelfName: "Shelf B1",
      zoneId: 2,
      zoneName: "Zone B",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
      type: "standard",
      capacity: 50,
      utilized: 45,
      itemCount: 30,
      status: "active",
      lastUpdated: "2023-06-11",
    },
    {
      id: 6,
      name: "Bin C1-1",
      description: "Under maintenance",
      shelfId: 5,
      shelfName: "Shelf C1",
      zoneId: 3,
      zoneName: "Zone C",
      warehouseId: 2,
      warehouseName: "West Coast Facility",
      type: "standard",
      capacity: 50,
      utilized: 0,
      itemCount: 0,
      status: "maintenance",
      lastUpdated: "2023-06-10",
    },
  ];

  // Sample data for shelves
  const shelvesData = [
    {
      id: 1,
      name: "Shelf A1",
      zoneId: 1,
      zoneName: "Zone A",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
    },
    {
      id: 2,
      name: "Shelf A2",
      zoneId: 1,
      zoneName: "Zone A",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
    },
    {
      id: 3,
      name: "Shelf B1",
      zoneId: 2,
      zoneName: "Zone B",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
    },
    {
      id: 4,
      name: "Shelf B2",
      zoneId: 2,
      zoneName: "Zone B",
      warehouseId: 1,
      warehouseName: "Main Distribution Center",
    },
    {
      id: 5,
      name: "Shelf C1",
      zoneId: 3,
      zoneName: "Zone C",
      warehouseId: 2,
      warehouseName: "West Coast Facility",
    },
  ];

  // Load shelves on component mount
  useEffect(() => {
    // In a real app, this would be an API call
    setShelves(shelvesData);
    
    // If shelfId is provided in URL, set it as selected
    if (shelfIdFromUrl) {
      setSelectedShelf(shelfIdFromUrl);
      setBinForm(prev => ({
        ...prev,
        shelfId: shelfIdFromUrl.toString()
      }));
    }
  }, [shelfIdFromUrl]);

  // Filter data based on search input and selected shelf
  const filteredData = binsData.filter((item) => {
    // Filter by shelf if one is selected
    if (selectedShelf && item.shelfId !== selectedShelf) {
      return false;
    }

    // Then filter by search text
    const searchText = filterText.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(searchText)) ||
      (item.description && item.description.toLowerCase().includes(searchText)) ||
      (item.type && item.type.toLowerCase().includes(searchText)) ||
      (item.shelfName && item.shelfName.toLowerCase().includes(searchText))
    );
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBinForm({
      ...binForm,
      [name]: value,
    });
  };

  // Handle form submission for new bin
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would be an API call to create a new bin
    console.log("Creating new bin:", binForm);
    setShowAddModal(false);
    // Reset form but keep selected shelf
    setBinForm({
      name: "",
      description: "",
      shelfId: selectedShelf ? selectedShelf.toString() : "",
      type: "standard",
      capacity: 50,
      status: "active",
    });
  };

  // Handle edit bin
  const handleEdit = (bin) => {
    setSelectedBin(bin);
    setBinForm({
      name: bin.name,
      description: bin.description,
      shelfId: bin.shelfId.toString(),
      type: bin.type,
      capacity: bin.capacity,
      status: bin.status,
    });
    setShowEditModal(true);
  };

  // Handle update bin
  const handleUpdate = (e) => {
    e.preventDefault();
    // In a real app, this would be an API call to update the bin
    console.log("Updating bin:", selectedBin.id, binForm);
    setShowEditModal(false);
  };

  // Handle delete bin
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this bin?")) {
      // In a real app, this would be an API call to delete the bin
      console.log("Deleting bin:", id);
    }
  };

  // Handle shelf filter change
  const handleShelfChange = (e) => {
    const shelfId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedShelf(shelfId);
  };

  // Table columns
  const columns = [
    { name: "Bin Name", selector: (row) => row.name, sortable: true },
    { name: "Shelf", selector: (row) => row.shelfName, sortable: true },
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
            title="Edit Bin"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete Bin"
          >
            🗑️
          </button>
          <button
            onClick={() => window.location.href = `/warehouse/inventory?binId=${row.id}`}
            className="p-1 text-green-600 hover:text-green-800"
            title="View Inventory"
          >
            🔍
          </button>
        </div>
      ),
    },
  ];

  // Get selected shelf details
  const selectedShelfDetails = shelves.find(s => s.id === selectedShelf);

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {selectedShelfDetails 
            ? `Bins in ${selectedShelfDetails.name}` 
            : "Bin Management"}
        </h1>
        <p className="text-gray-600">
          {selectedShelfDetails
            ? `Manage bins in ${selectedShelfDetails.name} at ${selectedShelfDetails.warehouseName}`
            : "Manage bins across all warehouse shelves"}
        </p>
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="w-full md:w-1/4 mb-4 md:mb-0">
          <select
            className="form-input w-full"
            value={selectedShelf || ""}
            onChange={handleShelfChange}
          >
            <option value="">All Shelves</option>
            {shelves.map((shelf) => (
              <option key={shelf.id} value={shelf.id}>
                {shelf.name} ({shelf.zoneName})
              </option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mx-4">
          <input
            type="text"
            placeholder="Search bins..."
            className="form-input w-full"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add New Bin
        </button>
      </div>

      {/* Bin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bins</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">📦</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Bins</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.filter((b) => b.status === "active").length}
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
              <p className="text-sm font-medium text-gray-600">Avg. Utilization</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.length > 0 
                  ? Math.round(
                      (filteredData.reduce(
                        (sum, bin) => sum + (bin.utilized / bin.capacity),
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
                {filteredData.length} bins found
              </span>
            </div>
          }
        />
      </div>

      {/* Add Bin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add New Bin</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="shelfId"
                    >
                      Shelf
                    </label>
                    <select
                      id="shelfId"
                      name="shelfId"
                      className="form-input w-full"
                      value={binForm.shelfId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Shelf</option>
                      {shelves.map((shelf) => (
                        <option key={shelf.id} value={shelf.id}>
                          {shelf.name} ({shelf.zoneName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="name"
                    >
                      Bin Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-input w-full"
                      value={binForm.name}
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
                      value={binForm.description}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="type"
                    >
                      Bin Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      className="form-input w-full"
                      value={binForm.type}
                      onChange={handleInputChange}
                    >
                      <option value="standard">Standard</option>
                      <option value="small">Small</option>
                      <option value="large">Large</option>
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
                      value={binForm.capacity}
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
                      value={binForm.status}
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
                    Add Bin
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bin Modal */}
      {showEditModal && selectedBin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Edit Bin</h2>
              <form onSubmit={handleUpdate}>
                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="shelfId"
                    >
                      Shelf
                    </label>
                    <select
                      id="shelfId"
                      name="shelfId"
                      className="form-input w-full"
                      value={binForm.shelfId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Shelf</option>
                      {shelves.map((shelf) => (
                        <option key={shelf.id} value={shelf.id}>
                          {shelf.name} ({shelf.zoneName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="name"
                    >
                      Bin Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-input w-full"
                      value={binForm.name}
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
                      value={binForm.description}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="type"
                    >
                      Bin Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      className="form-input w-full"
                      value={binForm.type}
                      onChange={handleInputChange}
                    >
                      <option value="standard">Standard</option>
                      <option value="small">Small</option>
                      <option value="large">Large</option>
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
                      value={binForm.capacity}
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
                      value={binForm.status}
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
                    Update Bin
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

export default BinManagement;
