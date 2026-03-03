/**
 * Super Admin Context
 *
 * Provides global college selection for super admins.
 * When a college is selected in the header, it acts as a global filter
 * across all pages and forms.
 */

import { canSwitchCollege } from '@/utils/auth.utils';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const SUPER_ADMIN_COLLEGE_KEY = 'kumss_super_admin_selected_college';

interface SuperAdminContextType {
  selectedCollege: number | null; // null means "All Colleges"
  setSelectedCollege: (collegeId: number | null) => void;
  isSuperAdminUser: boolean;
  clearSelection: () => void;
  userCollegeId: number | null; // Non-super-admin's assigned college, read once
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export const useSuperAdminContext = () => {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdminContext must be used within SuperAdminProvider');
  }
  return context;
};

interface SuperAdminProviderProps {
  children: ReactNode;
}

export const SuperAdminProvider: React.FC<SuperAdminProviderProps> = ({ children }) => {
  const [selectedCollege, setSelectedCollegeState] = useState<number | null>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem(SUPER_ADMIN_COLLEGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed === null ? null : Number(parsed);
      }
    } catch {
      // corrupted storage — ignore
    }
    return null; // Default to "All Colleges"
  });

  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);

  // Read user college ID once on mount, store in state so useActiveCollegeId doesn't re-read localStorage
  const [userCollegeId, setUserCollegeId] = useState<number | null>(null);

  useEffect(() => {
    // Check if user is super admin and read college ID once
    try {
      const storedUser = localStorage.getItem('kumss_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const isSuper = canSwitchCollege(user);
        setIsSuperAdminUser(isSuper);
        setUserCollegeId(user.college || null);
      }
    } catch {
      // corrupted storage — ignore
    }
  }, []);

  const setSelectedCollege = useCallback((collegeId: number | null) => {
    setSelectedCollegeState(collegeId);

    // Persist to localStorage
    try {
      localStorage.setItem(SUPER_ADMIN_COLLEGE_KEY, JSON.stringify(collegeId));
    } catch {
      // storage write failed — ignore
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCollege(null);
  }, [setSelectedCollege]);

  const value = useMemo(() => ({
    selectedCollege,
    setSelectedCollege,
    isSuperAdminUser,
    clearSelection,
    userCollegeId,
  }), [selectedCollege, setSelectedCollege, isSuperAdminUser, clearSelection, userCollegeId]);

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
};

/**
 * Hook to get the active college ID for API calls
 * Returns the selected college ID or null for "All Colleges"
 */
export const useActiveCollegeId = (): number | null => {
  const { selectedCollege, isSuperAdminUser, userCollegeId } = useSuperAdminContext();

  if (!isSuperAdminUser) {
    // For non-super admins, return their assigned college (read once from context, not localStorage)
    return userCollegeId;
  }

  // For super admins, return the selected college
  return selectedCollege;
};
