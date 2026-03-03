/**
 * Permissions and Context Types for KUMSS ERP
 *
 * This system enables:
 * 1. Permission-based access control (backend enforcement)
 * 2. UI visibility control (frontend rendering)
 * 3. Hierarchical context selectors (College → Class → Section)
 */

// ============================================================================
// PERMISSION SCOPE AND STATUS
// ============================================================================

export type PermissionScope = 'mine' | 'team' | 'department' | 'all';

export interface PermissionDetail {
  enabled: boolean;
  scope: PermissionScope;
}

export interface UIPermission {
  hideSensitiveFields?: boolean;
  showAdvancedFilters?: boolean;
  canExport?: boolean;
  canImport?: boolean;
  canBulkEdit?: boolean;
  canBulkDelete?: boolean;
  [key: string]: any; // Allow additional UI-only flags
}

// ============================================================================
// MODULE PERMISSIONS STRUCTURE
// ============================================================================

export interface ModulePermissions {
  create?: PermissionDetail;
  read?: PermissionDetail;
  update?: PermissionDetail;
  delete?: PermissionDetail;
  ui?: UIPermission;
}

// ============================================================================
// ALL PERMISSIONS BY MODULE
// ============================================================================

export interface UserPermissionsJSON {
  // Core modules
  colleges?: ModulePermissions;
  academic_years?: ModulePermissions;
  academic_sessions?: ModulePermissions;

  // Academic modules
  faculties?: ModulePermissions;
  programs?: ModulePermissions;
  classes?: ModulePermissions;
  sections?: ModulePermissions;
  subjects?: ModulePermissions;

  // Student modules
  students?: ModulePermissions;
  student_enrollment?: ModulePermissions;

  // Attendance modules
  attendance?: ModulePermissions;
  student_attendance?: ModulePermissions;
  staff_attendance?: ModulePermissions;

  // Examination modules
  examinations?: ModulePermissions;
  exam_schedules?: ModulePermissions;
  results?: ModulePermissions;

  // Fee modules
  fees?: ModulePermissions;
  fee_structures?: ModulePermissions;
  fee_payments?: ModulePermissions;

  // HR modules
  staff?: ModulePermissions;
  teachers?: ModulePermissions;
  departments?: ModulePermissions;
  designations?: ModulePermissions;

  // Library modules
  library?: ModulePermissions;
  books?: ModulePermissions;
  book_issues?: ModulePermissions;

  // Assignment modules
  assignments?: ModulePermissions;

  // Hostel modules
  hostel?: ModulePermissions;
  hostel_rooms?: ModulePermissions;
  hostel_allocations?: ModulePermissions;
  hostel_fees?: ModulePermissions;

  // Communication modules
  communication?: ModulePermissions;
  notices?: ModulePermissions;
  messages?: ModulePermissions;
  events?: ModulePermissions;

  // Reports modules
  reports?: ModulePermissions;

  // Settings modules
  system_settings?: ModulePermissions;
  notification_settings?: ModulePermissions;

  // Allow additional modules
  [key: string]: ModulePermissions | undefined;
}

// ============================================================================
// NORMALIZED PERMISSION CONSTANTS (for easy UI checks)
// ============================================================================

export interface NormalizedPermissions {
  // Context selectors
  canChooseCollege: boolean;
  canChooseClass: boolean;
  canChooseSection: boolean;

  // Attendance
  canViewAttendance: boolean;
  canMarkAttendance: boolean;
  canEditAttendance: boolean;
  canDeleteAttendance: boolean;
  canExportAttendance: boolean;
  canViewAllAttendance: boolean;

  // Students
  canViewStudents: boolean;
  canCreateStudents: boolean;
  canEditStudents: boolean;
  canDeleteStudents: boolean;
  canViewStudentSensitiveFields: boolean;
  canExportStudents: boolean;

  // Classes & Sections
  canViewClasses: boolean;
  canCreateClasses: boolean;
  canEditClasses: boolean;
  canDeleteClasses: boolean;

  canViewSections: boolean;
  canCreateSections: boolean;
  canEditSections: boolean;
  canDeleteSections: boolean;

  // Subjects
  canViewSubjects: boolean;
  canCreateSubjects: boolean;
  canEditSubjects: boolean;
  canDeleteSubjects: boolean;

  // Examinations
  canViewExaminations: boolean;
  canCreateExaminations: boolean;
  canEditExaminations: boolean;
  canDeleteExaminations: boolean;
  canViewAllResults: boolean;

  // Fees
  canViewFees: boolean;
  canCreateFees: boolean;
  canEditFees: boolean;
  canDeleteFees: boolean;
  canViewAllFees: boolean;

  // Staff/HR
  canViewStaff: boolean;
  canCreateStaff: boolean;
  canEditStaff: boolean;
  canDeleteStaff: boolean;

  // Teachers
  canViewTeachers: boolean;
  canCreateTeachers: boolean;
  canEditTeachers: boolean;
  canDeleteTeachers: boolean;
  canViewTeacherSensitiveFields: boolean;

  // Reports
  canViewReports: boolean;
  canExportReports: boolean;

  // Settings
  canManageSettings: boolean;
  canManageNotifications: boolean;

  // Hostel
  canViewHostel: boolean;
  canCreateHostel: boolean;
  canEditHostel: boolean;
  canDeleteHostel: boolean;

  // Communication
  canViewCommunication: boolean;
  canCreateCommunication: boolean;
  canEditCommunication: boolean;
  canDeleteCommunication: boolean;

  // Super admin checks
  isSuperAdmin: boolean;
  isCollegeAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isHostelManager: boolean;
}

// ============================================================================
// USER CONTEXT (locked values based on role/assignment)
// ============================================================================

export interface UserContext {
  userId: string;
  userType: string;
  college_id?: number | null;
  assigned_class_ids?: number[];
  assigned_section_ids?: number[];
  accessible_colleges?: number[];
}

// ============================================================================
// CONTEXT SELECTOR STATE
// ============================================================================

export interface ContextState {
  selectedCollegeId: number | null;
  selectedClassId: number | null;
  selectedSectionId: number | null;
}

// ============================================================================
// CONTEXT OPTIONS (for dropdowns)
// ============================================================================

export interface CollegeOption {
  id: number;
  code: string;
  name: string;
  short_name: string;
}

export interface ClassOption {
  id: number;
  name: string;
  college: number;
  program_name: string;
  semester: number;
  year: number;
}

export interface SectionOption {
  id: number;
  name: string;
  class_obj: number;
  class_name: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface PermissionsResponse {
  user_permissions: UserPermissionsJSON;
  user_context: UserContext;
  user_type: string;
  accessible_colleges: CollegeOption[];
}

export interface ContextOptionsResponse<T> {
  count: number;
  results: T[];
}

// ============================================================================
// PERMISSION EDITOR TYPES (for admin panel)
// ============================================================================

export interface PermissionEditorState {
  module: string;
  action: 'create' | 'read' | 'update' | 'delete';
  enabled: boolean;
  scope: PermissionScope;
}

export interface PermissionEditorForm {
  role: string;
  permissions: PermissionEditorState[];
  ui_permissions: Record<string, UIPermission>;
}
