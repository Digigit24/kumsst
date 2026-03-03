/**
 * Assignments Module Types
 */

export interface Assignment {
  id: number;
  title: string;
  description: string;
  subject: number;
  subject_name?: string;
  class_obj: number;
  class_name?: string;
  section?: number | null;
  section_name?: string;
  teacher: number;
  teacher_name?: string;
  due_date: string; // ISO date string
  assigned_date?: string;
  max_marks: number;
  assignment_file?: string; // File URL
  attachments?: string[] | null;
  allow_late_submission?: boolean;
  late_submission_penalty?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  status?: 'draft' | 'active' | 'completed';
  total_students?: number;
  submission_count?: number;
}

export interface AssignmentCreateInput {
  title: string;
  description: string;
  subject: number;
  class_obj: number;
  section?: number | null;
  due_date: string;
  max_marks: number;
  assignment_file?: File | null;
  allow_late_submission?: boolean;
  late_submission_penalty?: number;
  is_active?: boolean;
}

export interface AssignmentUpdateInput extends Partial<AssignmentCreateInput> { }

export interface AssignmentSubmission {
  id: number;
  assignment: number;
  assignment_title?: string;
  student: number;
  student_name?: string;
  student_roll_number?: string;
  submitted_date: string;
  submission_file?: string;
  submission_text?: string;
  marks_obtained?: number | null;
  feedback?: string;
  is_late: boolean;
  status: 'submitted' | 'graded' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmissionCreateInput {
  assignment: number;
  submission_file?: File | null;
  submission_text?: string;
}
export interface AssignmentSubmissionGradeInput {
  marks_obtained: number;
  feedback?: string;
}

export interface AssignmentListParams {
  page?: number;
  page_size?: number;
  search?: string;
  subject?: number;
  class_obj?: number;
  section?: number;
  teacher?: number;
  status?: 'draft' | 'active' | 'completed';
  is_active?: boolean;
  ordering?: string;
}

export interface AssignmentSubmissionListParams {
  page?: number;
  page_size?: number;
  assignment?: number;
  student?: number;
  status?: 'submitted' | 'graded' | 'pending';
  is_late?: boolean;
}

export interface PaginatedAssignments {
  count: number;
  next: string | null;
  previous: string | null;
  results: Assignment[];
}

export interface PaginatedSubmissions {
  count: number;
  next: string | null;
  previous: string | null;
  results: AssignmentSubmission[];
}
