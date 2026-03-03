/**
 * Guardians Page
 * Displays all guardians with CRUD operations
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { useSuperAdminContext } from '../../contexts/SuperAdminContext';
import { invalidateStudentGuardians, useStudentGuardiansSWR } from '../../hooks/swr';
import { useAuth } from '../../hooks/useAuth';
import { useColleges } from '../../hooks/useCore';
import { useDeleteStudentGuardian } from '../../hooks/useStudents';
import type { StudentGuardianListItem } from '../../types/students.types';
import { getCurrentUserCollege, isSuperAdmin } from '../../utils/auth.utils';
import { GuardianForm } from './components/GuardianForm';

export const GuardiansPage = () => {
  const { user } = useAuth();
  const { selectedCollege } = useSuperAdminContext();
  const isSuper = isSuperAdmin(user as any);
  const defaultCollegeId = getCurrentUserCollege(user as any);
  const { data: collegesData } = useColleges({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(
    isSuper ? (selectedCollege || null) : defaultCollegeId
  );

  // Sync global college selection
  useEffect(() => {
    if (isSuper && selectedCollege !== undefined) {
      setSelectedCollegeId(selectedCollege);
      setFilters(prev => ({ ...prev, college: selectedCollege || undefined }));
    }
  }, [selectedCollege, isSuper]);
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
    ...(isSuper ? {} : defaultCollegeId ? { college: defaultCollegeId } : {}),
  });

  // Cast filters to any because useStudentGuardiansSWR might not strictly define all filter keys like 'search'/'college'
  // in frontend types even if backend supports them (or we accept the loss of feature if not supported)
  const { data, isLoading, error, refresh } = useStudentGuardiansSWR(filters as any);
  const deleteMutation = useDeleteStudentGuardian();

  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('create');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StudentGuardianListItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Define table columns
  const columns: Column<StudentGuardianListItem>[] = [
    {
      key: 'student_name',
      label: 'Student Name',
      sortable: true,
      className: 'font-semibold',
    },
    {
      key: 'guardian_details' as any, // virtual key for render
      label: 'Guardian Name',
      // sortable: true, // dependent on backend support
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.guardian_details?.full_name || 'Unknown'}</span>
          <span className="text-xs text-muted-foreground capitalize">{item.guardian_details?.relation || '-'}</span>
        </div>
      ),
    },
    {
      key: 'guardian_details.phone' as any,
      label: 'Phone',
      render: (item) => item.guardian_details?.phone || '-',
    },
    {
      key: 'is_primary',
      label: 'Primary',
      render: (item) => (item.is_primary ? 'Yes' : 'No'),
    },
  ];

  const handleAdd = () => {
    setSelectedItem(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleRowClick = (item: StudentGuardianListItem) => {
    setSelectedItem(item);
    setSidebarMode('edit');
    setIsSidebarOpen(true);
  };

  const handleDelete = (item: StudentGuardianListItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedItem) {
      await deleteMutation.mutate(selectedItem.id);
      invalidateStudentGuardians();
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedItem(null);
  };

  const handleFormSuccess = () => {
    setIsSidebarOpen(false);
    setSelectedItem(null);
    invalidateStudentGuardians();
  };

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(prev => {
      const next = { ...prev, ...newFilters };
      if (isSuper && Object.prototype.hasOwnProperty.call(newFilters, 'college')) {
        const value = newFilters.college;
        const parsed = value ? Number(value) : null;
        setSelectedCollegeId(parsed && !Number.isNaN(parsed) ? parsed : null);
        if (parsed && !Number.isNaN(parsed)) {
          return { ...next, college: parsed };
        }
        const { college, ...rest } = next as any;
        return rest;
      }
      return next;
    });
  };

  // Define filter configuration
  const filterConfig: FilterConfig[] = [
    ...(isSuper ? [{
      name: 'college',
      label: 'College',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Colleges' },
        ...(collegesData?.results.map(c => ({ value: c.id.toString(), label: c.name })) || [])
      ],
    }] : []),
  ];

  return (
    <div className="p-4 md:p-6 animate-fade-in">

      <DataTable
        title="Student Guardians"
        description="Manage guardians and their relationships to students. Click on any row to edit."
        data={data}
        columns={columns}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={refresh}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        filterConfig={filterConfig}
        searchPlaceholder="Search relationships..."
        addButtonLabel="Add Guardian Link"
        searchDebounceDelay={500}
      />

      {/* Create/Edit Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title={sidebarMode === 'create' ? 'Link New Guardian' : 'Edit Guardian'}
        mode={sidebarMode}
        width="lg"
      >
        <GuardianForm
          mode={sidebarMode === 'view' ? 'edit' : sidebarMode}
          // Assuming guardian_details is the full Guardian object. 
          // If it is missing partial matching fields, they will just be empty.
          guardian={selectedItem?.guardian_details}
          // Pass the student context
          initialStudent={selectedItem ? { id: selectedItem.student, name: selectedItem.student_name } : undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseSidebar}
          collegeId={selectedCollegeId}
        />
      </DetailSidebar>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Guardian Link"
        description="Are you sure you want to remove this guardian from the student? The guardian record itself will not be deleted."
        confirmLabel="Remove Link"
        onConfirm={confirmDelete}
        loading={deleteMutation.isLoading}
      />
    </div>
  );
};
