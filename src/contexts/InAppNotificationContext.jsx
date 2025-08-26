import React, { createContext, useContext, useEffect, useState } from 'react';
import InAppNotificationService from '../services/inAppNotificationService';

const InAppNotificationContext = createContext();

export const useInAppNotification = () => {
  const context = useContext(InAppNotificationContext);
  if (!context) {
    throw new Error('useInAppNotification must be used within InAppNotificationProvider');
  }
  return context;
};

export const InAppNotificationProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentNotification, setCurrentNotification] = useState(null);

  // Initialize notification service
  const initializeNotifications = async (userId) => {
    try {
      if (!userId) {
        console.log('No user ID provided for notification initialization');
        return false;
      }

      const success = await InAppNotificationService.initialize(userId);
      if (success) {
        setIsInitialized(true);
        
        // Load existing notifications
        const existingNotifications = InAppNotificationService.getNotifications();
        setNotifications(existingNotifications);
        setUnreadCount(InAppNotificationService.getUnreadCount());
        
        // Set up listener for new notifications
        const removeListener = InAppNotificationService.addListener((event, data) => {
          switch (event) {
            case 'new_notification':
              setNotifications(InAppNotificationService.getNotifications());
              setUnreadCount(InAppNotificationService.getUnreadCount());
              break;
            case 'show_notification':
              setCurrentNotification(data);
              // Auto-hide after 5 seconds
              setTimeout(() => setCurrentNotification(null), 5000);
              break;
            case 'notification_read':
              setNotifications(InAppNotificationService.getNotifications());
              setUnreadCount(InAppNotificationService.getUnreadCount());
              break;
          }
        });

        console.log('In-app notifications initialized successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize in-app notifications:', error);
      return false;
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await InAppNotificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Send test notification
  const sendTestNotification = async (userId) => {
    try {
      await InAppNotificationService.sendNotification(
        userId,
        'test',
        '🧪 Test Notification',
        'This is a test in-app notification!',
        { timestamp: Date.now() }
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  // Dismiss current notification
  const dismissCurrentNotification = () => {
    setCurrentNotification(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      InAppNotificationService.cleanup();
    };
  }, []);

  const value = {
    isInitialized,
    notifications,
    unreadCount,
    currentNotification,
    initializeNotifications,
    markAsRead,
    sendTestNotification,
    dismissCurrentNotification,
  };

  return (
    <InAppNotificationContext.Provider value={value}>
      {children}
    </InAppNotificationContext.Provider>
  );
};

export default InAppNotificationContext;