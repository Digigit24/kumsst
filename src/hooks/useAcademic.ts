/**
 * Custom React Hooks for Academic Module
 * Manages state and API calls for all Academic entities
 */

import { useEffect, useState } from 'react';
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
    Syllabus,
    SyllabusCreateInput,
    SyllabusFilters,
    SyllabusListItem,
    TimetableFilters,
    TimetableListItem,
} from '../types/academic.types';
import { PaginatedResponse } from '../types/core.types';

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
// FACULTY HOOKS
// ============================================================================

export const useFaculties = (filters?: FacultyFilters): UseQueryResult<PaginatedResponse<FacultyListItem>> => {
  const [data, setData] = useState<PaginatedResponse<FacultyListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await facultyApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch faculties');
      console.error('Fetch faculties error:', err);
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
// PROGRAM HOOKS
// ============================================================================

export const usePrograms = (filters?: ProgramFilters): UseQueryResult<PaginatedResponse<ProgramListItem>> => {
  const [data, setData] = useState<PaginatedResponse<ProgramListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await programApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch programs');
      console.error('Fetch programs error:', err);
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
// CLASS HOOKS
// ============================================================================

export const useClasses = (filters?: ClassFilters): UseQueryResult<PaginatedResponse<ClassListItem>> => {
  const [data, setData] = useState<PaginatedResponse<ClassListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await classApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch classes');
      console.error('Fetch classes error:', err);
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
// SECTION HOOKS
// ============================================================================

export const useSections = (filters?: SectionFilters): UseQueryResult<PaginatedResponse<Section>> => {
  const [data, setData] = useState<PaginatedResponse<Section> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await sectionApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch sections');
      console.error('Fetch sections error:', err);
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
// SUBJECT HOOKS
// ============================================================================

export const useSubjects = (filters?: SubjectFilters): UseQueryResult<PaginatedResponse<SubjectListItem>> => {
  const [data, setData] = useState<PaginatedResponse<SubjectListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await subjectApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch subjects');
      console.error('Fetch subjects error:', err);
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
// OPTIONAL SUBJECT HOOKS
// ============================================================================

export const useOptionalSubjects = (filters?: OptionalSubjectFilters): UseQueryResult<PaginatedResponse<OptionalSubject>> => {
  const [data, setData] = useState<PaginatedResponse<OptionalSubject> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await optionalSubjectApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch optional subjects');
      console.error('Fetch optional subjects error:', err);
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
// SUBJECT ASSIGNMENT HOOKS
// ============================================================================

export const useSubjectAssignments = (filters?: SubjectAssignmentFilters): UseQueryResult<PaginatedResponse<SubjectAssignmentListItem>> => {
  const [data, setData] = useState<PaginatedResponse<SubjectAssignmentListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await subjectAssignmentApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch subject assignments');
      console.error('Fetch subject assignments error:', err);
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
// CLASSROOM HOOKS
// ============================================================================

export const useClassrooms = (filters?: ClassroomFilters): UseQueryResult<PaginatedResponse<ClassroomListItem>> => {
  const [data, setData] = useState<PaginatedResponse<ClassroomListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await classroomApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch classrooms');
      console.error('Fetch classrooms error:', err);
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
// CLASS TIME HOOKS
// ============================================================================

export const useClassTimes = (filters?: ClassTimeFilters): UseQueryResult<PaginatedResponse<ClassTime>> => {
  const [data, setData] = useState<PaginatedResponse<ClassTime> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await classTimeApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch class times');
      console.error('Fetch class times error:', err);
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
// TIMETABLE HOOKS
// ============================================================================

export const useTimetable = (filters?: TimetableFilters): UseQueryResult<PaginatedResponse<TimetableListItem>> => {
  const [data, setData] = useState<PaginatedResponse<TimetableListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await timetableApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch timetable');
      console.error('Fetch timetable error:', err);
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
// LAB SCHEDULE HOOKS
// ============================================================================

export const useLabSchedules = (filters?: LabScheduleFilters): UseQueryResult<PaginatedResponse<LabSchedule>> => {
  const [data, setData] = useState<PaginatedResponse<LabSchedule> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await labScheduleApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch lab schedules');
      console.error('Fetch lab schedules error:', err);
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
// CLASS TEACHER HOOKS
// ============================================================================

export const useClassTeachers = (filters?: ClassTeacherFilters): UseQueryResult<PaginatedResponse<ClassTeacher>> => {
  const [data, setData] = useState<PaginatedResponse<ClassTeacher> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await classTeacherApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch class teachers');
      console.error('Fetch class teachers error:', err);
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

export const useDeleteFaculty = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await facultyApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete faculty';
      setError(errorMessage);
      console.error('Delete faculty error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteProgram = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await programApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete program';
      setError(errorMessage);
      console.error('Delete program error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteClass = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await classApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete class';
      setError(errorMessage);
      console.error('Delete class error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteSection = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await sectionApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete section';
      setError(errorMessage);
      console.error('Delete section error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteSubject = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await subjectApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete subject';
      setError(errorMessage);
      console.error('Delete subject error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteOptionalSubject = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await optionalSubjectApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete optional subject';
      setError(errorMessage);
      console.error('Delete optional subject error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteSubjectAssignment = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await subjectAssignmentApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete subject assignment';
      setError(errorMessage);
      console.error('Delete subject assignment error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteClassroom = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await classroomApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete classroom';
      setError(errorMessage);
      console.error('Delete classroom error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteClassTime = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await classTimeApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete class time';
      setError(errorMessage);
      console.error('Delete class time error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteTimetable = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await timetableApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete timetable';
      setError(errorMessage);
      console.error('Delete timetable error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteLabSchedule = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await labScheduleApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete lab schedule';
      setError(errorMessage);
      console.error('Delete lab schedule error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteClassTeacher = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await classTeacherApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete class teacher';
      setError(errorMessage);
      console.error('Delete class teacher error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

// ============================================================================
// SYLLABUS HOOKS
// ============================================================================

export const useSyllabusList = (filters?: SyllabusFilters): UseQueryResult<PaginatedResponse<SyllabusListItem>> => {
  const [data, setData] = useState<PaginatedResponse<SyllabusListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await syllabusApi.list(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch syllabus list');
      console.error('Fetch syllabus list error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useMySyllabi = (filters?: SyllabusFilters): UseQueryResult<PaginatedResponse<SyllabusListItem>> => {
  const [data, setData] = useState<PaginatedResponse<SyllabusListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await syllabusApi.mySyllabi(filters);
      setData(result);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to fetch my syllabi');
      console.error('Fetch my syllabi error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useCreateSyllabus = (): UseMutationResult<Syllabus, SyllabusCreateInput> => {
  const [data, setData] = useState<Syllabus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: SyllabusCreateInput): Promise<Syllabus | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await syllabusApi.create(input);
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload syllabus';
      setError(errorMessage);
      console.error('Upload syllabus error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDeleteSyllabus = (): UseMutationResult<void, number> => {
  const [data] = useState<void>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await syllabusApi.delete(id);
      return;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete syllabus';
      setError(errorMessage);
      console.error('Delete syllabus error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};

export const useDownloadSyllabusFile = (): UseMutationResult<Blob, string> => {
  const [data, setData] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (pdfUrl: string): Promise<Blob> => {
    try {
      setIsLoading(true);
      setError(null);
      const blob = await syllabusApi.downloadFile(pdfUrl);
      setData(blob);
      return blob;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to download file';
      setError(errorMessage);
      console.error('Download syllabus file error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error, data };
};
