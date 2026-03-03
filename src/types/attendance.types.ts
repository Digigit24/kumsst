/**
 * Attendance Module Types for KUMSS ERP
 * All types matching Django backend models
 */

import { SubjectListItem } from './academic.types';
import { UserBasic } from './accounts.types';

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface AuditFields {
  created_by: UserBasic | null;
  updated_by: UserBasic | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// STUDENT ATTENDANCE TYPES
// ============================================================================

export interface StudentAttendance extends AuditFields {
  id: number;
  student: number;
  student_name: string;
  student_roll_number: string;
  class_obj: number;
  class_name: string;
  section: number;
  section_name: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
  check_in_time?: string | null;
  check_out_time?: string | null;
  subject: number | null;
  subject_details: SubjectListItem | null;
  period: number | null;
  marked_by: UserBasic | null;
  remarks: string | null;
  is_verified: boolean;
}

export interface StudentAttendanceListItem {
  id: number;
  student: number;
  student_name: string;
  student_roll_number: string;
  class_obj: number;
  class_name: string;
  section: number;
  section_name: string;
  date: string;
  status: string;
  subject: number | null;
  subject_name: string | null;
  marked_by_name: string | null;
  is_verified: boolean;
}

export interface StudentAttendanceCreateInput {
  student: number;
  class_obj: number;
  section: number | null;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
  check_in_time?: string | null;
  check_out_time?: string | null;
  subject?: number | null;
  period?: number | null;
  remarks?: string | null;
  marked_by?: string | null;
  is_verified?: boolean;
}

export interface StudentAttendanceUpdateInput extends Partial<StudentAttendanceCreateInput> {}

export interface BulkAttendanceCreateInput {
  student_ids: number[];
  class_obj: number;
  section: number | null;
  date: string;
  subject?: number | null;
  period?: number | null;
  status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
  remarks?: string | null;
}

// ============================================================================
// STAFF ATTENDANCE TYPES
// ============================================================================

export interface StaffAttendance extends AuditFields {
  id: number;
  teacher: number;
  teacher_name: string;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  remarks: string | null;
  marked_by: string | null;
  marked_by_details: UserBasic | null;
}

export interface StaffAttendanceListItem {
  id: number;
  teacher: number;
  teacher_name: string;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  remarks: string | null;
}

export interface StaffAttendanceCreateInput {
  teacher: number;
  date: string;
  status: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  remarks?: string | null;
  marked_by?: string | null;
}

export interface StaffAttendanceUpdateInput extends Partial<StaffAttendanceCreateInput> {}

export interface BulkStaffAttendanceInput {
  teacher_ids: number[];
  date: string;
  status: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  remarks?: string | null;
}

// ============================================================================
// SUBJECT ATTENDANCE TYPES (Period-wise)
// ============================================================================

export interface SubjectAttendance extends AuditFields {
  id: number;
  subject_assignment: number;
  subject_details: SubjectListItem;
  class_obj: number;
  class_name: string;
  section: number;
  section_name: string;
  date: string;
  period: number;
  period_time: string;
  teacher: string;
  teacher_details: UserBasic;
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
  is_completed: boolean;
  remarks: string | null;
}

export interface SubjectAttendanceListItem {
  id: number;
  subject_assignment: number;
  subject_name: string;
  class_obj: number;
  class_name: string;
  section: number;
  section_name: string;
  date: string;
  period: number;
  teacher_name: string;
  present_count: number;
  absent_count: number;
  attendance_percentage: number;
  is_completed: boolean;
}

export interface SubjectAttendanceCreateInput {
  subject_assignment: number;
  class_obj: number;
  section: number;
  date: string;
  period: number;
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count?: number;
  is_completed?: boolean;
  remarks?: string | null;
}

export interface SubjectAttendanceUpdateInput extends Partial<SubjectAttendanceCreateInput> {}

// ============================================================================
// ATTENDANCE NOTIFICATION TYPES
// ============================================================================

export interface AttendanceNotification extends AuditFields {
  id: number;
  attendance: number;
  student_name: string;
  recipient_type: string;
  recipient: string;
  recipient_details: UserBasic | null;
  notification_type: string;
  status: string;
  message: string;
  sent_at: string | null;
  delivered_at: string | null;
  error_message: string | null;
}

export interface AttendanceNotificationListItem {
  id: number;
  attendance: number;
  student_name: string;
  recipient_type: string;
  notification_type: string;
  status: string;
  sent_at: string | null;
}

export interface AttendanceNotificationCreateInput {
  attendance: number;
  recipient_type: string;
  recipient: string;
  notification_type: string;
  status: string;
  message: string;
  sent_at?: string | null;
  delivered_at?: string | null;
  error_message?: string | null;
}

export interface AttendanceNotificationUpdateInput extends Partial<AttendanceNotificationCreateInput> {}

// ============================================================================
// ATTENDANCE SUMMARY TYPES
// ============================================================================

export interface AttendanceSummary {
  student: number;
  student_name: string;
  student_roll_number: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  excused_days: number;
  half_days: number;
  attendance_percentage: number;
}

export interface SubjectWiseAttendance {
  subject: number;
  subject_name: string;
  total_classes: number;
  attended_classes: number;
  absent_classes: number;
  late_classes: number;
  attendance_percentage: number;
}

export interface StudentAttendanceReport {
  student: number;
  student_name: string;
  student_roll_number: string;
  class_name: string;
  section_name: string;
  overall_summary: AttendanceSummary;
  subject_wise: SubjectWiseAttendance[];
  month_wise: {
    month: string;
    total_days: number;
    present_days: number;
    attendance_percentage: number;
  }[];
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface StudentAttendanceFilters {
  page?: number;
  page_size?: number;
  student?: number;
  class_obj?: number;
  section?: number;
  date?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  subject?: number;
  is_verified?: boolean;
  search?: string;
  ordering?: string;
}

export interface StaffAttendanceFilters {
  page?: number;
  page_size?: number;
  teacher?: number;
  date?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  search?: string;
  ordering?: string;
}

export interface SubjectAttendanceFilters {
  page?: number;
  page_size?: number;
  subject_assignment?: number;
  class_obj?: number;
  section?: number;
  date?: string;
  date_from?: string;
  date_to?: string;
  teacher?: string;
  is_completed?: boolean;
  search?: string;
  ordering?: string;
}

export interface AttendanceNotificationFilters {
  page?: number;
  page_size?: number;
  student?: number;
  date?: string;
  date_from?: string;
  date_to?: string;
  notification_type?: string;
  is_sent?: boolean;
  search?: string;
  ordering?: string;
}
