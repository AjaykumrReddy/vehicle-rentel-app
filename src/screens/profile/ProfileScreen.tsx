import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getUserData, clearAuthData, getAuthToken } from '../../utils/storage';
import { getUserVehicles } from '../../api/authService';
import api from '../../api/axios';
import ProfileHeader from '../../components/ProfileComponents/ProfileHeader';
import MyVehiclesSection from '../../components/ProfileComponents/MyVehiclesSection';
import ProfileSettings from '../../components/ProfileComponents/ProfileSettings';
import { useTheme } from '../../contexts/ThemeContext';
import ProfileMenu from '../../components/ProfileComponents/ProfileMenu';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
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

  const onVehicleDeleted = (deletedVehicleId: string) =>{
    setUserVehicles(prevVehicles => prevVehicles.filter(vehicle => vehicle.id !== deletedVehicleId));
  }

  if (!userData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader 
          userData={userData} 
          vehicleCount={userVehicles.length}
          onBack={() => navigation.goBack()}
        />
        
        <MyVehiclesSection vehicles={userVehicles} onAddVehicle={handleAddVehicle} onVehicleDeleted={onVehicleDeleted} navigation={navigation}/>
        
        <ProfileSettings 
          notificationsEnabled={notificationsEnabled}
          locationEnabled={locationEnabled}
          onNotificationToggle={setNotificationsEnabled}
          onLocationToggle={setLocationEnabled}
        />
        
        <ProfileMenu navigation={navigation} onLogout={handleLogout} />
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