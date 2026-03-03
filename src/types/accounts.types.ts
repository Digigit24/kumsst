/**
 * Accounts Module Types for KUMSS ERP
 * All types matching Django backend models
 */

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export type UserType =
  | "super_admin"
  | "college_admin"
  | "teacher"
  | "student"
  | "parent"
  | "staff"
  | "hr"
  | "store_manager"
  | "central_manager"
  | "library_manager"
  | "accountant"
  | "hostel_warden"
  | "hostel_manager"
  | "construction_head"
  | "jr_engineer"
  | "clerk";

export type GenderChoices = "male" | "female" | "other";

// ============================================================================
// USER TYPES
// ============================================================================

export interface UserBasic {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  full_name: string;
  gender: GenderChoices | null;
  gender_display: string | null;
  date_of_birth: string | null;
  avatar: string | null;
  college: number | null;
  college_name: string | null;
  assigned_colleges: number[] | null;
  user_type: UserType;
  user_type_display: string;
  is_active: boolean;
  is_staff: boolean;
  is_verified: boolean;
  last_login: string | null;
  last_login_ip: string | null;
  date_joined: string;
  created_at: string;
  updated_at: string;
}

export interface UserListItem {
  id: string;
  username: string;
  email: string;
  full_name: string;
  user_type: UserType;
  user_type_display: string;
  college: number | null;
  college_name: string | null;
  teacher_id?: number; // ID of the associated teacher record (for teacher users)
  is_active: boolean;
  is_verified: boolean;
  date_joined: string;
  avatar?: string | null;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  phone?: string | null;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  gender?: GenderChoices | null;
  date_of_birth?: string | null;
  avatar?: File | null;
  college: number;
  assigned_colleges?: number[] | null;
  user_type?: UserType;
  is_active?: boolean;
}

export interface UserUpdateInput {
  email?: string;
  phone?: string | null;
  first_name?: string;
  last_name?: string;
  middle_name?: string | null;
  gender?: GenderChoices | null;
  date_of_birth?: string | null;
  avatar?: File | null;
  assigned_colleges?: number[] | null;
}

export interface PasswordChangeInput {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

// ============================================================================
// ROLE TYPES
// ============================================================================

export interface Role {
  id: number;
  college: number;
  college_name: string;
  name: string;
  code: string;
  description: string | null;
  permissions: Record<string, any>;
  display_order: number;
  is_active: boolean;
  created_by_name: string | null;
  updated_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleListItem {
  id: number;
  code: string;
  name: string;
  college: number;
  college_name: string;
  display_order: number;
  is_active: boolean;
}

export interface RoleCreateInput {
  college: number;
  name: string;
  code: string;
  description?: string | null;
  permissions?: Record<string, any>;
  display_order?: number;
  is_active?: boolean;
}

export interface RoleUpdateInput extends Partial<RoleCreateInput> { }

export interface RoleTree extends Role {
  level: number;
  parent: number | null;
  parent_name: string | null;
  is_organizational_position: boolean;
  children: RoleTree[];
}

export interface HierarchyPath {
  path: {
    id: number;
    name: string;
    level: number;
  }[];
}

export interface TeamMember {
  user_id: string;
  name: string;
  role: string;
  level: number;
}

export interface TeamMembersResponse {
  role: string;
  team_members: TeamMember[];
  total: number;
}

// ============================================================================
// USER ROLE TYPES
// ============================================================================

export interface UserRole {
  id: number;
  college: number;
  college_name: string;
  user: string;
  user_name: string;
  role: number;
  role_name: string;
  assigned_by: string | null;
  assigned_by_name: string | null;
  assigned_at: string;
  expires_at: string | null;
  is_expired: boolean;
  is_active: boolean;
  created_by_name: string | null;
  updated_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleCreateInput {
  college: number;
  user: string;
  role: number;
  assigned_by?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
}

export interface UserRoleUpdateInput extends Partial<UserRoleCreateInput> { }

// ============================================================================
// DEPARTMENT TYPES
// ============================================================================

export interface Department {
  id: number;
  college: number;
  college_name: string;
  code: string;
  name: string;
  short_name: string | null;
  description: string | null;
  hod: string | null;
  hod_name: string | null;
  display_order: number;
  is_active: boolean;
  created_by_name: string | null;
  updated_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface DepartmentListItem {
  id: number;
  code: string;
  name: string;
  short_name: string | null;
  college: number;
  college_name: string;
  hod: string | null;
  hod_name: string | null;
  display_order: number;
  is_active: boolean;
}

export interface DepartmentCreateInput {
  college: number;
  code: string;
  name: string;
  short_name?: string | null;
  description?: string | null;
  hod?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface DepartmentUpdateInput extends Partial<DepartmentCreateInput> { }

// ============================================================================
// USER PROFILE TYPES
// ============================================================================

export interface UserProfile {
  id: number;
  college: number;
  college_name: string;
  user: string;
  user_name: string;
  department: number | null;
  department_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  blood_group: string | null;
  nationality: string;
  religion: string | null;
  caste: string | null;
  profile_data: Record<string, any>;
  linkedin_url: string | null;
  website_url: string | null;
  bio: string | null;
  is_active: boolean;
  created_by_name: string | null;
  updated_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileCreateInput {
  college: number;
  user: string;
  department?: number | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
  blood_group?: string | null;
  nationality?: string;
  religion?: string | null;
  caste?: string | null;
  profile_data?: Record<string, any>;
  linkedin_url?: string | null;
  website_url?: string | null;
  bio?: string | null;
  is_active?: boolean;
}

export interface UserProfileUpdateInput
  extends Partial<UserProfileCreateInput> { }

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface UserFilters {
  page?: number;
  page_size?: number;
  user_type?: UserType;
  is_active?: boolean;
  is_verified?: boolean;
  is_staff?: boolean;
  college?: number;
  gender?: GenderChoices;
  search?: string;
  ordering?: string;
}

export interface RoleFilters {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  college?: number;
  search?: string;
  ordering?: string;
}

export interface UserRoleFilters {
  page?: number;
  page_size?: number;
  user?: string;
  role?: number;
  college?: number;
  is_active?: boolean;
  ordering?: string;
}

export interface DepartmentFilters {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  college?: number;
  hod?: string;
  search?: string;
  ordering?: string;
}

export interface UserProfileFilters {
  page?: number;
  page_size?: number;
  user?: string;
  department?: number;
  college?: number;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

// ============================================================================
// BULK OPERATION TYPES
// ============================================================================

export interface BulkDeleteInput {
  ids: string[] | number[];
}

export interface BulkDeleteResponse {
  message: string;
  deleted_ids: string[] | number[];
}

export interface BulkActivateInput {
  ids: string[];
  is_active: boolean;
}

export interface BulkUserTypeUpdateInput {
  ids: string[];
  user_type: UserType;
}
