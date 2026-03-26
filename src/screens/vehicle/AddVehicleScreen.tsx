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
import { useTokenExpiry } from '../../hooks/useTokenExpiry';
import { registerVehicle } from '../../api/vehicleService';
import { getUserData } from '../../utils/storage';
import { useTheme } from '../../contexts/ThemeContext';
import { getAddressFromCoords } from '../../utils/geocoding';

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
  const [location, setLocation] = useState<any>(null);
  const { location: currentLocation, loading } = useLocation();
  const { alertConfig, visible, hideAlert, showError, showSuccess } = useAlert();
  const { checkTokenExpiry } = useTokenExpiry(navigation);

  const vehicleTypes = ['Bike', 'Scooter', 'Car'];

  useEffect(() => {
    if (currentLocation && !location) {
      setLocation(currentLocation);
      fetchAddress(currentLocation.latitude, currentLocation.longitude);
    }
  }, [currentLocation]);

  const fetchAddress = async (lat: number, lng: number) => {
    setLoadingAddress(true);
    const address = await getAddressFromCoords(lat, lng);
    console.info('Address fetched:', address)
    setAddress(address);
    setLoadingAddress(false);
  };

  const handleChangeLocation = () => {
    navigation.navigate('LocationPicker', {
      returnScreen: 'AddVehicle'
    });
  };

  // Handle selected location returned from LocationPicker
  useEffect(() => {
    if (route.params?.selectedLocation) {
      const selected = route.params.selectedLocation;
      setLocation({ latitude: selected.latitude, longitude: selected.longitude });
      setAddress(selected.name || '');
      navigation.setParams({ selectedLocation: null });
    }
  }, [route.params?.selectedLocation]);

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
      // Check if token expired first
      if (checkTokenExpiry(error)) {
        return; // Token expiry handled, don't show other errors
      }
      
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
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
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
            <View style={[styles.progressLine, { backgroundColor: colors.border }]} />
            <View style={styles.progressStep}>
              <View style={[styles.progressStepInactive, { backgroundColor: colors.border }]}>
                <Text style={[styles.progressStepTextInactive, { color: colors.textSecondary }]}>2</Text>
              </View>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Photos</Text>
            </View>
            <View style={[styles.progressLine, { backgroundColor: colors.border }]} />
            <View style={styles.progressStep}>
              <View style={[styles.progressStepInactive, { backgroundColor: colors.border }]}>
                <Text style={[styles.progressStepTextInactive, { color: colors.textSecondary }]}>3</Text>
              </View>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Pricing</Text>
            </View>
          </View>

          {/* Vehicle Type Selection */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
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
          <View style={[styles.section, { backgroundColor: colors.card }]}>
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
          <View style={[styles.section, { backgroundColor: colors.card }]}>
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
                      {loadingAddress ? 'Loading address...' : (address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`)}
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backIcon: { fontSize: 24 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  placeholder: { width: 24 },
  keyboardAvoid: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 50 },
  content: { padding: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  typeContainer: { flexDirection: 'row', gap: 10 },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeText: { fontSize: 14, fontWeight: '500' },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  row: { flexDirection: 'row', gap: 12 },
  halfWidth: { flex: 1 },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  progressStep: { alignItems: 'center' },
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressStepText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  progressStepTextInactive: { fontSize: 14, fontWeight: '600' },
  progressLabel: { fontSize: 12 },
  progressLine: { flex: 1, height: 2, marginHorizontal: 10 },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  changeLocationText: { fontSize: 14, fontWeight: '500' },
  locationInfo: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: { fontSize: 24, marginRight: 12, marginTop: 2 },
  locationTextContainer: { flex: 1 },
  locationText: { fontSize: 14, fontWeight: '500', marginBottom: 4, lineHeight: 20 },
  locationSubtext: { fontSize: 12, lineHeight: 16 },
  locationLoader: { marginTop: 4, alignSelf: 'flex-start' },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});