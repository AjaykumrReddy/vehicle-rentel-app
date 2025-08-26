import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useInAppNotification } from '../contexts/InAppNotificationContext';
import { supabase } from '../config';

export default function InAppNotificationTestScreen() {
  const { colors } = useTheme();
  const { 
    isInitialized, 
    initializeNotifications, 
    sendTestNotification,
    notifications,
    unreadCount,
    markAsRead
  } = useInAppNotification();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      // For testing, we'll use a mock user ID
      // In real app, get from your auth system
      const mockUser = { id: 'test-user-123', name: 'Test User' };
      setUser(mockUser);
      
      if (mockUser && !isInitialized) {
        await initializeNotifications(mockUser.id);
      }
    } catch (error) {
      console.error('Error getting user:', error);
    }
  };

  const handleInitializeNotifications = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const success = await initializeNotifications(user.id);
      if (success) {
        Alert.alert('Success', 'In-app notifications initialized successfully!');
      } else {
        Alert.alert('Error', 'Failed to initialize notifications');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    try {
      await sendTestNotification(user.id);
      Alert.alert('Success', 'Test notification sent! Check the banner above.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const handleSendBookingNotification = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    try {
      // Simulate booking request notification
      const { error } = await supabase
        .from('notification_logs')
        .insert({
          user_id: user.id,
          type: 'booking_request',
          title: '🚗 New Booking Request',
          body: 'John Doe wants to book your Honda City for 2 days',
          data: {
            type: 'booking_request',
            bookingId: 'test-booking-123',
            customerId: 'customer-456'
          },
          sent_at: new Date().toISOString(),
        });

      if (error) throw error;
      Alert.alert('Success', 'Booking notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send booking notification');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      Alert.alert('Error', 'Failed to mark as read');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          🔔 In-App Notification Test
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Test real-time in-app notifications
        </Text>
      </View>

      {/* Status Cards */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
            Status
          </Text>
          <Text style={[styles.statusValue, { color: isInitialized ? '#00C851' : '#FF8800' }]}>
            {isInitialized ? '✅ Ready' : '⏳ Not Ready'}
          </Text>
        </View>

        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
            User ID
          </Text>
          <Text style={[styles.statusValue, { color: user ? '#00C851' : '#DC3545' }]}>
            {user ? '✅ Set' : '❌ Not Set'}
          </Text>
        </View>

        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
            Unread
          </Text>
          <Text style={[styles.statusValue, { color: colors.primary }]}>
            {unreadCount} notifications
          </Text>
        </View>
      </View>

      {/* Test Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: colors.primary }]}
          onPress={handleInitializeNotifications}
          disabled={loading || isInitialized}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Initializing...' : 'Initialize Notifications'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: '#007AFF' }]}
          onPress={handleSendTestNotification}
          disabled={!isInitialized}
        >
          <Text style={styles.buttonText}>Send Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: '#00C851' }]}
          onPress={handleSendBookingNotification}
          disabled={!isInitialized}
        >
          <Text style={styles.buttonText}>Send Booking Notification</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <View style={[styles.notificationsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.notificationsTitle, { color: colors.text }]}>
            Recent Notifications ({notifications.length})
          </Text>
          {notifications.slice(0, 10).map((notification, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.notificationItem, { borderBottomColor: colors.border }]}
              onPress={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, { color: colors.text }]}>
                  {notification.title} {!notification.read && '🔴'}
                </Text>
                <Text style={[styles.notificationBody, { color: colors.textSecondary }]}>
                  {notification.body}
                </Text>
                <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                  {new Date(notification.sent_at).toLocaleString()}
                </Text>
              </View>
              {!notification.read && (
                <Text style={[styles.unreadIndicator, { color: colors.primary }]}>
                  Tap to mark as read
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Instructions */}
      <View style={[styles.instructionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.instructionsTitle, { color: colors.text }]}>
          📋 How It Works
        </Text>
        <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
          1. Initialize notifications{'\n'}
          2. Send test notifications{'\n'}
          3. Watch for banner at top{'\n'}
          4. Check notification list below{'\n'}
          5. Real-time updates via Supabase{'\n'}
          6. Works without push notifications!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  statusCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  testButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationsContainer: {
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  notificationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 12,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 10,
  },
  unreadIndicator: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 4,
  },
  instructionsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    lineHeight: 18,
  },
});