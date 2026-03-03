/**
 * Library Module API Service
 * All API calls for Library entities
 */

import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type { PaginatedResponse } from '../types/core.types';
import type {
    Book,
    BookCategory,
    BookCategoryCreateInput,
    BookCategoryFilters,
    BookCategoryUpdateInput,
    BookCreateInput,
    BookFilters,
    BookIssue,
    BookIssueCreateInput,
    BookIssueFilters,
    BookIssueUpdateInput,
    BookReturn,
    BookReturnCreateInput,
    BookReturnFilters,
    BookReturnUpdateInput,
    BookUpdateInput,
    Fine,
    FineCreateInput,
    FineFilters,
    FineUpdateInput,
    LibraryCard,
    LibraryCardCreateInput,
    LibraryCardFilters,
    LibraryCardUpdateInput,
    LibraryMember,
    LibraryMemberCreateInput,
    LibraryMemberFilters,
    LibraryMemberUpdateInput,
    Reservation,
    ReservationCreateInput,
    ReservationFilters,
    ReservationUpdateInput,
} from '../types/library.types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  const qs = queryParams.toString();
  return qs ? `?${qs}` : '';
};

const fetchApi = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('access_token');

  const headers = new Headers();
  const defaultHeaders = getDefaultHeaders();
  Object.entries(defaultHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  if (options?.headers) {
    const customHeaders = options.headers;
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => headers.set(key, value));
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => headers.set(key, value));
    } else {
      Object.entries(customHeaders as Record<string, string>).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: (typeof errorData.detail === 'string' ? errorData.detail : typeof errorData.message === 'string' ? errorData.message : typeof errorData.error === 'string' ? errorData.error : 'Request failed'),
      status: response.status,
      errors: errorData,
    };
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

// ============================================================================
// BOOK CATEGORIES API
// ============================================================================

export const bookCategoriesApi = {
  list: async (filters?: BookCategoryFilters): Promise<PaginatedResponse<BookCategory>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<BookCategory>>(
      buildApiUrl(`${API_ENDPOINTS.bookCategories.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<BookCategory> => {
    return fetchApi<BookCategory>(buildApiUrl(API_ENDPOINTS.bookCategories.detail(id)));
  },

  create: async (data: BookCategoryCreateInput): Promise<BookCategory> => {
    return fetchApi<BookCategory>(buildApiUrl(API_ENDPOINTS.bookCategories.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: BookCategoryUpdateInput): Promise<BookCategory> => {
    return fetchApi<BookCategory>(buildApiUrl(API_ENDPOINTS.bookCategories.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<BookCategoryUpdateInput>): Promise<BookCategory> => {
    return fetchApi<BookCategory>(buildApiUrl(API_ENDPOINTS.bookCategories.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.bookCategories.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// BOOKS API
// ============================================================================

export const booksApi = {
  list: async (filters?: BookFilters): Promise<PaginatedResponse<Book>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<Book>>(
      buildApiUrl(`${API_ENDPOINTS.books.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<Book> => {
    return fetchApi<Book>(buildApiUrl(API_ENDPOINTS.books.detail(id)));
  },

  create: async (data: BookCreateInput): Promise<Book> => {
    return fetchApi<Book>(buildApiUrl(API_ENDPOINTS.books.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: BookUpdateInput): Promise<Book> => {
    return fetchApi<Book>(buildApiUrl(API_ENDPOINTS.books.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<BookUpdateInput>): Promise<Book> => {
    return fetchApi<Book>(buildApiUrl(API_ENDPOINTS.books.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.books.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// LIBRARY MEMBERS API
// ============================================================================

export const libraryMembersApi = {
  list: async (filters?: LibraryMemberFilters): Promise<PaginatedResponse<LibraryMember>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<LibraryMember>>(
      buildApiUrl(`${API_ENDPOINTS.libraryMembers.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<LibraryMember> => {
    return fetchApi<LibraryMember>(buildApiUrl(API_ENDPOINTS.libraryMembers.detail(id)));
  },

  create: async (data: LibraryMemberCreateInput): Promise<LibraryMember> => {
    return fetchApi<LibraryMember>(buildApiUrl(API_ENDPOINTS.libraryMembers.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: LibraryMemberUpdateInput): Promise<LibraryMember> => {
    return fetchApi<LibraryMember>(buildApiUrl(API_ENDPOINTS.libraryMembers.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<LibraryMemberUpdateInput>): Promise<LibraryMember> => {
    return fetchApi<LibraryMember>(buildApiUrl(API_ENDPOINTS.libraryMembers.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.libraryMembers.delete(id)), {
      method: 'DELETE',
    });
  },

  block: async (id: number, reason: string): Promise<LibraryMember> => {
    return fetchApi<LibraryMember>(buildApiUrl(API_ENDPOINTS.libraryMembers.block(id)), {
      method: 'POST',
      body: JSON.stringify({ block_reason: reason }),
    });
  },

  unblock: async (id: number): Promise<LibraryMember> => {
    return fetchApi<LibraryMember>(buildApiUrl(API_ENDPOINTS.libraryMembers.unblock(id)), {
      method: 'POST',
    });
  },
};

// ============================================================================
// LIBRARY CARDS API
// ============================================================================

export const libraryCardsApi = {
  list: async (filters?: LibraryCardFilters): Promise<PaginatedResponse<LibraryCard>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<LibraryCard>>(
      buildApiUrl(`${API_ENDPOINTS.libraryCards.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<LibraryCard> => {
    return fetchApi<LibraryCard>(buildApiUrl(API_ENDPOINTS.libraryCards.detail(id)));
  },

  create: async (data: LibraryCardCreateInput): Promise<LibraryCard> => {
    return fetchApi<LibraryCard>(buildApiUrl(API_ENDPOINTS.libraryCards.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: LibraryCardUpdateInput): Promise<LibraryCard> => {
    return fetchApi<LibraryCard>(buildApiUrl(API_ENDPOINTS.libraryCards.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<LibraryCardUpdateInput>): Promise<LibraryCard> => {
    return fetchApi<LibraryCard>(buildApiUrl(API_ENDPOINTS.libraryCards.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.libraryCards.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// BOOK ISSUES API
// ============================================================================

export const bookIssuesApi = {
  list: async (filters?: BookIssueFilters): Promise<PaginatedResponse<BookIssue>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<BookIssue>>(
      buildApiUrl(`${API_ENDPOINTS.bookIssues.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<BookIssue> => {
    return fetchApi<BookIssue>(buildApiUrl(API_ENDPOINTS.bookIssues.detail(id)));
  },

  create: async (data: BookIssueCreateInput): Promise<BookIssue> => {
    return fetchApi<BookIssue>(buildApiUrl(API_ENDPOINTS.bookIssues.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: BookIssueUpdateInput): Promise<BookIssue> => {
    return fetchApi<BookIssue>(buildApiUrl(API_ENDPOINTS.bookIssues.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<BookIssueUpdateInput>): Promise<BookIssue> => {
    return fetchApi<BookIssue>(buildApiUrl(API_ENDPOINTS.bookIssues.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.bookIssues.delete(id)), {
      method: 'DELETE',
    });
  },

  renew: async (id: number, new_due_date: string): Promise<BookIssue> => {
    return fetchApi<BookIssue>(buildApiUrl(API_ENDPOINTS.bookIssues.renew(id)), {
      method: 'POST',
      body: JSON.stringify({ new_due_date }),
    });
  },

  myIssues: async (filters?: BookIssueFilters): Promise<PaginatedResponse<BookIssue>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<BookIssue>>(
      buildApiUrl(`${API_ENDPOINTS.bookIssues.myIssues}${queryString}`)
    );
  },
};

// ============================================================================
// FINES API
// ============================================================================

export const finesApi = {
  list: async (filters?: FineFilters): Promise<PaginatedResponse<Fine>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<Fine>>(
      buildApiUrl(`${API_ENDPOINTS.fines.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<Fine> => {
    return fetchApi<Fine>(buildApiUrl(API_ENDPOINTS.fines.detail(id)));
  },

  create: async (data: FineCreateInput): Promise<Fine> => {
    return fetchApi<Fine>(buildApiUrl(API_ENDPOINTS.fines.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: FineUpdateInput): Promise<Fine> => {
    return fetchApi<Fine>(buildApiUrl(API_ENDPOINTS.fines.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<FineUpdateInput>): Promise<Fine> => {
    return fetchApi<Fine>(buildApiUrl(API_ENDPOINTS.fines.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.fines.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// RESERVATIONS API
// ============================================================================

export const reservationsApi = {
  list: async (filters?: ReservationFilters): Promise<PaginatedResponse<Reservation>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<Reservation>>(
      buildApiUrl(`${API_ENDPOINTS.reservations.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<Reservation> => {
    return fetchApi<Reservation>(buildApiUrl(API_ENDPOINTS.reservations.detail(id)));
  },

  create: async (data: ReservationCreateInput): Promise<Reservation> => {
    return fetchApi<Reservation>(buildApiUrl(API_ENDPOINTS.reservations.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: ReservationUpdateInput): Promise<Reservation> => {
    return fetchApi<Reservation>(buildApiUrl(API_ENDPOINTS.reservations.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<ReservationUpdateInput>): Promise<Reservation> => {
    return fetchApi<Reservation>(buildApiUrl(API_ENDPOINTS.reservations.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.reservations.delete(id)), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// BOOK RETURNS API
// ============================================================================

export const bookReturnsApi = {
  list: async (filters?: BookReturnFilters): Promise<PaginatedResponse<BookReturn>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<BookReturn>>(
      buildApiUrl(`${API_ENDPOINTS.bookReturns.list}${queryString}`)
    );
  },

  get: async (id: number): Promise<BookReturn> => {
    return fetchApi<BookReturn>(buildApiUrl(API_ENDPOINTS.bookReturns.detail(id)));
  },

  create: async (data: BookReturnCreateInput): Promise<BookReturn> => {
    return fetchApi<BookReturn>(buildApiUrl(API_ENDPOINTS.bookReturns.create), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: BookReturnUpdateInput): Promise<BookReturn> => {
    return fetchApi<BookReturn>(buildApiUrl(API_ENDPOINTS.bookReturns.update(id)), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<BookReturnUpdateInput>): Promise<BookReturn> => {
    return fetchApi<BookReturn>(buildApiUrl(API_ENDPOINTS.bookReturns.patch(id)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.bookReturns.delete(id)), {
      method: 'DELETE',
    });
  },
};
