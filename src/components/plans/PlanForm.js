import React, { useState } from "react";
import { toast } from "react-toastify";
import planAPI from "../../utils/api/planAPI";

const PlanForm = ({
  onSubmit,
  onCancel,
  initialData = null,
  mode = "create",
  loading = false,
  submitButtonText = "Create Plan",
}) => {
  // Default form state
  const defaultFormState = {
    name: "",
    description: "",
    price: "",
    duration: 1,
    features: [""],
    limits: {
      warehouseLimit: 1,
      userLimit: 1,
      inventoryLimit: 1,
      includesAIForecasting: false,
      includesAdvancedReporting: false,
    },
    stripePriceId: "",
    isActive: true,
  };

  // Initialize form state with initial data or defaults
  const [formData, setFormData] = useState(initialData || defaultFormState);

  // Form validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      // Handle nested objects (e.g., limits.warehouseLimit)
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      // Handle top-level fields
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle number input changes
  const handleNumberChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      // Handle nested objects (e.g., limits.warehouseLimit)
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value === "" ? "" : Number(value),
        },
      });
    } else {
      // Handle top-level fields
      setFormData({
        ...formData,
        [name]: value === "" ? "" : Number(value),
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    if (name.includes(".")) {
      // Handle nested objects (e.g., limits.includesAIForecasting)
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: checked,
        },
      });
    } else {
      // Handle top-level fields
      setFormData({
        ...formData,
        [name]: checked,
      });
    }
  };

  // Handle features array changes
  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData({
      ...formData,
      features: updatedFeatures,
    });
  };

  // Add a new feature field
  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ""],
    });
  };

  // Remove a feature field
  const removeFeature = (index) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({
      ...formData,
      features: updatedFeatures,
    });
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.duration || formData.duration < 1)
      newErrors.duration = "Valid duration is required";
    if (!formData.stripePriceId.trim())
      newErrors.stripePriceId = "Stripe Price ID is required";

    // Validate limits
    if (!formData.limits.warehouseLimit || formData.limits.warehouseLimit < 1)
      newErrors["limits.warehouseLimit"] = "Valid warehouse limit is required";
    if (!formData.limits.userLimit || formData.limits.userLimit < 1)
      newErrors["limits.userLimit"] = "Valid user limit is required";
    if (!formData.limits.inventoryLimit || formData.limits.inventoryLimit < 1)
      newErrors["limits.inventoryLimit"] = "Valid inventory limit is required";

    // Validate features
    if (formData.features.length === 0) {
      newErrors.features = "At least one feature is required";
    } else {
      const emptyFeatures = formData.features.filter(
        (feature) => !feature.trim()
      ).length;
      if (emptyFeatures > 0) newErrors.features = "Features cannot be empty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Filter out any empty features
        const cleanedFormData = {
          ...formData,
          features: formData.features.filter(
            (feature) => feature.trim() !== ""
          ),
        };

        if (onSubmit) {
          await onSubmit(cleanedFormData);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error(
          "Failed to save plan: " + (error.message || "Unknown error")
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Plan Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plan Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enterprise Plan"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="For large enterprises with multiple warehouses"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Price and Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleNumberChange}
            step="0.01"
            min="0"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.price ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="499.99"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-500">{errors.price}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (months) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleNumberChange}
            min="1"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.duration ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="12"
          />
          {errors.duration && (
            <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
          )}
        </div>
      </div>

      {/* Stripe Price ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stripe Price ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="stripePriceId"
          value={formData.stripePriceId}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.stripePriceId ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="price_1234567890"
        />
        {errors.stripePriceId && (
          <p className="mt-1 text-sm text-red-500">{errors.stripePriceId}</p>
        )}
      </div>

      {/* Plan Limits */}
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-3">Plan Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warehouse Limit <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="limits.warehouseLimit"
              value={formData.limits.warehouseLimit}
              onChange={handleNumberChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md ${
                errors["limits.warehouseLimit"]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors["limits.warehouseLimit"] && (
              <p className="mt-1 text-sm text-red-500">
                {errors["limits.warehouseLimit"]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Limit <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="limits.userLimit"
              value={formData.limits.userLimit}
              onChange={handleNumberChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md ${
                errors["limits.userLimit"]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors["limits.userLimit"] && (
              <p className="mt-1 text-sm text-red-500">
                {errors["limits.userLimit"]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inventory Limit <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="limits.inventoryLimit"
              value={formData.limits.inventoryLimit}
              onChange={handleNumberChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md ${
                errors["limits.inventoryLimit"]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors["limits.inventoryLimit"] && (
              <p className="mt-1 text-sm text-red-500">
                {errors["limits.inventoryLimit"]}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includesAIForecasting"
              name="limits.includesAIForecasting"
              checked={formData.limits.includesAIForecasting}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="includesAIForecasting"
              className="ml-2 block text-sm text-gray-700"
            >
              Includes AI Forecasting
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includesAdvancedReporting"
              name="limits.includesAdvancedReporting"
              checked={formData.limits.includesAdvancedReporting}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="includesAdvancedReporting"
              className="ml-2 block text-sm text-gray-700"
            >
              Includes Advanced Reporting
            </label>
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium text-gray-700">Features</h3>
          <button
            type="button"
            onClick={addFeature}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Feature
          </button>
        </div>
        {errors.features && (
          <p className="mt-1 text-sm text-red-500 mb-2">{errors.features}</p>
        )}
        {formData.features.map((feature, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md mr-2"
              placeholder="Feature description"
            />
            {formData.features.length > 1 && (
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          Plan is Active
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          disabled={isSubmitting || loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting || loading}
        >
          {isSubmitting || loading ? "Saving..." : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default PlanForm;
