/**
 * Dashboard Sections - Modular Components
 *
 * Each section is a self-contained component that can be rendered
 * on the dashboard based on user permissions.
 *
 * To add a new section:
 * 1. Create the component file here
 * 2. Export it below
 * 3. Add it to dashboard.config.ts
 */

// Admin Sections
export { AcademicDrillDownWidget } from './AcademicDrillDownWidget';
export { AdminInstitutionOverview } from './AdminInstitutionOverview';
export { AdminKeyMetrics } from './AdminKeyMetrics';
export { AdminManagementLinks } from './AdminManagementLinks';
export { AdminPendingTasks } from './AdminPendingTasks';
export { AdminQuickActions } from './AdminQuickActions';
export { AdminRecentActivities } from './AdminRecentActivities';
export { AdminSystemAlerts } from './AdminSystemAlerts';
export { AdminUpcomingEvents } from './AdminUpcomingEvents';
export { SuperAdminDashboardPremium } from './SuperAdminDashboardPremium';

// Teacher Sections
export { TeacherAnnouncements } from './TeacherAnnouncements';
export { TeacherAssignments } from './TeacherAssignments';
export { TeacherPendingActions } from './TeacherPendingActions';
export { TeacherQuickStats } from './TeacherQuickStats';
export { TeacherTodaysClasses } from './TeacherTodaysClasses';

// Student Sections
export { StudentAssignments } from './StudentAssignments';
export { StudentAttendanceCalendar } from './StudentAttendanceCalendar';
export { StudentPriorityCards } from './StudentPriorityCards';
export { StudentQuickActions } from './StudentQuickActions';
export { StudentTestMarks } from './StudentTestMarks';
export { StudentTodaysSchedule } from './StudentTodaysSchedule';
export { StudentUpcomingExams } from './StudentUpcomingExams';

// Staff Sections
export { StaffModuleStats } from './StaffModuleStats';
export { StaffQuickActions } from './StaffQuickActions';

// Central Store Sections
export { CentralStoreCommunication } from './CentralStoreCommunication';
export { CentralStoreQuickActions } from './CentralStoreQuickActions';
export { CentralStoreStats } from './CentralStoreStats';

// Hostel Sections
export { HostelOverviewCards } from './HostelOverviewCards';
export { HostelQuickActions } from './HostelQuickActions';
export { HostelStats } from './HostelStats';

// Library Sections
export { LibraryStats } from './LibraryStats';

// Accountant Sections
export { default as IncomeDashboard } from './IncomeDashboard';

// Clerk Sections
export { ClerkQuickStats } from './ClerkQuickStats';
export { ClerkQuickActions } from './ClerkQuickActions';
export { ClerkRecentActivity } from './ClerkRecentActivity';
export { ClerkPendingTasks } from './ClerkPendingTasks';

// Store Manager Sections
export { StoreManagerPendingIndents } from './StoreManagerPendingIndents';
export { StoreManagerQuickActions } from './StoreManagerQuickActions';
export { StoreManagerRecentActivity } from './StoreManagerRecentActivity';
export { StoreManagerSalesChart } from './StoreManagerSalesChart';
export { StoreManagerStats } from './StoreManagerStats';

/**
 * Section Component Map
 *
 * Maps section component names to actual components.
 * This is used by the Dashboard to dynamically render sections.
 */
import { AcademicDrillDownWidget } from './AcademicDrillDownWidget';
import { AdminInstitutionOverview } from './AdminInstitutionOverview';
import { AdminKeyMetrics } from './AdminKeyMetrics';
import { AdminManagementLinks } from './AdminManagementLinks';
import { AdminPendingTasks } from './AdminPendingTasks';
import { AdminQuickActions } from './AdminQuickActions';
import { AdminRecentActivities } from './AdminRecentActivities';
import { AdminSystemAlerts } from './AdminSystemAlerts';
import { AdminUpcomingEvents } from './AdminUpcomingEvents';
import { CentralStoreCommunication } from './CentralStoreCommunication';
import { CentralStoreQuickActions } from './CentralStoreQuickActions';
import { CentralStoreStats } from './CentralStoreStats';
import { HostelOverviewCards } from './HostelOverviewCards';
import { HostelQuickActions } from './HostelQuickActions';
import { HostelStats } from './HostelStats';
import IncomeDashboard from './IncomeDashboard';
import { LibraryStats } from './LibraryStats';
import { StaffModuleStats } from './StaffModuleStats';
import { StaffQuickActions } from './StaffQuickActions';
import { StoreManagerPendingIndents } from './StoreManagerPendingIndents';
import { StoreManagerQuickActions } from './StoreManagerQuickActions';
import { StoreManagerRecentActivity } from './StoreManagerRecentActivity';
import { StoreManagerSalesChart } from './StoreManagerSalesChart';
import { StoreManagerStats } from './StoreManagerStats';
import { StudentAssignments } from './StudentAssignments';
import { StudentAttendanceCalendar } from './StudentAttendanceCalendar';
import { StudentPriorityCards } from './StudentPriorityCards';
import { StudentQuickActions } from './StudentQuickActions';
import { StudentTestMarks } from './StudentTestMarks';
import { StudentTodaysSchedule } from './StudentTodaysSchedule';
import { StudentUpcomingExams } from './StudentUpcomingExams';
import { SuperAdminDashboardPremium } from './SuperAdminDashboardPremium';
import { ClerkQuickActions } from './ClerkQuickActions';
import { ClerkQuickStats } from './ClerkQuickStats';
import { ClerkRecentActivity } from './ClerkRecentActivity';
import { ClerkPendingTasks } from './ClerkPendingTasks';
import { TeacherAnnouncements } from './TeacherAnnouncements';
import { TeacherAssignments } from './TeacherAssignments';
import { TeacherPendingActions } from './TeacherPendingActions';
import { TeacherQuickStats } from './TeacherQuickStats';
import { TeacherTodaysClasses } from './TeacherTodaysClasses';

export const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
  // Admin
  AdminQuickActions,
  AdminKeyMetrics,
  AdminPendingTasks,
  AdminSystemAlerts,
  AdminRecentActivities,
  AdminUpcomingEvents,
  AdminInstitutionOverview,
  AdminManagementLinks,
  AcademicDrillDownWidget,
  SuperAdminDashboardPremium,
  // Teacher
  TeacherQuickStats,
  TeacherTodaysClasses,
  TeacherPendingActions,
  TeacherAssignments,
  TeacherAnnouncements,
  // Student
  StudentQuickActions,
  StudentPriorityCards,
  StudentAttendanceCalendar,
  StudentTestMarks,
  StudentTodaysSchedule,
  StudentUpcomingExams,
  StudentAssignments,
  // Staff
  StaffQuickActions,
  StaffModuleStats,
  // Store Manager (New)
  StoreManagerStats,
  StoreManagerSalesChart,
  StoreManagerRecentActivity,
  StoreManagerQuickActions,
  StoreManagerPendingIndents,
  // Central Store
  CentralStoreStats,
  CentralStoreQuickActions,
  CentralStoreCommunication,
  // Hostel
  HostelStats,
  HostelOverviewCards,
  HostelQuickActions,
  // Library
  LibraryStats,
  // Accountant
  IncomeDashboard,
  // Clerk
  ClerkQuickStats,
  ClerkQuickActions,
  ClerkRecentActivity,
  ClerkPendingTasks,
};
