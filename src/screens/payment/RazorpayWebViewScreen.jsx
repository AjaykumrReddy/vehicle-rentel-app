import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useTheme } from '../../contexts/ThemeContext';
import { Config } from '../../config';

export default function RazorpayWebViewScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { paymentData, booking } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // Get callbacks from PaymentService
  const getCallbacks = () => {
    const PaymentService = require('../../services/paymentService').default;
    return PaymentService.getCallbacks();
  };

  const startPayment = async () => {
    try {
      setIsProcessing(true);
      
      // Validate payment data
      if (!paymentData.order_id || !paymentData.amount) {
        throw new Error('Invalid payment data');
      }

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
        theme: { color: '#007AFF' },
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 300, // 5 minutes
        remember_customer: false
      };

      console.log('Starting payment with options:', { ...options, key: 'HIDDEN' });
      const data = await RazorpayCheckout.open(options);
      console.log('Payment Success:', data);
      await verifyPayment(data);
      
    } catch (error) {
      console.log('Payment Error:', error);
      setIsProcessing(false);
      handlePaymentError(error);
    }
  };

  const handlePaymentError = (error) => {
    const { onError } = getCallbacks();
    
    if (error.code === RazorpayCheckout.PAYMENT_CANCELLED) {
      if (onError) onError('Payment cancelled by user');
      navigation.goBack();
      return;
    }

    // Check if we can retry
    if (retryCount < maxRetries && error.description?.includes('network')) {
      Alert.alert(
        'Payment Failed',
        'Network issue detected. Would you like to retry?',
        [
          { text: 'Cancel', onPress: () => navigation.goBack() },
          { 
            text: 'Retry', 
            onPress: () => {
              setRetryCount(prev => prev + 1);
              setTimeout(startPayment, 1000);
            }
          }
        ]
      );
    } else {
      // Show specific error messages
      let errorMessage = 'Payment failed. Please try again.';
      
      if (error.description?.includes('insufficient')) {
        errorMessage = 'Insufficient balance. Please check your account.';
      } else if (error.description?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.description?.includes('bank')) {
        errorMessage = 'Bank server issue. Please try a different payment method.';
      }
      
      if (onError) onError(errorMessage);
      navigation.goBack();
    }
  };



  const verifyPayment = async (paymentData) => {
    try {
      const { paymentAPI } = require('../../api/paymentAPI');
      
      console.log('Verifying payment:', paymentData.razorpay_payment_id);
      
      const verificationResponse = await paymentAPI.verifyPayment({
        booking_id: booking.booking_id || booking.id,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature
      });

      const { onSuccess, onError } = getCallbacks();
      if (verificationResponse.success) {
        console.log('Payment verified successfully');
        if (onSuccess) onSuccess(verificationResponse.data);
      } else {
        console.error('Payment verification failed:', verificationResponse);
        if (onError) onError('Payment completed but verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      const { onError } = getCallbacks();
      if (onError) onError('Payment completed but verification failed. Please contact support.');
    } finally {
      setIsProcessing(false);
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
        {isProcessing ? (
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Processing payment...</Text>
            {retryCount > 0 && (
              <Text style={[styles.retryText, { color: colors.textSecondary }]}>Retry attempt {retryCount}/{maxRetries}</Text>
            )}
          </>
        ) : (
          <Text style={[styles.loadingText, { color: colors.text }]}>Opening Razorpay...</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  backButton: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, fontWeight: '500', marginTop: 16 },
  retryText: { fontSize: 14, marginTop: 8 },
});