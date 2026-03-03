
import { User } from '@/types/auth.types';

/**
 * Check if a user is a Super Admin
 * Checks both is_superuser flag and user_type
 */
export const isSuperAdmin = (user?: User | null): boolean => {
  if (!user) {
    // Try to get from localStorage if not provided
    // Try both possible keys for compatibility
    const userStr = localStorage.getItem('kumss_user') || localStorage.getItem('user');
    if (userStr) {
      try {
        const localUser = JSON.parse(userStr);
        // Super Admin OR Chief Accountant (accountant with no assigned college)
        // Super Admin OR Chief Roles (accountant / hostel_manager with no assigned college)
        // Global roles: clerk, construction_head, jr_engineer (no assigned college)
        return localUser.is_superuser === true ||
          localUser.user_type === 'super_admin' ||
          // Allow Chief Roles (accountant with no assigned college) or all Hostel Managers to switch colleges
          (localUser.user_type === 'accountant' && !localUser.college) ||
          localUser.user_type === 'hostel_manager' ||
          (localUser.user_type === 'clerk' && !localUser.college) ||
          (localUser.user_type === 'construction_head' && !localUser.college) ||
          (localUser.user_type === 'jr_engineer' && !localUser.college);
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  return user.is_superuser === true || user.user_type === 'super_admin' || 
         (user.user_type === 'accountant' && !user.college) || 
         user.user_type === 'hostel_manager' ||
         (user.user_type === 'clerk' && !user.college) ||
         (user.user_type === 'construction_head' && !user.college) ||
         (user.user_type === 'jr_engineer' && !user.college);
};

/**
 * Check if a user can switch colleges (Super Admin, Chief Accountant, Chief Hostel Manager)
 */
export const canSwitchCollege = (user?: User | null): boolean => {
  if (isSuperAdmin(user)) return true;
  
  if (!user) {
    const userStr = localStorage.getItem('kumss_user') || localStorage.getItem('user');
    if (userStr) {
      try {
        const localUser = JSON.parse(userStr);
        return (localUser.user_type === 'accountant' && !localUser.college) ||
               localUser.user_type === 'hostel_manager' ||
               (localUser.user_type === 'clerk' && !localUser.college) ||
               (localUser.user_type === 'construction_head' && !localUser.college) ||
               (localUser.user_type === 'jr_engineer' && !localUser.college);
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  return (user.user_type === 'accountant' && !user.college) ||
         user.user_type === 'hostel_manager' ||
         (user.user_type === 'clerk' && !user.college) ||
         (user.user_type === 'construction_head' && !user.college) ||
         (user.user_type === 'jr_engineer' && !user.college);
};

/**
 * Get the current user's college ID
 * Returns null if user is super admin (as they should select college)
 * Returns college ID for regular users
 */
export const getCurrentUserCollege = (user?: User | null): number | null => {
  if (isSuperAdmin(user)) {
    return null;
  }

  if (!user) {
    // Try to get from localStorage
    // Try both possible keys for compatibility
    const userStr = localStorage.getItem('kumss_user') || localStorage.getItem('user');
    if (userStr) {
      try {
        const localUser = JSON.parse(userStr);
        return localUser.college || localUser.college_id || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  return user.college || (user as any).college_id || null;
};
