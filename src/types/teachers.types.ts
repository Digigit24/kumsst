/**
 * TypeScript type definitions for Teachers module
 * Based on Django backend models
 */

import { AuditFields } from './core.types';

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface UserBasic {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface Teacher extends AuditFields {
  id: number;
  user: number;
  user_details: UserBasic;
  college: number;
  college_name: string;
  college_detail?: {
    id: number;
    name: string;
    code: string;
    short_name: string;
    city: string;
    state: string;
    country: string;
    is_main: boolean;
    is_active: boolean;
  };
  employee_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  email: string;
  phone: string;
  alternate_phone: string | null;
  address: string | null;
  photo: string | null;
  joining_date: string;
  faculty: number;
  faculty_name: string;
  faculty_detail?: {
    id: number;
    name: string;
    code: string;
    short_name: string;
  };
  specialization: string | null;
  qualifications: string | null;
  experience_details: string | null;
  previous_school: string | null;
  reference_contact: string | null;
  pan_number: string | null;
  aadhaar_number: string | null;
  bank_account_number: string | null;
  bank_ifsc_code: string | null;
  bank_name: string | null;
  salary_grade: string | null;
  custom_attributes: Record<string, any>;
  is_active: boolean;
  resignation_date: string | null;
}

export interface TeacherListItem {
  id: number;
  user: string; // UUID of the user
  user_details?: UserBasic; // Added this property to match Teacher
  employee_id: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  email: string;
  phone: string;
  college: number;
  college_name: string;
  college_detail?: {
    id: number;
    name: string;
    code: string;
    short_name: string;
    city: string;
    state: string;
    country: string;
    is_main: boolean;
    is_active: boolean;
  };
  faculty: number;
  faculty_name: string;
  faculty_detail?: {
    id: number;
    name: string;
    code: string;
    short_name: string;
  };
  specialization?: string | null;
  joining_date: string;
  is_active: boolean;
}

export interface TeacherCreateInput {
  user: number | string;
  college: number;
  employee_id: string;
  joining_date: string;
  faculty: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email: string;
  phone: string;
  alternate_phone?: string | null;
  address?: string | null;
  photo?: File | string | null;
  specialization?: string | null;
  qualifications?: string | null;
  experience_details?: string | null;
  custom_attributes?: Record<string, any>;
  is_active?: boolean;
  resignation_date?: string | null;
}

export interface TeacherUpdateInput extends Partial<TeacherCreateInput> {}

export interface TeacherFilters {
  page?: number;
  page_size?: number;
  college?: number;
  faculty?: number;
  is_active?: boolean;
  gender?: string;
  search?: string;
  ordering?: string;
  user?: number | string;
  class_id?: number;
}

// ============================================================================
// TEACHER CATEGORY TYPES (if needed)
// ============================================================================

export interface TeacherCategory extends AuditFields {
  id: number;
  college: number;
  college_name: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

export interface TeacherCategoryListItem {
  id: number;
  college: number;
  college_name: string;
  name: string;
  code: string;
  is_active: boolean;
}

export interface TeacherCategoryCreateInput {
  college: number;
  name: string;
  code: string;
  description?: string | null;
}

export interface TeacherCategoryUpdateInput extends Partial<TeacherCategoryCreateInput> {}

export interface TeacherCategoryFilters {
  page?: number;
  page_size?: number;
  college?: number;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

// ============================================================================
// TEACHER DOCUMENT TYPES
// ============================================================================

export interface TeacherDocument extends AuditFields {
  id: number;
  teacher: number;
  teacher_name: string;
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

export interface TeacherDocumentListItem {
  id: number;
  teacher: number;
  teacher_name: string;
  document_type: string;
  document_name: string;
  document_file?: string;
  uploaded_date: string;
  is_verified: boolean;
  is_active: boolean;
}

export interface TeacherDocumentCreateInput {
  teacher: number;
  document_type: string;
  document_name: string;
  document_file: File | string;
  notes?: string | null;
}

export interface TeacherDocumentUpdateInput extends Partial<Omit<TeacherDocumentCreateInput, 'document_file'>> {
  document_file?: File | string;
  is_verified?: boolean;
  verified_by?: number | null;
  verified_date?: string | null;
  is_active?: boolean;
}

export interface TeacherDocumentFilters {
  page?: number;
  page_size?: number;
  college?: number;
  teacher?: number;
  document_type?: string;
  is_verified?: boolean;
  is_active?: boolean;
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
