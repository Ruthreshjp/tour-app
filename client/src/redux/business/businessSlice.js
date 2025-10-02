import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentBusiness: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  setupCompleted: false,
  businessData: null
};

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.currentBusiness = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.currentBusiness = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.setupCompleted = false;
      state.businessData = null;
    },
    updateBusiness: (state, action) => {
      state.currentBusiness = { ...state.currentBusiness, ...action.payload };
    },
    setSetupCompleted: (state, action) => {
      state.setupCompleted = action.payload;
    },
    setBusinessData: (state, action) => {
      state.businessData = action.payload;
    }
  }
});

export const {
  setLoading,
  setError,
  clearError,
  loginSuccess,
  logout,
  updateBusiness,
  setSetupCompleted,
  setBusinessData
} = businessSlice.actions;

export default businessSlice.reducer;
