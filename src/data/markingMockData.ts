/**
 * Marking Module Mock Data
 * Complete mock data for exam marking and marksheet generation
 */

import { PaginatedResponse } from '../types/core.types';

// ============================================================================
// QUESTION PAPER
// ============================================================================

export interface Question {
  id: number;
  question_number: number;
  question_text: string;
  question_type: 'objective' | 'short_answer' | 'long_answer' | 'numerical';
  max_marks: number;
  section: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  model_answer?: string;
  marking_scheme: MarkingSchemeItem[];
}

export interface MarkingSchemeItem {
  criteria: string;
  marks: number;
}

export interface QuestionPaper {
  id: number;
  exam_id: number;
  exam_name: string;
  subject_id: number;
  subject_name: string;
  class_name: string;
  date: string;
  duration: number; // in minutes
  max_marks: number;
  questions: Question[];
  instructions: string[];
  created_at: string;
  is_active: boolean;
}

export const mockQuestionPapers: QuestionPaper[] = [
  {
    id: 1,
    exam_id: 1,
    exam_name: 'Mid-Term Examination 2025',
    subject_id: 1,
    subject_name: 'Mathematics',
    class_name: 'Class 10 - A',
    date: '2025-03-15',
    duration: 180,
    max_marks: 100,
    instructions: [
      'All questions are compulsory.',
      'Section A contains 20 objective type questions carrying 1 mark each.',
      'Section B contains 6 short answer questions carrying 3 marks each.',
      'Section C contains 8 long answer questions carrying 5 marks each.',
      'Use of calculator is not permitted.',
    ],
    questions: [
      {
        id: 1,
        question_number: 1,
        question_text: 'What is the value of √144?',
        question_type: 'objective',
        max_marks: 1,
        section: 'A',
        topic: 'Square Roots',
        difficulty: 'easy',
        model_answer: '12',
        marking_scheme: [
          { criteria: 'Correct answer', marks: 1 },
        ],
      },
      {
        id: 2,
        question_number: 2,
        question_text: 'Solve the quadratic equation: x² - 5x + 6 = 0',
        question_type: 'short_answer',
        max_marks: 3,
        section: 'B',
        topic: 'Quadratic Equations',
        difficulty: 'medium',
        model_answer: 'x = 2 or x = 3',
        marking_scheme: [
          { criteria: 'Correct factorization', marks: 1 },
          { criteria: 'Finding both roots', marks: 1.5 },
          { criteria: 'Verification', marks: 0.5 },
        ],
      },
      {
        id: 3,
        question_number: 3,
        question_text: 'Prove that the sum of angles in a triangle is 180°. Also, find the angles of a triangle if they are in the ratio 2:3:4.',
        question_type: 'long_answer',
        max_marks: 5,
        section: 'C',
        topic: 'Triangles',
        difficulty: 'hard',
        model_answer: 'Proof using parallel line theorem; Angles are 40°, 60°, 80°',
        marking_scheme: [
          { criteria: 'Correct diagram', marks: 0.5 },
          { criteria: 'Proof with proper reasoning', marks: 2 },
          { criteria: 'Setting up ratio equation', marks: 1 },
          { criteria: 'Solving for angles', marks: 1 },
          { criteria: 'Verification', marks: 0.5 },
        ],
      },
    ],
    created_at: '2025-02-01T00:00:00Z',
    is_active: true,
  },
  {
    id: 2,
    exam_id: 1,
    exam_name: 'Mid-Term Examination 2025',
    subject_id: 2,
    subject_name: 'Physics',
    class_name: 'Class 10 - A',
    date: '2025-03-17',
    duration: 180,
    max_marks: 100,
    instructions: [
      'All questions are compulsory.',
      'Draw neat diagrams wherever necessary.',
      'Use SI units for all calculations.',
      'Show all working clearly.',
    ],
    questions: [
      {
        id: 4,
        question_number: 1,
        question_text: 'State Newton\'s First Law of Motion.',
        question_type: 'short_answer',
        max_marks: 2,
        section: 'A',
        topic: 'Laws of Motion',
        difficulty: 'easy',
        model_answer: 'A body continues in its state of rest or uniform motion in a straight line unless acted upon by an external force.',
        marking_scheme: [
          { criteria: 'Complete statement', marks: 2 },
        ],
      },
      {
        id: 5,
        question_number: 2,
        question_text: 'A car accelerates from rest to 20 m/s in 5 seconds. Calculate: (a) acceleration (b) distance covered',
        question_type: 'numerical',
        max_marks: 4,
        section: 'B',
        topic: 'Motion',
        difficulty: 'medium',
        model_answer: '(a) 4 m/s² (b) 50 m',
        marking_scheme: [
          { criteria: 'Formula for acceleration', marks: 0.5 },
          { criteria: 'Correct calculation of acceleration', marks: 1.5 },
          { criteria: 'Formula for distance', marks: 0.5 },
          { criteria: 'Correct calculation of distance', marks: 1.5 },
        ],
      },
    ],
    created_at: '2025-02-01T00:00:00Z',
    is_active: true,
  },
  {
    id: 3,
    exam_id: 1,
    exam_name: 'Mid-Term Examination 2025',
    subject_id: 3,
    subject_name: 'Chemistry',
    class_name: 'Class 10 - A',
    date: '2025-03-19',
    duration: 180,
    max_marks: 100,
    instructions: [
      'All questions are compulsory.',
      'Write balanced chemical equations.',
      'Use standard symbols for elements.',
    ],
    questions: [
      {
        id: 6,
        question_number: 1,
        question_text: 'What is the atomic number of Carbon?',
        question_type: 'objective',
        max_marks: 1,
        section: 'A',
        topic: 'Periodic Table',
        difficulty: 'easy',
        model_answer: '6',
        marking_scheme: [
          { criteria: 'Correct answer', marks: 1 },
        ],
      },
    ],
    created_at: '2025-02-01T00:00:00Z',
    is_active: true,
  },
];

// ============================================================================
// STUDENT ANSWER SHEETS
// ============================================================================

export interface StudentAnswer {
  question_id: number;
  question_number: number;
  answer_text: string;
  marks_obtained: number | null;
  max_marks: number;
  remarks: string;
  is_marked: boolean;
}

export interface StudentAnswerSheet {
  id: number;
  student_id: number;
  student_name: string;
  student_roll_number: string;
  question_paper_id: number;
  exam_name: string;
  subject_name: string;
  answers: StudentAnswer[];
  total_marks_obtained: number | null;
  total_max_marks: number;
  percentage: number | null;
  grade: string | null;
  is_absent: boolean;
  is_fully_marked: boolean;
  marked_by: string | null;
  marked_at: string | null;
}

export const mockStudentAnswerSheets: StudentAnswerSheet[] = [
  {
    id: 1,
    student_id: 1,
    student_name: 'John Smith',
    student_roll_number: '2024001',
    question_paper_id: 1,
    exam_name: 'Mid-Term Examination 2025',
    subject_name: 'Mathematics',
    answers: [
      {
        question_id: 1,
        question_number: 1,
        answer_text: '12',
        marks_obtained: 1,
        max_marks: 1,
        remarks: 'Correct',
        is_marked: true,
      },
      {
        question_id: 2,
        question_number: 2,
        answer_text: 'x² - 5x + 6 = 0, (x-2)(x-3) = 0, x = 2 or x = 3',
        marks_obtained: 3,
        max_marks: 3,
        remarks: 'Perfect answer with verification',
        is_marked: true,
      },
      {
        question_id: 3,
        question_number: 3,
        answer_text: 'Sum of angles proof shown with diagram. Ratio 2:3:4, angles are 40°, 60°, 80°',
        marks_obtained: 4.5,
        max_marks: 5,
        remarks: 'Good proof, minor error in diagram',
        is_marked: true,
      },
    ],
    total_marks_obtained: 92,
    total_max_marks: 100,
    percentage: 92.0,
    grade: 'A+',
    is_absent: false,
    is_fully_marked: true,
    marked_by: 'Prof. John Doe',
    marked_at: '2025-03-20T10:30:00Z',
  },
  {
    id: 2,
    student_id: 2,
    student_name: 'Emma Johnson',
    student_roll_number: '2024002',
    question_paper_id: 1,
    exam_name: 'Mid-Term Examination 2025',
    subject_name: 'Mathematics',
    answers: [
      {
        question_id: 1,
        question_number: 1,
        answer_text: '12',
        marks_obtained: null,
        max_marks: 1,
        remarks: '',
        is_marked: false,
      },
      {
        question_id: 2,
        question_number: 2,
        answer_text: 'x² - 5x + 6 = 0, x = 2',
        marks_obtained: null,
        max_marks: 3,
        remarks: '',
        is_marked: false,
      },
      {
        question_id: 3,
        question_number: 3,
        answer_text: 'Incomplete answer',
        marks_obtained: null,
        max_marks: 5,
        remarks: '',
        is_marked: false,
      },
    ],
    total_marks_obtained: null,
    total_max_marks: 100,
    percentage: null,
    grade: null,
    is_absent: false,
    is_fully_marked: false,
    marked_by: null,
    marked_at: null,
  },
  {
    id: 3,
    student_id: 3,
    student_name: 'Michael Brown',
    student_roll_number: '2024003',
    question_paper_id: 1,
    exam_name: 'Mid-Term Examination 2025',
    subject_name: 'Mathematics',
    answers: [],
    total_marks_obtained: 0,
    total_max_marks: 100,
    percentage: 0,
    grade: 'F',
    is_absent: true,
    is_fully_marked: true,
    marked_by: 'Prof. John Doe',
    marked_at: '2025-03-20T10:35:00Z',
  },
  {
    id: 4,
    student_id: 1,
    student_name: 'John Smith',
    student_roll_number: '2024001',
    question_paper_id: 2,
    exam_name: 'Mid-Term Examination 2025',
    subject_name: 'Physics',
    answers: [
      {
        question_id: 4,
        question_number: 1,
        answer_text: 'A body continues in its state of rest or uniform motion unless acted upon by external force.',
        marks_obtained: 2,
        max_marks: 2,
        remarks: 'Perfect',
        is_marked: true,
      },
      {
        question_id: 5,
        question_number: 2,
        answer_text: 'a = v/t = 20/5 = 4 m/s², s = ut + 1/2at² = 0 + 1/2(4)(25) = 50m',
        marks_obtained: 4,
        max_marks: 4,
        remarks: 'Excellent work',
        is_marked: true,
      },
    ],
    total_marks_obtained: 95,
    total_max_marks: 100,
    percentage: 95.0,
    grade: 'A+',
    is_absent: false,
    is_fully_marked: true,
    marked_by: 'Dr. Jane Smith',
    marked_at: '2025-03-21T11:00:00Z',
  },
];

// ============================================================================
// MARKSHEET
// ============================================================================

export interface SubjectMarks {
  subject_id: number;
  subject_name: string;
  theory_marks: number;
  practical_marks: number;
  internal_marks: number;
  total_marks: number;
  max_marks: number;
  percentage: number;
  grade: string;
}

export interface Marksheet {
  id: number;
  student_id: number;
  student_name: string;
  student_roll_number: string;
  father_name: string;
  mother_name: string;
  class_name: string;
  section: string;
  exam_id: number;
  exam_name: string;
  academic_session: string;
  subjects: SubjectMarks[];
  total_marks_obtained: number;
  total_max_marks: number;
  overall_percentage: number;
  overall_grade: string;
  result: 'PASS' | 'FAIL' | 'WITHHELD';
  rank: number | null;
  attendance_percentage: number;
  remarks: string;
  issued_date: string;
  is_published: boolean;
}

export const mockMarksheets: Marksheet[] = [
  {
    id: 1,
    student_id: 1,
    student_name: 'John Smith',
    student_roll_number: '2024001',
    father_name: 'Robert Smith',
    mother_name: 'Mary Smith',
    class_name: 'Class 10',
    section: 'A',
    exam_id: 1,
    exam_name: 'Mid-Term Examination 2025',
    academic_session: '2024-2025',
    subjects: [
      {
        subject_id: 1,
        subject_name: 'Mathematics',
        theory_marks: 70,
        practical_marks: 20,
        internal_marks: 10,
        total_marks: 100,
        max_marks: 100,
        percentage: 100.0,
        grade: 'A+',
      },
      {
        subject_id: 2,
        subject_name: 'Physics',
        theory_marks: 72,
        practical_marks: 18,
        internal_marks: 9,
        total_marks: 99,
        max_marks: 100,
        percentage: 99.0,
        grade: 'A+',
      },
      {
        subject_id: 3,
        subject_name: 'Chemistry',
        theory_marks: 68,
        practical_marks: 19,
        internal_marks: 10,
        total_marks: 97,
        max_marks: 100,
        percentage: 97.0,
        grade: 'A+',
      },
      {
        subject_id: 4,
        subject_name: 'English',
        theory_marks: 75,
        practical_marks: 0,
        internal_marks: 10,
        total_marks: 85,
        max_marks: 100,
        percentage: 85.0,
        grade: 'A',
      },
      {
        subject_id: 5,
        subject_name: 'Hindi',
        theory_marks: 70,
        practical_marks: 0,
        internal_marks: 10,
        total_marks: 80,
        max_marks: 100,
        percentage: 80.0,
        grade: 'A',
      },
    ],
    total_marks_obtained: 461,
    total_max_marks: 500,
    overall_percentage: 92.2,
    overall_grade: 'A+',
    result: 'PASS',
    rank: 1,
    attendance_percentage: 95.5,
    remarks: 'Outstanding performance. Keep up the excellent work!',
    issued_date: '2025-04-01',
    is_published: true,
  },
  {
    id: 2,
    student_id: 2,
    student_name: 'Emma Johnson',
    student_roll_number: '2024002',
    father_name: 'James Johnson',
    mother_name: 'Linda Johnson',
    class_name: 'Class 10',
    section: 'A',
    exam_id: 1,
    exam_name: 'Mid-Term Examination 2025',
    academic_session: '2024-2025',
    subjects: [
      {
        subject_id: 1,
        subject_name: 'Mathematics',
        theory_marks: 65,
        practical_marks: 18,
        internal_marks: 9,
        total_marks: 92,
        max_marks: 100,
        percentage: 92.0,
        grade: 'A+',
      },
      {
        subject_id: 2,
        subject_name: 'Physics',
        theory_marks: 63,
        practical_marks: 17,
        internal_marks: 8,
        total_marks: 88,
        max_marks: 100,
        percentage: 88.0,
        grade: 'A',
      },
      {
        subject_id: 3,
        subject_name: 'Chemistry',
        theory_marks: 60,
        practical_marks: 18,
        internal_marks: 9,
        total_marks: 87,
        max_marks: 100,
        percentage: 87.0,
        grade: 'A',
      },
      {
        subject_id: 4,
        subject_name: 'English',
        theory_marks: 72,
        practical_marks: 0,
        internal_marks: 10,
        total_marks: 82,
        max_marks: 100,
        percentage: 82.0,
        grade: 'A',
      },
      {
        subject_id: 5,
        subject_name: 'Hindi',
        theory_marks: 68,
        practical_marks: 0,
        internal_marks: 9,
        total_marks: 77,
        max_marks: 100,
        percentage: 77.0,
        grade: 'B+',
      },
    ],
    total_marks_obtained: 426,
    total_max_marks: 500,
    overall_percentage: 85.2,
    overall_grade: 'A',
    result: 'PASS',
    rank: 3,
    attendance_percentage: 92.0,
    remarks: 'Very good performance. Consistent improvement observed.',
    issued_date: '2025-04-01',
    is_published: true,
  },
];

// ============================================================================
// MARKING STATISTICS
// ============================================================================

export interface MarkingStatistics {
  question_paper_id: number;
  exam_name: string;
  subject_name: string;
  total_students: number;
  marked_students: number;
  unmarked_students: number;
  absent_students: number;
  marking_progress: number; // percentage
  average_marks: number | null;
  highest_marks: number | null;
  lowest_marks: number | null;
  pass_percentage: number | null;
}

export const mockMarkingStatistics: MarkingStatistics[] = [
  {
    question_paper_id: 1,
    exam_name: 'Mid-Term Examination 2025',
    subject_name: 'Mathematics',
    total_students: 45,
    marked_students: 43,
    unmarked_students: 1,
    absent_students: 1,
    marking_progress: 95.6,
    average_marks: 72.5,
    highest_marks: 98,
    lowest_marks: 42,
    pass_percentage: 88.4,
  },
  {
    question_paper_id: 2,
    exam_name: 'Mid-Term Examination 2025',
    subject_name: 'Physics',
    total_students: 45,
    marked_students: 40,
    unmarked_students: 4,
    absent_students: 1,
    marking_progress: 88.9,
    average_marks: 68.3,
    highest_marks: 95,
    lowest_marks: 38,
    pass_percentage: 82.2,
  },
  {
    question_paper_id: 3,
    exam_name: 'Mid-Term Examination 2025',
    subject_name: 'Chemistry',
    total_students: 45,
    marked_students: 5,
    unmarked_students: 39,
    absent_students: 1,
    marking_progress: 11.1,
    average_marks: null,
    highest_marks: null,
    lowest_marks: null,
    pass_percentage: null,
  },
];

// ============================================================================
// PAGINATED RESPONSES
// ============================================================================

export const mockQuestionPapersPaginated: PaginatedResponse<QuestionPaper> = {
  count: mockQuestionPapers.length,
  next: null,
  previous: null,
  results: mockQuestionPapers,
};

export const mockStudentAnswerSheetsPaginated: PaginatedResponse<StudentAnswerSheet> = {
  count: mockStudentAnswerSheets.length,
  next: null,
  previous: null,
  results: mockStudentAnswerSheets,
};

export const mockMarksheetsPaginated: PaginatedResponse<Marksheet> = {
  count: mockMarksheets.length,
  next: null,
  previous: null,
  results: mockMarksheets,
};
