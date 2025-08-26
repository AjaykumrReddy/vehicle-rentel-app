import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './navigation/RootNavigator';
import { ThemeProvider } from './contexts/ThemeContext';
import { InAppNotificationProvider } from './contexts/InAppNotificationContext';
import InAppNotificationBanner from './components/InAppNotificationBanner';

export default function App() {
  return (
    <ThemeProvider>
      <InAppNotificationProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootNavigator />
          <InAppNotificationBanner />
        </GestureHandlerRootView>
      </InAppNotificationProvider>
    </ThemeProvider>
  );
}
