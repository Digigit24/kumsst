/**
 * Fee Fines Page
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useFeesFinesSWR, invalidateFeeFines } from '../../hooks/swr';
import { useCreateFeeFine, useDeleteFeeFine, useUpdateFeeFine } from '../../hooks/useFees';
import type { FeeFine } from '../../types/fees.types';
import { FeeFineForm } from './forms';

const FeeFinesPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<any | null>(null);

  // Fetch fee fines using SWR
  const { data, isLoading, error } = useFeesFinesSWR(filters);
  const createFeeFine = useCreateFeeFine();
  const updateFeeFine = useUpdateFeeFine();
  const deleteFeeFine = useDeleteFeeFine();

  const columns: Column<any>[] = [
    {
      key: 'student',
      label: 'Student',
      render: (fine) => fine.student_name || `Student #${fine.student}`,
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Fine Amount',
      render: (fine) => (
        <span className="font-semibold text-red-600">
          ₹{parseFloat(fine.amount).toLocaleString()}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (fine) => (
        <span className="max-w-xs truncate">{fine.reason || 'N/A'}</span>
      ),
    },
    {
      key: 'fine_date',
      label: 'Fine Date',
      render: (fine) => new Date(fine.fine_date).toLocaleDateString(),
      sortable: true,
    },
    {
      key: 'is_paid',
      label: 'Payment Status',
      render: (fine) => (
        <Badge variant={fine.is_paid ? 'success' : 'destructive'}>
          {fine.is_paid ? 'Paid' : 'Unpaid'}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (fine) => (
        <Badge variant={fine.is_active ? 'default' : 'secondary'}>
          {fine.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'is_paid',
      label: 'Payment Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Paid' },
        { value: 'false', label: 'Unpaid' },
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
    setSelectedFine(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (fine: FeeFine) => {
    setSelectedFine(fine);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: any) => {
    console.log('handleFormSubmit called with data:', data);
    try {
      if (sidebarMode === 'create') {
        console.log('Creating fee fine...');
        const result = await createFeeFine.mutateAsync(data);
        console.log('Create result:', result);
        toast.success('Fee fine created successfully');
      } else if (sidebarMode === 'edit' && selectedFine) {
        console.log('Updating fee fine...');
        const result = await updateFeeFine.mutateAsync({ id: selectedFine.id, data });
        console.log('Update result:', result);
        toast.success('Fee fine updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedFine(null);
      await invalidateFeeFines();
    } catch (err: any) {
      console.error('Form submission error:', err);
      toast.error(err?.message || err?.error || 'An error occurred');
    }
  };

  const handleDelete = () => {
    if (!selectedFine) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFine) return;
    try {
      await deleteFeeFine.mutateAsync(selectedFine.id);
      toast.success('Fee fine deleted successfully');
      setIsSidebarOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedFine(null);
      await invalidateFeeFines();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete fee fine');
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedFine(null);
  };

  return (
    <div className="">
      <DataTable
        title="Fee Fines"
        description="View and manage fee fines"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeFines()}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search fines..."
        addButtonLabel="Add Fine"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Fee Fine' : `Fine #${selectedFine?.id}` || 'Fee Fine'}
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedFine ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Student</h3>
              <p className="mt-1 text-lg font-semibold">{selectedFine.student_name || `Student #${selectedFine.student}`}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fine Amount</h3>
              <p className="mt-1 text-2xl font-bold text-red-600">
                ₹{parseFloat(selectedFine.amount).toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Reason</h3>
              <p className="mt-1">{selectedFine.reason || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Fine Date</h3>
                <p className="mt-1">{new Date(selectedFine.fine_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payment Status</h3>
                <p className="mt-1">
                  <Badge variant={selectedFine.is_paid ? 'success' : 'destructive'}>
                    {selectedFine.is_paid ? 'Paid' : 'Unpaid'}
                  </Badge>
                </p>
              </div>
            </div>
            {selectedFine.is_paid && selectedFine.paid_date && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Paid Date</h3>
                <p className="mt-1">{new Date(selectedFine.paid_date).toLocaleDateString()}</p>
              </div>
            )}
            {selectedFine.fee_structure_name && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Fee Structure</h3>
                <p className="mt-1">{selectedFine.fee_structure_name}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="mt-1">
                <Badge variant={selectedFine.is_active ? 'default' : 'secondary'}>
                  {selectedFine.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeFineForm
            feeFine={sidebarMode === 'edit' ? selectedFine : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Fee Fine"
        description="Are you sure you want to delete this fee fine? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteFeeFine.isPending}
      />
    </div >
  );
};

export default FeeFinesPage;
