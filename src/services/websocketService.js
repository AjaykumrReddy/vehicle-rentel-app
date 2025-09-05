import { Config } from "../config";
const API_BASE_URL = Config.API_BASE_URL;
class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.listeners = new Map();
    this.isConnected = false;
    this.userId = null;
    this.token = null;
    this.heartbeatInterval = null;
    this.pingTimeout = null;
  }

  connect(token) {
    // Prevent multiple connections
    if (this.isConnected && this.token === token) {
      return;
    }
    
    this.token = token;
    
    // Close existing connection if any
    if (this.ws) {
      this.ws.close();
    }
    
    const wsBaseUrl = API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const wsUrl = `${wsBaseUrl}/ws/chat?token=${token}`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {

      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        
        // Handle pong response
        if (data.type === 'pong') {
          if (this.pingTimeout) {
            clearTimeout(this.pingTimeout);
            this.pingTimeout = null;
          }
          return;
        }
        
        // Store user ID from connection response
        if (data.type === 'connected' && data.user_id) {
          this.userId = data.user_id;
        }
        
        this.emit(data.type, data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {

      this.isConnected = false;
      this.stopHeartbeat();
      this.emit('disconnected');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        if (this.token) {
          this.connect(this.token);
        }
      }, this.reconnectInterval);
    }
  }

  sendMessage(type, data) {
    if (this.ws && this.isConnected) {
      const message = { type, ...data };

      this.ws.send(JSON.stringify(message));
    } else {

    }
  }

  sendTyping(bookingId, otherUserId, isTyping) {
    this.sendMessage('typing', {
      booking_id: bookingId,
      other_user_id: otherUserId,
      is_typing: isTyping
    });
  }

  getUserStatus(targetUserId) {
    this.sendMessage('get_status', { target_user_id: targetUserId });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.sendMessage('ping', {});
        this.pingTimeout = setTimeout(() => {

          this.ws?.close();
        }, 5000);
      }
    }, 60000); // Send ping every 60 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }
}

export default new WebSocketService();