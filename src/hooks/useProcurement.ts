import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    procurementGoodsReceiptsApi,
    procurementInspectionsApi,
    procurementPurchaseOrdersApi,
    procurementQuotationsApi,
    procurementRequirementsApi,
} from '../services/store.service';

// ============================================================================
// REQUIREMENTS HOOKS
// ============================================================================

export const requirementKeys = {
  all: ['procurementRequirements'] as const,
  lists: () => [...requirementKeys.all, 'list'] as const,
  list: (filters?: any) => [...requirementKeys.lists(), filters] as const,
  details: () => [...requirementKeys.all, 'detail'] as const,
  detail: (id: number) => [...requirementKeys.details(), id] as const,
  quotations: (id: number) => [...requirementKeys.all, 'quotations', id] as const,
};

export const useRequirements = (filters?: any) => {
  return useQuery({
    queryKey: requirementKeys.list(filters),
    queryFn: () => procurementRequirementsApi.list(filters),
  });
};

export const useRequirement = (id: number) => {
  return useQuery({
    queryKey: requirementKeys.detail(id),
    queryFn: () => procurementRequirementsApi.get(id),
    enabled: !!id,
  });
};

export const useRequirementQuotations = (id: number) => {
  return useQuery({
    queryKey: requirementKeys.quotations(id),
    queryFn: () => procurementRequirementsApi.getQuotations(id),
    enabled: !!id,
  });
};

export const useCreateRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      // Clean up items before sending - remove requirement field as it will be auto-assigned
      const cleanedData = { ...data };
      if (cleanedData.items && Array.isArray(cleanedData.items)) {
        cleanedData.items = cleanedData.items.map((item: any) => {
          const { requirement, ...itemWithoutRequirement } = item;
          return itemWithoutRequirement;
        });
      }
      return procurementRequirementsApi.create(cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
    },
  });
};

export const useUpdateRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => procurementRequirementsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.detail(variables.id) });
    },
  });
};

export const useDeleteRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: procurementRequirementsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
    },
  });
};

export const useSelectQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => procurementRequirementsApi.selectQuotation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.detail(variables.id) });
    },
  });
};

export const useSubmitRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => procurementRequirementsApi.submitForApproval(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.detail(variables.id) });
    },
  });
};

export const useApproveRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => procurementRequirementsApi.approve(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.detail(variables.id) });
    },
  });
};

export const useRejectRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => procurementRequirementsApi.reject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.detail(variables.id) });
    },
  });
};

// ============================================================================
// QUOTATIONS HOOKS
// ============================================================================

export const quotationKeys = {
  all: ['procurementQuotations'] as const,
  lists: () => [...quotationKeys.all, 'list'] as const,
  list: (filters?: any) => [...quotationKeys.lists(), filters] as const,
  details: () => [...quotationKeys.all, 'detail'] as const,
  detail: (id: number) => [...quotationKeys.details(), id] as const,
};

export const useQuotations = (filters?: any) => {
  return useQuery({
    queryKey: quotationKeys.list(filters),
    queryFn: () => procurementQuotationsApi.list(filters),
  });
};

export const useQuotation = (id: number) => {
  return useQuery({
    queryKey: quotationKeys.detail(id),
    queryFn: () => procurementQuotationsApi.get(id),
    enabled: !!id,
  });
};

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: procurementQuotationsApi.create,
    onSuccess: () => {
      // Invalidate quotation queries
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });

      // Also invalidate requirement queries to update kanban board
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.all });
    },
  });
};

export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => procurementQuotationsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quotationKeys.detail(variables.id) });
    },
  });
};

export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: procurementQuotationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
    },
  });
};

export const useMarkQuotationSelected = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => procurementQuotationsApi.markSelected(id, data),
    onSuccess: (_, variables) => {
      // Invalidate quotation queries
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quotationKeys.detail(variables.id) });

      // Also invalidate requirement queries to update kanban board
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.all });
    },
  });
};

// ============================================================================
// PURCHASE ORDERS HOOKS
// ============================================================================

export const purchaseOrderKeys = {
  all: ['procurementPurchaseOrders'] as const,
  lists: () => [...purchaseOrderKeys.all, 'list'] as const,
  list: (filters?: any) => [...purchaseOrderKeys.lists(), filters] as const,
  details: () => [...purchaseOrderKeys.all, 'detail'] as const,
  detail: (id: number) => [...purchaseOrderKeys.details(), id] as const,
};

export const usePurchaseOrders = (filters?: any) => {
  return useQuery({
    queryKey: purchaseOrderKeys.list(filters),
    queryFn: () => procurementPurchaseOrdersApi.list(filters),
  });
};

export const usePurchaseOrder = (id: number) => {
  return useQuery({
    queryKey: purchaseOrderKeys.detail(id),
    queryFn: () => procurementPurchaseOrdersApi.get(id),
    enabled: !!id,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: procurementPurchaseOrdersApi.create,
    onSuccess: () => {
      // Invalidate purchase order queries
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });

      // Also invalidate requirement queries to update kanban board
      queryClient.invalidateQueries({ queryKey: requirementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requirementKeys.all });
    },
  });
};

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => procurementPurchaseOrdersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(variables.id) });
    },
  });
};

export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: procurementPurchaseOrdersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
    },
  });
};

export const useAcknowledgePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => procurementPurchaseOrdersApi.acknowledge(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(variables.id) });
    },
  });
};

export const useGeneratePurchaseOrderPdf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => procurementPurchaseOrdersApi.generatePdf(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
    },
  });
};

export const useSendPurchaseOrderToSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => procurementPurchaseOrdersApi.sendToSupplier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(variables.id) });
    },
  });
};

// ============================================================================
// GOODS RECEIPTS HOOKS
// ============================================================================

export const goodsReceiptKeys = {
  all: ['procurementGoodsReceipts'] as const,
  lists: () => [...goodsReceiptKeys.all, 'list'] as const,
  list: (filters?: any) => [...goodsReceiptKeys.lists(), filters] as const,
  details: () => [...goodsReceiptKeys.all, 'detail'] as const,
  detail: (id: number) => [...goodsReceiptKeys.details(), id] as const,
};

export const useGoodsReceipts = (filters?: any) => {
  return useQuery({
    queryKey: goodsReceiptKeys.list(filters),
    queryFn: () => procurementGoodsReceiptsApi.list(filters),
  });
};

export const useGoodsReceipt = (id: number) => {
  return useQuery({
    queryKey: goodsReceiptKeys.detail(id),
    queryFn: () => procurementGoodsReceiptsApi.get(id),
    enabled: !!id,
  });
};

export const useCreateGoodsReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: procurementGoodsReceiptsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goodsReceiptKeys.lists() });
    },
  });
};

export const useUpdateGoodsReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => procurementGoodsReceiptsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: goodsReceiptKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goodsReceiptKeys.detail(variables.id) });
    },
  });
};

export const useDeleteGoodsReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: procurementGoodsReceiptsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goodsReceiptKeys.lists() });
    },
  });
};

export const usePostGoodsReceiptToInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => procurementGoodsReceiptsApi.postToInventory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: goodsReceiptKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goodsReceiptKeys.detail(variables.id) });
    },
  });
};

export const useSubmitGoodsReceiptForInspection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => procurementGoodsReceiptsApi.submitForInspection(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: goodsReceiptKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goodsReceiptKeys.detail(variables.id) });
    },
  });
};

// ============================================================================
// INSPECTIONS HOOKS
// ============================================================================

export const inspectionKeys = {
  all: ['procurementInspections'] as const,
  lists: () => [...inspectionKeys.all, 'list'] as const,
  list: (filters?: any) => [...inspectionKeys.lists(), filters] as const,
  details: () => [...inspectionKeys.all, 'detail'] as const,
  detail: (id: number) => [...inspectionKeys.details(), id] as const,
};

export const useInspections = (filters?: any) => {
  return useQuery({
    queryKey: inspectionKeys.list(filters),
    queryFn: () => procurementInspectionsApi.list(filters),
  });
};

export const useInspection = (id: number) => {
  return useQuery({
    queryKey: inspectionKeys.detail(id),
    queryFn: () => procurementInspectionsApi.get(id),
    enabled: !!id,
  });
};

export const useCreateInspection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: procurementInspectionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inspectionKeys.lists() });
    },
  });
};

export const useUpdateInspection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => procurementInspectionsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inspectionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inspectionKeys.detail(variables.id) });
    },
  });
};

export const useDeleteInspection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: procurementInspectionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inspectionKeys.lists() });
    },
  });
};
