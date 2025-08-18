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
  } catch (error) {
    console.error('Vehicle registration error:', error);
    throw error;
  }
};
