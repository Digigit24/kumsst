/**
 * Consolidated Fee Reports Page
 * Combines: Fee Receipts, Fee Reminders
 */

import { motion } from 'framer-motion';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Bell, Clock, FileText, Receipt, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Hooks
import {
  useCreateFeeReceipt,
  useCreateFeeReminder,
  useDeleteFeeReceipt,
  useDeleteFeeReminder,
  useUpdateFeeReceipt,
  useUpdateFeeReminder,
} from '../../hooks/useFees';
import {
  invalidateFeeReceipts,
  invalidateFeeReminders,
  useFeeReceiptsSWR,
  useFeeRemindersSWR,
} from '../../hooks/swr';

// Forms
import { FeeReceiptForm, FeeReminderForm } from './forms';

// Receipt amount visual
const ReceiptAmount = ({ amount }: { amount: number }) => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 rounded-full bg-green-500" />
    <span className="font-bold text-green-600">₹{amount.toLocaleString()}</span>
  </div>
);

// Status timeline indicator
const StatusTimeline = ({ status }: { status: string }) => {
  const stages = ['pending', 'sent', 'delivered'];
  const currentIndex = stages.indexOf(status.toLowerCase());

  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, idx) => (
        <div key={stage} className="flex items-center">
          <div className={`w - 2 h - 2 rounded - full ${idx <= currentIndex ? 'bg-green-500' : 'bg-muted'} `} />
          {idx < stages.length - 1 && <div className={`w - 4 h - 0.5 ${idx < currentIndex ? 'bg-green-500' : 'bg-muted'} `} />}
        </div>
      ))}
      <span className="ml-2 text-xs capitalize">{status}</span>
    </div>
  );
};

const FeeReportsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'receipts';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // Sync tab with URL
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  // Fetch data for stats
  const { data: receiptsData } = useFeeReceiptsSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: remindersData } = useFeeRemindersSWR({ page_size: DROPDOWN_PAGE_SIZE });

  const stats = useMemo(() => {
    const receipts = receiptsData?.results || [];
    const reminders = remindersData?.results || [];
    const totalReceiptAmount = receipts.reduce((sum: number, r: any) => sum + (parseFloat(r.amount) || 0), 0);
    const sentReminders = reminders.filter((r: any) => r.status === 'sent').length;
    const pendingReminders = reminders.filter((r: any) => r.status === 'pending').length;

    return {
      receiptsCount: receipts.length,
      totalReceiptAmount,
      remindersCount: reminders.length,
      sentReminders,
      pendingReminders
    };
  }, [receiptsData, remindersData]);

  const statCards = [
    { key: 'receipts', label: 'Total Receipts', value: stats.receiptsCount, icon: Receipt, color: 'bg-blue-500/10 text-blue-600', extra: `₹${stats.totalReceiptAmount.toLocaleString()} ` },
    { key: 'reminders', label: 'Reminders', value: stats.remindersCount, icon: Bell, color: 'bg-amber-500/10 text-amber-600' },
    { key: 'sent', label: 'Sent', value: stats.sentReminders, icon: Send, color: 'bg-green-500/10 text-green-600', clickable: false },
    { key: 'pending', label: 'Pending', value: stats.pendingReminders, icon: Clock, color: 'bg-purple-500/10 text-purple-600', clickable: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fee Reports</h1>
          <p className="text-muted-foreground">View receipts and manage reminders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => stat.clickable !== false && (stat.key === 'receipts' || stat.key === 'reminders') && handleTabChange(stat.key)}
            className={`relative overflow - hidden rounded - xl border p - 4 transition - all hover: shadow - md ${stat.clickable !== false && (stat.key === 'receipts' || stat.key === 'reminders') ? 'cursor-pointer' : ''} ${activeTab === stat.key ? 'ring-2 ring-primary shadow-md' : ''} `}
          >
            <div className="flex items-center gap-3">
              <div className={`p - 2 rounded - lg ${stat.color} `}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                {stat.extra && <p className="text-xs text-green-600 mt-0.5">{stat.extra}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="receipts" className="gap-2"><Receipt className="h-4 w-4" />Receipts</TabsTrigger>
          <TabsTrigger value="reminders" className="gap-2"><Bell className="h-4 w-4" />Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="receipts"><ReceiptsTab ReceiptAmount={ReceiptAmount} /></TabsContent>
        <TabsContent value="reminders"><RemindersTab StatusTimeline={StatusTimeline} /></TabsContent>
      </Tabs>
    </div>
  );
};

// ============== RECEIPTS TAB ==============
const ReceiptsTab = ({ ReceiptAmount }: { ReceiptAmount: any }) => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, isLoading, error } = useFeeReceiptsSWR(filters);
  const createMutation = useCreateFeeReceipt();
  const updateMutation = useUpdateFeeReceipt();
  const deleteMutation = useDeleteFeeReceipt();

  const columns: Column<any>[] = [
    { key: 'receipt_number', label: 'Receipt #', sortable: true, render: (item) => <span className="font-mono font-bold">{item.receipt_number}</span> },
    { key: 'student_name', label: 'Student', render: (item) => item.student_name || '-' },
    { key: 'payment_date', label: 'Date', sortable: true },
    { key: 'amount', label: 'Amount', render: (item) => <ReceiptAmount amount={parseFloat(item.amount || 0)} /> },
    { key: 'payment_method', label: 'Method', render: (item) => <Badge variant="outline" className="capitalize">{item.payment_method?.replace('_', ' ')}</Badge> },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'success' : 'destructive'}>{item.is_active ? 'Active' : 'Cancelled'}</Badge> },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'payment_method', label: 'Method', type: 'select', options: [
        { value: '', label: 'All' },
        { value: 'cash', label: 'Cash' },
        { value: 'card', label: 'Card' },
        { value: 'upi', label: 'UPI' },
        { value: 'net_banking', label: 'Net Banking' },
      ]
    },
    { name: 'is_active', label: 'Status', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Cancelled' }] },
  ];

  const handleAdd = () => { setSelectedItem(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleRowClick = (item: any) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');
  const handleClose = () => { setIsSidebarOpen(false); setSelectedItem(null); };

  const handleSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await createMutation.mutateAsync(formData);
        toast.success('Receipt created');
      } else {
        await updateMutation.mutateAsync({ id: selectedItem!.id, data: formData });
        toast.success('Receipt updated');
      }
      handleClose();
      await invalidateFeeReceipts();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  const handleDelete = () => setIsDeleteDialogOpen(true);
  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Receipt deleted');
      handleClose();
      setIsDeleteDialogOpen(false);
      await invalidateFeeReceipts();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  return (
    <>
      <DataTable
        title="Fee Receipts"
        description="View and manage payment receipts"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeReceipts()}
        onAdd={handleAdd}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search receipts..."
        addButtonLabel="Create Receipt"
      />
      <DetailSidebar isOpen={isSidebarOpen} onClose={handleClose} title={sidebarMode === 'create' ? 'Create Receipt' : `Receipt ${selectedItem?.receipt_number || ''} `} mode={sidebarMode} width="lg">
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-4">
            {/* Receipt Header */}
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg border border-dashed">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground">Receipt Number</p>
                  <p className="font-mono font-bold text-lg">{selectedItem.receipt_number}</p>
                </div>
                <Badge variant={selectedItem.is_active ? 'success' : 'destructive'}>{selectedItem.is_active ? 'Active' : 'Cancelled'}</Badge>
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold text-green-600">₹{parseFloat(selectedItem.amount || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Student</p><p className="font-semibold">{selectedItem.student_name || '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">Date</p><p>{selectedItem.payment_date}</p></div>
              <div><p className="text-sm text-muted-foreground">Payment Method</p><Badge variant="outline" className="capitalize">{selectedItem.payment_method?.replace('_', ' ')}</Badge></div>
              <div><p className="text-sm text-muted-foreground">Academic Year</p><p>{selectedItem.academic_year_name || '-'}</p></div>
            </div>

            {selectedItem.transaction_id && <div><p className="text-sm text-muted-foreground">Transaction ID</p><p className="font-mono">{selectedItem.transaction_id}</p></div>}
            {selectedItem.remarks && <div><p className="text-sm text-muted-foreground">Remarks</p><p>{selectedItem.remarks}</p></div>}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 gap-2"><FileText className="h-4 w-4" />Print</Button>
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeReceiptForm feeReceipt={sidebarMode === 'edit' ? selectedItem : null} onSubmit={handleSubmit} onCancel={handleClose} />
        )}
      </DetailSidebar>
      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Delete Receipt" description="Are you sure?" confirmLabel="Delete" onConfirm={confirmDelete} loading={deleteMutation.isPending} />
    </>
  );
};

// ============== REMINDERS TAB ==============
const RemindersTab = ({ StatusTimeline }: { StatusTimeline: any }) => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, isLoading, error } = useFeeRemindersSWR(filters);
  const createMutation = useCreateFeeReminder();
  const updateMutation = useUpdateFeeReminder();
  const deleteMutation = useDeleteFeeReminder();

  const columns: Column<any>[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'reminder_type', label: 'Type', render: (item) => <Badge variant="outline" className="capitalize">{item.reminder_type?.replace('_', ' ')}</Badge> },
    { key: 'send_date', label: 'Send Date', sortable: true },
    { key: 'status', label: 'Status', render: (item) => <StatusTimeline status={item.status || 'pending'} /> },
    { key: 'is_active', label: 'Active', render: (item) => <Badge variant={item.is_active ? 'success' : 'destructive'}>{item.is_active ? 'Yes' : 'No'}</Badge> },
  ];

  const filterConfig: FilterConfig[] = [
    {
      name: 'reminder_type', label: 'Type', type: 'select', options: [
        { value: '', label: 'All' },
        { value: 'email', label: 'Email' },
        { value: 'sms', label: 'SMS' },
        { value: 'push', label: 'Push Notification' },
      ]
    },
    {
      name: 'status', label: 'Status', type: 'select', options: [
        { value: '', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'sent', label: 'Sent' },
        { value: 'delivered', label: 'Delivered' },
      ]
    },
    { name: 'is_active', label: 'Active', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
  ];

  const handleAdd = () => { setSelectedItem(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleRowClick = (item: any) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');
  const handleClose = () => { setIsSidebarOpen(false); setSelectedItem(null); };

  const handleSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await createMutation.mutateAsync(formData);
        toast.success('Reminder created');
      } else {
        await updateMutation.mutateAsync({ id: selectedItem!.id, data: formData });
        toast.success('Reminder updated');
      }
      handleClose();
      await invalidateFeeReminders();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  const handleDelete = () => setIsDeleteDialogOpen(true);
  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Reminder deleted');
      handleClose();
      setIsDeleteDialogOpen(false);
      await invalidateFeeReminders();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  return (
    <>
      <DataTable
        title="Fee Reminders"
        description="Configure and send payment reminders"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeReminders()}
        onAdd={handleAdd}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search reminders..."
        addButtonLabel="Create Reminder"
      />
      <DetailSidebar isOpen={isSidebarOpen} onClose={handleClose} title={sidebarMode === 'create' ? 'Create Reminder' : selectedItem?.title || ''} mode={sidebarMode} width="lg">
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-4">
            <div><p className="text-sm text-muted-foreground">Title</p><p className="font-semibold text-lg">{selectedItem.title}</p></div>

            <div className="p-4 bg-amber-500/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Delivery Status</p>
              <StatusTimeline status={selectedItem.status || 'pending'} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Type</p><Badge variant="outline" className="capitalize">{selectedItem.reminder_type?.replace('_', ' ')}</Badge></div>
              <div><p className="text-sm text-muted-foreground">Send Date</p><p>{selectedItem.send_date}</p></div>
            </div>

            {selectedItem.message && (
              <div>
                <p className="text-sm text-muted-foreground">Message</p>
                <div className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedItem.message}</div>
              </div>
            )}

            <div><p className="text-sm text-muted-foreground">Active</p><Badge variant={selectedItem.is_active ? 'success' : 'destructive'}>{selectedItem.is_active ? 'Yes' : 'No'}</Badge></div>

            <div className="flex gap-2 pt-4">
              {selectedItem.status === 'pending' && (
                <Button variant="outline" className="flex-1 gap-2"><Send className="h-4 w-4" />Send Now</Button>
              )}
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeReminderForm feeReminder={sidebarMode === 'edit' ? selectedItem : null} onSubmit={handleSubmit} onCancel={handleClose} />
        )}
      </DetailSidebar>
      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Delete Reminder" description="Are you sure?" confirmLabel="Delete" onConfirm={confirmDelete} loading={deleteMutation.isPending} />
    </>
  );
};

export default FeeReportsPage;
