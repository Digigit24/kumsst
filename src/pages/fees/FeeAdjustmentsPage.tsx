/**
 * Consolidated Fee Adjustments Page
 * Combines: Fee Discounts, Student Fee Discounts, Fee Fines, Fee Refunds
 */

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { motion } from 'framer-motion';
import { Percent, UserCheck, AlertTriangle, RotateCcw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

// Hooks
import {
  useCreateFeeDiscount, useUpdateFeeDiscount, useDeleteFeeDiscount,
  useCreateStudentFeeDiscount, useUpdateStudentFeeDiscount, useDeleteStudentFeeDiscount,
  useCreateFeeFine, useUpdateFeeFine, useDeleteFeeFine,
  useCreateFeeRefund, useUpdateFeeRefund, useDeleteFeeRefund,
} from '../../hooks/useFees';
import {
  useFeeDiscountsSWR, useStudentFeeDiscountsSWR, useFeesFinesSWR, useFeeRefundsSWR,
  invalidateFeeDiscounts, invalidateStudentFeeDiscounts, invalidateFeeFines, invalidateFeeRefunds,
} from '../../hooks/swr';

// Forms
import { FeeDiscountForm, StudentFeeDiscountForm, FeeFineForm, FeeRefundForm } from './forms';

const FeeAdjustmentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'discounts';
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
  const { data: discountsData } = useFeeDiscountsSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: studentDiscountsData } = useStudentFeeDiscountsSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: finesData } = useFeesFinesSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: refundsData } = useFeeRefundsSWR({ page_size: DROPDOWN_PAGE_SIZE });

  const stats = useMemo(() => {
    const discounts = discountsData?.results?.length || 0;
    const studentDiscounts = studentDiscountsData?.results?.length || 0;
    const fines = finesData?.results?.length || 0;
    const refunds = refundsData?.results?.length || 0;
    const totalRefundAmount = refundsData?.results?.reduce((sum: number, r: any) => sum + (parseFloat(r.refund_amount) || 0), 0) || 0;

    return { discounts, studentDiscounts, fines, refunds, totalRefundAmount };
  }, [discountsData, studentDiscountsData, finesData, refundsData]);

  const statCards = [
    { key: 'discounts', label: 'Discount Rules', value: stats.discounts, icon: Percent, color: 'bg-green-500/10 text-green-600' },
    { key: 'student-discounts', label: 'Student Discounts', value: stats.studentDiscounts, icon: UserCheck, color: 'bg-blue-500/10 text-blue-600' },
    { key: 'fines', label: 'Fine Rules', value: stats.fines, icon: AlertTriangle, color: 'bg-amber-500/10 text-amber-600' },
    { key: 'refunds', label: 'Refunds', value: stats.refunds, icon: RotateCcw, color: 'bg-red-500/10 text-red-600', extra: `₹${stats.totalRefundAmount.toLocaleString()}` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fee Adjustments</h1>
          <p className="text-muted-foreground">Manage discounts, fines, and refunds</p>
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
            onClick={() => handleTabChange(stat.key)}
            className={`relative overflow-hidden rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${activeTab === stat.key ? 'ring-2 ring-primary shadow-md' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                {stat.extra && <p className="text-xs text-red-600 mt-0.5">{stat.extra} total</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="discounts" className="gap-2"><Percent className="h-4 w-4" />Discounts</TabsTrigger>
          <TabsTrigger value="student-discounts" className="gap-2"><UserCheck className="h-4 w-4" />Student Discounts</TabsTrigger>
          <TabsTrigger value="fines" className="gap-2"><AlertTriangle className="h-4 w-4" />Fines</TabsTrigger>
          <TabsTrigger value="refunds" className="gap-2"><RotateCcw className="h-4 w-4" />Refunds</TabsTrigger>
        </TabsList>

        <TabsContent value="discounts"><DiscountsTab /></TabsContent>
        <TabsContent value="student-discounts"><StudentDiscountsTab /></TabsContent>
        <TabsContent value="fines"><FinesTab /></TabsContent>
        <TabsContent value="refunds"><RefundsTab /></TabsContent>
      </Tabs>
    </div>
  );
};

// ============== DISCOUNTS TAB ==============
const DiscountsTab = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, isLoading, error } = useFeeDiscountsSWR(filters);
  const createMutation = useCreateFeeDiscount();
  const updateMutation = useUpdateFeeDiscount();
  const deleteMutation = useDeleteFeeDiscount();

  const columns: Column<any>[] = [
    { key: 'code', label: 'Code', sortable: true, render: (item) => <span className="font-mono">{item.code}</span> },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'discount_type', label: 'Type', render: (item) => <Badge variant="outline">{item.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}</Badge> },
    {
      key: 'discount_value',
      label: 'Value',
      render: (item) => (
        <span className="font-bold text-green-600">
          {item.discount_type === 'percentage'
            ? `${parseFloat(item.percentage || item.discount_value || 0)}%`
            : `₹${parseFloat(item.amount || item.discount_value || 0).toLocaleString()}`}
        </span>
      )
    },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'success' : 'destructive'}>{item.is_active ? 'Active' : 'Inactive'}</Badge> },
  ];

  const filterConfig: FilterConfig[] = [
    { name: 'discount_type', label: 'Type', type: 'select', options: [{ value: '', label: 'All' }, { value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed' }] },
    { name: 'is_active', label: 'Status', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] },
  ];

  const handleAdd = () => { setSelectedItem(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleRowClick = (item: any) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');
  const handleClose = () => { setIsSidebarOpen(false); setSelectedItem(null); };

  const handleSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await createMutation.mutateAsync(formData);
        toast.success('Discount created');
      } else {
        await updateMutation.mutateAsync({ id: selectedItem!.id, data: formData });
        toast.success('Discount updated');
      }
      handleClose();
      await invalidateFeeDiscounts();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  const handleDelete = () => setIsDeleteDialogOpen(true);
  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Discount deleted');
      handleClose();
      setIsDeleteDialogOpen(false);
      await invalidateFeeDiscounts();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  return (
    <>
      <DataTable title="Fee Discounts" description="System-wide discount rules" columns={columns} data={data} isLoading={isLoading} error={error?.message} onRefresh={invalidateFeeDiscounts} onAdd={handleAdd} onRowClick={handleRowClick} filters={filters} onFiltersChange={setFilters} filterConfig={filterConfig} searchPlaceholder="Search discounts..." addButtonLabel="Add Discount" />
      <DetailSidebar isOpen={isSidebarOpen} onClose={handleClose} title={sidebarMode === 'create' ? 'Create Discount' : selectedItem?.name || ''} mode={sidebarMode}>
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Discount Value</p>
              <p className="text-3xl font-bold text-green-600">{selectedItem.discount_type === 'percentage' ? `${selectedItem.discount_value}%` : `₹${parseFloat(selectedItem.discount_value).toLocaleString()}`}</p>
            </div>
            <div><p className="text-sm text-muted-foreground">Name</p><p className="font-semibold">{selectedItem.name}</p></div>
            <div><p className="text-sm text-muted-foreground">Code</p><p className="font-mono">{selectedItem.code}</p></div>
            <div><p className="text-sm text-muted-foreground">Type</p><Badge variant="outline">{selectedItem.discount_type}</Badge></div>
            {selectedItem.description && <div><p className="text-sm text-muted-foreground">Description</p><p>{selectedItem.description}</p></div>}
            <div><p className="text-sm text-muted-foreground">Status</p><Badge variant={selectedItem.is_active ? 'success' : 'destructive'}>{selectedItem.is_active ? 'Active' : 'Inactive'}</Badge></div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeDiscountForm feeDiscount={sidebarMode === 'edit' ? selectedItem : null} onSubmit={handleSubmit} onCancel={handleClose} />
        )}
      </DetailSidebar>
      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Delete Discount" description="Are you sure?" confirmLabel="Delete" onConfirm={confirmDelete} loading={deleteMutation.isPending} />
    </>
  );
};

// ============== STUDENT DISCOUNTS TAB ==============
const StudentDiscountsTab = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, isLoading, error } = useStudentFeeDiscountsSWR(filters);
  const createMutation = useCreateStudentFeeDiscount();
  const updateMutation = useUpdateStudentFeeDiscount();
  const deleteMutation = useDeleteStudentFeeDiscount();

  const columns: Column<any>[] = [
    { key: 'student_name', label: 'Student', sortable: true, render: (item) => item.student_name || '-' },
    { key: 'fee_discount_name', label: 'Discount', render: (item) => item.fee_discount_name || '-' },
    { key: 'academic_year_name', label: 'Academic Year', render: (item) => item.academic_year_name || '-' },
    {
      key: 'discount_amount', label: 'Amount', render: (item) => (
        <span className="font-bold text-green-600">₹{parseFloat(item.discount_amount || 0).toLocaleString()}</span>
      )
    },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'success' : 'destructive'}>{item.is_active ? 'Active' : 'Inactive'}</Badge> },
  ];

  const filterConfig: FilterConfig[] = [
    { name: 'is_active', label: 'Status', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] },
  ];

  const handleAdd = () => { setSelectedItem(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleRowClick = (item: any) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');
  const handleClose = () => { setIsSidebarOpen(false); setSelectedItem(null); };

  const handleSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await createMutation.mutateAsync(formData);
        toast.success('Student discount created');
      } else {
        await updateMutation.mutateAsync({ id: selectedItem!.id, data: formData });
        toast.success('Student discount updated');
      }
      handleClose();
      await invalidateStudentFeeDiscounts();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  const handleDelete = () => setIsDeleteDialogOpen(true);
  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Student discount deleted');
      handleClose();
      setIsDeleteDialogOpen(false);
      await invalidateStudentFeeDiscounts();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  return (
    <>
      <DataTable title="Student Fee Discounts" description="Individual student discounts" columns={columns} data={data} isLoading={isLoading} error={error?.message} onRefresh={invalidateStudentFeeDiscounts} onAdd={handleAdd} onRowClick={handleRowClick} filters={filters} onFiltersChange={setFilters} filterConfig={filterConfig} searchPlaceholder="Search student discounts..." addButtonLabel="Add Student Discount" />
      <DetailSidebar isOpen={isSidebarOpen} onClose={handleClose} title={sidebarMode === 'create' ? 'Create Student Discount' : 'Student Discount'} mode={sidebarMode} width="lg">
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Discount Amount</p>
              <p className="text-3xl font-bold text-green-600">₹{parseFloat(selectedItem.discount_amount || 0).toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Student</p><p className="font-semibold">{selectedItem.student_name || '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">Discount Rule</p><p>{selectedItem.fee_discount_name || '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">Academic Year</p><p>{selectedItem.academic_year_name || '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">Status</p><Badge variant={selectedItem.is_active ? 'success' : 'destructive'}>{selectedItem.is_active ? 'Active' : 'Inactive'}</Badge></div>
            </div>
            {selectedItem.remarks && <div><p className="text-sm text-muted-foreground">Remarks</p><p>{selectedItem.remarks}</p></div>}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <StudentFeeDiscountForm studentFeeDiscount={sidebarMode === 'edit' ? selectedItem : null} onSubmit={handleSubmit} onCancel={handleClose} />
        )}
      </DetailSidebar>
      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Delete Student Discount" description="Are you sure?" confirmLabel="Delete" onConfirm={confirmDelete} loading={deleteMutation.isPending} />
    </>
  );
};

// ============== FINES TAB ==============
const FinesTab = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, isLoading, error } = useFeesFinesSWR(filters);
  const createMutation = useCreateFeeFine();
  const updateMutation = useUpdateFeeFine();
  const deleteMutation = useDeleteFeeFine();

  const columns: Column<any>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'fine_type', label: 'Type', render: (item) => <Badge variant="outline">{item.fine_type === 'percentage' ? 'Percentage' : 'Fixed'}</Badge> },
    {
      key: 'fine_value', label: 'Value', render: (item) => (
        <span className="font-bold text-amber-600">{item.fine_type === 'percentage' ? `${item.fine_value}%` : `₹${parseFloat(item.fine_value).toLocaleString()}`}</span>
      )
    },
    { key: 'grace_period_days', label: 'Grace Period', render: (item) => <span>{item.grace_period_days || 0} days</span> },
    { key: 'is_active', label: 'Status', render: (item) => <Badge variant={item.is_active ? 'success' : 'destructive'}>{item.is_active ? 'Active' : 'Inactive'}</Badge> },
  ];

  const filterConfig: FilterConfig[] = [
    { name: 'fine_type', label: 'Type', type: 'select', options: [{ value: '', label: 'All' }, { value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed' }] },
    { name: 'is_active', label: 'Status', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] },
  ];

  const handleAdd = () => { setSelectedItem(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleRowClick = (item: any) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');
  const handleClose = () => { setIsSidebarOpen(false); setSelectedItem(null); };

  const handleSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await createMutation.mutateAsync(formData);
        toast.success('Fine created');
      } else {
        await updateMutation.mutateAsync({ id: selectedItem!.id, data: formData });
        toast.success('Fine updated');
      }
      handleClose();
      await invalidateFeeFines();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  const handleDelete = () => setIsDeleteDialogOpen(true);
  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Fine deleted');
      handleClose();
      setIsDeleteDialogOpen(false);
      await invalidateFeeFines();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  return (
    <>
      <DataTable title="Fee Fines" description="Late payment fine rules" columns={columns} data={data} isLoading={isLoading} error={error?.message} onRefresh={invalidateFeeFines} onAdd={handleAdd} onRowClick={handleRowClick} filters={filters} onFiltersChange={setFilters} filterConfig={filterConfig} searchPlaceholder="Search fines..." addButtonLabel="Add Fine" />
      <DetailSidebar isOpen={isSidebarOpen} onClose={handleClose} title={sidebarMode === 'create' ? 'Create Fine' : selectedItem?.name || ''} mode={sidebarMode}>
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-4">
            <div className="p-4 bg-amber-500/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Fine Value</p>
              <p className="text-3xl font-bold text-amber-600">{selectedItem.fine_type === 'percentage' ? `${selectedItem.fine_value}%` : `₹${parseFloat(selectedItem.fine_value).toLocaleString()}`}</p>
            </div>
            <div><p className="text-sm text-muted-foreground">Name</p><p className="font-semibold">{selectedItem.name}</p></div>
            <div><p className="text-sm text-muted-foreground">Type</p><Badge variant="outline">{selectedItem.fine_type}</Badge></div>
            <div><p className="text-sm text-muted-foreground">Grace Period</p><p>{selectedItem.grace_period_days || 0} days</p></div>
            {selectedItem.description && <div><p className="text-sm text-muted-foreground">Description</p><p>{selectedItem.description}</p></div>}
            <div><p className="text-sm text-muted-foreground">Status</p><Badge variant={selectedItem.is_active ? 'success' : 'destructive'}>{selectedItem.is_active ? 'Active' : 'Inactive'}</Badge></div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeFineForm feeFine={sidebarMode === 'edit' ? selectedItem : null} onSubmit={handleSubmit} onCancel={handleClose} />
        )}
      </DetailSidebar>
      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Delete Fine" description="Are you sure?" confirmLabel="Delete" onConfirm={confirmDelete} loading={deleteMutation.isPending} />
    </>
  );
};

// ============== REFUNDS TAB ==============
const RefundsTab = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, isLoading, error } = useFeeRefundsSWR(filters);
  const createMutation = useCreateFeeRefund();
  const updateMutation = useUpdateFeeRefund();
  const deleteMutation = useDeleteFeeRefund();

  const columns: Column<any>[] = [
    { key: 'student_name', label: 'Student', render: (item) => item.student_name || '-' },
    { key: 'refund_date', label: 'Date', sortable: true },
    {
      key: 'refund_amount', label: 'Amount', render: (item) => (
        <span className="font-bold text-red-600">₹{parseFloat(item.refund_amount || 0).toLocaleString()}</span>
      )
    },
    { key: 'refund_mode', label: 'Mode', render: (item) => <Badge variant="outline" className="capitalize">{item.refund_mode?.replace('_', ' ')}</Badge> },
    {
      key: 'status', label: 'Status', render: (item) => (
        <Badge variant={item.status === 'completed' ? 'success' : item.status === 'pending' ? 'secondary' : 'destructive'}>
          {item.status}
        </Badge>
      )
    },
  ];

  const filterConfig: FilterConfig[] = [
    { name: 'status', label: 'Status', type: 'select', options: [{ value: '', label: 'All' }, { value: 'completed', label: 'Completed' }, { value: 'pending', label: 'Pending' }, { value: 'rejected', label: 'Rejected' }] },
  ];

  const handleAdd = () => { setSelectedItem(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleRowClick = (item: any) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');
  const handleClose = () => { setIsSidebarOpen(false); setSelectedItem(null); };

  const handleSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await createMutation.mutateAsync(formData);
        toast.success('Refund created');
      } else {
        await updateMutation.mutateAsync({ id: selectedItem!.id, data: formData });
        toast.success('Refund updated');
      }
      handleClose();
      await invalidateFeeRefunds();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  const handleDelete = () => setIsDeleteDialogOpen(true);
  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Refund deleted');
      handleClose();
      setIsDeleteDialogOpen(false);
      await invalidateFeeRefunds();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  return (
    <>
      <DataTable title="Fee Refunds" description="Process and track refunds" columns={columns} data={data} isLoading={isLoading} error={error?.message} onRefresh={invalidateFeeRefunds} onAdd={handleAdd} onRowClick={handleRowClick} filters={filters} onFiltersChange={setFilters} filterConfig={filterConfig} searchPlaceholder="Search refunds..." addButtonLabel="Add Refund" />
      <DetailSidebar isOpen={isSidebarOpen} onClose={handleClose} title={sidebarMode === 'create' ? 'Create Refund' : 'Refund Details'} mode={sidebarMode} width="lg">
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Refund Amount</p>
              <p className="text-3xl font-bold text-red-600">₹{parseFloat(selectedItem.refund_amount || 0).toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Student</p><p className="font-semibold">{selectedItem.student_name || '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">Date</p><p>{selectedItem.refund_date}</p></div>
              <div><p className="text-sm text-muted-foreground">Mode</p><Badge variant="outline" className="capitalize">{selectedItem.refund_mode?.replace('_', ' ')}</Badge></div>
              <div><p className="text-sm text-muted-foreground">Status</p><Badge variant={selectedItem.status === 'completed' ? 'success' : 'secondary'}>{selectedItem.status}</Badge></div>
            </div>
            {selectedItem.reason && <div><p className="text-sm text-muted-foreground">Reason</p><p>{selectedItem.reason}</p></div>}
            {selectedItem.remarks && <div><p className="text-sm text-muted-foreground">Remarks</p><p>{selectedItem.remarks}</p></div>}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeRefundForm feeRefund={sidebarMode === 'edit' ? selectedItem : null} onSubmit={handleSubmit} onCancel={handleClose} />
        )}
      </DetailSidebar>
      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Delete Refund" description="Are you sure?" confirmLabel="Delete" onConfirm={confirmDelete} loading={deleteMutation.isPending} />
    </>
  );
};

export default FeeAdjustmentsPage;
