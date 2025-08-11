import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import companyAPI from "../../utils/api/companyAPI";

// Async thunk to fetch companies from API
export const fetchCompanies = createAsyncThunk(
  "company/fetchCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyAPI.getAllCompanies();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch companies");
    }
  }
);

const initialState = {
  companies: [],
  selectedCompany: null,
  loading: false,
  error: null,
};

export const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    selectCompany: (state, action) => {
      state.selectedCompany = action.payload;
    },
    addCompany: (state, action) => {
      state.companies.push(action.payload);
    },
    updateCompany: (state, action) => {
      const index = state.companies.findIndex(
        (company) => company._id === action.payload._id
      );
      if (index !== -1) {
        state.companies[index] = {
          ...state.companies[index],
          ...action.payload,
        };
      }
    },
    deleteCompany: (state, action) => {
      state.companies = state.companies.filter(
        (company) => company._id !== action.payload
      );
      if (
        state.selectedCompany &&
        state.selectedCompany._id === action.payload
      ) {
        state.selectedCompany = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.companies = action.payload.data;
        }
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  selectCompany,
  addCompany,
  updateCompany,
  deleteCompany,
  clearError,
} = companySlice.actions;

export default companySlice.reducer;
