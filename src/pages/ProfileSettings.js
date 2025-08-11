import React, { useState } from "react";
import { useSelector } from "react-redux";
import ChangePasswordModal from "../components/ChangePasswordModal";
import UserProfileEditModal from "../components/UserProfileEditModal";
import CompanyProfileEditModal from "../components/CompanyProfileEditModal";

const ProfileSettings = () => {
  const { user } = useSelector((state) => state.auth);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showCompanyProfileModal, setShowCompanyProfileModal] = useState(false);

  const isCompanyAdmin =
    user?.role === "company_admin" || user?.role === "super_admin";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Profile Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center mr-4">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  User Profile
                </h2>
                <p className="text-gray-600">
                  Manage your personal information
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-gray-900">{user?.name || "Not set"}</p>
                </div>
                <button
                  onClick={() => setShowUserProfileModal(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <span className="text-xs text-gray-400">Cannot be changed</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-gray-900 capitalize">
                    {user?.role?.replace("_", " ")}
                  </p>
                </div>
                <span className="text-xs text-gray-400">Cannot be changed</span>
              </div>
            </div>

            {/* Change Password Button */}
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Change Password
            </button>
          </div>

          {/* Company Profile Section */}
          {isCompanyAdmin && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center mr-4">
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
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Company Profile
                  </h2>
                  <p className="text-gray-600">
                    Manage your company information
                  </p>
                </div>
              </div>

              {/* Company Info Placeholder */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Company Name
                    </p>
                    <p className="text-gray-900">Your Company</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    Cannot be changed
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Address</p>
                    <p className="text-gray-900">Not set</p>
                  </div>
                  <button
                    onClick={() => setShowCompanyProfileModal(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Contact Email
                    </p>
                    <p className="text-gray-900">Not set</p>
                  </div>
                  <button
                    onClick={() => setShowCompanyProfileModal(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">Not set</p>
                  </div>
                  <button
                    onClick={() => setShowCompanyProfileModal(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Edit Company Button */}
              <button
                onClick={() => setShowCompanyProfileModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Edit Company Profile
              </button>
            </div>
          )}

          {/* Security Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-red-600 rounded-full flex items-center justify-center mr-4">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Security</h2>
                <p className="text-gray-600">Manage your account security</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500">Password</p>
                  <p className="text-gray-900">Last changed: Unknown</p>
                </div>
                <button
                  onClick={() => setShowChangePasswordModal(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Change
                </button>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Two-Factor Auth
                  </p>
                  <p className="text-gray-900">Not enabled</p>
                </div>
                <span className="text-xs text-gray-400">Coming soon</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Login Sessions
                  </p>
                  <p className="text-gray-900">Active sessions: 1</p>
                </div>
                <span className="text-xs text-gray-400">Coming soon</span>
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center mr-4">
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Account</h2>
                <p className="text-gray-600">Manage your account settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Account Status
                  </p>
                  <p className="text-green-600 font-medium">Active</p>
                </div>
                <span className="text-xs text-gray-400">Cannot be changed</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Member Since
                  </p>
                  <p className="text-gray-900">January 2024</p>
                </div>
                <span className="text-xs text-gray-400">Cannot be changed</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Data Export
                  </p>
                  <p className="text-gray-900">Download your data</p>
                </div>
                <span className="text-xs text-gray-400">Coming soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
        />

        <UserProfileEditModal
          isOpen={showUserProfileModal}
          onClose={() => setShowUserProfileModal(false)}
          onSuccess={() => {
            // Refresh user data if needed
            console.log("User profile updated successfully");
          }}
        />

        <CompanyProfileEditModal
          isOpen={showCompanyProfileModal}
          onClose={() => setShowCompanyProfileModal(false)}
          onSuccess={() => {
            // Refresh company data if needed
            console.log("Company profile updated successfully");
          }}
        />
      </div>
    </div>
  );
};

export default ProfileSettings;
