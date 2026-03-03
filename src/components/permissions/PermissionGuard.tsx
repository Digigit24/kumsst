/**
 * Permission Guard Components
 *
 * Utility components for conditionally rendering based on permissions
 */

import React, { ReactNode } from 'react';
import { usePermissions } from '@/contexts/PermissionsContext';
import type { NormalizedPermissions } from '@/types/permissions.types';

interface PermissionGuardProps {
  children: ReactNode;
  permission: keyof NormalizedPermissions;
  fallback?: ReactNode;
}

/**
 * Renders children only if user has the specified permission
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  fallback = null,
}) => {
  const { permissions } = usePermissions();

  if (!permissions || !permissions[permission]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface MultiPermissionGuardProps {
  children: ReactNode;
  permissions: Array<keyof NormalizedPermissions>;
  requireAll?: boolean; // If true, all permissions required. If false, any permission is enough
  fallback?: ReactNode;
}

/**
 * Renders children only if user has the specified permissions
 */
export const MultiPermissionGuard: React.FC<MultiPermissionGuardProps> = ({
  children,
  permissions: permissionKeys,
  requireAll = false,
  fallback = null,
}) => {
  const { permissions } = usePermissions();

  if (!permissions) {
    return <>{fallback}</>;
  }

  const hasPermission = requireAll
    ? permissionKeys.every((key) => permissions[key])
    : permissionKeys.some((key) => permissions[key]);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface RoleGuardProps {
  children: ReactNode;
  roles: Array<'isSuperAdmin' | 'isCollegeAdmin' | 'isTeacher' | 'isStudent'>;
  fallback?: ReactNode;
}

/**
 * Renders children only if user has one of the specified roles
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ children, roles, fallback = null }) => {
  const { permissions } = usePermissions();

  if (!permissions) {
    return <>{fallback}</>;
  }

  const hasRole = roles.some((role) => permissions[role]);

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
