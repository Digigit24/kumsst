/**
 * Print Template System Types
 * Types for document printing, templates, and approval workflow
 */

import type { PaginatedResponse } from './core.types';

// ============================================================================
// BASE TYPES
// ============================================================================

export type PaperSize = 'A4' | 'A5' | 'Letter' | 'Legal';
export type Orientation = 'portrait' | 'landscape';
export type LogoPosition = 'left' | 'center' | 'right';
export type HeaderLayout = 'stacked' | 'side-by-side';
export type TextAlign = 'left' | 'center' | 'right';
export type LineStyle = 'partial' | 'full';

export interface Margins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface SignatoryInfo {
  name: string;
  designation: string;
  signature_image?: string | null;
}

export interface SignaturePosition {
  position: 'bottom-left' | 'bottom-center' | 'bottom-right';
  signatory_index: number;
  label: string;
}

// ============================================================================
// PRINT CONFIGURATION TYPES
// ============================================================================

export interface PrintConfiguration {
  id: number;
  college: number;
  college_name: string;
  logo: string | null;
  logo_position: LogoPosition;
  logo_x_position?: number; // X position as percentage (0-100) for drag-to-position
  logo_y_position?: number; // Y position as percentage (0-100) for drag-to-position
  header_content: string;
  header_image: string | null;
  header_background_color: string;
  header_text_color: string;
  header_line_color: string;
  header_height: number;
  header_layout: HeaderLayout;
  header_text_align: TextAlign;
  header_text_x_position?: number; // X position as percentage (0-100) for drag-to-position
  header_text_y_position?: number; // Y position as percentage (0-100) for drag-to-position
  show_header_line: boolean;
  footer_content: string;
  footer_image: string | null;
  footer_background_color: string;
  footer_text_color: string;
  footer_line_color: string;
  footer_height: number;
  footer_text_x_position?: number; // X position as percentage (0-100) for drag-to-position
  footer_text_y_position?: number; // Y position as percentage (0-100) for drag-to-position
  show_footer_line: boolean;
  show_page_numbers: boolean;
  watermark_image: string | null;
  watermark_text: string | null;
  watermark_opacity: number;
  paper_size: PaperSize;
  margins: Margins;
  default_font_family: string;
  default_font_size: number;
  authorized_signatures: SignatoryInfo[];
  created_at: string;
  updated_at: string;
}

export interface PrintConfigurationUpdateInput {
  logo?: File | null;
  logo_position?: LogoPosition;
  logo_x_position?: number; // X position as percentage (0-100) for drag-to-position
  logo_y_position?: number; // Y position as percentage (0-100) for drag-to-position
  header_content?: string;
  header_image?: File | null;
  header_background_color?: string;
  header_text_color?: string;
  header_line_color?: string;
  header_height?: number;
  header_layout?: HeaderLayout;
  header_text_align?: TextAlign;
  header_text_x_position?: number; // X position as percentage (0-100) for drag-to-position
  header_text_y_position?: number; // Y position as percentage (0-100) for drag-to-position
  show_header_line?: boolean;
  footer_content?: string;
  footer_image?: File | null;
  footer_background_color?: string;
  footer_text_color?: string;
  footer_line_color?: string;
  footer_height?: number;
  footer_text_x_position?: number; // X position as percentage (0-100) for drag-to-position
  footer_text_y_position?: number; // Y position as percentage (0-100) for drag-to-position
  show_footer_line?: boolean;
  show_page_numbers?: boolean;
  watermark_image?: File | null;
  watermark_text?: string | null;
  watermark_opacity?: number;
  paper_size?: PaperSize;
  margins?: Margins;
  default_font_family?: string;
  default_font_size?: number;
  authorized_signatures?: SignatoryInfo[];
}

export interface SignatoryCreateInput {
  name: string;
  designation: string;
  signature_image?: File | null;
}

// ============================================================================
// TEMPLATE CATEGORY TYPES
// ============================================================================

export interface TemplateCategory {
  id: number;
  name: string;
  code: string;
  description: string | null;
  icon: string;
  display_order: number;
  template_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateCategoryCreateInput {
  name: string;
  code: string;
  description?: string | null;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface TemplateCategoryUpdateInput extends Partial<TemplateCategoryCreateInput> { }

export interface TemplateCategoryFilters {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export type VariableType = 'text' | 'number' | 'date' | 'image' | 'list';
export type TemplateStatus = 'draft' | 'active' | 'archived';

export interface TemplateVariable {
  key: string;
  label: string;
  type: VariableType;
  sample_value?: string;
  required: boolean;
}

export interface PrintTemplate {
  id: number;
  college?: number;
  name: string;
  code: string;
  description: string | null;
  category: number;
  category_name: string;
  content: string;
  css_styles: string | null;
  available_variables: TemplateVariable[];

  // Paper Settings
  paper_size: PaperSize;
  orientation: Orientation;
  margins: string | Record<string, number>;

  // Branding & Layout
  use_letterhead: boolean; // Deprecated or uses Global if true? Or maybe "Use Default"

  // Header Configuration
  logo_image: string | null;
  logo_position: LogoPosition;
  logo_x_position?: number;
  logo_y_position?: number;

  header_text: string | null;
  header_image: string | null;
  header_background_color: string;
  header_text_color: string;
  header_line_color: string;
  header_height: number;
  header_layout: HeaderLayout;
  header_text_align: TextAlign;
  header_text_x_position?: number;
  header_text_y_position?: number;
  show_header_line: boolean;

  // Footer Configuration
  footer_text: string | null;
  footer_image: string | null;
  footer_background_color: string;
  footer_text_color: string;
  footer_line_color: string;
  footer_height: number;
  footer_text_x_position?: number;
  footer_text_y_position?: number;
  show_footer_line: boolean;
  show_page_numbers: boolean;

  // Watermark
  watermark_image: string | null;
  watermark_text: string | null;
  watermark_opacity: number;

  // Fonts & Signatures
  default_font_family: string;
  default_font_size: number;
  authorized_signatures: number[]; // Array of Signatory IDs
  signature_positions: string | any[];

  // Metadata
  parent_template: number | null;
  version: number;
  status: TemplateStatus;
  is_default: boolean;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrintTemplateCreateInput {
  college?: number;
  name: string;
  code: string;
  description?: string | null;
  category: number;
  content: string;
  css_styles?: string | null;
  available_variables?: TemplateVariable[];

  // Paper Settings
  paper_size?: PaperSize;
  orientation?: Orientation;
  margins?: string | Record<string, number>;

  // Branding
  use_letterhead?: boolean;

  // Header
  logo_image?: File | string | null;
  logo_position?: LogoPosition;
  logo_x_position?: number;
  logo_y_position?: number;
  logo_width?: number;
  logo_height?: number;

  header_text?: string | null;
  header_image?: File | string | null;
  header_background_color?: string;
  header_text_color?: string;
  header_line_color?: string;
  header_line_style?: LineStyle;
  header_height?: number;
  header_layout?: HeaderLayout;
  header_text_align?: TextAlign;
  header_text_x_position?: number;
  header_text_y_position?: number;
  show_header_line?: boolean;

  // Footer
  footer_text?: string | null;
  footer_image?: File | string | null;
  footer_background_color?: string;
  footer_text_color?: string;
  footer_line_color?: string;
  footer_line_style?: LineStyle;
  footer_height?: number;
  footer_text_x_position?: number;
  footer_text_y_position?: number;
  show_footer_line?: boolean;
  show_page_numbers?: boolean;

  // Watermark
  watermark_image?: File | string | null;
  watermark_text?: string | null;
  watermark_opacity?: number;

  // Fonts & Signatures
  default_font_family?: string;
  default_font_size?: number;
  authorized_signatures?: number[]; // Array of IDs

  signature_positions?: string | any[];
  parent_template?: number | null;
  status?: TemplateStatus;
  is_default?: boolean;
}

export interface PrintTemplateUpdateInput extends Partial<PrintTemplateCreateInput> { }

export interface PrintTemplateFilters {
  page?: number;
  page_size?: number;
  category?: number;
  status?: TemplateStatus;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

export interface TemplatePreviewRequest {
  context_data: Record<string, any>;
  use_sample_data?: boolean;
}

export interface TemplatePreviewResponse {
  preview_html: string;
  [key: string]: any;
}

export interface TemplateDuplicateRequest {
  new_name: string;
  new_code: string;
}

export interface TemplatesByCategory {
  category: TemplateCategory;
  templates: PrintTemplate[];
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export type DocumentStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'printed'
  | 'cancelled';

export type DocumentPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface DocumentApproval {
  id: number;
  approver_level: string;
  is_pending: boolean;
  action: 'approve' | 'reject' | 'return' | null;
  comments: string | null;
  approved_by: number | null;
  approved_by_name: string | null;
  approved_at: string | null;
}

export interface PrintDocument {
  id: number;
  reference_number: string;
  title: string;
  template: number;
  template_name: string;
  template_version: number;
  context_data: Record<string, any>;
  rendered_content: string;
  pdf_file: string | null;
  pdf_generated_at: string | null;
  status: DocumentStatus;
  priority: DocumentPriority;
  requires_approval: boolean;
  related_model: string | null;
  related_id: number | null;
  requested_by: number;
  requested_by_name: string;
  requested_at: string;
  print_count: number;
  last_printed_at: string | null;
  internal_notes: string | null;
  // Override fields (stored separately from template)
  custom_header: string | null;
  custom_header_text: string | null;
  custom_footer: string | null;
  custom_footer_text: string | null;
  custom_watermark_text: string | null;
  custom_watermark_opacity: number | null;
  approvals: DocumentApproval[];
  created_at: string;
  updated_at: string;
}

export interface PrintDocumentCreateInput {
  template: number;
  title: string;
  context_data: Record<string, any>;
  custom_content?: string | null;
  priority?: DocumentPriority;
  requires_approval?: boolean;
  related_model?: string | null;
  related_id?: number | null;
  internal_notes?: string | null;
  generate_pdf?: boolean;
  status?: DocumentStatus;
  // Logo overrides
  custom_logo_image?: File | string | null;
  custom_logo_position?: string | null;
  custom_logo_x_position?: number | null;
  custom_logo_y_position?: number | null;
  // Header overrides
  custom_header?: string | null;
  custom_header_text?: string | null;
  custom_header_image?: File | string | null;
  custom_header_background_color?: string | null;
  custom_header_text_color?: string | null;
  custom_header_line_color?: string | null;
  custom_header_height?: number | null;
  custom_header_text_align?: string | null;
  custom_header_text_x_position?: number | null;
  custom_header_text_y_position?: number | null;
  custom_show_header_line?: boolean | null;
  // Footer overrides
  custom_footer?: string | null;
  custom_footer_text?: string | null;
  custom_footer_image?: File | string | null;
  custom_footer_background_color?: string | null;
  custom_footer_text_color?: string | null;
  custom_footer_line_color?: string | null;
  custom_footer_height?: number | null;
  custom_footer_text_x_position?: number | null;
  custom_footer_text_y_position?: number | null;
  custom_show_footer_line?: boolean | null;
  // Watermark overrides
  custom_watermark_text?: string | null;
  custom_watermark_image?: File | string | null;
  custom_watermark_opacity?: number | null;
  // Font & signature overrides
  custom_default_font_family?: string | null;
  custom_default_font_size?: number | null;
  custom_authorized_signatures?: string | null;
}

export interface PrintDocumentFilters {
  page?: number;
  page_size?: number;
  template?: number;
  status?: DocumentStatus;
  priority?: DocumentPriority;
  requested_by?: number;
  search?: string;
  ordering?: string;
}

// ============================================================================
// APPROVAL TYPES
// ============================================================================

export interface PendingApproval {
  id: number;
  document: number;
  document_title: string;
  document_reference: string;
  template_name: string;
  requested_by_name: string;
  approver_level: string;
  is_pending: boolean;
  created_at: string;
}

export interface ApprovalPreviewResponse {
  id: number;
  reference_number: string;
  title: string;
  template: number;
  template_name: string;
  requested_by: string;
  requested_by_name: string;
  requested_at: string;
  context_data: Record<string, any>;
  rendered_content: string;
  custom_content: string;
  status: DocumentStatus;
  priority: DocumentPriority;
  effective_settings: {
    logo_image: string | null;
    logo_position: string;
    logo_x_position: number | null;
    logo_y_position: number | null;
    header_text: string;
    header_image: string | null;
    header_background_color: string;
    header_text_color: string;
    header_line_color: string;
    header_height: number;
    header_text_align: string;
    header_text_x_position: number | null;
    header_text_y_position: number | null;
    show_header_line: boolean;
    footer_text: string;
    footer_image: string | null;
    footer_background_color: string;
    footer_text_color: string;
    footer_line_color: string;
    footer_height: number;
    footer_text_x_position: number | null;
    footer_text_y_position: number | null;
    show_footer_line: boolean;
    watermark_text: string | null;
    watermark_image: string | null;
    watermark_opacity: number;
    default_font_family: string;
    default_font_size: number;
    authorized_signatures: any[];
    content: string;
    css_styles: string | null;
    paper_size: string;
    orientation: string;
    margins: { top: number; left: number; right: number; bottom: number };
  };
}

export interface ApprovalActionRequest {
  action: 'approve' | 'reject' | 'return';
  comments?: string;
}

export interface ApprovalDashboard {
  pending: number;
  approved_today: number;
  rejected_today: number;
}

export interface ApprovalFilters {
  page?: number;
  page_size?: number;
  document?: number;
  is_pending?: boolean;
  search?: string;
  ordering?: string;
}

// ============================================================================
// BULK PRINT JOB TYPES
// ============================================================================

export type BulkJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface BulkJobError {
  index: number;
  error: string;
  timestamp: string;
}

export interface BulkPrintJob {
  id: number;
  job_id: string;
  name: string;
  template: number;
  template_name: string;
  target_model: string;
  target_filters: Record<string, any>;
  target_ids: number[];
  status: BulkJobStatus;
  total_count: number;
  processed_count: number;
  success_count: number;
  error_count: number;
  progress_percent: number;
  error_log: BulkJobError[];
  started_at: string | null;
  completed_at: string | null;
  combined_pdf: string | null;
  created_at: string;
  updated_at: string;
}

export interface BulkPrintJobCreateInput {
  name: string;
  template_id: number;
  target_model: string;
  target_ids?: number[];
  target_filters?: Record<string, any>;
}

export interface BulkPrintJobFilters {
  page?: number;
  page_size?: number;
  template?: number;
  status?: BulkJobStatus;
  search?: string;
  ordering?: string;
}

export interface BulkJobProgress {
  job_id: string;
  status: BulkJobStatus;
  total: number;
  processed: number;
  success: number;
  errors: number;
  progress_percent: number;
}

export interface TargetModel {
  value: string;
  label: string;
}

// ============================================================================
// PAGINATED RESPONSES
// ============================================================================

export type PaginatedTemplateCategories = PaginatedResponse<TemplateCategory>;
export type PaginatedPrintTemplates = PaginatedResponse<PrintTemplate>;
export type PaginatedPrintDocuments = PaginatedResponse<PrintDocument>;
export type PaginatedPendingApprovals = PaginatedResponse<PendingApproval>;
export type PaginatedBulkPrintJobs = PaginatedResponse<BulkPrintJob>;
