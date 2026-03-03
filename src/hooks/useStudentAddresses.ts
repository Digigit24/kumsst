/**
 * React hook for fetching student addresses
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentAddressApi } from '../services/students.service';
import type {
    StudentAddress,
    StudentAddressListItem,
    StudentAddressFilters,
    StudentAddressCreateInput,
    StudentAddressUpdateInput,
} from '../types/students.types';
import type { PaginatedResponse } from '../types/core.types';

export const useStudentAddresses = (filters?: StudentAddressFilters) => {
    return useQuery<PaginatedResponse<StudentAddressListItem>>({
        queryKey: ['student-addresses', filters],
        queryFn: () => studentAddressApi.list(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useStudentAddress = (id: number | null) => {
    return useQuery<StudentAddress>({
        queryKey: ['student-address', id],
        queryFn: () => studentAddressApi.get(id!),
        enabled: !!id,
    });
};

export const useCreateStudentAddress = () => {
    const queryClient = useQueryClient();

    return useMutation<StudentAddress, Error, StudentAddressCreateInput>({
        mutationFn: (data) => studentAddressApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-addresses'] });
        },
    });
};

export const useUpdateStudentAddress = () => {
    const queryClient = useQueryClient();

    return useMutation<StudentAddress, Error, { id: number; data: StudentAddressUpdateInput }>({
        mutationFn: ({ id, data }) => studentAddressApi.patch(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['student-addresses'] });
            queryClient.invalidateQueries({ queryKey: ['student-address', variables.id] });
        },
    });
};

export const useDeleteStudentAddress = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: (id) => studentAddressApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-addresses'] });
        },
    });
};
