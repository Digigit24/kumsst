/**
 * Accounts Module API Service
 * All API calls for Accounts entities
 */

import {
  API_ENDPOINTS,
  buildApiUrl,
  getDefaultHeaders,
} from "../config/api.config";
import type {
  BulkActivateInput,
  BulkDeleteInput,
  BulkDeleteResponse,
  BulkUserTypeUpdateInput,
  Department,
  DepartmentCreateInput,
  DepartmentFilters,
  DepartmentListItem,
  DepartmentUpdateInput,
  HierarchyPath,
  PasswordChangeInput,
  Role,
  RoleCreateInput,
  RoleFilters,
  RoleListItem,
  RoleTree,
  RoleUpdateInput,
  TeamMembersResponse,
  User,
  UserCreateInput,
  UserFilters,
  UserListItem,
  UserProfile,
  UserProfileCreateInput,
  UserProfileFilters,
  UserProfileUpdateInput,
  UserRole,
  UserRoleCreateInput,
  UserRoleFilters,
  UserRoleUpdateInput,
  UserUpdateInput,
} from "../types/accounts.types";
import { PaginatedResponse } from "../types/core.types";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });
  const qs = queryParams.toString();
  return qs ? `?${qs}` : "";
};

const fetchApi = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem("access_token");

  const headers = new Headers();

  const defaultHeaders = getDefaultHeaders();
  Object.entries(defaultHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  if (options?.headers) {
    const customHeaders = options.headers;
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => headers.set(key, value));
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => headers.set(key, value));
    } else {
      Object.entries(customHeaders as Record<string, string>).forEach(
        ([key, value]) => {
          headers.set(key, value);
        }
      );
    }
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let message = "Request failed";

    if (typeof errorData.detail === 'string') {
      message = errorData.detail;
    } else if (errorData.detail && typeof errorData.detail === 'object') {
      const detailParts: string[] = [];
      for (const [, v] of Object.entries(errorData.detail)) {
        if (typeof v === 'string') detailParts.push(v);
        else if (Array.isArray(v)) detailParts.push((v as string[]).join('. '));
      }
      if (detailParts.length > 0) message = detailParts.join(' | ');
    } else if (typeof errorData.message === 'string') {
      message = errorData.message;
    } else if (typeof errorData.error === 'string') {
      message = errorData.error;
    }

    if (message === "Request failed" && typeof errorData === 'object' && errorData !== null) {
      const parts: string[] = [];
      for (const [k, v] of Object.entries(errorData)) {
        if (typeof v === 'string') parts.push(`${k}: ${v}`);
        else if (Array.isArray(v)) parts.push(`${k}: ${(v as string[]).join(' ')}`);
      }
      if (parts.length > 0) message = parts.join(' | ');
    }

    throw {
      message,
      status: response.status,
      errors: errorData,
    };
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

// ============================================================================
// USER API
// ============================================================================

export const userApi = {
  /**
   * List all users with pagination and filters
   */
  list: async (
    filters?: UserFilters
  ): Promise<PaginatedResponse<UserListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<UserListItem>>(
      buildApiUrl(`${API_ENDPOINTS.users.list}${queryString}`)
    );
  },

  /**
   * Get user by ID
   */
  get: async (id: string): Promise<User> => {
    return fetchApi<User>(buildApiUrl(API_ENDPOINTS.users.detail(id)));
  },

  /**
   * Create new user
   */
  create: async (data: UserCreateInput): Promise<User> => {
    return fetchApi<User>(buildApiUrl(API_ENDPOINTS.users.create), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update user (full update)
   */
  update: async (id: string, data: UserUpdateInput): Promise<User> => {
    return fetchApi<User>(buildApiUrl(API_ENDPOINTS.users.update(id)), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Partial update user
   */
  patch: async (id: string, data: Partial<UserUpdateInput>): Promise<User> => {
    return fetchApi<User>(buildApiUrl(API_ENDPOINTS.users.patch(id)), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Soft delete user
   */
  delete: async (id: string): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.users.delete(id)), {
      method: "DELETE",
    });
  },

  /**
   * Get current user profile
   */
  me: async (): Promise<User> => {
    return fetchApi<User>(buildApiUrl(API_ENDPOINTS.users.me));
  },

  /**
   * Change password
   */
  changePassword: async (
    data: PasswordChangeInput
  ): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(
      buildApiUrl(API_ENDPOINTS.users.changePassword),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Bulk delete users
   */
  bulkDelete: async (data: BulkDeleteInput): Promise<BulkDeleteResponse> => {
    return fetchApi<BulkDeleteResponse>(
      buildApiUrl(API_ENDPOINTS.users.bulkDelete),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Bulk activate/deactivate users
   */
  bulkActivate: async (
    data: BulkActivateInput
  ): Promise<{ message: string; updated_ids: string[] }> => {
    return fetchApi<{ message: string; updated_ids: string[] }>(
      buildApiUrl(API_ENDPOINTS.users.bulkActivate),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Bulk update user types
   */
  bulkUpdateType: async (
    data: BulkUserTypeUpdateInput
  ): Promise<{ message: string; updated_ids: string[] }> => {
    return fetchApi<{ message: string; updated_ids: string[] }>(
      buildApiUrl(API_ENDPOINTS.users.bulkUpdateType),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Get users by type
   */
  byType: async (type: string): Promise<UserListItem[]> => {
    return fetchApi<UserListItem[]>(
      buildApiUrl(API_ENDPOINTS.users.byType(type))
    );
  },
};

// ============================================================================
// ROLE API
// ============================================================================

export const roleApi = {
  /**
   * List all roles
   */
  list: async (
    filters?: RoleFilters
  ): Promise<PaginatedResponse<RoleListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<RoleListItem>>(
      buildApiUrl(`${API_ENDPOINTS.roles.list}${queryString}`)
    );
  },

  /**
   * Get role by ID
   */
  get: async (id: number): Promise<Role> => {
    return fetchApi<Role>(buildApiUrl(API_ENDPOINTS.roles.detail(id)));
  },

  /**
   * Create new role
   */
  create: async (data: RoleCreateInput): Promise<Role> => {
    return fetchApi<Role>(buildApiUrl(API_ENDPOINTS.roles.create), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update role
   */
  update: async (id: number, data: RoleUpdateInput): Promise<Role> => {
    return fetchApi<Role>(buildApiUrl(API_ENDPOINTS.roles.update(id)), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Partial update role
   */
  patch: async (id: number, data: Partial<RoleUpdateInput>): Promise<Role> => {
    return fetchApi<Role>(buildApiUrl(API_ENDPOINTS.roles.patch(id)), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete role
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.roles.delete(id)), {
      method: "DELETE",
    });
  },

  /**
   * Get hierarchical role tree
   */
  getTree: async (): Promise<{ tree: RoleTree[] }> => {
    return fetchApi<{ tree: RoleTree[] }>(
      buildApiUrl(API_ENDPOINTS.roles.tree)
    );
  },

  /**
   * Add child role
   */
  addChild: async (id: number, data: RoleCreateInput): Promise<Role> => {
    return fetchApi<Role>(buildApiUrl(API_ENDPOINTS.roles.addChild(id)), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get team members
   */
  getTeamMembers: async (id: number): Promise<TeamMembersResponse> => {
    return fetchApi<TeamMembersResponse>(
      buildApiUrl(API_ENDPOINTS.roles.teamMembers(id))
    );
  },

  /**
   * Get hierarchy path
   */
  getHierarchyPath: async (id: number): Promise<HierarchyPath> => {
    return fetchApi<HierarchyPath>(
      buildApiUrl(API_ENDPOINTS.roles.hierarchyPath(id))
    );
  },

  /**
   * Get descendants
   */
  getDescendants: async (id: number): Promise<Role[]> => {
    return fetchApi<Role[]>(buildApiUrl(API_ENDPOINTS.roles.descendants(id)));
  },
};

// ============================================================================
// USER ROLE API
// ============================================================================

export const userRoleApi = {
  /**
   * List all user roles
   */
  list: async (
    filters?: UserRoleFilters
  ): Promise<PaginatedResponse<UserRole>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<UserRole>>(
      buildApiUrl(`${API_ENDPOINTS.userRoles.list}${queryString}`)
    );
  },

  /**
   * Get user role by ID
   */
  get: async (id: number): Promise<UserRole> => {
    return fetchApi<UserRole>(buildApiUrl(API_ENDPOINTS.userRoles.detail(id)));
  },

  /**
   * Create new user role
   */
  create: async (data: UserRoleCreateInput): Promise<UserRole> => {
    return fetchApi<UserRole>(buildApiUrl(API_ENDPOINTS.userRoles.create), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update user role
   */
  update: async (id: number, data: UserRoleUpdateInput): Promise<UserRole> => {
    return fetchApi<UserRole>(buildApiUrl(API_ENDPOINTS.userRoles.update(id)), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Partial update user role
   */
  patch: async (
    id: number,
    data: Partial<UserRoleUpdateInput>
  ): Promise<UserRole> => {
    return fetchApi<UserRole>(buildApiUrl(API_ENDPOINTS.userRoles.patch(id)), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete user role
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.userRoles.delete(id)), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// DEPARTMENT API
// ============================================================================

export const departmentApi = {
  /**
   * List all departments
   */
  list: async (
    filters?: DepartmentFilters
  ): Promise<PaginatedResponse<DepartmentListItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<DepartmentListItem>>(
      buildApiUrl(`${API_ENDPOINTS.departments.list}${queryString}`)
    );
  },

  /**
   * Get department by ID
   */
  get: async (id: number): Promise<Department> => {
    return fetchApi<Department>(
      buildApiUrl(API_ENDPOINTS.departments.detail(id))
    );
  },

  /**
   * Create new department
   */
  create: async (data: DepartmentCreateInput): Promise<Department> => {
    return fetchApi<Department>(buildApiUrl(API_ENDPOINTS.departments.create), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update department
   */
  update: async (
    id: number,
    data: DepartmentUpdateInput
  ): Promise<Department> => {
    return fetchApi<Department>(
      buildApiUrl(API_ENDPOINTS.departments.update(id)),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Partial update department
   */
  patch: async (
    id: number,
    data: Partial<DepartmentUpdateInput>
  ): Promise<Department> => {
    return fetchApi<Department>(
      buildApiUrl(API_ENDPOINTS.departments.patch(id)),
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete department
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.departments.delete(id)), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// USER PROFILE API
// ============================================================================

export const userProfileApi = {
  /**
   * List all user profiles
   */
  list: async (
    filters?: UserProfileFilters
  ): Promise<PaginatedResponse<UserProfile>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<UserProfile>>(
      buildApiUrl(`${API_ENDPOINTS.userProfiles.list}${queryString}`)
    );
  },

  /**
   * Get user profile by ID
   */
  get: async (id: number): Promise<UserProfile> => {
    return fetchApi<UserProfile>(
      buildApiUrl(API_ENDPOINTS.userProfiles.detail(id))
    );
  },

  /**
   * Create new user profile
   */
  create: async (data: UserProfileCreateInput): Promise<UserProfile> => {
    return fetchApi<UserProfile>(
      buildApiUrl(API_ENDPOINTS.userProfiles.create),
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update user profile
   */
  update: async (
    id: number,
    data: UserProfileUpdateInput
  ): Promise<UserProfile> => {
    return fetchApi<UserProfile>(
      buildApiUrl(API_ENDPOINTS.userProfiles.update(id)),
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Partial update user profile
   */
  patch: async (
    id: number,
    data: Partial<UserProfileUpdateInput>
  ): Promise<UserProfile> => {
    return fetchApi<UserProfile>(
      buildApiUrl(API_ENDPOINTS.userProfiles.patch(id)),
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete user profile
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(API_ENDPOINTS.userProfiles.delete(id)), {
      method: "DELETE",
    });
  },

  /**
   * Get current user's profile
   */
  me: async (): Promise<UserProfile> => {
    return fetchApi<UserProfile>(buildApiUrl(API_ENDPOINTS.userProfiles.me));
  },

  /**
   * Patch current user's profile (PATCH /me/)
   */
  patchMe: async (
    data: Partial<UserProfileUpdateInput>
  ): Promise<UserProfile> => {
    return fetchApi<UserProfile>(buildApiUrl(API_ENDPOINTS.userProfiles.me), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};
