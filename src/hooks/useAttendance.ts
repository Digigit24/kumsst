/**
 * React hooks for Attendance Module
 * Uses React Query for data fetching and caching
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    attendanceNotificationApi,
    staffAttendanceApi,
    studentAttendanceApi,
    subjectAttendanceApi,
} from '../services/attendance.service';
import type {
    AttendanceNotification,
    AttendanceNotificationCreateInput,
    AttendanceNotificationFilters,
    AttendanceNotificationListItem,
    AttendanceNotificationUpdateInput,
    AttendanceSummary,
    BulkAttendanceCreateInput,
    BulkStaffAttendanceInput,
    StaffAttendance,
    StaffAttendanceCreateInput,
    StaffAttendanceFilters,
    StaffAttendanceListItem,
    StaffAttendanceUpdateInput,
    StudentAttendance,
    StudentAttendanceCreateInput,
    StudentAttendanceFilters,
    StudentAttendanceListItem,
    StudentAttendanceUpdateInput,
    SubjectAttendance,
    SubjectAttendanceCreateInput,
    SubjectAttendanceFilters,
    SubjectAttendanceListItem,
    SubjectAttendanceUpdateInput,
} from '../types/attendance.types';
import type { PaginatedResponse } from '../types/core.types';

// ============================================================================
// STUDENT ATTENDANCE HOOKS
// ============================================================================

/**
 * Fetch student attendance records with filters
 */
export const useStudentAttendance = (filters?: StudentAttendanceFilters) => {
  return useQuery<PaginatedResponse<StudentAttendanceListItem>>({
    queryKey: ['student-attendance', filters],
    queryFn: () => studentAttendanceApi.list(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Fetch a single student attendance record
 */
export const useStudentAttendanceDetail = (id: number | null) => {
  return useQuery<StudentAttendance>({
    queryKey: ['student-attendance-detail', id],
    queryFn: () => studentAttendanceApi.get(id!),
    enabled: !!id,
  });
};

/**
 * Mark student attendance
 */
export const useMarkStudentAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation<StudentAttendance, Error, StudentAttendanceCreateInput>({
    mutationFn: (data) => studentAttendanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] });
    },
  });
};

/**
 * Update student attendance
 */
export const useUpdateStudentAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation<StudentAttendance, Error, { id: number; data: StudentAttendanceUpdateInput }>({
    mutationFn: ({ id, data }) => studentAttendanceApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['student-attendance-detail', variables.id] });
    },
  });
};

/**
 * Partially update student attendance
 */
export const usePatchStudentAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation<StudentAttendance, Error, { id: number; data: Partial<StudentAttendanceUpdateInput> }>({
    mutationFn: ({ id, data }) => studentAttendanceApi.patch(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['student-attendance-detail', variables.id] });
    },
  });
};

/**
 * Delete student attendance
 */
export const useDeleteStudentAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => studentAttendanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] });
    },
  });
};

/**
 * Bulk mark attendance
 */
export const useBulkMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; created_count: number }, Error, BulkAttendanceCreateInput>({
    mutationFn: (data) => studentAttendanceApi.bulkMark(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] });
    },
  });
};

/**
 * Get attendance summary for a student
 */
export const useStudentAttendanceSummary = (studentId: number | null) => {
  return useQuery<AttendanceSummary>({
    queryKey: ['student-attendance-summary', studentId],
    queryFn: () => studentAttendanceApi.summary(studentId!),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ============================================================================
// STAFF ATTENDANCE HOOKS
// ============================================================================

/**
 * Fetch staff attendance records with filters
 */
export const useStaffAttendance = (filters?: StaffAttendanceFilters) => {
  return useQuery<PaginatedResponse<StaffAttendanceListItem>>({
    queryKey: ['staff-attendance', filters],
    queryFn: () => staffAttendanceApi.list(filters),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Fetch a single staff attendance record
 */
export const useStaffAttendanceDetail = (id: number | null) => {
  return useQuery<StaffAttendance>({
    queryKey: ['staff-attendance-detail', id],
    queryFn: () => staffAttendanceApi.get(id!),
    enabled: !!id,
  });
};

/**
 * Mark staff attendance
 */
export const useMarkStaffAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation<StaffAttendance, Error, StaffAttendanceCreateInput>({
    mutationFn: (data) => staffAttendanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-attendance'] });
    },
  });
};

/**
 * Update staff attendance
 */
export const useUpdateStaffAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation<StaffAttendance, Error, { id: number; data: StaffAttendanceUpdateInput }>({
    mutationFn: ({ id, data }) => staffAttendanceApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['staff-attendance-detail', variables.id] });
    },
  });
};

/**
 * Delete staff attendance
 */
export const useDeleteStaffAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => staffAttendanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-attendance'] });
    },
  });
};

/**
 * Bulk mark staff attendance — single API call instead of N individual calls
 */
export const useBulkMarkStaffAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; created_count: number }, Error, BulkStaffAttendanceInput>({
    mutationFn: (data) => staffAttendanceApi.bulkMark(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-attendance'] });
    },
  });
};

// ============================================================================
// SUBJECT ATTENDANCE HOOKS
// ============================================================================

/**
 * Fetch subject attendance records with filters
 */
export const useSubjectAttendance = (filters?: SubjectAttendanceFilters) => {
  return useQuery<PaginatedResponse<SubjectAttendanceListItem>>({
    queryKey: ['subject-attendance', filters],
    queryFn: () => subjectAttendanceApi.list(filters),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Fetch a single subject attendance record
 */
export const useSubjectAttendanceDetail = (id: number | null) => {
  return useQuery<SubjectAttendance>({
    queryKey: ['subject-attendance-detail', id],
    queryFn: () => subjectAttendanceApi.get(id!),
    enabled: !!id,
  });
};

/**
 * Create subject attendance
 */
export const useCreateSubjectAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation<SubjectAttendance, Error, SubjectAttendanceCreateInput>({
    mutationFn: (data) => subjectAttendanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-attendance'] });
    },
  });
};

/**
 * Update subject attendance
 */
export const useUpdateSubjectAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation<SubjectAttendance, Error, { id: number; data: SubjectAttendanceUpdateInput }>({
    mutationFn: ({ id, data }) => subjectAttendanceApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subject-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['subject-attendance-detail', variables.id] });
    },
  });
};

/**
 * Delete subject attendance
 */
export const useDeleteSubjectAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => subjectAttendanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-attendance'] });
    },
  });
};

// ============================================================================
// ATTENDANCE NOTIFICATION HOOKS
// ============================================================================

/**
 * Fetch attendance notifications with filters
 */
export const useAttendanceNotifications = (filters?: AttendanceNotificationFilters) => {
  return useQuery<PaginatedResponse<AttendanceNotificationListItem>>({
    queryKey: ['attendance-notifications', filters],
    queryFn: () => attendanceNotificationApi.list(filters),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Fetch a single attendance notification
 */
export const useAttendanceNotificationDetail = (id: number | null) => {
  return useQuery<AttendanceNotification>({
    queryKey: ['attendance-notification-detail', id],
    queryFn: () => attendanceNotificationApi.get(id!),
    enabled: !!id,
  });
};

/**
 * Create attendance notification
 */
export const useCreateAttendanceNotification = () => {
  const queryClient = useQueryClient();

  return useMutation<AttendanceNotification, Error, AttendanceNotificationCreateInput>({
    mutationFn: (data) => attendanceNotificationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-notifications'] });
    },
  });
};

/**
 * Update attendance notification
 */
export const useUpdateAttendanceNotification = () => {
  const queryClient = useQueryClient();

  return useMutation<AttendanceNotification, Error, { id: number; data: AttendanceNotificationUpdateInput }>({
    mutationFn: ({ id, data }) => attendanceNotificationApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-notification-detail', variables.id] });
    },
  });
};

/**
 * Delete attendance notification
 */
export const useDeleteAttendanceNotification = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => attendanceNotificationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-notifications'] });
    },
  });
};

/**
 * Send attendance notification
 */
export const useSendAttendanceNotification = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => attendanceNotificationApi.send(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['attendance-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-notification-detail', id] });
    },
  });
};
