import { supabase } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

class InAppNotificationService {
  constructor() {
    this.listeners = [];
    this.notifications = [];
  }

  // Initialize in-app notification service
  async initialize(userId) {
    try {
      this.userId = userId;
      
      // Load existing notifications
      await this.loadNotifications();
      
      // Set up real-time subscription for new notifications
      this.setupRealtimeSubscription();
      
      console.log('In-app notification service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize in-app notifications:', error);
      return false;
    }
  }

  // Set up real-time subscription for notifications
  setupRealtimeSubscription() {
    if (!this.userId) return;

    // Subscribe to notification_logs table for real-time updates
    const subscription = supabase
      .channel('notification_logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification_logs',
          filter: `user_id=eq.${this.userId}`
        },
        (payload) => {
          console.log('New notification received:', payload.new);
          this.handleNewNotification(payload.new);
        }
      )
      .subscribe();

    this.subscription = subscription;
  }

  // Handle new notification
  handleNewNotification(notification) {
    // Add to local notifications array
    this.notifications.unshift(notification);
    
    // Show in-app notification
    this.showInAppNotification(notification);
    
    // Notify listeners
    this.notifyListeners('new_notification', notification);
    
    // Save to local storage
    this.saveNotificationsToStorage();
  }

  // Show in-app notification (you can customize this)
  showInAppNotification(notification) {
    // This could trigger a toast, modal, or banner
    console.log('📱 New Notification:', notification.title, notification.body);
    
    // You can integrate with a toast library or custom notification component
    this.notifyListeners('show_notification', {
      title: notification.title,
      body: notification.body,
      type: notification.type,
      data: notification.data
    });
  }

  // Load notifications from database
  async loadNotifications() {
    try {
      if (!this.userId) return;

      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('user_id', this.userId)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      this.notifications = data || [];
      await this.saveNotificationsToStorage();
      
      return this.notifications;
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  // Save notifications to local storage
  async saveNotificationsToStorage() {
    try {
      await AsyncStorage.setItem(
        `notifications_${this.userId}`,
        JSON.stringify(this.notifications)
      );
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  }

  // Get notifications
  getNotifications() {
    return this.notifications;
  }

  // Get unread count
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      // Update in database
      const { error } = await supabase
        .from('notification_logs')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      this.notifications = this.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );

      await this.saveNotificationsToStorage();
      this.notifyListeners('notification_read', notificationId);
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Send notification (for testing or internal use)
  async sendNotification(userId, type, title, body, data = {}) {
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

      if (error) throw error;
      console.log('Notification sent successfully');
      
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Send booking request notification
  async sendBookingRequestNotification(bookingId, vehicleOwnerId) {
    try {
      // Get booking details (you'll need to adapt this to your API)
      const bookingDetails = await this.getBookingDetails(bookingId);
      
      const title = '🚗 New Booking Request';
      const body = `New booking request for your ${bookingDetails.vehicle?.brand || 'vehicle'}`;
      
      const data = {
        type: 'booking_request',
        bookingId: bookingId,
        vehicleId: bookingDetails.vehicle_id,
        customerId: bookingDetails.customer_id,
      };

      await this.sendNotification(vehicleOwnerId, 'booking_request', title, body, data);
      
    } catch (error) {
      console.error('Error sending booking request notification:', error);
    }
  }

  // Send booking status notification
  async sendBookingStatusNotification(bookingId, customerId, status) {
    try {
      let title, body;
      
      switch (status) {
        case 'CONFIRMED':
          title = '✅ Booking Confirmed';
          body = 'Your booking has been confirmed!';
          break;
        case 'REJECTED':
          title = '❌ Booking Rejected';
          body = 'Sorry, your booking was rejected.';
          break;
        case 'CANCELLED':
          title = '🚫 Booking Cancelled';
          body = 'Your booking has been cancelled.';
          break;
        default:
          title = '📱 Booking Update';
          body = `Your booking status has been updated to ${status}`;
      }

      const data = {
        type: 'booking_status',
        bookingId: bookingId,
        status: status,
      };

      await this.sendNotification(customerId, 'booking_status', title, body, data);
      
    } catch (error) {
      console.error('Error sending booking status notification:', error);
    }
  }

  // Get booking details (adapt to your API)
  async getBookingDetails(bookingId) {
    try {
      // This should call your existing booking API
      // For now, returning mock data
      return {
        booking_id: bookingId,
        vehicle: { brand: 'Honda', model: 'City' },
        customer_id: 'customer-123',
        vehicle_id: 'vehicle-123'
      };
    } catch (error) {
      console.error('Error getting booking details:', error);
      return {};
    }
  }

  // Add listener for notification events
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notify all listeners
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // Cleanup
  cleanup() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.listeners = [];
  }
}

export default new InAppNotificationService();