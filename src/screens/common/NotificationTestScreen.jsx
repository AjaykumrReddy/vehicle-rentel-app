import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { supabase } from '../../config';
import PushNotificationAPI from '../../services/pushNotificationAPI';

export default function NotificationTestScreen() {
  const { colors } = useTheme();
  const { 
    isInitialized, 
    pushToken, 
    initializeNotifications, 
    sendTestNotification,
    notifications,
    unreadCount 
  } = useNotification();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user && !isInitialized) {
        await initializeNotifications(user.id);
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
        Alert.alert('Success', 'Notifications initialized successfully!');
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
    try {
      await sendTestNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const handleSendPushNotification = async () => {
    if (!pushToken) {
      Alert.alert('Error', 'No push token available');
      return;
    }

    try {
      await PushNotificationAPI.sendPushNotification(
        pushToken,
        '🚗 Test Push Notification',
        'This is a test push notification from your vehicle rental app!',
        { type: 'test', timestamp: Date.now() }
      );
      Alert.alert('Success', 'Push notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send push notification');
    }
  };

  const handleCreateTestBooking = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    try {
      // Create a test booking notification
      await PushNotificationAPI.sendBookingRequestNotification(
        'test-booking-123',
        user.id
      );
      Alert.alert('Success', 'Test booking notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send booking notification');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          🔔 Notification Test
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Test push notification functionality
        </Text>
      </View>

      {/* Status Cards */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
            Initialization Status
          </Text>
          <Text style={[styles.statusValue, { color: isInitialized ? '#00C851' : '#FF8800' }]}>
            {isInitialized ? '✅ Initialized' : '⏳ Not Initialized'}
          </Text>
        </View>

        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
            Push Token
          </Text>
          <Text style={[styles.statusValue, { color: pushToken ? '#00C851' : '#DC3545' }]}>
            {pushToken ? '✅ Available' : '❌ Not Available'}
          </Text>
        </View>

        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
            Unread Notifications
          </Text>
          <Text style={[styles.statusValue, { color: colors.primary }]}>
            {unreadCount} notifications
          </Text>
        </View>
      </View>

      {/* Push Token Display */}
      {pushToken && (
        <View style={[styles.tokenContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.tokenLabel, { color: colors.textSecondary }]}>
            Push Token:
          </Text>
          <Text style={[styles.tokenValue, { color: colors.text }]} numberOfLines={3}>
            {pushToken}
          </Text>
        </View>
      )}

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
          <Text style={styles.buttonText}>Send Local Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: '#FF8800' }]}
          onPress={handleSendPushNotification}
          disabled={!pushToken}
        >
          <Text style={styles.buttonText}>Send Push Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: '#00C851' }]}
          onPress={handleCreateTestBooking}
          disabled={!isInitialized}
        >
          <Text style={styles.buttonText}>Test Booking Notification</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <View style={[styles.notificationsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.notificationsTitle, { color: colors.text }]}>
            Recent Notifications ({notifications.length})
          </Text>
          {notifications.slice(0, 5).map((notification, index) => (
            <View key={index} style={[styles.notificationItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>
                {notification.title}
              </Text>
              <Text style={[styles.notificationBody, { color: colors.textSecondary }]}>
                {notification.body}
              </Text>
              <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                {new Date(notification.sent_at).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Instructions */}
      <View style={[styles.instructionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.instructionsTitle, { color: colors.text }]}>
          📋 Testing Instructions
        </Text>
        <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
          1. Initialize notifications first{'\n'}
          2. Test local notifications{'\n'}
          3. Test push notifications{'\n'}
          4. Test booking notifications{'\n'}
          5. Check notification logs in database
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
  tokenContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  tokenValue: {
    fontSize: 10,
    fontFamily: 'monospace',
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