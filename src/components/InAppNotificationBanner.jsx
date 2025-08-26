import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useInAppNotification } from '../contexts/InAppNotificationContext';

export default function InAppNotificationBanner() {
  const { colors } = useTheme();
  const { currentNotification, dismissCurrentNotification } = useInAppNotification();

  if (!currentNotification) return null;

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_request': return '#007AFF';
      case 'booking_status': return '#00C851';
      case 'test': return '#FF8800';
      default: return colors.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[
          styles.notification,
          { 
            backgroundColor: colors.card,
            borderLeftColor: getNotificationColor(currentNotification.type),
            borderColor: colors.border
          }
        ]}
        onPress={dismissCurrentNotification}
        activeOpacity={0.9}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {currentNotification.title}
          </Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            {currentNotification.body}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={dismissCurrentNotification}
        >
          <Text style={[styles.closeText, { color: colors.textSecondary }]}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  body: {
    fontSize: 12,
    lineHeight: 16,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  closeText: {
    fontSize: 20,
    fontWeight: '300',
  },
});