import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import useLocation from '../../hooks/useLocation';
import { EXTERNAL_APIS } from '../../config/externalApis';
import DateRangePicker from '../../components/CommonComponents/DateRangePicker';
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
    if (!selectedLocation) {
      alert('Please select a pickup location');
      return;
    }
    
    if (!dateRangeSelected) {
      alert('Please select pickup and return dates');
      return;
    }
    
    // Combine date and time
    const pickupDateTime = new Date(startDate);
    pickupDateTime.setHours(pickupHour, 0, 0, 0);
    
    const dropoffDateTime = new Date(endDate);
    dropoffDateTime.setHours(dropoffHour, 0, 0, 0);
    
    navigation.navigate('VehicleResults', {
      location: selectedLocation,
      startDate: pickupDateTime.toISOString(),
      endDate: dropoffDateTime.toISOString(),
      radiusKm: 10 //  by defualt update dynamic later
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
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
          <Text style={[styles.inputValue, { color: selectedLocation ? colors.text : colors.textSecondary }]}>
            {selectedLocation?.name || 'Select location'}
          </Text>
        </TouchableOpacity>

        {/* Date Range Input */}
        <TouchableOpacity 
          style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            setDatePickerStep('start');
            setShowDatePicker(true);
          }}
        >
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>🗓️ Select Dates</Text>
          <Text style={[styles.inputValue, { color: dateRangeSelected ? colors.text : colors.textSecondary }]}>
            {dateRangeSelected 
              ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
              : 'Choose pickup and return dates'
            }
          </Text>
        </TouchableOpacity>

        {/* Time Inputs - Only show after date range is selected */}
        {dateRangeSelected && (
          <View style={styles.timeRow}>
            <TouchableOpacity 
              style={[styles.timeInput, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                setTimePickerMode('pickup');
                setShowTimePicker(true);
              }}
            >
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>⏰ Pickup Time</Text>
              <Text style={[styles.timeText, { color: colors.text }]}>
                {pickupHour === 0 ? '12 AM' : pickupHour < 12 ? `${pickupHour} AM` : pickupHour === 12 ? '12 PM' : `${pickupHour - 12} PM`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.timeInput, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                setTimePickerMode('dropoff');
                setShowTimePicker(true);
              }}
            >
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>🏁 Dropoff Time</Text>
              <Text style={[styles.timeText, { color: colors.text }]}>
                {dropoffHour === 0 ? '12 AM' : dropoffHour < 12 ? `${dropoffHour} AM` : dropoffHour === 12 ? '12 PM' : `${dropoffHour - 12} PM`}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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

      {/* Custom Date Range Picker */}
      {showDatePicker && (
        <View style={[styles.modalOverlay, { backgroundColor: colors.background }]}>
          <DateRangePicker
            onDateRangeSelect={(start, end) => {
              setStartDate(start);
              setEndDate(end);
              setDateRangeSelected(true);
              setShowDatePicker(false);
            }}
            onCancel={() => setShowDatePicker(false)}
          />
        </View>
      )}

      {/* Hour Picker */}
      {showTimePicker && (
        <View style={[styles.modalOverlay, { backgroundColor: colors.background }]}>
          <HourPicker
            selectedHour={timePickerMode === 'pickup' ? pickupHour : dropoffHour}
            onHourSelect={(hour) => {
              if (timePickerMode === 'pickup') {
                setPickupHour(hour);
              } else {
                setDropoffHour(hour);
              }
              setShowTimePicker(false);
            }}
            onCancel={() => setShowTimePicker(false)}
            title={timePickerMode === 'pickup' ? '⏰ Select Pickup Hour' : '🏁 Select Dropoff Hour'}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
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
  timeRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  timeInput: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1 },
  timeText: { fontSize: 14, fontWeight: '600', color: '#333' },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    zIndex: 1000,
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