import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';

interface ProfileMenuProps {
  onLogout: () => void;
}

export default function ProfileMenu({ onLogout }: ProfileMenuProps) {
  const menuItems = [
    { icon: '🚗', title: 'My Bookings', subtitle: 'View your rental history', onPress: () => {} },
    { icon: '💳', title: 'Payment Methods', subtitle: 'Manage cards & wallets', onPress: () => {} },
    { icon: '🎫', title: 'Offers & Coupons', subtitle: 'Available discounts', onPress: () => {} },
    { icon: '📍', title: 'Saved Addresses', subtitle: 'Home, work & more', onPress: () => {} },
    { icon: '🛡️', title: 'Safety', subtitle: 'Emergency contacts & settings', onPress: () => {} },
    { icon: '❓', title: 'Help & Support', subtitle: 'FAQs & contact us', onPress: () => {} },
    { icon: '⚖️', title: 'Legal', subtitle: 'Terms & privacy policy', onPress: () => {} },
  ];

  return (
    <>
      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
        <Text style={styles.memberSince}>Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  menuSection: {
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: '500',
  },
  appInfo: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  appVersion: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  memberSince: {
    fontSize: 12,
    color: '#666',
  },
});