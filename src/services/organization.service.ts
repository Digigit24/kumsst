/**
 * Organization Hierarchy Module API Service
 * All API calls for Organization Hierarchy entities
 */

import { buildApiUrl, getDefaultHeaders } from "../config/api.config";
import type {
  OrganizationNode,
  OrganizationNodeTree,
  OrganizationNodeCreateInput,
  OrganizationNodeUpdateInput,
  OrganizationNodeFilters,
  DynamicRole,
  DynamicRoleCreateInput,
  DynamicRoleUpdateInput,
  DynamicRoleFilters,
  RolePermissionsUpdateInput,
  HierarchyPermission,
  PermissionsByCategory,
  HierarchyUserRole,
  UserRoleAssignInput,
  UserRoleRevokeInput,
  Team,
  TeamCreateInput,
  TeamUpdateInput,
  TeamFilters,
  HierarchyTeamMember,
  TeamMemberAddInput,
  PaginatedResponse,
} from "../types/core.types";

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
  const token = localStorage.getItem('access_token');

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

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: (typeof errorData.detail === 'string' ? errorData.detail : typeof errorData.message === 'string' ? errorData.message : typeof errorData.error === 'string' ? errorData.error : 'Request failed'),
      status: response.status,
      data: errorData,
    };
  }

  return response.json();
};

// ============================================================================
// ORGANIZATION NODE API
// ============================================================================

const ORG_ENDPOINTS = {
  nodes: {
    tree: "/api/v1/core/organization/nodes/tree/",
    list: "/api/v1/core/organization/nodes/",
    detail: (id: number) => `/api/v1/core/organization/nodes/${id}/`,
    create: "/api/v1/core/organization/nodes/",
    update: (id: number) => `/api/v1/core/organization/nodes/${id}/`,
    patch: (id: number) => `/api/v1/core/organization/nodes/${id}/`,
    delete: (id: number) => `/api/v1/core/organization/nodes/${id}/`,
  },
  roles: {
    list: "/api/v1/core/organization/roles/",
    detail: (id: number) => `/api/v1/core/organization/roles/${id}/`,
    create: "/api/v1/core/organization/roles/",
    update: (id: number) => `/api/v1/core/organization/roles/${id}/`,
    patch: (id: number) => `/api/v1/core/organization/roles/${id}/`,
    delete: (id: number) => `/api/v1/core/organization/roles/${id}/`,
    updatePermissions: (id: number) => `/api/v1/core/organization/roles/${id}/permissions/`,
  },
  permissions: {
    list: "/api/v1/core/organization/permissions/",
    byCategory: "/api/v1/core/organization/permissions/by-category/",
  },
  userRoles: {
    assign: "/api/v1/core/organization/user-roles/assign/",
    revoke: "/api/v1/core/organization/user-roles/revoke/",
  },
  teams: {
    list: "/api/v1/core/organization/teams/",
    detail: (id: number) => `/api/v1/core/organization/teams/${id}/`,
    create: "/api/v1/core/organization/teams/",
    update: (id: number) => `/api/v1/core/organization/teams/${id}/`,
    patch: (id: number) => `/api/v1/core/organization/teams/${id}/`,
    delete: (id: number) => `/api/v1/core/organization/teams/${id}/`,
    members: (id: number) => `/api/v1/core/organization/teams/${id}/members/`,
    addMember: (id: number) => `/api/v1/core/organization/teams/${id}/members/`,
  },
};

export const organizationNodeApi = {
  /**
   * Get organization hierarchy tree
   * Returns nested tree structure
   */
  getTree: async (): Promise<{ tree: OrganizationNodeTree[] }> => {
    return fetchApi<{ tree: OrganizationNodeTree[] }>(buildApiUrl(ORG_ENDPOINTS.nodes.tree));
  },

  /**
   * Get all organization nodes (list view)
   */
  getAll: async (
    filters?: OrganizationNodeFilters
  ): Promise<PaginatedResponse<OrganizationNode>> => {
    const queryString = filters ? buildQueryString(filters) : "";
    return fetchApi<PaginatedResponse<OrganizationNode>>(
      buildApiUrl(`${ORG_ENDPOINTS.nodes.list}${queryString}`)
    );
  },

  /**
   * Get single organization node by ID
   */
  getById: async (id: number): Promise<OrganizationNode> => {
    return fetchApi<OrganizationNode>(buildApiUrl(ORG_ENDPOINTS.nodes.detail(id)));
  },

  /**
   * Create new organization node
   * Clears tree cache on backend
   */
  create: async (data: OrganizationNodeCreateInput): Promise<OrganizationNode> => {
    return fetchApi<OrganizationNode>(buildApiUrl(ORG_ENDPOINTS.nodes.create), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update organization node
   * Clears tree cache on backend
   */
  update: async (id: number, data: OrganizationNodeUpdateInput): Promise<OrganizationNode> => {
    return fetchApi<OrganizationNode>(buildApiUrl(ORG_ENDPOINTS.nodes.update(id)), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Partial update organization node
   * Clears tree cache on backend
   */
  patch: async (id: number, data: Partial<OrganizationNodeUpdateInput>): Promise<OrganizationNode> => {
    return fetchApi<OrganizationNode>(buildApiUrl(ORG_ENDPOINTS.nodes.patch(id)), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete organization node
   * Clears tree cache on backend
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(ORG_ENDPOINTS.nodes.delete(id)), {
      method: "DELETE",
    });
  },
};

// ============================================================================
// DYNAMIC ROLE API
// ============================================================================

export const dynamicRoleApi = {
  /**
   * Get all dynamic roles
   */
  getAll: async (
    filters?: DynamicRoleFilters
  ): Promise<PaginatedResponse<DynamicRole>> => {
    const queryString = filters ? buildQueryString(filters) : "";
    return fetchApi<PaginatedResponse<DynamicRole>>(
      buildApiUrl(`${ORG_ENDPOINTS.roles.list}${queryString}`)
    );
  },

  /**
   * Get single dynamic role by ID
   */
  getById: async (id: number): Promise<DynamicRole> => {
    return fetchApi<DynamicRole>(buildApiUrl(ORG_ENDPOINTS.roles.detail(id)));
  },

  /**
   * Create new dynamic role
   */
  create: async (data: DynamicRoleCreateInput): Promise<DynamicRole> => {
    return fetchApi<DynamicRole>(buildApiUrl(ORG_ENDPOINTS.roles.create), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update dynamic role
   */
  update: async (id: number, data: DynamicRoleUpdateInput): Promise<DynamicRole> => {
    return fetchApi<DynamicRole>(buildApiUrl(ORG_ENDPOINTS.roles.update(id)), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Partial update dynamic role
   */
  patch: async (id: number, data: Partial<DynamicRoleUpdateInput>): Promise<DynamicRole> => {
    return fetchApi<DynamicRole>(buildApiUrl(ORG_ENDPOINTS.roles.patch(id)), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete dynamic role
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(ORG_ENDPOINTS.roles.delete(id)), {
      method: "DELETE",
    });
  },

  /**
   * Update role permissions
   * Add or remove permissions from a role
   */
  updatePermissions: async (
    id: number,
    data: RolePermissionsUpdateInput
  ): Promise<DynamicRole> => {
    return fetchApi<DynamicRole>(
      buildApiUrl(ORG_ENDPOINTS.roles.updatePermissions(id)),
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  },
};

// ============================================================================
// HIERARCHY PERMISSION API
// ============================================================================

export const hierarchyPermissionApi = {
  /**
   * Get all hierarchy permissions
   */
  getAll: async (): Promise<HierarchyPermission[]> => {
    return fetchApi<HierarchyPermission[]>(buildApiUrl(ORG_ENDPOINTS.permissions.list));
  },

  /**
   * Get permissions grouped by category
   * Useful for permission selection UI
   */
  getByCategory: async (): Promise<PermissionsByCategory[]> => {
    return fetchApi<PermissionsByCategory[]>(buildApiUrl(ORG_ENDPOINTS.permissions.byCategory));
  },
};

// ============================================================================
// USER ROLE ASSIGNMENT API
// ============================================================================

export const hierarchyUserRoleApi = {
  /**
   * Assign role to user at a node
   */
  assign: async (data: UserRoleAssignInput): Promise<HierarchyUserRole> => {
    return fetchApi<HierarchyUserRole>(buildApiUrl(ORG_ENDPOINTS.userRoles.assign), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Revoke role from user at a node
   */
  revoke: async (data: UserRoleRevokeInput): Promise<void> => {
    return fetchApi<void>(buildApiUrl(ORG_ENDPOINTS.userRoles.revoke), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// TEAM API
// ============================================================================

export const teamApi = {
  /**
   * Get all teams
   */
  getAll: async (filters?: TeamFilters): Promise<PaginatedResponse<Team>> => {
    const queryString = filters ? buildQueryString(filters) : "";
    return fetchApi<PaginatedResponse<Team>>(buildApiUrl(`${ORG_ENDPOINTS.teams.list}${queryString}`));
  },

  /**
   * Get single team by ID
   */
  getById: async (id: number): Promise<Team> => {
    return fetchApi<Team>(buildApiUrl(ORG_ENDPOINTS.teams.detail(id)));
  },

  /**
   * Create new team
   */
  create: async (data: TeamCreateInput): Promise<Team> => {
    return fetchApi<Team>(buildApiUrl(ORG_ENDPOINTS.teams.create), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update team
   */
  update: async (id: number, data: TeamUpdateInput): Promise<Team> => {
    return fetchApi<Team>(buildApiUrl(ORG_ENDPOINTS.teams.update(id)), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Partial update team
   */
  patch: async (id: number, data: Partial<TeamUpdateInput>): Promise<Team> => {
    return fetchApi<Team>(buildApiUrl(ORG_ENDPOINTS.teams.patch(id)), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete team
   */
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(ORG_ENDPOINTS.teams.delete(id)), {
      method: "DELETE",
    });
  },

  /**
   * Get team members
   */
  getMembers: async (id: number): Promise<HierarchyTeamMember[]> => {
    return fetchApi<HierarchyTeamMember[]>(buildApiUrl(ORG_ENDPOINTS.teams.members(id)));
  },

  /**
   * Add member to team
   */
  addMember: async (id: number, data: TeamMemberAddInput): Promise<HierarchyTeamMember> => {
    return fetchApi<HierarchyTeamMember>(buildApiUrl(ORG_ENDPOINTS.teams.addMember(id)), {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
