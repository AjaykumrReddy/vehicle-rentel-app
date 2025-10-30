import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../contexts/ThemeContext';

export default function PaymentSuccessScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { booking, paymentData } = route.params;

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={[styles.successIcon, { backgroundColor: '#00C851' + '20' }]}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        {/* Success Message */}
        <Text style={[styles.successTitle, { color: colors.text }]}>
          Payment Successful!
        </Text>
        <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
          Your booking has been confirmed
        </Text>

        {/* Booking Details */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Booking Confirmed</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Vehicle:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {booking.vehicle?.brand} {booking.vehicle?.model}
            </Text>
          </View>
          
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
          
          <View style={[styles.detailRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Amount Paid:</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              ₹{booking.total_amount}
            </Text>
          </View>
        </View>

        {/* Payment ID */}
        {paymentData?.razorpay_payment_id && (
          <View style={[styles.paymentIdCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.paymentIdLabel, { color: colors.textSecondary }]}>
              Payment ID
            </Text>
            <Text style={[styles.paymentIdValue, { color: colors.text }]}>
              {paymentData.razorpay_payment_id}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.border }]}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
            View Bookings
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.primaryButtonText}>Book Another</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  successIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  checkmark: { fontSize: 40, color: '#00C851', fontWeight: 'bold' },
  successTitle: { fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  successSubtitle: { fontSize: 16, marginBottom: 32, textAlign: 'center' },
  detailsCard: { width: '100%', borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right' },
  totalRow: { paddingTop: 12, borderTopWidth: 1, marginTop: 8 },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '700' },
  paymentIdCard: { width: '100%', borderRadius: 8, borderWidth: 1, padding: 12, alignItems: 'center' },
  paymentIdLabel: { fontSize: 12, marginBottom: 4 },
  paymentIdValue: { fontSize: 12, fontFamily: 'monospace' },
  footer: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1 },
  secondaryButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  secondaryButtonText: { fontSize: 14, fontWeight: '600' },
  primaryButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});