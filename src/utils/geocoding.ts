import { EXTERNAL_APIS } from '../config/externalApis';
import { errorLogger } from '../services/errorLogger';

/**
 * Fetch address from coordinates using OpenStreetMap Nominatim (Free)
 * Falls back to coordinates if API fails
 */
export const getAddressFromCoords = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    const response = await fetch(
      `${EXTERNAL_APIS.OPENSTREETMAP.REVERSE_GEOCODE}?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'VehicleRentalApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data && data.display_name) {
      // Extract meaningful parts of address
      const address = data.address || {};
      const shortAddress = [
        address.neighbourhood || address.road,
        address.suburb,
        address.city || address.town
      ].filter(Boolean).join(', ');

      return shortAddress || data.display_name.split(',').slice(0, 3).join(',');
    }

    // Fallback to coordinates
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error: any) {
    // Log error silently
    await errorLogger.logError({
      type: 'GEOCODING_ERROR',
      message: error.message || 'Failed to fetch address',
      stack: error.stack,
      apiEndpoint: EXTERNAL_APIS.OPENSTREETMAP.REVERSE_GEOCODE,
      requestData: { latitude, longitude },
      userAction: 'Fetching address from coordinates'
    });

    // Return coordinates as fallback
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};
