import { procurementDrillDownApi } from '@/services/procurement-drilldown.service';
import type {
    ProcurementDrillDownFilters,
} from '@/types/procurement-drilldown.types';
import { useQuery } from '@tanstack/react-query';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useProcurementOverview = (filters?: ProcurementDrillDownFilters) => {
  return useQuery({
    queryKey: ['procurement-drilldown', 'overview', filters],
    queryFn: () => procurementDrillDownApi.getOverview(filters),
    staleTime: STALE_TIME,
  });
};

export const useCentralStoreDrillDown = (storeId: number | null, filters?: ProcurementDrillDownFilters) => {
  return useQuery({
    queryKey: ['procurement-drilldown', 'central-store', storeId, filters],
    queryFn: () => {
      if (!storeId) throw new Error('Store ID is required');
      return procurementDrillDownApi.getCentralStoreDetails(storeId, filters);
    },
    enabled: !!storeId,
    staleTime: STALE_TIME,
  });
};

export const useRequirementDrillDown = (reqId: number | null) => {
  return useQuery({
    queryKey: ['procurement-drilldown', 'requirement', reqId],
    queryFn: () => {
      if (!reqId) throw new Error('Requirement ID is required');
      return procurementDrillDownApi.getRequirementDetails(reqId);
    },
    enabled: !!reqId,
    staleTime: STALE_TIME,
  });
};

export const usePODrillDown = (poId: number | null) => {
  return useQuery({
    queryKey: ['procurement-drilldown', 'purchase-order', poId],
    queryFn: () => {
      if (!poId) throw new Error('PO ID is required');
      return procurementDrillDownApi.getPODetails(poId);
    },
    enabled: !!poId,
    staleTime: STALE_TIME,
  });
};

export const useGRNDrillDown = (grnId: number | null) => {
  return useQuery({
    queryKey: ['procurement-drilldown', 'grn', grnId],
    queryFn: () => {
      if (!grnId) throw new Error('GRN ID is required');
      return procurementDrillDownApi.getGRNDetails(grnId);
    },
    enabled: !!grnId,
    staleTime: STALE_TIME,
  });
};

export const useStoreInventoryDrillDown = (storeId: number | null, filters?: ProcurementDrillDownFilters) => {
  return useQuery({
    queryKey: ['procurement-drilldown', 'inventory', storeId, filters],
    queryFn: () => {
      if (!storeId) throw new Error('Store ID is required');
      return procurementDrillDownApi.getStoreInventory(storeId, filters);
    },
    enabled: !!storeId,
    staleTime: STALE_TIME,
  });
};

export const useSupplierPerformance = (filters?: ProcurementDrillDownFilters) => {
  return useQuery({
    queryKey: ['procurement-drilldown', 'supplier-performance', filters],
    queryFn: () => procurementDrillDownApi.getSupplierPerformance(filters),
    staleTime: STALE_TIME,
  });
};
