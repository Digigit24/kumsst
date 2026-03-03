import { attendanceDrillDownApi } from '@/services/attendance-drilldown.service';
import type {
    AttendanceDrillDownFilters,
} from '@/types/attendance-drilldown.types';
import { useQuery } from '@tanstack/react-query';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useAttendanceCollegeOverview = (filters?: AttendanceDrillDownFilters) => {
  return useQuery({
    queryKey: ['attendance-drilldown', 'college', filters],
    queryFn: () => attendanceDrillDownApi.getCollegeOverview(filters),
    staleTime: STALE_TIME,
  });
};

export const useAttendanceProgramDrillDown = (programId: number | null, filters?: AttendanceDrillDownFilters) => {
  return useQuery({
    queryKey: ['attendance-drilldown', 'program', programId, filters],
    queryFn: () => {
      if (!programId) throw new Error('Program ID is required');
      return attendanceDrillDownApi.getProgramDetails(programId, filters);
    },
    enabled: !!programId,
    staleTime: STALE_TIME,
  });
};

export const useAttendanceClassDrillDown = (classId: number | null, filters?: AttendanceDrillDownFilters) => {
  return useQuery({
    queryKey: ['attendance-drilldown', 'class', classId, filters],
    queryFn: () => {
      if (!classId) throw new Error('Class ID is required');
      return attendanceDrillDownApi.getClassDetails(classId, filters);
    },
    enabled: !!classId,
    staleTime: STALE_TIME,
  });
};

export const useAttendanceSectionDrillDown = (sectionId: number | null, filters?: AttendanceDrillDownFilters) => {
  return useQuery({
    queryKey: ['attendance-drilldown', 'section', sectionId, filters],
    queryFn: () => {
      if (!sectionId) throw new Error('Section ID is required');
      return attendanceDrillDownApi.getSectionDetails(sectionId, filters);
    },
    enabled: !!sectionId,
    staleTime: STALE_TIME,
  });
};

export const useAttendanceSubjectDrillDown = (subjectId: number | null, filters?: AttendanceDrillDownFilters) => {
  return useQuery({
    queryKey: ['attendance-drilldown', 'subject', subjectId, filters],
    queryFn: () => {
      if (!subjectId) throw new Error('Subject ID is required');
      return attendanceDrillDownApi.getSubjectDetails(subjectId, filters);
    },
    enabled: !!subjectId,
    staleTime: STALE_TIME,
  });
};

export const useAttendanceStudentDrillDown = (studentId: number | null, filters?: AttendanceDrillDownFilters) => {
  return useQuery({
    queryKey: ['attendance-drilldown', 'student', studentId, filters],
    queryFn: () => {
      if (!studentId) throw new Error('Student ID is required');
      return attendanceDrillDownApi.getStudentDetails(studentId, filters);
    },
    enabled: !!studentId,
    staleTime: STALE_TIME,
  });
};

export const useLowAttendanceAlerts = (filters?: AttendanceDrillDownFilters) => {
  return useQuery({
    queryKey: ['attendance-drilldown', 'low-attendance-alerts', filters],
    queryFn: () => attendanceDrillDownApi.getLowAttendanceAlerts(filters),
    staleTime: STALE_TIME,
  });
};
