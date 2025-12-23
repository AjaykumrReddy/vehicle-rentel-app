import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../contexts/ThemeContext';
import { paymentAPI } from '../../api/paymentAPI';

export default function WebViewPaymentScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { booking } = route.params;
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const webViewRef = useRef(null);

  React.useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      const response = await paymentAPI.createOrder(
        booking.booking_id || booking.id,
        booking.total_amount
      );

      if (response.success) {
        const { order_id, amount, key } = response.data;
        const paymentHtml = generatePaymentHTML(order_id, amount, key);
        setPaymentUrl(`data:text/html;charset=utf-8,${encodeURIComponent(paymentHtml)}`);
      } else {
        Alert.alert('Error', 'Failed to initialize payment');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Payment initialization failed');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentHTML = (orderId, amount, key) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
          }
          .amount {
            font-size: 32px;
            font-weight: bold;
            color: #007AFF;
            margin: 20px 0;
          }
          .pay-button {
            background: #007AFF;
            color: white;
            border: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-top: 20px;
          }
          .pay-button:hover {
            background: #0056CC;
          }
          .vehicle-info {
            margin-bottom: 20px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <script>
          function startPayment() {
            const options = {
              key: '${key}' || 'rzp_test_RDpbQdPVx3MOT1',
              amount: ${amount},
              currency: 'INR',
              order_id: '${orderId}',
              name: 'Vehicle Rental',
              description: 'Payment for ${booking.vehicle?.brand} ${booking.vehicle?.model}',
              prefill: {
                email: '${booking.customer?.email || ''}',
                contact: '${booking.customer?.phone || ''}',
                name: '${booking.customer?.name || ''}'
              },
              theme: {
                color: '#007AFF'
              },
              handler: function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'PAYMENT_SUCCESS',
                  data: response
                }));
              },
              modal: {
                ondismiss: function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'PAYMENT_CANCELLED'
                  }));
                }
              }
            };

            const rzp = new Razorpay(options);
            rzp.open();
          }

          // Auto-start payment when page loads
          setTimeout(startPayment, 1000);
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'PAYMENT_SUCCESS') {
        setLoading(true);
        await verifyPayment(message.data);
      } else if (message.type === 'PAYMENT_CANCELLED') {
        Alert.alert('Payment Cancelled', 'You cancelled the payment process.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const response = await paymentAPI.verifyPayment({
        booking_id: booking.booking_id || booking.id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature
      });

      if (response.success) {
        Alert.alert(
          'Payment Successful!',
          'Your booking has been confirmed.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('PaymentSuccess', { 
                booking, 
                paymentData: response.data 
              })
            }
          ]
        );
      } else {
        Alert.alert('Payment Verification Failed', 'Please contact support.');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Payment verification failed');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            {paymentUrl ? 'Processing payment...' : 'Initializing payment...'}
          </Text>
        </View>
      ) : (
        paymentUrl && (
          <WebView
            ref={webViewRef}
            source={{ uri: paymentUrl }}
            style={styles.webview}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
          />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16,
    borderBottomWidth: 1 
  },
  backButton: { fontSize: 24 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16 
  },
  webview: { flex: 1 },
});