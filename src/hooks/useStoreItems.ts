import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeItemsApi } from '../services/store.service';

export const storeItemKeys = {
  all: ['storeItems'] as const,
  lists: () => [...storeItemKeys.all, 'list'] as const,
  list: (filters?: any) => [...storeItemKeys.lists(), filters] as const,
  details: () => [...storeItemKeys.all, 'detail'] as const,
  detail: (id: number) => [...storeItemKeys.details(), id] as const,
};

export const useStoreItems = (filters?: any) => {
  return useQuery({
    queryKey: storeItemKeys.list(filters),
    queryFn: () => storeItemsApi.list(filters),
  });
};

export const useStoreItem = (id: number) => {
  return useQuery({
    queryKey: storeItemKeys.detail(id),
    queryFn: () => storeItemsApi.get(id),
    enabled: !!id,
  });
};

export const useCreateStoreItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storeItemsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeItemKeys.lists() });
    },
  });
};

export const useUpdateStoreItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => storeItemsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storeItemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: storeItemKeys.detail(variables.id) });
    },
  });
};

export const useDeleteStoreItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storeItemsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeItemKeys.lists() });
    },
  });
};
