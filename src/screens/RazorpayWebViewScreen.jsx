import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useTheme } from '../contexts/ThemeContext';
import { Config } from '../config';

export default function RazorpayWebViewScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { paymentData, booking } = route.params;

  // Get callbacks from PaymentService
  const getCallbacks = () => {
    const PaymentService = require('../services/paymentService').default;
    return PaymentService.getCallbacks();
  };

  const startPayment = async () => {
    try {
      const options = {
        key: paymentData.key || Config.RAZORPAY_KEY,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        order_id: paymentData.order_id,
        name: 'Vehicle Rental',
        description: `Payment for ${booking.vehicle?.brand} ${booking.vehicle?.model}`,
        prefill: {
          email: booking.customer?.email || '',
          contact: booking.customer?.phone || '',
          name: booking.customer?.name || 'Customer'
        },
        theme: { color: '#007AFF' }
      };

      const data = await RazorpayCheckout.open(options);
      console.log('Payment Success:', data);
      await verifyPayment(data);
      
    } catch (error) {
      console.log('Payment Error:', error);
      const { onError } = getCallbacks();
      if (error.code === RazorpayCheckout.PAYMENT_CANCELLED) {
        if (onError) onError('Payment cancelled by user');
      } else {
        if (onError) onError('Payment failed. Please try again.');
      }
      navigation.goBack();
    }
  };



  const verifyPayment = async (paymentData) => {
    try {
      const { paymentAPI } = require('../api/paymentAPI');
      
      const verificationResponse = await paymentAPI.verifyPayment({
        booking_id: booking.booking_id || booking.id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature
      });

      const { onSuccess, onError } = getCallbacks();
      if (verificationResponse.success) {
        if (onSuccess) onSuccess(verificationResponse.data);
      } else {
        if (onError) onError('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      const { onError } = getCallbacks();
      if (onError) onError('Payment verification failed');
    }
  };

  React.useEffect(() => {
    startPayment();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Secure Payment</Text>
        <View style={{ width: 60 }} />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Opening Razorpay...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, borderBottomWidth: 1 },
  backButton: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, fontWeight: '500' },
});