// Communication API Service
import { API_BASE_URL, getCollegeId } from '../config/api.config';
import type {
  BulkMessage,
  BulkMessageCreateInput,
  BulkMessageFilters,
  BulkMessageUpdateInput,
  Chat,
  ChatCreateInput,
  ChatFilters,
  ChatUpdateInput,
  ConversationListResponse,
  ConversationResponse,
  Event,
  EventCreateInput,
  EventFilters,
  EventRegistration,
  EventRegistrationCreateInput,
  EventRegistrationFilters,
  EventRegistrationUpdateInput,
  EventUpdateInput,
  MessageLog,
  MessageLogCreateInput,
  MessageLogFilters,
  MessageLogUpdateInput,
  MessageTemplate,
  MessageTemplateCreateInput,
  MessageTemplateFilters,
  MessageTemplateUpdateInput,
  Notice,
  NoticeCreateInput,
  NoticeFilters,
  NoticeUpdateInput,
  NoticeVisibility,
  NoticeVisibilityCreateInput,
  NoticeVisibilityFilters,
  NoticeVisibilityUpdateInput,
  NotificationRule,
  NotificationRuleCreateInput,
  NotificationRuleFilters,
  NotificationRuleUpdateInput,
  PaginatedResponse,
} from '../types/communication.types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build query string from parameters object
 */
const buildQueryString = (params: Record<string, any>): string => {
  const filteredParams = Object.entries(params).reduce(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, any>
  );

  const queryString = new URLSearchParams(
    Object.entries(filteredParams).map(([key, value]) => [key, String(value)])
  ).toString();

  return queryString ? `?${queryString}` : '';
};

/**
 * Fetch wrapper with error handling
 */
const fetchApi = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const token = localStorage.getItem('access_token');

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-College-ID': getCollegeId(),
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(typeof errorData.detail === 'string' ? errorData.detail : typeof errorData.message === 'string' ? errorData.message : typeof errorData.error === 'string' ? errorData.error : `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// ============================================================================
// BULK MESSAGES API
// ============================================================================

export const bulkMessagesApi = {
  /**
   * List all bulk messages with optional filters
   */
  list: (filters?: BulkMessageFilters): Promise<PaginatedResponse<BulkMessage>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<BulkMessage>>(
      `${API_BASE_URL}/api/v1/communication/bulk-messages/${queryString}`
    );
  },

  /**
   * Get a single bulk message by ID
   */
  get: (id: number): Promise<BulkMessage> => {
    return fetchApi<BulkMessage>(
      `${API_BASE_URL}/api/v1/communication/bulk-messages/${id}/`
    );
  },

  /**
   * Create a new bulk message
   */
  create: (data: BulkMessageCreateInput): Promise<BulkMessage> => {
    return fetchApi<BulkMessage>(
      `${API_BASE_URL}/api/v1/communication/bulk-messages/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update an existing bulk message (PUT - full update)
   */
  update: (id: number, data: BulkMessageUpdateInput): Promise<BulkMessage> => {
    return fetchApi<BulkMessage>(
      `${API_BASE_URL}/api/v1/communication/bulk-messages/${id}/`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Partially update a bulk message (PATCH)
   */
  partialUpdate: (id: number, data: Partial<BulkMessageUpdateInput>): Promise<BulkMessage> => {
    return fetchApi<BulkMessage>(
      `${API_BASE_URL}/api/v1/communication/bulk-messages/${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete a bulk message
   */
  delete: (id: number): Promise<void> => {
    return fetchApi<void>(
      `${API_BASE_URL}/api/v1/communication/bulk-messages/${id}/`,
      {
        method: 'DELETE',
      }
    );
  },
};

// ============================================================================
// CHATS API
// ============================================================================

export const chatsApi = {
  /**
   * List all chats with optional filters
   */
  list: (filters?: ChatFilters): Promise<PaginatedResponse<Chat>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<Chat>>(
      `${API_BASE_URL}/api/v1/communication/chats/${queryString}`
    );
  },

  /**
   * Get a single chat by ID
   */
  get: (id: number): Promise<Chat> => {
    return fetchApi<Chat>(
      `${API_BASE_URL}/api/v1/communication/chats/${id}/`
    );
  },

  /**
   * Create a new chat message
   */
  create: (data: ChatCreateInput): Promise<Chat> => {
    return fetchApi<Chat>(
      `${API_BASE_URL}/api/v1/communication/chats/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update an existing chat (PUT - full update)
   */
  update: (id: number, data: ChatUpdateInput): Promise<Chat> => {
    return fetchApi<Chat>(
      `${API_BASE_URL}/api/v1/communication/chats/${id}/`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Partially update a chat (PATCH)
   */
  partialUpdate: (id: number, data: Partial<ChatUpdateInput>): Promise<Chat> => {
    return fetchApi<Chat>(
      `${API_BASE_URL}/api/v1/communication/chats/${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete a chat
   */
  delete: (id: number): Promise<void> => {
    return fetchApi<void>(
      `${API_BASE_URL}/api/v1/communication/chats/${id}/`,
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Mark a chat as read
   */
  markAsRead: (id: number): Promise<Chat> => {
    return fetchApi<Chat>(
      `${API_BASE_URL}/api/v1/communication/chats/${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          is_read: true,
          read_at: new Date().toISOString(),
        }),
      }
    );
  },

  /**
   * Get list of conversations (Sidebar)
   */
  getConversations: (): Promise<ConversationListResponse[]> => {
    return fetchApi<ConversationListResponse[]>(
      `${API_BASE_URL}/api/v1/communication/chats/conversations/`
    );
  },

  /**
   * Get conversation with a specific user
   */
  getConversation: (otherUserId: number | string, limit: number = 50): Promise<ConversationResponse> => {
    return fetchApi<ConversationResponse>(
      `${API_BASE_URL}/api/v1/communication/chats/conversation/${otherUserId}/?limit=${limit}`
    );
  },
};

// ============================================================================
// EVENTS API
// ============================================================================

export const eventsApi = {
  /**
   * List all events with optional filters
   */
  list: (filters?: EventFilters): Promise<PaginatedResponse<Event>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<Event>>(
      `${API_BASE_URL}/api/v1/communication/events/${queryString}`
    );
  },

  /**
   * Get a single event by ID
   */
  get: (id: number): Promise<Event> => {
    return fetchApi<Event>(
      `${API_BASE_URL}/api/v1/communication/events/${id}/`
    );
  },

  /**
   * Create a new event
   */
  create: (data: EventCreateInput): Promise<Event> => {
    return fetchApi<Event>(
      `${API_BASE_URL}/api/v1/communication/events/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update an existing event (PUT - full update)
   */
  update: (id: number, data: EventUpdateInput): Promise<Event> => {
    return fetchApi<Event>(
      `${API_BASE_URL}/api/v1/communication/events/${id}/`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Partially update an event (PATCH)
   */
  partialUpdate: (id: number, data: Partial<EventUpdateInput>): Promise<Event> => {
    return fetchApi<Event>(
      `${API_BASE_URL}/api/v1/communication/events/${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete an event
   */
  delete: (id: number): Promise<void> => {
    return fetchApi<void>(
      `${API_BASE_URL}/api/v1/communication/events/${id}/`,
      {
        method: 'DELETE',
      }
    );
  },
};

// ============================================================================
// EVENT REGISTRATIONS API
// ============================================================================

export const eventRegistrationsApi = {
  /**
   * List all event registrations with optional filters
   */
  list: (filters?: EventRegistrationFilters): Promise<PaginatedResponse<EventRegistration>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<EventRegistration>>(
      `${API_BASE_URL}/api/v1/communication/event-registrations/${queryString}`
    );
  },

  /**
   * Get a single event registration by ID
   */
  get: (id: number): Promise<EventRegistration> => {
    return fetchApi<EventRegistration>(
      `${API_BASE_URL}/api/v1/communication/event-registrations/${id}/`
    );
  },

  /**
   * Create a new event registration
   */
  create: (data: EventRegistrationCreateInput): Promise<EventRegistration> => {
    return fetchApi<EventRegistration>(
      `${API_BASE_URL}/api/v1/communication/event-registrations/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update an existing event registration (PUT - full update)
   */
  update: (id: number, data: EventRegistrationUpdateInput): Promise<EventRegistration> => {
    return fetchApi<EventRegistration>(
      `${API_BASE_URL}/api/v1/communication/event-registrations/${id}/`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Partially update an event registration (PATCH)
   */
  partialUpdate: (id: number, data: Partial<EventRegistrationUpdateInput>): Promise<EventRegistration> => {
    return fetchApi<EventRegistration>(
      `${API_BASE_URL}/api/v1/communication/event-registrations/${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete an event registration
   */
  delete: (id: number): Promise<void> => {
    return fetchApi<void>(
      `${API_BASE_URL}/api/v1/communication/event-registrations/${id}/`,
      {
        method: 'DELETE',
      }
    );
  },
};

// ============================================================================
// MESSAGE LOGS API
// ============================================================================

export const messageLogsApi = {
  /**
   * List all message logs with optional filters
   */
  list: (filters?: MessageLogFilters): Promise<PaginatedResponse<MessageLog>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<MessageLog>>(
      `${API_BASE_URL}/api/v1/communication/message-logs/${queryString}`
    );
  },

  /**
   * Get a single message log by ID
   */
  get: (id: number): Promise<MessageLog> => {
    return fetchApi<MessageLog>(
      `${API_BASE_URL}/api/v1/communication/message-logs/${id}/`
    );
  },

  /**
   * Create a new message log
   */
  create: (data: MessageLogCreateInput): Promise<MessageLog> => {
    return fetchApi<MessageLog>(
      `${API_BASE_URL}/api/v1/communication/message-logs/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update an existing message log (PUT - full update)
   */
  update: (id: number, data: MessageLogUpdateInput): Promise<MessageLog> => {
    return fetchApi<MessageLog>(
      `${API_BASE_URL}/api/v1/communication/message-logs/${id}/`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Partially update a message log (PATCH)
   */
  partialUpdate: (id: number, data: Partial<MessageLogUpdateInput>): Promise<MessageLog> => {
    return fetchApi<MessageLog>(
      `${API_BASE_URL}/api/v1/communication/message-logs/${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete a message log
   */
  delete: (id: number): Promise<void> => {
    return fetchApi<void>(
      `${API_BASE_URL}/api/v1/communication/message-logs/${id}/`,
      {
        method: 'DELETE',
      }
    );
  },
};

// ============================================================================
// NOTICES API
// ============================================================================

export const noticesApi = {
  /**
   * List all notices with optional filters
   */
  list: (filters?: NoticeFilters): Promise<PaginatedResponse<Notice>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<Notice>>(
      `${API_BASE_URL}/api/v1/communication/notices/${queryString}`
    );
  },

  /**
   * Get a single notice by ID
   */
  get: (id: number): Promise<Notice> => {
    return fetchApi<Notice>(
      `${API_BASE_URL}/api/v1/communication/notices/${id}/`
    );
  },

  /**
   * Create a new notice
   */
  create: (data: NoticeCreateInput): Promise<Notice> => {
    return fetchApi<Notice>(
      `${API_BASE_URL}/api/v1/communication/notices/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update an existing notice (PUT - full update)
   */
  update: (id: number, data: NoticeUpdateInput): Promise<Notice> => {
    return fetchApi<Notice>(
      `${API_BASE_URL}/api/v1/communication/notices/${id}/`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Partially update a notice (PATCH)
   */
  partialUpdate: (id: number, data: Partial<NoticeUpdateInput>): Promise<Notice> => {
    return fetchApi<Notice>(
      `${API_BASE_URL}/api/v1/communication/notices/${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete a notice
   */
  delete: (id: number): Promise<void> => {
    return fetchApi<void>(
      `${API_BASE_URL}/api/v1/communication/notices/${id}/`,
      {
        method: 'DELETE',
      }
    );
  },
};

// ============================================================================
// NOTIFICATION RULES API
// ============================================================================

export const notificationRulesApi = {
  /**
   * List all notification rules with optional filters
   */
  list: (filters?: NotificationRuleFilters): Promise<PaginatedResponse<NotificationRule>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<NotificationRule>>(
      `${API_BASE_URL}/api/v1/communication/notification-rules/${queryString}`
    );
  },

  /**
   * Get a single notification rule by ID
   */
  get: (id: number): Promise<NotificationRule> => {
    return fetchApi<NotificationRule>(
      `${API_BASE_URL}/api/v1/communication/notification-rules/${id}/`
    );
  },

  /**
   * Create a new notification rule
   */
  create: (data: NotificationRuleCreateInput): Promise<NotificationRule> => {
    return fetchApi<NotificationRule>(
      `${API_BASE_URL}/api/v1/communication/notification-rules/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update an existing notification rule (PUT - full update)
   */
  update: (id: number, data: NotificationRuleUpdateInput): Promise<NotificationRule> => {
    return fetchApi<NotificationRule>(
      `${API_BASE_URL}/api/v1/communication/notification-rules/${id}/`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Partially update a notification rule (PATCH)
   */
  partialUpdate: (id: number, data: Partial<NotificationRuleUpdateInput>): Promise<NotificationRule> => {
    return fetchApi<NotificationRule>(
      `${API_BASE_URL}/api/v1/communication/notification-rules/${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete a notification rule
   */
  delete: (id: number): Promise<void> => {
    return fetchApi<void>(
      `${API_BASE_URL}/api/v1/communication/notification-rules/${id}/`,
      {
        method: 'DELETE',
      }
    );
  },
};

// ============================================================================
// MESSAGE TEMPLATES API
// ============================================================================

export const messageTemplatesApi = {
  /**
   * List all message templates with optional filters
   */
  list: (filters?: MessageTemplateFilters): Promise<PaginatedResponse<MessageTemplate>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<MessageTemplate>>(
      `${API_BASE_URL}/api/v1/communication/message-templates/${queryString}`
    );
  },

  /**
   * Get a single message template by ID
   */
  get: (id: number): Promise<MessageTemplate> => {
    return fetchApi<MessageTemplate>(
      `${API_BASE_URL}/api/v1/communication/message-templates/${id}/`
    );
  },

  /**
   * Create a new message template
   */
  create: (data: MessageTemplateCreateInput): Promise<MessageTemplate> => {
    return fetchApi<MessageTemplate>(
      `${API_BASE_URL}/api/v1/communication/message-templates/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update an existing message template (PUT - full update)
   */
  update: (id: number, data: MessageTemplateUpdateInput): Promise<MessageTemplate> => {
    return fetchApi<MessageTemplate>(
      `${API_BASE_URL}/api/v1/communication/message-templates/${id}/`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Partially update a message template (PATCH)
   */
  partialUpdate: (id: number, data: Partial<MessageTemplateUpdateInput>): Promise<MessageTemplate> => {
    return fetchApi<MessageTemplate>(
      `${API_BASE_URL}/api/v1/communication/message-templates/${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete a message template
   */
  delete: (id: number): Promise<void> => {
    return fetchApi<void>(
      `${API_BASE_URL}/api/v1/communication/message-templates/${id}/`,
      {
        method: 'DELETE',
      }
    );
  },
};

// ============================================================================
// NOTICE VISIBILITY API
// ============================================================================

export const noticeVisibilityApi = {
  /**
   * List all notice visibilities with optional filters
   */
  list: (filters?: NoticeVisibilityFilters): Promise<PaginatedResponse<NoticeVisibility>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<NoticeVisibility>>(
      `${API_BASE_URL}/api/v1/communication/notice-visibility/${queryString}`
    );
  },

  /**
   * Get a single notice visibility by ID
   */
  get: (id: number): Promise<NoticeVisibility> => {
    return fetchApi<NoticeVisibility>(
      `${API_BASE_URL}/api/v1/communication/notice-visibility/${id}/`
    );
  },

  /**
   * Create a new notice visibility
   */
  create: (data: NoticeVisibilityCreateInput): Promise<NoticeVisibility> => {
    return fetchApi<NoticeVisibility>(
      `${API_BASE_URL}/api/v1/communication/notice-visibility/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update an existing notice visibility (PUT - full update)
   */
  update: (id: number, data: NoticeVisibilityUpdateInput): Promise<NoticeVisibility> => {
    return fetchApi<NoticeVisibility>(
      `${API_BASE_URL}/api/v1/communication/notice-visibility/${id}/`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Partially update a notice visibility (PATCH)
   */
  partialUpdate: (id: number, data: Partial<NoticeVisibilityUpdateInput>): Promise<NoticeVisibility> => {
    return fetchApi<NoticeVisibility>(
      `${API_BASE_URL}/api/v1/communication/notice-visibility/${id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete a notice visibility
   */
  delete: (id: number): Promise<void> => {
    return fetchApi<void>(
      `${API_BASE_URL}/api/v1/communication/notice-visibility/${id}/`,
      {
        method: 'DELETE',
      }
    );
  },
};
