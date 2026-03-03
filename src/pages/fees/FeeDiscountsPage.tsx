/**
 * Fee Discounts Page
 */

import { useState } from 'react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useCreateFeeDiscount, useUpdateFeeDiscount, useDeleteFeeDiscount } from '../../hooks/useFees';
import { useFeeDiscountsSWR, invalidateFeeDiscounts } from '../../hooks/swr';
import type { FeeDiscount } from '../../types/fees.types';
import { FeeDiscountForm } from './forms';
import { toast } from 'sonner';

const FeeDiscountsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any | null>(null);

  // Fetch fee discounts using SWR
  const { data, isLoading, error } = useFeeDiscountsSWR(filters);
  const createFeeDiscount = useCreateFeeDiscount();
  const updateFeeDiscount = useUpdateFeeDiscount();
  const deleteFeeDiscount = useDeleteFeeDiscount();

  const columns: Column<any>[] = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Discount Name', sortable: true },
    {
      key: 'discount_type',
      label: 'Type',
      render: (discount) => (
        <Badge variant="secondary">
          {discount.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}
        </Badge>
      ),
    },
    {
      key: 'discount_value',
      label: 'Value',
      render: (discount) => (
        <span className="font-semibold">
          {discount.discount_type === 'percentage' ? `${discount.discount_value}%` : `₹${discount.discount_value}`}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (discount) => (
        <Badge variant={discount.is_active ? 'success' : 'destructive'}>
          {discount.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'discount_type',
      label: 'Type',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'percentage', label: 'Percentage' },
        { value: 'fixed', label: 'Fixed' },
      ],
    },
    {
      name: 'is_active',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  const handleAddNew = () => {
    setSelectedDiscount(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (discount: FeeDiscount) => {
    setSelectedDiscount(discount);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (sidebarMode === 'create') {
        await createFeeDiscount.mutateAsync(data);
        toast.success('Fee discount created successfully');
      } else if (sidebarMode === 'edit' && selectedDiscount) {
        await updateFeeDiscount.mutateAsync({ id: selectedDiscount.id, data });
        toast.success('Fee discount updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedDiscount(null);
      await invalidateFeeDiscounts();
    } catch (err: any) {
      toast.error(err?.message || err?.error || 'An error occurred');
    }
  };

  const handleDelete = () => {
    if (!selectedDiscount) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDiscount) return;
    try {
      await deleteFeeDiscount.mutateAsync(selectedDiscount.id);
      toast.success('Fee discount deleted successfully');
      setIsSidebarOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedDiscount(null);
      await invalidateFeeDiscounts();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete fee discount');
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedDiscount(null);
  };

  return (
    <div className="">
      <DataTable
        title="Fee Discounts"
        description="View and manage fee discounts"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeDiscounts()}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search discounts..."
        addButtonLabel="Add Discount"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Fee Discount' : selectedDiscount?.name || 'Fee Discount'}
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedDiscount ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Code</h3>
                <p className="mt-1 text-lg">{selectedDiscount.code}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                <p className="mt-1">
                  <Badge variant="secondary">
                    {selectedDiscount.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}
                  </Badge>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="mt-1 text-lg font-semibold">{selectedDiscount.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Discount Value</h3>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {selectedDiscount.discount_type === 'percentage'
                  ? `${selectedDiscount.discount_value}%`
                  : `₹${selectedDiscount.discount_value.toLocaleString()}`}
              </p>
            </div>
            {selectedDiscount.max_discount_amount && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Max Discount Amount</h3>
                <p className="mt-1">₹{selectedDiscount.max_discount_amount.toLocaleString()}</p>
              </div>
            )}
            {selectedDiscount.eligibility_criteria && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Eligibility Criteria</h3>
                <p className="mt-1">{selectedDiscount.eligibility_criteria}</p>
              </div>
            )}
            {selectedDiscount.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{selectedDiscount.description}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="mt-1">
                <Badge variant={selectedDiscount.is_active ? 'success' : 'destructive'}>
                  {selectedDiscount.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeDiscountForm
            feeDiscount={sidebarMode === 'edit' ? selectedDiscount : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Fee Discount"
        description="Are you sure you want to delete this fee discount? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteFeeDiscount.isPending}
      />
    </div>
  );
};

export default FeeDiscountsPage;
