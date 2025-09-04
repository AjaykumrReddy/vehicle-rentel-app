import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './navigation/RootNavigator';
import { ThemeProvider } from './contexts/ThemeContext';
import { InAppNotificationProvider } from './contexts/InAppNotificationContext';
import InAppNotificationBanner from './components/InAppNotificationBanner';
import { WebSocketProvider } from './contexts/WebSocketContext';

export default function App() {
  return (
    <WebSocketProvider>
    <ThemeProvider>
      <InAppNotificationProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootNavigator />
          <InAppNotificationBanner />
        </GestureHandlerRootView>
      </InAppNotificationProvider>
    </ThemeProvider>
    </WebSocketProvider>
  );
}
