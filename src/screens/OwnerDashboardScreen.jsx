import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../config';
import PushNotificationAPI from '../services/pushNotificationAPI';

export default function OwnerDashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookingRequests();
  }, []);

  const loadBookingRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles!inner(
            vehicle_id,
            brand,
            model,
            vehicle_type,
            owner_id
          ),
          customer:users(
            user_id,
            name,
            phone,
            email
          )
        `)
        .eq('vehicle.owner_id', user.id)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookingRequests(data || []);
    } catch (error) {
      console.error('Error loading booking requests:', error);
      Alert.alert('Error', 'Failed to load booking requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const status = action === 'accept' ? 'CONFIRMED' : 'REJECTED';
      
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('booking_id', bookingId);

      if (error) throw error;

      // Send notification to customer
      await PushNotificationAPI.sendBookingStatusNotification(bookingId, status);

      // Remove from pending list
      setBookingRequests(prev => prev.filter(req => req.booking_id !== bookingId));

      Alert.alert(
        'Success',
        `Booking ${action === 'accept' ? 'accepted' : 'rejected'} successfully`
      );
    } catch (error) {
      console.error('Error updating booking:', error);
      Alert.alert('Error', 'Failed to update booking status');
    }
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

  const getVehicleIcon = (vehicleType) => {
    const type = vehicleType.toLowerCase();
    if (type.includes('bike')) return '🏍️';
    if (type.includes('scooter')) return '🛵';
    if (type.includes('car')) return '🚗';
    return '🛺';
  };

  const renderBookingRequest = ({ item }) => (
    <View style={[styles.requestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleIcon}>
            {getVehicleIcon(item.vehicle.vehicle_type)}
          </Text>
          <View style={styles.vehicleDetails}>
            <Text style={[styles.vehicleName, { color: colors.text }]}>
              {item.vehicle.brand} {item.vehicle.model}
            </Text>
            <Text style={[styles.customerName, { color: colors.textSecondary }]}>
              by {item.customer.name}
            </Text>
          </View>
        </View>
        <View style={[styles.pendingBadge, { backgroundColor: '#FF8800' + '20' }]}>
          <Text style={[styles.pendingText, { color: '#FF8800' }]}>PENDING</Text>
        </View>
      </View>

      {/* Booking Details */}
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

      {/* Customer Info */}
      <View style={[styles.customerInfo, { borderTopColor: colors.border }]}>
        <View style={styles.customerDetails}>
          <Text style={[styles.customerPhone, { color: colors.text }]}>
            📞 {item.customer.phone}
          </Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            ₹{item.total_amount}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.rejectButton, { borderColor: '#DC3545' }]}
          onPress={() => handleBookingAction(item.booking_id, 'reject')}
        >
          <Text style={[styles.rejectButtonText, { color: '#DC3545' }]}>
            Reject
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.acceptButton, { backgroundColor: '#00C851' }]}
          onPress={() => handleBookingAction(item.booking_id, 'accept')}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Pending Requests
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        You'll see new booking requests here
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Owner Dashboard
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {bookingRequests.length} pending requests
        </Text>
      </View>

      {/* Booking Requests List */}
      <FlatList
        data={bookingRequests}
        renderItem={renderBookingRequest}
        keyExtractor={(item) => item.booking_id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadBookingRequests();
            }}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  requestCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
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
  customerName: {
    fontSize: 12,
  },
  pendingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bookingDetails: {
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
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  customerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  customerPhone: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});