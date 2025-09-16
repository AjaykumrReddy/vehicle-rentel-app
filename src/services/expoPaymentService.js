import { WebView } from 'react-native-webview';
import { paymentAPI } from '../api/paymentAPI';

class ExpoPaymentService {
  static async initiatePayment(booking, navigation, onSuccess, onError) {
    try {
      const orderResponse = await paymentAPI.createOrder(
        booking.booking_id || booking.id,
        booking.total_amount * 100
      );

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create payment order');
      }

      const { order_id, amount, currency, key } = orderResponse.data;

      // Navigate to WebView payment screen
      navigation.navigate('RazorpayWebView', {
        paymentData: { order_id, amount, currency, key },
        booking,
        onSuccess,
        onError
      });

    } catch (error) {
      console.error('Payment initiation error:', error);
      onError(error.message || 'Failed to initiate payment');
    }
  }

  static async verifyPayment(paymentData, booking, onSuccess, onError) {
    try {
      const verificationResponse = await paymentAPI.verifyPayment({
        booking_id: booking.booking_id || booking.id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature
      });

      if (verificationResponse.success) {
        onSuccess(verificationResponse.data);
      } else {
        onError('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      onError('Payment verification failed');
    }
  }
}

export default ExpoPaymentService;