import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import useLocation from '../../hooks/useLocation';
import { EXTERNAL_APIS } from '../../config/externalApis';
import DateTimePicker from '@react-native-community/datetimepicker';
import HourPicker from '../../components/CommonComponents/HourPicker';

export default function SearchScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { location: currentLocation, loading: locationLoading } = useLocation();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [pickupHour, setPickupHour] = useState(9); // 9 AM
  const [dropoffHour, setDropoffHour] = useState(17); // 5 PM
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerStep, setDatePickerStep] = useState('start'); // 'start' or 'end'
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState('pickup'); // 'pickup' or 'dropoff'
  const [dateRangeSelected, setDateRangeSelected] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [showHourPicker, setShowHourPicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(9);

  // Reverse geocoding function using free Nominatim API
  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      setAddressLoading(true);
      const response = await fetch(
        `${EXTERNAL_APIS.OPENSTREETMAP.REVERSE_GEOCODE}?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'VehicleRentalApp/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data && data.display_name) {
        // Extract meaningful parts of address
        const address = data.address || {};
        const shortAddress = [
          address.road || address.neighbourhood,
          address.suburb || address.city_district,
          address.city || address.town
        ].filter(Boolean).join(', ');
        
        setCurrentAddress(shortAddress || data.display_name.split(',').slice(0, 2).join(','));
      } else {
        setCurrentAddress('Address not found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setCurrentAddress(`${currentLocation.latitude.toFixed(3)}, ${currentLocation.longitude.toFixed(3)}`);
    } finally {
      setAddressLoading(false);
    }
  };

  // Get address when location changes
  useEffect(() => {
    if (currentLocation && !locationLoading) {
      getAddressFromCoords(currentLocation.latitude, currentLocation.longitude);
    }
  }, [currentLocation, locationLoading]);

  // Handle selected location from LocationPicker
  useEffect(() => {
    if (route.params?.selectedLocation) {
      setSelectedLocation(route.params.selectedLocation);
      // Clear the parameter to avoid re-triggering
      navigation.setParams({ selectedLocation: null });
    }
  }, [route.params?.selectedLocation]);

  const handleVehiclesSearch = () => {
    // Use selected location or current location as fallback
    const searchLocation = selectedLocation || {
      latitude: currentLocation?.latitude,
      longitude: currentLocation?.longitude,
      name: currentAddress || 'Current Location'
    };
    
    if (!searchLocation.latitude || !searchLocation.longitude) {
      alert('Location not available. Please enable location services or select a location.');
      return;
    }
    
    // Validation is not needed as dates are always set
    
    // Combine date and time
    const pickupDateTime = new Date(startDate);
    pickupDateTime.setHours(pickupHour, 0, 0, 0);
    
    const dropoffDateTime = new Date(endDate);
    dropoffDateTime.setHours(dropoffHour, 0, 0, 0);
    
    navigation.navigate('VehicleResults', {
      location: searchLocation,
      startDate: pickupDateTime.toISOString(),
      endDate: dropoffDateTime.toISOString(),
      radiusKm: 10
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container}>
        {/* Current Location Display */}
        <View style={[styles.locationHeader, { backgroundColor: colors.card }]}>
          <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>📍 Current Location</Text>
          <Text style={[styles.currentLocation, { color: colors.text }]}>
            {locationLoading ? 'Getting location...' : 
             addressLoading ? 'Getting address...' :
             currentAddress || 'Location not available'}
          </Text>
        </View>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Find Your Ride</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose location and dates to see available vehicles
          </Text>
        </View>

        <View style={styles.searchCard}>
          {/* Location Input */}
          <TouchableOpacity 
            style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('LocationPicker')}
          >
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>📍 Pickup Location</Text>
            <Text style={[styles.inputValue, { color: (selectedLocation || currentAddress) ? colors.text : colors.textSecondary }]}>
              {selectedLocation?.name || currentAddress || 'Select location'}
            </Text>
          </TouchableOpacity>

          {/* From Date and Time */}
          <TouchableOpacity 
            style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              setDatePickerStep('start');
              setShowDatePicker(true);
            }}
          >
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>From</Text>
            <Text style={[styles.inputValue, { color: colors.text }]}>
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {pickupHour === 0 ? '12 AM' : pickupHour < 12 ? `${pickupHour} AM` : pickupHour === 12 ? '12 PM' : `${pickupHour - 12} PM`}
            </Text>
          </TouchableOpacity>

          {/* To Date and Time */}
          <TouchableOpacity 
            style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              setDatePickerStep('end');
              setShowDatePicker(true);
            }}
          >
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>To</Text>
            <Text style={[styles.inputValue, { color: colors.text }]}>
              {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {dropoffHour === 0 ? '12 AM' : dropoffHour < 12 ? `${dropoffHour} AM` : dropoffHour === 12 ? '12 PM' : `${dropoffHour - 12} PM`}
            </Text>
          </TouchableOpacity>

          {/* Search Button */}
          <TouchableOpacity 
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            onPress={handleVehiclesSearch}
          >
            <Text style={styles.searchButtonText}>🔍 Search Vehicles</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <TouchableOpacity 
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Map')}
          >
            <Text style={styles.quickActionIcon}>🗺️</Text>
            <Text style={[styles.quickActionText, { color: colors.text }]}>Browse on Map</Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={datePickerStep === 'start' ? startDate : endDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (event.type === 'set' && selectedDate) {
                setTempDate(selectedDate);
                setTimePickerMode(datePickerStep === 'start' ? 'pickup' : 'dropoff');
                setShowDatePicker(false);
                setShowHourPicker(true);
              } else {
                setShowDatePicker(false);
              }
            }}
            minimumDate={new Date()}
          />
        )}

      </ScrollView>

      {/* Hour Picker */}
      {showHourPicker && (
        <View style={styles.hourPickerModal}>
          <View style={styles.hourPickerContent}>
            <Text style={styles.hourPickerTitle}>Select Hour</Text>
            <ScrollView style={styles.hourList} showsVerticalScrollIndicator={false}>
              {Array.from({ length: 24 }, (_, i) => {
                const hour12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
                const ampm = i < 12 ? 'AM' : 'PM';
                const currentSelectedHour = timePickerMode === 'pickup' ? pickupHour : dropoffHour;
                
                return (
                  <TouchableOpacity 
                    key={i}
                    style={[styles.hourOption, selectedHour === i && styles.hourOptionSelected]}
                    onPress={() => setSelectedHour(i)}
                  >
                    <Text style={[styles.hourOptionText, selectedHour === i && styles.hourOptionTextSelected]}>
                      {hour12} {ampm}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.hourPickerButtons}>
              <TouchableOpacity 
                style={styles.hourPickerButton}
                onPress={() => setShowHourPicker(false)}
              >
                <Text style={styles.hourPickerButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.hourPickerButton, styles.hourPickerConfirm]}
                onPress={() => {
                  if (timePickerMode === 'pickup') {
                    setPickupHour(selectedHour);
                    setStartDate(tempDate);
                  } else {
                    setDropoffHour(selectedHour);
                    setEndDate(tempDate);
                  }
                  setShowHourPicker(false);
                }}
              >
                <Text style={[styles.hourPickerButtonText, styles.hourPickerConfirmText]}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  locationHeader: { 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 40, 
    marginBottom: 16 
  },
  locationLabel: { 
    fontSize: 11, 
    fontWeight: '600', 
    marginBottom: 2 
  },
  currentLocation: { 
    fontSize: 13, 
    fontWeight: '500' 
  },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 22 },
  searchCard: { backgroundColor: 'transparent', marginBottom: 24 },
  inputContainer: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  inputValue: { fontSize: 16, fontWeight: '500' },
  hourPickerModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  hourPickerContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  hourPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  hourList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  hourOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  hourOptionSelected: {
    backgroundColor: '#007AFF',
  },
  hourOptionText: {
    fontSize: 16,
    color: '#333',
  },
  hourOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  hourPickerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  hourPickerButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  hourPickerConfirm: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  hourPickerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  hourPickerConfirmText: {
    color: '#fff',
  },
  modalContent: {
    margin: 20,
    borderRadius: 12,
    padding: 20,
    minWidth: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  selectedStartInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  confirmButton: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchButton: { padding: 16, borderRadius: 12, alignItems: 'center' },
  searchButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  quickActions: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  quickAction: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12 },
  quickActionIcon: { fontSize: 24, marginRight: 12 },
  quickActionText: { fontSize: 16, fontWeight: '500' },
});