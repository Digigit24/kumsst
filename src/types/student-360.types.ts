export interface Student360Filters {
  from_date?: string;
  to_date?: string;
}

// Basic Info
export interface BasicInfo {
  student_id: number;
  admission_number: string;
  registration_number: string;
  roll_number: string;
  full_name: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  phone: string;
  alternate_phone: string | null;
  date_of_birth: string;
  gender: string;
  blood_group: string | null;
  nationality: string;
  religion: string | null;
  caste: string | null;
  mother_tongue: string | null;
  aadhar_number: string | null;
  photo_url: string | null;
  college_name: string;
  program_name: string;
  program_code: string;
  current_class: string;
  current_section: string;
  academic_year: string;
  category: string;
  group: string;
  admission_date: string;
  admission_type: string;
  is_active: boolean;
  is_alumni: boolean;
}

// Academic
export interface AcademicInfo {
  total_exams: number;
  overall_percentage: number;
  pass_count: number;
  fail_count: number;
  latest_grade: string | null;
  latest_rank: number | null;
  pass_rate: number;
  exam_results: ExamResult[];
  subject_marks: SubjectMark[];
}

export interface ExamResult {
  exam_id: number;
  exam_name: string;
  exam_date: string;
  total_marks: number;
  marks_obtained: number;
  percentage: number;
  grade: string;
  rank: number | null;
  status: string;
}

export interface SubjectMark {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  total_marks: number;
  marks_obtained: number;
  percentage: number;
  grade: string;
}

// Attendance
export interface AttendanceInfo {
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  half_days: number;
  attendance_rate: number;
  is_low_attendance: boolean;
  subject_breakdown: SubjectAttendance[];
  monthly_trend: MonthlyTrend[];
  from_date: string;
  to_date: string;
}

export interface SubjectAttendance {
  subject_id: number;
  subject_name: string;
  total_classes: number;
  attended_classes: number;
  attendance_rate: number;
}

export interface MonthlyTrend {
  month: string;
  attendance_rate: number;
}

// Financial
export interface FinancialInfo {
  total_due: number;
  total_paid: number;
  total_balance: number;
  payment_status: string;
  overdue_fees_count: number;
  total_fines: number;
  pending_fines: number;
  total_discounts: number;
  fee_structures: FeeStructure[];
  payment_history: PaymentHistory[];
  fines: Fine[];
  discounts: Discount[];
}

export interface FeeStructure {
  id: number;
  fee_type: string;
  amount: number;
  due_date: string;
  status: string;
}

export interface PaymentHistory {
  id: number;
  payment_date: string;
  amount: number;
  payment_mode: string;
  receipt_number: string;
}

export interface Fine {
  id: number;
  fine_type: string;
  amount: number;
  reason: string;
  date: string;
  is_paid: boolean;
}

export interface Discount {
  id: number;
  discount_type: string;
  amount: number;
  reason: string;
}

// Library
export interface LibraryInfo {
  is_member: boolean;
  member_id: string | null;
  books_issued: number;
  books_returned: number;
  current_issues: BookIssue[];
  overdue_books: number;
  total_fines: number;
  pending_fines: number;
}

export interface BookIssue {
  book_id: number;
  book_title: string;
  author: string;
  issue_date: string;
  due_date: string;
  is_overdue: boolean;
  fine_amount: number;
}

// Hostel
export interface HostelInfo {
  is_hosteller: boolean;
  allocation: HostelAllocation | null;
  fees: HostelFee[];
  total_fee_due: number;
  total_fee_paid: number;
  pending_fee: number;
}

export interface HostelAllocation {
  hostel_name: string;
  room_number: string;
  bed_number: string;
  floor: string;
  warden_name: string;
  check_in_date: string;
}

export interface HostelFee {
  id: number;
  fee_type: string;
  amount: number;
  due_date: string;
  status: string;
}

// Documents
export interface DocumentsInfo {
  total_documents: number;
  verified_documents: number;
  pending_verification: number;
  documents: Document[];
}

export interface Document {
  id: number;
  document_type: string;
  document_name: string;
  upload_date: string;
  verification_status: string;
  verified_by: string | null;
  verified_date: string | null;
}

// Guardian
export interface Guardian {
  id: number;
  name: string;
  relation: string;
  phone: string;
  email: string | null;
  occupation: string | null;
  annual_income: number | null;
}

// Address
export interface Address {
  id: number;
  address_type: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

// Medical
export interface MedicalInfo {
  has_record: boolean;
  blood_group: string | null;
  height: number | null;
  weight: number | null;
  allergies: string | null;
  medical_conditions: string | null;
  medications: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  health_insurance_provider: string | null;
  health_insurance_number: string | null;
  last_checkup_date: string | null;
}

// Previous Academics
export interface PreviousAcademic {
  id: number;
  institution_name: string;
  board: string;
  year_of_passing: number;
  percentage: number;
  grade: string;
}

// Promotion
export interface Promotion {
  id: number;
  from_class: string;
  to_class: string;
  academic_year: string;
  promotion_date: string;
  status: string;
}

// Certificate
export interface Certificate {
  id: number;
  certificate_type: string;
  certificate_number: string;
  issue_date: string;
  issued_by: string;
}

// ID Card
export interface IDCard {
  id: number;
  card_number: string;
  issue_date: string;
  expiry_date: string;
  status: string;
}

// Complete 360° Profile
export interface Student360Profile {
  basic_info: BasicInfo;
  academic: AcademicInfo;
  attendance: AttendanceInfo;
  financial: FinancialInfo;
  library: LibraryInfo;
  hostel: HostelInfo;
  documents: DocumentsInfo;
  guardians: Guardian[];
  addresses: Address[];
  medical: MedicalInfo;
  previous_academics: PreviousAcademic[];
  promotions: Promotion[];
  certificates: Certificate[];
  id_cards: IDCard[];
  generated_at: string;
}

// Quick Summary (lighter version)
export interface Student360Summary {
  student_id: number;
  student_name: string;
  roll_number: string;
  class_name: string;
  section_name: string;
  
  // Quick Stats
  overall_attendance_percentage: number;
  overall_academic_percentage: number;
  overall_grade: string;
  fee_status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  pending_fee_amount: number;
  library_overdue_books: number;
  library_pending_fines: number;
  
  // Alerts
  low_attendance_alert: boolean;
  fee_overdue_alert: boolean;
  library_overdue_alert: boolean;
  disciplinary_alert: boolean;
  
  generated_at: string;
}


// Academic Performance
export interface AcademicPerformance {
  overall_percentage: number;
  overall_grade: string;
  rank_in_class: number;
  total_students_in_class: number;
  subject_wise_performance: {
    subject_id: number;
    subject_name: string;
    marks_obtained: number;
    total_marks: number;
    percentage: number;
    grade: string;
  }[];
  recent_exams: {
    exam_id: number;
    exam_name: string;
    exam_date: string;
    total_marks: number;
    marks_obtained: number;
    percentage: number;
    grade: string;
  }[];
}

// Attendance Summary
export interface AttendanceSummary {
  overall_attendance_percentage: number;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  leave_days: number;
  subject_wise_attendance: {
    subject_id: number;
    subject_name: string;
    total_classes: number;
    attended_classes: number;
    attendance_percentage: number;
  }[];
  monthly_trend: {
    month: string;
    attendance_percentage: number;
  }[];
  recent_absences: {
    date: string;
    reason?: string;
  }[];
}

// Fee Summary
export interface FeeSummary {
  total_fee: number;
  paid_amount: number;
  pending_amount: number;
  discount_amount: number;
  fine_amount: number;
  payment_status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  installments: {
    installment_id: number;
    installment_name: string;
    amount: number;
    due_date: string;
    paid_amount: number;
    status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  }[];
  recent_payments: {
    payment_id: number;
    payment_date: string;
    amount: number;
    payment_mode: string;
    receipt_number: string;
  }[];
}

// Library Summary
export interface LibrarySummary {
  total_books_issued: number;
  currently_issued: number;
  books_returned: number;
  overdue_books: number;
  total_fines: number;
  paid_fines: number;
  pending_fines: number;
  current_books: {
    book_id: number;
    book_title: string;
    author: string;
    issue_date: string;
    due_date: string;
    is_overdue: boolean;
    fine_amount: number;
  }[];
  reading_history: {
    book_title: string;
    issue_date: string;
    return_date: string;
  }[];
}

// Hostel Summary
export interface HostelSummary {
  is_hosteler: boolean;
  hostel_name?: string;
  room_number?: string;
  bed_number?: string;
  warden_name?: string;
  hostel_fee_status?: 'Paid' | 'Pending' | 'Overdue';
  check_in_date?: string;
  check_out_date?: string;
}

// Documents Summary
export interface DocumentsSummary {
  total_documents: number;
  verified_documents: number;
  pending_documents: number;
  documents: {
    document_id: number;
    document_type: string;
    document_name: string;
    upload_date: string;
    verification_status: 'Verified' | 'Pending' | 'Rejected';
    verified_by?: string;
    verified_date?: string;
  }[];
}

// Disciplinary Records
export interface DisciplinaryRecord {
  total_incidents: number;
  warnings: number;
  suspensions: number;
  records: {
    incident_id: number;
    incident_type: string;
    incident_date: string;
    description: string;
    action_taken: string;
    severity: 'Low' | 'Medium' | 'High';
  }[];
}

// Complete 360° Profile
export interface Student360Profile {
  student_id: number;
  student_name: string;
  roll_number: string;
  email: string;
  phone: string;
  class_name: string;
  section_name: string;
  program_name: string;
  admission_date: string;
  date_of_birth: string;
  gender: string;
  blood_group?: string;
  address?: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email?: string;
  
  // Core Sections
  academic_performance: AcademicPerformance;
  attendance_summary: AttendanceSummary;
  fee_summary: FeeSummary;
  library_summary: LibrarySummary;
  hostel_summary: HostelSummary;
  documents_summary: DocumentsSummary;
  disciplinary_records?: DisciplinaryRecord;
  
  // Metadata
  from_date: string;
  to_date: string;
  generated_at: string;
}

// Quick Summary (lighter version)
export interface Student360Summary {
  student_id: number;
  student_name: string;
  roll_number: string;
  class_name: string;
  section_name: string;
  
  // Quick Stats
  overall_attendance_percentage: number;
  overall_academic_percentage: number;
  overall_grade: string;
  fee_status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  pending_fee_amount: number;
  library_overdue_books: number;
  library_pending_fines: number;
  
  // Alerts
  low_attendance_alert: boolean;
  fee_overdue_alert: boolean;
  library_overdue_alert: boolean;
  disciplinary_alert: boolean;
  
  generated_at: string;
}
