export interface ProcurementMetrics {
  total_requirements_count?: number; // Legacy support if needed, but prefer new fields below
  total_requirements_value?: number;
  open_requirements_count?: number;
  total_orders_count?: number;
  total_orders_value?: number;
  pending_delivery_count?: number;
  completed_orders_count?: number;
  
  // New API Fields
  total_requirements: number;
  pending_requirements: number;
  approved_requirements: number;
  fulfilled_requirements: number;
  total_estimated_budget: number;
  
  total_purchase_orders: number;
  active_purchase_orders: number;
  fulfilled_purchase_orders: number;
  total_po_value: number;
  
  total_grns: number;
  pending_inspection_grns: number;
  posted_to_inventory_grns: number;
  
  total_quotations: number;
  pending_quotations: number;
  accepted_quotations: number;
}

export interface CentralStoreBreakdownItem {
  store_id: number;
  store_name: string;
  store_code: string;
  total_requirements: number;
  pending_requirements: number;
  active_pos: number;
  inventory_value: number;
  low_stock_items: number;
}

export interface ProcurementDrillDownOverviewResponse {
    total_requirements: number;
    pending_requirements: number;
    approved_requirements: number;
    fulfilled_requirements: number;
    total_estimated_budget: number;
    
    total_purchase_orders: number;
    active_purchase_orders: number;
    fulfilled_purchase_orders: number;
    total_po_value: number;
    
    total_grns: number;
    pending_inspection_grns: number;
    posted_to_inventory_grns: number;
    
    total_quotations: number;
    pending_quotations: number;
    accepted_quotations: number;
    
    central_store_breakdown: CentralStoreBreakdownItem[];
    generated_at: string;
}

export interface SupplierQuotationSummary {
  quotation_id: number;
  quotation_number: string;
  supplier_name: string;
  supplier_code: string;
  quotation_date: string;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  delivery_time_days: number | null;
  payment_terms: string;
  status: string;
  is_selected: boolean;
}

export interface CentralStoreLowStockItem {
  item_id: number;
  item_name: string;
  item_code: string;
  quantity_available: number;
  reorder_point: number;
  min_stock_level: number;
}

export interface GRNItem {
  item_id: number;
  description: string;
  ordered_quantity: number;
  received_quantity: number;
  accepted_quantity: number;
  rejected_quantity: number;
  unit: string;
  batch_number: string | null;
  expiry_date: string | null;
  quality_status: string;
  rejection_reason: string | null;
}

export interface ProcurementDrillDownGRNResponse {
  grn_id: number;
  grn_number: string;
  po_number: string;
  requirement_number: string;
  supplier_name: string;
  central_store_name: string;
  receipt_date: string;
  invoice_number: string;
  invoice_date: string;
  invoice_amount: number;
  status: string;
  received_by: string;
  vehicle_number: string | null;
  transporter_name: string | null;
  total_items: number;
  total_received: number;
  total_accepted: number;
  total_rejected: number;
  acceptance_rate: number;
  items: GRNItem[];
  inspection: any | null; // Placeholder as it's null in example
  remarks: string | null;
  posted_to_inventory_date: string;
  generated_at: string;
}

export interface CentralStoreRecentGRN {
  grn_id: number;
  grn_number: string;
  receipt_date: string;
  status: string;
  invoice_amount: number;
}

export interface CentralStoreRequirementItem {
  requirement_id: number;
  requirement_number: string;
  title: string;
  urgency: string;
  status: string;
  estimated_budget: number | null;
  required_by_date: string;
  quotation_count: number;
  po_count: number;
}

export interface ProcurementDrillDownRequirementResponse {
  requirement_id: number;
  requirement_number: string;
  title: string;
  description: string;
  urgency: string;
  status: string;
  required_by_date: string;
  estimated_budget: number;
  justification: string;
  central_store_name: string;
  total_quotations: number;
  quotation_comparison: SupplierQuotationSummary[];
  generated_at: string;
  // Deprecated/Removed fields from previous interface to be removed:
  // items_summary, timeline, purchase_order_id (if not in response)
  // Assuming purchase_order_id is not in the response provided, we remove it.
  purchase_order_id?: number; // Optional/Temporary if UI relies on it, but API doesn't send it. Checked JSON, it's not there.
}

export interface ProcurementDrillDownCentralStoreResponse {
  store_id: number;
  store_name: string;
  store_code: string;
  manager_name: string;
  total_requirements: number;
  total_po_value: number;
  total_inventory_items: number;
  total_inventory_value: number;
  
  low_stock_items: CentralStoreLowStockItem[];
  recent_grns: CentralStoreRecentGRN[];
  requirement_breakdown: CentralStoreRequirementItem[];
  generated_at: string;
}

export interface CentralStoreInventoryItem {
  item_id: number;
  item_name: string;
  item_code: string;
  category: string;
  current_stock: number;
  unit: string;
  reorder_level: number;
  unit_price: number;
  total_value: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface InventoryItem {
    inventory_id: number;
    item_id: number;
    item_name: string;
    item_code: string;
    category_name: string;
    quantity_on_hand: number;
    quantity_allocated: number;
    quantity_available: number;
    min_stock_level: number;
    reorder_point: number;
    max_stock_level: number | null;
    unit_cost: number;
    total_value: number;
    is_low_stock: boolean;
    is_out_of_stock: boolean;
}

export interface InventoryCategoryBreakdown {
    category_name: string;
    category_code: string;
    item_count: number;
    total_quantity: number;
    total_value: number;
}

export interface InventoryTransaction {
    transaction_id: number;
    transaction_number: string;
    transaction_type: string;
    item_name: string;
    quantity: number;
    before_quantity: number;
    after_quantity: number;
    transaction_date: string;
    performed_by: string;
}

export interface ProcurementDrillDownInventoryResponse {
  store_id: number;
  store_name: string;
  store_code: string;
  total_items: number;
  total_inventory_value: number; // Changed from total_value
  low_stock_count: number;
  out_of_stock_count: number;
  category_breakdown: InventoryCategoryBreakdown[];
  items: InventoryItem[]; // Changed from inventory_items
  recent_transactions: InventoryTransaction[];
  generated_at: string;
}

export interface SupplierPerformanceMetric {
  supplier_id: number;
  supplier_name: string;
  supplier_code: string;
  supplier_type: string;
  rating: number; // 0-5
  total_orders: number;
  fulfilled_orders: number;
  total_order_value: number;
  on_time_delivery_rate: number; // Percentage
  total_quotations: number;
  selected_quotations: number;
}

export interface ProcurementDrillDownSupplierPerformanceResponse {
  total_active_suppliers: number;
  suppliers: SupplierPerformanceMetric[];
  generated_at: string;
}

export interface ProcurementDrillDownFilters {
  from_date?: string;
  to_date?: string;
  limit?: number;
  status?: string;
}
