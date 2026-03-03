import { student360Api } from '@/services/student-360.service';
import type { Student360Filters } from '@/types/student-360.types';
import { useQuery } from '@tanstack/react-query';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useStudent360Profile = (studentId: number | null, filters?: Student360Filters) => {
  return useQuery({
    queryKey: ['student-360', 'profile', studentId, filters],
    queryFn: () => {
      if (!studentId) throw new Error('Student ID is required');
      return student360Api.getProfile(studentId, filters);
    },
    enabled: !!studentId,
    staleTime: STALE_TIME,
  });
};

export const useStudent360Summary = (studentId: number | null, filters?: Student360Filters) => {
  return useQuery({
    queryKey: ['student-360', 'summary', studentId, filters],
    queryFn: () => {
      if (!studentId) throw new Error('Student ID is required');
      return student360Api.getSummary(studentId, filters);
    },
    enabled: !!studentId,
    staleTime: STALE_TIME,
  });
};
