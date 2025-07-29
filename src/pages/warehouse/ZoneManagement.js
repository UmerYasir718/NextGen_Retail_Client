import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import zoneAPI from "../../utils/api/zoneAPI";
import warehouseAPI from "../../utils/api/warehouseAPI";

const ZoneManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Get warehouseId from URL query params if available
  const queryParams = new URLSearchParams(location.search);
  const warehouseIdFromUrl = queryParams.get("warehouseId")
    ? parseInt(queryParams.get("warehouseId"))
    : null;

  const [filterText, setFilterText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState(warehouseIdFromUrl);
  const [warehouses, setWarehouses] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(
    user?.companyId ? { id: user.companyId } : null
  );

  // Form state for new/edit zone
  const [zoneForm, setZoneForm] = useState({
    name: "",
    description: "",
    warehouseId: warehouseIdFromUrl ? warehouseIdFromUrl.toString() : "",
    type: "standard",
    status: "active",
  });

  // Fetch warehouses and zones data from backend
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

        // Fetch zones data based on selected warehouse or all zones
        let zonesResponse;
        // if (selectedWarehouse) {
        //   zonesResponse = await zoneAPI.getZones(selectedWarehouse);
        // } else {
        zonesResponse = await zoneAPI.getZones();
        // }

        // Handle API response correctly
        const zonesData =
          zonesResponse && zonesResponse.data ? zonesResponse.data : [];
        setZones(Array.isArray(zonesData) ? zonesData : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedWarehouse, selectedCompany]);

  // Filtered zones based on search text
  const filteredZones = zones.filter((zone) => {
    // Filter by search text
    const searchText = filterText.toLowerCase();
    return (
      (zone.name && zone.name.toLowerCase().includes(searchText)) ||
      (zone.description &&
        zone.description.toLowerCase().includes(searchText)) ||
      (zone.type && zone.type.toLowerCase().includes(searchText)) ||
      (zone.warehouseName &&
        zone.warehouseName.toLowerCase().includes(searchText))
    );
  });

  // Calculate statistics
  const totalZones = filteredZones.length;
  const activeZones = filteredZones.filter(
    (zone) => zone.isActive === true
  ).length;
  const totalShelves = filteredZones.reduce(
    (sum, zone) => sum + (zone.utilization.shelfCount || 0),
    0
  );
  const totalCapacity = filteredZones.reduce(
    (sum, zone) => sum + (parseInt(zone.capacity) || 0),
    0
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setZoneForm({
      ...zoneForm,
      [name]: value,
    });
  };

  // Handle form submission for new zone
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log(zoneForm);
      const warehouseId = zoneForm.warehouseId;

      // Create payload for API
      const zoneData = {
        name: zoneForm.name,
        description: zoneForm.description,
        type: zoneForm.type,
        status: zoneForm.status,
      };

      // API call to create zone
      await zoneAPI.createZone(warehouseId, zoneData);

      // Refresh zones data
      const zonesResponse = selectedWarehouse
        ? await zoneAPI.getZones(selectedWarehouse)
        : await zoneAPI.getZones();

      // Handle API response correctly
      const zonesData =
        zonesResponse && zonesResponse.data ? zonesResponse.data : [];
      setZones(Array.isArray(zonesData) ? zonesData : []);
      toast.success("Zone created successfully");

      // Reset form and close modal
      setZoneForm({
        name: "",
        description: "",
        warehouseId: selectedWarehouse ? selectedWarehouse.toString() : "",
        type: "standard",
        status: "active",
      });
      setShowAddModal(false);
    } catch (err) {
      console.error("Error creating zone:", err);
      toast.error("Failed to create zone");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit zone
  const handleEdit = (zone) => {
    setSelectedZone(zone);
    setSelectedWarehouse(zone.warehouseId);
    console.log(zone.warehouseId);
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
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Create payload for API
      const zoneData = {
        name: zoneForm.name,
        description: zoneForm.description,
        warehouseId: zoneForm.warehouseId,
        type: zoneForm.type,
        status: zoneForm.status,
      };

      // API call to update zone
      await zoneAPI.updateZone(selectedZone._id, zoneData);

      // Refresh zones data
      const zonesResponse = selectedWarehouse
        ? await zoneAPI.getZones(selectedWarehouse)
        : await zoneAPI.getZones();

      // Handle API response correctly
      const zonesData =
        zonesResponse && zonesResponse.data ? zonesResponse.data : [];
      setZones(Array.isArray(zonesData) ? zonesData : []);
      toast.success("Zone updated successfully");

      // Reset and close modal
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating zone:", err);
      toast.error("Failed to update zone");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete zone
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this zone?")) {
      try {
        setLoading(true);

        // API call to delete zone
        await zoneAPI.deleteZone(id);

        // Refresh zones data
        const zonesResponse = selectedWarehouse
          ? await zoneAPI.getZones(selectedWarehouse)
          : await zoneAPI.getZones();

        // Handle API response correctly
        const zonesData =
          zonesResponse && zonesResponse.data ? zonesResponse.data : [];
        setZones(Array.isArray(zonesData) ? zonesData : []);
        toast.success("Zone deleted successfully");
      } catch (err) {
        console.error("Error deleting zone:", err);
        toast.error("Failed to delete zone");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle warehouse filter change
  const handleWarehouseChange = (e) => {
    const warehouseId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedWarehouse(warehouseId);
  };
  const findWareHouseById = (id) => {
    if (!id) return null;
    return warehouses.find((warehouse) => warehouse._id === id)?.name;
  };

  // Table columns
  const columns = [
    { name: "Zone Name", selector: (row) => row.name, sortable: true },
    {
      name: "Warehouse",
      selector: (row) => findWareHouseById(row.warehouseId),
      sortable: true,
    },
    { name: "Type", selector: (row) => row.type, sortable: true },
    {
      name: "Shelves",
      selector: (row) => row.utilization.shelfCount || 0,
      sortable: true,
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
        </div>
      ),
    },
  ];

  // Get selected warehouse details
  const selectedWarehouseDetails = warehouses.find(
    (w) => w.id === selectedWarehouse
  );

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {selectedWarehouseDetails
            ? `Zones in ${selectedWarehouseDetails.name}`
            : "Zone Management"}
        </h1>
        <p className="text-gray-600">
          {selectedWarehouseDetails
            ? `Manage zones in ${selectedWarehouseDetails.name} warehouse`
            : "Manage zones across all warehouses"}
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
          className="btn btn-primary w-full md:w-auto"
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
              <p className="text-2xl font-bold text-gray-900">{totalZones}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">🏢</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Zones</p>
              <p className="text-2xl font-bold text-gray-900">{activeZones}</p>
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
              <p className="text-2xl font-bold text-gray-900">{totalShelves}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              📚
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Capacity
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCapacity}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              📊
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
          data={filteredZones}
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
                {filteredZones.length} zones found
              </span>
            </div>
          }
        />
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Zone</h2>
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
                      htmlFor="warehouseId"
                    >
                      Warehouse
                    </label>
                    <select
                      id="warehouseId"
                      name="warehouseId"
                      className="form-input w-full"
                      value={zoneForm._id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse._id} value={warehouse._id}>
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
                      rows="2"
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
                      <option value="standard">Standard</option>
                      <option value="cold-storage">Cold Storage</option>
                      <option value="hazardous">Hazardous Materials</option>
                      <option value="high-security">High Security</option>
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
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Zone</h2>
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
                        <option key={warehouse._id} value={warehouse._id}>
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
                      rows="2"
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
                      <option value="standard">Standard</option>
                      <option value="cold-storage">Cold Storage</option>
                      <option value="hazardous">Hazardous Materials</option>
                      <option value="high-security">High Security</option>
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
