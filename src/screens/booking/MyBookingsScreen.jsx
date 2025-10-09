import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { useTheme } from '../../contexts/ThemeContext';
import BookingCard from '../../components/BookingComponents/BookingCard';
import BookingFilters from '../../components/BookingComponents/BookingFilters';
import { getUserBookings } from '../../api/bookingService';

export default function MyBookingsScreen({ navigation }) {
  const { colors } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState(0);
  const pagerRef = useRef(null);

  const filters = [
    { key: 0, label: 'All', count: bookings?.length || 0 },
    { key: 1, label: 'Active', count: bookings?.filter(b => ['CONFIRMED', 'ACTIVE'].includes(b.status)).length || 0 },
    { key: 2, label: 'Pending', count: bookings?.filter(b => b.status === 'PENDING').length || 0 },
    { key: 3, label: 'Completed', count: bookings?.filter(b => b.status === 'COMPLETED').length || 0 },
  ];

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getUserBookings();
      const bookingsData = response.bookings || [];
      
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

  const getFilteredBookings = (filterIndex) => {
    if (!bookings || !Array.isArray(bookings)) return [];
    if (filterIndex === 0) return bookings;
    if (filterIndex === 1) return bookings.filter(b => ['CONFIRMED', 'ACTIVE'].includes(b.status));
    if (filterIndex === 2) return bookings.filter(b => b.status === 'PENDING');
    if (filterIndex === 3) return bookings.filter(b => b.status === 'COMPLETED');
    return bookings;
  };

  const handleFilterPress = (filterIndex) => {
    setActiveFilter(filterIndex);
    pagerRef.current?.setPage(filterIndex);
  };

  const handlePageSelected = (e) => {
    setActiveFilter(e.nativeEvent.position);
  };

  const handleBookingPress = (booking) => {
    navigation.navigate('BookingDetails', { booking });
  };

  const handleChatPress = (booking) => {
    navigation.navigate('Chat', { booking });
  };

  const handlePaymentPress = (booking) => {
    navigation.navigate('Payment', { booking });
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      // TODO: Implement cancel booking API
      console.log('Cancelling booking:', bookingId);
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        (booking.booking_id || booking.id) === bookingId 
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

  // const filteredBookings = getFilteredBookings();

  const renderFilterContent = (filterIndex) => {
    const filteredBookings = getFilteredBookings(filterIndex);
    
    return (
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
              {filterIndex === 0 
                ? "You haven't made any bookings yet"
                : `No ${filters[filterIndex].label.toLowerCase()} bookings`
              }
            </Text>
            {filterIndex === 0 && (
              <TouchableOpacity 
                style={[styles.exploreButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Map')}
              >
                <Text style={styles.exploreButtonText}>Explore Vehicles</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredBookings.map((booking, index) => (
            <BookingCard
              key={booking.booking_id || booking.id || `booking-${index}`}
              booking={booking}
              onPress={() => handleBookingPress(booking)}
              onCancel={() => handleCancelBooking(booking.booking_id || booking.id)}
              onChat={() => handleChatPress(booking)}
              onPayment={() => handlePaymentPress(booking)}
            />
          ))
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Bookings</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {bookings?.length || 0} total booking{(bookings?.length || 0) !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Filters */}
      <View style={[styles.filtersContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                activeFilter === filter.key && { backgroundColor: colors.primary + '15', borderColor: colors.primary }
              ]}
              onPress={() => handleFilterPress(filter.key)}
            >
              <Text style={[
                styles.filterText,
                { color: activeFilter === filter.key ? colors.primary : colors.textSecondary }
              ]}>
                {filter.label}
              </Text>
              <Text style={[
                styles.filterCount,
                { color: activeFilter === filter.key ? colors.primary : colors.textSecondary }
              ]}>
                {filter.count}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Swipeable Content */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {filters.map((filter) => (
          <View key={filter.key} style={styles.pageContent}>
            {renderFilterContent(filter.key)}
          </View>
        ))}
      </PagerView>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  filtersContainer: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  filtersScroll: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  filterCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  pagerView: {
    flex: 1,
  },
  pageContent: {
    flex: 1,
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