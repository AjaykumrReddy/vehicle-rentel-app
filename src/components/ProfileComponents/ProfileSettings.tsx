import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';

interface ProfileSettingsProps {
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  onNotificationToggle: (value: boolean) => void;
  onLocationToggle: (value: boolean) => void;
}

export default function ProfileSettings({ 
  notificationsEnabled, 
  locationEnabled, 
  onNotificationToggle, 
  onLocationToggle 
}: ProfileSettingsProps) {
  return (
    <>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionItem}>
          <Text style={styles.quickActionIcon}>🏆</Text>
          <Text style={styles.quickActionText}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem}>
          <Text style={styles.quickActionIcon}>💰</Text>
          <Text style={styles.quickActionText}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem}>
          <Text style={styles.quickActionIcon}>🎯</Text>
          <Text style={styles.quickActionText}>Referrals</Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🔔</Text>
            <View>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingSubtitle}>Push notifications & alerts</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={onNotificationToggle}
            trackColor={{ false: '#ccc', true: '#007AFF' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>📍</Text>
            <View>
              <Text style={styles.settingTitle}>Location Services</Text>
              <Text style={styles.settingSubtitle}>Allow location access</Text>
            </View>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={onLocationToggle}
            trackColor={{ false: '#ccc', true: '#007AFF' }}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    marginBottom: 10,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  settingsSection: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});