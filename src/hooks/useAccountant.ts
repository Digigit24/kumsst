/**
 * Custom React Query Hooks for Accountant Module
 * Manages state and API calls for all Accountant entities
 */

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  incomeDashboardApi,
  feeCollectionsApi,
  storeSalesApi,
  feeFinesApi,
  libraryFinesApi,
  receiptsApi,
  studentsSearchApi,
} from '../services/accountant.service';
import type {
  IncomeDashboardFilters,
  FeeCollectionCreateInput,
  FeeCollectionUpdateInput,
  FeeCollectionFilters,
  StoreSaleCreateInput,
  StoreSaleFilters,
  FeeFineCreateInput,
  FeeFineUpdateInput,
  FeeFineFilters,
  LibraryFineCreateInput,
  LibraryFineUpdateInput,
  LibraryFineFilters,
  ReceiptFilters,
} from '../types/accountant.types';

// ============================================================================
// INCOME DASHBOARD HOOKS
// ============================================================================

export const useIncomeDashboard = (filters?: IncomeDashboardFilters) => {
  return useQuery({
    queryKey: ['income-dashboard', filters],
    queryFn: () => incomeDashboardApi.get(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// ============================================================================
// FEE COLLECTIONS HOOKS
// ============================================================================

export const useFeeCollections = (filters?: FeeCollectionFilters) => {
  return useQuery({
    queryKey: ['fee-collections', filters],
    queryFn: () => feeCollectionsApi.list(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    placeholderData: keepPreviousData,
  });
};

export const useFeeCollectionDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['fee-collection-detail', id],
    queryFn: () => feeCollectionsApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateFeeCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FeeCollectionCreateInput) => feeCollectionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-collections'] });
      queryClient.invalidateQueries({ queryKey: ['income-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['fee-receipts'] });
    },
  });
};

export const useUpdateFeeCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FeeCollectionUpdateInput }) =>
      feeCollectionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-collections'] });
      queryClient.invalidateQueries({ queryKey: ['income-dashboard'] });
    },
  });
};

export const useDeleteFeeCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeCollectionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-collections'] });
      queryClient.invalidateQueries({ queryKey: ['income-dashboard'] });
    },
  });
};

export const useFeeCollectionsReport = (filters?: FeeCollectionFilters) => {
  return useQuery({
    queryKey: ['fee-collections-report', filters],
    queryFn: () => feeCollectionsApi.getReport(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ============================================================================
// STORE SALES HOOKS
// ============================================================================

export const useStoreSales = (filters?: StoreSaleFilters) => {
  return useQuery({
    queryKey: ['store-sales', filters],
    queryFn: () => storeSalesApi.list(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    placeholderData: keepPreviousData,
  });
};

export const useStoreSaleDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['store-sale-detail', id],
    queryFn: () => storeSalesApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateStoreSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreSaleCreateInput) => storeSalesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-sales'] });
      queryClient.invalidateQueries({ queryKey: ['income-dashboard'] });
    },
  });
};

// ============================================================================
// FEE FINES HOOKS
// ============================================================================

export const useFeeFines = (filters?: FeeFineFilters) => {
  return useQuery({
    queryKey: ['fee-fines', filters],
    queryFn: () => feeFinesApi.list(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    placeholderData: keepPreviousData,
  });
};

export const useFeeFineDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['fee-fine-detail', id],
    queryFn: () => feeFinesApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateFeeFine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FeeFineCreateInput) => feeFinesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-fines'] });
      queryClient.invalidateQueries({ queryKey: ['income-dashboard'] });
    },
  });
};

export const useUpdateFeeFine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FeeFineUpdateInput }) =>
      feeFinesApi.patch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-fines'] });
      queryClient.invalidateQueries({ queryKey: ['income-dashboard'] });
    },
  });
};

// ============================================================================
// LIBRARY FINES HOOKS
// ============================================================================

export const useLibraryFines = (filters?: LibraryFineFilters) => {
  return useQuery({
    queryKey: ['library-fines', filters],
    queryFn: () => libraryFinesApi.list(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useLibraryFineDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['library-fine-detail', id],
    queryFn: () => libraryFinesApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateLibraryFine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LibraryFineCreateInput) => libraryFinesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-fines'] });
      queryClient.invalidateQueries({ queryKey: ['income-dashboard'] });
    },
  });
};

export const useUpdateLibraryFine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LibraryFineUpdateInput }) =>
      libraryFinesApi.patch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-fines'] });
      queryClient.invalidateQueries({ queryKey: ['income-dashboard'] });
    },
  });
};

// ============================================================================
// RECEIPTS HOOKS
// ============================================================================

export const useReceipts = (filters?: ReceiptFilters) => {
  return useQuery({
    queryKey: ['fee-receipts', filters],
    queryFn: () => receiptsApi.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useReceiptDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['fee-receipt-detail', id],
    queryFn: () => receiptsApi.get(id!),
    enabled: !!id,
  });
};

export const useDownloadReceipt = () => {
  return useMutation({
    mutationFn: async (id: number) => {
      const blob = await receiptsApi.download(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
};

// ============================================================================
// STUDENTS SEARCH HOOKS
// ============================================================================

export const useStudentsSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['students-search', query],
    queryFn: () => studentsSearchApi.search(query),
    enabled: enabled && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
