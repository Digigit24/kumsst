/**
 * Custom React Hooks for Accounts Module
 * Manages state and API calls for all Accounts entities
 */

import { useEffect, useMemo, useState } from 'react';
import {
    departmentApi,
    roleApi,
    userApi,
    userProfileApi,
    userRoleApi,
} from '../services/accounts.service';
import type {
    DepartmentFilters,
    DepartmentListItem,
    RoleFilters,
    RoleListItem,
    UserFilters,
    UserListItem,
    UserProfile,
    UserProfileFilters,
    UserRole,
    UserRoleFilters,
} from '../types/accounts.types';
import { PaginatedResponse } from '../types/core.types';
import {
    dropdownSwrConfig,
    generateCacheKey,
    invalidateCache,
    swrKeys,
    useSWRPaginated,
    UseSWRPaginatedResult,
} from './useSWR';

// ============================================================================
// BASE HOOK TYPE
// ============================================================================

interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// USER HOOKS
// ============================================================================

export const useUsers = (filters?: UserFilters): UseQueryResult<PaginatedResponse<UserListItem>> => {
  const [data, setData] = useState<PaginatedResponse<UserListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable serialized key — only changes when filter VALUES actually change
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await userApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch users');
      console.error('Fetch users error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Fetch users with SWR caching
 */
export const useUsersSWR = (
  filters?: UserFilters
): UseSWRPaginatedResult<UserListItem> => {
  return useSWRPaginated(
    generateCacheKey(swrKeys.users, filters),
    () => userApi.list(filters),
    dropdownSwrConfig
  );
};

/**
 * Invalidate users cache
 */
export const invalidateUsers = () => invalidateCache(swrKeys.users);

// ============================================================================
// ROLE HOOKS
// ============================================================================

export const useRoles = (filters?: RoleFilters): UseQueryResult<PaginatedResponse<RoleListItem>> => {
  const [data, setData] = useState<PaginatedResponse<RoleListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await roleApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch roles');
      console.error('Fetch roles error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Fetch roles with SWR caching
 */
export const useRolesSWR = (
  filters?: RoleFilters
): UseSWRPaginatedResult<RoleListItem> => {
  return useSWRPaginated(
    generateCacheKey(swrKeys.roles, filters),
    () => roleApi.list(filters),
    dropdownSwrConfig
  );
};

/**
 * Invalidate roles cache
 */
export const invalidateRoles = () => invalidateCache(swrKeys.roles);

// ============================================================================
// USER ROLE HOOKS
// ============================================================================

export const useUserRoles = (filters?: UserRoleFilters): UseQueryResult<PaginatedResponse<UserRole>> => {
  const [data, setData] = useState<PaginatedResponse<UserRole> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await userRoleApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch user roles');
      console.error('Fetch user roles error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Fetch user roles with SWR caching
 */
export const useUserRolesSWR = (
  filters?: UserRoleFilters
): UseSWRPaginatedResult<UserRole> => {
  return useSWRPaginated(
    generateCacheKey(swrKeys.userRoles, filters),
    () => userRoleApi.list(filters),
    dropdownSwrConfig
  );
};

/**
 * Invalidate user roles cache
 */
export const invalidateUserRoles = () => invalidateCache(swrKeys.userRoles);

// ============================================================================
// DEPARTMENT HOOKS
// ============================================================================

export const useDepartments = (filters?: DepartmentFilters): UseQueryResult<PaginatedResponse<DepartmentListItem>> => {
  const [data, setData] = useState<PaginatedResponse<DepartmentListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await departmentApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch departments');
      console.error('Fetch departments error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Fetch departments with SWR caching
 */
export const useDepartmentsSWR = (
  filters?: DepartmentFilters
): UseSWRPaginatedResult<DepartmentListItem> => {
  return useSWRPaginated(
    generateCacheKey(swrKeys.departments, filters),
    () => departmentApi.list(filters),
    dropdownSwrConfig
  );
};

/**
 * Invalidate departments cache
 */
export const invalidateDepartments = () => invalidateCache(swrKeys.departments);

// ============================================================================
// USER PROFILE HOOKS
// ============================================================================

export const useUserProfiles = (filters?: UserProfileFilters): UseQueryResult<PaginatedResponse<UserProfile>> => {
  const [data, setData] = useState<PaginatedResponse<UserProfile> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await userProfileApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch user profiles');
      console.error('Fetch user profiles error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Fetch user profiles with SWR caching
 */
export const useUserProfilesSWR = (
  filters?: UserProfileFilters
): UseSWRPaginatedResult<UserProfile> => {
  return useSWRPaginated(
    generateCacheKey(swrKeys.userProfiles, filters),
    () => userProfileApi.list(filters),
    dropdownSwrConfig
  );
};

/**
 * Invalidate user profiles cache
 */
export const invalidateUserProfiles = () => invalidateCache(swrKeys.userProfiles);
