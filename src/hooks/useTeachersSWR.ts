/**
 * SWR-based Hooks for Teachers Module
 * Provides caching and automatic revalidation for teacher data
 */

import type { SWRConfiguration } from 'swr';
import { teachersApi } from '../services/teachers.service';
import type {
    AssignmentFilters,
    AssignmentListItem,
    HomeworkFilters,
    HomeworkListItem,
    HomeworkSubmission,
    HomeworkSubmissionFilters, TeacherScheduleResponse
} from '../types/academic.types';
import type {
    Teacher,
    TeacherFilters,
    TeacherListItem,
} from '../types/teachers.types';

import {
    dropdownSwrConfig,
    generateCacheKey,
    invalidateCache,
    swrKeys,
    useSWRAPI,
    useSWRPaginated,
    UseSWRPaginatedResult,
    UseSWRResult,
} from './useSWR';

// ============================================================================
// TEACHERS LIST HOOK (with SWR caching)
// ============================================================================

/**
 * Fetch teachers with SWR caching
 * Data stays fresh for 5 minutes, revalidates on focus
 *
 * @example
 * ```tsx
 * const { data, results, isLoading, refresh } = useTeachersSWR({ is_active: true });
 * ```
 */
export const useTeachersSWR = (
  filters?: TeacherFilters | null,
  config?: SWRConfiguration
): UseSWRPaginatedResult<TeacherListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(swrKeys.teachers, filters),
    () => teachersApi.list(filters ?? undefined),
    { ...dropdownSwrConfig, ...config }
  );
};

// ============================================================================
// SINGLE TEACHER HOOK
// ============================================================================

/**
 * Fetch a single teacher by ID with SWR caching
 *
 * @example
 * ```tsx
 * const { data: teacher, isLoading } = useTeacherSWR(teacherId);
 * ```
 */
export const useTeacherSWR = (
  id: number | null
): UseSWRResult<Teacher> => {
  return useSWRAPI(
    id ? `${swrKeys.teachers}/${id}` : null,
    () => teachersApi.get(id!),
    dropdownSwrConfig
  );
};

// ============================================================================
// TEACHER SCHEDULE HOOK
// ============================================================================

export const useTeacherScheduleSWR = (
  teacherId?: string,
  options: { enabled?: boolean } = { enabled: true }
): UseSWRResult<TeacherScheduleResponse> & { refetch: () => Promise<TeacherScheduleResponse | undefined> } => {
  const key = options.enabled !== false && (teacherId || options.enabled)
      ? `${swrKeys.teachers}/${teacherId || 'my'}/schedule`
      : null;

  const result = useSWRAPI(
      key,
      () => teachersApi.getSchedule(teacherId),
      {
          ...dropdownSwrConfig,
          dedupingInterval: 30 * 60 * 1000, // 30 minutes
      }
  );

  return { ...result, refetch: result.refresh };
};


// ============================================================================
// HOMEWORK HOOKS
// ============================================================================

export const useHomeworkListSWR = (
    filters?: HomeworkFilters | null
): UseSWRPaginatedResult<HomeworkListItem> & { refetch: () => Promise<any> } => {
     const result = useSWRPaginated(
        filters ? generateCacheKey('teachers/homework', filters) : null,
        () => teachersApi.getHomeworkList(filters || undefined),
        dropdownSwrConfig
     );
     return { ...result, refetch: result.refresh };
}

export const useHomeworkSubmissionsSWR = (
    filters?: HomeworkSubmissionFilters | null
): UseSWRPaginatedResult<HomeworkSubmission> & { refetch: () => Promise<any> } => {
     const result = useSWRPaginated(
        filters ? generateCacheKey('teachers/homework-submissions', filters) : null,
        () => teachersApi.getHomeworkSubmissions(filters || undefined),
        dropdownSwrConfig
     );
     return { ...result, refetch: result.refresh };
}

// ============================================================================
// ASSIGNMENT HOOKS
// ============================================================================

export const useAssignmentsSWR = (
    filters?: AssignmentFilters | null
): UseSWRPaginatedResult<AssignmentListItem> & { refetch: () => Promise<any> } => {
     const result = useSWRPaginated(
        filters ? generateCacheKey(swrKeys.assignments, filters) : null,
        () => teachersApi.getAssignments(filters || undefined),
        dropdownSwrConfig
     );
     return { ...result, refetch: result.refresh };
}


// ============================================================================
// CACHE INVALIDATION
// ============================================================================

/**
 * Invalidate teachers cache
 * Call this after create/update/delete operations
 *
 * @example
 * ```tsx
 * await teachersApi.create(newTeacher);
 * await invalidateTeachers(); // Refreshes all teacher queries
 * ```
 */
export const invalidateTeachers = () => invalidateCache(swrKeys.teachers);
export const invalidateHomework = () => invalidateCache('teachers/homework');
export const invalidateAssignments = () => invalidateCache(swrKeys.assignments);
