import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';

export default function ImageUploadScreen({ navigation, route }: { navigation: any, route: any }) {
  const { vehicleId } = route.params;
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImagePicker = () => {
    // Placeholder for image picker implementation
    Alert.alert('Image Picker', 'Image picker will be implemented here');
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      Alert.alert('No Images', 'Would you like to skip adding photos for now?', [
        { text: 'Skip', onPress: () => navigation.navigate('AvailabilitySetup', { vehicleId }) },
        { text: 'Add Photos', style: 'cancel' }
      ]);
      return;
    }

    setLoading(true);
    try {
      // Upload images API call here
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Photos Uploaded!',
        'Vehicle photos uploaded successfully. Next, set up availability and pricing.',
        [{ text: 'Continue', onPress: () => navigation.navigate('AvailabilitySetup', { vehicleId }) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Photos</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AvailabilitySetup', { vehicleId })}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={styles.progressStepComplete}>
                <Text style={styles.progressStepText}>✓</Text>
              </View>
              <Text style={styles.progressLabel}>Basic Info</Text>
            </View>
            <View style={styles.progressLineComplete} />
            <View style={styles.progressStep}>
              <View style={styles.progressStepActive}>
                <Text style={styles.progressStepText}>2</Text>
              </View>
              <Text style={styles.progressLabel}>Photos</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={styles.progressStepInactive}>
                <Text style={styles.progressStepTextInactive}>3</Text>
              </View>
              <Text style={styles.progressLabel}>Pricing</Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Photos</Text>
            <Text style={styles.instructions}>
              Add clear photos of your vehicle to attract more renters. Include front, back, and side views.
            </Text>
          </View>

          {/* Photo Upload Grid */}
          <View style={styles.photoGrid}>
            {[...Array(6)].map((_, index) => (
              <TouchableOpacity
                key={index}
                style={styles.photoSlot}
                onPress={handleImagePicker}
              >
                {images[index] ? (
                  <Image source={{ uri: images[index] }} style={styles.photoImage} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoIcon}>📷</Text>
                    <Text style={styles.photoText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {images.length > 0 ? 'Upload Photos' : 'Skip for Now'}
              </Text>
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
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  photoSlot: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  photoText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
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