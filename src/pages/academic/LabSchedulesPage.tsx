/**
 * Lab Schedules Page
 */

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Column, DataTable } from '../../components/common/DataTable';
import { DetailSidebar } from '../../components/common/DetailSidebar';
import { Badge } from '../../components/ui/badge';
import { useDeleteLabSchedule } from '../../hooks/useAcademic';
import { invalidateLabSchedules, useLabSchedulesSWR } from '../../hooks/useAcademicSWR';
import type { LabSchedule, LabScheduleFilters } from '../../types/academic.types';
import { LabScheduleForm } from './components/LabScheduleForm';

export default function LabSchedulesPage() {
    const [filters, setFilters] = useState<LabScheduleFilters>({ page: 1, page_size: 20 });
    const { data, isLoading, error, refresh } = useLabSchedulesSWR(filters);

    const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
    const [selectedLabSchedule, setSelectedLabSchedule] = useState<LabSchedule | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const deleteMutation = useDeleteLabSchedule();

    const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const columns: Column<LabSchedule>[] = [
        { key: 'subject_name', label: 'Subject', sortable: true, className: 'font-semibold' },
        { key: 'class_name', label: 'Class', sortable: true },
        { key: 'section_name', label: 'Section', sortable: true },
        { key: 'classroom_name', label: 'Laboratory', sortable: true, render: (lab) => lab.classroom_name || '-' },
        { key: 'day_of_week', label: 'Day', render: (lab) => <Badge variant="outline">{dayLabels[lab.day_of_week]}</Badge> },
        { key: 'start_time', label: 'Time', render: (lab) => `${lab.start_time} - ${lab.end_time}` },
        {
            key: 'is_active',
            label: 'Status',
            render: (lab) => <Badge variant={lab.is_active ? 'default' : 'secondary'}>{lab.is_active ? 'Active' : 'Inactive'}</Badge>,
        },
    ];

    const handleRowClick = (labSchedule: LabSchedule) => {
        setSelectedLabSchedule(labSchedule);
        setSidebarMode('edit');
        setIsSidebarOpen(true);
    };

    const handleAdd = () => {
        setSelectedLabSchedule(null);
        setSidebarMode('create');
        setIsSidebarOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteMutation.mutate(deleteId);
            toast.success('Lab schedule deleted successfully');
            setDeleteId(null);
            setIsSidebarOpen(false);
            await invalidateLabSchedules();
        } catch (error: any) {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete lab schedule');
        }
    };

    return (
        <div className="p-4 md:p-6 animate-fade-in">
            <DataTable
                title="Lab Schedules"
                description="Manage laboratory session schedules. Click on any row to edit."
                data={data}
                columns={columns}
                isLoading={isLoading}
                error={error?.message}
                onRefresh={refresh}
                onAdd={handleAdd}
                onRowClick={handleRowClick}
                filters={filters}
                onFiltersChange={setFilters}
                searchPlaceholder="Search lab schedules..."
                addButtonLabel="Add Lab Schedule"
                searchDebounceDelay={500}
            />

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                title={sidebarMode === 'create' ? 'Create Lab Schedule' : 'Edit Lab Schedule'}
                mode={sidebarMode}
            >
                {sidebarMode === 'edit' && selectedLabSchedule && (
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setDeleteId(selectedLabSchedule.id)}
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                )}
                <LabScheduleForm mode={sidebarMode} labScheduleId={selectedLabSchedule?.id} onSuccess={async () => { setIsSidebarOpen(false); await invalidateLabSchedules(); }} onCancel={() => setIsSidebarOpen(false)} />
            </DetailSidebar>

            <ConfirmDialog
                open={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Lab Schedule"
                description="Are you sure you want to delete this lab schedule? This action cannot be undone."
                variant="destructive"
            />
        </div>
    );
}