/**
 * Custom React Query Hooks for Print Template Module
 * Manages state and API calls for Print Templates, Documents, and Approvals
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bulkPrintJobsApi,
  printApprovalsApi,
  printConfigApi,
  printDocumentsApi,
  printTemplatesApi,
  templateCategoriesApi,
} from '../services/print.service';
import type {
  ApprovalActionRequest,
  ApprovalFilters,
  BulkPrintJobCreateInput,
  BulkPrintJobFilters,
  PrintConfigurationUpdateInput,
  PrintDocumentCreateInput,
  PrintDocumentFilters,
  PrintTemplateCreateInput,
  PrintTemplateFilters,
  PrintTemplateUpdateInput,
  SignatoryCreateInput,
  TemplateCategoryCreateInput,
  TemplateCategoryFilters,
  TemplateCategoryUpdateInput,
  TemplateDuplicateRequest,
  TemplatePreviewRequest,
} from '../types/print.types';

// ============================================================================
// PRINT CONFIGURATION HOOKS
// ============================================================================

export const usePrintConfiguration = () => {
  return useQuery({
    queryKey: ['print-configuration'],
    queryFn: () => printConfigApi.get(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdatePrintConfiguration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PrintConfigurationUpdateInput }) =>
      printConfigApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-configuration'] });
    },
  });
};

export const usePrintSignatories = () => {
  return useQuery({
    queryKey: ['print-signatories'],
    queryFn: () => printConfigApi.getSignatories(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddPrintSignatory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SignatoryCreateInput) => printConfigApi.addSignatory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-signatories'] });
      queryClient.invalidateQueries({ queryKey: ['print-configuration'] });
    },
  });
};

// ============================================================================
// TEMPLATE CATEGORIES HOOKS
// ============================================================================

export const useTemplateCategories = (filters?: TemplateCategoryFilters) => {
  return useQuery({
    queryKey: ['template-categories', filters],
    queryFn: () => templateCategoriesApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTemplateCategoryDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['template-category-detail', id],
    queryFn: () => templateCategoriesApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateTemplateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TemplateCategoryCreateInput) => templateCategoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-categories'] });
    },
  });
};

export const useUpdateTemplateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TemplateCategoryUpdateInput }) =>
      templateCategoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-categories'] });
      queryClient.invalidateQueries({ queryKey: ['template-category-detail'] });
    },
  });
};

export const useDeleteTemplateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => templateCategoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-categories'] });
    },
  });
};

export const useSeedDefaultCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => templateCategoriesApi.seedDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-categories'] });
    },
  });
};

// ============================================================================
// PRINT TEMPLATES HOOKS
// ============================================================================

export const usePrintTemplates = (filters?: PrintTemplateFilters) => {
  return useQuery({
    queryKey: ['print-templates', filters],
    queryFn: () => printTemplatesApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePrintTemplateDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['print-template-detail', id],
    queryFn: () => printTemplatesApi.get(id!),
    enabled: !!id,
  });
};

export const useCreatePrintTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PrintTemplateCreateInput) => printTemplatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-templates'] });
      queryClient.invalidateQueries({ queryKey: ['templates-by-category'] });
    },
  });
};

export const useUpdatePrintTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PrintTemplateUpdateInput }) =>
      printTemplatesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-templates'] });
      queryClient.invalidateQueries({ queryKey: ['print-template-detail'] });
      queryClient.invalidateQueries({ queryKey: ['templates-by-category'] });
    },
  });
};

export const useDeletePrintTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => printTemplatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-templates'] });
      queryClient.invalidateQueries({ queryKey: ['templates-by-category'] });
    },
  });
};

export const usePreviewTemplate = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TemplatePreviewRequest }) =>
      printTemplatesApi.preview(id, data),
  });
};

export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TemplateDuplicateRequest }) =>
      printTemplatesApi.duplicate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-templates'] });
      queryClient.invalidateQueries({ queryKey: ['templates-by-category'] });
    },
  });
};

export const useNewTemplateVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => printTemplatesApi.newVersion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-templates'] });
      queryClient.invalidateQueries({ queryKey: ['print-template-detail'] });
    },
  });
};

export const useTemplateVariables = (id: number | null) => {
  return useQuery({
    queryKey: ['template-variables', id],
    queryFn: () => printTemplatesApi.getVariables(id!),
    enabled: !!id,
  });
};

export const useTemplatesByCategory = () => {
  return useQuery({
    queryKey: ['templates-by-category'],
    queryFn: () => printTemplatesApi.getByCategory(),
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// PRINT DOCUMENTS HOOKS
// ============================================================================

export const usePrintDocuments = (filters?: PrintDocumentFilters) => {
  return useQuery({
    queryKey: ['print-documents', filters],
    queryFn: () => printDocumentsApi.list(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const usePrintDocumentDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['print-document-detail', id],
    queryFn: () => printDocumentsApi.get(id!),
    enabled: !!id,
  });
};

export const useDocumentPreview = (id: number | null) => {
  return useQuery({
    queryKey: ['document-preview', id],
    queryFn: () => printDocumentsApi.fetchPreview(id!),
    enabled: !!id,
  });
};

export const useCreatePrintDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PrintDocumentCreateInput) => printDocumentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-documents'] });
      queryClient.invalidateQueries({ queryKey: ['my-print-documents'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approval-dashboard'] });
    },
  });
};

export const useRegeneratePdf = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => printDocumentsApi.regeneratePdf(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-documents'] });
      queryClient.invalidateQueries({ queryKey: ['print-document-detail'] });
    },
  });
};

export const useMarkDocumentPrinted = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => printDocumentsApi.markPrinted(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-documents'] });
      queryClient.invalidateQueries({ queryKey: ['print-document-detail'] });
    },
  });
};

export const useMyPrintDocuments = (filters?: PrintDocumentFilters) => {
  return useQuery({
    queryKey: ['my-print-documents', filters],
    queryFn: () => printDocumentsApi.getMyDocuments(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const usePendingPrintDocuments = (filters?: PrintDocumentFilters) => {
  return useQuery({
    queryKey: ['pending-print-documents', filters],
    queryFn: () => printDocumentsApi.getPending(filters),
    staleTime: 1 * 60 * 1000,
  });
};

// ============================================================================
// APPROVALS HOOKS
// ============================================================================

export const usePrintApprovals = (filters?: ApprovalFilters) => {
  return useQuery({
    queryKey: ['print-approvals', filters],
    queryFn: () => printApprovalsApi.list(filters),
    staleTime: 1 * 60 * 1000,
  });
};

export const usePendingApprovals = (filters?: ApprovalFilters) => {
  return useQuery({
    queryKey: ['pending-approvals', filters],
    queryFn: () => printApprovalsApi.getPending(filters),
    staleTime: 1 * 60 * 1000,
  });
};

export const useApprovalPreview = (id: number | null) => {
  return useQuery({
    queryKey: ['approval-preview', id],
    queryFn: () => printApprovalsApi.preview(id!),
    enabled: !!id,
  });
};

export const useApproveDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ApprovalActionRequest }) =>
      printApprovalsApi.approve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['print-documents'] });
      queryClient.invalidateQueries({ queryKey: ['approval-dashboard'] });
    },
  });
};

export const useApprovalDashboard = () => {
  return useQuery({
    queryKey: ['approval-dashboard'],
    queryFn: () => printApprovalsApi.getDashboard(),
    staleTime: 1 * 60 * 1000,
  });
};

// ============================================================================
// BULK PRINT JOBS HOOKS
// ============================================================================

export const useBulkPrintJobs = (filters?: BulkPrintJobFilters) => {
  return useQuery({
    queryKey: ['bulk-print-jobs', filters],
    queryFn: () => bulkPrintJobsApi.list(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useBulkPrintJobDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['bulk-print-job-detail', id],
    queryFn: () => bulkPrintJobsApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateBulkPrintJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkPrintJobCreateInput) => bulkPrintJobsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk-print-jobs'] });
    },
  });
};

export const useBulkJobProgress = (id: number | null, options?: { refetchInterval?: number }) => {
  return useQuery({
    queryKey: ['bulk-job-progress', id],
    queryFn: () => bulkPrintJobsApi.getProgress(id!),
    enabled: !!id,
    refetchInterval: options?.refetchInterval || false,
  });
};

export const useCancelBulkJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bulkPrintJobsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk-print-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['bulk-print-job-detail'] });
      queryClient.invalidateQueries({ queryKey: ['bulk-job-progress'] });
    },
  });
};

export const useTargetModels = () => {
  return useQuery({
    queryKey: ['bulk-job-target-models'],
    queryFn: () => bulkPrintJobsApi.getTargetModels(),
    staleTime: 30 * 60 * 1000,
  });
};
