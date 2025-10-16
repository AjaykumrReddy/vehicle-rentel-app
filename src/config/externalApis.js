// External API Configuration
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

export const EXTERNAL_APIS = {
  // Google Maps endpoints
  GOOGLE_MAPS: {
    PLACES_AUTOCOMPLETE: `${GOOGLE_MAPS_BASE_URL}/place/autocomplete/json`,
    PLACE_DETAILS: `${GOOGLE_MAPS_BASE_URL}/place/details/json`,
    DIRECTIONS: `${GOOGLE_MAPS_BASE_URL}/directions/json`,
  },

  // OpenStreetMap endpoints
  OPENSTREETMAP: {
    REVERSE_GEOCODE: 'https://nominatim.openstreetmap.org/reverse',
  },
};