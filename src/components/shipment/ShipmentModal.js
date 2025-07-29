import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import warehouseAPI from "../../utils/api/warehouseAPI";
import shipmentAPI from "../../utils/api/shipmentAPI";
import inventoryAPI from "../../utils/api/inventoryAPI";

const ShipmentModal = ({
  isOpen,
  onClose,
  mode = "add", // add, edit, view
  initialData = null,
  onSubmit,
  customTitle,
  theme = "default",
  showCompanySelector = false,
  showAdvancedOptions = false,
  allowDocumentUpload = false,
}) => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  // Form state
  const [formData, setFormData] = useState({
    shipmentNumber: "",
    type: "Incoming",
    status: "Pending",
    source: {
      name: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      contactPerson: {
        name: "",
        email: "",
        phone: "",
      },
    },
    destination: {
      name: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      contactPerson: {
        name: "",
        email: "",
        phone: "",
      },
    },
    items: [],
    documents: [],
    expectedDate: "",
    actualDate: "",
    carrier: {
      name: "",
      trackingNumber: "",
      trackingUrl: "",
    },
    notes: "",
    totalValue: 0,
    warehouseId: "",
    companyId: selectedCompany?.id || "",
    createdBy: user?.id || "",
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options for dropdowns
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [inventoryOptions, setInventoryOptions] = useState([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);

  // Status and type options
  const shipmentTypeOptions = ["Incoming", "Outgoing"];
  const shipmentStatusOptions = [
    "Pending",
    "In Transit",
    "Delivered",
    "Delayed",
    "Cancelled",
  ];
  const documentTypeOptions = [
    "Invoice",
    "Delivery Note",
    "Packing Slip",
    "Other",
  ];

  // Get modal title based on mode or custom title
  const getModalTitle = () => {
    if (customTitle) {
      return customTitle;
    }

    switch (mode) {
      case "add":
        return "Create New Shipment";
      case "edit":
        return "Edit Shipment";
      case "view":
        return "View Shipment Details";
      default:
        return "Shipment";
    }
  };

  // Get theme-specific styles
  const getThemeStyles = () => {
    switch (theme) {
      case "management":
        return {
          headerClass: "bg-blue-700 text-white px-4 py-2 rounded-t-lg",
          buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
          sectionClass: "border-blue-200 bg-blue-50",
        };
      default:
        return {
          headerClass: "text-gray-900 mb-4",
          buttonClass: "bg-indigo-600 hover:bg-indigo-700 text-white",
          sectionClass: "bg-white",
        };
    }
  };

  const themeStyles = getThemeStyles();

  // State for document upload
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle document file selection
  const handleFileSelect = (e) => {
    if (!allowDocumentUpload || mode === "view") return;

    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Simulate file upload process
    setUploadProgress(0);
    const uploadTimer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadTimer);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // After "upload" completes, add files to documents list
    setTimeout(() => {
      const newDocs = files.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.split("/")[1].toUpperCase(),
        size: Math.round(file.size / 1024) + " KB",
        file: file,
      }));

      setDocuments((prev) => [...prev, ...newDocs]);
      clearInterval(uploadTimer);
      setUploadProgress(0);

      // In a real implementation, you would upload to server here
      toast.success(`${files.length} document(s) uploaded successfully`);
    }, 3000);
  };

  // Initialize form data when editing or viewing
  useEffect(() => {
    if (initialData && (mode === "edit" || mode === "view")) {
      setFormData({
        ...initialData,
        expectedDate: initialData.expectedDate
          ? new Date(initialData.expectedDate).toISOString().split("T")[0]
          : "",
        actualDate: initialData.actualDate
          ? new Date(initialData.actualDate).toISOString().split("T")[0]
          : "",
      });
    }

    // Generate shipment number for new shipments
    if (mode === "add" && !formData.shipmentNumber) {
      generateShipmentNumber();
    }

    // Fetch warehouses and inventory when component mounts
    fetchWarehouses();
    fetchInventory();
  }, [initialData, mode]);

  // Generate a unique shipment number
  const generateShipmentNumber = () => {
    const prefix = formData.type === "Incoming" ? "IN" : "OUT";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const shipmentNumber = `${prefix}-${timestamp}-${random}`;

    setFormData({
      ...formData,
      shipmentNumber,
    });
  };

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

  // Fetch inventory items
  const fetchInventory = async () => {
    try {
      setLoadingInventory(true);
      const response = await inventoryAPI.getInventory();
      if (response?.data && Array.isArray(response?.data)) {
        setInventoryOptions(response?.data);
      } else {
        setInventoryOptions([]);
        console.error("Invalid inventory data format", response);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to load inventory items");
      setInventoryOptions([]);
    } finally {
      setLoadingInventory(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested objects (source, destination, carrier)
    if (name.includes(".")) {
      const parts = name.split(".");

      if (parts.length === 2) {
        // Two-level nesting (e.g., carrier.name)
        const [parent, child] = parts;
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: value,
          },
        });
      } else if (parts.length === 3) {
        // Three-level nesting (e.g., source.address.street)
        const [parent, middle, child] = parts;
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [middle]: {
              ...formData[parent][middle],
              [child]: value,
            },
          },
        });
      }
    } else {
      // Handle type change to update shipment number prefix
      if (name === "type" && mode === "add") {
        generateShipmentNumber();
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle adding an item to the shipment
  const handleAddItem = () => {
    const newItem = {
      itemId: "",
      quantity: 1,
      price: 0,
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
  };

  // Handle removing an item from the shipment
  const handleRemoveItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);

    setFormData({
      ...formData,
      items: updatedItems,
    });

    // Recalculate total value
    calculateTotalValue(updatedItems);
  };

  // Handle item field changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    // If itemId changed, update the price from inventory
    if (field === "itemId") {
      const selectedItem = inventoryOptions.find((item) => item.id === value);
      if (selectedItem) {
        updatedItems[index].price = selectedItem.price?.retail || 0;
      }
    }

    setFormData({
      ...formData,
      items: updatedItems,
    });

    // Recalculate total value
    calculateTotalValue(updatedItems);
  };

  // Calculate total value of shipment
  const calculateTotalValue = (items = formData.items) => {
    const total = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    setFormData((prevData) => ({
      ...prevData,
      totalValue: total,
    }));
  }; // Handle document upload
  const handleAddDocument = () => {
    const newDocument = {
      type: "Invoice",
      url: "",
      fileName: "",
    };

    setFormData({
      ...formData,
      documents: [...formData.documents, newDocument],
    });
  };

  // Handle document removal
  const handleRemoveDocument = (index) => {
    const updatedDocuments = [...formData.documents];
    updatedDocuments.splice(index, 1);

    setFormData({
      ...formData,
      documents: updatedDocuments,
    });
  };

  // Handle document field changes
  const handleDocumentChange = (index, field, value) => {
    const updatedDocuments = [...formData.documents];
    updatedDocuments[index][field] = value;

    setFormData({
      ...formData,
      documents: updatedDocuments,
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields from schema
    if (!formData.shipmentNumber)
      newErrors.shipmentNumber = "Shipment number is required";
    if (!formData.type) newErrors.type = "Shipment type is required";
    if (!formData.expectedDate)
      newErrors.expectedDate = "Expected date is required";

    // Source validation
    if (!formData.source.name)
      newErrors["source.name"] = "Source name is required";

    // Destination validation
    if (!formData.destination.name)
      newErrors["destination.name"] = "Destination name is required";

    // Items validation
    if (formData.items.length === 0) {
      newErrors.items = "At least one item is required";
    } else {
      formData.items.forEach((item, index) => {
        if (!item.itemId) {
          newErrors[`items[${index}].itemId`] = "Item selection is required";
        }
        if (item.quantity <= 0) {
          newErrors[`items[${index}].quantity`] =
            "Quantity must be greater than 0";
        }
      });
    }

    // Warehouse validation
    if (!formData.warehouseId) newErrors.warehouseId = "Warehouse is required";

    // Company validation
    if (!formData.companyId) newErrors.companyId = "Company is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "view") {
      onClose();
      return;
    }

    const isValid = validateForm();

    if (isValid) {
      setIsSubmitting(true);

      try {
        // Format dates for API
        const formattedData = {
          ...formData,
          expectedDate: formData.expectedDate
            ? new Date(formData.expectedDate).toISOString()
            : null,
          actualDate: formData.actualDate
            ? new Date(formData.actualDate).toISOString()
            : null,
        };

        // Call API based on mode
        let response;
        if (mode === "add") {
          response = await shipmentAPI.createShipment(formattedData);
        } else if (mode === "edit") {
          response = await shipmentAPI.updateShipment(
            initialData.id,
            formattedData
          );
        }

        // Show success message
        toast.success(
          `Shipment ${mode === "add" ? "created" : "updated"} successfully!`
        );

        // Call onSubmit callback with response data
        if (onSubmit) {
          onSubmit(response);
        }

        onClose();
      } catch (error) {
        console.error(
          `Error ${mode === "add" ? "creating" : "updating"} shipment:`,
          error
        );
        toast.error(
          `Failed to ${mode === "add" ? "create" : "update"} shipment. ${
            error.message || ""
          }`
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  // Modal title is now handled by the getModalTitle function defined earlier
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
        <div
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full ${
            theme === "management" ? "border-2 border-blue-500" : ""
          }`}
        >
          {/* Modal header with theme */}
          <div
            className={`${themeStyles.headerClass} flex justify-between items-center`}
          >
            <h3 className="text-lg leading-6 font-medium">{getModalTitle()}</h3>
            <button
              onClick={onClose}
              className="text-lg font-bold hover:opacity-75"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shipment Details */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-900 mb-3">
                        Shipment Details
                      </h4>
                      <div className="bg-white rounded-lg shadow overflow-hidden p-4">
                        {/* Shipment Number */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Shipment Number
                          </label>
                          <input
                            type="text"
                            name="shipmentNumber"
                            value={formData.shipmentNumber}
                            onChange={handleInputChange}
                            disabled={mode === "view" || mode === "edit"}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                          {errors.shipmentNumber && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.shipmentNumber}
                            </p>
                          )}
                        </div>

                        {/* Type */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            disabled={mode === "view"}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            {shipmentTypeOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          {errors.type && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.type}
                            </p>
                          )}
                        </div>

                        {/* Status */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            disabled={mode === "view"}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            {shipmentStatusOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Warehouse */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Warehouse
                          </label>
                          <select
                            name="warehouseId"
                            value={formData.warehouseId}
                            onChange={handleInputChange}
                            disabled={mode === "view" || loadingWarehouses}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="">Select Warehouse</option>
                            {warehouseOptions.map((warehouse) => (
                              <option key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                              </option>
                            ))}
                          </select>
                          {loadingWarehouses && (
                            <p className="text-sm text-gray-500">
                              Loading warehouses...
                            </p>
                          )}
                          {errors.warehouseId && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.warehouseId}
                            </p>
                          )}
                        </div>

                        {/* Company Selector for super_admin */}
                        {showCompanySelector && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Company
                            </label>
                            <select
                              name="companyId"
                              value={formData.companyId}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            >
                              <option value="">Select Company</option>
                              {/* This would need to be populated with companies from an API */}
                              <option value="1">NextGen Retail Corp</option>
                              <option value="2">Fashion Forward Inc</option>
                              <option value="3">Tech Gadgets Ltd</option>
                              <option value="4">Home Essentials Co</option>
                              <option value="5">Sports Unlimited</option>
                            </select>
                            {errors.companyId && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.companyId}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Expected Date */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expected Date
                          </label>
                          <input
                            type="date"
                            name="expectedDate"
                            value={formData.expectedDate}
                            onChange={handleInputChange}
                            disabled={mode === "view"}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                          {errors.expectedDate && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.expectedDate}
                            </p>
                          )}
                        </div>

                        {/* Actual Date */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Actual Date
                          </label>
                          <input
                            type="date"
                            name="actualDate"
                            value={formData.actualDate}
                            onChange={handleInputChange}
                            disabled={mode === "view"}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>

                        {/* Type */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            disabled={mode === "view"}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            {shipmentTypeOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          {errors.type && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.type}
                            </p>
                          )}
                        </div>

                        {/* Status */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            disabled={mode === "view"}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            {shipmentStatusOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Warehouse */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Warehouse
                          </label>
                          <select
                            name="warehouseId"
                            value={formData.warehouseId}
                            onChange={handleInputChange}
                            disabled={mode === "view" || loadingWarehouses}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="">Select Warehouse</option>
                            {warehouseOptions.map((warehouse) => (
                              <option key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                              </option>
                            ))}
                          </select>
                          {loadingWarehouses && (
                            <p className="text-sm text-gray-500">
                              Loading warehouses...
                            </p>
                          )}
                          {errors.warehouseId && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.warehouseId}
                            </p>
                          )}
                        </div>

                        {/* Company Selector for super_admin */}
                        {showCompanySelector && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Company
                            </label>
                            <select
                              name="companyId"
                              value={formData.companyId}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            >
                              <option value="">Select Company</option>
                              {/* This would need to be populated with companies from an API */}
                              <option value="1">NextGen Retail Corp</option>
                              <option value="2">Fashion Forward Inc</option>
                              <option value="3">Tech Gadgets Ltd</option>
                              <option value="4">Home Essentials Co</option>
                              <option value="5">Sports Unlimited</option>
                            </select>
                            {errors.companyId && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.companyId}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Expected Date */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expected Date
                          </label>
                          <input
                            type="date"
                            name="expectedDate"
                            value={formData.expectedDate}
                            onChange={handleInputChange}
                            disabled={mode === "view"}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                          {errors.expectedDate && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.expectedDate}
                            </p>
                          )}
                        </div>

                        {/* Actual Date */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Actual Date
                          </label>
                          <input
                            type="date"
                            name="actualDate"
                            value={formData.actualDate}
                            onChange={handleInputChange}
                            disabled={mode === "view"}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>

                        {/* Notes */}
                        <div className="col-span-2 mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                          </label>
                          <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            disabled={mode === "view"}
                            rows="3"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          ></textarea>
                        </div>

                        {/* Advanced Options Section */}
                        {showAdvancedOptions && (
                          <div className="col-span-2 mb-4">
                            <div
                              className={`p-4 rounded-lg ${themeStyles.sectionClass}`}
                            >
                              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                                <span className="mr-2">Advanced Options</span>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                                  Management
                                </span>
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Priority Level */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priority Level
                                  </label>
                                  <select
                                    name="priorityLevel"
                                    value={formData.priorityLevel || "normal"}
                                    onChange={handleInputChange}
                                    disabled={mode === "view"}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  >
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                  </select>
                                </div>

                                {/* Special Handling Instructions */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Special Handling
                                  </label>
                                  <input
                                    type="text"
                                    name="specialHandling"
                                    value={formData.specialHandling || ""}
                                    onChange={handleInputChange}
                                    disabled={mode === "view"}
                                    placeholder="E.g., Fragile, Temperature controlled"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Carrier Information */}
                      <div className="mb-6">
                        <h4 className="text-md font-medium text-gray-900 mb-3">
                          Carrier Information
                        </h4>
                        <div className="bg-white rounded-lg shadow overflow-hidden p-4">
                          {/* Carrier Name */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Carrier Name
                            </label>
                            <input
                              type="text"
                              name="carrier.name"
                              value={formData.carrier.name}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>

                          {/* Tracking Number */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tracking Number
                            </label>
                            <input
                              type="text"
                              name="carrier.trackingNumber"
                              value={formData.carrier.trackingNumber}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>

                          {/* Tracking URL */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tracking URL
                            </label>
                            <input
                              type="text"
                              name="carrier.trackingUrl"
                              value={formData.carrier.trackingUrl}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Source and Destination */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Source */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">
                          Source
                        </h4>
                        <div className="bg-white rounded-lg shadow overflow-hidden p-4">
                          {/* Source Name */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              name="source.name"
                              value={formData.source.name}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                            {errors["source.name"] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors["source.name"]}
                              </p>
                            )}
                          </div>

                          {/* Source Address */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address
                            </label>
                            <input
                              type="text"
                              name="source.address.street"
                              placeholder="Street"
                              value={formData.source.address.street}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-2"
                            />
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <input
                                type="text"
                                name="source.address.city"
                                placeholder="City"
                                value={formData.source.address.city}
                                onChange={handleInputChange}
                                disabled={mode === "view"}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                              <input
                                type="text"
                                name="source.address.state"
                                placeholder="State"
                                value={formData.source.address.state}
                                onChange={handleInputChange}
                                disabled={mode === "view"}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                name="source.address.zipCode"
                                placeholder="Zip Code"
                                value={formData.source.address.zipCode}
                                onChange={handleInputChange}
                                disabled={mode === "view"}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                              <input
                                type="text"
                                name="source.address.country"
                                placeholder="Country"
                                value={formData.source.address.country}
                                onChange={handleInputChange}
                                disabled={mode === "view"}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>

                          {/* Source Contact Person */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Contact Person
                            </label>
                            <input
                              type="text"
                              name="source.contactPerson.name"
                              placeholder="Name"
                              value={formData.source.contactPerson.name}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-2"
                            />
                            <input
                              type="email"
                              name="source.contactPerson.email"
                              placeholder="Email"
                              value={formData.source.contactPerson.email}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-2"
                            />
                            <input
                              type="tel"
                              name="source.contactPerson.phone"
                              placeholder="Phone"
                              value={formData.source.contactPerson.phone}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Destination */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">
                          Destination
                        </h4>
                        <div className="bg-white rounded-lg shadow overflow-hidden p-4">
                          {/* Destination Name */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              name="destination.name"
                              value={formData.destination.name}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                            {errors["destination.name"] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors["destination.name"]}
                              </p>
                            )}
                          </div>

                          {/* Destination Address */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address
                            </label>
                            <input
                              type="text"
                              name="destination.address.street"
                              placeholder="Street"
                              value={formData.destination.address.street}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-2"
                            />
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <input
                                type="text"
                                name="destination.address.city"
                                placeholder="City"
                                value={formData.destination.address.city}
                                onChange={handleInputChange}
                                disabled={mode === "view"}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                              <input
                                type="text"
                                name="destination.address.state"
                                placeholder="State"
                                value={formData.destination.address.state}
                                onChange={handleInputChange}
                                disabled={mode === "view"}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                name="destination.address.zipCode"
                                placeholder="Zip Code"
                                value={formData.destination.address.zipCode}
                                onChange={handleInputChange}
                                disabled={mode === "view"}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                              <input
                                type="text"
                                name="destination.address.country"
                                placeholder="Country"
                                value={formData.destination.address.country}
                                onChange={handleInputChange}
                                disabled={mode === "view"}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>

                          {/* Destination Contact Person */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Contact Person
                            </label>
                            <input
                              type="text"
                              name="destination.contactPerson.name"
                              placeholder="Name"
                              value={formData.destination.contactPerson.name}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-2"
                            />
                            <input
                              type="email"
                              name="destination.contactPerson.email"
                              placeholder="Email"
                              value={formData.destination.contactPerson.email}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-2"
                            />
                            <input
                              type="tel"
                              name="destination.contactPerson.phone"
                              placeholder="Phone"
                              value={formData.destination.contactPerson.phone}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-900 mb-3">
                        Items
                      </h4>
                      <div className="bg-white rounded-lg shadow overflow-hidden p-4">
                        {formData.items.length === 0 ? (
                          <p className="text-sm text-gray-500 mb-4">
                            No items added yet.
                          </p>
                        ) : (
                          <div className="mb-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Item
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Quantity
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Price
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Total
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {formData.items.map((item, index) => (
                                  <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <select
                                        value={item.itemId}
                                        onChange={(e) =>
                                          handleItemChange(
                                            index,
                                            "itemId",
                                            e.target.value
                                          )
                                        }
                                        disabled={
                                          mode === "view" || loadingInventory
                                        }
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                      >
                                        <option value="">Select Item</option>
                                        {inventoryOptions.map((invItem) => (
                                          <option
                                            key={invItem.id}
                                            value={invItem.id}
                                          >
                                            {invItem.name} ({invItem.sku})
                                          </option>
                                        ))}
                                      </select>
                                      {errors[`items[${index}].itemId`] && (
                                        <p className="mt-1 text-sm text-red-600">
                                          {errors[`items[${index}].itemId`]}
                                        </p>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) =>
                                          handleItemChange(
                                            index,
                                            "quantity",
                                            parseInt(e.target.value) || 0
                                          )
                                        }
                                        disabled={mode === "view"}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                      />
                                      {errors[`items[${index}].quantity`] && (
                                        <p className="mt-1 text-sm text-red-600">
                                          {errors[`items[${index}].quantity`]}
                                        </p>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.price}
                                        onChange={(e) =>
                                          handleItemChange(
                                            index,
                                            "price",
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                        disabled={mode === "view"}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                      />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {mode !== "view" && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveItem(index)
                                          }
                                          className="text-red-600 hover:text-red-900"
                                        >
                                          Remove
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td
                                    colSpan="3"
                                    className="px-6 py-4 text-right font-medium"
                                  >
                                    Total Value:
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                                    ${formData.totalValue.toFixed(2)}
                                  </td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}
                        {mode !== "view" && (
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Add Item
                          </button>
                        )}
                        {errors.items && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.items}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-900 mb-3">
                        Documents
                      </h4>
                      <div className="bg-white rounded-lg shadow overflow-hidden p-4">
                        {formData.documents.length === 0 ? (
                          <p className="text-sm text-gray-500 mb-4">
                            No documents added yet.
                          </p>
                        ) : (
                          <div className="mb-4">
                            {formData.documents.map((doc, index) => (
                              <div
                                key={index}
                                className="flex items-center mb-2 p-2 border rounded"
                              >
                                <div className="flex-grow">
                                  <div className="grid grid-cols-2 gap-2">
                                    <select
                                      value={doc.type}
                                      onChange={(e) =>
                                        handleDocumentChange(
                                          index,
                                          "type",
                                          e.target.value
                                        )
                                      }
                                      disabled={mode === "view"}
                                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    >
                                      {documentTypeOptions.map((option) => (
                                        <option key={option} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                    </select>
                                    <input
                                      type="text"
                                      placeholder="File Name"
                                      value={doc.fileName}
                                      onChange={(e) =>
                                        handleDocumentChange(
                                          index,
                                          "fileName",
                                          e.target.value
                                        )
                                      }
                                      disabled={mode === "view"}
                                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Document URL"
                                    value={doc.url}
                                    onChange={(e) =>
                                      handleDocumentChange(
                                        index,
                                        "url",
                                        e.target.value
                                      )
                                    }
                                    disabled={mode === "view"}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mt-2"
                                  />
                                </div>
                                {mode !== "view" && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDocument(index)}
                                    className="ml-2 text-red-600 hover:text-red-900"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {mode !== "view" && (
                          <button
                            type="button"
                            onClick={handleAddDocument}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Add Document
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Document Upload Section */}
                    {allowDocumentUpload && (
                      <div className="col-span-2 mb-6">
                        <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                          <span className="mr-2">Documents</span>
                          {theme === "management" && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                              Management
                            </span>
                          )}
                        </h4>
                        <div
                          className={`bg-white rounded-lg shadow overflow-hidden p-4 ${themeStyles.sectionClass}`}
                        >
                          {mode !== "view" && (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Shipment Documents
                              </label>
                              <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                                  <div className="flex flex-col items-center justify-center pt-7">
                                    <svg
                                      className="w-8 h-8 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                      ></path>
                                    </svg>
                                    <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                                      Attach files
                                    </p>
                                  </div>
                                  <input
                                    type="file"
                                    className="opacity-0"
                                    multiple
                                    onChange={handleFileSelect}
                                  />
                                </label>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Supported formats: PDF, PNG, JPG, DOCX (Max
                                10MB)
                              </p>

                              {/* Upload Progress */}
                              {uploadProgress > 0 && uploadProgress < 100 && (
                                <div className="mt-2">
                                  <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 w-full">
                                    <div
                                      className="bg-blue-600 h-2.5 rounded-full"
                                      style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Uploading... {uploadProgress}%
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Document List */}
                          <div className="border rounded-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Name
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Type
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Size
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  >
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {documents.length > 0 ? (
                                  documents.map((doc) => (
                                    <tr key={doc.id}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {doc.name}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {doc.type}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {doc.size}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                          type="button"
                                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                          View
                                        </button>
                                        {mode !== "view" && (
                                          <button
                                            type="button"
                                            className="text-red-600 hover:text-red-900"
                                            onClick={() =>
                                              setDocuments((prev) =>
                                                prev.filter(
                                                  (d) => d.id !== doc.id
                                                )
                                              )
                                            }
                                          >
                                            Remove
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan="4"
                                      className="px-6 py-4 text-sm text-gray-500 text-center"
                                    >
                                      No documents attached
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="mt-8 flex justify-end">
                      <button
                        type="button"
                        onClick={onClose}
                        className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || mode === "view"}
                        className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                          isSubmitting || mode === "view"
                            ? "bg-indigo-400"
                            : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        }`}
                      >
                        {isSubmitting
                          ? "Saving..."
                          : mode === "add"
                          ? "Create Shipment"
                          : mode === "edit"
                          ? "Update Shipment"
                          : "Close"}
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

export default ShipmentModal;
