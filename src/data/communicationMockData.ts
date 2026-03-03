/**
 * Communication Module Mock Data
 * Comprehensive mock data for messaging, announcements, and notifications
 */

export type RecipientType = 'student' | 'guardian' | 'teacher' | 'staff' | 'all' | 'custom';
export type CommunicationType = 'sms' | 'email' | 'push' | 'all';
export type MessageStatus = 'draft' | 'scheduled' | 'sent' | 'failed' | 'delivered' | 'read';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface CommunicationMessage {
  id: number;
  title: string;
  message: string;
  recipientType: RecipientType;
  communicationType: CommunicationType;
  status: MessageStatus;
  priority: MessagePriority;
  sentBy: string;
  sentAt?: string;
  scheduledAt?: string;
  createdAt: string;
  totalRecipients: number;
  delivered: number;
  read: number;
  failed: number;
  recipients?: Recipient[];
  attachments?: string[];
  template?: string;
  classFilter?: string[];
  sectionFilter?: string[];
  programFilter?: string[];
}

export interface Recipient {
  id: number;
  name: string;
  type: 'student' | 'guardian' | 'teacher' | 'staff';
  email?: string;
  phone?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  deliveredAt?: string;
  readAt?: string;
}

export interface MessageTemplate {
  id: number;
  name: string;
  title: string;
  content: string;
  category: 'announcement' | 'reminder' | 'alert' | 'invitation' | 'general';
  variables: string[];
  createdAt: string;
  usageCount: number;
}

export interface CommunicationFilter {
  recipientType?: RecipientType[];
  communicationType?: CommunicationType[];
  status?: MessageStatus[];
  priority?: MessagePriority[];
  dateRange?: {
    from: string;
    to: string;
  };
  classes?: string[];
  sections?: string[];
  programs?: string[];
  searchQuery?: string;
}

// Mock Communication Messages
export const mockCommunicationMessages: CommunicationMessage[] = [
  {
    id: 1,
    title: 'Parent-Teacher Meeting Reminder',
    message: 'Dear Parents/Guardians, This is to remind you about the upcoming Parent-Teacher Meeting scheduled for December 28, 2025, at 10:00 AM. Please ensure your attendance. Regards, Principal',
    recipientType: 'guardian',
    communicationType: 'all',
    status: 'sent',
    priority: 'high',
    sentBy: 'Principal',
    sentAt: '2025-12-24T09:00:00Z',
    createdAt: '2025-12-24T08:30:00Z',
    totalRecipients: 245,
    delivered: 240,
    read: 180,
    failed: 5,
    classFilter: ['10-A', '10-B', '11-A'],
  },
  {
    id: 2,
    title: 'Semester Exam Schedule Released',
    message: 'Dear Students, The semester examination schedule has been released. Please check the notice board and student portal for detailed timings. Best wishes for your preparation!',
    recipientType: 'student',
    communicationType: 'email',
    status: 'sent',
    priority: 'high',
    sentBy: 'Academic Coordinator',
    sentAt: '2025-12-23T14:00:00Z',
    createdAt: '2025-12-23T13:45:00Z',
    totalRecipients: 1247,
    delivered: 1247,
    read: 980,
    failed: 0,
  },
  {
    id: 3,
    title: 'Staff Meeting - January Planning',
    message: 'All teaching and non-teaching staff are requested to attend the monthly planning meeting on December 30, 2025, at 2:00 PM in the conference hall. Attendance is mandatory.',
    recipientType: 'staff',
    communicationType: 'email',
    status: 'sent',
    priority: 'normal',
    sentBy: 'HR Department',
    sentAt: '2025-12-22T10:00:00Z',
    createdAt: '2025-12-22T09:30:00Z',
    totalRecipients: 120,
    delivered: 120,
    read: 115,
    failed: 0,
  },
  {
    id: 4,
    title: 'Fee Payment Reminder',
    message: 'Dear Parents, This is a reminder that the second semester fee payment is due by January 15, 2026. Please make the payment before the due date to avoid late fees. Thank you.',
    recipientType: 'guardian',
    communicationType: 'sms',
    status: 'sent',
    priority: 'normal',
    sentBy: 'Accounts Department',
    sentAt: '2025-12-20T11:00:00Z',
    createdAt: '2025-12-20T10:30:00Z',
    totalRecipients: 350,
    delivered: 345,
    read: 300,
    failed: 5,
  },
  {
    id: 5,
    title: 'Winter Break Notice',
    message: 'Dear All, The college will remain closed for winter break from January 1-7, 2026. Classes will resume on January 8, 2026. Have a wonderful holiday season!',
    recipientType: 'all',
    communicationType: 'all',
    status: 'sent',
    priority: 'normal',
    sentBy: 'Administration',
    sentAt: '2025-12-19T09:00:00Z',
    createdAt: '2025-12-19T08:00:00Z',
    totalRecipients: 1612,
    delivered: 1605,
    read: 1450,
    failed: 7,
  },
  {
    id: 6,
    title: 'Sports Day Registration Open',
    message: 'Dear Students, Registration for Annual Sports Day 2026 is now open! Visit the sports office or register online through the student portal. Last date: January 10, 2026.',
    recipientType: 'student',
    communicationType: 'push',
    status: 'sent',
    priority: 'normal',
    sentBy: 'Sports Department',
    sentAt: '2025-12-18T15:00:00Z',
    createdAt: '2025-12-18T14:30:00Z',
    totalRecipients: 1247,
    delivered: 1247,
    read: 850,
    failed: 0,
  },
  {
    id: 7,
    title: 'Teacher Training Workshop',
    message: 'A professional development workshop on "Modern Teaching Methodologies" will be conducted on January 12, 2026. All teachers are requested to register by January 5, 2026.',
    recipientType: 'teacher',
    communicationType: 'email',
    status: 'scheduled',
    priority: 'normal',
    sentBy: 'Training Department',
    scheduledAt: '2025-12-28T09:00:00Z',
    createdAt: '2025-12-26T10:00:00Z',
    totalRecipients: 85,
    delivered: 0,
    read: 0,
    failed: 0,
  },
  {
    id: 8,
    title: 'Library Book Return Reminder',
    message: 'Dear Students, Please return all borrowed library books by December 30, 2025, before the winter break. Late returns will incur fines.',
    recipientType: 'student',
    communicationType: 'sms',
    status: 'sent',
    priority: 'low',
    sentBy: 'Librarian',
    sentAt: '2025-12-17T12:00:00Z',
    createdAt: '2025-12-17T11:30:00Z',
    totalRecipients: 450,
    delivered: 445,
    read: 380,
    failed: 5,
  },
  {
    id: 9,
    title: 'Emergency: Campus Closure Alert',
    message: 'URGENT: Due to severe weather conditions, the campus will be closed on December 27, 2025. All classes are cancelled. Stay safe!',
    recipientType: 'all',
    communicationType: 'all',
    status: 'sent',
    priority: 'urgent',
    sentBy: 'Emergency Response Team',
    sentAt: '2025-12-26T06:00:00Z',
    createdAt: '2025-12-26T05:45:00Z',
    totalRecipients: 1612,
    delivered: 1608,
    read: 1580,
    failed: 4,
  },
  {
    id: 10,
    title: 'Science Exhibition Invitation',
    message: 'You are cordially invited to the Annual Science Exhibition on January 20, 2026, at 11:00 AM. Students will showcase their innovative projects. Your presence will encourage our students.',
    recipientType: 'guardian',
    communicationType: 'email',
    status: 'draft',
    priority: 'normal',
    sentBy: 'Science Department',
    createdAt: '2025-12-26T14:00:00Z',
    totalRecipients: 0,
    delivered: 0,
    read: 0,
    failed: 0,
  },
];

// Mock Message Templates
export const mockMessageTemplates: MessageTemplate[] = [
  {
    id: 1,
    name: 'Fee Payment Reminder',
    title: 'Fee Payment Due Reminder',
    content: 'Dear {GUARDIAN_NAME}, This is a reminder that the {FEE_TYPE} payment of {AMOUNT} for {STUDENT_NAME} is due by {DUE_DATE}. Please make the payment to avoid late fees.',
    category: 'reminder',
    variables: ['GUARDIAN_NAME', 'FEE_TYPE', 'AMOUNT', 'STUDENT_NAME', 'DUE_DATE'],
    createdAt: '2025-11-01T00:00:00Z',
    usageCount: 45,
  },
  {
    id: 2,
    name: 'Absence Alert',
    title: 'Student Absence Notification',
    content: 'Dear {GUARDIAN_NAME}, Your ward {STUDENT_NAME} was absent from school on {DATE}. If this absence was unplanned, please contact the school office.',
    category: 'alert',
    variables: ['GUARDIAN_NAME', 'STUDENT_NAME', 'DATE'],
    createdAt: '2025-11-01T00:00:00Z',
    usageCount: 120,
  },
  {
    id: 3,
    name: 'Exam Performance',
    title: 'Examination Results Available',
    content: 'Dear {GUARDIAN_NAME}, The results for {EXAM_NAME} are now available. {STUDENT_NAME} has scored {PERCENTAGE}%. Please check the student portal for detailed marks.',
    category: 'announcement',
    variables: ['GUARDIAN_NAME', 'STUDENT_NAME', 'EXAM_NAME', 'PERCENTAGE'],
    createdAt: '2025-11-01T00:00:00Z',
    usageCount: 35,
  },
  {
    id: 4,
    name: 'Event Invitation',
    title: '{EVENT_NAME} - Invitation',
    content: 'Dear {RECIPIENT_NAME}, You are cordially invited to {EVENT_NAME} scheduled on {DATE} at {TIME}. Venue: {VENUE}. Your presence will be highly appreciated.',
    category: 'invitation',
    variables: ['RECIPIENT_NAME', 'EVENT_NAME', 'DATE', 'TIME', 'VENUE'],
    createdAt: '2025-11-01T00:00:00Z',
    usageCount: 28,
  },
  {
    id: 5,
    name: 'General Announcement',
    title: '{ANNOUNCEMENT_TITLE}',
    content: 'Dear {RECIPIENT_TYPE}, {MESSAGE_CONTENT}. Regards, {SENDER_NAME}',
    category: 'general',
    variables: ['RECIPIENT_TYPE', 'ANNOUNCEMENT_TITLE', 'MESSAGE_CONTENT', 'SENDER_NAME'],
    createdAt: '2025-11-01T00:00:00Z',
    usageCount: 95,
  },
  {
    id: 6,
    name: 'Meeting Reminder',
    title: 'Reminder: {MEETING_TYPE}',
    content: 'This is a reminder about the {MEETING_TYPE} scheduled for {DATE} at {TIME}. Venue: {VENUE}. Please ensure your attendance.',
    category: 'reminder',
    variables: ['MEETING_TYPE', 'DATE', 'TIME', 'VENUE'],
    createdAt: '2025-11-01T00:00:00Z',
    usageCount: 62,
  },
];

// Mock Recipients for detailed view
export const mockRecipients: Recipient[] = [
  {
    id: 1,
    name: 'John Smith (Father)',
    type: 'guardian',
    email: 'john.smith@email.com',
    phone: '+91-9876543210',
    status: 'read',
    deliveredAt: '2025-12-24T09:02:00Z',
    readAt: '2025-12-24T10:15:00Z',
  },
  {
    id: 2,
    name: 'Emma Johnson (Mother)',
    type: 'guardian',
    email: 'emma.j@email.com',
    phone: '+91-9876543211',
    status: 'delivered',
    deliveredAt: '2025-12-24T09:03:00Z',
  },
  {
    id: 3,
    name: 'Michael Brown (Father)',
    type: 'guardian',
    email: 'michael.b@email.com',
    phone: '+91-9876543212',
    status: 'failed',
  },
  {
    id: 4,
    name: 'Sarah Davis',
    type: 'student',
    email: 'sarah.d@student.edu',
    phone: '+91-9876543213',
    status: 'read',
    deliveredAt: '2025-12-23T14:01:00Z',
    readAt: '2025-12-23T15:30:00Z',
  },
  {
    id: 5,
    name: 'Prof. Robert Wilson',
    type: 'teacher',
    email: 'robert.w@college.edu',
    phone: '+91-9876543214',
    status: 'read',
    deliveredAt: '2025-12-22T10:01:00Z',
    readAt: '2025-12-22T10:05:00Z',
  },
];

// Communication Statistics
export interface CommunicationStats {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  totalScheduled: number;
  totalDrafts: number;
  byType: {
    sms: number;
    email: number;
    push: number;
    all: number;
  };
  byRecipient: {
    student: number;
    guardian: number;
    teacher: number;
    staff: number;
    all: number;
  };
}

export const getMockCommunicationStats = (): CommunicationStats => {
  const messages = mockCommunicationMessages;

  return {
    totalSent: messages.filter(m => m.status === 'sent').length,
    totalDelivered: messages.reduce((sum, m) => sum + m.delivered, 0),
    totalRead: messages.reduce((sum, m) => sum + m.read, 0),
    totalFailed: messages.reduce((sum, m) => sum + m.failed, 0),
    totalScheduled: messages.filter(m => m.status === 'scheduled').length,
    totalDrafts: messages.filter(m => m.status === 'draft').length,
    byType: {
      sms: messages.filter(m => m.communicationType === 'sms').length,
      email: messages.filter(m => m.communicationType === 'email').length,
      push: messages.filter(m => m.communicationType === 'push').length,
      all: messages.filter(m => m.communicationType === 'all').length,
    },
    byRecipient: {
      student: messages.filter(m => m.recipientType === 'student').length,
      guardian: messages.filter(m => m.recipientType === 'guardian').length,
      teacher: messages.filter(m => m.recipientType === 'teacher').length,
      staff: messages.filter(m => m.recipientType === 'staff').length,
      all: messages.filter(m => m.recipientType === 'all').length,
    },
  };
};

// Helper function to get status color
export const getStatusColor = (status: MessageStatus): string => {
  switch (status) {
    case 'sent':
    case 'delivered':
    case 'read':
      return 'success';
    case 'scheduled':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'failed':
      return 'destructive';
    default:
      return 'default';
  }
};

// Helper function to get priority color
export const getPriorityColor = (priority: MessagePriority): string => {
  switch (priority) {
    case 'urgent':
      return 'destructive';
    case 'high':
      return 'warning';
    case 'normal':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'default';
  }
};
