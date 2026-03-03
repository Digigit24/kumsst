/**
 * SWR-based Hooks for Core Module Dropdowns
 * Static data like colleges and academic years with longer cache times
 */

import {
  useSWRPaginated,
  useSWRAPI,
  generateCacheKey,
  swrKeys,
  staticDataSwrConfig,
  dropdownSwrConfig,
  invalidateCache,
  UseSWRPaginatedResult,
  UseSWRResult,
} from './useSWR';
import {
  collegeApi,
  academicYearApi,
  academicSessionApi,
  holidayApi,
  weekendApi,
} from '../services/core.service';
import type {
  College,
  CollegeListItem,
  CollegeFilters,
  AcademicYear,
  AcademicYearFilters,
  AcademicSession,
  AcademicSessionFilters,
  Holiday,
  HolidayFilters,
  Weekend,
  WeekendFilters,
  PaginatedResponse,
} from '../types/core.types';

// ============================================================================
// COLLEGE HOOKS
// ============================================================================

/**
 * Fetch colleges with SWR caching
 * Uses static data config (30 min cache) since colleges rarely change
 *
 * @example
 * ```tsx
 * const { results: colleges, isLoading } = useCollegesSWR({ is_active: true });
 * ```
 */
export const useCollegesSWR = (
  filters?: CollegeFilters
): UseSWRPaginatedResult<CollegeListItem> => {
  return useSWRPaginated(
    generateCacheKey(swrKeys.colleges, filters),
    () => collegeApi.list(filters),
    staticDataSwrConfig
  );
};

/**
 * Fetch a single college by ID
 */
export const useCollegeSWR = (
  id: number | null
): UseSWRResult<College> => {
  return useSWRAPI(
    id ? `${swrKeys.colleges}/${id}` : null,
    () => collegeApi.get(id!),
    staticDataSwrConfig
  );
};

/**
 * Invalidate colleges cache
 */
export const invalidateColleges = () => invalidateCache(swrKeys.colleges);

// ============================================================================
// ACADEMIC YEAR HOOKS
// ============================================================================

/**
 * Fetch academic years with SWR caching
 * Uses static data config since academic years rarely change
 *
 * @example
 * ```tsx
 * const { results: academicYears, isLoading, refresh } = useAcademicYearsSWR({
 *   college: collegeId,
 *   is_active: true,
 * });
 * ```
 */
export const useAcademicYearsSWR = (
  filters?: AcademicYearFilters
): UseSWRPaginatedResult<AcademicYear> => {
  return useSWRPaginated(
    generateCacheKey(swrKeys.academicYears, filters),
    () => academicYearApi.list(filters),
    staticDataSwrConfig
  );
};

/**
 * Fetch the current academic year
 *
 * @example
 * ```tsx
 * const { data: currentYear, isLoading } = useCurrentAcademicYearSWR();
 * ```
 */
export const useCurrentAcademicYearSWR = (): UseSWRResult<AcademicYear> => {
  return useSWRAPI(
    `${swrKeys.academicYears}/current`,
    () => academicYearApi.getCurrent(),
    {
      ...staticDataSwrConfig,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );
};

/**
 * Fetch a single academic year by ID
 */
export const useAcademicYearSWR = (
  id: number | null
): UseSWRResult<AcademicYear> => {
  return useSWRAPI(
    id ? `${swrKeys.academicYears}/${id}` : null,
    () => academicYearApi.get(id!),
    staticDataSwrConfig
  );
};

/**
 * Invalidate academic years cache
 */
export const invalidateAcademicYears = () => invalidateCache(swrKeys.academicYears);

// ============================================================================
// ACADEMIC SESSION HOOKS
// ============================================================================

/**
 * Fetch academic sessions with SWR caching
 *
 * @example
 * ```tsx
 * const { results: sessions, isLoading } = useAcademicSessionsSWR({
 *   academic_year: yearId,
 *   is_current: true,
 * });
 * ```
 */
export const useAcademicSessionsSWR = (
  filters?: AcademicSessionFilters
): UseSWRPaginatedResult<AcademicSession> => {
  return useSWRPaginated(
    generateCacheKey(swrKeys.academicSessions, filters),
    () => academicSessionApi.list(filters),
    dropdownSwrConfig
  );
};

/**
 * Invalidate academic sessions cache
 */
export const invalidateAcademicSessions = () => invalidateCache(swrKeys.academicSessions);

// ============================================================================
// HOLIDAY HOOKS
// ============================================================================

/**
 * Fetch holidays with SWR caching
 */
export const useHolidaysSWR = (
  filters?: HolidayFilters
): UseSWRPaginatedResult<Holiday> => {
  return useSWRPaginated(
    generateCacheKey(swrKeys.holidays, filters),
    () => holidayApi.list(filters),
    dropdownSwrConfig
  );
};

/**
 * Invalidate holidays cache
 */
export const invalidateHolidays = () => invalidateCache(swrKeys.holidays);

// ============================================================================
// WEEKEND HOOKS
// ============================================================================

/**
 * Fetch weekends with SWR caching
 */
export const useWeekendsSWR = (
  filters?: WeekendFilters
): UseSWRPaginatedResult<Weekend> => {
  return useSWRPaginated(
    generateCacheKey(swrKeys.weekends, filters),
    () => weekendApi.list(filters),
    staticDataSwrConfig // Weekends rarely change
  );
};

/**
 * Invalidate weekends cache
 */
export const invalidateWeekends = () => invalidateCache(swrKeys.weekends);

// ============================================================================
// CONVENIENCE: INVALIDATE ALL CORE DATA
// ============================================================================

/**
 * Invalidate all core module caches
 */
export const invalidateAllCore = async () => {
  await Promise.all([
    invalidateColleges(),
    invalidateAcademicYears(),
    invalidateAcademicSessions(),
    invalidateHolidays(),
    invalidateWeekends(),
  ]);
};
