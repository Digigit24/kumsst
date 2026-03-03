/**
 * Student ID Cards Page
 * Manages student ID cards with CRUD operations
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { isSuperAdmin } from '@/utils/auth.utils';
import { useState } from 'react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { invalidateStudentIDCards, useStudentIDCardsSWR } from '../../hooks/swr';
import { useAuth } from '../../hooks/useAuth';
import { useColleges } from '../../hooks/useCore';
import { useDeleteStudentIDCard } from '../../hooks/useStudents';
import type { StudentIDCardFilters, StudentIDCardListItem } from '../../types/students.types';
import { StudentIDCardForm } from './components/StudentIDCardForm';

export const StudentIDCardsPage = () => {
  const { user } = useAuth();
  const { data: collegesData } = useColleges({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

  const [filters, setFilters] = useState<StudentIDCardFilters>({ page: 1, page_size: 20 });
  const { data, isLoading, error, refresh } = useStudentIDCardsSWR(filters);
  const deleteMutation = useDeleteStudentIDCard();

  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedIDCard, setSelectedIDCard] = useState<StudentIDCardListItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [idCardToDelete, setIdCardToDelete] = useState<StudentIDCardListItem | null>(null);

  const columns: Column<StudentIDCardListItem>[] = [
    {
      key: 'card_number',
      label: 'Card Number',
      sortable: true,
      className: 'font-medium',
    },
    {
      key: 'student_name',
      label: 'Student Name',
      sortable: true,
      className: 'font-semibold',
    },
    {
      key: 'issue_date',
      label: 'Issue Date',
      sortable: true,
      render: (card) => new Date(card.issue_date).toLocaleDateString(),
    },
    {
      key: 'valid_until',
      label: 'Valid Until',
      sortable: true,
      render: (card) => {
        const validDate = new Date(card.valid_until);
        const isExpired = validDate < new Date();
        return (
          <span className={isExpired ? 'text-destructive' : ''}>
            {validDate.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (card) => {
        const validDate = new Date(card.valid_until);
        const isExpired = validDate < new Date();

        if (!card.is_active) {
          return <Badge variant="secondary">Inactive</Badge>;
        }
        if (isExpired) {
          return <Badge variant="destructive">Expired</Badge>;
        }
        return <Badge variant="default">Active</Badge>;
      },
    },
  ];

  const handleRowClick = (idCard: StudentIDCardListItem) => {
    setSelectedIDCard(idCard);
    setSidebarMode('edit');
    setIsSidebarOpen(true);
  };

  const handleAdd = () => {
    setSelectedIDCard(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleDelete = (idCard: StudentIDCardListItem) => {
    setIdCardToDelete(idCard);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (idCardToDelete) {
      await deleteMutation.mutate(idCardToDelete.id);
      invalidateStudentIDCards();
      setDeleteDialogOpen(false);
      setIdCardToDelete(null);
    }
  };

  // Define filter configuration
  const filterConfig: FilterConfig[] = [
    ...(isSuperAdmin(user as any) ? [{
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
        title="Student ID Cards"
        description="Manage student ID cards and their validity. Click on any row to edit."
        data={data}
        columns={columns}
        isLoading={isLoading}
        error={error?.message}
        onRefresh={refresh}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onRowClick={handleRowClick}
        filters={filters}
        onFiltersChange={setFilters as any}
        filterConfig={filterConfig}
        searchPlaceholder="Search ID cards..."
        addButtonLabel="Issue ID Card"
      />

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title={
          sidebarMode === 'create'
            ? 'Issue ID Card'
            : sidebarMode === 'edit'
              ? 'Edit ID Card'
              : 'ID Card Details'
        }
        mode={sidebarMode}
      >
        <StudentIDCardForm
          mode={sidebarMode}
          idCardId={selectedIDCard?.id}
          onSuccess={() => {
            setIsSidebarOpen(false);
            invalidateStudentIDCards();
          }}
          onCancel={() => setIsSidebarOpen(false)}
        />
      </DetailSidebar>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Student ID Card"
        description={`Are you sure you want to delete the ID card "${idCardToDelete?.card_number}" for "${idCardToDelete?.student_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteMutation.isLoading}
      />
    </div>
  );
};