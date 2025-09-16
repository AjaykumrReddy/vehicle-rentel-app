import { apiClient } from './client';

export const paymentAPI = {
  createOrder: (bookingId, amount) =>
    apiClient.post('/payments/create-order', {
      booking_id: bookingId,
      amount: amount
    }),

  verifyPayment: (paymentData) =>
    apiClient.post('/payments/verify', paymentData),

  getPaymentStatus: (bookingId) =>
    apiClient.get(`/payments/status/${bookingId}`)
};