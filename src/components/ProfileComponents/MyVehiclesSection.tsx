import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal } from 'react-native';
import CustomAlert from '../CustomAlert';
import { useAlert } from '../../hooks/useAlert';
import { deleteVehicle } from '../../api/vehicleService';

interface MyVehiclesSectionProps {
  vehicles: any[];
  onAddVehicle: () => void;
  onVehicleDeleted: (vehicleId: string) => void;
  navigation?: any;
}

export default function MyVehiclesSection({ vehicles, onAddVehicle, onVehicleDeleted, navigation }: MyVehiclesSectionProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isVehicleDeleting, setIsVehicleDeleting] = useState(false);
  const { alertConfig, visible, hideAlert, showError, showSuccess, showWarning } = useAlert();

  const handleMenuPress = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setShowMenu(true);
  };

  const handleMenuOption = (option: string) => {
    setShowMenu(false);
    if (navigation) {
      navigation.navigate(option, { selectedVehicle: selectedVehicle })
    } else {
      console.log(`Navigate to ${option} with vehicle:`, selectedVehicle?.id);
    }
  };

  const handleDeleteVehicle = () => {
    setShowMenu(false);
    showWarning(
      'Delete Vehicle',
      `Are you sure you want to delete ${selectedVehicle?.brand} ${selectedVehicle?.model}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsVehicleDeleting(true)
              await deleteVehicle(selectedVehicle?.id)
              onVehicleDeleted(selectedVehicle?.id);
              hideAlert();
              setTimeout(() => {
                showSuccess('Vehicle Deleted', 'Your vehicle has been successfully removed.');
              }, 500);
            } catch (error: any) {
              hideAlert();
              setTimeout(() => {
                const message = error.response?.data?.detail ||
                  (error.code === 'NETWORK_ERROR' || !error.response
                    ? 'Please check your internet connection and try again.'
                    : 'Failed to delete vehicle. Please try again.');
                showError('Delete Failed', message);
              }, 500);
            } finally {
              setIsVehicleDeleting(false);
            }
          }
        }
      ]
    );
  };


  const getVehicleIcon = (vehicle: any) => {
    const type = vehicle.vehicle_type.toLowerCase();
    if (type.includes('bike')) return '🏍️';
    if (type.includes('scooter')) return '🛵';
    if (type.includes('car')) return '🚗';
    return '🛺';
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
            <TouchableOpacity style={styles.vehicleMenu} onPress={() => handleMenuPress(vehicle)}>
              <Text style={styles.menuDots}>⋮</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('updatePhotos')}>
              <Text style={styles.menuText}>📷 Update Photos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('SetVehicleAvailability')}>
              <Text style={styles.menuText}>🔄 Set Availability</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('EditVehicleDetails')}>
              <Text style={styles.menuText}>✏️ Edit Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleDeleteVehicle()}>
              <Text style={[styles.menuText, styles.deleteText]}>🗑️ Delete Vehicle</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {alertConfig && (
        <CustomAlert
          visible={visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={hideAlert}
        />
      )}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 200,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  deleteText: {
    color: '#ff4444',
  },
});