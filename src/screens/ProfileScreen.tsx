import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getUserData, clearAuthData, getAuthToken } from '../utils/storage';
import { getUserVehicles } from '../api/authService';
import api from '../api/axios';
import ProfileHeader from '../components/ProfileHeader';
import MyVehiclesSection from '../components/MyVehiclesSection';
import ProfileSettings from '../components/ProfileSettings';
import ProfileMenu from '../components/ProfileMenu';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [userVehicles, setUserVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  useEffect(() => {
    loadUserData();
    loadUserVehicles();
  }, []);

  const loadUserData = async () => {
    const data = await getUserData();
    setUserData(data);
  };

  const loadUserVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const token = await getAuthToken();
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const vehicles = await getUserVehicles();
        setUserVehicles(vehicles);
      }
    } catch (error) {
      console.error('Error loading user vehicles:', error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearAuthData();
            navigation.replace('Onboarding');
          },
        },
      ]
    );
  };

  const handleAddVehicle = () => {
    navigation.navigate('AddVehicle');
  };

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader 
          userData={userData} 
          vehicleCount={userVehicles.length}
          onBack={() => navigation.goBack()}
        />
        
        <MyVehiclesSection vehicles={userVehicles} onAddVehicle={handleAddVehicle} />
        
        <ProfileSettings 
          notificationsEnabled={notificationsEnabled}
          locationEnabled={locationEnabled}
          onNotificationToggle={setNotificationsEnabled}
          onLocationToggle={setLocationEnabled}
        />
        
        <ProfileMenu onLogout={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
});