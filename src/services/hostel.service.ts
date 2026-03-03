/**
 * Hostel Module API Service
 * All API calls for Hostel entities
 */

import { buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type { PaginatedResponse } from '../types/core.types';
import type {
  Hostel,
  HostelCreateInput,
  HostelUpdateInput,
  HostelFilters,
  RoomType,
  RoomTypeCreateInput,
  RoomTypeUpdateInput,
  RoomTypeFilters,
  Room,
  RoomCreateInput,
  RoomUpdateInput,
  RoomFilters,
  HostelAllocation,
  HostelAllocationCreateInput,
  HostelAllocationUpdateInput,
  HostelAllocationFilters,
  HostelBed,
  HostelBedCreateInput,
  HostelBedUpdateInput,
  HostelBedFilters,
  HostelFee,
  HostelFeeCreateInput,
  HostelFeeUpdateInput,
  HostelFeeFilters,
  HostelDashboardStats,
  HostelStatItem,
} from '../types/hostel.types';

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
// HOSTELS API
// ============================================================================

export const hostelsApi = {
  list: async (filters?: HostelFilters): Promise<PaginatedResponse<Hostel>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<Hostel>>(
      buildApiUrl(`/api/v1/hostel/hostels/${queryString}`)
    );
  },

  getStats: async (): Promise<HostelDashboardStats> => {
    return fetchApi<HostelDashboardStats>(buildApiUrl('/api/v1/hostel/hostels/stats/'));
  },

  get: async (id: number): Promise<Hostel> => {
    return fetchApi<Hostel>(buildApiUrl(`/api/v1/hostel/hostels/${id}/`));
  },

  create: async (data: HostelCreateInput): Promise<Hostel> => {
    return fetchApi<Hostel>(buildApiUrl('/api/v1/hostel/hostels/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: HostelUpdateInput): Promise<Hostel> => {
    return fetchApi<Hostel>(buildApiUrl(`/api/v1/hostel/hostels/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<HostelUpdateInput>): Promise<Hostel> => {
    return fetchApi<Hostel>(buildApiUrl(`/api/v1/hostel/hostels/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hostel/hostels/${id}/`), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// ROOM TYPES API
// ============================================================================

export const roomTypesApi = {
  list: async (filters?: RoomTypeFilters): Promise<PaginatedResponse<RoomType>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<RoomType>>(
      buildApiUrl(`/api/v1/hostel/room-types/${queryString}`)
    );
  },

  get: async (id: number): Promise<RoomType> => {
    return fetchApi<RoomType>(buildApiUrl(`/api/v1/hostel/room-types/${id}/`));
  },

  create: async (data: RoomTypeCreateInput): Promise<RoomType> => {
    return fetchApi<RoomType>(buildApiUrl('/api/v1/hostel/room-types/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: RoomTypeUpdateInput): Promise<RoomType> => {
    return fetchApi<RoomType>(buildApiUrl(`/api/v1/hostel/room-types/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<RoomTypeUpdateInput>): Promise<RoomType> => {
    return fetchApi<RoomType>(buildApiUrl(`/api/v1/hostel/room-types/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hostel/room-types/${id}/`), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// ROOMS API
// ============================================================================

export const roomsApi = {
  list: async (filters?: RoomFilters): Promise<PaginatedResponse<Room>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<Room>>(
      buildApiUrl(`/api/v1/hostel/rooms/${queryString}`)
    );
  },

  get: async (id: number): Promise<Room> => {
    return fetchApi<Room>(buildApiUrl(`/api/v1/hostel/rooms/${id}/`));
  },

  create: async (data: RoomCreateInput): Promise<Room> => {
    return fetchApi<Room>(buildApiUrl('/api/v1/hostel/rooms/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: RoomUpdateInput): Promise<Room> => {
    return fetchApi<Room>(buildApiUrl(`/api/v1/hostel/rooms/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<RoomUpdateInput>): Promise<Room> => {
    return fetchApi<Room>(buildApiUrl(`/api/v1/hostel/rooms/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hostel/rooms/${id}/`), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// HOSTEL ALLOCATIONS API
// ============================================================================

export const hostelAllocationsApi = {
  list: async (filters?: HostelAllocationFilters): Promise<PaginatedResponse<HostelAllocation>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<HostelAllocation>>(
      buildApiUrl(`/api/v1/hostel/allocations/${queryString}`)
    );
  },

  get: async (id: number): Promise<HostelAllocation> => {
    return fetchApi<HostelAllocation>(buildApiUrl(`/api/v1/hostel/allocations/${id}/`));
  },

  create: async (data: HostelAllocationCreateInput): Promise<HostelAllocation> => {
    return fetchApi<HostelAllocation>(buildApiUrl('/api/v1/hostel/allocations/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: HostelAllocationUpdateInput): Promise<HostelAllocation> => {
    return fetchApi<HostelAllocation>(buildApiUrl(`/api/v1/hostel/allocations/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<HostelAllocationUpdateInput>): Promise<HostelAllocation> => {
    return fetchApi<HostelAllocation>(buildApiUrl(`/api/v1/hostel/allocations/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hostel/allocations/${id}/`), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// HOSTEL BEDS API
// ============================================================================

export const hostelBedsApi = {
  list: async (filters?: HostelBedFilters): Promise<PaginatedResponse<HostelBed>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<HostelBed>>(
      buildApiUrl(`/api/v1/hostel/beds/${queryString}`)
    );
  },

  get: async (id: number): Promise<HostelBed> => {
    return fetchApi<HostelBed>(buildApiUrl(`/api/v1/hostel/beds/${id}/`));
  },

  create: async (data: HostelBedCreateInput): Promise<HostelBed> => {
    return fetchApi<HostelBed>(buildApiUrl('/api/v1/hostel/beds/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: HostelBedUpdateInput): Promise<HostelBed> => {
    return fetchApi<HostelBed>(buildApiUrl(`/api/v1/hostel/beds/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<HostelBedUpdateInput>): Promise<HostelBed> => {
    return fetchApi<HostelBed>(buildApiUrl(`/api/v1/hostel/beds/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hostel/beds/${id}/`), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// HOSTEL FEES API
// ============================================================================

export const hostelFeesApi = {
  list: async (filters?: HostelFeeFilters): Promise<PaginatedResponse<HostelFee>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<HostelFee>>(
      buildApiUrl(`/api/v1/hostel/fees/${queryString}`)
    );
  },

  get: async (id: number): Promise<HostelFee> => {
    return fetchApi<HostelFee>(buildApiUrl(`/api/v1/hostel/fees/${id}/`));
  },

  create: async (data: HostelFeeCreateInput): Promise<HostelFee> => {
    return fetchApi<HostelFee>(buildApiUrl('/api/v1/hostel/fees/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: HostelFeeUpdateInput): Promise<HostelFee> => {
    return fetchApi<HostelFee>(buildApiUrl(`/api/v1/hostel/fees/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<HostelFeeUpdateInput>): Promise<HostelFee> => {
    return fetchApi<HostelFee>(buildApiUrl(`/api/v1/hostel/fees/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hostel/fees/${id}/`), {
      method: 'DELETE',
    });
  },
};
