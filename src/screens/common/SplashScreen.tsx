import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { getAuthToken } from '../../utils/storage';

export default function SplashScreen({ navigation }: { navigation: any }) {
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getAuthToken();
      
      setTimeout(() => {
        if (token) {
          navigation.replace('Search');
        } else {
          navigation.replace('Onboarding');
        }
      }, 2000);
    } catch (error) {
      console.error('Error checking auth status:', error);
      navigation.replace('Onboarding');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🚗</Text>
      <Text style={styles.title}>Vehicle Rental</Text>
      <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});