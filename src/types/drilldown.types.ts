/**
 * Academic Drill-Down Dashboard Types
 * Types for hierarchical academic performance drill-down from college to student level
 */

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

export interface DrillDownDateFilters {
  from_date?: string; // YYYY-MM-DD format
  to_date?: string; // YYYY-MM-DD format
}

export interface CollegeOverviewFilters extends DrillDownDateFilters {
  academic_year?: number;
}

export interface ProgramDrillDownFilters extends DrillDownDateFilters {
  academic_year?: number;
}

export interface ClassDrillDownFilters extends DrillDownDateFilters {}

export interface SectionDrillDownFilters extends DrillDownDateFilters {}

export interface SubjectDrillDownFilters extends DrillDownDateFilters {
  class?: number;
  section?: number;
}

export interface StudentDrillDownFilters extends DrillDownDateFilters {}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

// Program breakdown in college overview
export interface ProgramBreakdown {
  program_id: number;
  program_name: string;
  program_code: string;
  faculty_name: string;
  total_students: number;
  total_classes: number;
  average_percentage: number;
  pass_percentage: number;
  attendance_rate: number;
}

// College-level overview response
export interface CollegeOverviewResponse {
  total_students: number;
  total_programs: number;
  total_classes: number;
  overall_pass_percentage: number;
  overall_average_percentage: number;
  overall_attendance_rate: number;
  program_breakdown: ProgramBreakdown[];
  generated_at: string;
}

// Class breakdown in program drill-down
export interface ClassBreakdown {
  class_id: number;
  class_name: string;
  semester: number;
  year: number;
  total_students: number;
  total_sections: number;
  average_percentage: number;
  pass_percentage: number;
  attendance_rate: number;
}

// Program-level drill-down response
export interface ProgramDrillDownResponse {
  program_id: number;
  program_name: string;
  program_code: string;
  faculty_name: string;
  total_students: number;
  total_classes: number;
  average_percentage: number;
  pass_percentage: number;
  attendance_rate: number;
  class_breakdown: ClassBreakdown[];
  generated_at: string;
}

// Section breakdown in class drill-down
export interface SectionBreakdown {
  section_id: number;
  section_name: string;
  total_students: number;
  average_percentage: number;
  pass_percentage: number;
  attendance_rate: number;
}

// Class-level drill-down response
export interface ClassDrillDownResponse {
  class_id: number;
  class_name: string;
  program_name: string;
  semester: number;
  year: number;
  total_students: number;
  average_percentage: number;
  pass_percentage: number;
  attendance_rate: number;
  section_breakdown: SectionBreakdown[];
  generated_at: string;
}

// Subject breakdown in section drill-down
export interface SubjectBreakdown {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  average_marks: number;
  pass_percentage: number;
  total_students_appeared: number;
}

// Student in section list
export interface StudentListItem {
  student_id: number;
  admission_number: string;
  student_name: string;
  roll_number: string;
  average_percentage: number;
  attendance_percentage: number;
  grade: string;
  rank: number;
}

// Section-level drill-down response
export interface SectionDrillDownResponse {
  section_id: number;
  section_name: string;
  class_name: string;
  program_name: string;
  total_students: number;
  average_percentage: number;
  pass_percentage: number;
  attendance_rate: number;
  subject_breakdown: SubjectBreakdown[];
  student_list: StudentListItem[];
  generated_at: string;
}

// Student marks in subject drill-down
export interface StudentSubjectMarks {
  student_id: number;
  admission_number: string;
  student_name: string;
  roll_number: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  attendance_percentage: number;
}

// Subject-level drill-down response
export interface SubjectDrillDownResponse {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  class_name: string;
  program_name: string;
  total_students: number;
  average_marks: number;
  highest_marks: number;
  lowest_marks: number;
  pass_percentage: number;
  student_marks: StudentSubjectMarks[];
  generated_at: string;
}

// Exam result in student profile
export interface StudentExamResult {
  exam_id: number;
  exam_name: string;
  exam_type: string;
  exam_date: string;
  total_marks: number;
  marks_obtained: number;
  percentage: number;
  grade: string;
  rank: number;
}

// Subject-wise marks in student profile
export interface StudentSubjectWiseMarks {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
}

// Student-level drill-down response
export interface StudentDrillDownResponse {
  student_id: number;
  admission_number: string;
  student_name: string;
  roll_number: string;
  class_name: string;
  section_name: string;
  program_name: string;
  overall_percentage: number;
  overall_grade: string;
  overall_rank: number;
  total_exams: number;
  attendance_percentage: number;
  total_days: number;
  present_days: number;
  absent_days: number;
  exam_results: StudentExamResult[];
  subject_wise_marks: StudentSubjectWiseMarks[];
  generated_at: string;
}
