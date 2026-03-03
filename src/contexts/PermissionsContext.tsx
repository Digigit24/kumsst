/**
 * Permissions Context Provider
 *
 * Provides normalized permissions throughout the app
 * Loads permissions once on mount and exposes easy-to-use boolean flags
 */

import { useAuth } from '@/hooks/useAuth';
import {
  fetchUserPermissions,
  normalizePermissions,
} from '@/services/permissions.service';
import type {
  NormalizedPermissions,
  PermissionsResponse,
  UserContext,
  UserPermissionsJSON,
} from '@/types/permissions.types';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// ============================================================================
// CONTEXT TYPE
// ============================================================================

interface PermissionsContextType {
  permissions: NormalizedPermissions | null;
  rawPermissions: UserPermissionsJSON | null;
  userContext: UserContext | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

// ============================================================================
// HOOK
// ============================================================================

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider');
  }
  return context;
};

// ============================================================================
// PROVIDER
// ============================================================================

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const { token } = useAuth();
  const [permissions, setPermissions] = useState<NormalizedPermissions | null>(null);
  const [rawPermissions, setRawPermissions] = useState<UserPermissionsJSON | null>(null);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPermissions = useCallback(async () => {
    const currentToken = token || localStorage.getItem('kumss_auth_token');

    if (!currentToken) {
      setIsLoading(false);
      setPermissions(null);
      setRawPermissions(null);
      setUserContext(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response: PermissionsResponse = await fetchUserPermissions();

      setRawPermissions(response.user_permissions);
      setUserContext(response.user_context);

      if (!response.user_context) {
        throw new Error('User context is missing from permissions response');
      }

      const normalized = normalizePermissions(
        response.user_permissions,
        response.user_context
      );
      setPermissions(normalized);
    } catch (err: any) {
      setError(typeof err.message === 'string' ? err.message : 'Failed to load permissions');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const value = useMemo(() => ({
    permissions,
    rawPermissions,
    userContext,
    isLoading,
    error,
    refetch: loadPermissions,
  }), [permissions, rawPermissions, userContext, isLoading, error, loadPermissions]);

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};
