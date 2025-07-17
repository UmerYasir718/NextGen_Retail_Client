import { createSlice } from "@reduxjs/toolkit";
import { authAPI } from "../../utils/helpfunction";

const initialState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  loading: false,
  error: null,
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
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

// Action creators
export const { loginStart, loginSuccess, loginFailure, logout, updateUser } =
  authSlice.actions;

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
    const errorMessage = error.message || "Invalid email or password";
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

      // Dispatch success with user data and token
      dispatch(loginSuccess({ user, accessToken }));
    } catch (error) {
      // If token is invalid, clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
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
    dispatch(logout());
  }
};

export default authSlice.reducer;
