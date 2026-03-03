/**
 * Fee Collections Page
 * Enhanced with success celebration, "Collect Another Similar" flow,
 * and SuccessAnimation component
 */

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { SuccessAnimation } from '../../components/ui/success-animation';
import { invalidateFeeCollections, useFeeCollectionsSWR } from '../../hooks/swr';
import { useCreateFeeCollection, useDeleteFeeCollection, useUpdateFeeCollection } from '../../hooks/useFees';
import type { FeeCollection, FeeCollectionCreateInput } from '../../types/fees.types';
import { FeeCollectionForm } from './forms';

const FeeCollectionsPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any | null>(null);

  // Success celebration state
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastCollectionData, setLastCollectionData] = useState<Partial<FeeCollectionCreateInput> | null>(null);
  const [lastCollectionInfo, setLastCollectionInfo] = useState({ studentName: '', amount: '' });

  // "Collect Another Similar" prefill state
  const [prefillData, setPrefillData] = useState<Partial<FeeCollectionCreateInput> | null>(null);

  // Fetch fee collections using SWR
  const { data, isLoading, error } = useFeeCollectionsSWR(filters);
  const createFeeCollection = useCreateFeeCollection();
  const updateFeeCollection = useUpdateFeeCollection();
  const deleteFeeCollection = useDeleteFeeCollection();

  const stats = useMemo(() => {
    const items = data?.results || [];
    const totalAmount = items.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const completed = items.filter((c) => c.status === 'completed').length;
    const pending = items.filter((c) => c.status === 'pending').length;
    return { totalAmount, completed, pending, count: items.length };
  }, [data]);

  const columns: Column<any>[] = useMemo(() => [
    { key: 'student_name', label: 'Student Name', sortable: false },
    { key: 'payment_date', label: 'Payment Date', sortable: true },
    {
      key: 'amount',
      label: 'Amount',
      render: (collection) => <span className="font-semibold">{'\u20B9'}{parseFloat(collection.amount).toLocaleString()}</span>,
      sortable: true,
    },
    {
      key: 'payment_method',
      label: 'Payment Method',
      render: (collection) => (
        <Badge variant="secondary">
          {collection.payment_method.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (collection) => (
        <Badge variant={collection.status === 'completed' ? 'success' : collection.status === 'pending' ? 'secondary' : 'destructive'}>
          {collection.status.replace(/\b\w/g, (l: string) => l.toUpperCase())}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      label: 'Active',
      render: (collection) => (
        <Badge variant={collection.is_active ? 'success' : 'destructive'}>
          {collection.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ], []);

  const filterConfig: FilterConfig[] = [
    {
      name: 'payment_method',
      label: 'Payment Method',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'cash', label: 'Cash' },
        { value: 'card', label: 'Card' },
        { value: 'upi', label: 'UPI' },
        { value: 'net_banking', label: 'Net Banking' },
        { value: 'cheque', label: 'Cheque' },
        { value: 'demand_draft', label: 'Demand Draft' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
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
    setSelectedCollection(null);
    setPrefillData(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (collection: FeeCollection) => {
    setSelectedCollection(collection);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (formData: Partial<FeeCollectionCreateInput>) => {
    try {
      if (sidebarMode === 'create') {
        await createFeeCollection.mutateAsync(formData);

        // Close sidebar and show success celebration
        setIsSidebarOpen(false);
        setSelectedCollection(null);

        // Store last collection data for "Collect Another Similar"
        setLastCollectionData(formData);

        // Extract info for the success card
        const amount = parseFloat(formData.amount || '0').toLocaleString('en-IN');
        setLastCollectionInfo({
          studentName: '', // Will show from the payment details
          amount: `\u20B9${amount}`,
        });

        // Show success celebration
        setShowSuccess(true);
      } else if (sidebarMode === 'edit' && selectedCollection) {
        await updateFeeCollection.mutateAsync({ id: selectedCollection.id, data: formData });
        toast.success('Fee collection updated successfully');
        setIsSidebarOpen(false);
        setSelectedCollection(null);
      }
      await invalidateFeeCollections();
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred');
    }
  };

  const handleCollectAnother = () => {
    setShowSuccess(false);

    // Pre-fill from last collection: keep date, method, amount — clear student
    if (lastCollectionData) {
      setPrefillData({
        amount: lastCollectionData.amount,
        payment_method: lastCollectionData.payment_method,
        payment_date: lastCollectionData.payment_date,
      });
    }

    setSelectedCollection(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handlePrintReceipt = () => {
    setShowSuccess(false);
    toast.info('Receipt printing will be available in a future update.');
  };

  const handleDelete = () => {
    if (!selectedCollection) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCollection) return;
    try {
      await deleteFeeCollection.mutateAsync(selectedCollection.id);
      toast.success('Fee collection deleted successfully');
      setIsSidebarOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedCollection(null);
      await invalidateFeeCollections();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete fee collection');
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    // Do not clear selectedCollection here to avoid content flash during close animation  
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Collected', value: stats.totalAmount, prefix: '\u20B9', accent: 'bg-green-500/15 text-green-700' },
          { label: 'Collections', value: stats.count, accent: 'bg-blue-500/15 text-blue-700' },
          { label: 'Completed', value: stats.completed, accent: 'bg-emerald-500/15 text-emerald-700' },
          { label: 'Pending', value: stats.pending, accent: 'bg-amber-500/15 text-amber-700' },
        ].map((s, idx) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-bold">
              {s.prefix || ''}{' '}
              {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
            </p>
            <div className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${s.accent}`}>
              Live
            </div>
          </motion.div>
        ))}
      </div>

      <DataTable
        title="Fee Collections"
        description="View and manage fee collections"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeCollections()}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search collections..."
        addButtonLabel="Collect Fee"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Collect Fee' : `Fee Collection #${selectedCollection?.id || ''}`}
        mode={sidebarMode}
        width="lg"
      >
        {sidebarMode === 'view' && selectedCollection ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Student Name</h3>
                <p className="mt-1 text-lg font-semibold">{selectedCollection.student_name || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payment Date</h3>
                <p className="mt-1">{selectedCollection.payment_date}</p>
              </div>
            </div>
            <div className="p-3 bg-primary/10 rounded">
              <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
              <p className="mt-1 text-2xl font-bold">{'\u20B9'}{parseFloat(selectedCollection.amount).toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                <p className="mt-1">
                  <Badge variant="secondary">
                    {selectedCollection.payment_method.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </Badge>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p className="mt-1">
                  <Badge variant={selectedCollection.status === 'completed' ? 'success' : selectedCollection.status === 'pending' ? 'secondary' : 'destructive'}>
                    {selectedCollection.status.replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </Badge>
                </p>
              </div>
            </div>
            {selectedCollection.transaction_id && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Transaction ID</h3>
                <p className="mt-1">{selectedCollection.transaction_id}</p>
              </div>
            )}
            {selectedCollection.collected_by && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Collected By</h3>
                <p className="mt-1">{selectedCollection.collected_by_name || selectedCollection.collected_by}</p>
              </div>
            )}
            {selectedCollection.remarks && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Remarks</h3>
                <p className="mt-1">{selectedCollection.remarks}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Active Status</h3>
              <p className="mt-1">
                <Badge variant={selectedCollection.is_active ? 'success' : 'destructive'}>
                  {selectedCollection.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            {selectedCollection.is_active && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEdit} className="flex-1">Edit</Button>
                <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
              </div>
            )}
          </div>
        ) : (sidebarMode === 'create' || sidebarMode === 'edit') ? (
          <FeeCollectionForm
            feeCollection={sidebarMode === 'edit' ? selectedCollection : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
            prefillData={sidebarMode === 'create' ? prefillData : null}
          />
        ) : null}
      </DetailSidebar>

      {/* Success Celebration Animation */}
      <SuccessAnimation
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Payment Collected!"
        subtitle={`${lastCollectionInfo.amount} collected successfully`}
        onPrintReceipt={handlePrintReceipt}
        onCollectAnother={handleCollectAnother}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Fee Collection"
        description="Are you sure you want to delete this fee collection? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteFeeCollection.isPending}
      />
    </div>
  );
};

export default FeeCollectionsPage;
