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

  // Accordion state for form sections
  const [openSections, setOpenSections] = useState({
    basicInfo: true,
    inventoryDetails: false,
    locationInfo: false,
    pricingInfo: false,
    statusInfo: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
                  <div className="space-y-6">
                    {/* Basic Information Accordion */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection("basicInfo")}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
                      >
                        <h4 className="text-md font-medium text-gray-900">
                        Basic Information
                        </h4>
                        <svg
                          className={`w-5 h-5 text-gray-500 transform transition-transform ${
                            openSections.basicInfo ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {openSections.basicInfo && (
                        <div className="border-t border-gray-200">
                          <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                  FIELD
                              </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  VALUE
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {/* Item Name */}
                            <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                Item Name
                              </td>
                                <td className="px-4 py-3">
                                <input
                                  type="text"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                  SKU <span className="text-red-500">*</span>
                              </td>
                                <td className="px-4 py-3">
                                <input
                                  type="text"
                                  name="sku"
                                  value={formData.sku}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                Tag ID
                              </td>
                                <td className="px-4 py-3">
                                <input
                                  type="text"
                                  name="tagId"
                                  value={formData.tagId}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                            </tr>

                            {/* Category */}
                            <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                  Category{" "}
                                  <span className="text-red-500">*</span>
                              </td>
                                <td className="px-4 py-3">
                                <select
                                  name="category"
                                  value={formData.category}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                Description
                              </td>
                                <td className="px-4 py-3">
                                <textarea
                                  name="description"
                                  rows="3"
                                  value={formData.description}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                                  />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      )}
                    </div>

                    {/* Inventory Details Accordion */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection("inventoryDetails")}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
                      >
                        <h4 className="text-md font-medium text-gray-900">
                        Inventory Details
                        </h4>
                        <svg
                          className={`w-5 h-5 text-gray-500 transform transition-transform ${
                            openSections.inventoryDetails ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {openSections.inventoryDetails && (
                        <div className="border-t border-gray-200">
                          <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                  FIELD
                              </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  VALUE
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                              {/* Quantity */}
                            <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                  Quantity{" "}
                                  <span className="text-red-500">*</span>
                              </td>
                                <td className="px-4 py-3">
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                                  {errors.quantity && (
                                  <p className="mt-1 text-sm text-red-500">
                                      {errors.quantity}
                                  </p>
                                )}
                              </td>
                            </tr>

                              {/* Threshold */}
                            <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                  Threshold
                              </td>
                                <td className="px-4 py-3">
                                <input
                                    type="number"
                                    name="threshold"
                                    value={formData.threshold}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                              </td>
                            </tr>

                              {/* Status */}
                            <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                  Status
                              </td>
                                <td className="px-4 py-3">
                                <select
                                    name="status"
                                    value={formData.status}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="Available">Available</option>
                                    <option value="Out of Stock">
                                      Out of Stock
                                    </option>
                                    <option value="Low Stock">Low Stock</option>
                                    <option value="Discontinued">
                                      Discontinued
                                    </option>
                                </select>
                              </td>
                            </tr>

                              {/* Inventory Status */}
                            <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                  Inventory Status
                              </td>
                                <td className="px-4 py-3">
                                  <select
                                    name="inventoryStatus"
                                    value={formData.inventoryStatus}
                                  onChange={handleInputChange}
                                  disabled={mode === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="purchase">Purchase</option>
                                    <option value="sale_pending">
                                      Sale Pending
                                    </option>
                                    <option value="sale">Sale</option>
                                  </select>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        </div>
                      )}
                    </div>

                    {/* Location Information Accordion */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection("locationInfo")}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
                      >
                        <h4 className="text-md font-medium text-gray-900">
                            Location Information (Optional)
                        </h4>
                        <svg
                          className={`w-5 h-5 text-gray-500 transform transition-transform ${
                            openSections.locationInfo ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {openSections.locationInfo && (
                        <div className="border-t border-gray-200">
                          <table className="min-w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                  FIELD
                                  </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  VALUE
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {/* Warehouse */}
                                <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                    Warehouse
                                  </td>
                                <td className="px-4 py-3">
                                    <select
                                      name="location.warehouseId"
                                      value={formData.location.warehouseId}
                                      onChange={handleInputChange}
                                      disabled={mode === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">Select a warehouse</option>
                                      {warehouseOptions.map((warehouse) => (
                                        <option
                                          key={warehouse._id}
                                          value={warehouse._id}
                                        >
                                          {warehouse.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>

                                {/* Zone */}
                                <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                    Zone
                                  </td>
                                <td className="px-4 py-3">
                                    <select
                                      name="location.zoneId"
                                      value={formData.location.zoneId}
                                      onChange={handleInputChange}
                                    disabled={mode === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="">Select a zone</option>
                                      {zoneOptions.map((zone) => (
                                        <option key={zone._id} value={zone._id}>
                                          {zone.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>

                                {/* Shelf */}
                                <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                    Shelf
                                  </td>
                                <td className="px-4 py-3">
                                    <select
                                      name="location.shelfId"
                                      value={formData.location.shelfId}
                                      onChange={handleInputChange}
                                    disabled={mode === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="">Select a shelf</option>
                                      {shelfOptions.map((shelf) => (
                                      <option key={shelf._id} value={shelf._id}>
                                          {shelf.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>

                                {/* Bin */}
                                <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                    Bin
                                  </td>
                                <td className="px-4 py-3">
                                    <select
                                      name="location.binId"
                                      value={formData.location.binId}
                                      onChange={handleInputChange}
                                    disabled={mode === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="">Select a bin</option>
                                      {binOptions.map((bin) => (
                                        <option key={bin._id} value={bin._id}>
                                          {bin.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                      )}
                        </div>

                    {/* Pricing Information Accordion */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection("pricingInfo")}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
                      >
                        <h4 className="text-md font-medium text-gray-900">
                            Pricing Information
                        </h4>
                        <svg
                          className={`w-5 h-5 text-gray-500 transform transition-transform ${
                            openSections.pricingInfo ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {openSections.pricingInfo && (
                        <div className="border-t border-gray-200">
                          <table className="min-w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                  FIELD
                                  </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  VALUE
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {/* Cost Price */}
                                <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                    Cost Price
                                  </td>
                                <td className="px-4 py-3">
                                    <input
                                      type="number"
                                      name="price.cost"
                                      value={formData.price.cost}
                                      onChange={handleInputChange}
                                      disabled={mode === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    step="0.01"
                                  />
                                  </td>
                                </tr>

                                {/* Retail Price */}
                                <tr>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                    Retail Price
                                  </td>
                                <td className="px-4 py-3">
                                    <input
                                      type="number"
                                      name="price.retail"
                                      value={formData.price.retail}
                                      onChange={handleInputChange}
                                      disabled={mode === "view"}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    step="0.01"
                                  />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          )}
                        </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <button
                          type="button"
                          onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSubmitting ? "Saving..." : "Save Item"}
                          </button>
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
