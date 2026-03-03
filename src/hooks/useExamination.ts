/**
 * Custom React Query Hooks for Examination Module
 * Manages state and API calls for all Examination entities
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    admitCardsApi,
    examAttendanceApi,
    examResultsApi,
    examsApi,
    examSchedulesApi,
    examTypeApi,
    marksGradesApi,
    markSheetsApi,
    marksRegistersApi,
    progressCardsApi,
    studentMarksApi,
    tabulationSheetsApi,
} from '../services/examination.service';

// ============================================================================
// EXAM TYPE HOOKS
// ============================================================================

export const useExamTypes = (filters?: any) => {
  return useQuery({
    queryKey: ['exam-types', filters],
    queryFn: () => examTypeApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useExamTypeDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['exam-type-detail', id],
    queryFn: () => examTypeApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateExamType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => examTypeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-types'] });
    },
  });
};

export const useUpdateExamType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => examTypeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-types'] });
    },
  });
};

export const useDeleteExamType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examTypeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-types'] });
    },
  });
};

// ============================================================================
// EXAMS HOOKS
// ============================================================================

export const useExams = (filters?: any) => {
  return useQuery({
    queryKey: ['exams', filters],
    queryFn: () => examsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useExamDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['exam-detail', id],
    queryFn: () => examsApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => examsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => examsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
};

// ============================================================================
// EXAM SCHEDULES HOOKS
// ============================================================================

export const useExamSchedules = (filters?: any) => {
  return useQuery({
    queryKey: ['exam-schedules', filters],
    queryFn: () => examSchedulesApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useExamScheduleDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['exam-schedule-detail', id],
    queryFn: () => examSchedulesApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateExamSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => examSchedulesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-schedules'] });
    },
  });
};

export const useUpdateExamSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => examSchedulesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-schedules'] });
    },
  });
};

export const useDeleteExamSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => examSchedulesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-schedules'] });
    },
  });
};

// ============================================================================
// EXAM ATTENDANCE HOOKS
// ============================================================================

export const useExamAttendance = (filters?: any) => {
  return useQuery({
    queryKey: ['exam-attendance', filters],
    queryFn: () => examAttendanceApi.list(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateExamAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => examAttendanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-attendance'] });
    },
  });
};

// ============================================================================
// ADMIT CARDS HOOKS
// ============================================================================

export const useAdmitCards = (filters?: any) => {
  return useQuery({
    queryKey: ['admit-cards', filters],
    queryFn: () => admitCardsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAdmitCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => admitCardsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admit-cards'] });
    },
  });
};

// ============================================================================
// STUDENT MARKS HOOKS
// ============================================================================

export const useStudentMarks = (filters?: any) => {
  return useQuery({
    queryKey: ['student-marks', filters],
    queryFn: () => studentMarksApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateStudentMarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => studentMarksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-marks'] });
    },
  });
};

export const useUpdateStudentMarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => studentMarksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-marks'] });
    },
  });
};

export const useDeleteStudentMarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studentMarksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-marks'] });
    },
  });
};

// ============================================================================
// MARKS GRADES HOOKS
// ============================================================================

export const useMarksGrades = (filters?: any) => {
  return useQuery({
    queryKey: ['marks-grades', filters],
    queryFn: () => marksGradesApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateMarksGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => marksGradesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks-grades'] });
    },
  });
};

// ============================================================================
// MARKS REGISTERS HOOKS
// ============================================================================

export const useMarksRegisters = (filters?: any) => {
  return useQuery({
    queryKey: ['marks-registers', filters],
    queryFn: () => marksRegistersApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateMarksRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => marksRegistersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks-registers'] });
    },
  });
};

export const useUpdateMarksRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => marksRegistersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks-registers'] });
    },
  });
};

export const useDeleteMarksRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => marksRegistersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks-registers'] });
    },
  });
};

// ============================================================================
// MARK SHEETS HOOKS
// ============================================================================

export const useMarkSheets = (filters?: any) => {
  return useQuery({
    queryKey: ['mark-sheets', filters],
    queryFn: () => markSheetsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// PROGRESS CARDS HOOKS
// ============================================================================

export const useProgressCards = (filters?: any) => {
  return useQuery({
    queryKey: ['progress-cards', filters],
    queryFn: () => progressCardsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyProgressCards = (filters?: any) => {
  return useQuery({
    queryKey: ['my-progress-cards', filters],
    queryFn: () => progressCardsApi.myProgressCards(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProgressCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => progressCardsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-cards'] });
    },
  });
};

export const useUpdateProgressCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => progressCardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-cards'] });
    },
  });
};

export const useDeleteProgressCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => progressCardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-cards'] });
    },
  });
};

// ============================================================================
// TABULATION SHEETS HOOKS
// ============================================================================

export const useTabulationSheets = (filters?: any) => {
  return useQuery({
    queryKey: ['tabulation-sheets', filters],
    queryFn: () => tabulationSheetsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateTabulationSheet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => tabulationSheetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tabulation-sheets'] });
    },
  });
};

// ============================================================================
// EXAM RESULTS HOOKS
// ============================================================================

export const useExamResults = (filters?: any) => {
  return useQuery({
    queryKey: ['exam-results', filters],
    queryFn: () => examResultsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateExamResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => examResultsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-results'] });
    },
  });
};
