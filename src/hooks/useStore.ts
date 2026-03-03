/**
 * Store Management Hooks
 * API hooks for store items, sales, and sale items
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, centralInventoryApi, centralStoreApi, creditsApi, materialIssuesApi, printJobsApi, saleItemsApi, salesApi, stockReceiptApi, storeIndentsApi, storeItemsApi, vendorApi } from '../services/store.service';


// ============================================================================
// CATEGORIES
// ============================================================================

/**
 * Fetch categories with optional filters
 */
export const useCategories = (filters?: any) => {
  return useQuery({
    queryKey: ['store-categories', filters],
    queryFn: () => categoriesApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const userId = localStorage.getItem('kumss_user_id');
      const collegeId = localStorage.getItem('kumss_college_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.created_by = userId;
        submitData.updated_by = userId;
      }

      if (collegeId) {
        submitData.college = parseInt(collegeId);
      }

      return categoriesApi.create(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
    },
  });
};

/**
 * Update a category
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const userId = localStorage.getItem('kumss_user_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.updated_by = userId;
      }

      return categoriesApi.update(id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
    },
  });
};

/**
 * Delete a category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-categories'] });
    },
  });
};

// ============================================================================
// STORE ITEMS
// ============================================================================

/**
 * Fetch store items with optional filters
 */
export const useStoreItems = (filters?: any, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['store-items', filters],
    queryFn: () => storeItemsApi.list(filters),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
};

/**
 * Create a new store item
 */
export const useCreateStoreItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const userId = localStorage.getItem('kumss_user_id');
      const collegeId = localStorage.getItem('kumss_college_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.created_by = userId;
        submitData.updated_by = userId;
      }

      if (collegeId) {
        submitData.college = parseInt(collegeId);
      }

      // Remove empty string fields (image, barcode) as backend expects file upload or null
      if (submitData.image === '') {
        delete submitData.image;
      }
      if (submitData.barcode === '') {
        delete submitData.barcode;
      }

      return storeItemsApi.create(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-items'] });
    },
  });
};

/**
 * Update a store item
 */
export const useUpdateStoreItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const userId = localStorage.getItem('kumss_user_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.updated_by = userId;
      }

      // Remove empty string fields (image, barcode) as backend expects file upload or null
      if (submitData.image === '') {
        delete submitData.image;
      }
      if (submitData.barcode === '') {
        delete submitData.barcode;
      }

      return storeItemsApi.update(id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-items'] });
    },
  });
};

/**
 * Delete a store item
 */
export const useDeleteStoreItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => storeItemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-items'] });
    },
  });
};

// ============================================================================
// SALE ITEMS
// ============================================================================

/**
 * Fetch sale items with optional filters
 */
export const useSaleItems = (filters?: any) => {
  return useQuery({
    queryKey: ['sale-items', filters],
    queryFn: () => saleItemsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new sale item
 */
export const useCreateSaleItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const userId = localStorage.getItem('kumss_user_id');

      const submitData: any = {
        sale: data.sale,
        item: data.item,
        quantity: data.quantity,
        unit_price: data.unit_price,
        total_price: data.total_price,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.created_by = userId;
        submitData.updated_by = userId;
      }

      return saleItemsApi.create(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-items'] });
    },
  });
};

/**
 * Update a sale item
 */
export const useUpdateSaleItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const userId = localStorage.getItem('kumss_user_id');

      const submitData: any = {
        sale: data.sale,
        item: data.item,
        quantity: data.quantity,
        unit_price: data.unit_price,
        total_price: data.total_price,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.updated_by = userId;
      }

      return saleItemsApi.update(id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-items'] });
    },
  });
};

/**
 * Delete a sale item
 */
export const useDeleteSaleItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => saleItemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-items'] });
    },
  });
};

// ============================================================================
// CREDITS
// ============================================================================

/**
 * Fetch credits with optional filters
 */
export const useCredits = (filters?: any) => {
  return useQuery({
    queryKey: ['store-credits', filters],
    queryFn: () => creditsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new credit
 */
export const useCreateCredit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const userId = localStorage.getItem('kumss_user_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.created_by = userId;
        submitData.updated_by = userId;
      }

      return creditsApi.create(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-credits'] });
    },
  });
};

/**
 * Update a credit
 */
export const useUpdateCredit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const userId = localStorage.getItem('kumss_user_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.updated_by = userId;
      }

      return creditsApi.update(id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-credits'] });
    },
  });
};

/**
 * Delete a credit
 */
export const useDeleteCredit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => creditsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-credits'] });
    },
  });
};

// ============================================================================
// PRINT JOBS
// ============================================================================

/**
 * Fetch print jobs with optional filters
 */
export const usePrintJobs = (filters?: any) => {
  return useQuery({
    queryKey: ['store-print-jobs', filters],
    queryFn: () => printJobsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch a single print job
 */
export const usePrintJob = (id: number) => {
  return useQuery({
    queryKey: ['store-print-jobs', id],
    queryFn: () => printJobsApi.get(id),
    enabled: !!id,
  });
};

/**
 * Create a new print job
 */
export const useCreatePrintJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const userId = localStorage.getItem('kumss_user_id');
      const collegeId = localStorage.getItem('kumss_college_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.created_by = userId;
        submitData.updated_by = userId;
      }

      if (collegeId) {
        submitData.college = parseInt(collegeId);
      }

      return printJobsApi.create(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-print-jobs'] });
    },
  });
};

/**
 * Update a print job
 */
export const useUpdatePrintJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const userId = localStorage.getItem('kumss_user_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.updated_by = userId;
      }

      return printJobsApi.update(id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-print-jobs'] });
    },
  });
};

/**
 * Partially update a print job (PATCH)
 */
export const usePartialUpdatePrintJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const userId = localStorage.getItem('kumss_user_id');

      const submitData: any = {
        ...data,
      };

      if (userId) {
        submitData.updated_by = userId;
      }

      return printJobsApi.partialUpdate(id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-print-jobs'] });
    },
  });
};

/**
 * Delete a print job
 */
export const useDeletePrintJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => printJobsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-print-jobs'] });
    },
  });
};

// ============================================================================
// SALES
// ============================================================================

/**
 * Fetch sales with optional filters
 */
export const useSales = (filters?: any) => {
  return useQuery({
    queryKey: ['store-sales', filters],
    queryFn: () => salesApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch a single sale by ID
 */
export const useSale = (id: number | null) => {
  return useQuery({
    queryKey: ['store-sale', id],
    queryFn: () => salesApi.get(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Create a new sale
 */
export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const userId = localStorage.getItem('kumss_user_id');
      const collegeId = localStorage.getItem('kumss_college_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.created_by = userId;
        submitData.updated_by = userId;
        submitData.sold_by = userId;
      }

      if (collegeId) {
        submitData.college = parseInt(collegeId);
      }

      return salesApi.create(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-sales'] });
    },
  });
};

/**
 * Bulk create a sale with all items in a single API call
 * Use when items count >= 2
 */
export const useCreateBulkSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const userId = localStorage.getItem('kumss_user_id');
      const collegeId = localStorage.getItem('kumss_college_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.created_by = userId;
        submitData.updated_by = userId;
        submitData.sold_by = userId;
      }

      if (collegeId) {
        submitData.college = parseInt(collegeId);
      }

      return salesApi.bulkCreate(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-sales'] });
    },
  });
};

/**
 * Update a sale
 */
export const useUpdateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const userId = localStorage.getItem('kumss_user_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.updated_by = userId;
      }

      return salesApi.update(id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-sales'] });
    },
  });
};

/**
 * Delete a sale
 */
export const useDeleteSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => salesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-sales'] });
    },
  });
};

// ============================================================================
// VENDORS
// ============================================================================

/**
 * Fetch vendors with optional filters
 */
export const useVendors = (filters?: any) => {
  return useQuery({
    queryKey: ['store-vendors', filters],
    queryFn: () => vendorApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new vendor
 */
export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const userId = localStorage.getItem('kumss_user_id');
      const collegeId = localStorage.getItem('kumss_college_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.created_by = userId;
        submitData.updated_by = userId;
      }

      if (collegeId) {
        submitData.college = parseInt(collegeId);
      }

      return vendorApi.create(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-vendors'] });
    },
  });
};

/**
 * Update a vendor
 */
export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const userId = localStorage.getItem('kumss_user_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.updated_by = userId;
      }

      return vendorApi.update(id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-vendors'] });
    },
  });
};

/**
 * Delete a vendor
 */
export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => vendorApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-vendors'] });
    },
  });
};

// ============================================================================
// STOCK RECEIPTS
// ============================================================================

/**
 * Fetch stock receipts with optional filters
 */
export const useStockReceipts = (filters?: any) => {
  return useQuery({
    queryKey: ['store-stock-receipts', filters],
    queryFn: () => stockReceiptApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new stock receipt
 */
export const useCreateStockReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const userId = localStorage.getItem('kumss_user_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.created_by = userId;
        submitData.updated_by = userId;
      }

      return stockReceiptApi.create(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-stock-receipts'] });
    },
  });
};

/**
 * Update a stock receipt
 */
export const useUpdateStockReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const userId = localStorage.getItem('kumss_user_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
      };

      if (userId) {
        submitData.updated_by = userId;
      }

      return stockReceiptApi.update(id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-stock-receipts'] });
    },
  });
};

/**
 * Delete a stock receipt
 */
export const useDeleteStockReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => stockReceiptApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-stock-receipts'] });
    },
  });
};

// ============================================================================
// CENTRAL STORE & INVENTORY
// ============================================================================

export const useCentralStores = (filters?: any) => {
  return useQuery({
    queryKey: ['central-stores', filters],
    queryFn: () => centralStoreApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCentralStoreStockSummary = (id: number | null) => {
  return useQuery({
    queryKey: ['central-store-stock-summary', id],
    queryFn: () => centralStoreApi.stockSummary(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCentralInventoryLowStock = () => {
  return useQuery({
    queryKey: ['central-inventory-low-stock'],
    queryFn: () => centralInventoryApi.lowStock(),
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// STORE INDENTS & ISSUES
// ============================================================================

export const useStoreIndents = (filters?: any, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['store-indents', filters],
    queryFn: () => storeIndentsApi.list(filters),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
};

export const useMaterialIssues = (filters?: any) => {
  return useQuery({
    queryKey: ['material-issues', filters],
    queryFn: () => materialIssuesApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};
