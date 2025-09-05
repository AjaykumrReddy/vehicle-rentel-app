import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function ActiveBookingCard({ item, onChat }) {
  const { colors } = useTheme();

  const getVehicleIcon = (vehicleType) => {
    const type = vehicleType?.toLowerCase() || '';
    if (type.includes('bike')) return '🏍️';
    if (type.includes('scooter')) return '🛵';
    if (type.includes('car')) return '🚗';
    return '🛺';
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
        <View style={[styles.activeBadge, { backgroundColor: '#00C851' + '20' }]}>
          <Text style={[styles.activeText, { color: '#00C851' }]}>ACTIVE</Text>
        </View>
      </View>
      <View style={[styles.customerInfo, { borderTopColor: colors.border }]}>
        <View style={styles.customerDetails}>
          <Text style={[styles.customerPhone, { color: colors.text }]}>📞 {item.customer?.phone}</Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>₹{item.total_amount}</Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.chatButton, { borderColor: colors.primary }]}
          onPress={() => onChat && onChat(item)}
        >
          <Text style={[styles.chatButtonText, { color: colors.primary }]}>💬 Chat</Text>
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
  activeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  activeText: { fontSize: 12, fontWeight: '600' },
  customerInfo: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  customerDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customerPhone: { fontSize: 14, fontWeight: '500' },
  totalAmount: { fontSize: 18, fontWeight: '700' },
  actionButtons: { flexDirection: 'row', padding: 16, paddingTop: 12 },
  chatButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  chatButtonText: { fontSize: 14, fontWeight: '600' },
});