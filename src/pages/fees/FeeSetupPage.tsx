/**
 * Consolidated Fee Setup Page
 * Combines: Fee Types, Fee Groups, Fee Masters, Fee Structures, Fee Installments
 */

import { motion } from 'framer-motion';
import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { Calendar, FileText, IndianRupee, Layers, Settings } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Hooks
import {
  useCreateFeeGroup,
  useCreateFeeInstallment,
  useCreateFeeMaster,
  useCreateFeeStructure,
  useCreateFeeType,
  useDeleteFeeGroup,
  useDeleteFeeInstallment,
  useDeleteFeeMaster,
  useDeleteFeeStructure,
  useDeleteFeeType,
  useUpdateFeeGroup,
  useUpdateFeeInstallment,
  useUpdateFeeMaster,
  useUpdateFeeStructure,
  useUpdateFeeType,
} from '../../hooks/useFees';

import {
  invalidateFeeGroups,
  invalidateFeeInstallments,
  invalidateFeeMasters,
  invalidateFeeStructures,
  invalidateFeeTypes,
  useFeeGroupsSWR,
  useFeeInstallmentsSWR,
  useFeeMastersSWR,
  useFeeStructuresSWR,
  useFeeTypesSWR,
} from '../../hooks/swr';

// Forms
import { FeeGroupForm, FeeInstallmentForm, FeeMasterForm, FeeStructureForm, FeeTypeForm } from './forms';

// Types
import type { FeeGroup, FeeInstallment, FeeMaster, FeeStructure, FeeType } from '../../types/fees.types';

const FeeSetupPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'types';
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

  // Summary stats
  const { data: typesData } = useFeeTypesSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: groupsData } = useFeeGroupsSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: mastersData } = useFeeMastersSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: structuresData } = useFeeStructuresSWR({ page_size: DROPDOWN_PAGE_SIZE });
  const { data: installmentsData } = useFeeInstallmentsSWR({ page_size: DROPDOWN_PAGE_SIZE });

  const stats = useMemo(() => ({
    types: typesData?.results?.length || 0,
    groups: groupsData?.results?.length || 0,
    masters: mastersData?.results?.length || 0,
    structures: structuresData?.results?.length || 0,
    installments: installmentsData?.results?.length || 0,
  }), [typesData, groupsData, mastersData, structuresData, installmentsData]);

  const statCards = [
    { key: 'types', label: 'Fee Types', value: stats.types, icon: Settings, color: 'bg-blue-500/10 text-blue-600' },
    { key: 'groups', label: 'Fee Groups', value: stats.groups, icon: Layers, color: 'bg-purple-500/10 text-purple-600' },
    { key: 'masters', label: 'Fee Masters', value: stats.masters, icon: IndianRupee, color: 'bg-green-500/10 text-green-600' },
    { key: 'structures', label: 'Structures', value: stats.structures, icon: FileText, color: 'bg-amber-500/10 text-amber-600' },
    { key: 'installments', label: 'Installments', value: stats.installments, icon: Calendar, color: 'bg-rose-500/10 text-rose-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fee Setup</h1>
          <p className="text-muted-foreground">Configure fee types, groups, masters, structures and installments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              </div>
            </div>
            {activeTab === stat.key && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="types" className="gap-2"><Settings className="h-4 w-4" />Fee Types</TabsTrigger>
          <TabsTrigger value="groups" className="gap-2"><Layers className="h-4 w-4" />Fee Groups</TabsTrigger>
          <TabsTrigger value="masters" className="gap-2"><IndianRupee className="h-4 w-4" />Fee Masters</TabsTrigger>
          <TabsTrigger value="structures" className="gap-2"><FileText className="h-4 w-4" />Structures</TabsTrigger>
          <TabsTrigger value="installments" className="gap-2"><Calendar className="h-4 w-4" />Installments</TabsTrigger>
        </TabsList>

        <TabsContent value="types"><FeeTypesTab /></TabsContent>
        <TabsContent value="groups"><FeeGroupsTab /></TabsContent>
        <TabsContent value="masters"><FeeMastersTab /></TabsContent>
        <TabsContent value="structures"><FeeStructuresTab /></TabsContent>
        <TabsContent value="installments"><FeeInstallmentsTab /></TabsContent>
      </Tabs>
    </div>
  );
};

// ============== FEE TYPES TAB ==============
const FeeTypesTab = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedItem, setSelectedItem] = useState<FeeType | null>(null);

  const { data, isLoading, error } = useFeeTypesSWR(filters);
  const createMutation = useCreateFeeType();
  const updateMutation = useUpdateFeeType();
  const deleteMutation = useDeleteFeeType();
  const { data: groupsData } = useFeeGroupsSWR({ page_size: DROPDOWN_PAGE_SIZE });

  const groupMap = useMemo(() => {
    if (!groupsData?.results) return {};
    return groupsData.results.reduce((acc, g) => ({ ...acc, [g.id]: g.name }), {} as Record<number, string>);
  }, [groupsData]);

  const columns: Column<FeeType>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    {
      key: 'fee_group_name',
      label: 'Group',
      render: (item) => (
        <Badge variant="outline">{item.fee_group_name || groupMap[item.fee_group] || '-'}</Badge>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (item) => (
        <Badge variant={item.is_active ? 'success' : 'destructive'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    { name: 'is_active', label: 'Status', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] },
  ];

  const handleAdd = () => { setSelectedItem(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleRowClick = (item: FeeType) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');
  const handleClose = () => { setIsSidebarOpen(false); };

  const handleSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await createMutation.mutateAsync(formData);
        toast.success('Fee type created');
      } else {
        await updateMutation.mutateAsync({ id: selectedItem!.id, data: formData });
        toast.success('Fee type updated');
      }
      handleClose();
      await invalidateFeeTypes();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || !confirm('Delete this fee type?')) return;
    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Fee type deleted');
      handleClose();
      await invalidateFeeTypes();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  return (
    <>
      <DataTable
        title="Fee Types"
        description="Define different types of fees"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeTypes()}
        onAdd={handleAdd}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search fee types..."
        addButtonLabel="Add Fee Type"
      />
      <DetailSidebar isOpen={isSidebarOpen} onClose={handleClose} title={sidebarMode === 'create' ? 'Create Fee Type' : selectedItem?.name || ''} mode={sidebarMode}>
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-4">
            <div><p className="text-sm text-muted-foreground">Name</p><p className="font-semibold">{selectedItem.name}</p></div>
            <div><p className="text-sm text-muted-foreground">Code</p><p>{selectedItem.code}</p></div>
            <div><p className="text-sm text-muted-foreground">Group</p><p>{selectedItem.fee_group_name || groupMap[selectedItem.fee_group] || '-'}</p></div>
            <div><p className="text-sm text-muted-foreground">Status</p><Badge variant={selectedItem.is_active ? 'success' : 'destructive'}>{selectedItem.is_active ? 'Active' : 'Inactive'}</Badge></div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeTypeForm feeType={sidebarMode === 'edit' ? selectedItem : null} onSubmit={handleSubmit} onCancel={handleClose} />
        )}
      </DetailSidebar>
    </>
  );
};

// ============== FEE GROUPS TAB ==============
const FeeGroupsTab = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedItem, setSelectedItem] = useState<FeeGroup | null>(null);

  const { data, isLoading, error } = useFeeGroupsSWR(filters);
  const createMutation = useCreateFeeGroup();
  const updateMutation = useUpdateFeeGroup();
  const deleteMutation = useDeleteFeeGroup();

  const columns: Column<FeeGroup>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    { key: 'description', label: 'Description', render: (item) => item.description || '-' },

    {
      key: 'is_active',
      label: 'Status',
      render: (item) => <Badge variant={item.is_active ? 'success' : 'destructive'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
  ];

  const filterConfig: FilterConfig[] = [
    { name: 'is_active', label: 'Status', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] },
  ];

  const handleAdd = () => { setSelectedItem(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleRowClick = (item: FeeGroup) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');
  const handleClose = () => { setIsSidebarOpen(false); };

  const handleSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await createMutation.mutateAsync(formData);
        toast.success('Fee group created');
      } else {
        await updateMutation.mutateAsync({ id: selectedItem!.id, data: formData });
        toast.success('Fee group updated');
      }
      handleClose();
      await invalidateFeeGroups();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || !confirm('Delete this fee group?')) return;
    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Fee group deleted');
      handleClose();
      await invalidateFeeGroups();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  return (
    <>
      <DataTable
        title="Fee Groups"
        description="Group related fee types together"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeGroups()}
        onAdd={handleAdd}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search fee groups..."
        addButtonLabel="Add Fee Group"
      />
      <DetailSidebar isOpen={isSidebarOpen} onClose={handleClose} title={sidebarMode === 'create' ? 'Create Fee Group' : selectedItem?.name || ''} mode={sidebarMode}>
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-4">
            <div><p className="text-sm text-muted-foreground">Name</p><p className="font-semibold">{selectedItem.name}</p></div>
            <div><p className="text-sm text-muted-foreground">Code</p><p>{selectedItem.code}</p></div>
            <div><p className="text-sm text-muted-foreground">Description</p><p>{selectedItem.description || '-'}</p></div>
            <div><p className="text-sm text-muted-foreground">Status</p><Badge variant={selectedItem.is_active ? 'success' : 'destructive'}>{selectedItem.is_active ? 'Active' : 'Inactive'}</Badge></div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeGroupForm feeGroup={sidebarMode === 'edit' ? selectedItem : null} onSubmit={handleSubmit} onCancel={handleClose} />
        )}
      </DetailSidebar>
    </>
  );
};

// ============== FEE MASTERS TAB ==============
const FeeMastersTab = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedItem, setSelectedItem] = useState<FeeMaster | null>(null);

  const { data, isLoading, error } = useFeeMastersSWR(filters);
  const createMutation = useCreateFeeMaster();
  const updateMutation = useUpdateFeeMaster();
  const deleteMutation = useDeleteFeeMaster();

  const columns: Column<FeeMaster>[] = [
    { key: 'fee_type_name', label: 'Fee Type', sortable: true, render: (item) => item.fee_type_name || '-' },
    { key: 'program_name', label: 'Program', render: (item) => item.program_name || '-' },
    { key: 'semester_name', label: 'Semester', render: (item) => item.semester_name || '-' },
    {
      key: 'amount',
      label: 'Amount',
      render: (item) => <span className="font-bold text-green-600">₹{parseFloat(item.amount as any).toLocaleString()}</span>
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (item) => <Badge variant={item.is_active ? 'success' : 'destructive'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
  ];

  const filterConfig: FilterConfig[] = [
    { name: 'is_active', label: 'Status', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] },
  ];

  const handleAdd = () => { setSelectedItem(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleRowClick = (item: FeeMaster) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');
  const handleClose = () => { setIsSidebarOpen(false); };

  const handleSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await createMutation.mutateAsync(formData);
        toast.success('Fee master created');
      } else {
        await updateMutation.mutateAsync({ id: selectedItem!.id, data: formData });
        toast.success('Fee master updated');
      }
      handleClose();
      await invalidateFeeMasters();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || !confirm('Delete this fee master?')) return;
    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Fee master deleted');
      handleClose();
      await invalidateFeeMasters();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  return (
    <>
      <DataTable
        title="Fee Masters"
        description="Define fee amounts for programs and semesters"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeMasters()}
        onAdd={handleAdd}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search fee masters..."
        addButtonLabel="Add Fee Master"
      />
      <DetailSidebar isOpen={isSidebarOpen} onClose={handleClose} title={sidebarMode === 'create' ? 'Create Fee Master' : 'Fee Master Details'} mode={sidebarMode} width="lg">
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-3xl font-bold text-green-600">₹{parseFloat(selectedItem.amount as any).toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Fee Type</p><p className="font-medium">{selectedItem.fee_type_name || '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">Program</p><p className="font-medium">{selectedItem.program_name || '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">Semester</p><p className="font-medium">{selectedItem.semester_name || '-'}</p></div>
              <div><p className="text-sm text-muted-foreground">Status</p><Badge variant={selectedItem.is_active ? 'success' : 'destructive'}>{selectedItem.is_active ? 'Active' : 'Inactive'}</Badge></div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeMasterForm feeMaster={sidebarMode === 'edit' ? selectedItem : null} onSubmit={handleSubmit} onCancel={handleClose} />
        )}
      </DetailSidebar>
    </>
  );
};

// ============== FEE STRUCTURES TAB ==============
const FeeStructuresTab = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedItem, setSelectedItem] = useState<FeeStructure | null>(null);

  const { data, isLoading, error } = useFeeStructuresSWR(filters);
  const createMutation = useCreateFeeStructure();
  const updateMutation = useUpdateFeeStructure();
  const deleteMutation = useDeleteFeeStructure();

  const columns: Column<FeeStructure>[] = [
    {
      key: 'student_name',
      label: 'Student',
      render: (item) => item.student_details?.student_name || item.student_name || '-'
    },
    {
      key: 'program_name',
      label: 'Program',
      render: (item) => item.fee_master_details ? `${item.fee_master_details.program_name} (Sem ${item.fee_master_details.semester})` : '-'
    },
    {
      key: 'fee_type',
      label: 'Fee Type',
      render: (item) => item.fee_master_details?.fee_type_name || '-'
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (item) => <span className="font-semibold">₹{parseFloat(item.amount).toLocaleString()}</span>
    },
    {
      key: 'paid_amount',
      label: 'Paid',
      render: (item) => <span className="text-green-600">₹{parseFloat(item.paid_amount).toLocaleString()}</span>
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (item) => <span className="text-red-500 font-medium">₹{parseFloat(item.balance).toLocaleString()}</span>
    },
    {
      key: 'is_paid',
      label: 'Status',
      render: (item) => (
        <Badge variant={item.is_paid ? 'success' : item.is_active ? 'warning' : 'destructive'}>
          {item.is_paid ? 'Paid' : 'Unpaid'}
        </Badge>
      ),
    },
  ];

  const filterConfig: FilterConfig[] = [
    { name: 'is_active', label: 'Status', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] },
  ];

  const handleAdd = () => { setSelectedItem(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleRowClick = (item: FeeStructure) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');
  const handleClose = () => { setIsSidebarOpen(false); };

  const handleSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await createMutation.mutateAsync(formData);
        toast.success('Fee structure created');
      } else {
        await updateMutation.mutateAsync({ id: selectedItem!.id, data: formData });
        toast.success('Fee structure updated');
      }
      handleClose();
      await invalidateFeeStructures();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || !confirm('Delete this fee structure?')) return;
    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Fee structure deleted');
      handleClose();
      await invalidateFeeStructures();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  return (
    <>
      <DataTable
        title="Fee Structures"
        description="Assign fee structures to classes"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeStructures()}
        onAdd={handleAdd}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search fee structures..."
        addButtonLabel="Add Structure"
      />
      <DetailSidebar isOpen={isSidebarOpen} onClose={handleClose} title={sidebarMode === 'create' ? 'Create Fee Structure' : selectedItem?.name || ''} mode={sidebarMode} width="lg">
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold">₹{parseFloat(selectedItem.amount || '0').toLocaleString()}</p>
              <div className="flex justify-between mt-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Paid:</span>
                  <span className="text-green-600 font-medium ml-1">₹{parseFloat(selectedItem.paid_amount || '0').toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Balance:</span>
                  <span className="text-red-500 font-medium ml-1">₹{parseFloat(selectedItem.balance || '0').toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Student</p>
                <div className="font-medium">{selectedItem.student_details?.student_name || selectedItem.student_name || '-'}</div>
                <div className="text-xs text-muted-foreground">{selectedItem.student_details?.admission_number}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">{selectedItem.due_date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Program</p>
                <p>{selectedItem.fee_master_details?.program_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Semester</p>
                <p>{selectedItem.fee_master_details?.semester || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fee Type</p>
                <p>{selectedItem.fee_master_details?.fee_type_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={selectedItem.is_paid ? 'success' : selectedItem.is_active ? 'warning' : 'destructive'}>
                  {selectedItem.is_paid ? 'Paid' : 'Unpaid'}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeStructureForm feeStructure={sidebarMode === 'edit' ? selectedItem : null} onSubmit={handleSubmit} onCancel={handleClose} />
        )}
      </DetailSidebar>
    </>
  );
};

// ============== FEE INSTALLMENTS TAB ==============
const FeeInstallmentsTab = () => {
  const [filters, setFilters] = useState<Record<string, any>>({ page: 1, page_size: 10 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedItem, setSelectedItem] = useState<FeeInstallment | null>(null);

  const { data, isLoading, error } = useFeeInstallmentsSWR(filters);
  const createMutation = useCreateFeeInstallment();
  const updateMutation = useUpdateFeeInstallment();
  const deleteMutation = useDeleteFeeInstallment();

  const columns: Column<FeeInstallment>[] = [
    {
      key: 'student_name',
      label: 'Student',
      render: (item) => item.student_details?.student_name || item.student_name || '-'
    },
    {
      key: 'installment_number',
      label: 'Installment',
      render: (item) => <span className="font-medium">#{item.installment_number}</span>
    },
    {
      key: 'structure_amount',
      label: 'Structure Total',
      render: (item) => item.fee_structure_details ? `₹${parseFloat(item.fee_structure_details.amount).toLocaleString()}` : '-'
    },
    { key: 'due_date', label: 'Due Date', sortable: true },
    {
      key: 'amount',
      label: 'Amount',
      render: (item) => <span className="font-bold">₹{parseFloat(item.amount as any).toLocaleString()}</span>
    },
    {
      key: 'is_paid',
      label: 'Payment',
      render: (item) => (
        <Badge variant={item.is_paid ? 'success' : 'warning'}>
          {item.is_paid ? 'Paid' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (item) => <Badge variant={item.is_active ? 'success' : 'destructive'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
  ];

  const filterConfig: FilterConfig[] = [
    { name: 'is_active', label: 'Status', type: 'select', options: [{ value: '', label: 'All' }, { value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }] },
  ];

  const handleAdd = () => { setSelectedItem(null); setSidebarMode('create'); setIsSidebarOpen(true); };
  const handleRowClick = (item: FeeInstallment) => { setSelectedItem(item); setSidebarMode('view'); setIsSidebarOpen(true); };
  const handleEdit = () => setSidebarMode('edit');
  const handleClose = () => { setIsSidebarOpen(false); };

  const handleSubmit = async (formData: any) => {
    try {
      if (sidebarMode === 'create') {
        await createMutation.mutateAsync(formData);
        toast.success('Fee installment created');
      } else {
        await updateMutation.mutateAsync({ id: selectedItem!.id, data: formData });
        toast.success('Fee installment updated');
      }
      handleClose();
      await invalidateFeeInstallments();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || !confirm('Delete this fee installment?')) return;
    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Fee installment deleted');
      handleClose();
      await invalidateFeeInstallments();
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  };

  return (
    <>
      <DataTable
        title="Fee Installments"
        description="Configure payment installment plans"
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={() => invalidateFeeInstallments()}
        onAdd={handleAdd}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfig={filterConfig}
        searchPlaceholder="Search installments..."
        addButtonLabel="Add Installment"
      />
      <DetailSidebar isOpen={isSidebarOpen} onClose={handleClose} title={sidebarMode === 'create' ? 'Create Installment' : selectedItem?.name || ''} mode={sidebarMode}>
        {sidebarMode === 'view' && selectedItem ? (
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Installment Amount</p>
              <p className="text-2xl font-bold">₹{parseFloat(selectedItem.amount as any).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Installment #</p>
                <p className="font-semibold">{selectedItem.installment_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Student</p>
                <div className="font-medium">{selectedItem.student_details?.student_name || selectedItem.student_name || '-'}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fee Structure</p>
                {selectedItem.fee_structure_details ? (
                  <div className="text-sm">
                    <p>Total: ₹{parseFloat(selectedItem.fee_structure_details.amount).toLocaleString()}</p>
                    <p className="text-muted-foreground text-xs">Due: {selectedItem.fee_structure_details.due_date}</p>
                  </div>
                ) : '-'}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p>{selectedItem.due_date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge variant={selectedItem.is_paid ? 'success' : 'warning'}>{selectedItem.is_paid ? 'Paid' : 'Pending'}</Badge>
                {selectedItem.is_paid && selectedItem.paid_date && (
                  <p className="text-xs text-muted-foreground mt-1">Paid on {selectedItem.paid_date}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={selectedItem.is_active ? 'success' : 'destructive'}>{selectedItem.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">Edit</Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
            </div>
          </div>
        ) : (
          <FeeInstallmentForm feeInstallment={sidebarMode === 'edit' ? selectedItem : null} onSubmit={handleSubmit} onCancel={handleClose} />
        )}
      </DetailSidebar>
    </>
  );
};

export default FeeSetupPage;
