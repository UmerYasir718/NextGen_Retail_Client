import { createSlice } from "@reduxjs/toolkit";
import authAPI from "../../utils/api/authAPI";
import planAPI from "../../utils/api/planAPI";

const initialState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  loading: false,
  error: null,
  // Plan information
  plan: null,
  isPlanExpired: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.loading = false;
      state.error = null;
      // Store plan information if available
      if (action.payload.plan) {
        state.plan = action.payload.plan;
        state.isPlanExpired = action.payload.isPlanExpired || false;
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.plan = null;
      state.isPlanExpired = false;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    // New actions for plan management
    updatePlan: (state, action) => {
      state.plan = action.payload;
      state.isPlanExpired = action.payload?.isExpired || false;
    },
    setPlanExpired: (state, action) => {
      state.isPlanExpired = action.payload;
    },
    refreshPlan: (state, action) => {
      state.plan = action.payload;
      state.isPlanExpired = action.payload?.isExpired || false;
    },
    // Password reset actions
    forgotPasswordStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    forgotPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetPasswordStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    resetPasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    resetPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Change password actions
    changePasswordStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    changePasswordSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      // Update user data and token if provided
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      if (action.payload.token) {
        state.accessToken = action.payload.token;
        localStorage.setItem("accessToken", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },
    changePasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

// Action creators
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  updatePlan,
  setPlanExpired,
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
  changePasswordStart,
  changePasswordSuccess,
  changePasswordFailure,
  refreshPlan,
} = authSlice.actions;

// Thunk action to handle login
export const login = (email, password) => async (dispatch) => {
  dispatch(loginStart());

  try {
    // Check if it's a superadmin login
    const isSuperAdmin = email.toLowerCase() === "superadmin@nextgen.com";

    // Call the appropriate API endpoint
    const response = isSuperAdmin
      ? await authAPI.superadminLogin(email, password)
      : await authAPI.login(email, password);

    // Extract user data, token, and plan from response
    const { user, token, plan, isPlanExpired } = response;

    // Dispatch success with user data, token, and plan
    dispatch(
      loginSuccess({
        user,
        token,
        plan,
        isPlanExpired,
      })
    );

    // Store token in localStorage
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));

    // Store plan information if available
    if (plan) {
      localStorage.setItem("plan", JSON.stringify(plan));
    }
  } catch (error) {
    const errorMessage = error.error || "Invalid email or password";
    dispatch(loginFailure(errorMessage));
  }
};

// Thunk action to handle registration
export const register = (userData) => async (dispatch) => {
  dispatch(loginStart());

  try {
    // Call the actual register API endpoint
    const response = await authAPI.register(userData);

    // Extract user data and token from response
    const { user, token } = response;

    // Dispatch success with user data and token
    dispatch(
      loginSuccess({
        user,
        token,
      })
    );

    // Store token in localStorage
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    const errorMessage = error.message || "Registration failed";
    dispatch(loginFailure(errorMessage));
  }
};

// Thunk to check if user is already logged in
export const checkAuthState = () => async (dispatch) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    try {
      // Call the API to get current user with the stored token
      const user = await authAPI.getCurrentUser();

      // Get stored plan information
      const storedPlan = localStorage.getItem("plan");
      const plan = storedPlan ? JSON.parse(storedPlan) : null;

      // Dispatch success with user data, token, and plan
      dispatch(
        loginSuccess({
          user,
          accessToken,
          plan,
          isPlanExpired: plan?.isExpired || false,
        })
      );
    } catch (error) {
      // If token is invalid, clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("plan");
    }
  }
};

// Thunk to handle logout
export const logoutUser = () => async (dispatch) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      // Call the API to logout
      await authAPI.logout();
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear local storage and state regardless of API success
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("plan");
    dispatch(logout());
  }
};

// Thunk to handle forgot password
export const forgotPassword = (email) => async (dispatch) => {
  dispatch(forgotPasswordStart());

  try {
    await authAPI.forgotPassword(email);
    dispatch(forgotPasswordSuccess());
  } catch (error) {
    const errorMessage = error.message || "Failed to send reset email";
    dispatch(forgotPasswordFailure(errorMessage));
  }
};

// Thunk to handle reset password
export const resetPassword = (token, newPassword) => async (dispatch) => {
  dispatch(resetPasswordStart());

  try {
    await authAPI.resetPassword(token, newPassword);
    dispatch(resetPasswordSuccess());
  } catch (error) {
    const errorMessage = error.message || "Failed to reset password";
    dispatch(resetPasswordFailure(errorMessage));
  }
};

// Thunk to handle change password
export const changePassword =
  (currentPassword, newPassword) => async (dispatch) => {
    dispatch(changePasswordStart());

    try {
      const response = await authAPI.changePassword(
        currentPassword,
        newPassword
      );
      dispatch(changePasswordSuccess(response));
    } catch (error) {
      const errorMessage = error.message || "Failed to change password";
      dispatch(changePasswordFailure(errorMessage));
    }
  };

// Thunk to refresh current plan data
export const refreshCurrentPlan = () => async (dispatch) => {
  try {
    console.log("Starting plan refresh...");

    // Get current plan from API
    const planResponse = await planAPI.getCurrentPlan();
    console.log("Plan API response:", planResponse);

    if (planResponse?.success && planResponse?.data) {
      const plan = planResponse.data;
      console.log("Fresh plan data:", plan);

      // Update Redux state with fresh plan data
      dispatch(refreshPlan(plan));

      // Update localStorage with fresh plan data
      localStorage.setItem("plan", JSON.stringify(plan));

      console.log("Plan refresh completed successfully");
      return { success: true, plan };
    } else {
      console.error("Plan API response not successful:", planResponse);
      throw new Error("Failed to fetch current plan");
    }
  } catch (error) {
    console.error("Error refreshing plan:", error);
    return { success: false, error: error.message };
  }
};

export default authSlice.reducer;
