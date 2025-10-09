import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Linking, Alert, Platform } from 'react-native';
import { calculateDistance } from '../../utils/mapUtils';
import { parsePoint } from '../../utils/mapUtils';
import { useTheme } from '../../contexts/ThemeContext';

export default function VehicleCard({ vehicle, onPress, userLocation, navigation }) {
  const { colors } = useTheme();
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
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

  const openDirections = async () => {
    const coords = parsePoint(vehicle.location);
    if (!coords) return;

    if (Platform.OS === 'android') {
      // Android: Use system intent to show all available map apps
      const geoUrl = `geo:${coords.latitude},${coords.longitude}?q=${coords.latitude},${coords.longitude}(${vehicle.brand} ${vehicle.model})`;
      
      try {
        const supported = await Linking.canOpenURL(geoUrl);
        if (supported) {
          await Linking.openURL(geoUrl);
        } else {
          // Fallback to Google Maps web
          const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`;
          await Linking.openURL(webUrl);
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to open navigation app');
      }
    } else {
      // iOS: Show options since iOS doesn't have system intent
      const mapOptions = [
        {
          text: 'Apple Maps',
          onPress: () => {
            const url = `http://maps.apple.com/?daddr=${coords.latitude},${coords.longitude}`;
            Linking.openURL(url);
          }
        },
        {
          text: 'Google Maps',
          onPress: async () => {
            const googleMapsUrl = `comgooglemaps://?daddr=${coords.latitude},${coords.longitude}`;
            const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`;
            
            try {
              const supported = await Linking.canOpenURL(googleMapsUrl);
              if (supported) {
                await Linking.openURL(googleMapsUrl);
              } else {
                await Linking.openURL(webUrl);
              }
            } catch (error) {
              await Linking.openURL(webUrl);
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ];

      Alert.alert('Get Directions', 'Choose your preferred map app', mapOptions);
    }
  };

  return (
    <View style={[styles.vehicleCard, { borderBottomColor: colors.border }]}>
      <TouchableOpacity style={styles.mainContent} onPress={onPress}>
        <View style={[styles.vehicleIcon, { backgroundColor: colors.background }]}>
          <Text style={styles.vehicleEmoji}>{getVehicleIcon(vehicle)}</Text>
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={[styles.vehicleName, { color: colors.text }]}>{vehicle.brand} {vehicle.model}</Text>
          <Text style={[styles.vehicleDistance, { color: colors.textSecondary }]}>{distance} away • {walkTime}</Text>
          <View style={styles.vehicleStatus}>
            <View style={[styles.statusDot, { backgroundColor: getMarkerColor(vehicle) }]} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>{vehicle.available ? 'Available' : 'Not Available'}</Text>
          </View>
          {showOwnerDetails && (
            <View style={[styles.ownerDetails, { backgroundColor: colors.background }]}>
              <Text style={[styles.ownerLabel, { color: colors.textSecondary }]}>Owner:</Text>
              <Text style={[styles.ownerName, { color: colors.text }]}>{vehicle.owner_name || 'N/A'}</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('VehicleBooking', { vehicle })}
          >
            <Text style={styles.actionButtonText}>Book</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={[styles.secondaryButton, { borderColor: colors.border }]}
          onPress={() => setShowOwnerDetails(!showOwnerDetails)}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Owner Info</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.secondaryButton, { borderColor: colors.border }]}
          onPress={openDirections}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vehicleCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  ownerDetails: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
  },
  ownerLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  ownerPhone: {
    fontSize: 12,
  },
  actions: {
    alignItems: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});