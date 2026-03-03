/**
 * SWR-based Hooks for Students Module
 * Cached, auto-revalidating hooks optimized for dropdown performance
 */

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
import type {
  CertificateFilters,
  CertificateListItem,
  GuardianFilters,
  GuardianListItem,
  PreviousAcademicRecordFilters,
  PreviousAcademicRecordListItem,
  StudentAddressFilters,
  StudentAddressListItem,
  StudentCategoryFilters,
  StudentCategoryListItem,
  StudentDocumentFilters,
  StudentDocumentListItem,
  StudentFilters,
  StudentGroupFilters,
  StudentGroupListItem,
  StudentGuardianFilters,
  StudentGuardianListItem,
  StudentIDCardFilters,
  StudentIDCardListItem,
  StudentListItem,
  StudentMedicalRecord,
  StudentMedicalRecordFilters,
  StudentPromotionFilters,
  StudentPromotionListItem,
} from '../types/students.types';
import {
  dropdownSwrConfig,
  staticDataSwrConfig,
  generateCacheKey,
  invalidateCache,
  useSWRPaginated,
  UseSWRPaginatedResult,
} from './useSWR';

// ============================================================================
// SWR CACHE KEY CONSTANTS
// ============================================================================

const studentSwrKeys = {
  students: 'students',
  studentCategories: 'student-categories',
  studentGroups: 'student-groups',
  guardians: 'guardians',
  studentGuardians: 'student-guardians',
  studentAddresses: 'student-addresses',
  studentDocuments: 'student-documents',
  studentMedicalRecords: 'student-medical-records',
  previousAcademicRecords: 'previous-academic-records',
  studentPromotions: 'student-promotions',
  certificates: 'certificates',
  studentIDCards: 'student-id-cards',
} as const;

// ============================================================================
// STUDENT HOOKS
// ============================================================================

export const useStudentsSWR = (
  filters?: StudentFilters | null
): UseSWRPaginatedResult<StudentListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(studentSwrKeys.students, filters),
    () => studentApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateStudents = () => invalidateCache(studentSwrKeys.students);

// ============================================================================
// STUDENT CATEGORY HOOKS
// ============================================================================

export const useStudentCategoriesSWR = (
  filters?: StudentCategoryFilters | null
): UseSWRPaginatedResult<StudentCategoryListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(studentSwrKeys.studentCategories, filters),
    () => studentCategoryApi.list(filters ?? undefined),
    staticDataSwrConfig
  );
};

export const invalidateStudentCategories = () => invalidateCache(studentSwrKeys.studentCategories);

// ============================================================================
// STUDENT GROUP HOOKS
// ============================================================================

export const useStudentGroupsSWR = (
  filters?: StudentGroupFilters | null
): UseSWRPaginatedResult<StudentGroupListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(studentSwrKeys.studentGroups, filters),
    () => studentGroupApi.list(filters ?? undefined),
    staticDataSwrConfig
  );
};

export const invalidateStudentGroups = () => invalidateCache(studentSwrKeys.studentGroups);

// ============================================================================
// GUARDIAN HOOKS
// ============================================================================

export const useGuardiansSWR = (
  filters?: GuardianFilters | null
): UseSWRPaginatedResult<GuardianListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(studentSwrKeys.guardians, filters),
    () => guardianApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateGuardians = () => invalidateCache(studentSwrKeys.guardians);

// ============================================================================
// STUDENT GUARDIAN HOOKS
// ============================================================================

export const useStudentGuardiansSWR = (
  filters?: StudentGuardianFilters | null
): UseSWRPaginatedResult<StudentGuardianListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(studentSwrKeys.studentGuardians, filters),
    () => studentGuardianApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateStudentGuardians = () => invalidateCache(studentSwrKeys.studentGuardians);

// ============================================================================
// STUDENT ADDRESS HOOKS
// ============================================================================

export const useStudentAddressesSWR = (
  filters?: StudentAddressFilters | null
): UseSWRPaginatedResult<StudentAddressListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(studentSwrKeys.studentAddresses, filters),
    () => studentAddressApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateStudentAddresses = () => invalidateCache(studentSwrKeys.studentAddresses);

// ============================================================================
// STUDENT DOCUMENT HOOKS
// ============================================================================

export const useStudentDocumentsSWR = (
  filters?: StudentDocumentFilters | null
): UseSWRPaginatedResult<StudentDocumentListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(studentSwrKeys.studentDocuments, filters),
    () => studentDocumentApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateStudentDocuments = () => invalidateCache(studentSwrKeys.studentDocuments);

// ============================================================================
// STUDENT MEDICAL RECORD HOOKS
// ============================================================================

export const useStudentMedicalRecordsSWR = (
  filters?: StudentMedicalRecordFilters | null
): UseSWRPaginatedResult<StudentMedicalRecord> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(studentSwrKeys.studentMedicalRecords, filters),
    () => studentMedicalRecordApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateStudentMedicalRecords = () => invalidateCache(studentSwrKeys.studentMedicalRecords);

// ============================================================================
// PREVIOUS ACADEMIC RECORD HOOKS
// ============================================================================

export const usePreviousAcademicRecordsSWR = (
  filters?: PreviousAcademicRecordFilters | null
): UseSWRPaginatedResult<PreviousAcademicRecordListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(studentSwrKeys.previousAcademicRecords, filters),
    () => previousAcademicRecordApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidatePreviousAcademicRecords = () => invalidateCache(studentSwrKeys.previousAcademicRecords);

// ============================================================================
// STUDENT PROMOTION HOOKS
// ============================================================================

export const useStudentPromotionsSWR = (
  filters?: StudentPromotionFilters | null
): UseSWRPaginatedResult<StudentPromotionListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(studentSwrKeys.studentPromotions, filters),
    () => studentPromotionApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateStudentPromotions = () => invalidateCache(studentSwrKeys.studentPromotions);

// ============================================================================
// CERTIFICATE HOOKS
// ============================================================================

export const useCertificatesSWR = (
  filters?: CertificateFilters | null
): UseSWRPaginatedResult<CertificateListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(studentSwrKeys.certificates, filters),
    () => certificateApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateCertificates = () => invalidateCache(studentSwrKeys.certificates);

// ============================================================================
// STUDENT ID CARD HOOKS
// ============================================================================

export const useStudentIDCardsSWR = (
  filters?: StudentIDCardFilters | null
): UseSWRPaginatedResult<StudentIDCardListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(studentSwrKeys.studentIDCards, filters),
    () => studentIDCardApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateStudentIDCards = () => invalidateCache(studentSwrKeys.studentIDCards);

// ============================================================================
// CONVENIENCE: INVALIDATE ALL STUDENTS DATA
// ============================================================================

export const invalidateAllStudents = async () => {
  await Promise.all([
    invalidateStudents(),
    invalidateStudentCategories(),
    invalidateStudentGroups(),
    invalidateGuardians(),
    invalidateStudentGuardians(),
    invalidateStudentAddresses(),
    invalidateStudentDocuments(),
    invalidateStudentMedicalRecords(),
    invalidatePreviousAcademicRecords(),
    invalidateStudentPromotions(),
    invalidateCertificates(),
    invalidateStudentIDCards(),
  ]);
};
