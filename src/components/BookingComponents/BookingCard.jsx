import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function BookingCard({ booking, onPress, onCancel, onChat, onPayment }) {
  const { colors } = useTheme();

  const getVehicleIcon = (vehicleType) => {
    const type = vehicleType.toLowerCase();
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

  const getDuration = () => {
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `${hours}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  };

  // Business logic for actions
  const isPending = booking.status === 'PENDING';
  const isConfirmed = booking.status === 'CONFIRMED';
  const isActive = booking.status === 'ACTIVE';
  const isCompleted = booking.status === 'COMPLETED';
  const isPaid = booking.payment_status === 'PAID';
  const paymentPending = booking.payment_status === 'PENDING';
  
  // Action permissions
  const canCancel = isPending || (isConfirmed && paymentPending);
  const needsPayment = isConfirmed && paymentPending;
  const canChat = (isConfirmed && isPaid) || isActive || isCompleted;
  
  // Status messages
  const getStatusMessage = () => {
    if (isPending) return 'Waiting for owner confirmation';
    if (needsPayment) return 'Complete payment to confirm booking';
    if (isConfirmed && isPaid) return 'Booking confirmed - Ready to start';
    if (isActive) return 'Rental in progress';
    if (isCompleted) return 'Rental completed';
    return booking.status;
  };
  
  const getStatusColor = () => {
    if (isPending) return '#FF8800';
    if (needsPayment) return '#FF6B35';
    if (isConfirmed && isPaid) return '#00C851';
    if (isActive) return '#007AFF';
    if (isCompleted) return '#6C757D';
    return colors.textSecondary;
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleIcon}>{getVehicleIcon(booking.vehicle.vehicle_type)}</Text>
          <View style={styles.vehicleDetails}>
            <Text style={[styles.vehicleName, { color: colors.text }]}>
              {booking.vehicle.brand} {booking.vehicle.model}
            </Text>
            {/* <Text style={[styles.bookingId, { color: colors.textSecondary }]}>
              #{booking.booking_id}
            </Text> */}
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {booking.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Booking Details */}
      <View style={styles.details}>
        <View style={styles.timeInfo}>
          <View style={styles.timeRow}>
            <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>From:</Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>
              {formatDateTime(booking.start_time)}
            </Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>To:</Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>
              {formatDateTime(booking.end_time)}
            </Text>
          </View>
        </View>
        
        <View style={[styles.durationContainer, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
          <Text style={[styles.durationLabel, { color: colors.textSecondary }]}>Duration</Text>
          <Text style={[styles.duration, { color: colors.primary }]}>
            {getDuration()}
          </Text>
        </View>
      </View>

      {/* Status Message */}
      <View style={[styles.statusSection, { backgroundColor: getStatusColor() + '10', borderTopColor: colors.border }]}>
        <Text style={[styles.statusMessage, { color: getStatusColor() }]}>
          {getStatusMessage()}
        </Text>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.priceInfo}>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            ₹{booking.total_amount}
          </Text>
          <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
            {isPaid ? 'Paid' : 'Total Amount'}
          </Text>
        </View>
        
        <View style={styles.actions}>
          {needsPayment && (
            <TouchableOpacity 
              style={[styles.primaryAction, { backgroundColor: '#FF6B35' }]}
              onPress={(e) => {
                e.stopPropagation();
                onPayment();
              }}
            >
              <Text style={styles.primaryActionText}>Pay Now</Text>
            </TouchableOpacity>
          )}
          
          {canChat && !needsPayment && (
            <TouchableOpacity 
              style={[styles.secondaryAction, { borderColor: colors.primary }]}
              onPress={(e) => {
                e.stopPropagation();
                onChat();
              }}
            >
              <Text style={[styles.secondaryActionText, { color: colors.primary }]}>💬 Chat</Text>
            </TouchableOpacity>
          )}
          
          {canCancel && (
            <TouchableOpacity 
              style={[styles.cancelAction, { borderColor: '#DC3545' }]}
              onPress={(e) => {
                e.stopPropagation();
                onCancel();
              }}
            >
              <Text style={[styles.cancelActionText, { color: '#DC3545' }]}>Cancel</Text>
            </TouchableOpacity>
          )}
          
          {!needsPayment && (
            <TouchableOpacity 
              style={[styles.viewAction, { backgroundColor: colors.primary }]}
              onPress={onPress}
            >
              <Text style={styles.viewActionText}>Details</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookingId: {
    fontSize: 12,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  timeInfo: {
    flex: 1,
    marginRight: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeLabel: {
    fontSize: 12,
    width: 35,
    marginRight: 8,
  },
  timeValue: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  durationContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 70,
  },
  durationLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  duration: {
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  priceInfo: {
    flex: 1,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 11,
  },
  statusSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  statusMessage: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryAction: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryAction: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cancelAction: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewAction: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});