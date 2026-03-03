
export interface AttendanceDrillDownFilters {
  from_date?: string;
  to_date?: string;
  academic_year_id?: number;
  term_id?: number;
  threshold?: number;
  [key: string]: any;
}

export interface AttendanceStats {
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  on_leave_count?: number; // Optional as it might not be in all responses
  attendance_rate?: number; // API uses attendance_rate or overall_attendance_rate
}

export interface AttendanceProgramSummary {
  program_id: number;
  program_name: string;
  program_code: string;
  total_students: number;
  attendance_rate: number;
  present_count: number;
  absent_count: number;
  low_attendance_count: number;
}

export interface AttendanceTrendID {
  date: string;
  present_percentage: number;
}

export interface AttendanceCollegeResponse {
  total_students: number;
  overall_attendance_rate: number;
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  low_attendance_count: number;
  program_breakdown: AttendanceProgramSummary[];
  daily_trend: AttendanceTrendID[];
  from_date: string;
  to_date: string;
  generated_at: string;
}

export interface AttendanceClassSummary {
  class_id: number;
  class_name: string;
  semester: number;
  total_sections: number;
  total_students: number;
  attendance_rate: number;
  present_count: number;
  absent_count: number;
  low_attendance_count: number;
  class_teacher_name?: string; // Optional as not in recent sample
}

export interface AttendanceProgramResponse {
  program_id: number;
  program_name: string;
  program_code: string;
  total_students: number;
  overall_attendance_rate: number;
  present_count: number;
  absent_count: number;
  class_breakdown: AttendanceClassSummary[];
  from_date: string;
  to_date: string;
  generated_at: string;
}

export interface AttendanceClassResponse {
  class_id: number;
  class_name: string;
  program_name: string;
  semester: number;
  total_students: number;
  overall_attendance_rate: number;
  present_count: number;
  absent_count: number;
  section_breakdown: AttendanceSectionBreakdown[];
  subject_breakdown: AttendanceSubjectBreakdown[];
  from_date: string;
  to_date: string;
  generated_at: string;
}

export interface AttendanceSectionBreakdown {
  section_id: number;
  section_name: string;
  total_students: number;
  attendance_rate: number;
  present_count: number;
  absent_count: number;
  low_attendance_count: number;
}

export interface AttendanceSubjectBreakdown {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  total_records: number;
  present_count: number;
  absent_count: number;
  attendance_rate: number;
  teacher_name?: string;
}

export interface AttendanceSectionResponse {
  section_id: number;
  section_name: string;
  class_name: string;
  program_name: string;
  total_students: number;
  overall_attendance_rate: number;
  present_count: number;
  absent_count: number;
  low_attendance_count: number;
  student_list: AttendanceStudentSectionSummary[];
  from_date: string;
  to_date: string;
  generated_at: string;
}

export interface AttendanceStudentSectionSummary {
  student_id: number;
  id?: number; // Fallback for some API responses
  admission_number: string;
  student_name: string;
  roll_number: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  attendance_rate: number;
  is_low_attendance: boolean;
}

export interface AttendanceStudentSummary {
  student_id: number;
  student_name: string;
  roll_number: string;
  // Based on "student_breakdown": [] in example, assuming these fields for now, 
  // but if it's empty I can't be 100% sure. 
  // However, traditionally:
  attendance_percentage: number;
  attended_classes: number;
  total_classes: number;
  // status might be derived or explicit
  status?: string;
}

export interface AttendanceSubjectResponse {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  total_students: number;
  total_classes_conducted: number;
  overall_attendance_rate: number;
  low_attendance_count: number;
  student_breakdown: AttendanceStudentSummary[];
  present_count?: number; // Optional fields for backward compatibility or if API provides them
  absent_count?: number;
  late_count?: number;
  from_date: string;
  to_date: string;
  generated_at: string;
}

export interface AttendanceStudentResponse {
  student_id: number;
  admission_number: string;
  student_name: string;
  roll_number: string;
  class_name: string;
  section_name: string;
  program_name: string;
  overall_attendance_rate: number;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  is_low_attendance: boolean;
  subject_breakdown: {
    subject_id: number;
    subject_name: string;
    attendance_percentage: number;
    total_classes: number;
    attended_classes: number;
  }[];
  attendance_records: {
    date: string;
    status: string;
    check_in_time?: string | null;
    check_out_time?: string | null;
    remarks?: string | null;
  }[];
  monthly_summary: {
    month: string;
    total_days: number;
    present_days: number;
    absent_days: number;
    late_days: number;
    attendance_rate: number;
  }[];
  from_date: string;
  to_date: string;
  generated_at: string;
}

export interface LowAttendanceAlert {
  student_id: number;
  student_name: string;
  class_name: string;
  section_name: string;
  attendance_percentage: number;
  guardian_name: string;
  guardian_phone: string;
}
