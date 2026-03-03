/**
 * SWR-based Custom Hooks for Data Fetching
 * Provides caching and automatic revalidation for dropdown data
 */

import useSWR, { mutate as globalMutate, KeyedMutator, SWRConfiguration } from 'swr';
import type { PaginatedResponse } from '../types/core.types';

// ============================================================================
// SWR CONFIGURATION DEFAULTS
// ============================================================================

/**
 * Default SWR configuration optimized for dropdown data
 * - Data stays fresh for 10 minutes (dedupingInterval)
 * - NO revalidation on focus - dropdown data doesn't need to refresh constantly
 * - Stale-while-revalidate: Show cached data immediately, revalidate in background
 * - keepPreviousData: Keep showing old data while new data loads
 * - This ensures dropdowns load instantly from cache across page navigations
 */
export const dropdownSwrConfig: SWRConfiguration = {
  revalidateOnFocus: false, // Don't refetch when window/tab gains focus
  revalidateOnReconnect: false, // Don't refetch on reconnect
  revalidateIfStale: true, // Allow background revalidation while showing cached data
  dedupingInterval: 10 * 60 * 1000, // 10 minutes - requests within this window use cached data
  focusThrottleInterval: 10 * 60 * 1000, // 10 minutes - extra safety
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  shouldRetryOnError: true,
  keepPreviousData: true, // Keep showing cached data while revalidating
};

/**
 * Configuration for data that rarely changes (colleges, academic years)
 * Even more aggressive caching - 30 minutes
 * Still uses stale-while-revalidate for instant display from cache
 */
export const staticDataSwrConfig: SWRConfiguration = {
  ...dropdownSwrConfig,
  dedupingInterval: 30 * 60 * 1000, // 30 minutes
  focusThrottleInterval: 30 * 60 * 1000,
  revalidateIfStale: true, // Background revalidation
  keepPreviousData: true, // Keep showing cached data
};

// ============================================================================
// BASE TYPES
// ============================================================================

export interface UseSWRResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  mutate: KeyedMutator<T>;
  refresh: () => Promise<T | undefined>;
}

export interface UseSWRPaginatedResult<T> {
  data: PaginatedResponse<T> | undefined;
  results: T[];
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  mutate: KeyedMutator<PaginatedResponse<T>>;
  refresh: () => Promise<PaginatedResponse<T> | undefined>;
  count: number;
  hasMore: boolean;
}

// ============================================================================
// CACHE KEY GENERATORS
// ============================================================================

/**
 * Generate consistent cache keys for SWR
 * Uses a stable serialization of filters to ensure cache hits
 */
export const generateCacheKey = (
  base: string,
  filters?: Record<string, any>
): string | null => {
  if (filters === null) return null; // null key = don't fetch
  if (!filters || Object.keys(filters).length === 0) {
    return base;
  }
  // Sort keys for consistent serialization
  const sortedFilters = Object.keys(filters)
    .sort()
    .reduce((acc, key) => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

  if (Object.keys(sortedFilters).length === 0) {
    return base;
  }
  return `${base}?${JSON.stringify(sortedFilters)}`;
};

// ============================================================================
// SWR CACHE KEY CONSTANTS
// ============================================================================

export const swrKeys = {
  // Core module
  colleges: 'colleges',
  academicYears: 'academic-years',
  academicSessions: 'academic-sessions',
  holidays: 'holidays',
  weekends: 'weekends',

  // Academic module
  faculties: 'faculties',
  programs: 'programs',
  classes: 'classes',
  sections: 'sections',
  subjects: 'subjects',
  optionalSubjects: 'optional-subjects',
  subjectAssignments: 'subject-assignments',
  classrooms: 'classrooms',
  classTimes: 'class-times',
  timetables: 'timetables',
  labSchedules: 'lab-schedules',
  classTeachers: 'class-teachers',
  syllabus: 'syllabus',

  // Students module
  students: 'students',
  studentCategories: 'student-categories',
  studentGroups: 'student-groups',
  guardians: 'guardians',

  // Teachers module
  teachers: 'teachers',
  departments: 'departments',
  designations: 'designations',
  assignments: 'assignments',
  
  // Accounts module
  users: 'users',
  roles: 'roles',
  userRoles: 'user-roles',
  userProfiles: 'user-profiles',
} as const;

// ============================================================================
// BASE HOOK: useSWRAPI
// ============================================================================

/**
 * Generic hook that wraps useSWR for use with existing service methods
 *
 * @param key - Cache key (use generateCacheKey helper)
 * @param fetcher - Async function that returns data (your service method)
 * @param config - Optional SWR configuration
 *
 * @example
 * ```tsx
 * const { data, isLoading, refresh } = useSWRAPI(
 *   generateCacheKey('classes', filters),
 *   () => classApi.list(filters)
 * );
 * ```
 */
export function useSWRAPI<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  config?: SWRConfiguration<T>
): UseSWRResult<T> {
  const { data, error, isLoading, isValidating, mutate } = useSWR<T, Error>(
    key,
    fetcher,
    {
      ...dropdownSwrConfig,
      ...config,
    }
  );

  const refresh = async () => {
    return mutate();
  };

  return {
    data,
    isLoading,
    isValidating,
    error: error || null,
    mutate,
    refresh,
  };
}

/**
 * Hook for paginated API responses with convenient result extraction
 *
 * @example
 * ```tsx
 * const { results, isLoading, count, refresh } = useSWRPaginated(
 *   generateCacheKey('classes', filters),
 *   () => classApi.list(filters)
 * );
 * // results is already extracted from data.results
 * ```
 */
export function useSWRPaginated<T>(
  key: string | null,
  fetcher: () => Promise<PaginatedResponse<T>>,
  config?: SWRConfiguration<PaginatedResponse<T>>
): UseSWRPaginatedResult<T> {
  const { data, error, isLoading, isValidating, mutate } = useSWR<PaginatedResponse<T>, Error>(
    key,
    fetcher,
    {
      ...dropdownSwrConfig,
      ...config,
    }
  );

  const refresh = async () => {
    return mutate();
  };

  return {
    data,
    results: data?.results ?? [],
    isLoading,
    isValidating,
    error: error || null,
    mutate,
    refresh,
    count: data?.count ?? 0,
    hasMore: !!data?.next,
  };
}

// ============================================================================
// GLOBAL CACHE UTILITIES
// ============================================================================

/**
 * Invalidate and refetch data for a specific cache key
 * Use this after creating/updating/deleting items
 *
 * @example
 * ```tsx
 * // After creating a new class:
 * await classApi.create(newClassData);
 * await invalidateCache('classes'); // Refreshes all class queries
 * ```
 */
export const invalidateCache = async (key: string) => {
  // Mutate all keys that start with this base key
  await globalMutate(
    (cacheKey) => typeof cacheKey === 'string' && cacheKey.startsWith(key),
    undefined,
    { revalidate: true }
  );
};

/**
 * Invalidate multiple cache keys at once
 *
 * @example
 * ```tsx
 * await invalidateCaches(['classes', 'sections']);
 * ```
 */
export const invalidateCaches = async (keys: string[]) => {
  await Promise.all(keys.map(invalidateCache));
};

/**
 * Optimistically update cached data
 * Use this for instant UI updates before API call completes
 *
 * @example
 * ```tsx
 * // Optimistically add a new item to the list
 * await optimisticUpdate(
 *   generateCacheKey('classes', filters),
 *   (current) => ({
 *     ...current,
 *     results: [...current.results, newClass],
 *     count: current.count + 1,
 *   })
 * );
 * ```
 */
export const optimisticUpdate = async <T>(
  key: string,
  updater: (current: T | undefined) => T
) => {
  await globalMutate(key, updater, { revalidate: false });
};
