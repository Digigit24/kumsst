/**
 * SWR-based Hooks for Hostel Module
 * Cached, auto-revalidating hooks optimized for dropdown performance
 */

import {
  hostelAllocationsApi,
  hostelBedsApi,
  hostelFeesApi,
  hostelsApi,
  roomsApi,
  roomTypesApi,
} from '../services/hostel.service';
import type {
  Hostel,
  HostelAllocation,
  HostelAllocationFilters,
  HostelBed,
  HostelBedFilters,
  HostelFee,
  HostelFeeFilters,
  HostelFilters,
  Room,
  RoomFilters,
  RoomType,
  RoomTypeFilters,
} from '../types/hostel.types';
import {
  dropdownSwrConfig,
  generateCacheKey,
  invalidateCache,
  useSWRPaginated,
  UseSWRPaginatedResult,
} from './useSWR';

// ============================================================================
// SWR CACHE KEY CONSTANTS
// ============================================================================

const hostelSwrKeys = {
  hostels: 'hostels',
  roomTypes: 'room-types',
  rooms: 'rooms',
  hostelAllocations: 'hostel-allocations',
  hostelBeds: 'hostel-beds',
  hostelFees: 'hostel-fees',
} as const;

// ============================================================================
// HOSTELS HOOKS
// ============================================================================

export const useHostelsSWR = (
  filters?: HostelFilters
): UseSWRPaginatedResult<Hostel> => {
  return useSWRPaginated(
    generateCacheKey(hostelSwrKeys.hostels, filters),
    () => hostelsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateHostels = () => invalidateCache(hostelSwrKeys.hostels);

// ============================================================================
// ROOM TYPES HOOKS
// ============================================================================

export const useRoomTypesSWR = (
  filters?: RoomTypeFilters
): UseSWRPaginatedResult<RoomType> => {
  return useSWRPaginated(
    generateCacheKey(hostelSwrKeys.roomTypes, filters),
    () => roomTypesApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateRoomTypes = () => invalidateCache(hostelSwrKeys.roomTypes);

// ============================================================================
// ROOMS HOOKS
// ============================================================================

export const useRoomsSWR = (
  filters?: RoomFilters
): UseSWRPaginatedResult<Room> => {
  return useSWRPaginated(
    generateCacheKey(hostelSwrKeys.rooms, filters),
    () => roomsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateRooms = () => invalidateCache(hostelSwrKeys.rooms);

// ============================================================================
// HOSTEL ALLOCATIONS HOOKS
// ============================================================================

export const useHostelAllocationsSWR = (
  filters?: HostelAllocationFilters
): UseSWRPaginatedResult<HostelAllocation> => {
  return useSWRPaginated(
    generateCacheKey(hostelSwrKeys.hostelAllocations, filters),
    () => hostelAllocationsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateHostelAllocations = () => invalidateCache(hostelSwrKeys.hostelAllocations);

// ============================================================================
// HOSTEL BEDS HOOKS
// ============================================================================

export const useHostelBedsSWR = (
  filters?: HostelBedFilters
): UseSWRPaginatedResult<HostelBed> => {
  return useSWRPaginated(
    generateCacheKey(hostelSwrKeys.hostelBeds, filters),
    () => hostelBedsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateHostelBeds = () => invalidateCache(hostelSwrKeys.hostelBeds);

// ============================================================================
// HOSTEL FEES HOOKS
// ============================================================================

export const useHostelFeesSWR = (
  filters?: HostelFeeFilters
): UseSWRPaginatedResult<HostelFee> => {
  return useSWRPaginated(
    generateCacheKey(hostelSwrKeys.hostelFees, filters),
    () => hostelFeesApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateHostelFees = () => invalidateCache(hostelSwrKeys.hostelFees);

// ============================================================================
// CONVENIENCE: INVALIDATE ALL HOSTEL DATA
// ============================================================================

export const invalidateAllHostel = async () => {
  await Promise.all([
    invalidateHostels(),
    invalidateRoomTypes(),
    invalidateRooms(),
    invalidateHostelAllocations(),
    invalidateHostelBeds(),
    invalidateHostelFees(),
  ]);
};
