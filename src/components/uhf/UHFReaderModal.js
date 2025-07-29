import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import warehouseAPI from "../../utils/api/warehouseAPI";
import zoneAPI from "../../utils/api/zoneAPI";
import shelfAPI from "../../utils/api/shelfAPI";
import binAPI from "../../utils/api/binAPI";

const UHFReaderModal = ({ isOpen, onClose, mode, initialData, onSubmit }) => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  const [formData, setFormData] = useState({
    name: "",
    uhfId: "",
    description: "",
    status: "Active",
    location: {
      type: "Bin",
      warehouseId: "",
      zoneId: "",
      shelfId: "",
      binId: "",
    },
  });

  const [warehouses, setWarehouses] = useState([]);
  const [zones, setZones] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(false);

  // Location type options
  const locationTypes = [
    { value: "Warehouse", label: "Warehouse" },
    { value: "Zone", label: "Zone" },
    { value: "Shelf", label: "Shelf" },
    { value: "Bin", label: "Bin" },
  ];

  // Status options
  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Offline", label: "Offline" },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchWarehouses();
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          uhfId: initialData.uhfId || "",
          description: initialData.description || "",
          status: initialData.status || "Active",
          location: {
            type: initialData.location?.type || "Bin",
            warehouseId: initialData.location?.warehouseId || "",
            zoneId: initialData.location?.zoneId || "",
            shelfId: initialData.location?.shelfId || "",
            binId: initialData.location?.binId || "",
          },
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (formData.location.warehouseId) {
      fetchZones(formData.location.warehouseId);
    }
  }, [formData.location.warehouseId]);

  useEffect(() => {
    if (formData.location.zoneId) {
      fetchShelves(formData.location.zoneId);
    }
  }, [formData.location.zoneId]);

  useEffect(() => {
    if (formData.location.shelfId) {
      fetchBins(formData.location.shelfId);
    }
  }, [formData.location.shelfId]);

  const fetchWarehouses = async () => {
    try {
      const response = await warehouseAPI.getWarehouses();
      setWarehouses(response.data || []);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      toast.error("Failed to load warehouses");
    }
  };

  const fetchZones = async (warehouseId) => {
    try {
      const response = await zoneAPI.getZones(warehouseId);
      setZones(response.data || []);
      // Reset dependent fields
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          zoneId: "",
          shelfId: "",
          binId: "",
        },
      }));
    } catch (error) {
      console.error("Error fetching zones:", error);
      toast.error("Failed to load zones");
    }
  };

  const fetchShelves = async (zoneId) => {
    try {
      const response = await shelfAPI.getShelves(zoneId);
      setShelves(response.data || []);
      // Reset dependent fields
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          shelfId: "",
          binId: "",
        },
      }));
    } catch (error) {
      console.error("Error fetching shelves:", error);
      toast.error("Failed to load shelves");
    }
  };

  const fetchBins = async (shelfId) => {
    try {
      const response = await binAPI.getBins(shelfId);
      setBins(response.data || []);
      // Reset dependent fields
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          binId: "",
        },
      }));
    } catch (error) {
      console.error("Error fetching bins:", error);
      toast.error("Failed to load bins");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      uhfId: "",
      description: "",
      status: "Active",
      location: {
        type: "Bin",
        warehouseId: "",
        zoneId: "",
        shelfId: "",
        binId: "",
      },
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!formData.uhfId.trim()) {
      toast.error("UHF ID is required");
      return false;
    }
    if (!formData.location.warehouseId) {
      toast.error("Warehouse is required");
      return false;
    }
    if (formData.location.type === "Zone" && !formData.location.zoneId) {
      toast.error("Zone is required for Zone type location");
      return false;
    }
    if (formData.location.type === "Shelf" && !formData.location.shelfId) {
      toast.error("Shelf is required for Shelf type location");
      return false;
    }
    if (formData.location.type === "Bin" && !formData.location.binId) {
      toast.error("Bin is required for Bin type location");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Clean up location object based on type
      const cleanLocation = { ...formData.location };
      if (cleanLocation.type === "Warehouse") {
        delete cleanLocation.zoneId;
        delete cleanLocation.shelfId;
        delete cleanLocation.binId;
      } else if (cleanLocation.type === "Zone") {
        delete cleanLocation.shelfId;
        delete cleanLocation.binId;
      } else if (cleanLocation.type === "Shelf") {
        delete cleanLocation.binId;
      }

      const submitData = {
        ...formData,
        location: cleanLocation,
      };

      await onSubmit(submitData);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to save UHF reader");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === "add" ? "Add New UHF Reader" : "Edit UHF Reader"}
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Basic Information */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="Enter UHF reader name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                UHF ID *
              </label>
              <input
                type="text"
                name="uhfId"
                value={formData.uhfId}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="Enter UHF ID"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-input w-full"
                rows="3"
                placeholder="Enter description"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-input w-full"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Location Type
              </label>
              <select
                name="location.type"
                value={formData.location.type}
                onChange={handleInputChange}
                className="form-input w-full"
              >
                {locationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Selection */}
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Location Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Warehouse *
                </label>
                <select
                  name="location.warehouseId"
                  value={formData.location.warehouseId}
                  onChange={handleInputChange}
                  className="form-input w-full"
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

              {(formData.location.type === "Zone" ||
                formData.location.type === "Shelf" ||
                formData.location.type === "Bin") && (
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Zone {formData.location.type !== "Zone" ? "*" : ""}
                  </label>
                  <select
                    name="location.zoneId"
                    value={formData.location.zoneId}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    required={formData.location.type !== "Zone"}
                  >
                    <option value="">Select Zone</option>
                    {zones.map((zone) => (
                      <option key={zone._id} value={zone._id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(formData.location.type === "Shelf" ||
                formData.location.type === "Bin") && (
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Shelf {formData.location.type !== "Shelf" ? "*" : ""}
                  </label>
                  <select
                    name="location.shelfId"
                    value={formData.location.shelfId}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    required={formData.location.type !== "Shelf"}
                  >
                    <option value="">Select Shelf</option>
                    {shelves.map((shelf) => (
                      <option key={shelf._id} value={shelf._id}>
                        {shelf.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.location.type === "Bin" && (
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Bin *
                  </label>
                  <select
                    name="location.binId"
                    value={formData.location.binId}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    required
                  >
                    <option value="">Select Bin</option>
                    {bins.map((bin) => (
                      <option key={bin._id} value={bin._id}>
                        {bin.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : mode === "add"
                ? "Add Reader"
                : "Update Reader"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UHFReaderModal;
