import { useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { studentHomeworkService } from '../services/student-homework.service';
import type {
    CreateSubmissionPayload,
    HomeworkFilters,
    StudentHomework,
    StudentHomeworkSubmission
} from '../types/student-homework.types';

// Query keys
export const homeworkKeys = {
    all: ['student-homework'] as const,
    lists: () => [...homeworkKeys.all, 'list'] as const,
    list: (params?: HomeworkFilters) => [...homeworkKeys.lists(), params] as const,
    details: () => [...homeworkKeys.all, 'detail'] as const,
    detail: (id: number) => [...homeworkKeys.details(), id] as const,
};

export const homeworkSubmissionKeys = {
    all: ['student-homework-submissions'] as const,
    lists: () => [...homeworkSubmissionKeys.all, 'list'] as const,
    details: () => [...homeworkSubmissionKeys.all, 'detail'] as const,
    detail: (id: number) => [...homeworkSubmissionKeys.details(), id] as const,
};

/**
 * Fetch homework list
 */
export const useStudentHomework = (
    params?: HomeworkFilters
): UseQueryResult<{ results: StudentHomework[]; count: number }, Error> => {
    return useQuery({
        queryKey: homeworkKeys.list(params),
        queryFn: () => studentHomeworkService.getHomeworkList(params),
    });
};

/**
 * Fetch single homework detail
 */
export const useStudentHomeworkDetail = (id: number): UseQueryResult<StudentHomework, Error> => {
    return useQuery({
        queryKey: homeworkKeys.detail(id),
        queryFn: () => studentHomeworkService.getHomeworkDetail(id),
        enabled: !!id,
    });
};

/**
 * Create submission mutation
 */
export const useSubmitHomework = (): UseMutationResult<
    StudentHomeworkSubmission,
    Error,
    CreateSubmissionPayload
> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSubmissionPayload) => studentHomeworkService.submitHomework(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: homeworkKeys.lists() });
            queryClient.invalidateQueries({ queryKey: homeworkSubmissionKeys.lists() });
        },
    });
};

/**
 * Update submission mutation
 */
export const useUpdateHomeworkSubmission = (): UseMutationResult<
    StudentHomeworkSubmission,
    Error,
    { id: number; data: Partial<CreateSubmissionPayload> }
> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => studentHomeworkService.updateSubmission(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: homeworkKeys.lists() });
            queryClient.invalidateQueries({ queryKey: homeworkSubmissionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: homeworkSubmissionKeys.detail(variables.id) });
        },
    });
};
