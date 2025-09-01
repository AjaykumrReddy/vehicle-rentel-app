import { ownerAPI } from '../api/ownerAPI';

class OwnerService {
  static async getDashboardData() {
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
          pendingBookings: pendingRes.success ? pendingRes.data : [],
          activeBookings: activeRes.success ? activeRes.data : [],
          vehicles: vehiclesRes.success ? vehiclesRes.data : [],
          earnings: earningsRes.success ? earningsRes.data : null
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async handleBookingAction(bookingId, action) {
    return await ownerAPI.updateBookingStatus(bookingId, action);
  }

  static async toggleVehicleAvailability(vehicleId, isAvailable) {
    return await ownerAPI.updateVehicleAvailability(vehicleId, isAvailable);
  }

  static async updateVehicleRates(vehicleId, hourlyRate, dailyRate) {
    return await ownerAPI.updateVehicleRates(vehicleId, hourlyRate, dailyRate);
  }
}

export default OwnerService;