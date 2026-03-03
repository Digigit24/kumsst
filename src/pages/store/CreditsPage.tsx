/**
 * Credits Page
 */

import { useState } from 'react';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useCreateCredit, useUpdateCredit, useDeleteCredit } from '../../hooks/useStore';
import { useCreditsSWR, invalidateCredits } from '../../hooks/swr';
import { CreditForm } from './forms/CreditForm';
import { toast } from 'sonner';

const CreditsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedCredit, setSelectedCredit] = useState<any | null>(null);

  const { data, isLoading, error, refresh } = useCreditsSWR(filters);
  const createCredit = useCreateCredit();
  const updateCredit = useUpdateCredit();
  const deleteCredit = useDeleteCredit();

  const formatCurrency = (amount: string | number) => {
    const num = parseFloat(String(amount));
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(num);
  };

  const columns: Column<any>[] = [
    {
      key: 'student',
      label: 'Student',
      render: (credit) => credit.student_name || `Student #${credit.student}`,
      sortable: true,
    },
    {
      key: 'transaction_type',
      label: 'Type',
      render: (credit) => (
        <Badge
          variant={
            credit.transaction_type === 'credit'
              ? 'default'
              : credit.transaction_type === 'debit'
              ? 'destructive'
              : 'secondary'
          }
          className="capitalize"
        >
          {credit.transaction_type}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (credit) => (
        <span
          className={
            credit.transaction_type === 'credit'
              ? 'text-green-600 font-semibold'
              : 'text-red-600 font-semibold'
          }
        >
          {credit.transaction_type === 'credit' ? '+' : '-'}
          {formatCurrency(credit.amount)}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'balance_after',
      label: 'Balance After',
      render: (credit) => (
        <span className="font-semibold">{formatCurrency(credit.balance_after)}</span>
      ),
      sortable: true,
    },
    {
      key: 'date',
      label: 'Date',
      render: (credit) => new Date(credit.date).toLocaleDateString('en-IN'),
      sortable: true,
    },
    {
      key: 'is_active',
      label: 'Active',
      render: (credit) => (
        <Badge variant={credit.is_active ? 'default' : 'secondary'}>
          {credit.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'student',
      label: 'Student ID',
      type: 'text',
    },
    {
      name: 'transaction_type',
      label: 'Transaction Type',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'credit', label: 'Credit' },
        { value: 'debit', label: 'Debit' },
        { value: 'refund', label: 'Refund' },
        { value: 'purchase', label: 'Purchase' },
        { value: 'adjustment', label: 'Adjustment' },
      ],
    },
    {
      name: 'is_active',
      label: 'Active',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  const handleAddNew = () => {
    setSelectedCredit(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (credit: any) => {
    setSelectedCredit(credit);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (sidebarMode === 'create') {
        await createCredit.mutateAsync(data);
        toast.success('Credit created successfully');
      } else if (sidebarMode === 'edit' && selectedCredit) {
        await updateCredit.mutateAsync({ id: selectedCredit.id, data });
        toast.success('Credit updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedCredit(null);
      refresh();
    } catch (err: any) {
      console.error('Form submission error:', err);
      toast.error(err?.message || 'An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!selectedCredit) return;

    if (confirm('Are you sure you want to delete this credit transaction?')) {
      try {
        await deleteCredit.mutateAsync(selectedCredit.id);
        toast.success('Credit deleted successfully');
        setIsSidebarOpen(false);
        setSelectedCredit(null);
        refresh();
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete credit');
      }
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedCredit(null);
  };

  return (
    <div className="">
      <DataTable
        title="Store Credits"
        description="View and manage student store credits"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={refresh}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search credits..."
        addButtonLabel="Add Credit"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={
          sidebarMode === 'create'
            ? 'Create Credit'
            : `Credit #${selectedCredit?.id}` || 'Credit'
        }
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedCredit ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Student</h3>
              <p className="mt-1 text-lg font-semibold">
                {selectedCredit.student_name || `Student #${selectedCredit.student}`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Transaction Type
                </h3>
                <p className="mt-1">
                  <Badge
                    variant={
                      selectedCredit.transaction_type === 'credit'
                        ? 'default'
                        : selectedCredit.transaction_type === 'debit'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className="capitalize"
                  >
                    {selectedCredit.transaction_type}
                  </Badge>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                <p className="mt-1">
                  {new Date(selectedCredit.date).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                <p
                  className={`mt-1 text-xl font-bold ${
                    selectedCredit.transaction_type === 'credit'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {selectedCredit.transaction_type === 'credit' ? '+' : '-'}
                  {formatCurrency(selectedCredit.amount)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Balance After
                </h3>
                <p className="mt-1 text-xl font-bold text-primary">
                  {formatCurrency(selectedCredit.balance_after)}
                </p>
              </div>
            </div>
            {selectedCredit.reason && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Reason</h3>
                <p className="mt-1 text-sm">{selectedCredit.reason}</p>
              </div>
            )}
            {selectedCredit.reference_type && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Reference Type
                  </h3>
                  <p className="mt-1">{selectedCredit.reference_type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Reference ID
                  </h3>
                  <p className="mt-1">{selectedCredit.reference_id}</p>
                </div>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Active</h3>
              <p className="mt-1">
                <Badge variant={selectedCredit.is_active ? 'default' : 'secondary'}>
                  {selectedCredit.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">
                Edit
              </Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <CreditForm
            credit={sidebarMode === 'edit' ? selectedCredit : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>
    </div>
  );
};

export default CreditsPage;
