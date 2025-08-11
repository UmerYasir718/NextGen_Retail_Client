import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import companyAPI from "../utils/api/companyAPI";

const CompanyProfileEditModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    address: "",
    contactEmail: "",
    phone: "",
    website: "",
  });

  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    // Load company data when modal opens
    if (isOpen) {
      loadCompanyData();
    }
  }, [isOpen]);

  const loadCompanyData = async () => {
    try {
      const response = await companyAPI.getCompanyProfile();
      const companyData = response.data;
      setCompanyData(companyData);
      setFormData({
        address: companyData.address || "",
        contactEmail: companyData.contactEmail || "",
        phone: companyData.phone || "",
        website: companyData.website || "",
      });
    } catch (error) {
      console.error("Failed to load company data:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await companyAPI.editCompanyDetails(formData);
      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      setError(error.message || "Failed to update company details");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Edit Company Profile
          </h2>
          <p className="text-gray-600">Update your company information</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Company profile updated successfully!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Plan Information - Read Only */}
        {companyData?.planId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Current Plan Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Plan Name
                </label>
                <p className="text-blue-900 font-semibold">
                  {companyData.planId.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Plan Price
                </label>
                <p className="text-blue-900 font-semibold">
                  $
                  {companyData.planId.price === 0
                    ? "Free"
                    : companyData.planId.price}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Plan Start Date
                </label>
                <p className="text-blue-900">
                  {companyData.planStartDate
                    ? new Date(companyData.planStartDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Trial Status
                </label>
                <p className="text-blue-900">
                  {companyData.isTrialPeriod ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Trial Period
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active Subscription
                    </span>
                  )}
                </p>
              </div>

              {companyData.isTrialPeriod && companyData.trialEndDate && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    Trial End Date
                  </label>
                  <p className="text-blue-900">
                    {new Date(companyData.trialEndDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {companyData.planId.features &&
              companyData.planId.features.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Plan Features
                  </label>
                  <ul className="space-y-1">
                    {companyData.planId.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center text-blue-900"
                      >
                        <svg
                          className="w-4 h-4 text-blue-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Field */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-bold text-gray-700 mb-3"
            >
              🏢 Company Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
              placeholder="Enter company address"
            />
          </div>

          {/* Contact Email Field */}
          <div>
            <label
              htmlFor="contactEmail"
              className="block text-sm font-bold text-gray-700 mb-3"
            >
              📧 Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
              placeholder="Enter contact email"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-bold text-gray-700 mb-3"
            >
              📞 Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
              placeholder="Enter phone number"
            />
          </div>

          {/* Website Field */}
          <div>
            <label
              htmlFor="website"
              className="block text-sm font-bold text-gray-700 mb-3"
            >
              🌐 Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500"
              placeholder="Enter website URL"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating company...
                </span>
              ) : (
                "Update Company"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfileEditModal;
