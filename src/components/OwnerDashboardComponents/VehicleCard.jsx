import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function VehicleCard({ item, onToggleAvailability, onEditRates }) {
  const { colors } = useTheme();

  const getVehicleIcon = (vehicleType) => {
    const type = vehicleType?.toLowerCase() || '';
    if (type.includes('bike')) return '🏍️';
    if (type.includes('scooter')) return '🛵';
    if (type.includes('car')) return '🚗';
    return '🛺';
  };

  return (
    <View style={[styles.vehicleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleIcon}>{getVehicleIcon(item.vehicle_type)}</Text>
          <View style={styles.vehicleDetails}>
            <Text style={[styles.vehicleName, { color: colors.text }]}>{item.brand} {item.model}</Text>
            <Text style={[styles.vehicleReg, { color: colors.textSecondary }]}>{item.registration_number}</Text>
          </View>
        </View>
        <Switch
          value={item.is_available}
          onValueChange={() => onToggleAvailability(item.vehicle_id)}
          trackColor={{ false: colors.border, true: colors.primary + '40' }}
          thumbColor={item.is_available ? colors.primary : colors.textSecondary}
        />
      </View>
      <View style={styles.vehicleStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>₹{item.hourly_rate}/hr</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rate</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{item.total_bookings || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bookings</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.editButton, { borderColor: colors.primary }]}
        onPress={() => onEditRates(item)}
      >
        <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit Rates</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  vehicleCard: { borderRadius: 12, borderWidth: 1, marginBottom: 16, padding: 16 },
  vehicleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  vehicleInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  vehicleIcon: { fontSize: 32, marginRight: 12 },
  vehicleDetails: { flex: 1 },
  vehicleName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  vehicleReg: { fontSize: 12, fontWeight: '500' },
  vehicleStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  statLabel: { fontSize: 12 },
  editButton: { paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  editButtonText: { fontSize: 14, fontWeight: '600' },
});