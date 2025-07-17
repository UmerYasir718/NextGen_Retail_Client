import { createSlice } from '@reduxjs/toolkit';

// Sample company data
const dummyCompanies = [
  {
    id: 1,
    name: 'NextGen Retail Corp',
    logo: 'https://via.placeholder.com/150?text=NextGen',
    address: '123 Main Street, Silicon Valley, CA',
    phone: '(555) 123-4567',
    email: 'info@nextgenretail.com',
    website: 'www.nextgenretail.com',
    status: 'active',
    subscription: 'premium',
    createdAt: '2023-01-01',
  },
  {
    id: 2,
    name: 'Fashion Forward Inc',
    logo: 'https://via.placeholder.com/150?text=Fashion',
    address: '456 Market Street, New York, NY',
    phone: '(555) 234-5678',
    email: 'info@fashionforward.com',
    website: 'www.fashionforward.com',
    status: 'active',
    subscription: 'yearly',
    createdAt: '2023-02-15',
  },
  {
    id: 3,
    name: 'Tech Gadgets Ltd',
    logo: 'https://via.placeholder.com/150?text=TechGadgets',
    address: '789 Tech Blvd, Austin, TX',
    phone: '(555) 345-6789',
    email: 'info@techgadgets.com',
    website: 'www.techgadgets.com',
    status: 'active',
    subscription: 'simple',
    createdAt: '2023-03-20',
  },
  {
    id: 4,
    name: 'Home Essentials Co',
    logo: 'https://via.placeholder.com/150?text=HomeEssentials',
    address: '101 Home Ave, Chicago, IL',
    phone: '(555) 456-7890',
    email: 'info@homeessentials.com',
    website: 'www.homeessentials.com',
    status: 'inactive',
    subscription: 'yearly',
    createdAt: '2023-04-10',
  },
  {
    id: 5,
    name: 'Sports Unlimited',
    logo: 'https://via.placeholder.com/150?text=SportsUnlimited',
    address: '202 Stadium Road, Boston, MA',
    phone: '(555) 567-8901',
    email: 'info@sportsunlimited.com',
    website: 'www.sportsunlimited.com',
    status: 'active',
    subscription: 'premium',
    createdAt: '2023-05-05',
  }
];

const initialState = {
  companies: dummyCompanies,
  selectedCompany: null,
  loading: false,
  error: null,
};

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanies: (state, action) => {
      state.companies = action.payload;
    },
    selectCompany: (state, action) => {
      state.selectedCompany = action.payload;
    },
    addCompany: (state, action) => {
      state.companies.push(action.payload);
    },
    updateCompany: (state, action) => {
      const index = state.companies.findIndex(company => company.id === action.payload.id);
      if (index !== -1) {
        state.companies[index] = { ...state.companies[index], ...action.payload };
      }
    },
    deleteCompany: (state, action) => {
      state.companies = state.companies.filter(company => company.id !== action.payload);
      if (state.selectedCompany && state.selectedCompany.id === action.payload) {
        state.selectedCompany = null;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setCompanies, 
  selectCompany, 
  addCompany, 
  updateCompany, 
  deleteCompany,
  setLoading,
  setError
} = companySlice.actions;

// Thunk to fetch companies (simulated)
export const fetchCompanies = () => (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    // Simulating API call with dummy data
    dispatch(setCompanies(dummyCompanies));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error.message || 'Failed to fetch companies'));
    dispatch(setLoading(false));
  }
};

export default companySlice.reducer;
