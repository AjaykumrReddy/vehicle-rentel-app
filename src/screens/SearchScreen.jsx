import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import useLocation from '../hooks/useLocation';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SearchScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { location: currentLocation, loading: locationLoading } = useLocation();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Reverse geocoding function using free Nominatim API
  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      setAddressLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
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

  const handleSearch = () => {
    if (!selectedLocation) {
      alert('Please select a pickup location');
      return;
    }
    
    navigation.navigate('VehicleResults', {
      location: selectedLocation,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
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

        {/* Date Inputs */}
        <View style={styles.dateRow}>
          <TouchableOpacity 
            style={[styles.dateInput, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>🗓️ Start</Text>
            <Text style={[styles.dateText, { color: colors.text }]}>
              {startDate.toLocaleDateString()}
            </Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dateInput, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>🏁 End</Text>
            <Text style={[styles.dateText, { color: colors.text }]}>
              {endDate.toLocaleDateString()}
            </Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Button */}
        <TouchableOpacity 
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={handleSearch}
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

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="datetime"
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="datetime"
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
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
  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  dateInput: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1 },
  dateText: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  timeText: { fontSize: 12 },
  searchButton: { padding: 16, borderRadius: 12, alignItems: 'center' },
  searchButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  quickActions: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  quickAction: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12 },
  quickActionIcon: { fontSize: 24, marginRight: 12 },
  quickActionText: { fontSize: 16, fontWeight: '500' },
});