import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const paymentsAxios = axios.create({
  baseURL: `${API_URL}/payments`,
});

// Add token to requests
paymentsAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const paymentsService = {
  // Payment Methods
  createPaymentSession: (paymentData) =>
    paymentsAxios.post('/create-session', paymentData),
  
  verifyPayment: (transactionId) =>
    paymentsAxios.post('/verify', { transactionId }),

  // MoMo Payment with proper status handling
  processMoMoPayment: (paymentData) =>
    paymentsAxios.post('/momo', paymentData),

  // Check payment status - polls MTN MoMo API
  checkPaymentStatus: (transactionId) =>
    paymentsAxios.get(`/status/${transactionId}`),

  // Payment History
  getPaymentHistory: (params) =>
    paymentsAxios.get('/history', { params }),

  getPaymentDetails: (transactionId) =>
    paymentsAxios.get(`/transaction/${transactionId}`),

  // Purchase Management
  purchaseMovie: (movieId, type) =>
    paymentsAxios.post('/purchase', { movieId, type }),

  downloadMovie: (movieId) =>
    paymentsAxios.post(`/download/${movieId}`),

  // Refunds
  requestRefund: (transactionId, reason) =>
    paymentsAxios.post('/refund', { transactionId, reason }),

  getRefundStatus: (refundId) =>
    paymentsAxios.get(`/refund/${refundId}`),

  // Filmmaker Revenue
  getRevenue: (params) => 
    paymentsAxios.get('/revenue', { params }),

  withdrawRevenue: (amount) =>
    paymentsAxios.post('/withdraw', { amount }),

  getWithdrawalHistory: () =>
    paymentsAxios.get('/withdrawals'),

  // Payment Methods Setup
  addPaymentMethod: (methodData) =>
    paymentsAxios.post('/payment-methods', methodData),

  getPaymentMethods: () => 
    paymentsAxios.get('/payment-methods'),

  deletePaymentMethod: (methodId) =>
    paymentsAxios.delete(`/payment-methods/${methodId}`),
};

// Export as named export for easier use
export const paymentsAPI = paymentsService;
export default paymentsService;