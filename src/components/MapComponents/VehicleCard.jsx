import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { calculateDistance } from '../../utils/mapUtils';
import { parsePoint } from '../../utils/mapUtils';

export default function VehicleCard({ vehicle, onPress, userLocation }) {
  const getVehicleIcon = (vehicle) => {
    const type = vehicle.vehicle_type.toLowerCase();
    if (type.includes('bike')) return '🏍️';
    if (type.includes('scooter')) return '🛵';
    if (type.includes('car')) return '🚗';
    return '🛺';
  };

  const getMarkerColor = (vehicle) => {
    return vehicle.available ? '#00C851' : '#ff4444';
  };

  const getDistanceInfo = () => {
    const coords = parsePoint(vehicle.location)
    const latitude = coords.latitude
    const longitude = coords.longitude
    
    if (!userLocation || !latitude || !longitude) {
      return { distance: 'N/A', walkTime: 'N/A' };
    }

    const distanceInMeters = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      latitude,
      longitude
    );

    const distance = distanceInMeters < 1000 
      ? `${Math.round(distanceInMeters)}m`
      : `${(distanceInMeters / 1000).toFixed(1)}km`;

    // Average walking speed: 5 km/h = 1.39 m/s
    // Walk time = distance / speed
    const walkTimeMinutes = Math.ceil(distanceInMeters / (5000 / 60));
    const walkTime = walkTimeMinutes < 60 
      ? `${walkTimeMinutes} min walk`
      : `${Math.floor(walkTimeMinutes / 60)}h ${walkTimeMinutes % 60}m walk`;

    return { distance, walkTime };
  };

  const { distance, walkTime } = getDistanceInfo();

  return (
    <TouchableOpacity style={styles.vehicleCard} onPress={onPress}>
      <View style={styles.vehicleIcon}>
        <Text style={styles.vehicleEmoji}>{getVehicleIcon(vehicle)}</Text>
      </View>
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleName}>{vehicle.brand} {vehicle.model}</Text>
        <Text style={styles.vehicleDistance}>{distance} away • {walkTime}</Text>
        <View style={styles.vehicleStatus}>
          <View style={[styles.statusDot, { backgroundColor: getMarkerColor(vehicle) }]} />
          <Text style={styles.statusText}>{vehicle.available ? 'Available' : 'Not Available'}</Text>
        </View>
      </View>
      <View style={styles.vehiclePrice}>
        <Text style={styles.priceText}>₹50/hr</Text>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  vehicleCard: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  vehicleEmoji: {
    fontSize: 24,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vehicleDistance: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  vehicleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  vehiclePrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});