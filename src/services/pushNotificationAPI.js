import { supabase } from '../config';

class PushNotificationAPI {
  // Send push notification via Expo Push API
  async sendPushNotification(pushToken, title, body, data = {}) {
    try {
      const message = {
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
        priority: 'high',
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('Push notification sent:', result);
      return result;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  // Send booking request notification to vehicle owner
  async sendBookingRequestNotification(bookingId, vehicleOwnerId) {
    try {
      // Get owner's push token
      const { data: tokenData, error: tokenError } = await supabase
        .from('user_push_tokens')
        .select('push_token')
        .eq('user_id', vehicleOwnerId)
        .single();

      if (tokenError || !tokenData?.push_token) {
        console.log('No push token found for owner:', vehicleOwnerId);
        return;
      }

      // Get booking details
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(brand, model, vehicle_type),
          customer:users(name, phone)
        `)
        .eq('booking_id', bookingId)
        .single();

      if (bookingError || !booking) {
        console.error('Booking not found:', bookingError);
        return;
      }

      const title = '🚗 New Booking Request';
      const body = `${booking.customer.name} wants to book your ${booking.vehicle.brand} ${booking.vehicle.model}`;
      
      const data = {
        type: 'booking_request',
        bookingId: bookingId,
        vehicleId: booking.vehicle_id,
        customerId: booking.customer_id,
      };

      await this.sendPushNotification(tokenData.push_token, title, body, data);
      
      // Log notification
      await this.logNotification(vehicleOwnerId, 'booking_request', title, body, data);
      
    } catch (error) {
      console.error('Error sending booking request notification:', error);
    }
  }

  // Send booking status update notification to customer
  async sendBookingStatusNotification(bookingId, status) {
    try {
      // Get booking details
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(brand, model),
          owner:users!vehicles(name)
        `)
        .eq('booking_id', bookingId)
        .single();

      if (bookingError || !booking) {
        console.error('Booking not found:', bookingError);
        return;
      }

      // Get customer's push token
      const { data: tokenData, error: tokenError } = await supabase
        .from('user_push_tokens')
        .select('push_token')
        .eq('user_id', booking.customer_id)
        .single();

      if (tokenError || !tokenData?.push_token) {
        console.log('No push token found for customer:', booking.customer_id);
        return;
      }

      let title, body;
      
      switch (status) {
        case 'CONFIRMED':
          title = '✅ Booking Confirmed';
          body = `Your booking for ${booking.vehicle.brand} ${booking.vehicle.model} has been confirmed!`;
          break;
        case 'REJECTED':
          title = '❌ Booking Rejected';
          body = `Sorry, your booking for ${booking.vehicle.brand} ${booking.vehicle.model} was rejected.`;
          break;
        case 'CANCELLED':
          title = '🚫 Booking Cancelled';
          body = `Your booking for ${booking.vehicle.brand} ${booking.vehicle.model} has been cancelled.`;
          break;
        default:
          title = '📱 Booking Update';
          body = `Your booking status has been updated to ${status}`;
      }

      const data = {
        type: 'booking_status',
        bookingId: bookingId,
        status: status,
        vehicleId: booking.vehicle_id,
      };

      await this.sendPushNotification(tokenData.push_token, title, body, data);
      
      // Log notification
      await this.logNotification(booking.customer_id, 'booking_status', title, body, data);
      
    } catch (error) {
      console.error('Error sending booking status notification:', error);
    }
  }

  // Send reminder notifications
  async sendReminderNotification(bookingId, reminderType) {
    try {
      const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(brand, model),
          customer:users(name),
          customer_token:user_push_tokens!customer_id(push_token)
        `)
        .eq('booking_id', bookingId)
        .single();

      if (error || !booking?.customer_token?.push_token) return;

      let title, body;
      
      switch (reminderType) {
        case 'pickup_reminder':
          title = '🕐 Pickup Reminder';
          body = `Don't forget to pick up your ${booking.vehicle.brand} ${booking.vehicle.model} today!`;
          break;
        case 'return_reminder':
          title = '🔄 Return Reminder';
          body = `Time to return your ${booking.vehicle.brand} ${booking.vehicle.model}. Thank you!`;
          break;
      }

      const data = {
        type: 'reminder',
        bookingId: bookingId,
        reminderType: reminderType,
      };

      await this.sendPushNotification(booking.customer_token.push_token, title, body, data);
      
    } catch (error) {
      console.error('Error sending reminder notification:', error);
    }
  }

  // Log notification to database
  async logNotification(userId, type, title, body, data) {
    try {
      const { error } = await supabase
        .from('notification_logs')
        .insert({
          user_id: userId,
          type: type,
          title: title,
          body: body,
          data: data,
          sent_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error logging notification:', error);
      }
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  // Get user notifications
  async getUserNotifications(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }
}

export default new PushNotificationAPI();