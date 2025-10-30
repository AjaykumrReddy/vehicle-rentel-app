import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Common screens
import SplashScreen from '../screens/common/SplashScreen';
import OnboardingScreen from '../screens/common/OnboardingScreen';
import SearchScreen from '../screens/common/SearchScreen';
import VehicleResultsScreen from '../screens/common/VehicleResultsScreen';
import MapScreen from '../screens/common/MapScreen';
import LocationPickerScreen from '../screens/common/LocationPickerScreen';
import BottomTabNavigator from './BottomTabNavigator';

// Auth screens
import { LoginScreen, OTPVerificationScreen, SignupScreen } from '../screens/auth';

// Booking screens
import { VehicleBookingScreen, MyBookingsScreen } from '../screens/booking';

// Payment screens
import { PaymentScreen, WebViewPaymentScreen, PaymentSuccessScreen, RazorpayWebViewScreen } from '../screens/payment';

// Individual screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import AddVehicleScreen from '../screens/vehicle/AddVehicleScreen';
import ImageUploadScreen from '../screens/vehicle/ImageUploadScreen';
import AvailabilitySetupScreen from '../screens/vehicle/AvailabilitySetupScreen';
import SetVehicleAvailabilityScreen from '../screens/vehicle/SetVehicleAvailabilityScreen';
import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import ChatScreen from '../screens/chat/ChatScreen';

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
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VehicleResults" component={VehicleResultsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LocationPicker" component={LocationPickerScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddVehicle" component={AddVehicleScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ImageUpload" component={ImageUploadScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AvailabilitySetup" component={AvailabilitySetupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SetVehicleAvailability" component={SetVehicleAvailabilityScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VehicleBooking" component={VehicleBookingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="WebViewPayment" component={WebViewPaymentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RazorpayWebView" component={RazorpayWebViewScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
