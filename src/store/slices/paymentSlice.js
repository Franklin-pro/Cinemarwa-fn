import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Async Thunks
export const createPaymentSession = createAsyncThunk(
  'payments/createSession',
  async ({ movieId, type }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/payments/create-session`,
        { movieId, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment session failed');
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payments/verify',
  async (transactionId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/payments/verify`,
        { transactionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Verification failed');
    }
  }
);

export const getPaymentHistory = createAsyncThunk(
  'payments/getHistory',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/payments/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

// Slice
const paymentSlice = createSlice({
  name: 'payments',
  initialState: {
    session: null,
    paymentHistory: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // Create Session
    builder
      .addCase(createPaymentSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentSession.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload;
      })
      .addCase(createPaymentSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Verify Payment
    builder
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.paymentHistory.push(action.payload);
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get History
    builder
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.paymentHistory = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = paymentSlice.actions;
export default paymentSlice.reducer;
