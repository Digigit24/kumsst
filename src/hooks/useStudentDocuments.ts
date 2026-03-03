/**
 * React hook for fetching student documents
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentDocumentApi } from '../services/students.service';
import type {
    StudentDocument,
    StudentDocumentListItem,
    StudentDocumentFilters,
    StudentDocumentCreateInput,
    StudentDocumentUpdateInput,
} from '../types/students.types';
import type { PaginatedResponse } from '../types/core.types';

export const useStudentDocuments = (filters?: StudentDocumentFilters) => {
    return useQuery<PaginatedResponse<StudentDocumentListItem>>({
        queryKey: ['student-documents', filters],
        queryFn: () => studentDocumentApi.list(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useStudentDocument = (id: number | null) => {
    return useQuery<StudentDocument>({
        queryKey: ['student-document', id],
        queryFn: () => studentDocumentApi.get(id!),
        enabled: !!id,
    });
};

export const useCreateStudentDocument = () => {
    const queryClient = useQueryClient();

    return useMutation<StudentDocument, Error, StudentDocumentCreateInput | FormData>({
        mutationFn: (data) => studentDocumentApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-documents'] });
        },
    });
};

export const useUpdateStudentDocument = () => {
    const queryClient = useQueryClient();

    return useMutation<StudentDocument, Error, { id: number; data: StudentDocumentUpdateInput }>({
        mutationFn: ({ id, data }) => studentDocumentApi.patch(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['student-documents'] });
            queryClient.invalidateQueries({ queryKey: ['student-document', variables.id] });
        },
    });
};

export const useDeleteStudentDocument = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: (id) => studentDocumentApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-documents'] });
        },
    });
};
