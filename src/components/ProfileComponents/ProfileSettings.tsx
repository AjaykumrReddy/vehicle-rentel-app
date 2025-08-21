import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { isDarkMode, toggleTheme, colors } = useTheme();
  
  return (
    <>
      {/* Quick Actions */}
      <View style={[styles.quickActions, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={styles.quickActionItem}>
          <Text style={styles.quickActionIcon}>🏆</Text>
          <Text style={[styles.quickActionText, { color: colors.textSecondary }]}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem}>
          <Text style={styles.quickActionIcon}>💰</Text>
          <Text style={[styles.quickActionText, { color: colors.textSecondary }]}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionItem}>
          <Text style={styles.quickActionIcon}>🎯</Text>
          <Text style={[styles.quickActionText, { color: colors.textSecondary }]}>Referrals</Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View style={[styles.settingsSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🔔</Text>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Notifications</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Push notifications & alerts</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={onNotificationToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>📍</Text>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Location Services</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Allow location access</Text>
            </View>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={onLocationToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🌙</Text>
            <View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Switch to dark theme</Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
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