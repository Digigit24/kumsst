/**
 * Custom React Query Hooks for Fees Module
 * Manages state and API calls for all Fees entities
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  feeMastersApi,
  feeStructuresApi,
  feeDiscountsApi,
  feeFinesApi,
  feeCollectionsApi,
  feeTypesApi,
  feeGroupsApi,
  feeInstallmentsApi,
  feeReceiptsApi,
  studentFeeDiscountsApi,
  feeRefundsApi,
  feeRemindersApi,
  bankPaymentsApi,
  onlinePaymentsApi,
  studentFeesApi,
} from '../services/fees.service';

// ============================================================================
// FEE MASTERS HOOKS
// ============================================================================

export const useFeeMasters = (filters?: any) => {
  return useQuery({
    queryKey: ['fee-masters', filters],
    queryFn: () => feeMastersApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeeMasterDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['fee-master-detail', id],
    queryFn: () => feeMastersApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateFeeMaster = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => feeMastersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-masters'] });
    },
  });
};

export const useUpdateFeeMaster = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => feeMastersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-masters'] });
    },
  });
};

export const useDeleteFeeMaster = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeMastersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-masters'] });
    },
  });
};

// ============================================================================
// FEE STRUCTURES HOOKS
// ============================================================================

export const useFeeStructures = (filters?: any) => {
  return useQuery({
    queryKey: ['fee-structures', filters],
    queryFn: () => feeStructuresApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeeStructureDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['fee-structure-detail', id],
    queryFn: () => feeStructuresApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => feeStructuresApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
    },
  });
};

export const useUpdateFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => feeStructuresApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
    },
  });
};

export const useDeleteFeeStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeStructuresApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
    },
  });
};

// ============================================================================
// FEE DISCOUNTS HOOKS
// ============================================================================

export const useFeeDiscounts = (filters?: any) => {
  return useQuery({
    queryKey: ['fee-discounts', filters],
    queryFn: () => feeDiscountsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeeDiscountDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['fee-discount-detail', id],
    queryFn: () => feeDiscountsApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateFeeDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => feeDiscountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-discounts'] });
    },
  });
};

export const useUpdateFeeDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => feeDiscountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-discounts'] });
    },
  });
};

export const useDeleteFeeDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeDiscountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-discounts'] });
    },
  });
};

// ============================================================================
// FEE FINES HOOKS
// ============================================================================

export const useFeeFines = (filters?: any) => {
  return useQuery({
    queryKey: ['fee-fines', filters],
    queryFn: () => feeFinesApi.list(filters),
    staleTime: 5 * 60 * 1000,
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
    mutationFn: (data: any) => feeFinesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-fines'] });
    },
  });
};

export const useUpdateFeeFine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => feeFinesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-fines'] });
    },
  });
};

export const useDeleteFeeFine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeFinesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-fines'] });
    },
  });
};

// ============================================================================
// FEE COLLECTIONS HOOKS
// ============================================================================

export const useFeeCollections = (filters?: any) => {
  return useQuery({
    queryKey: ['fee-collections', filters],
    queryFn: () => feeCollectionsApi.list(filters),
    staleTime: 2 * 60 * 1000,
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
    mutationFn: (data: any) => feeCollectionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-collections'] });
    },
  });
};

export const useUpdateFeeCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => feeCollectionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-collections'] });
    },
  });
};

export const useCancelFeeCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeCollectionsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-collections'] });
    },
  });
};

export const useDeleteFeeCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeCollectionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-collections'] });
    },
  });
};

export const useStudentFeeStatus = (studentId: number | null) => {
  return useQuery({
    queryKey: ['student-fee-status', studentId],
    queryFn: () => feeCollectionsApi.studentStatus(studentId!),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000,
  });
};

// ============================================================================
// FEE TYPES HOOKS
// ============================================================================

export const useFeeTypes = (filters?: any) => {
  return useQuery({
    queryKey: ['fee-types', filters],
    queryFn: () => feeTypesApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeeTypeDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['fee-type-detail', id],
    queryFn: () => feeTypesApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateFeeType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => feeTypesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-types'] });
    },
  });
};

export const useUpdateFeeType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => feeTypesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-types'] });
    },
  });
};

export const useDeleteFeeType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-types'] });
    },
  });
};

// ============================================================================
// FEE GROUPS HOOKS
// ============================================================================

export const useFeeGroups = (filters?: any) => {
  return useQuery({
    queryKey: ['fee-groups', filters],
    queryFn: () => feeGroupsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeeGroupDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['fee-group-detail', id],
    queryFn: () => feeGroupsApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateFeeGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => feeGroupsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-groups'] });
    },
  });
};

export const useUpdateFeeGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => feeGroupsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-groups'] });
    },
  });
};

export const useDeleteFeeGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeGroupsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-groups'] });
    },
  });
};

// ============================================================================
// FEE INSTALLMENTS HOOKS
// ============================================================================

export const useFeeInstallments = (filters?: any) => {
  return useQuery({
    queryKey: ['fee-installments', filters],
    queryFn: () => feeInstallmentsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeeInstallmentDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['fee-installment-detail', id],
    queryFn: () => feeInstallmentsApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateFeeInstallment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => feeInstallmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-installments'] });
    },
  });
};

export const useUpdateFeeInstallment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => feeInstallmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-installments'] });
    },
  });
};

export const useDeleteFeeInstallment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeInstallmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-installments'] });
    },
  });
};

// ============================================================================
// FEE RECEIPTS HOOKS
// ============================================================================

export const useFeeReceipts = (filters?: any) => {
  return useQuery({
    queryKey: ['fee-receipts', filters],
    queryFn: () => feeReceiptsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeeReceiptDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['fee-receipt-detail', id],
    queryFn: () => feeReceiptsApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateFeeReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => feeReceiptsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-receipts'] });
    },
  });
};

export const useUpdateFeeReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => feeReceiptsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-receipts'] });
    },
  });
};

export const useDeleteFeeReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeReceiptsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-receipts'] });
    },
  });
};

// ============================================================================
// STUDENT FEE DISCOUNTS HOOKS
// ============================================================================

export const useStudentFeeDiscounts = (filters?: any) => {
  return useQuery({
    queryKey: ['student-fee-discounts', filters],
    queryFn: () => studentFeeDiscountsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useStudentFeeDiscountDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['student-fee-discount-detail', id],
    queryFn: () => studentFeeDiscountsApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateStudentFeeDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => studentFeeDiscountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-fee-discounts'] });
    },
  });
};

export const useUpdateStudentFeeDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => studentFeeDiscountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-fee-discounts'] });
    },
  });
};

export const useDeleteStudentFeeDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => studentFeeDiscountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-fee-discounts'] });
    },
  });
};

// ============================================================================
// FEE REFUNDS HOOKS
// ============================================================================

export const useFeeRefunds = (filters?: any) => {
  return useQuery({
    queryKey: ['fee-refunds', filters],
    queryFn: () => feeRefundsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeeRefundDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['fee-refund-detail', id],
    queryFn: () => feeRefundsApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateFeeRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => feeRefundsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-refunds'] });
    },
  });
};

export const useUpdateFeeRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => feeRefundsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-refunds'] });
    },
  });
};

export const useDeleteFeeRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeRefundsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-refunds'] });
    },
  });
};

// ============================================================================
// FEE REMINDERS HOOKS
// ============================================================================

export const useFeeReminders = (filters?: any) => {
  return useQuery({
    queryKey: ['fee-reminders', filters],
    queryFn: () => feeRemindersApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeeReminderDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['fee-reminder-detail', id],
    queryFn: () => feeRemindersApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateFeeReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => feeRemindersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-reminders'] });
    },
  });
};

export const useUpdateFeeReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => feeRemindersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-reminders'] });
    },
  });
};

export const useDeleteFeeReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => feeRemindersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-reminders'] });
    },
  });
};

// ============================================================================
// BANK PAYMENTS HOOKS
// ============================================================================

export const useBankPayments = (filters?: any) => {
  return useQuery({
    queryKey: ['bank-payments', filters],
    queryFn: () => bankPaymentsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useBankPaymentDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['bank-payment-detail', id],
    queryFn: () => bankPaymentsApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateBankPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => bankPaymentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-payments'] });
    },
  });
};

export const useUpdateBankPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => bankPaymentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-payments'] });
    },
  });
};

export const useDeleteBankPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bankPaymentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-payments'] });
    },
  });
};

// ============================================================================
// ONLINE PAYMENTS HOOKS
// ============================================================================

export const useOnlinePayments = (filters?: any) => {
  return useQuery({
    queryKey: ['online-payments', filters],
    queryFn: () => onlinePaymentsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useOnlinePaymentDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['online-payment-detail', id],
    queryFn: () => onlinePaymentsApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateOnlinePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => onlinePaymentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-payments'] });
    },
  });
};

export const useUpdateOnlinePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => onlinePaymentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-payments'] });
    },
  });
};

export const useDeleteOnlinePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => onlinePaymentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['online-payments'] });
    },
  });
};

// ============================================================================
// STUDENT MY FEES HOOKS
// ============================================================================

export const useStudentFees = (filters?: any) => {
  return useQuery({
    queryKey: ['student-my-fees', filters],
    queryFn: () => studentFeesApi.getMyFees(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDownloadFeeReceipt = () => {
  return useMutation({
    mutationFn: (id: number) => studentFeesApi.downloadReceipt(id),
  });
};
