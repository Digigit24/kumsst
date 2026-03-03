/**
 * Central Store React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { centralStoreApi } from '../services/store.service';

export const centralStoreKeys = {
  all: ['centralStores'] as const,
  lists: () => [...centralStoreKeys.all, 'list'] as const,
  list: (filters?: any) => [...centralStoreKeys.lists(), filters] as const,
  details: () => [...centralStoreKeys.all, 'detail'] as const,
  detail: (id: number) => [...centralStoreKeys.details(), id] as const,
  inventory: (id: number) => [...centralStoreKeys.all, 'inventory', id] as const,
  stockSummary: (id: number) => [...centralStoreKeys.all, 'stockSummary', id] as const,
};

// List central stores
export const useCentralStores = (filters?: any) => {
  return useQuery({
    queryKey: centralStoreKeys.list(filters),
    queryFn: () => centralStoreApi.list(filters),
  });
};

// Get single central store
export const useCentralStore = (id: number) => {
  return useQuery({
    queryKey: centralStoreKeys.detail(id),
    queryFn: () => centralStoreApi.get(id),
    enabled: !!id,
  });
};

// Get inventory
export const useCentralStoreInventory = (id: number) => {
  return useQuery({
    queryKey: centralStoreKeys.inventory(id),
    queryFn: () => centralStoreApi.inventory(id),
    enabled: !!id,
  });
};

// Get stock summary
export const useCentralStoreStockSummary = (id: number) => {
  return useQuery({
    queryKey: centralStoreKeys.stockSummary(id),
    queryFn: () => centralStoreApi.stockSummary(id),
    enabled: !!id,
  });
};

// Create central store
export const useCreateCentralStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: centralStoreApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: centralStoreKeys.lists() });
    },
  });
};

// Update central store
export const useUpdateCentralStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => centralStoreApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: centralStoreKeys.lists() });
      queryClient.invalidateQueries({ queryKey: centralStoreKeys.detail(variables.id) });
    },
  });
};

// Delete central store
export const useDeleteCentralStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: centralStoreApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: centralStoreKeys.lists() });
    },
  });
};
