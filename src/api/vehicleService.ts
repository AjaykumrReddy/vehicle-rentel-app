import api from './axios';
import { getAuthToken } from '../utils/storage';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  location: string;
  available: boolean;
}

interface VehicleData {
  brand: string;
  model: string;
  vehicle_type: string;
  license_plate: string;
  year: number;
  color: string;
  latitude: number;
  longitude: number;
  available?: boolean;
}

export async function getNearbyVehicles(
  lat: number,
  lng: number,
  radius_km = 10
): Promise<Vehicle[]> {
  try {
    const token = await getAuthToken();
    const response = await api.get('/vehicles/nearby', {
      params: { lat, lng, radius_km },
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Get nearby vehicles error:', error);
    throw error;
  }
}

export const registerVehicle = async (vehicleData: VehicleData, ownerId: string) => {
  try {
    const token = await getAuthToken();
    const response = await api.post(`/vehicles/register?owner_id=${ownerId}`, {
      ...vehicleData,
      available: true,
    }, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error('Vehicle registration error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code
    });
    
    // Preserve the original error structure for better error handling
    throw error;
  }
};

export const uploadVehiclePhotos = async (vehicleId: string, files: any[]) => {
  try {
    console.log('Starting photo upload for vehicle:', vehicleId);
    console.log('Files to upload:', files.length);
    
    const token = await getAuthToken();
    console.log('Token retrieved:', token ? 'Yes' : 'No');
    
    const formData = new FormData();
    
    files.forEach((file, index) => {
      console.log(`Adding file ${index}:`, { uri: file.uri, type: file.type, name: file.name });
      formData.append('files', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || `photo_${index}.jpg`,
      } as any);
    });

    const uploadUrl = `/vehicles/${vehicleId}/upload_photos`;

    const response = await api.post(uploadUrl, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds timeout
    });
    
    console.log('Photo upload response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Photo upload error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });
    throw error;
  }
};

// Delete a vehicle
export const deleteVehicle = async (vehicleId: string) => {
  try {
    const token = await getAuthToken();
    const response = await api.delete(`/vehicles/${vehicleId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log('Delete vehicle response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Delete vehicle error:', error);
    throw error;
  }
};
