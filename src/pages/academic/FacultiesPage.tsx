/**
 * Faculties Page
 * Manages college faculties with CRUD operations
 */

import { Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { useDeleteFaculty } from '../../hooks/useAcademic';
import { invalidateFaculties, useFacultiesSWR } from '../../hooks/useAcademicSWR';
import type { FacultyFilters, FacultyListItem } from '../../types/academic.types';
import { FacultyForm } from './components/FacultyForm';

export default function FacultiesPage() {
    const [filters, setFilters] = useState<FacultyFilters>({ page: 1, page_size: 20 });
    const { data, isLoading, error, refresh } = useFacultiesSWR(filters);

    const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
    const [selectedFaculty, setSelectedFaculty] = useState<FacultyListItem | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const deleteMutation = useDeleteFaculty();

    const columns: Column<FacultyListItem>[] = useMemo(() => [
        {
            key: 'code',
            label: 'Code',
            sortable: true,
            className: 'font-medium',
        },
        {
            key: 'name',
            label: 'Faculty Name',
            sortable: true,
            className: 'font-semibold',
        },
        {
            key: 'short_name',
            label: 'Short Name',
            sortable: true,
        },
        {
            key: 'college_name',
            label: 'College',
            sortable: true,
        },
        {
            key: 'hod_name',
            label: 'Head of Department',
            render: (faculty) => faculty.hod_name || <span className="text-muted-foreground">Not Assigned</span>,
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (faculty) => (
                <Badge variant={faculty.is_active ? 'default' : 'secondary'}>
                    {faculty.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
    ], []);

    const handleRowClick = (faculty: FacultyListItem) => {
        setSelectedFaculty(faculty);
        setSidebarMode('edit'); // Open in edit mode when clicking row
        setIsSidebarOpen(true);
    };

    const handleAdd = () => {
        setSelectedFaculty(null);
        setSidebarMode('create');
        setIsSidebarOpen(true);
    };

    const handleSuccess = async () => {
        setIsSidebarOpen(false);
        await invalidateFaculties();
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteMutation.mutate(deleteId);
            toast.success('Faculty deleted successfully');
            setDeleteId(null);
            setIsSidebarOpen(false);
            await invalidateFaculties();
        } catch (error: any) {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete faculty');
        }
    };

    return (
        <div className="p-4 md:p-6 animate-fade-in">
            <DataTable
                title="Faculties"
                description="Manage college faculties and departments. Click on any row to edit."
                data={data}
                columns={columns}
                isLoading={isLoading}
                error={error?.message}
                onRefresh={refresh}
                onAdd={handleAdd}
                onRowClick={handleRowClick}
                filters={filters}
                onFiltersChange={setFilters}
                searchPlaceholder="Search faculties..."
                addButtonLabel="Add Faculty"
            />

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                title={
                    sidebarMode === 'create'
                        ? 'Create Faculty'
                        : sidebarMode === 'edit'
                            ? 'Edit Faculty'
                            : 'Faculty Details'
                }
                mode={sidebarMode}
            >
                {sidebarMode === 'edit' && selectedFaculty && (
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setDeleteId(selectedFaculty.id)}
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                )}
                <FacultyForm
                    mode={sidebarMode}
                    facultyId={selectedFaculty?.id}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsSidebarOpen(false)}
                />
            </DetailSidebar>

            <ConfirmDialog
                open={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Faculty"
                description="Are you sure you want to delete this faculty? This action cannot be undone."
                variant="destructive"
            />
        </div>
    );
}