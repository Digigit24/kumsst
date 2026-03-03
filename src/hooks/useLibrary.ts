/**
 * Custom React Query Hooks for Library Module
 * Manages state and API calls for all Library entities
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    bookCategoriesApi,
    bookIssuesApi,
    bookReturnsApi,
    booksApi,
    finesApi,
    libraryCardsApi,
    libraryMembersApi,
    reservationsApi,
} from '../services/library.service';

// ============================================================================
// BOOK CATEGORIES HOOKS
// ============================================================================

export const useBookCategories = (filters?: any) => {
  return useQuery({
    queryKey: ['book-categories', filters],
    queryFn: () => bookCategoriesApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useBookCategoryDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['book-category-detail', id],
    queryFn: () => bookCategoriesApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateBookCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => bookCategoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-categories'] });
    },
  });
};

export const useUpdateBookCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => bookCategoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-categories'] });
    },
  });
};

export const useDeleteBookCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookCategoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-categories'] });
    },
  });
};

// ============================================================================
// BOOKS HOOKS
// ============================================================================

export const useBooks = (filters?: any, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['books', filters],
    queryFn: () => booksApi.list(filters),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
};

export const useBookDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['book-detail', id],
    queryFn: () => booksApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => booksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => booksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book-detail'] });
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => booksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

// ============================================================================
// LIBRARY MEMBERS HOOKS
// ============================================================================

export const useLibraryMembers = (filters?: any) => {
  return useQuery({
    queryKey: ['library-members', filters],
    queryFn: () => libraryMembersApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useLibraryMemberDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['library-member-detail', id],
    queryFn: () => libraryMembersApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateLibraryMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => libraryMembersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-members'] });
    },
  });
};

export const useUpdateLibraryMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => libraryMembersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-members'] });
      queryClient.invalidateQueries({ queryKey: ['library-member-detail'] });
    },
  });
};

export const useDeleteLibraryMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => libraryMembersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-members'] });
    },
  });
};

export const useBlockLibraryMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => libraryMembersApi.block(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-members'] });
      queryClient.invalidateQueries({ queryKey: ['library-member-detail'] });
    },
  });
};

export const useUnblockLibraryMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => libraryMembersApi.unblock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-members'] });
      queryClient.invalidateQueries({ queryKey: ['library-member-detail'] });
    },
  });
};

// ============================================================================
// LIBRARY CARDS HOOKS
// ============================================================================

export const useLibraryCards = (filters?: any) => {
  return useQuery({
    queryKey: ['library-cards', filters],
    queryFn: () => libraryCardsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useLibraryCardDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['library-card-detail', id],
    queryFn: () => libraryCardsApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateLibraryCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => libraryCardsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-cards'] });
    },
  });
};

export const useUpdateLibraryCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => libraryCardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-cards'] });
      queryClient.invalidateQueries({ queryKey: ['library-card-detail'] });
    },
  });
};

export const useDeleteLibraryCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => libraryCardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-cards'] });
    },
  });
};

// ============================================================================
// BOOK ISSUES HOOKS
// ============================================================================

export const useBookIssues = (filters?: any, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['book-issues', filters],
    queryFn: () => bookIssuesApi.list(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent updates for active issues
    enabled: options?.enabled,
  });
};

export const useMyBookIssues = (filters?: any) => {
  return useQuery({
    queryKey: ['my-book-issues', filters],
    queryFn: () => bookIssuesApi.myIssues(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useBookIssueDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['book-issue-detail', id],
    queryFn: () => bookIssuesApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateBookIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => bookIssuesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-issues'] });
      queryClient.invalidateQueries({ queryKey: ['books'] }); // Update book availability
      queryClient.invalidateQueries({ queryKey: ['library-members'] }); // Update member stats
    },
  });
};

export const useUpdateBookIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => bookIssuesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-issues'] });
      queryClient.invalidateQueries({ queryKey: ['book-issue-detail'] });
    },
  });
};

export const useDeleteBookIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookIssuesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-issues'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-members'] });
    },
  });
};

export const useRenewBookIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, new_due_date }: { id: number; new_due_date: string }) =>
      bookIssuesApi.renew(id, new_due_date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-issues'] });
      queryClient.invalidateQueries({ queryKey: ['book-issue-detail'] });
    },
  });
};

// ============================================================================
// FINES HOOKS
// ============================================================================

export const useFines = (filters?: any) => {
  return useQuery({
    queryKey: ['fines', filters],
    queryFn: () => finesApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFineDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['fine-detail', id],
    queryFn: () => finesApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateFine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => finesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines'] });
      queryClient.invalidateQueries({ queryKey: ['library-members'] });
    },
  });
};

export const useUpdateFine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => finesApi.patch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines'] });
      queryClient.invalidateQueries({ queryKey: ['fine-detail'] });
      queryClient.invalidateQueries({ queryKey: ['library-members'] });
    },
  });
};

export const useDeleteFine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => finesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines'] });
      queryClient.invalidateQueries({ queryKey: ['library-members'] });
    },
  });
};

// ============================================================================
// RESERVATIONS HOOKS
// ============================================================================

export const useReservations = (filters?: any) => {
  return useQuery({
    queryKey: ['reservations', filters],
    queryFn: () => reservationsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useReservationDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['reservation-detail', id],
    queryFn: () => reservationsApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => reservationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
};

export const useUpdateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => reservationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservation-detail'] });
    },
  });
};

export const useDeleteReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reservationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
};

// ============================================================================
// BOOK RETURNS HOOKS
// ============================================================================

export const useBookReturns = (filters?: any) => {
  return useQuery({
    queryKey: ['book-returns', filters],
    queryFn: () => bookReturnsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useBookReturnDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['book-return-detail', id],
    queryFn: () => bookReturnsApi.get(id!),
    enabled: !!id,
  });
};

export const useCreateBookReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => bookReturnsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-returns'] });
      queryClient.invalidateQueries({ queryKey: ['book-issues'] }); // Update issue status
      queryClient.invalidateQueries({ queryKey: ['books'] }); // Update book availability
      queryClient.invalidateQueries({ queryKey: ['library-members'] }); // Update member stats
    },
  });
};

export const useUpdateBookReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => bookReturnsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-returns'] });
      queryClient.invalidateQueries({ queryKey: ['book-return-detail'] });
    },
  });
};

export const useDeleteBookReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookReturnsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-returns'] });
      queryClient.invalidateQueries({ queryKey: ['book-issues'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-members'] });
    },
  });
};
