import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import BookingCard from '../components/BookingComponents/BookingCard';
import BookingFilters from '../components/BookingComponents/BookingFilters';
import { getUserBookings } from '../api/bookingService';

export default function MyBookingsScreen({ navigation }) {
  const { colors } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filters = [
    { key: 'ALL', label: 'All', count: bookings?.length || 0 },
    { key: 'ACTIVE', label: 'Active', count: bookings?.filter(b => ['CONFIRMED', 'ACTIVE'].includes(b.status)).length || 0 },
    { key: 'PENDING', label: 'Pending', count: bookings?.filter(b => b.status === 'PENDING').length || 0 },
    { key: 'COMPLETED', label: 'Completed', count: bookings?.filter(b => b.status === 'COMPLETED').length || 0 },
  ];

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getUserBookings();
      console.log("response", response);
      const bookingsData = response.bookings || [];
      console.log("bookings", bookingsData);
      
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const getFilteredBookings = () => {
    if (!bookings || !Array.isArray(bookings)) return [];
    if (activeFilter === 'ALL') return bookings;
    if (activeFilter === 'ACTIVE') return bookings.filter(b => ['CONFIRMED', 'ACTIVE'].includes(b.status));
    if (activeFilter === 'PENDING') return bookings.filter(b => b.status === 'PENDING');
    if (activeFilter === 'COMPLETED') return bookings.filter(b => b.status === 'COMPLETED');
    return bookings;
  };

  const handleBookingPress = (booking) => {
    navigation.navigate('BookingDetails', { booking });
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      // TODO: Implement cancel booking API
      console.log('Cancelling booking:', bookingId);
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'CANCELLED' }
          : booking
      ));
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading your bookings...</Text>
      </View>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Bookings</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {bookings?.length || 0} total booking{(bookings?.length || 0) !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Filters */}
      <BookingFilters 
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Bookings List */}
      <ScrollView
        style={styles.bookingsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>📅</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No bookings found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {activeFilter === 'ALL' 
                ? "You haven't made any bookings yet"
                : `No ${activeFilter.toLowerCase()} bookings`
              }
            </Text>
            {activeFilter === 'ALL' && (
              <TouchableOpacity 
                style={[styles.exploreButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Map')}
              >
                <Text style={styles.exploreButtonText}>Explore Vehicles</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onPress={() => handleBookingPress(booking)}
              onCancel={() => handleCancelBooking(booking.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  bookingsList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});