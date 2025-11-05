import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../contexts/ThemeContext';
// import SearchScreen from '../screens/SearchScreen';
import SearchScreen from '../screens/common/SearchScreen';
import MyBookingsScreen from '../screens/booking/MyBookingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MapScreen from '../screens/common/MapScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 20,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '🔍' : '🔍'}</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="MyBookings" 
        component={MyBookingsScreen}
        options={{
          tabBarLabel: 'My Rides',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '🚗' : '🚗'}</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '🗺️' : '🗺️'}</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '👤' : '👤'}</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}