import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import warehouseAPI from "../../utils/api/warehouseAPI";
import zoneAPI from "../../utils/api/zoneAPI";
import shelfAPI from "../../utils/api/shelfAPI";
import binAPI from "../../utils/api/binAPI";

const InventoryModal = ({
  isOpen,
  onClose,
  mode = "add", // add, edit, view
  inventoryType = "purchase", // purchase, pending_sale, sale
  initialData = null,
  onSubmit,
}) => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    tagId: "",
    description: "",
    category: "",
    quantity: 0,
    threshold: 5,
    location: {
      warehouseId: "",
      zoneId: "",
      shelfId: "",
      binId: "",
    },
    status: "Available",
    inventoryStatus:
      inventoryType === "purchase"
        ? "purchase"
        : inventoryType === "pending_sale"
        ? "sale_pending"
        : "sale",
    price: {
      cost: 0,
      retail: 0,
    },
    images: [],
    companyId: selectedCompany?.id || "",
    isActive: true,
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Warehouse, zone, shelf, bin options from API
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [shelfOptions, setShelfOptions] = useState([]);
  const [binOptions, setBinOptions] = useState([]);

  // Loading states for dropdowns
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingShelves, setLoadingShelves] = useState(false);
  const [loadingBins, setLoadingBins] = useState(false);

  // Category options
  const [categoryOptions, setCategoryOptions] = useState([
    "Electronics",
    "Furniture",
    "Office Supplies",
    "Clothing",
    "Food & Beverage",
    "Other",
  ]);

  // Initialize form data when editing or viewing
  useEffect(() => {
    if (initialData && (mode === "edit" || mode === "view")) {
      setFormData({
        ...initialData,
        location: {
          warehouseId: initialData.location?.warehouseId || "",
          zoneId: initialData.location?.zoneId || "",
          shelfId: initialData.location?.shelfId || "",
          binId: initialData.location?.binId || "",
        },
        price: {
          cost: initialData.price?.cost || 0,
          retail: initialData.price?.retail || 0,
        },
      });
    }

    // Fetch warehouses when component mounts
    fetchWarehouses();
  }, [initialData, mode]);

  // Fetch warehouses
  const fetchWarehouses = async () => {
    try {
      setLoadingWarehouses(true);
      const response = await warehouseAPI.getSimplifiedWarehouses(true); // Only active warehouses
      if (response?.data && Array.isArray(response?.data)) {
        setWarehouseOptions(response?.data);
      } else {
        setWarehouseOptions([]);
        console.error("Invalid warehouse data format", response);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      toast.error("Failed to load warehouses");
      setWarehouseOptions([]);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  // Fetch zones based on selected warehouse
  const fetchZones = async (warehouseId) => {
    if (!warehouseId) {
      setZoneOptions([]);
      return;
    }

    try {
      setLoadingZones(true);
      const response = await zoneAPI.getSimplifiedZones(warehouseId, true); // Only active zones
      console.log("response", response);
      if (response?.data && Array.isArray(response?.data)) {
        setZoneOptions(response?.data);
      } else {
        setZoneOptions([]);
        console.error("Invalid zone data format", response);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
      toast.error("Failed to load zones");
      setZoneOptions([]);
    } finally {
      setLoadingZones(false);
    }
  };

  // Fetch shelves based on selected zone
  const fetchShelves = async (zoneId, warehouseId) => {
    if (!zoneId) {
      setShelfOptions([]);
      return;
    }

    try {
      setLoadingShelves(true);
      const response = await shelfAPI.getSimplifiedShelves(
        zoneId,
        warehouseId,
        true
      ); // Only active shelves
      if (response?.data && Array.isArray(response?.data)) {
        setShelfOptions(response?.data);
      } else {
        setShelfOptions([]);
        console.error("Invalid shelf data format", response);
      }
    } catch (error) {
      console.error("Error fetching shelves:", error);
      toast.error("Failed to load shelves");
      setShelfOptions([]);
    } finally {
      setLoadingShelves(false);
    }
  };

  // Fetch bins based on selected shelf
  const fetchBins = async (shelfId, zoneId, warehouseId) => {
    if (!shelfId) {
      setBinOptions([]);
      return;
    }

    try {
      setLoadingBins(true);
      const response = await binAPI.getSimplifiedBins(
        shelfId,
        zoneId,
        warehouseId,
        true
      ); // Only active bins
      if (response?.data && Array.isArray(response?.data)) {
        setBinOptions(response?.data);
      } else {
        setBinOptions([]);
        console.error("Invalid bin data format", response);
      }
    } catch (error) {
      console.error("Error fetching bins:", error);
      toast.error("Failed to load bins");
      setBinOptions([]);
    } finally {
      setLoadingBins(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested objects (location, price)
    if (name.includes(".")) {
      const [parent, child] = name.split(".");

      // Special handling for location dropdowns to implement cascading selection
      if (parent === "location") {
        // Create updated location object
        const updatedLocation = {
          ...formData.location,
          [child]: value,
        };

        // Reset dependent fields when parent field changes
        if (child === "warehouseId") {
          updatedLocation.zoneId = "";
          updatedLocation.shelfId = "";
          updatedLocation.binId = "";

          // Fetch zones for the selected warehouse
          if (value) {
            fetchZones(value);
          } else {
            setZoneOptions([]);
            setShelfOptions([]);
            setBinOptions([]);
          }
        } else if (child === "zoneId") {
          updatedLocation.shelfId = "";
          updatedLocation.binId = "";

          // Fetch shelves for the selected zone
          if (value) {
            fetchShelves(value, updatedLocation.warehouseId);
          } else {
            setShelfOptions([]);
            setBinOptions([]);
          }
        } else if (child === "shelfId") {
          updatedLocation.binId = "";

          // Fetch bins for the selected shelf
          if (value) {
            fetchBins(
              value,
              updatedLocation.zoneId,
              updatedLocation.warehouseId
            );
          } else {
            setBinOptions([]);
          }
        }

        setFormData({
          ...formData,
          location: updatedLocation,
        });
      } else {
        // Handle other nested objects normally
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: value,
          },
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields from schema
    if (!formData.name) newErrors.name = "Item name is required";
    if (!formData.sku) newErrors.sku = "SKU is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.quantity < 0)
      newErrors.quantity = "Quantity cannot be negative";

    // Location is now optional - removed the bin requirement

    // Additional validation
    if (formData.price.cost < 0)
      newErrors["price.cost"] = "Cost cannot be negative";
    if (formData.price.retail < 0)
      newErrors["price.retail"] = "Retail price cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === "view") {
      onClose();
      return;
    }

    const isValid = validateForm();

    if (isValid) {
      setIsSubmitting(true);

      // Log form data to console as requested
      console.log("Form Data:", formData);

      // Call onSubmit callback with form data
      if (onSubmit) {
        onSubmit(formData);
      }
      setIsSubmitting(false);
      onClose();
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  // Modal title based on mode and inventory type
  const getModalTitle = () => {
    const action = mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View";
    const type =
      inventoryType === "purchase"
        ? "Purchase"
        : inventoryType === "pending_sale"
        ? "Pending Sale"
        : "Sale";
    return `${action} ${type} Inventory Item`;
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {getModalTitle()}
                </h3>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Basic Information */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Basic Information
                      </h3>
                      <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Field
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {/* Item Name */}
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Item Name
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <input
                                  type="text"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                                {errors.name && (
                                  <p className="mt-1 text-sm text-red-500">
                                    {errors.name}
                                  </p>
                                )}
                              </td>
                            </tr>

                            {/* SKU */}
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                SKU*
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <input
                                  type="text"
                                  name="sku"
                                  value={formData.sku}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                                {errors.sku && (
                                  <p className="mt-1 text-sm text-red-500">
                                    {errors.sku}
                                  </p>
                                )}
                              </td>
                            </tr>

                            {/* Tag ID */}
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Tag ID
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <input
                                  type="text"
                                  name="tagId"
                                  value={formData.tagId}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                              </td>
                            </tr>

                            {/* Category */}
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Category*
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <select
                                  name="category"
                                  value={formData.category}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                  <option value="">Select a category</option>
                                  {categoryOptions.map((category) => (
                                    <option key={category} value={category}>
                                      {category}
                                    </option>
                                  ))}
                                </select>
                                {errors.category && (
                                  <p className="mt-1 text-sm text-red-500">
                                    {errors.category}
                                  </p>
                                )}
                              </td>
                            </tr>

                            {/* Description */}
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Description
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <textarea
                                  name="description"
                                  rows="3"
                                  value={formData.description}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                ></textarea>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Inventory Details */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Inventory Details
                      </h3>
                      <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Field
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {/* SKU */}
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                SKU*
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <input
                                  type="text"
                                  id="sku"
                                  name="sku"
                                  value={formData.sku}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                  className={`form-input w-full ${
                                    errors.sku ? "border-red-500" : ""
                                  }`}
                                />
                                {errors.sku && (
                                  <p className="mt-1 text-sm text-red-500">
                                    {errors.sku}
                                  </p>
                                )}
                              </td>
                            </tr>

                            {/* Tag ID */}
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Tag ID
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <input
                                  type="text"
                                  id="tagId"
                                  name="tagId"
                                  value={formData.tagId}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                  className="form-input w-full"
                                />
                              </td>
                            </tr>
                            {/* Category */}
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Category*
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <select
                                  id="category"
                                  name="category"
                                  value={formData.category}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                  className={`form-select w-full ${
                                    errors.category ? "border-red-500" : ""
                                  }`}
                                >
                                  <option value="">Select a category</option>
                                  {categoryOptions.map((category) => (
                                    <option key={category} value={category}>
                                      {category}
                                    </option>
                                  ))}
                                </select>
                                {errors.category && (
                                  <p className="mt-1 text-sm text-red-500">
                                    {errors.category}
                                  </p>
                                )}
                              </td>
                            </tr>
                            {/* Description */}
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Description
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <textarea
                                  id="description"
                                  name="description"
                                  rows="3"
                                  value={formData.description}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                  className="form-textarea w-full"
                                ></textarea>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        {/* Location Information */}
                        <div className="mb-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Location Information (Optional)
                          </h3>
                          <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Field
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Value
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {/* Warehouse */}
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Warehouse
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <select
                                      name="location.warehouseId"
                                      value={formData.location.warehouseId}
                                      onChange={handleInputChange}
                                      disabled={mode === "view"}
                                      className={`form-select w-full ${
                                        errors["location.warehouseId"]
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      } ${
                                        mode === "view" ? "bg-gray-100" : ""
                                      }`}
                                    >
                                      <option value="">
                                        Select a warehouse
                                      </option>
                                      {warehouseOptions.map((warehouse) => (
                                        <option
                                          key={warehouse.id}
                                          value={warehouse.id}
                                        >
                                          {warehouse.name}
                                        </option>
                                      ))}
                                    </select>
                                    {errors["location.warehouseId"] && (
                                      <p className="mt-1 text-sm text-red-500">
                                        {errors["location.warehouseId"]}
                                      </p>
                                    )}
                                  </td>
                                </tr>

                                {/* Zone */}
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Zone
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <select
                                      name="location.zoneId"
                                      value={formData.location.zoneId}
                                      onChange={handleInputChange}
                                      disabled={
                                        mode === "view" ||
                                        !formData.location.warehouseId
                                      }
                                      className={`form-select w-full ${
                                        errors["location.zoneId"]
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      } ${
                                        mode === "view" ||
                                        !formData.location.warehouseId
                                          ? "bg-gray-100"
                                          : ""
                                      }`}
                                    >
                                      <option value="">Select a zone</option>
                                      {zoneOptions.map((zone) => (
                                        <option key={zone.id} value={zone.id}>
                                          {zone.name}
                                        </option>
                                      ))}
                                    </select>
                                    {errors["location.zoneId"] && (
                                      <p className="mt-1 text-sm text-red-500">
                                        {errors["location.zoneId"]}
                                      </p>
                                    )}
                                  </td>
                                </tr>

                                {/* Shelf */}
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Shelf
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <select
                                      name="location.shelfId"
                                      value={formData.location.shelfId}
                                      onChange={handleInputChange}
                                      disabled={
                                        mode === "view" ||
                                        !formData.location.zoneId
                                      }
                                      className={`form-select w-full ${
                                        errors["location.shelfId"]
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      } ${
                                        mode === "view" ||
                                        !formData.location.zoneId
                                          ? "bg-gray-100"
                                          : ""
                                      }`}
                                    >
                                      <option value="">Select a shelf</option>
                                      {shelfOptions.map((shelf) => (
                                        <option key={shelf.id} value={shelf.id}>
                                          {shelf.name}
                                        </option>
                                      ))}
                                    </select>
                                    {errors["location.shelfId"] && (
                                      <p className="mt-1 text-sm text-red-500">
                                        {errors["location.shelfId"]}
                                      </p>
                                    )}
                                  </td>
                                </tr>

                                {/* Bin */}
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Bin
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <select
                                      name="location.binId"
                                      value={formData.location.binId}
                                      onChange={handleInputChange}
                                      disabled={
                                        mode === "view" ||
                                        !formData.location.shelfId
                                      }
                                      className={`form-select w-full ${
                                        errors["location.binId"]
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      } ${
                                        mode === "view" ||
                                        !formData.location.shelfId
                                          ? "bg-gray-100"
                                          : ""
                                      }`}
                                    >
                                      <option value="">Select a bin</option>
                                      {binOptions.map((bin) => (
                                        <option key={bin.id} value={bin.id}>
                                          {bin.name}
                                        </option>
                                      ))}
                                    </select>
                                    {errors["location.binId"] && (
                                      <p className="mt-1 text-sm text-red-500">
                                        {errors["location.binId"]}
                                      </p>
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Pricing Information */}
                        <div className="mb-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Pricing Information
                          </h3>
                          <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Field
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Value
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {/* Cost Price */}
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Cost Price
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <input
                                      type="number"
                                      name="price.cost"
                                      value={formData.price.cost}
                                      onChange={handleInputChange}
                                      disabled={mode === "view"}
                                      className={`form-input w-full ${
                                        errors["price.cost"]
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      } ${
                                        mode === "view" ? "bg-gray-100" : ""
                                      }`}
                                    />
                                    {errors["price.cost"] && (
                                      <p className="mt-1 text-sm text-red-500">
                                        {errors["price.cost"]}
                                      </p>
                                    )}
                                  </td>
                                </tr>

                                {/* Retail Price */}
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Retail Price
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <input
                                      type="number"
                                      name="price.retail"
                                      value={formData.price.retail}
                                      onChange={handleInputChange}
                                      disabled={mode === "view"}
                                      className={`form-input w-full ${
                                        errors["price.retail"]
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      } ${
                                        mode === "view" ? "bg-gray-100" : ""
                                      }`}
                                    />
                                    {errors["price.retail"] && (
                                      <p className="mt-1 text-sm text-red-500">
                                        {errors["price.retail"]}
                                      </p>
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Remove duplicate pricing section */}

                        {/* Inventory Details */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                          <h4 className="text-md font-medium text-gray-700 mb-2 mt-4">
                            Inventory Details
                          </h4>
                          <div className="border-b border-gray-200 mb-4"></div>
                        </div>

                        {/* Quantity */}
                        <div className="mb-4">
                          <label
                            htmlFor="quantity"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Quantity*
                          </label>
                          <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            disabled={mode === "view"}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors.quantity
                                ? "border-red-500"
                                : "border-gray-300"
                            } ${mode === "view" ? "bg-gray-100" : ""}`}
                          />
                          {errors.quantity && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.quantity}
                            </p>
                          )}
                        </div>

                        {/* Threshold */}
                        <div className="mb-4">
                          <label
                            htmlFor="threshold"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Threshold
                          </label>
                          <input
                            type="number"
                            id="threshold"
                            name="threshold"
                            value={formData.threshold}
                            onChange={handleInputChange}
                            disabled={mode === "view"}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors.threshold
                                ? "border-red-500"
                                : "border-gray-300"
                            } ${mode === "view" ? "bg-gray-100" : ""}`}
                          />
                        </div>

                        {/* Status */}
                        <div className="mb-4">
                          <label
                            htmlFor="status"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Status
                          </label>
                          <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            disabled={mode === "view"}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors.status
                                ? "border-red-500"
                                : "border-gray-300"
                            } ${mode === "view" ? "bg-gray-100" : ""}`}
                          >
                            <option value="Available">Available</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                            <option value="Discontinued">Discontinued</option>
                          </select>
                        </div>

                        {/* Inventory Status */}
                        <div className="mb-4">
                          <label
                            htmlFor="inventoryStatus"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Inventory Status
                          </label>
                          <select
                            id="inventoryStatus"
                            name="inventoryStatus"
                            value={formData.inventoryStatus}
                            onChange={handleInputChange}
                            disabled={mode === "view"}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors.inventoryStatus
                                ? "border-red-500"
                                : "border-gray-300"
                            } ${mode === "view" ? "bg-gray-100" : ""}`}
                          >
                            <option value="purchase">Purchase</option>
                            <option value="sale_pending">Sale Pending</option>
                            <option value="sale">Sale</option>
                          </select>
                        </div>

                        {/* Location */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                          <h4 className="text-md font-medium text-gray-700 mb-2 mt-4">
                            Location
                          </h4>
                          <div className="border-b border-gray-200 mb-4"></div>
                        </div>

                        {/* Warehouse */}
                        <div className="mb-4">
                          <label
                            htmlFor="location.warehouseId"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Warehouse
                          </label>
                          <select
                            id="location.warehouseId"
                            name="location.warehouseId"
                            value={formData.location.warehouseId}
                            onChange={handleInputChange}
                            disabled={mode === "view" || loadingWarehouses}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors["location.warehouseId"]
                                ? "border-red-500"
                                : "border-gray-300"
                            } ${mode === "view" ? "bg-gray-100" : ""}`}
                          >
                            <option value="">
                              {loadingWarehouses
                                ? "Loading warehouses..."
                                : "Select Warehouse"}
                            </option>
                            {warehouseOptions.map((warehouse) => (
                              <option key={warehouse._id} value={warehouse._id}>
                                {warehouse.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Zone */}
                        <div className="mb-4">
                          <label
                            htmlFor="location.zoneId"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Zone
                          </label>
                          <select
                            id="location.zoneId"
                            name="location.zoneId"
                            value={formData.location.zoneId}
                            onChange={handleInputChange}
                            disabled={
                              mode === "view" ||
                              loadingZones ||
                              !formData.location.warehouseId
                            }
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors["location.zoneId"]
                                ? "border-red-500"
                                : "border-gray-300"
                            } ${mode === "view" ? "bg-gray-100" : ""}`}
                          >
                            <option value="">
                              {!formData.location.warehouseId
                                ? "Select warehouse first"
                                : loadingZones
                                ? "Loading zones..."
                                : "Select Zone"}
                            </option>
                            {zoneOptions.map((zone) => (
                              <option key={zone._id} value={zone._id}>
                                {zone.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Shelf */}
                        <div className="mb-4">
                          <label
                            htmlFor="location.shelfId"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Shelf
                          </label>
                          <select
                            id="location.shelfId"
                            name="location.shelfId"
                            value={formData.location.shelfId}
                            onChange={handleInputChange}
                            disabled={
                              mode === "view" ||
                              loadingShelves ||
                              !formData.location.zoneId
                            }
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors["location.shelfId"]
                                ? "border-red-500"
                                : "border-gray-300"
                            } ${mode === "view" ? "bg-gray-100" : ""}`}
                          >
                            <option value="">
                              {!formData.location.zoneId
                                ? "Select zone first"
                                : loadingShelves
                                ? "Loading shelves..."
                                : "Select Shelf"}
                            </option>
                            {shelfOptions.map((shelf) => (
                              <option key={shelf._id} value={shelf._id}>
                                {shelf.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Bin */}
                        <div className="mb-4">
                          <label
                            htmlFor="location.binId"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Bin
                          </label>
                          <select
                            id="location.binId"
                            name="location.binId"
                            value={formData.location.binId}
                            onChange={handleInputChange}
                            disabled={
                              mode === "view" ||
                              loadingBins ||
                              !formData.location.shelfId
                            }
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors["location.binId"]
                                ? "border-red-500"
                                : "border-gray-300"
                            } ${mode === "view" ? "bg-gray-100" : ""}`}
                          >
                            <option value="">
                              {!formData.location.shelfId
                                ? "Select shelf first"
                                : loadingBins
                                ? "Loading bins..."
                                : "Select Bin"}
                            </option>
                            {binOptions.map((bin) => (
                              <option key={bin._id} value={bin._id}>
                                {bin.name}
                              </option>
                            ))}
                          </select>
                          {/* {errors["location.binId"] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors["location.binId"]}
                        </p>
                      )} */}
                        </div>

                        {/* Pricing */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                          <h4 className="text-md font-medium text-gray-700 mb-2 mt-4">
                            Pricing
                          </h4>
                          <div className="border-b border-gray-200 mb-4"></div>
                        </div>

                        {/* Cost Price */}
                        <div className="mb-4">
                          <label
                            htmlFor="price.cost"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Cost Price
                          </label>
                          <input
                            type="number"
                            id="price.cost"
                            name="price.cost"
                            value={formData.price.cost}
                            onChange={handleInputChange}
                            disabled={mode === "view"}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors["price.cost"]
                                ? "border-red-500"
                                : "border-gray-300"
                            } ${mode === "view" ? "bg-gray-100" : ""}`}
                            step="0.01"
                          />
                          {errors["price.cost"] && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors["price.cost"]}
                            </p>
                          )}
                        </div>

                        {/* Retail Price */}
                        <div className="mb-4">
                          <label
                            htmlFor="price.retail"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Retail Price
                          </label>
                          <input
                            type="number"
                            id="price.retail"
                            name="price.retail"
                            value={formData.price.retail}
                            onChange={handleInputChange}
                            disabled={mode === "view"}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors["price.retail"]
                                ? "border-red-500"
                                : "border-gray-300"
                            } ${mode === "view" ? "bg-gray-100" : ""}`}
                            step="0.01"
                          />
                          {errors["price.retail"] && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors["price.retail"]}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="mt-8 flex justify-end space-x-3">
                        <button
                          type="button"
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                          onClick={onClose}
                        >
                          Cancel
                        </button>

                        {mode !== "view" && (
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            disabled={isSubmitting}
                          >
                            {isSubmitting
                              ? "Saving..."
                              : mode === "add"
                              ? "Add Item"
                              : "Update Item"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;
