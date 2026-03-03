/**
 * TypeScript type definitions for Construction module
 * Based on SOP: Construction Head / Jr Engineer flow
 */

// ============================================================================
// CONSTRUCTION PROJECT TYPES
// ============================================================================

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ConstructionProject {
  id: number;
  college: number | null;
  college_name?: string;
  project_name: string;
  description: string | null;
  location_address: string | null;
  site_latitude: string | null;
  site_longitude: string | null;
  site_radius_meters: number | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string;
  expected_end_date: string | null;
  actual_end_date: string | null;
  estimated_budget: string | null;
  spent: number | null;
  project_head: string | null; // UUID
  project_head_name?: string;
  assigned_engineers: string[]; // UUIDs
  assigned_engineer_names?: string[];
  progress_percentage: number;
  is_active: boolean;
  created_by: string | null;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ConstructionProjectCreateInput {
  college?: number;
  project_name: string;
  description?: string;
  location_address?: string;
  site_latitude?: string;
  site_longitude?: string;
  site_radius_meters?: number;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  start_date: string;
  expected_end_date?: string;
  estimated_budget?: string;
  project_head?: string;
  assigned_engineers?: string[];
}

export interface ConstructionProjectUpdateInput extends Partial<ConstructionProjectCreateInput> {}

export interface ConstructionProjectFilters {
  page?: number;
  page_size?: number;
  status?: string;
  priority?: string;
  search?: string;
  ordering?: string;
}

export interface ConstructionDashboard {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  on_hold_projects: number;
  total_budget: number;
  total_spent: number;
  pending_reports: number;
  geofence_violations: number;
  recent_projects: ConstructionProject[];
}

// ============================================================================
// DAILY REPORT TYPES
// ============================================================================

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'stormy';
export type DailyReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'revision_requested';
export type LabourCategory = 'mason' | 'carpenter' | 'electrician' | 'plumber' | 'painter' | 'welder' | 'helper' | 'supervisor' | 'other';

export interface LabourLog {
  id?: number;
  labour_category: LabourCategory;
  count: number;
  hours_worked: string;
  wage_per_day: string;
  contractor_name?: string;
  remarks?: string;
}

export interface DailyReport {
  id: number;
  college: number | null;
  project: number;
  project_name?: string;
  report_date: string;
  reported_by: string | null;
  reported_by_name?: string;
  weather: WeatherType | null;
  work_summary: string;
  labour_count_skilled: number | null;
  labour_count_unskilled: number | null;
  materials_used_summary: string | null;
  issues_or_delays: string | null;
  status: DailyReportStatus;
  submitted_at: string | null;
  rejection_reason: string | null;
  ceo_remarks: string | null;
  is_active: boolean;
  labour_logs: LabourLog[];
  created_by: string | null;
  created_by_name?: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyReportCreateInput {
  college?: number;
  project: number;
  report_date: string;
  weather?: WeatherType;
  work_summary: string;
  labour_count_skilled?: number;
  labour_count_unskilled?: number;
  materials_used_summary?: string;
  issues_or_delays?: string;
  labour_logs?: Omit<LabourLog, 'id'>[];
}

export interface DailyReportUpdateInput extends Partial<DailyReportCreateInput> {}

export interface DailyReportFilters {
  page?: number;
  page_size?: number;
  project?: number;
  status?: string;
  report_date?: string;
  submitted_by?: string;
  search?: string;
  ordering?: string;
}

// ============================================================================
// PHOTO TYPES
// ============================================================================

export type PhotoType = 'site_overview' | 'progress' | 'issue' | 'material' | 'other';

export interface ConstructionPhoto {
  id: number;
  college?: number | null;
  daily_report?: number | null;
  project?: number;
  project_name?: string;
  photo: string;
  photo_type: PhotoType;
  caption: string | null;
  latitude: string | null;
  longitude: string | null;
  altitude?: string | null;
  gps_accuracy_meters?: number | null;
  distance_from_site_meters?: number | string | null;
  captured_at: string | null;
  device_info?: string | null;
  is_geofence_violation?: boolean;
  is_within_geofence?: boolean;
  uploaded_by: string | null;
  uploaded_by_name?: string;
  is_verified: boolean;
  created_at: string;
}


export interface ConstructionPhotoCreateInput {
  college?: number;
  daily_report?: number;
  project: number;
  photo: string | File;
  photo_type?: PhotoType;
  caption?: string;
  latitude?: string;
  longitude?: string;
  altitude?: string;
  gps_accuracy_meters?: number;
  captured_at?: string;
  device_info?: string;
}

export interface ConstructionPhotoFilters {
  page?: number;
  page_size?: number;
  project?: number;
  daily_report?: number;
  is_geofence_violation?: boolean;
  search?: string;
  ordering?: string;
}

// ============================================================================
// MILESTONE TYPES
// ============================================================================

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export interface Milestone {
  id: number;
  college: number | null;
  project: number;
  project_name?: string;
  milestone_name: string;
  description: string | null;
  expected_date: string | null;
  actual_completion_date: string | null;
  status: MilestoneStatus;
  completion_percentage: number;
  estimated_cost: string | null;
  actual_cost: string | null;
  verified_by_ceo: boolean;
  ceo_remarks: string | null;
  verification_date: string | null;
  is_active: boolean;
  created_by: string | null;
  created_by_name?: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MilestoneCreateInput {
  college?: number;
  project: number;
  milestone_name: string;
  description?: string;
  expected_date?: string;
  actual_completion_date?: string;
  status?: MilestoneStatus;
  completion_percentage?: number;
  estimated_cost?: string | number;
  actual_cost?: string | number;
}

export interface MilestoneUpdateInput extends Partial<MilestoneCreateInput> {}

export interface MilestoneFilters {
  page?: number;
  page_size?: number;
  project?: number;
  status?: string;
  verified_by_ceo?: boolean;
  search?: string;
  ordering?: string;
}

// ============================================================================
// EXPENSE TYPES
// ============================================================================

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';
export type ExpenseCategory = 'labour' | 'materials' | 'equipment' | 'logistics' | 'other';

export interface ConstructionExpense {
  id: number;
  college: number | null;
  project: number;
  project_name?: string;
  expense_date: string;
  category: ExpenseCategory;
  description: string;
  amount: string | number;
  receipt_photo: string | null;
  status: ExpenseStatus;
  recorded_by: string | null;
  recorded_by_name?: string;
  approved_by: string | null;
  approved_by_name?: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConstructionExpenseCreateInput {
  college?: number;
  project: number;
  expense_date: string;
  category: ExpenseCategory;
  description: string;
  amount: string | number;
  receipt_photo?: File | string | null;
}

export interface ConstructionExpenseUpdateInput extends Partial<ConstructionExpenseCreateInput> {}

export interface ConstructionExpenseFilters {
  page?: number;
  page_size?: number;
  project?: number;
  category?: string;
  search?: string;
  ordering?: string;
}

// ============================================================================
// MATERIAL REQUEST TYPES
// ============================================================================

export type MaterialRequestStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type MaterialRequestPriority = 'low' | 'medium' | 'high' | 'critical';

export interface MaterialRequestItem {
  id?: number;
  item_name: string;
  description?: string | null;
  quantity: string | number;
  unit: string;
  estimated_cost?: string | number | null;
  store_item?: number | null;
}

export interface MaterialRequest {
  id: number;
  college: number | null;
  project: number;
  project_name?: string;
  status: MaterialRequestStatus;
  priority: MaterialRequestPriority;
  justification: string;
  rejection_reason: string | null;
  items: MaterialRequestItem[];
  requested_by: string | null;
  requested_by_name?: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaterialRequestCreateInput {
  college?: number;
  project: number;
  priority: MaterialRequestPriority;
  justification: string;
  items: MaterialRequestItem[];
}

export interface MaterialRequestUpdateInput extends Partial<MaterialRequestCreateInput> {}

export interface MaterialRequestFilters {
  page?: number;
  page_size?: number;
  project?: number;
  status?: string;
  urgency?: string;
  search?: string;
  ordering?: string;
}
