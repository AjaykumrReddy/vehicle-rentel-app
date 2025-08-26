import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import NotificationService from '../services/notificationService';
import PushNotificationAPI from '../services/pushNotificationAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [pushToken, setPushToken] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize notification service
  const initializeNotifications = async (userId) => {
    try {
      if (!userId) {
        console.log('No user ID provided for notification initialization');
        return false;
      }

      const success = await NotificationService.initialize(userId);
      if (success) {
        setIsInitialized(true);
        const token = await AsyncStorage.getItem('expoPushToken');
        setPushToken(token);
        
        // Load existing notifications
        await loadNotifications(userId);
        
        console.log('Notifications initialized successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  };

  // Load user notifications
  const loadNotifications = async (userId) => {
    try {
      const userNotifications = await PushNotificationAPI.getUserNotifications(userId);
      setNotifications(userNotifications);
      
      // Count unread notifications (assuming we add a 'read' field later)
      const unread = userNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    try {
      await NotificationService.sendTestNotification();
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      // Update in database (implement this in your backend)
      // For now, just update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && isInitialized) {
        // Refresh notifications when app becomes active
        // You can implement this based on your needs
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      NotificationService.cleanup();
    };
  }, []);

  const value = {
    isInitialized,
    pushToken,
    notifications,
    unreadCount,
    initializeNotifications,
    loadNotifications,
    sendTestNotification,
    markAsRead,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;