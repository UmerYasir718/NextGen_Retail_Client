import api from "./apiClient";

const userAPI = {
  // Edit user details (without email permission)
  editUserDetails: async (userData) => {
    try {
      const response = await api.put("/users/edit-details", userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await api.get("/users/profile");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default userAPI;
