/**
 * Previous Academic Records Page
 * Manages student previous academic records with CRUD operations
 */

import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useState } from 'react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../hooks/useAuth';
import { useColleges } from '../../hooks/useCore';
import { useDeletePreviousAcademicRecord, usePreviousAcademicRecords } from '../../hooks/useStudents';
import type { PreviousAcademicRecordFilters, PreviousAcademicRecordListItem } from '../../types/students.types';
import { isSuperAdmin } from '../../utils/auth.utils';

export const PreviousAcademicRecordsPage = () => {
  const { user } = useAuth();
  const { data: collegesData } = useColleges({ page_size: DROPDOWN_PAGE_SIZE, is_active: true });

  const [filters, setFilters] = useState<PreviousAcademicRecordFilters>({ page: 1, page_size: 20 });
  const { data, isLoading, error, refetch } = usePreviousAcademicRecords(filters);
  const deleteMutation = useDeletePreviousAcademicRecord();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<PreviousAcademicRecordListItem | null>(null);

  const columns: Column<PreviousAcademicRecordListItem>[] = [
    {
      key: 'student_name',
      label: 'Student Name',
      sortable: true,
      className: 'font-semibold',
    },
    {
      key: 'level',
      label: 'Level',
      sortable: true,
      render: (record) => (
        <Badge variant="outline" className="capitalize">
          {record.level}
        </Badge>
      ),
    },
    {
      key: 'institution_name',
      label: 'Institution',
      sortable: true,
    },
    {
      key: 'year_of_passing',
      label: 'Year of Passing',
      sortable: true,
    },
    {
      key: 'percentage',
      label: 'Percentage',
      render: (record) => record.percentage || '-',
    },
    {
      key: 'grade',
      label: 'Grade',
      render: (record) => record.grade || '-',
    },
  ];

  const handleDelete = (record: PreviousAcademicRecordListItem) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (recordToDelete) {
      await deleteMutation.mutate(recordToDelete.id);
      refetch();
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
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
        title="Previous Academic Records"
        description="Manage student previous academic records (10th, 12th, UG, PG). Click on any row to view details."
        data={data}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRefresh={refetch}
        onDelete={handleDelete}
        filters={filters}
        onFiltersChange={setFilters as any}
        filterConfig={filterConfig}
        searchPlaceholder="Search academic records..."
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Previous Academic Record"
        description={`Are you sure you want to delete the ${recordToDelete?.level} record for "${recordToDelete?.student_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        loading={deleteMutation.isLoading}
      />
    </div>
  );
};
