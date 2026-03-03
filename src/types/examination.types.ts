/**
 * Examination Module Types for KUMSS ERP
 * All types matching Django backend models
 */

import { UserBasic } from './accounts.types';
import { SubjectListItem } from './academic.types';

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
// EXAM TYPE TYPES
// ============================================================================

export interface ExamType extends AuditFields {
  id: number;
  college: number;
  college_name: string;
  name: string;
  code: string;
  description: string | null;
  weightage: number; // Percentage weightage in final grade
  display_order: number;
  is_active: boolean;
}

export interface ExamTypeListItem {
  id: number;
  name: string;
  code: string;
  college: number;
  college_name: string;
  description?: string | null;
  weightage: number;
  is_active: boolean;
}

export interface ExamTypeCreateInput {
  college: number;
  name: string;
  code: string;
  description?: string | null;
  weightage: number;
  display_order?: number;
  is_active?: boolean;
}

export interface ExamTypeUpdateInput extends Partial<ExamTypeCreateInput> { }

// ============================================================================
// EXAM TYPES
// ============================================================================

export interface Exam extends AuditFields {
  id: number;
  college: number;
  college_name: string;
  exam_type: number;
  exam_type_details: ExamTypeListItem;
  academic_session: number;
  session_name: string;
  class_obj: number;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  result_declaration_date: string | null;
  registration_start: string;
  registration_end: string;
  description: string | null;
  is_published: boolean;
  is_active: boolean;
}

export interface ExamListItem {
  id: number;
  name: string;
  code: string;
  college: number;
  college_name: string;
  exam_type: number;
  exam_type_name: string;
  academic_session: number;
  session_name: string;
  class_obj: number;
  start_date: string;
  end_date: string;
  is_published: boolean;
  is_active: boolean;
}

export interface ExamCreateInput {
  college: number;
  exam_type: number;
  academic_session: number;
  class_obj: number;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  result_declaration_date?: string | null;
  registration_start: string;
  registration_end: string;
  description?: string | null;
  is_published?: boolean;
  is_active?: boolean;
}

export interface ExamUpdateInput extends Partial<ExamCreateInput> { }

// ============================================================================
// EXAM SCHEDULE TYPES
// ============================================================================

export interface ExamSchedule extends AuditFields {
  id: number;
  exam: number;
  exam_details: ExamListItem;
  subject: number;
  subject_details: SubjectListItem;
  class_obj: number;
  class_name: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  max_marks: number;
  pass_marks: number;
  allowed_time: number; // in minutes
  room: string | null;
  instructions: string | null;
  is_active: boolean;
}

export interface ExamScheduleListItem {
  id: number;
  exam: number;
  exam_name: string;
  subject: number;
  subject_name: string;
  class_obj: number;
  class_name: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  max_marks: number;
  allowed_time: number;
  is_active: boolean;
}

export interface ExamScheduleCreateInput {
  exam: number;
  subject: number;
  class_obj: number;
  exam_date: string;
  start_time: string;
  end_time: string;
  max_marks: number;
  pass_marks: number;
  allowed_time: number;
  room?: string | null;
  instructions?: string | null;
  is_active?: boolean;
}

export interface ExamScheduleUpdateInput extends Partial<ExamScheduleCreateInput> { }

// ============================================================================
// MARKS ENTRY TYPES
// ============================================================================

export interface MarksEntry extends AuditFields {
  id: number;
  exam_schedule: number;
  exam_schedule_details: ExamScheduleListItem;
  student: number;
  student_name: string;
  student_roll_number: string;
  theory_marks: number | null;
  practical_marks: number | null;
  internal_marks: number | null;
  total_marks: number | null;
  obtained_marks: number;
  is_absent: boolean;
  remarks: string | null;
  entered_by: UserBasic | null;
  verified_by: UserBasic | null;
  verified_at: string | null;
}

export interface MarksEntryListItem {
  id: number;
  exam_schedule: number;
  student: number;
  student_name: string;
  student_roll_number: string;
  obtained_marks: number;
  is_absent: boolean;
  verified_at: string | null;
}

export interface MarksEntryCreateInput {
  exam_schedule: number;
  student: number;
  theory_marks?: number | null;
  practical_marks?: number | null;
  internal_marks?: number | null;
  obtained_marks: number;
  is_absent?: boolean;
  remarks?: string | null;
}

export interface MarksEntryUpdateInput extends Partial<MarksEntryCreateInput> { }

export interface BulkMarksEntry {
  student: number;
  theory_marks?: number | null;
  practical_marks?: number | null;
  internal_marks?: number | null;
  obtained_marks: number;
  is_absent?: boolean;
  remarks?: string | null;
}

// ============================================================================
// GRADE TYPES
// ============================================================================

export interface Grade extends AuditFields {
  id: number;
  college: number;
  college_name: string;
  name: string;
  code: string;
  min_percentage: number;
  max_percentage: number;
  grade_point: number;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

export interface GradeListItem {
  id: number;
  name: string;
  code: string;
  college: number;
  college_name: string;
  min_percentage: number;
  max_percentage: number;
  grade_point: number;
  is_active: boolean;
}

export interface GradeCreateInput {
  college: number;
  name: string;
  code: string;
  min_percentage: number;
  max_percentage: number;
  grade_point: number;
  description?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface GradeUpdateInput extends Partial<GradeCreateInput> { }

// ============================================================================
// RESULT TYPES
// ============================================================================

export interface Result extends AuditFields {
  id: number;
  exam: number;
  exam_details: ExamListItem;
  student: number;
  student_name: string;
  student_roll_number: string;
  total_marks_obtained: number;
  total_max_marks: number;
  percentage: number;
  grade: number | null;
  grade_details: GradeListItem | null;
  cgpa: number | null;
  sgpa: number | null;
  rank: number | null;
  is_passed: boolean;
  is_published: boolean;
  published_at: string | null;
  remarks: string | null;
}

export interface ResultListItem {
  id: number;
  exam: number;
  exam_name: string;
  student: number;
  student_name: string;
  student_roll_number: string;
  percentage: number;
  grade: number | null;
  grade_code: string | null;
  cgpa: number | null;
  rank: number | null;
  is_passed: boolean;
  is_published: boolean;
}

export interface ResultCreateInput {
  exam: number;
  student: number;
  total_marks_obtained: number;
  total_max_marks: number;
  percentage: number;
  grade?: number | null;
  cgpa?: number | null;
  sgpa?: number | null;
  rank?: number | null;
  is_passed: boolean;
  is_published?: boolean;
  remarks?: string | null;
}

export interface ResultUpdateInput extends Partial<ResultCreateInput> { }

// ============================================================================
// QUESTION TYPES (for Create Test feature)
// ============================================================================

export interface Question {
  id?: number;
  question_text: string;
  question_type: 'mcq' | 'short_answer' | 'long_answer' | 'true_false' | 'fill_blank';
  marks: number;
  options?: string[]; // For MCQs
  correct_answer?: string | number; // For MCQs and True/False
  hint?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  display_order: number;
}

export interface TestPaper extends AuditFields {
  id: number;
  college: number;
  college_name: string;
  subject: number;
  subject_details: SubjectListItem;
  exam_name: string;
  max_marks: number;
  allowed_time: number; // in minutes
  print_count: number;
  instructions: string | null;
  questions: Question[];
  created_by_details: UserBasic | null;
  is_sent_to_store: boolean;
  sent_to_store_at: string | null;
  is_printed: boolean;
  printed_at: string | null;
  is_active: boolean;
}

export interface TestPaperListItem {
  id: number;
  college: number;
  college_name: string;
  subject: number;
  subject_name: string;
  exam_name: string;
  max_marks: number;
  allowed_time: number;
  print_count: number;
  questions_count: number;
  is_sent_to_store: boolean;
  is_printed: boolean;
  created_at: string;
  is_active: boolean;
}

export interface TestPaperCreateInput {
  college: number;
  subject: number;
  exam_name: string;
  max_marks: number;
  allowed_time: number;
  print_count: number;
  instructions?: string | null;
  questions: Question[];
  is_active?: boolean;
}

export interface TestPaperUpdateInput extends Partial<TestPaperCreateInput> { }

export interface SendToStoreInput {
  test_paper_id: number;
  print_count: number;
  delivery_notes?: string | null;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface ExamTypeFilters {
  page?: number;
  page_size?: number;
  college?: number;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

export interface ExamFilters {
  page?: number;
  page_size?: number;
  college?: number;
  exam_type?: number;
  academic_session?: number;
  is_published?: boolean;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

export interface ExamScheduleFilters {
  page?: number;
  page_size?: number;
  exam?: number;
  subject?: number;
  class_obj?: number;
  exam_date?: string;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

export interface MarksEntryFilters {
  page?: number;
  page_size?: number;
  exam_schedule?: number;
  student?: number;
  is_absent?: boolean;
  verified?: boolean;
  search?: string;
  ordering?: string;
}

export interface GradeFilters {
  page?: number;
  page_size?: number;
  college?: number;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

export interface ResultFilters {
  page?: number;
  page_size?: number;
  exam?: number;
  student?: number;
  is_passed?: boolean;
  is_published?: boolean;
  search?: string;
  ordering?: string;
}

export interface TestPaperFilters {
  page?: number;
  page_size?: number;
  college?: number;
  subject?: number;
  is_sent_to_store?: boolean;
  is_printed?: boolean;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

// ============================================================================
// MARKS REGISTERS
// ============================================================================

export interface MarksRegister {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  max_marks: number;
  pass_marks: number;
  exam: number;
  subject: number;
  section: number | null;
  created_by: string;
  updated_by: string;
  class_name: string;
  subject_name: string;
  total_students: number;
  students_appeared: number;
  students_passed: number;
  pass_percentage: number;
  highest_marks: number;
  lowest_marks: number;
  average_marks: number;
  is_verified: boolean;
  verified_by: string | null;
  remarks: string | null;
}

// ============================================================================
// STUDENT MARKS
// ============================================================================

export interface StudentMarks {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  theory_marks: number | null;
  practical_marks: number | null;
  internal_marks: number | null;
  total_marks: number;
  grade: string | null;
  is_absent: boolean;
  register: number;
  student: number;
  created_by: string;
  updated_by: string;
  student_name: string;
  student_roll_number: string;
  remarks: string | null;
}

// ============================================================================
// PROGRESS CARDS
// ============================================================================

export interface ProgressCard extends AuditFields {
  id: number;
  student: number;
  student_name: string;
  exam: number;
  exam_name: string;
  card_file: string;
  issue_date: string;
  is_active: boolean; // Assuming this based on other models, though not explicitly in user JSON but common
}

export interface ProgressCardListItem {
  id: number;
  student: number;
  student_name: string;
  exam: number;
  exam_name: string;
  card_file: string;
  issue_date: string;
}

export interface ProgressCardCreateInput {
  student: number;
  exam: number;
  card_file: string; // Assuming handling string for now (maybe URL or base64, usually file upload is FormData but here user showed JSON string)
  issue_date: string;
}

export interface ProgressCardUpdateInput extends Partial<ProgressCardCreateInput> { }

export interface ProgressCardFilters {
  page?: number;
  page_size?: number;
  student?: number;
  exam?: number;
  search?: string;
  ordering?: string;
}
