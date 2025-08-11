import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import shelfAPI from "../../utils/api/shelfAPI";
import zoneAPI from "../../utils/api/zoneAPI";
import warehouseAPI from "../../utils/api/warehouseAPI";

const ShelfManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Get zoneId from URL query params if available
  const queryParams = new URLSearchParams(location.search);
  const zoneIdFromUrl = queryParams.get("zoneId")
    ? parseInt(queryParams.get("zoneId"))
    : null;

  const [filterText, setFilterText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [selectedZone, setSelectedZone] = useState(zoneIdFromUrl);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [zones, setZones] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warehouses, setWarehouses] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState(
    user?.companyId ? { id: user.companyId } : null
  );

  // Form state for new/edit shelf
  const [shelfForm, setShelfForm] = useState({
    name: "",
    description: "",
    zoneId: zoneIdFromUrl ? zoneIdFromUrl.toString() : "",
    type: "standard",
    capacity: 100,
    status: "active",
  });

  // Fetch zones and shelves data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch warehouses data
        const companyId = selectedCompany?.id;
        const warehousesResponse = await warehouseAPI.getWarehouses(companyId);
        const warehousesData =
          warehousesResponse && warehousesResponse.data
            ? warehousesResponse.data
            : [];
        setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);

        // Fetch zones data
        const zonesResponse = await zoneAPI.getZones();
        const zonesData =
          zonesResponse && zonesResponse.data ? zonesResponse.data : [];
        setZones(Array.isArray(zonesData) ? zonesData : []);

        // Fetch shelves data based on selected zone or all shelves
        let shelvesResponse;
        if (selectedZone) {
          shelvesResponse = await shelfAPI.getShelves(selectedZone);
        } else {
          shelvesResponse = await shelfAPI.getShelves();
        }

        // Handle API response correctly
        const shelvesData =
          shelvesResponse && shelvesResponse.data ? shelvesResponse.data : [];
        setShelves(Array.isArray(shelvesData) ? shelvesData : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedZone]);

  // Filtered shelves based on search text
  const filteredShelves = shelves.filter((shelf) => {
    // Filter by search text
    const searchText = filterText.toLowerCase();
    return (
      (shelf.name && shelf.name.toLowerCase().includes(searchText)) ||
      (shelf.description &&
        shelf.description.toLowerCase().includes(searchText)) ||
      (shelf.type && shelf.type.toLowerCase().includes(searchText)) ||
      (shelf.zoneName && shelf.zoneName.toLowerCase().includes(searchText))
    );
  });

  // Calculate statistics
  const totalShelves = filteredShelves.length;
  const activeShelves = filteredShelves.filter(
    (shelf) => shelf.isActive === true
  ).length;
  const totalCapacity = filteredShelves.reduce(
    (sum, shelf) => sum + (parseInt(shelf.utilization.capacityValue) || 0),
    0
  );
  const totalUtilized = filteredShelves.reduce(
    (sum, shelf) =>
      sum + (parseInt(shelf.utilization.utilizationPercentage) || 0),
    0
  );
  const utilizationPercentage =
    totalCapacity > 0 ? Math.round((totalUtilized / totalCapacity) * 100) : 0;
  const totalBins = filteredShelves.reduce(
    (sum, shelf) => sum + (shelf.utilization.binCount || 0),
    0
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShelfForm({
      ...shelfForm,
      [name]: value,
    });
  };

  const findWareHouseById = (id) => {
    if (!id) return null;
    return warehouses.find((warehouse) => warehouse._id === id)?.name;
  };

  // Handle form submission for new shelf
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const zoneId = shelfForm.zoneId;

      // Create payload for API
      const shelfData = {
        name: shelfForm.name,
        description: shelfForm.description,
        type: shelfForm.type,
        capacity: parseInt(shelfForm.capacity),
        status: shelfForm.status,
      };

      // API call to create shelf
      await shelfAPI.createShelf(zoneId, shelfData);

      // Refresh shelves data
      const shelvesResponse = selectedZone
        ? await shelfAPI.getShelves(selectedZone)
        : await shelfAPI.getShelves();

      // Handle API response correctly
      const shelvesData =
        shelvesResponse && shelvesResponse.data ? shelvesResponse.data : [];
      setShelves(Array.isArray(shelvesData) ? shelvesData : []);
      toast.success("Shelf created successfully");

      // Reset form and close modal
      setShelfForm({
        name: "",
        description: "",
        zoneId: selectedZone ? selectedZone.toString() : "",
        type: "standard",
        capacity: 100,
        status: "active",
      });
      setShowAddModal(false);
    } catch (err) {
      console.error("Error creating shelf:", err);
      toast.error("Failed to create shelf");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit shelf
  const handleEdit = (shelf) => {
    setSelectedShelf(shelf);
    setShelfForm({
      name: shelf.name,
      description: shelf.description,
      zoneId: shelf.zoneId,
      type: shelf.type,
      capacity: shelf.capacity,
      status: shelf.status,
    });
    setShowEditModal(true);
  };

  // Handle update shelf
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Create payload for API
      const shelfData = {
        name: shelfForm.name,
        description: shelfForm.description,
        zoneId: shelfForm.zoneId,
        type: shelfForm.type,
        capacity: parseInt(shelfForm.capacity),
        status: shelfForm.status,
      };

      // API call to update shelf
      await shelfAPI.updateShelf(selectedShelf._id, shelfData);

      // Refresh shelves data
      const shelvesResponse = selectedZone
        ? await shelfAPI.getShelves(selectedZone)
        : await shelfAPI.getShelves();

      // Handle API response correctly
      const shelvesData =
        shelvesResponse && shelvesResponse.data ? shelvesResponse.data : [];
      setShelves(Array.isArray(shelvesData) ? shelvesData : []);
      toast.success("Shelf updated successfully");

      // Close modal
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating shelf:", err);
      toast.error("Failed to update shelf");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete shelf
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this shelf?")) {
      try {
        setLoading(true);

        // API call to delete shelf
        await shelfAPI.deleteShelf(id);

        // Refresh shelves data
        const shelvesResponse = selectedZone
          ? await shelfAPI.getShelves(selectedZone)
          : await shelfAPI.getShelves();

        setShelves(
          Array.isArray(shelvesResponse.data) ? shelvesResponse.data : []
        );
        toast.success("Shelf deleted successfully");
      } catch (err) {
        console.error("Error deleting shelf:", err);
        toast.error("Failed to delete shelf");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle zone filter change
  const handleZoneChange = (e) => {
    const zoneId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedZone(zoneId);
  };
  const findZoneById = (id) => {
    if (!id) return null;
    return zones.find((zone) => zone._id === id)?.name;
  };
  // Table columns
  const columns = [
    { name: "Shelf Name", selector: (row) => row.name, sortable: true },
    {
      name: "Zone",
      selector: (row) => findZoneById(row.zoneId),
      sortable: true,
    },
    { name: "Type", selector: (row) => row.type, sortable: true },
    {
      name: "Capacity",
      selector: (row) => row.utilization.capacityValue,
      sortable: true,
    },
    {
      name: "Utilization",
      selector: (row) => row.utilization.utilizationPercentage,
      sortable: true,
      cell: (row) => {
        const utilizationPercent = Math.round(
          (row.utilization.utilizationPercentage /
            row.utilization.capacityValue) *
            100
        );
        return (
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">{utilizationPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  utilizationPercent > 90
                    ? "bg-red-500"
                    : utilizationPercent > 70
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${utilizationPercent}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      name: "Status",
      selector: (row) => row.isActive,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.isActive === true
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.isActive === true ? "Active" : "Inactive"}
        </span>
      ),
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
        </div>
      ),
    },
  ];

  // Get selected zone details
  const selectedZoneDetails = zones.find((z) => z._id === selectedZone);

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
          className="btn btn-primary w-full md:w-auto"
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
              <p className="text-2xl font-bold text-gray-900">{totalShelves}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">📚</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Shelves
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {activeShelves}
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
              <p className="text-sm font-medium text-gray-600">Utilization</p>
              <p className="text-2xl font-bold text-gray-900">
                {utilizationPercentage}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              📊
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bins</p>
              <p className="text-2xl font-bold text-gray-900">{totalBins}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              📦
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {error && (
          <div className="p-4 bg-red-100 text-red-700 border-l-4 border-red-500">
            {error}
          </div>
        )}
        <DataTable
          columns={columns}
          data={filteredShelves}
          pagination
          responsive
          highlightOnHover
          striped
          progressPending={loading}
          progressComponent={<div className="p-4">Loading...</div>}
          subHeader
          subHeaderComponent={
            <div className="w-full text-right py-2">
              <span className="text-sm text-gray-600">
                {filteredShelves.length} shelves found
              </span>
            </div>
          }
        />
      </div>

      {/* Add Shelf Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Shelf</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
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
                        <option key={zone.id} value={zone._id}>
                          {zone.name} ({findWareHouseById(zone.warehouseId)})
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
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Shelf</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
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
                        <option key={zone._id} value={zone._id}>
                          {zone.name} ({findWareHouseById(zone.warehouseId)})
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
