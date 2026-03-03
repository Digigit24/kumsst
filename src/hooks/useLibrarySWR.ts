/**
 * SWR-based Hooks for Library Module
 * Cached, auto-revalidating hooks optimized for dropdown performance
 */

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
import type {
  Book,
  BookCategory,
  BookCategoryFilters,
  BookFilters,
  BookIssue,
  BookIssueFilters,
  BookReturn,
  BookReturnFilters,
  Fine,
  FineFilters,
  LibraryCard,
  LibraryCardFilters,
  LibraryMember,
  LibraryMemberFilters,
  Reservation,
  ReservationFilters,
} from '../types/library.types';
import {
  dropdownSwrConfig,
  staticDataSwrConfig,
  generateCacheKey,
  invalidateCache,
  useSWRPaginated,
  UseSWRPaginatedResult,
} from './useSWR';

// ============================================================================
// SWR CACHE KEY CONSTANTS
// ============================================================================

const librarySwrKeys = {
  bookCategories: 'book-categories',
  books: 'books',
  libraryMembers: 'library-members',
  libraryCards: 'library-cards',
  bookIssues: 'book-issues',
  bookReturns: 'book-returns',
  fines: 'library-fines',
  reservations: 'reservations',
} as const;

// ============================================================================
// BOOK CATEGORIES HOOKS
// ============================================================================

export const useBookCategoriesSWR = (
  filters?: BookCategoryFilters | null
): UseSWRPaginatedResult<BookCategory> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(librarySwrKeys.bookCategories, filters),
    () => bookCategoriesApi.list(filters ?? undefined),
    staticDataSwrConfig
  );
};

export const invalidateBookCategories = () => invalidateCache(librarySwrKeys.bookCategories);

// ============================================================================
// BOOKS HOOKS
// ============================================================================

export const useBooksSWR = (
  filters?: BookFilters | null
): UseSWRPaginatedResult<Book> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(librarySwrKeys.books, filters),
    () => booksApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateBooks = () => invalidateCache(librarySwrKeys.books);

// ============================================================================
// LIBRARY MEMBERS HOOKS
// ============================================================================

export const useLibraryMembersSWR = (
  filters?: LibraryMemberFilters | null
): UseSWRPaginatedResult<LibraryMember> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(librarySwrKeys.libraryMembers, filters),
    () => libraryMembersApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateLibraryMembers = () => invalidateCache(librarySwrKeys.libraryMembers);

// ============================================================================
// LIBRARY CARDS HOOKS
// ============================================================================

export const useLibraryCardsSWR = (
  filters?: LibraryCardFilters | null
): UseSWRPaginatedResult<LibraryCard> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(librarySwrKeys.libraryCards, filters),
    () => libraryCardsApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateLibraryCards = () => invalidateCache(librarySwrKeys.libraryCards);

// ============================================================================
// BOOK ISSUES HOOKS
// ============================================================================

export const useBookIssuesSWR = (
  filters?: BookIssueFilters | null
): UseSWRPaginatedResult<BookIssue> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(librarySwrKeys.bookIssues, filters),
    () => bookIssuesApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateBookIssues = () => invalidateCache(librarySwrKeys.bookIssues);

// ============================================================================
// BOOK RETURNS HOOKS
// ============================================================================

export const useBookReturnsSWR = (
  filters?: BookReturnFilters | null
): UseSWRPaginatedResult<BookReturn> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(librarySwrKeys.bookReturns, filters),
    () => bookReturnsApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateBookReturns = () => invalidateCache(librarySwrKeys.bookReturns);

// ============================================================================
// FINES HOOKS
// ============================================================================

export const useLibraryFinesSWR = (
  filters?: FineFilters | null
): UseSWRPaginatedResult<Fine> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(librarySwrKeys.fines, filters),
    () => finesApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateLibraryFines = () => invalidateCache(librarySwrKeys.fines);

// ============================================================================
// RESERVATIONS HOOKS
// ============================================================================

export const useReservationsSWR = (
  filters?: ReservationFilters | null
): UseSWRPaginatedResult<Reservation> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(librarySwrKeys.reservations, filters),
    () => reservationsApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateReservations = () => invalidateCache(librarySwrKeys.reservations);

// ============================================================================
// CONVENIENCE: INVALIDATE ALL LIBRARY DATA
// ============================================================================

export const invalidateAllLibrary = async () => {
  await Promise.all([
    invalidateBookCategories(),
    invalidateBooks(),
    invalidateLibraryMembers(),
    invalidateLibraryCards(),
    invalidateBookIssues(),
    invalidateBookReturns(),
    invalidateLibraryFines(),
    invalidateReservations(),
  ]);
};
