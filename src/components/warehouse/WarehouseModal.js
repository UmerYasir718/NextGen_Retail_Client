import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import warehouseAPI from "../../utils/api/warehouseAPI";

const WarehouseModal = ({
  isOpen,
  onClose,
  mode = "add", // add, edit, view
  initialData = null,
  onSubmit,
}) => {
  const { user } = useSelector((state) => state.auth);
  const { selectedCompany } = useSelector((state) => state.company);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    contactInfo: {
      email: "",
      phone: "",
      name: "",
    },
    capacity: 0,
    utilization: {
      capacityValue: 0,
      utilizationValue: 0,
      utilizationPercentage: 0,
    },
    isActive: true,
    companyId: selectedCompany?.id || "",
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form data when modal opens or mode changes
  useEffect(() => {
    if (initialData && (mode === "edit" || mode === "view")) {
      setFormData({
        name: initialData.name || "",
        address: {
          street: initialData.address?.street || "",
          city: initialData.address?.city || "",
          state: initialData.address?.state || "",
          zipCode: initialData.address?.zipCode || "",
          country: initialData.address?.country || "",
        },
        contactInfo: {
          email: initialData.contactInfo?.email || "",
          phone: initialData.contactInfo?.phone || "",
          name: initialData.contactInfo?.name || "",
        },
        capacity: initialData.capacity || 0,
        utilization: {
          capacityValue: initialData.utilization?.capacityValue || 0,
          utilizationValue: initialData.utilization?.utilizationValue || 0,
          utilizationPercentage:
            initialData.utilization?.utilizationPercentage || 0,
        },
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
        companyId: initialData.companyId || selectedCompany?.id || "",
      });
    } else {
      // Reset form for add mode
      setFormData({
        name: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        contactInfo: {
          email: "",
          phone: "",
          name: "",
        },
        utilization: {
          capacityValue: 0,
          utilizationValue: 0,
          utilizationPercentage: 0,
        },
        capacity: 0,
        isActive: true,
        companyId: selectedCompany?.id || "",
      });
    }
    setErrors({});
  }, [isOpen, mode, initialData, selectedCompany]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested objects (address, contactInfo, utilization)
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      // Handle checkbox for isActive
      if (name === "isActive") {
        setFormData({
          ...formData,
          [name]: e.target.checked,
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name) newErrors.name = "Warehouse name is required";
    if (!formData.address.city) newErrors["address.city"] = "City is required";
    if (!formData.address.country)
      newErrors["address.country"] = "Country is required";
    if (!formData.contactInfo.email)
      newErrors["contactInfo.email"] = "Email is required";
    if (!formData.contactInfo.name)
      newErrors["contactInfo.name"] = "name name is required";

    // Capacity validation
    if (formData.capacity < 0) {
      newErrors["capacityValue"] = "Capacity cannot be negative";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      formData.contactInfo.email &&
      !emailRegex.test(formData.contactInfo.email)
    ) {
      newErrors["contactInfo.email"] = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      let result;
      if (mode === "add") {
        result = await warehouseAPI.createWarehouse(formData);
        toast.success("Warehouse created successfully");
      } else if (mode === "edit") {
        result = await warehouseAPI.updateWarehouse(initialData._id, formData);
        toast.success("Warehouse updated successfully");
      }

      setLoading(false);
      onSubmit && onSubmit(result?.data);
      onClose();
    } catch (error) {
      console.error("Error saving warehouse:", error);
      toast.error(error.message || "Failed to save warehouse");
      setLoading(false);
    }
  };

  // Get modal title based on mode
  const getModalTitle = () => {
    switch (mode) {
      case "add":
        return "Add New Warehouse";
      case "edit":
        return "Edit Warehouse";
      case "view":
        return "View Warehouse Details";
      default:
        return "Warehouse";
    }
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Information */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Basic Information
                      </h3>
                      <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
                        <div className="p-4 space-y-4">
                          {/* Warehouse Name */}
                          <div>
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Warehouse Name*
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className={`w-full px-3 py-2 border rounded-md ${
                                errors.name
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } ${mode === "view" ? "bg-gray-100" : ""}`}
                            />
                            {errors.name && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.name}
                              </p>
                            )}
                          </div>

                          {/* Status */}
                          <div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                disabled={mode === "view"}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor="isActive"
                                className="ml-2 block text-sm text-gray-900"
                              >
                                Active
                              </label>
                            </div>
                          </div>

                          {/* Capacity */}
                          <div>
                            <label
                              htmlFor="utilization.capacityValue"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Capacity
                            </label>
                            <input
                              type="number"
                              id="capacity"
                              name="capacity"
                              value={formData.capacity}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className={`w-full px-3 py-2 border rounded-md ${
                                errors["capacity"]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } ${mode === "view" ? "bg-gray-100" : ""}`}
                            />
                            {errors["capacity"] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors["capacity"]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Contact Information
                      </h3>
                      <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
                        <div className="p-4 space-y-4">
                          {/* name */}
                          <div>
                            <label
                              htmlFor="contactInfo.name"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Name*
                            </label>
                            <input
                              type="text"
                              id="contactInfo.name"
                              name="contactInfo.name"
                              value={formData.contactInfo.name}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className={`w-full px-3 py-2 border rounded-md ${
                                errors["contactInfo.name"]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } ${mode === "view" ? "bg-gray-100" : ""}`}
                            />
                            {errors["contactInfo.name"] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors["contactInfo.name"]}
                              </p>
                            )}
                          </div>

                          {/* Email */}
                          <div>
                            <label
                              htmlFor="contactInfo.email"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Email*
                            </label>
                            <input
                              type="email"
                              id="contactInfo.email"
                              name="contactInfo.email"
                              value={formData.contactInfo.email}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className={`w-full px-3 py-2 border rounded-md ${
                                errors["contactInfo.email"]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } ${mode === "view" ? "bg-gray-100" : ""}`}
                            />
                            {errors["contactInfo.email"] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors["contactInfo.email"]}
                              </p>
                            )}
                          </div>

                          {/* Phone */}
                          <div>
                            <label
                              htmlFor="contactInfo.phone"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Phone
                            </label>
                            <input
                              type="text"
                              id="contactInfo.phone"
                              name="contactInfo.phone"
                              value={formData.contactInfo.phone}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className={`w-full px-3 py-2 border rounded-md border-gray-300 ${
                                mode === "view" ? "bg-gray-100" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="mb-6 col-span-1 md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Address
                      </h3>
                      <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Street */}
                          <div>
                            <label
                              htmlFor="address.street"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Street
                            </label>
                            <input
                              type="text"
                              id="address.street"
                              name="address.street"
                              value={formData.address.street}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className={`w-full px-3 py-2 border rounded-md border-gray-300 ${
                                mode === "view" ? "bg-gray-100" : ""
                              }`}
                            />
                          </div>

                          {/* City */}
                          <div>
                            <label
                              htmlFor="address.city"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              City*
                            </label>
                            <input
                              type="text"
                              id="address.city"
                              name="address.city"
                              value={formData.address.city}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className={`w-full px-3 py-2 border rounded-md ${
                                errors["address.city"]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } ${mode === "view" ? "bg-gray-100" : ""}`}
                            />
                            {errors["address.city"] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors["address.city"]}
                              </p>
                            )}
                          </div>

                          {/* State */}
                          <div>
                            <label
                              htmlFor="address.state"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              State/Province
                            </label>
                            <input
                              type="text"
                              id="address.state"
                              name="address.state"
                              value={formData.address.state}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className={`w-full px-3 py-2 border rounded-md border-gray-300 ${
                                mode === "view" ? "bg-gray-100" : ""
                              }`}
                            />
                          </div>

                          {/* Postal Code */}
                          <div>
                            <label
                              htmlFor="address.zipCode"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Postal Code
                            </label>
                            <input
                              type="text"
                              id="address.zipCode"
                              name="address.zipCode"
                              value={formData.address.zipCode}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className={`w-full px-3 py-2 border rounded-md border-gray-300 ${
                                mode === "view" ? "bg-gray-100" : ""
                              }`}
                            />
                          </div>

                          {/* Country */}
                          <div>
                            <label
                              htmlFor="address.country"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Country*
                            </label>
                            <input
                              type="text"
                              id="address.country"
                              name="address.country"
                              value={formData.address.country}
                              onChange={handleInputChange}
                              disabled={mode === "view"}
                              className={`w-full px-3 py-2 border rounded-md ${
                                errors["address.country"]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } ${mode === "view" ? "bg-gray-100" : ""}`}
                            />
                            {errors["address.country"] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors["address.country"]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse border-t pt-4">
                    {mode !== "view" && (
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        {loading
                          ? "Saving..."
                          : mode === "add"
                          ? "Create"
                          : "Update"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      {mode === "view" ? "Close" : "Cancel"}
                    </button>
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

export default WarehouseModal;
