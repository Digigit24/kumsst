/**
 * Construction Module API Service (Consolidated)
 * Single source of truth for all construction API calls.
 * Uses apiClient (axios) with automatic auth headers & error normalization.
 */
import { API_ENDPOINTS } from "@/config/api.config";
import apiClient from "./apiClient";
import type {
  ConstructionProject,
  ConstructionProjectCreateInput,
  ConstructionProjectFilters,
  ConstructionProjectUpdateInput,
  ConstructionDashboard,
  DailyReport,
  DailyReportCreateInput,
  DailyReportUpdateInput,
  DailyReportFilters,
  ConstructionPhoto,
  ConstructionPhotoCreateInput,
  ConstructionPhotoFilters,
  Milestone,
  MilestoneCreateInput,
  MilestoneUpdateInput,
  MilestoneFilters,
  ConstructionExpense,
  ConstructionExpenseCreateInput,
  ConstructionExpenseUpdateInput,
  ConstructionExpenseFilters,
  MaterialRequest,
  MaterialRequestCreateInput,
  MaterialRequestUpdateInput,
  MaterialRequestFilters,
  LabourLog,
} from "@/types/construction.types";
import type { PaginatedResponse, College } from "@/types/core.types";

// ============================================================================
// PROJECTS API
// ============================================================================

export const constructionProjectsApi = {
  list: async (filters?: ConstructionProjectFilters): Promise<PaginatedResponse<ConstructionProject>> => {
    const r = await apiClient.get(API_ENDPOINTS.construction.projects.list, { params: filters });
    return r.data;
  },

  get: async (id: number): Promise<ConstructionProject> => {
    const r = await apiClient.get(API_ENDPOINTS.construction.projects.detail(id));
    return r.data;
  },

  create: async (data: ConstructionProjectCreateInput): Promise<ConstructionProject> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.projects.create, data);
    return r.data;
  },

  update: async (id: number, data: ConstructionProjectUpdateInput): Promise<ConstructionProject> => {
    const r = await apiClient.put(API_ENDPOINTS.construction.projects.update(id), data);
    return r.data;
  },

  patch: async (id: number, data: Partial<ConstructionProjectUpdateInput>): Promise<ConstructionProject> => {
    const r = await apiClient.patch(API_ENDPOINTS.construction.projects.patch(id), data);
    return r.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.construction.projects.delete(id));
  },

  dashboard: async (): Promise<ConstructionDashboard> => {
    const r = await apiClient.get(API_ENDPOINTS.construction.projects.dashboard);
    return r.data;
  },
};

// ============================================================================
// DAILY REPORTS API
// ============================================================================

export const dailyReportsApi = {
  list: async (filters?: DailyReportFilters): Promise<PaginatedResponse<DailyReport>> => {
    const r = await apiClient.get(API_ENDPOINTS.construction.dailyReports.list, { params: filters });
    return r.data;
  },

  get: async (id: number): Promise<DailyReport> => {
    const r = await apiClient.get(API_ENDPOINTS.construction.dailyReports.detail(id));
    return r.data;
  },

  create: async (data: DailyReportCreateInput): Promise<DailyReport> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.dailyReports.create, data);
    return r.data;
  },

  update: async (id: number, data: DailyReportUpdateInput): Promise<DailyReport> => {
    const r = await apiClient.put(API_ENDPOINTS.construction.dailyReports.update(id), data);
    return r.data;
  },

  patch: async (id: number, data: Partial<DailyReportUpdateInput>): Promise<DailyReport> => {
    const r = await apiClient.patch(API_ENDPOINTS.construction.dailyReports.patch(id), data);
    return r.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.construction.dailyReports.delete(id));
  },

  submit: async (id: number): Promise<DailyReport> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.dailyReports.submit(id));
    return r.data;
  },

  approve: async (id: number): Promise<DailyReport> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.dailyReports.approve(id));
    return r.data;
  },

  reject: async (id: number, reason?: string): Promise<DailyReport> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.dailyReports.reject(id), { rejection_reason: reason });
    return r.data;
  },

  requestRevision: async (id: number, remarks?: string): Promise<DailyReport> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.dailyReports.requestRevision(id), { ceo_remarks: remarks });
    return r.data;
  },
};

// ============================================================================
// PHOTOS API
// ============================================================================

export const constructionPhotosApi = {
  list: async (filters?: ConstructionPhotoFilters): Promise<PaginatedResponse<ConstructionPhoto>> => {
    const r = await apiClient.get(API_ENDPOINTS.construction.photos.list, { params: filters });
    return r.data;
  },

  get: async (id: number): Promise<ConstructionPhoto> => {
    const r = await apiClient.get(API_ENDPOINTS.construction.photos.detail(id));
    return r.data;
  },

  create: async (data: ConstructionPhotoCreateInput): Promise<ConstructionPhoto> => {
    const formData = new FormData();
    formData.append("project", String(data.project));
    if (data.college) formData.append("college", String(data.college));
    if (data.daily_report) formData.append("daily_report", String(data.daily_report));
    formData.append("photo", data.photo);
    if (data.photo_type) formData.append("photo_type", data.photo_type);
    if (data.caption) formData.append("caption", data.caption);
    if (data.latitude) formData.append("latitude", data.latitude);
    if (data.longitude) formData.append("longitude", data.longitude);
    if (data.altitude) formData.append("altitude", data.altitude);
    if (data.gps_accuracy_meters !== undefined && data.gps_accuracy_meters !== null) {
      formData.append("gps_accuracy_meters", String(data.gps_accuracy_meters));
    }
    if (data.captured_at) formData.append("captured_at", data.captured_at);
    if (data.device_info) formData.append("device_info", data.device_info);

    const r = await apiClient.post(API_ENDPOINTS.construction.photos.create, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return r.data;
  },

  /** Upload photo using pre-built FormData (for jr-engineer PhotoUpload page) */
  upload: async (formData: FormData): Promise<ConstructionPhoto> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.photos.create, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return r.data;
  },

  verify: async (id: number): Promise<ConstructionPhoto> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.photos.verify(id), { is_verified: true });
    return r.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.construction.photos.delete(id));
  },

  geofenceViolations: async (filters?: ConstructionPhotoFilters): Promise<PaginatedResponse<ConstructionPhoto>> => {
    const r = await apiClient.get(API_ENDPOINTS.construction.photos.geofenceViolations, { params: filters });
    const data = r.data;
    // Handle both direct array or paginated response
    if (Array.isArray(data)) {
      return { count: data.length, next: null, previous: null, results: data };
    }
    return data;
  },
};

// ============================================================================
// MILESTONES API
// ============================================================================

export const milestonesApi = {
  list: async (filters?: MilestoneFilters): Promise<PaginatedResponse<Milestone>> => {
    const r = await apiClient.get(API_ENDPOINTS.construction.milestones.list, { params: filters });
    return r.data;
  },

  get: async (id: number): Promise<Milestone> => {
    const r = await apiClient.get(API_ENDPOINTS.construction.milestones.detail(id));
    return r.data;
  },

  create: async (data: MilestoneCreateInput): Promise<Milestone> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.milestones.create, data);
    return r.data;
  },

  update: async (id: number, data: MilestoneUpdateInput): Promise<Milestone> => {
    const r = await apiClient.put(API_ENDPOINTS.construction.milestones.update(id), data);
    return r.data;
  },

  patch: async (id: number, data: Partial<MilestoneUpdateInput>): Promise<Milestone> => {
    const r = await apiClient.patch(API_ENDPOINTS.construction.milestones.patch(id), data);
    return r.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.construction.milestones.delete(id));
  },

  verify: async (id: number, ceo_remarks?: string): Promise<Milestone> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.milestones.verify(id), {
      verified_by_ceo: true,
      ...(ceo_remarks ? { ceo_remarks } : {}),
    });
    return r.data;
  },
};

// ============================================================================
// EXPENSES API
// ============================================================================

export const constructionExpensesApi = {
  list: async (filters?: ConstructionExpenseFilters): Promise<PaginatedResponse<ConstructionExpense>> => {
    const r = await apiClient.get(API_ENDPOINTS.construction.expenses.list, { params: filters });
    return r.data;
  },

  get: async (id: number): Promise<ConstructionExpense> => {
    const r = await apiClient.get(API_ENDPOINTS.construction.expenses.detail(id));
    return r.data;
  },

  create: async (data: ConstructionExpenseCreateInput): Promise<ConstructionExpense> => {
    if (data.receipt_photo instanceof File) {
      const formData = new FormData();
      if (data.college) formData.append("college", String(data.college));
      formData.append("project", String(data.project));
      formData.append("category", data.category);
      formData.append("description", data.description);
      formData.append("amount", String(data.amount));
      formData.append("expense_date", data.expense_date);
      formData.append("receipt_photo", data.receipt_photo);
      const r = await apiClient.post(API_ENDPOINTS.construction.expenses.create, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return r.data;
    }
    const r = await apiClient.post(API_ENDPOINTS.construction.expenses.create, data);
    return r.data;
  },

  update: async (id: number, data: ConstructionExpenseUpdateInput): Promise<ConstructionExpense> => {
    const r = await apiClient.put(API_ENDPOINTS.construction.expenses.update(id), data);
    return r.data;
  },

  patch: async (id: number, data: Partial<ConstructionExpenseUpdateInput>): Promise<ConstructionExpense> => {
    const r = await apiClient.patch(API_ENDPOINTS.construction.expenses.patch(id), data);
    return r.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.construction.expenses.delete(id));
  },

  approve: async (id: number): Promise<ConstructionExpense> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.expenses.approveExpense(id));
    return r.data;
  },

  reject: async (id: number): Promise<ConstructionExpense> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.expenses.rejectExpense(id));
    return r.data;
  },
};

// ============================================================================
// MATERIAL REQUESTS API
// ============================================================================

export const materialRequestsApi = {
  list: async (filters?: MaterialRequestFilters): Promise<PaginatedResponse<MaterialRequest>> => {
    const r = await apiClient.get(API_ENDPOINTS.construction.materialRequests.list, { params: filters });
    return r.data;
  },

  get: async (id: number): Promise<MaterialRequest> => {
    const r = await apiClient.get(API_ENDPOINTS.construction.materialRequests.detail(id));
    return r.data;
  },

  create: async (data: MaterialRequestCreateInput): Promise<MaterialRequest> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.materialRequests.create, data);
    return r.data;
  },

  update: async (id: number, data: MaterialRequestUpdateInput): Promise<MaterialRequest> => {
    const r = await apiClient.put(API_ENDPOINTS.construction.materialRequests.update(id), data);
    return r.data;
  },

  patch: async (id: number, data: Partial<MaterialRequestUpdateInput>): Promise<MaterialRequest> => {
    const r = await apiClient.patch(API_ENDPOINTS.construction.materialRequests.patch(id), data);
    return r.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.construction.materialRequests.delete(id));
  },

  submit: async (id: number): Promise<MaterialRequest> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.materialRequests.submit(id));
    return r.data;
  },

  ceoApprove: async (id: number): Promise<MaterialRequest> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.materialRequests.ceoApprove(id));
    return r.data;
  },

  ceoReject: async (id: number, rejection_reason?: string): Promise<MaterialRequest> => {
    const r = await apiClient.post(API_ENDPOINTS.construction.materialRequests.ceoReject(id), { rejection_reason });
    return r.data;
  },
};

// ============================================================================
// LABOUR LOGS (derived from daily reports)
// ============================================================================

export type ExpandedLabourLog = LabourLog & {
  daily_report: number;
  project: number;
  project_name?: string;
  date?: string;
};

export const getLabourLogs = async (
  filters?: { project?: number; page?: number; page_size?: number }
): Promise<PaginatedResponse<ExpandedLabourLog>> => {
  const r = await apiClient.get(API_ENDPOINTS.construction.dailyReports.list, {
    params: { ...filters, page_size: 100 },
  });
  const reports: DailyReport[] = r.data.results || r.data;
  const logs: ExpandedLabourLog[] = [];
  for (const report of reports) {
    if (report.labour_logs) {
      for (const log of report.labour_logs) {
        logs.push({
          ...log,
          daily_report: report.id,
          project: report.project,
          project_name: report.project_name,
          date: report.report_date,
        });
      }
    }
  }
  return { count: logs.length, next: null, previous: null, results: logs };
};

// ============================================================================
// COLLEGES (for college selector)
// ============================================================================

export const getColleges = async (): Promise<College[]> => {
  const r = await apiClient.get(API_ENDPOINTS.colleges.list);
  return r.data.results || r.data;
};
