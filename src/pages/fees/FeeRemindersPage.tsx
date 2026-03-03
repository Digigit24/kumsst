/**
 * Fee Reminders Page
 */

import { useState } from 'react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useCreateFeeReminder, useUpdateFeeReminder, useDeleteFeeReminder } from '../../hooks/useFees';
import { useFeeRemindersSWR, invalidateFeeReminders } from '../../hooks/swr';
import type { FeeReminder, FeeReminderCreateInput } from '../../types/fees.types';
import { FeeReminderForm } from './forms/FeeReminderForm';
import { toast } from 'sonner';

const FeeRemindersPage = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<FeeReminder | null>(null);

  const { data, isLoading, error } = useFeeRemindersSWR(filters);
  const createFeeReminder = useCreateFeeReminder();
  const updateFeeReminder = useUpdateFeeReminder();
  const deleteFeeReminder = useDeleteFeeReminder();

  const columns: Column<FeeReminder>[] = [
    { key: 'student_name', label: 'Student', sortable: false },
    { key: 'fee_structure_name', label: 'Fee Structure', sortable: false },
    { key: 'reminder_date', label: 'Reminder Date', sortable: true },
    { key: 'reminder_type', label: 'Type', sortable: false },
    {
      key: 'status',
      label: 'Status',
      render: (reminder) => (
        <Badge
          variant={
            reminder.status === 'sent' ? 'success' :
              reminder.status === 'failed' ? 'destructive' :
                'warning'
          }
        >
          {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
        </Badge>
      ),
    },
    { key: 'sent_at', label: 'Sent At', sortable: false },
    {
      key: 'is_active',
      label: 'Active',
      render: (reminder) => (
        <Badge variant={reminder.is_active ? 'success' : 'destructive'}>
          {reminder.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'sent', label: 'Sent' },
        { value: 'failed', label: 'Failed' },
      ],
    },
    {
      name: 'is_active',
      label: 'Active Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  const handleAddNew = () => {
    setSelectedReminder(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (reminder: FeeReminder) => {
    setSelectedReminder(reminder);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode('edit');
  };

  const handleFormSubmit = async (data: Partial<FeeReminderCreateInput>) => {
    try {
      if (sidebarMode === 'create') {
        await createFeeReminder.mutateAsync(data);
        toast.success('Fee reminder created successfully');
      } else if (sidebarMode === 'edit' && selectedReminder) {
        await updateFeeReminder.mutateAsync({ id: selectedReminder.id, data });
        toast.success('Fee reminder updated successfully');
      }
      setIsSidebarOpen(false);
      setSelectedReminder(null);
      await invalidateFeeReminders();
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred');
      console.error('Form submission error:', err);
    }
  };

  const handleDelete = () => {
    if (!selectedReminder) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedReminder) return;
    try {
      await deleteFeeReminder.mutateAsync(selectedReminder.id);
      toast.success('Fee reminder deleted successfully');
      setIsSidebarOpen(false);
      setIsDeleteDialogOpen(false);
      setSelectedReminder(null);
      await invalidateFeeReminders();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete fee reminder');
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedReminder(null);
  };

  return (
    <div className="">
      <DataTable
        title="Fee Reminders"
        description="View and manage fee reminders"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeReminders()}
        onAdd={handleAddNew}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search fee reminders..."
        addButtonLabel="Add Fee Reminder"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Create Fee Reminder' : 'Fee Reminder Details'}
        mode={sidebarMode}
      >
        {sidebarMode === 'view' && selectedReminder ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Student</h3>
              <p className="mt-1 text-lg font-semibold">{selectedReminder.student_name || `ID: ${selectedReminder.student}`}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fee Structure</h3>
              <p className="mt-1 text-lg">{selectedReminder.fee_structure_name || `ID: ${selectedReminder.fee_structure}`}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Reminder Date</h3>
                <p className="mt-1 text-lg">{selectedReminder.reminder_date}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Reminder Type</h3>
                <p className="mt-1 text-lg">{selectedReminder.reminder_type}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p className="mt-1">
                  <Badge
                    variant={
                      selectedReminder.status === 'sent' ? 'success' :
                        selectedReminder.status === 'failed' ? 'destructive' :
                          'warning'
                    }
                  >
                    {selectedReminder.status.charAt(0).toUpperCase() + selectedReminder.status.slice(1)}
                  </Badge>
                </p>
              </div>
              {selectedReminder.sent_at && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Sent At</h3>
                  <p className="mt-1 text-sm">{new Date(selectedReminder.sent_at).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Message</h3>
              <p className="mt-1 text-sm bg-gray-50 p-3 rounded-md">{selectedReminder.message}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Active Status</h3>
              <p className="mt-1">
                <Badge variant={selectedReminder.is_active ? 'success' : 'destructive'}>
                  {selectedReminder.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeReminderForm
            feeReminder={sidebarMode === 'edit' ? selectedReminder : null}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseSidebar}
          />
        )}
      </DetailSidebar>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Fee Reminder"
        description="Are you sure you want to delete this fee reminder? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteFeeReminder.isPending}
      />
    </div>
  );
};

export default FeeRemindersPage;
