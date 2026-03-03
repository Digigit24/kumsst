/**
 * Examination Module Mock Data
 * Complete mock data for all examination entities
 */

import { PaginatedResponse } from '../types/core.types';

// ============================================================================
// MARKS GRADES
// ============================================================================

export interface MarksGrade {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  name: string;
  grade: string;
  min_percentage: number;
  max_percentage: number;
  grade_point: number | null;
  remarks: string | null;
  college: number;
  created_by: string;
  updated_by: string;
}

export const mockMarksGrades: MarksGrade[] = [
  {
    id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Outstanding',
    grade: 'A+',
    min_percentage: 90,
    max_percentage: 100,
    grade_point: 4.0,
    remarks: 'Excellent performance',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 2,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Excellent',
    grade: 'A',
    min_percentage: 80,
    max_percentage: 89.99,
    grade_point: 3.5,
    remarks: 'Very good performance',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 3,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Very Good',
    grade: 'B+',
    min_percentage: 70,
    max_percentage: 79.99,
    grade_point: 3.0,
    remarks: 'Good performance',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// EXAM TYPES
// ============================================================================

export interface ExamType {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  name: string;
  code: string;
  description: string | null;
  college: number;
  created_by: string;
  updated_by: string;
}

export const mockExamTypes: ExamType[] = [
  {
    id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Mid-Term Examination',
    code: 'MID',
    description: 'Mid-semester examination',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 2,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Final Examination',
    code: 'FINAL',
    description: 'End semester examination',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 3,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Practical Examination',
    code: 'PRAC',
    description: 'Practical examination',
    college: 1,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// EXAMS
// ============================================================================

export interface Exam {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  name: string;
  start_date: string;
  end_date: string;
  is_published: boolean;
  college: number;
  exam_type: number;
  class_obj: number;
  academic_session: number;
  created_by: string;
  updated_by: string;
}

export const mockExams: Exam[] = [
  {
    id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Mid-Term Exam 2025',
    start_date: '2025-03-01',
    end_date: '2025-03-15',
    is_published: true,
    college: 1,
    exam_type: 1,
    class_obj: 1,
    academic_session: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 2,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    name: 'Final Exam 2025',
    start_date: '2025-06-01',
    end_date: '2025-06-20',
    is_published: false,
    college: 1,
    exam_type: 2,
    class_obj: 1,
    academic_session: 1,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// EXAM SCHEDULES
// ============================================================================

export interface ExamSchedule {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  date: string;
  start_time: string;
  end_time: string;
  max_marks: number;
  exam: number;
  subject: number;
  classroom: number | null;
  invigilator: number | null;
  created_by: string;
  updated_by: string;
}

export const mockExamSchedules: ExamSchedule[] = [
  {
    id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    date: '2025-03-01',
    start_time: '09:00:00',
    end_time: '12:00:00',
    max_marks: 100,
    exam: 1,
    subject: 1,
    classroom: 1,
    invigilator: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 2,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    date: '2025-03-03',
    start_time: '09:00:00',
    end_time: '12:00:00',
    max_marks: 100,
    exam: 1,
    subject: 2,
    classroom: 1,
    invigilator: 2,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// EXAM ATTENDANCE
// ============================================================================

export interface ExamAttendance {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  status: string;
  remarks: string | null;
  exam_schedule: number;
  student: number;
  created_by: string;
  updated_by: string;
}

export const mockExamAttendance: ExamAttendance[] = [
  {
    id: 1,
    created_at: '2025-03-01T09:00:00Z',
    updated_at: '2025-03-01T09:00:00Z',
    is_active: true,
    status: 'present',
    remarks: null,
    exam_schedule: 1,
    student: 1,
    created_by: '1',
    updated_by: '1',
  },
  {
    id: 2,
    created_at: '2025-03-01T09:00:00Z',
    updated_at: '2025-03-01T09:00:00Z',
    is_active: true,
    status: 'absent',
    remarks: 'Medical leave',
    exam_schedule: 1,
    student: 2,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// ADMIT CARDS
// ============================================================================

export interface AdmitCard {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  card_number: string;
  issue_date: string;
  card_file: string | null;
  student: number;
  exam: number;
  created_by: string;
  updated_by: string;
}

export const mockAdmitCards: AdmitCard[] = [
  {
    id: 1,
    created_at: '2025-02-15T00:00:00Z',
    updated_at: '2025-02-15T00:00:00Z',
    is_active: true,
    card_number: 'AC2025001',
    issue_date: '2025-02-15',
    card_file: '/admit_cards/AC2025001.pdf',
    student: 1,
    exam: 1,
    created_by: '1',
    updated_by: '1',
  },
];

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
  // Display fields
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

export const mockMarksRegisters: MarksRegister[] = [
  {
    id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_active: true,
    max_marks: 100,
    pass_marks: 40,
    exam: 1,
    subject: 1,
    section: 1,
    created_by: '1',
    updated_by: '1',
    class_name: 'Class 10 - A',
    subject_name: 'Mathematics',
    total_students: 45,
    students_appeared: 43,
    students_passed: 38,
    pass_percentage: 88.37,
    highest_marks: 98,
    lowest_marks: 28,
    average_marks: 72.5,
    is_verified: true,
    verified_by: 'Prof. John Doe',
    remarks: 'Excellent performance overall',
  },
  {
    id: 2,
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
    is_active: true,
    max_marks: 100,
    pass_marks: 40,
    exam: 1,
    subject: 2,
    section: 1,
    created_by: '1',
    updated_by: '1',
    class_name: 'Class 10 - A',
    subject_name: 'Physics',
    total_students: 45,
    students_appeared: 44,
    students_passed: 35,
    pass_percentage: 79.55,
    highest_marks: 95,
    lowest_marks: 22,
    average_marks: 65.8,
    is_verified: true,
    verified_by: 'Dr. Jane Smith',
    remarks: null,
  },
  {
    id: 3,
    created_at: '2025-01-03T00:00:00Z',
    updated_at: '2025-01-03T00:00:00Z',
    is_active: true,
    max_marks: 100,
    pass_marks: 40,
    exam: 1,
    subject: 3,
    section: 2,
    created_by: '1',
    updated_by: '1',
    class_name: 'Class 10 - B',
    subject_name: 'Chemistry',
    total_students: 42,
    students_appeared: 40,
    students_passed: 32,
    pass_percentage: 80.0,
    highest_marks: 92,
    lowest_marks: 30,
    average_marks: 68.3,
    is_verified: false,
    verified_by: null,
    remarks: 'Pending verification',
  },
];

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
  // Display fields
  student_name: string;
  student_roll_number: string;
  remarks: string | null;
}

export const mockStudentMarks: StudentMarks[] = [
  {
    id: 1,
    created_at: '2025-03-15T00:00:00Z',
    updated_at: '2025-03-15T00:00:00Z',
    is_active: true,
    theory_marks: 70,
    practical_marks: 20,
    internal_marks: 10,
    total_marks: 100,
    grade: 'A',
    is_absent: false,
    register: 1,
    student: 1,
    created_by: '1',
    updated_by: '1',
    student_name: 'John Smith',
    student_roll_number: '2024001',
    remarks: null,
  },
  {
    id: 2,
    created_at: '2025-03-15T00:00:00Z',
    updated_at: '2025-03-15T00:00:00Z',
    is_active: true,
    theory_marks: 65,
    practical_marks: 18,
    internal_marks: 9,
    total_marks: 92,
    grade: 'A',
    is_absent: false,
    register: 1,
    student: 2,
    created_by: '1',
    updated_by: '1',
    student_name: 'Emma Johnson',
    student_roll_number: '2024002',
    remarks: 'Excellent performance',
  },
  {
    id: 3,
    created_at: '2025-03-15T00:00:00Z',
    updated_at: '2025-03-15T00:00:00Z',
    is_active: true,
    theory_marks: 45,
    practical_marks: 15,
    internal_marks: 8,
    total_marks: 68,
    grade: 'B',
    is_absent: false,
    register: 1,
    student: 3,
    created_by: '1',
    updated_by: '1',
    student_name: 'Michael Brown',
    student_roll_number: '2024003',
    remarks: null,
  },
  {
    id: 4,
    created_at: '2025-03-15T00:00:00Z',
    updated_at: '2025-03-15T00:00:00Z',
    is_active: true,
    theory_marks: null,
    practical_marks: null,
    internal_marks: null,
    total_marks: 0,
    grade: null,
    is_absent: true,
    register: 1,
    student: 4,
    created_by: '1',
    updated_by: '1',
    student_name: 'Sarah Davis',
    student_roll_number: '2024004',
    remarks: 'Medical leave',
  },
];

// ============================================================================
// EXAM RESULTS
// ============================================================================

export interface ExamResult {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  total_marks: number;
  marks_obtained: number;
  percentage: number;
  grade: string | null;
  result_status: string;
  rank: number | null;
  remarks: string | null;
  student: number;
  exam: number;
  created_by: string;
  updated_by: string;
}

export const mockExamResults: ExamResult[] = [
  {
    id: 1,
    created_at: '2025-03-20T00:00:00Z',
    updated_at: '2025-03-20T00:00:00Z',
    is_active: true,
    total_marks: 500,
    marks_obtained: 425,
    percentage: 85.0,
    grade: 'A',
    result_status: 'passed',
    rank: 5,
    remarks: 'Excellent performance',
    student: 1,
    exam: 1,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// PROGRESS CARDS
// ============================================================================

export interface ProgressCard {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  card_file: string | null;
  issue_date: string;
  student: number;
  exam: number;
  created_by: string;
  updated_by: string;
}

export const mockProgressCards: ProgressCard[] = [
  {
    id: 1,
    created_at: '2025-03-25T00:00:00Z',
    updated_at: '2025-03-25T00:00:00Z',
    is_active: true,
    card_file: '/progress_cards/PC2025001.pdf',
    issue_date: '2025-03-25',
    student: 1,
    exam: 1,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// MARK SHEETS
// ============================================================================

export interface MarkSheet {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  sheet_number: string;
  sheet_file: string | null;
  issue_date: string;
  student: number;
  exam: number;
  created_by: string;
  updated_by: string;
}

export const mockMarkSheets: MarkSheet[] = [
  {
    id: 1,
    created_at: '2025-03-25T00:00:00Z',
    updated_at: '2025-03-25T00:00:00Z',
    is_active: true,
    sheet_number: 'MS2025001',
    sheet_file: '/mark_sheets/MS2025001.pdf',
    issue_date: '2025-03-25',
    student: 1,
    exam: 1,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// TABULATION SHEETS
// ============================================================================

export interface TabulationSheet {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  sheet_file: string | null;
  issue_date: string;
  exam: number;
  class_obj: number;
  section: number | null;
  created_by: string;
  updated_by: string;
}

export const mockTabulationSheets: TabulationSheet[] = [
  {
    id: 1,
    created_at: '2025-03-25T00:00:00Z',
    updated_at: '2025-03-25T00:00:00Z',
    is_active: true,
    sheet_file: '/tabulation_sheets/TS2025001.pdf',
    issue_date: '2025-03-25',
    exam: 1,
    class_obj: 1,
    section: 1,
    created_by: '1',
    updated_by: '1',
  },
];

// ============================================================================
// PAGINATED RESPONSES
// ============================================================================

export const mockExamTypesPaginated: PaginatedResponse<ExamType> = {
  count: mockExamTypes.length,
  next: null,
  previous: null,
  results: mockExamTypes,
};

export const mockExamsPaginated: PaginatedResponse<Exam> = {
  count: mockExams.length,
  next: null,
  previous: null,
  results: mockExams,
};

export const mockExamSchedulesPaginated: PaginatedResponse<ExamSchedule> = {
  count: mockExamSchedules.length,
  next: null,
  previous: null,
  results: mockExamSchedules,
};

export const mockMarksRegistersPaginated: PaginatedResponse<MarksRegister> = {
  count: mockMarksRegisters.length,
  next: null,
  previous: null,
  results: mockMarksRegisters,
};

export const mockStudentMarksPaginated: PaginatedResponse<StudentMarks> = {
  count: mockStudentMarks.length,
  next: null,
  previous: null,
  results: mockStudentMarks,
};
