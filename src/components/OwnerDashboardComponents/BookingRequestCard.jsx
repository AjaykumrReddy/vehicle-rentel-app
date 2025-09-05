import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function BookingRequestCard({ item, onAccept, onReject, onChat }) {
  const { colors } = useTheme();

  const getVehicleIcon = (vehicleType) => {
    const type = vehicleType?.toLowerCase() || '';
    if (type.includes('bike')) return '🏍️';
    if (type.includes('scooter')) return '🛵';
    if (type.includes('car')) return '🚗';
    return '🛺';
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `${hours}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  };

  return (
    <View style={[styles.requestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleIcon}>{getVehicleIcon(item.vehicle?.vehicle_type)}</Text>
          <View style={styles.vehicleDetails}>
            <Text style={[styles.vehicleName, { color: colors.text }]}>
              {item.vehicle?.brand} {item.vehicle?.model}
            </Text>
            <Text style={[styles.vehicleReg, { color: colors.textSecondary }]}>
              {item.vehicle?.license_plate}
            </Text>
            <Text style={[styles.customerName, { color: colors.textSecondary }]}>
              by {item.customer?.name}
            </Text>
          </View>
        </View>
        <View style={[styles.pendingBadge, { backgroundColor: '#FF8800' + '20' }]}>
          <Text style={[styles.pendingText, { color: '#FF8800' }]}>PENDING</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.timeInfo}>
          <View style={styles.timeRow}>
            <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>From:</Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>
              {formatDateTime(item.start_time)}
            </Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>To:</Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>
              {formatDateTime(item.end_time)}
            </Text>
          </View>
        </View>
        
        <View style={[styles.durationContainer, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
          <Text style={[styles.durationLabel, { color: colors.textSecondary }]}>Duration</Text>
          <Text style={[styles.duration, { color: colors.primary }]}>
            {getDuration(item.start_time, item.end_time)}
          </Text>
        </View>
      </View>

      <View style={[styles.customerInfo, { borderTopColor: colors.border }]}>
        <View style={styles.customerDetails}>
          <Text style={[styles.customerPhone, { color: colors.text }]}>
            📞 {item.customer?.phone}
          </Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            ₹{item.total_amount}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.chatButton, { borderColor: colors.primary }]}
          onPress={() => onChat && onChat(item)}
        >
          <Text style={[styles.chatButtonText, { color: colors.primary }]}>💬 Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.rejectButton, { borderColor: '#DC3545' }]}
          onPress={() => onReject(item.booking_id)}
        >
          <Text style={[styles.rejectButtonText, { color: '#DC3545' }]}>Reject</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.acceptButton, { backgroundColor: '#00C851' }]}
          onPress={() => onAccept(item.booking_id)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  requestCard: { borderRadius: 12, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 12 },
  vehicleInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  vehicleIcon: { fontSize: 32, marginRight: 12 },
  vehicleDetails: { flex: 1 },
  vehicleName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  vehicleReg: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
  customerName: { fontSize: 14, fontWeight: '400' },
  pendingBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  pendingText: { fontSize: 12, fontWeight: '600' },
  bookingDetails: { paddingHorizontal: 16, paddingBottom: 12 },
  timeInfo: { marginBottom: 12 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  timeLabel: { fontSize: 14, fontWeight: '500' },
  timeValue: { fontSize: 14, fontWeight: '600' },
  durationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1 },
  durationLabel: { fontSize: 14, fontWeight: '500' },
  duration: { fontSize: 16, fontWeight: '700' },
  customerInfo: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  customerDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customerPhone: { fontSize: 14, fontWeight: '500' },
  totalAmount: { fontSize: 18, fontWeight: '700' },
  actionButtons: { flexDirection: 'row', padding: 16, gap: 8 },
  chatButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  chatButtonText: { fontSize: 14, fontWeight: '600' },
  rejectButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, alignItems: 'center' },
  rejectButtonText: { fontSize: 14, fontWeight: '600' },
  acceptButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  acceptButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});