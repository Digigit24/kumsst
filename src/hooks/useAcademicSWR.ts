/**
 * SWR-based Hooks for Academic Module Dropdowns
 * Cached, auto-revalidating hooks optimized for dropdown performance
 */

import { useMemo } from 'react';
import {
    classApi,
    classroomApi,
    classTeacherApi,
    classTimeApi,
    facultyApi,
    labScheduleApi,
    optionalSubjectApi,
    programApi,
    sectionApi,
    subjectApi,
    subjectAssignmentApi,
    syllabusApi,
    timetableApi,
} from '../services/academic.service';
import { teachersApi } from '../services/teachers.service';
import type {
    ClassFilters,
    ClassListItem,
    ClassroomFilters,
    ClassroomListItem,
    ClassTeacher,
    ClassTeacherFilters,
    ClassTime,
    ClassTimeFilters,
    FacultyFilters,
    FacultyListItem,
    LabSchedule,
    LabScheduleFilters,
    OptionalSubject,
    OptionalSubjectFilters,
    ProgramFilters,
    ProgramListItem,
    Section,
    SectionFilters,
    SubjectAssignmentFilters,
    SubjectAssignmentListItem,
    SubjectFilters,
    SubjectListItem,
    SyllabusFilters,
    SyllabusListItem,
    TimetableFilters,
    TimetableListItem,
} from '../types/academic.types';
import {
    dropdownSwrConfig,
    generateCacheKey,
    invalidateCache,
    staticDataSwrConfig,
    swrKeys,
    useSWRPaginated,
    UseSWRPaginatedResult,
} from './useSWR';

// ============================================================================
// FACULTY HOOKS
// ============================================================================

/**
 * Fetch faculties with SWR caching
 * Data is cached and shared across all components using this hook
 *
 * @example
 * ```tsx
 * const { results: faculties, isLoading, refresh } = useFacultiesSWR({ is_active: true });
 *
 * // After creating a new faculty:
 * await facultyApi.create(data);
 * await refresh(); // Refreshes the cache
 * ```
 */
export const useFacultiesSWR = (
  filters?: FacultyFilters | null
): UseSWRPaginatedResult<FacultyListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(swrKeys.faculties, filters),
    () => facultyApi.list(filters ?? undefined),
    staticDataSwrConfig
  );
};

/**
 * Invalidate faculty cache - call after create/update/delete
 */
export const invalidateFaculties = () => invalidateCache(swrKeys.faculties);

// ============================================================================
// PROGRAM HOOKS
// ============================================================================

/**
 * Fetch programs with SWR caching
 *
 * @example
 * ```tsx
 * const { results: programs, isLoading } = useProgramsSWR({ faculty: 1 });
 * ```
 */
export const useProgramsSWR = (
  filters?: ProgramFilters | null
): UseSWRPaginatedResult<ProgramListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(swrKeys.programs, filters),
    () => programApi.list(filters ?? undefined),
    staticDataSwrConfig
  );
};

/**
 * Invalidate programs cache
 */
export const invalidatePrograms = () => invalidateCache(swrKeys.programs);

// ============================================================================
// CLASS HOOKS
// ============================================================================

/**
 * Fetch classes with SWR caching
 * Ideal for class selection dropdowns
 *
 * @example
 * ```tsx
 * const { results: classes, isLoading, refresh } = useClassesSWR({
 *   program: programId,
 *   is_active: true,
 *   page_size: DROPDOWN_PAGE_SIZE,
 * });
 *
 * // In your dropdown component
 * <Select disabled={isLoading}>
 *   {classes.map(cls => (
 *     <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
 *   ))}
 * </Select>
 * ```
 */
export const useClassesSWR = (
  filters?: ClassFilters | null
): UseSWRPaginatedResult<ClassListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(swrKeys.classes, filters),
    () => classApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

/**
 * Invalidate classes cache
 */
export const invalidateClasses = () => invalidateCache(swrKeys.classes);

// ============================================================================
// SECTION HOOKS
// ============================================================================

/**
 * Fetch sections with SWR caching
 *
 * @example
 * ```tsx
 * const { results: sections, isLoading } = useSectionsSWR({ class_id: classId });
 * ```
 */
export const useSectionsSWR = (
  filters?: SectionFilters | null
): UseSWRPaginatedResult<Section> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(swrKeys.sections, filters),
    () => sectionApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

/**
 * Invalidate sections cache
 */
export const invalidateSections = () => invalidateCache(swrKeys.sections);

/**
 * Fetch ALL active sections upfront with a single API call.
 * Uses static data config (longer cache) since sections rarely change mid-session.
 * All components using this hook share the same cached data.
 */
export const useAllSectionsSWR = (): UseSWRPaginatedResult<Section> => {
  return useSWRPaginated(
    generateCacheKey(swrKeys.sections, { is_active: true, page_size: 200 }),
    () => sectionApi.list({ is_active: true, page_size: 200 }),
    staticDataSwrConfig
  );
};

/**
 * Client-side filtered sections by class — instant, no network latency.
 * Prefetches all sections once via useAllSectionsSWR, then filters
 * locally when classId changes. Drop-in replacement for
 * useSectionsSWR({ class_obj: classId }).
 */
export const useSectionsFilteredByClass = (
  classId?: number | null
): UseSWRPaginatedResult<Section> => {
  const allResult = useAllSectionsSWR();

  const filteredResults = useMemo(() => {
    if (!classId) return [];
    return allResult.results.filter(s => s.class_obj === classId);
  }, [allResult.results, classId]);

  return {
    ...allResult,
    results: filteredResults,
    count: filteredResults.length,
    hasMore: false,
  };
};

// ============================================================================
// SUBJECT HOOKS
// ============================================================================

/**
 * Fetch subjects with SWR caching
 * Perfect for subject selection in forms and filters
 *
 * @example
 * ```tsx
 * const { results: subjects, isLoading, error, refresh } = useSubjectsSWR({
 *   class_id: classId,
 *   is_active: true,
 * });
 *
 * // Handle inline creation
 * const handleCreateSubject = async (data) => {
 *   await subjectApi.create(data);
 *   await refresh(); // Instantly update the dropdown
 * };
 * ```
 */
export const useSubjectsSWR = (
  filters?: SubjectFilters | null
): UseSWRPaginatedResult<SubjectListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(swrKeys.subjects, filters),
    () => subjectApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

/**
 * Invalidate subjects cache
 */
export const invalidateSubjects = () => invalidateCache(swrKeys.subjects);

// ============================================================================
// OPTIONAL SUBJECT HOOKS
// ============================================================================

/**
 * Fetch optional subjects with SWR caching
 */
export const useOptionalSubjectsSWR = (
  filters?: OptionalSubjectFilters | null
): UseSWRPaginatedResult<OptionalSubject> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(swrKeys.optionalSubjects, filters),
    () => optionalSubjectApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

/**
 * Invalidate optional subjects cache
 */
export const invalidateOptionalSubjects = () => invalidateCache(swrKeys.optionalSubjects);

// ============================================================================
// ASSIGNMENT HOOKS
// ============================================================================

/**
 * Fetch assignments with SWR caching
 */
export const useAssignmentsSWR = (
  filters?: any | null
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(swrKeys.assignments, filters),
    () => teachersApi.assignments.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

/**
 * Invalidate assignments cache
 */
export const invalidateAssignments = () => invalidateCache(swrKeys.assignments);

// ============================================================================
// SUBJECT ASSIGNMENT HOOKS
// ============================================================================

/**
 * Fetch subject assignments with SWR caching
 */
export const useSubjectAssignmentsSWR = (
  filters?: SubjectAssignmentFilters | null
): UseSWRPaginatedResult<SubjectAssignmentListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(swrKeys.subjectAssignments, filters),
    () => subjectAssignmentApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

/**
 * Invalidate subject assignments cache
 */
export const invalidateSubjectAssignments = () => invalidateCache(swrKeys.subjectAssignments);

// ============================================================================
// CLASSROOM HOOKS
// ============================================================================

/**
 * Fetch classrooms with SWR caching
 */
export const useClassroomsSWR = (
  filters?: ClassroomFilters | null
): UseSWRPaginatedResult<ClassroomListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(swrKeys.classrooms, filters),
    () => classroomApi.list(filters ?? undefined),
    staticDataSwrConfig
  );
};

/**
 * Invalidate classrooms cache
 */
export const invalidateClassrooms = () => invalidateCache(swrKeys.classrooms);

// ============================================================================
// CLASS TIME HOOKS
// ============================================================================

/**
 * Fetch class times with SWR caching
 */
export const useClassTimesSWR = (
  filters?: ClassTimeFilters | null
): UseSWRPaginatedResult<ClassTime> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(swrKeys.classTimes, filters),
    () => classTimeApi.list(filters ?? undefined),
    staticDataSwrConfig
  );
};

/**
 * Invalidate class times cache
 */
export const invalidateClassTimes = () => invalidateCache(swrKeys.classTimes);

// ============================================================================
// TIMETABLE HOOKS
// ============================================================================

/**
 * Fetch timetables with SWR caching
 */
export const useTimetablesSWR = (
  filters?: TimetableFilters | null
): UseSWRPaginatedResult<TimetableListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(swrKeys.timetables, filters),
    () => timetableApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

/**
 * Invalidate timetables cache
 */
export const invalidateTimetables = () => invalidateCache(swrKeys.timetables);

// ============================================================================
// LAB SCHEDULE HOOKS
// ============================================================================

/**
 * Fetch lab schedules with SWR caching
 */
export const useLabSchedulesSWR = (
  filters?: LabScheduleFilters | null
): UseSWRPaginatedResult<LabSchedule> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(swrKeys.labSchedules, filters),
    () => labScheduleApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

/**
 * Invalidate lab schedules cache
 */
export const invalidateLabSchedules = () => invalidateCache(swrKeys.labSchedules);

// ============================================================================
// CLASS TEACHER HOOKS
// ============================================================================

/**
 * Fetch class teachers with SWR caching
 */
export const useClassTeachersSWR = (
  filters?: ClassTeacherFilters | null
): UseSWRPaginatedResult<ClassTeacher> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(swrKeys.classTeachers, filters),
    () => classTeacherApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

/**
 * Invalidate class teachers cache
 */
export const invalidateClassTeachers = () => invalidateCache(swrKeys.classTeachers);

// ============================================================================
// SYLLABUS HOOKS
// ============================================================================

/**
 * Fetch syllabus list with SWR caching
 */
export const useSyllabusListSWR = (
  filters?: SyllabusFilters | null
): UseSWRPaginatedResult<SyllabusListItem> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(swrKeys.syllabus, filters),
    () => syllabusApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

/**
 * Invalidate syllabus cache
 */
export const invalidateSyllabus = () => invalidateCache(swrKeys.syllabus);

// ============================================================================
// CONVENIENCE: INVALIDATE ALL ACADEMIC DATA
// ============================================================================

/**
 * Invalidate all academic module caches
 * Use sparingly - only when multiple entities may have changed
 */
export const invalidateAllAcademic = async () => {
  await Promise.all([
    invalidateFaculties(),
    invalidatePrograms(),
    invalidateClasses(),
    invalidateSections(),
    invalidateSubjects(),
    invalidateOptionalSubjects(),
    invalidateSubjectAssignments(),
    invalidateClassrooms(),
    invalidateClassTimes(),
    invalidateTimetables(),
    invalidateLabSchedules(),
    invalidateClassTeachers(),
  ]);
};
