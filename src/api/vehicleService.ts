import api from './axios';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  location: string; // e.g., "POINT(83.202501 17.686642)"
  available: boolean;
}

export async function getNearbyVehicles(
  lat: number,
  lng: number,
  radius_km = 10
): Promise<Vehicle[]> {
  const res = await api.get('/vehicles/nearby', {
    params: {
      lat,
      lng,
      radius_km,
    },
  });
  return res.data;
}
