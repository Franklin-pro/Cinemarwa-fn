import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentsService } from '../../services/api/payments';

// ====== ASYNC THUNKS ======

// Process MoMo Payment
export const processMoMoPayment = createAsyncThunk(
  'payments/processMoMo',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentsService.processMoMoPayment(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error ||
        'MoMo payment failed'
      );
    }
  }
);

// Check MoMo Payment Status
export const checkMoMoPaymentStatus = createAsyncThunk(
  'payments/checkMoMoStatus',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await paymentsService.checkMoMoPaymentStatus(transactionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Status check failed'
      );
    }
  }
);

// Process Stripe Payment
export const processStripePayment = createAsyncThunk(
  'payments/processStripe',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentsService.processStripePayment(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Stripe payment failed'
      );
    }
  }
);

// Get Payment History
export const getPaymentHistory = createAsyncThunk(
  'payments/getHistory',
  async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await paymentsService.getPaymentHistory(userId, { page, limit });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to fetch payment history'
      );
    }
  }
);

// Get Payment Details
export const getPaymentDetails = createAsyncThunk(
  'payments/getDetails',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await paymentsService.getPaymentDetails(paymentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to fetch payment details'
      );
    }
  }
);

// Get Withdrawal History
export const getWithdrawalHistory = createAsyncThunk(
  'payments/getWithdrawals',
  async ({ userId, page = 1, limit = 20, status, type }, { rejectWithValue }) => {
    try {
      const response = await paymentsService.getWithdrawalHistory(userId, { 
        page, 
        limit, 
        status, 
        type 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to fetch withdrawal history'
      );
    }
  }
);

// Get Withdrawal Details
export const getWithdrawalDetails = createAsyncThunk(
  'payments/getWithdrawalDetails',
  async (withdrawalId, { rejectWithValue }) => {
    try {
      const response = await paymentsService.getWithdrawalDetails(withdrawalId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Failed to fetch withdrawal details'
      );
    }
  }
);

// ====== SLICE ======

const paymentSlice = createSlice({
  name: 'payments',
  initialState: {
    // Current transaction
    currentTransaction: null,
    currentPaymentDetails: null,
    
    // History
    paymentHistory: [],
    paymentPagination: null,
    
    // Withdrawals
    withdrawalHistory: [],
    withdrawalPagination: null,
    currentWithdrawal: null,
    
    // UI States
    loading: false,
    error: null,
    success: false,
    polling: false,
    
    // Payment status tracking
    paymentStatus: null, // PENDING, SUCCESSFUL, FAILED
    gatewayStatus: null, // Gateway response status
    withdrawalsProcessed: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearTransaction: (state) => {
      state.currentTransaction = null;
      state.paymentStatus = null;
      state.gatewayStatus = null;
      state.withdrawalsProcessed = false;
    },
    setPolling: (state, action) => {
      state.polling = action.payload;
    },
    updatePaymentStatus: (state, action) => {
      state.paymentStatus = action.payload.status;
      if (action.payload.gatewayStatus) {
        state.gatewayStatus = action.payload.gatewayStatus;
      }
    },
  },
  extraReducers: (builder) => {
    // ====== PROCESS MOMO PAYMENT ======
    builder
      .addCase(processMoMoPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(processMoMoPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload.data || action.payload;
        state.paymentStatus = action.payload.data?.status || action.payload.status;
        state.gatewayStatus = action.payload.data?.customerTransaction?.gatewayStatus;
        state.withdrawalsProcessed = !!action.payload.data?.withdrawals;
        
        // If gateway is SUCCESSFUL, mark as success immediately
        if (state.gatewayStatus === 'SUCCESSFUL' || state.paymentStatus === 'SUCCESSFUL') {
          state.success = true;
        }
      })
      .addCase(processMoMoPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // ====== CHECK MOMO PAYMENT STATUS ======
    builder
      .addCase(checkMoMoPaymentStatus.pending, (state) => {
        state.polling = true;
      })
      .addCase(checkMoMoPaymentStatus.fulfilled, (state, action) => {
        state.polling = false;
        const responseData = action.payload.data || action.payload;
        
        // Update current transaction if it matches
        if (state.currentTransaction?.transactionId === responseData.transactionId) {
          state.currentTransaction = {
            ...state.currentTransaction,
            ...responseData,
          };
        }
        
        // Update payment status
        state.paymentStatus = responseData.status;
        
        // If successful, add to history and mark success
        if (responseData.status === 'SUCCESSFUL') {
          state.success = true;
          
          // Add to payment history if not already there
          const existsInHistory = state.paymentHistory.some(
            p => p.transactionId === responseData.transactionId
          );
          if (!existsInHistory) {
            state.paymentHistory.unshift(responseData);
          }
        } else if (responseData.status === 'FAILED') {
          state.error = responseData.reason || 'Payment failed';
        }
      })
      .addCase(checkMoMoPaymentStatus.rejected, (state, action) => {
        state.polling = false;
        state.error = action.payload;
      });

    // ====== PROCESS STRIPE PAYMENT ======
    builder
      .addCase(processStripePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(processStripePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload.data || action.payload;
        state.success = true;
      })
      .addCase(processStripePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ====== GET PAYMENT HISTORY ======
    builder
      .addCase(getPaymentHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = action.payload;
        state.paymentHistory = responseData.data || responseData.payments || [];
        state.paymentPagination = responseData.pagination || null;
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ====== GET PAYMENT DETAILS ======
    builder
      .addCase(getPaymentDetails.fulfilled, (state, action) => {
        state.currentPaymentDetails = action.payload.data || action.payload.payment;
      });

    // ====== GET WITHDRAWAL HISTORY ======
    builder
      .addCase(getWithdrawalHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getWithdrawalHistory.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = action.payload;
        state.withdrawalHistory = responseData.data || responseData.withdrawals || [];
        state.withdrawalPagination = responseData.pagination || null;
      })
      .addCase(getWithdrawalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ====== GET WITHDRAWAL DETAILS ======
    builder
      .addCase(getWithdrawalDetails.fulfilled, (state, action) => {
        state.currentWithdrawal = action.payload.data || action.payload.withdrawal;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  clearTransaction, 
  setPolling,
  updatePaymentStatus,
} = paymentSlice.actions;

export default paymentSlice.reducer;