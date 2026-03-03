/**
 * SWR-based Hooks for Clerk Module
 * Cached, auto-revalidating hooks for students, fees, print templates/documents, notices
 */
import {
  getStudents,
  getFeeCollections,
  getPrintTemplates,
  getPrintDocuments,
  getNotices,
  getColleges,
} from "../api/clerkService";
import type { Student, StudentFilters } from "../types/students.types";
import type { FeeCollection, FeeCollectionFilters } from "../types/fees.types";
import type {
  PrintTemplate,
  PrintTemplateFilters,
  PrintDocument,
  PrintDocumentFilters,
} from "../types/print.types";
import type { Notice, NoticeFilters } from "../types/communication.types";
import type { College } from "../types/core.types";
import {
  dropdownSwrConfig,
  staticDataSwrConfig,
  generateCacheKey,
  invalidateCache,
  invalidateCaches,
  useSWRPaginated,
  useSWRAPI,
  UseSWRPaginatedResult,
  UseSWRResult,
} from "./useSWR";

// ============================================================================
// CACHE KEY CONSTANTS
// ============================================================================

const clerkSwrKeys = {
  students: "clerk-students",
  fees: "clerk-fees",
  printTemplates: "clerk-print-templates",
  printDocuments: "clerk-print-documents",
  notices: "clerk-notices",
  colleges: "clerk-colleges",
} as const;

// ============================================================================
// STUDENT HOOKS
// ============================================================================

export const useClerkStudentsSWR = (
  filters?: StudentFilters | null
): UseSWRPaginatedResult<Student> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(clerkSwrKeys.students, filters),
    () => getStudents(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateClerkStudents = () => invalidateCache(clerkSwrKeys.students);

// ============================================================================
// FEE COLLECTION HOOKS
// ============================================================================

export const useClerkFeesSWR = (
  filters?: FeeCollectionFilters | null
): UseSWRPaginatedResult<FeeCollection> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(clerkSwrKeys.fees, filters),
    () => getFeeCollections(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateClerkFees = () => invalidateCache(clerkSwrKeys.fees);

// ============================================================================
// PRINT TEMPLATE HOOKS
// ============================================================================

export const useClerkPrintTemplatesSWR = (
  filters?: PrintTemplateFilters | null
): UseSWRPaginatedResult<PrintTemplate> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(clerkSwrKeys.printTemplates, filters),
    () => getPrintTemplates(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateClerkPrintTemplates = () => invalidateCache(clerkSwrKeys.printTemplates);

// ============================================================================
// PRINT DOCUMENT HOOKS
// ============================================================================

export const useClerkPrintDocumentsSWR = (
  filters?: PrintDocumentFilters | null
): UseSWRPaginatedResult<PrintDocument> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(clerkSwrKeys.printDocuments, filters),
    () => getPrintDocuments(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateClerkPrintDocuments = () => invalidateCache(clerkSwrKeys.printDocuments);

// ============================================================================
// NOTICE HOOKS
// ============================================================================

export const useClerkNoticesSWR = (
  filters?: NoticeFilters | null
): UseSWRPaginatedResult<Notice> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(clerkSwrKeys.notices, filters),
    () => getNotices(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateClerkNotices = () => invalidateCache(clerkSwrKeys.notices);

// ============================================================================
// COLLEGES HOOK (for clerk college selector)
// ============================================================================

export const useClerkCollegesSWR = (): UseSWRResult<College[]> => {
  return useSWRAPI(
    clerkSwrKeys.colleges,
    getColleges,
    staticDataSwrConfig
  );
};

export const invalidateClerkColleges = () => invalidateCache(clerkSwrKeys.colleges);

// ============================================================================
// CONVENIENCE: INVALIDATE ALL CLERK DATA
// ============================================================================

export const invalidateAllClerk = async () => {
  await invalidateCaches([
    clerkSwrKeys.students,
    clerkSwrKeys.fees,
    clerkSwrKeys.printTemplates,
    clerkSwrKeys.printDocuments,
    clerkSwrKeys.notices,
  ]);
};
