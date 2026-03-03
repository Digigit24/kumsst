/**
 * Chat API Service - Complete Implementation
 * Handles all chat-related API calls following the integration guide
 */

import apiClient from "./apiClient";

/**
 * Message type definition
 */
export interface Message {
  id: number;
  sender: number;
  sender_name: string;
  sender_username: string;
  sender_avatar: string | null;
  receiver: number;
  receiver_name: string;
  receiver_username: string;
  receiver_avatar: string | null;
  conversation: number;
  message: string;
  attachment: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  is_read: boolean;
  read_at: string | null;
  delivered_at: string | null;
  timestamp: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

/**
 * Conversation type definition
 */
export interface Conversation {
  conversation_id: number;
  other_user: {
    id: number;
    username: string;
    full_name: string;
    avatar: string | null;
    is_online: boolean;
  };
  last_message: string;
  last_message_at: string;
  last_message_by_me: boolean;
  unread_count: number;
  updated_at: string;
}

/**
 * Conversation messages response
 */
export interface ConversationMessagesResponse {
  conversation_id: number;
  other_user: {
    id: number;
    username: string;
    full_name: string;
    avatar: string | null;
    is_online: boolean;
  };
  messages: Message[];
  has_more: boolean;
}

/**
 * Get messages options
 */
export interface GetMessagesOptions {
  limit?: number;
  offset?: number;
  before_id?: number;
}

/**
 * Mark as read options
 */
export interface MarkAsReadOptions {
  message_ids?: number[];
  conversation_id?: number;
  sender_id?: number;
}

/**
 * Mark as read response
 */
export interface MarkAsReadResponse {
  success: boolean;
  marked_count: number;
  read_at: string;
}

/**
 * Unread count response
 */
export interface UnreadCountResponse {
  total_unread: number;
  conversations: Array<{
    conversation_id: number;
    unread_count: number;
    other_user_id: number;
    other_user_name: string;
  }>;
}

/**
 * Online users response
 */
export interface OnlineUsersResponse {
  online_users: number[];
}

/**
 * Complete Chat API
 */
export const chatAPI = {
  /**
   * Get all conversations
   * GET /communication/chats/conversations/
   */
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const response = await apiClient.get<Conversation[]>(
        "/api/v1/communication/chats/conversations/"
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get messages in a conversation
   * GET /communication/chats/conversation/{user_id}/
   */
  getMessages: async (
    userId: number,
    options: GetMessagesOptions = {}
  ): Promise<ConversationMessagesResponse> => {
    const { limit = 50, offset = 0, before_id } = options;

    const params: any = {
      limit,
      offset,
    };

    if (before_id) {
      params.before_id = before_id;
    }

    try {
      const response = await apiClient.get<ConversationMessagesResponse>(
        `/api/v1/communication/chats/conversation/${userId}/`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Send a text message
   * POST /communication/chats/
   */
  sendMessage: async (
    receiverId: number,
    message: string,
    attachment: File | null = null
  ): Promise<Message> => {
    try {
      let response;

      if (attachment) {
        // Send with attachment using FormData
        const formData = new FormData();
        formData.append("receiver_id", receiverId.toString());
        formData.append("message", message);
        formData.append("attachment", attachment);

        response = await apiClient.post<Message>(
          "/api/v1/communication/chats/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Send text message
        response = await apiClient.post<Message>(
          "/api/v1/communication/chats/",
          {
            receiver_id: receiverId,
            message: message,
          }
        );
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark messages as read
   * POST /communication/chats/mark-read/
   */
  markAsRead: async (
    options: MarkAsReadOptions
  ): Promise<MarkAsReadResponse> => {
    try {
      const response = await apiClient.post<MarkAsReadResponse>(
        "/api/v1/communication/chats/mark-read/",
        options
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Convenience method: Mark conversation as read
   */
  markConversationAsRead: async (
    conversationId: number
  ): Promise<MarkAsReadResponse> => {
    return chatAPI.markAsRead({ conversation_id: conversationId });
  },

  /**
   * Convenience method: Mark specific messages as read
   */
  markMessagesAsRead: async (
    messageIds: number[]
  ): Promise<MarkAsReadResponse> => {
    return chatAPI.markAsRead({ message_ids: messageIds });
  },

  /**
   * Send typing indicator
   * POST /communication/chats/typing/
   */
  sendTyping: async (
    receiverId: number,
    isTyping: boolean
  ): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.post<{ success: boolean }>(
        "/api/v1/communication/chats/typing/",
        {
          receiver_id: receiverId,
          is_typing: isTyping,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get unread message count
   * GET /communication/chats/unread-count/
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    try {
      const response = await apiClient.get<UnreadCountResponse>(
        "/api/v1/communication/chats/unread-count/"
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get online users
   * GET /communication/chats/online-users/
   */
  getOnlineUsers: async (): Promise<OnlineUsersResponse> => {
    try {
      const response = await apiClient.get<OnlineUsersResponse>(
        "/api/v1/communication/chats/online-users/"
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default chatAPI;
