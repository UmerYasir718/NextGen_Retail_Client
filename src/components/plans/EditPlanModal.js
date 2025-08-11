import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PlanForm from "./PlanForm";
import planAPI from "../../utils/api/planAPI";

const EditPlanModal = ({ isOpen, onClose, plan, onPlanUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (plan && isOpen) {
      // Prepare initial data for the form
      setInitialData({
        name: plan.name || "",
        description: plan.description || "",
        duration: plan.duration || 1,
        price: plan.price || 0,
        features: plan.features || [],
        stripePriceId: plan.stripePriceId || "",
        limits: {
          warehouseLimit: plan.limits?.warehouseLimit || 1,
          userLimit: plan.limits?.userLimit || 1,
          inventoryLimit: plan.limits?.inventoryLimit || 1000,
          includesAIForecasting: plan.limits?.includesAIForecasting || false,
          includesAdvancedReporting:
            plan.limits?.includesAdvancedReporting || false,
        },
        isActive: plan.isActive || false,
      });
    }
  }, [plan, isOpen]);

  const handleSubmit = async (formData) => {
    if (!plan?._id) {
      toast.error("Plan ID not found");
      return;
    }

    try {
      setLoading(true);
      const response = await planAPI.updatePlan(plan._id, formData);

      if (response?.success) {
        toast.success("Plan updated successfully!");
        onPlanUpdated(response.data);
        onClose();
      } else {
        toast.error(response?.message || "Failed to update plan");
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Error updating plan: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !plan || !initialData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Edit Plan: {plan.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <PlanForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={onClose}
            loading={loading}
            submitButtonText="Update Plan"
            mode="edit"
          />
        </div>
      </div>
    </div>
  );
};

export default EditPlanModal;
