/**
 * SWR-based Hooks for Accounts Module
 * Cached hooks for users, teachers, and other account-related data
 */

import {
  useSWRPaginated,
  generateCacheKey,
  swrKeys,
  dropdownSwrConfig,
  invalidateCache,
  UseSWRPaginatedResult,
} from './useSWR';
import { userApi } from '../services/accounts.service';
import type { UserListItem, UserFilters } from '../types/accounts.types';

// ============================================================================
// TEACHER HOOKS
// ============================================================================

/**
 * Fetch teachers (users with user_type='teacher') with SWR caching
 * Perfect for teacher selection dropdowns
 *
 * @example
 * ```tsx
 * const { results: teachers, isLoading, refresh } = useTeachersSWR({
 *   is_active: true,
 *   page_size: DROPDOWN_PAGE_SIZE,
 * });
 *
 * // In your dropdown component
 * <Select>
 *   {teachers.map(teacher => (
 *     <SelectItem key={teacher.id} value={teacher.id}>
 *       {teacher.full_name || teacher.username}
 *     </SelectItem>
 *   ))}
 * </Select>
 * ```
 */
export const useTeachersSWR = (
  filters?: Omit<UserFilters, 'user_type'>
): UseSWRPaginatedResult<UserListItem> => {
  const teacherFilters: UserFilters = {
    ...filters,
    user_type: 'teacher',
  };

  return useSWRPaginated(
    generateCacheKey(swrKeys.teachers, teacherFilters),
    () => userApi.list(teacherFilters),
    dropdownSwrConfig
  );
};

/**
 * Invalidate teachers cache - call after create/update/delete
 */
export const invalidateTeachers = () => invalidateCache(swrKeys.teachers);

// ============================================================================
// GENERIC USER HOOKS
// ============================================================================

/**
 * Fetch users with SWR caching
 * Use this for generic user listings
 *
 * @example
 * ```tsx
 * const { results: users, isLoading } = useUsersSWR({
 *   user_type: 'student',
 *   is_active: true,
 * });
 * ```
 */
export const useUsersSWR = (
  filters?: UserFilters
): UseSWRPaginatedResult<UserListItem> => {
  return useSWRPaginated(
    generateCacheKey('users', filters),
    () => userApi.list(filters),
    dropdownSwrConfig
  );
};

/**
 * Invalidate users cache
 */
export const invalidateUsers = () => invalidateCache('users');
