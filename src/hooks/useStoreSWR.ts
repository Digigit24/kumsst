/**
 * SWR-based Hooks for Store Module
 * Cached, auto-revalidating hooks optimized for dropdown performance
 */

import {
  categoriesApi,
  centralInventoryApi,
  centralStoreApi,
  collegeStoresApi,
  creditsApi,
  materialIssuesApi,
  printJobsApi,
  procurementGoodsReceiptsApi,
  procurementInspectionsApi,
  procurementPurchaseOrdersApi,
  procurementQuotationsApi,
  procurementRequirementsApi,
  saleItemsApi,
  salesApi,
  stockReceiptApi,
  storeIndentsApi,
  storeItemsApi,
  vendorApi,
} from '../services/store.service';
import type {
  StockReceiptFilters,
  StockReceipt,
  VendorFilters,
  Vendor,
} from '../types/store.types';
import {
  dropdownSwrConfig,
  generateCacheKey,
  invalidateCache,
  useSWRPaginated,
  UseSWRPaginatedResult,
} from './useSWR';

// ============================================================================
// SWR CACHE KEY CONSTANTS
// ============================================================================

const storeSwrKeys = {
  categories: 'store-categories',
  storeItems: 'store-items',
  saleItems: 'sale-items',
  sales: 'sales',
  credits: 'credits',
  printJobs: 'print-jobs',
  vendors: 'vendors',
  stockReceipts: 'stock-receipts',
  collegeStores: 'college-stores',
  centralStores: 'central-stores',
  centralInventory: 'central-inventory',
  materialIssues: 'material-issues',
  storeIndents: 'store-indents',
  procurementRequirements: 'procurement-requirements',
  procurementQuotations: 'procurement-quotations',
  procurementPurchaseOrders: 'procurement-purchase-orders',
  procurementGoodsReceipts: 'procurement-goods-receipts',
  procurementInspections: 'procurement-inspections',
} as const;

// ============================================================================
// CATEGORIES HOOKS
// ============================================================================

export const useCategoriesSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.categories, filters),
    () => categoriesApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateCategories = () => invalidateCache(storeSwrKeys.categories);

// ============================================================================
// STORE ITEMS HOOKS
// ============================================================================

export const useStoreItemsSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.storeItems, filters),
    () => storeItemsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateStoreItems = () => invalidateCache(storeSwrKeys.storeItems);

// ============================================================================
// SALE ITEMS HOOKS
// ============================================================================

export const useSaleItemsSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.saleItems, filters),
    () => saleItemsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateSaleItems = () => invalidateCache(storeSwrKeys.saleItems);

// ============================================================================
// SALES HOOKS
// ============================================================================

export const useSalesSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.sales, filters),
    () => salesApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateSales = () => invalidateCache(storeSwrKeys.sales);

// ============================================================================
// CREDITS HOOKS
// ============================================================================

export const useCreditsSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.credits, filters),
    () => creditsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateCredits = () => invalidateCache(storeSwrKeys.credits);

// ============================================================================
// PRINT JOBS HOOKS
// ============================================================================

export const usePrintJobsSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.printJobs, filters),
    () => printJobsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidatePrintJobs = () => invalidateCache(storeSwrKeys.printJobs);

// ============================================================================
// VENDORS HOOKS
// ============================================================================

export const useVendorsSWR = (
  filters?: VendorFilters
): UseSWRPaginatedResult<Vendor> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.vendors, filters),
    () => vendorApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateVendors = () => invalidateCache(storeSwrKeys.vendors);

// ============================================================================
// STOCK RECEIPTS HOOKS
// ============================================================================

export const useStockReceiptsSWR = (
  filters?: StockReceiptFilters
): UseSWRPaginatedResult<StockReceipt> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.stockReceipts, filters),
    () => stockReceiptApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateStockReceipts = () => invalidateCache(storeSwrKeys.stockReceipts);

// ============================================================================
// COLLEGE STORES HOOKS
// ============================================================================

export const useCollegeStoresSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.collegeStores, filters),
    () => collegeStoresApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateCollegeStores = () => invalidateCache(storeSwrKeys.collegeStores);

// ============================================================================
// CENTRAL STORES HOOKS
// ============================================================================

export const useCentralStoresSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.centralStores, filters),
    () => centralStoreApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateCentralStores = () => invalidateCache(storeSwrKeys.centralStores);

// ============================================================================
// CENTRAL INVENTORY HOOKS
// ============================================================================

export const useCentralInventorySWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.centralInventory, filters),
    () => centralInventoryApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateCentralInventory = () => invalidateCache(storeSwrKeys.centralInventory);

// ============================================================================
// MATERIAL ISSUES HOOKS
// ============================================================================

export const useMaterialIssuesSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.materialIssues, filters),
    () => materialIssuesApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateMaterialIssues = () => invalidateCache(storeSwrKeys.materialIssues);

// ============================================================================
// STORE INDENTS HOOKS
// ============================================================================

export const useStoreIndentsSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.storeIndents, filters),
    () => storeIndentsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateStoreIndents = () => invalidateCache(storeSwrKeys.storeIndents);

// ============================================================================
// PROCUREMENT REQUIREMENTS HOOKS
// ============================================================================

export const useProcurementRequirementsSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.procurementRequirements, filters),
    () => procurementRequirementsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateProcurementRequirements = () => invalidateCache(storeSwrKeys.procurementRequirements);

// ============================================================================
// PROCUREMENT QUOTATIONS HOOKS
// ============================================================================

export const useProcurementQuotationsSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.procurementQuotations, filters),
    () => procurementQuotationsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateProcurementQuotations = () => invalidateCache(storeSwrKeys.procurementQuotations);

// ============================================================================
// PROCUREMENT PURCHASE ORDERS HOOKS
// ============================================================================

export const useProcurementPurchaseOrdersSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.procurementPurchaseOrders, filters),
    () => procurementPurchaseOrdersApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateProcurementPurchaseOrders = () => invalidateCache(storeSwrKeys.procurementPurchaseOrders);

// ============================================================================
// PROCUREMENT GOODS RECEIPTS HOOKS
// ============================================================================

export const useProcurementGoodsReceiptsSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.procurementGoodsReceipts, filters),
    () => procurementGoodsReceiptsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateProcurementGoodsReceipts = () => invalidateCache(storeSwrKeys.procurementGoodsReceipts);

// ============================================================================
// PROCUREMENT INSPECTIONS HOOKS
// ============================================================================

export const useProcurementInspectionsSWR = (
  filters?: any
): UseSWRPaginatedResult<any> => {
  return useSWRPaginated(
    generateCacheKey(storeSwrKeys.procurementInspections, filters),
    () => procurementInspectionsApi.list(filters),
    dropdownSwrConfig
  );
};

export const invalidateProcurementInspections = () => invalidateCache(storeSwrKeys.procurementInspections);

// ============================================================================
// CONVENIENCE: INVALIDATE ALL STORE DATA
// ============================================================================

export const invalidateAllStore = async () => {
  await Promise.all([
    invalidateCategories(),
    invalidateStoreItems(),
    invalidateSaleItems(),
    invalidateSales(),
    invalidateCredits(),
    invalidatePrintJobs(),
    invalidateVendors(),
    invalidateStockReceipts(),
    invalidateCollegeStores(),
    invalidateCentralStores(),
    invalidateCentralInventory(),
    invalidateMaterialIssues(),
    invalidateStoreIndents(),
    invalidateProcurementRequirements(),
    invalidateProcurementQuotations(),
    invalidateProcurementPurchaseOrders(),
    invalidateProcurementGoodsReceipts(),
    invalidateProcurementInspections(),
  ]);
};
