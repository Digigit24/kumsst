/**
 * Authentication Types for KUMSS ERP
 */

/**
 * User Role information
 */
export interface UserRole {
  id: number | null;
  role_id: number | null;
  role_name: string;
  role_code: string;
  college_id: number;
  college_name: string;
  is_primary: boolean;
  assigned_at: string;
  expires_at: string | null;
  is_expired: boolean;
}

/**
 * College information
 */
export interface College {
  id: number;
  code: string;
  name: string;
  short_name: string;
}

/**
 * Permission scope and status
 */
export interface PermissionDetail {
  scope: 'all' | 'own' | 'college' | 'department';
  enabled: boolean;
}

/**
 * Module permissions structure
 */
export interface ModulePermissions {
  [action: string]: PermissionDetail;
}

/**
 * All user permissions by module
 */
export interface UserPermissions {
  [module: string]: ModulePermissions;
}

/**
 * User interface representing authenticated user data
 */
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string | null;
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  fullName?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string | null;
  full_name?: string;
  gender?: string | null;
  gender_display?: string | null;
  date_of_birth?: string | null;
  avatar?: string | null;
  isStaff?: boolean;
  isSuperuser?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  isActive?: boolean;
  is_active?: boolean;
  is_verified?: boolean;
  dateJoined?: string;
  lastLogin?: string;
  date_joined?: string;
  last_login?: string;
  last_login_ip?: string | null;
  created_at?: string;
  updated_at?: string;
  userType?: string; // super_admin, college_admin, teacher, student, central_manager, etc.
  user_type?: string;
  user_type_display?: string;
  college?: number | null; // College ID for non-super_admin users
  college_id?: number | null;
  college_name?: string;
  collegeName?: string;
  teacher_id?: number | null; // Teacher model ID for teacher users
  student_id?: number | null; // Student model ID for student users

  // Additional login response fields
  user_roles?: UserRole[];
  user_permissions?: UserPermissions;
  accessible_colleges?: College[];
  tenant_ids?: number[];
  permissions?: string[]; // Flattened permission names for easy checking
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Full login response from API
 */
export interface LoginResponse {
  success?: boolean;
  key?: string; // Auth token (legacy)
  access?: string; // JWT Access token
  refresh?: string; // JWT Refresh token
  message?: string;
  user?: User;
  sessionId?: string;
  college_id?: number;
  tenant_ids?: number[];
  accessible_colleges?: College[];
  user_roles?: UserRole[];
  user_permissions?: UserPermissions;
  user_profile?: any;
}

/**
 * Auth state interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth context interface
 */
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

/**
 * API Error response
 */
export interface ApiError {
  message: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
