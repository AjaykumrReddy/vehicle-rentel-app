import { apiClient } from './client';

export const chatAPI = {
  sendMessage: (bookingId, messageText, messageType = 'text', attachmentUrl = null) =>
    apiClient.post('/messages/send', {
      booking_id: bookingId,
      message_text: messageText,
      message_type: messageType,
      attachment_url: attachmentUrl
    }),

  getConversation: (bookingId) =>
    apiClient.get(`/messages/conversations/${bookingId}/messages`),

  markAsRead: (conversationId) =>
    apiClient.post(`/messages/mark-read/${conversationId}`),

  getConversations: () =>
    apiClient.get('/messages/conversations')
};