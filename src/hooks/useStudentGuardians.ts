/**
 * React hook for fetching student guardians
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentGuardianApi } from '../services/students.service';
import type {
    StudentGuardian,
    StudentGuardianListItem,
    StudentGuardianFilters,
    StudentGuardianCreateInput,
    StudentGuardianUpdateInput,
} from '../types/students.types';
import type { PaginatedResponse } from '../types/core.types';

export const useStudentGuardians = (filters?: StudentGuardianFilters) => {
    return useQuery<PaginatedResponse<StudentGuardianListItem>>({
        queryKey: ['student-guardians', filters],
        queryFn: () => studentGuardianApi.list(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useStudentGuardian = (id: number | null) => {
    return useQuery<StudentGuardian>({
        queryKey: ['student-guardian', id],
        queryFn: () => studentGuardianApi.get(id!),
        enabled: !!id,
    });
};

export const useCreateStudentGuardian = () => {
    const queryClient = useQueryClient();

    return useMutation<StudentGuardian, Error, StudentGuardianCreateInput>({
        mutationFn: (data) => studentGuardianApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-guardians'] });
        },
    });
};

export const useUpdateStudentGuardian = () => {
    const queryClient = useQueryClient();

    return useMutation<StudentGuardian, Error, { id: number; data: StudentGuardianUpdateInput }>({
        mutationFn: ({ id, data }) => studentGuardianApi.patch(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['student-guardians'] });
            queryClient.invalidateQueries({ queryKey: ['student-guardian', variables.id] });
        },
    });
};

export const useDeleteStudentGuardian = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: (id) => studentGuardianApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-guardians'] });
        },
    });
};
