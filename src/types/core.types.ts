/**
 * Core Module Types for KUMSS ERP
 * All types matching Django backend models
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export interface UserBasic {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuditFields {
  created_by: UserBasic | null;
  updated_by: UserBasic | null;
  created_at: string;
  updated_at: string;
}

export interface BaseEntity extends AuditFields {
  id: number;
  is_active: boolean;
}

// ============================================================================
// COLLEGE TYPES
// ============================================================================

export interface CollegeSettings {
  academic?: {
    attendance_mandatory_percentage?: number;
    max_absent_days?: number;
    grading_system?: string;
  };
  fees?: {
    late_fee_percentage?: number;
    installment_allowed?: boolean;
    discount_allowed?: boolean;
  };
  notifications?: {
    send_birthday_wishes?: boolean;
    send_result_alerts?: boolean;
  };
  theme?: {
    logo_url?: string;
    favicon_url?: string;
    primary_font?: string;
  };
}

export interface College extends BaseEntity {
  code: string;
  name: string;
  short_name: string;
  email: string;
  phone: string;
  website: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  logo: string | null;
  established_date: string | null;
  affiliation_number: string | null;
  primary_color: string;
  secondary_color: string;
  settings: CollegeSettings | null;
  is_main: boolean;
  display_order: number;
}

export interface CollegeListItem {
  id: number;
  code: string;
  name: string;
  short_name: string;
  city: string;
  state: string;
  country: string;
  is_main: boolean;
  is_active: boolean;
}

export interface CollegeCreateInput {
  code: string;
  name: string;
  short_name: string;
  email: string;
  phone: string;
  website?: string | null;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  logo?: File | null;
  established_date?: string | null;
  affiliation_number?: string | null;
  primary_color?: string;
  secondary_color?: string;
  settings?: CollegeSettings | null;
  is_main?: boolean;
  display_order?: number;
  is_active?: boolean;
}

export interface CollegeUpdateInput extends Partial<CollegeCreateInput> {}

// ============================================================================
// ACADEMIC YEAR TYPES
// ============================================================================

export interface AcademicYear extends BaseEntity {
  college: number;
  college_name: string;
  year: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface AcademicYearCreateInput {
  college: number;
  year: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
  is_active?: boolean;
}

export interface AcademicYearUpdateInput extends Partial<AcademicYearCreateInput> {}

// ============================================================================
// ACADEMIC SESSION TYPES
// ============================================================================

export interface AcademicSession extends BaseEntity {
  college: number;
  college_name: string;
  academic_year: number;
  academic_year_label: string;
  name: string;
  semester: number; // 1-8
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface AcademicSessionCreateInput {
  college: number;
  academic_year: number;
  name: string;
  semester: number;
  start_date: string;
  end_date: string;
  is_current?: boolean;
  is_active?: boolean;
}

export interface AcademicSessionUpdateInput extends Partial<AcademicSessionCreateInput> {}

// ============================================================================
// HOLIDAY TYPES
// ============================================================================

export type HolidayType = 'national' | 'festival' | 'college' | 'exam';

export interface Holiday extends BaseEntity {
  college: number;
  college_name: string;
  name: string;
  date: string;
  holiday_type: HolidayType;
  holiday_type_display: string;
  description: string | null;
}

export interface HolidayCreateInput {
  college: number;
  name: string;
  date: string;
  holiday_type: HolidayType;
  description?: string | null;
  is_active?: boolean;
}

export interface HolidayUpdateInput extends Partial<HolidayCreateInput> {}

// ============================================================================
// WEEKEND TYPES
// ============================================================================

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Monday, 6=Sunday

export interface Weekend extends BaseEntity {
  college: number;
  college_name: string;
  day: WeekDay;
  day_display: string;
}

export interface WeekendCreateInput {
  college: number;
  day: WeekDay;
  is_active?: boolean;
}

export interface WeekendUpdateInput extends Partial<WeekendCreateInput> {}

// ============================================================================
// SYSTEM SETTING TYPES
// ============================================================================

export interface SystemSettingsData {
  system: {
    app_name: string;
    version: string;
    timezone: string;
    date_format: string;
    currency: string;
    language: string;
  };
  email: {
    from_address: string;
    smtp_host: string;
    smtp_port: number;
  };
  sms: {
    provider: string;
    sender_id: string;
  };
  security: {
    session_timeout: number;
    password_expiry: number;
    max_login_attempts: number;
  };
  features: {
    online_exam: boolean;
    hostel: boolean;
    library: boolean;
    store: boolean;
  };
}

export interface SystemSetting extends BaseEntity {
  college: number;
  college_name: string;
  settings: SystemSettingsData;
}

export interface SystemSettingCreateInput {
  college: number;
  settings: SystemSettingsData;
  is_active?: boolean;
}

export interface SystemSettingUpdateInput extends Partial<SystemSettingCreateInput> {}

// ============================================================================
// NOTIFICATION SETTING TYPES
// ============================================================================

export interface NotificationSettingsData {
  channels?: {
    sms?: {
      attendance_absent?: boolean;
      fee_due?: boolean;
      exam_schedule?: boolean;
    };
    email?: {
      attendance_absent?: boolean;
      fee_due?: boolean;
      exam_schedule?: boolean;
    };
  };
  schedules?: {
    fee_reminder_time?: string;
    weekly_report_day?: string;
  };
}

export interface NotificationSetting extends BaseEntity {
  college: number;
  college_name: string;
  sms_enabled: boolean;
  sms_gateway: string;
  sms_api_key?: string | null;
  sms_sender_id: string | null;
  email_enabled: boolean;
  email_gateway: string;
  email_from: string | null;
  email_from_name?: string | null;
  email_api_key?: string | null;
  whatsapp_enabled: boolean;
  whatsapp_api_key?: string | null;
  whatsapp_number: string | null;
  whatsapp_phone_number?: string | null;
  attendance_notif: boolean;
  fee_reminder: boolean;
  fee_days: string;
  notify_admission?: boolean;
  notify_fees?: boolean;
  notify_attendance?: boolean;
  notify_exam?: boolean;
  notify_result?: boolean;
  notify_event?: boolean;
  notif_settings: NotificationSettingsData | null;
}

export interface NotificationSettingCreateInput {
  college: number;
  sms_enabled?: boolean;
  sms_gateway?: string;
  sms_api_key?: string;
  sms_sender_id?: string | null;
  email_enabled?: boolean;
  email_gateway?: string;
  email_api_key?: string;
  email_from?: string | null;
  whatsapp_enabled?: boolean;
  whatsapp_api_key?: string | null;
  whatsapp_number?: string | null;
  attendance_notif?: boolean;
  fee_reminder?: boolean;
  fee_days?: string;
  notif_settings?: NotificationSettingsData | null;
  is_active?: boolean;
}

export interface NotificationSettingUpdateInput extends Partial<NotificationSettingCreateInput> {}

// ============================================================================
// ACTIVITY LOG TYPES
// ============================================================================

export type ActivityAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'download'
  | 'upload'
  | 'export'
  | 'import';

export interface ActivityLog {
  id: number;
  user: number | null;
  user_name: string | null;
  college: number;
  college_name: string;
  action: ActivityAction;
  action_display: string;
  model_name: string;
  object_id: string | null;
  description: string;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface CollegeFilters {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  is_main?: boolean;
  state?: string;
  country?: string;
  search?: string;
  ordering?: string;
}

export interface AcademicYearFilters {
  page?: number;
  page_size?: number;
  is_current?: boolean;
  college?: number;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

export interface AcademicSessionFilters {
  page?: number;
  page_size?: number;
  college?: number;
  academic_year?: number;
  semester?: number;
  is_current?: boolean;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

export interface HolidayFilters {
  page?: number;
  page_size?: number;
  college?: number;
  holiday_type?: HolidayType;
  date?: string;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

export interface WeekendFilters {
  page?: number;
  page_size?: number;
  college?: number;
  day?: WeekDay;
  is_active?: boolean;
  ordering?: string;
}

export interface SystemSettingFilters {
  page?: number;
  page_size?: number;
  is_active?: boolean;
}

export interface NotificationSettingFilters {
  page?: number;
  page_size?: number;
  college?: number;
  is_active?: boolean;
}

export interface ActivityLogFilters {
  page?: number;
  page_size?: number;
  user?: number;
  college?: number;
  action?: ActivityAction;
  model_name?: string;
  search?: string;
  ordering?: string;
}

// ============================================================================
// BULK OPERATION TYPES
// ============================================================================

export interface BulkDeleteInput {
  ids: number[];
}

export interface BulkDeleteResponse {
  message: string;
  deleted_ids: number[];
}

export interface BulkActivateInput {
  ids: number[];
  is_active: boolean;
}

// ============================================================================
// ORGANIZATION HIERARCHY TYPES
// ============================================================================

export type NodeType = 'department' | 'unit' | 'team' | 'position' | 'other';

export interface OrganizationNode extends BaseEntity {
  college: number;
  college_name: string;
  name: string;
  code: string;
  node_type: NodeType;
  node_type_display: string;
  description: string | null;
  parent: number | null;
  parent_name: string | null;
  level: number;
  path: string;
  order: number;
  metadata: Record<string, any> | null;
  children?: OrganizationNodeTree[];
}

export interface OrganizationNodeTree extends OrganizationNode {
  children: OrganizationNodeTree[];
}

export interface OrganizationNodeCreateInput {
  college: number;
  name: string;
  code: string;
  node_type: NodeType;
  description?: string | null;
  parent?: number | null;
  order?: number;
  metadata?: Record<string, any> | null;
  is_active?: boolean;
}

export interface OrganizationNodeUpdateInput extends Partial<OrganizationNodeCreateInput> {}

// Dynamic Role Types
export interface DynamicRole extends BaseEntity {
  college: number;
  college_name: string;
  node: number;
  node_name: string;
  name: string;
  code: string;
  description: string | null;
  level: number;
  permissions: number[]; // Array of permission IDs
  permission_details?: HierarchyPermission[];
}

export interface DynamicRoleCreateInput {
  college: number;
  node: number;
  name: string;
  code: string;
  description?: string | null;
  is_active?: boolean;
}

export interface DynamicRoleUpdateInput extends Partial<DynamicRoleCreateInput> {}

export interface RolePermissionsUpdateInput {
  add: number[];
  remove: number[];
}

// Hierarchy Permission Types
export type PermissionCategory = 'org_structure' | 'user_management' | 'team_management' | 'role_management' | 'other';

export interface HierarchyPermission {
  id: number;
  code: string;
  name: string;
  description: string | null;
  category: PermissionCategory;
  category_display: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionsByCategory {
  category: PermissionCategory;
  category_display: string;
  permissions: HierarchyPermission[];
}

// User Role Assignment Types
export interface HierarchyUserRole extends BaseEntity {
  user: number;
  user_name: string;
  user_email: string;
  role: number;
  role_name: string;
  node: number;
  node_name: string;
  assigned_by: number;
  assigned_by_name: string;
}

export interface UserRoleAssignInput {
  user: number;
  role: number;
  node: number;
}

export interface UserRoleRevokeInput {
  user: number;
  role: number;
  node: number;
}

// Team Types
export type TeamType = 'principal' | 'hod' | 'teacher' | 'custom';

export interface Team extends BaseEntity {
  college: number;
  college_name: string;
  node: number;
  node_name: string;
  name: string;
  code: string;
  team_type: TeamType;
  team_type_display: string;
  description: string | null;
  auto_created: boolean;
  members_count?: number;
}

export interface TeamCreateInput {
  college: number;
  node: number;
  name: string;
  code: string;
  team_type: TeamType;
  description?: string | null;
  is_active?: boolean;
}

export interface TeamUpdateInput extends Partial<TeamCreateInput> {}

// Team Member Types
export interface HierarchyTeamMember extends BaseEntity {
  team: number;
  team_name: string;
  user: number;
  user_name: string;
  user_email: string;
  role: string | null;
  added_by: number;
  added_by_name: string;
}

export interface TeamMemberAddInput {
  user: number;
  role?: string | null;
}

// Filter Types for Organization Hierarchy
export interface OrganizationNodeFilters {
  page?: number;
  page_size?: number;
  college?: number;
  parent?: number;
  node_type?: NodeType;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

export interface DynamicRoleFilters {
  page?: number;
  page_size?: number;
  college?: number;
  node?: number;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

export interface TeamFilters {
  page?: number;
  page_size?: number;
  college?: number;
  node?: number;
  team_type?: TeamType;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}
