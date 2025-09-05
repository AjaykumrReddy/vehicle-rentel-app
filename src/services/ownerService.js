import { ownerAPI } from '../api/ownerAPI';

class OwnerService {
  async getDashboardData() {
    try {
      const [pendingRes, activeRes, vehiclesRes, earningsRes] = await Promise.all([
        ownerAPI.getPendingBookings(),
        ownerAPI.getActiveBookings(), 
        ownerAPI.getVehicles(),
        ownerAPI.getEarnings()
      ]);

      return {
        success: true,
        data: {
          pendingBookings: pendingRes.data?.data || pendingRes.data || [],
          activeBookings: activeRes.data?.data || activeRes.data || [],
          vehicles: vehiclesRes.data?.data || vehiclesRes.data || [],
          earnings: earningsRes.data?.data || earningsRes.data || { today: 0, thisMonth: 0 }
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load dashboard data'
      };
    }
  }

  async handleBookingAction(bookingId, action) {
    try {
      const response = await ownerAPI.updateBookingStatus(bookingId, action);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating booking status:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update booking status'
      };
    }
  }

  async toggleVehicleAvailability(vehicleId, isAvailable) {
    try {
      const response = await ownerAPI.updateVehicleAvailability(vehicleId, isAvailable);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating vehicle availability:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update vehicle availability'
      };
    }
  }

  async updateVehicleRates(vehicleId, hourlyRate, dailyRate) {
    try {
      const response = await ownerAPI.updateVehicleRates(vehicleId, hourlyRate, dailyRate);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating vehicle rates:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update vehicle rates'
      };
    }
  }
}

export default new OwnerService();