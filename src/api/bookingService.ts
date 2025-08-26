import api from "./axios";
import { getAuthToken } from "../utils/storage";


interface GetBookingsOptions {
  page?: number;
  limit?: number;
  status_filter?: string | null;
}

// Get user bookings with filtering and caching
export const getUserBookings = async (options: GetBookingsOptions = {}) => {
  const {
    page = 1,
    limit = 20,
    status_filter = null
  } = options;

  try {
    const token = await getAuthToken();
    const params = {
      page,
      limit,
      status_filter
    };

    const response = await api.get('/bookings/', {
      params,
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 10000
    });

    // Handle nested response structure: response.data.data.bookings
    const responseData = response.data.data || response.data;
    
    return {
      bookings: responseData.bookings || [],
      total: responseData.total_returned || responseData.total || 0,
      page: responseData.page || page,
      totalPages: Math.ceil((responseData.total_returned || responseData.total || 0) / limit),
      hasMore: responseData.has_more || false
    };
  } catch (error) {
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId: string) => {
  try {
    const token = await getAuthToken();
    const response = await api.put(`/bookings/${bookingId}/cancel`, {}, {
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create booking with notification
export const createVehicleBooking = async (bookingData: any) => {
  try {
    const token = await getAuthToken();
    const response = await api.post('/bookings/', bookingData, {
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 15000
    });
    console.log('Booking response:', response.data);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get booking details
export const getBookingDetails = async (bookingId: string) => {
  try {
    const token = await getAuthToken();
    const response = await api.get(`/bookings/${bookingId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error('Get booking details error:', error);    
    throw error;
  }
};