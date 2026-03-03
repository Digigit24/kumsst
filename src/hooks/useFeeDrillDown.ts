import { feeDrillDownApi } from '@/services/fee-drilldown.service';
import type {
    FeeDrillDownFilters,
} from '@/types/fee-drilldown.types';
import { useQuery } from '@tanstack/react-query';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useFeeCollegeOverview = (filters?: FeeDrillDownFilters) => {
  return useQuery({
    queryKey: ['fee-drilldown', 'college', filters],
    queryFn: () => feeDrillDownApi.getCollegeOverview(filters),
    staleTime: STALE_TIME,
  });
};

export const useFeeAcademicYearDrillDown = (yearId: string | null, filters?: FeeDrillDownFilters) => {
  return useQuery({
    queryKey: ['fee-drilldown', 'academic-year', yearId, filters],
    queryFn: () => {
      if (!yearId) throw new Error('Academic Year ID is required');
      return feeDrillDownApi.getAcademicYearDrillDown(yearId, filters);
    },
    enabled: !!yearId,
    staleTime: STALE_TIME,
  });
};

export const useFeeProgramDrillDown = (programId: number | null, filters?: FeeDrillDownFilters) => {
  return useQuery({
    queryKey: ['fee-drilldown', 'program', programId, filters],
    queryFn: () => {
      if (!programId) throw new Error('Program ID is required');
      return feeDrillDownApi.getProgramDrillDown(programId, filters);
    },
    enabled: !!programId,
    staleTime: STALE_TIME,
  });
};

export const useFeeClassDrillDown = (classId: number | null, filters?: FeeDrillDownFilters) => {
  return useQuery({
    queryKey: ['fee-drilldown', 'class', classId, filters],
    queryFn: () => {
      if (!classId) throw new Error('Class ID is required');
      return feeDrillDownApi.getClassDrillDown(classId, filters);
    },
    enabled: !!classId,
    staleTime: STALE_TIME,
  });
};

export const useFeeTypeDrillDown = (feeTypeId: number | null, filters?: FeeDrillDownFilters) => {
  return useQuery({
    queryKey: ['fee-drilldown', 'fee-type', feeTypeId, filters],
    queryFn: () => {
      if (!feeTypeId) throw new Error('Fee Type ID is required');
      return feeDrillDownApi.getFeeTypeDrillDown(feeTypeId, filters);
    },
    enabled: !!feeTypeId,
    staleTime: STALE_TIME,
  });
};

export const useFeeStudentDrillDown = (studentId: number | null, filters?: FeeDrillDownFilters) => {
  return useQuery({
    queryKey: ['fee-drilldown', 'student', studentId, filters],
    queryFn: () => {
      if (!studentId) throw new Error('Student ID is required');
      return feeDrillDownApi.getStudentDrillDown(studentId, filters);
    },
    enabled: !!studentId,
    staleTime: STALE_TIME,
  });
};

export const useTopDefaulters = (filters?: FeeDrillDownFilters) => {
  return useQuery({
    queryKey: ['fee-drilldown', 'top-defaulters', filters],
    queryFn: () => feeDrillDownApi.getTopDefaulters(filters),
    staleTime: STALE_TIME,
  });
};
