import React from "react";
import { toast } from "react-toastify";
import planAPI from "../../utils/api/planAPI";
import PlanForm from "./PlanForm";

const AddPlanModal = ({ isOpen, onClose, onPlanAdded }) => {
  if (!isOpen) return null;

  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      const response = await planAPI.createPlan(formData);
      
      if (response && response.success) {
        toast.success("Plan created successfully!");
        if (onPlanAdded) {
          onPlanAdded(response.data);
        }
        onClose();
        return response.data;
      } else {
        throw new Error(response?.message || "Failed to create plan");
      }
    } catch (error) {
      console.error("Error creating plan:", error);
      toast.error("Failed to create plan: " + (error.message || "Unknown error"));
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full lg:max-w-2xl">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Add New Plan
                </h3>
                <div className="mt-2">
                  <PlanForm onSubmit={handleSubmit} onCancel={onClose} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPlanModal;
