import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { centralInventoryApi } from '../services/store.service';

export const centralInventoryKeys = {
  all: ['centralInventory'] as const,
  lists: () => [...centralInventoryKeys.all, 'list'] as const,
  list: (filters?: any) => [...centralInventoryKeys.lists(), filters] as const,
  details: () => [...centralInventoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...centralInventoryKeys.details(), id] as const,
  lowStock: () => [...centralInventoryKeys.all, 'lowStock'] as const,
};

export const useCentralInventory = (filters?: any) => {
  return useQuery({
    queryKey: centralInventoryKeys.list(filters),
    queryFn: () => centralInventoryApi.list(filters),
  });
};

export const useCentralInventoryItem = (id: number) => {
  return useQuery({
    queryKey: centralInventoryKeys.detail(id),
    queryFn: () => centralInventoryApi.get(id),
    enabled: !!id,
  });
};

export const useLowStockItems = () => {
  return useQuery({
    queryKey: centralInventoryKeys.lowStock(),
    queryFn: () => centralInventoryApi.lowStock(),
  });
};

export const useCreateCentralInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: centralInventoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: centralInventoryKeys.lists() });
    },
  });
};

export const useUpdateCentralInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => centralInventoryApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: centralInventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: centralInventoryKeys.detail(variables.id) });
    },
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => centralInventoryApi.adjustStock(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: centralInventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: centralInventoryKeys.detail(variables.id) });
    },
  });
};

export const useDeleteCentralInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: centralInventoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: centralInventoryKeys.lists() });
    },
  });
};
