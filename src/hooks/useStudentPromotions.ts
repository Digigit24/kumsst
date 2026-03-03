/**
 * React hook for fetching student promotions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentPromotionApi } from '../services/students.service';
import type {
    StudentPromotion,
    StudentPromotionListItem,
    StudentPromotionFilters,
    StudentPromotionCreateInput,
    StudentPromotionUpdateInput,
} from '../types/students.types';
import type { PaginatedResponse } from '../types/core.types';

export const useStudentPromotions = (filters?: StudentPromotionFilters) => {
    return useQuery<PaginatedResponse<StudentPromotionListItem>>({
        queryKey: ['student-promotions', filters],
        queryFn: () => studentPromotionApi.list(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useStudentPromotion = (id: number | null) => {
    return useQuery<StudentPromotion>({
        queryKey: ['student-promotion', id],
        queryFn: () => studentPromotionApi.get(id!),
        enabled: !!id,
    });
};

export const useCreateStudentPromotion = () => {
    const queryClient = useQueryClient();

    return useMutation<StudentPromotion, Error, StudentPromotionCreateInput>({
        mutationFn: (data) => studentPromotionApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-promotions'] });
        },
    });
};

export const useUpdateStudentPromotion = () => {
    const queryClient = useQueryClient();

    return useMutation<StudentPromotion, Error, { id: number; data: StudentPromotionUpdateInput }>({
        mutationFn: ({ id, data }) => studentPromotionApi.patch(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['student-promotions'] });
            queryClient.invalidateQueries({ queryKey: ['student-promotion', variables.id] });
        },
    });
};

export const useDeleteStudentPromotion = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: (id) => studentPromotionApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-promotions'] });
        },
    });
};
