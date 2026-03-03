import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { materialIssuesApi } from '../services/store.service';

export const materialIssueKeys = {
  all: ["materialIssues"] as const,
  lists: () => [...materialIssueKeys.all, "list"] as const,
  list: (filters?: any) => [...materialIssueKeys.lists(), filters] as const,
  details: () => [...materialIssueKeys.all, "detail"] as const,
  detail: (id: number) => [...materialIssueKeys.details(), id] as const,
};

export const useMaterialIssues = (filters?: any) => {
  return useQuery({
    queryKey: materialIssueKeys.list(filters),
    queryFn: () => materialIssuesApi.list(filters),
  });
};

export const useMaterialIssue = (id: number) => {
  return useQuery({
    queryKey: materialIssueKeys.detail(id),
    queryFn: () => materialIssuesApi.get(id),
    enabled: !!id,
  });
};

export const useCreateMaterialIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: materialIssuesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialIssueKeys.lists() });
    },
  });
};

export const useUpdateMaterialIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      materialIssuesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: materialIssueKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: materialIssueKeys.detail(variables.id),
      });
    },
  });
};

export const usePatchMaterialIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      materialIssuesApi.patch(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: materialIssueKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: materialIssueKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteMaterialIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: materialIssuesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialIssueKeys.lists() });
    },
  });
};

export const useDispatchMaterialIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => materialIssuesApi.dispatch(id, data),
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: materialIssueKeys.lists() });
      await queryClient.cancelQueries({ queryKey: materialIssueKeys.detail(id) });

      // Snapshot the previous value
      const previousList = queryClient.getQueryData(materialIssueKeys.lists());
      const previousDetail = queryClient.getQueryData(materialIssueKeys.detail(id));

      // Optimistically update to the new value
      queryClient.setQueriesData({ queryKey: materialIssueKeys.lists() }, (old: any) => {
        if (!old || !old.results) return old;
        return {
          ...old,
          results: old.results.map((item: any) => 
            item.id === id ? { ...item, status: 'dispatched' } : item
          ),
        };
      });

      // Return a context object with the snapshotted value
      return { previousList, previousDetail };
    },
    onError: (_err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousList) {
        queryClient.setQueryData(materialIssueKeys.lists(), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(materialIssueKeys.detail(newTodo.id), context.previousDetail);
      }
      // toast.error('Failed to dispatch. Reverting changes.'); // Toast is already handled in component
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({ queryKey: materialIssueKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: materialIssueKeys.detail(variables.id),
      });
    },
  });
};

export const useConfirmReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => materialIssuesApi.confirmReceipt(id, data),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: materialIssueKeys.lists() });
      await queryClient.cancelQueries({ queryKey: materialIssueKeys.detail(id) });

      const previousList = queryClient.getQueryData(materialIssueKeys.lists());
      const previousDetail = queryClient.getQueryData(materialIssueKeys.detail(id));

      queryClient.setQueriesData({ queryKey: materialIssueKeys.lists() }, (old: any) => {
        if (!old || !old.results) return old;
        return {
          ...old,
          results: old.results.map((item: any) => 
            item.id === id ? { ...item, status: 'received' } : item
          ),
        };
      });

      return { previousList, previousDetail };
    },
    onError: (_err, newTodo, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(materialIssueKeys.lists(), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(materialIssueKeys.detail(newTodo.id), context.previousDetail);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: materialIssueKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: materialIssueKeys.detail(variables.id),
      });
    },
  });
};

export const useGeneratePdf = () => {
  return useMutation({
    mutationFn: materialIssuesApi.generatePdf,
  });
};
