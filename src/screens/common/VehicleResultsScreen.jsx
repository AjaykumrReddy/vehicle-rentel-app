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
      console.log("vehicles data - ", data)
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
        style={[styles.vehicleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('VehicleBooking', { vehicle: item })}
      >
        <View style={styles.cardContent}>
          {primaryPhoto ? (
            <Image source={{ uri: primaryPhoto.photo_url }} style={styles.vehicleImage} />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: colors.background }]}>
              <Text style={styles.vehicleIcon}>{getVehicleIcon(item.vehicle_type)}</Text>
            </View>
          )}
          
          <View style={styles.vehicleInfo}>
            <View style={styles.vehicleHeader}>
              <Text style={[styles.vehicleName, { color: colors.text }]}>
                {item.brand} {item.model}
              </Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>⭐ 4.8</Text>
              </View>
            </View>
            
            <Text style={[styles.vehicleType, { color: colors.textSecondary }]}>
              {item.vehicle_type} • {item.year} • {item.color}
            </Text>
            
            <Text style={[styles.ownerName, { color: colors.textSecondary }]}>
              by {item.owner_name}
            </Text>
            
            <Text style={[styles.distance, { color: colors.primary }]}>
              📍 {formatDistance(item.distance_meters)}
            </Text>
            
            <View style={styles.pricingRow}>
              <View style={styles.pricing}>
                <Text style={[styles.hourlyRate, { color: colors.text }]}>
                  ₹{item.hourly_rate}/hr
                </Text>
                {item.daily_rate && (
                  <Text style={[styles.dailyRate, { color: colors.textSecondary }]}>
                    ₹{item.daily_rate}/day
                  </Text>
                )}
              </View>
              <TouchableOpacity 
                style={[styles.bookButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('VehicleBooking', { vehicle: item })}
              >
                <Text style={styles.bookButtonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.headerInfo}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Available Vehicles</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {vehicles.length} vehicles found near {location.name?.split(',')[0]}
        </Text>
      </View>
    </View>
  );

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
    alignItems: 'center', 
    padding: 16, 
    paddingTop: 50 
  },
  backButton: { fontSize: 16, fontWeight: '600', marginRight: 16 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  listContainer: { padding: 16, paddingTop: 0 },
  vehicleCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardContent: { flexDirection: 'row', padding: 16 },
  vehicleImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleIcon: { fontSize: 40 },
  vehicleInfo: { flex: 1 },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vehicleName: { fontSize: 18, fontWeight: '700', flex: 1 },
  ratingContainer: { marginLeft: 8 },
  rating: { fontSize: 12, color: '#ff9500' },
  vehicleType: { fontSize: 14, marginBottom: 4 },
  ownerName: { fontSize: 12, marginBottom: 8 },
  distance: { fontSize: 12, fontWeight: '600', marginBottom: 12 },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricing: { flex: 1 },
  hourlyRate: { fontSize: 16, fontWeight: '700' },
  dailyRate: { fontSize: 12, marginTop: 2 },
  bookButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
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