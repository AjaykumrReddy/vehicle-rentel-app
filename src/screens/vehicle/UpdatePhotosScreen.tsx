import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { uploadVehiclePhotos, getVehiclePhotos } from '../../api/vehicleService';
import CustomAlert from '../../components/CommonComponents/CustomAlert';
import { useAlert } from '../../hooks/useAlert';
import { useTheme } from '../../contexts/ThemeContext';

export default function UpdatePhotosScreen({ navigation, route }: { navigation: any, route: any }) {
  const { colors } = useTheme();
  const { selectedVehicle } = route.params;
  const [images, setImages] = useState<any[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const { alertConfig, visible, hideAlert, showError, showSuccess, showWarning } = useAlert();

  useEffect(() => {
    loadExistingPhotos();
  }, []);

  const loadExistingPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const photos = await getVehiclePhotos(selectedVehicle.id);
      setExistingPhotos(photos || []);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleImagePicker = async () => {
    const totalPhotos = existingPhotos.length + images.length;
    if (totalPhotos >= 6) {
      showError('Maximum Photos', 'You can only have up to 6 photos total.');
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showError('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
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

  const removeNewImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      showWarning('No New Photos', 'No new photos to upload. Go back?', [
        { text: 'Go Back', onPress: () => navigation.goBack() },
        { text: 'Stay', style: 'cancel' }
      ]);
      return;
    }

    setLoading(true);
    try {
      await uploadVehiclePhotos(selectedVehicle.id, images);
      
      showSuccess(
        'Photos Updated!',
        'Vehicle photos have been updated successfully.',
        [{ text: 'Done', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Upload error:', error);
      showError('Upload Failed', 'Failed to upload photos. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalPhotos = existingPhotos.length + images.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Update Photos</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Vehicle Info */}
          <View style={[styles.vehicleInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.vehicleName, { color: colors.text }]}>
              {selectedVehicle.brand} {selectedVehicle.model}
            </Text>
            <Text style={[styles.vehicleDetails, { color: colors.textSecondary }]}>
              {selectedVehicle.license_plate} • {selectedVehicle.year}
            </Text>
          </View>

          {/* Existing Photos */}
          {loadingPhotos ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading existing photos...</Text>
            </View>
          ) : (
            <>
              {existingPhotos.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Current Photos ({existingPhotos.length})
                  </Text>
                  <View style={styles.photosList}>
                    {existingPhotos.map((photo, index) => (
                      <View key={photo.id || index} style={styles.photoItem}>
                        <Image source={{ uri: photo.photo_url }} style={styles.photoThumbnail} />
                        {photo.is_primary && (
                          <View style={styles.primaryBadge}>
                            <Text style={styles.primaryText}>Primary</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Add Photo Button */}
              {totalPhotos < 6 && (
                <TouchableOpacity 
                  style={[styles.addPhotoButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                  onPress={handleImagePicker}
                >
                  <Text style={styles.addPhotoIcon}>📷</Text>
                  <Text style={[styles.addPhotoText, { color: colors.primary }]}>Add New Photo</Text>
                  <Text style={[styles.addPhotoSubtext, { color: colors.textSecondary }]}>
                    {totalPhotos}/6 photos
                  </Text>
                </TouchableOpacity>
              )}

              {/* New Photos */}
              {images.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    New Photos ({images.length})
                  </Text>
                  <View style={styles.photosList}>
                    {images.map((image, index) => (
                      <View key={index} style={styles.photoItem}>
                        <Image source={{ uri: image.uri }} style={styles.photoThumbnail} />
                        <TouchableOpacity 
                          style={styles.removeButton}
                          onPress={() => removeNewImage(index)}
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
                  (loading || images.length === 0) && { opacity: 0.6 }
                ]}
                onPress={handleSubmit}
                disabled={loading || images.length === 0}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    Upload {images.length} New Photo{images.length !== 1 ? 's' : ''}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
  content: {
    padding: 20,
  },
  vehicleInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    marginBottom: 24,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
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
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  primaryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
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
  addPhotoButton: {
    backgroundColor: '#fff',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 24,
  },
  addPhotoIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  addPhotoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  addPhotoSubtext: {
    fontSize: 12,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});