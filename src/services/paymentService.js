
import { paymentAPI } from '../api/paymentAPI';

// Global callback store to avoid navigation parameter issues
const callbackStore = {
  onSuccess: null,
  onError: null
};

class PaymentService {
  static async initiatePayment(booking, onSuccess, onError, navigation) {
    try {
      // Store callbacks globally
      callbackStore.onSuccess = onSuccess;
      callbackStore.onError = onError;

      // Create Razorpay order
      const orderResponse = await paymentAPI.createOrder(
        booking.booking_id || booking.id,
        booking.total_amount
      );
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create payment order');
      }

      const { order_id, amount, currency, key } = orderResponse.data;

      // Navigate to WebView payment screen without function params
      navigation.navigate('RazorpayWebView', {
        paymentData: { order_id, amount, currency, key },
        booking
      });

    } catch (error) {
      console.error('Payment initiation error:', error);
      onError(error.message || 'Failed to initiate payment');
    }
  }

  static getCallbacks() {
    return callbackStore;
  }

  static clearCallbacks() {
    callbackStore.onSuccess = null;
    callbackStore.onError = null;
  }

  // Verification is now handled in WebView screen

  static async getPaymentStatus(bookingId) {
    try {
      const response = await paymentAPI.getPaymentStatus(bookingId);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      return null;
    }
  }
}

export default PaymentService;