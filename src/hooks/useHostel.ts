/**
 * Hostel Module React Query Hooks
 * Custom hooks for Hostel module data fetching and mutations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import {
  hostelAllocationsApi,
  hostelBedsApi,
  hostelFeesApi,
  hostelsApi,
  roomTypesApi,
  roomsApi,
} from '../services/hostel.service';

// ============================================================================
// HOSTELS
// ============================================================================

/**
 * Fetch hostels with optional filters
 */
export const useHostels = (filters?: any) => {
  return useQuery({
    queryKey: ['hostels', filters],
    queryFn: () => hostelsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new hostel
 */
export const useCreateHostel = () => {
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

      if (collegeId && !data.college) {
        submitData.college = parseInt(collegeId);
      }

      return hostelsApi.create(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
    },
  });
};

/**
 * Update a hostel
 */
export const useUpdateHostel = () => {
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

      return hostelsApi.update(id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
    },
  });
};

/**
 * Delete a hostel
 */
export const useDeleteHostel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hostelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
    },
  });
};

// ============================================================================
// ROOM TYPES
// ============================================================================

/**
 * Fetch room types with optional filters
 */
export const useRoomTypes = (filters?: any) => {
  return useQuery({
    queryKey: ['room-types', filters],
    queryFn: () => roomTypesApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new room type
 */
export const useCreateRoomType = () => {
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

      return roomTypesApi.create(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-types'] });
    },
  });
};

/**
 * Update a room type
 */
export const useUpdateRoomType = () => {
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

      return roomTypesApi.update(id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-types'] });
    },
  });
};

/**
 * Delete a room type
 */
export const useDeleteRoomType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roomTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-types'] });
    },
  });
};

// ============================================================================
// ROOMS
// ============================================================================

/**
 * Fetch rooms with optional filters
 */
export const useRooms = (filters?: any) => {
  return useQuery({
    queryKey: ['rooms', filters],
    queryFn: () => roomsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new room
 */
export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const userId = localStorage.getItem('kumss_user_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
        occupied_beds: data.occupied_beds ?? 0,
      };

      if (userId) {
        submitData.created_by = userId;
        submitData.updated_by = userId;
      }

      return roomsApi.create(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

/**
 * Update a room
 */
export const useUpdateRoom = () => {
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

      return roomsApi.update(id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

/**
 * Delete a room
 */
export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roomsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};

// ============================================================================
// HOSTEL ALLOCATIONS
// ============================================================================

/**
 * Fetch hostel allocations with optional filters
 */
export const useHostelAllocations = (filters?: any) => {
  return useQuery({
    queryKey: ['hostel-allocations', filters],
    queryFn: () => hostelAllocationsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new hostel allocation
 */
export const useCreateHostelAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const userId = localStorage.getItem('kumss_user_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
        is_current: data.is_current ?? true,
      };

      if (userId) {
        submitData.created_by = userId;
        submitData.updated_by = userId;
      }

      return hostelAllocationsApi.create(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-allocations'] });
    },
  });
};

/**
 * Update a hostel allocation
 */
export const useUpdateHostelAllocation = () => {
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

      return hostelAllocationsApi.update(id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-allocations'] });
    },
  });
};

/**
 * Delete a hostel allocation
 */
export const useDeleteHostelAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hostelAllocationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-allocations'] });
    },
  });
};

// ============================================================================
// HOSTEL BEDS
// ============================================================================

/**
 * Fetch hostel beds with optional filters
 */
export const useHostelBeds = (filters?: any) => {
  return useQuery({
    queryKey: ['hostel-beds', filters],
    queryFn: () => hostelBedsApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new hostel bed
 */
export const useCreateHostelBed = () => {
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

      return hostelBedsApi.create(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-beds'] });
    },
  });
};

/**
 * Update a hostel bed
 */
export const useUpdateHostelBed = () => {
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

      return hostelBedsApi.update(id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-beds'] });
    },
  });
};

/**
 * Delete a hostel bed
 */
export const useDeleteHostelBed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hostelBedsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-beds'] });
    },
  });
};

// ============================================================================
// HOSTEL FEES
// ============================================================================

/**
 * Fetch hostel fees with optional filters
 */
export const useHostelFees = (filters?: any) => {
  return useQuery({
    queryKey: ['hostel-fees', filters],
    queryFn: () => hostelFeesApi.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new hostel fee
 */
export const useCreateHostelFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const userId = localStorage.getItem('kumss_user_id');

      const submitData: any = {
        ...data,
        is_active: data.is_active ?? true,
        is_paid: data.is_paid ?? false,
      };

      if (userId) {
        submitData.created_by = userId;
        submitData.updated_by = userId;
      }

      return hostelFeesApi.create(submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-fees'] });
    },
  });
};

/**
 * Update a hostel fee
 */
export const useUpdateHostelFee = () => {
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

      return hostelFeesApi.update(id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-fees'] });
    },
  });
};

/**
 * Delete a hostel fee
 */
export const useDeleteHostelFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hostelFeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-fees'] });
    },
  });
};

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

/**
 * Fetch hostel statistics for dashboard
 */
export const useHostelStats = () => {
  return useQuery({
    queryKey: ['hostel-stats-debug'],
    queryFn: () => hostelsApi.getStats(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch detailed hostel stats for dashboard cards
 */
export const useHostelDashboardStats = () => {
  return useQuery({
    queryKey: ['hostel-dashboard-stats'],
    queryFn: () => hostelsApi.getStats(),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Fetch pending allocations (for quick actions badge)
 * Note: This assumes pending allocations can be filtered by is_current=false
 * Adjust the filter logic based on your actual backend implementation
 */
export const usePendingAllocations = () => {
  return useQuery({
    queryKey: ['pending-allocations'],
    queryFn: () => hostelAllocationsApi.list({
      page_size: DROPDOWN_PAGE_SIZE,
      is_active: true,
      is_current: false // Pending allocations are not yet current
    }),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

