import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import PaymentService from '../../services/paymentService';

export default function PaymentScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { booking } = route.params;
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    const status = await PaymentService.getPaymentStatus(booking.booking_id || booking.id);
    setPaymentStatus(status);
  };

  const handlePayment = () => {
    navigation.navigate('WebViewPayment', { booking });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVehicleIcon = (vehicleType) => {
    const type = vehicleType?.toLowerCase() || '';
    if (type.includes('bike')) return '🏍️';
    if (type.includes('scooter')) return '🛵';
    if (type.includes('car')) return '🚗';
    return '🛺';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Booking Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Booking Summary</Text>
          
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleIcon}>{getVehicleIcon(booking.vehicle?.vehicle_type)}</Text>
            <View style={styles.vehicleDetails}>
              <Text style={[styles.vehicleName, { color: colors.text }]}>
                {booking.vehicle?.brand} {booking.vehicle?.model}
              </Text>
              <Text style={[styles.vehicleType, { color: colors.textSecondary }]}>
                {booking.vehicle?.vehicle_type}
              </Text>
            </View>
          </View>

          <View style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>From:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDateTime(booking.start_time)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>To:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDateTime(booking.end_time)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Breakdown */}
        <View style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Payment Details</Text>
          
          <View style={styles.paymentBreakdown}>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: colors.text }]}>Base Amount</Text>
              <Text style={[styles.paymentValue, { color: colors.text }]}>
                ₹{booking.base_amount || (booking.total_amount - 60)}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: colors.text }]}>Security Deposit</Text>
              <Text style={[styles.paymentValue, { color: colors.text }]}>
                ₹{booking.security_deposit || 50}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: colors.text }]}>Platform Fee</Text>
              <Text style={[styles.paymentValue, { color: colors.text }]}>
                ₹{booking.platform_fee || 10}
              </Text>
            </View>
            <View style={[styles.paymentRow, styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                ₹{booking.total_amount}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Status */}
        {paymentStatus && (
          <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Payment Status</Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: paymentStatus.status === 'PAID' ? '#00C851' + '20' : '#FF8800' + '20' 
            }]}>
              <Text style={[styles.statusText, { 
                color: paymentStatus.status === 'PAID' ? '#00C851' : '#FF8800' 
              }]}>
                {paymentStatus.status}
              </Text>
            </View>
          </View>
        )}

        {/* Security Info */}
        <View style={[styles.securityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.securityTitle, { color: colors.text }]}>🔒 Secure Payment</Text>
          <Text style={[styles.securityText, { color: colors.textSecondary }]}>
            Your payment is secured by Razorpay with 256-bit SSL encryption. 
            We support UPI, Cards, Wallets, and Net Banking.
          </Text>
        </View>
      </ScrollView>

      {/* Payment Button */}
      {(!paymentStatus || paymentStatus.status !== 'PAID') && (
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: colors.primary }]}
            onPress={handlePayment}
            disabled={false}
          >
            <Text style={styles.payButtonText}>
              Pay ₹{booking.total_amount}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, borderBottomWidth: 1 },
  backButton: { fontSize: 24 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  summaryCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  vehicleInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  vehicleIcon: { fontSize: 32, marginRight: 12 },
  vehicleDetails: { flex: 1 },
  vehicleName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  vehicleType: { fontSize: 14 },
  bookingDetails: { gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: '500' },
  paymentCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  paymentBreakdown: { gap: 12 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between' },
  paymentLabel: { fontSize: 14 },
  paymentValue: { fontSize: 14, fontWeight: '500' },
  totalRow: { paddingTop: 12, borderTopWidth: 1 },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '700' },
  statusCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  securityCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  securityTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  securityText: { fontSize: 12, lineHeight: 18 },
  footer: { padding: 16, borderTopWidth: 1 },
  payButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  payButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});