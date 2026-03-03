/**
 * SWR-based Hooks for Examination Module
 * Cached, auto-revalidating hooks optimized for dropdown performance
 */

import {
  admitCardsApi,
  examAttendanceApi,
  examResultsApi,
  examsApi,
  examSchedulesApi,
  examTypeApi,
  marksGradesApi,
  marksRegistersApi,
  markSheetsApi,
  progressCardsApi,
  studentMarksApi,
  tabulationSheetsApi,
} from '../services/examination.service';
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

const examSwrKeys = {
  examTypes: 'exam-types',
  exams: 'exams',
  examSchedules: 'exam-schedules',
  examAttendance: 'exam-attendance',
  admitCards: 'admit-cards',
  studentMarks: 'student-marks',
  marksGrades: 'marks-grades',
  marksRegisters: 'marks-registers',
  markSheets: 'mark-sheets',
  progressCards: 'progress-cards',
  tabulationSheets: 'tabulation-sheets',
  examResults: 'exam-results',
} as const;

// ============================================================================
// EXAM TYPE HOOKS
// ============================================================================

export const useExamTypesSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(examSwrKeys.examTypes, filters),
    () => examTypeApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateExamTypes = () => invalidateCache(examSwrKeys.examTypes);

// ============================================================================
// EXAMS HOOKS
// ============================================================================

export const useExamsSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(examSwrKeys.exams, filters),
    () => examsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateExams = () => invalidateCache(examSwrKeys.exams);

// ============================================================================
// EXAM SCHEDULES HOOKS
// ============================================================================

export const useExamSchedulesSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(examSwrKeys.examSchedules, filters),
    () => examSchedulesApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateExamSchedules = () => invalidateCache(examSwrKeys.examSchedules);

// ============================================================================
// EXAM ATTENDANCE HOOKS
// ============================================================================

export const useExamAttendanceSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(examSwrKeys.examAttendance, filters),
    () => examAttendanceApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateExamAttendance = () => invalidateCache(examSwrKeys.examAttendance);

// ============================================================================
// ADMIT CARDS HOOKS
// ============================================================================

export const useAdmitCardsSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(examSwrKeys.admitCards, filters),
    () => admitCardsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateAdmitCards = () => invalidateCache(examSwrKeys.admitCards);

// ============================================================================
// STUDENT MARKS HOOKS
// ============================================================================

export const useStudentMarksSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(examSwrKeys.studentMarks, filters),
    () => studentMarksApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateStudentMarks = () => invalidateCache(examSwrKeys.studentMarks);

// ============================================================================
// MARKS GRADES HOOKS
// ============================================================================

export const useMarksGradesSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(examSwrKeys.marksGrades, filters),
    () => marksGradesApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateMarksGrades = () => invalidateCache(examSwrKeys.marksGrades);

// ============================================================================
// MARKS REGISTERS HOOKS
// ============================================================================

export const useMarksRegistersSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(examSwrKeys.marksRegisters, filters),
    () => marksRegistersApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateMarksRegisters = () => invalidateCache(examSwrKeys.marksRegisters);

// ============================================================================
// MARK SHEETS HOOKS
// ============================================================================

export const useMarkSheetsSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(examSwrKeys.markSheets, filters),
    () => markSheetsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateMarkSheets = () => invalidateCache(examSwrKeys.markSheets);

// ============================================================================
// PROGRESS CARDS HOOKS
// ============================================================================

export const useProgressCardsSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(examSwrKeys.progressCards, filters),
    () => progressCardsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateProgressCards = () => invalidateCache(examSwrKeys.progressCards);

// ============================================================================
// TABULATION SHEETS HOOKS
// ============================================================================

export const useTabulationSheetsSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(examSwrKeys.tabulationSheets, filters),
    () => tabulationSheetsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateTabulationSheets = () => invalidateCache(examSwrKeys.tabulationSheets);

// ============================================================================
// EXAM RESULTS HOOKS
// ============================================================================

export const useExamResultsSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(examSwrKeys.examResults, filters),
    () => examResultsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateExamResults = () => invalidateCache(examSwrKeys.examResults);

// ============================================================================
// CONVENIENCE: INVALIDATE ALL EXAMINATION DATA
// ============================================================================

export const invalidateAllExamination = async () => {
  await Promise.all([
    invalidateExamTypes(),
    invalidateExams(),
    invalidateExamSchedules(),
    invalidateExamAttendance(),
    invalidateAdmitCards(),
    invalidateStudentMarks(),
    invalidateMarksGrades(),
    invalidateMarksRegisters(),
    invalidateMarkSheets(),
    invalidateProgressCards(),
    invalidateTabulationSheets(),
    invalidateExamResults(),
  ]);
};
