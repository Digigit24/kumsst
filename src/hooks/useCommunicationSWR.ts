/**
 * SWR-based Hooks for Communication Module
 * Cached, auto-revalidating hooks optimized for dropdown performance
 */

import {
  bulkMessagesApi,
  chatsApi,
  eventRegistrationsApi,
  eventsApi,
  messageLogsApi,
  messageTemplatesApi,
  noticesApi,
  noticeVisibilityApi,
  notificationRulesApi,
} from '../services/communication.service';
import type {
  BulkMessage,
  BulkMessageFilters,
  Chat,
  ChatFilters,
  Event,
  EventFilters,
  EventRegistration,
  EventRegistrationFilters,
  MessageLog,
  MessageLogFilters,
  MessageTemplate,
  MessageTemplateFilters,
  Notice,
  NoticeFilters,
  NoticeVisibility,
  NoticeVisibilityFilters,
  NotificationRule,
  NotificationRuleFilters,
} from '../types/communication.types';
import {
  dropdownSwrConfig,
  generateCacheKey,
  invalidateCache,
  useSWRPaginated,
  UseSWRPaginatedResult,
} from './useSWR';

// ============================================================================
// SWR CACHE KEY CONSTANTS
// ============================================================================

const communicationSwrKeys = {
  bulkMessages: 'bulk-messages',
  chats: 'chats',
  events: 'events',
  eventRegistrations: 'event-registrations',
  messageLogs: 'message-logs',
  messageTemplates: 'message-templates',
  notices: 'notices',
  noticeVisibility: 'notice-visibility',
  notificationRules: 'notification-rules',
} as const;

// ============================================================================
// BULK MESSAGES HOOKS
// ============================================================================

export const useBulkMessagesSWR = (
  filters?: BulkMessageFilters
): UseSWRPaginatedResult<BulkMessage> => {
  return useSWRPaginated(
    generateCacheKey(communicationSwrKeys.bulkMessages, filters),
    () => bulkMessagesApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateBulkMessages = () => invalidateCache(communicationSwrKeys.bulkMessages);

// ============================================================================
// CHATS HOOKS
// ============================================================================

export const useChatsSWR = (
  filters?: ChatFilters
): UseSWRPaginatedResult<Chat> => {
  return useSWRPaginated(
    generateCacheKey(communicationSwrKeys.chats, filters),
    () => chatsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateChats = () => invalidateCache(communicationSwrKeys.chats);

// ============================================================================
// EVENTS HOOKS
// ============================================================================

export const useEventsSWR = (
  filters?: EventFilters
): UseSWRPaginatedResult<Event> => {
  return useSWRPaginated(
    generateCacheKey(communicationSwrKeys.events, filters),
    () => eventsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateEvents = () => invalidateCache(communicationSwrKeys.events);

// ============================================================================
// EVENT REGISTRATIONS HOOKS
// ============================================================================

export const useEventRegistrationsSWR = (
  filters?: EventRegistrationFilters
): UseSWRPaginatedResult<EventRegistration> => {
  return useSWRPaginated(
    generateCacheKey(communicationSwrKeys.eventRegistrations, filters),
    () => eventRegistrationsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateEventRegistrations = () => invalidateCache(communicationSwrKeys.eventRegistrations);

// ============================================================================
// MESSAGE LOGS HOOKS
// ============================================================================

export const useMessageLogsSWR = (
  filters?: MessageLogFilters
): UseSWRPaginatedResult<MessageLog> => {
  return useSWRPaginated(
    generateCacheKey(communicationSwrKeys.messageLogs, filters),
    () => messageLogsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateMessageLogs = () => invalidateCache(communicationSwrKeys.messageLogs);

// ============================================================================
// MESSAGE TEMPLATES HOOKS
// ============================================================================

export const useMessageTemplatesSWR = (
  filters?: MessageTemplateFilters
): UseSWRPaginatedResult<MessageTemplate> => {
  return useSWRPaginated(
    generateCacheKey(communicationSwrKeys.messageTemplates, filters),
    () => messageTemplatesApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateMessageTemplates = () => invalidateCache(communicationSwrKeys.messageTemplates);

// ============================================================================
// NOTICES HOOKS
// ============================================================================

export const useNoticesSWR = (
  filters?: NoticeFilters
): UseSWRPaginatedResult<Notice> => {
  return useSWRPaginated(
    generateCacheKey(communicationSwrKeys.notices, filters),
    () => noticesApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateNotices = () => invalidateCache(communicationSwrKeys.notices);

// ============================================================================
// NOTICE VISIBILITY HOOKS
// ============================================================================

export const useNoticeVisibilitySWR = (
  filters?: NoticeVisibilityFilters
): UseSWRPaginatedResult<NoticeVisibility> => {
  return useSWRPaginated(
    generateCacheKey(communicationSwrKeys.noticeVisibility, filters),
    () => noticeVisibilityApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateNoticeVisibility = () => invalidateCache(communicationSwrKeys.noticeVisibility);

// ============================================================================
// NOTIFICATION RULES HOOKS
// ============================================================================

export const useNotificationRulesSWR = (
  filters?: NotificationRuleFilters
): UseSWRPaginatedResult<NotificationRule> => {
  return useSWRPaginated(
    generateCacheKey(communicationSwrKeys.notificationRules, filters),
    () => notificationRulesApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateNotificationRules = () => invalidateCache(communicationSwrKeys.notificationRules);

// ============================================================================
// CONVENIENCE: INVALIDATE ALL COMMUNICATION DATA
// ============================================================================

export const invalidateAllCommunication = async () => {
  await Promise.all([
    invalidateBulkMessages(),
    invalidateChats(),
    invalidateEvents(),
    invalidateEventRegistrations(),
    invalidateMessageLogs(),
    invalidateMessageTemplates(),
    invalidateNotices(),
    invalidateNoticeVisibility(),
    invalidateNotificationRules(),
  ]);
};
