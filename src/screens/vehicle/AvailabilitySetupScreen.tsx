import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function AvailabilitySetupScreen({ navigation, route }: { navigation: any, route: any }) {
  const { colors } = useTheme();
  // const { vehicleId } = route?.params;
  const vehicleId = route?.params?.vehicleId;
  const [hourlyRate, setHourlyRate] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!hourlyRate && !dailyRate) {
      Alert.alert('Error', 'Please set at least one pricing option');
      return;
    }

    setLoading(true);
    try {
      const pricingData = {
        vehicleId,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        dailyRate: dailyRate ? parseFloat(dailyRate) : null,
      };

      // Save pricing API call here
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Pricing data:', pricingData);
      
      Alert.alert(
        'Vehicle Setup Complete!',
        'Your vehicle is now registered and ready for rental. It will be reviewed and activated within 24 hours.',
        [{ text: 'Done', onPress: () => navigation.navigate('Profile') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save pricing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Pricing Setup?',
      'You can set pricing later from your vehicle management section.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => navigation.navigate('Profile') }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Set Pricing</Text>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={[styles.skipText, { color: colors.primary }]}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={styles.progressStepComplete}>
                <Text style={styles.progressStepText}>✓</Text>
              </View>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Basic Info</Text>
            </View>
            <View style={styles.progressLineComplete} />
            <View style={styles.progressStep}>
              <View style={styles.progressStepComplete}>
                <Text style={styles.progressStepText}>✓</Text>
              </View>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Photos</Text>
            </View>
            <View style={styles.progressLineComplete} />
            <View style={styles.progressStep}>
              <View style={styles.progressStepActive}>
                <Text style={styles.progressStepText}>3</Text>
              </View>
              <Text style={[styles.progressLabel, { color: colors.text }]}>Pricing</Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Set Your Rates</Text>
            <Text style={[styles.instructions, { color: colors.textSecondary }]}>
              Set competitive rates for your vehicle. You can always update these later.
            </Text>
          </View>

          {/* Pricing Options */}
          <View style={styles.section}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Hourly Rate (₹)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., 50"
                placeholderTextColor={colors.textSecondary}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="numeric"
              />
              <Text style={[styles.inputHint, { color: colors.textSecondary }]}>Recommended: ₹30-80 per hour</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Daily Rate (₹)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g., 500"
                placeholderTextColor={colors.textSecondary}
                value={dailyRate}
                onChangeText={setDailyRate}
                keyboardType="numeric"
              />
              <Text style={[styles.inputHint, { color: colors.textSecondary }]}>Recommended: ₹400-1200 per day</Text>
            </View>
          </View>

          {/* Features Info */}
          <View style={[styles.infoBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.primary }]}>What happens next?</Text>
            <Text style={[styles.infoText, { color: colors.text }]}>• Your vehicle will be reviewed within 24 hours</Text>
            <Text style={[styles.infoText, { color: colors.text }]}>• You'll receive a notification once approved</Text>
            <Text style={[styles.infoText, { color: colors.text }]}>• Start earning from rentals immediately</Text>
            <Text style={[styles.infoText, { color: colors.text }]}>• Manage availability anytime from your profile</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.submitButton, 
              { backgroundColor: colors.primary },
              loading && { opacity: 0.6 }
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Complete Setup</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 50,
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
  skipText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    padding: 20,
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
  progressStepComplete: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressStepText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressLineComplete: {
    flex: 1,
    height: 2,
    backgroundColor: '#28a745',
    marginHorizontal: 10,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
    marginBottom: 4,
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF20',
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
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