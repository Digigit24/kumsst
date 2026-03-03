/**
 * Dashboard Configuration
 *
 * This file controls which dashboard sections are rendered for different roles/permissions.
 * Each section can specify which roles can see it, making it easy to customize
 * dashboards for different user types (including custom roles like HOD, etc.)
 *
 * To add a new dashboard section:
 * 1. Create the component in src/components/dashboard/sections/
 * 2. Add it to the DASHBOARD_SECTIONS array below
 * 3. Specify which roles should see it in the 'allowedRoles' array
 */

export interface DashboardSection {
  id: string;
  component: string; // Component name to import
  allowedRoles: string[]; // Which roles can see this section
  order: number; // Display order (lower = earlier)
}

/**
 * Dashboard Sections Configuration
 *
 * Add or remove sections here to control what appears on the dashboard.
 * Each section will only render if the user has one of the allowedRoles.
 */
export const DASHBOARD_SECTIONS: DashboardSection[] = [
  // ============== ADMIN SECTIONS ==============
  {
    id: 'premium-admin-dashboard',
    component: 'SuperAdminDashboardPremium',
    allowedRoles: ['super_admin', 'college_admin'],
    order: 1,
  },
  // Specific widget used by teachers (removed from admin view to declutter)
  {
    id: 'academic-drilldown-widget',
    component: 'AcademicDrillDownWidget',
    allowedRoles: ['teacher'],
    order: 3,
  },


  // ============== TEACHER SECTIONS ==============
  {
    id: 'teacher-quick-stats',
    component: 'TeacherQuickStats',
    allowedRoles: ['teacher'],
    order: 1,
  },
  {
    id: 'teacher-todays-classes',
    component: 'TeacherTodaysClasses',
    allowedRoles: ['teacher'],
    order: 2,
  },
  {
    id: 'teacher-pending-actions',
    component: 'TeacherPendingActions',
    allowedRoles: ['teacher'],
    order: 3,
  },
  {
    id: 'teacher-assignments',
    component: 'TeacherAssignments',
    allowedRoles: ['teacher'],
    order: 4,
  },
  {
    id: 'teacher-announcements',
    component: 'TeacherAnnouncements',
    allowedRoles: ['teacher'],
    order: 5,
  },

  // ============== STUDENT SECTIONS ==============
  {
    id: 'student-quick-actions',
    component: 'StudentQuickActions',
    allowedRoles: ['student'],
    order: 1,
  },
  {
    id: 'student-priority-cards',
    component: 'StudentPriorityCards',
    allowedRoles: ['student'],
    order: 2,
  },


  {
    id: 'student-upcoming-exams',
    component: 'StudentUpcomingExams',
    allowedRoles: ['student'],
    order: 6,
  },
  {
    id: 'student-assignments',
    component: 'StudentAssignments',
    allowedRoles: ['student'],
    order: 7,
  },

  // ============== STAFF SECTIONS ==============
  {
    id: 'staff-quick-actions',
    component: 'StaffQuickActions',
    allowedRoles: ['staff', 'hr', 'library_manager'],
    order: 1,
  },
  {
    id: 'staff-module-stats',
    component: 'StaffModuleStats',
    allowedRoles: ['staff', 'hr', 'library_manager'],
    order: 2,
  },

  // ============== STORE MANAGER SECTIONS ==============
  {
    id: 'store-manager-stats',
    component: 'StoreManagerStats',
    allowedRoles: ['store_manager'],
    order: 1,
  },
  {
    id: 'store-manager-quick-actions',
    component: 'StoreManagerQuickActions',
    allowedRoles: ['store_manager'],
    order: 2,
  },
  {
    id: 'store-manager-sales-chart',
    component: 'StoreManagerSalesChart',
    allowedRoles: ['store_manager'],
    order: 4,
  },
  {
    id: 'store-manager-recent-activity',
    component: 'StoreManagerRecentActivity',
    allowedRoles: ['store_manager'],
    order: 5,
  },
  {
    id: 'store-manager-pending-indents',
    component: 'StoreManagerPendingIndents',
    allowedRoles: ['store_manager'],
    order: 6,
  },

  // ============== CENTRAL STORE MANAGER SECTIONS ==============
  {
    id: 'central-store-stats',
    component: 'CentralStoreStats',
    allowedRoles: ['central_manager'],
    order: 1,
  },
  {
    id: 'central-store-quick-actions',
    component: 'CentralStoreQuickActions',
    allowedRoles: ['central_manager', 'super_admin'],
    order: 2,
  },
  {
    id: 'central-store-communication',
    component: 'CentralStoreCommunication',
    allowedRoles: ['central_manager', 'super_admin'],
    order: 3,
  },

  // ============== HOSTEL WARDEN SECTIONS ==============
  {
    id: 'hostel-stats',
    component: 'HostelStats',
    allowedRoles: ['hostel_warden', 'hostel_manager', 'super_admin', 'college_admin'],
    order: 1,
  },
  {
    id: 'hostel-overview-cards',
    component: 'HostelOverviewCards',
    allowedRoles: ['hostel_warden', 'hostel_manager', 'super_admin', 'college_admin'],
    order: 2,
  },
  {
    id: 'hostel-quick-actions',
    component: 'HostelQuickActions',
    allowedRoles: ['hostel_warden', 'hostel_manager', 'super_admin', 'college_admin'],
    order: 3,
  },

  // ============== LIBRARY MANAGER SECTIONS ==============
  {
    id: 'library-stats',
    component: 'LibraryStats',
    allowedRoles: ['library_manager', 'super_admin', 'college_admin'],
    order: 1,
  },

  // ============== ACCOUNTANT SECTIONS ==============
  {
    id: 'income-dashboard',
    component: 'IncomeDashboard',
    allowedRoles: ['accountant'],
    order: 1,
  },

  // ============== CLERK SECTIONS ==============
  {
    id: 'clerk-quick-stats',
    component: 'ClerkQuickStats',
    allowedRoles: ['clerk'],
    order: 1,
  },
  {
    id: 'clerk-quick-actions',
    component: 'ClerkQuickActions',
    allowedRoles: ['clerk'],
    order: 2,
  },
];

/**
 * Get sections for a specific role
 */
export function getSectionsForRole(userRole: string): DashboardSection[] {
  return DASHBOARD_SECTIONS
    .filter(section => section.allowedRoles.includes(userRole))
    .sort((a, b) => a.order - b.order);
}

/**
 * Check if a section should be rendered for a user
 */
export function shouldRenderSection(sectionId: string, userRole: string): boolean {
  const section = DASHBOARD_SECTIONS.find(s => s.id === sectionId);
  if (!section) return false;
  return section.allowedRoles.includes(userRole);
}

/**
 * Example: How to add a new role (like HOD - Head of Department)
 *
 * 1. Add HOD-specific sections or modify existing allowedRoles:
 *
 * {
 *   id: 'hod-department-overview',
 *   component: 'HODDepartmentOverview',
 *   allowedRoles: ['hod', 'super_admin'], // HOD and admin can see this
 *   order: 1,
 * },
 *
 * 2. Give HOD access to teacher sections:
 *
 * {
 *   id: 'teacher-todays-classes',
 *   component: 'TeacherTodaysClasses',
 *   allowedRoles: ['teacher', 'hod'], // Now HOD can see this too
 *   order: 2,
 * },
 *
 * 3. Create the HODDepartmentOverview component in sections/
 *
 * This makes it very easy to customize permissions without touching
 * the main Dashboard component!
 */
