/**
 * React hook for fetching student medical records
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentMedicalRecordApi } from '../services/students.service';
import type {
    StudentMedicalRecord,
    StudentMedicalRecordFilters,
    StudentMedicalRecordCreateInput,
    StudentMedicalRecordUpdateInput,
} from '../types/students.types';
import type { PaginatedResponse } from '../types/core.types';

export const useMedicalRecords = (filters?: StudentMedicalRecordFilters) => {
    return useQuery<PaginatedResponse<StudentMedicalRecord>>({
        queryKey: ['medical-records', filters],
        queryFn: () => studentMedicalRecordApi.list(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useMedicalRecord = (id: number | null) => {
    return useQuery<StudentMedicalRecord>({
        queryKey: ['medical-record', id],
        queryFn: () => studentMedicalRecordApi.get(id!),
        enabled: !!id,
    });
};

export const useCreateMedicalRecord = () => {
    const queryClient = useQueryClient();

    return useMutation<StudentMedicalRecord, Error, StudentMedicalRecordCreateInput>({
        mutationFn: (data) => studentMedicalRecordApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medical-records'] });
        },
    });
};

export const useUpdateMedicalRecord = () => {
    const queryClient = useQueryClient();

    return useMutation<StudentMedicalRecord, Error, { id: number; data: StudentMedicalRecordUpdateInput }>({
        mutationFn: ({ id, data }) => studentMedicalRecordApi.patch(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['medical-records'] });
            queryClient.invalidateQueries({ queryKey: ['medical-record', variables.id] });
        },
    });
};

export const useDeleteMedicalRecord = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: (id) => studentMedicalRecordApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medical-records'] });
        },
    });
};
