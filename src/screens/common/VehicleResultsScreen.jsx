import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { searchVehicles } from '../../api/vehicleService';

export default function VehicleResultsScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { location, startDate, endDate, radiusKm } = route.params;
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVehicles = async () => {
    try {
      const data = await searchVehicles(
        location.latitude,
        location.longitude,
        startDate,
        endDate,
        radiusKm
      );
      setVehicles(data);
    } catch (error) {
      console.error('Search error:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  const getVehicleIcon = (type) => {
    const vehicleType = type.toLowerCase();
    if (vehicleType.includes('bike')) return '🏍️';
    if (vehicleType.includes('scooter')) return '🛵';
    if (vehicleType.includes('car')) return '🚗';
    return '🛺';
  };

  const formatDistance = (meters) => {
    if (meters < 1000) return `${meters}m away`;
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  const renderVehicleCard = ({ item }) => {
    const primaryPhoto = item.photos?.find(p => p.is_primary) || item.photos?.[0];
    
    return (
      <TouchableOpacity
        style={[styles.vehicleCard, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('VehicleBooking', { vehicle: item })}
      >
        {/* Full Width Image */}
        {primaryPhoto ? (
          <Image source={{ uri: primaryPhoto.photo_url }} style={styles.vehicleImage} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: colors.background }]}>
            <Text style={styles.vehicleIcon}>{getVehicleIcon(item.vehicle_type)}</Text>
          </View>
        )}
        
        {/* Vehicle Details at Bottom */}
        <View style={styles.vehicleDetails}>
          <View style={styles.topRow}>
            <View style={styles.vehicleInfo}>
              <Text style={[styles.vehicleName, { color: colors.text }]}>
                {item.brand} {item.model}
              </Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>⭐ 4.8</Text>
                <Text style={[styles.distance, { color: colors.textSecondary }]}>
                  • {formatDistance(item.distance_meters)}
                </Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={[styles.hourlyRate, { color: colors.primary }]}>
                ₹{item.hourly_rate}/hr
              </Text>
              {item.daily_rate && (
                <Text style={[styles.dailyRate, { color: colors.textSecondary }]}>
                  ₹{item.daily_rate}/day
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    };
  };

  const renderHeader = () => {
    const startDateTime = formatDateTime(startDate);
    const endDateTime = formatDateTime(endDate);
    
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backIcon, { color: colors.primary }]}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {vehicles.length} vehicles found at
            </Text>
            <Text style={[styles.locationText, { color: colors.text }]}>
              {location.name?.split(',')[0]}
            </Text>
          </View>
          <View style={styles.dateSection}>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {startDateTime.date} {startDateTime.time}
            </Text>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {endDateTime.date} {endDateTime.time}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🚗</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Vehicles Found</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Try adjusting your search location or time period
      </Text>
      <TouchableOpacity 
        style={[styles.retryButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.retryButtonText}>Modify Search</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Finding vehicles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      <FlatList
        data={vehicles}
        renderItem={renderVehicleCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    padding: 16, 
    paddingTop: 50,
    paddingBottom: 16
  },
  backIcon: { fontSize: 24, marginRight: 12 },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 0.7,
    paddingRight: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateSection: {
    flex: 0.3,
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 2,
  },
  listContainer: { padding: 16, paddingTop: 0 },
  vehicleCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  vehicleImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleIcon: { fontSize: 60},
  vehicleDetails: {
    backgroundColor: '#e3e1e1ff',
    padding: 10
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vehicleInfo: {
    flex: 1,
    marginRight: 16,
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#ff9500',
    fontWeight: '600',
  },
  distance: {
    fontSize: 14,
    marginLeft: 8,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  hourlyRate: {
    fontSize: 18,
    fontWeight: '700',
  },
  dailyRate: {
    fontSize: 14,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 12, fontSize: 16 },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});