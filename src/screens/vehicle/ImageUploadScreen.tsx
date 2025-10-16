import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadVehiclePhotos } from '../../api/vehicleService';
import CustomAlert from '../../components/CommonComponents/CustomAlert';
import { useAlert } from '../../hooks/useAlert';
import { useTheme } from '../../contexts/ThemeContext';


export default function ImageUploadScreen({ navigation, route }: { navigation: any, route: any }) {
  const { colors } = useTheme();
  const { vehicleId } = route.params;
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { alertConfig, visible, hideAlert, showError, showSuccess, showWarning } = useAlert();

  const handleImagePicker = async () => {
    if (images.length >= 6) {
      showError('Maximum Photos', 'You can only add up to 6 photos.');
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showError('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newImage = {
          uri: asset.uri,
          type: 'image/jpeg',
          name: `vehicle_photo_${Date.now()}.jpg`,
        };
        setImages([...images, newImage]);
      }
    } catch (error) {
      console.log('ImagePicker Error: ', error);
      showError('Image Picker Error', 'Failed to open gallery. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      showWarning('No Images', 'Would you like to skip adding photos for now?', [
        { text: 'Skip', onPress: () => navigation.navigate('AvailabilitySetup', { vehicleId }) },
        { text: 'Add Photos', style: 'cancel' }
      ]);
      return;
    }

    setLoading(true);
    try {
      await uploadVehiclePhotos(vehicleId, images);
      
      showSuccess(
        'Photos Uploaded!',
        'Vehicle photos uploaded successfully. Next, set up availability and pricing.',
        [{ text: 'Continue', onPress: () => navigation.navigate('AvailabilitySetup', { vehicleId }) }]
      );
    } catch (error) {
      console.error('Upload error:', error);
      showError('Upload Failed', 'Failed to upload photos. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Add Photos</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AvailabilitySetup', { vehicleId })}>
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
              <View style={styles.progressStepActive}>
                <Text style={styles.progressStepText}>2</Text>
              </View>
              <Text style={[styles.progressLabel, { color: colors.text }]}>Photos</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={styles.progressStepInactive}>
                <Text style={styles.progressStepTextInactive}>3</Text>
              </View>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Pricing</Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Photos</Text>
            <Text style={[styles.instructions, { color: colors.textSecondary }]}>
              Add clear photos of your vehicle to attract more renters. Include front, back, and side views.
            </Text>
          </View>

          {/* Add Photo Button */}
          {images.length < 6 && (
            <TouchableOpacity 
              style={[styles.addPhotoButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleImagePicker}
            >
              <Text style={styles.addPhotoIcon}>📷</Text>
              <Text style={[styles.addPhotoText, { color: colors.text }]}>Add Vehicle Photo</Text>
              <Text style={[styles.addPhotoSubtext, { color: colors.textSecondary }]}>{images.length}/6 photos added</Text>
            </TouchableOpacity>
          )}

          {/* Selected Photos */}
          {images.length > 0 && (
            <View style={styles.photosSection}>
              <Text style={[styles.photosTitle, { color: colors.text }]}>Selected Photos ({images.length})</Text>
              <View style={styles.photosList}>
                {images.map((image, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri: image.uri }} style={styles.photoThumbnail} />
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

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
              <Text style={styles.submitButtonText}>
                {images.length > 0 ? 'Upload Photos' : 'Skip for Now'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
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
  addPhotoButton: {
    backgroundColor: '#fff',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 30,
  },
  addPhotoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  addPhotoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  addPhotoSubtext: {
    fontSize: 14,
    color: '#666',
  },
  photosSection: {
    marginBottom: 30,
  },
  photosTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  photosList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    position: 'relative',
    width: '48%',
    aspectRatio: 1.5,
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});