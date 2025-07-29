import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import binAPI from "../../utils/api/binAPI";
import shelfAPI from "../../utils/api/shelfAPI";
import zoneAPI from "../../utils/api/zoneAPI";
import warehouseAPI from "../../utils/api/warehouseAPI";

const BinManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);
  const location = useLocation();

  // Get shelfId from URL query params if available
  const queryParams = new URLSearchParams(location.search);
  const shelfIdFromUrl = queryParams.get("shelfId")
    ? parseInt(queryParams.get("shelfId"))
    : null;

  const [filterText, setFilterText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null);
  const [selectedShelf, setSelectedShelf] = useState(shelfIdFromUrl);
  const [zones, setZones] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state for new/edit bin
  const [binForm, setBinForm] = useState({
    name: "",
    description: "",
    shelfId: shelfIdFromUrl ? shelfIdFromUrl.toString() : "",
    type: "standard",
    capacity: 50,
    status: "active",
  });

  // Fetch shelves and bins data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const zonesResponse = await zoneAPI.getZones();
        const zonesData =
          zonesResponse && zonesResponse.data ? zonesResponse.data : [];
        setZones(Array.isArray(zonesData) ? zonesData : []);

        // Fetch shelves data
        const shelvesResponse = await shelfAPI.getShelves();
        setShelves(
          Array.isArray(shelvesResponse.data) ? shelvesResponse.data : []
        );

        // Fetch bins data based on selected shelf or all bins
        let binsResponse;
        if (selectedShelf) {
          binsResponse = await binAPI.getBins(selectedShelf);
        } else {
          binsResponse = await binAPI.getBins();
        }

        setBins(Array.isArray(binsResponse.data) ? binsResponse.data : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedShelf]);

  // Filtered bins based on search text
  const filteredBins = bins.filter((bin) => {
    // Filter by search text
    const searchText = filterText.toLowerCase();
    return (
      (bin.name && bin.name.toLowerCase().includes(searchText)) ||
      (bin.description && bin.description.toLowerCase().includes(searchText)) ||
      (bin.type && bin.type.toLowerCase().includes(searchText)) ||
      (bin.shelfName && bin.shelfName.toLowerCase().includes(searchText))
    );
  });

  // Calculate statistics
  const totalBins = filteredBins.length;
  const activeBins = filteredBins.filter((bin) => bin.isActive === true).length;
  const totalCapacity = filteredBins.reduce(
    (sum, bin) => sum + (parseInt(bin.utilization.capacityValue) || 0),
    0
  );
  const totalUtilized = filteredBins.reduce(
    (sum, bin) => sum + (parseInt(bin.utilization.utilizationPercentage) || 0),
    0
  );
  const utilizationPercentage =
    totalCapacity > 0 ? Math.round((totalUtilized / totalCapacity) * 100) : 0;
  const totalItems = filteredBins.reduce(
    (sum, bin) => sum + (bin.inventoryCount || 0),
    0
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBinForm({
      ...binForm,
      [name]: value,
    });
  };

  // Handle form submission for new bin
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const shelfId = binForm.shelfId;

      // Create payload for API
      const binData = {
        name: binForm.name,
        description: binForm.description,
        type: binForm.type,
        capacity: parseInt(binForm.capacity),
        status: binForm.status,
      };

      // API call to create bin
      await binAPI.createBin(shelfId, binData);

      // Refresh bins data
      const binsResponse = selectedShelf
        ? await binAPI.getBins(selectedShelf)
        : await binAPI.getBins();

      setBins(Array.isArray(binsResponse.data) ? binsResponse.data : []);
      toast.success("Bin created successfully");

      // Reset form and close modal
      setBinForm({
        name: "",
        description: "",
        shelfId: selectedShelf ? selectedShelf.toString() : "",
        type: "standard",
        capacity: 50,
        status: "active",
      });
      setShowAddModal(false);
    } catch (err) {
      console.error("Error creating bin:", err);
      toast.error("Failed to create bin");
    } finally {
      setLoading(false);
    }
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
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Create payload for API
      const binData = {
        name: binForm.name,
        description: binForm.description,
        type: binForm.type,
        capacity: parseInt(binForm.capacity),
        status: binForm.status,
      };

      // API call to update bin
      await binAPI.updateBin(selectedBin._id, binData);

      // Refresh bins data
      const binsResponse = selectedShelf
        ? await binAPI.getBins(selectedShelf)
        : await binAPI.getBins();

      setBins(Array.isArray(binsResponse.data) ? binsResponse.data : []);
      toast.success("Bin updated successfully");

      // Close modal
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating bin:", err);
      toast.error("Failed to update bin");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete bin
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bin?")) {
      try {
        setLoading(true);

        // API call to delete bin
        await binAPI.deleteBin(id);

        // Refresh bins data
        const binsResponse = selectedShelf
          ? await binAPI.getBins(selectedShelf)
          : await binAPI.getBins();

        setBins(Array.isArray(binsResponse.data) ? binsResponse.data : []);
        toast.success("Bin deleted successfully");
      } catch (err) {
        console.error("Error deleting bin:", err);
        toast.error("Failed to delete bin");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle shelf filter change
  const handleShelfChange = (e) => {
    const shelfId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedShelf(shelfId);
  };
  const findShelfById = (id) => {
    if (!id) return null;
    return shelves.find((shelf) => shelf._id === id)?.name;
  };
  const findZoneById = (id) => {
    if (!id) return null;
    return zones.find((zone) => zone._id === id)?.name;
  };
  // Table columns
  const columns = [
    { name: "Bin Name", selector: (row) => row.name, sortable: true },
    {
      name: "Shelf",
      selector: (row) => findShelfById(row.shelfId),
      sortable: true,
    },
    { name: "Type", selector: (row) => row.type, sortable: true },
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
      name: "Capacity",
      selector: (row) => row.utilization.capacityValue,
      sortable: true,
    },
    {
      name: "Utilization",
      selector: (row) => row.utilization.utilizationPercentage,
      sortable: true,
      cell: (row) => {
        const utilizationPercent = row.utilization.utilizationPercentage;
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
      name: "Inventory",
      selector: (row) => row.inventoryCount,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-red-600 hover:text-red-800"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  // Get selected shelf details
  const selectedShelfDetails = shelves.find((s) => s.id === selectedShelf);

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
            ? `Manage bins in ${selectedShelfDetails.name} at ${selectedShelfDetails.zoneName}`
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
          className="btn btn-primary w-full md:w-auto"
          onClick={() => setShowAddModal(true)}
        >
          Add New Bin
        </button>
      </div>

      {/* Bin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bins</p>
              <p className="text-2xl font-bold text-gray-900">{totalBins}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">📦</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Bins</p>
              <p className="text-2xl font-bold text-gray-900">{activeBins}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              ✅
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
              📈
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
          data={filteredBins}
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
                {filteredBins.length} bins found
              </span>
            </div>
          }
        />
      </div>

      {/* Add Bin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Bin</h2>
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
                        <option key={shelf._id} value={shelf._id}>
                          {shelf.name} ({findZoneById(shelf.zoneId)})
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
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Bin</h2>
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
                      htmlFor="shelfId"
                    >
                      Shelf
                    </label>
                    <select
                      id="shelfId"
                      name="shelfId"
                      className="form-input w-full"
                      value={binForm.shelfId}
                      onChange={handleShelfChange}
                      required
                    >
                      <option value="">Select Shelf</option>
                      {shelves.map((shelf) => (
                        <option key={shelf._id} value={shelf._id}>
                          {shelf.name} ({findZoneById(shelf.zoneId)})
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
