import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { chatAPI } from '../api/chatAPI';
import websocketService from '../services/websocketService';
import { getAuthToken } from '../utils/storage';

export default function ChatScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { booking } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [otherUserStatus, setOtherUserStatus] = useState('offline');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadMessages();
    initializeWebSocket();
    return () => {
      websocketService.off('new_message', handleNewMessage);
      websocketService.off('typing_status', handleTypingStatus);
      websocketService.off('user_status', handleUserStatus);
      websocketService.off('connected', handleWebSocketConnected);
    };
  }, []);

  const initializeWebSocket = async () => {
    try {
      // Get auth token
      const token = await getAuthToken();
      
      if (!token) {
        console.error('No auth token found');
        Alert.alert('Error', 'Authentication required for chat');
        return;
      }
      
      console.log('Initializing WebSocket with token');
      
      // Connect WebSocket
      websocketService.connect(token);
      
      // Setup listeners
      setupWebSocket();
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const bookingId = booking.booking_id || booking.id;
      const response = await chatAPI.getConversation(bookingId);
      if (response.success) {
        setMessages(response.data.messages || []);
        if (response.data.conversation_id) {
          await chatAPI.markAsRead(response.data.conversation_id);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    console.log('Setting up WebSocket for booking:', booking);
    websocketService.on('new_message', handleNewMessage);
    websocketService.on('typing_status', handleTypingStatus);
    websocketService.on('user_status', handleUserStatus);
    websocketService.on('connected', handleWebSocketConnected);
    websocketService.on('disconnected', () => setConnectionStatus('disconnected'));
    websocketService.on('error', () => setConnectionStatus('error'));
  };

  const handleWebSocketConnected = (data) => {
    console.log('WebSocket connected with user data:', data);
    setConnectionStatus('connected');
    if (data && data.user_id) {
      console.log('WebSocket connected with user:', data.user_id);
      // Now we can get other user status
      const otherUserId = booking.owner_id === data.user_id ? booking.renter_id : booking.owner_id;
      if (otherUserId) {
        websocketService.getUserStatus(otherUserId);
      }
    } else {
      console.warn('WebSocket connected but no user data received');
    }
  };

  const handleNewMessage = (data) => {
    const bookingId = booking.booking_id || booking.id;
    console.log('Received new message for booking:', bookingId, 'Message booking:', data.booking_id);
    if (data.booking_id === bookingId) {
      setMessages(prev => {
        // Avoid duplicate messages
        const exists = prev.find(msg => msg.id === data.id);
        if (exists) return prev;
        
        return [...prev, {
          id: data.id,
          sender_id: data.sender_id,
          message_text: data.message_text,
          created_at: data.created_at
        }];
      });
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const handleTypingStatus = (data) => {
    const bookingId = booking.booking_id || booking.id;
    if (data.booking_id === bookingId) {
      setOtherUserTyping(data.is_typing);
    }
  };

  const handleUserStatus = (data) => {
    setOtherUserStatus(data.status);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      const bookingId = booking.booking_id || booking.id;
      const response = await chatAPI.sendMessage(bookingId, messageText);
      if (response.success) {
        // Add message immediately for better UX
        const newMessage = {
          id: response.data?.message_id || Date.now(),
          sender_id: websocketService.userId,
          message_text: messageText,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setInputText(messageText);
    }
  };

  const handleInputChange = (text) => {
    setInputText(text);
    
    if (!websocketService.userId || !booking) return;
    
    const otherUserId = booking.owner_id === websocketService.userId ? booking.renter_id : booking.owner_id;
    
    if (text.length > 0 && !isTyping && otherUserId) {
      setIsTyping(true);
      const bookingId = booking.booking_id || booking.id;
      websocketService.sendTyping(bookingId, otherUserId, true);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && otherUserId) {
        setIsTyping(false);
        const bookingId = booking.booking_id || booking.id;
        websocketService.sendTyping(bookingId, otherUserId, false);
      }
    }, 1000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessage = ({ item, index }) => {
    const isMyMessage = item.sender_id === websocketService.userId;
    const showTime = index === 0 || 
      new Date(item.created_at).getTime() - new Date(messages[index - 1]?.created_at).getTime() > 300000;

    return (
      <View style={styles.messageContainer}>
        {showTime && (
          <Text style={[styles.timeStamp, { color: colors.textSecondary }]}>
            {formatTime(item.created_at)}
          </Text>
        )}
        <View style={[
          styles.messageBubble,
          isMyMessage 
            ? { backgroundColor: colors.primary, alignSelf: 'flex-end' }
            : { backgroundColor: colors.card, alignSelf: 'flex-start' }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isMyMessage ? '#FFFFFF' : colors.text }
          ]}>
            {item.message_text}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!otherUserTyping) return null;
    
    return (
      <View style={[styles.typingContainer, { backgroundColor: colors.card }]}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
          <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
          <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
        </View>
        <Text style={[styles.typingText, { color: colors.textSecondary }]}>typing...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {booking.vehicle?.brand} {booking.vehicle?.model}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {connectionStatus === 'connected' 
              ? (otherUserStatus === 'online' ? '🟢 Online' : '⚫ Offline')
              : connectionStatus === 'connecting' ? '🟡 Connecting...' : '🔴 Disconnected'
            }
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item.id || index.toString()}
            style={styles.messagesList}
            contentContainerStyle={[styles.messagesContent, messages.length === 0 && styles.emptyContent]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>💬</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No messages yet</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Start the conversation!</Text>
              </View>
            }
          />
        )}

        {/* Typing Indicator */}
        {renderTypingIndicator()}

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: inputText.trim() ? colors.primary : colors.border }]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50, borderBottomWidth: 1 },
  backButton: { fontSize: 24, marginRight: 16 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  chatContainer: { flex: 1 },
  messagesList: { flex: 1 },
  messagesContent: { padding: 16 },
  messageContainer: { marginBottom: 16 },
  timeStamp: { textAlign: 'center', fontSize: 12, marginBottom: 8 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 4 },
  messageText: { fontSize: 16 },
  typingContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, marginHorizontal: 16, borderRadius: 16, marginBottom: 8 },
  typingDots: { flexDirection: 'row', marginRight: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  typingText: { fontSize: 14, fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, alignItems: 'flex-end' },
  textInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, marginRight: 12, maxHeight: 100 },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
  emptyContent: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' ,fontSize: 18, fontWeight: '600' },
})