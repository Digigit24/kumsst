/**
 * SWR-based Hooks for Construction Module
 * Cached, auto-revalidating hooks for projects, reports, photos, milestones, expenses, material requests
 */
import type { ExpandedLabourLog } from "../api/constructionService";
import {
    constructionExpensesApi,
    constructionPhotosApi,
    constructionProjectsApi,
    dailyReportsApi,
    getColleges,
    getLabourLogs,
    materialRequestsApi,
    milestonesApi,
} from "../api/constructionService";
import type {
    ConstructionDashboard,
    ConstructionExpense,
    ConstructionExpenseFilters,
    ConstructionPhoto,
    ConstructionPhotoFilters,
    ConstructionProject,
    ConstructionProjectFilters,
    DailyReport,
    DailyReportFilters,
    MaterialRequest,
    MaterialRequestFilters,
    Milestone,
    MilestoneFilters,
} from "../types/construction.types";
import type { College } from "../types/core.types";
import {
    dropdownSwrConfig,
    generateCacheKey,
    invalidateCache,
    invalidateCaches,
    staticDataSwrConfig,
    useSWRAPI,
    useSWRPaginated,
    UseSWRPaginatedResult,
    UseSWRResult,
} from "./useSWR";

// ============================================================================
// CACHE KEY CONSTANTS
// ============================================================================

const constructionSwrKeys = {
  projects: "construction-projects",
  dashboard: "construction-dashboard",
  dailyReports: "construction-daily-reports",
  photos: "construction-photos",
  geofenceViolations: "construction-geofence-violations",
  milestones: "construction-milestones",
  expenses: "construction-expenses",
  materialRequests: "construction-material-requests",
  labourLogs: "construction-labour-logs",
  colleges: "construction-colleges",
} as const;

// ============================================================================
// PROJECT HOOKS
// ============================================================================

export const useProjectsSWR = (
  filters?: ConstructionProjectFilters | null
): UseSWRPaginatedResult<ConstructionProject> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(constructionSwrKeys.projects, filters),
    () => constructionProjectsApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const useProjectSWR = (
  id?: number | null
): UseSWRResult<ConstructionProject> => {
  return useSWRAPI(
    id ? `${constructionSwrKeys.projects}-${id}` : null,
    () => constructionProjectsApi.get(id!),
    dropdownSwrConfig
  );
};

export const invalidateProjects = () => invalidateCache(constructionSwrKeys.projects);

// ============================================================================
// DASHBOARD HOOK
// ============================================================================

export const useDashboardSWR = (): UseSWRResult<ConstructionDashboard> => {
  return useSWRAPI(
    constructionSwrKeys.dashboard,
    () => constructionProjectsApi.dashboard(),
    staticDataSwrConfig
  );
};

export const invalidateDashboard = () => invalidateCache(constructionSwrKeys.dashboard);

// ============================================================================
// DAILY REPORT HOOKS
// ============================================================================

export const useDailyReportsSWR = (
  filters?: DailyReportFilters | null
): UseSWRPaginatedResult<DailyReport> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(constructionSwrKeys.dailyReports, filters),
    () => dailyReportsApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateDailyReports = () => invalidateCache(constructionSwrKeys.dailyReports);

// ============================================================================
// PHOTO HOOKS
// ============================================================================

export const usePhotosSWR = (
  filters?: ConstructionPhotoFilters | null
): UseSWRPaginatedResult<ConstructionPhoto> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(constructionSwrKeys.photos, filters),
    () => constructionPhotosApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidatePhotos = () => invalidateCache(constructionSwrKeys.photos);

// ============================================================================
// GEOFENCE VIOLATIONS HOOK
// ============================================================================

export const useGeofenceViolationsSWR = (
  filters?: ConstructionPhotoFilters | null
): UseSWRPaginatedResult<ConstructionPhoto> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(constructionSwrKeys.geofenceViolations, filters),
    () => constructionPhotosApi.geofenceViolations(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateGeofenceViolations = () => invalidateCache(constructionSwrKeys.geofenceViolations);

// ============================================================================
// MILESTONE HOOKS
// ============================================================================

export const useMilestonesSWR = (
  filters?: MilestoneFilters | null
): UseSWRPaginatedResult<Milestone> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(constructionSwrKeys.milestones, filters),
    () => milestonesApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateMilestones = () => invalidateCache(constructionSwrKeys.milestones);

// ============================================================================
// EXPENSE HOOKS
// ============================================================================

export const useExpensesSWR = (
  filters?: ConstructionExpenseFilters | null
): UseSWRPaginatedResult<ConstructionExpense> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(constructionSwrKeys.expenses, filters),
    () => constructionExpensesApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateExpenses = () => invalidateCache(constructionSwrKeys.expenses);

// ============================================================================
// MATERIAL REQUEST HOOKS
// ============================================================================

export const useMaterialRequestsSWR = (
  filters?: MaterialRequestFilters | null
): UseSWRPaginatedResult<MaterialRequest> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(constructionSwrKeys.materialRequests, filters),
    () => materialRequestsApi.list(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateMaterialRequests = () => invalidateCache(constructionSwrKeys.materialRequests);

// ============================================================================
// LABOUR LOG HOOKS
// ============================================================================

export const useLabourLogsSWR = (
  filters?: { project?: number; page?: number; page_size?: number } | null
): UseSWRPaginatedResult<ExpandedLabourLog> => {
  return useSWRPaginated(
    filters === null ? null : generateCacheKey(constructionSwrKeys.labourLogs, filters),
    () => getLabourLogs(filters ?? undefined),
    dropdownSwrConfig
  );
};

export const invalidateLabourLogs = () => invalidateCache(constructionSwrKeys.labourLogs);

// ============================================================================
// COLLEGES HOOK (for college selectors)
// ============================================================================

export const useCollegesSWR = (): UseSWRResult<College[]> => {
  return useSWRAPI(
    constructionSwrKeys.colleges,
    getColleges,
    staticDataSwrConfig
  );
};

export const invalidateColleges = () => invalidateCache(constructionSwrKeys.colleges);

// ============================================================================
// CONVENIENCE: INVALIDATE ALL CONSTRUCTION DATA
// ============================================================================

export const invalidateAllConstruction = async () => {
  await invalidateCaches([
    constructionSwrKeys.projects,
    constructionSwrKeys.dashboard,
    constructionSwrKeys.dailyReports,
    constructionSwrKeys.photos,
    constructionSwrKeys.geofenceViolations,
    constructionSwrKeys.milestones,
    constructionSwrKeys.expenses,
    constructionSwrKeys.materialRequests,
    constructionSwrKeys.labourLogs,
  ]);
};
