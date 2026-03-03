/**
 * Receipts Page - Accountant Module
 * View and download receipts
 */


import { useState } from 'react';

import { DataTable } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/badge';

import { useReceipts } from '../../hooks/useAccountant';
import type { FeeReceipt, ReceiptFilters } from '../../types/accountant.types';

export default function ReceiptsPage() {
  const [filters, setFilters] = useState<ReceiptFilters>({
    page: 1,
    page_size: 10,
  });

  const { data, isLoading, error, refetch } = useReceipts(filters);


  const columns = [
    {
      key: 'receipt_number',
      label: 'Receipt Number',
      sortable: true,
    },
    {
      key: 'student_name',
      label: 'Student',
      sortable: true,
    },
    {
      key: 'collection',
      label: 'Collection ID',
      sortable: true,
      render: (item: FeeReceipt) => `#${item.collection}`,
    },
    {
      key: 'created_at',
      label: 'Generated At',
      sortable: true,
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (item: FeeReceipt) => (
        <Badge variant={item.is_active ? 'default' : 'secondary'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },

  ];

  return (
    <div className="p-6 space-y-6">
      <DataTable
        title="Receipts"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error ? (error as any).message : null}
        onRefresh={refetch}
        filters={filters}
        onFiltersChange={(newFilters) => setFilters(newFilters as ReceiptFilters)}
      />
    </div>
  );
}
