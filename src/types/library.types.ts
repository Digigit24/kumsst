/**
 * Library Module Types for KUMSS ERP
 * All types matching Django backend models
 */


// ============================================================================
// COMMON TYPES
// ============================================================================

export interface AuditFields {
  created_by: string | null;
  updated_by: string | null;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// BOOK CATEGORY TYPES
// ============================================================================

export interface BookCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  college: number;
  created_at: string;
  updated_at: string;
  created_by?: any;
  updated_by?: any;
}

export interface BookCategoryListItem {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

export interface BookCategoryCreateInput {
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
  college: number;
}

export interface BookCategoryUpdateInput {
  name?: string;
  code?: string;
  description?: string;
  is_active?: boolean;
}

// ============================================================================
// BOOK TYPES
// ============================================================================

export interface Book extends AuditFields {
  id: number;
  is_active: boolean;
  title: string;
  author: string;
  isbn: string | null;
  publisher: string | null;
  edition: string | null;
  publication_year: number | null;
  language: string;
  pages: number | null;
  quantity: number;
  available_quantity: number;
  price: string;
  location: string | null;
  barcode: string | null;
  description: string | null;
  cover_image: string | null;
  college: number;
  category: number;
  category_name?: string;
}

export interface BookListItem {
  id: number;
  title: string;
  author: string;
  isbn: string | null;
  publisher: string | null;
  category_name: string;
  quantity: number;
  available_quantity: number;
  price: string;
  is_active: boolean;
}

export interface BookCreateInput {
  is_active?: boolean;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  publication_year?: number;
  language: string;
  pages?: number;
  quantity: number;
  available_quantity?: number;
  price: string;
  location?: string;
  barcode?: string;
  description?: string;
  cover_image?: string;
  created_by?: string;
  updated_by?: string;
  college: number;
  category: number;
}

export interface BookUpdateInput extends Partial<BookCreateInput> { }

// ============================================================================
// LIBRARY MEMBER TYPES
// ============================================================================

export interface LibraryMember extends AuditFields {
  id: number;
  is_active: boolean;
  member_id: string;
  user: string;
  user_name?: string;
  member_name?: string;
  member_type: 'student' | 'teacher' | 'staff';
  member_type_display?: string;
  student?: number | null;
  teacher?: number | null;
  max_books_allowed: number;
  max_days_allowed: number;
  joining_date: string;
  expiry_date: string | null;
  is_blocked: boolean;
  block_reason: string | null;
  college: number;
  college_name?: string;
}

export interface LibraryMemberListItem {
  id: number;
  member_id: string;
  user: string;
  user_name: string;
  member_type: string;
  max_books_allowed: number;
  joining_date: string;
  is_blocked: boolean;
  is_active: boolean;
}

export interface LibraryMemberCreateInput {
  is_active?: boolean;
  member_id: string;
  user: string;
  member_type: 'student' | 'teacher' | 'staff';
  max_books_allowed: number;
  max_days_allowed: number;
  joining_date: string;
  expiry_date?: string | null;
  created_by?: string;
  updated_by?: string;
  college: number;
}

export interface LibraryMemberUpdateInput extends Partial<LibraryMemberCreateInput> { }

// ============================================================================
// LIBRARY CARD TYPES
// ============================================================================

export interface LibraryCard extends AuditFields {
  id: number;
  is_active: boolean;
  card_number: string;
  issue_date: string;
  valid_until: string;
  card_file: string | null;
  member: number;
  member_name?: string;
}

export interface LibraryCardListItem {
  id: number;
  card_number: string;
  member_name: string;
  issue_date: string;
  valid_until: string;
  is_active: boolean;
}

export interface LibraryCardCreateInput {
  is_active?: boolean;
  card_number: string;
  issue_date: string;
  valid_until: string;
  card_file?: string;
  created_by?: string;
  updated_by?: string;
  member: number;
}

export interface LibraryCardUpdateInput extends Partial<LibraryCardCreateInput> { }

// ============================================================================
// BOOK ISSUE TYPES
// ============================================================================

export interface BookIssue extends AuditFields {
  id: number;
  is_active: boolean;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  status: 'issued' | 'returned' | 'overdue' | 'lost';
  remarks: string | null;
  book: number | { id: number; title: string; author: string };
  book_title?: string;
  book_author?: string;
  member: number | { id: number; member_id: string; user_name: string };
  member_name?: string;
  member_id_display?: string;
  issued_by: string | null;
  issued_by_name?: string;
}

export interface BookIssueListItem {
  id: number;
  book: number;
  book_title?: string;
  member: number;
  member_name?: string;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
  issued_by_name?: string | null;
}

export interface BookIssueCreateInput {
  is_active?: boolean;
  issue_date: string;
  due_date: string;
  return_date?: string | null;
  status: 'issued' | 'returned' | 'overdue' | 'lost';
  remarks?: string;
  created_by?: string;
  updated_by?: string;
  book: number;
  member: number;
  issued_by?: string;
}

export interface BookIssueUpdateInput extends Partial<BookIssueCreateInput> { }

// ============================================================================
// FINE TYPES
// ============================================================================

export interface Fine extends AuditFields {
  id: number;
  is_active: boolean;
  amount: string;
  reason: string;
  fine_date: string;
  is_paid: boolean;
  paid_date: string | null;
  remarks: string | null;
  member: number;
  member_name?: string;
  student_name?: string;
  book_issue: number | null;
}

export interface FineListItem {
  id: number;
  member_name: string;
  amount: string;
  reason: string;
  fine_date: string;
  is_paid: boolean;
  paid_date: string | null;
}

export interface FineCreateInput {
  is_active?: boolean;
  amount: string;
  reason: string;
  fine_date: string;
  is_paid?: boolean;
  paid_date?: string | null;
  remarks?: string;
  created_by?: string;
  updated_by?: string;
  member: number;
  book_issue?: number | null;
}

export interface FineUpdateInput extends Partial<FineCreateInput> { }

// ============================================================================
// RESERVATION TYPES
// ============================================================================

export interface Reservation extends AuditFields {
  id: number;
  is_active: boolean;
  reservation_date: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  remarks: string | null;
  book: number;
  book_title?: string;
  member: number;
  member_name?: string;
}

export interface ReservationListItem {
  id: number;
  book_title: string;
  member_name: string;
  reservation_date: string;
  status: string;
}

export interface ReservationCreateInput {
  is_active?: boolean;
  reservation_date: string;
  status?: 'pending' | 'fulfilled' | 'cancelled';
  remarks?: string;
  created_by?: string;
  updated_by?: string;
  book: number;
  member: number;
}

export interface ReservationUpdateInput extends Partial<ReservationCreateInput> { }

// ============================================================================
// BOOK RETURN TYPES
// ============================================================================

export interface BookReturn extends AuditFields {
  id: number;
  is_active: boolean;
  return_date: string;
  is_damaged: boolean;
  damage_charges: string;
  fine_amount: string;
  remarks: string | null;
  issue:
  | number
  | {
    id: number;
    book?: number | { id: number };
    member?: number | { id: number };
  };
  received_by: string;
  book_title?: string;
  member_name?: string;
  member_id_display?: string;
}

export interface BookReturnListItem {
  id: number;
  book_title: string;
  member_name: string;
  return_date: string;
  is_damaged: boolean;
  fine_amount: string;
  damage_charges: string;
}

export interface BookReturnCreateInput {
  is_active?: boolean;
  return_date: string;
  is_damaged: boolean;
  damage_charges?: string;
  fine_amount?: string;
  remarks?: string;
  created_by?: string;
  updated_by?: string;
  issue: number;
  received_by?: string;
}

export interface BookReturnUpdateInput extends Partial<BookReturnCreateInput> { }

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface BookFilters {
  page?: number;
  page_size?: number;
  college?: number;
  category?: number;
  language?: string;
  author?: string;
  publisher?: string;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

export interface BookCategoryFilters {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

export interface LibraryMemberFilters {
  page?: number;
  page_size?: number;
  college?: number;
  member_type?: string;
  is_blocked?: boolean;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

export interface LibraryCardFilters {
  page?: number;
  page_size?: number;
  member?: number;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

export interface BookIssueFilters {
  page?: number;
  page_size?: number;
  book?: number;
  member?: number;
  status?: string;
  issue_date?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  ordering?: string;
}

export interface FineFilters {
  page?: number;
  page_size?: number;
  member?: number;
  is_paid?: boolean;
  fine_date?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  ordering?: string;
}

export interface ReservationFilters {
  page?: number;
  page_size?: number;
  book?: number;
  member?: number;
  status?: string;
  reservation_date?: string;
  search?: string;
  ordering?: string;
}

export interface BookReturnFilters {
  page?: number;
  page_size?: number;
  book_issue?: number;
  return_date?: string;
  date_from?: string;
  date_to?: string;
  condition?: string;
  search?: string;
  ordering?: string;
}
