/**
 * Reports Module Types for KUMSS ERP
 * All types matching Django backend models
 */

import { UserBasic } from './accounts.types';

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface AuditFields {
  created_by: UserBasic | null;
  updated_by: UserBasic | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// REPORT TEMPLATE TYPES
// ============================================================================

export interface ReportParameter {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
  required: boolean;
  default_value?: any;
  options?: { value: any; label: string }[]; // For select/multiselect
  validation?: string | null;
}

export interface ReportTemplate extends AuditFields {
  id: number;
  college: number;
  college_name: string;
  name: string;
  code: string;
  category: 'academic' | 'student' | 'attendance' | 'examination' | 'fees' | 'library' | 'hr' | 'custom';
  description: string | null;
  parameters: ReportParameter[];
  query_template: string | null; // SQL query template
  file_format: 'pdf' | 'excel' | 'csv' | 'html';
  orientation: 'portrait' | 'landscape';
  page_size: 'A4' | 'A3' | 'Letter' | 'Legal';
  header_template: string | null;
  footer_template: string | null;
  is_system_template: boolean;
  is_active: boolean;
}

export interface ReportTemplateListItem {
  id: number;
  name: string;
  code: string;
  college: number;
  college_name: string;
  category: string;
  file_format: string;
  is_system_template: boolean;
  is_active: boolean;
}

export interface ReportTemplateCreateInput {
  college: number;
  name: string;
  code: string;
  category: 'academic' | 'student' | 'attendance' | 'examination' | 'fees' | 'library' | 'hr' | 'custom';
  description?: string | null;
  parameters: ReportParameter[];
  query_template?: string | null;
  file_format: 'pdf' | 'excel' | 'csv' | 'html';
  orientation?: 'portrait' | 'landscape';
  page_size?: 'A4' | 'A3' | 'Letter' | 'Legal';
  header_template?: string | null;
  footer_template?: string | null;
  is_active?: boolean;
}

export interface ReportTemplateUpdateInput extends Partial<ReportTemplateCreateInput> {}

// ============================================================================
// GENERATED REPORT TYPES
// ============================================================================

export interface GeneratedReport extends AuditFields {
  id: number;
  college: number;
  college_name: string;
  template: number;
  template_details: ReportTemplateListItem;
  report_name: string;
  parameters: Record<string, any>;
  file_path: string | null;
  file_url: string | null;
  file_size: number | null; // in bytes
  status: 'queued' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  generated_at: string | null;
  generated_by: UserBasic | null;
  expiry_date: string | null;
  download_count: number;
  is_deleted: boolean;
}

export interface GeneratedReportListItem {
  id: number;
  template: number;
  template_name: string;
  report_name: string;
  college: number;
  college_name: string;
  status: string;
  generated_at: string | null;
  generated_by_name: string | null;
  file_size: number | null;
  download_count: number;
}

export interface GenerateReportInput {
  template: number;
  parameters: Record<string, any>;
  report_name?: string;
  expiry_date?: string | null;
}

// ============================================================================
// SAVED REPORT TYPES
// ============================================================================

export interface SavedReport extends AuditFields {
  id: number;
  college: number;
  college_name: string;
  generated_report: number;
  generated_report_details: GeneratedReportListItem;
  name: string;
  description: string | null;
  tags: string[];
  is_public: boolean;
  shared_with: string[]; // User IDs
  shared_with_details: UserBasic[];
  folder: string | null;
  is_favorite: boolean;
  saved_by: UserBasic | null;
}

export interface SavedReportListItem {
  id: number;
  generated_report: number;
  name: string;
  college: number;
  college_name: string;
  template_name: string;
  tags: string[];
  is_public: boolean;
  folder: string | null;
  is_favorite: boolean;
  saved_by_name: string | null;
  created_at: string;
}

export interface SavedReportCreateInput {
  generated_report: number;
  name: string;
  description?: string | null;
  tags?: string[];
  is_public?: boolean;
  shared_with?: string[];
  folder?: string | null;
  is_favorite?: boolean;
}

export interface SavedReportUpdateInput extends Partial<SavedReportCreateInput> {}

// ============================================================================
// SCHEDULED REPORT TYPES
// ============================================================================

export interface ScheduledReport extends AuditFields {
  id: number;
  college: number;
  college_name: string;
  template: number;
  template_details: ReportTemplateListItem;
  name: string;
  parameters: Record<string, any>;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  schedule_time: string; // HH:MM format
  schedule_day: number | null; // Day of week (0-6) for weekly, day of month (1-31) for monthly
  next_run: string;
  last_run: string | null;
  recipients: string[]; // User IDs or email addresses
  recipients_details: UserBasic[];
  is_active: boolean;
}

export interface ScheduledReportListItem {
  id: number;
  template: number;
  template_name: string;
  name: string;
  college: number;
  college_name: string;
  schedule_type: string;
  next_run: string;
  last_run: string | null;
  is_active: boolean;
}

export interface ScheduledReportCreateInput {
  college: number;
  template: number;
  name: string;
  parameters: Record<string, any>;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  schedule_time: string;
  schedule_day?: number | null;
  recipients: string[];
  is_active?: boolean;
}

export interface ScheduledReportUpdateInput extends Partial<ScheduledReportCreateInput> {}

// ============================================================================
// REPORT STATISTICS TYPES
// ============================================================================

export interface ReportStatistics {
  total_templates: number;
  total_generated: number;
  total_saved: number;
  total_scheduled: number;
  category_wise_count: {
    category: string;
    count: number;
  }[];
  most_used_templates: {
    template_id: number;
    template_name: string;
    usage_count: number;
  }[];
  recent_reports: GeneratedReportListItem[];
  storage_used: number; // in bytes
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface ReportTemplateFilters {
  page?: number;
  page_size?: number;
  college?: number;
  category?: string;
  file_format?: string;
  is_system_template?: boolean;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

export interface GeneratedReportFilters {
  page?: number;
  page_size?: number;
  college?: number;
  template?: number;
  status?: string;
  generated_by?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  ordering?: string;
}

export interface SavedReportFilters {
  page?: number;
  page_size?: number;
  college?: number;
  template?: number;
  tags?: string[];
  is_public?: boolean;
  folder?: string;
  is_favorite?: boolean;
  saved_by?: string;
  search?: string;
  ordering?: string;
}

export interface ScheduledReportFilters {
  page?: number;
  page_size?: number;
  college?: number;
  template?: number;
  schedule_type?: string;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}
