/**
 * Class Teachers Page
 */

import { Trash2, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable, FilterConfig } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useDeleteClassTeacher } from '../../hooks/useAcademic';
import { invalidateClassTeachers, useClassTeachersSWR, useClassesSWR, useSectionsFilteredByClass } from '../../hooks/useAcademicSWR';
import type { ClassTeacher, ClassTeacherFilters } from '../../types/academic.types';
import { ClassTeacherForm } from './components/ClassTeacherForm';
import { ClassTeacherCreationPipeline } from './forms/ClassTeacherCreationPipeline';

export default function ClassTeachersPage() {
    const [filters, setFilters] = useState<ClassTeacherFilters>({ page: 1, page_size: 20 });
    const { data, isLoading, error, refresh } = useClassTeachersSWR(filters);
    const { results: classes } = useClassesSWR({ is_active: true });
    // Prefetch all sections once, filter client-side by class — instant switching
    const { results: sections } = useSectionsFilteredByClass(
        filters.class_obj ? Number(filters.class_obj) : undefined
    );

    const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
    const [selectedClassTeacher, setSelectedClassTeacher] = useState<ClassTeacher | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [usePipeline, setUsePipeline] = useState(false); // Toggle between form and pipeline

    const deleteMutation = useDeleteClassTeacher();

    const columns: Column<ClassTeacher>[] = [
        { key: 'class_name', label: 'Class', sortable: true, className: 'font-semibold' },
        { key: 'section_name', label: 'Section', sortable: true },
        {
            key: 'teacher',
            label: 'Teacher',
            sortable: true,
            render: (ct) => ct.teacher_details?.full_name || ct.teacher_details?.username || '-'
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (ct) => <Badge variant={ct.is_active ? 'default' : 'secondary'}>{ct.is_active ? 'Active' : 'Inactive'}</Badge>,
        },
    ];

    const filterConfig: FilterConfig[] = [
        {
            name: 'class_obj', // Matches ClassTeacherFilters key
            label: 'Class',
            type: 'select',
            options: classes?.map((c) => ({ value: String(c.id), label: c.name })) || [],
        },
        {
            name: 'section', // Matches ClassTeacherFilters key
            label: 'Section',
            type: 'select',
            options: sections?.map((s) => ({ value: String(s.id), label: s.name })) || [],
        },
        {
            name: 'is_active',
            label: 'Active Status',
            type: 'select',
            options: [
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
            ],
        },
    ];

    const handleRowClick = (classTeacher: ClassTeacher) => {
        setSelectedClassTeacher(classTeacher);
        setSidebarMode('edit');
        setIsSidebarOpen(true);
    };

    const handleAdd = () => {
        setSelectedClassTeacher(null);
        setSidebarMode('create');
        setUsePipeline(false); // Default to standard form
        setIsSidebarOpen(true);
    };

    const handleAddWithPipeline = () => {
        setSelectedClassTeacher(null);
        setSidebarMode('create');
        setUsePipeline(true); // Use pipeline wizard
        setIsSidebarOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteMutation.mutate(deleteId);
            toast.success('Class teacher assignment deleted successfully');
            setDeleteId(null);
            setIsSidebarOpen(false);
            await invalidateClassTeachers();
        } catch (error: any) {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete class teacher assignment');
        }
    };

    return (
        <div className="p-4 md:p-6 animate-fade-in">
            <DataTable
                title="Class Teachers"
                description="Assign class teachers to classes and sections. Click on any row to edit."
                data={data}
                columns={columns}
                isLoading={isLoading}
                error={error?.message}
                onRefresh={refresh}
                onAdd={handleAdd}
                onRowClick={handleRowClick}
                filters={filters}
                onFiltersChange={setFilters}
                filterConfig={filterConfig}
                searchPlaceholder="Search class teachers..."
                addButtonLabel="Assign Class Teacher"
                searchDebounceDelay={500}
                customActions={
                    <Button
                        onClick={handleAddWithPipeline}
                        variant="outline"
                        className="gap-2"
                    >
                        <Wand2 className="h-4 w-4" />
                        Quick Assign Wizard
                    </Button>
                }
            />

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                title={
                    sidebarMode === 'create'
                        ? usePipeline
                            ? 'Quick Assign Wizard'
                            : 'Assign Class Teacher'
                        : 'Edit Class Teacher Assignment'
                }
                mode={sidebarMode}
                width={usePipeline ? '5xl' : 'lg'} // Larger sidebar for pipeline
            >
                {sidebarMode === 'edit' && selectedClassTeacher && (
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setDeleteId(selectedClassTeacher.id)}
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                )}
                {sidebarMode === 'create' && usePipeline ? (
                    <ClassTeacherCreationPipeline
                        onSubmit={async () => {
                            setIsSidebarOpen(false);
                            await invalidateClassTeachers();
                        }}
                        onCancel={() => setIsSidebarOpen(false)}
                    />
                ) : (
                    <ClassTeacherForm
                        mode={sidebarMode}
                        classTeacherId={selectedClassTeacher?.id}
                        onSuccess={async () => {
                            setIsSidebarOpen(false);
                            await invalidateClassTeachers();
                        }}
                        onCancel={() => setIsSidebarOpen(false)}
                    />
                )}
            </DetailSidebar>

            <ConfirmDialog
                open={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Class Teacher Assignment"
                description="Are you sure you want to delete this class teacher assignment? This action cannot be undone."
                variant="destructive"
            />
        </div>
    );
}