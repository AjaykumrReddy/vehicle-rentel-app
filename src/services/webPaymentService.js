import { paymentAPI } from '../api/paymentAPI';

class WebPaymentService {
  static async initiatePayment(booking, onSuccess, onError) {
    try {
      // Create Razorpay order
      const orderResponse = await paymentAPI.createOrder(
        booking.booking_id || booking.id,
        booking.total_amount * 100 // Convert to paise
      );

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create payment order');
      }

      const { order_id, amount, currency, key } = orderResponse.data;

      // Create Razorpay options
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        order_id: order_id,
        name: 'Vehicle Rental',
        description: `Payment for ${booking.vehicle?.brand} ${booking.vehicle?.model}`,
        prefill: {
          email: booking.customer?.email || '',
          contact: booking.customer?.phone || '',
          name: booking.customer?.name || ''
        },
        theme: {
          color: '#007AFF'
        },
        handler: async (response) => {
          console.log('Payment success:', response);
          await this.verifyPayment(response, booking, onSuccess, onError);
        },
        modal: {
          ondismiss: () => {
            onError('Payment cancelled by user');
          }
        }
      };

      // Use web-based Razorpay
      this.openRazorpayWeb(options);

    } catch (error) {
      console.error('Payment initiation error:', error);
      onError(error.message || 'Failed to initiate payment');
    }
  }

  static openRazorpayWeb(options) {
    // Create Razorpay script dynamically
    const script = `
      <html>
        <head>
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        </head>
        <body>
          <script>
            const options = ${JSON.stringify(options)};
            const rzp = new Razorpay(options);
            rzp.open();
          </script>
        </body>
      </html>
    `;

    // For now, show alert with payment details
    // In production, use WebView or proper Razorpay SDK
    alert(`Payment Required\\n\\nAmount: ₹${options.amount / 100}\\nOrder ID: ${options.order_id}\\n\\nPlease install Razorpay SDK for mobile payments.`);
    
    // Simulate successful payment for testing
    setTimeout(() => {
      const mockResponse = {
        razorpay_payment_id: 'pay_test_' + Date.now(),
        razorpay_order_id: options.order_id,
        razorpay_signature: 'mock_signature_' + Date.now()
      };
      options.handler(mockResponse);
    }, 2000);
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

export default WebPaymentService;