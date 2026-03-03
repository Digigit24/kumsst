/**
 * Classes Page
 */

import { Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { useDeleteClass } from '../../hooks/useAcademic';
import { invalidateClasses, useClassesSWR } from '../../hooks/useAcademicSWR';
import type { ClassFilters, ClassListItem } from '../../types/academic.types';
import { ClassForm } from './components/ClassForm';

export default function ClassesPage() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<ClassFilters>({ page: 1, page_size: 20 });
    const { data, isLoading, error, refresh } = useClassesSWR(filters);

    const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
    const [selectedClass, setSelectedClass] = useState<ClassListItem | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const deleteMutation = useDeleteClass();

    const columns: Column<ClassListItem>[] = useMemo(() => [
        { key: 'name', label: 'Class Name', sortable: true, className: 'font-semibold' },
        { key: 'program_name', label: 'Program', sortable: true },
        { key: 'session_name', label: 'Session', sortable: true },
        { key: 'semester', label: 'Semester', sortable: true, render: (cls) => `Semester ${cls.semester}` },
        { key: 'year', label: 'Year', sortable: true, render: (cls) => `Year ${cls.year}` },
        { key: 'college_name', label: 'College', sortable: true },
        {
            key: 'is_active',
            label: 'Status',
            render: (cls) => <Badge variant={cls.is_active ? 'default' : 'secondary'}>{cls.is_active ? 'Active' : 'Inactive'}</Badge>,
        },
    ], []);

    const handleRowClick = (cls: ClassListItem) => {
        navigate(`/academic/classes/${cls.id}`);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteMutation.mutate(deleteId);
            toast.success('Class deleted successfully');
            setDeleteId(null);
            setIsSidebarOpen(false);
            await invalidateClasses();
        } catch (error: any) {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete class');
        }
    };

    return (
        <div className="p-4 md:p-6 animate-fade-in">
            <DataTable
                title="Classes"
                description="Manage academic classes for programs and sessions. Click on any row to edit."
                data={data}
                columns={columns}
                isLoading={isLoading}
                error={error?.message}
                onRefresh={refresh}
                onAdd={() => { setSelectedClass(null); setSidebarMode('create'); setIsSidebarOpen(true); }}
                onRowClick={handleRowClick}
                filters={filters}
                onFiltersChange={setFilters}
                searchPlaceholder="Search classes..."
                addButtonLabel="Add Class"
                searchDebounceDelay={500}
            />

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                title={sidebarMode === 'create' ? 'Create Class' : sidebarMode === 'edit' ? 'Edit Class' : 'Class Details'}
                mode={sidebarMode}
            >
                {sidebarMode === 'edit' && selectedClass && (
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setDeleteId(selectedClass.id)}
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                )}
                <ClassForm mode={sidebarMode} classId={selectedClass?.id} onSuccess={async () => { setIsSidebarOpen(false); await invalidateClasses(); }} onCancel={() => setIsSidebarOpen(false)} />
            </DetailSidebar>

            <ConfirmDialog
                open={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Class"
                description="Are you sure you want to delete this class? This action cannot be undone."
                variant="destructive"
            />
        </div>
    );
}