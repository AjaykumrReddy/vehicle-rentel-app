import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useLocation from '../../hooks/useLocation';
import CustomAlert from '../../components/CommonComponents/CustomAlert';
import { useAlert } from '../../hooks/useAlert';
import { registerVehicle } from '../../api/vehicleService';
import { getUserData } from '../../utils/storage';
import { useTheme } from '../../contexts/ThemeContext';
import { Config } from '../../config';
import { errorLogger } from '../../services/errorLogger';

export default function AddVehicleScreen({ navigation, route }: { navigation: any, route: any }) {
  const { colors } = useTheme();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [submitVehicleLoading, setSubmitVehicleLoading] = useState(false);
  const { location, loading, errorMsg } = useLocation();
  const { alertConfig, visible, hideAlert, showError, showSuccess } = useAlert();

  const vehicleTypes = ['Bike', 'Scooter', 'Car'];

  useEffect(() => {
    if (location) {
      fetchAddress(location.latitude, location.longitude);
    }
  }, [location]);



  const fetchAddress = async (lat: number, lng: number) => {
    try {
      setLoadingAddress(true);
      
      // Fallback to coordinates if no API key
      if (!Config.GOOGLE_PLACES_API_KEY) {
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        return;
      }

      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${Config.GOOGLE_PLACES_API_KEY}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log API errors for debugging but don't show to user
      if (data.status !== 'OK') {
        console.log('Google Geocoding API Error:', data.error_message)
        await errorLogger.logError({
          type: 'GOOGLE_GEOCODING_API_ERROR',
          message: `Status: ${data.status}, Error: ${data.error_message || 'Unknown'}`,
          apiEndpoint: apiUrl,
          requestData: { lat, lng },
          responseData: data,
          userAction: 'Fetching address during vehicle registration'
        });
        
        // Silent fallback to coordinates
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        return;
      }
      
      if (data.results && data.results.length > 0) {
        const formattedAddress = data.results[0].formatted_address;
        setAddress(formattedAddress);
      } else {
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (error: any) {
      // Log error for developers but show friendly fallback to users
      await errorLogger.logError({
        type: 'ADDRESS_FETCH_ERROR',
        message: error.message || 'Unknown error',
        stack: error.stack,
        apiEndpoint: 'Google Geocoding API',
        requestData: { lat, lng },
        userAction: 'Fetching address during vehicle registration'
      });
      
      // Silent fallback - user doesn't need to know about the error
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleChangeLocation = () => {
    navigation.navigate('LocationPicker', {
      onLocationSelect: (selectedLocation: any, selectedAddress: string) => {
        // This will be handled when returning from LocationPicker
      }
    });
  };

  const handleSubmit = async () => {
    if (!brand || !model || !vehicleType || !licensePlate || !year || !color) {
      showError('Missing Information', 'Please fill in all required fields to continue.');
      return;
    }

    if (!location) {
      showError('Location Required', 'Location is required to register your vehicle. Please enable GPS and try again.');
      return;
    }

    const currentYear = new Date().getFullYear();
    const vehicleYear = parseInt(year);
    if (vehicleYear < 1900 || vehicleYear > currentYear + 1) {
      showError('Invalid Year', 'Please enter a valid manufacturing year for your vehicle.');
      return;
    }

    setSubmitVehicleLoading(true);
    try {
      const userData = await getUserData();
      if (!userData?.id) {
        showError('Authentication Error', 'Please log in again to register your vehicle.');
        return;
      }

      const vehicleData = {
        brand,
        model,
        vehicle_type: vehicleType,
        license_plate: licensePlate.toUpperCase(),
        year: vehicleYear,
        color,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      const response = await registerVehicle(vehicleData, userData.id);
      console.log('Vehicle registered:', response);
      
      showSuccess(
        'Vehicle Registered!', 
        'Your vehicle has been registered successfully. Next, add photos to complete the setup.',
        [
          { 
            text: 'Add Photos', 
            onPress: () => {
              navigation.navigate('ImageUpload', { vehicleId: response.vehicle_id });
            }
          },
          { 
            text: 'Skip for Now', 
            style: 'cancel',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      const message = error.response?.data?.detail || 
                     (error.code === 'NETWORK_ERROR' || !error.response 
                      ? 'Please check your internet connection and try again.' 
                      : 'Failed to register your vehicle. Please try again.');
      
      showError('Registration Failed', message);
    } finally {
      setSubmitVehicleLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Register Vehicle</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={styles.progressStepActive}>
                <Text style={styles.progressStepText}>1</Text>
              </View>
              <Text style={[styles.progressLabel, { color: colors.text }]}>Basic Info</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={styles.progressStepInactive}>
                <Text style={styles.progressStepTextInactive}>2</Text>
              </View>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Photos</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={styles.progressStepInactive}>
                <Text style={styles.progressStepTextInactive}>3</Text>
              </View>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Pricing</Text>
            </View>
          </View>

          {/* Vehicle Type Selection */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Type *</Text>
            <View style={styles.typeContainer}>
              {vehicleTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton, 
                    { backgroundColor: colors.background, borderColor: colors.border },
                    vehicleType === type && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setVehicleType(type)}
                >
                  <Text style={[
                    styles.typeText, 
                    { color: colors.text },
                    vehicleType === type && { color: '#fff' }
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Vehicle Details */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Brand *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Honda, Bajaj, Maruti"
                placeholderTextColor={colors.textSecondary}
                value={brand}
                onChangeText={setBrand}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Model *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., Activa 125, Pulsar 150"
                placeholderTextColor={colors.textSecondary}
                value={model}
                onChangeText={setModel}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>License Plate *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., KA-01-AB-1234"
                placeholderTextColor={colors.textSecondary}
                value={licensePlate}
                onChangeText={setLicensePlate}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={[styles.label, { color: colors.text }]}>Year *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="2023"
                  placeholderTextColor={colors.textSecondary}
                  value={year}
                  onChangeText={setYear}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={[styles.label, { color: colors.text }]}>Color *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Red, Blue, Black"
                  placeholderTextColor={colors.textSecondary}
                  value={color}
                  onChangeText={setColor}
                />
              </View>
            </View>
          </View>

          {/* Location Info */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.locationHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
              {location && (
                <TouchableOpacity onPress={handleChangeLocation}>
                  <Text style={[styles.changeLocationText, { color: colors.primary }]}>Change</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={[styles.locationInfo, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={styles.locationIcon}>📍</Text>
              <View style={styles.locationTextContainer}>
                {loading ? (
                  <>
                    <Text style={[styles.locationText, { color: colors.text }]}>Getting location...</Text>
                    <ActivityIndicator size="small" color={colors.primary} style={styles.locationLoader} />
                  </>
                ) : location ? (
                  <>
                    <Text style={[styles.locationText, { color: colors.text }]}>
                      {loadingAddress ? 'Loading address...' : (address || 'Address not available')}
                    </Text>
                    <Text style={[styles.locationCoords, { color: colors.textSecondary }]}>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Text>
                    <Text style={[styles.locationSubtext, { color: colors.textSecondary }]}>
                      Vehicle will be registered at this location
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.locationText, { color: colors.error }]}>Location not available</Text>
                    <Text style={[styles.locationSubtext, { color: colors.textSecondary }]}>
                      Please enable GPS and restart the app
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.submitButton, 
              { backgroundColor: colors.primary },
              submitVehicleLoading && { opacity: 0.6 }
            ]}
            onPress={handleSubmit}
            disabled={submitVehicleLoading}
          >
            {submitVehicleLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Register Vehicle</Text>
            )}
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {alertConfig && (
        <CustomAlert
          visible={visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          type={alertConfig.type}
          onClose={hideAlert}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressStepActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressStepInactive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e1e5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressStepText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressStepTextInactive: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e1e5e9',
    marginHorizontal: 10,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  changeLocationText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  locationInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  locationCoords: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  locationSubtext: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  locationLoader: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});