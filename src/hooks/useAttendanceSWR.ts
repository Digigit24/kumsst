/**
 * SWR-based Hooks for Attendance Module
 * Cached, auto-revalidating hooks optimized for dropdown performance
 */

import {
  attendanceNotificationApi,
  staffAttendanceApi,
  studentAttendanceApi,
  subjectAttendanceApi,
} from '../services/attendance.service';
import type {
  AttendanceNotificationFilters,
  AttendanceNotificationListItem,
  StaffAttendanceFilters,
  StaffAttendanceListItem,
  StudentAttendanceFilters,
  StudentAttendanceListItem,
  SubjectAttendanceFilters,
  SubjectAttendanceListItem,
} from '../types/attendance.types';
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

const attendanceSwrKeys = {
  studentAttendance: 'student-attendance',
  staffAttendance: 'staff-attendance',
  subjectAttendance: 'subject-attendance',
  attendanceNotifications: 'attendance-notifications',
} as const;

// ============================================================================
// STUDENT ATTENDANCE HOOKS
// ============================================================================

export const useStudentAttendanceSWR = (
  filters?: StudentAttendanceFilters | null
): UseSWRPaginatedResult<StudentAttendanceListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(attendanceSwrKeys.studentAttendance, filters),
    () => studentAttendanceApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateStudentAttendance = () => invalidateCache(attendanceSwrKeys.studentAttendance);

// ============================================================================
// STAFF ATTENDANCE HOOKS
// ============================================================================

export const useStaffAttendanceSWR = (
  filters?: StaffAttendanceFilters | null
): UseSWRPaginatedResult<StaffAttendanceListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(attendanceSwrKeys.staffAttendance, filters),
    () => staffAttendanceApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateStaffAttendance = () => invalidateCache(attendanceSwrKeys.staffAttendance);

// ============================================================================
// SUBJECT ATTENDANCE HOOKS
// ============================================================================

export const useSubjectAttendanceSWR = (
  filters?: SubjectAttendanceFilters | null
): UseSWRPaginatedResult<SubjectAttendanceListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(attendanceSwrKeys.subjectAttendance, filters),
    () => subjectAttendanceApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateSubjectAttendance = () => invalidateCache(attendanceSwrKeys.subjectAttendance);

// ============================================================================
// ATTENDANCE NOTIFICATION HOOKS
// ============================================================================

export const useAttendanceNotificationsSWR = (
  filters?: AttendanceNotificationFilters | null
): UseSWRPaginatedResult<AttendanceNotificationListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(attendanceSwrKeys.attendanceNotifications, filters),
    () => attendanceNotificationApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateAttendanceNotifications = () => invalidateCache(attendanceSwrKeys.attendanceNotifications);

// ============================================================================
// CONVENIENCE: INVALIDATE ALL ATTENDANCE DATA
// ============================================================================

export const invalidateAllAttendance = async () => {
  await Promise.all([
    invalidateStudentAttendance(),
    invalidateStaffAttendance(),
    invalidateSubjectAttendance(),
    invalidateAttendanceNotifications(),
  ]);
};
