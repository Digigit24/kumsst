/**
 * Custom React Hooks for Students Module
 * Manages state and API calls for all Students entities
 */

import { useEffect, useState } from 'react';
import {
    certificateApi,
    guardianApi,
    previousAcademicRecordApi,
    studentAddressApi,
    studentApi,
    studentCategoryApi,
    studentDocumentApi,
    studentGroupApi,
    studentGuardianApi,
    studentIDCardApi,
    studentMedicalRecordApi,
    studentPromotionApi,
} from '../services/students.service';
import type { PaginatedResponse } from '../types/core.types';
import type {
    Certificate,
    CertificateCreateInput,
    CertificateFilters,
    CertificateListItem,
    Guardian,
    GuardianCreateInput,
    GuardianFilters,
    GuardianListItem,
    GuardianUpdateInput,
    PreviousAcademicRecord,
    PreviousAcademicRecordCreateInput,
    PreviousAcademicRecordFilters,
    PreviousAcademicRecordListItem,
    PreviousAcademicRecordUpdateInput,
    Student,
    StudentAddress,
    StudentAddressCreateInput,
    StudentAddressFilters,
    StudentAddressListItem,
    StudentAddressUpdateInput,
    StudentCategory,
    StudentCategoryCreateInput,
    StudentCategoryFilters,
    StudentCategoryListItem,
    StudentCategoryUpdateInput,
    StudentCreateInput,
    StudentDocument,
    StudentDocumentCreateInput,
    StudentDocumentFilters,
    StudentDocumentListItem,
    StudentFilters,
    StudentGroup,
    StudentGroupCreateInput,
    StudentGroupFilters,
    StudentGroupListItem,
    StudentGroupUpdateInput,
    StudentGuardian,
    StudentGuardianCreateInput,
    StudentGuardianFilters,
    StudentGuardianListItem,
    StudentIDCard,
    StudentIDCardCreateInput,
    StudentIDCardFilters,
    StudentIDCardListItem,
    StudentListItem,
    StudentMedicalRecord,
    StudentMedicalRecordCreateInput,
    StudentMedicalRecordFilters,
    StudentMedicalRecordUpdateInput,
    StudentPromotion,
    StudentPromotionCreateInput,
    StudentPromotionFilters,
    StudentPromotionListItem,
    StudentUpdateInput
} from '../types/students.types';

// ============================================================================
// BASE HOOK TYPES
// ============================================================================

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

// ============================================================================
// STUDENT CATEGORY HOOKS
// ============================================================================

export const useStudentCategories = (filters?: StudentCategoryFilters): UseQueryResult<PaginatedResponse<StudentCategoryListItem>> => {
  const [data, setData] = useState<PaginatedResponse<StudentCategoryListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentCategoryApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch student categories');
      console.error('Fetch student categories error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useStudentCategory = (id: number | null): UseQueryResult<StudentCategory> => {
  const [data, setData] = useState<StudentCategory | null>(null);
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
      const result = await studentCategoryApi.get(id);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch student category');
      console.error('Fetch student category error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useCreateStudentCategory = (): UseMutationResult<StudentCategory, StudentCategoryCreateInput> => {
  const [data, setData] = useState<StudentCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: StudentCategoryCreateInput): Promise<StudentCategory | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentCategoryApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create student category';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useUpdateStudentCategory = (): UseMutationResult<StudentCategory, { id: number; data: StudentCategoryUpdateInput }> => {
  const [data, setData] = useState<StudentCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: { id: number; data: StudentCategoryUpdateInput }): Promise<StudentCategory | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentCategoryApi.update(input.id, input.data);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update student category';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteStudentCategory = (): UseMutationResult<void, number> => {
  const [data, setData] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await studentCategoryApi.delete(id);
      return undefined;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete student category';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// STUDENT GROUP HOOKS
// ============================================================================

export const useStudentGroups = (filters?: StudentGroupFilters): UseQueryResult<PaginatedResponse<StudentGroupListItem>> => {
  const [data, setData] = useState<PaginatedResponse<StudentGroupListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentGroupApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch student groups');
      console.error('Fetch student groups error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useStudentGroup = (id: number | null): UseQueryResult<StudentGroup> => {
  const [data, setData] = useState<StudentGroup | null>(null);
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
      const result = await studentGroupApi.get(id);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch student group');
      console.error('Fetch student group error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useCreateStudentGroup = (): UseMutationResult<StudentGroup, StudentGroupCreateInput> => {
  const [data, setData] = useState<StudentGroup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: StudentGroupCreateInput): Promise<StudentGroup | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentGroupApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create student group';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useUpdateStudentGroup = (): UseMutationResult<StudentGroup, { id: number; data: StudentGroupUpdateInput }> => {
  const [data, setData] = useState<StudentGroup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: { id: number; data: StudentGroupUpdateInput }): Promise<StudentGroup | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentGroupApi.update(input.id, input.data);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update student group';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteStudentGroup = (): UseMutationResult<void, number> => {
  const [data, setData] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await studentGroupApi.delete(id);
      return undefined;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete student group';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useAddStudentsToGroup = (): UseMutationResult<StudentGroup, { id: number; studentIds: number[] }> => {
  const [data, setData] = useState<StudentGroup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: { id: number; studentIds: number[] }): Promise<StudentGroup | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentGroupApi.addStudents(input.id, input.studentIds);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add students to group';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useRemoveStudentsFromGroup = (): UseMutationResult<StudentGroup, { id: number; studentIds: number[] }> => {
  const [data, setData] = useState<StudentGroup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: { id: number; studentIds: number[] }): Promise<StudentGroup | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentGroupApi.removeStudents(input.id, input.studentIds);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove students from group';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// STUDENT HOOKS
// ============================================================================

export const useStudents = (filters?: StudentFilters, options?: { enabled?: boolean }): UseQueryResult<PaginatedResponse<StudentListItem>> => {
  const [data, setData] = useState<PaginatedResponse<StudentListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(options?.enabled !== false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (options?.enabled === false) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await studentApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch students');
      console.error('Fetch students error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters), options?.enabled]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useStudent = (id: number | null): UseQueryResult<Student> => {
  const [data, setData] = useState<Student | null>(null);
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
      const result = await studentApi.get(id);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch student');
      console.error('Fetch student error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useCreateStudent = (): UseMutationResult<Student, StudentCreateInput> => {
  const [data, setData] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: StudentCreateInput): Promise<Student | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create student';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useUpdateStudent = (): UseMutationResult<Student, { id: number; data: StudentUpdateInput }> => {
  const [data, setData] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: { id: number; data: StudentUpdateInput }): Promise<Student | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentApi.update(input.id, input.data);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update student';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteStudent = (): UseMutationResult<void, number> => {
  const [data, setData] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await studentApi.delete(id);
      return undefined;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete student';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// GUARDIAN HOOKS
// ============================================================================

export const useGuardians = (filters?: GuardianFilters): UseQueryResult<PaginatedResponse<GuardianListItem>> => {
  const [data, setData] = useState<PaginatedResponse<GuardianListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await guardianApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch guardians');
      console.error('Fetch guardians error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useGuardian = (id: number | null): UseQueryResult<Guardian> => {
  const [data, setData] = useState<Guardian | null>(null);
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
      const result = await guardianApi.get(id);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch guardian');
      console.error('Fetch guardian error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useCreateGuardian = (): UseMutationResult<Guardian, GuardianCreateInput> => {
  const [data, setData] = useState<Guardian | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: GuardianCreateInput): Promise<Guardian | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await guardianApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create guardian';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useUpdateGuardian = (): UseMutationResult<Guardian, { id: number; data: GuardianUpdateInput }> => {
  const [data, setData] = useState<Guardian | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: { id: number; data: GuardianUpdateInput }): Promise<Guardian | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await guardianApi.update(input.id, input.data);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update guardian';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteGuardian = (): UseMutationResult<void, number> => {
  const [data, setData] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await guardianApi.delete(id);
      return undefined;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete guardian';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// STUDENT GUARDIAN HOOKS
// ============================================================================

export const useStudentGuardians = (filters?: StudentGuardianFilters): UseQueryResult<PaginatedResponse<StudentGuardianListItem>> => {
  const [data, setData] = useState<PaginatedResponse<StudentGuardianListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentGuardianApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch student guardians');
      console.error('Fetch student guardians error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useCreateStudentGuardian = (): UseMutationResult<StudentGuardian, StudentGuardianCreateInput> => {
  const [data, setData] = useState<StudentGuardian | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: StudentGuardianCreateInput): Promise<StudentGuardian | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentGuardianApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create student guardian';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteStudentGuardian = (): UseMutationResult<void, number> => {
  const [data, setData] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await studentGuardianApi.delete(id);
      return undefined;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete student guardian';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// STUDENT ADDRESS HOOKS
// ============================================================================

export const useStudentAddresses = (filters?: StudentAddressFilters): UseQueryResult<PaginatedResponse<StudentAddressListItem>> => {
  const [data, setData] = useState<PaginatedResponse<StudentAddressListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentAddressApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch student addresses');
      console.error('Fetch student addresses error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useCreateStudentAddress = (): UseMutationResult<StudentAddress, StudentAddressCreateInput> => {
  const [data, setData] = useState<StudentAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: StudentAddressCreateInput): Promise<StudentAddress | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentAddressApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create student address';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useUpdateStudentAddress = (): UseMutationResult<StudentAddress, { id: number; data: StudentAddressUpdateInput }> => {
  const [data, setData] = useState<StudentAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: { id: number; data: StudentAddressUpdateInput }): Promise<StudentAddress | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentAddressApi.update(input.id, input.data);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update student address';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteStudentAddress = (): UseMutationResult<void, number> => {
  const [data, setData] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await studentAddressApi.delete(id);
      return undefined;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete student address';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// STUDENT DOCUMENT HOOKS
// ============================================================================

export const useStudentDocuments = (filters?: StudentDocumentFilters): UseQueryResult<PaginatedResponse<StudentDocumentListItem>> => {
  const [data, setData] = useState<PaginatedResponse<StudentDocumentListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentDocumentApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch student documents');
      console.error('Fetch student documents error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useCreateStudentDocument = (): UseMutationResult<StudentDocument, StudentDocumentCreateInput> => {
  const [data, setData] = useState<StudentDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: StudentDocumentCreateInput): Promise<StudentDocument | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentDocumentApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create student document';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteStudentDocument = (): UseMutationResult<void, number> => {
  const [data, setData] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await studentDocumentApi.delete(id);
      return undefined;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete student document';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// STUDENT MEDICAL RECORD HOOKS
// ============================================================================

export const useStudentMedicalRecords = (filters?: StudentMedicalRecordFilters): UseQueryResult<PaginatedResponse<StudentMedicalRecord>> => {
  const [data, setData] = useState<PaginatedResponse<StudentMedicalRecord> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentMedicalRecordApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch student medical records');
      console.error('Fetch student medical records error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useCreateStudentMedicalRecord = (): UseMutationResult<StudentMedicalRecord, StudentMedicalRecordCreateInput> => {
  const [data, setData] = useState<StudentMedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: StudentMedicalRecordCreateInput): Promise<StudentMedicalRecord | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentMedicalRecordApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create student medical record';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useUpdateStudentMedicalRecord = (): UseMutationResult<StudentMedicalRecord, { id: number; data: StudentMedicalRecordUpdateInput }> => {
  const [data, setData] = useState<StudentMedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: { id: number; data: StudentMedicalRecordUpdateInput }): Promise<StudentMedicalRecord | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentMedicalRecordApi.update(input.id, input.data);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update student medical record';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// PREVIOUS ACADEMIC RECORD HOOKS
// ============================================================================

export const usePreviousAcademicRecords = (filters?: PreviousAcademicRecordFilters): UseQueryResult<PaginatedResponse<PreviousAcademicRecordListItem>> => {
  const [data, setData] = useState<PaginatedResponse<PreviousAcademicRecordListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await previousAcademicRecordApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch previous academic records');
      console.error('Fetch previous academic records error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useCreatePreviousAcademicRecord = (): UseMutationResult<PreviousAcademicRecord, PreviousAcademicRecordCreateInput> => {
  const [data, setData] = useState<PreviousAcademicRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: PreviousAcademicRecordCreateInput): Promise<PreviousAcademicRecord | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await previousAcademicRecordApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create previous academic record';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useUpdatePreviousAcademicRecord = (): UseMutationResult<PreviousAcademicRecord, { id: number; data: PreviousAcademicRecordUpdateInput }> => {
  const [data, setData] = useState<PreviousAcademicRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: { id: number; data: PreviousAcademicRecordUpdateInput }): Promise<PreviousAcademicRecord | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await previousAcademicRecordApi.update(input.id, input.data);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update previous academic record';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeletePreviousAcademicRecord = (): UseMutationResult<void, number> => {
  const [data, setData] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await previousAcademicRecordApi.delete(id);
      return undefined;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete previous academic record';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// STUDENT PROMOTION HOOKS
// ============================================================================

export const useStudentPromotions = (filters?: StudentPromotionFilters): UseQueryResult<PaginatedResponse<StudentPromotionListItem>> => {
  const [data, setData] = useState<PaginatedResponse<StudentPromotionListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentPromotionApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch student promotions');
      console.error('Fetch student promotions error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useCreateStudentPromotion = (): UseMutationResult<StudentPromotion, StudentPromotionCreateInput> => {
  const [data, setData] = useState<StudentPromotion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: StudentPromotionCreateInput): Promise<StudentPromotion | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentPromotionApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create student promotion';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteStudentPromotion = (): UseMutationResult<void, number> => {
  const [data, setData] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await studentPromotionApi.delete(id);
      return undefined;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete student promotion';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// CERTIFICATE HOOKS
// ============================================================================

export const useCertificates = (filters?: CertificateFilters): UseQueryResult<PaginatedResponse<CertificateListItem>> => {
  const [data, setData] = useState<PaginatedResponse<CertificateListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await certificateApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch certificates');
      console.error('Fetch certificates error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useCertificate = (id: number | null): UseQueryResult<Certificate> => {
  const [data, setData] = useState<Certificate | null>(null);
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
      const result = await certificateApi.get(id);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch certificate');
      console.error('Fetch certificate error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useCreateCertificate = (): UseMutationResult<Certificate, CertificateCreateInput> => {
  const [data, setData] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: CertificateCreateInput): Promise<Certificate | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await certificateApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create certificate';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteCertificate = (): UseMutationResult<void, number> => {
  const [data, setData] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await certificateApi.delete(id);
      return undefined;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete certificate';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// STUDENT ID CARD HOOKS
// ============================================================================

export const useStudentIDCards = (filters?: StudentIDCardFilters): UseQueryResult<PaginatedResponse<StudentIDCardListItem>> => {
  const [data, setData] = useState<PaginatedResponse<StudentIDCardListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentIDCardApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch student ID cards');
      console.error('Fetch student ID cards error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useCreateStudentIDCard = (): UseMutationResult<StudentIDCard, StudentIDCardCreateInput> => {
  const [data, setData] = useState<StudentIDCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: StudentIDCardCreateInput): Promise<StudentIDCard | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentIDCardApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create student ID card';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteStudentIDCard = (): UseMutationResult<void, number> => {
  const [data, setData] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await studentIDCardApi.delete(id);
      return undefined;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete student ID card';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};
