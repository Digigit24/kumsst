/**
 * TypeScript type definitions for Students module
 * Based on Django backend models
 */

import { AuditFields } from './core.types';

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface UserBasic {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

// ============================================================================
// STUDENT CATEGORY TYPES
// ============================================================================

export interface StudentCategory extends AuditFields {
  id: number;
  college: number;
  college_name: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

export interface StudentCategoryListItem {
  id: number;
  college: number;
  college_name: string;
  name: string;
  code: string;
  is_active: boolean;
}

export interface StudentCategoryCreateInput {
  college: number;
  name: string;
  code: string;
  description?: string | null;
}

export interface StudentCategoryUpdateInput extends Partial<StudentCategoryCreateInput> { }

// ...
export interface StudentCategoryFilters {
  page?: number;
  page_size?: number;
  college?: number;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

// ============================================================================
// STUDENT GROUP TYPES
// ============================================================================

export interface StudentGroup extends AuditFields {
  id: number;
  college: number;
  college_name: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface StudentGroupListItem {
  id: number;
  college: number;
  college_name: string;
  name: string;
  is_active: boolean;
}

export interface StudentGroupCreateInput {
  college: number;
  name: string;
  description?: string | null;
}

export interface StudentGroupUpdateInput extends Partial<StudentGroupCreateInput> { }

export interface StudentGroupFilters {
  page?: number;
  page_size?: number;
  college?: number;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

// ============================================================================
// STUDENT TYPES
// ============================================================================

export interface Student extends AuditFields {
  id: number;
  user: number;
  user_details: UserBasic;
  college: number;
  college_name: string;

  // Admission details
  admission_number: string;
  admission_date: string;
  admission_type: string;
  roll_number: string | null;
  registration_number: string;

  // Academic details
  program: number;
  program_name: string;
  current_class: number | null;
  current_class_name: string | null;
  current_section: number | null;
  current_section_name: string | null;
  academic_year: number;
  category: number | null;
  category_name: string | null;
  group: number | null;
  group_name: string | null;

  // Personal details
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  blood_group: string | null;
  email: string;
  phone: string | null;
  alternate_phone: string | null;
  photo: string | null;
  profile_photo?: string | null;

  // Identity details
  nationality: string;
  religion: string | null;
  caste: string | null;
  mother_tongue: string | null;
  aadhar_number: string | null;
  pan_number: string | null;

  // Status
  is_active: boolean;
  is_alumni: boolean;
  disabled_date: string | null;
  disable_reason: string | null;

  // Optional subjects
  optional_subjects: number[];

  // Custom fields
  custom_fields: Record<string, any>;
}

export interface StudentListItem {
  id: number;
  admission_number: string;
  registration_number: string;
  roll_number?: string | null;
  first_name?: string;
  last_name?: string;
  full_name: string;
  email: string;
  phone: string | null;
  college: number;
  college_name: string;
  program: number;
  program_name: string;
  current_class: number | null;
  current_class_name: string | null;
  current_section?: number | null;
  current_section_name?: string | null;
  date_of_birth?: string | null;
  is_active: boolean;
  is_alumni: boolean;
}

export interface StudentCreateInput {
  user: number;
  college: number;
  admission_number: string;
  admission_date: string;
  admission_type: string;
  roll_number?: string | null;
  registration_number: string;
  program: number;
  current_class?: number | null;
  current_section?: number | null;
  academic_year: number;
  category?: number | null;
  group?: number | null;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_group?: string | null;
  email: string;
  phone?: string | null;
  alternate_phone?: string | null;
  photo?: File | string | null;
  nationality?: string;
  religion?: string | null;
  caste?: string | null;
  mother_tongue?: string | null;
  aadhar_number?: string | null;
  pan_number?: string | null;
  optional_subjects?: number[];
  custom_fields?: Record<string, any>;
}

export interface StudentUpdateInput extends Partial<StudentCreateInput> { }

export interface StudentFilters {
  page?: number;
  page_size?: number;
  college?: number;
  program?: number;
  current_class?: number;
  class_obj?: number;
  section?: number;
  current_section?: number;
  category?: number;
  group?: number;
  is_active?: boolean;
  is_alumni?: boolean;
  gender?: string;
  search?: string;
  ordering?: string;
  user?: number | string;
}

// ============================================================================
// GUARDIAN TYPES
// ============================================================================

export interface Guardian {
  id: number;
  user: number | null;
  user_details: UserBasic | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;
  relation: string;
  email: string | null;
  phone: string;
  alternate_phone: string | null;
  occupation: string | null;
  annual_income: string | null;
  address: string | null;
  photo: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuardianListItem {
  id: number;
  full_name: string;
  relation: string;
  phone: string;
  email: string | null;
}

export interface GuardianCreateInput {
  user?: number | null;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  relation: string;
  email?: string | null;
  phone: string;
  alternate_phone?: string | null;
  occupation?: string | null;
  annual_income?: string | null;
  address?: string | null;
  photo?: File | string | null;
}

export interface GuardianUpdateInput extends Partial<GuardianCreateInput> { }

export interface GuardianFilters {
  page?: number;
  page_size?: number;
  college?: number;
  relation?: string;
  search?: string;
  ordering?: string;
}

// ============================================================================
// STUDENT GUARDIAN TYPES
// ============================================================================

export interface StudentGuardian {
  id: number;
  student: number;
  student_name: string;
  guardian: number;
  guardian_details: Guardian;
  is_primary: boolean;
  is_emergency_contact: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentGuardianListItem {
  id: number;
  student: number;
  student_name: string;
  guardian: number;
  guardian_details?: Guardian;
  is_primary: boolean;
  is_emergency_contact: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StudentGuardianCreateInput {
  student: number;
  guardian: number;
  is_primary?: boolean;
  is_emergency_contact?: boolean;
}

export interface StudentGuardianUpdateInput extends Partial<StudentGuardianCreateInput> { }

export interface StudentGuardianFilters {
  page?: number;
  page_size?: number;
  student?: number;
  guardian?: number;
  is_primary?: boolean;
  is_emergency_contact?: boolean;
  ordering?: string;
}

// ============================================================================
// STUDENT ADDRESS TYPES
// ============================================================================

export interface StudentAddress {
  id: number;
  student: number;
  student_name: string;
  address_type: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface StudentAddressListItem {
  id: number;
  student: number;
  student_name: string;
  address_type: string;
  address_line1?: string;
  address_line2?: string | null;
  city: string;
  state: string;
  pincode?: string;
  country?: string;
}

export interface StudentAddressCreateInput {
  student: number;
  address_type: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface StudentAddressUpdateInput extends Partial<StudentAddressCreateInput> { }

export interface StudentAddressFilters {
  page?: number;
  page_size?: number;
  college?: number;
  student?: number;
  address_type?: string;
  city?: string;
  state?: string;
  ordering?: string;
}

// ============================================================================
// STUDENT DOCUMENT TYPES
// ============================================================================

export interface StudentDocument extends AuditFields {
  id: number;
  student: number;
  student_name: string;
  document_type: string;
  document_name: string;
  document_file: string;
  uploaded_date: string;
  is_verified: boolean;
  verified_by: number | null;
  verified_by_details: UserBasic | null;
  verified_date: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface StudentDocumentListItem {
  id: number;
  student: number;
  student_name: string;
  document_type: string;
  document_name: string;
  document_file?: string;
  uploaded_date: string;
  is_verified: boolean;
  verified_by?: number | null;
  verified_by_details?: UserBasic | null;
  verified_date?: string | null;
  notes?: string | null;
  is_active: boolean;
}

export interface StudentDocumentCreateInput {
  student: number;
  document_type: string;
  document_name: string;
  document_file: File | string;
  notes?: string | null;
}

export interface StudentDocumentUpdateInput extends Partial<Omit<StudentDocumentCreateInput, 'document_file'>> {
  document_file?: File | string;
  is_verified?: boolean;
  verified_by?: number | null;
  verified_date?: string | null;
  is_active?: boolean;
}

export interface StudentDocumentFilters {
  page?: number;
  page_size?: number;
  college?: number;
  student?: number;
  document_type?: string;
  is_verified?: boolean;
  is_active?: boolean;
  ordering?: string;
}

// ============================================================================
// STUDENT MEDICAL RECORD TYPES
// ============================================================================

export interface StudentMedicalRecord extends AuditFields {
  id: number;
  student: number;
  student_name: string;
  blood_group: string | null;
  height: string | null;
  weight: string | null;
  allergies: string | null;
  medical_conditions: string | null;
  medications: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  health_insurance_provider: string | null;
  health_insurance_number: string | null;
  last_checkup_date: string | null;
  is_active: boolean;
}

export interface StudentMedicalRecordCreateInput {
  student: number;
  blood_group?: string | null;
  height?: string | null;
  weight?: string | null;
  allergies?: string | null;
  medical_conditions?: string | null;
  medications?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
  health_insurance_provider?: string | null;
  health_insurance_number?: string | null;
  last_checkup_date?: string | null;
}

export interface StudentMedicalRecordUpdateInput extends Partial<StudentMedicalRecordCreateInput> { }

export interface StudentMedicalRecordFilters {
  page?: number;
  page_size?: number;
  college?: number;
  student?: number;
  is_active?: boolean;
  ordering?: string;
}

// ============================================================================
// PREVIOUS ACADEMIC RECORD TYPES
// ============================================================================

export interface PreviousAcademicRecord extends AuditFields {
  id: number;
  student: number;
  student_name: string;
  level: string;
  institution_name: string;
  board_university: string;
  year_of_passing: number;
  marks_obtained: string | null;
  total_marks: string | null;
  percentage: string | null;
  grade: string | null;
  certificate_number: string | null;
  is_active: boolean;
}

export interface PreviousAcademicRecordListItem {
  id: number;
  student: number;
  student_name: string;
  level: string;
  institution_name: string;
  year_of_passing: number;
  percentage: string | null;
  grade: string | null;
}

export interface PreviousAcademicRecordCreateInput {
  student: number;
  level: string;
  institution_name: string;
  board_university: string;
  year_of_passing: number;
  marks_obtained?: string | null;
  total_marks?: string | null;
  percentage?: string | null;
  grade?: string | null;
  certificate_number?: string | null;
}

export interface PreviousAcademicRecordUpdateInput extends Partial<PreviousAcademicRecordCreateInput> { }

export interface PreviousAcademicRecordFilters {
  page?: number;
  page_size?: number;
  college?: number;
  student?: number;
  level?: string;
  year_of_passing?: number;
  is_active?: boolean;
  ordering?: string;
}

// ============================================================================
// STUDENT PROMOTION TYPES
// ============================================================================

export interface StudentPromotion extends AuditFields {
  id: number;
  student: number;
  student_name: string;
  from_class: number;
  from_class_name: string;
  to_class: number;
  to_class_name: string;
  from_section: number | null;
  from_section_name: string | null;
  to_section: number | null;
  to_section_name: string | null;
  promotion_date: string;
  academic_year: number;
  remarks: string | null;
  is_active: boolean;
}

export interface StudentPromotionListItem {
  id: number;
  student: number;
  student_name: string;
  from_class?: number;
  from_class_name: string;
  to_class?: number;
  to_class_name: string;
  from_section?: number | null;
  from_section_name?: string | null;
  to_section?: number | null;
  to_section_name?: string | null;
  promotion_date: string;
  academic_year?: number;
  academic_year_name?: string | null;
  remarks?: string | null;
  is_active?: boolean;
}

export interface StudentPromotionCreateInput {
  student: number;
  from_class: number;
  to_class: number;
  from_section?: number | null;
  to_section?: number | null;
  promotion_date: string;
  academic_year: number;
  remarks?: string | null;
  is_active?: boolean;
}

export interface StudentPromotionUpdateInput extends Partial<StudentPromotionCreateInput> { }

export interface StudentPromotionFilters {
  page?: number;
  page_size?: number;
  college?: number;
  student?: number;
  from_class?: number;
  to_class?: number;
  academic_year?: number;
  is_active?: boolean;
  ordering?: string;
}

// ============================================================================
// CERTIFICATE TYPES
// ============================================================================

export interface Certificate extends AuditFields {
  id: number;
  student: number;
  student_name: string;
  certificate_type: string;
  certificate_number: string;
  issue_date: string;
  valid_until: string | null;
  purpose: string | null;
  certificate_file: string | null;
  signature_image: string | null;
  signed_by: number | null;
  signed_by_details: UserBasic | null;
  verification_code: string;
  is_active: boolean;
}

export interface CertificateListItem {
  id: number;
  student: number;
  student_name: string;
  certificate_type: string;
  certificate_number: string;
  issue_date: string;
  is_active: boolean;
}

export interface CertificateCreateInput {
  student: number;
  certificate_type: string;
  certificate_number: string;
  issue_date: string;
  valid_until?: string | null;
  purpose?: string | null;
  certificate_file?: File | string | null;
  signature_image?: File | string | null;
  signed_by?: number | null;
}

export interface CertificateUpdateInput extends Partial<CertificateCreateInput> { }

export interface CertificateFilters {
  page?: number;
  page_size?: number;
  college?: number;
  student?: number;
  certificate_type?: string;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

// ============================================================================
// STUDENT ID CARD TYPES
// ============================================================================

export interface StudentIDCard extends AuditFields {
  id: number;
  student: number;
  student_name: string;
  card_number: string;
  issue_date: string;
  valid_until: string;
  qr_code: string | null;
  card_file: string | null;
  is_active: boolean;
  is_reissue: boolean;
  reissue_reason: string | null;
}

export interface StudentIDCardListItem {
  id: number;
  student: number;
  student_name: string;
  card_number: string;
  issue_date: string;
  valid_until: string;
  is_active: boolean;
}

export interface StudentIDCardCreateInput {
  student: number;
  card_number: string;
  issue_date: string;
  valid_until: string;
  qr_code?: File | string | null;
  card_file?: File | string | null;
  is_reissue?: boolean;
  reissue_reason?: string | null;
}

export interface StudentIDCardUpdateInput extends Partial<StudentIDCardCreateInput> { }

export interface StudentIDCardFilters {
  page?: number;
  page_size?: number;
  college?: number;
  student?: number;
  is_active?: boolean;
  is_reissue?: boolean;
  search?: string;
  ordering?: string;
}

// ============================================================================
// BULK OPERATION TYPES
// ============================================================================

export interface BulkDeleteInput {
  ids: number[];
}

export interface BulkActivateInput {
  ids: number[];
  is_active: boolean;
}

// ============================================================================
// STUDENT IMPORT TYPES
// ============================================================================

export interface ImportAppField {
  key: string;
  label: string;
  required: boolean;
  type: string;
  description?: string;
}

export interface ImportPreviewResponse {
  excel_headers: string[];
  total_rows: number;
  sample_data: Record<string, string>[];
  app_fields: ImportAppField[];
}

export interface ImportProcessResponse {
  job_id: number;
  status: string;
  total_rows: number;
  message: string;
}

export interface ImportCreatedStudent {
  row: number;
  id: number;
  admission_number: string;
  full_name: string;
  email: string | null;
}

export interface ImportRowError {
  row: number;
  errors: string[];
}

export interface ImportStatusResponse {
  job_id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_name: string;
  total_rows: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: ImportRowError[];
  created_students: ImportCreatedStudent[];
}
