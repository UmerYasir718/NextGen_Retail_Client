/**
 * User utility functions for accessing user data from localStorage and Redux
 * 
 * These functions provide a centralized way to access user information,
 * company IDs, and authentication status across the application.
 * 
 * Usage:
 * - getCompanyId(): Get current company ID from localStorage or Redux
 * - getUser(): Get full user object from localStorage
 * - getUserId(): Get user ID from localStorage
 * - getUserRole(): Get user role from localStorage
 * - isAuthenticated(): Check if user is authenticated
 * - getAuthToken(): Get authentication token
 * - clearUserData(): Clear user data from localStorage
 */

/**
 * Get user object from localStorage
 * @returns {Object} User object with companyId
 */
export const getUser = () => {
  try {
    const userString = localStorage.getItem("user");
    return userString ? JSON.parse(userString) : {};
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return {};
  }
};

/**
 * Get company ID from user object
 * @returns {string|null} Company ID or null if not found
 */
export const getCompanyId = () => {
  const user = getUser();
  return user.companyId || null;
};

/**
 * Get user ID from user object
 * @returns {string|null} User ID or null if not found
 */
export const getUserId = () => {
  const user = getUser();
  return user.id || null;
};

/**
 * Get user role from user object
 * @returns {string|null} User role or null if not found
 */
export const getUserRole = () => {
  const user = getUser();
  return user.role || null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  const user = getUser();
  return !!(token && user.id);
};

/**
 * Get authentication token
 * @returns {string|null} Authentication token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

/**
 * Clear user data from localStorage
 */
export const clearUserData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
};
