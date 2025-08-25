import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import SignupScreen from '../screens/SignupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddVehicleScreen from '../screens/AddVehicleScreen';
import ImageUploadScreen from '../screens/ImageUploadScreen';
import AvailabilitySetupScreen from '../screens/AvailabilitySetupScreen';
import SetVehicleAvailabilityScreen from '../screens/SetVehicleAvailabilityScreen';
import VehicleBookingScreen from '../screens/VehicleBookingScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddVehicle" component={AddVehicleScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ImageUpload" component={ImageUploadScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AvailabilitySetup" component={AvailabilitySetupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SetVehicleAvailability" component={SetVehicleAvailabilityScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VehicleBooking" component={VehicleBookingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
