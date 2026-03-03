/**
 * Flat Structure Store API Exports
 * Maps snake_case function names to their corresponding service methods.
 * This file is assigned to match the specific function signatures requested.
 */
import {
  procurementGoodsReceiptsApi,
  procurementInspectionsApi,
  procurementPurchaseOrdersApi,
  procurementQuotationsApi,
  procurementRequirementsApi,
} from "./store.service";

// Goods Receipts
export const store_procurement_goods_receipts_list =
  procurementGoodsReceiptsApi.list;
export const store_procurement_goods_receipts_create =
  procurementGoodsReceiptsApi.create;
export const store_procurement_goods_receipts_retrieve =
  procurementGoodsReceiptsApi.get;
export const store_procurement_goods_receipts_update =
  procurementGoodsReceiptsApi.update;
export const store_procurement_goods_receipts_partial_update =
  procurementGoodsReceiptsApi.patch;
export const store_procurement_goods_receipts_destroy =
  procurementGoodsReceiptsApi.delete;
export const store_procurement_goods_receipts_post_to_inventory_create =
  procurementGoodsReceiptsApi.postToInventory;
export const store_procurement_goods_receipts_submit_for_inspection_create =
  procurementGoodsReceiptsApi.submitForInspection;

// Inspections
export const store_procurement_inspections_list =
  procurementInspectionsApi.list;
export const store_procurement_inspections_create =
  procurementInspectionsApi.create;
export const store_procurement_inspections_retrieve =
  procurementInspectionsApi.get;
export const store_procurement_inspections_update =
  procurementInspectionsApi.update;
export const store_procurement_inspections_partial_update =
  procurementInspectionsApi.patch;
export const store_procurement_inspections_destroy =
  procurementInspectionsApi.delete;

// Purchase Orders
export const store_procurement_purchase_orders_list =
  procurementPurchaseOrdersApi.list;
export const store_procurement_purchase_orders_create =
  procurementPurchaseOrdersApi.create;
export const store_procurement_purchase_orders_retrieve =
  procurementPurchaseOrdersApi.get;
export const store_procurement_purchase_orders_update =
  procurementPurchaseOrdersApi.update;
export const store_procurement_purchase_orders_partial_update =
  procurementPurchaseOrdersApi.patch;
export const store_procurement_purchase_orders_destroy =
  procurementPurchaseOrdersApi.delete;
export const store_procurement_purchase_orders_acknowledge_create =
  procurementPurchaseOrdersApi.acknowledge;
export const store_procurement_purchase_orders_generate_pdf_create =
  procurementPurchaseOrdersApi.generatePdf;
export const store_procurement_purchase_orders_send_to_supplier_create =
  procurementPurchaseOrdersApi.sendToSupplier;

// Quotations
export const store_procurement_quotations_list = procurementQuotationsApi.list;
export const store_procurement_quotations_create =
  procurementQuotationsApi.create;
export const store_procurement_quotations_retrieve =
  procurementQuotationsApi.get;
export const store_procurement_quotations_update =
  procurementQuotationsApi.update;
export const store_procurement_quotations_partial_update =
  procurementQuotationsApi.patch;
export const store_procurement_quotations_destroy =
  procurementQuotationsApi.delete;
export const store_procurement_quotations_mark_selected_create =
  procurementQuotationsApi.markSelected;

// Requirements
export const store_procurement_requirements_list =
  procurementRequirementsApi.list;
export const store_procurement_requirements_create =
  procurementRequirementsApi.create;
export const store_procurement_requirements_retrieve =
  procurementRequirementsApi.get;
export const store_procurement_requirements_update =
  procurementRequirementsApi.update;
export const store_procurement_requirements_partial_update =
  procurementRequirementsApi.patch;
export const store_procurement_requirements_destroy =
  procurementRequirementsApi.delete;
export const store_procurement_requirements_compare_quotations_retrieve =
  procurementRequirementsApi.compareQuotations;
export const store_procurement_requirements_quotations_retrieve =
  procurementRequirementsApi.getQuotations;
export const store_procurement_requirements_select_quotation_create =
  procurementRequirementsApi.selectQuotation;
export const store_procurement_requirements_submit_for_approval_create =
  procurementRequirementsApi.submitForApproval;
