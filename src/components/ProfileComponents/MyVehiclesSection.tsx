import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

interface MyVehiclesSectionProps {
  vehicles: any[];
  onAddVehicle: () => void;
}

export default function MyVehiclesSection({ vehicles, onAddVehicle }: MyVehiclesSectionProps) {
  const getVehicleIcon = (vehicle: any) => {
    const type = vehicle.model?.toLowerCase() || '';
    if (type.includes('bike') || type.includes('pulsar') || type.includes('hunter')) return '🏍️';
    if (type.includes('activa') || type.includes('scooter')) return '🛵';
    return '🚗';
  };

  const getPrimaryPhoto = (photos: any[]) => {
    if (!photos || photos.length === 0) return null;
    const primary = photos.find(photo => photo.is_primary);
    return primary ? primary.photo_url : photos[0].photo_url;
  };

  if (vehicles.length === 0) return null;

  return (
    <View style={styles.vehiclesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Vehicles</Text>
        <TouchableOpacity onPress={onAddVehicle}>
          <Text style={styles.addVehicleText}>+ Add Vehicle</Text>
        </TouchableOpacity>
      </View>
      {vehicles.map((vehicle) => {
        const primaryPhoto = getPrimaryPhoto(vehicle.photos);
        return (
          <View key={vehicle.id} style={styles.vehicleItem}>
            <View style={styles.vehicleImageContainer}>
              {primaryPhoto ? (
                <Image source={{ uri: primaryPhoto }} style={styles.vehicleImage} />
              ) : (
                <View style={styles.vehicleIconContainer}>
                  <Text style={styles.vehicleEmoji}>{getVehicleIcon(vehicle)}</Text>
                </View>
              )}
            </View>
            <View style={styles.vehicleDetails}>
              <Text style={styles.vehicleName}>{vehicle.brand} {vehicle.model}</Text>
              <Text style={styles.vehicleLocation}>
                📍 {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
              </Text>
              <View style={styles.vehicleStatusContainer}>
                <View style={[styles.statusDot, { backgroundColor: vehicle.available ? '#00C851' : '#ff4444' }]} />
                <Text style={styles.vehicleStatus}>{vehicle.available ? 'Available' : 'Not Available'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.vehicleMenu}>
              <Text style={styles.menuDots}>⋮</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  vehiclesSection: {
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addVehicleText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  vehicleImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  vehicleIconContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleEmoji: {
    fontSize: 24,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  vehicleLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  vehicleStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  vehicleStatus: {
    fontSize: 12,
    color: '#666',
  },
  vehicleMenu: {
    padding: 8,
  },
  menuDots: {
    fontSize: 16,
    color: '#999',
  },
});