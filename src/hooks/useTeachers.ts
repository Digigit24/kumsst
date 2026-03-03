/**
 * Custom React Hooks for Teachers Module
 */

import { useEffect, useState } from 'react';
import { teachersApi } from '../services/teachers.service';
import { TeacherScheduleResponse } from '../types/academic.types';
import type { PaginatedResponse } from '../types/core.types';
import type {
    Teacher,
    TeacherCreateInput,
    TeacherFilters,
    TeacherListItem,
    TeacherUpdateInput,
} from '../types/teachers.types';

interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseMutationResult<TData, TInput> {
  mutate: (input: TInput) => Promise<TData | null>;
  isLoading: boolean;
  error: string | null;
  data: TData | null;
}

export const useTeacherSchedule = (teacherId?: string, options: { enabled?: boolean } = { enabled: true }): UseQueryResult<TeacherScheduleResponse> => {
  const [data, setData] = useState<TeacherScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(!!options.enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (options.enabled === false) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await teachersApi.getSchedule(teacherId);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch schedule');
      console.error('Fetch schedule error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    } else {
        setIsLoading(false);
        setData(null);
    }
  }, [teacherId, options.enabled]);

  return { data, isLoading, error, refetch: fetchData };
};

// ============================================================================
// ASSIGNMENT HOOKS
// ============================================================================

export const useAssignments = (filters?: import('../types/academic.types').AssignmentFilters): UseQueryResult<import('../types/core.types').PaginatedResponse<import('../types/academic.types').AssignmentListItem>> => {
  const [data, setData] = useState<import('../types/core.types').PaginatedResponse<import('../types/academic.types').AssignmentListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await teachersApi.getAssignments(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch assignments');
      console.error('Fetch assignments error:', err);
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
// HOMEWORK HOOKS
// ============================================================================

export const useHomeworkList = (filters?: import('../types/academic.types').HomeworkFilters): UseQueryResult<import('../types/core.types').PaginatedResponse<import('../types/academic.types').HomeworkListItem>> => {
  const [data, setData] = useState<import('../types/core.types').PaginatedResponse<import('../types/academic.types').HomeworkListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await teachersApi.getHomeworkList(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch homework');
      console.error('Fetch homework error:', err);
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
// HOMEWORK SUBMISSION HOOKS
// ============================================================================

export const useHomeworkSubmissions = (filters?: import('../types/academic.types').HomeworkSubmissionFilters): UseQueryResult<import('../types/core.types').PaginatedResponse<import('../types/academic.types').HomeworkSubmission>> => {
  const [data, setData] = useState<import('../types/core.types').PaginatedResponse<import('../types/academic.types').HomeworkSubmission> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await teachersApi.getHomeworkSubmissions(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch homework submissions');
      console.error('Fetch homework submissions error:', err);
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
// TEACHER CRUD HOOKS
// ============================================================================

export const useTeachers = (filters?: TeacherFilters): UseQueryResult<PaginatedResponse<TeacherListItem>> => {
  const [data, setData] = useState<PaginatedResponse<TeacherListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await teachersApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch teachers');
      console.error('Fetch teachers error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useTeacher = (id: number | null): UseQueryResult<Teacher> => {
  const [data, setData] = useState<Teacher | null>(null);
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
      const result = await teachersApi.get(id);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch teacher');
      console.error('Fetch teacher error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useCreateTeacher = (): UseMutationResult<Teacher, TeacherCreateInput> => {
  const [data, setData] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: TeacherCreateInput): Promise<Teacher | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await teachersApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create teacher';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useUpdateTeacher = (): UseMutationResult<Teacher, { id: number; data: TeacherUpdateInput }> => {
  const [data, setData] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: { id: number; data: TeacherUpdateInput }): Promise<Teacher | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await teachersApi.update(input.id, input.data);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update teacher';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteTeacher = (): UseMutationResult<void, number> => {
  const [data, setData] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await teachersApi.delete(id);
      return undefined;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete teacher';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};
