/**
 * SWR-based Hooks for Assignments Module
 * Cached, auto-revalidating hooks optimized for dropdown performance
 */

import {
  assignmentsApi,
  assignmentSubmissionsApi,
  studentAssignmentsApi,
} from '../services/assignments.service';
import type {
  Assignment,
  AssignmentListParams,
  AssignmentSubmission,
  AssignmentSubmissionListParams,
} from '../types/assignments.types';
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

const assignmentSwrKeys = {
  assignments: 'assignments',
  studentAssignments: 'student-assignments',
  assignmentSubmissions: 'assignment-submissions',
} as const;

// ============================================================================
// ASSIGNMENTS HOOKS
// ============================================================================

export const useAssignmentsListSWR = (
  filters?: AssignmentListParams
): UseSWRPaginatedResult<Assignment> => {
  return useSWRPaginated(
    generateCacheKey(assignmentSwrKeys.assignments, filters),
    () => assignmentsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateAssignmentsList = () => invalidateCache(assignmentSwrKeys.assignments);

// ============================================================================
// STUDENT ASSIGNMENTS HOOKS
// ============================================================================

export const useStudentAssignmentsListSWR = (
  filters?: AssignmentListParams
): UseSWRPaginatedResult<Assignment> => {
  return useSWRPaginated(
    generateCacheKey(assignmentSwrKeys.studentAssignments, filters),
    () => studentAssignmentsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateStudentAssignmentsList = () => invalidateCache(assignmentSwrKeys.studentAssignments);

// ============================================================================
// ASSIGNMENT SUBMISSIONS HOOKS
// ============================================================================

export const useAssignmentSubmissionsSWR = (
  filters?: AssignmentSubmissionListParams
): UseSWRPaginatedResult<AssignmentSubmission> => {
  return useSWRPaginated(
    generateCacheKey(assignmentSwrKeys.assignmentSubmissions, filters),
    () => assignmentSubmissionsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateAssignmentSubmissions = () => invalidateCache(assignmentSwrKeys.assignmentSubmissions);

// ============================================================================
// CONVENIENCE: INVALIDATE ALL ASSIGNMENTS DATA
// ============================================================================

export const invalidateAllAssignmentsModule = async () => {
  await Promise.all([
    invalidateAssignmentsList(),
    invalidateStudentAssignmentsList(),
    invalidateAssignmentSubmissions(),
  ]);
};
