/**
 * API Configuration for KUMSS ERP
 * Base URL and all API endpoints
 */
import type { User } from "../types/auth.types";
// Base API URL - Local Development
//export const API_BASE_URL = "http://127.0.0.1:8000";
// export const API_BASE_URL ="https://kumsserp2.celiyo.com"
export const API_BASE_URL ="https://kumsst.celiyo.com"

export const WS_CHAT_URL = "ws://127.0.0.1:8000/ws/chat/";
export const WS_NOTIFICATIONS_URL = "ws://127.0.0.1:8000/ws/notifications/";

// Media files base URL (for serving uploaded files like quotations, images, etc.)
// This is separate from API_BASE_URL and uses window.location.origin for better compatibility
export const getMediaBaseUrl = (): string => {
  // Try environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    // Remove /api/v1 suffix if present
    return import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1$/, '');
  }

  // Use window.location.origin if available (works for production)
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // If on localhost or 127.0.0.1, check if backend is on different port
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      // Try localhost:8000 first, then 127.0.0.1:8000
      return API_BASE_URL;
    }
    // Production: use same origin
    return origin;
  }

  // Fallback
  return API_BASE_URL;
};

// Base API URL - Production
// export const API_BASE_URL = "https://kumsserp2.celiyo.com";
// export const WS_CHAT_URL = "wss://kumsserp2.celiyo.com/ws/v1/chat/";
// export const WS_NOTIFICATIONS_URL =
//   "wss://kumsserp2.celiyo.com/ws/v1/notifications/";

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Teachers Module
  teachers: {
    list: "/api/v1/teachers/teachers/",
    create: "/api/v1/teachers/teachers/",
    detail: (id: number) => `/api/v1/teachers/teachers/${id}/`,
    update: (id: number) => `/api/v1/teachers/teachers/${id}/`,
    patch: (id: number) => `/api/v1/teachers/teachers/${id}/`,
    delete: (id: number) => `/api/v1/teachers/teachers/${id}/`,
    schedule: "/api/v1/teachers/teachers/schedule/",
    assignments: {
      list: "/api/v1/teachers/assignments/",
      create: "/api/v1/teachers/assignments/",
      detail: (id: number) => `/api/v1/teachers/assignments/${id}/`,
      update: (id: number) => `/api/v1/teachers/assignments/${id}/`,
      patch: (id: number) => `/api/v1/teachers/assignments/${id}/`,
      delete: (id: number) => `/api/v1/teachers/assignments/${id}/`,
    },
    homework: {
      list: "/api/v1/teachers/homework/",
      create: "/api/v1/teachers/homework/",
      detail: (id: number) => `/api/v1/teachers/homework/${id}/`,
      update: (id: number) => `/api/v1/teachers/homework/${id}/`,
      patch: (id: number) => `/api/v1/teachers/homework/${id}/`,
      delete: (id: number) => `/api/v1/teachers/homework/${id}/`,
    },
    homeworkSubmissions: {
      list: "/api/v1/teachers/homework-submissions/",
      create: "/api/v1/teachers/homework-submissions/",
      detail: (id: number) => `/api/v1/teachers/homework-submissions/${id}/`,
      update: (id: number) => `/api/v1/teachers/homework-submissions/${id}/`,
      patch: (id: number) => `/api/v1/teachers/homework-submissions/${id}/`,
      delete: (id: number) => `/api/v1/teachers/homework-submissions/${id}/`,
    },
    myStudents: "/api/v1/teachers/my-students/",
  },

  // Authentication
  auth: {
    login: "/api/v1/auth/login/",
    logout: "/api/v1/auth/logout/",
    passwordChange: "/api/v1/auth/password/change/",
    passwordReset: "/api/v1/auth/password/reset/",
    passwordResetConfirm: "/api/v1/auth/password/reset/confirm/",
    user: "/api/v1/auth/user/",
    forgotPassword: "/api/v1/accounts/forgot-password/",
    resetPassword: "/api/v1/accounts/reset-password/",
  },

  // Fees Module
  fees: {
    feeCollections: {
      list: "/api/v1/fees/fee-collections/",
      detail: (id: number) => `/api/v1/fees/fee-collections/${id}/`,
    },
  },

  // Finance Module
  finance: {
    otherExpenses: {
      list: "/api/v1/finance/other-expenses/",
      create: "/api/v1/finance/other-expenses/",
      detail: (id: number) => `/api/v1/finance/other-expenses/${id}/`,
      update: (id: number) => `/api/v1/finance/other-expenses/${id}/`,
      patch: (id: number) => `/api/v1/finance/other-expenses/${id}/`,
      delete: (id: number) => `/api/v1/finance/other-expenses/${id}/`,
    },
    appExpense: {
      list: "/api/v1/finance/app-expense/",
      create: "/api/v1/finance/app-expense/",
      detail: (id: number) => `/api/v1/finance/app-expense/${id}/`,
      update: (id: number) => `/api/v1/finance/app-expense/${id}/`,
      patch: (id: number) => `/api/v1/finance/app-expense/${id}/`,
      delete: (id: number) => `/api/v1/finance/app-expense/${id}/`,
    },
    appIncome: {
      list: "/api/v1/finance/app-income/",
      create: "/api/v1/finance/app-income/",
      detail: (id: number) => `/api/v1/finance/app-income/${id}/`,
      update: (id: number) => `/api/v1/finance/app-income/${id}/`,
      patch: (id: number) => `/api/v1/finance/app-income/${id}/`,
      delete: (id: number) => `/api/v1/finance/app-income/${id}/`,
    },
    appTotal: {
      list: "/api/v1/finance/app-total/",
      create: "/api/v1/finance/app-total/",
      detail: (id: number) => `/api/v1/finance/app-total/${id}/`,
      update: (id: number) => `/api/v1/finance/app-total/${id}/`,
      patch: (id: number) => `/api/v1/finance/app-total/${id}/`,
      delete: (id: number) => `/api/v1/finance/app-total/${id}/`,
    },
    financeTotal: {
      list: "/api/v1/finance/finance-total/",
      create: "/api/v1/finance/finance-total/",
      detail: (id: number) => `/api/v1/finance/finance-total/${id}/`,
      update: (id: number) => `/api/v1/finance/finance-total/${id}/`,
      patch: (id: number) => `/api/v1/finance/finance-total/${id}/`,
      delete: (id: number) => `/api/v1/finance/finance-total/${id}/`,
    },
    reports: {
      appSummary: "/api/v1/finance/reports/app_summary/",
      totals: "/api/v1/finance/reports/totals/",
      monthly: "/api/v1/finance/reports/monthly/",
      dashboard: "/api/v1/finance/reports/dashboard/",
      projections: "/api/v1/finance/reports/projections/",
      paymentMethods: "/api/v1/finance/reports/payment_methods/",
      exportSummary: "/api/v1/finance/reports/export_summary/",
      exportTransactions: "/api/v1/finance/reports/export_transactions/",
    },
    transactions: {
      list: "/api/v1/finance/transactions/",
    },
  },

  stats: {
    dashboard: "/api/v1/stats/dashboard/",
    procurementDrillDown: {
      overview: (queryString: string = "") =>
        `/api/v1/stats/procurement-drilldown/overview/${queryString}`,
      centralStore: (id: number, queryString: string = "") =>
        `/api/v1/stats/procurement-drilldown/${id}/central-store/${queryString}`,
      requirement: (id: number) =>
        `/api/v1/stats/procurement-drilldown/${id}/requirement/`,
      purchaseOrder: (id: number) =>
        `/api/v1/stats/procurement-drilldown/${id}/purchase-order/`,
      grn: (id: number) => `/api/v1/stats/procurement-drilldown/${id}/grn/`,
      inventory: (id: number, queryString: string = "") =>
        `/api/v1/stats/procurement-drilldown/${id}/inventory/${queryString}`,
      supplierPerformance: (queryString: string = "") =>
        `/api/v1/stats/procurement-drilldown/supplier-performance/${queryString}`,
    },
    attendanceDrillDown: {
      college: (queryString: string = "") =>
        `/api/v1/stats/attendance-drilldown/college/${queryString}`,
      program: (id: number, queryString: string = "") =>
        `/api/v1/stats/attendance-drilldown/${id}/program/${queryString}`,
      class: (id: number, queryString: string = "") =>
        `/api/v1/stats/attendance-drilldown/${id}/class/${queryString}`,
      section: (id: number, queryString: string = "") =>
        `/api/v1/stats/attendance-drilldown/${id}/section/${queryString}`,
      subject: (id: number, queryString: string = "") =>
        `/api/v1/stats/attendance-drilldown/${id}/subject/${queryString}`,
      student: (id: number, queryString: string = "") =>
        `/api/v1/stats/attendance-drilldown/${id}/student/${queryString}`,
      lowAttendanceAlerts: (queryString: string = "") =>
        `/api/v1/stats/attendance-drilldown/low-attendance-alerts/${queryString}`,
    },
    student360: {
      profile: (id: number, queryString: string = "") =>
        `/api/v1/stats/student-360/${id}/profile/${queryString}`,
      summary: (id: number, queryString: string = "") =>
        `/api/v1/stats/student-360/${id}/summary/${queryString}`,
    },
  },

  // Core Module - Colleges
  colleges: {
    list: "/api/v1/core/colleges/",
    create: "/api/v1/core/colleges/",
    detail: (id: number) => `/api/v1/core/colleges/${id}/`,
    update: (id: number) => `/api/v1/core/colleges/${id}/`,
    patch: (id: number) => `/api/v1/core/colleges/${id}/`,
    delete: (id: number) => `/api/v1/core/colleges/${id}/`,
    active: "/api/v1/core/colleges/active/",
    bulkDelete: "/api/v1/core/colleges/bulk_delete/",
  },

  // Core Module - Academic Years
  academicYears: {
    list: "/api/v1/core/academic-years/",
    create: "/api/v1/core/academic-years/",
    detail: (id: number) => `/api/v1/core/academic-years/${id}/`,
    update: (id: number) => `/api/v1/core/academic-years/${id}/`,
    patch: (id: number) => `/api/v1/core/academic-years/${id}/`,
    delete: (id: number) => `/api/v1/core/academic-years/${id}/`,
    current: "/api/v1/core/academic-years/current/",
  },

  // Core Module - Academic Sessions
  academicSessions: {
    list: "/api/v1/core/academic-sessions/",
    create: "/api/v1/core/academic-sessions/",
    detail: (id: number) => `/api/v1/core/academic-sessions/${id}/`,
    update: (id: number) => `/api/v1/core/academic-sessions/${id}/`,
    patch: (id: number) => `/api/v1/core/academic-sessions/${id}/`,
    delete: (id: number) => `/api/v1/core/academic-sessions/${id}/`,
  },

  // Core Module - Holidays
  holidays: {
    list: "/api/v1/core/holidays/",
    create: "/api/v1/core/holidays/",
    detail: (id: number) => `/api/v1/core/holidays/${id}/`,
    update: (id: number) => `/api/v1/core/holidays/${id}/`,
    patch: (id: number) => `/api/v1/core/holidays/${id}/`,
    delete: (id: number) => `/api/v1/core/holidays/${id}/`,
  },

  // Core Module - Weekends
  weekends: {
    list: "/api/v1/core/weekends/",
    create: "/api/v1/core/weekends/",
    detail: (id: number) => `/api/v1/core/weekends/${id}/`,
    update: (id: number) => `/api/v1/core/weekends/${id}/`,
    patch: (id: number) => `/api/v1/core/weekends/${id}/`,
    delete: (id: number) => `/api/v1/core/weekends/${id}/`,
  },

  // Core Module - System Settings
  systemSettings: {
    list: "/api/v1/core/system-settings/",
    create: "/api/v1/core/system-settings/",
    detail: (id: number) => `/api/v1/core/system-settings/${id}/`,
    update: (id: number) => `/api/v1/core/system-settings/${id}/`,
    patch: (id: number) => `/api/v1/core/system-settings/${id}/`,
  },

  // Core Module - Notification Settings
  notificationSettings: {
    list: "/api/v1/core/notification-settings/",
    create: "/api/v1/core/notification-settings/",
    detail: (id: number) => `/api/v1/core/notification-settings/${id}/`,
    update: (id: number) => `/api/v1/core/notification-settings/${id}/`,
    patch: (id: number) => `/api/v1/core/notification-settings/${id}/`,
  },

  // Core Module - Activity Logs (Read-Only)
  activityLogs: {
    list: "/api/v1/core/activity-logs/",
    detail: (id: number) => `/api/v1/core/activity-logs/${id}/`,
    clearLogs: "/api/v1/core/activity-logs/clear_logs/",
  },

  // Accounts Module - Users
  users: {
    list: "/api/v1/accounts/users/",
    create: "/api/v1/accounts/users/",
    detail: (id: string) => `/api/v1/accounts/users/${id}/`,
    update: (id: string) => `/api/v1/accounts/users/${id}/`,
    patch: (id: string) => `/api/v1/accounts/users/${id}/`,
    delete: (id: string) => `/api/v1/accounts/users/${id}/`,
    me: "/api/v1/accounts/users/me/",
    changePassword: "/api/v1/accounts/users/change_password/",
    bulkDelete: "/api/v1/accounts/users/bulk_delete/",
    bulkActivate: "/api/v1/accounts/users/bulk_activate/",
    bulkUpdateType: "/api/v1/accounts/users/bulk_update_type/",
    byType: (type: string) => `/api/v1/accounts/users/by-type/${type}/`,
  },

  // Accounts Module - Roles
  roles: {
    list: "/api/v1/accounts/roles/",
    create: "/api/v1/accounts/roles/",
    detail: (id: number) => `/api/v1/accounts/roles/${id}/`,
    update: (id: number) => `/api/v1/accounts/roles/${id}/`,
    patch: (id: number) => `/api/v1/accounts/roles/${id}/`,
    delete: (id: number) => `/api/v1/accounts/roles/${id}/`,
    tree: "/api/v1/accounts/roles/tree/",
    addChild: (id: number) => `/api/v1/accounts/roles/${id}/add_child/`,
    teamMembers: (id: number) => `/api/v1/accounts/roles/${id}/team_members/`,
    hierarchyPath: (id: number) =>
      `/api/v1/accounts/roles/${id}/hierarchy_path/`,
    descendants: (id: number) => `/api/v1/accounts/roles/${id}/descendants/`,
  },

  // Accounts Module - User Roles
  userRoles: {
    list: "/api/v1/accounts/user-roles/",
    create: "/api/v1/accounts/user-roles/",
    detail: (id: number) => `/api/v1/accounts/user-roles/${id}/`,
    update: (id: number) => `/api/v1/accounts/user-roles/${id}/`,
    patch: (id: number) => `/api/v1/accounts/user-roles/${id}/`,
    delete: (id: number) => `/api/v1/accounts/user-roles/${id}/`,
  },

  // Accounts Module - Departments
  departments: {
    list: "/api/v1/accounts/departments/",
    create: "/api/v1/accounts/departments/",
    detail: (id: number) => `/api/v1/accounts/departments/${id}/`,
    update: (id: number) => `/api/v1/accounts/departments/${id}/`,
    patch: (id: number) => `/api/v1/accounts/departments/${id}/`,
    delete: (id: number) => `/api/v1/accounts/departments/${id}/`,
  },

  // Accounts Module - User Profiles
  userProfiles: {
    list: "/api/v1/accounts/user-profiles/",
    create: "/api/v1/accounts/user-profiles/",
    detail: (id: number) => `/api/v1/accounts/user-profiles/${id}/`,
    update: (id: number) => `/api/v1/accounts/user-profiles/${id}/`,
    patch: (id: number) => `/api/v1/accounts/user-profiles/${id}/`,
    delete: (id: number) => `/api/v1/accounts/user-profiles/${id}/`,
    me: "/api/v1/accounts/user-profiles/me/",
  },

  // Academic Module - Faculties
  faculties: {
    list: "/api/v1/academic/faculties/",
    create: "/api/v1/academic/faculties/",
    detail: (id: number) => `/api/v1/academic/faculties/${id}/`,
    update: (id: number) => `/api/v1/academic/faculties/${id}/`,
    patch: (id: number) => `/api/v1/academic/faculties/${id}/`,
    delete: (id: number) => `/api/v1/academic/faculties/${id}/`,
  },

  // Academic Module - Programs
  programs: {
    list: "/api/v1/academic/programs/",
    create: "/api/v1/academic/programs/",
    detail: (id: number) => `/api/v1/academic/programs/${id}/`,
    update: (id: number) => `/api/v1/academic/programs/${id}/`,
    patch: (id: number) => `/api/v1/academic/programs/${id}/`,
    delete: (id: number) => `/api/v1/academic/programs/${id}/`,
  },

  // Academic Module - Classes
  classes: {
    list: "/api/v1/academic/classes/",
    create: "/api/v1/academic/classes/",
    detail: (id: number) => `/api/v1/academic/classes/${id}/`,
    update: (id: number) => `/api/v1/academic/classes/${id}/`,
    patch: (id: number) => `/api/v1/academic/classes/${id}/`,
    delete: (id: number) => `/api/v1/academic/classes/${id}/`,
  },

  // Academic Module - Sections
  sections: {
    list: "/api/v1/academic/sections/",
    create: "/api/v1/academic/sections/",
    detail: (id: number) => `/api/v1/academic/sections/${id}/`,
    update: (id: number) => `/api/v1/academic/sections/${id}/`,
    patch: (id: number) => `/api/v1/academic/sections/${id}/`,
    delete: (id: number) => `/api/v1/academic/sections/${id}/`,
  },

  // Academic Module - Subjects
  subjects: {
    list: "/api/v1/academic/subjects/",
    create: "/api/v1/academic/subjects/",
    detail: (id: number) => `/api/v1/academic/subjects/${id}/`,
    update: (id: number) => `/api/v1/academic/subjects/${id}/`,
    patch: (id: number) => `/api/v1/academic/subjects/${id}/`,
    delete: (id: number) => `/api/v1/academic/subjects/${id}/`,
  },

  // Academic Module - Optional Subjects
  optionalSubjects: {
    list: "/api/v1/academic/optional-subjects/",
    create: "/api/v1/academic/optional-subjects/",
    detail: (id: number) => `/api/v1/academic/optional-subjects/${id}/`,
    update: (id: number) => `/api/v1/academic/optional-subjects/${id}/`,
    patch: (id: number) => `/api/v1/academic/optional-subjects/${id}/`,
    delete: (id: number) => `/api/v1/academic/optional-subjects/${id}/`,
  },

  // Academic Module - Subject Assignments
  subjectAssignments: {
    list: "/api/v1/academic/subject-assignments/",
    create: "/api/v1/academic/subject-assignments/",
    detail: (id: number) => `/api/v1/academic/subject-assignments/${id}/`,
    update: (id: number) => `/api/v1/academic/subject-assignments/${id}/`,
    patch: (id: number) => `/api/v1/academic/subject-assignments/${id}/`,
    delete: (id: number) => `/api/v1/academic/subject-assignments/${id}/`,
  },

  // Academic Module - Classrooms
  classrooms: {
    list: "/api/v1/academic/classrooms/",
    create: "/api/v1/academic/classrooms/",
    detail: (id: number) => `/api/v1/academic/classrooms/${id}/`,
    update: (id: number) => `/api/v1/academic/classrooms/${id}/`,
    patch: (id: number) => `/api/v1/academic/classrooms/${id}/`,
    delete: (id: number) => `/api/v1/academic/classrooms/${id}/`,
  },

  // Academic Module - Class Times
  classTimes: {
    list: "/api/v1/academic/class-times/",
    create: "/api/v1/academic/class-times/",
    detail: (id: number) => `/api/v1/academic/class-times/${id}/`,
    update: (id: number) => `/api/v1/academic/class-times/${id}/`,
    patch: (id: number) => `/api/v1/academic/class-times/${id}/`,
    delete: (id: number) => `/api/v1/academic/class-times/${id}/`,
  },

  // Academic Module - Timetable
  timetable: {
    list: "/api/v1/academic/timetable/",
    create: "/api/v1/academic/timetable/",
    detail: (id: number) => `/api/v1/academic/timetable/${id}/`,
    update: (id: number) => `/api/v1/academic/timetable/${id}/`,
    patch: (id: number) => `/api/v1/academic/timetable/${id}/`,
    delete: (id: number) => `/api/v1/academic/timetable/${id}/`,
  },

  // Academic Module - Lab Schedules
  labSchedules: {
    list: "/api/v1/academic/lab-schedules/",
    create: "/api/v1/academic/lab-schedules/",
    detail: (id: number) => `/api/v1/academic/lab-schedules/${id}/`,
    update: (id: number) => `/api/v1/academic/lab-schedules/${id}/`,
    patch: (id: number) => `/api/v1/academic/lab-schedules/${id}/`,
    delete: (id: number) => `/api/v1/academic/lab-schedules/${id}/`,
  },

  // Academic Module - Class Teachers
  classTeachers: {
    list: "/api/v1/academic/class-teachers/",
    create: "/api/v1/academic/class-teachers/",
    detail: (id: number) => `/api/v1/academic/class-teachers/${id}/`,
    update: (id: number) => `/api/v1/academic/class-teachers/${id}/`,
    patch: (id: number) => `/api/v1/academic/class-teachers/${id}/`,
    delete: (id: number) => `/api/v1/academic/class-teachers/${id}/`,
  },

  // Academic Module - Syllabus
  syllabus: {
    list: "/api/v1/academic/syllabus/",
    create: "/api/v1/academic/syllabus/",
    detail: (id: number) => `/api/v1/academic/syllabus/${id}/`,
    delete: (id: number) => `/api/v1/academic/syllabus/${id}/`,
    mySyllabi: "/api/v1/academic/syllabus/my-syllabi/",
  },

  // Students Module - Categories
  studentCategories: {
    list: "/api/v1/students/categories/",
    create: "/api/v1/students/categories/",
    detail: (id: number) => `/api/v1/students/categories/${id}/`,
    update: (id: number) => `/api/v1/students/categories/${id}/`,
    patch: (id: number) => `/api/v1/students/categories/${id}/`,
    delete: (id: number) => `/api/v1/students/categories/${id}/`,
  },

  // Students Module - Groups
  studentGroups: {
    list: "/api/v1/students/groups/",
    create: "/api/v1/students/groups/",
    detail: (id: number) => `/api/v1/students/groups/${id}/`,
    update: (id: number) => `/api/v1/students/groups/${id}/`,
    patch: (id: number) => `/api/v1/students/groups/${id}/`,
    delete: (id: number) => `/api/v1/students/groups/${id}/`,
    addStudents: (id: number) => `/api/v1/students/groups/${id}/add-students/`,
    removeStudents: (id: number) => `/api/v1/students/groups/${id}/remove-students/`,
  },

  // Students Module - Students
  students: {
    list: "/api/v1/students/students/",
    create: "/api/v1/students/students/",
    detail: (id: number) => `/api/v1/students/students/${id}/`,
    update: (id: number) => `/api/v1/students/students/${id}/`,
    patch: (id: number) => `/api/v1/students/students/${id}/`,
    delete: (id: number) => `/api/v1/students/students/${id}/`,
    import: {
      preview: "/api/v1/students/import/preview/",
      process: "/api/v1/students/import/process/",
      status: (jobId: number) => `/api/v1/students/import/status/${jobId}/`,
    },
  },

  // Students Module - Guardians
  guardians: {
    list: "/api/v1/students/guardians/",
    create: "/api/v1/students/guardians/",
    detail: (id: number) => `/api/v1/students/guardians/${id}/`,
    update: (id: number) => `/api/v1/students/guardians/${id}/`,
    patch: (id: number) => `/api/v1/students/guardians/${id}/`,
    delete: (id: number) => `/api/v1/students/guardians/${id}/`,
  },

  // Students Module - Student Guardians
  studentGuardians: {
    list: "/api/v1/students/student-guardians/",
    create: "/api/v1/students/student-guardians/",
    detail: (id: number) => `/api/v1/students/student-guardians/${id}/`,
    update: (id: number) => `/api/v1/students/student-guardians/${id}/`,
    patch: (id: number) => `/api/v1/students/student-guardians/${id}/`,
    delete: (id: number) => `/api/v1/students/student-guardians/${id}/`,
  },

  // Students Module - Addresses
  studentAddresses: {
    list: "/api/v1/students/addresses/",
    create: "/api/v1/students/addresses/",
    detail: (id: number) => `/api/v1/students/addresses/${id}/`,
    update: (id: number) => `/api/v1/students/addresses/${id}/`,
    patch: (id: number) => `/api/v1/students/addresses/${id}/`,
    delete: (id: number) => `/api/v1/students/addresses/${id}/`,
  },

  // Students Module - Documents
  studentDocuments: {
    list: "/api/v1/students/documents/",
    create: "/api/v1/students/documents/",
    detail: (id: number) => `/api/v1/students/documents/${id}/`,
    update: (id: number) => `/api/v1/students/documents/${id}/`,
    patch: (id: number) => `/api/v1/students/documents/${id}/`,
    delete: (id: number) => `/api/v1/students/documents/${id}/`,
  },

  // Students Module - Medical Records
  studentMedicalRecords: {
    list: "/api/v1/students/medical-records/",
    create: "/api/v1/students/medical-records/",
    detail: (id: number) => `/api/v1/students/medical-records/${id}/`,
    update: (id: number) => `/api/v1/students/medical-records/${id}/`,
    patch: (id: number) => `/api/v1/students/medical-records/${id}/`,
    delete: (id: number) => `/api/v1/students/medical-records/${id}/`,
  },

  // Students Module - Previous Academic Records
  previousAcademicRecords: {
    list: "/api/v1/students/previous-records/",
    create: "/api/v1/students/previous-records/",
    detail: (id: number) => `/api/v1/students/previous-records/${id}/`,
    update: (id: number) => `/api/v1/students/previous-records/${id}/`,
    patch: (id: number) => `/api/v1/students/previous-records/${id}/`,
    delete: (id: number) => `/api/v1/students/previous-records/${id}/`,
  },

  // Students Module - Promotions
  studentPromotions: {
    list: "/api/v1/students/promotions/",
    create: "/api/v1/students/promotions/",
    detail: (id: number) => `/api/v1/students/promotions/${id}/`,
    update: (id: number) => `/api/v1/students/promotions/${id}/`,
    patch: (id: number) => `/api/v1/students/promotions/${id}/`,
    delete: (id: number) => `/api/v1/students/promotions/${id}/`,
  },

  // Students Module - Certificates
  certificates: {
    list: "/api/v1/students/certificates/",
    create: "/api/v1/students/certificates/",
    detail: (id: number) => `/api/v1/students/certificates/${id}/`,
    update: (id: number) => `/api/v1/students/certificates/${id}/`,
    patch: (id: number) => `/api/v1/students/certificates/${id}/`,
    delete: (id: number) => `/api/v1/students/certificates/${id}/`,
  },

  // Students Module - ID Cards
  studentIDCards: {
    list: "/api/v1/students/id-cards/",
    create: "/api/v1/students/id-cards/",
    detail: (id: number) => `/api/v1/students/id-cards/${id}/`,
    update: (id: number) => `/api/v1/students/id-cards/${id}/`,
    patch: (id: number) => `/api/v1/students/id-cards/${id}/`,
    delete: (id: number) => `/api/v1/students/id-cards/${id}/`,
  },

  // Student - My Fees
  myFees: {
    list: "/api/v1/students/my-fees/",
    detail: (id: number) => `/api/v1/students/my-fees/${id}/`,
    receipt: (id: number) => `/api/v1/students/my-fees/${id}/receipt/`,
  },

  // Student - Assignments & Submissions
  studentHomework: {
    list: "/api/v1/students/homework/",
    detail: (id: number) => `/api/v1/students/homework/${id}/`,
  },
  studentSubmissions: {
    create: "/api/v1/students/submissions/",
    list: "/api/v1/students/submissions/",
    detail: (id: number) => `/api/v1/students/submissions/${id}/`,
    update: (id: number) => `/api/v1/students/submissions/${id}/`,
    patch: (id: number) => `/api/v1/students/submissions/${id}/`,
  },
  studentHomeworkSubmissions: {
    create: "/api/v1/students/homework-submissions/",
    list: "/api/v1/students/homework-submissions/",
    detail: (id: number) => `/api/v1/students/homework-submissions/${id}/`,
    update: (id: number) => `/api/v1/students/homework-submissions/${id}/`,
    patch: (id: number) => `/api/v1/students/homework-submissions/${id}/`,
  },

  // Examination Module - Exam Types
  examTypes: {
    list: "/api/v1/examinations/exam-types/",
    create: "/api/v1/examinations/exam-types/",
    detail: (id: number) => `/api/v1/examinations/exam-types/${id}/`,
    update: (id: number) => `/api/v1/examinations/exam-types/${id}/`,
    patch: (id: number) => `/api/v1/examinations/exam-types/${id}/`,
    delete: (id: number) => `/api/v1/examinations/exam-types/${id}/`,
  },

  // Examination Module - Exams
  exams: {
    list: "/api/v1/examinations/exams/",
    create: "/api/v1/examinations/exams/",
    detail: (id: number) => `/api/v1/examinations/exams/${id}/`,
    update: (id: number) => `/api/v1/examinations/exams/${id}/`,
    patch: (id: number) => `/api/v1/examinations/exams/${id}/`,
    delete: (id: number) => `/api/v1/examinations/exams/${id}/`,
    publish: (id: number) => `/api/v1/examinations/exams/${id}/publish/`,
  },

  // Examination Module - Exam Schedules
  examSchedules: {
    list: "/api/v1/examinations/exam-schedules/",
    create: "/api/v1/examinations/exam-schedules/",
    detail: (id: number) => `/api/v1/examinations/exam-schedules/${id}/`,
    update: (id: number) => `/api/v1/examinations/exam-schedules/${id}/`,
    patch: (id: number) => `/api/v1/examinations/exam-schedules/${id}/`,
    delete: (id: number) => `/api/v1/examinations/exam-schedules/${id}/`,
  },

  // Examination Module - Marks Entry
  marksEntry: {
    list: "/api/v1/examinations/marks-entry/",
    create: "/api/v1/examinations/marks-entry/",
    detail: (id: number) => `/api/v1/examinations/marks-entry/${id}/`,
    update: (id: number) => `/api/v1/examinations/marks-entry/${id}/`,
    patch: (id: number) => `/api/v1/examinations/marks-entry/${id}/`,
    delete: (id: number) => `/api/v1/examinations/marks-entry/${id}/`,
    bulkCreate: "/api/v1/examinations/marks-entry/bulk_create/",
    verify: (id: number) => `/api/v1/examinations/marks-entry/${id}/verify/`,
  },

  // Examination Module - Grades
  grades: {
    list: "/api/v1/examinations/grades/",
    create: "/api/v1/examinations/grades/",
    detail: (id: number) => `/api/v1/examinations/grades/${id}/`,
    update: (id: number) => `/api/v1/examinations/grades/${id}/`,
    patch: (id: number) => `/api/v1/examinations/grades/${id}/`,
    delete: (id: number) => `/api/v1/examinations/grades/${id}/`,
  },

  // Examination Module - Results
  results: {
    list: "/api/v1/examinations/results/",
    create: "/api/v1/examinations/results/",
    detail: (id: number) => `/api/v1/examinations/results/${id}/`,
    update: (id: number) => `/api/v1/examinations/results/${id}/`,
    patch: (id: number) => `/api/v1/examinations/results/${id}/`,
    delete: (id: number) => `/api/v1/examinations/results/${id}/`,
    publish: (id: number) => `/api/v1/examinations/results/${id}/publish/`,
    student: (studentId: number) =>
      `/api/v1/examinations/results/student/${studentId}/`,
  },

  // Examination Module - Test Papers
  testPapers: {
    list: "/api/v1/examinations/test-papers/",
    create: "/api/v1/examinations/test-papers/",
    detail: (id: number) => `/api/v1/examinations/test-papers/${id}/`,
    update: (id: number) => `/api/v1/examinations/test-papers/${id}/`,
    patch: (id: number) => `/api/v1/examinations/test-papers/${id}/`,
    delete: (id: number) => `/api/v1/examinations/test-papers/${id}/`,
    sendToStore: (id: number) =>
      `/api/v1/examinations/test-papers/${id}/send_to_store/`,
  },

  // Examination Module - Admit Cards
  admitCards: {
    list: "/api/v1/examinations/admit-cards/",
    create: "/api/v1/examinations/admit-cards/",
    detail: (id: number) => `/api/v1/examinations/admit-cards/${id}/`,
    update: (id: number) => `/api/v1/examinations/admit-cards/${id}/`,
    patch: (id: number) => `/api/v1/examinations/admit-cards/${id}/`,
    delete: (id: number) => `/api/v1/examinations/admit-cards/${id}/`,
  },

  // Examination Module - Exam Attendance
  examAttendance: {
    list: "/api/v1/examinations/exam-attendance/",
    create: "/api/v1/examinations/exam-attendance/",
    detail: (id: number) => `/api/v1/examinations/exam-attendance/${id}/`,
    update: (id: number) => `/api/v1/examinations/exam-attendance/${id}/`,
    patch: (id: number) => `/api/v1/examinations/exam-attendance/${id}/`,
    delete: (id: number) => `/api/v1/examinations/exam-attendance/${id}/`,
  },

  // Examination Module - Student Marks
  studentMarks: {
    list: "/api/v1/examinations/student-marks/",
    create: "/api/v1/examinations/student-marks/",
    detail: (id: number) => `/api/v1/examinations/student-marks/${id}/`,
    update: (id: number) => `/api/v1/examinations/student-marks/${id}/`,
    patch: (id: number) => `/api/v1/examinations/student-marks/${id}/`,
    delete: (id: number) => `/api/v1/examinations/student-marks/${id}/`,
  },

  // Examination Module - Marks Grades
  marksGrades: {
    list: "/api/v1/examinations/marks-grades/",
    create: "/api/v1/examinations/marks-grades/",
    detail: (id: number) => `/api/v1/examinations/marks-grades/${id}/`,
    update: (id: number) => `/api/v1/examinations/marks-grades/${id}/`,
    patch: (id: number) => `/api/v1/examinations/marks-grades/${id}/`,
    delete: (id: number) => `/api/v1/examinations/marks-grades/${id}/`,
  },

  // Examination Module - Marks Registers
  marksRegisters: {
    list: "/api/v1/examinations/marks-registers/",
    create: "/api/v1/examinations/marks-registers/",
    detail: (id: number) => `/api/v1/examinations/marks-registers/${id}/`,
    update: (id: number) => `/api/v1/examinations/marks-registers/${id}/`,
    patch: (id: number) => `/api/v1/examinations/marks-registers/${id}/`,
    delete: (id: number) => `/api/v1/examinations/marks-registers/${id}/`,
  },

  // Examination Module - Mark Sheets
  markSheets: {
    list: "/api/v1/examinations/mark-sheets/",
    create: "/api/v1/examinations/mark-sheets/",
    detail: (id: number) => `/api/v1/examinations/mark-sheets/${id}/`,
    update: (id: number) => `/api/v1/examinations/mark-sheets/${id}/`,
    patch: (id: number) => `/api/v1/examinations/mark-sheets/${id}/`,
    delete: (id: number) => `/api/v1/examinations/mark-sheets/${id}/`,
  },

  // Examination Module - Progress Cards
  progressCards: {
    list: "/api/v1/examinations/progress-cards/",
    myProgressCards: "/api/v1/examinations/progress-cards/my-progress-cards/",
    create: "/api/v1/examinations/progress-cards/",
    detail: (id: number) => `/api/v1/examinations/progress-cards/${id}/`,
    update: (id: number) => `/api/v1/examinations/progress-cards/${id}/`,
    patch: (id: number) => `/api/v1/examinations/progress-cards/${id}/`,
    delete: (id: number) => `/api/v1/examinations/progress-cards/${id}/`,
  },

  // Examination Module - Tabulation Sheets
  tabulationSheets: {
    list: "/api/v1/examinations/tabulation-sheets/",
    create: "/api/v1/examinations/tabulation-sheets/",
    detail: (id: number) => `/api/v1/examinations/tabulation-sheets/${id}/`,
    update: (id: number) => `/api/v1/examinations/tabulation-sheets/${id}/`,
    patch: (id: number) => `/api/v1/examinations/tabulation-sheets/${id}/`,
    delete: (id: number) => `/api/v1/examinations/tabulation-sheets/${id}/`,
  },

  // Examination Module - Exam Results
  examResults: {
    list: "/api/v1/examinations/exam-results/",
    create: "/api/v1/examinations/exam-results/",
    detail: (id: number) => `/api/v1/examinations/exam-results/${id}/`,
    update: (id: number) => `/api/v1/examinations/exam-results/${id}/`,
    patch: (id: number) => `/api/v1/examinations/exam-results/${id}/`,
    delete: (id: number) => `/api/v1/examinations/exam-results/${id}/`,
  },

  // Attendance Module - Student Attendance
  studentAttendance: {
    list: "/api/v1/attendance/student-attendance/",
    create: "/api/v1/attendance/student-attendance/",
    detail: (id: number) => `/api/v1/attendance/student-attendance/${id}/`,
    update: (id: number) => `/api/v1/attendance/student-attendance/${id}/`,
    patch: (id: number) => `/api/v1/attendance/student-attendance/${id}/`,
    delete: (id: number) => `/api/v1/attendance/student-attendance/${id}/`,
    bulkMark: "/api/v1/attendance/student-attendance/bulk_mark/",
    summary: (studentId: number) =>
      `/api/v1/attendance/student-attendance/summary/${studentId}/`,
  },

  // Attendance Module - Staff Attendance
  staffAttendance: {
    list: "/api/v1/attendance/staff-attendance/",
    create: "/api/v1/attendance/staff-attendance/",
    detail: (id: number) => `/api/v1/attendance/staff-attendance/${id}/`,
    update: (id: number) => `/api/v1/attendance/staff-attendance/${id}/`,
    patch: (id: number) => `/api/v1/attendance/staff-attendance/${id}/`,
    delete: (id: number) => `/api/v1/attendance/staff-attendance/${id}/`,
    bulkMark: "/api/v1/attendance/staff-attendance/bulk_mark/",
  },

  // Attendance Module - Subject Attendance
  subjectAttendance: {
    list: "/api/v1/attendance/subject-attendance/",
    create: "/api/v1/attendance/subject-attendance/",
    detail: (id: number) => `/api/v1/attendance/subject-attendance/${id}/`,
    update: (id: number) => `/api/v1/attendance/subject-attendance/${id}/`,
    patch: (id: number) => `/api/v1/attendance/subject-attendance/${id}/`,
    delete: (id: number) => `/api/v1/attendance/subject-attendance/${id}/`,
  },

  // Attendance Module - Notifications
  attendanceNotifications: {
    list: "/api/v1/attendance/notifications/",
    create: "/api/v1/attendance/notifications/",
    detail: (id: number) => `/api/v1/attendance/notifications/${id}/`,
    update: (id: number) => `/api/v1/attendance/notifications/${id}/`,
    patch: (id: number) => `/api/v1/attendance/notifications/${id}/`,
    delete: (id: number) => `/api/v1/attendance/notifications/${id}/`,
    send: (id: number) => `/api/v1/attendance/notifications/${id}/send/`,
  },

  // Fees Module - Fee Masters
  feeMasters: {
    list: "/api/v1/fees/fee-masters/",
    create: "/api/v1/fees/fee-masters/",
    detail: (id: number) => `/api/v1/fees/fee-masters/${id}/`,
    update: (id: number) => `/api/v1/fees/fee-masters/${id}/`,
    patch: (id: number) => `/api/v1/fees/fee-masters/${id}/`,
    delete: (id: number) => `/api/v1/fees/fee-masters/${id}/`,
  },

  // Fees Module - Fee Types
  feeTypes: {
    list: "/api/v1/fees/fee-types/",
    create: "/api/v1/fees/fee-types/",
    detail: (id: number) => `/api/v1/fees/fee-types/${id}/`,
    update: (id: number) => `/api/v1/fees/fee-types/${id}/`,
    patch: (id: number) => `/api/v1/fees/fee-types/${id}/`,
    delete: (id: number) => `/api/v1/fees/fee-types/${id}/`,
  },

  // Fees Module - Fee Structures
  feeStructures: {
    list: "/api/v1/fees/fee-structures/",
    create: "/api/v1/fees/fee-structures/",
    detail: (id: number) => `/api/v1/fees/fee-structures/${id}/`,
    update: (id: number) => `/api/v1/fees/fee-structures/${id}/`,
    patch: (id: number) => `/api/v1/fees/fee-structures/${id}/`,
    delete: (id: number) => `/api/v1/fees/fee-structures/${id}/`,
  },

  // Fees Module - Fee Groups
  feeGroups: {
    list: "/api/v1/fees/fee-groups/",
    create: "/api/v1/fees/fee-groups/",
    detail: (id: number) => `/api/v1/fees/fee-groups/${id}/`,
    update: (id: number) => `/api/v1/fees/fee-groups/${id}/`,
    patch: (id: number) => `/api/v1/fees/fee-groups/${id}/`,
    delete: (id: number) => `/api/v1/fees/fee-groups/${id}/`,
  },

  // Fees Module - Fee Discounts
  feeDiscounts: {
    list: "/api/v1/fees/fee-discounts/",
    create: "/api/v1/fees/fee-discounts/",
    detail: (id: number) => `/api/v1/fees/fee-discounts/${id}/`,
    update: (id: number) => `/api/v1/fees/fee-discounts/${id}/`,
    patch: (id: number) => `/api/v1/fees/fee-discounts/${id}/`,
    delete: (id: number) => `/api/v1/fees/fee-discounts/${id}/`,
  },

  // Fees Module - Student Fee Discounts
  studentFeeDiscounts: {
    list: "/api/v1/fees/student-fee-discounts/",
    create: "/api/v1/fees/student-fee-discounts/",
    detail: (id: number) => `/api/v1/fees/student-fee-discounts/${id}/`,
    update: (id: number) => `/api/v1/fees/student-fee-discounts/${id}/`,
    patch: (id: number) => `/api/v1/fees/student-fee-discounts/${id}/`,
    delete: (id: number) => `/api/v1/fees/student-fee-discounts/${id}/`,
  },

  // Fees Module - Fee Fines
  feeFines: {
    list: "/api/v1/fees/fee-fines/",
    create: "/api/v1/fees/fee-fines/",
    detail: (id: number) => `/api/v1/fees/fee-fines/${id}/`,
    update: (id: number) => `/api/v1/fees/fee-fines/${id}/`,
    patch: (id: number) => `/api/v1/fees/fee-fines/${id}/`,
    delete: (id: number) => `/api/v1/fees/fee-fines/${id}/`,
  },

  // Fees Module - Fee Installments
  feeInstallments: {
    list: "/api/v1/fees/fee-installments/",
    create: "/api/v1/fees/fee-installments/",
    detail: (id: number) => `/api/v1/fees/fee-installments/${id}/`,
    update: (id: number) => `/api/v1/fees/fee-installments/${id}/`,
    patch: (id: number) => `/api/v1/fees/fee-installments/${id}/`,
    delete: (id: number) => `/api/v1/fees/fee-installments/${id}/`,
  },

  // Fees Module - Fee Collections
  feeCollections: {
    list: "/api/v1/fees/fee-collections/",
    create: "/api/v1/fees/fee-collections/",
    detail: (id: number) => `/api/v1/fees/fee-collections/${id}/`,
    update: (id: number) => `/api/v1/fees/fee-collections/${id}/`,
    patch: (id: number) => `/api/v1/fees/fee-collections/${id}/`,
    delete: (id: number) => `/api/v1/fees/fee-collections/${id}/`,
    cancel: (id: number) => `/api/v1/fees/fee-collections/${id}/cancel/`,
    studentStatus: (studentId: number) =>
      `/api/v1/fees/fee-collections/student_status/${studentId}/`,
  },

  // Fees Module - Fee Receipts
  feeReceipts: {
    list: "/api/v1/fees/fee-receipts/",
    create: "/api/v1/fees/fee-receipts/",
    detail: (id: number) => `/api/v1/fees/fee-receipts/${id}/`,
    update: (id: number) => `/api/v1/fees/fee-receipts/${id}/`,
    patch: (id: number) => `/api/v1/fees/fee-receipts/${id}/`,
    delete: (id: number) => `/api/v1/fees/fee-receipts/${id}/`,
  },

  // Fees Module - Fee Refunds
  feeRefunds: {
    list: "/api/v1/fees/fee-refunds/",
    create: "/api/v1/fees/fee-refunds/",
    detail: (id: number) => `/api/v1/fees/fee-refunds/${id}/`,
    update: (id: number) => `/api/v1/fees/fee-refunds/${id}/`,
    patch: (id: number) => `/api/v1/fees/fee-refunds/${id}/`,
    delete: (id: number) => `/api/v1/fees/fee-refunds/${id}/`,
  },

  // Fees Module - Fee Reminders
  feeReminders: {
    list: "/api/v1/fees/fee-reminders/",
    create: "/api/v1/fees/fee-reminders/",
    detail: (id: number) => `/api/v1/fees/fee-reminders/${id}/`,
    update: (id: number) => `/api/v1/fees/fee-reminders/${id}/`,
    patch: (id: number) => `/api/v1/fees/fee-reminders/${id}/`,
    delete: (id: number) => `/api/v1/fees/fee-reminders/${id}/`,
  },

  // Fees Module - Bank Payments
  bankPayments: {
    list: "/api/v1/fees/bank-payments/",
    create: "/api/v1/fees/bank-payments/",
    detail: (id: number) => `/api/v1/fees/bank-payments/${id}/`,
    update: (id: number) => `/api/v1/fees/bank-payments/${id}/`,
    patch: (id: number) => `/api/v1/fees/bank-payments/${id}/`,
    delete: (id: number) => `/api/v1/fees/bank-payments/${id}/`,
  },

  // Fees Module - Online Payments
  onlinePayments: {
    list: "/api/v1/fees/online-payments/",
    create: "/api/v1/fees/online-payments/",
    detail: (id: number) => `/api/v1/fees/online-payments/${id}/`,
    update: (id: number) => `/api/v1/fees/online-payments/${id}/`,
    patch: (id: number) => `/api/v1/fees/online-payments/${id}/`,
    delete: (id: number) => `/api/v1/fees/online-payments/${id}/`,
  },

  // Library Module - Books
  books: {
    list: "/api/v1/library/books/",
    create: "/api/v1/library/books/",
    detail: (id: number) => `/api/v1/library/books/${id}/`,
    update: (id: number) => `/api/v1/library/books/${id}/`,
    patch: (id: number) => `/api/v1/library/books/${id}/`,
    delete: (id: number) => `/api/v1/library/books/${id}/`,
  },

  // Library Module - Book Categories
  bookCategories: {
    list: "/api/v1/library/categories/",
    create: "/api/v1/library/categories/",
    detail: (id: number) => `/api/v1/library/categories/${id}/`,
    update: (id: number) => `/api/v1/library/categories/${id}/`,
    patch: (id: number) => `/api/v1/library/categories/${id}/`,
    delete: (id: number) => `/api/v1/library/categories/${id}/`,
  },

  // Library Module - Members
  libraryMembers: {
    list: "/api/v1/library/members/",
    create: "/api/v1/library/members/",
    detail: (id: number) => `/api/v1/library/members/${id}/`,
    update: (id: number) => `/api/v1/library/members/${id}/`,
    patch: (id: number) => `/api/v1/library/members/${id}/`,
    delete: (id: number) => `/api/v1/library/members/${id}/`,
    block: (id: number) => `/api/v1/library/members/${id}/block/`,
    unblock: (id: number) => `/api/v1/library/members/${id}/unblock/`,
  },

  // Library Module - Book Issues
  bookIssues: {
    list: "/api/v1/library/issues/",
    create: "/api/v1/library/issues/",
    myIssues: "/api/v1/library/issues/my-issues/",
    detail: (id: number) => `/api/v1/library/issues/${id}/`,
    update: (id: number) => `/api/v1/library/issues/${id}/`,
    patch: (id: number) => `/api/v1/library/issues/${id}/`,
    delete: (id: number) => `/api/v1/library/issues/${id}/`,
    renew: (id: number) => `/api/v1/library/issues/${id}/renew/`,
  },

  // Library Module - Library Cards
  libraryCards: {
    list: "/api/v1/library/cards/",
    create: "/api/v1/library/cards/",
    detail: (id: number) => `/api/v1/library/cards/${id}/`,
    update: (id: number) => `/api/v1/library/cards/${id}/`,
    patch: (id: number) => `/api/v1/library/cards/${id}/`,
    delete: (id: number) => `/api/v1/library/cards/${id}/`,
  },

  // Library Module - Fines
  fines: {
    list: "/api/v1/library/fines/",
    create: "/api/v1/library/fines/",
    detail: (id: number) => `/api/v1/library/fines/${id}/`,
    update: (id: number) => `/api/v1/library/fines/${id}/`,
    patch: (id: number) => `/api/v1/library/fines/${id}/`,
    delete: (id: number) => `/api/v1/library/fines/${id}/`,
  },

  // Library Module - Reservations
  reservations: {
    list: "/api/v1/library/reservations/",
    create: "/api/v1/library/reservations/",
    detail: (id: number) => `/api/v1/library/reservations/${id}/`,
    update: (id: number) => `/api/v1/library/reservations/${id}/`,
    patch: (id: number) => `/api/v1/library/reservations/${id}/`,
    delete: (id: number) => `/api/v1/library/reservations/${id}/`,
  },

  // Library Module - Book Returns
  bookReturns: {
    list: "/api/v1/library/returns/",
    create: "/api/v1/library/returns/",
    detail: (id: number) => `/api/v1/library/returns/${id}/`,
    update: (id: number) => `/api/v1/library/returns/${id}/`,
    patch: (id: number) => `/api/v1/library/returns/${id}/`,
    delete: (id: number) => `/api/v1/library/returns/${id}/`,
  },

  // HR Module - Leave Applications
  leaveApplications: {
    list: "/api/v1/hr/leave-applications/",
    create: "/api/v1/hr/leave-applications/",
    detail: (id: number) => `/api/v1/hr/leave-applications/${id}/`,
    update: (id: number) => `/api/v1/hr/leave-applications/${id}/`,
    patch: (id: number) => `/api/v1/hr/leave-applications/${id}/`,
    delete: (id: number) => `/api/v1/hr/leave-applications/${id}/`,
    cancel: (id: number) => `/api/v1/hr/leave-applications/${id}/cancel/`,
  },

  // HR Module - Leave Approvals
  leaveApprovals: {
    list: "/api/v1/hr/leave-approvals/",
    create: "/api/v1/hr/leave-approvals/",
    detail: (id: number) => `/api/v1/hr/leave-approvals/${id}/`,
    update: (id: number) => `/api/v1/hr/leave-approvals/${id}/`,
    patch: (id: number) => `/api/v1/hr/leave-approvals/${id}/`,
    delete: (id: number) => `/api/v1/hr/leave-approvals/${id}/`,
    approve: (id: number) => `/api/v1/hr/leave-approvals/${id}/approve/`,
    reject: (id: number) => `/api/v1/hr/leave-approvals/${id}/reject/`,
  },

  // HR Module - Salary Structures
  salaryStructures: {
    list: "/api/v1/hr/salary-structures/",
    create: "/api/v1/hr/salary-structures/",
    detail: (id: number) => `/api/v1/hr/salary-structures/${id}/`,
    update: (id: number) => `/api/v1/hr/salary-structures/${id}/`,
    patch: (id: number) => `/api/v1/hr/salary-structures/${id}/`,
    delete: (id: number) => `/api/v1/hr/salary-structures/${id}/`,
  },

  // HR Module - Payrolls
  payrolls: {
    list: "/api/v1/hr/payrolls/",
    create: "/api/v1/hr/payrolls/",
    detail: (id: number) => `/api/v1/hr/payrolls/${id}/`,
    update: (id: number) => `/api/v1/hr/payrolls/${id}/`,
    patch: (id: number) => `/api/v1/hr/payrolls/${id}/`,
    delete: (id: number) => `/api/v1/hr/payrolls/${id}/`,
    process: (id: number) => `/api/v1/hr/payrolls/${id}/process/`,
    payslip: (id: number) => `/api/v1/hr/payrolls/${id}/payslip/`,
  },

  // Reports Module - Templates
  reportTemplates: {
    list: "/api/v1/reports/templates/",
    create: "/api/v1/reports/templates/",
    detail: (id: number) => `/api/v1/reports/templates/${id}/`,
    update: (id: number) => `/api/v1/reports/templates/${id}/`,
    patch: (id: number) => `/api/v1/reports/templates/${id}/`,
    delete: (id: number) => `/api/v1/reports/templates/${id}/`,
  },

  // Reports Module - Generated Reports
  generatedReports: {
    list: "/api/v1/reports/generated/",
    create: "/api/v1/reports/generated/",
    detail: (id: number) => `/api/v1/reports/generated/${id}/`,
    update: (id: number) => `/api/v1/reports/generated/${id}/`,
    patch: (id: number) => `/api/v1/reports/generated/${id}/`,
    delete: (id: number) => `/api/v1/reports/generated/${id}/`,
    download: (id: number) => `/api/v1/reports/generated/${id}/download/`,
    generate: "/api/v1/reports/generated/generate/",
  },

  // Reports Module - Saved Reports
  savedReports: {
    list: "/api/v1/reports/saved/",
    create: "/api/v1/reports/saved/",
    detail: (id: number) => `/api/v1/reports/saved/${id}/`,
    update: (id: number) => `/api/v1/reports/saved/${id}/`,
    patch: (id: number) => `/api/v1/reports/saved/${id}/`,
    delete: (id: number) => `/api/v1/reports/saved/${id}/`,
  },

  // Assignments Module (Teacher)
  assignments: {
    list: "/api/v1/teachers/assignments/",
    create: "/api/v1/teachers/assignments/",
    detail: (id: number) => `/api/v1/teachers/assignments/${id}/`,
    update: (id: number) => `/api/v1/teachers/assignments/${id}/`,
    patch: (id: number) => `/api/v1/teachers/assignments/${id}/`,
    delete: (id: number) => `/api/v1/teachers/assignments/${id}/`,
  },

  // Student Assignments Module
  studentAssignments: {
    list: "/api/v1/students/assignments/",
    detail: (id: number) => `/api/v1/students/assignments/${id}/`,
  },

  // Assignment Submissions Module
  assignmentSubmissions: {
    list: "/api/v1/teachers/assignment-submissions/",
    create: "/api/v1/teachers/assignment-submissions/",
    detail: (id: number) => `/api/v1/teachers/assignment-submissions/${id}/`,
    update: (id: number) => `/api/v1/teachers/assignment-submissions/${id}/`,
    patch: (id: number) => `/api/v1/teachers/assignment-submissions/${id}/`,
    delete: (id: number) => `/api/v1/teachers/assignment-submissions/${id}/`,
    grade: (id: number) =>
      `/api/v1/teachers/assignment-submissions/${id}/grade/`,
    mySubmissions: "/api/v1/teachers/assignment-submissions/my-submissions/",
  },

  // Approvals Module
  approvals: {
    list: "/api/v1/approvals/requests/",
    pendingApprovals: "/api/v1/approvals/requests/pending_approvals/",
    myRequests: "/api/v1/approvals/requests/my_requests/",
    detail: (id: number) => `/api/v1/approvals/requests/${id}/`,
    review: (id: number) => `/api/v1/approvals/requests/${id}/review/`,
    feePayment: "/api/v1/approvals/fee-payment/",
    notifications: "/api/v1/approvals/notifications/",
    notificationsUnread: "/api/v1/approvals/notifications/unread/",
    unreadCount: "/api/v1/approvals/notifications/unread_count/",
    markAsRead: (id: number) => `/api/v1/approvals/notifications/${id}/read/`,
    markAllRead: "/api/v1/approvals/notifications/mark_read/",
    sseEvents: "/api/v1/communication/sse/events/",
  },

  // Store Module - College Stores
  collegeStores: {
    list: "/api/v1/store/college-stores/",
    create: "/api/v1/store/college-stores/",
    detail: (id: number) => `/api/v1/store/college-stores/${id}/`,
    update: (id: number) => `/api/v1/store/college-stores/${id}/`,
    patch: (id: number) => `/api/v1/store/college-stores/${id}/`,
    delete: (id: number) => `/api/v1/store/college-stores/${id}/`,
  },

  // Store Module - Central Stores
  centralStores: {
    list: "/api/v1/store/central-stores/",
    create: "/api/v1/store/central-stores/",
    detail: (id: number) => `/api/v1/store/central-stores/${id}/`,
    update: (id: number) => `/api/v1/store/central-stores/${id}/`,
    patch: (id: number) => `/api/v1/store/central-stores/${id}/`,
    delete: (id: number) => `/api/v1/store/central-stores/${id}/`,
    inventory: (id: number) => `/api/v1/store/central-stores/${id}/inventory/`,
    stockSummary: (id: number) =>
      `/api/v1/store/central-stores/${id}/stock_summary/`,
    hierarchy: "/api/v1/store/central-stores/list/",
  },

  // Store Module - Central Inventory
  centralInventory: {
    list: "/api/v1/store/central-inventory/",
    create: "/api/v1/store/central-inventory/",
    detail: (id: number) => `/api/v1/store/central-inventory/${id}/`,
    update: (id: number) => `/api/v1/store/central-inventory/${id}/`,
    patch: (id: number) => `/api/v1/store/central-inventory/${id}/`,
    delete: (id: number) => `/api/v1/store/central-inventory/${id}/`,
    adjustStock: (id: number) =>
      `/api/v1/store/central-inventory/${id}/adjust_stock/`,
    lowStock: "/api/v1/store/central-inventory/low_stock/",
  },

  // Store Module - Procurement Requirements
  procurementRequirements: {
    list: "/api/v1/store/procurement/requirements/",
    create: "/api/v1/store/procurement/requirements/",
    detail: (id: number) => `/api/v1/store/procurement/requirements/${id}/`,
    update: (id: number) => `/api/v1/store/procurement/requirements/${id}/`,
    patch: (id: number) => `/api/v1/store/procurement/requirements/${id}/`,
    delete: (id: number) => `/api/v1/store/procurement/requirements/${id}/`,
    submitForApproval: (id: number) =>
      `/api/v1/store/procurement/requirements/${id}/submit_for_approval/`,
    quotations: (id: number) =>
      `/api/v1/store/procurement/requirements/${id}/quotations/`,
    compareQuotations: (id: number) =>
      `/api/v1/store/procurement/requirements/${id}/compare_quotations/`,
    selectQuotation: (id: number) =>
      `/api/v1/store/procurement/requirements/${id}/select_quotation/`,
    approve: (id: number) =>
      `/api/v1/store/procurement/requirements/${id}/approve/`,
    reject: (id: number) =>
      `/api/v1/store/procurement/requirements/${id}/reject/`,
  },

  // Store Module - Supplier Quotations
  supplierQuotations: {
    list: "/api/v1/store/procurement/quotations/",
    create: "/api/v1/store/procurement/quotations/",
    detail: (id: number) => `/api/v1/store/procurement/quotations/${id}/`,
    update: (id: number) => `/api/v1/store/procurement/quotations/${id}/`,
    patch: (id: number) => `/api/v1/store/procurement/quotations/${id}/`,
    delete: (id: number) => `/api/v1/store/procurement/quotations/${id}/`,
    markSelected: (id: number) =>
      `/api/v1/store/procurement/quotations/${id}/mark_selected/`,
  },

  // Store Module - Purchase Orders
  purchaseOrders: {
    list: "/api/v1/store/procurement/purchase-orders/",
    create: "/api/v1/store/procurement/purchase-orders/",
    detail: (id: number) => `/api/v1/store/procurement/purchase-orders/${id}/`,
    update: (id: number) => `/api/v1/store/procurement/purchase-orders/${id}/`,
    patch: (id: number) => `/api/v1/store/procurement/purchase-orders/${id}/`,
    delete: (id: number) => `/api/v1/store/procurement/purchase-orders/${id}/`,
    generatePdf: (id: number) =>
      `/api/v1/store/procurement/purchase-orders/${id}/generate_pdf/`,
    sendToSupplier: (id: number) =>
      `/api/v1/store/procurement/purchase-orders/${id}/send_to_supplier/`,
    acknowledge: (id: number) =>
      `/api/v1/store/procurement/purchase-orders/${id}/acknowledge/`,
  },

  // Store Module - Goods Receipt Notes
  goodsReceipts: {
    list: "/api/v1/store/procurement/goods-receipts/",
    create: "/api/v1/store/procurement/goods-receipts/",
    detail: (id: number) => `/api/v1/store/procurement/goods-receipts/${id}/`,
    update: (id: number) => `/api/v1/store/procurement/goods-receipts/${id}/`,
    patch: (id: number) => `/api/v1/store/procurement/goods-receipts/${id}/`,
    delete: (id: number) => `/api/v1/store/procurement/goods-receipts/${id}/`,
    submitForInspection: (id: number) =>
      `/api/v1/store/procurement/goods-receipts/${id}/submit_for_inspection/`,
    postToInventory: (id: number) =>
      `/api/v1/store/procurement/goods-receipts/${id}/post_to_inventory/`,
  },

  // Store Module - Inspections
  inspections: {
    list: "/api/v1/store/procurement/inspections/",
    create: "/api/v1/store/procurement/inspections/",
    detail: (id: number) => `/api/v1/store/procurement/inspections/${id}/`,
    update: (id: number) => `/api/v1/store/procurement/inspections/${id}/`,
    patch: (id: number) => `/api/v1/store/procurement/inspections/${id}/`,
    delete: (id: number) => `/api/v1/store/procurement/inspections/${id}/`,

  },

  // Store Module - Inventory Transactions
  inventoryTransactions: {
    list: "/api/v1/store/inventory-transactions/",
    detail: (id: number) => `/api/v1/store/inventory-transactions/${id}/`,
  },

  // Store Module - Store Indents
  storeIndents: {
    list: "/api/v1/store/indents/",
    create: "/api/v1/store/indents/",
    detail: (id: number) => `/api/v1/store/indents/${id}/`,
    update: (id: number) => `/api/v1/store/indents/${id}/`,
    patch: (id: number) => `/api/v1/store/indents/${id}/`,
    delete: (id: number) => `/api/v1/store/indents/${id}/`,
    submit: (id: number) => `/api/v1/store/indents/${id}/submit/`,
    collegeAdminApprove: (id: number) =>
      `/api/v1/store/indents/${id}/college_admin_approve/`,
    collegeAdminReject: (id: number) =>
      `/api/v1/store/indents/${id}/college_admin_reject/`,
    superAdminApprove: (id: number) =>
      `/api/v1/store/indents/${id}/super_admin_approve/`,
    superAdminReject: (id: number) =>
      `/api/v1/store/indents/${id}/super_admin_reject/`,
    issueMaterials: (id: number) =>
      `/api/v1/store/indents/${id}/issue_materials/`,
    pendingCollegeApprovals: "/api/v1/store/indents/pending_college_approvals/",
    pendingSuperAdminApprovals:
      "/api/v1/store/indents/pending_super_admin_approvals/",
  },

  // Store Module - Material Issue Notes
  materialIssues: {
    list: "/api/v1/store/material-issues/",
    create: "/api/v1/store/material-issues/",
    detail: (id: number) => `/api/v1/store/material-issues/${id}/`,
    update: (id: number) => `/api/v1/store/material-issues/${id}/`,
    patch: (id: number) => `/api/v1/store/material-issues/${id}/`,
    delete: (id: number) => `/api/v1/store/material-issues/${id}/`,
    markDispatched: (id: number) =>
      `/api/v1/store/material-issues/${id}/mark_dispatched/`,
    markReceived: (id: number) =>
      `/api/v1/store/material-issues/${id}/confirm_receipt/`,
    generateGatePass: (id: number) =>
      `/api/v1/store/material-issues/${id}/generate_pdf/`,
  },

  // Accountant Module - Income Dashboard
  accountant: {
    incomeDashboard: "/api/v1/fees/accountant/income-dashboard/",

    // Fee Collections
    feeCollections: {
      list: "/api/v1/fees/fee-collections/",
      create: "/api/v1/fees/fee-collections/",
      detail: (id: number) => `/api/v1/fees/fee-collections/${id}/`,
      update: (id: number) => `/api/v1/fees/fee-collections/${id}/`,
      delete: (id: number) => `/api/v1/fees/fee-collections/${id}/`,
      report: "/api/v1/fees/fee-collections/collections-report/",
    },

    // Store Sales
    storeSales: {
      list: "/api/v1/store/sales/",
      create: "/api/v1/store/sales/",
      detail: (id: number) => `/api/v1/store/sales/${id}/`,
    },

    // Fee Fines
    feeFines: {
      list: "/api/v1/fees/fee-fines/",
      create: "/api/v1/fees/fee-fines/",
      detail: (id: number) => `/api/v1/fees/fee-fines/${id}/`,
      patch: (id: number) => `/api/v1/fees/fee-fines/${id}/`,
    },

    // Library Fines
    libraryFines: {
      list: "/api/v1/library/fines/",
      create: "/api/v1/library/fines/",
      detail: (id: number) => `/api/v1/library/fines/${id}/`,
      patch: (id: number) => `/api/v1/library/fines/${id}/`,
    },

    // Receipts
    receipts: {
      list: "/api/v1/fees/fee-receipts/",
      detail: (id: number) => `/api/v1/fees/fee-receipts/${id}/`,
      download: (id: number) => `/api/v1/fees/fee-receipts/${id}/download/`,
    },

    // Students Search
    students: "/api/v1/students/students/",

    // System Activity Logs
    activityLogs: {
      list: "/api/v1/core/activity-logs/",
    },
  },

  // Print Template Module
  print: {
    // Configuration (Letterhead Settings)
    config: {
      list: "/api/v1/reports/print/config/",
      create: "/api/v1/reports/print/config/",
      detail: (id: number) => `/api/v1/reports/print/config/${id}/`,
      update: (id: number) => `/api/v1/reports/print/config/${id}/`,
      patch: (id: number) => `/api/v1/reports/print/config/${id}/`,
      delete: (id: number) => `/api/v1/reports/print/config/${id}/`,
      addSignatory: "/api/v1/reports/print/config/add_signatory/",
      signatories: "/api/v1/reports/print/config/signatories/",
    },

    // Categories
    categories: {
      list: "/api/v1/reports/print/categories/",
      create: "/api/v1/reports/print/categories/",
      detail: (id: number) => `/api/v1/reports/print/categories/${id}/`,
      update: (id: number) => `/api/v1/reports/print/categories/${id}/`,
      patch: (id: number) => `/api/v1/reports/print/categories/${id}/`,
      delete: (id: number) => `/api/v1/reports/print/categories/${id}/`,
      seedDefaults: "/api/v1/reports/print/categories/seed_defaults/",
    },

    // Templates
    templates: {
      list: "/api/v1/reports/print/templates/",
      create: "/api/v1/reports/print/templates/",
      detail: (id: number) => `/api/v1/reports/print/templates/${id}/`,
      update: (id: number) => `/api/v1/reports/print/templates/${id}/`,
      patch: (id: number) => `/api/v1/reports/print/templates/${id}/`,
      delete: (id: number) => `/api/v1/reports/print/templates/${id}/`,
      preview: (id: number) => `/api/v1/reports/print/templates/${id}/preview/`,
      duplicate: (id: number) => `/api/v1/reports/print/templates/${id}/duplicate/`,
      newVersion: (id: number) => `/api/v1/reports/print/templates/${id}/new_version/`,
      variables: (id: number) => `/api/v1/reports/print/templates/${id}/variables/`,
      byCategory: "/api/v1/reports/print/templates/by_category/",
    },

    // Documents
    documents: {
      list: "/api/v1/reports/print/documents/",
      create: "/api/v1/reports/print/documents/",
      detail: (id: number) => `/api/v1/reports/print/documents/${id}/`,
      update: (id: number) => `/api/v1/reports/print/documents/${id}/`,
      patch: (id: number) => `/api/v1/reports/print/documents/${id}/`,
      delete: (id: number) => `/api/v1/reports/print/documents/${id}/`,
      pdf: (id: number) => `/api/v1/reports/print/documents/${id}/pdf/`,
      printHtml: (id: number) => `/api/v1/reports/print/documents/${id}/print_html/`,
      preview: (id: number) => `/api/v1/reports/print/documents/${id}/preview/`,
      regeneratePdf: (id: number) => `/api/v1/reports/print/documents/${id}/regenerate_pdf/`,
      markPrinted: (id: number) => `/api/v1/reports/print/documents/${id}/mark_printed/`,
      myDocuments: "/api/v1/reports/print/documents/my_documents/",
      pending: "/api/v1/reports/print/documents/pending/",
    },

    // Approvals
    approvals: {
      list: "/api/v1/reports/print/approvals/",
      create: "/api/v1/reports/print/approvals/",
      detail: (id: number) => `/api/v1/reports/print/approvals/${id}/`,
      update: (id: number) => `/api/v1/reports/print/approvals/${id}/`,
      patch: (id: number) => `/api/v1/reports/print/approvals/${id}/`,
      delete: (id: number) => `/api/v1/reports/print/approvals/${id}/`,
      pending: "/api/v1/reports/print/approvals/pending/",
      preview: (id: number) => `/api/v1/reports/print/approvals/${id}/preview/`,
      approve: (id: number) => `/api/v1/reports/print/approvals/${id}/approve/`,
      dashboard: "/api/v1/reports/print/approvals/dashboard/",
    },

    // Bulk Print Jobs
    bulkJobs: {
      list: "/api/v1/reports/print/bulk-jobs/",
      create: "/api/v1/reports/print/bulk-jobs/",
      detail: (id: number) => `/api/v1/reports/print/bulk-jobs/${id}/`,
      update: (id: number) => `/api/v1/reports/print/bulk-jobs/${id}/`,
      patch: (id: number) => `/api/v1/reports/print/bulk-jobs/${id}/`,
      delete: (id: number) => `/api/v1/reports/print/bulk-jobs/${id}/`,
      progress: (id: number) => `/api/v1/reports/print/bulk-jobs/${id}/progress/`,
      download: (id: number) => `/api/v1/reports/print/bulk-jobs/${id}/download/`,
      cancel: (id: number) => `/api/v1/reports/print/bulk-jobs/${id}/cancel/`,
      targetModels: "/api/v1/reports/print/bulk-jobs/target_models/",
    },

    // Generated Reports
    generated: {
      list: "/api/v1/reports/generated/",
      create: "/api/v1/reports/generated/",
      detail: (id: number) => `/api/v1/reports/generated/${id}/`,
      update: (id: number) => `/api/v1/reports/generated/${id}/`,
      patch: (id: number) => `/api/v1/reports/generated/${id}/`,
      delete: (id: number) => `/api/v1/reports/generated/${id}/`,
    },

    // Saved Reports
    saved: {
      list: "/api/v1/reports/saved/",
      create: "/api/v1/reports/saved/",
      detail: (id: number) => `/api/v1/reports/saved/${id}/`,
      update: (id: number) => `/api/v1/reports/saved/${id}/`,
      patch: (id: number) => `/api/v1/reports/saved/${id}/`,
      delete: (id: number) => `/api/v1/reports/saved/${id}/`,
    },

    // Report Templates (General)
    reportTemplates: {
      list: "/api/v1/reports/templates/",
      create: "/api/v1/reports/templates/",
      detail: (id: number) => `/api/v1/reports/templates/${id}/`,
      update: (id: number) => `/api/v1/reports/templates/${id}/`,
      patch: (id: number) => `/api/v1/reports/templates/${id}/`,
      delete: (id: number) => `/api/v1/reports/templates/${id}/`,
    },
  },

  // Construction Module
  construction: {
    // Projects
    projects: {
      list: "/api/v1/construction/projects/",
      create: "/api/v1/construction/projects/",
      detail: (id: number) => `/api/v1/construction/projects/${id}/`,
      update: (id: number) => `/api/v1/construction/projects/${id}/`,
      patch: (id: number) => `/api/v1/construction/projects/${id}/`,
      delete: (id: number) => `/api/v1/construction/projects/${id}/`,
      dashboard: "/api/v1/construction/projects/dashboard/",
    },

    // Daily Reports
    dailyReports: {
      list: "/api/v1/construction/daily-reports/",
      create: "/api/v1/construction/daily-reports/",
      detail: (id: number) => `/api/v1/construction/daily-reports/${id}/`,
      update: (id: number) => `/api/v1/construction/daily-reports/${id}/`,
      patch: (id: number) => `/api/v1/construction/daily-reports/${id}/`,
      delete: (id: number) => `/api/v1/construction/daily-reports/${id}/`,
      submit: (id: number) => `/api/v1/construction/daily-reports/${id}/submit/`,
      approve: (id: number) => `/api/v1/construction/daily-reports/${id}/approve/`,
      reject: (id: number) => `/api/v1/construction/daily-reports/${id}/reject/`,
      requestRevision: (id: number) => `/api/v1/construction/daily-reports/${id}/request_revision/`,
    },

    // Photos
    photos: {
      list: "/api/v1/construction/photos/",
      create: "/api/v1/construction/photos/",
      detail: (id: number) => `/api/v1/construction/photos/${id}/`,
      update: (id: number) => `/api/v1/construction/photos/${id}/`,
      delete: (id: number) => `/api/v1/construction/photos/${id}/`,
      verify: (id: number) => `/api/v1/construction/photos/${id}/verify/`,
      geofenceViolations: "/api/v1/construction/photos/geofence_violations/",
    },

    // Milestones
    milestones: {
      list: "/api/v1/construction/milestones/",
      create: "/api/v1/construction/milestones/",
      detail: (id: number) => `/api/v1/construction/milestones/${id}/`,
      update: (id: number) => `/api/v1/construction/milestones/${id}/`,
      patch: (id: number) => `/api/v1/construction/milestones/${id}/`,
      delete: (id: number) => `/api/v1/construction/milestones/${id}/`,
      verify: (id: number) => `/api/v1/construction/milestones/${id}/verify/`,
    },

    // Expenses
    expenses: {
      list: "/api/v1/construction/expenses/",
      create: "/api/v1/construction/expenses/",
      detail: (id: number) => `/api/v1/construction/expenses/${id}/`,
      update: (id: number) => `/api/v1/construction/expenses/${id}/`,
      patch: (id: number) => `/api/v1/construction/expenses/${id}/`,
      delete: (id: number) => `/api/v1/construction/expenses/${id}/`,
      approveExpense: (id: number) => `/api/v1/construction/expenses/${id}/approve_expense/`,
      rejectExpense: (id: number) => `/api/v1/construction/expenses/${id}/reject_expense/`,
    },

    // Material Requests
    materialRequests: {
      list: "/api/v1/construction/material-requests/",
      create: "/api/v1/construction/material-requests/",
      detail: (id: number) => `/api/v1/construction/material-requests/${id}/`,
      update: (id: number) => `/api/v1/construction/material-requests/${id}/`,
      patch: (id: number) => `/api/v1/construction/material-requests/${id}/`,
      delete: (id: number) => `/api/v1/construction/material-requests/${id}/`,
      submit: (id: number) => `/api/v1/construction/material-requests/${id}/submit/`,
      ceoApprove: (id: number) => `/api/v1/construction/material-requests/${id}/ceo_approve/`,
      ceoReject: (id: number) => `/api/v1/construction/material-requests/${id}/ceo_reject/`,
    },
  },
};

/**
 * Get the College ID for X-College-ID header
 * Returns the user's college ID
 */
const SUPER_ADMIN_COLLEGE_KEY = 'kumss_super_admin_selected_college';

const getSuperAdminSelectedCollege = (): number | null => {
  try {
    const stored = localStorage.getItem(SUPER_ADMIN_COLLEGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed === null ? null : Number(parsed);
  } catch {
    return null;
  }
};

export const getCollegeId = (): string => {
  try {
    const storedUser = localStorage.getItem("kumss_user");
    const headerCollege = getSuperAdminSelectedCollege();

    if (!storedUser) {
      return headerCollege !== null ? String(headerCollege) : "all";
    }

    const user = JSON.parse(storedUser) as User;
    const userType = (user as any).user_type || user.userType;
    const isSuper =
      (user as any).is_superuser === true ||
      user.userType === "super_admin" ||
      // Some payloads use snake_case
      userType === "super_admin" ||
      // Allow Chief Accountants (accountants with no assigned college) to switch colleges
      (userType === "accountant" && !user.college) ||
      // Allow Chief Hostel Managers to switch colleges
      userType === "hostel_manager" ||
      // Global roles (college: null) — clerk, construction_head, jr_engineer
      (userType === "clerk" && !user.college) ||
      (userType === "construction_head" && !user.college) ||
      (userType === "jr_engineer" && !user.college);

    if (isSuper) {
      // Respect header selection; fall back to "all" if not chosen
      return headerCollege !== null ? String(headerCollege) : "all";
    }

    if (
      user.college === 0 ||
      user.college === null ||
      user.college === undefined
    ) {
      return "all";
    }

    if (user.college) {
      return String(user.college);
    }

    return "all";
  } catch {
    return "all";
  }
};

/**
 * Default Headers for API requests
 */
export const getDefaultHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-College-ID": getCollegeId(),
    Accept: "application/json",
  };

  // Add Authorization header if token exists
  // Add Authorization header if token exists
  const token = localStorage.getItem("access_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Build full API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
