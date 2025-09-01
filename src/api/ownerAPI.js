import { apiClient } from './client';

export const ownerAPI = {
  getPendingBookings: () => apiClient.get('/owner/bookings/pending'),
  getActiveBookings: () => apiClient.get('/owner/bookings/active'),
  getVehicles: () => apiClient.get('/owner/vehicles'),
  getEarnings: () => apiClient.get('/owner/earnings'),
  updateBookingStatus: (bookingId, action) => {
    const status = action === 'accept' ? 'CONFIRMED' : 'REJECTED';
    return apiClient.put(`/owner/bookings/${bookingId}/status`, { status });
  },
  updateVehicleAvailability: (vehicleId, isAvailable) => 
    apiClient.put(`/owner/vehicles/${vehicleId}/availability`, { is_available: isAvailable }),
  updateVehicleRates: (vehicleId, hourlyRate, dailyRate) => 
    apiClient.put(`/owner/vehicles/${vehicleId}/rates`, { hourly_rate: hourlyRate, daily_rate: dailyRate })
};