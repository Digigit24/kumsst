/**
 * SWR-based Drill-Down Dashboard Hooks
 * Uses SWR for caching and revalidation, ensuring single API calls
 */

import { useSWRAPI, generateCacheKey } from './useSWR';
import { drillDownApi } from '../services/drilldown.service';
import type {
  CollegeOverviewFilters,
  CollegeOverviewResponse,
  ProgramDrillDownFilters,
  ProgramDrillDownResponse,
  ClassDrillDownFilters,
  ClassDrillDownResponse,
  SectionDrillDownFilters,
  SectionDrillDownResponse,
  SubjectDrillDownFilters,
  SubjectDrillDownResponse,
  StudentDrillDownFilters,
  StudentDrillDownResponse,
} from '../types/drilldown.types';

// ============================================================================
// COLLEGE OVERVIEW HOOK
// ============================================================================

export const useCollegeOverview = (filters?: CollegeOverviewFilters) => {
  const key = generateCacheKey('college-overview', filters);

  return useSWRAPI<CollegeOverviewResponse>(
    key,
    () => drillDownApi.getCollegeOverview(filters),
    {
      revalidateOnFocus: false, // Don't fetch on window focus
      dedupingInterval: 5000,   // Prevent duplicate requests within 5 seconds
      keepPreviousData: true,   // Keep showing data while loading new filters
    }
  );
};

// ============================================================================
// PROGRAM DRILL-DOWN HOOK
// ============================================================================

export const useProgramDrillDown = (
  programId: number | null,
  filters?: ProgramDrillDownFilters
) => {
  const key = programId
    ? generateCacheKey(`program-drilldown-${programId}`, filters)
    : null;

  return useSWRAPI<ProgramDrillDownResponse>(
    key,
    () => drillDownApi.getProgramDrillDown(programId!, filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );
};

// ============================================================================
// CLASS DRILL-DOWN HOOK
// ============================================================================

export const useClassDrillDown = (
  classId: number | null,
  filters?: ClassDrillDownFilters
) => {
  const key = classId
    ? generateCacheKey(`class-drilldown-${classId}`, filters)
    : null;

  return useSWRAPI<ClassDrillDownResponse>(
    key,
    () => drillDownApi.getClassDrillDown(classId!, filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );
};

// ============================================================================
// SECTION DRILL-DOWN HOOK
// ============================================================================

export const useSectionDrillDown = (
  sectionId: number | null,
  filters?: SectionDrillDownFilters
) => {
  const key = sectionId
    ? generateCacheKey(`section-drilldown-${sectionId}`, filters)
    : null;

  return useSWRAPI<SectionDrillDownResponse>(
    key,
    () => drillDownApi.getSectionDrillDown(sectionId!, filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );
};

// ============================================================================
// SUBJECT DRILL-DOWN HOOK
// ============================================================================

export const useSubjectDrillDown = (
  subjectId: number | null,
  filters?: SubjectDrillDownFilters
) => {
  const key = subjectId
    ? generateCacheKey(`subject-drilldown-${subjectId}`, filters)
    : null;

  return useSWRAPI<SubjectDrillDownResponse>(
    key,
    () => drillDownApi.getSubjectDrillDown(subjectId!, filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );
};

// ============================================================================
// STUDENT DRILL-DOWN HOOK
// ============================================================================

export const useStudentDrillDown = (
  studentId: number | null,
  filters?: StudentDrillDownFilters
) => {
  const key = studentId
    ? generateCacheKey(`student-drilldown-${studentId}`, filters)
    : null;

  return useSWRAPI<StudentDrillDownResponse>(
    key,
    () => drillDownApi.getStudentDrillDown(studentId!, filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true,
    }
  );
};
