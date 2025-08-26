import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialize notification service
  async initialize(userId) {
    try {
      // Request permissions
      const permission = await this.requestPermissions();
      if (!permission) {
        console.log('Notification permissions denied');
        return false;
      }

      // Get push token
      const token = await this.getPushToken();
      if (!token) {
        console.log('Failed to get push token');
        return false;
      }

      // Save token to database
      await this.savePushToken(userId, token);

      // Set up listeners
      this.setupNotificationListeners();

      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  // Request notification permissions
  async requestPermissions() {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          return false;
        }

        return true;
      } else {
        console.log('Must use physical device for Push Notifications');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // Get Expo push token
  async getPushToken() {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = token.data;
      await AsyncStorage.setItem('expoPushToken', token.data);
      
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Save push token to Supabase
  async savePushToken(userId, token) {
    try {
      const { error } = await supabase
        .from('user_push_tokens')
        .upsert({
          user_id: userId,
          push_token: token,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      console.log('Push token saved successfully');
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification received
  handleNotificationReceived(notification) {
    const { data } = notification.request.content;
    
    // Handle different notification types
    switch (data?.type) {
      case 'booking_request':
        this.handleBookingRequest(data);
        break;
      case 'booking_status':
        this.handleBookingStatus(data);
        break;
      default:
        console.log('Unknown notification type:', data?.type);
    }
  }

  // Handle notification tap
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    // Navigate based on notification type
    switch (data?.type) {
      case 'booking_request':
        // Navigate to owner dashboard
        this.navigateToOwnerDashboard(data.bookingId);
        break;
      case 'booking_status':
        // Navigate to booking details
        this.navigateToBookingDetails(data.bookingId);
        break;
    }
  }

  // Handle booking request notification
  handleBookingRequest(data) {
    // Update local state, show in-app notification, etc.
    console.log('New booking request:', data);
  }

  // Handle booking status notification
  handleBookingStatus(data) {
    // Update booking status in local state
    console.log('Booking status update:', data);
  }

  // Navigation helpers (to be implemented with your navigation)
  navigateToOwnerDashboard(bookingId) {
    // Implement navigation to owner dashboard
    console.log('Navigate to owner dashboard for booking:', bookingId);
  }

  navigateToBookingDetails(bookingId) {
    // Implement navigation to booking details
    console.log('Navigate to booking details:', bookingId);
  }

  // Send notification (for testing)
  async sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: 'This is a test notification!',
          data: { type: 'test' },
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new NotificationService();