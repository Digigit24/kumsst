// Store Module Types
//


// ============================================================================
// SUPPLIERS & VENDORS
// ============================================================================

export interface Supplier {
  id: number;
  supplier_code: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address?: string;
  rating: number;
  supplier_type: string;
  is_active?: boolean;
}

// Keep Vendor for legacy/compatibility if needed
export interface Vendor {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  college: number;
  is_active: boolean;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface VendorCreateInput {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  gstin?: string;
  college: number;
  is_active?: boolean;
  created_by?: string;
  updated_by?: string;
}

export interface VendorUpdateInput {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  college?: number;
  is_active?: boolean;
  updated_by?: string;
}

export interface VendorFilters {
  page?: number;
  page_size?: number;
  search?: string;
  college?: number;
  is_active?: boolean;
}

// ============================================================================
// STOCK RECEIPT TYPES
// ============================================================================

export interface StockReceipt {
  id: number;
  item: number;
  item_name?: string;
  vendor: number;
  vendor_name?: string;
  quantity: number;
  unit_price: string;
  total_amount: string;
  receive_date: string;
  invoice_number: string;
  invoice_file?: string;
  remarks?: string;
  is_active: boolean;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface StockReceiptCreateInput {
  item: number;
  vendor: number;
  quantity: number;
  unit_price: string;
  total_amount: string;
  receive_date: string;
  invoice_number: string;
  invoice_file?: string;
  remarks?: string;
  is_active?: boolean;
  created_by?: string;
  updated_by?: string;
}

export interface StockReceiptUpdateInput {
  item?: number;
  vendor?: number;
  quantity?: number;
  unit_price?: string;
  total_amount?: string;
  receive_date?: string;
  invoice_number?: string;
  invoice_file?: string;
  remarks?: string;
  is_active?: boolean;
  updated_by?: string;
}

export interface StockReceiptFilters {
  page?: number;
  page_size?: number;
  search?: string;
  item?: number;
  vendor?: number;
  receive_date?: string;
  is_active?: boolean;
}

// ============================================================================
// PROCUREMENT REQUIREMENTS
// ============================================================================

export interface RequirementItem {
  id: number;
  requirement: number;
  item_description: string;
  category?: number;
  quantity: number;
  unit: string;
  estimated_unit_price: string;
  estimated_total: string;
  specifications: string;
  remarks?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type RequirementStatus =
  | "draft"
  | "submitted"
  | "pending_approval"
  | "approved"
  | "quotations_received"
  | "po_created"
  | "fulfilled"
  | "cancelled"
  | "rejected";
export type UrgencyLevel = "low" | "medium" | "high" | "urgent";

export interface ProcurementRequirement {
  id: number;
  requirement_number: string;
  central_store: number;
  title: string;
  description: string;
  requirement_date: string;
  required_by_date: string;
  urgency: UrgencyLevel;
  status: RequirementStatus;
  approval_request?: number | null;
  estimated_budget: string;
  justification: string;
  metadata?: Record<string, any>;
  items?: RequirementItem[];
  quotations_count?: number;
  // rejection_reason is not in the type but might be returned by API or inferred from approval_request
  rejection_reason?: string | null;
  purchase_order_id?: number | null; // Added based on UI usage, check API
  department_name?: string; // Added based on UI usage
  created_at: string;
  updated_at: string;
}

export interface ProcurementRequirementCreateInput {
  central_store: number;
  title: string;
  description: string;
  required_by_date: string;
  urgency: UrgencyLevel;
  estimated_budget: string;
  justification: string;
  items: {
    item_description: string;
    category?: number;
    quantity: number;
    unit: string;
    estimated_unit_price: string;
    specifications: string;
  }[];
}

// ============================================================================
// SUPPLIER QUOTATIONS
// ============================================================================

export interface QuotationItem {
  id: number;
  quotation: number;
  requirement_item: number;
  item_description: string;
  quantity: number;
  unit: string;
  unit_price: string;
  discount_percent?: string; // Added for UI support
  discount_amount?: string; // Added for UI support
  tax_rate: string;
  tax_amount: string;
  total_amount: string;
  specifications?: string;
  brand?: string;
  hsn_code?: string;
}

export type QuotationStatus =
  | "received"
  | "under_review"
  | "accepted"
  | "rejected";

export interface SupplierQuotation {
  id: number;
  quotation_number: string;
  requirement: number;
  supplier: number;
  supplier_details?: Supplier;
  quotation_date: string;
  supplier_reference_number?: string;
  valid_until?: string;
  total_amount: string;
  tax_amount: string;
  grand_total: string;
  payment_terms?: string;
  delivery_time_days?: number;
  warranty_terms?: string;
  quotation_file?: string;
  quotation_file_url?: string;
  status: QuotationStatus;
  is_selected: boolean;
  rejection_reason?: string | null;
  notes?: string;
  items?: QuotationItem[];
  created_at: string;
  updated_at: string;
}

export interface SupplierQuotationCreateInput {
  quotation_number?: string;
  requirement?: number;
  supplier?: number;
  quotation_date?: string;
  valid_until?: string;
  payment_terms?: string;
  delivery_time_days?: number;
  warranty_terms?: string;
  status?: QuotationStatus;
  total_amount?: string;
  tax_amount?: string;
  grand_total?: string;
  quotation_file?: string | File;
  items?: {
    requirement_item?: number;
    item_description: string;
    quantity: number;
    unit: string;
    unit_price: string;
    discount_percent?: string; // Added
    discount_amount?: string; // Added
    tax_rate: string;
    tax_amount: string;
    total_amount: string;
    specifications?: string;
    brand?: string;
    hsn_code?: string;
  }[];
}

// ============================================================================
// PURCHASE ORDERS
// ============================================================================

export interface PurchaseOrderItem {
  id: number;
  purchase_order: number;
  quotation_item: number;
  item_description: string;
  hsn_code: string;
  quantity: number;
  unit: string;
  unit_price: string;
  discount_percent?: string; // Added
  discount_amount?: string; // Added
  tax_rate: string;
  tax_amount: string;
  total_amount: string;
  received_quantity: number;
  pending_quantity: number;
  specifications?: string;
}

export type POStatus =
  | "draft"
  | "sent"
  | "acknowledged"
  | "partially_received"
  | "fulfilled"
  | "cancelled";

export interface PurchaseOrder {
  id: number;
  po_number: string;
  requirement: number;
  quotation: number;
  supplier: number;
  supplier_details?: Supplier;
  central_store: number;
  po_date: string;
  expected_delivery_date: string;
  delivery_address_line1: string;
  delivery_address_line2?: string;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  total_amount: string;
  tax_amount: string;
  discount_amount?: string;
  shipping_charges?: string;
  other_charges?: string;
  grand_total: string;
  payment_terms: string;
  delivery_terms: string;
  special_instructions?: string;
  terms_and_conditions?: string;
  status: POStatus;
  po_document?: string;
  sent_date?: string | null;
  acknowledged_date?: string | null;
  completed_date?: string | null;
  items?: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderCreateInput {
  requirement: number;
  quotation: number;
  supplier: number;
  central_store: number;
  po_date: string;
  expected_delivery_date: string;
  delivery_address_line1: string;
  delivery_address_line2?: string;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  total_amount: string;
  tax_amount: string;
  discount_amount?: string;
  shipping_charges?: string;
  other_charges?: string;
  grand_total: string;
  payment_terms: string;
  delivery_terms: string;
  special_instructions?: string;
  terms_and_conditions?: string;
  items: {
    quotation_item: number;
    item_description: string;
    hsn_code: string;
    quantity: number;
    unit: string;
    unit_price: string;
    discount_percent?: string;
    discount_amount?: string;
    tax_rate: string;
    tax_amount: string;
    total_amount: string;
    specifications?: string;
  }[];
}

// ============================================================================
// GOODS RECEIPTS & INSPECTIONS
// ============================================================================

export interface GRNItem {
  id: number;
  grn: number;
  po_item: number;
  item_description: string;
  ordered_quantity: number;
  received_quantity: number;
  accepted_quantity: number;
  rejected_quantity: number;
  unit: string;
  batch_number?: string;
  serial_number?: string | null;
  manufacturing_date?: string | null;
  expiry_date?: string | null;
  rejection_reason?: string | null;
  inspection_notes?: string | null;
  quality_status: "pending" | "passed" | "failed";
}

export type GRNStatus =
  | "received"
  | "pending_inspection"
  | "inspected"
  | "approved"
  | "rejected"
  | "posted_to_inventory";

export interface GoodsReceiptNoteCreateInput {
  grn_number: string;
  purchase_order: number;
  receipt_date: string;
  vehicle_number: string;
  driver_name: string;
  invoice_number?: string | null;
  challan_number?: string | null;
  freight_charges?: string;
  status: GRNStatus;
  invoice_amount?: string;
  items: {
    po_item: number;
    received_quantity: number;
    accepted_quantity: number;
    rejected_quantity: number;
    rejection_reason?: string | null;
    batch_number?: string | null;
    remarks?: string | null;
  }[];
}

export interface GoodsReceiptNote {
  id: number;
  grn_number: string;
  purchase_order: number;
  supplier: number;
  central_store: number;
  receipt_date: string;
  invoice_number: string;
  invoice_date: string;
  invoice_amount: string;
  invoice_file?: string;
  delivery_challan_number?: string;
  delivery_challan_file?: string;
  lr_number?: string;
  lr_copy?: string;
  vehicle_number?: string;
  transporter_name?: string;
  freight_charges?: string;
  received_by: number; // User ID
  status: GRNStatus;
  remarks?: string;
  inspection?: number | null;
  items?: GRNItem[];
  posted_to_inventory_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InspectionNote {
  id: number;
  grn: number;
  inspector: number;
  inspection_date: string;
  overall_status: "passed" | "failed" | "partial" | "pending";
  quality_rating: number;
  packaging_condition: "excellent" | "good" | "fair" | "poor";
  remarks?: string;
  recommendation: "accept" | "reject" | "partial_accept";
  inspection_images?: string[];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// STORE INDENTS (TRANSFERS)
// ============================================================================

export type IndentStatus =
  | "draft"
  | "submitted"
  | "pending_college_approval"
  | "college_approved"
  | "pending_super_admin"
  | "super_admin_approved"
  | "approved"
  | "partially_fulfilled"
  | "fulfilled"
  | "rejected_by_college"
  | "rejected_by_super_admin"
  | "rejected"
  | "cancelled";

export interface IndentItem {
  id: number;
  indent: number;
  central_store_item: number;
  requested_quantity: number;
  approved_quantity: number;
  issued_quantity: number;
  pending_quantity: number;
  unit: string;
  justification?: string;
  remarks?: string | null;
  available_stock_in_central?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StoreIndent {
  id: number;
  indent_number: string;
  college: number;
  college_name?: string;
  requesting_store_manager: number;
  requesting_store_manager_name?: string;
  central_store: number;
  central_store_name?: string;
  indent_date: string;
  required_by_date: string;
  priority: "low" | "medium" | "high" | "urgent";
  justification: string;
  status: IndentStatus;
  status_display?: string;
  approval_request?: number | null;
  approved_by?: number;
  approved_by_name?: string;
  approved_date?: string | null;
  rejection_reason?: string | null;
  remarks?: string;
  items?: IndentItem[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreIndentCreateInput {
  college: number;
  requesting_store_manager: number;
  central_store: number;
  required_by_date: string;
  priority: "low" | "medium" | "high" | "urgent";
  justification: string;
  remarks?: string;
  items: {
    central_store_item: number;
    requested_quantity: number;
    unit: string;
    justification?: string;
  }[];
}

// ============================================================================
// MATERIAL ISSUE NOTES
// ============================================================================

export interface MaterialIssueItem {
  id: number;
  material_issue: number; // ID
  indent_item: number;
  item: number;
  item_name?: string;
  issued_quantity: number;
  unit: string;
  batch_number?: string;
  remarks?: string;
}

export interface MaterialIssueNote {
  id: number;
  min_number: string;
  issue_date: string;
  indent: number;
  indent_number?: string;
  central_store: number;
  central_store_name?: string;
  receiving_college: number;
  receiving_college_name?: string;
  issued_by: number | string; // User ID or name depending on API return, docs says issued_by: 5
  issued_by_name?: string;
  received_by?: number | string | null;
  transport_mode?: string;
  vehicle_number?: string;
  driver_name?: string;
  driver_contact?: string;
  status: "prepared" | "dispatched" | "in_transit" | "received" | "cancelled";
  dispatch_date?: string | null;
  receipt_date?: string | null;
  min_document?: string;
  internal_notes?: string;
  items?: MaterialIssueItem[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// COLLEGE STORE
// ============================================================================

export interface CollegeStore {
  id: number;
  name: string;
  code: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  contact_phone: string;
  contact_email: string;
  is_active: boolean;
  college: number;
  college_name?: string;
  manager: number | string | null;
  manager_name?: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export interface CollegeStoreCreateInput {
  name: string;
  code: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  contact_phone: string;
  contact_email: string;
  is_active?: boolean;
  college: number;
  manager?: number | string | null;
}

export interface CollegeStoreUpdateInput extends Partial<CollegeStoreCreateInput> {}

// ============================================================================
// CENTRAL STORE & INVENTORY
// ============================================================================

export interface CentralStore {
  id: number;
  name: string;
  code: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  contact_phone: string;
  contact_email: string;
  is_active: boolean;
  manager: string;
  manager_name?: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface CentralInventory {
  id: number;
  item: number; // Use 'item' ID as per docs
  item_display?: string; // from docs
  central_store: number;
  central_store_name?: string;
  item_name?: string;
  quantity_on_hand: number;
  quantity_allocated: number;
  quantity_available: number;
  min_stock_level: number;
  reorder_point: number;
  max_stock_level: number;
  unit_cost: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_stock_update?: string;
}

export interface InventoryTransaction {
  id: number;
  transaction_number: string;
  transaction_type:
    | "receipt"
    | "issue"
    | "adjustment"
    | "transfer"
    | "return"
    | "damage"
    | "write_off";
  central_store: number;
  item: number;
  quantity: number;
  transaction_date: string;
  before_quantity: number;
  after_quantity: number;
  unit_cost: string;
  total_value: string;
  reference_type: number;
  reference_id: number;
  performed_by: number;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
}
