// Communication Module Type Definitions

// ============================================================================
// BULK MESSAGES TYPES
// ============================================================================

export interface BulkMessage {
  id: number;
  is_active: boolean;
  title: string;
  message_type: string;
  recipient_type: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  college: number;
  template: number | null;
}

export interface BulkMessageCreateInput {
  is_active?: boolean;
  title: string;
  message_type: string;
  recipient_type: string;
  total_recipients?: number;
  sent_count?: number;
  failed_count?: number;
  status?: string;
  scheduled_at?: string | null;
  sent_at?: string | null;
  created_by?: string;
  updated_by?: string;
  college?: number;
  template?: number | null;
}

export interface BulkMessageUpdateInput {
  is_active?: boolean;
  title?: string;
  message_type?: string;
  recipient_type?: string;
  total_recipients?: number;
  sent_count?: number;
  failed_count?: number;
  status?: string;
  scheduled_at?: string | null;
  sent_at?: string | null;
  updated_by?: string;
  college?: number;
  template?: number | null;
}

export interface BulkMessageFilters {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  message_type?: string;
  recipient_type?: string;
  status?: string;
  college?: number;
  created_by?: string;
}

// ============================================================================
// CHATS TYPES
// ============================================================================

export interface Chat {
  id: number;
  is_active: boolean;
  message: string;
  attachment: string | null;
  attachment_url?: string | null;
  attachment_type?: string | null;
  is_read: boolean;
  read_at: string | null;
  delivered_at?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  sender: string;
  receiver: string;
  sender_name?: string;
  sender_username?: string;
  sender_avatar?: string | null;
  receiver_name?: string;
  receiver_username?: string;
  receiver_avatar?: string | null;
  conversation?: number;
  timestamp?: string;
  unread_count?: number;
  last_message?: Chat;
  status?: 'sending' | 'sent' | 'error';
  tempId?: string;
}

export interface ConversationUser {
  id: string;
  username: string;
  full_name: string;
  avatar: string | null;
  is_online: boolean;
}

export interface ConversationResponse {
  conversation_id: string | number;
  messages: Chat[];
  other_user: ConversationUser;
  has_more: boolean;
}

export interface ConversationListResponse {
  conversation_id: number;
  other_user: ConversationUser;
  last_message: Chat;
  unread_count: number;
}

export interface ChatCreateInput {
  is_active?: boolean;
  message: string;
  attachment?: File | string | null;
  is_read?: boolean;
  read_at?: string | null;
  created_by?: string;
  updated_by?: string;
  receiver_id: number | string;
}

export interface ChatUpdateInput {
  is_active?: boolean;
  message?: string;
  attachment?: string | null;
  is_read?: boolean;
  read_at?: string | null;
  updated_by?: string;
  sender?: string;
  receiver?: string;
}

export interface ChatFilters {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  is_read?: boolean;
  sender?: string;
  receiver?: string;
}

// ============================================================================
// EVENTS TYPES
// ============================================================================

export interface Event {
  id: number;
  is_active: boolean;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  organizer: string;
  max_participants: number;
  registration_required: boolean;
  registration_deadline: string;
  image: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  college: number;
}

export interface EventCreateInput {
  is_active?: boolean;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  organizer: string;
  max_participants: number;
  registration_required?: boolean;
  registration_deadline?: string;
  image?: string | null;
  created_by?: string;
  updated_by?: string;
  college?: number;
}

export interface EventUpdateInput {
  is_active?: boolean;
  title?: string;
  description?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  organizer?: string;
  max_participants?: number;
  registration_required?: boolean;
  registration_deadline?: string;
  image?: string | null;
  updated_by?: string;
  college?: number;
}

export interface EventFilters {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  event_date?: string;
  registration_required?: boolean;
  college?: number;
}

// ============================================================================
// EVENT REGISTRATIONS TYPES
// ============================================================================

export interface EventRegistration {
  id: number;
  is_active: boolean;
  registration_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  event: number;
  user: string;
}

export interface EventRegistrationCreateInput {
  is_active?: boolean;
  registration_date?: string;
  status?: string;
  created_by?: string;
  updated_by?: string;
  event: number;
  user: string;
}

export interface EventRegistrationUpdateInput {
  is_active?: boolean;
  registration_date?: string;
  status?: string;
  updated_by?: string;
  event?: number;
  user?: string;
}

export interface EventRegistrationFilters {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  status?: string;
  event?: number;
  user?: string;
}

// ============================================================================
// SHARED TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Message Types
export type MessageType = "sms" | "email" | "push" | "notification" | "all";

// Recipient Types
export type RecipientType =
  | "student"
  | "guardian"
  | "teacher"
  | "staff"
  | "all"
  | "custom";

// Message Status
export type MessageStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed"
  | "delivered";

// Event Registration Status
export type RegistrationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "attended"
  | "no_show";

// ============================================================================
// MESSAGE LOGS TYPES
// ============================================================================

export interface MessageLog {
  id: number;
  is_active: boolean;
  message_type: string;
  phone_email: string;
  message: string;
  status: string;
  sent_at: string | null;
  delivered_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  bulk_message: number | null;
  recipient: string;
}

export interface MessageLogCreateInput {
  is_active?: boolean;
  message_type: string;
  phone_email: string;
  message: string;
  status?: string;
  sent_at?: string | null;
  delivered_at?: string | null;
  error_message?: string | null;
  created_by?: string;
  updated_by?: string;
  bulk_message?: number | null;
  recipient: string;
}

export interface MessageLogUpdateInput {
  is_active?: boolean;
  message_type?: string;
  phone_email?: string;
  message?: string;
  status?: string;
  sent_at?: string | null;
  delivered_at?: string | null;
  error_message?: string | null;
  updated_by?: string;
  bulk_message?: number | null;
  recipient?: string;
}

export interface MessageLogFilters {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  message_type?: string;
  status?: string;
  bulk_message?: number;
  recipient?: string;
}

// ============================================================================
// NOTICES TYPES
// ============================================================================

export interface Notice {
  id: number;
  is_active: boolean;
  title: string;
  content: string;
  publish_date: string;
  expiry_date: string;
  attachment: string | null;
  is_urgent: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  college: number;
  target_audience?: string;
  college_name?: string;
  created_by_name?: string;
  updated_by_name?: string;
  notice_type?: string;
}

export interface NoticeCreateInput {
  is_active?: boolean;
  title: string;
  content: string;
  publish_date: string;
  expiry_date: string;
  attachment?: string | null;
  is_urgent?: boolean;
  is_published?: boolean;
  created_by?: string;
  updated_by?: string;
  college?: number;
  target_audience?: string;
  class_obj?: number | null;
  section?: number | null;
  notice_type?: string;
}

export interface NoticeUpdateInput {
  is_active?: boolean;
  title?: string;
  content?: string;
  publish_date?: string;
  expiry_date?: string;
  attachment?: string | null;
  is_urgent?: boolean;
  is_published?: boolean;
  updated_by?: string;
  college?: number;
  target_audience?: string;
}

export interface NoticeFilters {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  is_urgent?: boolean;
  is_published?: boolean;
  college?: number;
  ordering?: string;
}

// ============================================================================
// NOTIFICATION RULES TYPES
// ============================================================================

export interface NotificationRule {
  id: number;
  is_active: boolean;
  name: string;
  event_type: string;
  channels: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  college: number;
  template: number;
}

export interface NotificationRuleCreateInput {
  is_active?: boolean;
  name: string;
  event_type: string;
  channels: string;
  is_enabled?: boolean;
  created_by?: string;
  updated_by?: string;
  college?: number;
  template: number;
}

export interface NotificationRuleUpdateInput {
  is_active?: boolean;
  name?: string;
  event_type?: string;
  channels?: string;
  is_enabled?: boolean;
  updated_by?: string;
  college?: number;
  template?: number;
}

export interface NotificationRuleFilters {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  is_enabled?: boolean;
  event_type?: string;
  college?: number;
  template?: number;
}

// ============================================================================
// MESSAGE TEMPLATES TYPES
// ============================================================================

export interface MessageTemplate {
  id: number;
  is_active: boolean;
  name: string;
  code: string;
  message_type: string;
  content: string;
  variables: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  college: number;
}

export interface MessageTemplateCreateInput {
  is_active?: boolean;
  name: string;
  code: string;
  message_type: string;
  content: string;
  variables?: string;
  created_by?: string;
  updated_by?: string;
  college?: number;
}

export interface MessageTemplateUpdateInput {
  is_active?: boolean;
  name?: string;
  code?: string;
  message_type?: string;
  content?: string;
  variables?: string;
  updated_by?: string;
  college?: number;
}

export interface MessageTemplateFilters {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  message_type?: string;
  college?: number;
}

// ============================================================================
// NOTICE VISIBILITY TYPES
// ============================================================================

export interface NoticeVisibility {
  id: number;
  is_active: boolean;
  target_type: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  notice: number;
  class_obj: number | null;
  section: number | null;
}

export interface NoticeVisibilityCreateInput {
  is_active?: boolean;
  target_type: string;
  created_by?: string;
  updated_by?: string;
  notice: number;
  class_obj?: number | null;
  section?: number | null;
}

export interface NoticeVisibilityUpdateInput {
  is_active?: boolean;
  target_type?: string;
  updated_by?: string;
  notice?: number;
  class_obj?: number | null;
  section?: number | null;
}

export interface NoticeVisibilityFilters {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  target_type?: string;
  notice?: number;
  class_obj?: number;
  section?: number;
}
