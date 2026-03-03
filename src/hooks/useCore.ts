/**
 * Custom React Hooks for Core Module
 * Manages state and API calls for all Core entities
 */

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
    academicSessionApi,
    academicYearApi,
    activityLogApi,
    collegeApi,
    holidayApi,
    notificationSettingApi,
    systemSettingApi,
    weekendApi,
} from "../services/core.service";
import type {
    AcademicSession,
    AcademicSessionCreateInput,
    AcademicSessionFilters,
    AcademicYear,
    AcademicYearCreateInput,
    AcademicYearFilters,
    AcademicYearUpdateInput,
    ActivityLog,
    ActivityLogFilters,
    College,
    CollegeCreateInput,
    CollegeFilters,
    CollegeUpdateInput,
    Holiday,
    HolidayCreateInput,
    HolidayFilters,
    HolidayUpdateInput,
    NotificationSetting,
    NotificationSettingFilters,
    PaginatedResponse,
    SystemSetting,
    SystemSettingFilters,
    Weekend,
    WeekendFilters,
} from "../types/core.types";

export const coreKeys = {
  all: ["core"] as const,
  // Colleges
  colleges: () => [...coreKeys.all, "colleges"] as const,
  collegesList: (filters?: any) =>
    [...coreKeys.colleges(), "list", filters] as const,
  college: (id: number) => [...coreKeys.colleges(), "detail", id] as const,
  // Academic Years
  academicYears: () => [...coreKeys.all, "academicYears"] as const,
  academicYearsList: (filters?: any) =>
    [...coreKeys.academicYears(), "list", filters] as const,
  academicYear: (id: number) =>
    [...coreKeys.academicYears(), "detail", id] as const,
  // Academic Sessions
  academicSessions: () => [...coreKeys.all, "academicSessions"] as const,
  academicSessionsList: (filters?: any) =>
    [...coreKeys.academicSessions(), "list", filters] as const,
  academicSession: (id: number) =>
    [...coreKeys.academicSessions(), "detail", id] as const,
  // Holidays
  holidays: () => [...coreKeys.all, "holidays"] as const,
  holidaysList: (filters?: any) =>
    [...coreKeys.holidays(), "list", filters] as const,
  // Weekends
  weekends: () => [...coreKeys.all, "weekends"] as const,
  weekendsList: (filters?: any) =>
    [...coreKeys.weekends(), "list", filters] as const,
  // System Settings
  systemSettings: () => [...coreKeys.all, "systemSettings"] as const,
  systemSettingsList: (filters?: any) =>
    [...coreKeys.systemSettings(), "list", filters] as const,
};

// ============================================================================
// BASE HOOK TYPE
// ============================================================================

interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseMutationResult<TData, TInput> {
  mutate: (input: TInput) => Promise<TData | null>;
  mutateAsync?: (input: TInput) => Promise<TData | null>;
  isLoading: boolean;
  error: string | null;
  data: TData | null;
}

// ============================================================================
// COLLEGE HOOKS
// ============================================================================

/**
 * Hook to fetch colleges list
 */
export const useColleges = (filters?: CollegeFilters) => {
  return useQuery({
    queryKey: coreKeys.collegesList(filters),
    queryFn: () => collegeApi.list(filters),
    staleTime: 1000 * 60 * 30, // Colleges rarely change, cache for 30 mins
  });
};

/**
 * Hook to fetch a single college
 */
export const useCollege = (id: number | null) => {
  return useQuery({
    queryKey: coreKeys.college(id!),
    queryFn: () => collegeApi.get(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });
};

/**
 * Hook to create a college
 */
export const useCreateCollege = (): UseMutationResult<
  College,
  CollegeCreateInput
> => {
  const [data, setData] = useState<College | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: CollegeCreateInput): Promise<College | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await collegeApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create college";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

/**
 * Hook to update a college
 */
export const useUpdateCollege = (): UseMutationResult<
  College,
  { id: number; data: CollegeUpdateInput }
> => {
  const [data, setData] = useState<College | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: {
    id: number;
    data: CollegeUpdateInput;
  }): Promise<College | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await collegeApi.patch(input.id, input.data);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update college";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

/**
 * Hook to delete a college
 */
export const useDeleteCollege = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await collegeApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete college";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// ACADEMIC YEAR HOOKS
// ============================================================================

/**
 * Hook to fetch academic years list
 */
export const useAcademicYears = (filters?: AcademicYearFilters) => {
  return useQuery({
    queryKey: coreKeys.academicYearsList(filters),
    queryFn: () => academicYearApi.list(filters),
    staleTime: 1000 * 60 * 60, // Academic years very rarely change
  });
};

/**
 * Hook to fetch a single academic year
 */
export const useAcademicYear = (
  id: number | null
): UseQueryResult<AcademicYear> => {
  const [data, setData] = useState<AcademicYear | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await academicYearApi.get(id);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : "Failed to fetch academic year");
      console.error("Fetch academic year error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Hook to fetch current academic year
 */
export const useCurrentAcademicYear = (): UseQueryResult<AcademicYear> => {
  const [data, setData] = useState<AcademicYear | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await academicYearApi.getCurrent();
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : "No current academic year found");
      console.error("Fetch current academic year error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Hook to create an academic year
 */
export const useCreateAcademicYear = (): UseMutationResult<
  AcademicYear,
  AcademicYearCreateInput
> => {
  const [data, setData] = useState<AcademicYear | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    input: AcademicYearCreateInput
  ): Promise<AcademicYear | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await academicYearApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create academic year";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

/**
 * Hook to update an academic year
 */
export const useUpdateAcademicYear = (): UseMutationResult<
  AcademicYear,
  { id: number; data: AcademicYearUpdateInput }
> => {
  const [data, setData] = useState<AcademicYear | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: {
    id: number;
    data: AcademicYearUpdateInput;
  }): Promise<AcademicYear | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await academicYearApi.patch(input.id, input.data);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update academic year";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

/**
 * Hook to delete an academic year
 */
export const useDeleteAcademicYear = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await academicYearApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete academic year";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// ACADEMIC SESSION HOOKS
// ============================================================================

/**
 * Hook to fetch academic sessions list
 */
export const useAcademicSessions = (
  filters?: AcademicSessionFilters
): UseQueryResult<PaginatedResponse<AcademicSession>> => {
  const [data, setData] = useState<PaginatedResponse<AcademicSession> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await academicSessionApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : "Failed to fetch academic sessions");
      console.error("Fetch academic sessions error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Hook to create an academic session
 */
export const useCreateAcademicSession = (): UseMutationResult<
  AcademicSession,
  AcademicSessionCreateInput
> => {
  const [data, setData] = useState<AcademicSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (
    input: AcademicSessionCreateInput
  ): Promise<AcademicSession | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await academicSessionApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create academic session";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// HOLIDAY HOOKS
// ============================================================================

/**
 * Hook to fetch holidays list
 */
export const useHolidays = (
  filters?: HolidayFilters
): UseQueryResult<PaginatedResponse<Holiday>> => {
  const [data, setData] = useState<PaginatedResponse<Holiday> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await holidayApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : "Failed to fetch holidays");
      console.error("Fetch holidays error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Hook to create a holiday
 */
export const useCreateHoliday = (): UseMutationResult<
  Holiday,
  HolidayCreateInput
> => {
  const [data, setData] = useState<Holiday | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: HolidayCreateInput): Promise<Holiday | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await holidayApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create holiday";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, mutateAsync: mutate, isLoading, error, data };
};

/**
 * Hook to update a holiday
 */
export const useUpdateHoliday = (): UseMutationResult<
  Holiday,
  { id: number; data: HolidayUpdateInput }
> => {
  const [data, setData] = useState<Holiday | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: {
    id: number;
    data: HolidayUpdateInput;
  }): Promise<Holiday | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await holidayApi.patch(input.id, input.data);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update holiday";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, mutateAsync: mutate, isLoading, error, data };
};

// ============================================================================
// WEEKEND HOOKS
// ============================================================================

/**
 * Hook to fetch weekends list
 */
export const useWeekends = (
  filters?: WeekendFilters
): UseQueryResult<PaginatedResponse<Weekend>> => {
  const [data, setData] = useState<PaginatedResponse<Weekend> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await weekendApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : "Failed to fetch weekends");
      console.error("Fetch weekends error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

// ============================================================================
// SYSTEM SETTING HOOKS
// ============================================================================

/**
 * Hook to fetch system settings list
 */
export const useSystemSettings = (
  filters?: SystemSettingFilters
): UseQueryResult<PaginatedResponse<SystemSetting>> => {
  const [data, setData] = useState<PaginatedResponse<SystemSetting> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await systemSettingApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : "Failed to fetch system settings");
      console.error("Fetch system settings error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

// ============================================================================
// NOTIFICATION SETTING HOOKS
// ============================================================================

/**
 * Hook to fetch notification settings list
 */
export const useNotificationSettings = (
  filters?: NotificationSettingFilters
): UseQueryResult<PaginatedResponse<NotificationSetting>> => {
  const [data, setData] =
    useState<PaginatedResponse<NotificationSetting> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await notificationSettingApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : "Failed to fetch notification settings");
      console.error("Fetch notification settings error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

/**
 * Hook to create a notification setting
 */
export const useCreateNotificationSetting = (): UseMutationResult<
  NotificationSetting,
  any
> => {
  const [data, setData] = useState<NotificationSetting | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: any): Promise<NotificationSetting | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await notificationSettingApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "Failed to create notification setting";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

/**
 * Hook to update a notification setting
 */
export const useUpdateNotificationSetting = (): UseMutationResult<
  NotificationSetting,
  { id: number; data: any }
> => {
  const [data, setData] = useState<NotificationSetting | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: {
    id: number;
    data: any;
  }): Promise<NotificationSetting | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await notificationSettingApi.patch(input.id, input.data);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage =
        err.message || "Failed to update notification setting";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// ACTIVITY LOG HOOKS
// ============================================================================

/**
 * Hook to fetch activity logs list
 */
export const useActivityLogs = (
  filters?: ActivityLogFilters
): UseQueryResult<PaginatedResponse<ActivityLog>> => {
  const [data, setData] = useState<PaginatedResponse<ActivityLog> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await activityLogApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : "Failed to fetch activity logs");
      console.error("Fetch activity logs error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

// ============================================================================
// DELETE HOOKS
// ============================================================================

/**
 * Hook to delete an academic session
 */
export const useDeleteAcademicSession = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await academicSessionApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete academic session";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, mutate, mutateAsync: mutate };
};

/**
 * Hook to delete a holiday
 */
export const useDeleteHoliday = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await holidayApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete holiday";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, mutate, mutateAsync: mutate };
};

/**
 * Hook to delete a weekend
 */
export const useDeleteWeekend = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await weekendApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete weekend";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, mutate, mutateAsync: mutate };
};
