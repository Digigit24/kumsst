/**
 * Notifications Mock Data
 * Comprehensive notifications for college management system
 */

export type NotificationType =
  | 'print_request'
  | 'fee_payment'
  | 'attendance'
  | 'exam'
  | 'assignment'
  | 'leave'
  | 'admission'
  | 'document'
  | 'library'
  | 'event'
  | 'grade'
  | 'timetable'
  | 'announcement'
  | 'approval';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type UserRole = 'super_admin' | 'college_admin' | 'teacher' | 'student' | 'parent';

export interface Notification {
  id: number;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  roles: UserRole[]; // Which roles should see this notification
  relatedTo?: string; // e.g., "Student Name", "Teacher Name"
  metadata?: {
    count?: number;
    dueDate?: string;
    amount?: number;
    [key: string]: any;
  };
}

export const mockNotifications: Notification[] = [
  // ================= ADMIN NOTIFICATIONS =================
  {
    id: 1,
    type: 'print_request',
    priority: 'urgent',
    title: 'Urgent Print Request',
    message: 'Final Semester Exam - Mathematics requires 150 copies by Dec 28',
    timestamp: '2025-12-26T10:30:00Z',
    read: false,
    actionUrl: '/store/print-requests',
    actionText: 'Review Request',
    roles: ['super_admin', 'college_admin'],
    relatedTo: 'Dr. Ramesh Kumar',
    metadata: {
      count: 150,
      dueDate: '2025-12-28',
    },
  },
  {
    id: 2,
    type: 'admission',
    priority: 'high',
    title: 'New Admission Applications',
    message: '12 new admission applications pending review',
    timestamp: '2025-12-26T09:00:00Z',
    read: false,
    actionUrl: '/admissions/pending',
    actionText: 'Review Applications',
    roles: ['super_admin', 'college_admin'],
    metadata: {
      count: 12,
    },
  },
  {
    id: 3,
    type: 'document',
    priority: 'high',
    title: 'Document Verification Pending',
    message: '8 student documents awaiting verification',
    timestamp: '2025-12-26T08:15:00Z',
    read: false,
    actionUrl: '/students/documents',
    actionText: 'Verify Documents',
    roles: ['super_admin', 'college_admin'],
    metadata: {
      count: 8,
    },
  },
  {
    id: 4,
    type: 'leave',
    priority: 'normal',
    title: 'Leave Approval Required',
    message: '5 staff leave applications pending approval',
    timestamp: '2025-12-25T16:30:00Z',
    read: false,
    actionUrl: '/hr/leave-approvals',
    actionText: 'Review Leaves',
    roles: ['super_admin', 'college_admin'],
    metadata: {
      count: 5,
    },
  },
  {
    id: 5,
    type: 'fee_payment',
    priority: 'high',
    title: 'Fee Collection Alert',
    message: '45 students have pending fees exceeding ₹50,000',
    timestamp: '2025-12-25T14:00:00Z',
    read: true,
    actionUrl: '/fees/collections',
    actionText: 'View Details',
    roles: ['super_admin', 'college_admin'],
    metadata: {
      count: 45,
      amount: 50000,
    },
  },

  // ================= TEACHER NOTIFICATIONS =================
  {
    id: 6,
    type: 'print_request',
    priority: 'normal',
    title: 'Print Request Approved',
    message: 'Your print request for Physics Mid-Term has been approved',
    timestamp: '2025-12-26T11:00:00Z',
    read: false,
    actionUrl: '/store/print-requests',
    actionText: 'View Status',
    roles: ['teacher'],
    relatedTo: 'Prof. Anjali Verma',
  },
  {
    id: 7,
    type: 'assignment',
    priority: 'normal',
    title: 'Assignment Submissions',
    message: '18 new assignment submissions awaiting review',
    timestamp: '2025-12-26T10:00:00Z',
    read: false,
    actionUrl: '/assignments/submissions',
    actionText: 'Review Submissions',
    roles: ['teacher'],
    metadata: {
      count: 18,
    },
  },
  {
    id: 8,
    type: 'attendance',
    priority: 'high',
    title: 'Attendance Not Marked',
    message: 'Please mark attendance for Class 10-A (Mathematics)',
    timestamp: '2025-12-26T09:30:00Z',
    read: false,
    actionUrl: '/teacher/attendance',
    actionText: 'Mark Attendance',
    roles: ['teacher'],
    relatedTo: 'Class 10-A',
  },
  {
    id: 9,
    type: 'exam',
    priority: 'high',
    title: 'Exam Marks Entry Deadline',
    message: 'Submit marks for Final Exam by Dec 30, 2025',
    timestamp: '2025-12-25T15:00:00Z',
    read: false,
    actionUrl: '/exams/marks-entry',
    actionText: 'Enter Marks',
    roles: ['teacher'],
    metadata: {
      dueDate: '2025-12-30',
    },
  },
  {
    id: 10,
    type: 'timetable',
    priority: 'normal',
    title: 'Timetable Update',
    message: 'Your class schedule for next week has been updated',
    timestamp: '2025-12-25T12:00:00Z',
    read: true,
    actionUrl: '/academic/timetables',
    actionText: 'View Schedule',
    roles: ['teacher'],
  },

  // ================= STUDENT NOTIFICATIONS =================
  {
    id: 11,
    type: 'fee_payment',
    priority: 'urgent',
    title: 'Fee Payment Due',
    message: 'Semester fee payment of ₹45,000 due by Jan 15, 2026',
    timestamp: '2025-12-26T08:00:00Z',
    read: false,
    actionUrl: '/student/fees',
    actionText: 'Pay Now',
    roles: ['student', 'parent'],
    metadata: {
      amount: 45000,
      dueDate: '2026-01-15',
    },
  },
  {
    id: 12,
    type: 'exam',
    priority: 'high',
    title: 'Exam Schedule Released',
    message: 'Final semester examination schedule is now available',
    timestamp: '2025-12-25T16:00:00Z',
    read: false,
    actionUrl: '/student/examinations/schedules',
    actionText: 'View Schedule',
    roles: ['student', 'parent'],
  },
  {
    id: 13,
    type: 'assignment',
    priority: 'high',
    title: 'Assignment Due Soon',
    message: 'Physics Assignment 3 due on Dec 28, 2025',
    timestamp: '2025-12-25T14:30:00Z',
    read: false,
    actionUrl: '/student/academics/assignments',
    actionText: 'Submit Assignment',
    roles: ['student'],
    metadata: {
      dueDate: '2025-12-28',
    },
  },
  {
    id: 14,
    type: 'grade',
    priority: 'normal',
    title: 'Marks Published',
    message: 'Mid-term examination marks are now available',
    timestamp: '2025-12-25T10:00:00Z',
    read: false,
    actionUrl: '/student/examinations/results',
    actionText: 'View Marks',
    roles: ['student', 'parent'],
  },
  {
    id: 15,
    type: 'library',
    priority: 'high',
    title: 'Library Book Overdue',
    message: 'Return "Advanced Mathematics" by Dec 27 to avoid fine',
    timestamp: '2025-12-24T09:00:00Z',
    read: false,
    actionUrl: '/library/my-books',
    actionText: 'View Books',
    roles: ['student'],
    metadata: {
      dueDate: '2025-12-27',
    },
  },
  {
    id: 16,
    type: 'attendance',
    priority: 'urgent',
    title: 'Low Attendance Alert',
    message: 'Your attendance is below 75%. Current: 68%',
    timestamp: '2025-12-24T08:00:00Z',
    read: false,
    actionUrl: '/attendance/my-attendance',
    actionText: 'View Attendance',
    roles: ['student', 'parent'],
    metadata: {
      percentage: 68,
    },
  },
  {
    id: 17,
    type: 'event',
    priority: 'normal',
    title: 'Sports Day Registration',
    message: 'Register for Annual Sports Day by Jan 10, 2026',
    timestamp: '2025-12-23T10:00:00Z',
    read: true,
    actionUrl: '/events/sports-day',
    actionText: 'Register Now',
    roles: ['student'],
    metadata: {
      dueDate: '2026-01-10',
    },
  },

  // ================= PARENT NOTIFICATIONS =================
  {
    id: 18,
    type: 'attendance',
    priority: 'high',
    title: 'Student Absence Alert',
    message: 'Your ward was absent on Dec 25, 2025',
    timestamp: '2025-12-25T17:00:00Z',
    read: false,
    actionUrl: '/parent/attendance',
    actionText: 'View Details',
    roles: ['parent'],
    relatedTo: 'Student Name',
    metadata: {
      date: '2025-12-25',
    },
  },

  // ================= GENERAL ANNOUNCEMENTS =================
  {
    id: 19,
    type: 'announcement',
    priority: 'high',
    title: 'Winter Break Notice',
    message: 'College closed for winter break: Jan 1-7, 2026',
    timestamp: '2025-12-23T09:00:00Z',
    read: true,
    actionUrl: '/notices',
    actionText: 'Read More',
    roles: ['super_admin', 'college_admin', 'teacher', 'student', 'parent'],
    metadata: {
      startDate: '2026-01-01',
      endDate: '2026-01-07',
    },
  },
  {
    id: 20,
    type: 'event',
    priority: 'normal',
    title: 'Parent-Teacher Meeting',
    message: 'PTM scheduled for Dec 28, 2025 at 10:00 AM',
    timestamp: '2025-12-22T14:00:00Z',
    read: true,
    actionUrl: '/events/ptm',
    actionText: 'Confirm Attendance',
    roles: ['teacher', 'parent'],
    metadata: {
      date: '2025-12-28',
      time: '10:00 AM',
    },
  },
];

// Helper functions
export const getNotificationIcon = (type: NotificationType): string => {
  const icons = {
    print_request: '🖨️',
    fee_payment: '💳',
    attendance: '📋',
    exam: '📝',
    assignment: '📄',
    leave: '🏖️',
    admission: '🎓',
    document: '📑',
    library: '📚',
    event: '📅',
    grade: '🏆',
    timetable: '⏰',
    announcement: '📢',
    approval: '✅',
  };
  return icons[type] || '🔔';
};

export const getPriorityColor = (priority: NotificationPriority): string => {
  const colors = {
    urgent: 'destructive',
    high: 'warning',
    normal: 'default',
    low: 'secondary',
  };
  return colors[priority] || 'default';
};

export const getNotificationsByRole = (role: UserRole, includeRead: boolean = true): Notification[] => {
  return mockNotifications
    .filter(n => n.roles.includes(role))
    .filter(n => includeRead || !n.read)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getUnreadCount = (role: UserRole): number => {
  return mockNotifications.filter(n => n.roles.includes(role) && !n.read).length;
};

export const getUrgentNotifications = (role: UserRole): Notification[] => {
  return mockNotifications
    .filter(n => n.roles.includes(role) && n.priority === 'urgent' && !n.read);
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
};
