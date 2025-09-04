import React, { createContext, useContext, useEffect, useState } from 'react';
import websocketService from '../services/websocketService';
import { getAuthToken } from '../utils/storage';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    initializeWebSocket();
    
    websocketService.on('connected', () => {
      setIsConnected(true);
      setConnectionStatus('connected');
    });

    websocketService.on('disconnected', () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    websocketService.on('error', (error) => {
      setConnectionStatus('error');
    });

    return () => {
      websocketService.disconnect();
    };
  }, []);

  const initializeWebSocket = async () => {
    try {
      const token = await getAuthToken();
      
      if (token) {
        websocketService.connect(token);
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  };

  const reconnect = async () => {
    await initializeWebSocket();
  };

  return (
    <WebSocketContext.Provider value={{
      isConnected,
      connectionStatus,
      reconnect,
      websocketService
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};